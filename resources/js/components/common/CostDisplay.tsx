import React from 'react';
import { Typography } from 'antd';

interface CostDisplayProps {
  value: number | null | undefined;
  currency?: string;
  defaultText?: string;
  colorCoded?: boolean;
}

const { Text } = Typography;

const CostDisplay: React.FC<CostDisplayProps> = ({ 
  value, 
  currency = '$', 
  defaultText = 'N/A',
  colorCoded = false
}) => {
  if (value === null || value === undefined) {
    return <Text type="secondary">{defaultText}</Text>;
  }

  const formattedValue = `${currency}${value.toFixed(2)}`;
  
  if (!colorCoded) {
    return <Text>{formattedValue}</Text>;
  }

  // Color coding based on value
  let color = '';
  if (value > 1000) {
    color = '#cf1322'; // Red for high cost
  } else if (value > 500) {
    color = '#fa8c16'; // Orange for medium cost
  } else {
    color = '#52c41a'; // Green for low cost
  }

  return <Text style={{ color }}>{formattedValue}</Text>;
};

export default CostDisplay;