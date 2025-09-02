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
  reasoningSteps?: ReasoningStep[]; // 添加推理步骤支持
}

// 数字员工实例（基础版本）
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

// 数字员工管理（完整版本）
export interface DigitalEmployeeManagement {
  id: string;
  name: string;
  employeeNumber: string;
  avatar?: string;
  description?: string;
  
  // 基础状态
  status: 'active' | 'disabled' | 'retired';
  department: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt?: string;
  
  // 角色与人设配置
  persona: {
    systemPrompt: string;
    exampleDialogues?: ConversationExample[];
    personality: string;
    responsibilities: string[];
  };
  
  // 导师汇报机制
  mentorConfig?: {
    mentorId: string;
    mentorName: string;
    reportingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
    cronExpression?: string;
    reportingMethod: 'im' | 'document';
    documentPath?: string;
  };
  
  // 能力与权限
  permissions: {
    allowedTools: string[];
    resourceAccess: ResourcePermission[];
    knowledgeManagement: {
      canSelfLearn: boolean;
      canModifyKnowledge: boolean;
    };
  };
  
  // 知识库
  knowledgeBase: {
    documents: KnowledgeDocument[];
    faqItems: FAQItem[];
    autoLearnedItems?: LearnedKnowledge[];
    knowledgeGraph?: KnowledgeGraphData;
  };
  
  // 记忆系统（高级功能）
  memorySystem?: {
    workingMemory: MemoryEntry[];
    episodicMemory: MemoryEntry[];
    semanticMemory: MemoryEntry[];
    proceduralMemory: MemoryEntry[];
    emotionalMemory: MemoryEntry[];
  };
  
  // 运行统计
  metrics: {
    totalSessions: number;
    successfulSessions: number;
    avgResponseTime: number;
    userSatisfactionScore?: number;
    knowledgeUtilizationRate: number;
    toolUsageStats: Record<string, number>;
  };
}

// 对话示例
export interface ConversationExample {
  id: string;
  userInput: string;
  expectedResponse: string;
  tags: string[];
}

// 资源权限
export interface ResourcePermission {
  resourceType: 'api' | 'database' | 'file_system' | 'external_service';
  resourceId: string;
  resourceName: string;
  accessLevel: 'read' | 'write' | 'admin';
  restrictions?: string[];
}

// 知识文档
export interface KnowledgeDocument {
  id: string;
  name: string;
  type: 'pdf' | 'txt' | 'md' | 'doc' | 'url';
  filePath?: string;
  url?: string;
  uploadedAt: string;
  size: number;
  processedAt?: string;
  extractedContent?: string;
  tags: string[];
  metadata?: Record<string, any>;
}

// FAQ条目
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  confidence: number;
  usageCount: number;
  lastUsed?: string;
  createdAt: string;
  updatedAt: string;
}

// 自动学习的知识
export interface LearnedKnowledge {
  id: string;
  content: string;
  source: 'conversation' | 'feedback' | 'external';
  confidence: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  learnedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  tags: string[];
}

// 知识图谱数据
export interface KnowledgeGraphData {
  entities: GraphEntity[];
  relations: GraphRelation[];
  lastUpdated: string;
  statistics: {
    entityCount: number;
    relationCount: number;
    avgConnectivity: number;
  };
}

export interface GraphEntity {
  id: string;
  name: string;
  type: string;
  properties: Record<string, any>;
  confidence: number;
}

export interface GraphRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  properties: Record<string, any>;
  confidence: number;
}

// 记忆条目
export interface MemoryEntry {
  id: string;
  type: 'working' | 'episodic' | 'semantic' | 'procedural' | 'emotional';
  content: string;
  timestamp: string;
  importance: number;
  accessCount: number;
  lastAccessed?: string;
  associatedIds: string[];
  metadata?: Record<string, any>;
}

// 数字员工创建表单数据
export interface CreateDigitalEmployeeForm {
  name: string;
  employeeNumber: string;
  avatar?: File;
  description?: string;
  department: string;
  
  // 人设配置
  systemPrompt: string;
  personality: string;
  responsibilities: string[];
  exampleDialogues: ConversationExample[];
  
  // 导师配置
  enableMentor: boolean;
  mentorId?: string;
  reportingCycle?: string;
  reportingMethod?: 'im' | 'document';
  
  // 权限配置
  allowedTools: string[];
  resourcePermissions: ResourcePermission[];
  canSelfLearn: boolean;
  
  // 初始知识库
  initialDocuments?: File[];
  initialFAQs: FAQItem[];
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
  status: 'draft' | 'pending_experiment' | 'experimenting' | 'experiment_ended' | 'deploying' | 'deployed' | 'offline' | 'archived';
  startDate: string;
  endDate?: string;
  groups: ABTestGroup[];
  metrics: ABTestMetrics;
  winnerGroup?: string;
  
  // 实验创建方式标识
  creationType: 'human_created' | 'ai_created';
  creator?: {
    type: 'human' | 'ai';
    name: string;
    id: string;
  };
  
  // AI创建的额外元数据
  aiMetadata?: {
    originalInput?: string;
    confidence?: number;
    complexity?: any;
    creationTimestamp?: string;
  };
  
  // 自然语言创建上下文
  nlContext?: {
    originalInput?: string;
    parseResult?: any;
    template?: string;
    confidence?: number;
    complexity?: any;
  };
  
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

// ==================== 工具管理模块 ====================

// MCP工具状态枚举
export type MCPToolStatus = 'draft' | 'configuring' | 'testing' | 'pending_release' | 'published' | 'maintenance' | 'retired';

// A/B实验系统配置
export interface ABTestSystemConfig {
  // 人工创建实验开关：false=AI自动创建，true=需要人工创建
  manualExperimentCreation: boolean;
  // 上线发布审核开关：false=AI自动上线，true=需要人工审核
  deploymentApprovalRequired: boolean;
  
  // 配置更新记录
  lastUpdated: Date;
  updatedBy: {
    userId: string;
    userName: string;
  };
}

// 实验状态中文映射
export const AB_TEST_STATUS_LABELS = {
  'draft': '草稿',
  'pending_experiment': '待实验',
  'experimenting': '实验中', 
  'experiment_ended': '已结束',
  'deploying': '上线中',
  'deployed': '已上线',
  'offline': '已下线',
  'archived': '归档'
} as const;

// 实验创建类型中文映射
export const CREATION_TYPE_LABELS = {
  'human_created': '人工创建',
  'ai_created': 'AI创建'
} as const;

// MCP连接类型
export type MCPConnectionType = 'stdio' | 'sse' | 'http';

// 工具能力类型
export type MCPCapabilityType = 'tools' | 'resources' | 'prompts';

// MCP工具配置
export interface MCPToolConfig {
  connectionType: MCPConnectionType;
  
  // stdio配置
  stdio?: {
    command: string;
    args: string[];
    env?: Record<string, string>;
    workingDirectory?: string;
  };
  
  // sse/http配置
  network?: {
    url: string;
    headers?: Record<string, string>;
    authentication?: {
      type: 'bearer' | 'api_key' | 'oauth2';
      token?: string;
      apiKey?: string;
      oauthConfig?: {
        clientId: string;
        clientSecret: string;
        tokenUrl: string;
      };
    };
    timeout?: number;
    retryPolicy?: {
      maxRetries: number;
      retryDelay: number;
    };
  };
  
  // 安全配置
  security?: {
    sandbox: boolean;
    networkRestrictions: string[];
    resourceLimits: {
      maxMemory?: string;
      maxCpu?: string;
      maxExecutionTime?: number;
    };
    rateLimiting: {
      globalQPS: number;
      perUserQPS?: number;
    };
  };
}

// JSON Schema定义
export interface ToolSchema {
  type: string;
  properties: Record<string, any>;
  required?: string[];
  description?: string;
}

// MCP能力定义
export interface MCPCapability {
  type: MCPCapabilityType;
  name: string;
  description: string;
  schema?: ToolSchema;
  metadata?: Record<string, any>;
}

// MCP工具定义
export interface MCPTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  
  // 状态管理
  status: MCPToolStatus;
  statusHistory: StatusHistoryEntry[];
  
  // 配置信息
  config: MCPToolConfig;
  capabilities: MCPCapability[];
  
  // 权限和治理
  permissions: {
    allowedDepartments: string[];
    allowedUsers?: string[];
    requiresApproval: boolean;
  };
  
  // 版本控制
  versions: MCPToolVersion[];
  currentVersion: string;
  
  // 测试信息
  testing?: {
    testCases: ToolTestCase[];
    lastTestResult?: TestResult;
    testEnvironment?: string;
  };
  
  // 运行时统计
  metrics?: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    lastUsed?: string;
    popularityScore: number;
  };
  
  // 标签和分类
  tags: string[];
  category: string;
}

// 状态历史记录
export interface StatusHistoryEntry {
  id: string;
  fromStatus: MCPToolStatus;
  toStatus: MCPToolStatus;
  timestamp: string;
  operator: string;
  reason?: string;
  metadata?: Record<string, any>;
}

// 工具版本
export interface MCPToolVersion {
  version: string;
  config: MCPToolConfig;
  capabilities: MCPCapability[];
  releaseNotes?: string;
  releasedAt: string;
  releasedBy: string;
  isActive: boolean;
}

// 测试用例
export interface ToolTestCase {
  id: string;
  name: string;
  description: string;
  toolName: string;
  parameters: Record<string, any>;
  expectedResult?: any;
  tags: string[];
  createdAt: string;
  createdBy: string;
}

// 测试结果
export interface TestResult {
  id: string;
  testCaseId: string;
  toolId: string;
  status: 'passed' | 'failed' | 'error' | 'timeout';
  executedAt: string;
  executionTime: number;
  input: Record<string, any>;
  output?: any;
  expectedOutput?: any;
  error?: string;
  logs: string[];
  metadata?: Record<string, any>;
}

// 工具调用记录
export interface ToolCallRecord {
  id: string;
  toolId: string;
  toolName: string;
  userId: string;
  sessionId?: string;
  parameters: Record<string, any>;
  result?: any;
  status: 'success' | 'failed' | 'timeout';
  responseTime: number;
  timestamp: string;
  error?: string;
  metadata?: Record<string, any>;
}

// 工具创建表单
export interface CreateMCPToolForm {
  // 基础信息
  name: string;
  displayName: string;
  description: string;
  category: string;
  tags: string[];
  
  // 连接配置
  connectionType: MCPConnectionType;
  stdioConfig?: {
    command: string;
    args: string[];
    env: Record<string, string>;
  };
  networkConfig?: {
    url: string;
    headers: Record<string, string>;
    authentication?: {
      type: string;
      token?: string;
    };
  };
  
  // 安全配置
  enableSandbox: boolean;
  rateLimiting: {
    globalQPS: number;
    perUserQPS?: number;
  };
  
  // 权限配置
  allowedDepartments: string[];
  requiresApproval: boolean;
  
  // 初始测试用例
  testCases: Omit<ToolTestCase, 'id' | 'createdAt' | 'createdBy'>[];
}

// 工具发现结果
export interface ToolDiscoveryResult {
  success: boolean;
  capabilities: MCPCapability[];
  serverInfo?: {
    name: string;
    version: string;
    protocolVersion: string;
  };
  error?: string;
  discoveredAt: string;
}