/**
 * 数字员工管理平台指标标准类型定义
 * 版本: v1.0.0
 * 创建日期: 2024-08-25
 */

/**
 * 指标分类
 */
export enum MetricCategory {
  BUSINESS = 'business',         // 业务指标
  PERFORMANCE = 'performance',   // 性能指标
  QUALITY = 'quality',          // 质量指标
  COST = 'cost',                // 成本指标
  USER = 'user',                // 用户指标
  SYSTEM = 'system',            // 系统指标
  SECURITY = 'security'         // 安全指标
}

/**
 * 指标层级
 */
export enum MetricLevel {
  L1 = 'L1',  // 核心业务指标
  L2 = 'L2',  // 支撑分析指标  
  L3 = 'L3'   // 技术监控指标
}

/**
 * 标准单位
 */
export enum MetricUnit {
  // 数量单位
  COUNT = 'count',               // 次数/个数
  PERCENTAGE = 'percentage',     // 百分比 (0-100)
  RATIO = 'ratio',              // 比率 (0-1)
  RATE = 'rate',                // 速率 (次/时间单位)
  
  // 时间单位 (统一使用毫秒作为基础单位)
  MILLISECONDS = 'milliseconds', // 毫秒
  SECONDS = 'seconds',          // 秒
  MINUTES = 'minutes',          // 分钟
  HOURS = 'hours',              // 小时
  DAYS = 'days',                // 天
  
  // 数据单位
  BYTES = 'bytes',              // 字节
  KILOBYTES = 'kilobytes',      // KB
  MEGABYTES = 'megabytes',      // MB
  GIGABYTES = 'gigabytes',      // GB
  
  // 货币单位
  CNY = 'cny',                  // 人民币
  USD = 'usd',                  // 美元
  
  // 分数单位
  SCORE = 'score',              // 评分 (通常1-5或1-10)
  
  // 无量纲
  DIMENSIONLESS = 'dimensionless' // 无量纲
}

/**
 * 数据类型
 */
export enum MetricDataType {
  INTEGER = 'integer',          // 整数
  FLOAT = 'float',              // 浮点数
  BOOLEAN = 'boolean',          // 布尔值
  STRING = 'string',            // 字符串
  TIMESTAMP = 'timestamp'       // 时间戳
}

/**
 * 指标状态
 */
export enum MetricStatus {
  DRAFT = 'draft',           // 草稿状态，开发中
  REVIEW = 'review',         // 审核中
  APPROVED = 'approved',     // 已批准，正式使用
  DEPRECATED = 'deprecated', // 已废弃，计划移除
  RETIRED = 'retired'        // 已移除，不再使用
}

/**
 * 显示格式配置
 */
export interface MetricFormat {
  displayType: 'number' | 'percentage' | 'currency' | 'duration' | 'size';
  thousandsSeparator: boolean;  // 是否显示千位分隔符
  prefix?: string;              // 前缀
  suffix?: string;              // 后缀
  colorMapping?: {              // 颜色映射规则
    excellent: string;          // 优秀值颜色
    good: string;              // 良好值颜色  
    warning: string;           // 警告值颜色
    critical: string;          // 严重值颜色
  };
}

/**
 * 指标变更记录
 */
export interface MetricChange {
  version: string;              // 版本号
  date: string;                 // 变更日期 (ISO 8601格式)
  author: string;               // 变更者
  type: 'create' | 'modify' | 'deprecate'; // 变更类型
  description: string;          // 变更描述
  impactAssessment?: string;    // 影响评估
  rollbackPlan?: string;        // 回滚方案
}

/**
 * 指标治理信息
 */
export interface MetricGovernance {
  owner: string;                           // 指标负责人
  reviewCycle: 'monthly' | 'quarterly' | 'yearly'; // 审查周期
  lastReviewed: string;                    // 最近审查日期 (ISO 8601格式)
  approvalStatus: MetricStatus;            // 审批状态
  businessApprover?: string;               // 业务审批人
  technicalApprover?: string;              // 技术审批人
  approvalDate?: string;                   // 审批日期 (ISO 8601格式)
}

/**
 * 指标质量阈值
 */
export interface MetricQualityThresholds {
  excellent: number;           // 优秀阈值
  good: number;               // 良好阈值
  warning: number;            // 警告阈值
  critical: number;           // 严重阈值
}

/**
 * 指标值范围
 */
export interface MetricRange {
  min?: number;               // 最小值
  max?: number;               // 最大值
}

/**
 * 标准化指标定义接口
 */
export interface StandardMetricDefinition {
  // 基础标识
  id: string;                    // 全局唯一标识符，格式：{category}_{name}
  name: string;                  // 标准化名称，使用驼峰命名
  displayName: string;           // 显示名称（中文）
  
  // 分类信息
  category: MetricCategory;      // 指标分类
  level: MetricLevel;            // 指标层级 (L1/L2/L3)
  domain: string[];              // 适用业务域
  
  // 定义详情
  description: string;           // 详细描述
  formula: string;               // 计算公式
  unit: MetricUnit;              // 标准单位
  dataType: MetricDataType;      // 数据类型
  
  // 格式规范
  format: MetricFormat;          // 显示格式配置
  precision: number;             // 小数精度
  range?: MetricRange;           // 有效值范围
  
  // 质量标准
  qualityThresholds: MetricQualityThresholds; // 质量阈值
  
  // 治理信息
  governance: MetricGovernance;  // 治理信息
  
  // 版本控制
  version: string;               // 版本号 (semver格式)
  changeHistory: MetricChange[];  // 变更历史
  
  // 关联关系
  dependencies?: string[];       // 依赖的其他指标ID列表
  derivedMetrics?: string[];     // 派生指标ID列表
  
  // 标签和元数据
  tags: string[];               // 标签，便于分类和搜索
  metadata?: Record<string, any>; // 额外元数据
}

/**
 * 指标值接口
 */
export interface MetricValue {
  metricId: string;             // 指标ID
  value: number | string | boolean; // 指标值
  timestamp: string;            // 计算时间 (ISO 8601格式)
  dimensions?: Record<string, string>; // 维度信息 (如用户ID、会话ID等)
  metadata?: Record<string, any>; // 计算过程中的元数据
}

/**
 * 指标计算结果接口
 */
export interface MetricCalculationResult {
  metricId: string;             // 指标ID
  value: number | string | boolean; // 计算结果
  formattedValue: string;       // 格式化后的显示值
  status: 'success' | 'error' | 'warning'; // 计算状态
  quality: 'excellent' | 'good' | 'warning' | 'critical'; // 质量等级
  timestamp: string;            // 计算时间
  executionTime: number;        // 执行耗时 (毫秒)
  dependencies: {               // 依赖数据
    [metricId: string]: MetricValue;
  };
  error?: string;               // 错误信息
  warnings?: string[];          // 警告信息
}

/**
 * 指标验证结果接口
 */
export interface MetricValidationResult {
  metricId: string;             // 指标ID
  isValid: boolean;             // 是否通过验证
  errors: MetricValidationError[]; // 验证错误列表
  warnings: MetricValidationWarning[]; // 验证警告列表
  score: number;                // 验证得分 (0-100)
}

/**
 * 指标验证错误
 */
export interface MetricValidationError {
  code: string;                 // 错误代码
  field: string;                // 错误字段
  message: string;              // 错误消息
  severity: 'error' | 'warning'; // 严重程度
}

/**
 * 指标验证警告
 */
export interface MetricValidationWarning {
  code: string;                 // 警告代码
  field: string;                // 警告字段
  message: string;              // 警告消息
  suggestion?: string;          // 改进建议
}

/**
 * 指标注册表接口
 */
export interface MetricRegistry {
  metrics: Map<string, StandardMetricDefinition>; // 指标定义映射
  categories: Map<MetricCategory, string[]>;       // 分类索引
  levels: Map<MetricLevel, string[]>;             // 层级索引
  tags: Map<string, string[]>;                    // 标签索引
  lastUpdated: string;                            // 最后更新时间
}

/**
 * 指标搜索条件
 */
export interface MetricSearchCriteria {
  query?: string;               // 关键词搜索
  category?: MetricCategory;    // 分类筛选
  level?: MetricLevel;          // 层级筛选
  domain?: string;              // 业务域筛选
  tags?: string[];              // 标签筛选
  status?: MetricStatus;        // 状态筛选
  owner?: string;               // 负责人筛选
}

/**
 * 指标搜索结果
 */
export interface MetricSearchResult {
  metrics: StandardMetricDefinition[]; // 匹配的指标列表
  total: number;                       // 总数量
  facets: {                           // 聚合信息
    categories: Record<MetricCategory, number>;
    levels: Record<MetricLevel, number>;
    tags: Record<string, number>;
  };
}

/**
 * 指标依赖关系图节点
 */
export interface MetricDependencyNode {
  metricId: string;             // 指标ID
  name: string;                 // 指标名称
  category: MetricCategory;     // 分类
  level: MetricLevel;           // 层级
  dependencies: string[];       // 依赖的指标ID列表
  dependents: string[];         // 被依赖的指标ID列表
}

/**
 * 指标一致性检查报告
 */
export interface MetricConsistencyReport {
  totalMetrics: number;         // 总指标数量
  validMetrics: number;         // 有效指标数量
  invalidMetrics: number;       // 无效指标数量
  inconsistencies: MetricInconsistency[]; // 不一致问题列表
  suggestions: string[];        // 改进建议
  generatedAt: string;          // 报告生成时间
}

/**
 * 指标不一致性问题
 */
export interface MetricInconsistency {
  type: 'naming' | 'format' | 'dependency' | 'duplicate' | 'missing'; // 问题类型
  severity: 'low' | 'medium' | 'high' | 'critical'; // 严重程度
  metricIds: string[];          // 涉及的指标ID列表
  description: string;          // 问题描述
  suggestion: string;           // 修复建议
  autoFixable: boolean;         // 是否可自动修复
}

/**
 * 指标模板配置
 */
export interface MetricTemplate {
  name: string;                 // 模板名称
  description: string;          // 模板描述
  category: MetricCategory;     // 适用分类
  level: MetricLevel;           // 适用层级
  template: Partial<StandardMetricDefinition>; // 模板定义
  requiredFields: string[];     // 必填字段
  validationRules: MetricValidationRule[]; // 验证规则
}

/**
 * 指标验证规则
 */
export interface MetricValidationRule {
  field: string;                // 验证字段
  type: 'required' | 'format' | 'range' | 'custom'; // 验证类型
  params?: any;                 // 验证参数
  message: string;              // 错误消息
}

/**
 * 标准指标定义构建器
 */
export class MetricDefinitionBuilder {
  private definition: Partial<StandardMetricDefinition> = {};

  id(id: string): MetricDefinitionBuilder {
    this.definition.id = id;
    return this;
  }

  name(name: string): MetricDefinitionBuilder {
    this.definition.name = name;
    return this;
  }

  displayName(displayName: string): MetricDefinitionBuilder {
    this.definition.displayName = displayName;
    return this;
  }

  category(category: MetricCategory): MetricDefinitionBuilder {
    this.definition.category = category;
    return this;
  }

  level(level: MetricLevel): MetricDefinitionBuilder {
    this.definition.level = level;
    return this;
  }

  description(description: string): MetricDefinitionBuilder {
    this.definition.description = description;
    return this;
  }

  formula(formula: string): MetricDefinitionBuilder {
    this.definition.formula = formula;
    return this;
  }

  unit(unit: MetricUnit): MetricDefinitionBuilder {
    this.definition.unit = unit;
    return this;
  }

  dataType(dataType: MetricDataType): MetricDefinitionBuilder {
    this.definition.dataType = dataType;
    return this;
  }

  precision(precision: number): MetricDefinitionBuilder {
    this.definition.precision = precision;
    return this;
  }

  range(min?: number, max?: number): MetricDefinitionBuilder {
    this.definition.range = { min, max };
    return this;
  }

  qualityThresholds(thresholds: MetricQualityThresholds): MetricDefinitionBuilder {
    this.definition.qualityThresholds = thresholds;
    return this;
  }

  format(format: MetricFormat): MetricDefinitionBuilder {
    this.definition.format = format;
    return this;
  }

  governance(governance: MetricGovernance): MetricDefinitionBuilder {
    this.definition.governance = governance;
    return this;
  }

  version(version: string): MetricDefinitionBuilder {
    this.definition.version = version;
    return this;
  }

  tags(...tags: string[]): MetricDefinitionBuilder {
    this.definition.tags = tags;
    return this;
  }

  domains(...domains: string[]): MetricDefinitionBuilder {
    this.definition.domain = domains;
    return this;
  }

  dependencies(...dependencies: string[]): MetricDefinitionBuilder {
    this.definition.dependencies = dependencies;
    return this;
  }

  build(): StandardMetricDefinition {
    // 验证必填字段
    const required = ['id', 'name', 'displayName', 'category', 'level', 'description', 'formula', 'unit', 'dataType', 'format', 'precision', 'qualityThresholds', 'governance', 'version', 'tags', 'domain'];
    
    for (const field of required) {
      if (!(field in this.definition) || this.definition[field as keyof StandardMetricDefinition] === undefined) {
        throw new Error(`缺少必填字段: ${field}`);
      }
    }

    // 设置默认值
    const definition = {
      ...this.definition,
      changeHistory: this.definition.changeHistory || [{
        version: this.definition.version!,
        date: new Date().toISOString(),
        author: 'system',
        type: 'create' as const,
        description: `创建指标 ${this.definition.displayName}`
      }],
      dependencies: this.definition.dependencies || [],
      derivedMetrics: this.definition.derivedMetrics || [],
      metadata: this.definition.metadata || {}
    } as StandardMetricDefinition;

    return definition;
  }
}

// 导出常用的指标模板
export const STANDARD_METRIC_TEMPLATES = {
  L1_BUSINESS: {
    level: MetricLevel.L1,
    category: MetricCategory.BUSINESS,
    format: {
      displayType: 'percentage' as const,
      thousandsSeparator: false,
      suffix: '%'
    },
    precision: 1,
    qualityThresholds: {
      excellent: 90,
      good: 75,
      warning: 60,
      critical: 45
    },
    governance: {
      reviewCycle: 'monthly' as const,
      approvalStatus: MetricStatus.APPROVED
    }
  },
  
  L2_QUALITY: {
    level: MetricLevel.L2,
    category: MetricCategory.QUALITY,
    format: {
      displayType: 'number' as const,
      thousandsSeparator: true
    },
    precision: 2,
    qualityThresholds: {
      excellent: 85,
      good: 70,
      warning: 55,
      critical: 40
    },
    governance: {
      reviewCycle: 'quarterly' as const,
      approvalStatus: MetricStatus.APPROVED
    }
  },
  
  L3_PERFORMANCE: {
    level: MetricLevel.L3,
    category: MetricCategory.PERFORMANCE,
    format: {
      displayType: 'duration' as const,
      thousandsSeparator: false
    },
    precision: 1,
    qualityThresholds: {
      excellent: 95,
      good: 85,
      warning: 70,
      critical: 50
    },
    governance: {
      reviewCycle: 'quarterly' as const,
      approvalStatus: MetricStatus.APPROVED
    }
  }
};