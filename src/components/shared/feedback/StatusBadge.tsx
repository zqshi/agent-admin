/**
 * 通用状态标签组件
 */

import React from 'react';

export type StatusVariant =
  | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  | 'active' | 'disabled' | 'retired' | 'pending' | 'processing';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  children?: React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'md',
  icon: Icon,
  className = '',
  children
}) => {
  // 自动推断变体
  const getVariant = (): StatusVariant => {
    if (variant) return variant;

    const statusLower = status.toLowerCase();

    // 员工状态映射
    if (statusLower === 'active' || statusLower === '启用') return 'active';
    if (statusLower === 'disabled' || statusLower === '禁用') return 'disabled';
    if (statusLower === 'retired' || statusLower === '停用') return 'retired';

    // 通用状态映射
    if (statusLower.includes('success') || statusLower.includes('完成')) return 'success';
    if (statusLower.includes('error') || statusLower.includes('失败')) return 'error';
    if (statusLower.includes('warning') || statusLower.includes('警告')) return 'warning';
    if (statusLower.includes('processing') || statusLower.includes('处理中')) return 'processing';
    if (statusLower.includes('pending') || statusLower.includes('待处理')) return 'pending';

    return 'neutral';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-2.5 py-1 text-sm';
    }
  };

  const getVariantClasses = () => {
    const inferredVariant = getVariant();

    switch (inferredVariant) {
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
      case 'disabled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'retired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const displayText = children || status;

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {Icon && <Icon className={getIconSize()} />}
      {displayText}
    </span>
  );
};

export default StatusBadge;