import { useState, useEffect } from 'react';
import { 
  Plus, Play, Trophy, BarChart3, TrendingUp, Users, Clock, 
  Brain, Target, AlertTriangle, CheckCircle, XCircle,
  Settings, Eye, Zap, Activity, HelpCircle
} from 'lucide-react';
import { ABTest, BayesianAnalysis, ComplexityAssessment } from '../types';
import ExperimentWizard from '../components/ExperimentWizard';
import CreateExperiment from '../components/CreateExperiment';
import { MetricTooltip } from '../components/ui/MetricTooltip';
import { PageLayout, PageHeader, PageContent, Card, CardHeader, CardBody, Button } from '../components/ui';

// 指标定义和说明数据
interface MetricDefinition {
  name: string;
  description: string;
  formula: string;
  unit?: string;
  interpretation: string;
}

// 三层指标定义
const METRIC_DEFINITIONS: Record<string, Record<string, MetricDefinition>> = {
  businessMetrics: {
    taskSuccessRate: {
      name: '任务完成率',
      description: '用户成功完成预期任务的比例，是衡量产品核心价值实现程度的关键指标',
      formula: '成功完成任务的会话数 / 总会话数 × 100%',
      unit: '%',
      interpretation: '该指标越高，说明产品越能满足用户需求。通常>80%为优秀水平'
    },
    userValueDensity: {
      name: '用户价值密度',
      description: '单个用户在单次会话中获得的平均价值量化，反映产品对用户的价值创造效率',
      formula: '总用户价值得分 / 总会话数',
      unit: '分',
      interpretation: '数值越高表示每次交互为用户创造的价值越大。>3.0为优秀水平'
    },
    retentionRate7d: {
      name: '7日留存率',
      description: '新用户在首次使用后7天内再次使用产品的比例，反映短期用户黏性',
      formula: '7天内回访的新用户数 / 新用户总数',
      unit: '%',
      interpretation: '反映产品短期吸引力。消费类产品>60%，企业类产品>70%为良好'
    },
    retentionRate30d: {
      name: '30日留存率',
      description: '新用户在首次使用后30天内仍活跃的比例，衡量产品长期价值认知',
      formula: '30天内仍活跃的新用户数 / 新用户总数',
      unit: '%',
      interpretation: '反映产品长期价值。通常30日留存>40%为优秀，>25%为及格'
    },
    userActivation: {
      name: '新用户激活率',
      description: '新用户完成关键激活行为（如完成引导、首次成功交互）的比例',
      formula: '完成激活行为的新用户数 / 新用户总数',
      unit: '%',
      interpretation: '反映产品引导效果。>75%为优秀，>50%为及格水平'
    }
  },
  supportMetrics: {
    effectiveInteractionDepth: {
      name: '有效交互深度',
      description: '用户与系统进行有意义对话的平均轮次，反映用户参与度和系统引导能力',
      formula: '所有会话的有效交互轮次总和 / 总会话数',
      unit: '轮',
      interpretation: '深度越高表示用户参与度越强。2-5轮为正常，>5轮需关注效率'
    },
    clarificationRequestRatio: {
      name: '澄清请求比例',
      description: '系统主动请求用户澄清意图的会话占比，反映系统理解能力和交互设计',
      formula: '包含澄清请求的会话数 / 总会话数',
      unit: '%',
      interpretation: '比例适中说明系统智能。<10%优秀，10-20%正常，>20%需优化'
    },
    firstResponseHitRate: {
      name: '首次命中率',
      description: '系统首次回复就满足用户需求的会话比例，衡量系统理解准确性',
      formula: '首次回复满足需求的会话数 / 总会话数',
      unit: '%',
      interpretation: '反映系统智能程度。>85%优秀，70-85%良好，<70%需改进'
    },
    timeToResolution: {
      name: '问题解决时间',
      description: '从用户提出问题到获得满意答案的平均时间，衡量系统响应效率',
      formula: '所有会话解决时间总和 / 成功解决问题的会话数',
      unit: '秒',
      interpretation: '时间越短用户体验越好。<120秒优秀，120-300秒良好'
    },
    knowledgeCoverage: {
      name: '知识覆盖度',
      description: '系统知识库能够回答用户问题的覆盖程度，反映知识完整性',
      formula: '能够回答的问题类型数 / 用户提出的问题类型总数',
      unit: '%',
      interpretation: '覆盖度越高用户满意度越高。>90%优秀，80-90%良好'
    }
  },
  technicalMetrics: {
    totalSessions: {
      name: '总会话数',
      description: '系统处理的用户会话总数，反映系统使用规模和负载情况',
      formula: '累计用户会话数量',
      unit: '个',
      interpretation: '业务增长的基础指标，需结合其他指标评估系统健康度'
    },
    successRate: {
      name: '成功率',
      description: '技术层面成功处理请求的比例，不包含业务逻辑成功与否',
      formula: '技术成功处理的请求数 / 总请求数',
      unit: '%',
      interpretation: '系统稳定性指标。>99%优秀，95-99%良好，<95%需紧急处理'
    },
    avgResponseTime: {
      name: '平均响应时间',
      description: '系统接收请求到返回响应的平均时长，衡量系统性能',
      formula: '所有请求响应时间总和 / 总请求数',
      unit: '秒',
      interpretation: '用户体验关键指标。<2秒优秀，2-5秒可接受，>5秒需优化'
    },
    p95ResponseTime: {
      name: 'P95响应时间',
      description: '95%的请求响应时间都在此值以下，反映系统性能稳定性',
      formula: '将所有响应时间排序，第95%位置的值',
      unit: '秒',
      interpretation: '反映系统稳定性。<5秒优秀，5-10秒可接受，>10秒需优化'
    },
    avgTokenCost: {
      name: '平均Token成本',
      description: '每个Token的平均成本，用于成本控制和预算规划',
      formula: '总Token成本 / 总Token数量',
      unit: '$/token',
      interpretation: '成本效率指标，需结合业务价值评估ROI'
    },
    tokenCostPerSession: {
      name: 'Token成本/会话',
      description: '每个用户会话的平均Token成本，衡量会话成本效率',
      formula: '总Token成本 / 总会话数',
      unit: '$/会话',
      interpretation: '会话成本控制指标，需与用户价值平衡考虑'
    },
    retryRate: {
      name: '重试率',
      description: '用户因不满意需要重新请求的比例，反映结果质量',
      formula: '触发重试的会话数 / 总会话数',
      unit: '%',
      interpretation: '质量指标。<5%优秀，5-10%可接受，>10%需改进'
    },
    earlyExitRate: {
      name: '早期退出率',
      description: '用户在会话早期就退出的比例，可能表示体验问题',
      formula: '早期退出的会话数 / 总会话数',
      unit: '%',
      interpretation: '用户体验指标。<10%正常，10-15%需关注，>15%需改进'
    },
    toolCallSuccessRate: {
      name: '工具调用成功率',
      description: '系统调用外部工具或API成功的比例，反映系统集成稳定性',
      formula: '成功的工具调用次数 / 总工具调用次数',
      unit: '%',
      interpretation: '系统集成健康度。>95%优秀，90-95%良好，<90%需检查'
    },
    modelFailureRate: {
      name: '模型失效率',
      description: 'AI模型无法正常响应或返回错误的比例，衡量模型稳定性',
      formula: '模型失效次数 / 总模型调用次数',
      unit: '%',
      interpretation: '模型稳定性指标。<2%优秀，2-5%可接受，>5%需紧急处理'
    }
  }
};

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
  },
  {
    id: '2',
    name: '代码生成算法对比',
    description: '比较不同代码生成策略对开发者效率的影响',
    status: 'completed',
    startDate: '2023-12-01',
    endDate: '2024-01-10',
    groups: [
      {
        id: 'control',
        name: '对照组 (标准生成)',
        trafficRatio: 50,
        config: {
          model: 'codegen-standard',
          temperature: 0.2,
          seed: 54321
        },
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 3240,
          conversionRate: 65.8,
          avgMetricValues: {
            taskSuccessRate: 62.4,
            avgResponseTime: 3.2,
            userSatisfaction: 3.9
          },
          costSpent: 156.78,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组 (增强生成)',
        trafficRatio: 50,
        config: {
          model: 'codegen-enhanced',
          temperature: 0.2,
          seed: 54321
        },
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 3198,
          conversionRate: 78.2,
          avgMetricValues: {
            taskSuccessRate: 76.8,
            avgResponseTime: 2.9,
            userSatisfaction: 4.3
          },
          costSpent: 189.34,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 69.6,
        userValueDensity: 3.1,
        retentionRate7d: 0.74,
        retentionRate30d: 0.52,
        userActivation: 0.79
      },
      supportMetrics: {
        effectiveInteractionDepth: 4.1,
        clarificationRequestRatio: 0.12,
        firstResponseHitRate: 0.88,
        timeToResolution: 142,
        knowledgeCoverage: 0.91
      },
      technicalMetrics: {
        totalSessions: 6438,
        successRate: 69.6,
        avgResponseTime: 3.05,
        p95ResponseTime: 6.2,
        avgTokenCost: 0.031,
        tokenCostPerSession: 0.54,
        retryRate: 0.06,
        earlyExitRate: 0.09,
        toolCallSuccessRate: 0.96,
        modelFailureRate: 0.015
      }
    },
    config: {
      splittingStrategy: 'user',
      stratificationDimensions: ['experience_level', 'project_type'],
      environmentControl: {
        fixedSeed: 54321,
        temperature: 0.2,
        consistentParams: true
      },
      complexityLevel: 'high',
      budget: {
        maxCost: 500,
        currentSpent: 346.12
      }
    },
    statisticalAnalysis: {
      pValue: 0.008,
      effectSize: 0.52,
      confidenceInterval: [0.25, 0.79],
      practicalSignificance: true,
      statisticalSignificance: true,
      bayesianResults: {
        probabilityABeatsB: 0.95,
        expectedLift: 0.237,
        credibleInterval: [0.18, 0.29],
        shouldStop: true,
        recommendation: '实验组显著优于对照组，建议全面推广增强生成算法'
      },
      recommendation: 'stop_b_wins'
    },
    explainability: {
      featureImportance: {
        'code_quality': 0.38,
        'generation_speed': 0.24,
        'context_understanding': 0.22,
        'error_handling': 0.16
      },
      successfulPaths: [],
      failurePaths: [],
      causalEffects: []
    }
  },
  {
    id: '3',
    name: '多模态交互优化',
    description: '测试图像+文本混合输入对用户体验的改善效果',
    status: 'paused',
    startDate: '2024-01-20',
    groups: [
      {
        id: 'control',
        name: '对照组 (纯文本)',
        trafficRatio: 60,
        config: {
          model: 'text-only-v2',
          temperature: 0.7,
          seed: 98765
        },
        realTimeMetrics: {
          currentSessions: 892,
          totalSessions: 2150,
          conversionRate: 71.2,
          avgMetricValues: {
            taskSuccessRate: 68.9,
            avgResponseTime: 2.6,
            userSatisfaction: 4.0
          },
          costSpent: 78.45,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组 (多模态)',
        trafficRatio: 40,
        config: {
          model: 'multimodal-v1',
          temperature: 0.7,
          seed: 98765
        },
        realTimeMetrics: {
          currentSessions: 567,
          totalSessions: 1420,
          conversionRate: 79.8,
          avgMetricValues: {
            taskSuccessRate: 77.3,
            avgResponseTime: 3.1,
            userSatisfaction: 4.4
          },
          costSpent: 112.67,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 72.1,
        userValueDensity: 2.7,
        retentionRate7d: 0.71,
        retentionRate30d: 0.48,
        userActivation: 0.75
      },
      supportMetrics: {
        effectiveInteractionDepth: 3.8,
        clarificationRequestRatio: 0.13,
        firstResponseHitRate: 0.85,
        timeToResolution: 168,
        knowledgeCoverage: 0.89
      },
      technicalMetrics: {
        totalSessions: 3570,
        successRate: 72.1,
        avgResponseTime: 2.78,
        p95ResponseTime: 5.1,
        avgTokenCost: 0.035,
        tokenCostPerSession: 0.54,
        retryRate: 0.07,
        earlyExitRate: 0.11,
        toolCallSuccessRate: 0.92,
        modelFailureRate: 0.018
      }
    },
    config: {
      splittingStrategy: 'session',
      stratificationDimensions: ['user_type', 'content_complexity'],
      environmentControl: {
        fixedSeed: 98765,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'medium',
      budget: {
        maxCost: 300,
        currentSpent: 191.12
      }
    },
    statisticalAnalysis: {
      pValue: 0.045,
      effectSize: 0.28,
      confidenceInterval: [0.08, 0.48],
      practicalSignificance: true,
      statisticalSignificance: true,
      bayesianResults: {
        probabilityABeatsB: 0.82,
        expectedLift: 0.126,
        credibleInterval: [0.05, 0.20],
        shouldStop: false,
        recommendation: '实验组有优势但需要更多数据验证，建议继续观察'
      },
      recommendation: 'continue'
    },
    explainability: {
      featureImportance: {
        'visual_understanding': 0.45,
        'response_accuracy': 0.31,
        'interaction_depth': 0.14,
        'processing_time': 0.10
      },
      successfulPaths: [],
      failurePaths: [],
      causalEffects: []
    }
  },
  {
    id: '4',
    name: '个性化推荐策略',
    description: '基于用户历史行为的个性化内容推荐效果测试',
    status: 'running',
    startDate: '2024-01-25',
    groups: [
      {
        id: 'control',
        name: '对照组 (通用推荐)',
        trafficRatio: 50,
        config: {
          model: 'universal-recommender',
          temperature: 0.5,
          seed: 13579
        },
        realTimeMetrics: {
          currentSessions: 1456,
          totalSessions: 4890,
          conversionRate: 73.6,
          avgMetricValues: {
            taskSuccessRate: 71.2,
            avgResponseTime: 2.1,
            userSatisfaction: 4.1
          },
          costSpent: 145.23,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组 (个性化推荐)',
        trafficRatio: 50,
        config: {
          model: 'personalized-recommender',
          temperature: 0.5,
          seed: 13579
        },
        realTimeMetrics: {
          currentSessions: 1523,
          totalSessions: 4967,
          conversionRate: 85.4,
          avgMetricValues: {
            taskSuccessRate: 83.8,
            avgResponseTime: 1.9,
            userSatisfaction: 4.7
          },
          costSpent: 167.89,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 77.5,
        userValueDensity: 3.4,
        retentionRate7d: 0.79,
        retentionRate30d: 0.58,
        userActivation: 0.82
      },
      supportMetrics: {
        effectiveInteractionDepth: 4.3,
        clarificationRequestRatio: 0.09,
        firstResponseHitRate: 0.91,
        timeToResolution: 118,
        knowledgeCoverage: 0.93
      },
      technicalMetrics: {
        totalSessions: 9857,
        successRate: 77.5,
        avgResponseTime: 2.0,
        p95ResponseTime: 3.8,
        avgTokenCost: 0.019,
        tokenCostPerSession: 0.32,
        retryRate: 0.05,
        earlyExitRate: 0.07,
        toolCallSuccessRate: 0.97,
        modelFailureRate: 0.012
      }
    },
    config: {
      splittingStrategy: 'user',
      stratificationDimensions: ['user_behavior', 'preference_category'],
      environmentControl: {
        fixedSeed: 13579,
        temperature: 0.5,
        consistentParams: true
      },
      complexityLevel: 'high',
      budget: {
        maxCost: 800,
        currentSpent: 313.12
      }
    },
    statisticalAnalysis: {
      pValue: 0.001,
      effectSize: 0.68,
      confidenceInterval: [0.42, 0.94],
      practicalSignificance: true,
      statisticalSignificance: true,
      bayesianResults: {
        probabilityABeatsB: 0.98,
        expectedLift: 0.298,
        credibleInterval: [0.24, 0.36],
        shouldStop: false,
        recommendation: '实验组表现卓越，建议继续收集数据以确认长期效果'
      },
      recommendation: 'continue'
    },
    explainability: {
      featureImportance: {
        'user_history': 0.41,
        'content_relevance': 0.29,
        'timing_optimization': 0.18,
        'diversity_balance': 0.12
      },
      successfulPaths: [],
      failurePaths: [],
      causalEffects: []
    }
  },
  {
    id: '5',
    name: '响应速度优化',
    description: '测试缓存策略和预计算对系统响应速度的影响',
    status: 'draft',
    startDate: '2024-02-01',
    groups: [
      {
        id: 'control',
        name: '对照组 (标准响应)',
        trafficRatio: 50,
        config: {
          model: 'standard-response',
          temperature: 0.7,
          seed: 24680
        },
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 0,
          conversionRate: 0,
          avgMetricValues: {
            taskSuccessRate: 0,
            avgResponseTime: 0,
            userSatisfaction: 0
          },
          costSpent: 0,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组 (优化响应)',
        trafficRatio: 50,
        config: {
          model: 'optimized-response',
          temperature: 0.7,
          seed: 24680
        },
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 0,
          conversionRate: 0,
          avgMetricValues: {
            taskSuccessRate: 0,
            avgResponseTime: 0,
            userSatisfaction: 0
          },
          costSpent: 0,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 0,
        userValueDensity: 0,
        retentionRate7d: 0,
        retentionRate30d: 0,
        userActivation: 0
      },
      supportMetrics: {
        effectiveInteractionDepth: 0,
        clarificationRequestRatio: 0,
        firstResponseHitRate: 0,
        timeToResolution: 0,
        knowledgeCoverage: 0
      },
      technicalMetrics: {
        totalSessions: 0,
        successRate: 0,
        avgResponseTime: 0,
        p95ResponseTime: 0,
        avgTokenCost: 0,
        tokenCostPerSession: 0,
        retryRate: 0,
        earlyExitRate: 0,
        toolCallSuccessRate: 0,
        modelFailureRate: 0
      }
    },
    config: {
      splittingStrategy: 'session',
      stratificationDimensions: ['request_type', 'load_level'],
      environmentControl: {
        fixedSeed: 24680,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'low',
      budget: {
        maxCost: 200,
        currentSpent: 0
      }
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
    <PageLayout>
      <PageHeader 
        title="A/B实验" 
        subtitle="基于贝叶斯统计的智能实验分析平台"
      >
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => setShowWizard(true)}
          >
            <Settings className="h-4 w-4" />
            实验向导
          </Button>
          <Button 
            variant="primary"
            onClick={() => setShowCreateExperiment(true)}
          >
            <Plus className="h-4 w-4" />
            创建实验
          </Button>
        </div>
      </PageHeader>

      <PageContent>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 实验列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <h3 className="card-title">实验列表</h3>
              <div className="flex items-center mt-2">
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  实时更新
                </div>
              </div>
            </CardHeader>
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
          </Card>
        </div>

        {/* 主内容区域 */}
        <div className="lg:col-span-3">
          {selectedTest ? (
            <div className="space-y-6">
              {/* 实验概览卡片 */}
              <Card>
                <CardBody>
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
                </CardBody>
              </Card>

              {/* 标签导航 */}
              <Card>
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
                <CardBody>
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
                </CardBody>
              </Card>
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">选择一个实验开始分析</h3>
                <p className="text-gray-500">从左侧列表中选择一个实验来查看详细的分析结果</p>
              </CardBody>
            </Card>
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
      </PageContent>
    </PageLayout>
  );
};

// 实验概览组件
const ExperimentOverview = ({ test }: { test: ABTest }) => (
  <div className="space-y-6">
    {/* 实验组对比 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {test.groups.map((group) => (
        <Card key={group.id}>
          <CardBody>
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
          </CardBody>
        </Card>
      ))}
    </div>

    {/* 预算使用情况 */}
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
      <CardBody>
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
      </CardBody>
    </Card>
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
          metricKey="taskSuccessRate"
          metricCategory="businessMetrics"
        />
        <MetricCard 
          title="用户价值密度" 
          value={metrics.businessMetrics.userValueDensity.toFixed(1)}
          trend="+0.4"
          color="green"
          metricKey="userValueDensity"
          metricCategory="businessMetrics"
        />
        <MetricCard 
          title="7日留存率" 
          value={`${Math.round(metrics.businessMetrics.retentionRate7d * 100)}%`}
          trend="+1.2%"
          color="green"
          metricKey="retentionRate7d"
          metricCategory="businessMetrics"
        />
        <MetricCard 
          title="30日留存率" 
          value={`${Math.round(metrics.businessMetrics.retentionRate30d * 100)}%`}
          trend="+0.8%"
          color="green"
          metricKey="retentionRate30d"
          metricCategory="businessMetrics"
        />
        <MetricCard 
          title="新用户激活率" 
          value={`${Math.round(metrics.businessMetrics.userActivation * 100)}%`}
          trend="+3.1%"
          color="green"
          metricKey="userActivation"
          metricCategory="businessMetrics"
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
          metricKey="effectiveInteractionDepth"
          metricCategory="supportMetrics"
        />
        <MetricCard 
          title="澄清请求比例" 
          value={`${Math.round(metrics.supportMetrics.clarificationRequestRatio * 100)}%`}
          trend="-2.1%"
          color="green"
          metricKey="clarificationRequestRatio"
          metricCategory="supportMetrics"
        />
        <MetricCard 
          title="首次命中率" 
          value={`${Math.round(metrics.supportMetrics.firstResponseHitRate * 100)}%`}
          trend="+4.2%"
          color="green"
          metricKey="firstResponseHitRate"
          metricCategory="supportMetrics"
        />
        <MetricCard 
          title="问题解决时间" 
          value={`${metrics.supportMetrics.timeToResolution}s`}
          trend="-12s"
          color="green"
          metricKey="timeToResolution"
          metricCategory="supportMetrics"
        />
        <MetricCard 
          title="知识覆盖度" 
          value={`${Math.round(metrics.supportMetrics.knowledgeCoverage * 100)}%`}
          trend="+1.8%"
          color="green"
          metricKey="knowledgeCoverage"
          metricCategory="supportMetrics"
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
          metricKey="totalSessions"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="成功率" 
          value={`${metrics.technicalMetrics.successRate}%`}
          trend="+1.2%"
          color="green"
          metricKey="successRate"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="平均响应时间" 
          value={`${metrics.technicalMetrics.avgResponseTime}s`}
          trend="-0.3s"
          color="green"
          metricKey="avgResponseTime"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="P95响应时间" 
          value={`${metrics.technicalMetrics.p95ResponseTime}s`}
          trend="-0.8s"
          color="green"
          metricKey="p95ResponseTime"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="Token成本/会话" 
          value={`$${metrics.technicalMetrics.tokenCostPerSession}`}
          trend="-$0.02"
          color="green"
          metricKey="tokenCostPerSession"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="重试率" 
          value={`${Math.round(metrics.technicalMetrics.retryRate * 100)}%`}
          trend="-1.1%"
          color="green"
          metricKey="retryRate"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="早期退出率" 
          value={`${Math.round(metrics.technicalMetrics.earlyExitRate * 100)}%`}
          trend="-0.8%"
          color="green"
          metricKey="earlyExitRate"
          metricCategory="technicalMetrics"
        />
        <MetricCard 
          title="工具调用成功率" 
          value={`${Math.round(metrics.technicalMetrics.toolCallSuccessRate * 100)}%`}
          trend="+1.5%"
          color="green"
          metricKey="toolCallSuccessRate"
          metricCategory="technicalMetrics"
        />
      </div>
    </div>
  </div>
);

// 指标卡片组件
const MetricCard = ({ title, value, trend, color, metricKey, metricCategory }: { 
  title: string; 
  value: string; 
  trend: string; 
  color: 'green' | 'blue' | 'purple' | 'red';
  metricKey?: string;
  metricCategory?: 'businessMetrics' | 'supportMetrics' | 'technicalMetrics';
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

  // 获取指标定义
  const metricDefinition = metricKey && metricCategory 
    ? METRIC_DEFINITIONS[metricCategory]?.[metricKey]
    : null;

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {title}
        {metricDefinition && (
          <MetricTooltip metric={metricDefinition}>
            <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
          </MetricTooltip>
        )}
      </div>
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
        <Card>
          <CardBody>
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
          </CardBody>
        </Card>

        <Card>
          <CardBody>
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
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

// 可解释性洞察组件
const ExplainabilityInsights = ({ explainability }: { explainability?: ABTest['explainability'] }) => {
  if (!explainability) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无洞察分析数据</h3>
          <p className="text-gray-500">实验数据尚未达到分析阈值，请等待更多数据收集</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 特征重要性分析 */}
      <Card>
        <CardBody>
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
        </CardBody>
      </Card>

      {/* 用户行为路径分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardBody>
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
          </CardBody>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <CardBody>
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
          </CardBody>
        </Card>
      </div>

      {/* 改进建议 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardBody>
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
        </CardBody>
      </Card>
      
    </div>
  );
};

export default ABTestingEnhanced;