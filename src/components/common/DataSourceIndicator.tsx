/**
 * 数据来源指示器组件
 * 用于明确标识数据来源类型，帮助用户区分配置数据、运营数据和AI生成数据
 */

import React from 'react';
import { Settings, Database, Brain, Activity, Clock, User } from 'lucide-react';

// 数据来源类型
export type DataSourceType =
  | 'config'        // 配置数据（创建时设置）
  | 'operational'   // 运营数据（运营过程中沉淀）
  | 'ai-generated'  // AI生成数据（智能分析结果）
  | 'system'        // 系统数据（自动生成）
  | 'user-input'    // 用户输入数据
  | 'mixed';        // 混合数据

// 显示大小
export type DataSourceSize = 'sm' | 'md' | 'lg';

// 显示样式
export type DataSourceVariant = 'badge' | 'inline' | 'tooltip';

export interface DataSourceIndicatorProps {
  /** 数据来源类型 */
  type: DataSourceType;
  /** 显示大小 */
  size?: DataSourceSize;
  /** 显示样式 */
  variant?: DataSourceVariant;
  /** 最后更新时间 */
  lastUpdated?: string | Date;
  /** 自定义标签文本 */
  label?: string;
  /** 是否显示图标 */
  showIcon?: boolean;
  /** 是否显示时间戳 */
  showTimestamp?: boolean;
  /** 额外的CSS类名 */
  className?: string;
  /** 点击事件处理 */
  onClick?: () => void;
}

const DataSourceIndicator: React.FC<DataSourceIndicatorProps> = ({
  type,
  size = 'md',
  variant = 'badge',
  lastUpdated,
  label,
  showIcon = true,
  showTimestamp = false,
  className = '',
  onClick
}) => {
  // 数据源配置
  const sourceConfig = {
    config: {
      icon: Settings,
      label: label || '配置数据',
      color: 'blue',
      description: '创建时设置的配置信息',
      bgClass: 'bg-blue-50',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      badgeClass: 'bg-blue-100 text-blue-800'
    },
    operational: {
      icon: Activity,
      label: label || '运营数据',
      color: 'green',
      description: '运营过程中沉淀的数据',
      bgClass: 'bg-green-50',
      textClass: 'text-green-700',
      borderClass: 'border-green-200',
      badgeClass: 'bg-green-100 text-green-800'
    },
    'ai-generated': {
      icon: Brain,
      label: label || 'AI分析',
      color: 'purple',
      description: 'AI智能分析生成的内容',
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-700',
      borderClass: 'border-purple-200',
      badgeClass: 'bg-purple-100 text-purple-800'
    },
    system: {
      icon: Database,
      label: label || '系统数据',
      color: 'gray',
      description: '系统自动生成的数据',
      bgClass: 'bg-gray-50',
      textClass: 'text-gray-700',
      borderClass: 'border-gray-200',
      badgeClass: 'bg-gray-100 text-gray-800'
    },
    'user-input': {
      icon: User,
      label: label || '用户输入',
      color: 'amber',
      description: '用户手动输入的数据',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200',
      badgeClass: 'bg-amber-100 text-amber-800'
    },
    mixed: {
      icon: Database,
      label: label || '混合数据',
      color: 'indigo',
      description: '包含多种来源的混合数据',
      bgClass: 'bg-indigo-50',
      textClass: 'text-indigo-700',
      borderClass: 'border-indigo-200',
      badgeClass: 'bg-indigo-100 text-indigo-800'
    }
  };

  const config = sourceConfig[type];
  const Icon = config.icon;

  // 大小配置
  const sizeConfig = {
    sm: {
      iconSize: 'h-3 w-3',
      textSize: 'text-xs',
      padding: 'px-1.5 py-0.5',
      gap: 'gap-1'
    },
    md: {
      iconSize: 'h-4 w-4',
      textSize: 'text-sm',
      padding: 'px-2 py-1',
      gap: 'gap-1.5'
    },
    lg: {
      iconSize: 'h-5 w-5',
      textSize: 'text-base',
      padding: 'px-3 py-1.5',
      gap: 'gap-2'
    }
  };

  const sizeClasses = sizeConfig[size];

  // 格式化时间戳
  const formatTimestamp = (timestamp: string | Date) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return '刚刚更新';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}小时前更新`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}天前更新`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 渲染徽章样式
  const renderBadge = () => (
    <span
      className={`inline-flex items-center ${sizeClasses.gap} ${sizeClasses.padding} rounded-full font-medium ${config.badgeClass} ${sizeClasses.textSize} ${className} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
      title={`${config.description}${lastUpdated ? ` • ${formatTimestamp(lastUpdated)}` : ''}`}
    >
      {showIcon && <Icon className={sizeClasses.iconSize} />}
      <span>{config.label}</span>
      {showTimestamp && lastUpdated && (
        <>
          <span className="text-gray-400">•</span>
          <Clock className="h-3 w-3" />
          <span className="text-xs opacity-75">
            {formatTimestamp(lastUpdated)}
          </span>
        </>
      )}
    </span>
  );

  // 渲染内联样式
  const renderInline = () => (
    <span
      className={`inline-flex items-center ${sizeClasses.gap} ${config.textClass} ${sizeClasses.textSize} ${className} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
      title={`${config.description}${lastUpdated ? ` • ${formatTimestamp(lastUpdated)}` : ''}`}
    >
      {showIcon && <Icon className={sizeClasses.iconSize} />}
      <span>{config.label}</span>
      {showTimestamp && lastUpdated && (
        <span className="text-gray-500 text-xs ml-1">
          ({formatTimestamp(lastUpdated)})
        </span>
      )}
    </span>
  );

  // 渲染工具提示样式
  const renderTooltip = () => (
    <div
      className={`group relative inline-flex items-center ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {showIcon && (
        <Icon className={`${sizeClasses.iconSize} ${config.textClass} opacity-60 hover:opacity-100 transition-opacity`} />
      )}

      {/* 悬停提示 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        <div>{config.description}</div>
        {lastUpdated && (
          <div className="text-gray-300 text-xs mt-1">
            {formatTimestamp(lastUpdated)}
          </div>
        )}
        {/* 箭头 */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );

  // 根据样式类型渲染不同的组件
  switch (variant) {
    case 'inline':
      return renderInline();
    case 'tooltip':
      return renderTooltip();
    case 'badge':
    default:
      return renderBadge();
  }
};

export default DataSourceIndicator;