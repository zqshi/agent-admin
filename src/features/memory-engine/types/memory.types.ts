/**
 * 记忆系统核心类型定义
 * 基于五层记忆架构：工作记忆、情景记忆、语义记忆、程序性记忆、情感记忆
 */

// 记忆层级枚举
export type MemoryLayerType = 'working' | 'episodic' | 'semantic' | 'procedural' | 'emotional';

// 记忆来源
export type MemorySource =
  | 'conversation'      // 对话输入
  | 'document'         // 文档学习
  | 'feedback'         // 用户反馈
  | 'experience'       // 交互经验
  | 'training'         // 系统训练
  | 'inference'        // 推理产生
  | 'synthesis';       // 融合生成

// 记忆重要性等级
export type MemoryImportance = 'critical' | 'high' | 'medium' | 'low' | 'minimal';

// 情感色彩
export type EmotionalValence = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

// 记忆状态
export type MemoryState = 'active' | 'dormant' | 'archived' | 'deprecated';

/**
 * 核心记忆条目接口
 * 扩展原有MemoryEntry，实现分层记忆系统
 */
export interface EnhancedMemoryEntry {
  // 基础标识
  id: string;
  parentId?: string;        // 父记忆ID（用于记忆演化追踪）
  childrenIds?: string[];   // 子记忆IDs

  // 记忆分层
  layer: MemoryLayerType;
  type: string;             // 具体类型，如'dialogue', 'skill', 'concept'等

  // 内容信息
  content: string;
  contentType: 'text' | 'structured' | 'vector' | 'multimodal';
  metadata: Record<string, any>;

  // 时间维度
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt?: Date;
  expiresAt?: Date;         // 记忆过期时间（用于衰减）

  // 认知指标
  confidence: number;       // 置信度 [0, 1]
  importance: number;       // 重要性 [0, 1]
  clarity: number;          // 清晰度 [0, 1]
  stability: number;        // 稳定性 [0, 1]

  // 情感维度
  emotionalValence: number; // 情感色彩 [-1, 1]
  emotionalIntensity: number; // 情感强度 [0, 1]
  emotionalTags: string[];

  // 活跃性指标
  accessCount: number;      // 访问次数
  activationCount: number;  // 激活次数
  reinforcementCount: number; // 强化次数
  decayRate: number;        // 衰减速率

  // 关联网络
  associations: MemoryAssociation[];
  contextIds: string[];     // 相关上下文记忆
  derivedFrom: string[];    // 来源记忆
  influences: string[];     // 影响的记忆

  // 来源信息
  source: MemorySource;
  sourceDetails: MemorySourceDetails;

  // 状态管理
  state: MemoryState;
  version: number;          // 版本号，用于记忆演化追踪

  // 高级特性
  embeddings?: number[];    // 向量嵌入
  compressionLevel?: number; // 压缩级别
  qualityScore?: number;    // 质量评分

  // 标签和分类
  tags: string[];
  categories: string[];
  domainKnowledge: string[]; // 所属知识域
}

/**
 * 记忆关联接口
 * 描述记忆之间的关系
 */
export interface MemoryAssociation {
  id: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  relationType: MemoryRelationType;
  strength: number;         // 关联强度 [0, 1]
  confidence: number;       // 关联置信度 [0, 1]
  createdAt: Date;
  lastActivated?: Date;
  activationCount: number;
  bidirectional: boolean;   // 是否双向关联
  metadata?: Record<string, any>;
}

// 记忆关联类型
export type MemoryRelationType =
  | 'temporal'      // 时间关联（先后关系）
  | 'causal'        // 因果关联
  | 'semantic'      // 语义关联
  | 'contextual'    // 上下文关联
  | 'hierarchical'  // 层级关联（父子关系）
  | 'similarity'    // 相似性关联
  | 'contrast'      // 对比关联
  | 'dependency'    // 依赖关联
  | 'reinforcement' // 强化关联
  | 'inhibition';   // 抑制关联

/**
 * 记忆来源详情
 */
export interface MemorySourceDetails {
  originalSource: string;
  extractionMethod?: string;
  processingPipeline?: string[];
  validationStatus?: 'verified' | 'pending' | 'disputed';
  authorityScore?: number;
  reliability?: number;
  timestamp: Date;
}

/**
 * 记忆上下文接口
 * 描述记忆产生和使用的环境
 */
export interface MemoryContext {
  sessionId?: string;
  taskId?: string;
  userId?: string;
  environmentId?: string;

  // 对话上下文
  conversationContext?: {
    turn: number;
    topic: string;
    intent: string;
    sentiment: number;
  };

  // 任务上下文
  taskContext?: {
    domain: string;
    difficulty: number;
    priority: string;
    deadline?: Date;
  };

  // 认知上下文
  cognitiveLoad?: number;
  attentionFocus?: string[];
  activeGoals?: string[];

  // 环境上下文
  timestamp: Date;
  location?: string;
  triggers?: string[];
  constraints?: string[];
}

/**
 * 记忆层状态接口
 * 各层记忆的整体状态描述
 */
export interface MemoryLayerState {
  layer: MemoryLayerType;
  totalMemories: number;
  activeMemories: number;
  capacity: number;
  utilizationRate: number;
  averageAge: number;
  averageImportance: number;
  averageConfidence: number;

  // 层级特定指标
  layerSpecificMetrics: Record<string, number>;

  // 最近活动
  recentActivities: {
    timestamp: Date;
    action: 'created' | 'accessed' | 'updated' | 'archived';
    memoryId: string;
    details?: string;
  }[];

  // 健康状态
  healthIndicators: {
    fragmentationLevel: number;
    redundancyRate: number;
    coherenceScore: number;
    updateFrequency: number;
  };
}

/**
 * 记忆系统整体状态
 */
export interface MemorySystemState {
  // 各层状态
  layers: Record<MemoryLayerType, MemoryLayerState>;

  // 系统级指标
  totalMemories: number;
  totalAssociations: number;
  systemCoherence: number;
  learningVelocity: number;
  forgettingRate: number;

  // 性能指标
  retrievalEfficiency: number;
  storageEfficiency: number;
  processingLoad: number;

  // 质量指标
  averageMemoryQuality: number;
  knowledgeConsistency: number;
  informationCoverage: number;

  // 动态指标
  growthRate: number;
  adaptationRate: number;
  optimizationScore: number;

  // 最后更新时间
  lastUpdated: Date;
  lastOptimized?: Date;
}

/**
 * 记忆分析结果
 */
export interface MemoryAnalytics {
  // 时间分析
  timeDistribution: {
    period: string;
    count: number;
    averageImportance: number;
  }[];

  // 类型分析
  typeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];

  // 来源分析
  sourceDistribution: {
    source: MemorySource;
    count: number;
    qualityScore: number;
  }[];

  // 关联分析
  associationPatterns: {
    pattern: string;
    frequency: number;
    strength: number;
  }[];

  // 趋势分析
  trends: {
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    rate: number;
    prediction?: number;
  }[];

  // 异常检测
  anomalies: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedMemories: string[];
    recommendedAction: string;
  }[];

  // 优化建议
  optimizationSuggestions: {
    category: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    expectedImprovement: number;
    effort: 'low' | 'medium' | 'high';
  }[];

  // 报告生成时间
  generatedAt: Date;
  reportPeriod: {
    start: Date;
    end: Date;
  };
}

/**
 * 记忆检索查询接口
 */
export interface MemoryQuery {
  // 查询内容
  query: string;
  queryType: 'semantic' | 'exact' | 'fuzzy' | 'vector' | 'hybrid';

  // 过滤条件
  layers?: MemoryLayerType[];
  sources?: MemorySource[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  importanceRange?: [number, number];
  confidenceRange?: [number, number];
  tags?: string[];
  categories?: string[];

  // 检索参数
  maxResults?: number;
  threshold?: number;
  includeAssociations?: boolean;
  associationDepth?: number;

  // 排序选项
  sortBy?: 'relevance' | 'importance' | 'recency' | 'confidence';
  sortOrder?: 'asc' | 'desc';

  // 上下文
  context?: MemoryContext;
  sessionMemories?: string[];
}

/**
 * 记忆检索结果
 */
export interface MemorySearchResult {
  memory: EnhancedMemoryEntry;
  score: number;
  relevanceScore: number;
  contextScore?: number;
  matchType: 'exact' | 'semantic' | 'associative' | 'contextual';
  matchedFields: string[];
  associations?: MemoryAssociation[];
  explanation?: string;
}

/**
 * 记忆检索响应
 */
export interface MemorySearchResponse {
  query: MemoryQuery;
  results: MemorySearchResult[];
  totalMatches: number;
  executionTime: number;
  searchStrategy: string;
  suggestions?: string[];
  metadata: {
    searchId: string;
    timestamp: Date;
    layersSearched: MemoryLayerType[];
    filtersApplied: string[];
  };
}