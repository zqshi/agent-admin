import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'success' | 'error' | 'neutral';
  className?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, icon: Icon, trend, trendValue, color = 'neutral', className, ...props }, ref) => {
    const iconColorClasses = {
      primary: 'bg-gray-100 text-primary',
      success: 'bg-gray-100 text-success',
      error: 'bg-gray-100 text-error',
      neutral: 'bg-gray-100 text-gray-600'
    };

    const trendColorClasses = {
      up: 'text-success',
      down: 'text-error'
    };

    return (
      <div
        ref={ref}
        className={cn('metric-card', className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="metric-title">{title}</p>
            <div className="flex items-end gap-2">
              <p className="metric-value">{value}</p>
              {trend && trendValue && (
                <div className={cn('metric-trend', trendColorClasses[trend])}>
                  {trend === 'up' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{trendValue}</span>
                </div>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn('rounded-xl p-3', iconColorClasses[color])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </div>
    );
  }
);

MetricCard.displayName = 'MetricCard';

export { MetricCard };