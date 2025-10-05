/**
 * 数字员工核心类型定义 - 统一版本
 * 消除原有的类型重复和冗余
 */

// 导入核心特征类型
import type { PersonalityTraits, WorkStyle, CommunicationStyle, MBTIProfile, PersonalityConfigMode } from '../features/employee-creation/types';

// 员工状态枚举
export type EmployeeStatus = 'active' | 'disabled' | 'retired';
export type EmployeeWorkStatus = 'idle' | 'busy' | 'offline';

// 基础员工信息接口
export interface BaseEmployee {
  id: string;
  name: string;
  employeeNumber: string;
  avatar?: string;
  description?: string;
  department: string;
  createdAt: string;
  updatedAt: string;
}

// 员工人设配置
export interface EmployeePersona {
  systemPrompt: string;
  personality: string;
  characterBackground?: string;  // 角色背景故事
  responsibilities: string[];
  constraints?: string[];        // 行为约束
  exampleDialogues?: ConversationExample[];
}

// 员工权限配置
export interface EmployeePermissions {
  allowedTools: string[];
  resourceAccess: ResourcePermission[];
  knowledgeManagement: {
    canSelfLearn: boolean;
    canModifyKnowledge: boolean;
  };
}

// 员工知识库
export interface EmployeeKnowledgeBase {
  documents: KnowledgeDocument[];
  faqItems: FAQItem[];
  autoLearnedItems?: LearnedKnowledge[];
  knowledgeGraph?: KnowledgeGraphData;
}

// 员工运行指标
export interface EmployeeMetrics {
  totalSessions: number;
  successfulSessions: number;
  avgResponseTime: number;
  userSatisfactionScore?: number;
  knowledgeUtilizationRate: number;
  toolUsageStats: Record<string, number>;
}

// 导师配置
export interface MentorConfiguration {
  mentorId: string;
  mentorName: string;
  reportingCycle: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  cronExpression?: string;
  reportingMethod: 'im' | 'document';
  documentPath?: string;
}

// 记忆系统配置
export interface MemorySystemConfig {
  workingMemory: MemoryEntry[];
  episodicMemory: MemoryEntry[];
  semanticMemory: MemoryEntry[];
  proceduralMemory: MemoryEntry[];
  emotionalMemory: MemoryEntry[];
}

// 领域专属配置 - 支持配置继承和覆盖
export interface DomainSpecificConfig {
  // 人设配置覆盖
  persona?: Partial<EmployeePersona>;

  // Prompt工程配置覆盖
  promptConfig?: Partial<PromptEngineeringConfig>;

  // 权限配置覆盖
  permissions?: Partial<EmployeePermissions>;

  // 导师配置覆盖
  mentorConfig?: Partial<MentorConfiguration>;

  // 知识库配置覆盖
  knowledgeBase?: Partial<EmployeeKnowledgeBase>;

  // 核心特征配置覆盖
  coreFeatures?: Partial<{
    personality: PersonalityTraits;
    workStyle: WorkStyle;
    communication: CommunicationStyle;
    mbtiProfile?: MBTIProfile;
    personalityMode?: PersonalityConfigMode;
  }>;

  // 其他自定义配置
  customConfig?: Record<string, any>;
}

// 配置继承策略
export type ConfigInheritanceStrategy = 'merge' | 'override' | 'extend';

// 配置继承元数据
export interface ConfigInheritanceMeta {
  strategy: ConfigInheritanceStrategy;
  priority: number; // 优先级，数值越大优先级越高
  inheritFromGlobal: boolean;
  overrideFields?: string[]; // 指定要覆盖的字段
  mergeFields?: string[]; // 指定要合并的字段
}

// 扩展后的多领域配置
export interface DomainConfig {
  // 基础元信息
  id: string;
  name: string;
  description: string;
  icon: string;
  weight: number;
  enabled: boolean;
  isDefault: boolean;

  // 路由相关配置
  keywords: string[];
  semanticTopics: string[];

  // 领域专属配置
  domainConfig?: DomainSpecificConfig;

  // 配置继承元数据
  inheritanceMeta?: ConfigInheritanceMeta;

  // 向后兼容的高级配置字段
  advancedConfig?: any;
}

// 路由策略
export type RoutingStrategy = 'weighted' | 'semantic' | 'keyword' | 'hybrid';

// 配置解析结果 - 全局配置与领域配置合并后的结果
export interface ResolvedEmployeeConfig {
  // 解析后的最终配置
  persona: EmployeePersona;
  promptConfig?: PromptEngineeringConfig;
  permissions: EmployeePermissions;
  mentorConfig?: MentorConfiguration;
  knowledgeBase: EmployeeKnowledgeBase;
  coreFeatures?: {
    personality: PersonalityTraits;
    workStyle: WorkStyle;
    communication: CommunicationStyle;
    mbtiProfile?: MBTIProfile;
    personalityMode?: PersonalityConfigMode;
  };

  // 配置来源追踪
  configSource: {
    global: string[]; // 来自全局配置的字段
    domain: string[]; // 来自领域配置的字段
    merged: string[]; // 合并的字段
  };

  // 应用的领域ID
  appliedDomainId?: string;
}

// 多领域配置
export interface MultiDomainConfig {
  enabled: boolean;
  domains: DomainConfig[];
  routingStrategy: RoutingStrategy;
  defaultDomainId?: string;
  maxConcurrentDomains: number;
  routingConfig: {
    keywordSensitivity: number;
    semanticThreshold: number;
    contextWeight: number;
  };
}

// 配置解析工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// 配置合并工具类型
export type ConfigMergeResult<T> = {
  config: T;
  sources: {
    field: keyof T;
    source: 'global' | 'domain' | 'merged';
  }[];
};

// 数字员工完整定义（用于管理界面）
export interface DigitalEmployee extends BaseEmployee {
  status: EmployeeStatus;
  lastActiveAt?: string;

  // 配置部分
  persona: EmployeePersona;
  promptConfig?: PromptEngineeringConfig;
  mentorConfig?: MentorConfiguration;
  permissions: EmployeePermissions;
  knowledgeBase: EmployeeKnowledgeBase;
  memorySystem?: MemorySystemConfig;

  // 核心特征配置
  coreFeatures?: {
    personality: PersonalityTraits;      // 性格特征
    workStyle: WorkStyle;                // 工作风格
    communication: CommunicationStyle;   // 沟通特征
    mbtiProfile?: MBTIProfile;          // MBTI配置
    personalityMode?: PersonalityConfigMode; // 配置模式
  };

  // 多领域配置
  enableMultiDomain?: boolean;
  multiDomainConfig?: MultiDomainConfig;

  // 运行指标
  metrics: EmployeeMetrics;

  // 高级配置（向后兼容）
  advancedConfig?: Record<string, any>;

  // 配置解析缓存（运行时使用）
  _resolvedConfigs?: Map<string, ResolvedEmployeeConfig>;
}

// 配置解析器选项
export interface ConfigResolverOptions {
  domainId?: string;
  strategy?: ConfigInheritanceStrategy;
  includeDisabledDomains?: boolean;
  customMergeRules?: Record<string, (global: any, domain: any) => any>;
}

// 配置变更记录
export interface ConfigChangeRecord {
  id: string;
  timestamp: string;
  domainId?: string;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    source: 'global' | 'domain';
  }[];
  operator: string;
  reason?: string;
}

// 配置验证结果
export interface ConfigValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }[];
  warnings: {
    field: string;
    message: string;
    suggestion?: string;
  }[];
}

// 数字员工运行时状态（用于实时监控）
export interface DigitalEmployeeRuntime {
  id: string;
  name: string;
  role: string;
  workStatus: EmployeeWorkStatus;
  currentSessions: number;
  todayTotal: number;
  avgResponseTime: number;
  successRate: number;
  capabilities: string[];
}

// 数字员工创建表单
export interface CreateEmployeeForm {
  // 基础信息
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

  // Prompt工程配置
  promptConfig: PromptEngineeringConfig;
}

// 员工更新表单（允许部分更新）
export interface UpdateEmployeeForm extends Partial<CreateEmployeeForm> {
  id: string;
}

// 员工查询过滤器
export interface EmployeeFilter {
  status?: EmployeeStatus[];
  department?: string[];
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  hasMetrics?: boolean;
}

// 员工排序选项
export interface EmployeeSortOptions {
  field: keyof DigitalEmployee | 'metrics.totalSessions' | 'metrics.successRate';
  direction: 'asc' | 'desc';
}

// 员工分页查询参数
export interface EmployeeQueryParams {
  page: number;
  pageSize: number;
  filter?: EmployeeFilter;
  sort?: EmployeeSortOptions;
}

// 员工查询结果
export interface EmployeeQueryResult {
  employees: DigitalEmployee[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// 导入相关的依赖类型（避免循环依赖）
export interface ConversationExample {
  id: string;
  userInput: string;
  expectedResponse: string;
  tags: string[];
}

export interface ResourcePermission {
  resourceType: 'api' | 'database' | 'file_system' | 'external_service';
  resourceId: string;
  resourceName: string;
  accessLevel: 'read' | 'write' | 'admin';
  restrictions?: string[];
}

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

export interface KnowledgeGraphData {
  entities: GraphEntity[];
  relations: GraphRelation[];
  lastUpdated: string;
  statistics: {
    entityCount: number;
    relationCount: number;
    avgConnectivity: number;
  };
  // 向后兼容的别名
  nodes?: GraphEntity[];
  edges?: GraphRelation[];
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
  strength?: number;
  label?: string;
}

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

// Prompt工程配置接口（简化版本，避免循环依赖）
export interface PromptEngineeringConfig {
  mode: 'simple' | 'advanced';
  templateId?: string;
  templateName?: string;
  basePrompt: string;
  slots: SlotDefinition[];
  templates?: Array<{
    id: string;
    name: string;
    content: string;
    category: string;
  }>;
  compression?: {
    enabled: boolean;
    strategy: 'adaptive' | 'truncate' | 'summarize';
    triggerThreshold?: number;
    preserveQuality?: boolean;
    maxCompressionRatio?: number;
  };
  errorHandling?: {
    enabled: boolean;
    retryCount: number;
    fallbackResponse: string;
    logErrors: boolean;
  };
  injectionStrategy?: InjectionStrategy;
  compressionConfig?: CompressionConfig;
  contextConfig?: {
    maxLength: number;
    memoryStrategy: 'short' | 'long' | 'adaptive';
    cleanupRules: any[];
  };
  quickSettings?: {
    tone: 'friendly' | 'professional' | 'casual' | 'formal';
    responseLength: 'brief' | 'moderate' | 'detailed';
    creativity: 'conservative' | 'balanced' | 'creative';
  };
}

// 简化的Slot定义（避免循环依赖）
export interface SlotDefinition {
  id: string;
  name: string;
  description: string;
  type: 'text' | 'number' | 'enum' | 'boolean';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface InjectionStrategy {
  timing: 'pre' | 'post' | 'replace';
  priority: number;
  conditions?: string[];
}

export interface CompressionConfig {
  enabled: boolean;
  strategy: 'truncate' | 'summarize' | 'compress' | 'adaptive';
  maxTokens: number;
  preserveImportant: boolean;
  triggerThreshold?: number;
  preserveQuality?: boolean;
  maxCompressionRatio?: number;
}