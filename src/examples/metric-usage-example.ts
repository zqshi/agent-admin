/**
 * 指标系统使用示例
 * 演示如何使用标准化的指标定义和验证工具
 */

import {
  StandardMetricDefinition,
  MetricDefinitionBuilder,
  MetricCategory,
  MetricLevel,
  MetricUnit,
  MetricDataType,
  MetricStatus
} from '../types/metric-types';

import { MetricValidator, MetricNamingSuggester, MetricFormatSuggester } from '../utils/metric-validator';
import { metricRegistry } from '../utils/metric-registry';

/**
 * 示例1: 创建新的标准指标定义
 */
function createNewMetricExample() {
  console.log('=== 示例1: 创建新的标准指标定义 ===\n');

  // 使用MetricDefinitionBuilder创建新指标
  const newMetric = new MetricDefinitionBuilder()
    .id('performance_tool_toolCallSuccessRate')
    .name('toolCallSuccessRate')
    .displayName('工具调用成功率')
    .category(MetricCategory.PERFORMANCE)
    .level(MetricLevel.L3)
    .domains('tool_reliability', 'system_performance')
    .description('工具调用成功的比例，反映工具的可靠性和系统稳定性')
    .formula('(成功工具调用数 / 总工具调用数) × 100')
    .unit(MetricUnit.PERCENTAGE)
    .dataType(MetricDataType.FLOAT)
    .precision(1)
    .range(0, 100)
    .qualityThresholds({
      excellent: 95,
      good: 90,
      warning: 85,
      critical: 80
    })
    .format({
      displayType: 'percentage',
      thousandsSeparator: false,
      suffix: '%',
      colorMapping: {
        excellent: '#10B981',
        good: '#3B82F6',
        warning: '#F59E0B',
        critical: '#EF4444'
      }
    })
    .governance({
      owner: '技术团队',
      reviewCycle: 'quarterly',
      lastReviewed: new Date().toISOString(),
      approvalStatus: MetricStatus.APPROVED
    })
    .version('1.0.0')
    .tags('performance', 'tool', 'reliability', 'technical')
    .build();

  console.log('✅ 新指标定义创建成功:');
  console.log(`   ID: ${newMetric.id}`);
  console.log(`   名称: ${newMetric.displayName}`);
  console.log(`   公式: ${newMetric.formula}`);
  console.log(`   单位: ${newMetric.unit}\n`);

  return newMetric;
}

/**
 * 示例2: 验证指标定义
 */
function validateMetricExample() {
  console.log('=== 示例2: 验证指标定义 ===\n');

  // 创建一个有问题的指标定义
  const problematicMetric: Partial<StandardMetricDefinition> = {
    id: 'invalid_id_format',  // ID格式不正确
    name: 'respTime',         // 使用了禁用的缩写命名
    displayName: '响应时间',
    category: MetricCategory.PERFORMANCE,
    level: MetricLevel.L3,
    // 缺少必填字段 domain, description, formula 等
  };

  const validationResult = MetricValidator.validate(problematicMetric);
  
  console.log(`验证结果: ${validationResult.isValid ? '✅ 通过' : '❌ 失败'}`);
  console.log(`验证得分: ${validationResult.score}/100\n`);

  if (validationResult.errors.length > 0) {
    console.log('🚨 发现的错误:');
    validationResult.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.field}] ${error.message}`);
    });
    console.log('');
  }

  if (validationResult.warnings.length > 0) {
    console.log('⚠️  警告信息:');
    validationResult.warnings.forEach((warning, index) => {
      console.log(`   ${index + 1}. [${warning.field}] ${warning.message}`);
      if (warning.suggestion) {
        console.log(`      建议: ${warning.suggestion}`);
      }
    });
    console.log('');
  }

  return validationResult;
}

/**
 * 示例3: 使用指标注册表
 */
function useMetricRegistryExample() {
  console.log('=== 示例3: 使用指标注册表 ===\n');

  // 获取所有指标
  const allMetrics = metricRegistry.getAllMetrics();
  console.log(`📊 注册表中共有 ${allMetrics.length} 个标准指标\n`);

  // 按分类查询指标
  const businessMetrics = metricRegistry.getMetricsByCategory(MetricCategory.BUSINESS);
  console.log(`💼 业务指标 (${businessMetrics.length}个):`);
  businessMetrics.forEach(metric => {
    console.log(`   • ${metric.displayName} (${metric.id})`);
  });
  console.log('');

  // 按层级查询指标
  const l1Metrics = metricRegistry.getMetricsByLevel(MetricLevel.L1);
  console.log(`🎯 L1核心指标 (${l1Metrics.length}个):`);
  l1Metrics.forEach(metric => {
    console.log(`   • ${metric.displayName} - ${metric.description.slice(0, 50)}...`);
  });
  console.log('');

  // 搜索指标
  const searchResult = metricRegistry.searchMetrics({
    query: '成功率',
    category: MetricCategory.PERFORMANCE
  });
  
  console.log(`🔍 搜索 '成功率' 在性能指标中的结果 (${searchResult.total}个):`);
  searchResult.metrics.forEach(metric => {
    console.log(`   • ${metric.displayName} (${metric.name})`);
  });
  console.log('');

  // 获取统计信息
  const stats = metricRegistry.getStats();
  console.log('📈 注册表统计:');
  console.log(`   总数: ${stats.total}`);
  console.log('   按分类分布:', stats.byCategory);
  console.log('   按层级分布:', stats.byLevel);
  console.log('   按状态分布:', stats.byStatus);
  console.log('');
}

/**
 * 示例4: 使用命名建议工具
 */
function useNamingSuggesterExample() {
  console.log('=== 示例4: 使用命名建议工具 ===\n');

  // 为不同类型的指标获取命名建议
  const scenarios = [
    { description: '用户任务成功完成', unit: MetricUnit.PERCENTAGE },
    { description: '系统平均响应时间', unit: MetricUnit.MILLISECONDS },
    { description: '总会话数量统计', unit: MetricUnit.COUNT },
    { description: 'Token使用总成本', unit: MetricUnit.CNY }
  ];

  scenarios.forEach(scenario => {
    const suggestions = MetricNamingSuggester.suggestName(scenario.description, scenario.unit);
    console.log(`📝 "${scenario.description}" 的命名建议:`);
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('   暂无特定建议，请参考命名规范');
    }
    console.log('');
  });
}

/**
 * 示例5: 使用格式建议工具
 */
function useFormatSuggesterExample() {
  console.log('=== 示例5: 使用格式建议工具 ===\n');

  const formatScenarios = [
    { unit: MetricUnit.PERCENTAGE, dataType: MetricDataType.FLOAT },
    { unit: MetricUnit.CNY, dataType: MetricDataType.FLOAT },
    { unit: MetricUnit.MILLISECONDS, dataType: MetricDataType.INTEGER },
    { unit: MetricUnit.COUNT, dataType: MetricDataType.INTEGER }
  ];

  formatScenarios.forEach(scenario => {
    const formatSuggestion = MetricFormatSuggester.suggestFormat(scenario.unit, scenario.dataType);
    console.log(`🎨 ${scenario.unit} + ${scenario.dataType} 的格式建议:`);
    console.log(`   显示类型: ${formatSuggestion.displayType}`);
    console.log(`   千位分隔符: ${formatSuggestion.thousandsSeparator}`);
    if (formatSuggestion.prefix) console.log(`   前缀: ${formatSuggestion.prefix}`);
    if (formatSuggestion.suffix) console.log(`   后缀: ${formatSuggestion.suffix}`);
    console.log('');
  });
}

/**
 * 示例6: 实际使用场景 - 创建模块指标定义
 */
function createModuleMetricsExample() {
  console.log('=== 示例6: 为新模块创建指标定义 ===\n');

  // 假设我们要为"智能推荐"模块创建指标
  const recommendationMetrics = [
    {
      name: 'recommendationAccuracy',
      displayName: '推荐准确率',
      description: '用户接受推荐结果的比例',
      formula: '(用户接受的推荐数 / 总推荐数) × 100',
      unit: MetricUnit.PERCENTAGE
    },
    {
      name: 'avgRecommendationTime',
      displayName: '平均推荐时间',
      description: '生成推荐结果的平均耗时',
      formula: '推荐计算时间总和 / 推荐请求总数',
      unit: MetricUnit.MILLISECONDS
    },
    {
      name: 'recommendationCoverage',
      displayName: '推荐覆盖率',
      description: '能够提供推荐的用户占比',
      formula: '(有推荐结果的用户数 / 活跃用户总数) × 100',
      unit: MetricUnit.PERCENTAGE
    }
  ];

  console.log('🎯 为智能推荐模块创建标准指标定义:\n');

  recommendationMetrics.forEach((metricInfo, index) => {
    // 先验证指标名称
    const suggestions = MetricNamingSuggester.suggestName(metricInfo.description, metricInfo.unit);
    const formatSuggestion = MetricFormatSuggester.suggestFormat(metricInfo.unit, MetricDataType.FLOAT);

    const metric = new MetricDefinitionBuilder()
      .id(`quality_recommendation_${metricInfo.name}`)
      .name(metricInfo.name)
      .displayName(metricInfo.displayName)
      .category(MetricCategory.QUALITY)
      .level(MetricLevel.L2)
      .domains('recommendation_quality', 'user_experience')
      .description(metricInfo.description)
      .formula(metricInfo.formula)
      .unit(metricInfo.unit)
      .dataType(MetricDataType.FLOAT)
      .precision(1)
      .qualityThresholds({
        excellent: metricInfo.unit === MetricUnit.PERCENTAGE ? 85 : 1000,
        good: metricInfo.unit === MetricUnit.PERCENTAGE ? 70 : 2000,
        warning: metricInfo.unit === MetricUnit.PERCENTAGE ? 55 : 3000,
        critical: metricInfo.unit === MetricUnit.PERCENTAGE ? 40 : 5000
      })
      .format(formatSuggestion)
      .governance({
        owner: '推荐团队',
        reviewCycle: 'quarterly',
        lastReviewed: new Date().toISOString(),
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('quality', 'recommendation', 'intelligence')
      .build();

    // 验证创建的指标
    const validation = MetricValidator.validate(metric);
    
    console.log(`${index + 1}. ${metric.displayName}`);
    console.log(`   ID: ${metric.id}`);
    console.log(`   验证: ${validation.isValid ? '✅ 通过' : '❌ 失败'} (得分: ${validation.score})`);
    
    if (!validation.isValid && validation.errors.length > 0) {
      console.log(`   错误: ${validation.errors[0].message}`);
    }
    
    if (suggestions.length > 0 && suggestions[0] !== metricInfo.name) {
      console.log(`   命名建议: ${suggestions[0]}`);
    }
    
    console.log('');
  });
}

/**
 * 示例7: 指标计算和显示
 */
function metricCalculationExample() {
  console.log('=== 示例7: 指标计算和格式化显示 ===\n');

  // 获取一个标准指标
  const metric = metricRegistry.getMetric('business_user_taskSuccessRate');
  
  if (metric) {
    // 模拟指标计算
    const rawValue = 0.923; // 92.3%
    
    // 根据指标定义格式化显示
    const formattedValue = formatMetricValue(rawValue, metric);
    const qualityLevel = assessMetricQuality(rawValue * 100, metric);
    
    console.log(`📊 指标: ${metric.displayName}`);
    console.log(`   原始值: ${rawValue}`);
    console.log(`   格式化显示: ${formattedValue}`);
    console.log(`   质量评级: ${qualityLevel.level} (${qualityLevel.color})`);
    console.log(`   公式: ${metric.formula}`);
    console.log('');
  }
}

/**
 * 格式化指标值
 */
function formatMetricValue(value: number, metric: StandardMetricDefinition): string {
  const { format, precision, unit } = metric;
  
  let formattedValue: string;
  
  switch (format.displayType) {
    case 'percentage':
      formattedValue = (value * 100).toFixed(precision);
      break;
    case 'currency':
      formattedValue = value.toFixed(precision);
      if (format.thousandsSeparator) {
        formattedValue = Number(formattedValue).toLocaleString('zh-CN');
      }
      break;
    case 'duration':
      if (unit === MetricUnit.MILLISECONDS && value >= 1000) {
        formattedValue = (value / 1000).toFixed(1) + 's';
      } else {
        formattedValue = value.toFixed(precision);
      }
      break;
    default:
      formattedValue = value.toFixed(precision);
      if (format.thousandsSeparator && value >= 1000) {
        formattedValue = Number(formattedValue).toLocaleString('zh-CN');
      }
  }
  
  return `${format.prefix || ''}${formattedValue}${format.suffix || ''}`;
}

/**
 * 评估指标质量
 */
function assessMetricQuality(value: number, metric: StandardMetricDefinition) {
  const { qualityThresholds, format } = metric;
  
  if (value >= qualityThresholds.excellent) {
    return { level: '优秀', color: format.colorMapping?.excellent || '#10B981' };
  } else if (value >= qualityThresholds.good) {
    return { level: '良好', color: format.colorMapping?.good || '#3B82F6' };
  } else if (value >= qualityThresholds.warning) {
    return { level: '警告', color: format.colorMapping?.warning || '#F59E0B' };
  } else {
    return { level: '严重', color: format.colorMapping?.critical || '#EF4444' };
  }
}

/**
 * 主函数 - 运行所有示例
 */
function runAllExamples() {
  console.log('🚀 指标系统使用示例演示\n');
  console.log('=' .repeat(60) + '\n');

  try {
    createNewMetricExample();
    validateMetricExample();
    useMetricRegistryExample();
    useNamingSuggesterExample();
    useFormatSuggesterExample();
    createModuleMetricsExample();
    metricCalculationExample();
    
    console.log('✅ 所有示例运行完成!\n');
    console.log('📚 更多信息请参考:');
    console.log('   • 指标标准模板规范: docs/03-技术文档/指标标准模板规范.md');
    console.log('   • 类型定义: src/types/metric-types.ts');
    console.log('   • 验证工具: src/utils/metric-validator.ts');
    console.log('   • 一致性检查: npm run check-metrics');

  } catch (error) {
    console.error('❌ 运行示例时发生错误:', error);
  }
}

// 如果直接运行此文件，则执行所有示例
if (require.main === module) {
  runAllExamples();
}

export {
  createNewMetricExample,
  validateMetricExample,
  useMetricRegistryExample,
  useNamingSuggesterExample,
  useFormatSuggesterExample,
  createModuleMetricsExample,
  metricCalculationExample,
  runAllExamples
};