import React from 'react';
import { Typography, Tooltip } from 'antd';
import dayjs from 'dayjs';

interface EquipmentAgeDisplayProps {
  purchaseDate: string | Date | null | undefined;
  warrantyExpiry?: string | Date | null | undefined;
  showTooltip?: boolean;
}

const { Text } = Typography;

const EquipmentAgeDisplay: React.FC<EquipmentAgeDisplayProps> = ({ 
  purchaseDate, 
  warrantyExpiry,
  showTooltip = true 
}) => {
  if (!purchaseDate) {
    return <Text type="secondary">Unknown</Text>;
  }

  const purchase = dayjs(purchaseDate);
  if (!purchase.isValid()) {
    return <Text type="secondary">Invalid date</Text>;
  }

  const now = dayjs();
  const diffYears = now.diff(purchase, 'year');
  const diffMonths = now.diff(purchase, 'month') % 12;

  let ageText = '';
  if (diffYears > 0) {
    ageText = `${diffYears} year${diffYears !== 1 ? 's' : ''}`;
    if (diffMonths > 0) {
      ageText += `, ${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    }
  } else {
    ageText = `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
  }

  // Determine if equipment is out of warranty
  let color = '';
  let tooltipText = `Age: ${ageText}`;

  if (warrantyExpiry) {
    const warranty = dayjs(warrantyExpiry);
    if (warranty.isValid()) {
      if (now.isAfter(warranty)) {
        color = '#cf1322'; // Red for out of warranty
        tooltipText += ' (Out of warranty)';
      } else {
        const monthsToWarrantyEnd = warranty.diff(now, 'month');
        if (monthsToWarrantyEnd <= 3) {
          color = '#fa8c16'; // Orange for warranty ending soon
          tooltipText += ` (Warranty ends in ${monthsToWarrantyEnd} month${monthsToWarrantyEnd !== 1 ? 's' : ''})`;
        } else {
          color = '#52c41a'; // Green for in warranty
          tooltipText += ' (In warranty)';
        }
      }
    }
  }

  const textElement = <Text style={color ? { color } : undefined}>{ageText}</Text>;
  
  if (showTooltip) {
    return <Tooltip title={tooltipText}>{textElement}</Tooltip>;
  }
  
  return textElement;
};

export default EquipmentAgeDisplay;