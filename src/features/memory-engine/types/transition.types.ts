/**
 * 记忆转换系统类型定义
 * 定义记忆在不同层级间的转换规则和机制
 */

import { MemoryLayerType, EnhancedMemoryEntry, MemoryContext } from './memory.types';

/**
 * 记忆转换规则接口
 * 定义记忆从一个层级转移到另一个层级的条件和方式
 */
export interface MemoryTransition {
  id: string;
  name: string;
  description: string;

  // 转换路径
  fromLayer: MemoryLayerType;
  toLayer: MemoryLayerType;

  // 触发条件
  conditions: TransitionCondition[];
  triggerType: 'automatic' | 'manual' | 'scheduled' | 'event-driven';

  // 转换参数
  priority: number;         // 优先级 [0, 1]
  confidence: number;       // 转换置信度 [0, 1]
  processTime: number;      // 处理时间（毫秒）

  // 转换函数
  transformFunction: MemoryTransformFunction;
  validationFunction?: MemoryValidationFunction;

  // 统计信息
  usageCount: number;
  successRate: number;
  lastUsed?: Date;

  // 配置选项
  enabled: boolean;
  preserveOriginal: boolean;  // 是否保留原记忆
  batchSize?: number;        // 批处理大小
  cooldownPeriod?: number;   // 冷却期（毫秒）

  metadata?: Record<string, any>;
}

/**
 * 转换条件接口
 */
export interface TransitionCondition {
  id: string;
  type: ConditionType;
  operator: ConditionOperator;
  field: string;
  value: any;
  weight: number;           // 条件权重 [0, 1]
  required: boolean;        // 是否必须满足
}

// 条件类型
export type ConditionType =
  | 'age'                  // 记忆年龄
  | 'access_frequency'     // 访问频率
  | 'importance'          // 重要性
  | 'confidence'          // 置信度
  | 'stability'           // 稳定性
  | 'association_count'   // 关联数量
  | 'reinforcement_count' // 强化次数
  | 'context_match'       // 上下文匹配
  | 'pattern_match'       // 模式匹配
  | 'semantic_similarity' // 语义相似度
  | 'custom';             // 自定义条件

// 条件操作符
export type ConditionOperator =
  | 'equals' | 'not_equals'
  | 'greater_than' | 'greater_equal'
  | 'less_than' | 'less_equal'
  | 'contains' | 'not_contains'
  | 'matches' | 'not_matches'
  | 'in' | 'not_in'
  | 'between' | 'not_between';

/**
 * 记忆转换函数类型
 */
export type MemoryTransformFunction = (
  memory: EnhancedMemoryEntry,
  context: MemoryContext,
  transitionConfig: MemoryTransition
) => Promise<EnhancedMemoryEntry | null>;

/**
 * 记忆验证函数类型
 */
export type MemoryValidationFunction = (
  originalMemory: EnhancedMemoryEntry,
  transformedMemory: EnhancedMemoryEntry,
  context: MemoryContext
) => Promise<boolean>;

/**
 * 转换结果接口
 */
export interface TransitionResult {
  success: boolean;
  transitionId: string;
  originalMemoryId: string;
  newMemoryId?: string;
  fromLayer: MemoryLayerType;
  toLayer: MemoryLayerType;
  processingTime: number;
  confidence: number;
  changes: MemoryChange[];
  errors?: string[];
  warnings?: string[];
  timestamp: Date;
}

/**
 * 记忆变更记录
 */
export interface MemoryChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'created' | 'updated' | 'removed' | 'transformed';
  reasoning?: string;
}

/**
 * 批量转换任务
 */
export interface BatchTransitionTask {
  id: string;
  name: string;
  transitionId: string;
  memoryIds: string[];
  status: BatchTransitionStatus;

  // 进度信息
  progress: {
    total: number;
    completed: number;
    failed: number;
    skipped: number;
    currentIndex: number;
  };

  // 时间信息
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;

  // 结果统计
  results: TransitionResult[];
  errorSummary?: {
    errorType: string;
    count: number;
    examples: string[];
  }[];

  // 配置选项
  options: {
    continueOnError: boolean;
    maxRetries: number;
    batchSize: number;
    delayBetweenBatches: number;
  };
}

// 批量转换状态
export type BatchTransitionStatus =
  | 'pending'
  | 'running'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

/**
 * 转换策略接口
 * 定义特定场景下的转换策略
 */
export interface TransitionStrategy {
  id: string;
  name: string;
  description: string;
  scenario: TransitionScenario;

  // 策略规则
  rules: MemoryTransition[];
  executionOrder: string[];     // 转换执行顺序

  // 策略参数
  aggressiveness: number;       // 策略激进程度 [0, 1]
  selectivity: number;          // 选择性 [0, 1]
  preservationRate: number;     // 保留率 [0, 1]

  // 性能指标
  efficiency: number;
  accuracy: number;
  throughput: number;

  // 状态
  enabled: boolean;
  lastOptimized?: Date;
}

// 转换场景
export type TransitionScenario =
  | 'learning_consolidation'    // 学习巩固
  | 'knowledge_refinement'      // 知识精炼
  | 'skill_automation'          // 技能自动化
  | 'memory_optimization'       // 记忆优化
  | 'context_adaptation'        // 上下文适应
  | 'emergency_compression'     // 紧急压缩
  | 'routine_maintenance';      // 常规维护

/**
 * 转换监控接口
 */
export interface TransitionMonitor {
  // 实时指标
  activeTransitions: number;
  queuedTransitions: number;
  failedTransitions: number;
  averageProcessingTime: number;

  // 性能指标
  throughput: number;           // 每分钟处理数量
  errorRate: number;
  resourceUtilization: number;

  // 质量指标
  transformationAccuracy: number;
  memoryIntegrity: number;
  systemConsistency: number;

  // 统计时间窗口
  windowStart: Date;
  windowEnd: Date;
  lastUpdated: Date;

  // 告警状态
  alerts: TransitionAlert[];
}

/**
 * 转换告警接口
 */
export interface TransitionAlert {
  id: string;
  type: 'performance' | 'error' | 'quality' | 'resource';
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

/**
 * 层级转换配置
 * 每个记忆层的转换特定配置
 */
export interface LayerTransitionConfig {
  layer: MemoryLayerType;

  // 输入转换（其他层 → 当前层）
  inboundTransitions: {
    [key in MemoryLayerType]?: MemoryTransition[];
  };

  // 输出转换（当前层 → 其他层）
  outboundTransitions: {
    [key in MemoryLayerType]?: MemoryTransition[];
  };

  // 层级特定规则
  retentionRules: {
    maxCapacity?: number;
    retentionPeriod?: number;
    compressionThreshold?: number;
    archivalCriteria?: TransitionCondition[];
  };

  // 质量控制
  qualityGates: {
    minimumConfidence: number;
    minimumImportance: number;
    maxProcessingTime: number;
    validationRequired: boolean;
  };

  // 优化参数
  optimization: {
    enabled: boolean;
    frequency: number;        // 优化频率（小时）
    aggressiveness: number;   // 优化激进程度
    preserveCritical: boolean;
  };
}

/**
 * 转换上下文接口
 */
export interface TransitionContext {
  // 触发信息
  triggeredBy: 'system' | 'user' | 'schedule' | 'event';
  triggerDetails: Record<string, any>;

  // 环境状态
  systemLoad: number;
  memoryPressure: number;
  availableResources: number;

  // 业务上下文
  activeSession?: string;
  currentTask?: string;
  userPreferences?: Record<string, any>;

  // 约束条件
  timeConstraints?: {
    maxDuration: number;
    deadline?: Date;
  };

  resourceConstraints?: {
    maxMemoryUsage: number;
    maxCpuUsage: number;
  };

  qualityConstraints?: {
    minAccuracy: number;
    maxLoss: number;
  };
}

/**
 * 智能转换建议接口
 */
export interface TransitionSuggestion {
  id: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';

  // 建议内容
  suggestedTransition: string;
  targetMemories: string[];
  reasoning: string;
  expectedBenefits: string[];
  potentialRisks: string[];

  // 预估影响
  estimatedImpact: {
    memoryCount: number;
    storageChange: number;
    performanceChange: number;
    qualityChange: number;
  };

  // 建议元数据
  generatedAt: Date;
  validUntil?: Date;
  generatedBy: string;    // AI模型或规则引擎标识
  appliedCount: number;
  successRate: number;
}