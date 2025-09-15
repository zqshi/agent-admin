import React, { useState } from 'react';
import {
  Shield, TrendingUp, Clock, Users, DollarSign,
  ChevronDown, ChevronUp, Eye, Settings, CheckCircle,
  Activity, Target, Zap
} from 'lucide-react';
import { ProductionStrategy } from '../types/productionStrategy';

interface ProductionBaselineCardProps {
  strategy: ProductionStrategy;
  showDetailedConfig?: boolean;
  className?: string;
}

const ProductionBaselineCard: React.FC<ProductionBaselineCardProps> = ({
  strategy,
  showDetailedConfig = false,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(showDetailedConfig);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const getModelDisplayName = (model: string) => {
    const modelMap: Record<string, { name: string; color: string; icon: string }> = {
      'gpt-4-turbo': { name: 'GPT-4 Turbo', color: 'bg-green-500', icon: '🤖' },
      'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', color: 'bg-blue-500', icon: '🤖' },
      'claude-3-opus': { name: 'Claude-3 Opus', color: 'bg-purple-500', icon: '🧠' },
    };
    return modelMap[model] || { name: model, color: 'bg-gray-500', icon: '🔧' };
  };

  const modelInfo = getModelDisplayName(strategy.config.model);

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-xl p-6 ${className}`}>
      {/* 头部 - 当前线上策略标识 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">当前线上策略</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                生产环境
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-gray-500">最后更新</div>
            <div className="text-sm font-medium text-gray-700">
              {formatDate(strategy.lastUpdated)}
            </div>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
            title={showDetails ? '收起详情' : '展开详情'}
          >
            {showDetails ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* 关键性能指标 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-gray-600">任务成功率</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {strategy.performance.taskSuccessRate}%
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-gray-600">平均响应时间</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {strategy.performance.avgResponseTime}s
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-yellow-600" />
            <span className="text-xs font-medium text-gray-600">用户满意度</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {strategy.performance.userSatisfaction}/5.0
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">单次成本</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">
            ${strategy.performance.tokenCost}
          </div>
        </div>
      </div>

      {/* 核心配置概览 */}
      <div className="bg-white rounded-lg border border-green-100 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">核心配置</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-500 mb-1">模型</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{modelInfo.icon}</span>
              <span className="font-medium text-gray-900">{modelInfo.name}</span>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">温度参数</div>
            <div className="font-medium text-gray-900">{strategy.config.temperature}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">最大Token数</div>
            <div className="font-medium text-gray-900">{strategy.config.maxTokens}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-1">可用工具</div>
            <div className="font-medium text-gray-900">{strategy.config.tools.length}个工具</div>
          </div>
        </div>
      </div>

      {/* 详细配置（可展开） */}
      {showDetails && (
        <div className="bg-white rounded-lg border border-green-100 p-4 space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-gray-600" />
            <span className="font-medium text-gray-900">详细配置</span>
          </div>

          {/* 系统提示词 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">系统提示词</div>
            <div className="bg-gray-50 p-3 rounded border text-sm text-gray-700 leading-relaxed">
              {strategy.config.prompt}
            </div>
          </div>

          {/* 工具配置 */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">可用工具</div>
            <div className="flex flex-wrap gap-2">
              {strategy.config.tools.map((tool, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* 元数据 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">部署信息</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>版本: {strategy.metadata.version}</div>
                <div>部署时间: {formatDate(strategy.metadata.deployedAt)}</div>
                <div>审批人: {strategy.metadata.approvedBy}</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">性能详情</div>
              <div className="space-y-1 text-sm text-gray-600">
                <div>日均请求: {strategy.performance.dailyRequestCount.toLocaleString()}次</div>
                <div>来源实验: {strategy.metadata.experimentSource || '直接配置'}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-800">
            <div className="font-medium mb-1">对照基准说明</div>
            <div>
              此配置将作为新实验的<strong>对照组（A组）</strong>，您即将创建的实验配置将作为<strong>实验组（B组）</strong>进行对比测试。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionBaselineCard;