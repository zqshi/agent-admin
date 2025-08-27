import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, Settings, Filter, Search, RotateCcw, Eye, EyeOff,
  TrendingUp, Users, DollarSign, Clock, Bot, User, Bell,
  CheckCircle, AlertTriangle, BarChart3, Target, Activity,
  Brain, Lightbulb, Wand2, Sparkles
} from 'lucide-react';

// 导入我们新开发的组件
import EnhancedExperimentOverview from '../components/EnhancedExperimentOverview';
import SystemConfigPanel from '../components/SystemConfigPanel';
import ExperimentStatusFlow from '../components/ExperimentStatusFlow';
import CreateExperiment from '../components/CreateExperiment';
import EnhancedNLExperimentCreator from '../components/EnhancedNLExperimentCreator';
import UserFeedbackModal from '../components/UserFeedbackModal';
import { errorHandler, generateSessionId, getUserAgent } from '../services/errorHandling';

// 导入类型定义
import { ABTest } from '../types';
import { ABTestSystemConfig, DEFAULT_SYSTEM_CONFIG } from '../types/system-config';
import {
  ALL_METRICS,
  L1_BUSINESS_METRICS, 
  L2_CONVERSATION_METRICS,
  L3_COST_PERFORMANCE_METRICS,
  L4_OPERATIONS_SECURITY_METRICS,
  getMetricStatus,
  METRIC_STATUS_COLORS,
  METRIC_STATUS_LABELS,
  METRIC_CATEGORIES,
  type MetricDefinition,
  type MetricValue
} from '../types/metrics-definitions';

// Mock数据
const mockEnhancedExperiments: ABTest[] = [
  {
    id: 'exp_001',
    name: 'GPT-4 vs Claude-3 对话质量对比',
    description: '测试不同大语言模型在客服场景下的表现差异',
    status: 'experiment_ended',
    startDate: '2024-08-20',
    endDate: '2024-08-26',
    creationType: 'human_created',
    creator: {
      type: 'human',
      name: '张三',
      id: 'user_001'
    },
    groups: [
      {
        id: 'control',
        name: '对照组-GPT4',
        trafficRatio: 50,
        config: {
          model: 'gpt-4-turbo',
          prompt: '你是专业的客服助手',
          temperature: 0.7
        },
        realTimeMetrics: {
          currentSessions: 1250,
          totalSessions: 5000,
          conversionRate: 0.78,
          avgMetricValues: {
            taskSuccessRate: 78.5,
            avgResponseTime: 2.1,
            userSatisfaction: 4.2
          },
          costSpent: 145.60,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组-Claude3',
        trafficRatio: 50,
        config: {
          model: 'claude-3-opus',
          prompt: '你是专业的客服助手',
          temperature: 0.7
        },
        realTimeMetrics: {
          currentSessions: 1280,
          totalSessions: 5100,
          conversionRate: 0.85,
          avgMetricValues: {
            taskSuccessRate: 85.2,
            avgResponseTime: 1.9,
            userSatisfaction: 4.6
          },
          costSpent: 162.30,
          sampleDistribution: []
        }
      }
    ],
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
        maxCost: 500,
        currentSpent: 307.90
      }
    },
    metrics: {
      businessMetrics: {
        taskSuccessRate: 81.8,
        userValueDensity: 2.3,
        retentionRate7d: 0.72,
        retentionRate30d: 0.45,
        userActivation: 0.68
      },
      supportMetrics: {
        effectiveInteractionDepth: 3.2,
        clarificationRequestRatio: 0.15,
        firstResponseHitRate: 0.82,
        timeToResolution: 180,
        knowledgeCoverage: 0.89
      },
      technicalMetrics: {
        totalSessions: 10100,
        successRate: 81.8,
        avgResponseTime: 2.0,
        p95ResponseTime: 4.2,
        avgTokenCost: 0.025,
        tokenCostPerSession: 0.31,
        retryRate: 0.08,
        earlyExitRate: 0.12,
        toolCallSuccessRate: 0.94,
        modelFailureRate: 0.02
      }
    }
  },
  {
    id: 'exp_002',
    name: 'AI自动优化提示词A/B实验',
    description: 'AI发现用户满意度较低，自动创建优化实验',
    status: 'experimenting',
    startDate: '2024-08-25',
    creationType: 'ai_created',
    creator: {
      type: 'ai',
      name: 'AI实验引擎',
      id: 'ai_engine_001'
    },
    groups: [
      {
        id: 'control',
        name: '当前提示词',
        trafficRatio: 30,
        config: {
          model: 'gpt-4-turbo',
          prompt: '请帮助用户解决问题',
          temperature: 0.7
        },
        realTimeMetrics: {
          currentSessions: 300,
          totalSessions: 1200,
          conversionRate: 0.68,
          avgMetricValues: {
            taskSuccessRate: 68.0,
            avgResponseTime: 2.3,
            userSatisfaction: 3.8
          },
          costSpent: 45.20,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: 'AI优化提示词',
        trafficRatio: 70,
        config: {
          model: 'gpt-4-turbo',
          prompt: '我是您的专属助手，致力于为您提供准确、有用的解答。请告诉我您需要什么帮助？',
          temperature: 0.7
        },
        realTimeMetrics: {
          currentSessions: 700,
          totalSessions: 2800,
          conversionRate: 0.74,
          avgMetricValues: {
            taskSuccessRate: 74.5,
            avgResponseTime: 2.1,
            userSatisfaction: 4.1
          },
          costSpent: 105.60,
          sampleDistribution: []
        }
      }
    ],
    config: {
      splittingStrategy: 'user',
      stratificationDimensions: ['user_segment'],
      environmentControl: {
        fixedSeed: 54321,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'low',
      budget: {
        maxCost: 200,
        currentSpent: 150.80
      }
    },
    metrics: {
      businessMetrics: {
        taskSuccessRate: 72.3,
        userValueDensity: 2.1,
        retentionRate7d: 0.69,
        retentionRate30d: 0.42,
        userActivation: 0.71
      },
      supportMetrics: {
        effectiveInteractionDepth: 2.8,
        clarificationRequestRatio: 0.18,
        firstResponseHitRate: 0.79,
        timeToResolution: 195,
        knowledgeCoverage: 0.85
      },
      technicalMetrics: {
        totalSessions: 4000,
        successRate: 72.3,
        avgResponseTime: 2.15,
        p95ResponseTime: 4.5,
        avgTokenCost: 0.024,
        tokenCostPerSession: 0.29,
        retryRate: 0.09,
        earlyExitRate: 0.14,
        toolCallSuccessRate: 0.92,
        modelFailureRate: 0.025
      }
    }
  }
];

const ABTestingEnhancedUpdated: React.FC = () => {
  // 主要状态管理
  const [mainTab, setMainTab] = useState<'experiments' | 'system_config'>('experiments');
  const [selectedExperiment, setSelectedExperiment] = useState<ABTest | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'metrics' | 'analysis' | 'insights' | 'status_flow'>('overview');
  
  // 实验数据和配置
  const [experiments, setExperiments] = useState<ABTest[]>(mockEnhancedExperiments);
  const [systemConfig, setSystemConfig] = useState<ABTestSystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [hasUnsavedConfig, setHasUnsavedConfig] = useState(false);
  
  // UI 状态
  const [showCreateExperiment, setShowCreateExperiment] = useState(false);
  const [showNLExperimentCreator, setShowNLExperimentCreator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creationTypeFilter, setCreationTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  
  // 反馈模态框状态
  const [feedbackModalConfig, setFeedbackModalConfig] = useState<{
    isOpen: boolean;
    trigger: 'error' | 'success' | 'manual';
    context: any;
    title?: string;
    message?: string;
  }>({
    isOpen: false,
    trigger: 'manual',
    context: null
  });

  // Mock当前用户
  const currentUser = {
    id: 'user_001',
    name: '张三',
    permissions: [
      'experiment.create', 'experiment.update', 'experiment.publish',
      'experiment.start', 'experiment.stop', 'experiment.deploy',
      'experiment.approve', 'experiment.approve_ai', 'experiment.archive',
      'config.manage'
    ]
  };

  // 过滤实验列表
  const filteredExperiments = experiments.filter(exp => {
    const matchesSearch = exp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || exp.status === statusFilter;
    const matchesCreationType = creationTypeFilter === 'all' || exp.creationType === creationTypeFilter;
    
    return matchesSearch && matchesStatus && matchesCreationType;
  });

  // 统计数据
  const stats = {
    total: experiments.length,
    running: experiments.filter(e => e.status === 'experimenting').length,
    ended: experiments.filter(e => e.status === 'experiment_ended').length,
    deployed: experiments.filter(e => e.status === 'deployed').length,
    aiCreated: experiments.filter(e => e.creationType === 'ai_created').length,
    totalBudget: experiments.reduce((sum, e) => sum + (e.config.budget?.currentSpent || 0), 0)
  };

  // 处理系统配置更新
  const handleConfigUpdate = useCallback((newConfig: ABTestSystemConfig) => {
    setSystemConfig(newConfig);
    setHasUnsavedConfig(true);
  }, []);

  // 保存系统配置
  const handleSaveConfig = useCallback(async () => {
    setIsLoading(true);
    try {
      // 这里应该调用API保存配置
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      setHasUnsavedConfig(false);
      console.log('配置已保存:', systemConfig);
    } catch (error) {
      console.error('配置保存失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [systemConfig]);

  // 处理状态转换
  const handleStatusTransition = useCallback(async (experimentId: string, toStatus: any, reason?: string) => {
    setIsLoading(true);
    try {
      // 这里应该调用API进行状态转换
      await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId ? { ...exp, status: toStatus } : exp
      ));
      
      if (selectedExperiment?.id === experimentId) {
        setSelectedExperiment(prev => prev ? { ...prev, status: toStatus } : null);
      }
      
      console.log(`实验 ${experimentId} 状态已转换为 ${toStatus}`, reason);
    } catch (error) {
      console.error('状态转换失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedExperiment]);

  // 处理智能决策批准
  const handleApproveDecision = useCallback(async (decision: any) => {
    console.log('批准决策:', decision);
    await handleStatusTransition(decision.experimentId, 'deploying', '批准AI智能决策建议');
  }, [handleStatusTransition]);

  // 处理智能决策拒绝
  const handleRejectDecision = useCallback(async (decision: any) => {
    console.log('拒绝决策:', decision);
    // 这里可以添加拒绝决策的逻辑
  }, []);

  // 处理手动部署
  const handleManualDeploy = useCallback(async (experimentId: string, winnerGroup: string) => {
    console.log('手动部署:', { experimentId, winnerGroup });
    await handleStatusTransition(experimentId, 'deploying', `手动部署获胜组: ${winnerGroup}`);
  }, [handleStatusTransition]);

  // 自动选择第一个实验
  useEffect(() => {
    if (!selectedExperiment && experiments.length > 0) {
      setSelectedExperiment(experiments[0]);
    }
  }, [experiments, selectedExperiment]);

  return (
    <div className="h-full bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">A/B 测试平台</h1>
              <p className="text-sm text-gray-600 mt-1">智能实验驱动增长引擎</p>
            </div>
            
            {/* 统计概览 */}
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-semibold text-gray-900">{stats.total}</div>
                <div className="text-gray-500">总实验</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">{stats.running}</div>
                <div className="text-gray-500">进行中</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{stats.aiCreated}</div>
                <div className="text-gray-500">AI创建</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">${stats.totalBudget.toFixed(0)}</div>
                <div className="text-gray-500">总支出</div>
              </div>
            </div>
            
            {/* 主要操作按钮 */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateExperiment(true)}
                disabled={systemConfig.experimentCreation.requiresHumanCreation === false}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                创建实验
              </button>
              
              <button
                onClick={() => setShowNLExperimentCreator(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Wand2 className="h-4 w-4" />
                <Sparkles className="h-3 w-3" />
                智能创建
              </button>
              
              {!systemConfig.experimentCreation.requiresHumanCreation && (
                <div className="flex items-center gap-1 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm">
                  <Bot className="h-4 w-4" />
                  AI自动创建已启用
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 主导航标签 */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { id: 'experiments', name: '实验管理', icon: BarChart3 },
              { id: 'system_config', name: '系统配置', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMainTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  mainTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 p-6">
        {/* 实验管理标签页 */}
        {mainTab === 'experiments' && (
          <div className="grid grid-cols-12 gap-6 h-full">
            {/* 左侧实验列表 */}
            <div className="col-span-4 bg-white rounded-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">实验列表</h3>
                  <button
                    onClick={() => window.location.reload()}
                    className="p-1 text-gray-400 hover:text-gray-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                
                {/* 搜索和筛选 */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="搜索实验..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有状态</option>
                      <option value="experimenting">实验中</option>
                      <option value="experiment_ended">已结束</option>
                      <option value="deployed">已上线</option>
                      <option value="draft">草稿</option>
                    </select>
                    
                    <select
                      value={creationTypeFilter}
                      onChange={(e) => setCreationTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">创建方式</option>
                      <option value="human_created">人工创建</option>
                      <option value="ai_created">AI创建</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 实验列表 */}
              <div className="overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
                {filteredExperiments.map((experiment) => (
                  <div
                    key={experiment.id}
                    onClick={() => setSelectedExperiment(experiment)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedExperiment?.id === experiment.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{experiment.name}</h4>
                      <div className="flex items-center gap-1">
                        {experiment.creationType === 'ai_created' ? (
                          <Bot className="h-3 w-3 text-purple-600" />
                        ) : (
                          <User className="h-3 w-3 text-blue-600" />
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{experiment.description}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        experiment.status === 'experimenting' ? 'bg-blue-100 text-blue-800' :
                        experiment.status === 'experiment_ended' ? 'bg-purple-100 text-purple-800' :
                        experiment.status === 'deployed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {experiment.status === 'experimenting' ? '实验中' :
                         experiment.status === 'experiment_ended' ? '已结束' :
                         experiment.status === 'deployed' ? '已上线' : '其他'}
                      </span>
                      
                      <div className="flex items-center gap-2 text-gray-500">
                        <span>${experiment.config.budget?.currentSpent?.toFixed(0) || '0'}</span>
                        <span>•</span>
                        <span>{experiment.groups.length}组</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredExperiments.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">没有找到匹配的实验</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 右侧实验详情 */}
            <div className="col-span-8">
              {selectedExperiment ? (
                <div className="space-y-6">
                  {/* 子标签导航 */}
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="border-b border-gray-200">
                      <nav className="flex px-6">
                        {[
                          { id: 'overview', name: '概览与决策', icon: BarChart3 },
                          { id: 'metrics', name: '三层指标', icon: Target },
                          { id: 'analysis', name: '统计分析', icon: TrendingUp },
                          { id: 'insights', name: '洞察分析', icon: Eye },
                          { id: 'status_flow', name: '状态管理', icon: Activity }
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                              activeSubTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <tab.icon className="h-4 w-4" />
                            {tab.name}
                          </button>
                        ))}
                      </nav>
                    </div>
                    
                    {/* 标签页内容 */}
                    <div className="p-6">
                      {activeSubTab === 'overview' && (
                        <EnhancedExperimentOverview
                          experiment={selectedExperiment}
                          systemConfig={systemConfig}
                          onApproveDecision={handleApproveDecision}
                          onRejectDecision={handleRejectDecision}
                          onManualDeploy={handleManualDeploy}
                        />
                      )}
                      
                      {activeSubTab === 'status_flow' && (
                        <ExperimentStatusFlow
                          experiment={selectedExperiment}
                          systemConfig={systemConfig}
                          currentUser={currentUser}
                          onStatusTransition={handleStatusTransition}
                        />
                      )}
                      
                      {/* 四层指标tab */}
                      {activeSubTab === 'metrics' && (
                        <div className="space-y-6">
                          {/* 指标级别切换 */}
                          <div className="grid grid-cols-4 bg-white rounded-lg border border-gray-200 p-1 gap-1">
                            {[
                              { id: 'L1', name: 'L1 核心业务指标', desc: 'The "What" - 是否创造了价值？', color: 'bg-green-100 text-green-800 border-green-200' },
                              { id: 'L2', name: 'L2 对话体验指标', desc: 'The "How" - 体验是否高效顺畅？', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                              { id: 'L3', name: 'L3 成本性能指标', desc: 'The "Cost" - 付出的代价是多少？', color: 'bg-orange-100 text-orange-800 border-orange-200' },
                              { id: 'L4', name: 'L4 运维安全指标', desc: 'The "Reliability" - 是否稳定可靠？', color: 'bg-red-100 text-red-800 border-red-200' }
                            ].map((level) => (
                              <button
                                key={level.id}
                                className={`flex-1 px-3 py-3 text-sm font-medium rounded border transition-all duration-200 hover:shadow-md ${level.color}`}
                              >
                                <div className="text-center">
                                  <div className="font-semibold">{level.name}</div>
                                  <div className="text-xs mt-1 opacity-80">{level.desc}</div>
                                </div>
                              </button>
                            ))}
                          </div>

                          {/* L1 核心业务指标 - "The What" */}
                          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border">
                            <div className="flex items-center gap-3 mb-6">
                              <Target className="h-6 w-6 text-green-600" />
                              <div>
                                <h3 className="text-xl font-semibold text-green-800">L1 核心业务指标</h3>
                                <p className="text-sm text-green-700 opacity-90">The "What" - 衡量数字员工是否创造了价值，这是证明存在商业价值的关键指标</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              {L1_BUSINESS_METRICS.map((metric) => {
                                // 根据指标ID映射到实际数据
                                let value1, value2, unit;
                                switch(metric.id) {
                                  case 'task_success_rate':
                                    value1 = selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.taskSuccessRate;
                                    value2 = selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.taskSuccessRate;
                                    unit = '%';
                                    break;
                                  case 'user_satisfaction_csat':
                                    value1 = selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.userSatisfaction;
                                    value2 = selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.userSatisfaction;
                                    unit = '/5.0';
                                    break;
                                  case 'conversion_rate':
                                    value1 = selectedExperiment.groups[0].realTimeMetrics.conversionRate * 100;
                                    value2 = selectedExperiment.groups[1].realTimeMetrics.conversionRate * 100;
                                    unit = '%';
                                    break;
                                  case 'self_service_rate':
                                    value1 = 78.5; // mock data
                                    value2 = 85.2; // mock data
                                    unit = '%';
                                    break;
                                  default:
                                    value1 = 0;
                                    value2 = 0;
                                    unit = metric.unit;
                                }
                                
                                const improvement = ((value2 - value1) / value1 * 100);
                                
                                return (
                                  <div key={metric.id} className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">{metric.name}</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">{metric.description}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {selectedExperiment.groups.map((group, index) => {
                                        const currentValue = index === 0 ? value1 : value2;
                                        const status = getMetricStatus(metric, currentValue);
                                        const statusColor = METRIC_STATUS_COLORS[status];
                                        const statusLabel = METRIC_STATUS_LABELS[status];
                                        
                                        return (
                                          <div key={group.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                              <span className="text-sm font-medium text-gray-700">{group.name}</span>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-lg font-bold text-gray-900">
                                                {currentValue.toFixed(1)}{unit}
                                              </div>
                                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                                                {statusLabel}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      
                                      <div className="pt-3 border-t border-gray-200">
                                        <div className={`text-sm font-medium ${
                                          improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          变化: {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          更新频率: {metric.updateFrequency}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* L2 对话与体验指标 - "The How" */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                            <div className="flex items-center gap-3 mb-6">
                              <BarChart3 className="h-6 w-6 text-blue-600" />
                              <div>
                                <h3 className="text-xl font-semibold text-blue-800">L2 对话与体验指标</h3>
                                <p className="text-sm text-blue-700 opacity-90">The "How" - 衡量完成任务的过程质量，反映交互效率和用户体验</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              {L2_CONVERSATION_METRICS.map((metric) => {
                                // 模拟数据映射
                                let value1, value2, unit;
                                switch(metric.id) {
                                  case 'avg_conversation_rounds':
                                    value1 = 4.2; 
                                    value2 = 3.8;
                                    unit = '轮';
                                    break;
                                  case 'first_round_hit_rate':
                                    value1 = 65.3;
                                    value2 = 72.1;
                                    unit = '%';
                                    break;
                                  case 'clarification_request_ratio':
                                    value1 = 18.5;
                                    value2 = 15.2;
                                    unit = '%';
                                    break;
                                  case 'proactive_transfer_rate':
                                    value1 = 12.3;
                                    value2 = 9.8;
                                    unit = '%';
                                    break;
                                  default:
                                    value1 = 0;
                                    value2 = 0;
                                    unit = metric.unit;
                                }
                                
                                const improvement = metric.id === 'avg_conversation_rounds' || metric.id === 'clarification_request_ratio' || metric.id === 'proactive_transfer_rate' 
                                  ? ((value1 - value2) / value1 * 100)  // 这些指标越低越好
                                  : ((value2 - value1) / value1 * 100); // 这些指标越高越好
                                
                                return (
                                  <div key={metric.id} className="bg-white p-5 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between mb-4">
                                      <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900 mb-1">{metric.name}</h4>
                                        <p className="text-xs text-gray-600 leading-relaxed">{metric.description}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      {selectedExperiment.groups.map((group, index) => {
                                        const currentValue = index === 0 ? value1 : value2;
                                        const status = getMetricStatus(metric, currentValue);
                                        const statusColor = METRIC_STATUS_COLORS[status];
                                        const statusLabel = METRIC_STATUS_LABELS[status];
                                        
                                        return (
                                          <div key={group.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                              <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                              <span className="text-sm font-medium text-gray-700">{group.name}</span>
                                            </div>
                                            <div className="text-right">
                                              <div className="text-lg font-bold text-gray-900">
                                                {currentValue.toFixed(1)}{unit}
                                              </div>
                                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                                                {statusLabel}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                      
                                      <div className="pt-3 border-t border-gray-200">
                                        <div className={`text-sm font-medium ${
                                          improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                          优化: {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}%
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          更新频率: {metric.updateFrequency}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* L3 技术监控指标 */}
                          <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <Activity className="h-5 w-5 text-orange-600" />
                              <h3 className="text-lg font-semibold text-orange-800">L3 技术监控指标</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                              {/* 响应时间对比 */}
                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium text-gray-900 mb-3">平均响应时间</h4>
                                <div className="space-y-3">
                                  {selectedExperiment.groups.map((group, index) => (
                                    <div key={group.id} className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                                        <span className="text-sm font-medium text-gray-700">{group.name}</span>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-lg font-bold text-gray-900">{group.realTimeMetrics.avgMetricValues.avgResponseTime}s</div>
                                        <div className={`text-xs ${group.realTimeMetrics.avgMetricValues.avgResponseTime < 2.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                                          {group.realTimeMetrics.avgMetricValues.avgResponseTime < 2.5 ? '优秀' : '良好'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 系统技术指标概览 */}
                              <div className="bg-white p-4 rounded-lg border">
                                <h4 className="font-medium text-gray-900 mb-3">系统技术指标</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">LLM调用成功率</span>
                                    <span className="font-medium text-green-600">98.7%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">MCP工具成功率</span>
                                    <span className="font-medium text-blue-600">94.3%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Token成本效率</span>
                                    <span className="font-medium text-purple-600">$0.25/req</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">算法稳定性</span>
                                    <span className="font-medium text-green-600">89.4%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 统计分析tab */}
                      {activeSubTab === 'analysis' && (
                        <div className="space-y-6">
                          {/* 统计概览 */}
                          <div className="grid grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-sm text-gray-600">样本量 (总计)</div>
                              <div className="text-2xl font-bold text-gray-900 mt-1">
                                {selectedExperiment.groups.reduce((sum, group) => sum + group.realTimeMetrics.totalSessions, 0).toLocaleString()}
                              </div>
                              <div className="text-xs text-green-600 mt-1">
                                ✓ 满足统计功效要求
                              </div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-sm text-gray-600">置信水平</div>
                              <div className="text-2xl font-bold text-blue-600 mt-1">95%</div>
                              <div className="text-xs text-gray-500 mt-1">α = 0.05</div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-sm text-gray-600">统计功效</div>
                              <div className="text-2xl font-bold text-green-600 mt-1">89%</div>
                              <div className="text-xs text-gray-500 mt-1">β = 0.11</div>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border">
                              <div className="text-sm text-gray-600">实验进度</div>
                              <div className="text-2xl font-bold text-purple-600 mt-1">
                                {selectedExperiment.status === 'experiment_ended' ? '100%' : '76%'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {selectedExperiment.status === 'experiment_ended' ? '实验已结束' : '进行中'}
                              </div>
                            </div>
                          </div>

                          {/* 假设检验结果 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <TrendingUp className="h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold text-gray-900">假设检验结果</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* 任务成功率检验 */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">任务成功率检验</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">H₀假设:</span>
                                    <span className="text-sm font-medium">两组成功率无差异</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">H₁假设:</span>
                                    <span className="text-sm font-medium">实验组成功率更高</span>
                                  </div>
                                  <div className="border-t pt-3 grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-gray-500">对照组成功率</div>
                                      <div className="text-lg font-bold text-blue-600">
                                        {selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.taskSuccessRate}%
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">实验组成功率</div>
                                      <div className="text-lg font-bold text-green-600">
                                        {selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.taskSuccessRate}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded border">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm text-gray-600">Z统计量:</span>
                                      <span className="font-mono font-medium">2.847</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm text-gray-600">P值:</span>
                                      <span className="font-mono font-medium text-green-600">0.0044</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">结论:</span>
                                      <span className="text-sm font-medium text-green-600">
                                        {0.0044 < 0.05 ? '拒绝H₀，差异显著' : '接受H₀，差异不显著'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 用户满意度检验 */}
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-3">用户满意度检验</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">检验类型:</span>
                                    <span className="text-sm font-medium">独立样本t检验</span>
                                  </div>
                                  <div className="border-t pt-3 grid grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-xs text-gray-500">对照组均值</div>
                                      <div className="text-lg font-bold text-blue-600">
                                        {selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.userSatisfaction}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500">实验组均值</div>
                                      <div className="text-lg font-bold text-green-600">
                                        {selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.userSatisfaction}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-white p-3 rounded border">
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm text-gray-600">T统计量:</span>
                                      <span className="font-mono font-medium">3.152</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm text-gray-600">自由度:</span>
                                      <span className="font-mono font-medium">10098</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                      <span className="text-sm text-gray-600">P值:</span>
                                      <span className="font-mono font-medium text-green-600">0.0016</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">结论:</span>
                                      <span className="text-sm font-medium text-green-600">差异显著</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 置信区间分析 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-5 w-5 text-purple-600" />
                              <h3 className="text-lg font-semibold text-gray-900">置信区间分析</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* 任务成功率置信区间 */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">任务成功率差值置信区间</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between mb-3">
                                    <span className="text-sm text-gray-600">效应大小:</span>
                                    <span className="font-mono font-medium text-green-600">
                                      +{((selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.taskSuccessRate - selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.taskSuccessRate)).toFixed(1)}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between mb-3">
                                    <span className="text-sm text-gray-600">95% CI:</span>
                                    <span className="font-mono font-medium">[2.1%, 12.4%]</span>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-1">置信区间可视化</div>
                                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="absolute left-1/3 right-1/4 h-full bg-green-300 rounded-full"></div>
                                      <div className="absolute left-1/2 w-0.5 h-full bg-green-600"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <span>2.1%</span>
                                      <span>7.3%</span>
                                      <span>12.4%</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-green-700 bg-green-50 p-2 rounded">
                                    ✓ 置信区间不包含0，差异显著
                                  </div>
                                </div>
                              </div>

                              {/* 响应时间置信区间 */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">响应时间差值置信区间</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <div className="flex justify-between mb-3">
                                    <span className="text-sm text-gray-600">效应大小:</span>
                                    <span className="font-mono font-medium text-green-600">
                                      -{(selectedExperiment.groups[0].realTimeMetrics.avgMetricValues.avgResponseTime - selectedExperiment.groups[1].realTimeMetrics.avgMetricValues.avgResponseTime).toFixed(1)}s
                                    </span>
                                  </div>
                                  <div className="flex justify-between mb-3">
                                    <span className="text-sm text-gray-600">95% CI:</span>
                                    <span className="font-mono font-medium">[-0.35s, -0.05s]</span>
                                  </div>
                                  <div className="bg-white p-2 rounded">
                                    <div className="text-xs text-gray-500 mb-1">置信区间可视化</div>
                                    <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="absolute left-1/4 right-2/3 h-full bg-blue-300 rounded-full"></div>
                                      <div className="absolute left-1/3 w-0.5 h-full bg-blue-600"></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                      <span>-0.35s</span>
                                      <span>-0.20s</span>
                                      <span>-0.05s</span>
                                    </div>
                                  </div>
                                  <div className="mt-3 text-xs text-blue-700 bg-blue-50 p-2 rounded">
                                    ✓ 响应时间显著改善
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 效应大小和实际意义 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <BarChart3 className="h-5 w-5 text-orange-600" />
                              <h3 className="text-lg font-semibold text-gray-900">效应大小分析</h3>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-sm text-gray-600 mb-2">Cohen's d</div>
                                <div className="text-2xl font-bold text-purple-600">0.42</div>
                                <div className="text-xs text-gray-500 mt-1">中等效应</div>
                                <div className="text-xs text-purple-600 mt-1">任务成功率</div>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-sm text-gray-600 mb-2">相对提升</div>
                                <div className="text-2xl font-bold text-green-600">+8.5%</div>
                                <div className="text-xs text-gray-500 mt-1">实际业务价值</div>
                                <div className="text-xs text-green-600 mt-1">用户满意度</div>
                              </div>
                              
                              <div className="bg-gray-50 p-4 rounded-lg text-center">
                                <div className="text-sm text-gray-600 mb-2">成本影响</div>
                                <div className="text-2xl font-bold text-blue-600">+11.5%</div>
                                <div className="text-xs text-gray-500 mt-1">每会话成本增加</div>
                                <div className="text-xs text-yellow-600 mt-1">需权衡考虑</div>
                              </div>
                            </div>
                            
                            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                              <div className="flex items-start gap-3">
                                <div className="p-1 bg-blue-100 rounded">
                                  <CheckCircle className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-blue-900 mb-1">统计结论</div>
                                  <div className="text-sm text-blue-800">
                                    实验组在任务成功率和用户满意度上显著优于对照组，但成本有所增加。
                                    考虑到用户体验的改善和长期价值，建议采用实验组方案。
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 多重比较校正 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertTriangle className="h-5 w-5 text-yellow-600" />
                              <h3 className="text-lg font-semibold text-gray-900">多重比较校正</h3>
                            </div>
                            
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4">指标</th>
                                    <th className="text-left py-3 px-4">原始P值</th>
                                    <th className="text-left py-3 px-4">Bonferroni校正</th>
                                    <th className="text-left py-3 px-4">FDR校正</th>
                                    <th className="text-left py-3 px-4">结论</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium">任务成功率</td>
                                    <td className="py-3 px-4 font-mono">0.0044</td>
                                    <td className="py-3 px-4 font-mono">0.0132</td>
                                    <td className="py-3 px-4 font-mono">0.0088</td>
                                    <td className="py-3 px-4 text-green-600 font-medium">显著</td>
                                  </tr>
                                  <tr className="border-b border-gray-100">
                                    <td className="py-3 px-4 font-medium">用户满意度</td>
                                    <td className="py-3 px-4 font-mono">0.0016</td>
                                    <td className="py-3 px-4 font-mono">0.0048</td>
                                    <td className="py-3 px-4 font-mono">0.0048</td>
                                    <td className="py-3 px-4 text-green-600 font-medium">显著</td>
                                  </tr>
                                  <tr>
                                    <td className="py-3 px-4 font-medium">响应时间</td>
                                    <td className="py-3 px-4 font-mono">0.0089</td>
                                    <td className="py-3 px-4 font-mono">0.0267</td>
                                    <td className="py-3 px-4 font-mono">0.0133</td>
                                    <td className="py-3 px-4 text-green-600 font-medium">显著</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            
                            <div className="mt-4 text-xs text-gray-600">
                              * 使用α = 0.05的显著性水平，校正后所有主要指标仍保持显著性
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 洞察分析tab */}
                      {activeSubTab === 'insights' && (
                        <div className="space-y-6">
                          {/* AI实验总结 */}
                          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <Brain className="h-5 w-5 text-purple-600" />
                              <h3 className="text-lg font-semibold text-purple-800">AI实验总结</h3>
                            </div>
                            
                            <div className="bg-white p-4 rounded-lg border shadow-sm">
                              <div className="flex items-start gap-4">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                  <Eye className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 mb-2">实验洞察摘要</div>
                                  <div className="text-sm text-gray-700 leading-relaxed">
                                    基于 <strong>{selectedExperiment.groups.reduce((sum, group) => sum + group.realTimeMetrics.totalSessions, 0).toLocaleString()}</strong> 个样本的深度分析，
                                    <strong className="text-green-600">Claude-3模型</strong>在多个核心指标上显著优于GPT-4：
                                    任务成功率提升 <strong className="text-green-600">+8.5%</strong>，
                                    用户满意度提升 <strong className="text-green-600">+9.5%</strong>，
                                    响应时间减少 <strong className="text-blue-600">-9.5%</strong>。
                                    尽管成本增加了11.5%，但从长期用户价值和留存角度考虑，这是一个值得的投资。
                                  </div>
                                  
                                  <div className="mt-4 flex items-center gap-3">
                                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                      ✓ 推荐部署实验组
                                    </div>
                                    <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                      置信度: 94%
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 关键发现 */}
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* 用户行为洞察 */}
                            <div className="bg-white p-6 rounded-lg border">
                              <div className="flex items-center gap-2 mb-4">
                                <Users className="h-5 w-5 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">用户行为洞察</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="font-medium text-blue-900 mb-2">🎯 用户偏好分析</div>
                                  <div className="text-sm text-blue-800 leading-relaxed">
                                    Claude-3的回答风格更符合用户期望，特别是在<strong>专业性</strong>和<strong>可读性</strong>方面表现突出。
                                    用户平均会话长度增加了<strong>23%</strong>，说明用户更愿意深入交互。
                                  </div>
                                </div>
                                
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="font-medium text-green-900 mb-2">📈 转化路径优化</div>
                                  <div className="text-sm text-green-800 leading-relaxed">
                                    实验组的用户在<strong>首次交互</strong>后的留存率提升了<strong>15.8%</strong>，
                                    表明更好的初始体验能显著影响用户的后续行为。
                                  </div>
                                </div>
                                
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                  <div className="font-medium text-yellow-900 mb-2">⚠️ 潜在风险点</div>
                                  <div className="text-sm text-yellow-800 leading-relaxed">
                                    实验组的响应变异性略高（CV=0.12 vs 0.08），需要关注系统稳定性。
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* 业务影响分析 */}
                            <div className="bg-white p-6 rounded-lg border">
                              <div className="flex items-center gap-2 mb-4">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">业务影响分析</h3>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="bg-green-50 p-4 rounded-lg">
                                  <div className="font-medium text-green-900 mb-2">💰 ROI预测</div>
                                  <div className="text-sm text-green-800 leading-relaxed">
                                    按当前改进效果推算，<strong>年化ROI预计达到156%</strong>。
                                    主要收益来源：用户留存提升（65%）、新用户转化（23%）、运营效率（12%）。
                                  </div>
                                </div>
                                
                                <div className="bg-blue-50 p-4 rounded-lg">
                                  <div className="font-medium text-blue-900 mb-2">📊 规模化影响</div>
                                  <div className="text-sm text-blue-800 leading-relaxed">
                                    如果全量上线，预计每月可额外带来<strong>$127,000</strong>的价值提升，
                                    主要通过减少客户流失和提高服务效率实现。
                                  </div>
                                </div>
                                
                                <div className="bg-purple-50 p-4 rounded-lg">
                                  <div className="font-medium text-purple-900 mb-2">🔮 长期价值</div>
                                  <div className="text-sm text-purple-800 leading-relaxed">
                                    用户满意度的提升将产生复利效应，预计<strong>12个月内</strong>可带来
                                    <strong>+18%</strong>的口碑推荐和<strong>+12%</strong>的续费率提升。
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 细分群体分析 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-lg font-semibold text-gray-900">细分群体分析</h3>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              {/* 新用户群体 */}
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                  <span className="font-medium text-blue-900">新用户 (&lt; 7天)</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">样本量:</span>
                                    <span className="font-medium">3,247</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">成功率提升:</span>
                                    <span className="font-medium text-green-600">+12.3%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">满意度提升:</span>
                                    <span className="font-medium text-blue-600">+15.7%</span>
                                  </div>
                                  <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                    💡 新用户对Claude-3响应更积极
                                  </div>
                                </div>
                              </div>

                              {/* 老用户群体 */}
                              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="font-medium text-green-900">老用户 (&gt; 30天)</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">样本量:</span>
                                    <span className="font-medium">4,621</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">成功率提升:</span>
                                    <span className="font-medium text-green-600">+6.8%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">满意度提升:</span>
                                    <span className="font-medium text-blue-600">+5.2%</span>
                                  </div>
                                  <div className="mt-3 text-xs text-green-700 bg-green-100 p-2 rounded">
                                    💡 老用户改进效果相对温和但稳定
                                  </div>
                                </div>
                              </div>

                              {/* 企业用户群体 */}
                              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                  <span className="font-medium text-purple-900">企业用户</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">样本量:</span>
                                    <span className="font-medium">2,232</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">成功率提升:</span>
                                    <span className="font-medium text-green-600">+9.1%</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">满意度提升:</span>
                                    <span className="font-medium text-blue-600">+11.4%</span>
                                  </div>
                                  <div className="mt-3 text-xs text-purple-700 bg-purple-100 p-2 rounded">
                                    💡 企业用户最看重专业性和准确性
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 实施建议 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <Lightbulb className="h-5 w-5 text-yellow-600" />
                              <h3 className="text-lg font-semibold text-gray-900">智能实施建议</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* 短期建议 */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-blue-500" />
                                  短期优化 (1-4周)
                                </h4>
                                
                                <div className="space-y-3">
                                  <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="font-medium text-blue-900 text-sm mb-1">🚀 渐进式上线</div>
                                    <div className="text-xs text-blue-800">
                                      建议先对<strong>新用户群体</strong>全量部署Claude-3，观察2周后再扩展到其他群体
                                    </div>
                                  </div>
                                  
                                  <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="font-medium text-green-900 text-sm mb-1">📊 监控预警</div>
                                    <div className="text-xs text-green-800">
                                      设置<strong>响应时间P95 &gt; 4s</strong>和<strong>成本增幅 &gt; 15%</strong>的自动预警
                                    </div>
                                  </div>
                                  
                                  <div className="bg-yellow-50 p-3 rounded-lg">
                                    <div className="font-medium text-yellow-900 text-sm mb-1">🔧 参数调优</div>
                                    <div className="text-xs text-yellow-800">
                                      优化Claude-3的temperature参数到<strong>0.65</strong>，平衡创造性和一致性
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 长期建议 */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4 text-purple-500" />
                                  长期战略 (1-6个月)
                                </h4>
                                
                                <div className="space-y-3">
                                  <div className="bg-purple-50 p-3 rounded-lg">
                                    <div className="font-medium text-purple-900 text-sm mb-1">🎯 个性化优化</div>
                                    <div className="text-xs text-purple-800">
                                      基于用户画像动态选择模型，<strong>新用户使用Claude-3</strong>，<strong>成本敏感用户使用GPT-3.5</strong>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-indigo-50 p-3 rounded-lg">
                                    <div className="font-medium text-indigo-900 text-sm mb-1">📈 持续实验</div>
                                    <div className="text-xs text-indigo-800">
                                      每季度进行<strong>新模型对比实验</strong>，保持技术先进性和成本竞争力
                                    </div>
                                  </div>
                                  
                                  <div className="bg-pink-50 p-3 rounded-lg">
                                    <div className="font-medium text-pink-900 text-sm mb-1">🤖 智能路由</div>
                                    <div className="text-xs text-pink-800">
                                      开发<strong>智能模型路由器</strong>，根据请求复杂度自动选择最适合的模型
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 风险评估 */}
                          <div className="bg-white p-6 rounded-lg border">
                            <div className="flex items-center gap-2 mb-4">
                              <AlertTriangle className="h-5 w-5 text-red-600" />
                              <h3 className="text-lg font-semibold text-gray-900">风险评估与缓解</h3>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
                                <div className="font-medium text-red-900 mb-2">🔴 高风险</div>
                                <div className="text-sm text-red-800 mb-3">
                                  <strong>成本失控</strong><br/>
                                  Claude-3成本增加11.5%
                                </div>
                                <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                                  <strong>缓解方案:</strong> 设置月度成本上限，超出时自动回退到GPT-4
                                </div>
                              </div>
                              
                              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                                <div className="font-medium text-yellow-900 mb-2">🟡 中风险</div>
                                <div className="text-sm text-yellow-800 mb-3">
                                  <strong>服务稳定性</strong><br/>
                                  响应时间变异性增加
                                </div>
                                <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                                  <strong>缓解方案:</strong> 实施断路器模式，异常时快速切换到备用模型
                                </div>
                              </div>
                              
                              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                                <div className="font-medium text-blue-900 mb-2">🔵 低风险</div>
                                <div className="text-sm text-blue-800 mb-3">
                                  <strong>用户适应性</strong><br/>
                                  部分老用户可能不习惯
                                </div>
                                <div className="text-xs text-blue-700 bg-blue-100 p-2 rounded">
                                  <strong>缓解方案:</strong> 提供用户反馈渠道，必要时支持个人偏好设置
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个实验</h3>
                  <p className="text-gray-600">从左侧列表中选择一个实验以查看详细信息</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* 系统配置标签页 */}
        {mainTab === 'system_config' && (
          <SystemConfigPanel
            config={systemConfig}
            onConfigUpdate={handleConfigUpdate}
            onSave={handleSaveConfig}
            isLoading={isLoading}
            hasUnsavedChanges={hasUnsavedConfig}
          />
        )}
      </div>

      {/* 创建实验弹窗 */}
      {showCreateExperiment && (
        <CreateExperiment
          onClose={() => setShowCreateExperiment(false)}
          onSave={(newExperiment) => {
            setExperiments(prev => [...prev, newExperiment]);
            setShowCreateExperiment(false);
            setSelectedExperiment(newExperiment);
          }}
        />
      )}

      {/* 智能实验创建弹窗（升级版） */}
      {showNLExperimentCreator && (
        <EnhancedNLExperimentCreator
          onClose={() => setShowNLExperimentCreator(false)}
          onExperimentCreate={(newExperiment) => {
            // 添加AI创建标识和增强信息
            const aiExperiment = {
              ...newExperiment,
              creationType: 'ai_created' as const,
              creator: {
                type: 'ai' as const,
                name: 'AI实验助手',
                id: 'ai_assistant'
              },
              aiMetadata: {
                originalInput: newExperiment.nlContext?.originalInput,
                confidence: newExperiment.nlContext?.confidence,
                complexity: newExperiment.nlContext?.complexity,
                creationTimestamp: new Date().toISOString()
              }
            };
            setExperiments(prev => [...prev, aiExperiment]);
            setShowNLExperimentCreator(false);
            setSelectedExperiment(aiExperiment);
            
            // 显示成功反馈
            setFeedbackModalConfig({
              isOpen: true,
              trigger: 'success',
              context: {
                userInput: newExperiment.nlContext?.originalInput || '',
                parseResult: newExperiment.nlContext?.parseResult,
                timestamp: new Date(),
                sessionId: generateSessionId(),
                userAgent: getUserAgent()
              }
            });
          }}
        />
      )}

      {/* 用户反馈模态框 */}
      {feedbackModalConfig.isOpen && (
        <UserFeedbackModal
          isOpen={feedbackModalConfig.isOpen}
          onClose={() => setFeedbackModalConfig(prev => ({ ...prev, isOpen: false }))}
          context={feedbackModalConfig.context}
          trigger={feedbackModalConfig.trigger}
          title={feedbackModalConfig.title}
          message={feedbackModalConfig.message}
        />
      )}
    </div>
  );
};

export default ABTestingEnhancedUpdated;