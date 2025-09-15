import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, Descriptions, Tag, Button, Space, Tabs, Table, Modal, Form, Input, Select, Alert, Skeleton, Row, Col, Statistic, DatePicker, Divider } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ToolOutlined, CheckCircleOutlined, CloseCircleOutlined, HistoryOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import useParams from '@/hooks/useParams';
import MaintenanceTimeline from '@/components/equipment/MaintenanceTimeline';
import SpecificationsDisplay from '@/components/equipment/SpecificationsDisplay';
import CostDisplay from '@/components/common/CostDisplay';
import DateDisplay from '@/components/common/DateDisplay';
import StatusTag from '@/components/equipment/StatusTag';
import EquipmentAgeDisplay from '@/components/equipment/EquipmentAgeDisplay';
import MaintenanceScheduleButton from '@/components/equipment/MaintenanceScheduleButton';
import StatusUpdateButton from '@/components/equipment/StatusUpdateButton';
import EquipmentEditButton from '@/components/equipment/EquipmentEditButton';

const { TabPane } = Tabs;

interface Equipment {
  id: number;
  facility_id: number;
  department_id: number;
  name: string;
  code: string;
  serial_number: string;
  manufacturer: string;
  model: string;
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
  next_maintenance_due: string;
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  specifications: any;
  cost: number;
  facility?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  maintenanceHistory?: MaintenanceRecord[];
}

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  maintenance_date: string;
  maintenance_type: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  performed_by: string | null;
  notes: string | null;
  completion_date: string | null;
  cost: number | null;
  parts_used: any[] | null;
  downtime_hours: number | null;
}

const EquipmentShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  // State is now managed in the individual component buttons

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/equipment/${id}`);
      setEquipment(response.data.equipment);
    } catch (error) {
      console.error('Error fetching equipment details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  // Handler functions have been moved to their respective component buttons

  // Using the StatusTag component instead of these functions
  const getStatusTag = (status: string) => {
    return <StatusTag status={status} type="equipment" />;
  };

  const getMaintenanceStatusTag = (status: string) => {
    return <StatusTag status={status} type="maintenance" />;
  };

  const maintenanceColumns = [
    {
      title: 'Date',
      dataIndex: 'maintenance_date',
      key: 'maintenance_date',
      render: (date: string) => <DateDisplay date={date} />,
    },
    {
      title: 'Type',
      dataIndex: 'maintenance_type',
      key: 'maintenance_type',
      render: (type: string) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <StatusTag status={status} type="maintenance" />,
    },
    {
      title: 'Performed By',
      dataIndex: 'performed_by',
      key: 'performed_by',
      render: (text: string) => text || 'N/A',
    },
    {
      title: 'Completion Date',
      dataIndex: 'completion_date',
      key: 'completion_date',
      render: (date: string) => <DateDisplay date={date} />,
    },
    {
      title: 'Cost',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => <CostDisplay value={cost} />
    },
    {
      title: 'Downtime',
      dataIndex: 'downtime_hours',
      key: 'downtime_hours',
      render: (hours: number) => hours ? `${hours} hours` : 'N/A',
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Equipment Details">
        <Head title="Equipment Details" />
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!equipment) {
    return (
      <AppLayout>
        <Head title="Equipment Details" />
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <Alert
                message="Error"
                description="Equipment not found"
                type="error"
                showIcon
              />
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title={`Equipment: ${equipment.name}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/equipment">
              <Button 
                icon={<ArrowLeftOutlined />} 
                type="link" 
              >
                Back to Equipment
              </Button>
            </Link>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight ml-4">
              {equipment.name}
            </h2>
            {getStatusTag(equipment.status)}
          </div>
          <Space>
            <EquipmentEditButton 
              equipment={equipment} 
              onSuccess={fetchEquipment} 
            />
            <MaintenanceScheduleButton 
              equipmentId={equipment.id} 
              onSuccess={fetchEquipment} 
            />
            <StatusUpdateButton 
              equipmentId={equipment.id} 
              currentStatus={equipment.status} 
              buttonType={equipment.status === 'available' ? 'primary' : 'default'}
              onSuccess={fetchEquipment} 
            />
          </Space>
        </div>
      )}
    >
      <Head title={`Equipment: ${equipment.name}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Status Alert */}
          {equipment.status === 'maintenance' && (
            <Alert 
              message="This equipment is currently under maintenance" 
              type="warning" 
              showIcon 
              className="mb-6"
            />
          )}
          
          {equipment.status === 'out_of_order' && (
            <Alert 
              message="This equipment is currently out of order" 
              type="error" 
              showIcon 
              className="mb-6"
            />
          )}
          
          {equipment.next_maintenance_due && dayjs(equipment.next_maintenance_due).isBefore(dayjs()) && (
            <Alert 
              message="Maintenance is overdue" 
              type="error" 
              showIcon 
              className="mb-6"
              action={
                <MaintenanceScheduleButton 
                    equipmentId={equipment.id} 
                    onSuccess={fetchEquipment}
                    buttonSize="small"
                    buttonText="Schedule Now"
                  />
              }
            />
          )}
          
          {equipment.next_maintenance_due && 
           !dayjs(equipment.next_maintenance_due).isBefore(dayjs()) && 
           dayjs(equipment.next_maintenance_due).isBefore(dayjs().add(30, 'day')) && (
            <Alert 
              message={`Maintenance due soon (${dayjs(equipment.next_maintenance_due).format('MMM D, YYYY')})`} 
              type="warning" 
              showIcon 
              className="mb-6"
            />
          )}

          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Facility" 
                  value={equipment.facility?.name || 'N/A'} 
                  valueRender={(value) => (
                    equipment.facility ? 
                      <Link href={`/facilities/${equipment.facility.id}`}>{value}</Link> : 
                      value
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Department" 
                  value={equipment.department?.name || 'N/A'} 
                  valueRender={(value) => (
                    equipment.department ? 
                      <Link href={`/departments/${equipment.department.id}`}>{value}</Link> : 
                      value
                  )}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Status" 
                  value={equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1).replace('_', ' ')} 
                  valueStyle={{ 
                    color: equipment.status === 'available' ? '#52c41a' : 
                            equipment.status === 'in_use' ? '#1890ff' : 
                            equipment.status === 'maintenance' ? '#faad14' : '#ff4d4f' 
                  }}
                />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="details" className="mb-6">
            <TabPane tab="Details" key="details">
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Equipment Name">{equipment.name}</Descriptions.Item>
                  <Descriptions.Item label="Equipment Code">{equipment.code}</Descriptions.Item>
                  <Descriptions.Item label="Serial Number">{equipment.serial_number || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Manufacturer">{equipment.manufacturer || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Model">{equipment.model || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Status">{getStatusTag(equipment.status)}</Descriptions.Item>
                  <Descriptions.Item label="Purchase Date">
                    <DateDisplay date={equipment.purchase_date} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Warranty Expiry">
                    {equipment.warranty_expiry ? (
                      <span>
                        <DateDisplay date={equipment.warranty_expiry} />
                        {dayjs(equipment.warranty_expiry).isBefore(dayjs()) && (
                          <Tag color="error" className="ml-2">Expired</Tag>
                        )}
                      </span>
                    ) : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Maintenance">
                    <DateDisplay date={equipment.last_maintenance} defaultText="Never" />
                  </Descriptions.Item>
                  <Descriptions.Item label="Next Maintenance Due">
                    {equipment.next_maintenance_due ? (
                      <span>
                        <DateDisplay date={equipment.next_maintenance_due} />
                        {dayjs(equipment.next_maintenance_due).isBefore(dayjs()) && (
                          <Tag color="error" style={{ marginLeft: '8px' }}>Overdue</Tag>
                        )}
                        {!dayjs(equipment.next_maintenance_due).isBefore(dayjs()) && 
                         dayjs(equipment.next_maintenance_due).isBefore(dayjs().add(30, 'day')) && (
                          <Tag color="warning" style={{ marginLeft: '8px' }}>Due Soon</Tag>
                        )}
                      </span>
                    ) : <DateDisplay date={null} defaultText="Not scheduled" />}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cost">
                    {equipment.cost ? `$${equipment.cost.toFixed(2)}` : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age">
                    <EquipmentAgeDisplay 
                      purchaseDate={equipment.purchase_date} 
                      warrantyExpiry={equipment.warranty_expiry} 
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Specifications" span={2}>
                    <SpecificationsDisplay specifications={equipment.specifications} />
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
            
            <TabPane tab="Maintenance History" key="maintenance">
              <Card>
                <Row gutter={[0, 24]}>
                  <Col span={24}>
                    <MaintenanceTimeline maintenanceHistory={equipment.maintenanceHistory || []} />
                  </Col>
                  <Col span={24}>
                    <Divider>Detailed Records</Divider>
                    <Table 
                      columns={maintenanceColumns} 
                      dataSource={equipment.maintenanceHistory || []} 
                      rowKey="id"
                      pagination={{ pageSize: 10 }}
                    />
                  </Col>
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Modals have been replaced with component buttons */}
    </AppLayout>
  );
};

export default EquipmentShow;