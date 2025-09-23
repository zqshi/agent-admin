/**
 * Slot注入器服务
 * 负责业务场景检测和动态slot注入逻辑
 */

import type {
  EnhancedSlotDefinition,
  ScenarioDetectionResult,
  SlotInjectionConfig,
  SlotInjectionResult,
  DynamicInjectionContext
} from '../types';
import { slotRegistry } from './SlotRegistry';

export class SlotInjector {
  private scenarioKeywords: Map<string, string[]> = new Map();
  private injectionConfigs: Map<string, SlotInjectionConfig> = new Map();
  private activeInjections: Map<string, SlotInjectionResult> = new Map();
  private injectionHistory: SlotInjectionResult[] = [];

  constructor() {
    this.initializeScenarioKeywords();
  }

  // ============ 业务场景检测 ============

  /**
   * 检测当前输入的业务场景
   */
  async detectScenario(
    userInput: string,
    context?: DynamicInjectionContext
  ): Promise<ScenarioDetectionResult | null> {
    try {
      const scenarios = this.analyzeInput(userInput, context);

      if (scenarios.length === 0) {
        return null;
      }

      // 选择置信度最高的场景
      const bestScenario = scenarios.reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );

      // 基于场景推荐slots
      const recommendedSlots = await this.getRecommendedSlots(bestScenario, context);

      return {
        ...bestScenario,
        recommendedSlots,
        suggestedValues: await this.generateSuggestedValues(bestScenario, context)
      };

    } catch (error) {
      console.error('Failed to detect scenario:', error);
      return null;
    }
  }

  /**
   * 批量注入slots到prompt
   */
  async batchInjectSlots(
    slotIds: string[],
    context: DynamicInjectionContext
  ): Promise<SlotInjectionResult[]> {
    const results: SlotInjectionResult[] = [];

    for (const slotId of slotIds) {
      const result = await this.injectSlot(slotId, context);
      results.push(result);
    }

    return results;
  }

  /**
   * 注入单个slot
   */
  async injectSlot(
    slotId: string,
    context: DynamicInjectionContext
  ): Promise<SlotInjectionResult> {
    const startTime = Date.now();

    try {
      // 获取slot定义
      const slot = slotRegistry.getSlot(slotId);
      if (!slot) {
        throw new Error(`Slot not found: ${slotId}`);
      }

      // 获取注入配置
      const config = this.injectionConfigs.get(slotId);
      if (!config) {
        throw new Error(`Injection config not found for slot: ${slotId}`);
      }

      // 检查注入条件
      if (!this.checkInjectionConditions(config, context)) {
        return this.createFailureResult(
          slotId,
          'Injection conditions not met',
          startTime
        );
      }

      // 获取slot值
      let value = await this.resolveSlotValue(slot, context);

      // 应用数据转换
      if (config.transformation) {
        value = await this.applyTransformation(value, config.transformation);
      }

      // 缓存结果
      if (slot.caching?.enabled) {
        slotRegistry.setCachedSlotValue(
          slotId,
          value,
          slot.caching.ttl
        );
      }

      const result: SlotInjectionResult = {
        slotId,
        success: true,
        value,
        timing: Date.now() - startTime,
        source: slot.origin,
        metadata: {
          cached: false,
          transformed: !!config.transformation,
          fallbackUsed: false
        }
      };

      // 记录成功的注入
      this.recordInjection(result);

      return result;

    } catch (error) {
      console.error(`Failed to inject slot ${slotId}:`, error);

      // 尝试使用fallback
      const fallbackResult = await this.handleInjectionFailure(slotId, context, error);
      if (fallbackResult) {
        return fallbackResult;
      }

      return this.createFailureResult(
        slotId,
        error instanceof Error ? error.message : String(error),
        startTime
      );
    }
  }

  // ============ 注入配置管理 ============

  /**
   * 创建注入配置
   */
  createInjectionConfig(config: SlotInjectionConfig): void {
    this.injectionConfigs.set(config.slotId, config);
  }

  /**
   * 更新注入配置
   */
  updateInjectionConfig(
    slotId: string,
    updates: Partial<SlotInjectionConfig>
  ): void {
    const existing = this.injectionConfigs.get(slotId);
    if (existing) {
      this.injectionConfigs.set(slotId, { ...existing, ...updates });
    }
  }

  /**
   * 删除注入配置
   */
  deleteInjectionConfig(slotId: string): void {
    this.injectionConfigs.delete(slotId);
  }

  /**
   * 获取活跃的注入结果
   */
  getActiveInjections(): SlotInjectionResult[] {
    return Array.from(this.activeInjections.values());
  }

  /**
   * 清除注入历史
   */
  clearInjectionHistory(): void {
    this.injectionHistory = [];
    this.activeInjections.clear();
  }

  // ============ 私有方法 ============

  /**
   * 初始化场景关键词
   */
  private initializeScenarioKeywords(): void {
    this.scenarioKeywords.set('customer_service', [
      '客服', '咨询', '投诉', '建议', '反馈', '问题', '帮助', '支持'
    ]);

    this.scenarioKeywords.set('technical_support', [
      '技术', '故障', '错误', 'bug', '修复', '调试', '配置', '安装'
    ]);

    this.scenarioKeywords.set('sales', [
      '销售', '购买', '价格', '优惠', '促销', '产品', '方案', '报价'
    ]);

    this.scenarioKeywords.set('hr', [
      '人事', '招聘', '入职', '离职', '考勤', '薪资', '培训', '绩效'
    ]);

    this.scenarioKeywords.set('finance', [
      '财务', '报销', '发票', '付款', '收款', '预算', '成本', '利润'
    ]);
  }

  /**
   * 分析用户输入识别场景
   */
  private analyzeInput(
    userInput: string,
    context?: DynamicInjectionContext
  ): ScenarioDetectionResult[] {
    const results: ScenarioDetectionResult[] = [];

    for (const [scenarioId, keywords] of this.scenarioKeywords) {
      const matchedKeywords = keywords.filter(keyword =>
        userInput.toLowerCase().includes(keyword)
      );

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(
          matchedKeywords.length / keywords.length + 0.3,
          1.0
        );

        results.push({
          scenarioId,
          name: this.getScenarioName(scenarioId),
          confidence,
          matchedKeywords,
          contextFactors: this.analyzeContextFactors(scenarioId, context),
          recommendedSlots: [] // 将在后续填充
        });
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 获取场景名称
   */
  private getScenarioName(scenarioId: string): string {
    const names: Record<string, string> = {
      'customer_service': '客户服务',
      'technical_support': '技术支持',
      'sales': '销售咨询',
      'hr': '人力资源',
      'finance': '财务管理'
    };
    return names[scenarioId] || scenarioId;
  }

  /**
   * 分析上下文因素
   */
  private analyzeContextFactors(
    scenarioId: string,
    context?: DynamicInjectionContext
  ): string[] {
    const factors: string[] = [];

    if (!context) return factors;

    // 分析时间因素
    const hour = new Date(context.timestamp).getHours();
    if (hour >= 9 && hour <= 17) {
      factors.push('工作时间');
    } else {
      factors.push('非工作时间');
    }

    // 分析对话历史
    if (context.conversationHistory.length > 0) {
      factors.push('持续对话');
    } else {
      factors.push('首次对话');
    }

    // 分析用户身份
    if (context.userId) {
      factors.push('已识别用户');
    } else {
      factors.push('匿名用户');
    }

    return factors;
  }

  /**
   * 获取推荐的slots
   */
  private async getRecommendedSlots(
    scenario: ScenarioDetectionResult,
    context?: DynamicInjectionContext
  ): Promise<Array<{ slotId: string; priority: number; reason: string }>> {
    const recommended: Array<{ slotId: string; priority: number; reason: string }> = [];

    // 获取所有slots
    const allSlots = slotRegistry.getAllSlots();

    for (const slot of allSlots) {
      if (slot.scenarios) {
        // 检查关键词匹配
        const keywordMatch = slot.scenarios.keywords.some(keyword =>
          scenario.matchedKeywords.includes(keyword)
        );

        // 检查上下文匹配
        const contextMatch = slot.scenarios.contexts.some(ctx =>
          scenario.contextFactors.includes(ctx)
        );

        if (keywordMatch || contextMatch) {
          recommended.push({
            slotId: slot.id,
            priority: slot.scenarios.priority,
            reason: keywordMatch ? '关键词匹配' : '上下文匹配'
          });
        }
      }
    }

    return recommended.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 生成建议的slot值
   */
  private async generateSuggestedValues(
    scenario: ScenarioDetectionResult,
    context?: DynamicInjectionContext
  ): Promise<Record<string, any>> {
    const suggestions: Record<string, any> = {};

    // 基于场景生成通用建议值
    switch (scenario.scenarioId) {
      case 'customer_service':
        suggestions.tone = '友好专业';
        suggestions.response_length = '适中';
        suggestions.priority = '普通';
        break;

      case 'technical_support':
        suggestions.tone = '专业详细';
        suggestions.response_length = '详细';
        suggestions.technical_level = '中级';
        break;

      case 'sales':
        suggestions.tone = '热情积极';
        suggestions.response_length = '适中';
        suggestions.focus = '产品价值';
        break;
    }

    // 基于上下文调整建议值
    if (context) {
      const hour = new Date(context.timestamp).getHours();
      if (hour < 9 || hour > 17) {
        suggestions.urgency = '低';
        suggestions.response_time = '延后';
      }
    }

    return suggestions;
  }

  /**
   * 检查注入条件
   */
  private checkInjectionConditions(
    config: SlotInjectionConfig,
    context: DynamicInjectionContext
  ): boolean {
    if (!config.conditions) return true;

    const { keywords, contexts, userBehavior, customConditions } = config.conditions;

    // 检查关键词条件
    if (keywords && keywords.length > 0) {
      const hasKeyword = keywords.some(keyword =>
        context.userInput.toLowerCase().includes(keyword.toLowerCase())
      );
      if (!hasKeyword) return false;
    }

    // 检查上下文条件
    if (contexts && contexts.length > 0) {
      // 这里可以根据实际需求实现上下文检查逻辑
    }

    // 检查用户行为条件
    if (userBehavior && userBehavior.length > 0) {
      // 这里可以根据实际需求实现用户行为检查逻辑
    }

    // 检查自定义条件
    if (customConditions && customConditions.length > 0) {
      // 这里可以实现自定义条件检查逻辑
    }

    return true;
  }

  /**
   * 解析slot值
   */
  private async resolveSlotValue(
    slot: EnhancedSlotDefinition,
    context: DynamicInjectionContext
  ): Promise<any> {
    // 先检查缓存
    if (slot.caching?.enabled) {
      const cached = slotRegistry.getCachedSlotValue(slot.id);
      if (cached !== null) {
        return cached;
      }
    }

    // 根据数据源类型解析值
    if (slot.dataSource) {
      return await this.resolveFromDataSource(slot.dataSource, context);
    }

    // 使用默认值
    if (slot.defaultValue !== undefined) {
      return slot.defaultValue;
    }

    // 基于上下文动态生成值
    return this.generateDynamicValue(slot, context);
  }

  /**
   * 从数据源解析值
   */
  private async resolveFromDataSource(
    dataSource: EnhancedSlotDefinition['dataSource'],
    context: DynamicInjectionContext
  ): Promise<any> {
    if (!dataSource) return null;

    switch (dataSource.type) {
      case 'static':
        return dataSource.config.value;

      case 'api':
        return await this.fetchFromAPI(dataSource, context);

      case 'computed':
        return this.computeValue(dataSource.config, context);

      case 'external':
        return await this.fetchFromExternal(dataSource, context);

      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  }

  /**
   * 从API获取数据
   */
  private async fetchFromAPI(
    dataSource: EnhancedSlotDefinition['dataSource'],
    context: DynamicInjectionContext
  ): Promise<any> {
    if (!dataSource?.endpoint) {
      throw new Error('API endpoint not configured');
    }

    const response = await fetch(dataSource.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...dataSource.config.headers
      },
      body: JSON.stringify({
        context,
        params: dataSource.config
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * 计算值
   */
  private computeValue(
    config: Record<string, any>,
    context: DynamicInjectionContext
  ): any {
    // 实现基本的计算逻辑
    if (config.formula) {
      // 这里可以实现更复杂的计算逻辑
      return config.defaultResult || null;
    }
    return config.value;
  }

  /**
   * 从外部系统获取数据
   */
  private async fetchFromExternal(
    dataSource: EnhancedSlotDefinition['dataSource'],
    context: DynamicInjectionContext
  ): Promise<any> {
    // 实现外部系统集成逻辑
    // 这里是一个简化的实现
    return dataSource?.config.fallbackValue || null;
  }

  /**
   * 生成动态值
   */
  private generateDynamicValue(
    slot: EnhancedSlotDefinition,
    context: DynamicInjectionContext
  ): any {
    // 基于slot类型和上下文生成动态值
    switch (slot.type) {
      case 'text':
        return this.generateTextValue(slot, context);
      case 'number':
        return Math.floor(Math.random() * 100);
      case 'boolean':
        return Math.random() > 0.5;
      default:
        return slot.defaultValue || null;
    }
  }

  /**
   * 生成文本值
   */
  private generateTextValue(
    slot: EnhancedSlotDefinition,
    context: DynamicInjectionContext
  ): string {
    // 基于上下文生成合适的文本值
    if (slot.name.includes('name') || slot.name.includes('姓名')) {
      return context.userId || '用户';
    }

    if (slot.name.includes('time') || slot.name.includes('时间')) {
      return new Date(context.timestamp).toLocaleString('zh-CN');
    }

    return slot.defaultValue || '';
  }

  /**
   * 应用数据转换
   */
  private async applyTransformation(
    value: any,
    transformation: SlotInjectionConfig['transformation']
  ): Promise<any> {
    if (!transformation) return value;

    switch (transformation.type) {
      case 'format':
        return this.formatValue(value, transformation.rules);
      case 'filter':
        return this.filterValue(value, transformation.rules);
      case 'map':
        return this.mapValue(value, transformation.rules);
      default:
        return value;
    }
  }

  /**
   * 格式化值
   */
  private formatValue(value: any, rules: any[]): any {
    // 实现格式化逻辑
    return value;
  }

  /**
   * 过滤值
   */
  private filterValue(value: any, rules: any[]): any {
    // 实现过滤逻辑
    return value;
  }

  /**
   * 映射值
   */
  private mapValue(value: any, rules: any[]): any {
    // 实现映射逻辑
    return value;
  }

  /**
   * 处理注入失败
   */
  private async handleInjectionFailure(
    slotId: string,
    context: DynamicInjectionContext,
    error: any
  ): Promise<SlotInjectionResult | null> {
    const config = this.injectionConfigs.get(slotId);

    if (config?.fallback) {
      try {
        let fallbackValue = config.fallback.value;

        // 如果有fallback slot，尝试注入
        if (config.fallback.slotId) {
          const fallbackResult = await this.injectSlot(config.fallback.slotId, context);
          if (fallbackResult.success) {
            fallbackValue = fallbackResult.value;
          }
        }

        return {
          slotId,
          success: true,
          value: fallbackValue,
          timing: 0,
          source: 'fallback',
          metadata: {
            cached: false,
            transformed: false,
            fallbackUsed: true
          }
        };
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    return null;
  }

  /**
   * 创建失败结果
   */
  private createFailureResult(
    slotId: string,
    error: string,
    startTime: number
  ): SlotInjectionResult {
    return {
      slotId,
      success: false,
      timing: Date.now() - startTime,
      source: 'error',
      error,
      metadata: {
        cached: false,
        transformed: false,
        fallbackUsed: false
      }
    };
  }

  /**
   * 记录注入结果
   */
  private recordInjection(result: SlotInjectionResult): void {
    this.activeInjections.set(result.slotId, result);
    this.injectionHistory.push(result);

    // 保持历史记录数量在合理范围内
    if (this.injectionHistory.length > 1000) {
      this.injectionHistory = this.injectionHistory.slice(-500);
    }
  }
}

// 单例实例
export const slotInjector = new SlotInjector();