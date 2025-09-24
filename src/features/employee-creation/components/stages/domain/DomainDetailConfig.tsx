/**
 * 领域详细配置组件
 */

import React, { useState } from 'react';
import { Edit2, Save, RotateCcw, User, FileText, BookOpen, Wrench, Users, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import PersonaConfig from '../advanced/PersonaConfig';
import PromptConfig from '../advanced/PromptConfig';
import KnowledgeConfig from '../advanced/KnowledgeConfig';
import ToolConfig from '../advanced/ToolConfig';
import MentorConfig from '../advanced/MentorConfig';
import type { DomainConfig } from '../../../types';

interface DomainDetailConfigProps {
  domain: DomainConfig;
  configStatus: {
    completed: number;
    total: number;
    percentage: number;
  };
}

// Tab配置类型
interface ConfigTab {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  isOptional: boolean;
}

const DomainDetailConfig: React.FC<DomainDetailConfigProps> = ({
  domain,
  configStatus
}) => {
  const {
    updateDomain,
    updateDomainPersona,
    updateDomainPrompt,
    updateDomainKnowledge,
    updateDomainTools,
    updateDomainMentor
  } = useCreationStore();

  const [activeTab, setActiveTab] = useState<string>('basic');
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [showToast, setShowToast] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const [basicData, setBasicData] = useState({
    name: domain.name,
    description: domain.description,
    icon: domain.icon,
    weight: domain.weight,
    keywords: domain.keywords?.join(', ') || '',
    semanticTopics: domain.semanticTopics?.join(', ') || ''
  });

  // 显示toast提示
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 3000);
  };

  // Tab配置定义
  const configTabs: ConfigTab[] = [
    {
      id: 'basic',
      title: '基础设置',
      description: '领域名称、描述、权重和路由设置',
      icon: Edit2,
      component: () => null, // 基础设置直接在组件中实现
      isOptional: false
    },
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

  // 检查各Tab的配置完成状态
  const getTabCompletionStatus = (tabId: string) => {
    switch (tabId) {
      case 'basic':
        return domain.name?.trim() && domain.description?.trim();
      case 'persona':
        return domain.advancedConfig.persona?.systemPrompt?.length > 0;
      case 'prompt':
        return domain.advancedConfig.prompt?.templates?.length > 0;
      case 'knowledge':
        return domain.advancedConfig.knowledge?.documents?.files?.length > 0 ||
               domain.advancedConfig.knowledge?.faq?.items?.length > 0;
      case 'tools':
        return domain.advancedConfig.tools?.selectedTools?.length > 0;
      case 'mentor':
        return domain.advancedConfig.mentor?.enabled === true;
      default:
        return false;
    }
  };

  // 保存基础设置
  const handleSaveBasic = () => {
    updateDomain(domain.id, {
      name: basicData.name,
      description: basicData.description,
      icon: basicData.icon,
      weight: basicData.weight,
      keywords: basicData.keywords.split(',').map(k => k.trim()).filter(k => k),
      semanticTopics: basicData.semanticTopics.split(',').map(t => t.trim()).filter(t => t)
    });
    setIsEditingBasic(false);
  };

  // 重置基础设置
  const handleResetBasic = () => {
    setBasicData({
      name: domain.name,
      description: domain.description,
      icon: domain.icon,
      weight: domain.weight,
      keywords: domain.keywords?.join(', ') || '',
      semanticTopics: domain.semanticTopics?.join(', ') || ''
    });
    setIsEditingBasic(false);
  };

  // 获取当前Tab
  const getCurrentTab = () => {
    return configTabs.find(tab => tab.id === activeTab) || configTabs[0];
  };

  const currentTab = getCurrentTab();

  // 渲染基础设置内容
  const renderBasicConfig = () => (
    <div className="space-y-6">
      {/* 基本信息 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">基本信息</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">领域名称</label>
            {isEditingBasic ? (
              <input
                type="text"
                value={basicData.name}
                onChange={(e) => setBasicData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入领域名称"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {domain.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">领域图标</label>
            {isEditingBasic ? (
              <input
                type="text"
                value={basicData.icon}
                onChange={(e) => setBasicData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入Emoji图标"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                {domain.icon} {domain.icon}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">领域描述</label>
            {isEditingBasic ? (
              <textarea
                value={basicData.description}
                onChange={(e) => setBasicData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="详细描述这个领域的职责和特点"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
                {domain.description || '暂无描述'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              领域权重 ({basicData.weight}%)
            </label>
            {isEditingBasic ? (
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={basicData.weight}
                  onChange={(e) => setBasicData(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2">
                <div className="w-full h-2 bg-gray-200 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                    style={{ width: `${domain.weight}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 路由设置 */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900">智能路由设置</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">关键词</label>
            {isEditingBasic ? (
              <textarea
                value={basicData.keywords}
                onChange={(e) => setBasicData(prev => ({ ...prev, keywords: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入关键词，用逗号分隔，如：客服,咨询,投诉"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
                {domain.keywords?.join(', ') || '暂未配置'}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              用户输入包含这些关键词时，优先路由到此领域
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">语义主题</label>
            {isEditingBasic ? (
              <textarea
                value={basicData.semanticTopics}
                onChange={(e) => setBasicData(prev => ({ ...prev, semanticTopics: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="输入英文主题，用逗号分隔，如：customer service,support"
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[80px]">
                {domain.semanticTopics?.join(', ') || '暂未配置'}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              用于语义相似度匹配，提高路由准确性
            </p>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      {isEditingBasic ? (
        <div className="flex gap-3">
          <button
            onClick={handleSaveBasic}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            保存设置
          </button>
          <button
            onClick={handleResetBasic}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            取消
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditingBasic(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          编辑基础设置
        </button>
      )}
    </div>
  );

  // 渲染高级配置内容
  const renderAdvancedConfig = () => {
    const { component: CurrentComponent } = currentTab;

    if (activeTab === 'basic') {
      return renderBasicConfig();
    }

    if (!CurrentComponent) return null;

    const configKey = activeTab as keyof typeof domain.advancedConfig;
    const currentConfig = domain.advancedConfig[configKey];

    const updateMethods = {
      persona: updateDomainPersona,
      prompt: updateDomainPrompt,
      knowledge: updateDomainKnowledge,
      tools: updateDomainTools,
      mentor: updateDomainMentor
    };

    return (
      <div className="space-y-4">
        {/* 配置组件 */}
        <CurrentComponent
          config={currentConfig}
          onChange={(updates: any) => updateMethods[configKey]?.(domain.id, updates)}
        />
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg h-full flex flex-col">
      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`rounded-lg p-4 shadow-lg ${
            showToast.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {showToast.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  showToast.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {showToast.message}
                </span>
              </div>
              <button
                onClick={() => setShowToast(null)}
                className={`p-1 rounded-full hover:bg-opacity-20 ${
                  showToast.type === 'success' ? 'hover:bg-green-600' : 'hover:bg-red-600'
                }`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 头部：领域基本信息 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">{domain.icon}</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{domain.name}</h3>
              <p className="text-gray-600">{domain.description}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">配置完成度</div>
            <div className="text-2xl font-bold text-indigo-600">
              {configStatus.percentage}%
            </div>
            <div className="text-xs text-gray-500">
              {configStatus.completed}/{configStatus.total} 完成
            </div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0 overflow-x-auto scrollbar-hide">
          {configTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            const isCompleted = getTabCompletionStatus(tab.id);

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-start gap-2 px-4 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{tab.title}</span>
                    {isCompleted && (
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    )}
                    {tab.isOptional && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex-shrink-0">
                        可选
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 leading-tight">
                    {tab.description}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab内容 */}
      <div className="flex-1 overflow-y-auto p-6">
        {renderAdvancedConfig()}
      </div>
    </div>
  );
};

export default DomainDetailConfig;