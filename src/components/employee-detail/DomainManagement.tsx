/**
 * 领域管理组件 - 专注于多领域路由配置和领域列表管理
 */

import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Settings,
  Eye,
  Edit2,
  Power,
  Copy,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  X
} from 'lucide-react';
import { DigitalEmployee, DomainConfig, MultiDomainConfig } from '../../types/employee';

interface DomainManagementProps {
  employee: DigitalEmployee;
  onEmployeeChange?: (employee: DigitalEmployee) => void;
}

const DomainManagement: React.FC<DomainManagementProps> = ({
  employee,
  onEmployeeChange
}) => {
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [showAddDomainModal, setShowAddDomainModal] = useState(false);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [editedConfig, setEditedConfig] = useState<any>(null);

  const multiDomainConfig = employee?.multiDomainConfig;
  const domains = multiDomainConfig?.domains || [];

  // 编辑操作
  const handleEditConfig = () => {
    setIsEditingConfig(true);
    setEditedConfig({
      enableMultiDomain: employee.enableMultiDomain,
      multiDomainConfig: { ...employee.multiDomainConfig }
    });
  };

  const handleSaveConfig = () => {
    if (editedConfig && onEmployeeChange) {
      onEmployeeChange({
        ...employee,
        enableMultiDomain: editedConfig.enableMultiDomain,
        multiDomainConfig: editedConfig.multiDomainConfig
      });
      setIsEditingConfig(false);
      setEditedConfig(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingConfig(false);
    setEditedConfig(null);
  };

  // 获取当前显示的数据
  const getCurrentConfig = () => {
    if (isEditingConfig && editedConfig) {
      return editedConfig;
    }
    return {
      enableMultiDomain: employee.enableMultiDomain,
      multiDomainConfig: employee.multiDomainConfig
    };
  };

  const currentConfig = getCurrentConfig();

  // 如果未启用多领域，显示空状态
  if (!currentConfig.enableMultiDomain) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="text-center py-12">
          <Layers className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">未启用多领域功能</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            该数字员工未启用多领域功能。多领域功能可以让员工根据不同的业务场景智能切换专业能力和配置。
          </p>
          <button
            onClick={() => {
              const newEmployee = {
                ...employee,
                enableMultiDomain: true,
                multiDomainConfig: {
                  enabled: true,
                  domains: [],
                  routingStrategy: 'hybrid' as const,
                  maxConcurrentDomains: 3,
                  routingConfig: {
                    keywordSensitivity: 0.7,
                    semanticThreshold: 0.6,
                    contextWeight: 0.8
                  }
                }
              };
              onEmployeeChange?.(newEmployee);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Layers className="h-4 w-4 mr-2" />
            启用多领域功能
          </button>
        </div>
      </div>
    );
  }

  // 领域卡片组件
  const DomainCard: React.FC<{ domain: DomainConfig }> = ({ domain }) => {
    const isSelected = selectedDomainId === domain.id;

    return (
      <div
        className={`group relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
          isSelected
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
        onClick={() => setSelectedDomainId(domain.id)}
      >
        {/* 头部：图标、名称、状态 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-2xl flex-shrink-0">{domain.icon}</span>
            <div className="min-w-0 flex-1">
              <h4 className={`font-medium truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                {domain.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                {domain.description}
              </p>
            </div>
          </div>

          {/* 状态标识 */}
          <div className="flex items-center gap-1">
            {domain.isDefault && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                默认
              </span>
            )}
            <div className={`w-3 h-3 rounded-full ${
              domain.enabled ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          </div>
        </div>

        {/* 权重条 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">权重</span>
            <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
              {domain.weight}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                  : 'bg-gradient-to-r from-gray-400 to-gray-500'
              }`}
              style={{ width: `${domain.weight}%` }}
            />
          </div>
        </div>

        {/* 关键词 */}
        {domain.keywords && domain.keywords.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">关键词</div>
            <div className="flex flex-wrap gap-1">
              {domain.keywords.slice(0, 3).map((keyword, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {keyword}
                </span>
              ))}
              {domain.keywords.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{domain.keywords.length - 3}更多
                </span>
              )}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit domain:', domain.id);
            }}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="编辑"
          >
            <Edit2 className="h-3 w-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Duplicate domain:', domain.id);
            }}
            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
            title="复制"
          >
            <Copy className="h-3 w-3" />
          </button>
          {!domain.isDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                console.log('Delete domain:', domain.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title="删除"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 多领域配置总览 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">多领域配置</h3>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              已启用
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isEditingConfig ? (
              <>
                <button
                  onClick={handleSaveConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  保存
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  取消
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  编辑配置
                </button>
                <button
                  onClick={() => setShowAddDomainModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  添加领域
                </button>
              </>
            )}
          </div>
        </div>

        {/* 配置概览 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">领域数量</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">{currentConfig.multiDomainConfig?.domains?.length || 0}</div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">已启用</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {currentConfig.multiDomainConfig?.domains?.filter(d => d.enabled).length || 0}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">路由策略</span>
            </div>
            <div className="text-sm font-medium text-gray-800">
              {currentConfig.multiDomainConfig?.routingStrategy || 'hybrid'}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">并发限制</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {currentConfig.multiDomainConfig?.maxConcurrentDomains || 3}
            </div>
          </div>
        </div>

        {/* 路由配置 */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">路由配置</h4>
            {isEditingConfig && (
              <span className="text-xs text-blue-600">编辑模式</span>
            )}
          </div>

          {isEditingConfig ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">路由策略</label>
                <select
                  value={editedConfig?.multiDomainConfig?.routingStrategy || 'hybrid'}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    multiDomainConfig: {
                      ...editedConfig.multiDomainConfig,
                      routingStrategy: e.target.value
                    }
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="hybrid">混合模式</option>
                  <option value="weighted">权重模式</option>
                  <option value="semantic">语义模式</option>
                  <option value="keyword">关键词模式</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">并发限制</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={editedConfig?.multiDomainConfig?.maxConcurrentDomains || 3}
                  onChange={(e) => setEditedConfig({
                    ...editedConfig,
                    multiDomainConfig: {
                      ...editedConfig.multiDomainConfig,
                      maxConcurrentDomains: parseInt(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">关键词敏感度</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editedConfig?.multiDomainConfig?.routingConfig?.keywordSensitivity || 0.7}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      multiDomainConfig: {
                        ...editedConfig.multiDomainConfig,
                        routingConfig: {
                          ...editedConfig.multiDomainConfig?.routingConfig,
                          keywordSensitivity: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-center text-gray-600">
                    {Math.round((editedConfig?.multiDomainConfig?.routingConfig?.keywordSensitivity || 0.7) * 100)}%
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">语义阈值</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editedConfig?.multiDomainConfig?.routingConfig?.semanticThreshold || 0.6}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      multiDomainConfig: {
                        ...editedConfig.multiDomainConfig,
                        routingConfig: {
                          ...editedConfig.multiDomainConfig?.routingConfig,
                          semanticThreshold: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-center text-gray-600">
                    {Math.round((editedConfig?.multiDomainConfig?.routingConfig?.semanticThreshold || 0.6) * 100)}%
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">上下文权重</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={editedConfig?.multiDomainConfig?.routingConfig?.contextWeight || 0.8}
                    onChange={(e) => setEditedConfig({
                      ...editedConfig,
                      multiDomainConfig: {
                        ...editedConfig.multiDomainConfig,
                        routingConfig: {
                          ...editedConfig.multiDomainConfig?.routingConfig,
                          contextWeight: parseFloat(e.target.value)
                        }
                      }
                    })}
                    className="w-full"
                  />
                  <div className="text-xs text-center text-gray-600">
                    {Math.round((editedConfig?.multiDomainConfig?.routingConfig?.contextWeight || 0.8) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">关键词敏感度: </span>
                <span className="font-medium text-gray-900">
                  {(currentConfig.multiDomainConfig?.routingConfig?.keywordSensitivity || 0.7) * 100}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">语义阈值: </span>
                <span className="font-medium text-gray-900">
                  {(currentConfig.multiDomainConfig?.routingConfig?.semanticThreshold || 0.6) * 100}%
                </span>
              </div>
              <div>
                <span className="text-gray-600">上下文权重: </span>
                <span className="font-medium text-gray-900">
                  {(currentConfig.multiDomainConfig?.routingConfig?.contextWeight || 0.8) * 100}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 领域列表 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">领域列表</h4>

        {(currentConfig.multiDomainConfig?.domains?.length || 0) === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Layers className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">暂无配置领域</h4>
            <p className="text-gray-600 mb-4">开始添加第一个业务领域来配置多领域功能</p>
            <button
              onClick={() => setShowAddDomainModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              添加领域
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(currentConfig.multiDomainConfig?.domains || []).map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        )}
      </div>

      {/* 选中领域的详情 */}
      {selectedDomainId && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">领域详情</h4>
          {(() => {
            const selectedDomain = (currentConfig.multiDomainConfig?.domains || []).find(d => d.id === selectedDomainId);
            if (!selectedDomain) return null;

            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">基本信息</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">名称:</span>
                        <span className="font-medium">{selectedDomain.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">权重:</span>
                        <span className="font-medium">{selectedDomain.weight}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">状态:</span>
                        <span className={`font-medium ${
                          selectedDomain.enabled ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {selectedDomain.enabled ? '已启用' : '已禁用'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">语义配置</h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-gray-600 mb-1 block">关键词</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDomain.keywords?.map((keyword, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-600 mb-1 block">语义主题</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDomain.semanticTopics?.map((topic, index) => (
                            <span key={index} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">描述</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedDomain.description}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <Settings className="h-5 w-5" />
                    <span className="font-medium">高级配置</span>
                  </div>
                  <p className="text-sm text-blue-600">
                    请在“配置中心”Tab中管理该领域的人设、Prompt、工具等详细配置。
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default DomainManagement;