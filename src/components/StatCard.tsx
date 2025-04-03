
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  variant = 'default',
}: StatCardProps) => {
  // Define variant styles
  const variantStyles = {
    default: '',
    success: 'border-finance-green',
    error: 'border-finance-red',
    warning: 'border-finance-yellow',
    info: 'border-finance-blue',
  };

  // Define icon colors
  const iconColors = {
    default: 'text-muted-foreground',
    success: 'text-finance-green',
    error: 'text-finance-red',
    warning: 'text-finance-yellow',
    info: 'text-finance-blue',
  };

  return (
    <Card className={cn('overflow-hidden', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className={cn('h-4 w-4', iconColors[variant])} />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium',
                trend.isPositive ? 'text-finance-green' : 'text-finance-red'
              )}
            >
              {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">desde o mês passado</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
