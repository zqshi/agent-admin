/**
 * 统一员工创建系统类型定义
 */


// 创建阶段类型
export type CreationStage = 'basic' | 'features' | 'advanced';

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

// 核心特征配置
export interface CoreFeatures {
  personality: PersonalityTraits;
  workStyle: WorkStyle;
  communication: CommunicationStyle;
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