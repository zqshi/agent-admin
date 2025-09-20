/**
 * Prompt Engineering 核心类型定义
 * 支持可视化Prompt配置和智能化管理
 */

// ===== 基础类型定义 =====

export type SlotType = 'system' | 'user' | 'api' | 'computed' | 'conditional';
export type ConfigSource = 'template' | 'custom' | 'hybrid';
export type ConfigMode = 'template-based' | 'custom' | 'mixed';
export type InjectionTiming = 'immediate' | 'lazy' | 'cached' | 'stream';
export type CompressionAlgorithm = 'semantic' | 'syntactic' | 'hybrid';
export type ErrorHandlingStrategy = 'fallback' | 'retry' | 'alert' | 'skip';

// ===== Slot 相关类型 =====

export interface SlotDefinition {
  id: string;
  name: string;
  type: SlotType;
  description?: string;
  required: boolean;
  defaultValue?: any;

  // 数据源配置
  dataSource?: DataSource;

  // 验证规则
  validation?: ValidationRule[];

  // 依赖关系
  dependencies?: string[];

  // 缓存配置
  caching?: {
    enabled: boolean;
    ttl: number; // 缓存时间（秒）
    key: string;
  };

  // 数据转换
  transformation?: {
    type: 'format' | 'filter' | 'aggregate' | 'map';
    rules: TransformationRule[];
  };

  // 错误处理
  errorHandling: {
    strategy: ErrorHandlingStrategy;
    fallbackValue?: any;
    retryCount?: number;
    alertChannel?: string;
  };
}

export interface DataSource {
  type: 'static' | 'api' | 'database' | 'file' | 'computed';
  config: Record<string, any>;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export interface ValidationRule {
  type: 'required' | 'type' | 'length' | 'pattern' | 'range' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface TransformationRule {
  type: string;
  config: Record<string, any>;
  order: number;
}

// ===== Prompt模板相关类型 =====

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  basePrompt: string;

  // Slot定义
  slots: SlotDefinition[];

  // 模板元数据
  metadata: {
    author: string;
    version: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    examples: PromptExample[];
  };

  // 使用统计
  usage: {
    count: number;
    rating: number;
    reviews: Review[];
    avgResponseTime: number;
    successRate: number;
  };

  // 社交证明
  socialProof: {
    usedByTeams: string[];
    endorsements: number;
    forkCount: number;
    starCount: number;
  };

  // 配置选项
  settings: {
    allowFork: boolean;
    allowEdit: boolean;
    visibility: 'public' | 'private' | 'team';
  };
}

export interface PromptExample {
  id: string;
  title: string;
  inputValues: Record<string, any>;
  expectedOutput: string;
  actualOutput?: string;
  metrics?: {
    tokenCount: number;
    responseTime: number;
    quality: number;
  };
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

// ===== 注入策略相关类型 =====

export interface InjectionStrategy {
  id: string;
  name: string;
  timing: InjectionTiming;

  // 注入顺序
  order: SlotOrder[];

  // 条件配置
  conditions?: InjectionCondition[];

  // 性能配置
  performance: {
    batchSize?: number;
    timeout: number;
    retryCount: number;
  };
}

export interface SlotOrder {
  slotId: string;
  priority: number;
  conditions?: string[];
}

export interface InjectionCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains';
  value: any;
  action: 'include' | 'exclude' | 'transform';
}

// ===== 压缩策略相关类型 =====

export interface CompressionStrategy {
  id: string;
  name: string;
  algorithm: CompressionAlgorithm;

  // 压缩配置
  config: {
    maxTokens: number;
    compressionRatio: number;
    qualityThreshold: number;
    preserveKeywords: string[];
    preserveStructure: boolean;
  };

  // 压缩规则
  rules: CompressionRule[];

  // 自适应学习
  adaptive: {
    enabled: boolean;
    learningRate: number;
    feedbackLoop: boolean;
    minSamples: number;
  };
}

export interface CompressionRule {
  id: string;
  type: 'remove' | 'replace' | 'merge' | 'summarize';
  pattern: string | RegExp;
  replacement?: string;
  priority: number;
  enabled: boolean;
}

export interface CompressionResult {
  originalText: string;
  compressedText: string;
  compressionRatio: number;
  qualityScore: number;
  tokenSaved: number;
  preservedKeywords: string[];
  appliedRules: string[];
  metrics: {
    processingTime: number;
    confidence: number;
  };
}

export interface CompressionConfig {
  enabled: boolean;
  strategy: string;
  triggerThreshold: number;
  maxCompressionRatio: number;
  preserveQuality: boolean;
  customRules?: CompressionRule[];
}

// ===== 预览相关类型 =====

export interface PreviewResult {
  compiledPrompt: string;
  tokenCount: number;
  estimatedCost: number;
  estimatedResponseTime: number;
  qualityScore: number;

  // 性能指标
  metrics: PerformanceMetrics;

  // 优化建议
  suggestions: OptimizationSuggestion[];

  // 错误和警告
  issues: Issue[];
}

export interface PerformanceMetrics {
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
    percentage: number;
  };

  cost: {
    input: number;
    output: number;
    total: number;
    currency: string;
  };

  time: {
    compilation: number;
    injection: number;
    compression: number;
    total: number;
  };

  quality: {
    clarity: number;
    relevance: number;
    completeness: number;
    overall: number;
  };
}

export interface OptimizationSuggestion {
  id: string;
  type: 'performance' | 'cost' | 'quality' | 'security';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    tokenSaving?: number;
    costSaving?: number;
    qualityImprovement?: number;
  };
  action: {
    type: 'auto' | 'manual';
    instruction: string;
    code?: string;
  };
}

export interface Issue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: {
    slotId?: string;
    line?: number;
    column?: number;
  };
  suggestion?: string;
}

// ===== 版本控制相关类型 =====

export interface VersionHistory {
  id: string;
  version: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt: string;
  changes: Change[];
  parentVersion?: string;
  tags: string[];
}

export interface Change {
  type: 'added' | 'modified' | 'deleted';
  path: string;
  oldValue?: any;
  newValue?: any;
  description: string;
}

export interface Branch {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  authorId: string;
  baseVersion: string;
  headVersion: string;
  isDefault: boolean;
  isMerged: boolean;
}

export interface MergeRequest {
  id: string;
  title: string;
  description: string;
  sourceBranch: string;
  targetBranch: string;
  authorId: string;
  reviewers: string[];
  status: 'open' | 'merged' | 'closed' | 'rejected';
  createdAt: string;
  updatedAt: string;
  changes: Change[];
  comments: Comment[];
}

// ===== 协作相关类型 =====

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  location?: {
    slotId?: string;
    line?: number;
  };
  replies: Comment[];
  reactions: Reaction[];
}

export interface Reaction {
  type: 'like' | 'dislike' | 'approve' | 'reject';
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'commented' | 'reviewed' | 'merged';
  actorId: string;
  actorName: string;
  description: string;
  createdAt: string;
  metadata: Record<string, any>;
}

// ===== 配置管理相关类型 =====

export interface ConfigState {
  source: ConfigSource;
  mode: ConfigMode;
  baseTemplateId?: string;
  isModified: boolean;
  slots: SlotDefinition[];
  compressionStrategy: CompressionStrategy;
  injectionStrategy: InjectionStrategy;
  lastModified: string;
  version: string;
}

export interface ConfigSnapshot {
  id: string;
  name: string;
  description?: string;
  config: ConfigState;
  createdAt: string;
  tags: string[];
}

export interface ConfigPreset {
  id: string;
  name: string;
  description: string;
  type: 'slot' | 'compression' | 'injection' | 'complete';
  config: Partial<ConfigState>;
  category: string;
  isBuiltIn: boolean;
  usage: {
    count: number;
    rating: number;
  };
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: ConfigValidationError[];
  warnings: ConfigValidationWarning[];
  completeness: number;
}

export interface ConfigValidationError {
  type: 'missing' | 'invalid' | 'conflict';
  field: string;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ConfigValidationWarning {
  type: 'performance' | 'compatibility' | 'best-practice';
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  suggestion: string;
}

// ===== Store 状态类型 =====

export interface PromptEngineeringState {
  // 模板相关
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;
  templateCategories: string[];

  // 配置状态（新增）
  config: ConfigState;
  configHistory: ConfigSnapshot[];
  configPresets: ConfigPreset[];
  configValidation: ConfigValidationResult | null;

  // Slot相关
  slots: SlotDefinition[];
  slotValues: Record<string, any>;
  slotErrors: Record<string, string>;

  // 策略相关
  injectionStrategy: InjectionStrategy;
  compressionStrategy: CompressionStrategy;

  // 策略预设（新增）
  compressionPresets: CompressionStrategy[];
  injectionPresets: InjectionStrategy[];

  // 预览相关
  previewResult: PreviewResult | null;
  isCompiling: boolean;
  lastCompileTime: string | null;

  // UI状态
  ui: {
    activeTab: 'templates' | 'slots' | 'injection' | 'compression' | 'preview';
    sidebarOpen: boolean;
    previewMode: 'split' | 'full' | 'minimal';
    showAdvanced: boolean;
    configMode: ConfigMode;
    showConfigModeSelector: boolean;
  };

  // 加载状态
  loading: {
    templates: boolean;
    compilation: boolean;
    preview: boolean;
    presets: boolean;
    validation: boolean;
  };

  // 错误状态
  errors: {
    compilation: string | null;
    slots: Record<string, string>;
    general: string | null;
    config: string | null;
  };
}

// ===== API 响应类型 =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface TemplateListResponse {
  templates: PromptTemplate[];
  categories: string[];
  featured: string[];
  trending: string[];
}

export interface CompilationRequest {
  templateId: string;
  slotValues: Record<string, any>;
  injectionStrategy: InjectionStrategy;
  compressionStrategy?: CompressionStrategy;
  options?: {
    includeMetrics: boolean;
    includeSuggestions: boolean;
    validateOnly: boolean;
  };
}

export interface CompilationResponse {
  result: PreviewResult;
  cached: boolean;
  timestamp: string;
}

// ===== 事件类型 =====

export interface PromptEngineeringEvents {
  'template:selected': { template: PromptTemplate };
  'slot:added': { slot: SlotDefinition };
  'slot:updated': { slotId: string; value: any };
  'slot:removed': { slotId: string };
  'compilation:started': { templateId: string };
  'compilation:completed': { result: PreviewResult };
  'compilation:failed': { error: string };
  'preview:updated': { result: PreviewResult };
  'optimization:suggested': { suggestions: OptimizationSuggestion[] };
}

// ===== 工具函数类型 =====

export interface PromptCompilerOptions {
  strictMode: boolean;
  validateSlots: boolean;
  optimizeOutput: boolean;
  includeDebugInfo: boolean;
}

export interface SlotResolverOptions {
  timeout: number;
  retryCount: number;
  cacheEnabled: boolean;
  parallelExecution: boolean;
}

export interface CompressionOptions {
  preserveStructure: boolean;
  preserveKeywords: string[];
  targetRatio: number;
  qualityThreshold: number;
}