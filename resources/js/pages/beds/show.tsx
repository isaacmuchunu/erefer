import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, Descriptions, Tag, Button, Space, Timeline, Tabs, Table, Modal, Form, DatePicker, Input, Select, Alert, Skeleton, Row, Col, Statistic } from 'antd';
import { ArrowLeftOutlined, EditOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, ToolOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

interface Bed {
  id: number;
  facility_id: number;
  department_id: number;
  bed_type_id: number;
  bed_number: string;
  room_number: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  equipment: string[];
  notes: string;
  last_occupied_at: string | null;
  available_from: string | null;
  facility?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
  bedType?: {
    id: number;
    name: string;
    code: string;
    daily_rate: number;
    description: string;
    equipment_included: string[];
  };
  currentReservation?: BedReservation;
  reservationHistory?: BedReservation[];
}

interface BedReservation {
  id: number;
  bed_id: number;
  patient_id: number;
  reserved_by: number;
  reserved_at: string;
  reserved_until: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  reason: string;
  patient?: {
    id: number;
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
  reservedBy?: {
    id: number;
    name: string;
  };
}

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  medical_record_number: string;
}

const BedShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [bed, setBed] = useState<Bed | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserveModalVisible, setReserveModalVisible] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form] = Form.useForm();
  const [reservationLoading, setReservationLoading] = useState(false);
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [maintenanceForm] = Form.useForm();

  const fetchBed = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/beds/${id}`);
      setBed(response.data.bed);
    } catch (error) {
      console.error('Error fetching bed details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await axios.get('/api/patients');
      setPatients(response.data.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  useEffect(() => {
    fetchBed();
    fetchPatients();
  }, [id]);

  const handleReserveBed = async () => {
    try {
      setReservationLoading(true);
      const values = await form.validateFields();
      
      await axios.post(`/api/beds/${id}/reserve`, {
        patient_id: values.patient_id,
        reserved_until: values.reserved_until.format('YYYY-MM-DD'),
        reason: values.reason
      });
      
      setReserveModalVisible(false);
      form.resetFields();
      fetchBed();
    } catch (error) {
      console.error('Error reserving bed:', error);
    } finally {
      setReservationLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId: number) => {
    try {
      await axios.post(`/api/bed-reservations/${reservationId}/cancel`);
      fetchBed();
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    }
  };

  const handleMaintenanceSubmit = async () => {
    try {
      const values = await maintenanceForm.validateFields();
      
      if (values.status === 'maintenance') {
        // Set bed to maintenance
        await axios.put(`/api/beds/${id}`, {
          status: 'maintenance',
          notes: values.notes
        });
      } else {
        // Mark bed as available
        await axios.put(`/api/beds/${id}`, {
          status: 'available',
          available_from: values.available_from ? values.available_from.format('YYYY-MM-DD') : null,
          notes: values.notes
        });
      }
      
      setMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchBed();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      available: { color: 'success', text: 'Available' },
      occupied: { color: 'error', text: 'Occupied' },
      maintenance: { color: 'warning', text: 'Maintenance' },
      reserved: { color: 'processing', text: 'Reserved' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getReservationStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'processing', text: 'Active' },
      completed: { color: 'success', text: 'Completed' },
      cancelled: { color: 'default', text: 'Cancelled' },
      expired: { color: 'error', text: 'Expired' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const reservationColumns = [
    {
      title: 'Patient',
      dataIndex: ['patient', 'first_name'],
      key: 'patient',
      render: (_: string, record: BedReservation) => (
        record.patient ? (
          <Link to={`/patients/${record.patient.id}`}>
            {record.patient.first_name} {record.patient.last_name}
          </Link>
        ) : 'N/A'
      ),
    },
    {
      title: 'MRN',
      dataIndex: ['patient', 'medical_record_number'],
      key: 'mrn',
    },
    {
      title: 'Reserved By',
      dataIndex: ['reservedBy', 'name'],
      key: 'reservedBy',
    },
    {
      title: 'Reserved At',
      dataIndex: 'reserved_at',
      key: 'reserved_at',
      render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
    },
    {
      title: 'Until',
      dataIndex: 'reserved_until',
      key: 'reserved_until',
      render: (date: string) => dayjs(date).format('MMM D, YYYY'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getReservationStatusTag(status),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: string, record: BedReservation) => (
        record.status === 'active' ? (
          <Button 
            size="small" 
            danger 
            onClick={() => handleCancelReservation(record.id)}
          >
            Cancel
          </Button>
        ) : null
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Bed Details">
        <Head title="Bed Details" />
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

  if (!bed) {
    return (
      <AppLayout title="Bed Details">
        <Head title="Bed Details" />
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <Alert
                message="Error"
                description="Bed not found"
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
      title={`Bed ${bed.room_number ? `${bed.room_number}-${bed.bed_number}` : bed.bed_number}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="link" 
              href="/beds"
            >
              Back to Beds
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight ml-4">
              Bed {bed.room_number ? `${bed.room_number}-${bed.bed_number}` : bed.bed_number}
            </h2>
            {getStatusTag(bed.status)}
          </div>
          <Space>
            <Button 
              icon={<ToolOutlined />} 
              onClick={() => {
                maintenanceForm.setFieldsValue({
                  status: bed.status === 'maintenance' ? 'available' : 'maintenance',
                  notes: bed.notes,
                });
                setMaintenanceModalVisible(true);
              }}
            >
              {bed.status === 'maintenance' ? 'Mark as Available' : 'Set to Maintenance'}
            </Button>
            <Button 
              type="primary" 
              disabled={bed.status !== 'available'}
              onClick={() => setReserveModalVisible(true)}
            >
              Reserve Bed
            </Button>
          </Space>
        </div>
      )}
    >
      <Head title={`Bed ${bed.room_number ? `${bed.room_number}-${bed.bed_number}` : bed.bed_number}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Status Alert */}
          {bed.status === 'available' && (
            <Alert 
              message="This bed is available" 
              type="success" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => setReserveModalVisible(true)}
                >
                  Reserve Now
                </Button>
              }
            />
          )}
          
          {bed.status === 'occupied' && (
            <Alert 
              message="This bed is currently occupied" 
              type="error" 
              showIcon 
              className="mb-6"
            />
          )}
          
          {bed.status === 'maintenance' && (
            <Alert 
              message="This bed is under maintenance" 
              type="warning" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  onClick={() => {
                    maintenanceForm.setFieldsValue({
                      status: 'available',
                      notes: bed.notes,
                    });
                    setMaintenanceModalVisible(true);
                  }}
                >
                  Mark as Available
                </Button>
              }
            />
          )}
          
          {bed.status === 'reserved' && bed.currentReservation && (
            <Alert 
              message={`This bed is reserved for ${bed.currentReservation.patient?.first_name} ${bed.currentReservation.patient?.last_name} until ${dayjs(bed.currentReservation.reserved_until).format('MMM D, YYYY')}`} 
              type="info" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  danger
                  onClick={() => handleCancelReservation(bed.currentReservation!.id)}
                >
                  Cancel Reservation
                </Button>
              }
            />
          )}

          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Facility" 
                  value={bed.facility?.name || 'N/A'} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Department" 
                  value={bed.department?.name || 'N/A'} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Bed Type" 
                  value={bed.bedType?.name || 'N/A'} 
                  suffix={bed.bedType?.daily_rate ? `$${bed.bedType.daily_rate}/day` : ''}
                />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="details" className="mb-6">
            <TabPane tab="Details" key="details">
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Bed Number">{bed.bed_number}</Descriptions.Item>
                  <Descriptions.Item label="Room Number">{bed.room_number || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Status">{getStatusTag(bed.status)}</Descriptions.Item>
                  <Descriptions.Item label="Last Occupied">
                    {bed.last_occupied_at ? dayjs(bed.last_occupied_at).format('MMM D, YYYY HH:mm') : 'Never'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Available From" span={2}>
                    {bed.available_from ? dayjs(bed.available_from).format('MMM D, YYYY') : 'Now'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Equipment" span={2}>
                    {bed.equipment && bed.equipment.length > 0 ? (
                      <Space wrap>
                        {bed.equipment.map((item, index) => (
                          <Tag key={index}>{item}</Tag>
                        ))}
                      </Space>
                    ) : 'None'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Bed Type Equipment" span={2}>
                    {bed.bedType?.equipment_included && bed.bedType.equipment_included.length > 0 ? (
                      <Space wrap>
                        {bed.bedType.equipment_included.map((item, index) => (
                          <Tag key={index} color="blue">{item}</Tag>
                        ))}
                      </Space>
                    ) : 'None'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Notes" span={2}>
                    {bed.notes || 'No notes'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
            
            <TabPane tab="Current Reservation" key="current" disabled={!bed.currentReservation}>
              {bed.currentReservation && (
                <Card>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Patient">
                      <Link to={`/patients/${bed.currentReservation.patient?.id}`}>
                        {bed.currentReservation.patient?.first_name} {bed.currentReservation.patient?.last_name}
                      </Link>
                    </Descriptions.Item>
                    <Descriptions.Item label="MRN">
                      {bed.currentReservation.patient?.medical_record_number}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reserved By">
                      {bed.currentReservation.reservedBy?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reserved At">
                      {dayjs(bed.currentReservation.reserved_at).format('MMM D, YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reserved Until">
                      {dayjs(bed.currentReservation.reserved_until).format('MMM D, YYYY')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                      {getReservationStatusTag(bed.currentReservation.status)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Reason" span={2}>
                      {bed.currentReservation.reason || 'No reason provided'}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      danger 
                      onClick={() => handleCancelReservation(bed.currentReservation!.id)}
                      disabled={bed.currentReservation.status !== 'active'}
                    >
                      Cancel Reservation
                    </Button>
                  </div>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="Reservation History" key="history">
              <Card>
                <Table 
                  columns={reservationColumns} 
                  dataSource={bed.reservationHistory || []} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Reserve Bed Modal */}
      <Modal
        title="Reserve Bed"
        visible={reserveModalVisible}
        onCancel={() => setReserveModalVisible(false)}
        onOk={handleReserveBed}
        confirmLoading={reservationLoading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="patient_id"
            label="Patient"
            rules={[{ required: true, message: 'Please select a patient' }]}
          >
            <Select
              showSearch
              placeholder="Select a patient"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option?.children?.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {patients.map(patient => (
                <Option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} ({patient.medical_record_number})
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="reserved_until"
            label="Reserved Until"
            rules={[{ required: true, message: 'Please select a date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={(current) => current && current < dayjs().endOf('day')}
            />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Reason"
          >
            <Input.TextArea rows={4} placeholder="Enter reason for reservation" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        title={bed.status === 'maintenance' ? 'Mark Bed as Available' : 'Set Bed to Maintenance'}
        visible={maintenanceModalVisible}
        onCancel={() => setMaintenanceModalVisible(false)}
        onOk={handleMaintenanceSubmit}
      >
        <Form
          form={maintenanceForm}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Status"
            initialValue={bed.status === 'maintenance' ? 'available' : 'maintenance'}
            hidden
          >
            <Input />
          </Form.Item>
          
          {bed.status !== 'maintenance' && (
            <Alert
              message="Setting this bed to maintenance will make it unavailable for reservations"
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
          
          {bed.status === 'maintenance' && (
            <Form.Item
              name="available_from"
              label="Available From"
            >
              <DatePicker 
                style={{ width: '100%' }} 
                disabledDate={(current) => current && current < dayjs().endOf('day')}
              />
            </Form.Item>
          )}
          
          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea 
              rows={4} 
              placeholder={bed.status === 'maintenance' ? 
                'Enter notes about the maintenance completion' : 
                'Enter reason for maintenance'} 
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default BedShow;