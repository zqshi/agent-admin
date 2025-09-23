/**
 * 工具配置组件
 */

import React, { useState, useEffect } from 'react';
import { Wrench, Search, Check, Settings, Star, Sparkles } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { Tool, SelectedTool, AdvancedConfig } from '../../../types';

// Props接口定义
interface ToolConfigProps {
  config?: AdvancedConfig['tools'];
  onChange?: (updates: Partial<AdvancedConfig['tools']>) => void;
}

const ToolConfig: React.FC<ToolConfigProps> = ({ config, onChange }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.advancedConfig?.tools;
  const actualOnChange = onChange || ((updates: Partial<AdvancedConfig['tools']>) => {
    store.updateAdvancedConfig({ tools: { ...store.advancedConfig?.tools, ...updates } });
  });

  const { basicInfo, getSmartSuggestionsByType } = store;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 可用工具列表（模拟数据）
  const availableTools: Tool[] = [
    {
      id: 'order_query',
      name: '订单查询',
      category: '客户服务',
      description: '查询客户订单状态、物流信息等',
      icon: '📦',
      capabilities: ['订单状态查询', '物流跟踪', '订单历史']
    },
    {
      id: 'customer_info',
      name: '客户信息',
      category: '客户服务',
      description: '查询和管理客户基本信息',
      icon: '👤',
      capabilities: ['客户资料查询', '联系方式管理', '客户标签']
    },
    {
      id: 'faq_search',
      name: 'FAQ搜索',
      category: '知识管理',
      description: '搜索常见问题和标准答案',
      icon: '❓',
      capabilities: ['问题搜索', '答案匹配', '相关推荐']
    },
    {
      id: 'data_query',
      name: '数据查询',
      category: '数据分析',
      description: '查询和分析业务数据',
      icon: '📊',
      capabilities: ['SQL查询', '数据统计', '报表生成']
    },
    {
      id: 'report_generator',
      name: '报表生成',
      category: '数据分析',
      description: '自动生成各类业务报表',
      icon: '📈',
      capabilities: ['图表生成', '数据导出', '定时报告']
    },
    {
      id: 'crm_access',
      name: 'CRM系统',
      category: '销售管理',
      description: '访问和操作CRM系统',
      icon: '🏢',
      capabilities: ['客户管理', '销售跟进', '机会管理']
    },
    {
      id: 'pricing_calc',
      name: '价格计算',
      category: '销售管理',
      description: '计算产品价格和优惠',
      icon: '💰',
      capabilities: ['价格计算', '折扣应用', '报价生成']
    },
    {
      id: 'email_sender',
      name: '邮件发送',
      category: '通信工具',
      description: '发送邮件和通知',
      icon: '📧',
      capabilities: ['邮件发送', '模板管理', '批量通知']
    }
  ];

  // 当前选择的工具
  const selectedTools: SelectedTool[] = actualConfig?.selectedTools || [];

  // 根据职责推荐工具
  const getRecommendedTools = (): string[] => {
    if (!basicInfo?.primaryRole) return [];

    const roleToolMap: Record<string, string[]> = {
      '客服专员': ['order_query', 'customer_info', 'faq_search', 'email_sender'],
      '数据分析师': ['data_query', 'report_generator'],
      '销售顾问': ['crm_access', 'pricing_calc', 'customer_info', 'email_sender'],
      '技术支持': ['faq_search', 'data_query', 'email_sender']
    };

    return roleToolMap[basicInfo.primaryRole] || [];
  };

  // 智能推荐的工具
  const recommendedToolIds = getRecommendedTools();

  // 获取AI推荐的工具
  const getAIRecommendedTools = () => {
    const toolSuggestions = getSmartSuggestionsByType('tools');
    return toolSuggestions.length > 0 ? toolSuggestions[0].content as string[] : [];
  };

  const aiRecommendedToolIds = getAIRecommendedTools();

  // 过滤工具
  const filteredTools = availableTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 获取所有类别
  const categories = Array.from(new Set(availableTools.map(tool => tool.category)));

  // 检查工具是否已选择
  const isToolSelected = (toolId: string): boolean => {
    return selectedTools.some(tool => tool.id === toolId);
  };

  // 选择/取消选择工具
  const toggleTool = (tool: Tool) => {
    const isSelected = isToolSelected(tool.id);
    let newSelectedTools: SelectedTool[];

    if (isSelected) {
      // 取消选择
      newSelectedTools = selectedTools.filter(t => t.id !== tool.id);
    } else {
      // 选择工具
      const selectedTool: SelectedTool = {
        ...tool,
        permissions: ['basic_access'],
        config: {}
      };
      newSelectedTools = [...selectedTools, selectedTool];
    }

    actualOnChange({
      ...actualConfig,
      selectedTools: newSelectedTools,
      recommendedTools: availableTools.filter(t => recommendedToolIds.includes(t.id))
    });
  };

  // 批量选择推荐工具
  const selectRecommendedTools = () => {
    const recommendedTools = availableTools.filter(tool =>
      recommendedToolIds.includes(tool.id) && !isToolSelected(tool.id)
    );

    const newSelectedTools = [...selectedTools, ...recommendedTools.map(tool => ({
      ...tool,
      permissions: ['basic_access'],
      config: {}
    }))];

    actualOnChange({
      ...actualConfig,
      selectedTools: newSelectedTools,
      recommendedTools: availableTools.filter(t => recommendedToolIds.includes(t.id))
    });
  };

  // 批量选择AI推荐工具
  const selectAIRecommendedTools = () => {
    const aiRecommendedTools = availableTools.filter(tool =>
      aiRecommendedToolIds.includes(tool.id) && !isToolSelected(tool.id)
    );

    const newSelectedTools: SelectedTool[] = [
      ...selectedTools,
      ...aiRecommendedTools.map(tool => ({
        ...tool,
        permissions: ['basic_access'],
        config: {}
      }))
    ];

    actualOnChange({
      ...actualConfig,
      selectedTools: newSelectedTools,
      recommendedTools: availableTools.filter(t => recommendedToolIds.includes(t.id))
    });
  };

  return (
    <div className="space-y-6">
      {/* 智能推荐 */}
      {recommendedToolIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-blue-900 flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              智能推荐工具
            </h4>
            <button
              onClick={selectRecommendedTools}
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              一键选择推荐
            </button>
          </div>
          <p className="text-sm text-blue-700 mb-3">
            基于您选择的职责 "{basicInfo?.primaryRole}"，为您推荐以下工具：
          </p>
          <div className="flex flex-wrap gap-2">
            {recommendedToolIds.map(toolId => {
              const tool = availableTools.find(t => t.id === toolId);
              if (!tool) return null;
              return (
                <span
                  key={toolId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-blue-300 rounded-full text-sm"
                >
                  <span>{tool.icon}</span>
                  {tool.name}
                  {isToolSelected(toolId) && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索工具名称或描述..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">全部类别</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* 已选择工具摘要 */}
      {selectedTools.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">
            已选择 {selectedTools.length} 个工具
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedTools.map(tool => (
              <span
                key={tool.id}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-green-300 rounded-full text-sm"
              >
                <span>{tool.icon}</span>
                {tool.name}
                <button
                  onClick={() => toggleTool(tool)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 工具列表 */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">可用工具 ({filteredTools.length})</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map(tool => {
            const isSelected = isToolSelected(tool.id);
            const isRecommended = recommendedToolIds.includes(tool.id);
            const isAIRecommended = aiRecommendedToolIds.includes(tool.id);

            return (
              <div
                key={tool.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isAIRecommended
                    ? 'border-yellow-300 bg-yellow-50 ring-2 ring-yellow-200'
                    : isRecommended
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleTool(tool)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{tool.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-medium text-gray-900">{tool.name}</h5>
                      <div className="flex items-center gap-1">
                        {isAIRecommended && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                              AI推荐
                            </span>
                          </div>
                        )}
                        {isRecommended && !isAIRecommended && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                            推荐
                          </span>
                        )}
                        {isSelected && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{tool.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tool.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {tool.capabilities.length} 项功能
                      </span>
                    </div>
                  </div>
                </div>

                {/* 功能列表 */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-1">
                    {tool.capabilities.map((capability, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 使用策略配置 */}
      {selectedTools.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            使用策略配置
          </h4>

          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                defaultChecked
              />
              <div>
                <span className="text-sm font-medium text-gray-900">使用前确认</span>
                <p className="text-sm text-gray-500">在调用工具前先询问用户确认</p>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">日志级别</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="none">不记录</option>
                <option value="basic" selected>基础日志</option>
                <option value="detailed">详细日志</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolConfig;