import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, Table, Button, Space, Tag, Input, Select, Row, Col, Statistic, Modal, Form, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, ReloadOutlined, TeamOutlined, MedicineBoxOutlined, BankOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

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
}

interface Facility {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
}

const DepartmentsIndex: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  
  // Filters
  const [filters, setFilters] = useState({
    facility_id: undefined,
    status: undefined,
    search: '',
  });
  
  // Modals
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    avgOccupancy: 0,
  });

  const fetchDepartments = async (page = 1, pageSize = 20) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/v1/departments', {
        params: {
          ...filters,
          page,
          per_page: pageSize,
        },
      });
      
      setDepartments(response.data.data);
      setPagination({
        current: response.data.current_page,
        pageSize: response.data.per_page,
        total: response.data.total,
      });
      
      // Calculate stats
      const total = response.data.total;
      const active = response.data.data.filter((d: Department) => d.status === 'active').length;
      const inactive = total - active;
      const avgOccupancy = response.data.data.reduce((acc: number, curr: Department) => 
        acc + (curr.occupancy_rate || 0), 0) / (total || 1);
      
      setStats({
        total,
        active,
        inactive,
        avgOccupancy,
      });
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
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
    fetchDepartments();
    fetchDropdownData();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchDepartments(pagination.current, pagination.pageSize);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    fetchDepartments(1, pagination.pageSize);
  };

  const resetFilters = () => {
    setFilters({
      facility_id: undefined,
      status: undefined,
      search: '',
    });
    fetchDepartments(1, pagination.pageSize);
  };

  const handleDepartmentSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (selectedDepartment) {
        // Update existing department
        await axios.put(`/api/v1/departments/${selectedDepartment.id}`, values);
      } else {
        // Create new department
        await axios.post('/api/v1/departments', values);
      }
      
      setDepartmentModalVisible(false);
      form.resetFields();
      fetchDepartments(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };

  const getStatusTag = (status: string) => {
    return status === 'active' ? 
      <Tag color="success">Active</Tag> : 
      <Tag color="error">Inactive</Tag>;
  };

  const columns = [
    {
      title: 'Department Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Department) => (
        <a href={`/departments/${record.id}`}>
          {text}
        </a>
      ),
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Facility',
      dataIndex: ['facility', 'name'],
      key: 'facility',
    },
    {
      title: 'Head of Department',
      dataIndex: ['headOfDepartment', 'name'],
      key: 'headOfDepartment',
      render: (text: string) => text || 'Not assigned',
    },
    {
      title: 'Beds',
      dataIndex: 'beds_count',
      key: 'beds_count',
      render: (count: number) => count || 0,
    },
    {
      title: 'Occupancy',
      dataIndex: 'occupancy_rate',
      key: 'occupancy_rate',
      render: (rate: number) => {
        if (rate === undefined) return 'N/A';
        
        const color = rate > 90 ? 'red' : rate > 70 ? 'orange' : 'green';
        return <span style={{ color }}>{rate}%</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Department) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => {
              setSelectedDepartment(record);
              form.setFieldsValue({
                ...record,
                services_offered: record.services_offered || [],
                equipment_available: record.equipment_available || [],
              });
              setDepartmentModalVisible(true);
            }}
          >
            Edit
          </Button>
          
          <Button 
            type="link" 
            href={`/departments/${record.id}`}
          >
            View
          </Button>

          <Button
            type="link"
            danger
            onClick={() => {
              Modal.confirm({
                title: 'Are you sure you want to delete this department?',
                content: 'This action cannot be undone.',
                onOk: async () => {
                  await axios.delete(`/api/v1/departments/${record.id}`);
                  fetchDepartments(pagination.current, pagination.pageSize);
                },
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout
      breadcrumbs={[{ title: 'Department Management', href: '/departments' }]}
      renderHeader={() => (
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl text-gray-800 leading-tight">
            Department Management
          </h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setSelectedDepartment(null);
              form.resetFields();
              setDepartmentModalVisible(true);
            }}
          >
            Add New Department
          </Button>
        </div>
      )}
    >
      <Head title="Department Management" />

      <div className="py-6">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Total Departments" 
                  value={stats.total} 
                  prefix={<MedicineBoxOutlined />} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Active" 
                  value={stats.active} 
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Inactive" 
                  value={stats.inactive} 
                  valueStyle={{ color: '#ff4d4f' }}
                  prefix={<TeamOutlined />} 
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic 
                  title="Avg. Occupancy" 
                  value={stats.avgOccupancy.toFixed(1)} 
                  suffix="%"
                  valueStyle={{ 
                    color: stats.avgOccupancy > 90 ? '#ff4d4f' : 
                           stats.avgOccupancy > 70 ? '#faad14' : '#52c41a' 
                  }}
                  prefix={<BankOutlined />} 
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card className="mb-6">
            <Row gutter={16} align="middle">
              <Col span={8}>
                <Input 
                  placeholder="Search department name or code" 
                  value={filters.search} 
                  onChange={e => handleFilterChange('search', e.target.value)} 
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col span={8}>
                <Select
                  placeholder="Facility"
                  style={{ width: '100%' }}
                  value={filters.facility_id}
                  onChange={value => handleFilterChange('facility_id', value)}
                  allowClear
                >
                  {facilities.map(facility => (
                    <Option key={facility.id} value={facility.id}>{facility.name}</Option>
                  ))}
                </Select>
              </Col>
              <Col span={4}>
                <Select
                  placeholder="Status"
                  style={{ width: '100%' }}
                  value={filters.status}
                  onChange={value => handleFilterChange('status', value)}
                  allowClear
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </Col>
              <Col span={4}>
                <Space>
                  <Tooltip title="Apply Filters">
                    <Button 
                      type="primary" 
                      icon={<FilterOutlined />} 
                      onClick={applyFilters}
                    />
                  </Tooltip>
                  <Tooltip title="Reset Filters">
                    <Button 
                      icon={<ReloadOutlined />} 
                      onClick={resetFilters}
                    />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
          </Card>

          {/* Departments Table */}
          <Card>
            <Table 
              columns={columns} 
              dataSource={departments} 
              rowKey="id"
              pagination={pagination}
              loading={loading}
              onChange={handleTableChange}
            />
          </Card>
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      <Modal
        title={selectedDepartment ? 'Edit Department' : 'Add New Department'}
        visible={departmentModalVisible}
        onCancel={() => setDepartmentModalVisible(false)}
        onOk={handleDepartmentSubmit}
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
            initialValue="active"
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

export default DepartmentsIndex;