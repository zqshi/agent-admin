/**
 * 统一洞察中心组件
 * 整合运行洞察、知识洞察和配置优化功能，替代原有的分散组件
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Activity,
  Settings,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle,
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
  Flag,
  BookOpen,
  AlertCircle,
  Star,
  Eye,
  Calendar,
  Layers,
  Zap,
  PieChart
} from 'lucide-react';
import { DataSourceIndicator } from '../common';
import { knowledgeInsightService } from '../../services/KnowledgeInsightService';
import type { DigitalEmployee } from '../../types/employee';
import type { ConfigVersion, SmartSuggestion } from '../../services/VersionService';
import type {
  KnowledgeInsightReport,
  InnovationInsight,
  CapabilityGapAnalysis,
  InsightAnalysisState
} from '../../types/knowledge-insights';

interface InsightsCenterProps {
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

const InsightsCenter: React.FC<InsightsCenterProps> = ({
  employee,
  onVersionRestore,
  onSuggestionApply
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'knowledge' | 'config'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 知识洞察相关状态
  const [knowledgeReport, setKnowledgeReport] = useState<KnowledgeInsightReport | null>(null);
  const [analysisState, setAnalysisState] = useState<InsightAnalysisState>({
    status: 'idle',
    progress: 0,
    currentStage: ''
  });

  // 初始化加载知识洞察
  useEffect(() => {
    loadKnowledgeInsights();
  }, [employee.id]);

  // 加载知识洞察数据
  const loadKnowledgeInsights = async () => {
    setAnalysisState({
      status: 'analyzing',
      progress: 0,
      currentStage: '分析知识库内容...'
    });

    try {
      const stages = [
        '分析文档内容...',
        '检测创新指标...',
        '识别能力缺失...',
        '生成模式洞察...',
        '编制综合报告...'
      ];

      for (let i = 0; i < stages.length; i++) {
        setAnalysisState({
          status: 'analyzing',
          progress: (i + 1) / stages.length * 80,
          currentStage: stages[i]
        });
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const newReport = await knowledgeInsightService.generateInsightReport(employee);

      setAnalysisState({
        status: 'completed',
        progress: 100,
        currentStage: '分析完成',
        completionTime: new Date()
      });

      setKnowledgeReport(newReport);
    } catch (error) {
      setAnalysisState({
        status: 'error',
        progress: 0,
        currentStage: '分析失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  };

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

  // 配置与运营数据关联分析
  const configOperationalCorrelation = useMemo(() => {
    // 配置影响分析 - 分析配置对运营结果的影响
    const configImpactAnalysis = {
      promptEffectiveness: {
        current: employee.persona?.systemPrompt || '',
        metrics: {
          responseQuality: 0.85,
          processingSpeed: 0.78,
          userSatisfaction: 0.82,
          errorRate: 0.12
        },
        trend: 'improving', // improving, stable, declining
        lastOptimized: '2024-01-15',
        impactScore: 0.81 // 0-1, higher = better config impact
      },
      permissionOptimization: {
        currentScope: employee.permissions?.allowedTools?.length || 0,
        metrics: {
          accessEfficiency: 0.89,
          securityScore: 0.94,
          functionalCoverage: 0.76,
          overheadRatio: 0.23
        },
        trend: 'stable',
        lastAdjusted: '2024-01-10',
        impactScore: 0.87
      },
      domainConfiguration: {
        domainCount: employee.advancedConfig?.domains?.length || 0,
        metrics: {
          specialization: 0.72,
          versatility: 0.68,
          expertiseDepth: 0.84,
          knowledgeUtilization: 0.79
        },
        trend: 'improving',
        lastExpanded: '2024-01-12',
        impactScore: 0.76
      }
    };

    // 性能关联矩阵 - 显示配置设置与性能指标的关系
    const performanceCorrelationMatrix = [
      {
        configItem: 'System Prompt Length',
        currentValue: employee.persona?.systemPrompt?.length || 0,
        correlations: [
          { metric: 'Response Quality', correlation: -0.15, significance: 'low' }, // 负相关，越长质量稍降
          { metric: 'Processing Time', correlation: 0.23, significance: 'medium' }, // 正相关，越长处理越慢
          { metric: 'Context Understanding', correlation: 0.31, significance: 'high' } // 正相关，越详细理解越好
        ]
      },
      {
        configItem: 'Permission Scope',
        currentValue: employee.permissions?.allowedTools?.length || 0,
        correlations: [
          { metric: 'Task Completion Rate', correlation: 0.67, significance: 'high' },
          { metric: 'Security Incidents', correlation: -0.45, significance: 'medium' },
          { metric: 'User Satisfaction', correlation: 0.52, significance: 'high' }
        ]
      },
      {
        configItem: 'Domain Specialization',
        currentValue: employee.advancedConfig?.domains?.length || 1,
        correlations: [
          { metric: 'Expertise Depth', correlation: 0.78, significance: 'high' },
          { metric: 'Response Versatility', correlation: -0.34, significance: 'medium' },
          { metric: 'Knowledge Precision', correlation: 0.69, significance: 'high' }
        ]
      }
    ];

    // 运营反馈环路分析
    const operationalFeedback = {
      configAdjustmentSuggestions: [
        {
          source: 'performance_metrics',
          finding: '响应时间在高峰时段增长18%',
          configTarget: 'prompt_optimization',
          suggestion: '简化系统提示词，移除冗余指令',
          expectedImpact: '+12% response speed',
          confidence: 0.84,
          priority: 'high'
        },
        {
          source: 'user_feedback',
          finding: '用户反馈希望更多创意性回答',
          configTarget: 'personality_settings',
          suggestion: '调整创造性参数从0.7到0.8',
          expectedImpact: '+15% creativity score',
          confidence: 0.76,
          priority: 'medium'
        },
        {
          source: 'error_analysis',
          finding: '权限不足错误增长6%',
          configTarget: 'permission_scope',
          suggestion: '扩展数据分析工具访问权限',
          expectedImpact: '-25% permission errors',
          confidence: 0.91,
          priority: 'high'
        }
      ],
      adaptiveLearning: {
        totalAdjustments: 23,
        successfulOptimizations: 19,
        averageImprovement: '+8.4%',
        lastLearningCycle: '2024-01-14'
      }
    };

    // 趋势分析 - 配置有效性随时间变化
    const configEffectivenessTrends = {
      timeRange: '30_days',
      trends: [
        {
          configArea: 'Prompt Engineering',
          dataPoints: [
            { date: '2024-01-01', effectiveness: 0.72, adjustments: 2 },
            { date: '2024-01-08', effectiveness: 0.78, adjustments: 1 },
            { date: '2024-01-15', effectiveness: 0.85, adjustments: 3 },
            { date: '2024-01-22', effectiveness: 0.81, adjustments: 0 }
          ],
          overallTrend: 'improving'
        },
        {
          configArea: 'Permission Management',
          dataPoints: [
            { date: '2024-01-01', effectiveness: 0.89, adjustments: 0 },
            { date: '2024-01-08', effectiveness: 0.87, adjustments: 1 },
            { date: '2024-01-15', effectiveness: 0.91, adjustments: 2 },
            { date: '2024-01-22', effectiveness: 0.94, adjustments: 0 }
          ],
          overallTrend: 'stable'
        }
      ]
    };

    return {
      configImpactAnalysis,
      performanceCorrelationMatrix,
      operationalFeedback,
      configEffectivenessTrends
    };
  }, [employee]);

  // 配置洞察数据（保持原有结构但增强内容）
  const configInsights: SmartInsight[] = [
    {
      id: 'config-1',
      type: 'opportunity',
      title: 'Prompt优化建议',
      description: `基于${configOperationalCorrelation.operationalFeedback.configAdjustmentSuggestions[0].finding}，建议优化系统提示词`,
      impact: 'high',
      confidence: configOperationalCorrelation.operationalFeedback.configAdjustmentSuggestions[0].confidence,
      recommendation: configOperationalCorrelation.operationalFeedback.configAdjustmentSuggestions[0].suggestion,
      metrics: ['response_quality', 'processing_time'],
      timestamp: new Date(),
      category: 'config'
    },
    {
      id: 'config-2',
      type: 'success',
      title: '权限配置效果良好',
      description: `当前权限配置影响得分${configOperationalCorrelation.configImpactAnalysis.permissionOptimization.impactScore.toFixed(2)}，表现优秀`,
      impact: 'medium',
      confidence: 0.92,
      recommendation: '继续观察现有配置的表现',
      metrics: ['security_score', 'access_efficiency'],
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      category: 'config'
    },
    {
      id: 'config-3',
      type: 'warning',
      title: '域专业化需要关注',
      description: `域配置影响得分${configOperationalCorrelation.configImpactAnalysis.domainConfiguration.impactScore.toFixed(2)}，存在提升空间`,
      impact: 'medium',
      confidence: 0.79,
      recommendation: '考虑扩展专业域或优化现有域配置',
      metrics: ['expertise_depth', 'knowledge_utilization'],
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      category: 'config'
    }
  ];

  // 合并所有洞察
  const allInsights = useMemo(() => {
    return [...performanceInsights, ...configInsights];
  }, []);

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
    await loadKnowledgeInsights();
    // 模拟其他数据刷新
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
                <DataSourceIndicator
                  type="ai-generated"
                  size="sm"
                  variant="tooltip"
                  showIcon={true}
                />
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
          <div className="flex items-center gap-2">
            <DataSourceIndicator
              type="operational"
              size="sm"
              variant="tooltip"
              showIcon={true}
            />
            <div className="flex items-center gap-1">
              <TrendIcon className={`h-4 w-4 ${trendColor}`} />
              <span className={`text-sm font-medium ${trendColor}`}>
                {metric.trendValue > 0 ? '+' : ''}{metric.trendValue}{metric.unit === '%' ? '%' : ''}
              </span>
            </div>
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

  // Tab配置
  const tabs = [
    {
      id: 'overview',
      label: '综合概览',
      icon: BarChart3,
      description: '全方位洞察总览和关键指标汇总'
    },
    {
      id: 'performance',
      label: '运行洞察',
      icon: Activity,
      description: '性能指标分析和运营数据洞察'
    },
    {
      id: 'knowledge',
      label: '知识洞察',
      icon: Brain,
      description: '知识创新意识和能力缺失分析'
    },
    {
      id: 'config',
      label: '配置优化',
      icon: Settings,
      description: '配置优化建议和版本管理指导'
    }
  ];

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
          <DataSourceIndicator
            type="ai-generated"
            size="md"
            variant="badge"
            label="AI分析"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing || analysisState.status === 'analyzing'}
            className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${(refreshing || analysisState.status === 'analyzing') ? 'animate-spin' : ''}`} />
            刷新洞察
          </button>
          <button className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="h-4 w-4" />
            导出报告
          </button>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
        <div className="mt-3">
          <p className="text-sm text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Tab内容 */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 核心指标概览 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              核心指标概览
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {performanceMetrics.map(metric => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>

          {/* 知识洞察概览 */}
          {knowledgeReport && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                知识分析概览
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <Lightbulb className="h-8 w-8 text-blue-600" />
                    <DataSourceIndicator type="ai-generated" size="sm" variant="tooltip" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700">{knowledgeReport.summary.innovationScore}</div>
                  <div className="text-xs text-blue-600">创新指数</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-8 w-8 text-green-600" />
                    <DataSourceIndicator type="ai-generated" size="sm" variant="tooltip" />
                  </div>
                  <div className="text-2xl font-bold text-green-700">{knowledgeReport.summary.capabilityScore}</div>
                  <div className="text-xs text-green-600">能力水平</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <Shield className="h-8 w-8 text-purple-600" />
                    <DataSourceIndicator type="ai-generated" size="sm" variant="tooltip" />
                  </div>
                  <div className="text-2xl font-bold text-purple-700">{knowledgeReport.summary.overallHealthScore}</div>
                  <div className="text-xs text-purple-600">健康指数</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <Flag className="h-8 w-8 text-orange-600" />
                    <DataSourceIndicator type="ai-generated" size="sm" variant="tooltip" />
                  </div>
                  <div className="text-2xl font-bold text-orange-700">{knowledgeReport.summary.highPriorityInsights}</div>
                  <div className="text-xs text-orange-600">优先级洞察</div>
                </div>
              </div>
            </div>
          )}

          {/* 最新洞察 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              最新洞察
            </h4>
            <div className="space-y-4">
              {allInsights.slice(0, 3).map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-6">
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

          {/* 运行洞察 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              智能洞察分析
            </h4>
            <div className="space-y-4">
              {performanceInsights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {/* 分析状态 */}
          {(analysisState.status === 'analyzing' || analysisState.status === 'error') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-500" />
                  智能洞察分析
                </h4>
                {analysisState.status === 'analyzing' && (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>

              {analysisState.status === 'analyzing' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{analysisState.currentStage}</span>
                    <span className="text-blue-600 font-medium">{Math.round(analysisState.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${analysisState.progress}%` }}
                    />
                  </div>
                </div>
              )}

              {analysisState.status === 'error' && (
                <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-red-700 font-medium">分析失败</p>
                    <p className="text-red-600 text-sm">{analysisState.error}</p>
                  </div>
                  <button
                    onClick={loadKnowledgeInsights}
                    className="ml-auto px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  >
                    重试
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 知识洞察内容 */}
          {analysisState.status === 'completed' && knowledgeReport && (
            <div className="space-y-6">
              {/* 综合分析 */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  综合分析
                  <DataSourceIndicator type="ai-generated" size="sm" variant="inline" />
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h5 className="font-medium text-green-800 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      优势领域
                    </h5>
                    {knowledgeReport.comprehensiveAnalysis.strengthAreas.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded border border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-green-700 text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-orange-800 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      改进领域
                    </h5>
                    {knowledgeReport.comprehensiveAnalysis.improvementAreas.map((area, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-orange-50 rounded border border-orange-200">
                        <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span className="text-orange-700 text-sm">{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 空状态 */}
          {analysisState.status === 'idle' && !knowledgeReport && (
            <div className="text-center py-12 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>点击"刷新洞察"开始深度知识分析</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-6">
          {/* 配置影响分析总览 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Prompt效能</h4>
                </div>
                <DataSourceIndicator type="config" variant="inline" size="sm" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">影响得分</span>
                  <span className="font-semibold text-blue-900">
                    {(configOperationalCorrelation.configImpactAnalysis.promptEffectiveness.impactScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${configOperationalCorrelation.configImpactAnalysis.promptEffectiveness.impactScore * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>趋势: {configOperationalCorrelation.configImpactAnalysis.promptEffectiveness.trend === 'improving' ? '📈 改善' : configOperationalCorrelation.configImpactAnalysis.promptEffectiveness.trend === 'stable' ? '📊 稳定' : '📉 下降'}</span>
                  <span>更新: {configOperationalCorrelation.configImpactAnalysis.promptEffectiveness.lastOptimized}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-900">权限配置</h4>
                </div>
                <DataSourceIndicator type="config" variant="inline" size="sm" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">影响得分</span>
                  <span className="font-semibold text-green-900">
                    {(configOperationalCorrelation.configImpactAnalysis.permissionOptimization.impactScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${configOperationalCorrelation.configImpactAnalysis.permissionOptimization.impactScore * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>工具数: {configOperationalCorrelation.configImpactAnalysis.permissionOptimization.currentScope}</span>
                  <span>调整: {configOperationalCorrelation.configImpactAnalysis.permissionOptimization.lastAdjusted}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h4 className="font-medium text-purple-900">域专业化</h4>
                </div>
                <DataSourceIndicator type="config" variant="inline" size="sm" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">影响得分</span>
                  <span className="font-semibold text-purple-900">
                    {(configOperationalCorrelation.configImpactAnalysis.domainConfiguration.impactScore * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${configOperationalCorrelation.configImpactAnalysis.domainConfiguration.impactScore * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>域数: {configOperationalCorrelation.configImpactAnalysis.domainConfiguration.domainCount}</span>
                  <span>扩展: {configOperationalCorrelation.configImpactAnalysis.domainConfiguration.lastExpanded}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 性能关联矩阵 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Network className="h-4 w-4" />
              配置-性能关联矩阵
              <DataSourceIndicator type="mixed" variant="inline" size="sm" />
            </h4>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">配置项</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前值</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">相关性分析</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {configOperationalCorrelation.performanceCorrelationMatrix.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.configItem}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.currentValue}</td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            {item.correlations.map((corr, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">{corr.metric}</span>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded ${
                                    corr.correlation > 0.5 ? 'bg-green-100 text-green-800' :
                                    corr.correlation > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                                    corr.correlation < -0.2 ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {corr.correlation > 0 ? '+' : ''}{(corr.correlation * 100).toFixed(0)}%
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                                    corr.significance === 'high' ? 'bg-red-100 text-red-700' :
                                    corr.significance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {corr.significance}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 运营反馈与建议 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              运营反馈环路
              <DataSourceIndicator type="operational" variant="inline" size="sm" />
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">配置调整建议</h5>
                {configOperationalCorrelation.operationalFeedback.configAdjustmentSuggestions.map((suggestion, index) => (
                  <div key={index} className={`border rounded-lg p-3 ${
                    suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                    suggestion.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                    'border-green-200 bg-green-50'
                  }`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded ${
                          suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {suggestion.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">来源: {suggestion.source}</span>
                      </div>
                      <span className="text-xs text-gray-500">置信度: {(suggestion.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-800">发现: {suggestion.finding}</p>
                      <p className="text-sm text-gray-600">建议: {suggestion.suggestion}</p>
                      <p className="text-sm font-medium text-green-700">预期影响: {suggestion.expectedImpact}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="text-sm font-medium text-gray-700 mb-3">自适应学习统计</h5>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {configOperationalCorrelation.operationalFeedback.adaptiveLearning.totalAdjustments}
                    </div>
                    <div className="text-xs text-gray-500">总调整次数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {configOperationalCorrelation.operationalFeedback.adaptiveLearning.successfulOptimizations}
                    </div>
                    <div className="text-xs text-gray-500">成功优化</div>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="text-lg font-bold text-blue-600">
                      {configOperationalCorrelation.operationalFeedback.adaptiveLearning.averageImprovement}
                    </div>
                    <div className="text-xs text-gray-500">平均改善</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 配置洞察 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              智能配置优化建议
              <DataSourceIndicator type="ai-generated" variant="inline" size="sm" />
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
                  详细的版本管理和智能建议功能已移至"基础配置"标签页，您可以在那里进行完整的配置管理操作。
                </p>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsCenter;