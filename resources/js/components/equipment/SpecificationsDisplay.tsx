import React from 'react';
import { Descriptions, Typography, Table } from 'antd';

interface SpecificationsDisplayProps {
  specifications: any;
}

const { Text } = Typography;

const SpecificationsDisplay: React.FC<SpecificationsDisplayProps> = ({ specifications }) => {
  if (!specifications) {
    return <Text type="secondary">No specifications available</Text>;
  }

  // Handle string specifications
  if (typeof specifications === 'string') {
    try {
      // Try to parse as JSON
      const parsedSpecs = JSON.parse(specifications);
      return renderSpecifications(parsedSpecs);
    } catch (e) {
      // If not valid JSON, display as plain text
      return <Text>{specifications}</Text>;
    }
  }

  // Handle object specifications
  return renderSpecifications(specifications);
};

const renderSpecifications = (specs: any) => {
  // If specs is an array
  if (Array.isArray(specs)) {
    if (specs.length === 0) {
      return <Text type="secondary">No specifications available</Text>;
    }

    // If array contains objects with key-value pairs
    if (typeof specs[0] === 'object') {
      const columns = Object.keys(specs[0]).map(key => ({
        title: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
        dataIndex: key,
        key,
        render: (text: any) => {
          if (typeof text === 'object') return JSON.stringify(text);
          return text;
        }
      }));

      return (
        <Table 
          columns={columns} 
          dataSource={specs} 
          pagination={false} 
          size="small" 
          rowKey={(record, index) => `spec-${index}`}
        />
      );
    }

    // If array contains simple values
    return (
      <ul>
        {specs.map((spec, index) => (
          <li key={`spec-${index}`}>{spec}</li>
        ))}
      </ul>
    );
  }

  // If specs is an object
  return (
    <Descriptions column={1} size="small" bordered>
      {Object.entries(specs).map(([key, value]) => {
        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        let formattedValue = value;

        if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value);
        }

        return (
          <Descriptions.Item key={key} label={formattedKey}>
            {formattedValue}
          </Descriptions.Item>
        );
      })}
    </Descriptions>
  );
};

export default SpecificationsDisplay;