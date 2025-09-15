import React, { useState } from 'react';
import { Button, Modal, Form, DatePicker, Select, Input, message } from 'antd';
import { ToolOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

interface MaintenanceScheduleButtonProps {
  equipmentId: number | string;
  buttonText?: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  buttonSize?: 'large' | 'middle' | 'small';
  buttonIcon?: React.ReactNode;
  onSuccess?: () => void;
}

const MaintenanceScheduleButton: React.FC<MaintenanceScheduleButtonProps> = ({
  equipmentId,
  buttonText = 'Schedule Maintenance',
  buttonType = 'primary',
  buttonSize = 'middle',
  buttonIcon = <ToolOutlined />,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const formattedValues = {
        ...values,
        maintenance_date: values.maintenance_date.format('YYYY-MM-DD'),
        equipment_id: equipmentId
      };

      await axios.post('/api/maintenance', formattedValues);
      
      setOpen(false);
      message.success('Maintenance scheduled successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to schedule maintenance: ${error.message}`);
      } else {
        message.error('Failed to schedule maintenance');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        type={buttonType} 
        icon={buttonIcon} 
        onClick={showModal}
        size={buttonSize}
      >
        {buttonText}
      </Button>

      <Modal
        title="Schedule Maintenance"
        open={open}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="maintenance_date"
            label="Maintenance Date"
            rules={[{ required: true, message: 'Please select a maintenance date' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="maintenance_type"
            label="Maintenance Type"
            rules={[{ required: true, message: 'Please select a maintenance type' }]}
          >
            <Select>
              <Select.Option value="routine">Routine</Select.Option>
              <Select.Option value="preventive">Preventive</Select.Option>
              <Select.Option value="corrective">Corrective</Select.Option>
              <Select.Option value="emergency">Emergency</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default MaintenanceScheduleButton;