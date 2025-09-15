import React from 'react';
import { LucideIcon, MoreHorizontal, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  href?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeVariants = {
  sm: 'col-span-1',
  md: 'col-span-2',
  lg: 'col-span-3',
  xl: 'col-span-4',
};

const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  icon: Icon,
  children,
  actions,
  className,
  loading = false,
  error,
  onRefresh,
  href,
  size = 'md',
}) => {
  const CardComponent = ({ children: cardChildren }: { children: React.ReactNode }) => (
    <Card className={cn(
      'hover:shadow-md transition-all duration-200',
      href && 'cursor-pointer hover:shadow-lg',
      className
    )}>
      {cardChildren}
    </Card>
  );

  const HeaderContent = () => (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
      <div className="flex items-center space-x-2">
        {Icon && (
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
            <Icon className="h-4 w-4 text-blue-600" />
          </div>
        )}
        <div>
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {href && (
          <Button variant="ghost" size="sm" asChild>
            <a href={href}>
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
        {actions}
      </div>
    </CardHeader>
  );

  const ContentSection = () => (
    <CardContent className="pt-0">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-red-600 mb-2">Error loading data</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh}>
              Try Again
            </Button>
          )}
        </div>
      ) : (
        children
      )}
    </CardContent>
  );

  if (href) {
    return (
      <div className={sizeVariants[size]}>
        <a href={href} className="block">
          <CardComponent>
            <HeaderContent />
            <ContentSection />
          </CardComponent>
        </a>
      </div>
    );
  }

  return (
    <div className={sizeVariants[size]}>
      <CardComponent>
        <HeaderContent />
        <ContentSection />
      </CardComponent>
    </div>
  );
};

export default DashboardWidget;