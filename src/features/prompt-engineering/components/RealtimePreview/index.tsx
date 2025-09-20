/**
 * 实时预览组件
 * 提供Prompt编译结果的实时预览和性能指标展示
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RefreshCw,
  Download,
  Share2,
  Settings,
  Zap,
  DollarSign,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
  Code,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  Copy,
  ExternalLink
} from 'lucide-react';
import { usePreviewEngine } from '../../hooks/usePreviewEngine';
import type { PreviewResult, OptimizationSuggestion } from '../../types';

export interface RealtimePreviewProps {
  className?: string;
  layout?: 'split' | 'full' | 'minimal';
  showMetrics?: boolean;
  showSuggestions?: boolean;
  autoCompile?: boolean;
}

export const RealtimePreview: React.FC<RealtimePreviewProps> = ({
  className = '',
  layout = 'split',
  showMetrics = true,
  showSuggestions = true,
  autoCompile = true
}) => {
  const {
    previewResult,
    isCompiling,
    compilationError,
    compilePrompt,
    clearPreview,
    enableAutoCompile,
    disableAutoCompile,
    isAutoCompileEnabled,
    applyOptimization,
    dismissSuggestion,
    getPerformanceInsights,
    compareWithPrevious,
    exportPreviewResult,
    exportForTesting
  } = usePreviewEngine();

  // 本地状态
  const [activeTab, setActiveTab] = useState<'preview' | 'metrics' | 'suggestions'>('preview');
  const [showCode, setShowCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 初始化自动编译
  useEffect(() => {
    if (autoCompile) {
      enableAutoCompile();
    } else {
      disableAutoCompile();
    }
  }, [autoCompile, enableAutoCompile, disableAutoCompile]);

  // 处理手动编译
  const handleCompile = async () => {
    try {
      await compilePrompt();
    } catch (error) {
      console.error('编译失败:', error);
    }
  };

  // 处理导出
  const handleExport = async (type: 'result' | 'test') => {
    if (!previewResult) return;

    setIsExporting(true);
    try {
      let data: string;
      let filename: string;

      if (type === 'result') {
        data = exportPreviewResult();
        filename = 'prompt-preview-result.json';
      } else {
        const testData = exportForTesting();
        data = JSON.stringify(testData, null, 2);
        filename = 'prompt-test-data.json';
      }

      // 创建下载
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // 复制到剪贴板
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // TODO: 显示成功提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 渲染工具栏
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-900">实时预览</h3>
        <div className={`w-2 h-2 rounded-full ${
          compilationError ? 'bg-red-500' :
          previewResult ? 'bg-green-500' :
          'bg-gray-300'
        }`} />
      </div>

      <div className="flex items-center gap-2">
        {/* 自动编译切换 */}
        <button
          onClick={isAutoCompileEnabled ? disableAutoCompile : enableAutoCompile}
          className={`p-2 rounded-lg text-sm ${
            isAutoCompileEnabled
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
          title={isAutoCompileEnabled ? '禁用自动编译' : '启用自动编译'}
        >
          {isAutoCompileEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>

        {/* 手动编译 */}
        <button
          onClick={handleCompile}
          disabled={isCompiling}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          title="手动编译"
        >
          <RefreshCw className={`h-4 w-4 ${isCompiling ? 'animate-spin' : ''}`} />
        </button>

        {/* 代码视图切换 */}
        <button
          onClick={() => setShowCode(!showCode)}
          className={`p-2 rounded-lg ${
            showCode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}
          title="切换代码视图"
        >
          <Code className="h-4 w-4" />
        </button>

        {/* 导出菜单 */}
        <div className="relative">
          <button
            onClick={() => handleExport('result')}
            disabled={!previewResult || isExporting}
            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            title="导出结果"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>

        {/* 清除 */}
        <button
          onClick={clearPreview}
          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
          title="清除预览"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  // 渲染标签页
  const renderTabs = () => {
    if (layout === 'minimal') return null;

    const tabs = [
      { id: 'preview', label: '预览', icon: Eye },
      { id: 'metrics', label: '指标', icon: BarChart3 },
      { id: 'suggestions', label: '建议', icon: Lightbulb }
    ];

    return (
      <div className="flex border-b border-gray-200 bg-gray-50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
              {tab.id === 'suggestions' && previewResult?.suggestions.length && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {previewResult.suggestions.length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  // 渲染预览内容
  const renderPreviewContent = () => {
    if (compilationError) {
      return (
        <div className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">编译失败</h3>
          <p className="text-red-600 mb-4">{compilationError}</p>
          <button
            onClick={handleCompile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            重试编译
          </button>
        </div>
      );
    }

    if (!previewResult) {
      return (
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无预览</h3>
          <p className="text-gray-600 mb-4">选择模板并配置Slot后将显示预览结果</p>
          <button
            onClick={handleCompile}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            开始编译
          </button>
        </div>
      );
    }

    return (
      <div className="p-6">
        {/* 编译后的Prompt */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">编译结果</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {previewResult.tokenCount} tokens
              </span>
              <button
                onClick={() => handleCopy(previewResult.compiledPrompt)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
                title="复制Prompt"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`relative border border-gray-200 rounded-lg ${
            showCode ? 'bg-gray-900 text-green-400' : 'bg-gray-50'
          }`}>
            <pre className="p-4 text-sm whitespace-pre-wrap overflow-auto max-h-96">
              {previewResult.compiledPrompt}
            </pre>
          </div>
        </div>

        {/* 快速指标 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Token数量"
            value={previewResult.tokenCount}
            icon={Target}
            color="blue"
            suffix="个"
          />
          <MetricCard
            title="预估成本"
            value={previewResult.estimatedCost}
            icon={DollarSign}
            color="green"
            prefix="$"
            precision={4}
          />
          <MetricCard
            title="响应时间"
            value={previewResult.estimatedResponseTime}
            icon={Clock}
            color="purple"
            suffix="ms"
          />
          <MetricCard
            title="质量评分"
            value={previewResult.qualityScore * 100}
            icon={TrendingUp}
            color="orange"
            suffix="%"
            precision={1}
          />
        </div>
      </div>
    );
  };

  // 渲染性能指标
  const renderMetricsContent = () => {
    if (!previewResult) {
      return (
        <div className="p-6 text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4" />
          <p>编译后将显示详细性能指标</p>
        </div>
      );
    }

    const insights = getPerformanceInsights();
    const comparison = compareWithPrevious();

    return (
      <div className="p-6 space-y-6">
        {/* 性能洞察 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">性能洞察</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InsightCard
              title="Token效率"
              value={insights.tokenEfficiency}
              suffix="%"
              trend={insights.tokenEfficiency > 70 ? 'up' : 'down'}
              color={insights.tokenEfficiency > 70 ? 'green' : 'red'}
            />
            <InsightCard
              title="成本效率"
              value={insights.costEfficiency}
              suffix="%"
              trend={insights.costEfficiency > 70 ? 'up' : 'down'}
              color={insights.costEfficiency > 70 ? 'green' : 'red'}
            />
            <InsightCard
              title="质量评分"
              value={insights.qualityScore}
              suffix="%"
              trend={insights.qualityScore > 70 ? 'up' : 'down'}
              color={insights.qualityScore > 70 ? 'green' : 'red'}
            />
          </div>
        </div>

        {/* 详细指标 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">详细指标</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <MetricsTable metrics={previewResult.metrics} />
          </div>
        </div>

        {/* 变化对比 */}
        {comparison && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">与上次对比</h4>
            <div className="space-y-2">
              {comparison.changes.map((change, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    change.includes('增加') || change.includes('提升') ? 'bg-red-500' :
                    change.includes('减少') || change.includes('下降') ? 'bg-green-500' :
                    'bg-gray-400'
                  }`} />
                  <span className="text-gray-700">{change}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 推荐建议 */}
        {insights.recommendations.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">优化建议</h4>
            <div className="space-y-2">
              {insights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 渲染优化建议
  const renderSuggestionsContent = () => {
    if (!previewResult || previewResult.suggestions.length === 0) {
      return (
        <div className="p-6 text-center text-gray-500">
          <Lightbulb className="h-12 w-12 mx-auto mb-4" />
          <p>暂无优化建议</p>
        </div>
      );
    }

    return (
      <div className="p-6">
        <div className="space-y-4">
          {previewResult.suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              onApply={() => applyOptimization(suggestion)}
              onDismiss={() => dismissSuggestion(suggestion.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  // 渲染内容
  const renderContent = () => {
    switch (activeTab) {
      case 'metrics':
        return renderMetricsContent();
      case 'suggestions':
        return renderSuggestionsContent();
      default:
        return renderPreviewContent();
    }
  };

  return (
    <div className={`realtime-preview ${className}`}>
      {renderToolbar()}
      {layout !== 'minimal' && renderTabs()}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
};

// 指标卡片组件
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<any>;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  prefix?: string;
  suffix?: string;
  precision?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  prefix = '',
  suffix = '',
  precision = 0
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 mb-1">{title}</p>
          <p className="text-lg font-semibold text-gray-900">
            {prefix}{value.toFixed(precision)}{suffix}
          </p>
        </div>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};

// 洞察卡片组件
interface InsightCardProps {
  title: string;
  value: number;
  suffix?: string;
  trend: 'up' | 'down' | 'neutral';
  color: 'green' | 'red' | 'gray';
}

const InsightCard: React.FC<InsightCardProps> = ({
  title,
  value,
  suffix = '',
  trend,
  color
}) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    gray: 'text-gray-600'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-600">{title}</span>
        <TrendIcon className={`h-4 w-4 ${colorClasses[color]}`} />
      </div>
      <div className={`text-xl font-bold ${colorClasses[color]}`}>
        {value.toFixed(1)}{suffix}
      </div>
    </div>
  );
};

// 指标表格组件
interface MetricsTableProps {
  metrics: any;
}

const MetricsTable: React.FC<MetricsTableProps> = ({ metrics }) => {
  const sections = [
    {
      title: 'Token使用',
      items: [
        { label: 'Prompt Token', value: metrics.tokenUsage.prompt },
        { label: '完成 Token', value: metrics.tokenUsage.completion },
        { label: '总 Token', value: metrics.tokenUsage.total },
        { label: '使用率', value: `${metrics.tokenUsage.percentage.toFixed(1)}%` }
      ]
    },
    {
      title: '成本分析',
      items: [
        { label: '输入成本', value: `$${metrics.cost.input.toFixed(4)}` },
        { label: '输出成本', value: `$${metrics.cost.output.toFixed(4)}` },
        { label: '总成本', value: `$${metrics.cost.total.toFixed(4)}` }
      ]
    },
    {
      title: '时间消耗',
      items: [
        { label: '编译时间', value: `${metrics.time.compilation.toFixed(0)}ms` },
        { label: '注入时间', value: `${metrics.time.injection.toFixed(0)}ms` },
        { label: '压缩时间', value: `${metrics.time.compression.toFixed(0)}ms` },
        { label: '总时间', value: `${metrics.time.total.toFixed(0)}ms` }
      ]
    },
    {
      title: '质量指标',
      items: [
        { label: '清晰度', value: `${(metrics.quality.clarity * 100).toFixed(1)}%` },
        { label: '相关性', value: `${(metrics.quality.relevance * 100).toFixed(1)}%` },
        { label: '完整性', value: `${(metrics.quality.completeness * 100).toFixed(1)}%` },
        { label: '整体质量', value: `${(metrics.quality.overall * 100).toFixed(1)}%` }
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {sections.map((section) => (
        <div key={section.title}>
          <h5 className="text-sm font-medium text-gray-900 mb-3">{section.title}</h5>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// 建议卡片组件
interface SuggestionCardProps {
  suggestion: OptimizationSuggestion;
  onApply: () => void;
  onDismiss: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  suggestion,
  onApply,
  onDismiss
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return Zap;
      case 'cost':
        return DollarSign;
      case 'quality':
        return Target;
      case 'security':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'blue';
      case 'cost':
        return 'green';
      case 'quality':
        return 'purple';
      case 'security':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const Icon = getTypeIcon(suggestion.type);
  const color = getTypeColor(suggestion.type);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            color === 'blue' ? 'bg-blue-100 text-blue-600' :
            color === 'green' ? 'bg-green-100 text-green-600' :
            color === 'purple' ? 'bg-purple-100 text-purple-600' :
            color === 'red' ? 'bg-red-100 text-red-600' :
            'bg-gray-100 text-gray-600'
          }`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h5 className="text-sm font-medium text-gray-900">{suggestion.title}</h5>
            <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
          {suggestion.priority}
        </span>
      </div>

      {/* 影响预估 */}
      {suggestion.impact && Object.keys(suggestion.impact).length > 0 && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
          <h6 className="text-xs font-medium text-gray-700 mb-2">预期影响</h6>
          <div className="flex gap-4 text-xs">
            {suggestion.impact.tokenSaving && (
              <span className="text-green-600">
                节省 {suggestion.impact.tokenSaving} tokens
              </span>
            )}
            {suggestion.impact.costSaving && (
              <span className="text-green-600">
                节省 ${suggestion.impact.costSaving.toFixed(4)}
              </span>
            )}
            {suggestion.impact.qualityImprovement && (
              <span className="text-blue-600">
                质量提升 {(suggestion.impact.qualityImprovement * 100).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {suggestion.action.type === 'auto' ? '可自动应用' : '需要手动处理'}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            忽略
          </button>
          {suggestion.action.type === 'auto' ? (
            <button
              onClick={onApply}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              应用
            </button>
          ) : (
            <button
              onClick={() => {
                // 显示手动操作指导
                alert(suggestion.action.instruction);
              }}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              查看指导
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimePreview;