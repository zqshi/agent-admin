/**
 * 能力配置组件 - 整合Prompt工程、工具管理、导师机制
 * 用于能力配置标签页，支持独立编辑模式
 */

import React, { useState } from 'react';
import { Brain, Edit3, Save, X, Settings, Wrench, Users, Plus, Minus, FileText, Zap, Shield, Database, Lock, Layers, ChevronDown, ChevronUp, ArrowDown } from 'lucide-react';
import type { DigitalEmployee, PromptEngineeringConfig, MentorConfiguration } from '../../types/employee';
import { DataSourceIndicator } from '../common';

interface CapabilityConfigSectionProps {
  employee: DigitalEmployee;
  selectedDomainId?: string;
  domainConfig?: any; // 当前选中领域的配置
  activeTab?: string; // 新增：指定要显示的具体配置Tab
  editedEmployee?: DigitalEmployee | null;
  isEditing?: boolean;
  onFieldChange?: (field: any, value: any) => void;
}

const CapabilityConfigSection: React.FC<CapabilityConfigSectionProps> = ({
  employee,
  selectedDomainId = 'global',
  domainConfig,
  activeTab,
  editedEmployee,
  isEditing,
  onFieldChange
}) => {
  // 独立编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 当前活跃的配置Tab
  const [activeCapabilityTab, setActiveCapabilityTab] = useState<string>('prompt');

  // 判断是否为领域配置
  const isDomainConfig = selectedDomainId !== 'global';

  // 获取当前领域信息
  const getCurrentDomain = () => {
    if (!isDomainConfig || !employee.multiDomainConfig?.domains) return null;
    return employee.multiDomainConfig.domains.find(d => d.id === selectedDomainId) || null;
  };

  const currentDomain = getCurrentDomain();

  // 配置继承状态
  const [showInheritanceInfo, setShowInheritanceInfo] = useState(false);

  // 检查字段是否被领域配置覆盖
  const isFieldOverridden = (fieldPath: string) => {
    if (!isDomainConfig || !currentDomain?.domainConfig) return false;

    const pathParts = fieldPath.split('.');
    let obj = currentDomain.domainConfig;

    for (const part of pathParts) {
      if (obj && obj[part] !== undefined) {
        obj = obj[part];
      } else {
        return false;
      }
    }

    return obj !== undefined;
  };

  // 配置来源指示器组件
  const ConfigSourceIndicator: React.FC<{ fieldPath: string; label?: string }> = ({ fieldPath, label }) => {
    if (!isDomainConfig) return null;

    const isOverridden = isFieldOverridden(fieldPath);

    return (
      <div className="flex items-center gap-1">
        {isOverridden ? (
          <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
            <Layers className="h-3 w-3" />
            领域覆盖
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            <ArrowDown className="h-3 w-3" />
            继承全局
          </span>
        )}
      </div>
    );
  };

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      console.log('保存能力配置:', internalEditedEmployee);
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

  // 获取当前配置数据（支持领域配置覆盖）
  const getCurrentConfig = () => {
    const baseEmployee = getCurrentEmployee();

    if (isDomainConfig && currentDomain?.domainConfig) {
      // 领域配置：合并全局配置和领域覆盖配置
      return {
        promptConfig: {
          ...baseEmployee.promptConfig,
          ...currentDomain.domainConfig.promptConfig
        },
        permissions: {
          ...baseEmployee.permissions,
          ...currentDomain.domainConfig.permissions
        },
        mentorConfig: currentDomain.domainConfig.mentorConfig || baseEmployee.mentorConfig
      };
    } else {
      // 全局配置：直接使用员工配置
      return {
        promptConfig: baseEmployee.promptConfig,
        permissions: baseEmployee.permissions,
        mentorConfig: baseEmployee.mentorConfig
      };
    }
  };

  const currentEmployee = getCurrentEmployee();
  const currentConfig = getCurrentConfig();

  // 更新字段值
  const updateField = (field: keyof DigitalEmployee, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [field]: value
      });
    }
  };

  // 更新嵌套字段值
  const updateNestedField = (parentField: keyof DigitalEmployee, childField: string, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [parentField]: {
          ...(internalEditedEmployee[parentField] as any),
          [childField]: value
        }
      });
    }
  };

  // 能力配置Tab定义
  const capabilityTabs = [
    {
      id: 'prompt',
      title: 'Prompt工程',
      icon: FileText,
      description: '提示词模板、压缩策略、错误处理'
    },
    {
      id: 'tools',
      title: '工具管理',
      icon: Wrench,
      description: '工具权限、使用策略、配置管理'
    },
    {
      id: 'permissions',
      title: '权限安全',
      icon: Settings,
      description: '资源访问、知识权限、安全策略'
    },
    {
      id: 'mentor',
      title: '导师机制',
      icon: Users,
      description: '导师配置、汇报设置、监督规则'
    }
  ];

  // 渲染Prompt工程配置
  const renderPromptConfig = () => {
    const promptConfig = currentConfig.promptConfig || {
      mode: 'simple' as const,
      basePrompt: '',
      slots: [],
      templates: []
    };

    return (
      <div className="space-y-6">
        {/* 基础配置 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">配置模式</label>
            {isInternalEditing ? (
              <select
                value={promptConfig.mode}
                onChange={(e) => updateNestedField('promptConfig', 'mode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="simple">简单模式</option>
                <option value="advanced">高级模式</option>
              </select>
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-gray-900">{promptConfig.mode === 'simple' ? '简单模式' : '高级模式'}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">模板数量</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">{promptConfig.templates?.length || 0} 个模板</span>
            </div>
          </div>
        </div>

        {/* 基础提示词 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">基础提示词</label>
            <ConfigSourceIndicator fieldPath="promptConfig.basePrompt" />
          </div>
          {isInternalEditing ? (
            <textarea
              value={promptConfig.basePrompt}
              onChange={(e) => updateNestedField('promptConfig', 'basePrompt', e.target.value)}
              placeholder="输入基础提示词..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md min-h-[100px]">
              <span className="text-gray-900 whitespace-pre-wrap">{promptConfig.basePrompt || '未设置基础提示词'}</span>
            </div>
          )}
        </div>

        {/* 快速设置 */}
        {promptConfig.quickSettings && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-3">快速设置</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">语调</label>
                {isInternalEditing ? (
                  <select
                    value={promptConfig.quickSettings?.tone || 'professional'}
                    onChange={(e) => updateNestedField('promptConfig', 'quickSettings', {
                      ...promptConfig.quickSettings,
                      tone: e.target.value
                    })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="friendly">友好</option>
                    <option value="professional">专业</option>
                    <option value="casual">随意</option>
                    <option value="formal">正式</option>
                  </select>
                ) : (
                  <span className="text-sm text-blue-800">{
                    promptConfig.quickSettings?.tone === 'friendly' ? '友好' :
                    promptConfig.quickSettings?.tone === 'professional' ? '专业' :
                    promptConfig.quickSettings?.tone === 'casual' ? '随意' : '正式'
                  }</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">回复长度</label>
                {isInternalEditing ? (
                  <select
                    value={promptConfig.quickSettings?.responseLength || 'moderate'}
                    onChange={(e) => updateNestedField('promptConfig', 'quickSettings', {
                      ...promptConfig.quickSettings,
                      responseLength: e.target.value
                    })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="brief">简洁</option>
                    <option value="moderate">适中</option>
                    <option value="detailed">详细</option>
                  </select>
                ) : (
                  <span className="text-sm text-blue-800">{
                    promptConfig.quickSettings?.responseLength === 'brief' ? '简洁' :
                    promptConfig.quickSettings?.responseLength === 'moderate' ? '适中' : '详细'
                  }</span>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-blue-700 mb-1">创造性</label>
                {isInternalEditing ? (
                  <select
                    value={promptConfig.quickSettings?.creativity || 'balanced'}
                    onChange={(e) => updateNestedField('promptConfig', 'quickSettings', {
                      ...promptConfig.quickSettings,
                      creativity: e.target.value
                    })}
                    className="w-full px-2 py-1 border border-blue-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="conservative">保守</option>
                    <option value="balanced">平衡</option>
                    <option value="creative">创新</option>
                  </select>
                ) : (
                  <span className="text-sm text-blue-800">{
                    promptConfig.quickSettings?.creativity === 'conservative' ? '保守' :
                    promptConfig.quickSettings?.creativity === 'balanced' ? '平衡' : '创新'
                  }</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染工具管理配置
  const renderToolsConfig = () => {
    const permissions = currentConfig.permissions || {
      allowedTools: [],
      resourceAccess: [],
      knowledgeManagement: { canSelfLearn: false, canModifyKnowledge: false }
    };

    return (
      <div className="space-y-6">
        {/* 允许的工具 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-gray-700">允许使用的工具</label>
              <ConfigSourceIndicator fieldPath="permissions.allowedTools" />
            </div>
            {isInternalEditing && (
              <button
                onClick={() => {
                  const newTools = [...permissions.allowedTools, ''];
                  updateNestedField('permissions', 'allowedTools', newTools);
                }}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                添加工具
              </button>
            )}
          </div>

          <div className="space-y-2">
            {permissions.allowedTools.length > 0 ? (
              permissions.allowedTools.map((tool, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                  {isInternalEditing ? (
                    <>
                      <input
                        type="text"
                        value={tool}
                        onChange={(e) => {
                          const newTools = [...permissions.allowedTools];
                          newTools[index] = e.target.value;
                          updateNestedField('permissions', 'allowedTools', newTools);
                        }}
                        placeholder="输入工具名称"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newTools = permissions.allowedTools.filter((_, i) => i !== index);
                          updateNestedField('permissions', 'allowedTools', newTools);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <span className="text-gray-900">{tool || '未设置'}</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm italic">暂未配置工具权限</div>
            )}
          </div>
        </div>

        {/* 工具使用策略 */}
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-3">工具使用策略</h4>
          <div className="space-y-2 text-sm text-purple-700">
            <div>• 工具调用需要实时权限验证</div>
            <div>• 支持工具使用频率限制</div>
            <div>• 自动记录工具使用日志</div>
            <div>• 异常调用自动中断并报告</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染权限安全配置
  const renderPermissionsConfig = () => {
    const permissions = currentConfig.permissions || {
      allowedTools: [],
      resourceAccess: [],
      knowledgeManagement: { canSelfLearn: false, canModifyKnowledge: false }
    };

    return (
      <div className="space-y-6">
        {/* 资源访问权限 */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            资源访问权限
          </h4>
          <div className="space-y-3">
            {permissions.resourceAccess && permissions.resourceAccess.length > 0 ? (
              permissions.resourceAccess.map((resource, index) => (
                <div key={index} className="bg-white p-3 rounded border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{resource.resourceName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      resource.accessLevel === 'admin' ? 'bg-red-100 text-red-700' :
                      resource.accessLevel === 'write' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {resource.accessLevel}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    类型: {resource.resourceType}
                  </div>
                  {resource.restrictions && resource.restrictions.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      限制: {resource.restrictions.join(', ')}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-sm italic">暂未配置资源访问权限</div>
            )}
          </div>
        </div>

        {/* 知识管理权限 */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4" />
            知识管理权限
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">允许自主学习</span>
              <span className={`text-sm ${permissions.knowledgeManagement.canSelfLearn ? 'text-green-600' : 'text-gray-500'}`}>
                {permissions.knowledgeManagement.canSelfLearn ? '已启用' : '已禁用'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">允许修改知识库</span>
              <span className={`text-sm ${permissions.knowledgeManagement.canModifyKnowledge ? 'text-green-600' : 'text-gray-500'}`}>
                {permissions.knowledgeManagement.canModifyKnowledge ? '已启用' : '已禁用'}
              </span>
            </div>
          </div>
        </div>

        {/* 安全策略 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4" />
            安全策略
          </h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• 工具使用需经过权限验证</div>
            <div>• 敏感资源访问记录审计日志</div>
            <div>• 知识库修改需要管理员审批</div>
            <div>• 自动检测异常操作并报告</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染导师机制配置
  const renderMentorConfig = () => {
    const mentorConfig = currentConfig.mentorConfig || null;

    return (
      <div className="space-y-6">
        {/* 导师开关 */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">启用导师机制</h4>
            <p className="text-sm text-gray-600">为数字员工配置导师进行指导和监督</p>
          </div>
          {isInternalEditing ? (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!mentorConfig}
                onChange={(e) => {
                  if (e.target.checked) {
                    updateField('mentorConfig', {
                      mentorId: '',
                      mentorName: '',
                      reportingCycle: 'weekly' as const,
                      reportingMethod: 'im' as const
                    });
                  } else {
                    updateField('mentorConfig', undefined);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          ) : (
            <span className={`text-sm ${mentorConfig ? 'text-green-600' : 'text-gray-500'}`}>
              {mentorConfig ? '已启用' : '已禁用'}
            </span>
          )}
        </div>

        {/* 导师配置详情 */}
        {mentorConfig && (
          <div className="bg-purple-50 p-4 rounded-lg space-y-4">
            <h4 className="font-medium text-purple-900">导师配置</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">导师ID</label>
                {isInternalEditing ? (
                  <input
                    type="text"
                    value={mentorConfig.mentorId}
                    onChange={(e) => updateNestedField('mentorConfig', 'mentorId', e.target.value)}
                    placeholder="输入导师ID"
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-md">
                    <span className="text-gray-900">{mentorConfig.mentorId || '未设置'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">导师姓名</label>
                {isInternalEditing ? (
                  <input
                    type="text"
                    value={mentorConfig.mentorName}
                    onChange={(e) => updateNestedField('mentorConfig', 'mentorName', e.target.value)}
                    placeholder="输入导师姓名"
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                ) : (
                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-md">
                    <span className="text-gray-900">{mentorConfig.mentorName || '未设置'}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">汇报周期</label>
                {isInternalEditing ? (
                  <select
                    value={mentorConfig.reportingCycle}
                    onChange={(e) => updateNestedField('mentorConfig', 'reportingCycle', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="daily">每日</option>
                    <option value="weekly">每周</option>
                    <option value="monthly">每月</option>
                    <option value="quarterly">每季度</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-md">
                    <span className="text-gray-900">{
                      mentorConfig.reportingCycle === 'daily' ? '每日' :
                      mentorConfig.reportingCycle === 'weekly' ? '每周' :
                      mentorConfig.reportingCycle === 'monthly' ? '每月' : '每季度'
                    }</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-700 mb-2">汇报方式</label>
                {isInternalEditing ? (
                  <select
                    value={mentorConfig.reportingMethod}
                    onChange={(e) => updateNestedField('mentorConfig', 'reportingMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="im">即时消息</option>
                    <option value="document">文档</option>
                  </select>
                ) : (
                  <div className="px-3 py-2 bg-white border border-purple-200 rounded-md">
                    <span className="text-gray-900">{mentorConfig.reportingMethod === 'im' ? '即时消息' : '文档'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染Tab内容
  const renderTabContent = () => {
    const tabToRender = activeTab || activeCapabilityTab;

    switch (tabToRender) {
      case 'prompt':
        return renderPromptConfig();
      case 'tools':
        return renderToolsConfig();
      case 'permissions':
        return renderPermissionsConfig();
      case 'mentor':
        return renderMentorConfig();
      default:
        return renderPromptConfig();
    }
  };

  // 如果指定了activeTab，直接渲染对应内容，不显示Tab导航，但包含编辑功能
  if (activeTab) {
    const tabInfo = capabilityTabs.find(tab => tab.id === activeTab);

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        {/* 标题和编辑按钮 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {tabInfo && <tabInfo.icon className="h-6 w-6 text-blue-600" />}
            <h3 className="text-lg font-semibold text-gray-900">
              {tabInfo?.title || '配置'}
              {isDomainConfig && ` - ${currentDomain?.name || '未知'}领域`}
            </h3>
            <DataSourceIndicator type="config" variant="dot" size="sm" />
            {isDomainConfig && (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                领域特定
              </span>
            )}
            {!isDomainConfig && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                全局配置
              </span>
            )}
            {isInternalEditing && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
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

        {/* 配置内容 */}
        <div>
          {renderTabContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 标题和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {isDomainConfig ? `${currentDomain?.name || '未知'} 领域能力配置` : '全局能力配置'}
          </h3>
          <DataSourceIndicator type="config" variant="dot" size="sm" />
          {isDomainConfig && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              领域特定
            </span>
          )}
          {!isDomainConfig && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              全局配置
            </span>
          )}
          {currentlyEditing && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑模式
            </span>
          )}
        </div>

        {!currentlyEditing ? (
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
        {isDomainConfig
          ? `配置 ${currentDomain?.name || '当前'} 领域的专属能力，包括领域特定的提示词工程、工具权限和导师监督机制。这些配置将覆盖或补充全局配置。`
          : '配置数字员工的全局核心能力，作为所有领域的基础配置。包括提示词工程、工具权限和导师监督机制。'
        }
      </p>

      {/* 配置继承信息（仅领域配置时显示） */}
      {isDomainConfig && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <button
            onClick={() => setShowInheritanceInfo(!showInheritanceInfo)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-600" />
              <span className="font-medium text-gray-900">配置继承信息</span>
              <span className="text-xs text-gray-500">
                显示当前领域配置与全局配置的关系
              </span>
            </div>
            {showInheritanceInfo ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {showInheritanceInfo && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-100 border-2 border-purple-500 rounded"></div>
                  <span className="text-gray-700">领域覆盖配置</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-gray-100 border-2 border-gray-400 rounded"></div>
                  <span className="text-gray-700">继承全局配置</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-100 border-2 border-orange-500 rounded"></div>
                  <span className="text-gray-700">需要配置</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                领域配置会覆盖全局配置，未配置的字段将自动继承全局设置。
              </p>
            </div>
          )}
        </div>
      )}

      {/* 能力配置Tab导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0">
          {capabilityTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeCapabilityTab;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveCapabilityTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <div className="text-left">
                  <div className="font-medium">{tab.title}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab内容 */}
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CapabilityConfigSection;