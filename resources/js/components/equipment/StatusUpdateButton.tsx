import React, { useState } from 'react';
import { Button, Modal, Form, Select, Input, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

interface StatusUpdateButtonProps {
  equipmentId: number | string;
  currentStatus?: string;
  buttonText?: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  buttonSize?: 'large' | 'middle' | 'small';
  buttonIcon?: React.ReactNode;
  onSuccess?: () => void;
}

const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  equipmentId,
  currentStatus,
  buttonText = 'Update Status',
  buttonType = 'default',
  buttonSize = 'middle',
  buttonIcon = <CheckCircleOutlined />,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
    form.resetFields();
    if (currentStatus) {
      form.setFieldsValue({ status: currentStatus });
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await axios.put(`/api/equipment/${equipmentId}/status`, values);
      
      setOpen(false);
      message.success('Equipment status updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update status: ${error.message}`);
      } else {
        message.error('Failed to update status');
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
        title="Update Equipment Status"
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
            name="status"
            label="Status"
            rules={[{ required: true, message: 'Please select a status' }]}
          >
            <Select>
              <Select.Option value="available">Available</Select.Option>
              <Select.Option value="in use">In Use</Select.Option>
              <Select.Option value="maintenance">Under Maintenance</Select.Option>
              <Select.Option value="out of order">Out of Order</Select.Option>
              <Select.Option value="decommissioned">Decommissioned</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes"
            rules={[{ required: true, message: 'Please provide notes for this status change' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default StatusUpdateButton;