import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  className?: string;
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, icon: Icon, trend, trendValue, color = 'blue', className, ...props }, ref) => {
    const iconColorClasses = {
      blue: 'bg-primary-50 text-primary-600',
      green: 'bg-success-50 text-success-600',
      red: 'bg-error-50 text-error-600',
      yellow: 'bg-warning-50 text-warning-600',
      purple: 'bg-purple-50 text-purple-600'
    };

    const trendColorClasses = {
      up: 'text-success-600',
      down: 'text-error-600'
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