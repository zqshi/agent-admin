/**
 * Slot解析器服务
 * 负责解析和获取各种类型的Slot值
 */

import type {
  SlotDefinition,
  DataSource,
  InjectionStrategy,
  SlotResolverOptions
} from '../types';

export class SlotResolver {
  private cache: Map<string, { value: any; timestamp: number; ttl: number }>;
  private apiCache: Map<string, Promise<any>>;

  constructor() {
    this.cache = new Map();
    this.apiCache = new Map();
  }

  /**
   * 解析所有Slots的值
   */
  async resolveSlots(
    slots: SlotDefinition[],
    userValues: Record<string, any>,
    strategy: InjectionStrategy,
    options: SlotResolverOptions = {
      timeout: 5000,
      retryCount: 3,
      cacheEnabled: true,
      parallelExecution: true
    }
  ): Promise<Record<string, any>> {
    const result: Record<string, any> = {};

    // 根据依赖关系排序
    const sortedSlots = this.sortSlotsByDependencies(slots);

    if (options.parallelExecution) {
      // 并行解析独立的Slots
      const independentSlots = sortedSlots.filter(slot => !slot.dependencies || slot.dependencies.length === 0);
      const dependentSlots = sortedSlots.filter(slot => slot.dependencies && slot.dependencies.length > 0);

      // 并行处理独立Slots
      const independentPromises = independentSlots.map(slot =>
        this.resolveSlot(slot, userValues, result, options)
          .then(value => ({ slotId: slot.id, value }))
          .catch(error => ({ slotId: slot.id, error }))
      );

      const independentResults = await Promise.all(independentPromises);

      // 处理独立Slots的结果
      independentResults.forEach((resolveResult) => {
        if ('error' in resolveResult) {
          console.error(`解析Slot ${resolveResult.slotId} 失败:`, resolveResult.error);
          const slot = slots.find(s => s.id === resolveResult.slotId);
          if (slot) {
            result[resolveResult.slotId] = this.handleSlotError(slot, resolveResult.error);
          }
        } else {
          result[resolveResult.slotId] = resolveResult.value;
        }
      });

      // 串行处理依赖Slots
      for (const slot of dependentSlots) {
        try {
          result[slot.id] = await this.resolveSlot(slot, userValues, result, options);
        } catch (error) {
          console.error(`解析依赖Slot ${slot.id} 失败:`, error);
          result[slot.id] = this.handleSlotError(slot, error);
        }
      }
    } else {
      // 串行解析所有Slots
      for (const slot of sortedSlots) {
        try {
          result[slot.id] = await this.resolveSlot(slot, userValues, result, options);
        } catch (error) {
          console.error(`解析Slot ${slot.id} 失败:`, error);
          result[slot.id] = this.handleSlotError(slot, error);
        }
      }
    }

    return result;
  }

  /**
   * 解析单个Slot的值
   */
  private async resolveSlot(
    slot: SlotDefinition,
    userValues: Record<string, any>,
    resolvedValues: Record<string, any>,
    options: SlotResolverOptions
  ): Promise<any> {
    // 1. 检查缓存
    if (options.cacheEnabled && slot.caching?.enabled) {
      const cached = this.getCachedValue(slot.caching.key);
      if (cached !== null) {
        return cached;
      }
    }

    let value: any;

    // 2. 根据Slot类型解析值
    switch (slot.type) {
      case 'user':
        value = await this.resolveUserSlot(slot, userValues);
        break;
      case 'system':
        value = await this.resolveSystemSlot(slot);
        break;
      case 'api':
        value = await this.resolveApiSlot(slot, options);
        break;
      case 'computed':
        value = await this.resolveComputedSlot(slot, resolvedValues);
        break;
      case 'conditional':
        value = await this.resolveConditionalSlot(slot, userValues, resolvedValues);
        break;
      default:
        throw new Error(`不支持的Slot类型: ${slot.type}`);
    }

    // 3. 应用数据转换
    if (slot.transformation) {
      value = this.applyTransformation(value, slot.transformation);
    }

    // 4. 验证值
    if (slot.validation) {
      this.validateSlotValue(slot, value);
    }

    // 5. 缓存结果
    if (options.cacheEnabled && slot.caching?.enabled) {
      this.setCachedValue(slot.caching.key, value, slot.caching.ttl);
    }

    return value;
  }

  /**
   * 解析用户类型Slot
   */
  private async resolveUserSlot(slot: SlotDefinition, userValues: Record<string, any>): Promise<any> {
    const value = userValues[slot.id];

    if (value !== undefined && value !== null) {
      return value;
    }

    if (slot.defaultValue !== undefined) {
      return slot.defaultValue;
    }

    if (slot.required) {
      throw new Error(`必填Slot "${slot.name}" 缺少值`);
    }

    return '';
  }

  /**
   * 解析系统类型Slot
   */
  private async resolveSystemSlot(slot: SlotDefinition): Promise<any> {
    // 系统预定义的值
    const systemValues: Record<string, any> = {
      'current_time': new Date().toLocaleString('zh-CN'),
      'current_date': new Date().toLocaleDateString('zh-CN'),
      'current_timestamp': Date.now(),
      'current_year': new Date().getFullYear(),
      'current_month': new Date().getMonth() + 1,
      'current_day': new Date().getDate(),
      'random_id': Math.random().toString(36).substring(2, 15),
      'uuid': crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36),
      'user_agent': navigator.userAgent,
      'platform': navigator.platform,
      'language': navigator.language
    };

    const value = systemValues[slot.id];
    if (value !== undefined) {
      return value;
    }

    if (slot.defaultValue !== undefined) {
      return slot.defaultValue;
    }

    throw new Error(`未知的系统Slot: ${slot.id}`);
  }

  /**
   * 解析API类型Slot
   */
  private async resolveApiSlot(slot: SlotDefinition, options: SlotResolverOptions): Promise<any> {
    if (!slot.dataSource) {
      throw new Error(`API Slot "${slot.name}" 缺少数据源配置`);
    }

    const cacheKey = `api_${slot.id}_${JSON.stringify(slot.dataSource)}`;

    // 检查是否有正在进行的API请求
    if (this.apiCache.has(cacheKey)) {
      return await this.apiCache.get(cacheKey)!;
    }

    const apiPromise = this.fetchApiData(slot.dataSource, options);
    this.apiCache.set(cacheKey, apiPromise);

    try {
      const result = await apiPromise;
      this.apiCache.delete(cacheKey);
      return result;
    } catch (error) {
      this.apiCache.delete(cacheKey);
      throw error;
    }
  }

  /**
   * 获取API数据
   */
  private async fetchApiData(dataSource: DataSource, options: SlotResolverOptions): Promise<any> {
    const { endpoint, method = 'GET', headers = {}, params = {} } = dataSource;

    if (!endpoint) {
      throw new Error('API数据源缺少endpoint配置');
    }

    // 构建URL
    let url = endpoint;
    if (method === 'GET' && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }

    // 设置请求选项
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: AbortSignal.timeout(options.timeout)
    };

    if (method !== 'GET' && Object.keys(params).length > 0) {
      fetchOptions.body = JSON.stringify(params);
    }

    // 执行请求（带重试机制）
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= options.retryCount; attempt++) {
      try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
          throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return this.extractDataFromResponse(data, dataSource.config);
      } catch (error) {
        lastError = error as Error;
        if (attempt < options.retryCount) {
          // 指数退避重试
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('API请求失败');
  }

  /**
   * 从API响应中提取数据
   */
  private extractDataFromResponse(data: any, config: Record<string, any>): any {
    if (config.path) {
      // 使用点记法路径提取数据
      return this.getValueByPath(data, config.path);
    }

    if (config.transform) {
      // 应用自定义转换函数
      return this.applyCustomTransform(data, config.transform);
    }

    return data;
  }

  /**
   * 通过路径获取对象值
   */
  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * 应用自定义转换
   */
  private applyCustomTransform(data: any, transform: string): any {
    // 简化的转换实现，实际应用中可能需要更安全的沙箱执行
    try {
      const func = new Function('data', `return ${transform}`);
      return func(data);
    } catch (error) {
      console.error('转换函数执行失败:', error);
      return data;
    }
  }

  /**
   * 解析计算类型Slot
   */
  private async resolveComputedSlot(
    slot: SlotDefinition,
    resolvedValues: Record<string, any>
  ): Promise<any> {
    if (!slot.dataSource || slot.dataSource.type !== 'computed') {
      throw new Error(`计算Slot "${slot.name}" 缺少计算配置`);
    }

    const { config } = slot.dataSource;
    const expression = config.expression;

    if (!expression) {
      throw new Error(`计算Slot "${slot.name}" 缺少表达式`);
    }

    try {
      // 简化的表达式计算（实际应用中应使用更安全的表达式引擎）
      return this.evaluateExpression(expression, resolvedValues);
    } catch (error) {
      throw new Error(`计算Slot "${slot.name}" 表达式执行失败: ${error}`);
    }
  }

  /**
   * 计算表达式
   */
  private evaluateExpression(expression: string, context: Record<string, any>): any {
    // 替换变量引用
    let processedExpression = expression;
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      const value = JSON.stringify(context[key]);
      processedExpression = processedExpression.replace(regex, value);
    });

    // 简单的数学表达式计算
    try {
      // 只允许安全的操作
      const safeExpression = processedExpression.replace(/[^0-9+\-*/.()"\s,]/g, '');
      return Function(`"use strict"; return (${safeExpression})`)();
    } catch (error) {
      throw new Error(`表达式计算失败: ${error}`);
    }
  }

  /**
   * 解析条件类型Slot
   */
  private async resolveConditionalSlot(
    slot: SlotDefinition,
    userValues: Record<string, any>,
    resolvedValues: Record<string, any>
  ): Promise<any> {
    if (!slot.dataSource || slot.dataSource.type !== 'computed') {
      throw new Error(`条件Slot "${slot.name}" 缺少条件配置`);
    }

    const { config } = slot.dataSource;
    const conditions = config.conditions || [];

    // 评估条件
    for (const condition of conditions) {
      if (this.evaluateCondition(condition, { ...userValues, ...resolvedValues })) {
        return condition.value;
      }
    }

    // 返回默认值
    return slot.defaultValue || '';
  }

  /**
   * 评估条件
   */
  private evaluateCondition(condition: any, context: Record<string, any>): boolean {
    const { field, operator, value } = condition;
    const fieldValue = context[field];

    switch (operator) {
      case 'eq':
        return fieldValue === value;
      case 'ne':
        return fieldValue !== value;
      case 'gt':
        return fieldValue > value;
      case 'lt':
        return fieldValue < value;
      case 'gte':
        return fieldValue >= value;
      case 'lte':
        return fieldValue <= value;
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue);
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(value);
      case 'startsWith':
        return typeof fieldValue === 'string' && fieldValue.startsWith(value);
      case 'endsWith':
        return typeof fieldValue === 'string' && fieldValue.endsWith(value);
      default:
        return false;
    }
  }

  /**
   * 应用数据转换
   */
  private applyTransformation(value: any, transformation: any): any {
    // 简化的转换实现
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
    let result = value;

    rules.forEach(rule => {
      switch (rule.type) {
        case 'string':
          result = String(result);
          break;
        case 'number':
          result = Number(result);
          break;
        case 'date':
          result = new Date(result).toLocaleDateString('zh-CN');
          break;
        case 'uppercase':
          result = String(result).toUpperCase();
          break;
        case 'lowercase':
          result = String(result).toLowerCase();
          break;
        case 'trim':
          result = String(result).trim();
          break;
        default:
          break;
      }
    });

    return result;
  }

  /**
   * 过滤值
   */
  private filterValue(value: any, rules: any[]): any {
    // TODO: 实现过滤逻辑
    return value;
  }

  /**
   * 映射值
   */
  private mapValue(value: any, rules: any[]): any {
    // TODO: 实现映射逻辑
    return value;
  }

  /**
   * 验证Slot值
   */
  private validateSlotValue(slot: SlotDefinition, value: any): void {
    if (!slot.validation) return;

    slot.validation.forEach(rule => {
      let isValid = true;

      switch (rule.type) {
        case 'required':
          isValid = value !== undefined && value !== null && value !== '';
          break;
        case 'type':
          isValid = typeof value === rule.value;
          break;
        case 'length':
          isValid = typeof value === 'string' && value.length <= rule.value;
          break;
        case 'pattern':
          isValid = typeof value === 'string' && new RegExp(rule.value).test(value);
          break;
        case 'range':
          isValid = typeof value === 'number' && value >= rule.value.min && value <= rule.value.max;
          break;
        case 'custom':
          isValid = rule.validator ? rule.validator(value) : true;
          break;
        default:
          break;
      }

      if (!isValid) {
        throw new Error(`Slot "${slot.name}" 验证失败: ${rule.message}`);
      }
    });
  }

  /**
   * 处理Slot错误
   */
  private handleSlotError(slot: SlotDefinition, error: any): any {
    switch (slot.errorHandling.strategy) {
      case 'fallback':
        return slot.errorHandling.fallbackValue || slot.defaultValue || '';
      case 'retry':
        // 重试逻辑已在上层处理
        return slot.defaultValue || '';
      case 'alert':
        console.error(`Slot ${slot.name} 错误:`, error);
        return slot.defaultValue || '';
      case 'skip':
        return undefined;
      default:
        throw error;
    }
  }

  /**
   * 根据依赖关系排序Slots
   */
  private sortSlotsByDependencies(slots: SlotDefinition[]): SlotDefinition[] {
    const sorted: SlotDefinition[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (slot: SlotDefinition) => {
      if (visiting.has(slot.id)) {
        throw new Error(`检测到循环依赖: ${slot.id}`);
      }

      if (visited.has(slot.id)) {
        return;
      }

      visiting.add(slot.id);

      // 先处理依赖
      if (slot.dependencies) {
        slot.dependencies.forEach(depId => {
          const depSlot = slots.find(s => s.id === depId);
          if (depSlot) {
            visit(depSlot);
          }
        });
      }

      visiting.delete(slot.id);
      visited.add(slot.id);
      sorted.push(slot);
    };

    slots.forEach(slot => {
      if (!visited.has(slot.id)) {
        visit(slot);
      }
    });

    return sorted;
  }

  /**
   * 缓存相关方法
   */
  private getCachedValue(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      return cached.value;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedValue(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear();
    this.apiCache.clear();
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= cached.ttl * 1000) {
        this.cache.delete(key);
      }
    }
  }
}