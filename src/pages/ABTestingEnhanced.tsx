import { useState, useEffect } from 'react';
import { 
  Plus, Play, Trophy, BarChart3, TrendingUp, Users, Clock, 
  Brain, Target, AlertTriangle, CheckCircle, XCircle,
  Settings, Eye, Zap, Activity
} from 'lucide-react';
import { ABTest, BayesianAnalysis, ComplexityAssessment } from '../types';
import ExperimentWizard from '../components/ExperimentWizard';
import CreateExperiment from '../components/CreateExperiment';

// 模拟增强的A/B测试数据
const mockEnhancedABTests: ABTest[] = [
  {
    id: '1',
    name: '智能问答模型优化',
    description: '测试GPT-4与Claude-3在企业问答场景下的效果对比',
    status: 'running',
    startDate: '2024-01-15',
    groups: [
      {
        id: 'control',
        name: '对照组 (GPT-4)',
        trafficRatio: 50,
        config: {
          model: 'gpt-4-turbo',
          temperature: 0.7,
          seed: 12345
        },
        realTimeMetrics: {
          currentSessions: 1247,
          totalSessions: 5680,
          conversionRate: 78.5,
          avgMetricValues: {
            taskSuccessRate: 75.2,
            avgResponseTime: 2.8,
            userSatisfaction: 4.2
          },
          costSpent: 234.56,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组 (Claude-3)',
        trafficRatio: 50,
        config: {
          model: 'claude-3-opus',
          temperature: 0.7,
          seed: 12345
        },
        realTimeMetrics: {
          currentSessions: 1189,
          totalSessions: 5420,
          conversionRate: 82.3,
          avgMetricValues: {
            taskSuccessRate: 81.7,
            avgResponseTime: 2.1,
            userSatisfaction: 4.6
          },
          costSpent: 187.23,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 78.5,
        userValueDensity: 2.3,
        retentionRate7d: 0.68,
        retentionRate30d: 0.45,
        userActivation: 0.72
      },
      supportMetrics: {
        effectiveInteractionDepth: 3.2,
        clarificationRequestRatio: 0.15,
        firstResponseHitRate: 0.82,
        timeToResolution: 156,
        knowledgeCoverage: 0.87
      },
      technicalMetrics: {
        totalSessions: 11100,
        successRate: 78.5,
        avgResponseTime: 2.45,
        p95ResponseTime: 4.8,
        avgTokenCost: 0.023,
        tokenCostPerSession: 0.38,
        retryRate: 0.08,
        earlyExitRate: 0.12,
        toolCallSuccessRate: 0.94,
        modelFailureRate: 0.02
      }
    },
    config: {
      splittingStrategy: 'session',
      stratificationDimensions: ['user_segment', 'time_of_day'],
      environmentControl: {
        fixedSeed: 12345,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'medium',
      budget: {
        maxCost: 1000,
        currentSpent: 421.79
      }
    },
    statisticalAnalysis: {
      pValue: 0.032,
      effectSize: 0.34,
      confidenceInterval: [0.12, 0.56],
      practicalSignificance: true,
      statisticalSignificance: true,
      bayesianResults: {
        probabilityABeatsB: 0.87,
        expectedLift: 0.164,
        credibleInterval: [0.08, 0.25],
        shouldStop: false,
        recommendation: '继续观察，实验组表现更优但需要更多数据确认'
      },
      recommendation: 'continue'
    },
    explainability: {
      featureImportance: {
        'response_quality': 0.42,
        'response_speed': 0.28,
        'tool_usage': 0.18,
        'context_understanding': 0.12
      },
      successfulPaths: [],
      failurePaths: [],
      causalEffects: []
    }
  }
];

const ABTestingEnhanced = () => {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'analysis' | 'insights'>('overview');
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showCreateExperiment, setShowCreateExperiment] = useState(false);
  const [experiments, setExperiments] = useState<ABTest[]>(mockEnhancedABTests);

  // 模拟实时数据更新
  useEffect(() => {
    if (!realTimeUpdate) return;
    
    const interval = setInterval(() => {
      // 这里可以实现实时数据更新逻辑
      console.log('Updating real-time metrics...');
    }, 5000);

    return () => clearInterval(interval);
  }, [realTimeUpdate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'stop_a_wins': return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'stop_b_wins': return <Trophy className="h-4 w-4 text-green-500" />;
      case 'continue': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">A/B测试平台 2.0</h1>
          <p className="text-gray-600 mt-2">基于贝叶斯统计的智能实验分析平台</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              console.log('点击实验向导按钮');
              setShowWizard(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            实验向导
          </button>
          <button 
            onClick={() => {
              console.log('点击创建实验按钮');
              setShowCreateExperiment(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            创建实验
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 实验列表 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">实验列表</h3>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  实时更新
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {mockEnhancedABTests.map((test) => (
                <div
                  key={test.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedTest?.id === test.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                  }`}
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">{test.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(test.status)}`}>
                      {test.status === 'running' ? '运行中' : 
                       test.status === 'completed' ? '已完成' : 
                       test.status === 'paused' ? '已暂停' : '草稿'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{test.description}</p>
                  
                  {/* 关键指标预览 */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">任务成功率</div>
                      <div className="font-semibold">{test.metrics.businessMetrics.taskSuccessRate}%</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-gray-500">成本效率</div>
                      <div className="font-semibold">${test.metrics.technicalMetrics.tokenCostPerSession}</div>
                    </div>
                  </div>
                  
                  {/* 统计分析状态 */}
                  {test.statisticalAnalysis && (
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center">
                        {getRecommendationIcon(test.statisticalAnalysis.recommendation)}
                        <span className="text-xs text-gray-600 ml-1">
                          {test.statisticalAnalysis.bayesianResults?.probabilityABeatsB 
                            ? `${Math.round(test.statisticalAnalysis.bayesianResults.probabilityABeatsB * 100)}% 胜率`
                            : '分析中'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        预算: {Math.round((test.config.budget.currentSpent / (test.config.budget.maxCost || 1)) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          {selectedTest ? (
            <div className="space-y-6">
              {/* 实验概览卡片 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{selectedTest.name}</h3>
                    <p className="text-gray-600 mb-4">{selectedTest.description}</p>
                    
                    {/* 实验配置信息 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-blue-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-500">分流策略</div>
                          <div className="font-medium">{selectedTest.config.splittingStrategy === 'session' ? '会话级' : '用户级'}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Brain className="h-4 w-4 text-purple-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-500">复杂度</div>
                          <div className="font-medium capitalize">{selectedTest.config.complexityLevel}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Target className="h-4 w-4 text-green-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-500">固定种子</div>
                          <div className="font-medium">{selectedTest.config.environmentControl.fixedSeed}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-orange-500 mr-2" />
                        <div className="text-sm">
                          <div className="text-gray-500">温度参数</div>
                          <div className="font-medium">{selectedTest.config.environmentControl.temperature}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* 实验状态和决策建议 */}
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${getStatusColor(selectedTest.status)}`}>
                      {selectedTest.status === 'running' ? '运行中' : selectedTest.status}
                    </span>
                    
                    {selectedTest.statisticalAnalysis && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          {getRecommendationIcon(selectedTest.statisticalAnalysis.recommendation)}
                          <span className="text-sm font-medium text-blue-900 ml-2">贝叶斯分析</span>
                        </div>
                        <div className="text-xs text-blue-700">
                          胜率: {Math.round((selectedTest.statisticalAnalysis.bayesianResults?.probabilityABeatsB || 0) * 100)}%
                        </div>
                        <div className="text-xs text-blue-700">
                          效果量: {selectedTest.statisticalAnalysis.effectSize.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 标签导航 */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', name: '概览', icon: BarChart3 },
                      { id: 'metrics', name: '三层指标', icon: Target },
                      { id: 'analysis', name: '统计分析', icon: TrendingUp },
                      { id: 'insights', name: '洞察分析', icon: Eye }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <tab.icon className="h-4 w-4 mr-2" />
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* 标签内容 */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    <ExperimentOverview test={selectedTest} />
                  )}
                  {activeTab === 'metrics' && (
                    <ThreeTierMetrics metrics={selectedTest.metrics} />
                  )}
                  {activeTab === 'analysis' && (
                    <StatisticalAnalysis analysis={selectedTest.statisticalAnalysis} groups={selectedTest.groups} />
                  )}
                  {activeTab === 'insights' && (
                    <ExplainabilityInsights explainability={selectedTest.explainability} />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个实验开始分析</h3>
              <p className="text-gray-500">从左侧列表中选择一个实验来查看详细的分析结果</p>
            </div>
          )}
        </div>
      </div>

      {/* 实验设计向导 */}
      {showWizard && (
        <ExperimentWizard 
          onClose={() => setShowWizard(false)}
          onCreateExperiment={(config) => {
            setShowWizard(false);
            setShowCreateExperiment(true);
            // 可以将向导的配置传给创建组件
          }}
        />
      )}
      
      {/* 创建实验界面 */}
      {showCreateExperiment && (
        <CreateExperiment
          onClose={() => setShowCreateExperiment(false)}
          onSave={(experiment) => {
            // 添加新实验到列表
            setExperiments(prev => [experiment, ...prev]);
            setShowCreateExperiment(false);
            // 自动选中新创建的实验
            setSelectedTest(experiment);
          }}
        />
      )}
    </div>
  );
};

// 实验概览组件
const ExperimentOverview = ({ test }: { test: ABTest }) => (
  <div className="space-y-6">
    {/* 实验组对比 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {test.groups.map((group) => (
        <div key={group.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">{group.name}</h4>
            <span className="text-sm text-gray-500">{group.trafficRatio}% 流量</span>
          </div>
          
          {/* 实时指标 */}
          {group.realTimeMetrics && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">当前会话</div>
                <div className="text-lg font-semibold text-gray-900">{group.realTimeMetrics.currentSessions.toLocaleString()}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">转化率</div>
                <div className="text-lg font-semibold text-gray-900">{group.realTimeMetrics.conversionRate}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">已花费</div>
                <div className="text-lg font-semibold text-gray-900">${group.realTimeMetrics.costSpent}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-500">满意度</div>
                <div className="text-lg font-semibold text-gray-900">{group.realTimeMetrics.avgMetricValues.userSatisfaction}</div>
              </div>
            </div>
          )}
          
          {/* 配置信息 */}
          <div className="text-sm text-gray-600">
            <div>模型: {group.config.model}</div>
            <div>温度: {group.config.temperature}</div>
            <div>种子: {group.config.seed}</div>
          </div>
        </div>
      ))}
    </div>

    {/* 预算使用情况 */}
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
      <h4 className="font-semibold text-gray-900 mb-4">预算使用情况</h4>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">已使用 ${test.config.budget.currentSpent} / ${test.config.budget.maxCost}</span>
        <span className="text-sm text-gray-600">
          {Math.round((test.config.budget.currentSpent / (test.config.budget.maxCost || 1)) * 100)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full" 
          style={{ width: `${Math.round((test.config.budget.currentSpent / (test.config.budget.maxCost || 1)) * 100)}%` }}
        ></div>
      </div>
      {test.config.budget.currentSpent / (test.config.budget.maxCost || 1) > 0.8 && (
        <div className="flex items-center mt-2 text-orange-600">
          <AlertTriangle className="h-4 w-4 mr-1" />
          <span className="text-sm">预算即将耗尽，建议调整或增加预算</span>
        </div>
      )}
    </div>
  </div>
);

// 三层指标展示组件
const ThreeTierMetrics = ({ metrics }: { metrics: ABTest['metrics'] }) => (
  <div className="space-y-8">
    {/* L1 核心业务指标 */}
    <div>
      <div className="flex items-center mb-4">
        <Target className="h-5 w-5 text-green-600 mr-2" />
        <h4 className="text-lg font-semibold text-gray-900">L1 核心业务指标</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard 
          title="任务完成率" 
          value={`${metrics.businessMetrics.taskSuccessRate}%`}
          trend="+2.3%"
          color="green"
        />
        <MetricCard 
          title="用户价值密度" 
          value={metrics.businessMetrics.userValueDensity.toFixed(1)}
          trend="+0.4"
          color="green"
        />
        <MetricCard 
          title="7日留存率" 
          value={`${Math.round(metrics.businessMetrics.retentionRate7d * 100)}%`}
          trend="+1.2%"
          color="green"
        />
        <MetricCard 
          title="30日留存率" 
          value={`${Math.round(metrics.businessMetrics.retentionRate30d * 100)}%`}
          trend="+0.8%"
          color="green"
        />
        <MetricCard 
          title="新用户激活率" 
          value={`${Math.round(metrics.businessMetrics.userActivation * 100)}%`}
          trend="+3.1%"
          color="green"
        />
      </div>
    </div>

    {/* L2 支撑分析指标 */}
    <div>
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
        <h4 className="text-lg font-semibold text-gray-900">L2 支撑分析指标</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard 
          title="有效交互深度" 
          value={metrics.supportMetrics.effectiveInteractionDepth.toFixed(1)}
          trend="+0.3"
          color="blue"
        />
        <MetricCard 
          title="澄清请求比例" 
          value={`${Math.round(metrics.supportMetrics.clarificationRequestRatio * 100)}%`}
          trend="-2.1%"
          color="green"
        />
        <MetricCard 
          title="首次命中率" 
          value={`${Math.round(metrics.supportMetrics.firstResponseHitRate * 100)}%`}
          trend="+4.2%"
          color="green"
        />
        <MetricCard 
          title="问题解决时间" 
          value={`${metrics.supportMetrics.timeToResolution}s`}
          trend="-12s"
          color="green"
        />
        <MetricCard 
          title="知识覆盖度" 
          value={`${Math.round(metrics.supportMetrics.knowledgeCoverage * 100)}%`}
          trend="+1.8%"
          color="green"
        />
      </div>
    </div>

    {/* L3 技术监控指标 */}
    <div>
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 text-purple-600 mr-2" />
        <h4 className="text-lg font-semibold text-gray-900">L3 技术监控指标</h4>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          title="总会话数" 
          value={metrics.technicalMetrics.totalSessions.toLocaleString()}
          trend="+234"
          color="purple"
        />
        <MetricCard 
          title="成功率" 
          value={`${metrics.technicalMetrics.successRate}%`}
          trend="+1.2%"
          color="green"
        />
        <MetricCard 
          title="平均响应时间" 
          value={`${metrics.technicalMetrics.avgResponseTime}s`}
          trend="-0.3s"
          color="green"
        />
        <MetricCard 
          title="P95响应时间" 
          value={`${metrics.technicalMetrics.p95ResponseTime}s`}
          trend="-0.8s"
          color="green"
        />
        <MetricCard 
          title="Token成本/会话" 
          value={`$${metrics.technicalMetrics.tokenCostPerSession}`}
          trend="-$0.02"
          color="green"
        />
        <MetricCard 
          title="重试率" 
          value={`${Math.round(metrics.technicalMetrics.retryRate * 100)}%`}
          trend="-1.1%"
          color="green"
        />
        <MetricCard 
          title="早期退出率" 
          value={`${Math.round(metrics.technicalMetrics.earlyExitRate * 100)}%`}
          trend="-0.8%"
          color="green"
        />
        <MetricCard 
          title="工具调用成功率" 
          value={`${Math.round(metrics.technicalMetrics.toolCallSuccessRate * 100)}%`}
          trend="+1.5%"
          color="green"
        />
      </div>
    </div>
  </div>
);

// 指标卡片组件
const MetricCard = ({ title, value, trend, color }: { 
  title: string; 
  value: string; 
  trend: string; 
  color: 'green' | 'blue' | 'purple' | 'red';
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    red: 'border-red-200 bg-red-50'
  };

  const trendColor = trend.startsWith('+') || trend.startsWith('-') 
    ? (trend.startsWith('+') ? 'text-green-600' : 'text-red-600')
    : 'text-gray-600';

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className={`text-sm ${trendColor}`}>{trend}</div>
    </div>
  );
};

// 统计分析组件
const StatisticalAnalysis = ({ analysis, groups }: { 
  analysis?: ABTest['statisticalAnalysis']; 
  groups: ABTest['groups'];
}) => {
  if (!analysis) return <div>暂无统计分析数据</div>;

  return (
    <div className="space-y-6">
      {/* 贝叶斯分析结果 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">贝叶斯统计分析</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((analysis.bayesianResults?.probabilityABeatsB || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600">实验组胜率</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +{Math.round((analysis.bayesianResults?.expectedLift || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600">预期提升</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analysis.effectSize.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">效果量 (Cohen's d)</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">可信区间 (95%)</span>
            <span className="text-sm font-medium">
              [{(analysis.bayesianResults?.credibleInterval[0] || 0).toFixed(2)}, 
               {(analysis.bayesianResults?.credibleInterval[1] || 0).toFixed(2)}]
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <strong>建议：</strong> {analysis.bayesianResults?.recommendation}
          </div>
        </div>
      </div>

      {/* 频率学派分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-4">频率学派检验</h5>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">P值</span>
              <span className="font-medium">{analysis.pValue.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">统计显著性</span>
              <span className={`font-medium ${analysis.statisticalSignificance ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.statisticalSignificance ? '✓ 显著' : '✗ 不显著'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">实际意义</span>
              <span className={`font-medium ${analysis.practicalSignificance ? 'text-green-600' : 'text-red-600'}`}>
                {analysis.practicalSignificance ? '✓ 有意义' : '✗ 无意义'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-4">决策矩阵</h5>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className={`p-2 rounded text-center ${
              analysis.statisticalSignificance && analysis.practicalSignificance 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              显著 + 有意义<br/>
              <strong>推荐上线</strong>
            </div>
            <div className={`p-2 rounded text-center ${
              analysis.statisticalSignificance && !analysis.practicalSignificance
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              显著 + 无意义<br/>
              <strong>不建议</strong>
            </div>
            <div className={`p-2 rounded text-center ${
              !analysis.statisticalSignificance && analysis.practicalSignificance
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              不显著 + 有意义<br/>
              <strong>继续观察</strong>
            </div>
            <div className={`p-2 rounded text-center ${
              !analysis.statisticalSignificance && !analysis.practicalSignificance
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-600'
            }`}>
              不显著 + 无意义<br/>
              <strong>停止实验</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 可解释性洞察组件
const ExplainabilityInsights = ({ explainability }: { explainability?: ABTest['explainability'] }) => {
  if (!explainability) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无洞察分析数据</h3>
        <p className="text-gray-500">实验数据尚未达到分析阈值，请等待更多数据收集</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 特征重要性分析 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">特征重要性分析</h4>
        <div className="space-y-3">
          {explainability.featureImportance && Object.entries(explainability.featureImportance).map(([feature, importance]) => (
            <div key={feature} className="flex items-center">
              <div className="w-32 text-sm text-gray-600">{feature}</div>
              <div className="flex-1 mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${importance * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-sm text-gray-900">{Math.round(importance * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* 用户行为路径分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h5 className="font-semibold text-green-800 mb-4">成功路径模式</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>直接命中 → 确认满意 → 继续使用</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>初步尝试 → 追问澄清 → 深度使用</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span>多轮对话 → 逐步细化 → 达成目标</span>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h5 className="font-semibold text-red-800 mb-4">失败路径模式</h5>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <span>早期放弃：1-2轮对话后离开</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <span>循环困境：重复相似问题无法突破</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 text-red-600 mr-2" />
              <span>工具失效：工具调用失败导致中断</span>
            </div>
          </div>
        </div>
      </div>

      {/* 改进建议 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-4">改进建议</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">立即行动</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 优化响应质量检测机制</li>
              <li>• 加强工具调用稳定性</li>
              <li>• 改进模糊需求的澄清策略</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-blue-800 mb-2">长期规划</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 开发专门的澄清对话系统</li>
              <li>• 建立用户行为预测模型</li>
              <li>• 完善多轮对话上下文管理</li>
            </ul>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ABTestingEnhanced;