/**
 * 高级配置组件 - 用于编辑界面的智能洞察Tab
 */

import React, { useState } from 'react';
import { Settings, User, FileText, BookOpen, Wrench, Users, CheckCircle, Brain, Sparkles } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

// 导入创建流程的配置组件
import PersonaConfig from '../../features/employee-creation/components/stages/advanced/PersonaConfig';
import PromptConfig from '../../features/employee-creation/components/stages/advanced/PromptConfig';
import KnowledgeConfig from '../../features/employee-creation/components/stages/advanced/KnowledgeConfig';
import ToolConfig from '../../features/employee-creation/components/stages/advanced/ToolConfig';
import MentorConfig from '../../features/employee-creation/components/stages/advanced/MentorConfig';

interface AdvancedConfigSectionProps {
  employee: DigitalEmployee;
  editedEmployee: DigitalEmployee | null;
  isEditing: boolean;
  onFieldChange: (field: keyof DigitalEmployee, value: any) => void;
}

// 高级配置Tab定义
interface AdvancedTab {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  isOptional: boolean;
  badge?: string;
}

const AdvancedConfigSection: React.FC<AdvancedConfigSectionProps> = ({
  employee,
  editedEmployee,
  isEditing,
  onFieldChange
}) => {
  // 当前活跃的Tab
  const [activeTab, setActiveTab] = useState<string>('persona');

  // 模拟高级配置数据结构 - 从员工数据中提取
  const getAdvancedConfig = () => {
    const currentEmployee = editedEmployee || employee;
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
      knowledge: {
        documents: { files: [], maxSize: 10485760, allowedFormats: ['.txt', '.md', '.pdf'] },
        faq: { items: currentEmployee.knowledgeBase?.faqItems || [], importSource: 'manual' as const },
        retention: { enabled: false, strategy: 'internalize' as const, updateFrequency: 'realtime' as const },
        knowledgeBase: { type: 'internal' as const, internalSources: [], externalAPIs: [] },
        knowledgeGraph: { enabled: false, autoGenerate: false, updateTrigger: 'manual' as const, visualization: false }
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

  // 检查各Tab的配置完成状态
  const getTabCompletionStatus = (tabId: string) => {
    const advancedConfig = getAdvancedConfig();

    switch (tabId) {
      case 'persona':
        return advancedConfig.persona?.systemPrompt?.length > 0;
      case 'prompt':
        return advancedConfig.prompt?.templates?.length > 0;
      case 'knowledge':
        return advancedConfig.knowledge?.faq?.items?.length > 0;
      case 'tools':
        return advancedConfig.tools?.selectedTools?.length > 0;
      case 'mentor':
        return advancedConfig.mentor?.enabled === true;
      default:
        return false;
    }
  };

  // Tab配置定义
  const advancedTabs: AdvancedTab[] = [
    {
      id: 'persona',
      title: '人设配置',
      description: '系统提示词、角色背景、行为约束',
      icon: User,
      component: PersonaConfig,
      isOptional: false
    },
    {
      id: 'prompt',
      title: 'Prompt配置',
      description: '模板管理、Slot注入、压缩策略',
      icon: FileText,
      component: PromptConfig,
      isOptional: true,
      badge: 'AI'
    },
    {
      id: 'knowledge',
      title: '知识配置',
      description: '文档上传、FAQ管理、知识图谱',
      icon: BookOpen,
      component: KnowledgeConfig,
      isOptional: true
    },
    {
      id: 'tools',
      title: '工具管理',
      description: '工具选择、权限配置、使用策略',
      icon: Wrench,
      component: ToolConfig,
      isOptional: true
    },
    {
      id: 'mentor',
      title: '导师机制',
      description: '导师配置、汇报设置、监督规则',
      icon: Users,
      component: MentorConfig,
      isOptional: true,
      badge: '实验性'
    }
  ];

  // 获取当前Tab配置
  const getCurrentTab = () => {
    return advancedTabs.find(tab => tab.id === activeTab) || advancedTabs[0];
  };

  const currentTab = getCurrentTab();
  const CurrentComponent = currentTab.component;

  // 处理配置更新
  const handleConfigChange = (configType: string, updates: any) => {
    // 这里需要将配置更新映射到员工数据结构
    // 实际项目中可能需要更复杂的映射逻辑
    if (isEditing && onFieldChange) {
      // 根据配置类型更新对应的员工字段
      switch (configType) {
        case 'persona':
          onFieldChange('persona', { ...employee.persona, ...updates });
          break;
        case 'prompt':
          onFieldChange('promptConfig', updates);
          break;
        case 'mentor':
          if (updates.enabled) {
            onFieldChange('mentorConfig', {
              mentorId: updates.mentor.id,
              mentorName: updates.mentor.name,
              reportingCycle: updates.reporting.schedule,
              reportingMethod: updates.reporting.method
            });
          } else {
            onFieldChange('mentorConfig', undefined);
          }
          break;
        // 其他配置类型...
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">智能洞察</h3>
        <div className="flex items-center gap-2">
          {isEditing && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑模式
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
            高级配置
          </span>
        </div>
      </div>

      <p className="text-gray-600 mb-6">
        深度配置数字员工的智能能力，包括Prompt工程、多领域管理、导师机制等高级功能。
      </p>

      {/* Tab导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {advancedTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="text-left">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-xs sm:text-sm">{tab.title}</span>
                    {getTabCompletionStatus(tab.id) && (
                      <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    )}
                    {tab.isOptional && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 sm:px-2 py-0.5 rounded-full hidden sm:inline-block">
                        可选
                      </span>
                    )}
                    {tab.badge && (
                      <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 hidden lg:block">
                    {tab.description}
                  </div>
                </div>

                {/* 活跃指示器 */}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab内容区域 */}
      <div className="bg-white">
        {/* 当前Tab头部 */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <currentTab.icon className="h-5 w-5 text-blue-600" />
            <h4 className="text-base font-semibold text-gray-900">{currentTab.title}</h4>
            {getTabCompletionStatus(currentTab.id) && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                已配置
              </span>
            )}
            {currentTab.badge && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                {currentTab.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-blue-700">{currentTab.description}</p>
        </div>

        {/* 当前Tab内容 */}
        <div className="px-2">
          {!isEditing ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">
                📖 查看模式：显示当前配置信息
              </p>
              <p className="text-xs text-gray-500">
                点击编辑按钮进入编辑模式来修改高级配置
              </p>
            </div>
          ) : (
            <CurrentComponent
              config={getAdvancedConfig()[activeTab as keyof typeof getAdvancedConfig]}
              onChange={(updates: any) => handleConfigChange(activeTab, updates)}
              showBatchActions={true}
            />
          )}
        </div>

        {/* Tab切换按钮 */}
        <div className="flex items-center justify-between px-2 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg mt-6 gap-2">
          <button
            onClick={() => {
              const currentIndex = advancedTabs.findIndex(t => t.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(advancedTabs[currentIndex - 1].id);
              }
            }}
            disabled={advancedTabs.findIndex(t => t.id === activeTab) === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              advancedTabs.findIndex(t => t.id === activeTab) === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="hidden sm:inline">← 上一个配置</span>
            <span className="sm:hidden">← 上一个</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {advancedTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  tab.id === activeTab
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={tab.title}
              />
            ))}
          </div>

          <button
            onClick={() => {
              const currentIndex = advancedTabs.findIndex(t => t.id === activeTab);
              if (currentIndex < advancedTabs.length - 1) {
                setActiveTab(advancedTabs[currentIndex + 1].id);
              }
            }}
            disabled={advancedTabs.findIndex(t => t.id === activeTab) === advancedTabs.length - 1}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              advancedTabs.findIndex(t => t.id === activeTab) === advancedTabs.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="hidden sm:inline">下一个配置 →</span>
            <span className="sm:hidden">下一个 →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedConfigSection;