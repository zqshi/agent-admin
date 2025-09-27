/**
 * 路由策略配置组件 - 多领域模式的路由策略管理
 * 支持关键词、语义、权重、混合等路由策略
 */

import React, { useState } from 'react';
import {
  GitBranch,
  Edit3,
  Save,
  X,
  Plus,
  Minus,
  Target,
  Layers,
  Settings,
  BarChart3,
  Hash,
  Brain,
  Shuffle,
  ArrowRight
} from 'lucide-react';
import type { DigitalEmployee, MultiDomainConfig, RoutingStrategy } from '../../types/employee';
import { DataSourceIndicator } from '../common';

interface RoutingStrategySectionProps {
  employee: DigitalEmployee;
}

const RoutingStrategySection: React.FC<RoutingStrategySectionProps> = ({
  employee
}) => {
  // 独立编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      console.log('保存路由策略:', internalEditedEmployee);
      // 这里应该调用API保存数据
      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  // 获取当前显示的员工数据
  const getCurrentEmployee = (): DigitalEmployee => {
    return internalEditedEmployee || employee;
  };

  const currentEmployee = getCurrentEmployee();

  // 检查是否启用多领域模式
  const isMultiDomainEnabled = currentEmployee.enableMultiDomain && currentEmployee.multiDomainConfig?.enabled;

  // 更新多领域配置字段
  const updateMultiDomainField = (field: keyof MultiDomainConfig, value: any) => {
    if (internalEditedEmployee && internalEditedEmployee.multiDomainConfig) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        multiDomainConfig: {
          ...internalEditedEmployee.multiDomainConfig,
          [field]: value
        }
      });
    }
  };

  // 更新路由配置
  const updateRoutingConfig = (field: string, value: any) => {
    if (internalEditedEmployee && internalEditedEmployee.multiDomainConfig) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        multiDomainConfig: {
          ...internalEditedEmployee.multiDomainConfig,
          routingConfig: {
            ...internalEditedEmployee.multiDomainConfig.routingConfig,
            [field]: value
          }
        }
      });
    }
  };

  // 路由策略选项
  const routingStrategies: { value: RoutingStrategy; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
    {
      value: 'keyword',
      label: '关键词路由',
      description: '基于关键词匹配进行领域路由',
      icon: Hash
    },
    {
      value: 'semantic',
      label: '语义路由',
      description: '基于语义理解进行智能路由',
      icon: Brain
    },
    {
      value: 'weighted',
      label: '权重路由',
      description: '基于领域权重进行路由分配',
      icon: BarChart3
    },
    {
      value: 'hybrid',
      label: '混合路由',
      description: '综合多种策略进行最优路由',
      icon: Shuffle
    }
  ];

  if (!isMultiDomainEnabled) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <GitBranch className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">路由策略</h3>
          <DataSourceIndicator type="config" variant="dot" size="sm" />
        </div>

        <div className="text-center py-8 text-gray-500">
          <Layers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">单领域模式</p>
          <p className="text-sm mt-1">路由策略仅在多领域模式下可用</p>
          <p className="text-xs mt-2 text-gray-400">
            启用多领域模式后可配置智能路由策略
          </p>
        </div>
      </div>
    );
  }

  const multiDomainConfig = currentEmployee.multiDomainConfig!;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 标题和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">路由策略配置</h3>
          <DataSourceIndicator type="config" variant="dot" size="sm" />
          {isInternalEditing && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑模式
            </span>
          )}
        </div>

        {!isInternalEditing ? (
          <button
            onClick={handleInternalEdit}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Edit3 className="h-4 w-4" />
            编辑
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleInternalCancel}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              取消
            </button>
            <button
              onClick={handleInternalSave}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-6">
        配置多领域模式下的智能路由策略，确保用户请求能够准确路由到最合适的领域处理。
      </p>

      <div className="space-y-6">
        {/* 基础路由设置 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-4">基础设置</h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">默认领域</label>
              {isInternalEditing ? (
                <select
                  value={multiDomainConfig.defaultDomainId || ''}
                  onChange={(e) => updateMultiDomainField('defaultDomainId', e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">无默认领域</option>
                  {multiDomainConfig.domains?.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.icon} {domain.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="px-3 py-2 bg-white border border-blue-200 rounded-md">
                  <span className="text-gray-900">
                    {multiDomainConfig.defaultDomainId ? (
                      (() => {
                        const defaultDomain = multiDomainConfig.domains?.find(d => d.id === multiDomainConfig.defaultDomainId);
                        return defaultDomain ? `${defaultDomain.icon} ${defaultDomain.name}` : '未设置';
                      })()
                    ) : '无默认领域'}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">最大并发领域数</label>
              {isInternalEditing ? (
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={multiDomainConfig.maxConcurrentDomains}
                  onChange={(e) => updateMultiDomainField('maxConcurrentDomains', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="px-3 py-2 bg-white border border-blue-200 rounded-md">
                  <span className="text-gray-900">{multiDomainConfig.maxConcurrentDomains}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 路由策略选择 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">路由策略</h4>
          <div className="grid gap-4">
            {routingStrategies.map((strategy) => {
              const Icon = strategy.icon;
              const isSelected = multiDomainConfig.routingStrategy === strategy.value;

              return (
                <div
                  key={strategy.value}
                  className={`border rounded-lg p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {isInternalEditing ? (
                        <input
                          type="radio"
                          name="routingStrategy"
                          value={strategy.value}
                          checked={isSelected}
                          onChange={() => updateMultiDomainField('routingStrategy', strategy.value)}
                          className="mt-1"
                        />
                      ) : (
                        <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
                          isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />}
                        </div>
                      )}
                      <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                      <div>
                        <h5 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {strategy.label}
                        </h5>
                        <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {strategy.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        已选择
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 高级路由参数 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-4">高级参数</h4>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                关键词敏感度
                <span className="text-gray-500 ml-1">({multiDomainConfig.routingConfig.keywordSensitivity})</span>
              </label>
              {isInternalEditing ? (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={multiDomainConfig.routingConfig.keywordSensitivity}
                  onChange={(e) => updateRoutingConfig('keywordSensitivity', parseFloat(e.target.value))}
                  className="w-full"
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${multiDomainConfig.routingConfig.keywordSensitivity * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语义阈值
                <span className="text-gray-500 ml-1">({multiDomainConfig.routingConfig.semanticThreshold})</span>
              </label>
              {isInternalEditing ? (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={multiDomainConfig.routingConfig.semanticThreshold}
                  onChange={(e) => updateRoutingConfig('semanticThreshold', parseFloat(e.target.value))}
                  className="w-full"
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${multiDomainConfig.routingConfig.semanticThreshold * 100}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上下文权重
                <span className="text-gray-500 ml-1">({multiDomainConfig.routingConfig.contextWeight})</span>
              </label>
              {isInternalEditing ? (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={multiDomainConfig.routingConfig.contextWeight}
                  onChange={(e) => updateRoutingConfig('contextWeight', parseFloat(e.target.value))}
                  className="w-full"
                />
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${multiDomainConfig.routingConfig.contextWeight * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 领域权重分布 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-4">领域权重分布</h4>
          <div className="space-y-3">
            {multiDomainConfig.domains?.map((domain, index) => (
              <div key={domain.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-lg">{domain.icon}</span>
                  <span className="font-medium text-gray-900">{domain.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    domain.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {domain.enabled ? '启用' : '禁用'}
                  </span>
                </div>

                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm text-gray-600 min-w-fit">权重:</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${domain.weight}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 min-w-fit">{domain.weight}%</span>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                <p>暂无配置领域</p>
              </div>
            )}
          </div>
        </div>

        {/* 路由规则预览 */}
        {!isInternalEditing && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3">当前路由规则</h4>
            <div className="text-sm text-green-800">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4" />
                <span>
                  策略: {routingStrategies.find(s => s.value === multiDomainConfig.routingStrategy)?.label}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4" />
                <span>
                  默认路由: {multiDomainConfig.defaultDomainId ?
                    multiDomainConfig.domains?.find(d => d.id === multiDomainConfig.defaultDomainId)?.name :
                    '智能分配'
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4" />
                <span>
                  并发处理: 最多 {multiDomainConfig.maxConcurrentDomains} 个领域
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutingStrategySection;