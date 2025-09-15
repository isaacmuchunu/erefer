import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    period: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

const colorVariants = {
  blue: 'border-blue-200 bg-blue-50 text-blue-600',
  green: 'border-green-200 bg-green-50 text-green-600',
  orange: 'border-orange-200 bg-orange-50 text-orange-600',
  red: 'border-red-200 bg-red-50 text-red-600',
  purple: 'border-purple-200 bg-purple-50 text-purple-600',
  gray: 'border-gray-200 bg-gray-50 text-gray-600',
};

const sizeVariants = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const iconSizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  onClick,
  className,
}) => {
  const isClickable = !!onClick;
  
  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-all duration-200',
        isClickable && 'cursor-pointer hover:shadow-lg',
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(sizeVariants[size])}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                {trend.isPositive !== false ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  trend.isPositive !== false ? 'text-green-600' : 'text-red-600'
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">{trend.period}</span>
              </div>
            )}
          </div>
          <div className={cn(
            'rounded-lg p-2 border',
            colorVariants[color]
          )}>
            <Icon className={cn(iconSizeVariants[size])} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;