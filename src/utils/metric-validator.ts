/**
 * 指标验证器
 * 用于验证指标定义是否符合标准模板规范
 */

import {
  StandardMetricDefinition,
  MetricValidationResult,
  MetricValidationError,
  MetricValidationWarning,
  MetricCategory,
  MetricLevel,
  MetricUnit,
  MetricDataType,
  MetricStatus
} from '../types/metric-types';

export class MetricValidator {
  private static readonly NAMING_PATTERNS = {
    // 时间相关指标命名模式
    TIME_METRICS: [
      /^.*Time$/,           // responseTime, processingTime
      /^.*Duration$/,       // sessionDuration
      /^.*Latency$/,        // networkLatency
      /^.*Delay$/           // processingDelay
    ],
    
    // 比率相关指标命名模式
    RATE_METRICS: [
      /^.*Rate$/,           // successRate, failureRate
      /^.*Ratio$/,          // conversionRatio
      /^.*Percentage$/      // completionPercentage
    ],
    
    // 数量相关指标命名模式
    COUNT_METRICS: [
      /^total.*$/,          // totalSessions
      /^.*Count$/,          // errorCount
      /^.*Number$/,         // sessionNumber
      /^avg.*$/,            // avgResponseTime
      /^max.*$/,            // maxMemoryUsage
      /^min.*$/             // minResponseTime
    ]
  };

  private static readonly FORBIDDEN_NAMES = [
    // 禁用的缩写
    'respTime', 'succRate', 'failRate', 'sess', 'usr', 'resp',
    // 禁用的下划线命名
    'response_time', 'success_rate', 'failure_rate',
    // 禁用的混合单位命名
    'responseTimeSeconds', 'costInCNY', 'percentageValue'
  ];

  private static readonly REQUIRED_FIELDS: (keyof StandardMetricDefinition)[] = [
    'id', 'name', 'displayName', 'category', 'level', 'domain',
    'description', 'formula', 'unit', 'dataType', 'format',
    'precision', 'qualityThresholds', 'governance', 'version',
    'changeHistory', 'tags'
  ];

  /**
   * 验证指标定义的完整性和规范性
   */
  static validate(metric: Partial<StandardMetricDefinition>): MetricValidationResult {
    const errors: MetricValidationError[] = [];
    const warnings: MetricValidationWarning[] = [];

    // 执行各种验证
    this.validateRequiredFields(metric, errors);
    this.validateNamingConvention(metric, errors, warnings);
    this.validateIdFormat(metric, errors);
    this.validateUnitConsistency(metric, errors, warnings);
    this.validateQualityThresholds(metric, errors);
    this.validateVersionFormat(metric, errors);
    this.validateFormula(metric, warnings);
    this.validateGovernance(metric, errors, warnings);
    this.validateTags(metric, warnings);

    const score = this.calculateValidationScore(errors, warnings);

    return {
      metricId: metric.id || 'unknown',
      isValid: errors.length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * 批量验证多个指标
   */
  static validateBatch(metrics: Partial<StandardMetricDefinition>[]): MetricValidationResult[] {
    return metrics.map(metric => this.validate(metric));
  }

  /**
   * 验证必填字段
   */
  private static validateRequiredFields(
    metric: Partial<StandardMetricDefinition>, 
    errors: MetricValidationError[]
  ) {
    for (const field of this.REQUIRED_FIELDS) {
      if (!(field in metric) || metric[field] === undefined || metric[field] === null) {
        errors.push({
          code: 'MISSING_REQUIRED_FIELD',
          field,
          message: `缺少必填字段: ${field}`,
          severity: 'error'
        });
      }
    }

    // 特殊检查：数组字段不能为空
    if (metric.domain && metric.domain.length === 0) {
      errors.push({
        code: 'EMPTY_DOMAIN_ARRAY',
        field: 'domain',
        message: 'domain字段不能为空数组',
        severity: 'error'
      });
    }

    if (metric.tags && metric.tags.length === 0) {
      errors.push({
        code: 'EMPTY_TAGS_ARRAY',
        field: 'tags', 
        message: 'tags字段不能为空数组',
        severity: 'error'
      });
    }
  }

  /**
   * 验证命名规范
   */
  private static validateNamingConvention(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[],
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.name) return;

    // 检查禁用名称
    if (this.FORBIDDEN_NAMES.includes(metric.name)) {
      errors.push({
        code: 'FORBIDDEN_NAME',
        field: 'name',
        message: `指标名称 "${metric.name}" 不符合命名规范`,
        severity: 'error'
      });
    }

    // 检查驼峰命名法
    if (!/^[a-z][a-zA-Z0-9]*$/.test(metric.name)) {
      errors.push({
        code: 'INVALID_CAMEL_CASE',
        field: 'name',
        message: `指标名称 "${metric.name}" 必须使用驼峰命名法`,
        severity: 'error'
      });
    }

    // 检查命名一致性
    this.validateNamingConsistency(metric, warnings);
  }

  /**
   * 验证命名一致性
   */
  private static validateNamingConsistency(
    metric: Partial<StandardMetricDefinition>,
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.name || !metric.unit) return;

    const name = metric.name;
    const unit = metric.unit;

    // 时间指标应该以Time, Duration, Latency结尾
    if ([MetricUnit.MILLISECONDS, MetricUnit.SECONDS, MetricUnit.MINUTES, MetricUnit.HOURS].includes(unit)) {
      if (!this.NAMING_PATTERNS.TIME_METRICS.some(pattern => pattern.test(name))) {
        warnings.push({
          code: 'INCONSISTENT_TIME_NAMING',
          field: 'name',
          message: `时间指标建议使用以下后缀: Time, Duration, Latency, Delay`,
          suggestion: `建议重命名为: ${name}Time 或 ${name}Duration`
        });
      }
    }

    // 比率指标应该以Rate, Ratio, Percentage结尾
    if ([MetricUnit.PERCENTAGE, MetricUnit.RATIO].includes(unit)) {
      if (!this.NAMING_PATTERNS.RATE_METRICS.some(pattern => pattern.test(name))) {
        warnings.push({
          code: 'INCONSISTENT_RATE_NAMING',
          field: 'name',
          message: `比率指标建议使用以下后缀: Rate, Ratio, Percentage`,
          suggestion: `建议重命名为: ${name}Rate 或 ${name}Ratio`
        });
      }
    }

    // 数量指标应该有相应前后缀
    if (unit === MetricUnit.COUNT) {
      if (!this.NAMING_PATTERNS.COUNT_METRICS.some(pattern => pattern.test(name))) {
        warnings.push({
          code: 'INCONSISTENT_COUNT_NAMING',
          field: 'name',
          message: `数量指标建议使用以下前缀或后缀: total, avg, max, min, Count, Number`,
          suggestion: `建议重命名为: total${name.charAt(0).toUpperCase() + name.slice(1)} 或 ${name}Count`
        });
      }
    }
  }

  /**
   * 验证ID格式
   */
  private static validateIdFormat(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[]
  ) {
    if (!metric.id) return;

    // ID格式: {category}_{domain}_{name}
    const idPattern = /^[a-z]+_[a-z]+_[a-zA-Z]+$/;
    if (!idPattern.test(metric.id)) {
      errors.push({
        code: 'INVALID_ID_FORMAT',
        field: 'id',
        message: `指标ID格式不正确，应为: {category}_{domain}_{name}，例如: business_user_taskSuccessRate`,
        severity: 'error'
      });
      return;
    }

    // 检查ID与其他字段的一致性
    if (metric.category && metric.name) {
      const expectedPrefix = `${metric.category}_`;
      if (!metric.id.startsWith(expectedPrefix)) {
        errors.push({
          code: 'ID_CATEGORY_MISMATCH',
          field: 'id',
          message: `指标ID应该以分类开头: ${expectedPrefix}`,
          severity: 'error'
        });
      }

      if (!metric.id.endsWith(metric.name)) {
        errors.push({
          code: 'ID_NAME_MISMATCH',
          field: 'id',
          message: `指标ID应该以指标名称结尾: ${metric.name}`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * 验证单位一致性
   */
  private static validateUnitConsistency(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[],
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.unit || !metric.dataType || !metric.format) return;

    // 验证单位与数据类型的一致性
    if (metric.unit === MetricUnit.BOOLEAN && metric.dataType !== MetricDataType.BOOLEAN) {
      errors.push({
        code: 'UNIT_DATATYPE_MISMATCH',
        field: 'unit',
        message: `布尔类型单位应该对应布尔数据类型`,
        severity: 'error'
      });
    }

    if ([MetricUnit.COUNT, MetricUnit.DAYS, MetricUnit.HOURS].includes(metric.unit) && 
        metric.dataType === MetricDataType.FLOAT) {
      warnings.push({
        code: 'UNIT_PRECISION_WARNING',
        field: 'dataType',
        message: `整数单位通常不需要浮点数类型`,
        suggestion: `建议使用 INTEGER 数据类型`
      });
    }

    // 验证显示格式一致性
    if (metric.unit === MetricUnit.PERCENTAGE && metric.format.displayType !== 'percentage') {
      warnings.push({
        code: 'FORMAT_UNIT_MISMATCH',
        field: 'format',
        message: `百分比单位建议使用 percentage 显示格式`,
        suggestion: `设置 format.displayType = 'percentage'`
      });
    }

    if ([MetricUnit.CNY, MetricUnit.USD].includes(metric.unit) && metric.format.displayType !== 'currency') {
      warnings.push({
        code: 'FORMAT_CURRENCY_MISMATCH',
        field: 'format',
        message: `货币单位建议使用 currency 显示格式`,
        suggestion: `设置 format.displayType = 'currency'`
      });
    }
  }

  /**
   * 验证质量阈值
   */
  private static validateQualityThresholds(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[]
  ) {
    if (!metric.qualityThresholds) return;

    const { excellent, good, warning, critical } = metric.qualityThresholds;

    // 检查阈值逻辑关系（通常应该是递减的）
    if (excellent <= good || good <= warning || warning <= critical) {
      errors.push({
        code: 'INVALID_THRESHOLD_ORDER',
        field: 'qualityThresholds',
        message: `质量阈值应该满足: excellent > good > warning > critical`,
        severity: 'error'
      });
    }

    // 验证百分比阈值范围
    if (metric.unit === MetricUnit.PERCENTAGE) {
      if (excellent > 100 || critical < 0) {
        errors.push({
          code: 'INVALID_PERCENTAGE_THRESHOLD',
          field: 'qualityThresholds',
          message: `百分比指标的阈值应该在0-100范围内`,
          severity: 'error'
        });
      }
    }
  }

  /**
   * 验证版本号格式
   */
  private static validateVersionFormat(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[]
  ) {
    if (!metric.version) return;

    // 验证语义版本号格式 (major.minor.patch)
    const semverPattern = /^\d+\.\d+\.\d+$/;
    if (!semverPattern.test(metric.version)) {
      errors.push({
        code: 'INVALID_VERSION_FORMAT',
        field: 'version',
        message: `版本号必须符合语义版本格式: major.minor.patch (例如: 1.0.0)`,
        severity: 'error'
      });
    }
  }

  /**
   * 验证公式合理性
   */
  private static validateFormula(
    metric: Partial<StandardMetricDefinition>,
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.formula) return;

    // 检查公式是否包含基本的数学表达式
    const hasBasicMath = /[\+\-\*\/\(\)]/.test(metric.formula);
    const hasVariables = /[a-zA-Z]/.test(metric.formula);

    if (!hasBasicMath && !hasVariables) {
      warnings.push({
        code: 'SIMPLE_FORMULA_WARNING',
        field: 'formula',
        message: `公式似乎过于简单，建议提供更详细的计算说明`,
        suggestion: `包含变量名称和计算步骤，例如: (成功会话数 / 总会话数) × 100`
      });
    }

    // 检查除法公式是否考虑了分母为零的情况
    if (metric.formula.includes('/') && !metric.formula.includes('非零')) {
      warnings.push({
        code: 'DIVISION_BY_ZERO_WARNING',
        field: 'formula',
        message: `包含除法的公式应该说明分母为零时的处理方式`,
        suggestion: `在公式中注明分母非零条件或处理方式`
      });
    }
  }

  /**
   * 验证治理信息
   */
  private static validateGovernance(
    metric: Partial<StandardMetricDefinition>,
    errors: MetricValidationError[],
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.governance) return;

    const governance = metric.governance;

    // 验证审查日期格式
    if (governance.lastReviewed) {
      const datePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
      if (!datePattern.test(governance.lastReviewed)) {
        errors.push({
          code: 'INVALID_DATE_FORMAT',
          field: 'governance.lastReviewed',
          message: `审查日期必须使用ISO 8601格式`,
          severity: 'error'
        });
      }
    }

    // 检查审查周期的合理性
    const now = new Date();
    const lastReviewed = new Date(governance.lastReviewed);
    const monthsSinceReview = (now.getTime() - lastReviewed.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (governance.reviewCycle === 'monthly' && monthsSinceReview > 1.5) {
      warnings.push({
        code: 'OVERDUE_REVIEW',
        field: 'governance.lastReviewed',
        message: `指标审查已逾期，应该进行月度审查`,
        suggestion: `安排近期审查并更新lastReviewed字段`
      });
    }
  }

  /**
   * 验证标签规范
   */
  private static validateTags(
    metric: Partial<StandardMetricDefinition>,
    warnings: MetricValidationWarning[]
  ) {
    if (!metric.tags) return;

    // 检查标签命名规范
    metric.tags.forEach(tag => {
      if (!/^[a-z][a-z_]*$/.test(tag)) {
        warnings.push({
          code: 'INVALID_TAG_FORMAT',
          field: 'tags',
          message: `标签 "${tag}" 应该使用小写字母和下划线`,
          suggestion: `建议使用格式如: business, user_experience, core_metric`
        });
      }
    });

    // 建议常用标签
    const commonTags = ['business', 'technical', 'user', 'performance', 'quality', 'cost'];
    const hasCommonTag = metric.tags.some(tag => commonTags.includes(tag));
    
    if (!hasCommonTag) {
      warnings.push({
        code: 'MISSING_COMMON_TAG',
        field: 'tags',
        message: `建议添加常用分类标签以便搜索`,
        suggestion: `考虑添加: ${commonTags.join(', ')}`
      });
    }
  }

  /**
   * 计算验证得分
   */
  private static calculateValidationScore(
    errors: MetricValidationError[],
    warnings: MetricValidationWarning[]
  ): number {
    let score = 100;
    
    // 错误扣分更多
    score -= errors.length * 15;
    
    // 警告扣分较少
    score -= warnings.length * 5;
    
    return Math.max(0, score);
  }
}

/**
 * 指标命名建议工具
 */
export class MetricNamingSuggester {
  /**
   * 根据单位和类型建议指标名称
   */
  static suggestName(description: string, unit: MetricUnit): string[] {
    const suggestions: string[] = [];
    const lowerDesc = description.toLowerCase();

    switch (unit) {
      case MetricUnit.PERCENTAGE:
      case MetricUnit.RATIO:
        if (lowerDesc.includes('成功')) {
          suggestions.push('successRate', 'completionRate');
        }
        if (lowerDesc.includes('失败')) {
          suggestions.push('failureRate', 'errorRate');
        }
        if (lowerDesc.includes('转化')) {
          suggestions.push('conversionRate', 'conversionRatio');
        }
        break;

      case MetricUnit.MILLISECONDS:
      case MetricUnit.SECONDS:
        if (lowerDesc.includes('响应')) {
          suggestions.push('responseTime', 'avgResponseTime');
        }
        if (lowerDesc.includes('处理')) {
          suggestions.push('processingTime', 'executionTime');
        }
        if (lowerDesc.includes('等待')) {
          suggestions.push('waitTime', 'queueTime');
        }
        break;

      case MetricUnit.COUNT:
        if (lowerDesc.includes('总')) {
          suggestions.push('totalSessions', 'totalRequests');
        }
        if (lowerDesc.includes('平均')) {
          suggestions.push('avgCount', 'avgValue');
        }
        break;

      case MetricUnit.CNY:
      case MetricUnit.USD:
        if (lowerDesc.includes('成本')) {
          suggestions.push('totalCost', 'avgCostPerSession');
        }
        if (lowerDesc.includes('收入')) {
          suggestions.push('totalRevenue', 'avgRevenue');
        }
        break;
    }

    return suggestions;
  }
}

/**
 * 指标格式建议工具
 */
export class MetricFormatSuggester {
  /**
   * 根据单位建议显示格式
   */
  static suggestFormat(unit: MetricUnit, dataType: MetricDataType): Partial<MetricFormat> {
    const format: Partial<MetricFormat> = {
      thousandsSeparator: false
    };

    switch (unit) {
      case MetricUnit.PERCENTAGE:
        format.displayType = 'percentage';
        format.suffix = '%';
        format.thousandsSeparator = false;
        break;

      case MetricUnit.CNY:
        format.displayType = 'currency';
        format.prefix = '¥';
        format.thousandsSeparator = true;
        break;

      case MetricUnit.USD:
        format.displayType = 'currency';
        format.prefix = '$';
        format.thousandsSeparator = true;
        break;

      case MetricUnit.SECONDS:
        format.displayType = 'duration';
        format.suffix = 's';
        break;

      case MetricUnit.MILLISECONDS:
        format.displayType = 'duration';
        format.suffix = 'ms';
        break;

      case MetricUnit.COUNT:
        format.displayType = 'number';
        format.thousandsSeparator = true;
        break;

      default:
        format.displayType = 'number';
        if (dataType === MetricDataType.INTEGER) {
          format.thousandsSeparator = true;
        }
    }

    return format as MetricFormat;
  }
}