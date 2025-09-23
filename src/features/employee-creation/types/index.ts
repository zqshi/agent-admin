/**
 * 统一员工创建系统类型定义
 */


// 创建阶段类型
export type CreationStage = 'basic' | 'features' | 'domains' | 'advanced';

// 基础信息配置
export interface BasicInfo {
  name: string;              // 数字员工姓名
  employeeId: string;        // 员工编号
  department: string;        // 所属部门
  description?: string;      // 描述

  // 职责定义（智能推荐的关键）
  primaryRole: string;       // 主要职责
  responsibilities: string[];// 具体职责列表
  serviceScope: string[];    // 服务范围

  // 智能推荐
  autoSuggest: boolean;      // 启用智能建议

  // 多领域配置
  enableMultiDomain: boolean;    // 是否启用多领域
  estimatedDomains?: number;     // 预估领域数量

  // 增强分析结果字段
  personalityTraits?: any[];
  workStyle?: any;
  communicationStyle?: any;
  toolRecommendations?: any[];
}

// 性格维度
export interface PersonalityTraits {
  friendliness: number;      // 友好度 1-10
  professionalism: number;   // 专业度 1-10
  patience: number;          // 耐心度 1-10
  empathy: number;           // 共情能力 1-10
}

// 工作风格
export interface WorkStyle {
  rigor: 'strict' | 'balanced' | 'flexible';           // 严谨度
  humor: 'none' | 'occasional' | 'frequent';           // 幽默程度
  proactivity: 'reactive' | 'balanced' | 'proactive'; // 主动性
  detailOrientation: 'high' | 'medium' | 'low';       // 细节关注度
}

// 沟通特征
export interface CommunicationStyle {
  responseLength: 'concise' | 'moderate' | 'detailed';
  language: 'formal' | 'neutral' | 'casual';
  technicality: 'simple' | 'moderate' | 'technical';
}

// MBTI人格类型
export interface MBTIProfile {
  // 四个维度
  energySource: 'E' | 'I';        // 外向(E) vs 内向(I)
  infoGathering: 'S' | 'N';       // 感觉(S) vs 直觉(N)
  decisionMaking: 'T' | 'F';      // 思考(T) vs 情感(F)
  lifestyle: 'J' | 'P';           // 判断(J) vs 感知(P)

  // MBTI类型（如INTJ）
  type: string;

  // 类型特征描述
  characteristics: {
    strengths: string[];          // 优势
    workStyle: string[];          // 工作风格
    communication: string[];      // 沟通方式
    teamRole: string;            // 团队角色
    idealScenarios: string[];    // 理想应用场景
  };
}

// 人格配置模式
export type PersonalityConfigMode = 'quick' | 'mbti' | 'custom';

// 核心特征配置
export interface CoreFeatures {
  personality: PersonalityTraits;
  workStyle: WorkStyle;
  communication: CommunicationStyle;

  // 新增MBTI配置
  mbtiProfile?: MBTIProfile;
  personalityMode: PersonalityConfigMode;
}

// Slot配置
export interface SlotConfig {
  name: string;
  source: 'system' | 'user' | 'context' | 'external';
  injectionTiming: 'onStart' | 'onDemand' | 'scheduled';
  injectionOrder: number;
  required: boolean;
  defaultValue?: any;
  transformer?: string;
}

// 压缩策略
export interface CompressionConfig {
  enabled: boolean;
  trigger: 'tokenLimit' | 'turnLimit' | 'timeLimit';
  threshold: number;
  strategy: 'summary' | 'extraction' | 'hybrid';
  preserveKeys: string[];
}

// 异常处理策略
export interface ErrorHandlingConfig {
  onSlotMissing: 'useDefault' | 'skip' | 'error';
  onCompressionFail: 'retry' | 'fallback' | 'error';
  fallbackPrompt?: string;
}

// Prompt配置（MCP风格）
export interface PromptConfig {
  templates: PromptTemplate[];
  slots: SlotConfig[];
  compression: CompressionConfig;
  errorHandling: ErrorHandlingConfig;
}

// Prompt模板
export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  basePrompt: string;
  variables: TemplateVariable[];
  isDefault?: boolean;
}

// 模板变量
export interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  required: boolean;
  defaultValue?: any;
}

// 知识管理配置
export interface KnowledgeConfig {
  documents: {
    files: File[];
    maxSize: number;
    allowedFormats: string[];
  };
  faq: {
    items: import('../../../types').FAQItem[];
    importSource: 'manual' | 'csv' | 'existing';
  };
  retention: {
    enabled: boolean;
    strategy: 'internalize' | 'externalize';
    externalPath?: string;
    updateFrequency: 'realtime' | 'daily' | 'weekly';
  };
  knowledgeBase: {
    type: 'internal' | 'external' | 'hybrid';
    internalSources: string[];
    externalAPIs: ExternalAPIConfig[];
  };
  knowledgeGraph: {
    enabled: boolean;
    autoGenerate: boolean;
    updateTrigger: 'manual' | 'scheduled' | 'onChange';
    visualization: boolean;
  };
}

// 外部API配置
export interface ExternalAPIConfig {
  endpoint: string;
  auth: string;
  queryFormat: string;
  name?: string;
}

// 工具配置
export interface ToolConfig {
  recommendedTools: Tool[];
  selectedTools: SelectedTool[];
  usagePolicy: {
    requireConfirmation: boolean;
    loggingLevel: 'none' | 'basic' | 'detailed';
    rateLimits?: Map<string, number>;
  };
}

// 工具定义
export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  icon?: string;
  capabilities: string[];
}

// 已选择的工具
export interface SelectedTool extends Tool {
  permissions: string[];
  config?: any;
}

// 导师机制配置
export interface MentorConfig {
  enabled: boolean;
  mentor: {
    id: string;
    name: string;
    role: string;
  };
  reporting: {
    enabled: boolean;
    schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
    customCron?: string;
    method: 'email' | 'im' | 'dashboard' | 'document';
    template: string;
  };
  supervision: {
    reviewDecisions: boolean;
    approvalRequired: string[];
    escalationRules: EscalationRule[];
  };
}

// 升级规则
export interface EscalationRule {
  condition: string;
  action: string;
  priority: 'low' | 'medium' | 'high';
}

// 高级配置
export interface AdvancedConfig {
  persona?: {
    systemPrompt: string;
    characterBackground: string;
    constraints: string[];
    examples: DialogueExample[];
  };
  prompt?: PromptConfig;
  knowledge?: KnowledgeConfig;
  tools?: ToolConfig;
  mentor?: MentorConfig;
}

// 对话示例
export interface DialogueExample {
  scenario: string;
  userInput: string;
  expectedResponse: string;
}

// 配置建议
export interface ConfigSuggestion {
  type: 'improvement' | 'warning' | 'optimization' | 'enhancement';
  field: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  value?: any;
  action?: () => void;
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
}

// 验证错误
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// 验证警告
export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// 完整的创建配置
export interface EmployeeCreationConfig {
  basic: BasicInfo;
  features: CoreFeatures;
  advanced: AdvancedConfig;

  // 元数据
  meta: {
    createdAt: string;
    lastModified: string;
    version: string;
    isTemplate?: boolean;
    templateName?: string;
  };
}

// 配置导出格式
export interface ConfigExport {
  config: EmployeeCreationConfig;
  format: 'json' | 'yaml';
  includeAdvanced: boolean;
}

// 智能推荐映射
export interface RoleMapping {
  role: string;
  personality: Partial<PersonalityTraits>;
  workStyle: Partial<WorkStyle>;
  communication: Partial<CommunicationStyle>;
  tools: string[];
  knowledgeDomains: string[];
  promptTemplate?: string;
}

// 职责分析结果
export interface ResponsibilityAnalysis {
  primaryDomain: string;
  complexity: 'simple' | 'moderate' | 'complex';
  requiredTools: string[];
  suggestedPersonality: Partial<PersonalityTraits>;
  knowledgeAreas: string[];
}

// AI推理步骤
export interface ReasoningStep {
  id: string;
  type: 'thinking' | 'tool_decision' | 'tool_execution' | 'response_generation';
  title: string;
  content: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  timestamp: string;
  metadata?: Record<string, any>;
}

// AI生成配置
export interface GeneratedConfig {
  form: Partial<import('../../../types').CreateDigitalEmployeeForm>;
  confidence: number;
  completeness: number;
  quality: number;
  suggestions: ConfigSuggestion[];
  validation: {
    isValid: boolean;
    recommendations: string[];
    score: number;
  };
}

// 创建会话
export interface CreationSession {
  id: string;
  mode: 'standard' | 'quick';
  userInput: string;
  steps: ReasoningStep[];
  currentConfig: any;
  generatedConfig: GeneratedConfig | null;
}

// ============ 多领域配置相关类型 ============

// 路由策略类型
export type RoutingStrategy = 'keyword' | 'semantic' | 'context' | 'hybrid';

// 领域配置
export interface DomainConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  weight: number;          // 0-100 权重
  enabled: boolean;
  isDefault: boolean;

  // 每个领域包含完整的高级配置
  advancedConfig: AdvancedConfig;

  // 领域特有的核心特征（可覆盖全局）
  coreFeatures?: {
    personality?: Partial<PersonalityTraits>;
    workStyle?: Partial<WorkStyle>;
    communication?: Partial<CommunicationStyle>;
  };

  // 路由相关
  keywords: string[];      // 关键词匹配
  semanticTopics: string[]; // 语义主题

  // 元数据
  createdAt: string;
  updatedAt: string;
}

// 多领域配置
export interface MultiDomainConfig {
  enabled: boolean;
  domains: DomainConfig[];
  routingStrategy: RoutingStrategy;
  defaultDomainId?: string;
  maxConcurrentDomains: number;

  // 全局默认配置（作为各领域的基础）
  globalDefaults: AdvancedConfig;

  // 路由配置
  routingConfig: {
    keywordSensitivity: number;      // 关键词敏感度 0-1
    semanticThreshold: number;       // 语义相似度阈值 0-1
    contextMemoryLength: number;     // 上下文记忆长度
    fallbackBehavior: 'default' | 'ask' | 'random';
  };
}

// 领域匹配结果
export interface DomainMatch {
  domainId: string;
  confidence: number;       // 0-1
  reason: string;          // 匹配原因
  matchType: 'keyword' | 'semantic' | 'context' | 'manual';
}

// 路由决策记录
export interface RoutingDecision {
  id: string;
  timestamp: string;
  userInput: string;
  matches: DomainMatch[];
  selectedDomain: string;
  confidence: number;
  context?: any;
}

// ============ Prompt与Slot管理升级相关类型 ============

// Prompt管理接口
export interface PromptManagement {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  parameter: Record<string, any>;
  slots: string[];  // 关联的slot id列表
  example: PromptExample[];
  content: string;  // prompt内容
  category: string;
  // 元数据
  createdAt: string;
  updatedAt: string;
  author?: string;
  tags: string[];
  isBuiltIn: boolean;
  usageCount: number;
}

// Prompt示例
export interface PromptExample {
  id: string;
  title: string;
  description?: string;
  input: Record<string, any>;  // 输入参数示例
  expectedOutput: string;      // 期望输出
  scenario: string;            // 应用场景
  metadata?: {
    difficulty: 'basic' | 'intermediate' | 'advanced';
    tags: string[];
    createdAt: string;
  };
}

// 增强的Slot定义
export interface EnhancedSlotDefinition {
  id: string;
  name: string;
  role: 'system' | 'user' | 'context' | 'dynamic' | 'computed';
  type: 'text' | 'number' | 'enum' | 'boolean' | 'json' | 'array';
  description?: string;
  required: boolean;
  defaultValue?: any;

  // 新增字段
  immutable: boolean;          // 是否不可变
  ephemeral: boolean;          // 是否临时（会话级别）
  updatedAt: string;
  origin: 'preset' | 'custom' | 'runtime' | 'api';  // 来源

  // 数据源配置
  dataSource?: {
    type: 'static' | 'api' | 'database' | 'computed' | 'external';
    config: Record<string, any>;
    endpoint?: string;
    refreshInterval?: number;    // 数据刷新间隔（秒）
  };

  // 验证规则
  validation?: {
    rules: ValidationRule[];
    customValidator?: string;    // 自定义验证函数名
  };

  // 依赖关系
  dependencies?: string[];       // 依赖的其他slot

  // 缓存配置
  caching?: {
    enabled: boolean;
    ttl: number;                // 缓存时间（秒）
    key: string;
    strategy: 'memory' | 'session' | 'persistent';
  };

  // 业务场景配置
  scenarios?: {
    keywords: string[];          // 触发关键词
    contexts: string[];          // 适用上下文
    priority: number;            // 优先级 1-10
    conditions?: string[];       // 触发条件
  };

  // 错误处理
  errorHandling: {
    strategy: 'fallback' | 'retry' | 'alert' | 'skip' | 'default';
    fallbackValue?: any;
    retryCount?: number;
    alertChannel?: string;
    onError?: string;            // 错误处理函数名
  };

  // 权限控制
  permissions?: {
    read: string[];              // 可读角色列表
    write: string[];             // 可写角色列表
    execute: string[];           // 可执行角色列表
  };

  // 审计信息
  audit?: {
    createdBy: string;
    lastModifiedBy: string;
    changeLog: SlotChangeLogEntry[];
  };
}

// Slot变更日志
export interface SlotChangeLogEntry {
  id: string;
  timestamp: string;
  action: 'create' | 'update' | 'delete' | 'register' | 'unregister';
  field?: string;
  oldValue?: any;
  newValue?: any;
  operator: string;
  reason?: string;
}

// Slot注册表状态
export interface SlotRegistryState {
  // 运行时注册的slot
  runtimeSlots: Map<string, EnhancedSlotDefinition>;

  // 会话级slot（临时）
  sessionSlots: Map<string, EnhancedSlotDefinition>;

  // 持久化slot
  persistentSlots: Map<string, EnhancedSlotDefinition>;

  // slot依赖图
  dependencyGraph: Map<string, string[]>;

  // 注册历史
  registrationHistory: SlotRegistrationRecord[];

  // 缓存状态
  cache: Map<string, {
    value: any;
    expiry: number;
    hits: number;
  }>;
}

// Slot注册记录
export interface SlotRegistrationRecord {
  id: string;
  slotId: string;
  action: 'register' | 'unregister' | 'update';
  timestamp: string;
  source: string;              // 注册来源
  context?: any;
  success: boolean;
  error?: string;
}

// 业务场景检测结果
export interface ScenarioDetectionResult {
  scenarioId: string;
  name: string;
  confidence: number;          // 0-1
  matchedKeywords: string[];
  contextFactors: string[];
  recommendedSlots: {
    slotId: string;
    priority: number;
    reason: string;
  }[];
  suggestedValues?: Record<string, any>;
}

// Slot注入配置
export interface SlotInjectionConfig {
  slotId: string;
  timing: 'immediate' | 'lazy' | 'on-demand' | 'scheduled';
  conditions?: {
    keywords?: string[];
    contexts?: string[];
    userBehavior?: string[];
    customConditions?: string[];
  };
  transformation?: {
    type: 'format' | 'filter' | 'aggregate' | 'map' | 'compute';
    rules: any[];
  };
  priority: number;            // 1-10, 数字越大优先级越高
  fallback?: {
    slotId?: string;
    value?: any;
    strategy: 'default' | 'skip' | 'error';
  };
}

// Slot注入结果
export interface SlotInjectionResult {
  slotId: string;
  success: boolean;
  value?: any;
  timing: number;              // 注入耗时（毫秒）
  source: string;
  error?: string;
  metadata?: {
    cached: boolean;
    transformed: boolean;
    fallbackUsed: boolean;
  };
}

// 动态注入上下文
export interface DynamicInjectionContext {
  userId?: string;
  sessionId: string;
  conversationId?: string;
  userInput: string;
  conversationHistory: any[];
  currentDomain?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// 验证规则接口（用于slot验证）
export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'pattern' | 'required' | 'custom';
  value?: number;
  pattern?: string;
  message?: string;
}