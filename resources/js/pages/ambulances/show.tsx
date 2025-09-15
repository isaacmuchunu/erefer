import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, Descriptions, Tag, Button, Space, Timeline, Tabs, Table, Modal, Form, Input, Select, Alert, Skeleton, Row, Col, Statistic, Progress } from 'antd';
import { ArrowLeftOutlined, EditOutlined, CarOutlined, ToolOutlined, SendOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { Link, useParams } from 'react-router-dom';

const { TabPane } = Tabs;
const { Option } = Select;

interface Ambulance {
  id: number;
  facility_id: number;
  vehicle_number: string;
  license_plate: string;
  type: string;
  make_model: string;
  year_of_manufacture: number;
  equipment_inventory: any[];
  capacity: number;
  gps_device_info: any;
  insurance_expiry: string;
  license_expiry: string;
  last_maintenance: string;
  next_maintenance_due: string;
  status: 'available' | 'dispatched' | 'maintenance' | 'out_of_service';
  fuel_level: number;
  current_location: {
    lat: number;
    lng: number;
    updated_at: string;
  } | null;
  facility?: {
    id: number;
    name: string;
  };
  dispatches?: AmbulanceDispatch[];
  currentDispatch?: AmbulanceDispatch;
}

interface AmbulanceDispatch {
  id: number;
  dispatch_number: string;
  referral_id: number | null;
  ambulance_id: number;
  dispatcher_id: number;
  crew_members: any[];
  pickup_location: any;
  destination_location: any;
  dispatched_at: string;
  eta_pickup: string | null;
  eta_destination: string | null;
  arrived_pickup_at: string | null;
  left_pickup_at: string | null;
  arrived_destination_at: string | null;
  status: string;
  special_instructions: string | null;
  patient_condition_on_pickup: any | null;
  patient_condition_on_arrival: any | null;
  distance_km: number | null;
  notes: string | null;
  referral?: {
    id: number;
    patient?: {
      id: number;
      first_name: string;
      last_name: string;
    };
  };
  dispatcher?: {
    id: number;
    name: string;
  };
}

const AmbulanceShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [ambulance, setAmbulance] = useState<Ambulance | null>(null);
  const [loading, setLoading] = useState(true);
  const [dispatchModalVisible, setDispatchModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
  const [maintenanceForm] = Form.useForm();
  const [updateLocationModalVisible, setUpdateLocationModalVisible] = useState(false);
  const [locationForm] = Form.useForm();
  const [updateStatusModalVisible, setUpdateStatusModalVisible] = useState(false);
  const [statusForm] = Form.useForm();

  const fetchAmbulance = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/ambulances/${id}`);
      setAmbulance(response.data.ambulance);
    } catch (error) {
      console.error('Error fetching ambulance details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbulance();
  }, [id]);

  const handleDispatchSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      await axios.post('/api/ambulances/dispatch', {
        ambulance_id: id,
        ...values,
      });
      
      setDispatchModalVisible(false);
      form.resetFields();
      fetchAmbulance();
    } catch (error) {
      console.error('Error dispatching ambulance:', error);
    }
  };

  const handleMaintenanceSubmit = async () => {
    try {
      const values = await maintenanceForm.validateFields();
      
      await axios.put(`/api/ambulances/${id}`, {
        status: values.status,
        next_maintenance_due: values.next_maintenance_due?.format('YYYY-MM-DD'),
        last_maintenance: values.status === 'available' ? dayjs().format('YYYY-MM-DD') : undefined,
      });
      
      setMaintenanceModalVisible(false);
      maintenanceForm.resetFields();
      fetchAmbulance();
    } catch (error) {
      console.error('Error updating maintenance status:', error);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const values = await locationForm.validateFields();
      
      await axios.post(`/api/ambulances/${id}/update-location`, {
        current_location: {
          lat: parseFloat(values.lat),
          lng: parseFloat(values.lng)
        }
      });
      
      setUpdateLocationModalVisible(false);
      locationForm.resetFields();
      fetchAmbulance();
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      
      await axios.put(`/api/ambulances/${id}`, {
        status: values.status,
        fuel_level: values.fuel_level,
      });
      
      setUpdateStatusModalVisible(false);
      statusForm.resetFields();
      fetchAmbulance();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      available: { color: 'success', text: 'Available' },
      dispatched: { color: 'processing', text: 'Dispatched' },
      maintenance: { color: 'warning', text: 'Maintenance' },
      out_of_service: { color: 'error', text: 'Out of Service' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const getDispatchStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      dispatched: { color: 'blue', text: 'Dispatched' },
      en_route_pickup: { color: 'processing', text: 'En Route to Pickup' },
      at_pickup: { color: 'cyan', text: 'At Pickup' },
      en_route_destination: { color: 'geekblue', text: 'En Route to Destination' },
      at_destination: { color: 'purple', text: 'At Destination' },
      completed: { color: 'success', text: 'Completed' },
      cancelled: { color: 'default', text: 'Cancelled' },
    };
    
    const { color, text } = statusMap[status] || { color: 'default', text: status };
    return <Tag color={color}>{text}</Tag>;
  };

  const dispatchColumns = [
    {
      title: 'Dispatch #',
      dataIndex: 'dispatch_number',
      key: 'dispatch_number',
    },
    {
      title: 'Patient',
      key: 'patient',
      render: (text: string, record: AmbulanceDispatch) => (
        record.referral?.patient ? (
          <Link to={`/patients/${record.referral.patient.id}`}>
            {record.referral.patient.first_name} {record.referral.patient.last_name}
          </Link>
        ) : 'N/A'
      ),
    },
    {
      title: 'Dispatched At',
      dataIndex: 'dispatched_at',
      key: 'dispatched_at',
      render: (date: string) => dayjs(date).format('MMM D, YYYY HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getDispatchStatusTag(status),
    },
    {
      title: 'Distance',
      dataIndex: 'distance_km',
      key: 'distance_km',
      render: (distance: number) => distance ? `${distance.toFixed(1)} km` : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text: string, record: AmbulanceDispatch) => (
        <Button 
          size="small" 
          type="primary"
          onClick={() => window.location.href = `/dispatches/${record.id}`}
        >
          View Details
        </Button>
      ),
    },
  ];

  if (loading) {
    return (
      <AppLayout title="Ambulance Details">
        <Head title="Ambulance Details" />
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

  if (!ambulance) {
    return (
      <AppLayout title="Ambulance Details">
        <Head title="Ambulance Details" />
        <div className="py-6">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <Alert
                message="Error"
                description="Ambulance not found"
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
      title={`Ambulance ${ambulance.vehicle_number}`}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              icon={<ArrowLeftOutlined />} 
              type="link" 
              href="/ambulances"
            >
              Back to Ambulances
            </Button>
            <h2 className="font-semibold text-xl text-gray-800 leading-tight ml-4">
              Ambulance {ambulance.vehicle_number}
            </h2>
            {getStatusTag(ambulance.status)}
          </div>
          <Space>
            {ambulance.status === 'available' && (
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={() => setDispatchModalVisible(true)}
              >
                Dispatch
              </Button>
            )}
            <Button 
              icon={<ToolOutlined />} 
              onClick={() => {
                maintenanceForm.setFieldsValue({
                  status: ambulance.status === 'maintenance' ? 'available' : 'maintenance',
                  next_maintenance_due: ambulance.next_maintenance_due ? dayjs(ambulance.next_maintenance_due) : null,
                });
                setMaintenanceModalVisible(true);
              }}
            >
              {ambulance.status === 'maintenance' ? 'Mark as Available' : 'Set to Maintenance'}
            </Button>
            <Button 
              icon={<EnvironmentOutlined />} 
              onClick={() => {
                locationForm.setFieldsValue({
                  lat: ambulance.current_location?.lat || '',
                  lng: ambulance.current_location?.lng || '',
                });
                setUpdateLocationModalVisible(true);
              }}
            >
              Update Location
            </Button>
          </Space>
        </div>
      )}
    >
      <Head title={`Ambulance ${ambulance.vehicle_number}`} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Status Alert */}
          {ambulance.status === 'available' && (
            <Alert 
              message="This ambulance is available for dispatch" 
              type="success" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => setDispatchModalVisible(true)}
                >
                  Dispatch Now
                </Button>
              }
            />
          )}
          
          {ambulance.status === 'dispatched' && ambulance.currentDispatch && (
            <Alert 
              message={`This ambulance is currently dispatched (${ambulance.currentDispatch.dispatch_number})`} 
              description={ambulance.currentDispatch.referral?.patient ? 
                `Patient: ${ambulance.currentDispatch.referral.patient.first_name} ${ambulance.currentDispatch.referral.patient.last_name}` : 
                undefined
              }
              type="info" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  type="primary"
                  onClick={() => window.location.href = `/dispatches/${ambulance.currentDispatch!.id}`}
                >
                  View Dispatch
                </Button>
              }
            />
          )}
          
          {ambulance.status === 'maintenance' && (
            <Alert 
              message="This ambulance is under maintenance" 
              type="warning" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  onClick={() => {
                    maintenanceForm.setFieldsValue({
                      status: 'available',
                      next_maintenance_due: ambulance.next_maintenance_due ? dayjs(ambulance.next_maintenance_due) : null,
                    });
                    setMaintenanceModalVisible(true);
                  }}
                >
                  Mark as Available
                </Button>
              }
            />
          )}
          
          {ambulance.status === 'out_of_service' && (
            <Alert 
              message="This ambulance is out of service" 
              type="error" 
              showIcon 
              className="mb-6"
              action={
                <Button 
                  size="small" 
                  onClick={() => {
                    statusForm.setFieldsValue({
                      status: 'available',
                      fuel_level: ambulance.fuel_level,
                    });
                    setUpdateStatusModalVisible(true);
                  }}
                >
                  Mark as Available
                </Button>
              }
            />
          )}

          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Facility" 
                  value={ambulance.facility?.name || 'N/A'} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Type" 
                  value={ambulance.type || 'N/A'} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Make & Model" 
                  value={ambulance.make_model || 'N/A'} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Year" 
                  value={ambulance.year_of_manufacture || 'N/A'} 
                />
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="details" className="mb-6">
            <TabPane tab="Details" key="details">
              <Card>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Vehicle Number">{ambulance.vehicle_number}</Descriptions.Item>
                  <Descriptions.Item label="License Plate">{ambulance.license_plate}</Descriptions.Item>
                  <Descriptions.Item label="Status">{getStatusTag(ambulance.status)}</Descriptions.Item>
                  <Descriptions.Item label="Capacity">{ambulance.capacity} passengers</Descriptions.Item>
                  <Descriptions.Item label="Fuel Level">
                    <Progress 
                      percent={ambulance.fuel_level} 
                      size="small" 
                      status={ambulance.fuel_level < 20 ? 'exception' : undefined}
                      strokeColor={ambulance.fuel_level < 20 ? '#f5222d' : ambulance.fuel_level < 50 ? '#faad14' : '#52c41a'}
                    />
                  </Descriptions.Item>
                  <Descriptions.Item label="Current Location">
                    {ambulance.current_location ? (
                      <span>
                        Lat: {ambulance.current_location.lat.toFixed(6)}, 
                        Lng: {ambulance.current_location.lng.toFixed(6)}
                        {ambulance.current_location.updated_at && (
                          <div className="text-xs text-gray-500">
                            Updated: {dayjs(ambulance.current_location.updated_at).format('MMM D, YYYY HH:mm')}
                          </div>
                        )}
                      </span>
                    ) : 'Not available'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Insurance Expiry">
                    {ambulance.insurance_expiry ? (
                      <span>
                        {dayjs(ambulance.insurance_expiry).format('MMM D, YYYY')}
                        {dayjs(ambulance.insurance_expiry).isBefore(dayjs()) && (
                          <Tag color="error" className="ml-2">Expired</Tag>
                        )}
                      </span>
                    ) : 'Not set'}
                  </Descriptions.Item>
                  <Descriptions.Item label="License Expiry">
                    {ambulance.license_expiry ? (
                      <span>
                        {dayjs(ambulance.license_expiry).format('MMM D, YYYY')}
                        {dayjs(ambulance.license_expiry).isBefore(dayjs()) && (
                          <Tag color="error" className="ml-2">Expired</Tag>
                        )}
                      </span>
                    ) : 'Not set'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Last Maintenance">
                    {ambulance.last_maintenance ? 
                      dayjs(ambulance.last_maintenance).format('MMM D, YYYY') : 
                      'Not recorded'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Next Maintenance Due">
                    {ambulance.next_maintenance_due ? (
                      <span>
                        {dayjs(ambulance.next_maintenance_due).format('MMM D, YYYY')}
                        {dayjs(ambulance.next_maintenance_due).isBefore(dayjs().add(7, 'day')) && (
                          <Tag 
                            color={dayjs(ambulance.next_maintenance_due).isBefore(dayjs()) ? 'error' : 'warning'} 
                            className="ml-2"
                          >
                            {dayjs(ambulance.next_maintenance_due).isBefore(dayjs()) ? 'Overdue' : 'Due Soon'}
                          </Tag>
                        )}
                      </span>
                    ) : 'Not scheduled'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Equipment Inventory" span={2}>
                    {ambulance.equipment_inventory && ambulance.equipment_inventory.length > 0 ? (
                      <Space wrap>
                        {ambulance.equipment_inventory.map((item, index) => (
                          <Tag key={index}>{item.name}</Tag>
                        ))}
                      </Space>
                    ) : 'None'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </TabPane>
            
            <TabPane tab="Current Dispatch" key="current" disabled={!ambulance.currentDispatch}>
              {ambulance.currentDispatch && (
                <Card>
                  <Descriptions bordered column={2}>
                    <Descriptions.Item label="Dispatch Number">{ambulance.currentDispatch.dispatch_number}</Descriptions.Item>
                    <Descriptions.Item label="Status">{getDispatchStatusTag(ambulance.currentDispatch.status)}</Descriptions.Item>
                    <Descriptions.Item label="Patient">
                      {ambulance.currentDispatch.referral?.patient ? (
                        <Link to={`/patients/${ambulance.currentDispatch.referral.patient.id}`}>
                          {ambulance.currentDispatch.referral.patient.first_name} {ambulance.currentDispatch.referral.patient.last_name}
                        </Link>
                      ) : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dispatcher">
                      {ambulance.currentDispatch.dispatcher?.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Dispatched At">
                      {dayjs(ambulance.currentDispatch.dispatched_at).format('MMM D, YYYY HH:mm')}
                    </Descriptions.Item>
                    <Descriptions.Item label="ETA to Destination">
                      {ambulance.currentDispatch.eta_destination ? 
                        dayjs(ambulance.currentDispatch.eta_destination).format('MMM D, YYYY HH:mm') : 
                        'Not available'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Pickup Location" span={2}>
                      {typeof ambulance.currentDispatch.pickup_location === 'string' ? 
                        ambulance.currentDispatch.pickup_location : 
                        JSON.stringify(ambulance.currentDispatch.pickup_location)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Destination Location" span={2}>
                      {typeof ambulance.currentDispatch.destination_location === 'string' ? 
                        ambulance.currentDispatch.destination_location : 
                        JSON.stringify(ambulance.currentDispatch.destination_location)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Special Instructions" span={2}>
                      {ambulance.currentDispatch.special_instructions || 'None'}
                    </Descriptions.Item>
                  </Descriptions>
                  
                  <div className="mt-4 flex justify-end">
                    <Button 
                      type="primary" 
                      onClick={() => window.location.href = `/dispatches/${ambulance.currentDispatch!.id}`}
                    >
                      View Full Details
                    </Button>
                  </div>
                </Card>
              )}
            </TabPane>
            
            <TabPane tab="Dispatch History" key="history">
              <Card>
                <Table 
                  columns={dispatchColumns} 
                  dataSource={ambulance.dispatches || []} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </Card>
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Dispatch Ambulance Modal */}
      <Modal
        title="Dispatch Ambulance"
        visible={dispatchModalVisible}
        onCancel={() => setDispatchModalVisible(false)}
        onOk={handleDispatchSubmit}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="referral_id"
            label="Referral ID (Optional)"
          >
            <Input placeholder="Enter Referral ID" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pickup_location"
                label="Pickup Location"
                rules={[{ required: true, message: 'Please enter pickup location' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter full address" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="destination_location"
                label="Destination Location"
                rules={[{ required: true, message: 'Please enter destination location' }]}
              >
                <Input.TextArea rows={3} placeholder="Enter full address" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="crew_members"
            label="Crew Members"
            rules={[{ required: true, message: 'Please enter at least one crew member' }]}
          >
            <Select
              mode="tags"
              placeholder="Enter crew member names"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="special_instructions"
            label="Special Instructions"
          >
            <Input.TextArea rows={4} placeholder="Enter any special instructions" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        title={ambulance?.status === 'maintenance' ? 'Mark Ambulance as Available' : 'Set Ambulance to Maintenance'}
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
            initialValue={ambulance?.status === 'maintenance' ? 'available' : 'maintenance'}
            hidden
          >
            <Input />
          </Form.Item>
          
          {ambulance?.status !== 'maintenance' && (
            <Alert
              message="Setting this ambulance to maintenance will make it unavailable for dispatch"
              type="warning"
              showIcon
              className="mb-4"
            />
          )}
          
          <Form.Item
            name="next_maintenance_due"
            label="Next Maintenance Due"
            rules={[{ required: true, message: 'Please select next maintenance date' }]}
          >
            <Input type="date" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Location Modal */}
      <Modal
        title="Update Ambulance Location"
        visible={updateLocationModalVisible}
        onCancel={() => setUpdateLocationModalVisible(false)}
        onOk={handleUpdateLocation}
      >
        <Form
          form={locationForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lat"
                label="Latitude"
                rules={[{ required: true, message: 'Please enter latitude' }]}
              >
                <Input placeholder="Enter latitude" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="lng"
                label="Longitude"
                rules={[{ required: true, message: 'Please enter longitude' }]}
              >
                <Input placeholder="Enter longitude" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title="Update Ambulance Status"
        visible={updateStatusModalVisible}
        onCancel={() => setUpdateStatusModalVisible(false)}
        onOk={handleUpdateStatus}
      >
        <Form
          form={statusForm}
          layout="vertical"
        >
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select placeholder="Select Status">
              <Option value="available">Available</Option>
              <Option value="maintenance">Maintenance</Option>
              <Option value="out_of_service">Out of Service</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="fuel_level"
            label="Fuel Level (%)"
            rules={[{ required: true, message: 'Please enter fuel level' }]}
          >
            <Input type="number" placeholder="Enter Fuel Level" min={0} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default AmbulanceShow;