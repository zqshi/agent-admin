/**
 * ReAct 智能创建引擎类型定义
 */

import type { CreateDigitalEmployeeForm, PromptEngineeringConfig } from '../../../types';

// ReAct 推理步骤类型
export interface ReActStep {
  id: string;
  type: 'reasoning' | 'acting';
  phase: 'intent_analysis' | 'requirement_derivation' | 'config_generation' | 'optimization' | 'validation';
  title: string;
  content: string;
  input?: any;
  output?: any;
  timestamp: number;
  duration?: number;
  confidence: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

// 意图识别结果
export interface IntentAnalysis {
  primaryIntent: 'create_employee' | 'modify_employee' | 'help' | 'unclear';
  confidence: number;
  entities: {
    name?: string;
    department?: string;
    role?: string;
    personality?: string[];
    responsibilities?: string[];
    tools?: string[];
    constraints?: string[];
  };
  context: {
    urgency: 'low' | 'medium' | 'high';
    complexity: 'simple' | 'moderate' | 'complex';
    domain: string;
  };
  missingInfo: string[];
  suggestions: string[];
}

// 配置需求分析
export interface ConfigRequirements {
  basic: {
    name: string;
    department: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  };
  persona: {
    systemPrompt: string;
    personality: string;
    responsibilities: string[];
    tone: 'friendly' | 'professional' | 'casual' | 'formal';
    expertise: string[];
  };
  capabilities: {
    allowedTools: string[];
    permissions: string[];
    knowledgeDomains: string[];
    specialSkills: string[];
  };
  advanced: {
    compressionNeeded: boolean;
    slotRequirements: string[];
    memoryStrategy: 'short' | 'long' | 'adaptive';
    learningEnabled: boolean;
  };
}

// 智能配置生成结果
export interface GeneratedConfig {
  form: Partial<CreateDigitalEmployeeForm>;
  confidence: number;
  completeness: number;
  quality: number;
  suggestions: ConfigSuggestion[];
  alternatives: ConfigAlternative[];
  validation: ValidationResult;
}

// 配置建议
export interface ConfigSuggestion {
  type: 'improvement' | 'warning' | 'optimization' | 'enhancement';
  field: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  autoApplicable: boolean;
  action?: () => void;
}

// 配置备选方案
export interface ConfigAlternative {
  id: string;
  name: string;
  description: string;
  changes: Record<string, any>;
  pros: string[];
  cons: string[];
  score: number;
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number;
  completeness: number;
  recommendations: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  fixSuggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  impact: 'low' | 'medium' | 'high';
  suggestion?: string;
}

// ReAct 引擎配置
export interface ReActEngineConfig {
  enableReasoning: boolean;
  maxReasoningSteps: number;
  confidenceThreshold: number;
  enableSuggestions: boolean;
  enableAlternatives: boolean;
  enableValidation: boolean;
  debugMode: boolean;
  timeout: number;
}

// 创建模式
export type CreationMode = 'quick' | 'standard' | 'advanced';

// 创建会话状态
export interface CreationSession {
  id: string;
  mode: CreationMode;
  status: 'initializing' | 'input' | 'reasoning' | 'configuring' | 'validating' | 'completed' | 'error';
  userInput: string;
  steps: ReActStep[];
  currentConfig: Partial<CreateDigitalEmployeeForm>;
  analysis?: IntentAnalysis;
  requirements?: ConfigRequirements;
  generatedConfig?: GeneratedConfig;
  startTime: number;
  lastUpdateTime: number;
  metadata: Record<string, any>;
}

// 自然语言输入组件属性
export interface NaturalLanguageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  placeholder?: string;
  enableVoice?: boolean;
  enableSuggestions?: boolean;
  maxLength?: number;
  loading?: boolean;
  suggestions?: string[];
  examples?: string[];
}

// 推理过程可视化属性
export interface ReasoningProcessProps {
  steps: ReActStep[];
  currentStep?: string;
  showDetails?: boolean;
  showTimeline?: boolean;
  onStepClick?: (step: ReActStep) => void;
  className?: string;
}

// 智能创建向导属性
export interface SmartCreationWizardProps {
  mode: CreationMode;
  onModeChange: (mode: CreationMode) => void;
  onSubmit: (config: CreateDigitalEmployeeForm) => void;
  onCancel: () => void;
  initialInput?: string;
  enableReasoningViz?: boolean;
}

// 压缩策略配置
export interface CompressionStrategy {
  enabled: boolean;
  trigger: {
    type: 'tokenLimit' | 'roundLimit' | 'contentType' | 'custom';
    threshold: number;
    condition?: string;
  };
  method: {
    type: 'summary' | 'extraction' | 'hybrid' | 'custom';
    preserveKeyInfo: boolean;
    compressionRatio: number;
    qualityPreference: 'speed' | 'quality' | 'balanced';
  };
  retrieval: {
    enabled: boolean;
    trigger: 'user_request' | 'context_missing' | 'detail_needed';
    precision: 'full_text' | 'precise_location' | 'semantic_match';
    displayMode: 'direct' | 'referenced' | 'highlighted';
  };
}

// 知识关联配置
export interface KnowledgeBinding {
  autoDiscovery: boolean;
  sources: KnowledgeSource[];
  associationStrategy: {
    type: 'automatic' | 'rule_based' | 'manual' | 'dynamic';
    similarity_threshold: number;
    update_frequency: 'realtime' | 'scheduled' | 'manual';
  };
  contextAwareness: {
    enabled: boolean;
    scope: 'session' | 'conversation' | 'global';
    adaptiveWeighting: boolean;
  };
}

export interface KnowledgeSource {
  id: string;
  name: string;
  type: 'internal_kb' | 'external_api' | 'realtime_data' | 'file_system';
  connectionInfo: Record<string, any>;
  updateStrategy: 'pull' | 'push' | 'webhook';
  priority: number;
  enabled: boolean;
}

// Slot 注入策略
export interface SlotInjectionStrategy {
  strategy: 'preload' | 'lazy' | 'conditional' | 'smart';
  cachePolicy: {
    type: 'none' | 'session' | 'persistent' | 'ttl';
    duration?: number;
    size_limit?: number;
  };
  readStrategy: {
    type: 'realtime' | 'cached' | 'async' | 'fallback';
    refresh_interval?: number;
    fallback_value?: any;
  };
  slots: EnhancedSlotDefinition[];
}

export interface EnhancedSlotDefinition {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  source: SlotDataSource;
  required: boolean;
  defaultValue?: any;
  validation?: SlotValidation;
  transformation?: SlotTransformation;
  dependencies?: string[];
}

export interface SlotDataSource {
  type: 'user_profile' | 'system_time' | 'api_call' | 'database' | 'environment' | 'calculated';
  config: Record<string, any>;
  cacheable: boolean;
  retry_policy?: {
    max_attempts: number;
    delay: number;
    exponential_backoff: boolean;
  };
}

export interface SlotValidation {
  rules: ValidationRule[];
  custom_validator?: string;
  error_message?: string;
}

export interface ValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'pattern' | 'range' | 'custom';
  value: any;
  message?: string;
}

export interface SlotTransformation {
  type: 'format' | 'filter' | 'map' | 'reduce' | 'custom';
  config: Record<string, any>;
  output_type?: string;
}

// 高级配置接口
export interface AdvancedConfig {
  compressionStrategy: CompressionStrategy;
  knowledgeBinding: KnowledgeBinding;
  slotInjection: SlotInjectionStrategy;
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTracing: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  performance: {
    maxConcurrentRequests: number;
    requestTimeout: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
}

// 行业模板定义
export interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  department: string;
  description: string;
  basePrompt: string;
  defaultConfig: Partial<CreateDigitalEmployeeForm>;
  tags: string[];
  usageCount: number;
  rating: number;
  features: string[];
  examples: TemplateExample[];
  metadata: TemplateMetadata;
}

export interface TemplateExample {
  input: string;
  output: string;
  scenario: string;
}

export interface TemplateMetadata {
  author: string;
  version: string;
  createdAt: string;
  updatedAt: string;
  compatibility: string[];
  requirements: string[];
}