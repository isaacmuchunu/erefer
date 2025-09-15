import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, Row, Col, Statistic, Descriptions, Button, Tag, Tabs, Table, Space, Modal, Form, Input, Select, Alert, Spin, Empty, List, Avatar } from 'antd';
import { ArrowLeftOutlined, EditOutlined, TeamOutlined, MedicineBoxOutlined, BankOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface Department {
  id: number;
  facility_id: number;
  name: string;
  code: string;
  description: string;
  services_offered: string[];
  equipment_available: string[];
  head_of_department: number | null;
  status: 'active' | 'inactive';
  facility?: {
    id: number;
    name: string;
  };
  headOfDepartment?: {
    id: number;
    name: string;
  };
  beds_count?: number;
  equipment_count?: number;
  doctors_count?: number;
  occupancy_rate?: number;
  created_at?: string;
  updated_at?: string;
}

interface Bed {
  id: number;
  bed_number: string;
  room_number: string;
  status: string;
  bed_type: {
    id: number;
    name: string;
  };
  current_reservation?: {
    id: number;
    patient: {
      id: number;
      name: string;
    };
    reserved_at: string;
    reserved_until: string;
    status: string;
  };
}

interface Equipment {
  id: number;
  name: string;
  model: string;
  serial_number: string;
  status: string;
  last_maintenance_date: string;
  next_maintenance_date: string;
}

interface Doctor {
  id: number;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface Facility {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

const DepartmentShow: React.FC = () => {
  const [department, setDepartment] = useState<Department | null>(null);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Dropdown data
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Modals
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Get department ID from URL
  const departmentId = window.location.pathname.split('/').pop();

  const fetchDepartment = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/departments/${departmentId}`);
      setDepartment(response.data);
      
      // Fetch related data
      fetchBeds();
      fetchEquipment();
      fetchDoctors();
    } catch (error) {
      console.error('Error fetching department:', error);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBeds = async () => {
    try {
      const response = await axios.get(`/api/departments/${departmentId}/beds`);
      setBeds(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching beds:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const response = await axios.get(`/api/departments/${departmentId}/equipment`);
      setEquipment(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`/api/departments/${departmentId}/doctors`);
      setDoctors(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [facilitiesRes, usersRes] = await Promise.all([
        axios.get('/api/v1/facilities'),
        axios.get('/api/v1/users'),
      ]);
      
      setFacilities(facilitiesRes.data.data || facilitiesRes.data);
      setUsers(usersRes.data.data || usersRes.data);
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
    }
  };

  useEffect(() => {
    if (departmentId) {
      fetchDepartment();
      fetchDropdownData();
    }
  }, [departmentId]);

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(`/api/departments/${departmentId}`, values);
      
      setEditModalVisible(false);
      fetchDepartment();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const getStatusTag = (status: string) => {
    return status === 'active' ? 
      <Tag color="success">Active</Tag> : 
      <Tag color="error">Inactive</Tag>;
  };

  const getBedStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available':
        return <Tag color="success">Available</Tag>;
      case 'occupied':
        return <Tag color="error">Occupied</Tag>;
      case 'maintenance':
        return <Tag color="warning">Maintenance</Tag>;
      case 'reserved':
        return <Tag color="processing">Reserved</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const getEquipmentStatusTag = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return <Tag color="success">Operational</Tag>;
      case 'maintenance':
        return <Tag color="warning">Maintenance</Tag>;
      case 'out_of_order':
        return <Tag color="error">Out of Order</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const bedColumns = [
    {
      title: 'Bed Number',
      dataIndex: 'bed_number',
      key: 'bed_number',
      render: (text: string, record: Bed) => (
        <a href={`/beds/${record.id}`}>{text}</a>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room_number',
      key: 'room_number',
    },
    {
      title: 'Type',
      dataIndex: ['bed_type', 'name'],
      key: 'bed_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getBedStatusTag(status),
    },
    {
      title: 'Current Patient',
      key: 'current_patient',
      render: (_: any, record: Bed) => {
        if (record.current_reservation) {
          return (
            <a href={`/patients/${record.current_reservation.patient.id}`}>
              {record.current_reservation.patient.name}
            </a>
          );
        }
        return 'None';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Bed) => (
        <Button type="link" href={`/beds/${record.id}`}>View</Button>
      ),
    },
  ];

  const equipmentColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Equipment) => (
        <a href={`/equipment/${record.id}`}>{text}</a>
      ),
    },
    {
      title: 'Model',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: 'Serial Number',
      dataIndex: 'serial_number',
      key: 'serial_number',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getEquipmentStatusTag(status),
    },
    {
      title: 'Last Maintenance',
      dataIndex: 'last_maintenance_date',
      key: 'last_maintenance_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Next Maintenance',
      dataIndex: 'next_maintenance_date',
      key: 'next_maintenance_date',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Equipment) => (
        <Button type="link" href={`/equipment/${record.id}`}>View</Button>
      ),
    },
  ];

  if (loading) {
    return (
      // @ts-ignore
      <AppLayout title="Department Details">
        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (notFound) {
    return (
      // @ts-ignore
      <AppLayout title="Department Not Found">
        <div className="py-12">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Card>
              <Empty
                description="Department not found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <div className="text-center mt-4">
                <Button type="primary" href="/departments">
                  Back to Departments
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    // @ts-ignore
    <AppLayout
      title={department?.name || 'Department Details'}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight flex items-center">
            <Link href="/departments" className="mr-2">
              <ArrowLeftOutlined />
            </Link>
            {department?.name} {getStatusTag(department?.status || 'inactive')}
          </h2>
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue({
                ...department,
                services_offered: department?.services_offered || [],
                equipment_available: department?.equipment_available || [],
              });
              setEditModalVisible(true);
            }}
          >
            Edit Department
          </Button>
        </div>
      )}
    >
      <Head title={department?.name || 'Department Details'} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Department Status Alert */}
          {department?.status === 'inactive' && (
            <Alert
              message="This department is currently inactive"
              type="warning"
              showIcon
              className="mb-6"
            />
          )}

          {/* Stats Cards */}
          <Row gutter={16} className="mb-6">
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Beds" 
                  value={beds.length} 
                  prefix={<MedicineBoxOutlined />} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Equipment" 
                  value={equipment.length} 
                  prefix={<SettingOutlined />} 
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic 
                  title="Doctors" 
                  value={doctors.length} 
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
          </Row>

          {/* Department Details */}
          <Card className="mb-6">
            <Descriptions title="Department Information" bordered column={2}>
              <Descriptions.Item label="Department Name">{department?.name}</Descriptions.Item>
              <Descriptions.Item label="Department Code">{department?.code}</Descriptions.Item>
              <Descriptions.Item label="Facility">
                {department?.facility ? (
                  <a href={`/facilities/${department.facility.id}`}>
                    {department.facility.name}
                  </a>
                ) : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Head of Department">
                {department?.headOfDepartment ? (
                  <a href={`/users/${department.headOfDepartment.id}`}>
                    {department.headOfDepartment.name}
                  </a>
                ) : 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Status" span={2}>
                {getStatusTag(department?.status || 'inactive')}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {department?.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Services Offered" span={2}>
                {department?.services_offered && department.services_offered.length > 0 ? (
                  <div>
                    {department.services_offered.map((service, index) => (
                      <Tag key={index} color="blue">{service}</Tag>
                    ))}
                  </div>
                ) : 'No services listed'}
              </Descriptions.Item>
              <Descriptions.Item label="Equipment Available" span={2}>
                {department?.equipment_available && department.equipment_available.length > 0 ? (
                  <div>
                    {department.equipment_available.map((item, index) => (
                      <Tag key={index} color="purple">{item}</Tag>
                    ))}
                  </div>
                ) : 'No equipment listed'}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {department?.created_at ? new Date(department.created_at).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {department?.updated_at ? new Date(department.updated_at).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Tabs for Beds, Equipment, and Doctors */}
          <Card>
            <Tabs defaultActiveKey="beds">
              <TabPane tab="Beds" key="beds">
                <Table 
                  columns={bedColumns} 
                  dataSource={beds} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Equipment" key="equipment">
                <Table 
                  columns={equipmentColumns} 
                  dataSource={equipment} 
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              
              <TabPane tab="Doctors" key="doctors">
                <List
                  itemLayout="horizontal"
                  dataSource={doctors}
                  pagination={{ pageSize: 10 }}
                  renderItem={(doctor) => (
                    <List.Item
                      actions={[
                        <Button type="link" href={`/doctors/${doctor.id}`}>View Profile</Button>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<UserOutlined />} src={doctor.avatar} />}
                        title={<a href={`/doctors/${doctor.id}`}>{doctor.name}</a>}
                        description={`Specialization: ${doctor.specialization || 'Not specified'}`}
                      />
                      <div>
                        <div>Email: {doctor.email}</div>
                        <div>Phone: {doctor.phone}</div>
                      </div>
                    </List.Item>
                  )}
                />
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Edit Department Modal */}
      <Modal
        title="Edit Department"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditSubmit}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="facility_id"
                label="Facility"
                rules={[{ required: true, message: 'Please select facility' }]}
              >
                <Select placeholder="Select Facility">
                  {facilities.map(facility => (
                    <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="head_of_department"
                label="Head of Department"
              >
                <Select placeholder="Select Head of Department" allowClear>
                  {users.map(user => (
                    <Option key={user.id} value={user.id}>{user.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Department Name"
                rules={[{ required: true, message: 'Please enter department name' }]}
              >
                <Input placeholder="Enter department name" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                name="code"
                label="Department Code"
                rules={[{ required: true, message: 'Please enter department code' }]}
              >
                <Input placeholder="Enter department code" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Enter department description" />
          </Form.Item>
          
          <Form.Item
            name="services_offered"
            label="Services Offered"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Enter services offered"
              tokenSeparators={[',']}
            />
          </Form.Item>
          
          <Form.Item
            name="equipment_available"
            label="Equipment Available"
          >
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="Enter available equipment"
              tokenSeparators={[',']}
            />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
          >
            <Select placeholder="Select Status">
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default DepartmentShow;