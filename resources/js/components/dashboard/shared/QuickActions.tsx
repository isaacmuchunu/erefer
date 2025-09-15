import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Plus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  badge?: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  columns?: 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorVariants = {
  blue: {
    icon: 'text-blue-600 bg-blue-100',
    button: 'border-blue-200 hover:bg-blue-50',
  },
  green: {
    icon: 'text-green-600 bg-green-100',
    button: 'border-green-200 hover:bg-green-50',
  },
  orange: {
    icon: 'text-orange-600 bg-orange-100',
    button: 'border-orange-200 hover:bg-orange-50',
  },
  red: {
    icon: 'text-red-600 bg-red-100',
    button: 'border-red-200 hover:bg-red-50',
  },
  purple: {
    icon: 'text-purple-600 bg-purple-100',
    button: 'border-purple-200 hover:bg-purple-50',
  },
};

const gridVariants = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
};

const sizeVariants = {
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
};

const QuickActions: React.FC<QuickActionsProps> = ({
  title = 'Quick Actions',
  actions,
  columns = 2,
  size = 'md',
  className,
}) => {
  const renderAction = (action: QuickAction) => {
    const colors = colorVariants[action.color || 'blue'];
    const Icon = action.icon;

    const content = (
      <div className={cn(
        'flex items-center space-x-3 w-full text-left transition-all duration-200',
        sizeVariants[size]
      )}>
        <div className={cn('p-2 rounded-lg', colors.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{action.label}</span>
            {action.badge && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {action.badge}
              </span>
            )}
          </div>
          {action.description && (
            <p className="text-xs text-gray-500 mt-1">{action.description}</p>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
      </div>
    );

    if (action.href) {
      return (
        <a
          key={action.id}
          href={action.href}
          className={cn(
            'block rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200',
            colors.button,
            action.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {content}
        </a>
      );
    }

    return (
      <Button
        key={action.id}
        variant={action.variant || 'outline'}
        className={cn(
          'h-auto justify-start rounded-lg border',
          colors.button
        )}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        {content}
      </Button>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <CardTitle className="text-sm font-semibold flex items-center">
          <Plus className="h-4 w-4 mr-2 text-blue-600" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn('grid gap-3', gridVariants[columns])}>
          {actions.map(renderAction)}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;