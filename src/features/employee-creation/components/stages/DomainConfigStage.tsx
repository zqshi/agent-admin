/**
 * 领域配置阶段组件
 */

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Settings, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { useCreationStore } from '../../stores/creationStore';
import DomainListPanel from './domain/DomainListPanel';
import DomainDetailConfig from './domain/DomainDetailConfig';
import RoutingStrategyConfig from './domain/RoutingStrategyConfig';
import type { DomainConfig } from '../../types';

const DomainConfigStage: React.FC = () => {
  const {
    multiDomainConfig,
    selectedDomainId,
    basicInfo,
    initializeMultiDomain,
    addDomain,
    selectDomain,
    getDomain,
    getActiveDomains,
    validateAllDomains
  } = useCreationStore();

  const [showEmptyState, setShowEmptyState] = useState(false);

  // 初始化多领域配置
  useEffect(() => {
    if (basicInfo?.enableMultiDomain && !multiDomainConfig) {
      initializeMultiDomain();
    }
  }, [basicInfo?.enableMultiDomain, multiDomainConfig, initializeMultiDomain]);

  // 检查是否显示空状态
  useEffect(() => {
    const domains = multiDomainConfig?.domains || [];
    setShowEmptyState(domains.length === 0);
  }, [multiDomainConfig?.domains]);

  const selectedDomain = selectedDomainId ? getDomain(selectedDomainId) : null;
  const activeDomains = getActiveDomains();

  // 添加默认领域
  const handleAddDefaultDomains = () => {
    const defaultAdvancedConfig = {
      persona: { systemPrompt: '', characterBackground: '', constraints: [], examples: [] },
      prompt: { templates: [], slots: [], compression: { enabled: false, trigger: 'tokenLimit' as const, threshold: 2048, strategy: 'summary' as const, preserveKeys: [] }, errorHandling: { onSlotMissing: 'useDefault' as const, onCompressionFail: 'retry' as const } },
      knowledge: { documents: { files: [], maxSize: 10485760, allowedFormats: ['.txt', '.md', '.pdf'] }, faq: { items: [], importSource: 'manual' as const }, retention: { enabled: false, strategy: 'internalize' as const, updateFrequency: 'realtime' as const }, knowledgeBase: { type: 'internal' as const, internalSources: [], externalAPIs: [] }, knowledgeGraph: { enabled: false, autoGenerate: false, updateTrigger: 'manual' as const, visualization: false } },
      tools: { recommendedTools: [], selectedTools: [], usagePolicy: { requireConfirmation: false, loggingLevel: 'basic' as const } },
      mentor: { enabled: false, mentor: { id: '', name: '', role: '' }, reporting: { enabled: false, schedule: 'weekly' as const, method: 'email' as const, template: '' }, supervision: { reviewDecisions: false, approvalRequired: [], escalationRules: [] } }
    };

    const defaultDomains = [
      {
        name: '客户服务',
        description: '处理客户咨询、投诉和售后服务',
        icon: '🎧',
        weight: 50,
        enabled: true,
        isDefault: true,
        keywords: ['客服', '咨询', '投诉', '售后', '帮助'],
        semanticTopics: ['customer service', 'support', 'help'],
        advancedConfig: defaultAdvancedConfig
      },
      {
        name: '技术支持',
        description: '解决技术问题、故障排查和产品指导',
        icon: '🔧',
        weight: 30,
        enabled: true,
        isDefault: false,
        keywords: ['技术', '故障', '问题', '修复', '配置'],
        semanticTopics: ['technical support', 'troubleshooting', 'technology'],
        advancedConfig: defaultAdvancedConfig
      },
      {
        name: '销售咨询',
        description: '产品介绍、价格咨询和购买指导',
        icon: '💼',
        weight: 20,
        enabled: true,
        isDefault: false,
        keywords: ['销售', '价格', '购买', '产品', '咨询'],
        semanticTopics: ['sales', 'pricing', 'product', 'purchase'],
        advancedConfig: defaultAdvancedConfig
      }
    ];

    defaultDomains.forEach(domain => {
      addDomain(domain);
    });
  };

  // 添加自定义领域
  const handleAddCustomDomain = () => {
    const defaultAdvancedConfig = {
      persona: { systemPrompt: '', characterBackground: '', constraints: [], examples: [] },
      prompt: { templates: [], slots: [], compression: { enabled: false, trigger: 'tokenLimit' as const, threshold: 2048, strategy: 'summary' as const, preserveKeys: [] }, errorHandling: { onSlotMissing: 'useDefault' as const, onCompressionFail: 'retry' as const } },
      knowledge: { documents: { files: [], maxSize: 10485760, allowedFormats: ['.txt', '.md', '.pdf'] }, faq: { items: [], importSource: 'manual' as const }, retention: { enabled: false, strategy: 'internalize' as const, updateFrequency: 'realtime' as const }, knowledgeBase: { type: 'internal' as const, internalSources: [], externalAPIs: [] }, knowledgeGraph: { enabled: false, autoGenerate: false, updateTrigger: 'manual' as const, visualization: false } },
      tools: { recommendedTools: [], selectedTools: [], usagePolicy: { requireConfirmation: false, loggingLevel: 'basic' as const } },
      mentor: { enabled: false, mentor: { id: '', name: '', role: '' }, reporting: { enabled: false, schedule: 'weekly' as const, method: 'email' as const, template: '' }, supervision: { reviewDecisions: false, approvalRequired: [], escalationRules: [] } }
    };

    const newDomain = {
      name: '新领域',
      description: '请编辑领域描述',
      icon: '⚡',
      weight: 10,
      enabled: true,
      isDefault: false,
      keywords: [],
      semanticTopics: [],
      advancedConfig: defaultAdvancedConfig
    };

    addDomain(newDomain);
  };

  // 领域配置完整性检查
  const getDomainConfigStatus = (domain: DomainConfig) => {
    const checks = {
      basicInfo: domain.name && domain.description,
      keywords: domain.keywords.length > 0 || domain.semanticTopics.length > 0,
      persona: !!domain.advancedConfig.persona?.systemPrompt,
      prompt: (domain.advancedConfig.prompt?.templates?.length || 0) > 0,
      knowledge: (
        (domain.advancedConfig.knowledge?.documents?.files?.length || 0) > 0 ||
        (domain.advancedConfig.knowledge?.faq?.items?.length || 0) > 0
      ),
      tools: (domain.advancedConfig.tools?.selectedTools?.length || 0) > 0,
      mentor: domain.advancedConfig.mentor?.enabled || false
    };

    const completedItems = Object.values(checks).filter(Boolean).length;
    const totalItems = Object.keys(checks).length;

    return {
      completed: completedItems,
      total: totalItems,
      percentage: Math.round((completedItems / totalItems) * 100),
      details: checks,
      isValid: checks.basicInfo && checks.keywords // 最少需要基础信息和路由配置
    };
  };

  if (!multiDomainConfig) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">多领域配置未启用</h3>
          <p className="text-yellow-700">
            请在基础信息阶段启用多领域配置后再进行领域设置。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-full">
      {/* 头部信息 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-indigo-600" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">领域配置</h3>
              <p className="text-gray-600 text-sm">
                为数字员工配置多个专业领域，每个领域拥有独立的配置和能力
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeDomains.length > 0 && (
              <div className="text-sm text-gray-500">
                已配置 {activeDomains.length} 个领域
              </div>
            )}
          </div>
        </div>
      </div>

      {showEmptyState ? (
        /* 空状态 */
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Layers className="h-16 w-16 text-gray-300 mx-auto mb-6" />
          <h3 className="text-xl font-semibold text-gray-900 mb-3">开始配置多领域能力</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            为您的数字员工添加多个专业领域，让它能够智能处理不同类型的用户咨询。
            您可以选择快速开始使用预设领域，或者从零开始创建自定义领域。
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleAddDefaultDomains}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle className="h-5 w-5" />
              快速开始（推荐3个领域）
            </button>
            <button
              onClick={handleAddCustomDomain}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5" />
              创建自定义领域
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl mb-2">🎧</div>
              <h4 className="font-medium text-blue-900 mb-1">客户服务</h4>
              <p className="text-sm text-blue-700">处理咨询、投诉、售后</p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl mb-2">🔧</div>
              <h4 className="font-medium text-green-900 mb-1">技术支持</h4>
              <p className="text-sm text-green-700">故障排查、技术指导</p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl mb-2">💼</div>
              <h4 className="font-medium text-purple-900 mb-1">销售咨询</h4>
              <p className="text-sm text-purple-700">产品介绍、价格咨询</p>
            </div>
          </div>
        </div>
      ) : (
        /* 主要界面 */
        <div className="flex gap-6 h-full min-h-[600px]">
          {/* 左侧：领域列表面板 */}
          <div className="w-80 flex-shrink-0">
            <DomainListPanel
              domains={multiDomainConfig.domains}
              selectedDomainId={selectedDomainId}
              onSelectDomain={selectDomain}
              onAddDomain={handleAddCustomDomain}
              getDomainConfigStatus={getDomainConfigStatus}
            />
          </div>

          {/* 右侧：领域详细配置 */}
          <div className="flex-1 min-w-0">
            {selectedDomain ? (
              <DomainDetailConfig
                domain={selectedDomain}
                configStatus={getDomainConfigStatus(selectedDomain)}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12 text-center h-full flex items-center justify-center">
                <div>
                  <Eye className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">选择领域进行配置</h3>
                  <p className="text-gray-600">
                    从左侧选择一个领域，开始配置其专属的能力和特征
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 底部：路由策略配置 */}
      {!showEmptyState && (
        <div className="mt-6">
          <RoutingStrategyConfig />
        </div>
      )}
    </div>
  );
};

export default DomainConfigStage;