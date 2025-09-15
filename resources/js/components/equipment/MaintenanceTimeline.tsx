import React from 'react';
import { Timeline, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, ToolOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface MaintenanceRecord {
  id: number;
  equipment_id: number;
  maintenance_date: string;
  maintenance_type: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  performed_by: string | null;
  notes: string | null;
  completion_date: string | null;
  cost: number | null;
  parts_used: any[] | null;
  downtime_hours: number | null;
}

interface MaintenanceTimelineProps {
  maintenanceHistory: MaintenanceRecord[];
}

const MaintenanceTimeline: React.FC<MaintenanceTimelineProps> = ({ maintenanceHistory }) => {
  if (!maintenanceHistory || maintenanceHistory.length === 0) {
    return <div className="text-center py-4">No maintenance history available</div>;
  }

  // Sort maintenance records by date (newest first)
  const sortedHistory = [...maintenanceHistory].sort((a, b) => {
    return dayjs(b.maintenance_date).valueOf() - dayjs(a.maintenance_date).valueOf();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'in_progress':
        return <ToolOutlined style={{ color: '#1890ff' }} />;
      case 'scheduled':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'cancelled':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return <ToolOutlined />;
    }
  };

  const getMaintenanceTypeLabel = (type: string) => {
    const typeMap: Record<string, { color: string; text: string }> = {
      routine: { color: 'blue', text: 'Routine' },
      preventive: { color: 'green', text: 'Preventive' },
      corrective: { color: 'orange', text: 'Corrective' },
      calibration: { color: 'purple', text: 'Calibration' },
      inspection: { color: 'cyan', text: 'Inspection' },
    };
    
    const { color, text } = typeMap[type] || { color: 'default', text: type.charAt(0).toUpperCase() + type.slice(1) };
    return <Tag color={color}>{text}</Tag>;
  };

  return (
    <Timeline mode="left">
      {sortedHistory.map((record) => {
        const date = dayjs(record.maintenance_date).format('MMM D, YYYY');
        const completionDate = record.completion_date 
          ? dayjs(record.completion_date).format('MMM D, YYYY')
          : null;

        return (
          <Timeline.Item 
            key={record.id} 
            dot={getStatusIcon(record.status)}
            label={date}
          >
            <div>
              <strong>
                {getMaintenanceTypeLabel(record.maintenance_type)}
                {record.status === 'completed' && completionDate && (
                  <Tooltip title="Completion Date">
                    <Tag color="success" className="ml-2">Completed: {completionDate}</Tag>
                  </Tooltip>
                )}
              </strong>
              {record.performed_by && (
                <div>Performed by: {record.performed_by}</div>
              )}
              {record.notes && (
                <div className="text-gray-600">{record.notes}</div>
              )}
              {record.cost && (
                <div>Cost: ${record.cost.toFixed(2)}</div>
              )}
              {record.downtime_hours && (
                <div>Downtime: {record.downtime_hours} hours</div>
              )}
            </div>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};

export default MaintenanceTimeline;