/**
 * 指标注册表
 * 管理所有标准指标定义的中央注册表
 */

import {
  StandardMetricDefinition,
  MetricRegistry,
  MetricSearchCriteria,
  MetricSearchResult,
  MetricCategory,
  MetricLevel,
  MetricUnit,
  MetricDataType,
  MetricStatus,
  MetricDefinitionBuilder,
  STANDARD_METRIC_TEMPLATES
} from '../types/metric-types';

/**
 * 标准指标注册表实现
 */
export class StandardMetricRegistry {
  private registry: MetricRegistry;
  private static instance: StandardMetricRegistry;

  private constructor() {
    this.registry = {
      metrics: new Map(),
      categories: new Map(),
      levels: new Map(),
      tags: new Map(),
      lastUpdated: new Date().toISOString()
    };
    
    this.initializeStandardMetrics();
  }

  /**
   * 获取单例实例
   */
  static getInstance(): StandardMetricRegistry {
    if (!StandardMetricRegistry.instance) {
      StandardMetricRegistry.instance = new StandardMetricRegistry();
    }
    return StandardMetricRegistry.instance;
  }

  /**
   * 初始化标准指标定义
   */
  private initializeStandardMetrics() {
    // L1 业务指标
    this.registerMetric(new MetricDefinitionBuilder()
      .id('business_user_taskSuccessRate')
      .name('taskSuccessRate')
      .displayName('任务完成率')
      .category(MetricCategory.BUSINESS)
      .level(MetricLevel.L1)
      .domains('user_experience', 'business_outcome')
      .description('用户成功完成预期任务的比例，是衡量产品核心价值实现程度的关键指标')
      .formula('(成功完成任务的会话数 / 总会话数) × 100')
      .unit(MetricUnit.PERCENTAGE)
      .dataType(MetricDataType.FLOAT)
      .precision(1)
      .range(0, 100)
      .qualityThresholds({
        excellent: 90,
        good: 75,
        warning: 60,
        critical: 45
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
        owner: '产品团队',
        reviewCycle: 'monthly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('business', 'user', 'success', 'core')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('business_user_userValueDensity')
      .name('userValueDensity')
      .displayName('用户价值密度')
      .category(MetricCategory.BUSINESS)
      .level(MetricLevel.L1)
      .domains('user_experience', 'value_creation')
      .description('单个用户在单次会话中获得的平均价值量化，反映产品对用户的价值创造效率')
      .formula('总用户价值得分 / 总会话数')
      .unit(MetricUnit.SCORE)
      .dataType(MetricDataType.FLOAT)
      .precision(2)
      .range(0, 10)
      .qualityThresholds({
        excellent: 3.0,
        good: 2.0,
        warning: 1.0,
        critical: 0.5
      })
      .format({
        displayType: 'number',
        thousandsSeparator: false,
        suffix: '分',
        colorMapping: {
          excellent: '#10B981',
          good: '#3B82F6',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      })
      .governance({
        owner: '产品团队',
        reviewCycle: 'monthly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('business', 'user', 'value', 'core')
      .dependencies('business_user_taskSuccessRate')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('business_user_retentionRate7d')
      .name('retentionRate7d')
      .displayName('7日留存率')
      .category(MetricCategory.USER)
      .level(MetricLevel.L1)
      .domains('user_retention', 'product_stickiness')
      .description('新用户在首次使用后7天内再次使用产品的比例，反映短期用户黏性')
      .formula('7天内回访的新用户数 / 新用户总数')
      .unit(MetricUnit.PERCENTAGE)
      .dataType(MetricDataType.FLOAT)
      .precision(1)
      .range(0, 100)
      .qualityThresholds({
        excellent: 70,
        good: 50,
        warning: 30,
        critical: 15
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
        owner: '增长团队',
        reviewCycle: 'monthly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('business', 'user', 'retention', 'growth')
      .build()
    );

    // L2 支撑指标
    this.registerMetric(new MetricDefinitionBuilder()
      .id('quality_interaction_effectiveDepth')
      .name('effectiveInteractionDepth')
      .displayName('有效交互深度')
      .category(MetricCategory.QUALITY)
      .level(MetricLevel.L2)
      .domains('interaction_quality', 'engagement')
      .description('用户与系统进行有意义对话的平均轮次，反映用户参与度和系统引导能力')
      .formula('所有会话的有效交互轮次总和 / 总会话数')
      .unit(MetricUnit.COUNT)
      .dataType(MetricDataType.FLOAT)
      .precision(1)
      .range(1, 20)
      .qualityThresholds({
        excellent: 3.0,
        good: 2.5,
        warning: 2.0,
        critical: 1.5
      })
      .format({
        displayType: 'number',
        thousandsSeparator: false,
        suffix: '轮',
        colorMapping: {
          excellent: '#10B981',
          good: '#3B82F6',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      })
      .governance({
        owner: '质量团队',
        reviewCycle: 'quarterly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('quality', 'interaction', 'engagement')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('quality_interaction_firstResponseHitRate')
      .name('firstResponseHitRate')
      .displayName('首次命中率')
      .category(MetricCategory.QUALITY)
      .level(MetricLevel.L2)
      .domains('response_quality', 'accuracy')
      .description('系统首次回复就满足用户需求的会话比例，衡量系统理解准确性')
      .formula('首次回复满足需求的会话数 / 总会话数')
      .unit(MetricUnit.PERCENTAGE)
      .dataType(MetricDataType.FLOAT)
      .precision(1)
      .range(0, 100)
      .qualityThresholds({
        excellent: 85,
        good: 70,
        warning: 55,
        critical: 40
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
        owner: '质量团队',
        reviewCycle: 'quarterly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('quality', 'response', 'accuracy')
      .build()
    );

    // L3 技术指标  
    this.registerMetric(new MetricDefinitionBuilder()
      .id('performance_system_avgResponseTime')
      .name('avgResponseTime')
      .displayName('平均响应时间')
      .category(MetricCategory.PERFORMANCE)
      .level(MetricLevel.L3)
      .domains('system_performance', 'user_experience')
      .description('系统响应用户请求的平均时间，直接影响用户体验')
      .formula('所有会话响应时间总和 / 总会话数')
      .unit(MetricUnit.MILLISECONDS)
      .dataType(MetricDataType.INTEGER)
      .precision(0)
      .range(0, 30000)
      .qualityThresholds({
        excellent: 2000,
        good: 3000,
        warning: 5000,
        critical: 10000
      })
      .format({
        displayType: 'duration',
        thousandsSeparator: false,
        suffix: 'ms',
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
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('performance', 'response_time', 'technical')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('performance_session_successRate')
      .name('sessionSuccessRate')
      .displayName('会话成功率')
      .category(MetricCategory.PERFORMANCE)
      .level(MetricLevel.L3)
      .domains('system_reliability', 'quality')
      .description('成功完成的会话占总会话数的比例')
      .formula('(成功会话数 / 总会话数) × 100')
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
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('performance', 'success_rate', 'technical')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('cost_token_totalCost')
      .name('totalCost')
      .displayName('总Token成本')
      .category(MetricCategory.COST)
      .level(MetricLevel.L3)
      .domains('cost_management', 'operations')
      .description('所有模型调用产生的总成本')
      .formula('所有模型调用成本总和')
      .unit(MetricUnit.CNY)
      .dataType(MetricDataType.FLOAT)
      .precision(2)
      .range(0, 1000000)
      .qualityThresholds({
        excellent: 1000,
        good: 5000,
        warning: 10000,
        critical: 50000
      })
      .format({
        displayType: 'currency',
        thousandsSeparator: true,
        prefix: '¥',
        colorMapping: {
          excellent: '#10B981',
          good: '#3B82F6',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      })
      .governance({
        owner: '财务团队',
        reviewCycle: 'monthly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('cost', 'token', 'financial')
      .build()
    );

    this.registerMetric(new MetricDefinitionBuilder()
      .id('cost_token_avgCostPerSession')
      .name('avgCostPerSession')
      .displayName('每会话平均成本')
      .category(MetricCategory.COST)
      .level(MetricLevel.L3)
      .domains('cost_efficiency', 'operations')
      .description('平均每个会话产生的Token成本')
      .formula('总Token成本 / 总会话数')
      .unit(MetricUnit.CNY)
      .dataType(MetricDataType.FLOAT)
      .precision(2)
      .range(0, 100)
      .qualityThresholds({
        excellent: 1.0,
        good: 2.0,
        warning: 5.0,
        critical: 10.0
      })
      .format({
        displayType: 'currency',
        thousandsSeparator: false,
        prefix: '¥',
        colorMapping: {
          excellent: '#10B981',
          good: '#3B82F6',
          warning: '#F59E0B',
          critical: '#EF4444'
        }
      })
      .governance({
        owner: '财务团队',
        reviewCycle: 'monthly',
        lastReviewed: '2024-08-25T00:00:00.000Z',
        approvalStatus: MetricStatus.APPROVED
      })
      .version('1.0.0')
      .tags('cost', 'efficiency', 'financial')
      .dependencies('cost_token_totalCost')
      .build()
    );

    // 更新索引
    this.rebuildIndexes();
  }

  /**
   * 注册新指标
   */
  registerMetric(metric: StandardMetricDefinition): void {
    this.registry.metrics.set(metric.id, metric);
    this.updateIndexes(metric);
    this.registry.lastUpdated = new Date().toISOString();
  }

  /**
   * 获取指标
   */
  getMetric(id: string): StandardMetricDefinition | undefined {
    return this.registry.metrics.get(id);
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): StandardMetricDefinition[] {
    return Array.from(this.registry.metrics.values());
  }

  /**
   * 按分类获取指标
   */
  getMetricsByCategory(category: MetricCategory): StandardMetricDefinition[] {
    const metricIds = this.registry.categories.get(category) || [];
    return metricIds.map(id => this.registry.metrics.get(id)!).filter(Boolean);
  }

  /**
   * 按层级获取指标
   */
  getMetricsByLevel(level: MetricLevel): StandardMetricDefinition[] {
    const metricIds = this.registry.levels.get(level) || [];
    return metricIds.map(id => this.registry.metrics.get(id)!).filter(Boolean);
  }

  /**
   * 按标签获取指标
   */
  getMetricsByTag(tag: string): StandardMetricDefinition[] {
    const metricIds = this.registry.tags.get(tag) || [];
    return metricIds.map(id => this.registry.metrics.get(id)!).filter(Boolean);
  }

  /**
   * 搜索指标
   */
  searchMetrics(criteria: MetricSearchCriteria): MetricSearchResult {
    let results = this.getAllMetrics();

    // 关键词搜索
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      results = results.filter(metric => 
        metric.name.toLowerCase().includes(query) ||
        metric.displayName.toLowerCase().includes(query) ||
        metric.description.toLowerCase().includes(query) ||
        metric.formula.toLowerCase().includes(query)
      );
    }

    // 分类筛选
    if (criteria.category) {
      results = results.filter(metric => metric.category === criteria.category);
    }

    // 层级筛选
    if (criteria.level) {
      results = results.filter(metric => metric.level === criteria.level);
    }

    // 业务域筛选
    if (criteria.domain) {
      results = results.filter(metric => 
        metric.domain.includes(criteria.domain!)
      );
    }

    // 标签筛选
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(metric => 
        criteria.tags!.some(tag => metric.tags.includes(tag))
      );
    }

    // 状态筛选
    if (criteria.status) {
      results = results.filter(metric => 
        metric.governance.approvalStatus === criteria.status
      );
    }

    // 负责人筛选
    if (criteria.owner) {
      results = results.filter(metric => 
        metric.governance.owner.includes(criteria.owner!)
      );
    }

    // 生成聚合信息
    const facets = {
      categories: this.calculateCategoryFacets(results),
      levels: this.calculateLevelFacets(results),
      tags: this.calculateTagFacets(results)
    };

    return {
      metrics: results,
      total: results.length,
      facets
    };
  }

  /**
   * 删除指标
   */
  removeMetric(id: string): boolean {
    const metric = this.registry.metrics.get(id);
    if (!metric) return false;

    this.registry.metrics.delete(id);
    this.removeFromIndexes(metric);
    this.registry.lastUpdated = new Date().toISOString();
    
    return true;
  }

  /**
   * 更新指标
   */
  updateMetric(id: string, updates: Partial<StandardMetricDefinition>): boolean {
    const existing = this.registry.metrics.get(id);
    if (!existing) return false;

    const updated = { ...existing, ...updates };
    this.registry.metrics.set(id, updated);
    this.rebuildIndexes(); // 重建索引以确保一致性
    this.registry.lastUpdated = new Date().toISOString();
    
    return true;
  }

  /**
   * 导出注册表
   */
  exportRegistry(): string {
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      metrics: Array.from(this.registry.metrics.values())
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入注册表
   */
  importRegistry(jsonData: string): { imported: number; errors: string[] } {
    let imported = 0;
    const errors: string[] = [];

    try {
      const data = JSON.parse(jsonData);
      
      if (!data.metrics || !Array.isArray(data.metrics)) {
        throw new Error('无效的注册表格式');
      }

      for (const metricData of data.metrics) {
        try {
          // 这里应该进行完整的验证
          this.registerMetric(metricData as StandardMetricDefinition);
          imported++;
        } catch (error) {
          errors.push(`导入指标 ${metricData.id || 'unknown'} 失败: ${error}`);
        }
      }
    } catch (error) {
      errors.push(`解析JSON数据失败: ${error}`);
    }

    return { imported, errors };
  }

  /**
   * 获取注册表统计信息
   */
  getStats() {
    const metrics = this.getAllMetrics();
    
    return {
      total: metrics.length,
      byCategory: Array.from(this.registry.categories.entries()).reduce((acc, [key, value]) => {
        acc[key] = value.length;
        return acc;
      }, {} as Record<string, number>),
      byLevel: Array.from(this.registry.levels.entries()).reduce((acc, [key, value]) => {
        acc[key] = value.length;
        return acc;
      }, {} as Record<string, number>),
      byStatus: metrics.reduce((acc, metric) => {
        const status = metric.governance.approvalStatus;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      lastUpdated: this.registry.lastUpdated
    };
  }

  /**
   * 更新索引
   */
  private updateIndexes(metric: StandardMetricDefinition) {
    // 分类索引
    if (!this.registry.categories.has(metric.category)) {
      this.registry.categories.set(metric.category, []);
    }
    this.registry.categories.get(metric.category)!.push(metric.id);

    // 层级索引
    if (!this.registry.levels.has(metric.level)) {
      this.registry.levels.set(metric.level, []);
    }
    this.registry.levels.get(metric.level)!.push(metric.id);

    // 标签索引
    for (const tag of metric.tags) {
      if (!this.registry.tags.has(tag)) {
        this.registry.tags.set(tag, []);
      }
      this.registry.tags.get(tag)!.push(metric.id);
    }
  }

  /**
   * 从索引中移除
   */
  private removeFromIndexes(metric: StandardMetricDefinition) {
    // 从分类索引中移除
    const categoryIds = this.registry.categories.get(metric.category);
    if (categoryIds) {
      const index = categoryIds.indexOf(metric.id);
      if (index > -1) categoryIds.splice(index, 1);
    }

    // 从层级索引中移除
    const levelIds = this.registry.levels.get(metric.level);
    if (levelIds) {
      const index = levelIds.indexOf(metric.id);
      if (index > -1) levelIds.splice(index, 1);
    }

    // 从标签索引中移除
    for (const tag of metric.tags) {
      const tagIds = this.registry.tags.get(tag);
      if (tagIds) {
        const index = tagIds.indexOf(metric.id);
        if (index > -1) tagIds.splice(index, 1);
      }
    }
  }

  /**
   * 重建所有索引
   */
  private rebuildIndexes() {
    this.registry.categories.clear();
    this.registry.levels.clear();
    this.registry.tags.clear();

    for (const metric of this.registry.metrics.values()) {
      this.updateIndexes(metric);
    }
  }

  /**
   * 计算分类聚合
   */
  private calculateCategoryFacets(metrics: StandardMetricDefinition[]): Record<MetricCategory, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric.category] = (acc[metric.category] || 0) + 1;
      return acc;
    }, {} as Record<MetricCategory, number>);
  }

  /**
   * 计算层级聚合
   */
  private calculateLevelFacets(metrics: StandardMetricDefinition[]): Record<MetricLevel, number> {
    return metrics.reduce((acc, metric) => {
      acc[metric.level] = (acc[metric.level] || 0) + 1;
      return acc;
    }, {} as Record<MetricLevel, number>);
  }

  /**
   * 计算标签聚合
   */
  private calculateTagFacets(metrics: StandardMetricDefinition[]): Record<string, number> {
    return metrics.reduce((acc, metric) => {
      for (const tag of metric.tags) {
        acc[tag] = (acc[tag] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }
}

/**
 * 导出单例实例
 */
export const metricRegistry = StandardMetricRegistry.getInstance();