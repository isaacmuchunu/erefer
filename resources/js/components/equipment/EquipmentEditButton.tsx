import React, { useState } from 'react';
import { Button, Modal, Form, Input, DatePicker, message } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

interface Equipment {
  id: number;
  name: string;
  code: string;
  serial_number?: string;
  manufacturer?: string;
  model?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  next_maintenance_due?: string;
  specifications?: any;
}

interface EquipmentEditButtonProps {
  equipment: Equipment;
  buttonText?: string;
  buttonType?: 'primary' | 'default' | 'dashed' | 'link' | 'text';
  buttonSize?: 'large' | 'middle' | 'small';
  buttonIcon?: React.ReactNode;
  onSuccess?: () => void;
}

const EquipmentEditButton: React.FC<EquipmentEditButtonProps> = ({
  equipment,
  buttonText = 'Edit',
  buttonType = 'default',
  buttonSize = 'middle',
  buttonIcon = <EditOutlined />,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
    form.resetFields();
    
    // Set initial form values
    form.setFieldsValue({
      name: equipment.name,
      code: equipment.code,
      serial_number: equipment.serial_number,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      purchase_date: equipment.purchase_date ? dayjs(equipment.purchase_date) : undefined,
      warranty_expiry: equipment.warranty_expiry ? dayjs(equipment.warranty_expiry) : undefined,
      next_maintenance_due: equipment.next_maintenance_due ? dayjs(equipment.next_maintenance_due) : undefined,
      specifications: typeof equipment.specifications === 'string' 
        ? equipment.specifications 
        : JSON.stringify(equipment.specifications, null, 2)
    });
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
        purchase_date: values.purchase_date ? values.purchase_date.format('YYYY-MM-DD') : null,
        warranty_expiry: values.warranty_expiry ? values.warranty_expiry.format('YYYY-MM-DD') : null,
        next_maintenance_due: values.next_maintenance_due ? values.next_maintenance_due.format('YYYY-MM-DD') : null,
      };

      await axios.put(`/api/equipment/${equipment.id}`, formattedValues);
      
      setOpen(false);
      message.success('Equipment updated successfully');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      if (error instanceof Error) {
        message.error(`Failed to update equipment: ${error.message}`);
      } else {
        message.error('Failed to update equipment');
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
        title="Edit Equipment"
        open={open}
        onCancel={handleCancel}
        onOk={handleSubmit}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter equipment name' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="code"
            label="Code"
            rules={[{ required: true, message: 'Please enter equipment code' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="serial_number"
            label="Serial Number"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="manufacturer"
            label="Manufacturer"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="model"
            label="Model"
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="purchase_date"
            label="Purchase Date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="warranty_expiry"
            label="Warranty Expiry"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="next_maintenance_due"
            label="Next Maintenance Due"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="specifications"
            label="Specifications"
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EquipmentEditButton;