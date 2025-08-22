export interface Session {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  status: 'success' | 'failed' | 'running';
  totalMessages: number;
  llmCalls: number;
  toolCalls: number;
  tokens: number;
  responseTime: number;
  messages: ChatMessage[];
  llmTrace: LLMTrace[];
  toolTrace: ToolTrace[];
}

// 数字员工实例
export interface DigitalEmployee {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy' | 'offline';
  currentSessions: number;
  todayTotal: number;
  avgResponseTime: number;
  successRate: number;
  capabilities: string[];
}

// 人类员工
export interface HumanEmployee {
  id: string;
  name: string;
  department: string;
  currentDigitalEmployee?: string;
  sessionStatus: 'active' | 'waiting' | 'idle';
  waitingTime?: number;
}

// 实时会话
export interface LiveSession extends Session {
  isLive: boolean;
  currentStep: string;
  lastActivity: string;
  reasoningSteps: ReasoningStep[];
}

// 推理步骤
export interface ReasoningStep {
  id: string;
  step: number;
  type: 'thinking' | 'tool_decision' | 'tool_execution' | 'response_generation';
  title: string;
  content: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  timestamp: string;
  metadata?: Record<string, any>;
}

// 决策节点
export interface DecisionNode {
  id: string;
  type: 'request' | 'decision' | 'tool_call' | 'result' | 'response';
  title: string;
  content: string;
  status: 'success' | 'error' | 'processing';
  children?: DecisionNode[];
  metadata?: {
    toolName?: string;
    parameters?: Record<string, any>;
    result?: any;
    error?: string;
    duration?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface LLMTrace {
  id: string;
  sessionId: string;
  messageId: string;
  model: string;
  prompt: string;
  response: string;
  tokens: number;
  responseTime: number;
  timestamp: string;
}

export interface ToolTrace {
  id: string;
  sessionId: string;
  toolName: string;
  parameters: Record<string, any>;
  result: any;
  status: 'success' | 'failed';
  responseTime: number;
  timestamp: string;
  error?: string;
}

// 增强的A/B测试定义
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  groups: ABTestGroup[];
  metrics: ABTestMetrics;
  winnerGroup?: string;
  
  // 实验配置
  config: {
    splittingStrategy: 'session' | 'user' | 'hybrid';  // 分流策略
    stratificationDimensions: string[];                 // 分层维度
    environmentControl: {
      fixedSeed: number;        // 固定随机种子
      temperature: number;      // 温度参数
      consistentParams: boolean; // 推理参数一致性
    };
    complexityLevel: 'low' | 'medium' | 'high';        // 复杂度等级
    budget: {
      maxTokens?: number;       // 最大Token预算
      maxCost?: number;         // 最大成本预算
      currentSpent: number;     // 当前支出
    };
  };
  
  // 统计分析结果
  statisticalAnalysis?: {
    pValue: number;
    effectSize: number;         // Cohen's d
    confidenceInterval: [number, number];
    practicalSignificance: boolean;
    statisticalSignificance: boolean;
    bayesianResults?: BayesianAnalysis;
    recommendation: 'continue' | 'stop_a_wins' | 'stop_b_wins' | 'inconclusive';
  };
  
  // 可解释性分析
  explainability?: {
    featureImportance: Record<string, number>;
    successfulPaths: UserPath[];
    failurePaths: UserPath[];
    causalEffects: CausalEffect[];
    timeSeriesAdjustment?: TimeSeriesAdjustment;
  };
}

export interface ABTestGroup {
  id: string;
  name: string;
  trafficRatio: number;
  config: {
    model?: string;
    prompt?: string;
    tools?: string[];
    parameters?: Record<string, any>;
    seed?: number;              // 随机种子
    temperature?: number;       // 温度参数
  };
  
  // 分组的实时指标
  realTimeMetrics?: {
    currentSessions: number;
    totalSessions: number;
    conversionRate: number;
    avgMetricValues: Record<string, number>;
    costSpent: number;
    sampleDistribution: StratifiedSample[];
  };
  
  // 与其他组的对比结果
  comparisonResults?: {
    vsControlGroup?: {
      pValue: number;
      effectSize: number;
      significant: boolean;
      meaningful: boolean;
    };
  };
}

// 扩展的A/B测试指标体系
export interface ABTestMetrics {
  // L1 核心业务指标
  businessMetrics: {
    taskSuccessRate: number;        // 任务完成率
    userValueDensity: number;       // 用户价值密度
    retentionRate7d: number;        // 7日留存率
    retentionRate30d: number;       // 30日留存率
    userActivation: number;         // 新用户激活率
  };
  
  // L2 支撑分析指标
  supportMetrics: {
    effectiveInteractionDepth: number;  // 有效交互深度
    clarificationRequestRatio: number;  // 澄清请求比例
    firstResponseHitRate: number;       // 首次回复命中率
    timeToResolution: number;           // 问题解决时间
    knowledgeCoverage: number;          // 知识覆盖度
  };
  
  // L3 技术监控指标
  technicalMetrics: {
    totalSessions: number;
    successRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    avgTokenCost: number;
    tokenCostPerSession: number;
    retryRate: number;
    earlyExitRate: number;
    toolCallSuccessRate: number;
    modelFailureRate: number;
  };
  
  // 满意度（可选人工标注）
  satisfactionScore?: number;
}

export interface DashboardMetrics {
  activeUsers: number;
  rpm: number;
  totalSessions: number;
  successSessions: number;
  failedSessions: number;
  avgResponseTime: number;
  totalTokens: number;
  tokenCostByModel: Record<string, number>;
}

// 贝叶斯分析结果
export interface BayesianAnalysis {
  probabilityABeatsB: number;     // A组胜过B组的概率
  expectedLift: number;           // 预期提升
  credibleInterval: [number, number]; // 可信区间
  shouldStop: boolean;            // 是否应该停止实验
  recommendation: string;         // 推荐行动
}

// 用户行为路径
export interface UserPath {
  id: string;
  pattern: string[];              // 行为序列模式
  frequency: number;              // 出现频率
  outcomeType: 'success' | 'failure';
  avgSessionLength: number;
  commonFeatures: string[];       // 共同特征
}

// 因果效应
export interface CausalEffect {
  variable: string;
  effect: number;                 // 因果效应大小
  confidence: number;             // 置信度
  mechanism: string;              // 作用机制说明
}

// 时间序列调整
export interface TimeSeriesAdjustment {
  originalEffect: number;
  adjustedEffect: number;
  timeBiasDetected: boolean;
  seasonalityFactors: Record<string, number>;
  externalEvents: ExternalEvent[];
}

// 外部事件
export interface ExternalEvent {
  timestamp: string;
  type: 'system_update' | 'holiday' | 'training' | 'other';
  impact: 'low' | 'medium' | 'high';
  description: string;
}

// 分层样本信息
export interface StratifiedSample {
  stratum: string;
  sampleSize: number;
  weight: number;
  characteristics: Record<string, any>;
}

// 实验复杂度评估
export interface ComplexityAssessment {
  score: number;
  level: 'beginner' | 'intermediate' | 'expert';
  variables: number;
  interactions: number;
  requiredSampleSize: number;
  analysisComplexity: number;
  recommendations: string[];
}