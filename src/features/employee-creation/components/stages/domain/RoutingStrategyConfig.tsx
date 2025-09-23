/**
 * 路由策略配置组件
 */

import React from 'react';
import { Navigation, Settings, Brain, Search, Clock, HelpCircle } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { RoutingStrategy } from '../../../types';

const RoutingStrategyConfig: React.FC = () => {
  const { multiDomainConfig, setRoutingStrategy } = useCreationStore();

  if (!multiDomainConfig) return null;

  const strategies: Array<{
    id: RoutingStrategy;
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    features: string[];
    pros: string[];
    cons: string[];
  }> = [
    {
      id: 'keyword',
      name: '关键词匹配',
      description: '基于预设关键词进行快速路由',
      icon: Search,
      features: ['快速响应', '精确匹配', '易于配置'],
      pros: ['速度最快', '准确率高', '配置简单'],
      cons: ['灵活性低', '需要维护关键词库']
    },
    {
      id: 'semantic',
      name: '语义识别',
      description: '使用AI语义理解进行智能路由',
      icon: Brain,
      features: ['智能理解', '语义分析', '上下文感知'],
      pros: ['理解能力强', '适应性好', '无需关键词'],
      cons: ['响应稍慢', '需要训练数据']
    },
    {
      id: 'context',
      name: '上下文关联',
      description: '基于对话历史和上下文进行路由',
      icon: Clock,
      features: ['历史感知', '连续对话', '智能切换'],
      pros: ['连贯性好', '用户体验佳', '智能切换'],
      cons: ['复杂度高', '内存占用大']
    },
    {
      id: 'hybrid',
      name: '混合智能',
      description: '结合多种策略的智能路由引擎',
      icon: Navigation,
      features: ['多策略融合', '自适应学习', '最优路由'],
      pros: ['准确率最高', '适应能力强', '用户体验最佳'],
      cons: ['配置复杂', '资源消耗大']
    }
  ];

  const currentStrategy = multiDomainConfig.routingStrategy;

  const handleStrategyChange = (strategy: RoutingStrategy) => {
    setRoutingStrategy(strategy);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <Navigation className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">智能路由策略</h3>
          <p className="text-gray-600 text-sm">
            选择系统如何智能识别用户意图并路由到合适的领域
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {strategies.map((strategy) => {
          const Icon = strategy.icon;
          const isSelected = currentStrategy === strategy.id;

          return (
            <div
              key={strategy.id}
              className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleStrategyChange(strategy.id)}
            >
              {/* 选中标识 */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}

              {/* 图标和标题 */}
              <div className="flex items-center gap-3 mb-3">
                <Icon className={`h-6 w-6 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                <h4 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {strategy.name}
                </h4>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-600 mb-3">
                {strategy.description}
              </p>

              {/* 特性列表 */}
              <div className="space-y-1">
                {strategy.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-blue-500' : 'bg-gray-400'
                    }`} />
                    <span className={isSelected ? 'text-blue-700' : 'text-gray-600'}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* 推荐标识 */}
              {strategy.id === 'hybrid' && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    推荐
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 当前策略详情 */}
      {currentStrategy && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">
                当前策略：{strategies.find(s => s.id === currentStrategy)?.name}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700">优势：</span>
                  <ul className="text-green-600 mt-1 space-y-0.5">
                    {strategies.find(s => s.id === currentStrategy)?.pros.map((pro, index) => (
                      <li key={index}>• {pro}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-medium text-orange-700">注意：</span>
                  <ul className="text-orange-600 mt-1 space-y-0.5">
                    {strategies.find(s => s.id === currentStrategy)?.cons.map((con, index) => (
                      <li key={index}>• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 高级配置 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h4 className="font-semibold text-gray-900">高级路由参数</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 关键词敏感度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              关键词敏感度 ({Math.round(multiDomainConfig.routingConfig.keywordSensitivity * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={multiDomainConfig.routingConfig.keywordSensitivity}
              onChange={(e) => {
                // 这里需要更新路由配置的方法
                console.log('keywordSensitivity:', e.target.value);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>宽松</span>
              <span>严格</span>
            </div>
          </div>

          {/* 语义相似度阈值 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              语义阈值 ({Math.round(multiDomainConfig.routingConfig.semanticThreshold * 100)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={multiDomainConfig.routingConfig.semanticThreshold}
              onChange={(e) => {
                console.log('semanticThreshold:', e.target.value);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>低</span>
              <span>高</span>
            </div>
          </div>

          {/* 上下文记忆长度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上下文长度 ({multiDomainConfig.routingConfig.contextMemoryLength} 轮)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={multiDomainConfig.routingConfig.contextMemoryLength}
              onChange={(e) => {
                console.log('contextMemoryLength:', e.target.value);
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1轮</span>
              <span>20轮</span>
            </div>
          </div>

          {/* 回退行为 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">回退行为</label>
            <select
              value={multiDomainConfig.routingConfig.fallbackBehavior}
              onChange={(e) => {
                console.log('fallbackBehavior:', e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="default">默认领域</option>
              <option value="ask">询问用户</option>
              <option value="random">随机选择</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              无法确定领域时的处理方式
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutingStrategyConfig;