/**
 * 通用指标卡片组件
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    label?: string;
    isPositive?: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  description,
  icon: Icon,
  trend,
  color = 'blue',
  size = 'md',
  loading = false,
  onClick,
  className = ''
}) => {
  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      red: 'bg-red-50 text-red-600',
      gray: 'bg-gray-50 text-gray-600'
    };
    return colors[color];
  };

  const getIconColorClasses = () => {
    const colors = {
      blue: 'text-blue-500',
      green: 'text-green-500',
      purple: 'text-purple-500',
      yellow: 'text-yellow-500',
      red: 'text-red-500',
      gray: 'text-gray-500'
    };
    return colors[color];
  };

  const getValueColorClasses = () => {
    const colors = {
      blue: 'text-blue-900',
      green: 'text-green-900',
      purple: 'text-purple-900',
      yellow: 'text-yellow-900',
      red: 'text-red-900',
      gray: 'text-gray-900'
    };
    return colors[color];
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-6 w-6',
          value: 'text-lg',
          title: 'text-xs',
          description: 'text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'h-10 w-10',
          value: 'text-3xl',
          title: 'text-base',
          description: 'text-sm'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-8 w-8',
          value: 'text-2xl',
          title: 'text-sm',
          description: 'text-xs'
        };
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend.value < 0) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    if (trend.isPositive !== undefined) {
      return trend.isPositive ? 'text-green-600' : 'text-red-600';
    }

    return trend.value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const sizeClasses = getSizeClasses();

  if (loading) {
    return (
      <div className={`${getColorClasses()} rounded-lg ${sizeClasses.container} ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-8 bg-gray-300 rounded w-1/2 mb-1"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        ${getColorClasses()} rounded-lg ${sizeClasses.container}
        ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={`${sizeClasses.title} font-medium`}>
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <p className={`${sizeClasses.value} font-bold ${getValueColorClasses()}`}>
              {formatValue(value)}
            </p>
            {unit && (
              <span className={`${sizeClasses.description} ${getValueColorClasses()}`}>
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <Icon className={`${sizeClasses.icon} ${getIconColorClasses()}`} />
        )}
      </div>

      {(description || trend) && (
        <div className="mt-2 flex items-center justify-between">
          {description && (
            <p className={`${sizeClasses.description} mt-1`}>
              {description}
            </p>
          )}

          {trend && (
            <div className={`flex items-center gap-1 ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className={`${sizeClasses.description} font-medium`}>
                {Math.abs(trend.value)}%
                {trend.label && (
                  <span className="text-gray-600 ml-1">{trend.label}</span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;