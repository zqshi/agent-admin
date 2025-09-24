/**
 * 增强版运行分析组件 - 整合指标监控与智能洞察
 * 提供全面的性能分析和AI驱动的优化建议
 */

import React, { useState } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  Brain,
  Target,
  Zap,
  Eye,
  Filter,
  Calendar,
  Download
} from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';
import { Card, CardHeader, CardBody, Button, Badge } from '../ui';

interface EnhancedMetricsSectionProps {
  employee: DigitalEmployee;
}

// 性能指标类型定义
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
  icon: React.ComponentType<{ className?: string }>;
}

// 智能洞察类型
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
}

const EnhancedMetricsSection: React.FC<EnhancedMetricsSectionProps> = ({ employee }) => {
  const [activeView, setActiveView] = useState<'overview' | 'detailed' | 'insights' | 'trends'>('overview');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 生成性能指标数据
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
      status: 'excellent',
      icon: Clock
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
      status: 'excellent',
      icon: CheckCircle
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
      status: 'excellent',
      icon: Users
    },
    {
      id: 'throughput',
      name: '处理吞吐量',
      value: 156,
      unit: '请求/小时',
      trend: 'up',
      trendValue: 12,
      benchmark: 120,
      category: 'efficiency',
      status: 'good',
      icon: TrendingUp
    },
    {
      id: 'error_rate',
      name: '错误率',
      value: 2.1,
      unit: '%',
      trend: 'down',
      trendValue: -0.8,
      benchmark: 5.0,
      category: 'quality',
      status: 'good',
      icon: AlertTriangle
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
      status: 'excellent',
      icon: Brain
    }
  ];

  // 生成智能洞察数据
  const smartInsights: SmartInsight[] = [
    {
      id: 'insight-1',
      type: 'success',
      title: '响应时间持续优化',
      description: '过去7天响应时间下降15%，用户体验显著提升',
      impact: 'high',
      confidence: 0.92,
      recommendation: '继续保持当前优化策略，可考虑进一步精简Prompt长度',
      metrics: ['response_time', 'satisfaction'],
      timestamp: new Date()
    },
    {
      id: 'insight-2',
      type: 'opportunity',
      title: '知识库扩展机会',
      description: '检测到12个高频未解决问题，建议增加相关知识内容',
      impact: 'medium',
      confidence: 0.85,
      recommendation: '优先添加技术支持和产品功能相关的FAQ条目',
      metrics: ['success_rate', 'knowledge_usage'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
    },
    {
      id: 'insight-3',
      type: 'warning',
      title: '高峰时段性能压力',
      description: '工作日14:00-16:00时段响应时间明显增长',
      impact: 'medium',
      confidence: 0.78,
      recommendation: '考虑在高峰时段启用负载均衡或增加处理资源',
      metrics: ['response_time', 'throughput'],
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
    }
  ];

  // 获取状态颜色和图标
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'excellent':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle };
      case 'good':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: TrendingUp };
      case 'warning':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle };
      case 'critical':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Activity };
    }
  };

  // 获取趋势图标和颜色
  const getTrendConfig = (trend: string, value: number) => {
    if (trend === 'up') {
      return {
        icon: TrendingUp,
        color: value > 0 ? 'text-green-600' : 'text-red-600',
        prefix: '+'
      };
    } else if (trend === 'down') {
      return {
        icon: TrendingDown,
        color: value > 0 ? 'text-red-600' : 'text-green-600',
        prefix: ''
      };
    } else {
      return {
        icon: Activity,
        color: 'text-gray-600',
        prefix: ''
      };
    }
  };

  // 渲染指标卡片
  const MetricCard = ({ metric }: { metric: PerformanceMetric }) => {
    const statusConfig = getStatusConfig(metric.status);
    const trendConfig = getTrendConfig(metric.trend, metric.trendValue);
    const Icon = metric.icon;
    const TrendIcon = trendConfig.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardBody className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
              <Icon className={`h-6 w-6 ${statusConfig.color}`} />
            </div>
            <div className="flex items-center gap-1">
              <TrendIcon className={`h-4 w-4 ${trendConfig.color}`} />
              <span className={`text-sm font-medium ${trendConfig.color}`}>
                {trendConfig.prefix}{Math.abs(metric.trendValue)}{metric.unit === '%' ? '%' : ''}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">{metric.name}</h4>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {metric.value}
              </span>
              <span className="text-sm text-gray-500">{metric.unit}</span>
            </div>

            {metric.benchmark && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">基准: {metric.benchmark}{metric.unit}</span>
                <Badge variant={metric.value >= metric.benchmark ? 'success' : 'warning'}>
                  {metric.value >= metric.benchmark ? '达标' : '待优化'}
                </Badge>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    );
  };

  // 渲染洞察卡片
  const InsightCard = ({ insight }: { insight: SmartInsight }) => {
    const typeConfig = {
      success: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
      warning: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: AlertTriangle },
      opportunity: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Target },
      risk: { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertTriangle }
    };

    const config = typeConfig[insight.type];
    const Icon = config.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardBody className="p-6">
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
                  <Badge variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'neutral'}>
                    {insight.impact === 'high' ? '高影响' : insight.impact === 'medium' ? '中影响' : '低影响'}
                  </Badge>
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
                        <Badge key={metricId} variant="secondary" className="text-xs">
                          {metric.name}
                        </Badge>
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
        </CardBody>
      </Card>
    );
  };

  // 渲染内容区域
  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* 关键指标网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {performanceMetrics.slice(0, 6).map(metric => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>

            {/* 快速洞察 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">实时洞察</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveView('insights')}
                  >
                    查看全部
                  </Button>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {smartInsights.slice(0, 2).map(insight => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </CardBody>
            </Card>
          </div>
        );

      case 'detailed':
        return (
          <div className="space-y-6">
            {/* 分类筛选 */}
            <Card>
              <CardBody className="p-4">
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
              </CardBody>
            </Card>

            {/* 详细指标 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {performanceMetrics
                .filter(metric => selectedCategory === 'all' || metric.category === selectedCategory)
                .map(metric => (
                  <MetricCard key={metric.id} metric={metric} />
                ))}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold">智能洞察分析</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">自动更新</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            <div className="space-y-4">
              {smartInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        );

      case 'trends':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LineChart className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold">趋势分析</h3>
              </div>
              <div className="flex gap-2">
                {(['24h', '7d', '30d', '90d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      timeRange === range
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <Card>
              <CardBody className="p-8 text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-700 mb-2">趋势图表开发中</h4>
                <p className="text-gray-500 mb-4">即将提供详细的性能趋势分析图表</p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>时间序列分析</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>性能预测</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <PieChart className="h-4 w-4" />
                    <span>分布分析</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">运行分析</h3>
            <p className="text-sm text-gray-600">全面的性能监控与智能洞察</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4 mr-1" />
            导出报告
          </Button>
          <Button variant="ghost" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            设置监控
          </Button>
        </div>
      </div>

      {/* 视图切换标签 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: '总览', icon: BarChart3 },
            { id: 'detailed', label: '详细指标', icon: Activity },
            { id: 'insights', label: '智能洞察', icon: Brain },
            { id: 'trends', label: '趋势分析', icon: LineChart }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="min-h-[600px]">
        {renderContent()}
      </div>
    </div>
  );
};

export default EnhancedMetricsSection;