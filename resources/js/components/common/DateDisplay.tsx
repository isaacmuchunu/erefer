import React from 'react';
import { Typography, Tooltip } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface DateDisplayProps {
  date: string | Date | null | undefined;
  format?: string;
  defaultText?: string;
  showRelative?: boolean;
  showTooltip?: boolean;
  tooltipFormat?: string;
  className?: string;
  style?: React.CSSProperties;
}

const { Text } = Typography;

const DateDisplay: React.FC<DateDisplayProps> = ({
  date,
  format = 'MMM D, YYYY',
  defaultText = 'N/A',
  showRelative = false,
  showTooltip = true,
  tooltipFormat = 'MMMM D, YYYY h:mm A',
  className,
  style
}) => {
  if (!date) {
    return <Text type="secondary" className={className} style={style}>{defaultText}</Text>;
  }

  const dayjsDate = dayjs(date);
  
  if (!dayjsDate.isValid()) {
    return <Text type="secondary" className={className} style={style}>{defaultText}</Text>;
  }

  const formattedDate = dayjsDate.format(format);
  const relativeDate = dayjsDate.fromNow();
  const tooltipDate = dayjsDate.format(tooltipFormat);
  
  const displayText = showRelative ? relativeDate : formattedDate;
  
  if (showTooltip) {
    return (
      <Tooltip title={tooltipDate}>
        <Text className={className} style={style}>{displayText}</Text>
      </Tooltip>
    );
  }
  
  return <Text className={className} style={style}>{displayText}</Text>;
};

export default DateDisplay;