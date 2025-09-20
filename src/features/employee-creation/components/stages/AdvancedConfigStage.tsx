/**
 * 高级配置阶段组件 - Tab导航版本
 */

import React, { useState } from 'react';
import { Settings, User, FileText, BookOpen, Wrench, Users, CheckCircle } from 'lucide-react';
import { useCreationStore } from '../../stores/creationStore';
import PersonaConfig from './advanced/PersonaConfig';
import PromptConfig from './advanced/PromptConfig';
import KnowledgeConfig from './advanced/KnowledgeConfig';
import ToolConfig from './advanced/ToolConfig';
import MentorConfig from './advanced/MentorConfig';

// Tab配置类型
interface ConfigTab {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
  isOptional: boolean;
  badge?: string;
}

const AdvancedConfigStage: React.FC = () => {
  // 当前活跃的Tab
  const [activeTab, setActiveTab] = useState<string>('persona');
  const { advancedConfig } = useCreationStore();

  // 检查各Tab的配置完成状态
  const getTabCompletionStatus = (tabId: string) => {
    if (!advancedConfig) return false;

    switch (tabId) {
      case 'persona':
        return advancedConfig.persona?.systemPrompt?.length > 0;
      case 'prompt':
        return advancedConfig.prompt?.templates?.length > 0;
      case 'knowledge':
        return advancedConfig.knowledge?.documents?.files?.length > 0 ||
               advancedConfig.knowledge?.faq?.items?.length > 0;
      case 'tools':
        return advancedConfig.tools?.selectedTools?.length > 0;
      case 'mentor':
        return advancedConfig.mentor?.enabled === true;
      default:
        return false;
    }
  };

  // Tab配置定义
  const configTabs: ConfigTab[] = [
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
      isOptional: true
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
      isOptional: true
    }
  ];

  // 获取当前Tab配置
  const getCurrentTab = () => {
    return configTabs.find(tab => tab.id === activeTab) || configTabs[0];
  };

  const currentTab = getCurrentTab();
  const CurrentComponent = currentTab.component;

  return (
    <div className="max-w-6xl mx-auto">
      {/* 头部信息 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="h-6 w-6 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">高级配置</h3>
        </div>
        <p className="text-gray-600">
          根据需要配置数字员工的高级功能。可选配置不会影响基本功能的使用。
        </p>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {configTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 sm:gap-3 px-3 sm:px-6 py-3 sm:py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-purple-500 text-purple-600 bg-purple-50'
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
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab内容区域 */}
      <div className="bg-white">
        {/* 当前Tab头部 */}
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2">
            <currentTab.icon className="h-5 w-5 text-purple-600" />
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
          <p className="text-sm text-gray-600 mt-1">{currentTab.description}</p>
        </div>

        {/* 当前Tab内容 */}
        <div className="px-3 pb-3">
          <CurrentComponent />
        </div>

        {/* Tab切换按钮 */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50 gap-2">
          <button
            onClick={() => {
              const currentIndex = configTabs.findIndex(t => t.id === activeTab);
              if (currentIndex > 0) {
                setActiveTab(configTabs[currentIndex - 1].id);
              }
            }}
            disabled={configTabs.findIndex(t => t.id === activeTab) === 0}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              configTabs.findIndex(t => t.id === activeTab) === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="hidden sm:inline">← 上一个配置</span>
            <span className="sm:hidden">← 上一个</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2">
            {configTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-colors ${
                  tab.id === activeTab
                    ? 'bg-purple-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={tab.title}
              />
            ))}
          </div>

          <button
            onClick={() => {
              const currentIndex = configTabs.findIndex(t => t.id === activeTab);
              if (currentIndex < configTabs.length - 1) {
                setActiveTab(configTabs[currentIndex + 1].id);
              }
            }}
            disabled={configTabs.findIndex(t => t.id === activeTab) === configTabs.length - 1}
            className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm ${
              configTabs.findIndex(t => t.id === activeTab) === configTabs.length - 1
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

export default AdvancedConfigStage;