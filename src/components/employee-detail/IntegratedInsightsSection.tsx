/**
 * 整合智能洞察组件
 * 集成运行洞察、知识洞察和配置优化功能
 */

import React, { useState, useMemo } from 'react';
import {
  Brain,
  TrendingUp,
  Eye,
  Settings,
  Activity,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
  Zap,
  BarChart3,
  Network,
  Sparkles,
  Clock,
  Users,
  Download,
  RefreshCw,
  Filter,
  ArrowRight,
  Award,
  Shield,
  Cpu,
  BookOpen
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DigitalEmployee } from '../../types/employee';
import type { ConfigVersion, SmartSuggestion } from '../../services/VersionService';
import KnowledgeInsightsPanel from './KnowledgeInsightsPanel';

interface IntegratedInsightsSectionProps {
  employee: DigitalEmployee;
  onVersionRestore?: (version: ConfigVersion) => void;
  onSuggestionApply?: (suggestion: SmartSuggestion) => void;
}

// 智能洞察数据类型
interface SmartInsight {
  id: string;
  type: 'success' | 'warning' | 'opportunity' | 'risk';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendation?: string;
  metrics: string[];
  timestamp: Date;
  category: 'performance' | 'knowledge' | 'config';
}

// 性能指标类型
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  benchmark?: number;
  category: 'performance' | 'quality' | 'efficiency' | 'satisfaction';
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

const IntegratedInsightsSection: React.FC<IntegratedInsightsSectionProps> = ({
  employee,
  onVersionRestore,
  onSuggestionApply
}) => {
  const [activeTab, setActiveTab] = useState<'performance' | 'knowledge' | 'config'>('performance');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 生成运行洞察数据
  const performanceInsights: SmartInsight[] = [
    {
      id: 'perf-1',
      type: 'success',
      title: '响应时间持续优化',
      description: '过去7天响应时间下降15%，用户体验显著提升',
      impact: 'high',
      confidence: 0.92,
      recommendation: '继续保持当前优化策略，可考虑进一步精简Prompt长度',
      metrics: ['response_time', 'satisfaction'],
      timestamp: new Date(),
      category: 'performance'
    },
    {
      id: 'perf-2',
      type: 'opportunity',
      title: '知识库扩展机会',
      description: '检测到12个高频未解决问题，建议增加相关知识内容',
      impact: 'medium',
      confidence: 0.85,
      recommendation: '优先添加技术支持和产品功能相关的FAQ条目',
      metrics: ['success_rate', 'knowledge_usage'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'performance'
    },
    {
      id: 'perf-3',
      type: 'warning',
      title: '高峰时段性能压力',
      description: '工作日14:00-16:00时段响应时间明显增长',
      impact: 'medium',
      confidence: 0.78,
      recommendation: '考虑在高峰时段启用负载均衡或增加处理资源',
      metrics: ['response_time', 'throughput'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      category: 'performance'
    }
  ];

  // 生成配置洞察数据
  const configInsights: SmartInsight[] = [
    {
      id: 'config-1',
      type: 'opportunity',
      title: 'Prompt优化建议',
      description: '检测到当前Prompt可以优化，预计可提升15%的响应质量',
      impact: 'high',
      confidence: 0.88,
      recommendation: '建议采用更简洁的指令结构，减少冗余描述',
      metrics: ['response_quality', 'processing_time'],
      timestamp: new Date(),
      category: 'config'
    },
    {
      id: 'config-2',
      type: 'success',
      title: '版本配置稳定',
      description: '当前配置版本运行稳定，各项指标表现良好',
      impact: 'medium',
      confidence: 0.95,
      recommendation: '建议创建备份点，便于后续对比和回退',
      metrics: ['stability', 'performance'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      category: 'config'
    }
  ];

  // 合并所有洞察
  const allInsights = useMemo(() => {
    return [...performanceInsights, ...configInsights];
  }, []);

  // 过滤洞察
  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'all') return allInsights;
    return allInsights.filter(insight => insight.category === selectedCategory);
  }, [allInsights, selectedCategory]);

  // 性能指标数据
  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'response_time',
      name: '平均响应时间',
      value: 1.2,
      unit: '秒',
      trend: 'down',
      trendValue: -15,
      benchmark: 2.0,
      category: 'performance',
      status: 'excellent'
    },
    {
      id: 'success_rate',
      name: '成功处理率',
      value: 94.8,
      unit: '%',
      trend: 'up',
      trendValue: 2.3,
      benchmark: 90.0,
      category: 'quality',
      status: 'excellent'
    },
    {
      id: 'satisfaction',
      name: '用户满意度',
      value: 4.6,
      unit: '/5.0',
      trend: 'up',
      trendValue: 0.2,
      benchmark: 4.0,
      category: 'satisfaction',
      status: 'excellent'
    },
    {
      id: 'knowledge_usage',
      name: '知识库利用率',
      value: 87.3,
      unit: '%',
      trend: 'up',
      trendValue: 5.2,
      benchmark: 80.0,
      category: 'efficiency',
      status: 'excellent'
    }
  ];

  // 刷新洞察数据
  const handleRefresh = async () => {
    setRefreshing(true);
    // 模拟刷新过程
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // 获取洞察类型配置
  const getInsightTypeConfig = (type: string) => {
    switch (type) {
      case 'success':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'warning':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
      case 'opportunity':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Target };
      case 'risk':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Activity };
    }
  };

  // 获取状态配置
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-green-600', bgColor: 'bg-green-100' };
      case 'good':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100' };
      case 'warning':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'critical':
        return { color: 'text-red-600', bgColor: 'bg-red-100' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100' };
    }
  };

  // 渲染洞察卡片
  const InsightCard = ({ insight }: { insight: SmartInsight }) => {
    const config = getInsightTypeConfig(insight.type);
    const Icon = config.icon;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${config.bgColor} flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  insight.impact === 'high' ? 'bg-red-100 text-red-800' :
                  insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {insight.impact === 'high' ? '高影响' : insight.impact === 'medium' ? '中影响' : '低影响'}
                </span>
                <span className="text-xs text-gray-500">
                  {(insight.confidence * 100).toFixed(0)}%置信度
                </span>
              </div>
            </div>

            {insight.recommendation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>建议:</strong> {insight.recommendation}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">关联指标:</span>
                <div className="flex gap-1">
                  {insight.metrics.slice(0, 3).map(metricId => {
                    const metric = performanceMetrics.find(m => m.id === metricId);
                    return metric ? (
                      <span key={metricId} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {metric.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {insight.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染指标卡片
  const MetricCard = ({ metric }: { metric: PerformanceMetric }) => {
    const statusConfig = getStatusConfig(metric.status);
    const TrendIcon = metric.trend === 'up' ? TrendingUp : metric.trend === 'down' ? TrendingUp : Activity;
    const trendColor = metric.trend === 'up' ?
      (metric.trendValue > 0 ? 'text-green-600' : 'text-red-600') :
      metric.trend === 'down' ?
      (metric.trendValue > 0 ? 'text-red-600' : 'text-green-600') :
      'text-gray-600';

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
            <Activity className={`h-5 w-5 ${statusConfig.color}`} />
          </div>
          <div className="flex items-center gap-1">
            <TrendIcon className={`h-4 w-4 ${trendColor}`} />
            <span className={`text-sm font-medium ${trendColor}`}>
              {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}{metric.unit === '%' ? '%' : ''}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-600">{metric.name}</h4>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-gray-900">
              {metric.value}
            </span>
            <span className="text-sm text-gray-500">{metric.unit}</span>
          </div>

          {metric.benchmark && (
            <div className="text-xs text-gray-500">
              基准: {metric.benchmark}{metric.unit}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">智能洞察中心</h3>
            <p className="text-sm text-gray-600">全方位的智能分析与优化建议</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            刷新洞察
          </button>
          <button className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            导出报告
          </button>
        </div>
      </div>

      {/* Tab切换 */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            运行洞察
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            知识洞察
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            配置优化
          </TabsTrigger>
        </TabsList>

        {/* 运行洞察 */}
        <TabsContent value="performance" className="space-y-6 mt-6">
          {/* 筛选器 */}
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-500" />
            <div className="flex gap-2">
              {['all', 'performance', 'quality', 'efficiency', 'satisfaction'].map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? '全部' :
                   category === 'performance' ? '性能' :
                   category === 'quality' ? '质量' :
                   category === 'efficiency' ? '效率' : '满意度'}
                </button>
              ))}
            </div>
          </div>

          {/* 关键指标 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              关键指标概览
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map(metric => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>

          {/* 智能洞察 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              智能洞察分析
            </h4>
            <div className="space-y-4">
              {filteredInsights.filter(i => i.category === 'performance').map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 知识洞察 */}
        <TabsContent value="knowledge" className="mt-6">
          <KnowledgeInsightsPanel
            employee={employee}
            showAdvancedControls={true}
          />
        </TabsContent>

        {/* 配置优化 */}
        <TabsContent value="config" className="space-y-6 mt-6">
          {/* 配置洞察 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              配置优化建议
            </h4>
            <div className="space-y-4">
              {configInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          {/* 版本管理提示 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">版本管理</h4>
                <p className="text-sm text-blue-700 mt-1">
                  详细的版本管理和智能建议功能已移至"配置管理"标签页，您可以在那里进行完整的配置管理操作。
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedInsightsSection;