import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, Settings, Filter, Search, RotateCcw, Eye, EyeOff,
  TrendingUp, Users, DollarSign, Clock, Bot, User, Bell,
  CheckCircle, AlertTriangle, BarChart3, Target, Activity
} from 'lucide-react';

// 导入我们新开发的组件
import EnhancedExperimentOverview from '../components/EnhancedExperimentOverview';
import SystemConfigPanel from '../components/SystemConfigPanel';
import ExperimentStatusFlow from '../components/ExperimentStatusFlow';
import CreateExperiment from '../components/CreateExperiment';

// 导入类型定义
import { ABTest } from '../types';
import { ABTestSystemConfig, DEFAULT_SYSTEM_CONFIG } from '../types/system-config';

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
  const [mainTab, setMainTab] = useState<'experiments' | 'ai_analysis' | 'system_config'>('experiments');
  const [selectedExperiment, setSelectedExperiment] = useState<ABTest | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'metrics' | 'analysis' | 'insights' | 'status_flow'>('overview');
  
  // 实验数据和配置
  const [experiments, setExperiments] = useState<ABTest[]>(mockEnhancedExperiments);
  const [systemConfig, setSystemConfig] = useState<ABTestSystemConfig>(DEFAULT_SYSTEM_CONFIG);
  const [hasUnsavedConfig, setHasUnsavedConfig] = useState(false);
  
  // UI 状态
  const [showCreateExperiment, setShowCreateExperiment] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [creationTypeFilter, setCreationTypeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

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
              { id: 'ai_analysis', name: 'AI智能分析', icon: Bot },
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
                      
                      {/* 其他标签页内容可以保留原有的组件 */}
                      {(activeSubTab === 'metrics' || activeSubTab === 'analysis' || activeSubTab === 'insights') && (
                        <div className="text-center py-12 text-gray-500">
                          <div className="text-lg font-medium mb-2">功能开发中</div>
                          <p className="text-sm">此标签页的增强功能正在开发中，敬请期待</p>
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
        
        {/* AI智能分析标签页 */}
        {mainTab === 'ai_analysis' && (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <Bot className="h-16 w-16 mx-auto mb-4 text-purple-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">AI智能分析引擎</h2>
            <p className="text-gray-600 mb-6">此功能已集成到概览标签页中，提供更流畅的用户体验</p>
            <button
              onClick={() => {
                setMainTab('experiments');
                setActiveSubTab('overview');
              }}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Eye className="h-4 w-4" />
              查看智能决策推荐
            </button>
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
    </div>
  );
};

export default ABTestingEnhancedUpdated;