import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  data: ChartData[];
  type: 'bar' | 'line' | 'pie' | 'area';
  height?: number;
  color?: string;
  showTrend?: boolean;
  trendValue?: number;
  trendPeriod?: string;
  className?: string;
}

const COLORS = {
  primary: '#307BC4',
  secondary: '#274760',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
};

const PIE_COLORS = ['#307BC4', '#274760', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  subtitle,
  data,
  type,
  height = 300,
  color = COLORS.primary,
  showTrend = false,
  trendValue,
  trendPeriod,
  className,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={2}
                fill={color}
                fillOpacity={0.1}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (type) {
      case 'bar':
        return BarChart3;
      case 'line':
      case 'area':
        return Activity;
      case 'pie':
        return BarChart3;
      default:
        return BarChart3;
    }
  };

  const Icon = getChartIcon();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>
        {showTrend && trendValue !== undefined && (
          <div className="flex items-center space-x-1">
            {trendValue >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-sm font-medium ${
              trendValue >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </span>
            {trendPeriod && (
              <span className="text-xs text-gray-500">{trendPeriod}</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-sm text-gray-600">No data available</p>
            <p className="text-xs text-gray-500 mt-1">Data will appear here when available</p>
          </div>
        ) : (
          renderChart()
        )}
      </CardContent>
    </Card>
  );
};

export default ChartWidget;