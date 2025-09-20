/**
 * 智能建议卡片组件
 * 展示AI分析生成的配置建议，用户可选择性应用
 */

import React, { useState } from 'react';
import {
  Check,
  X,
  Sparkles,
  Target,
  User,
  MessageCircle,
  Zap,
  Wrench,
  ChevronDown,
  ChevronUp,
  Star
} from 'lucide-react';
import type { SmartSuggestion } from '../services/SmartAnalysisService';

interface SuggestionCardProps {
  suggestion: SmartSuggestion;
  onApply: (suggestion: SmartSuggestion) => void;
  onDismiss: (suggestion: SmartSuggestion) => void;
  isApplied?: boolean;
  isDismissed?: boolean;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss,
  isApplied = false,
  isDismissed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取建议类型的图标和颜色
  const getTypeConfig = (type: string) => {
    const configs = {
      responsibilities: {
        icon: Target,
        color: 'blue',
        label: '职责建议'
      },
      personality: {
        icon: User,
        color: 'purple',
        label: '性格建议'
      },
      workStyle: {
        icon: Zap,
        color: 'green',
        label: '风格建议'
      },
      communication: {
        icon: MessageCircle,
        color: 'orange',
        label: '沟通建议'
      },
      tools: {
        icon: Wrench,
        color: 'red',
        label: '工具建议'
      }
    };

    return configs[type as keyof typeof configs] || {
      icon: Sparkles,
      color: 'gray',
      label: '智能建议'
    };
  };

  const typeConfig = getTypeConfig(suggestion.type);
  const Icon = typeConfig.icon;

  // 获取置信度颜色
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // 渲染建议内容
  const renderContent = () => {
    switch (suggestion.type) {
      case 'responsibilities':
        return (
          <div className="space-y-2">
            {(suggestion.content as string[]).map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        );

      case 'personality':
        const personality = suggestion.content;
        return (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-sm">
              <span className="text-gray-600">友好度:</span>
              <span className="ml-2 font-medium text-blue-600">{personality.friendliness}/10</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">专业度:</span>
              <span className="ml-2 font-medium text-blue-600">{personality.professionalism}/10</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">耐心度:</span>
              <span className="ml-2 font-medium text-blue-600">{personality.patience}/10</span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">共情力:</span>
              <span className="ml-2 font-medium text-blue-600">{personality.empathy}/10</span>
            </div>
          </div>
        );

      case 'workStyle':
        const workStyle = suggestion.content;
        const styleLabels = {
          rigor: { strict: '严格', balanced: '平衡', flexible: '灵活' },
          humor: { none: '严肃', occasional: '适度', frequent: '幽默' },
          proactivity: { reactive: '被动响应', balanced: '平衡主动', proactive: '积极主动' },
          detailOrientation: { high: '高度关注', medium: '适度关注', low: '关注大局' }
        };

        return (
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm">
              <span className="text-gray-600">严谨度:</span>
              <span className="ml-2 font-medium text-green-600">
                {styleLabels.rigor[workStyle.rigor as keyof typeof styleLabels.rigor]}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">幽默程度:</span>
              <span className="ml-2 font-medium text-green-600">
                {styleLabels.humor[workStyle.humor as keyof typeof styleLabels.humor]}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">主动性:</span>
              <span className="ml-2 font-medium text-green-600">
                {styleLabels.proactivity[workStyle.proactivity as keyof typeof styleLabels.proactivity]}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">细节关注:</span>
              <span className="ml-2 font-medium text-green-600">
                {styleLabels.detailOrientation[workStyle.detailOrientation as keyof typeof styleLabels.detailOrientation]}
              </span>
            </div>
          </div>
        );

      case 'communication':
        const communication = suggestion.content;
        const commLabels = {
          responseLength: { concise: '简洁', moderate: '适中', detailed: '详细' },
          language: { formal: '正式', neutral: '中性', casual: '随和', friendly: '友好' },
          technicality: { simple: '通俗易懂', moderate: '适度专业', technical: '专业技术' }
        };

        return (
          <div className="grid grid-cols-1 gap-2">
            <div className="text-sm">
              <span className="text-gray-600">回复长度:</span>
              <span className="ml-2 font-medium text-orange-600">
                {commLabels.responseLength[communication.responseLength as keyof typeof commLabels.responseLength]}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">语言风格:</span>
              <span className="ml-2 font-medium text-orange-600">
                {commLabels.language[communication.language as keyof typeof commLabels.language]}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-gray-600">专业程度:</span>
              <span className="ml-2 font-medium text-orange-600">
                {commLabels.technicality[communication.technicality as keyof typeof commLabels.technicality]}
              </span>
            </div>
          </div>
        );

      case 'tools':
        const toolNames = {
          'order_query': '订单查询',
          'customer_info': '客户信息',
          'faq_search': 'FAQ搜索',
          'data_query': '数据查询',
          'report_generator': '报表生成',
          'crm_access': 'CRM系统',
          'pricing_calc': '价格计算',
          'email_sender': '邮件发送'
        };

        return (
          <div className="flex flex-wrap gap-2">
            {(suggestion.content as string[]).map((toolId, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
              >
                {toolNames[toolId as keyof typeof toolNames] || toolId}
              </span>
            ))}
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-700">
            {JSON.stringify(suggestion.content)}
          </div>
        );
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isApplied
        ? 'border-green-300 bg-green-50'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-${typeConfig.color}-100`}>
            <Icon className={`h-4 w-4 text-${typeConfig.color}-600`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
              {suggestion.isRecommended && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-yellow-600 font-medium">推荐</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">{typeConfig.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceColor(suggestion.confidence)}`}>
                {Math.round(suggestion.confidence * 100)}% 置信度
              </span>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {!isApplied && (
            <>
              <button
                onClick={() => onApply(suggestion)}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="h-3 w-3" />
                应用
              </button>
              <button
                onClick={() => onDismiss(suggestion)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          )}
          {isApplied && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg">
              <Check className="h-3 w-3" />
              已应用
            </div>
          )}
        </div>
      </div>

      {/* 建议内容 */}
      <div className="mb-3">
        {renderContent()}
      </div>

      {/* 推荐理由 */}
      <div className="border-t border-gray-100 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>推荐理由</span>
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </button>

        {isExpanded && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {suggestion.reason}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;