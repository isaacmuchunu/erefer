import React, { useEffect, useState } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import axios from 'axios';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Tooltip,
  Statistic,
  Badge,
  Card,
  notification,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

dayjs.extend(relativeTime);

interface Bed {
  id: number;
  bed_identifier: string;
  bed_number?: string;
  room_number?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  bed_type?: { id?: number; name?: string } | null;
  department?: { id?: number; name?: string } | null;
  facility?: { id?: number; name?: string } | null;
  available_from?: string | null;
  currentReservation?: { reserved_until?: string } | null;
  last_occupied_at?: string | null;
  [k: string]: any;
}

const { Option } = Select;

const BedsIndex: React.FC = () => {
  const { auth } = usePage().props as any;

  // table data + meta
  const [beds, setBeds] = useState<Bed[]>([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  // stats
  const [stats, setStats] = useState({ total: 0, available: 0, occupied: 0, reserved: 0, maintenance: 0 });

  // filters
  const [filters, setFilters] = useState<any>({ facility_id: undefined, department_id: undefined, bed_type_id: undefined, status: undefined });

  

  // lookup data
  const [facilities, setFacilities] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [bedTypes, setBedTypes] = useState<any[]>([]);

  // pagination (Ant Design table expects this shape)
  const [pagination, setPagination] = useState<TablePaginationConfig>({ current: 1, pageSize: 10, total: 0 });

  const fetchBeds = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = { page, per_page: pageSize, ...filters };
      const res = await axios.get('/api/v1/beds', { params });
      // adapt to expected shape
      const data = res.data;
      setBeds(data.data || []);
      setMeta(data.meta || { current_page: page, last_page: 1, total: data.total || 0 });
      setPagination({ ...pagination, current: data.meta?.current_page || page, pageSize: pageSize, total: data.meta?.total || data.total || 0 });
    } catch (err) {
      console.error('fetchBeds error', err);
      notification.error({ message: 'Error', description: 'Unable to fetch beds' });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/v1/beds/stats');
      setStats(res.data.stats || res.data || {});
    } catch (err) {
      console.error('fetchStats error', err);
    }
  };

  const fetchLookups = async () => {
    try {
      const [fRes, dRes, tRes] = await Promise.all([
        axios.get('/api/v1/facilities'),
        axios.get('/api/v1/departments'),
        axios.get('/api/v1/bed-types'),
      ]);
      setFacilities(fRes.data.data || fRes.data || []);
      setDepartments(dRes.data.data || dRes.data || []);
      setBedTypes(tRes.data.data || tRes.data || []);
    } catch (err) {
      console.warn('lookup fetch failed', err);
    }
  };

  useEffect(() => {
    fetchBeds(pagination.current || 1, pagination.pageSize || 10);
    fetchStats();
    fetchLookups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-fetch when filters change
  useEffect(() => {
    fetchBeds(1, pagination.pageSize || 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    const current = newPagination.current || 1;
    const pageSize = newPagination.pageSize || 10;
    setPagination(newPagination);
    fetchBeds(current, pageSize);
  };

  

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: 'Confirm Delete',
      content: 'Are you sure you want to delete this bed?',
      onOk: async () => {
        try {
          await axios.delete(`/api/v1/beds/${id}`);
          notification.success({ message: 'Deleted', description: 'Bed deleted' });
          fetchBeds(pagination.current || 1, pagination.pageSize || 10);
          fetchStats();
        } catch (err) {
          console.error('delete error', err);
          notification.error({ message: 'Error', description: 'Failed to delete' });
        }
      },
    });
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'available':
        return <Tag color="green">Available</Tag>;
      case 'occupied':
        return <Tag color="red">Occupied</Tag>;
      case 'maintenance':
        return <Tag color="gold">Maintenance</Tag>;
      case 'reserved':
        return <Tag color="blue">Reserved</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<Bed> = [
    {
      title: 'Bed ID',
      dataIndex: 'bed_identifier',
      key: 'bed_identifier',
      render: (text: any, record: Bed) => (
        <span>{record.room_number ? `${record.room_number}-${text}` : text}</span>
      ),
    },
    {
      title: 'Facility',
      dataIndex: ['facility', 'name'],
      key: 'facility',
      render: (_: any, record: Bed) => record.facility?.name || '—',
    },
    {
      title: 'Department',
      dataIndex: ['department', 'name'],
      key: 'department',
      render: (_: any, record: Bed) => record.department?.name || '—',
    },
    {
      title: 'Type',
      dataIndex: ['bed_type', 'name'],
      key: 'bed_type',
      render: (_: any, record: Bed) => record.bed_type?.name || '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: any) => getStatusTag(status),
    },
    {
      title: 'Availability',
      key: 'availability',
      render: (_: any, record: Bed) => {
        if (record.status === 'available') {
          if (record.available_from && dayjs(record.available_from).isAfter(dayjs())) {
            return <span>Available from {dayjs(record.available_from).format('MMM D, YYYY')}</span>;
          }
          return <Tag color="success">Available Now</Tag>;
        }

        if (record.status === 'occupied' || record.status === 'reserved') {
          if (record.currentReservation && record.currentReservation.reserved_until) {
            return <span>Reserved until {dayjs(record.currentReservation.reserved_until).format('MMM D, YYYY')}</span>;
          }
          return <span>Last occupied {record.last_occupied_at ? dayjs(record.last_occupied_at).fromNow() : 'N/A'}</span>;
        }

        return null;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Bed) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Link href={`/beds/${record.id}/edit`}>
              <Button icon={<EditOutlined />} type="text" />
            </Link>
          </Tooltip>
          <Tooltip title="Delete">
            <Button icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} type="text" danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout user={auth?.user}>
      <Head title="Beds Management" />

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Beds Management</h1>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => { setFilters({}); fetchBeds(1, pagination.pageSize || 10); }}>
              Refresh
            </Button>
            <Link href="/beds/create">
              <Button type="primary" icon={<PlusOutlined />}>
                Add New Bed
              </Button>
            </Link>
          </Space>
        </div>

        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card>
              <Statistic title="Total Beds" value={stats.total} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Available" value={stats.available} prefix={<Badge status="success" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Occupied" value={stats.occupied} prefix={<Badge status="error" />} />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Maintenance" value={stats.maintenance} prefix={<Badge status="warning" />} />
            </Card>
          </Col>
        </Row>

        {/* Filters row */}
        <Card className="mb-4">
          <Form layout="inline">
            <Form.Item label="Facility">
              <Select
                placeholder="Select Facility"
                style={{ width: 200 }}
                allowClear
                value={filters.facility_id}
                onChange={(val) => setFilters({ ...filters, facility_id: val })}
              >
                {facilities.map((f) => (
                  <Option key={f.id} value={f.id}>{f.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Department">
              <Select
                placeholder="Select Department"
                style={{ width: 200 }}
                allowClear
                value={filters.department_id}
                onChange={(val) => setFilters({ ...filters, department_id: val })}
                disabled={!filters.facility_id}
              >
                {departments.map((d) => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Bed Type">
              <Select
                placeholder="Select Bed Type"
                style={{ width: 200 }}
                allowClear
                value={filters.bed_type_id}
                onChange={(val) => setFilters({ ...filters, bed_type_id: val })}
              >
                {bedTypes.map((t) => (
                  <Option key={t.id} value={t.id}>{t.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Status">
              <Select
                placeholder="Select Status"
                style={{ width: 150 }}
                allowClear
                value={filters.status}
                onChange={(val) => setFilters({ ...filters, status: val })}
              >
                <Option value="available">Available</Option>
                <Option value="occupied">Occupied</Option>
                <Option value="maintenance">Maintenance</Option>
                <Option value="reserved">Reserved</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button icon={<SearchOutlined />} onClick={() => fetchBeds(1, pagination.pageSize || 10)}>
                Search
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card>
          <Table
            columns={columns}
            dataSource={beds}
            rowKey={(record) => record.id}
            loading={loading}
            pagination={pagination}
            onChange={(pag) => handleTableChange(pag)}
          />
        </Card>

        
      </div>
    </AppLayout>
  );
};

export default BedsIndex;
