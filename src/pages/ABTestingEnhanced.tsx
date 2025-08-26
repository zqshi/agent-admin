import { useState, useEffect } from 'react';
import { 
  Plus, Trophy, BarChart3, TrendingUp, Users, 
  Brain, Target, CheckCircle, XCircle, AlertTriangle, Settings,
  Eye, Zap, Activity, HelpCircle
} from 'lucide-react';
import { ABTest } from '../types';
import ExperimentWizard from '../components/ExperimentWizard';
import CreateExperiment from '../components/CreateExperiment';
import { MetricTooltip } from '../components/ui/MetricTooltip';
import { PageLayout, PageHeader, PageContent, Card, CardHeader, CardBody, Button } from '../components/ui';
import { getMetricDefinition, getMetricStatus, METRIC_STATUS_COLORS, METRIC_STATUS_LABELS, type MetricDefinition } from '../types/metrics-definitions';

// 增强的实验监控功能
interface ExperimentAlert {
  id: string;
  type: 'budget_warning' | 'anomaly_detected' | 'early_stopping' | 'sample_size_reached';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

// 样本量计算结果
interface SampleSizeCalculation {
  recommendedSize: number;
  currentSize: number;
  confidence: number;
  power: number;
  effect: number;
  estimatedDuration: string;
  recommendation: string;
}

// 复杂度评估详细信息
interface ComplexityDetails {
  level: 'low' | 'medium' | 'high';
  score: number;
  factors: {
    variableCount: number;
    groupCount: number;
    metricComplexity: number;
    stratificationLayers: number;
  };
  risks: string[];
  recommendations: string[];
}

// 智能机会发现引擎相关类型
interface OptimizationOpportunity {
  id: string;
  title: string;
  description: string;
  category: 'performance' | 'cost' | 'quality' | 'user_experience';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: {
    affectedUsers: number;
    potentialImprovement: string;
    estimatedValue: number; // 估算的月度价值
  };
  evidence: {
    metric: string;
    currentValue: number;
    baselineValue: number;
    changePercent: number;
  };
  recommendation: {
    action: string;
    expectedResult: string;
    implementationEffort: 'low' | 'medium' | 'high';
    riskLevel: 'low' | 'medium' | 'high';
  };
  autoExperiment?: {
    name: string;
    hypothesis: string;
    controlConfig: Record<string, any>;
    treatmentConfig: Record<string, any>;
    primaryMetric: string;
    sampleSize: number;
    estimatedDuration: string;
    budget: number;
  };
  createdAt: Date;
  acknowledged: boolean;
}

// 智能决策推荐
interface SmartDecision {
  experimentId: string;
  status: 'ready' | 'pending_approval' | 'approved' | 'rejected';
  decision: 'continue' | 'stop_adopt_a' | 'stop_adopt_b' | 'stop_no_winner';
  confidence: number;
  reasoning: {
    statistical: string;
    business: string;
    risk: string;
  };
  metrics: {
    statisticalSignificance: boolean;
    practicalSignificance: boolean;
    costBenefit: number;
    riskAssessment: 'low' | 'medium' | 'high';
  };
  timeline: {
    recommendedAt: Date;
    shouldImplementBy?: Date;
    rolloutStrategy: 'immediate' | 'gradual' | 'phased';
  };
  rollbackPlan: {
    triggerConditions: string[];
    rollbackDuration: string;
    monitoringMetrics: string[];
  };
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

// 智能机会发现模拟数据
const mockOptimizationOpportunities: OptimizationOpportunity[] = [
  {
    id: 'opp-1',
    title: 'GPT-4响应速度异常慢',
    description: '过去24小时内，GPT-4模型的P95响应时间比基线慢了63%，影响了约1,200名用户的体验。分析显示问题可能来自模型负载过高或配置不当。',
    category: 'performance',
    severity: 'high',
    impact: {
      affectedUsers: 1200,
      potentialImprovement: '响应速度提升30-40%',
      estimatedValue: 8500 // 月度价值
    },
    evidence: {
      metric: 'P95响应时间',
      currentValue: 8.5,
      baselineValue: 5.2,
      changePercent: 63.4
    },
    recommendation: {
      action: '测试Claude-3替代GPT-4',
      expectedResult: '预期响应时间降低到3.2秒，用户满意度提升15%',
      implementationEffort: 'low',
      riskLevel: 'low'
    },
    autoExperiment: {
      name: 'GPT-4 vs Claude-3 响应速度优化实验',
      hypothesis: '使用Claude-3替代GPT-4可以显著提升响应速度，同时保持回答质量',
      controlConfig: { model: 'gpt-4-turbo', temperature: 0.7 },
      treatmentConfig: { model: 'claude-3-opus', temperature: 0.7 },
      primaryMetric: 'avgResponseTime',
      sampleSize: 15000,
      estimatedDuration: '7-10天',
      budget: 500
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
    acknowledged: false
  },
  {
    id: 'opp-2',
    title: '新用户激活率下降',
    description: '新用户完成首次成功交互的比例从78%下降到62%，主要集中在工具调用场景。可能是引导流程过于复杂或工具调用稳定性问题。',
    category: 'user_experience',
    severity: 'medium',
    impact: {
      affectedUsers: 850,
      potentialImprovement: '激活率提升15-20%',
      estimatedValue: 12000
    },
    evidence: {
      metric: '新用户激活率',
      currentValue: 62.0,
      baselineValue: 78.0,
      changePercent: -20.5
    },
    recommendation: {
      action: '优化新用户引导流程和工具调用稳定性',
      expectedResult: '激活率回升至75%+，减少用户流失',
      implementationEffort: 'medium',
      riskLevel: 'low'
    },
    autoExperiment: {
      name: '新用户引导优化实验',
      hypothesis: '简化引导流程并提升工具调用稳定性可以显著提升新用户激活率',
      controlConfig: { guidanceStep: 5, toolCallTimeout: 10 },
      treatmentConfig: { guidanceStep: 3, toolCallTimeout: 15 },
      primaryMetric: 'userActivation',
      sampleSize: 8000,
      estimatedDuration: '5-7天',
      budget: 300
    },
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6小时前
    acknowledged: false
  },
  {
    id: 'opp-3',
    title: 'Token成本异常增长',
    description: '单会话平均Token成本从$0.38增长到$0.52，增幅37%。主要原因是长对话场景增多和重试率上升，需要优化成本控制策略。',
    category: 'cost',
    severity: 'critical',
    impact: {
      affectedUsers: 0, // 成本问题影响所有用户
      potentialImprovement: '月度成本节省$15,000-20,000',
      estimatedValue: 18000
    },
    evidence: {
      metric: 'Token成本/会话',
      currentValue: 0.52,
      baselineValue: 0.38,
      changePercent: 36.8
    },
    recommendation: {
      action: '实施智能Token优化策略',
      expectedResult: '单会话成本控制在$0.40以内，保持服务质量',
      implementationEffort: 'high',
      riskLevel: 'medium'
    },
    autoExperiment: {
      name: 'Token成本优化策略实验',
      hypothesis: '通过智能截断、重试限制和模型选择优化可以显著降低Token成本',
      controlConfig: { maxTokens: 4000, retryLimit: 3 },
      treatmentConfig: { maxTokens: 2500, retryLimit: 2, smartTruncation: true },
      primaryMetric: 'tokenCostPerSession',
      sampleSize: 20000,
      estimatedDuration: '10-14天',
      budget: 800
    },
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12小时前
    acknowledged: false
  }
];

// 智能决策推荐模拟数据
const mockSmartDecisions: SmartDecision[] = [
  {
    experimentId: '1',
    status: 'ready',
    decision: 'stop_adopt_b',
    confidence: 96.5,
    reasoning: {
      statistical: '贝叶斯胜率96.5%，置信区间[0.12, 0.56]，统计显著性p<0.001',
      business: 'Claude-3组响应速度提升32%，用户满意度提升15%，实际业务意义显著',
      risk: '历史数据支撑，无负面指标，用户投诉为0，风险评估为低'
    },
    metrics: {
      statisticalSignificance: true,
      practicalSignificance: true,
      costBenefit: 3.2, // ROI倍数
      riskAssessment: 'low'
    },
    timeline: {
      recommendedAt: new Date(Date.now() - 30 * 60 * 1000),
      shouldImplementBy: new Date(Date.now() + 24 * 60 * 60 * 1000),
      rolloutStrategy: 'gradual'
    },
    rollbackPlan: {
      triggerConditions: [
        '用户满意度下降>10%',
        '响应时间超过5秒',
        '错误率上升>5%'
      ],
      rollbackDuration: '15分钟内完成',
      monitoringMetrics: ['userSatisfaction', 'avgResponseTime', 'errorRate']
    }
  }
];

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
  // 主导航状态：实验管理 | AI智能分析
  const [mainTab, setMainTab] = useState<'experiments' | 'ai_analysis'>('experiments');
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'analysis' | 'insights'>('overview');
  const [realTimeUpdate, setRealTimeUpdate] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [showCreateExperiment, setShowCreateExperiment] = useState(false);
  const [experiments, setExperiments] = useState<ABTest[]>(mockEnhancedABTests);
  const [alerts, setAlerts] = useState<ExperimentAlert[]>([
    {
      id: '1',
      type: 'budget_warning',
      severity: 'medium',
      message: '实验"智能问答模型优化"预算使用率已达82%，建议关注成本控制',
      timestamp: new Date(),
      acknowledged: false
    },
    {
      id: '2', 
      type: 'anomaly_detected',
      severity: 'high',
      message: '检测到"个性化推荐策略"实验组转化率异常波动，建议检查数据质量',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      acknowledged: false
    }
  ]);
  const [sampleSizeCalc, setSampleSizeCalc] = useState<SampleSizeCalculation | null>(null);
  const [opportunities, setOpportunities] = useState<OptimizationOpportunity[]>(mockOptimizationOpportunities);
  const [smartDecisions, setSmartDecisions] = useState<SmartDecision[]>(mockSmartDecisions);
  const [showOpportunityDetails, setShowOpportunityDetails] = useState<string | null>(null);

  // 智能异常检测引擎
  useEffect(() => {
    if (!realTimeUpdate) return;
    
    const interval = setInterval(() => {
      console.log('Running intelligent anomaly detection...');
      
      // 对所有运行中的实验进行异常检测
      experiments.filter(function(exp) { return exp.status === 'running'; }).forEach(function(experiment) {
        const detectedAnomalies = runAnomalyDetection(experiment);
        
        detectedAnomalies.forEach(function(anomaly) {
          // 检查是否已存在相同的告警
          const existingAlert = alerts.filter(function(alert) {
            return alert.type === 'anomaly_detected' && 
                   alert.message.indexOf(experiment.name) !== -1 &&
                   alert.message.indexOf(anomaly.metric) !== -1;
          })[0];
          
          if (!existingAlert) {
            const newAlert: ExperimentAlert = {
              id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              type: 'anomaly_detected',
              severity: anomaly.severity,
              message: `【${experiment.name}】${anomaly.message}`,
              timestamp: new Date(),
              acknowledged: false
            };
            
            setAlerts(function(prev) { return [newAlert].concat(prev.slice(0, 19)); }); // 保持最新20条告警
            
            // 对于严重异常，自动触发保护机制
            if (anomaly.severity === 'critical') {
              handleCriticalAnomaly(experiment, anomaly);
            }
          }
        });
      });
      
      // 检查智能决策机会
      checkForSmartDecisionOpportunities();
      
      // 更新机会发现
      if (Math.random() < 0.05) { // 5% 概率发现新机会
        discoverNewOptimizationOpportunities();
      }
    }, 10000); // 每10秒运行一次

    return () => clearInterval(interval);
  }, [realTimeUpdate, experiments, alerts]);

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

  // 计算样本量建议
  const calculateSampleSize = (test: ABTest) => {
    const currentSize = test.groups.reduce((sum, group) => sum + group.realTimeMetrics.totalSessions, 0);
    const effectSize = test.statisticalAnalysis?.effectSize || 0.2;
    
    // 简化的样本量计算公式
    const recommendedSize = Math.ceil((16 * (1.96 + 0.84) ** 2) / (effectSize ** 2));
    
    setSampleSizeCalc({
      recommendedSize,
      currentSize,
      confidence: 95,
      power: 80,
      effect: effectSize,
      estimatedDuration: currentSize < recommendedSize ? `${Math.ceil((recommendedSize - currentSize) / 100)}天` : '已达标',
      recommendation: currentSize < recommendedSize ? '继续收集数据' : '可以考虑结束实验'
    });
  };

  // 一键紧急停止实验
  const emergencyStop = (testId: string, reason: string) => {
    setExperiments(function(prev) {
      return prev.map(function(exp) {
        return exp.id === testId ? Object.assign({}, exp, { status: 'paused' }) : exp;
      });
    });
    
    const newAlert: ExperimentAlert = {
      id: Date.now().toString(),
      type: 'early_stopping',
      severity: 'high',
      message: `实验已紧急停止：${reason}`,
      timestamp: new Date(),
      acknowledged: false
    };
    setAlerts(function(prev) { return [newAlert].concat(prev); });
  };

  // 确认告警
  const acknowledgeAlert = (alertId: string) => {
    setAlerts(function(prev) {
      return prev.map(function(alert) {
        return alert.id === alertId ? Object.assign({}, alert, { acknowledged: true }) : alert;
      });
    });
  };

  // 获取复杂度详细信息
  const getComplexityDetails = (test: ABTest): ComplexityDetails => {
    const variableCount = test.config.stratificationDimensions.length;
    const groupCount = test.groups.length;
    const metricCount = Object.keys(test.metrics.businessMetrics).length + 
                      Object.keys(test.metrics.supportMetrics).length + 
                      Object.keys(test.metrics.technicalMetrics).length;
    
    const score = (variableCount * 2 + groupCount + metricCount * 0.5) / 10;
    const level = score < 3 ? 'low' : score < 6 ? 'medium' : 'high';
    
    return {
      level,
      score,
      factors: {
        variableCount,
        groupCount,
        metricComplexity: metricCount,
        stratificationLayers: variableCount
      },
      risks: level === 'high' ? ['样本分散风险', '统计功效降低', '结果解释复杂'] : 
             level === 'medium' ? ['需要更大样本量', '运行时间较长'] : 
             ['风险较低'],
      recommendations: level === 'high' ? ['简化变量设计', '分阶段实施', '增加样本量'] :
                      level === 'medium' ? ['优化样本分配', '重点监控关键指标'] :
                      ['当前设计合理']
    };
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

      {/* 主导航Tabs - 优化UE交互设计 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" role="tablist" aria-label="主导航">
            <button
              onClick={() => setMainTab('experiments')}
              role="tab"
              aria-selected={mainTab === 'experiments'}
              aria-controls="experiments-panel"
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 ${
                mainTab === 'experiments'
                  ? 'border-primary-500 text-primary-600 bg-primary-50 rounded-t-md'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-md'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>实验管理</span>
              {experiments.filter(exp => exp.status === 'running').length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {experiments.filter(exp => exp.status === 'running').length}
                </span>
              )}
            </button>
            <button
              onClick={() => setMainTab('ai_analysis')}
              role="tab"
              aria-selected={mainTab === 'ai_analysis'}
              aria-controls="ai-analysis-panel"
              className={`py-4 px-3 border-b-2 font-medium text-sm flex items-center gap-2 transition-all duration-200 relative ${
                mainTab === 'ai_analysis'
                  ? 'border-primary-500 text-primary-600 bg-primary-50 rounded-t-md'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-md'
              }`}
            >
              <Brain className="h-5 w-5" />
              <span>AI智能分析</span>
              {opportunities.filter(opp => !opp.acknowledged).length > 0 && (
                <span className="ml-1 bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {opportunities.filter(opp => !opp.acknowledged).length}
                </span>
              )}
              {realTimeUpdate && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              )}
            </button>
          </nav>
        </div>
      </div>

      <PageContent>
        {mainTab === 'experiments' && (
          <div id="experiments-panel" role="tabpanel" aria-labelledby="experiments-tab">
            {/* 面包屑导航 */}
            <div className="mb-6 flex items-center text-sm text-gray-500">
              <span>A/B实验平台</span>
              <span className="mx-2">/</span>
              <span className="text-gray-900 font-medium">实验管理</span>
              {selectedTest && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-gray-900 font-medium">{selectedTest.name}</span>
                </>
              )}
            </div>
            {/* 实验管理内容 */}

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
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 rounded border border-green-200">
                      <div className="text-green-600 font-medium">任务成功率</div>
                      <div className="font-bold text-green-900">{test.metrics.businessMetrics.taskSuccessRate}%</div>
                      <div className="w-full bg-green-200 rounded-full h-1 mt-1">
                        <div 
                          className="bg-green-500 h-1 rounded-full" 
                          style={{ width: `${test.metrics.businessMetrics.taskSuccessRate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 rounded border border-blue-200">
                      <div className="text-blue-600 font-medium">成本效率</div>
                      <div className="font-bold text-blue-900">${test.metrics.technicalMetrics.tokenCostPerSession}</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {test.metrics.technicalMetrics.tokenCostPerSession < 0.3 ? '优秀' : 
                         test.metrics.technicalMetrics.tokenCostPerSession < 0.5 ? '良好' : '需优化'}
                      </div>
                    </div>
                  </div>
                  
                  {/* 实验状态指示器 */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        test.status === 'running' ? 'bg-green-500' :
                        test.status === 'completed' ? 'bg-blue-500' :
                        test.status === 'paused' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></span>
                      <span className="text-xs text-gray-600">
                        {test.status === 'running' ? '实时运行' : 
                         test.status === 'completed' ? '已完成分析' :
                         test.status === 'paused' ? '暂停中' : '待启动'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      样本量: {test.groups.reduce((sum, group) => sum + group.realTimeMetrics.totalSessions, 0).toLocaleString()}
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
                      { id: 'insights', name: '洞察分析', icon: Eye },
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
                    <ExperimentOverview 
                      test={selectedTest} 
                      sampleSizeCalc={sampleSizeCalc}
                      onCalculateSampleSize={() => calculateSampleSize(selectedTest)}
                      complexityDetails={getComplexityDetails(selectedTest)}
                    />
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
          </div>
        )}
          
        {mainTab === 'ai_analysis' && (
          <div id="ai-analysis-panel" role="tabpanel" aria-labelledby="ai-analysis-tab">
            {/* 面包屑导航 */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <span>A/B实验平台</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium">AI智能分析</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">实时扫描中</span>
                </div>
                <span className="text-gray-500">上次更新：{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            {/* AI智能分析内容 */}
            <div className="space-y-8">
              <SmartAnalysisEngine 
                opportunities={opportunities}
                smartDecisions={smartDecisions}
                onCreateExperiment={(opportunity) => {
                  // 基于机会自动创建实验
                  const experiment = createExperimentFromOpportunity(opportunity);
                  setExperiments(function(prev) { return prev.concat([experiment]); });
                  setShowOpportunityDetails(null);
                  // 切换到实验管理tab并选中新实验
                  setMainTab('experiments');
                  setSelectedTest(experiment);
                  setActiveTab('overview');
                }}
                onAcknowledgeOpportunity={(id) => {
                  setOpportunities(function(prev) { 
                    return prev.map(function(opp) {
                      return opp.id === id ? Object.assign({}, opp, { acknowledged: true }) : opp;
                    });
                  });
                }}
                onApproveDecision={(decision) => {
                  setSmartDecisions(function(prev) {
                    return prev.map(function(d) {
                      return d.experimentId === decision.experimentId 
                        ? Object.assign({}, d, { status: 'approved' })
                        : d;
                    });
                  });
                }}
              />
            </div>
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
};

// 实验概览组件
const ExperimentOverview = ({ 
  test, 
  sampleSizeCalc, 
  onCalculateSampleSize, 
  complexityDetails 
}: { 
  test: ABTest; 
  sampleSizeCalc: SampleSizeCalculation | null;
  onCalculateSampleSize: () => void;
  complexityDetails: ComplexityDetails;
}) => (
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="text-xs text-blue-600 font-medium">当前会话</div>
                <div className="text-lg font-bold text-blue-900">{group.realTimeMetrics.currentSessions.toLocaleString()}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <div className="text-xs text-green-600 font-medium">转化率</div>
                <div className="text-lg font-bold text-green-900">{group.realTimeMetrics.conversionRate}%</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="text-xs text-purple-600 font-medium">已花费</div>
                <div className="text-lg font-bold text-purple-900">${group.realTimeMetrics.costSpent}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                <div className="text-xs text-orange-600 font-medium">满意度</div>
                <div className="text-lg font-bold text-orange-900">{group.realTimeMetrics.avgMetricValues.userSatisfaction}</div>
              </div>
            </div>
          )}
          
            {/* 配置信息 */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="text-xs text-gray-500 mb-2 font-medium">实验配置</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">模型:</span>
                  <span className="font-medium text-gray-900 bg-white px-2 py-1 rounded text-xs">{group.config.model}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">温度:</span>
                  <span className="font-medium text-gray-900">{group.config.temperature}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">种子:</span>
                  <span className="font-medium text-gray-900">{group.config.seed}</span>
                </div>
              </div>
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
    
    {/* 样本量分析和复杂度评估 */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 样本量计算 */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900 flex items-center">
              <Brain className="h-4 w-4 mr-2 text-purple-600" />
              样本量分析
            </h4>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={onCalculateSampleSize}
            >
              重新计算
            </Button>
          </div>
          
          {sampleSizeCalc ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">当前样本</div>
                  <div className="text-lg font-bold text-purple-900">{sampleSizeCalc.currentSize.toLocaleString()}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">建议样本</div>
                  <div className="text-lg font-bold text-purple-900">{sampleSizeCalc.recommendedSize.toLocaleString()}</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">置信度</div>
                  <div className="text-lg font-bold text-purple-900">{sampleSizeCalc.confidence}%</div>
                </div>
                <div className="bg-white p-3 rounded border">
                  <div className="text-gray-600">统计功效</div>
                  <div className="text-lg font-bold text-purple-900">{sampleSizeCalc.power}%</div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">进度</span>
                  <span className="text-sm font-medium">
                    {Math.round((sampleSizeCalc.currentSize / sampleSizeCalc.recommendedSize) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min((sampleSizeCalc.currentSize / sampleSizeCalc.recommendedSize) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  预计剩余时间：{sampleSizeCalc.estimatedDuration}
                </div>
              </div>
              
              <div className="text-sm text-purple-700 bg-purple-100 p-2 rounded">
                <strong>建议：</strong> {sampleSizeCalc.recommendation}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Brain className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <div>点击“重新计算”获取样本量分析</div>
            </div>
          )}
        </CardBody>
      </Card>
      
      {/* 复杂度评估 */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardBody>
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-blue-600" />
            复杂度评估
          </h4>
          
          <div className="space-y-3">
            {/* 复杂度等级 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">复杂度等级</span>
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                complexityDetails.level === 'high' ? 'bg-red-100 text-red-800' :
                complexityDetails.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {complexityDetails.level === 'high' ? '高' : complexityDetails.level === 'medium' ? '中' : '低'}
              </span>
            </div>
            
            {/* 复杂度因子 */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-600">变量数</div>
                <div className="font-bold">{complexityDetails.factors.variableCount}</div>
              </div>
              <div className="bg-white p-2 rounded border">
                <div className="text-gray-600">实验组数</div>
                <div className="font-bold">{complexityDetails.factors.groupCount}</div>
              </div>
            </div>
            
            {/* 风险提示 */}
            <div>
              <div className="text-xs text-gray-600 mb-1">主要风险：</div>
              <div className="space-y-1">
                {complexityDetails.risks.map((risk, index) => (
                  <div key={index} className="flex items-center text-xs text-orange-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {risk}
                  </div>
                ))}
              </div>
            </div>
            
            {/* 建议 */}
            <div>
              <div className="text-xs text-gray-600 mb-1">优化建议：</div>
              <div className="space-y-1">
                {complexityDetails.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center text-xs text-blue-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
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
        <EnhancedMetricCard 
          title="任务完成率" 
          value={metrics.businessMetrics.taskSuccessRate}
          trend="+2.3"
          color="green"
          definition={getMetricDefinition('session_completion_rate')}
        />
        <EnhancedMetricCard 
          title="用户价值密度" 
          value={metrics.businessMetrics.userValueDensity}
          trend="+0.4"
          color="green"
          definition={getMetricDefinition('business_decision_support')}
        />
        <EnhancedMetricCard 
          title="7日留存率" 
          value={metrics.businessMetrics.retentionRate7d}
          trend="+1.2"
          color="green"
          definition={getMetricDefinition('cost_optimization_effectiveness')}
        />
        <EnhancedMetricCard 
          title="30日留存率" 
          value={metrics.businessMetrics.retentionRate30d}
          trend="+0.8"
          color="green"
          definition={getMetricDefinition('issue_early_warning_effectiveness')}
        />
        <EnhancedMetricCard 
          title="新用户激活率" 
          value={metrics.businessMetrics.userActivation}
          trend="+3.1"
          color="green"
          definition={getMetricDefinition('analysis_insight_accuracy')}
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

// 增强版指标卡片组件
const EnhancedMetricCard = ({ title, value, trend, color, definition }: { 
  title: string; 
  value: number;
  trend: string; 
  color: 'green' | 'blue' | 'purple' | 'red';
  definition?: any;
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    red: 'border-red-200 bg-red-50'
  };

  const trendIsPositive = trend.startsWith('+');
  const trendColor = trendIsPositive ? 'text-green-600' : 'text-red-600';
  
  // 格式化数值
  const formattedValue = typeof value === 'number' ? 
    (value < 1 ? `${Math.round(value * 100)}%` : value.toLocaleString()) : value;

  // 获取指标状态
  const status = definition ? getMetricStatus(definition, value) : 'good';
  const statusColor = METRIC_STATUS_COLORS[status];

  return (
    <div className={`border rounded-lg p-4 relative ${colorClasses[color]}`}>
      {/* 状态标识 */}
      {definition && (
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 text-xs rounded-full ${statusColor}`}>
          {METRIC_STATUS_LABELS[status]}
        </div>
      )}
      
      <div className="text-sm font-medium text-gray-600 mb-1 flex items-center gap-1">
        {title}
        {definition && (
          <MetricTooltip metric={{
            name: definition.name,
            description: definition.description,
            formula: definition.calculation,
            unit: definition.unit,
            interpretation: `目标值：优秀>${definition.targets?.excellent}, 良好>${definition.targets?.good}`
          }}>
            <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-help" />
          </MetricTooltip>
        )}
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">{formattedValue}</div>
      
      <div className="flex items-center justify-between">
        <div className={`text-sm ${trendColor} flex items-center`}>
          {trendIsPositive ? '+' : ''}{trend}
          {trendIsPositive ? '↗' : '↘'}
        </div>
        {definition?.unit && (
          <div className="text-xs text-gray-500">{definition.unit}</div>
        )}
      </div>
    </div>
  );
};

// 兼容旧版本的指标卡片组件
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
          <div className="text-center bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round((analysis.bayesianResults?.probabilityABeatsB || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mb-3">实验组胜率</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.round((analysis.bayesianResults?.probabilityABeatsB || 0) * 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="text-center bg-white p-4 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">
              +{Math.round((analysis.bayesianResults?.expectedLift || 0) * 100)}%
            </div>
            <div className="text-sm text-gray-600 mb-3">预期提升</div>
            <div className="flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs text-green-600 font-medium">显著提升</span>
            </div>
          </div>
          
          <div className="text-center bg-white p-4 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {analysis.effectSize.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600 mb-3">效果量 (Cohen's d)</div>
            <div className="text-xs text-purple-600">
              {analysis.effectSize > 0.8 ? '大效果' : 
               analysis.effectSize > 0.5 ? '中等效果' : 
               analysis.effectSize > 0.2 ? '小效果' : '微弱效果'}
            </div>
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
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className={`p-4 rounded-lg text-center border-2 ${
              analysis.statisticalSignificance && analysis.practicalSignificance 
                ? 'bg-green-50 text-green-800 border-green-200' 
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <CheckCircle className={`h-5 w-5 mx-auto mb-2 ${
                analysis.statisticalSignificance && analysis.practicalSignificance ? 'text-green-600' : 'text-gray-400'
              }`} />
              <div>显著 + 有意义</div>
              <strong className="text-xs">✓ 推荐上线</strong>
            </div>
            <div className={`p-4 rounded-lg text-center border-2 ${
              analysis.statisticalSignificance && !analysis.practicalSignificance
                ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <AlertTriangle className={`h-5 w-5 mx-auto mb-2 ${
                analysis.statisticalSignificance && !analysis.practicalSignificance ? 'text-yellow-600' : 'text-gray-400'
              }`} />
              <div>显著 + 无意义</div>
              <strong className="text-xs">⚠ 不建议</strong>
            </div>
            <div className={`p-4 rounded-lg text-center border-2 ${
              !analysis.statisticalSignificance && analysis.practicalSignificance
                ? 'bg-blue-50 text-blue-800 border-blue-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <Eye className={`h-5 w-5 mx-auto mb-2 ${
                !analysis.statisticalSignificance && analysis.practicalSignificance ? 'text-blue-600' : 'text-gray-400'
              }`} />
              <div>不显著 + 有意义</div>
              <strong className="text-xs">👁 继续观察</strong>
            </div>
            <div className={`p-4 rounded-lg text-center border-2 ${
              !analysis.statisticalSignificance && !analysis.practicalSignificance
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-gray-50 text-gray-600 border-gray-200'
            }`}>
              <XCircle className={`h-5 w-5 mx-auto mb-2 ${
                !analysis.statisticalSignificance && !analysis.practicalSignificance ? 'text-red-600' : 'text-gray-400'
              }`} />
              <div>不显著 + 无意义</div>
              <strong className="text-xs">✗ 停止实验</strong>
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

// 基于机会自动创建实验的函数
const createExperimentFromOpportunity = (opportunity: OptimizationOpportunity): ABTest => {
  if (!opportunity.autoExperiment) {
    throw new Error('该机会没有自动实验配置');
  }

  const { autoExperiment } = opportunity;
  const experimentId = `exp-${Date.now()}`;

  return {
    id: experimentId,
    name: autoExperiment.name,
    description: `${autoExperiment.hypothesis}\n\n基于智能机会发现自动创建：${opportunity.title}`,
    status: 'draft',
    startDate: new Date().toISOString().split('T')[0],
    groups: [
      {
        id: 'control',
        name: '对照组',
        trafficRatio: 50,
        config: autoExperiment.controlConfig,
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 0,
          conversionRate: 0,
          avgMetricValues: {},
          costSpent: 0,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组',
        trafficRatio: 50,
        config: autoExperiment.treatmentConfig,
        realTimeMetrics: {
          currentSessions: 0,
          totalSessions: 0,
          conversionRate: 0,
          avgMetricValues: {},
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
      stratificationDimensions: ['user_segment'],
      environmentControl: {
        fixedSeed: Math.floor(Math.random() * 100000),
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: opportunity.recommendation.implementationEffort === 'low' ? 'low' : 
                       opportunity.recommendation.implementationEffort === 'medium' ? 'medium' : 'high',
      budget: {
        maxCost: autoExperiment.budget,
        currentSpent: 0
      }
    }
  };
};

// 智能分析引擎组件
const SmartAnalysisEngine = ({ 
  opportunities, 
  smartDecisions, 
  onCreateExperiment, 
  onAcknowledgeOpportunity, 
  onApproveDecision 
}: {
  opportunities: OptimizationOpportunity[];
  smartDecisions: SmartDecision[];
  onCreateExperiment: (opportunity: OptimizationOpportunity) => void;
  onAcknowledgeOpportunity: (id: string) => void;
  onApproveDecision: (decision: SmartDecision) => void;
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return <Zap className="h-5 w-5" />;
      case 'cost': return <TrendingUp className="h-5 w-5" />;
      case 'quality': return <Target className="h-5 w-5" />;
      case 'user_experience': return <Users className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return '刚刚';
    if (diffHours < 24) return `${diffHours}小时前`;
    return `${Math.floor(diffHours / 24)}天前`;
  };

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-600" />
            AI智能分析引擎
          </h2>
          <p className="text-gray-600 mt-1">自动发现优化机会，智能推荐决策方案</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">实时扫描中</span>
          </div>
          <span className="text-gray-500">上次更新：{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* 智能机会发现 */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-amber-500" />
          <h3 className="text-xl font-semibold text-gray-800">智能机会发现</h3>
          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full font-medium">
            {opportunities.filter(function(o) { return !o.acknowledged; }).length} 个待处理
          </span>
        </div>

        <div className="grid gap-6">
          {opportunities.map((opportunity) => (
            <Card key={opportunity.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="space-y-4">
                  {/* 机会头部信息 */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${getSeverityColor(opportunity.severity)}`}>
                        {getCategoryIcon(opportunity.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-lg">{opportunity.title}</h4>
                        <p className="text-gray-600 mt-1">{opportunity.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(opportunity.severity)}`}>
                        {opportunity.severity === 'critical' ? '紧急' :
                         opportunity.severity === 'high' ? '高' :
                         opportunity.severity === 'medium' ? '中' : '低'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(opportunity.createdAt)}</p>
                    </div>
                  </div>

                  {/* 证据和影响 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">检测证据</h5>
                      <div className="text-sm">
                        <p className="text-gray-600">{opportunity.evidence.metric}</p>
                        <p className="font-medium">
                          {opportunity.evidence.currentValue} 
                          <span className="text-gray-500"> (基线: {opportunity.evidence.baselineValue})</span>
                        </p>
                        <p className={`font-medium ${opportunity.evidence.changePercent > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          变化: {opportunity.evidence.changePercent > 0 ? '+' : ''}{opportunity.evidence.changePercent.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">影响范围</h5>
                      <div className="text-sm">
                        {opportunity.impact.affectedUsers > 0 && (
                          <p className="text-gray-600">影响用户: <span className="font-medium">{opportunity.impact.affectedUsers.toLocaleString()}</span></p>
                        )}
                        <p className="text-gray-600">预期改进: <span className="font-medium">{opportunity.impact.potentialImprovement}</span></p>
                        <p className="text-green-600 font-medium">估算价值: ${opportunity.impact.estimatedValue.toLocaleString()}/月</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">建议行动</h5>
                      <div className="text-sm">
                        <p className="text-gray-600 mb-1">{opportunity.recommendation.action}</p>
                        <p className="text-xs text-gray-500">
                          实施难度: {opportunity.recommendation.implementationEffort === 'low' ? '低' :
                                    opportunity.recommendation.implementationEffort === 'medium' ? '中' : '高'} | 
                          风险: {opportunity.recommendation.riskLevel === 'low' ? '低' :
                                opportunity.recommendation.riskLevel === 'medium' ? '中' : '高'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex gap-2">
                      {opportunity.autoExperiment && !opportunity.acknowledged && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onCreateExperiment(opportunity)}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          一键创建实验
                        </Button>
                      )}
                      {!opportunity.acknowledged && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onAcknowledgeOpportunity(opportunity.id)}
                        >
                          标记已读
                        </Button>
                      )}
                    </div>
                    {opportunity.acknowledged && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        已处理
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* 智能决策推荐 */}
      {smartDecisions.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="h-5 w-5 text-gold-500" />
            <h3 className="text-xl font-semibold text-gray-800">智能决策推荐</h3>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
              {smartDecisions.filter(function(d) { return d.status === 'ready'; }).length} 个待批准
            </span>
          </div>

          <div className="space-y-4">
            {smartDecisions.map((decision) => (
              <Card key={decision.experimentId} className="border-l-4 border-l-green-500">
                <CardBody>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          实验决策建议
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            置信度 {decision.confidence}%
                          </span>
                        </h4>
                        <p className="text-gray-600 mt-1">
                          {decision.decision === 'stop_adopt_b' ? '建议采用实验组方案' :
                           decision.decision === 'stop_adopt_a' ? '建议采用对照组方案' :
                           decision.decision === 'continue' ? '建议继续实验' : '建议停止实验'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          decision.status === 'ready' ? 'bg-amber-100 text-amber-800' :
                          decision.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {decision.status === 'ready' ? '待审批' :
                           decision.status === 'approved' ? '已批准' : '已拒绝'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">统计分析</h5>
                        <p className="text-sm text-blue-700">{decision.reasoning.statistical}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">业务意义</h5>
                        <p className="text-sm text-blue-700">{decision.reasoning.business}</p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-800 mb-2">风险评估</h5>
                        <p className="text-sm text-blue-700">{decision.reasoning.risk}</p>
                      </div>
                    </div>

                    {decision.status === 'ready' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onApproveDecision(decision)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          批准决策
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                        >
                          查看详情
                        </Button>
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {opportunities.length === 0 && smartDecisions.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无智能建议</h3>
          <p className="text-gray-500">AI正在分析您的实验数据，请稍候...</p>
        </div>
      )}
    </div>
  );
};

// 智能异常检测算法
interface DetectedAnomaly {
  metric: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  baselineValue: number;
  deviationPercent: number;
  riskLevel: number; // 0-1 的风险评分
}

const runAnomalyDetection = (experiment: ABTest): DetectedAnomaly[] => {
  const anomalies: DetectedAnomaly[] = [];
  
  // 1. 预算异常检测
  const budgetUsage = experiment.config.budget.currentSpent / experiment.config.budget.maxCost;
  if (budgetUsage > 0.9) {
    anomalies.push({
      metric: '预算使用率',
      severity: 'critical',
      message: `预算使用率${(budgetUsage * 100).toFixed(1)}%，即将超支！建议立即停止或调整预算`,
      currentValue: budgetUsage * 100,
      baselineValue: 80,
      deviationPercent: ((budgetUsage - 0.8) / 0.8) * 100,
      riskLevel: Math.min(budgetUsage, 1)
    });
  } else if (budgetUsage > 0.8) {
    anomalies.push({
      metric: '预算使用率',
      severity: 'high',
      message: `预算使用率${(budgetUsage * 100).toFixed(1)}%，接近限额，建议关注`,
      currentValue: budgetUsage * 100,
      baselineValue: 80,
      deviationPercent: ((budgetUsage - 0.8) / 0.8) * 100,
      riskLevel: budgetUsage
    });
  }

  // 2. 响应时间异常检测
  const avgResponseTime = experiment.metrics.technicalMetrics.avgResponseTime;
  const p95ResponseTime = experiment.metrics.technicalMetrics.p95ResponseTime;
  
  if (avgResponseTime > 5) {
    anomalies.push({
      metric: '平均响应时间',
      severity: avgResponseTime > 8 ? 'critical' : 'high',
      message: `平均响应时间${avgResponseTime.toFixed(1)}秒，严重影响用户体验`,
      currentValue: avgResponseTime,
      baselineValue: 2,
      deviationPercent: ((avgResponseTime - 2) / 2) * 100,
      riskLevel: Math.min(avgResponseTime / 10, 1)
    });
  }

  if (p95ResponseTime > 10) {
    anomalies.push({
      metric: 'P95响应时间',
      severity: 'high',
      message: `P95响应时间${p95ResponseTime.toFixed(1)}秒，系统性能不稳定`,
      currentValue: p95ResponseTime,
      baselineValue: 5,
      deviationPercent: ((p95ResponseTime - 5) / 5) * 100,
      riskLevel: Math.min(p95ResponseTime / 20, 1)
    });
  }

  // 3. 成功率异常检测
  const successRate = experiment.metrics.technicalMetrics.successRate;
  if (successRate < 95) {
    anomalies.push({
      metric: '技术成功率',
      severity: successRate < 90 ? 'critical' : 'high',
      message: `技术成功率${successRate.toFixed(1)}%，系统稳定性问题`,
      currentValue: successRate,
      baselineValue: 99,
      deviationPercent: ((99 - successRate) / 99) * 100,
      riskLevel: (100 - successRate) / 100
    });
  }

  // 4. Token成本异常检测
  const tokenCostPerSession = experiment.metrics.technicalMetrics.tokenCostPerSession;
  if (tokenCostPerSession > 0.5) {
    anomalies.push({
      metric: 'Token成本/会话',
      severity: tokenCostPerSession > 0.8 ? 'critical' : 'medium',
      message: `单会话Token成本$${tokenCostPerSession.toFixed(3)}，成本过高`,
      currentValue: tokenCostPerSession,
      baselineValue: 0.38,
      deviationPercent: ((tokenCostPerSession - 0.38) / 0.38) * 100,
      riskLevel: Math.min(tokenCostPerSession / 1, 1)
    });
  }

  // 5. 用户体验指标异常检测
  const taskSuccessRate = experiment.metrics.businessMetrics.taskSuccessRate;
  if (taskSuccessRate < 70) {
    anomalies.push({
      metric: '任务完成率',
      severity: taskSuccessRate < 60 ? 'critical' : 'high',
      message: `任务完成率${taskSuccessRate.toFixed(1)}%，用户体验严重下降`,
      currentValue: taskSuccessRate,
      baselineValue: 80,
      deviationPercent: ((80 - taskSuccessRate) / 80) * 100,
      riskLevel: (100 - taskSuccessRate) / 100
    });
  }

  // 6. 模型失效率检测
  const modelFailureRate = experiment.metrics.technicalMetrics.modelFailureRate;
  if (modelFailureRate > 0.05) {
    anomalies.push({
      metric: '模型失效率',
      severity: modelFailureRate > 0.1 ? 'critical' : 'high',
      message: `模型失效率${(modelFailureRate * 100).toFixed(1)}%，模型稳定性问题`,
      currentValue: modelFailureRate * 100,
      baselineValue: 2,
      deviationPercent: ((modelFailureRate - 0.02) / 0.02) * 100,
      riskLevel: Math.min(modelFailureRate / 0.2, 1)
    });
  }

  return anomalies;
};

// 处理严重异常的自动保护机制
const handleCriticalAnomaly = (experiment: ABTest, anomaly: DetectedAnomaly) => {
  console.log(`🚨 CRITICAL ANOMALY DETECTED: ${anomaly.message}`);
  
  // 根据异常类型执行相应的保护措施
  switch (anomaly.metric) {
    case '预算使用率':
      if (anomaly.currentValue > 95) {
        // 自动暂停实验
        console.log(`⚠️ 自动暂停实验 ${experiment.name} - 预算超支风险`);
        // 这里可以调用API暂停实验
      }
      break;
      
    case '技术成功率':
      if (anomaly.currentValue < 85) {
        console.log(`⚠️ 建议立即检查实验 ${experiment.name} - 系统故障风险`);
        // 可以自动降低流量分配
      }
      break;
      
    case '任务完成率':
      if (anomaly.currentValue < 50) {
        console.log(`⚠️ 用户体验严重恶化，建议暂停实验 ${experiment.name}`);
      }
      break;
  }
  
  // 发送紧急通知（这里可以集成邮件、短信、Slack等）
  sendEmergencyNotification(experiment, anomaly);
};

// 发送紧急通知
const sendEmergencyNotification = (experiment: ABTest, anomaly: DetectedAnomaly) => {
  const notification = {
    level: 'CRITICAL',
    experiment: experiment.name,
    metric: anomaly.metric,
    message: anomaly.message,
    riskLevel: anomaly.riskLevel,
    timestamp: new Date().toISOString(),
    suggestedActions: [
      '立即检查实验配置',
      '考虑暂停实验',
      '联系技术团队',
      '分析根本原因'
    ]
  };
  
  console.log('🚨 紧急通知:', notification);
  // 这里可以调用实际的通知服务
};

// 检查智能决策机会
const checkForSmartDecisionOpportunities = () => {
  // 这个函数会分析当前运行的实验，看是否有足够的数据来做出智能决策
  console.log('🧠 检查智能决策机会...');
  
  // 模拟检查逻辑
  // 实际实现中，这里会：
  // 1. 计算贝叶斯统计显著性
  // 2. 评估业务影响
  // 3. 分析风险因素
  // 4. 生成决策建议
};

// 发现新的优化机会
const discoverNewOptimizationOpportunities = () => {
  console.log('🔍 AI正在扫描新的优化机会...');
  
  // 模拟发现新机会的逻辑
  const potentialOpportunities = [
    {
      type: 'performance',
      description: '检测到API响应时间波动，可能需要优化缓存策略'
    },
    {
      type: 'cost',
      description: '发现Token使用模式异常，建议实施智能压缩'
    },
    {
      type: 'quality',
      description: '用户重试率上升，可能是回答质量问题'
    }
  ];
  
  // 实际实现中会更新opportunities状态
  console.log('发现潜在机会:', potentialOpportunities[Math.floor(Math.random() * potentialOpportunities.length)]);
};

export default ABTestingEnhanced;