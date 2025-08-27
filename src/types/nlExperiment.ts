/**
 * 自然语言实验创建相关类型定义
 */

// 解析的实验意图类型
export interface ExperimentIntent {
  type: 'comparison' | 'optimization' | 'exploration' | 'cost_analysis' | 'multivariate' | 'stratified' | 'orthogonal';
  confidence: number;
  description: string;
  subTypes?: string[]; // 细分类型，如 ['model_comparison', 'parameter_optimization']
}

// 提取的实验参数
export interface ExtractedExperimentParams {
  // 基本信息
  name?: string;
  description?: string;
  
  // 实验组配置
  models?: string[];
  prompts?: string[];
  temperatures?: number[];
  topP?: number[];
  maxTokens?: number[];
  trafficRatio?: number[];
  
  // 实验配置
  splittingStrategy?: 'session' | 'user' | 'request' | 'time_based';
  stratificationDimensions?: string[]; // 分层维度
  duration?: {
    minDays?: number;
    maxDays?: number;
    targetSamples?: number; // 目标样本量
    autoStopConditions?: string[];
  };
  budget?: {
    maxCost?: number;
    dailyLimit?: number;
    costPerGroup?: number[];
  };
  
  // 指标相关
  primaryMetric?: string;
  secondaryMetrics?: string[];
  customMetrics?: {
    name: string;
    description: string;
    type: 'conversion' | 'continuous' | 'categorical';
  }[];
  
  // 工具和其他配置
  tools?: string[];
  toolConfigs?: Record<string, any>;
  
  // 多变量实验支持
  variables?: {
    name: string;
    type: 'model' | 'parameter' | 'prompt' | 'tool';
    values: any[];
    isOrthogonal?: boolean;
  }[];
  
  // 分层实验支持
  userSegments?: {
    name: string;
    criteria: string;
    trafficRatio: number;
  }[];
  
  // 高级配置
  sequentialTesting?: boolean; // 序贯测试
  adaptiveAllocation?: boolean; // 自适应流量分配
  
  // 置信度评分
  extractionConfidence: number;
  confidenceBreakdown?: {
    intentRecognition: number;
    parameterExtraction: number;
    configurationValidity: number;
  };
}

// 缺失参数信息
export interface MissingParams {
  required: {
    field: string;
    description: string;
    options?: string[] | number[];
    default?: any;
  }[];
  optional: {
    field: string;
    description: string;
    options?: string[] | number[];
    default?: any;
  }[];
}

// 自然语言解析结果
export interface NLParseResult {
  intent: ExperimentIntent;
  extractedParams: ExtractedExperimentParams;
  missingParams: MissingParams;
  suggestions: string[];
  errors: string[];
}

// 解析状态
export type ParseStatus = 'idle' | 'parsing' | 'success' | 'error' | 'needs_clarification';

// 用户输入上下文
export interface InputContext {
  userInput: string;
  conversationHistory: Array<{
    input: string;
    response: string;
    timestamp: Date;
  }>;
  previousExperiments?: Array<{
    name: string;
    type: string;
    models: string[];
    success: boolean;
  }>;
}

// 预设的实验模板
export interface ExperimentTemplate {
  id: string;
  name: string;
  description: string;
  intent: ExperimentIntent;
  params: Partial<ExtractedExperimentParams>;
  examples: string[];
}

// 智能建议
export interface IntelligentSuggestion {
  type: 'model_recommendation' | 'metric_suggestion' | 'budget_optimization' | 'duration_advice' | 
        'statistical_power' | 'sample_size' | 'variable_interaction' | 'user_segmentation' | 
        'sequential_optimization' | 'risk_mitigation';
  title: string;
  description: string;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
  category: 'performance' | 'cost' | 'statistics' | 'user_experience' | 'risk';
  impact: string; // 预期影响说明
  implementationEffort: 'low' | 'medium' | 'high';
  action?: () => void;
  relatedParams?: string[]; // 相关参数字段
}

// 新增：实验复杂度评估
export interface ExperimentComplexity {
  level: 'simple' | 'medium' | 'complex' | 'advanced';
  factors: {
    variableCount: number;
    groupCount: number;
    metricCount: number;
    hasStratification: boolean;
    hasOrthogonality: boolean;
  };
  estimatedSetupTime: number; // 分钟
  recommendedMinDuration: number; // 天数
  statisticalPowerRequirement: number;
}

// 新增：置信度分层处理策略
export interface ConfidenceStrategy {
  overall: number;
  threshold: {
    high: number; // >0.8 自动生成
    medium: number; // 0.5-0.8 生成但需确认
    low: number; // <0.5 需要澄清
  };
  actions: {
    high: 'auto_generate';
    medium: 'generate_with_confirmation';
    low: 'request_clarification';
  };
}

// 新增：增强的解析上下文
export interface EnhancedInputContext extends InputContext {
  userProfile?: {
    experienceLevel: 'beginner' | 'intermediate' | 'expert';
    commonExperimentTypes: string[];
    preferredModels: string[];
    typicalBudget: number;
  };
  projectContext?: {
    domain: string; // 'customer_service', 'content_generation', 'code_assistant' etc.
    targetMetrics: string[];
    constraints: string[];
  };
  seasonality?: {
    timeOfDay: string;
    dayOfWeek: string;
    businessCycle: string;
  };
}

// 新增：实验变量组合配置
export interface VariableCombination {
  id: string;
  variables: Record<string, any>;
  expectedTrafficRatio: number;
  groupName: string;
  description: string;
  isControl: boolean;
}