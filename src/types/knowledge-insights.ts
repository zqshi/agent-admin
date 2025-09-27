/**
 * 知识洞察分析类型定义
 * 支持创新意识和能力缺失两个维度的深度分析
 */

// 洞察分析类型
export type InsightType = 'innovation' | 'capability_gap' | 'knowledge_pattern' | 'learning_trend';

// 创新维度类型
export type InnovationType =
  | 'tech_innovation'      // 技术创新
  | 'process_innovation'   // 流程创新
  | 'service_innovation'   // 服务创新
  | 'business_innovation'  // 商业模式创新
  | 'cross_domain'         // 跨领域融合
  | 'creative_thinking';   // 创意思维

// 能力缺失类型
export type CapabilityGapType =
  | 'knowledge_gap'        // 知识空白
  | 'skill_gap'           // 技能不足
  | 'information_access'   // 信息获取能力
  | 'learning_ability'     // 学习能力
  | 'analytical_thinking'  // 分析思维
  | 'problem_solving';     // 问题解决

// 分析置信度级别
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high';

// 影响程度
export type ImpactLevel = 'minimal' | 'low' | 'moderate' | 'high' | 'critical';

// 紧急程度
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

// 创新意识洞察
export interface InnovationInsight {
  id: string;
  type: InnovationType;
  title: string;
  description: string;
  detailedAnalysis: string;

  // 创新指标
  metrics: {
    innovationPotential: number;     // 创新潜力 (0-100)
    creativityIndex: number;         // 创造力指数 (0-100)
    crossDomainCapability: number;   // 跨域能力 (0-100)
    implementationFeasibility: number; // 实现可行性 (0-100)
  };

  // 相关知识源
  knowledgeSources: {
    documentIds: string[];
    faqIds: string[];
    learnedKnowledgeIds: string[];
    relevanceScores: Record<string, number>;
  };

  // 创新机会
  opportunities: {
    title: string;
    description: string;
    potentialValue: number;
    riskLevel: 'low' | 'medium' | 'high';
    requiredResources: string[];
  }[];

  // 建议行动
  actionRecommendations: {
    priority: 'low' | 'medium' | 'high';
    action: string;
    expectedOutcome: string;
    timeline: string;
    resources: string[];
  }[];

  confidence: ConfidenceLevel;
  impact: ImpactLevel;
  generatedAt: Date;
  lastUpdated: Date;
  tags: string[];
}

// 能力缺失分析
export interface CapabilityGapAnalysis {
  id: string;
  type: CapabilityGapType;
  title: string;
  description: string;
  detailedAnalysis: string;

  // 缺失程度评估
  gapMetrics: {
    severityScore: number;           // 严重程度 (0-100)
    frequencyImpact: number;         // 频率影响 (0-100)
    businessImpact: number;          // 业务影响 (0-100)
    learningDifficulty: number;      // 学习难度 (0-100)
  };

  // 缺失表现
  gapManifestations: {
    scenario: string;                // 场景描述
    observedBehavior: string;        // 观察到的行为
    expectedBehavior: string;        // 期望行为
    impactDescription: string;       // 影响描述
    frequency: number;               // 出现频率
  }[];

  // 根本原因分析
  rootCauses: {
    category: 'knowledge' | 'skill' | 'tool' | 'process' | 'motivation';
    description: string;
    contributionWeight: number;      // 贡献权重 (0-100)
  }[];

  // 改进路径
  improvementPath: {
    stage: number;
    milestone: string;
    requiredActions: string[];
    estimatedDuration: string;
    successCriteria: string[];
    resources: string[];
  }[];

  // 学习建议
  learningRecommendations: {
    type: 'document' | 'training' | 'mentorship' | 'practice';
    title: string;
    description: string;
    priority: number;
    estimatedEffort: string;
    expectedBenefit: string;
  }[];

  confidence: ConfidenceLevel;
  urgency: UrgencyLevel;
  impact: ImpactLevel;
  generatedAt: Date;
  lastUpdated: Date;
  tags: string[];
}

// 知识模式洞察
export interface KnowledgePatternInsight {
  id: string;
  patternType: 'usage' | 'learning' | 'interaction' | 'evolution';
  title: string;
  description: string;

  // 模式特征
  patternCharacteristics: {
    frequency: number;
    consistency: number;
    strength: number;
    stability: number;
  };

  // 相关数据
  relatedEntities: {
    documents: string[];
    faqs: string[];
    concepts: string[];
    timeRanges: { start: Date; end: Date }[];
  };

  // 趋势信息
  trendData: {
    direction: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    magnitude: number;
    acceleration: number;
    predictedContinuation: number; // 0-100，预测延续性
  };

  implications: string[];
  recommendations: string[];
  confidence: ConfidenceLevel;
  generatedAt: Date;
}

// 综合洞察报告
export interface KnowledgeInsightReport {
  id: string;
  employeeId: string;
  reportType: 'comprehensive' | 'innovation_focused' | 'gap_analysis';

  // 报告概览
  summary: {
    totalInsights: number;
    highPriorityInsights: number;
    innovationScore: number;
    capabilityScore: number;
    overallHealthScore: number;
  };

  // 各类洞察
  innovationInsights: InnovationInsight[];
  capabilityGaps: CapabilityGapAnalysis[];
  knowledgePatterns: KnowledgePatternInsight[];

  // 综合分析
  comprehensiveAnalysis: {
    strengthAreas: string[];
    improvementAreas: string[];
    criticalActions: string[];
    strategicRecommendations: string[];
  };

  // 趋势预测
  predictions: {
    timeline: '1month' | '3months' | '6months' | '1year';
    expectedChanges: string[];
    riskFactors: string[];
    opportunities: string[];
  }[];

  generatedAt: Date;
  validUntil: Date;
  confidence: ConfidenceLevel;
  metadata: {
    analysisVersion: string;
    dataSourcesCount: number;
    processingTime: number;
    algorithmConfig: Record<string, any>;
  };
}

// 洞察分析配置
export interface InsightAnalysisConfig {
  // 分析范围
  analysisScope: {
    includeDocuments: boolean;
    includeFAQs: boolean;
    includeLearnedKnowledge: boolean;
    includeMemoryData: boolean;
    timeRangeLimit?: number; // 天数
  };

  // 算法参数
  algorithmSettings: {
    innovationDetectionThreshold: number;
    gapDetectionSensitivity: number;
    patternMinimumSupport: number;
    confidenceThreshold: number;
  };

  // 输出控制
  outputSettings: {
    maxInsightsPerType: number;
    includeDetailedAnalysis: boolean;
    includeActionPlans: boolean;
    language: 'zh-CN' | 'en-US';
  };
}

// 实时洞察更新
export interface InsightUpdate {
  type: 'new_insight' | 'insight_updated' | 'insight_resolved';
  insightId: string;
  employeeId: string;
  summary: string;
  severity: ImpactLevel;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// 洞察分析状态
export interface InsightAnalysisState {
  status: 'idle' | 'analyzing' | 'completed' | 'error';
  progress: number; // 0-100
  currentStage: string;
  error?: string;
  startTime?: Date;
  completionTime?: Date;
  estimatedTimeRemaining?: number; // 秒
}

// 知识质量评估
export interface KnowledgeQualityAssessment {
  overallScore: number; // 0-100
  dimensions: {
    completeness: number;    // 完整性
    accuracy: number;        // 准确性
    relevance: number;       // 相关性
    timeliness: number;      // 时效性
    accessibility: number;   // 可访问性
    usability: number;       // 可用性
  };
  issuesIdentified: {
    category: string;
    description: string;
    severity: ImpactLevel;
    affectedResources: string[];
    recommendations: string[];
  }[];
}

// 智能建议
export interface SmartRecommendation {
  id: string;
  type: 'learning' | 'process' | 'resource' | 'collaboration';
  priority: number; // 1-10
  title: string;
  description: string;
  rationale: string;
  expectedBenefit: string;
  implementationSteps: string[];
  requiredResources: string[];
  estimatedROI: number;
  riskLevel: 'low' | 'medium' | 'high';
  confidence: ConfidenceLevel;
}

// 导出接口
export type {
  InsightType,
  InnovationType,
  CapabilityGapType,
  ConfidenceLevel,
  ImpactLevel,
  UrgencyLevel
};