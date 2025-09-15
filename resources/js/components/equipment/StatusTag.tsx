import React from 'react';
import { Tag, Tooltip } from 'antd';

interface StatusTagProps {
  status: string;
  type?: 'equipment' | 'maintenance';
  showTooltip?: boolean;
}

const StatusTag: React.FC<StatusTagProps> = ({ 
  status, 
  type = 'equipment',
  showTooltip = true 
}) => {
  if (!status) {
    return <Tag>Unknown</Tag>;
  }

  let color = '';
  let tooltipText = '';
  const statusLower = status.toLowerCase();

  if (type === 'equipment') {
    // Equipment status colors
    if (statusLower === 'available') {
      color = 'success';
      tooltipText = 'Equipment is available for use';
    } else if (statusLower === 'in use') {
      color = 'processing';
      tooltipText = 'Equipment is currently in use';
    } else if (statusLower === 'maintenance') {
      color = 'warning';
      tooltipText = 'Equipment is under maintenance';
    } else if (statusLower === 'out of order') {
      color = 'error';
      tooltipText = 'Equipment is out of order';
    } else if (statusLower === 'decommissioned') {
      color = 'default';
      tooltipText = 'Equipment has been decommissioned';
    } else {
      color = 'default';
      tooltipText = status;
    }
  } else if (type === 'maintenance') {
    // Maintenance status colors
    if (statusLower === 'scheduled') {
      color = 'blue';
      tooltipText = 'Maintenance is scheduled';
    } else if (statusLower === 'in progress') {
      color = 'processing';
      tooltipText = 'Maintenance is in progress';
    } else if (statusLower === 'completed') {
      color = 'success';
      tooltipText = 'Maintenance has been completed';
    } else if (statusLower === 'cancelled') {
      color = 'default';
      tooltipText = 'Maintenance was cancelled';
    } else if (statusLower === 'overdue') {
      color = 'error';
      tooltipText = 'Maintenance is overdue';
    } else {
      color = 'default';
      tooltipText = status;
    }
  }

  const tag = <Tag color={color}>{status}</Tag>;

  if (showTooltip) {
    return <Tooltip title={tooltipText}>{tag}</Tooltip>;
  }

  return tag;
};

export default StatusTag;