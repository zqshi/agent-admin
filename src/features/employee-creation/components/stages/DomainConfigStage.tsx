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

  // 领域配置完整性检查 - 增强版本
  const getDomainConfigStatus = (domain: DomainConfig) => {
    // 基础配置检查
    const basicChecks = {
      hasName: !!domain.name?.trim(),
      hasDescription: !!domain.description?.trim(),
      hasIcon: !!domain.icon,
      hasKeywords: domain.keywords.length > 0 || domain.semanticTopics.length > 0
    };

    // 高级配置检查
    const advancedChecks = {
      // 人设配置
      persona: {
        hasSystemPrompt: !!domain.advancedConfig.persona?.systemPrompt?.trim(),
        hasBackground: !!domain.advancedConfig.persona?.characterBackground?.trim(),
        hasConstraints: (domain.advancedConfig.persona?.constraints?.length || 0) > 0,
        hasExamples: (domain.advancedConfig.persona?.examples?.length || 0) > 0
      },

      // Prompt配置
      prompt: {
        hasTemplates: (domain.advancedConfig.prompt?.templates?.length || 0) > 0,
        hasSlots: (domain.advancedConfig.prompt?.slots?.length || 0) > 0,
        hasCompression: !!domain.advancedConfig.prompt?.compression?.enabled,
        hasErrorHandling: !!domain.advancedConfig.prompt?.errorHandling
      },

      // 知识配置
      knowledge: {
        hasDocuments: (domain.advancedConfig.knowledge?.documents?.files?.length || 0) > 0,
        hasFAQ: (domain.advancedConfig.knowledge?.faq?.items?.length || 0) > 0,
        hasKnowledgeBase: domain.advancedConfig.knowledge?.knowledgeBase?.type !== undefined,
        hasRetention: !!domain.advancedConfig.knowledge?.retention?.enabled
      },

      // 工具配置
      tools: {
        hasRecommended: (domain.advancedConfig.tools?.recommendedTools?.length || 0) > 0,
        hasSelected: (domain.advancedConfig.tools?.selectedTools?.length || 0) > 0,
        hasUsagePolicy: !!domain.advancedConfig.tools?.usagePolicy
      },

      // 导师配置
      mentor: {
        isEnabled: !!domain.advancedConfig.mentor?.enabled,
        hasMentor: !!domain.advancedConfig.mentor?.mentor?.id,
        hasReporting: !!domain.advancedConfig.mentor?.reporting?.enabled,
        hasSupervision: !!domain.advancedConfig.mentor?.supervision
      }
    };

    // 计算各部分完成度
    const basicCompleted = Object.values(basicChecks).filter(Boolean).length;
    const basicTotal = Object.keys(basicChecks).length;

    const personaCompleted = Object.values(advancedChecks.persona).filter(Boolean).length;
    const personaTotal = Object.keys(advancedChecks.persona).length;

    const promptCompleted = Object.values(advancedChecks.prompt).filter(Boolean).length;
    const promptTotal = Object.keys(advancedChecks.prompt).length;

    const knowledgeCompleted = Object.values(advancedChecks.knowledge).filter(Boolean).length;
    const knowledgeTotal = Object.keys(advancedChecks.knowledge).length;

    const toolsCompleted = Object.values(advancedChecks.tools).filter(Boolean).length;
    const toolsTotal = Object.keys(advancedChecks.tools).length;

    const mentorCompleted = Object.values(advancedChecks.mentor).filter(Boolean).length;
    const mentorTotal = Object.keys(advancedChecks.mentor).length;

    const totalCompleted = basicCompleted + personaCompleted + promptCompleted + knowledgeCompleted + toolsCompleted + mentorCompleted;
    const totalItems = basicTotal + personaTotal + promptTotal + knowledgeTotal + toolsTotal + mentorTotal;

    // 高级配置完整性 - 至少需要人设和知识配置
    const hasAdvancedConfig = (
      advancedChecks.persona.hasSystemPrompt &&
      (advancedChecks.knowledge.hasDocuments || advancedChecks.knowledge.hasFAQ)
    );

    return {
      completed: totalCompleted,
      total: totalItems,
      percentage: Math.round((totalCompleted / totalItems) * 100),
      isValid: basicChecks.hasName && basicChecks.hasDescription && basicChecks.hasKeywords,
      hasAdvancedConfig,
      details: {
        basic: { completed: basicCompleted, total: basicTotal, checks: basicChecks },
        persona: { completed: personaCompleted, total: personaTotal, checks: advancedChecks.persona },
        prompt: { completed: promptCompleted, total: promptTotal, checks: advancedChecks.prompt },
        knowledge: { completed: knowledgeCompleted, total: knowledgeTotal, checks: advancedChecks.knowledge },
        tools: { completed: toolsCompleted, total: toolsTotal, checks: advancedChecks.tools },
        mentor: { completed: mentorCompleted, total: mentorTotal, checks: advancedChecks.mentor }
      }
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

      {/* 高级配置能力汇总 */}
      {!showEmptyState && activeDomains.length > 0 && (
        <div className="mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">高级配置完整性检查</h3>
              <span className="text-sm text-gray-500">
                多领域已包含所有高级配置能力
              </span>
            </div>

            <div className="space-y-4">
              {activeDomains.map(domain => {
                const status = getDomainConfigStatus(domain);
                return (
                  <div key={domain.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{domain.icon}</span>
                        <span className="font-medium text-gray-900">{domain.name}</span>
                        {status.hasAdvancedConfig && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                            高级配置完整
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {status.completed}/{status.total} 项已配置 ({status.percentage}%)
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
                      {Object.entries(status.details).map(([key, detail]) => (
                        <div key={key} className="text-center">
                          <div className={`p-2 rounded border ${
                            detail.completed === detail.total
                              ? 'border-green-200 bg-green-50'
                              : detail.completed > 0
                              ? 'border-yellow-200 bg-yellow-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="font-medium text-gray-700 capitalize">{key}</div>
                            <div className={`text-xs mt-1 ${
                              detail.completed === detail.total
                                ? 'text-green-600'
                                : detail.completed > 0
                                ? 'text-yellow-600'
                                : 'text-gray-500'
                            }`}>
                              {detail.completed}/{detail.total}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 配置建议 */}
                    {!status.hasAdvancedConfig && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="text-yellow-800 font-medium">配置建议</p>
                            <p className="text-yellow-700 mt-1">
                              建议完善该领域的人设配置和知识配置，以确保具备完整的高级配置能力。
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 整体汇总 */}
            <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">配置完整性总结</span>
              </div>
              <div className="text-sm text-green-800">
                {activeDomains.filter(domain => getDomainConfigStatus(domain).hasAdvancedConfig).length} / {activeDomains.length} 个领域已完成高级配置，
                多领域模式已包含：人设配置、Prompt配置、知识配置、工具管理、导师机制等完整功能。
              </div>
            </div>
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