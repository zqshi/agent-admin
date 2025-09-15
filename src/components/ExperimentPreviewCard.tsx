import React, { useState } from 'react';
import {
  CheckCircle, AlertTriangle, Edit, Play, ArrowRight,
  Target, Clock, DollarSign, TrendingUp, Users, 
  Bot, Lightbulb, RefreshCw
} from 'lucide-react';
import {
  ExtractedExperimentParams,
  MissingParams,
  ExperimentIntent,
  IntelligentSuggestion
} from '../types/nlExperiment';

interface ExperimentPreviewCardProps {
  intent: ExperimentIntent;
  extractedParams: ExtractedExperimentParams;
  missingParams: MissingParams;
  suggestions: string[];
  intelligentSuggestions: IntelligentSuggestion[];
  onParamUpdate: (field: string, value: any) => void;
  onCreateExperiment: () => void;
  onEditInput: () => void;
  isCreating?: boolean;
}

// 模型显示名称映射
const MODEL_DISPLAY_NAMES: Record<string, { name: string; color: string; icon: string }> = {
  'gpt-4-turbo': { name: 'GPT-4 Turbo', color: 'bg-green-500', icon: '🤖' },
  'gpt-3.5-turbo': { name: 'GPT-3.5 Turbo', color: 'bg-blue-500', icon: '🤖' },
  'claude-3-opus': { name: 'Claude-3 Opus', color: 'bg-purple-500', icon: '🧠' },
  'llama-2-70b': { name: 'Llama 2 70B', color: 'bg-orange-500', icon: '🦙' }
};

// 指标显示名称映射
const METRIC_DISPLAY_NAMES: Record<string, string> = {
  'task_success_rate': '任务完成率',
  'response_time': '响应时间',
  'user_satisfaction': '用户满意度',
  'token_cost': 'Token成本'
};

const ExperimentPreviewCard: React.FC<ExperimentPreviewCardProps> = ({
  intent,
  extractedParams,
  missingParams,
  suggestions,
  intelligentSuggestions,
  onParamUpdate,
  onCreateExperiment,
  onEditInput,
  isCreating = false
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editingParam, setEditingParam] = useState<string | null>(null);
  const [recentlyFixed, setRecentlyFixed] = useState<Set<string>>(new Set());

  // 计算配置完整度
  const completeness = React.useMemo(() => {
    const totalParams = 8; // 总共需要配置的参数数量
    let configuredParams = 0;

    if (extractedParams.name) configuredParams++;
    if (extractedParams.models && extractedParams.models.length >= 2) configuredParams++;
    if (extractedParams.primaryMetric) configuredParams++;
    if (extractedParams.trafficRatio) configuredParams++;
    if (extractedParams.duration) configuredParams++;
    if (extractedParams.budget) configuredParams++;
    if (extractedParams.splittingStrategy) configuredParams++;
    if (extractedParams.description) configuredParams++;

    return Math.round((configuredParams / totalParams) * 100);
  }, [extractedParams]);

  // 预估成本计算
  const estimatedCost = React.useMemo(() => {
    if (!extractedParams.models || !extractedParams.duration) return 0;
    
    const baseCostPerModel = 50; // 基础成本估算
    const durationMultiplier = extractedParams.duration.maxDays || 7;
    return extractedParams.models.length * baseCostPerModel * (durationMultiplier / 7);
  }, [extractedParams.models, extractedParams.duration]);

  const handleQuickFix = (field: string, value: any) => {
    onParamUpdate(field, value);

    // 添加到最近修复的参数集合，用于显示成功反馈
    setRecentlyFixed(prev => new Set(prev).add(field));

    // 3秒后移除反馈标记
    setTimeout(() => {
      setRecentlyFixed(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }, 3000);
  };

  const intentColor = {
    comparison: 'text-blue-700 bg-blue-100',
    optimization: 'text-green-700 bg-green-100',
    exploration: 'text-purple-700 bg-purple-100',
    cost_analysis: 'text-orange-700 bg-orange-100'
  }[intent.type];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* 头部区域 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Bot className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {extractedParams.name || '智能实验配置'}
              </h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${intentColor}`}>
                {intent.description}
                <span className="ml-2 text-xs">({Math.round(intent.confidence * 100)}%)</span>
              </div>
            </div>
          </div>
          
          {/* 配置完整度指示器 */}
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{completeness}%</div>
            <div className="text-sm text-gray-500">配置完整度</div>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>

        {/* 置信度和建议 */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-gray-600">
              参数识别置信度: <span className="font-semibold text-green-600">
                {Math.round(extractedParams.extractionConfidence * 100)}%
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <Lightbulb className="h-4 w-4" />
            <span>{suggestions.length} 条优化建议</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* 核心参数配置 */}
        <div className="space-y-6">
          {/* 模型配置 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                实验模型对比
              </h4>
              {(!extractedParams.models || extractedParams.models.length < 2) && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-600">需要至少2个模型</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {extractedParams.models?.map((model, index) => {
                const modelInfo = MODEL_DISPLAY_NAMES[model] || { name: model, color: 'bg-gray-500', icon: '🤖' };
                const ratio = extractedParams.trafficRatio?.[index] || (100 / extractedParams.models!.length);
                
                return (
                  <div key={model} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${modelInfo.color}`} />
                      <span className="font-medium text-gray-900">{modelInfo.name}</span>
                      <span className="text-xs text-gray-500">{modelInfo.icon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">流量分配</span>
                      <span className="font-semibold text-blue-600">{ratio}%</span>
                    </div>
                  </div>
                );
              }) || (
                <div className="col-span-2 py-8 text-center text-gray-500">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">未识别到对比模型</p>
                  <button 
                    onClick={() => handleQuickFix('models', ['gpt-4-turbo', 'claude-3-opus'])}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    使用推荐配置
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 实验配置概览 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 主要指标 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">主要指标</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {extractedParams.primaryMetric 
                  ? METRIC_DISPLAY_NAMES[extractedParams.primaryMetric] || extractedParams.primaryMetric
                  : '未设置'
                }
              </div>
              {!extractedParams.primaryMetric && (
                <button 
                  onClick={() => handleQuickFix('primaryMetric', 'task_success_rate')}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  设置为任务完成率
                </button>
              )}
            </div>

            {/* 运行时长 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">运行时长</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {extractedParams.duration 
                  ? `${extractedParams.duration.minDays || extractedParams.duration.maxDays} 天`
                  : '未设置'
                }
              </div>
              {!extractedParams.duration && (
                <button 
                  onClick={() => handleQuickFix('duration', { minDays: 7, maxDays: 7 })}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  设置为7天
                </button>
              )}
            </div>

            {/* 预算 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-gray-700">预算限制</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {extractedParams.budget?.maxCost 
                  ? `$${extractedParams.budget.maxCost}`
                  : '未设置'
                }
              </div>
              <div className="text-xs text-gray-500 mt-1">
                预估: ${estimatedCost.toFixed(0)}
              </div>
            </div>

            {/* 分流策略 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-gray-700">分流策略</span>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {extractedParams.splittingStrategy === 'session' ? '会话级' : 
                 extractedParams.splittingStrategy === 'user' ? '用户级' : '未设置'}
              </div>
              {!extractedParams.splittingStrategy && (
                <button 
                  onClick={() => handleQuickFix('splittingStrategy', 'session')}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                >
                  设置为会话级
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 缺失参数提醒 */}
        {missingParams.required.length > 0 && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-800">缺失必需参数</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full ml-2">
                {missingParams.required.length} 项待设置
              </span>
            </div>
            <div className="space-y-2">
              {missingParams.required.map((param, index) => {
                const isRecentlyFixed = recentlyFixed.has(param.field);
                return (
                  <div key={index} className={`flex items-center justify-between transition-all duration-300 ${
                    isRecentlyFixed ? 'bg-green-50 border-l-4 border-green-400 pl-3 -ml-1 rounded-r' : ''
                  }`}>
                    <span className={`text-sm ${
                      isRecentlyFixed ? 'text-green-700 font-medium' : 'text-red-700'
                    }`}>
                      {isRecentlyFixed ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {param.description} ✓ 已设置
                        </span>
                      ) : (
                        param.description
                      )}
                    </span>
                    {!isRecentlyFixed && (
                      <button
                        onClick={() => handleQuickFix(param.field, param.default)}
                        className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
                      >
                        快速设置
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {recentlyFixed.size > 0 && (
              <div className="mt-3 pt-3 border-t border-red-200">
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  参数设置成功！缺失参数列表将自动更新
                </div>
              </div>
            )}
          </div>
        )}

        {/* 参数设置完成反馈 */}
        {missingParams.required.length === 0 && recentlyFixed.size > 0 && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-800">所有必需参数已完成设置</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              实验配置已完整，现在可以创建实验了！
            </p>
          </div>
        )}

        {/* 智能建议 */}
        {intelligentSuggestions.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-blue-800">智能优化建议</span>
            </div>
            <div className="space-y-2">
              {intelligentSuggestions.slice(0, 3).map((suggestion, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium text-blue-900">{suggestion.title}</div>
                    <div className="text-blue-700 mt-1">{suggestion.description}</div>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    {Math.round(suggestion.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onEditInput}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="h-4 w-4" />
              重新描述
            </button>
            
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              {showAdvanced ? '收起' : '高级设置'}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              预估成本: <span className="font-semibold">${estimatedCost.toFixed(2)}</span>
            </div>
            <button
              onClick={onCreateExperiment}
              disabled={missingParams.required.length > 0 || isCreating}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  创建中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  创建实验
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* 高级设置面板 */}
        {showAdvanced && (
          <div className="mt-6 pt-6 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">高级配置</h4>

            {/* 基础配置区域 */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">实验描述</label>
                <textarea
                  value={extractedParams.description || ''}
                  onChange={(e) => onParamUpdate('description', e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="详细描述实验目的和预期结果..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">次要指标</label>
                <div className="space-y-2">
                  {['response_time', 'user_satisfaction', 'token_cost'].map(metric => (
                    <label key={metric} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={extractedParams.secondaryMetrics?.includes(metric) || false}
                        onChange={(e) => {
                          const current = extractedParams.secondaryMetrics || [];
                          const updated = e.target.checked
                            ? [...current, metric]
                            : current.filter(m => m !== metric);
                          onParamUpdate('secondaryMetrics', updated);
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {METRIC_DISPLAY_NAMES[metric]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 实验策略配置 */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">实验策略</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分流策略</label>
                  <select
                    value={extractedParams.splittingStrategy || 'session'}
                    onChange={(e) => onParamUpdate('splittingStrategy', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="session">会话级分流</option>
                    <option value="user">用户级分流</option>
                    <option value="request">请求级分流</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主要指标</label>
                  <select
                    value={extractedParams.primaryMetric || 'task_success_rate'}
                    onChange={(e) => onParamUpdate('primaryMetric', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="task_success_rate">任务完成率</option>
                    <option value="response_time">响应时间</option>
                    <option value="user_satisfaction">用户满意度</option>
                    <option value="token_cost">Token成本</option>
                    <option value="conversion_rate">转化率</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 模型参数配置 */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">模型参数</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">温度参数</label>
                  <input
                    type="number"
                    min="0"
                    max="2"
                    step="0.1"
                    value={extractedParams.temperatures?.[0] || 0.7}
                    onChange={(e) => onParamUpdate('temperatures', [parseFloat(e.target.value)])}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Top-P</label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={extractedParams.topP?.[0] || 1.0}
                    onChange={(e) => onParamUpdate('topP', [parseFloat(e.target.value)])}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最大Token数</label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    step="100"
                    value={extractedParams.maxTokens?.[0] || 2000}
                    onChange={(e) => onParamUpdate('maxTokens', [parseInt(e.target.value)])}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 工具配置 */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">可用工具</h5>
              <div className="grid grid-cols-2 gap-2">
                {['search', 'calculator', 'code_executor', 'web_scraper', 'file_reader', 'image_generator'].map(tool => (
                  <label key={tool} className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={extractedParams.tools?.includes(tool) || false}
                      onChange={(e) => {
                        const current = extractedParams.tools || ['search', 'calculator'];
                        const updated = e.target.checked
                          ? [...current, tool]
                          : current.filter(t => t !== tool);
                        onParamUpdate('tools', updated);
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {tool.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* 预算和时长控制 */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-900 mb-3">预算和时长控制</h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最大预算 (USD)</label>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    value={extractedParams.budget?.maxCost || 1000}
                    onChange={(e) => onParamUpdate('budget', {
                      ...extractedParams.budget,
                      maxCost: parseInt(e.target.value)
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最小运行天数</label>
                  <input
                    type="number"
                    min="1"
                    value={extractedParams.duration?.minDays || 7}
                    onChange={(e) => onParamUpdate('duration', {
                      ...extractedParams.duration,
                      minDays: parseInt(e.target.value)
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">最大运行天数</label>
                  <input
                    type="number"
                    min="1"
                    value={extractedParams.duration?.maxDays || 30}
                    onChange={(e) => onParamUpdate('duration', {
                      ...extractedParams.duration,
                      maxDays: parseInt(e.target.value)
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* 自动停止条件 */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-3">自动停止条件</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={extractedParams.duration?.autoStopConditions?.includes('statistical_significance') || false}
                      onChange={(e) => {
                        const current = extractedParams.duration?.autoStopConditions || [];
                        const updated = e.target.checked
                          ? [...current, 'statistical_significance']
                          : current.filter(c => c !== 'statistical_significance');
                        onParamUpdate('duration', {
                          ...extractedParams.duration,
                          autoStopConditions: updated
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">达到统计显著性</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={extractedParams.duration?.autoStopConditions?.includes('budget_exhausted') || false}
                      onChange={(e) => {
                        const current = extractedParams.duration?.autoStopConditions || [];
                        const updated = e.target.checked
                          ? [...current, 'budget_exhausted']
                          : current.filter(c => c !== 'budget_exhausted');
                        onParamUpdate('duration', {
                          ...extractedParams.duration,
                          autoStopConditions: updated
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">预算用尽</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={extractedParams.duration?.autoStopConditions?.includes('target_sample_reached') || false}
                      onChange={(e) => {
                        const current = extractedParams.duration?.autoStopConditions || [];
                        const updated = e.target.checked
                          ? [...current, 'target_sample_reached']
                          : current.filter(c => c !== 'target_sample_reached');
                        onParamUpdate('duration', {
                          ...extractedParams.duration,
                          autoStopConditions: updated
                        });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">达到目标样本量</span>
                  </label>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">目标样本量</label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={extractedParams.duration?.targetSamples || 1000}
                      onChange={(e) => onParamUpdate('duration', {
                        ...extractedParams.duration,
                        targetSamples: parseInt(e.target.value)
                      })}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">P值阈值</label>
                    <input
                      type="number"
                      min="0.01"
                      max="0.1"
                      step="0.01"
                      value={extractedParams.pValueThreshold || 0.05}
                      onChange={(e) => onParamUpdate('pValueThreshold', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">最小效果量</label>
                    <input
                      type="number"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={extractedParams.minEffectSize || 0.2}
                      onChange={(e) => onParamUpdate('minEffectSize', parseFloat(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentPreviewCard;