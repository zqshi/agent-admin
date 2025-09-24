/**
 * 统一配置中心 - 整合配置管理与智能洞察功能
 * 消除功能重复，提供一致的配置体验
 */

import React, { useState } from 'react';
import {
  Settings,
  User,
  Shield,
  Brain,
  Users,
  FileText,
  Wrench,
  GitBranch,
  Lightbulb,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  History
} from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

// 导入原有的配置组件
import BasicInfoSection from './BasicInfoSection';
import PersonaConfig from '../../features/employee-creation/components/stages/advanced/PersonaConfig';
import PromptConfig from '../../features/employee-creation/components/stages/advanced/PromptConfig';
import ToolConfig from '../../features/employee-creation/components/stages/advanced/ToolConfig';
import MentorConfig from '../../features/employee-creation/components/stages/advanced/MentorConfig';
import { ConfigVersionManager } from './ConfigVersionManager';
import EditableConfigSection from './EditableConfigSection';

interface ConfigurationCenterProps {
  employee: DigitalEmployee;
  getStatusBadge: (status: string) => React.ReactNode;
}

// 配置区域定义
interface ConfigSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'basic' | 'intelligent' | 'management';
  isCompleted?: boolean;
  isOptional?: boolean;
  badge?: string;
}

const ConfigurationCenter: React.FC<ConfigurationCenterProps> = ({
  employee,
  getStatusBadge
}) => {
  const [activeSection, setActiveSection] = useState<string>('basic-info');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    basic: true,
    intelligent: true,
    management: true
  });

  // 检查配置完成状态
  const getCompletionStatus = (sectionId: string): boolean => {
    const currentEmployee = employee;

    switch (sectionId) {
      case 'basic-info':
        return !!(currentEmployee.name && currentEmployee.department);
      case 'persona':
        return !!(currentEmployee.persona?.systemPrompt && currentEmployee.persona?.personality);
      case 'prompt':
        return !!(currentEmployee.promptConfig?.templates?.length || currentEmployee.promptConfig?.slots?.length);
      case 'permissions-tools':
        return currentEmployee.permissions?.allowedTools?.length > 0;
      case 'mentor':
        return !!currentEmployee.mentorConfig;
      case 'version-management':
        return true; // 版本管理始终可用
      case 'smart-suggestions':
        return true; // 智能建议始终可用
      default:
        return false;
    }
  };

  // 配置区域定义
  const configSections: ConfigSection[] = [
    // 基础配置
    {
      id: 'basic-info',
      title: '基础信息',
      description: '员工基本信息、状态管理',
      icon: User,
      category: 'basic',
      isCompleted: getCompletionStatus('basic-info')
    },

    // 智能配置
    {
      id: 'persona',
      title: '人设定义',
      description: '角色定义、系统提示词、性格特征',
      icon: User,
      category: 'intelligent',
      isCompleted: getCompletionStatus('persona'),
      badge: 'AI'
    },
    {
      id: 'prompt',
      title: 'Prompt工程',
      description: 'Prompt模板、Slot管理、压缩策略',
      icon: FileText,
      category: 'intelligent',
      isCompleted: getCompletionStatus('prompt'),
      badge: '技术'
    },
    {
      id: 'permissions-tools',
      title: '权限与工具',
      description: '访问权限、工具配置、安全策略',
      icon: Shield,
      category: 'intelligent',
      isCompleted: getCompletionStatus('permissions-tools')
    },
    {
      id: 'mentor',
      title: '导师机制',
      description: '导师配置、汇报设置、监督规则',
      icon: Users,
      category: 'intelligent',
      isCompleted: getCompletionStatus('mentor'),
      isOptional: true,
      badge: '实验性'
    },

    // 管理功能
    {
      id: 'version-management',
      title: '版本管理',
      description: '配置历史、版本对比、回滚操作',
      icon: GitBranch,
      category: 'management'
    },
    {
      id: 'smart-suggestions',
      title: '智能建议',
      description: 'AI驱动的优化建议和洞察分析',
      icon: Lightbulb,
      category: 'management',
      badge: 'Beta'
    }
  ];

  // 分类配置
  const categories = {
    basic: { title: '基础配置', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    intelligent: { title: '智能配置', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    management: { title: '配置管理', color: 'text-green-600', bgColor: 'bg-green-50' }
  };

  // 切换分类展开状态
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // 获取当前配置数据（用于高级配置）
  const getAdvancedConfig = () => {
    const currentEmployee = employee;
    return {
      persona: {
        systemPrompt: currentEmployee.persona?.systemPrompt || '',
        characterBackground: '',
        constraints: [],
        examples: currentEmployee.persona?.exampleDialogues || []
      },
      prompt: {
        templates: currentEmployee.promptConfig?.templates || [],
        slots: currentEmployee.promptConfig?.slots || [],
        compression: currentEmployee.promptConfig?.compression || {
          enabled: false,
          trigger: 'tokenLimit' as const,
          threshold: 2048,
          strategy: 'summary' as const,
          preserveKeys: []
        },
        errorHandling: currentEmployee.promptConfig?.errorHandling || {
          onSlotMissing: 'useDefault' as const,
          onCompressionFail: 'retry' as const
        }
      },
      tools: {
        recommendedTools: [],
        selectedTools: currentEmployee.permissions?.allowedTools || [],
        usagePolicy: { requireConfirmation: false, loggingLevel: 'basic' as const }
      },
      mentor: {
        enabled: !!currentEmployee.mentorConfig,
        mentor: currentEmployee.mentorConfig ? {
          id: currentEmployee.mentorConfig.mentorId,
          name: currentEmployee.mentorConfig.mentorName,
          role: 'supervisor'
        } : { id: '', name: '', role: '' },
        reporting: {
          enabled: !!currentEmployee.mentorConfig,
          schedule: currentEmployee.mentorConfig?.reportingCycle || 'weekly' as const,
          method: currentEmployee.mentorConfig?.reportingMethod || 'email' as const,
          template: ''
        },
        supervision: { reviewDecisions: false, approvalRequired: [], escalationRules: [] }
      }
    };
  };

  // 处理配置更新 - 临时禁用，等待重构为独立编辑状态
  const handleConfigChange = (configType: string, updates: any) => {
    // TODO: 重构为独立的编辑状态管理
    console.log('配置更新:', configType, updates);
  };

  // 渲染配置内容
  const renderSectionContent = () => {
    const currentEmployee = employee;

    switch (activeSection) {
      case 'basic-info':
        return (
          <BasicInfoSection
            employee={employee}
            getStatusBadge={getStatusBadge}
          />
        );

      case 'persona':
        return (
          <EditableConfigSection
            title="人设定义"
            description="设定数字员工的角色特征、性格和行为模式"
            icon={User}
            iconColor="text-purple-600"
            onSave={async (data) => {
              // TODO: 实现保存persona配置的API调用
              console.log('保存persona配置:', data);
            }}
            rightActions={
              <button
                onClick={() => setActiveSection('prompt')}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <FileText className="h-4 w-4" />
                查看Prompt配置
              </button>
            }
          >
            {(isEditing, onSave) => (
              <div className={isEditing ? '' : 'pointer-events-none opacity-75'}>
                <PersonaConfig
                  config={getAdvancedConfig().persona}
                  onChange={(updates) => {
                    if (isEditing) {
                      onSave(updates);
                    }
                  }}
                />
              </div>
            )}
          </EditableConfigSection>
        );

      case 'prompt':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="text-lg font-semibold">Prompt工程</h4>
                  <p className="text-sm text-gray-600">管理提示词模板、变量注入和压缩策略</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* 当前人设摘要 */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm">
                  <User className="h-4 w-4" />
                  <span>当前人设: {employee.persona?.systemPrompt ? '已配置' : '未配置'}</span>
                </div>
                <button
                  onClick={() => setActiveSection('persona')}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm"
                >
                  <User className="h-4 w-4" />
                  查看人设配置
                </button>
              </div>
            </div>
            <PromptConfig
              config={getAdvancedConfig().prompt}
              onChange={(updates) => handleConfigChange('prompt', updates)}
            />
          </div>
        );

      case 'permissions-tools':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-green-600" />
              权限与工具管理
            </h4>
            <ToolConfig
              config={getAdvancedConfig().tools}
              onChange={(updates) => handleConfigChange('tools', updates)}
            />
          </div>
        );

      case 'mentor':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-600" />
              导师机制配置
            </h4>
            <MentorConfig
              config={getAdvancedConfig().mentor}
              onChange={(updates) => handleConfigChange('mentor', updates)}
            />
          </div>
        );

      case 'version-management':
        return (
          <ConfigVersionManager
            employee={employee}
            onVersionRestore={(version) => {
              console.log('恢复版本:', version);
            }}
            onSuggestionApply={(suggestion) => {
              console.log('应用建议:', suggestion);
            }}
          />
        );

      case 'smart-suggestions':
        return (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <Lightbulb className="h-6 w-6 text-yellow-500" />
              <div>
                <h4 className="text-lg font-semibold">智能优化建议</h4>
                <p className="text-sm text-gray-600">基于AI分析的个性化优化建议</p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-700">
                💡 智能建议功能已集成到版本管理中，请切换到"版本管理"查看详细的优化建议。
              </p>
            </div>

            <button
              onClick={() => setActiveSection('version-management')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <GitBranch className="h-4 w-4" />
              前往版本管理
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">请从左侧选择配置项目</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">配置中心</h3>
          <p className="text-sm text-gray-600">统一管理数字员工的所有配置项</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* 左侧导航 */}
        <div className="col-span-4 space-y-2">
          {Object.entries(categories).map(([categoryKey, categoryConfig]) => {
            const sectionsInCategory = configSections.filter(section => section.category === categoryKey);
            const isExpanded = expandedCategories[categoryKey];

            return (
              <div key={categoryKey} className="border border-gray-200 rounded-lg">
                {/* 分类标题 */}
                <button
                  onClick={() => toggleCategory(categoryKey)}
                  className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-t-lg ${
                    !isExpanded ? 'rounded-b-lg' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${categoryConfig.color}`}>
                      {categoryConfig.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({sectionsInCategory.length})
                    </span>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`} />
                </button>

                {/* 分类下的配置项 */}
                {isExpanded && (
                  <div className="border-t border-gray-200">
                    {sectionsInCategory.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 transition-colors ${
                          activeSection === section.id
                            ? 'bg-blue-50 border-r-2 border-blue-500'
                            : ''
                        }`}
                      >
                        <section.icon className={`h-4 w-4 ${
                          activeSection === section.id
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${
                              activeSection === section.id
                                ? 'text-blue-900'
                                : 'text-gray-700'
                            }`}>
                              {section.title}
                            </span>
                            {section.badge && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                {section.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {section.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {section.isCompleted && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {section.isOptional && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              可选
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 右侧内容区 */}
        <div className="col-span-8">
          <div className="min-h-[600px]">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* 配置完成度指示器 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">配置完成度</span>
          </div>
          <div className="flex items-center gap-4">
            {configSections.filter(s => !s.isOptional).map((section) => (
              <div key={section.id} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  section.isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <span className="text-xs text-gray-500">{section.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationCenter;