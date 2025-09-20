/**
 * Prompt编译器服务
 * 负责将模板和Slot值编译成最终的Prompt
 */

import type {
  PromptTemplate,
  SlotDefinition,
  InjectionStrategy,
  CompressionStrategy,
  PreviewResult,
  PerformanceMetrics,
  OptimizationSuggestion,
  Issue,
  PromptCompilerOptions
} from '../types';
import { SlotResolver } from './slotResolver';
import { CompressionEngine } from './compressionEngine';

export class PromptCompiler {
  private slotResolver: SlotResolver;
  private compressionEngine: CompressionEngine;
  private compilationCache: Map<string, { result: string; timestamp: number }>;

  constructor() {
    this.slotResolver = new SlotResolver();
    this.compressionEngine = new CompressionEngine();
    this.compilationCache = new Map();
  }

  /**
   * 编译Prompt模板
   */
  async compile(
    template: PromptTemplate,
    slotValues: Record<string, any>,
    injectionStrategy: InjectionStrategy,
    compressionStrategy?: CompressionStrategy,
    options: PromptCompilerOptions = {
      strictMode: true,
      validateSlots: true,
      optimizeOutput: true,
      includeDebugInfo: false
    }
  ): Promise<PreviewResult> {
    const startTime = performance.now();

    try {
      // 1. 验证输入
      if (options.validateSlots) {
        this.validateSlots(template, slotValues);
      }

      // 2. 解析Slot值
      const resolvedSlots = await this.slotResolver.resolveSlots(
        template.slots,
        slotValues,
        injectionStrategy
      );

      // 3. 注入Slot值
      let compiledPrompt = await this.injectSlots(
        template.basePrompt,
        template.slots,
        resolvedSlots,
        injectionStrategy
      );

      // 4. 应用压缩（如果配置）
      let compressionResult = null;
      if (compressionStrategy) {
        compressionResult = await this.compressionEngine.compress(
          compiledPrompt,
          compressionStrategy
        );
        compiledPrompt = compressionResult.compressedText;
      }

      // 5. 计算性能指标
      const metrics = this.calculateMetrics(
        compiledPrompt,
        compressionResult,
        performance.now() - startTime
      );

      // 6. 生成优化建议
      const suggestions = this.generateOptimizationSuggestions(
        template,
        compiledPrompt,
        metrics,
        compressionResult
      );

      // 7. 检查问题
      const issues = this.detectIssues(
        template,
        compiledPrompt,
        resolvedSlots,
        options
      );

      // 8. 缓存结果
      if (options.optimizeOutput) {
        this.cacheResult(template.id, compiledPrompt, slotValues);
      }

      return {
        compiledPrompt,
        tokenCount: this.estimateTokenCount(compiledPrompt),
        estimatedCost: this.estimateCost(compiledPrompt),
        estimatedResponseTime: this.estimateResponseTime(compiledPrompt),
        qualityScore: this.calculateQualityScore(compiledPrompt, template),
        metrics,
        suggestions,
        issues
      };
    } catch (error) {
      throw new Error(`Prompt编译失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证Slot配置
   */
  private validateSlots(template: PromptTemplate, slotValues: Record<string, any>): void {
    const errors: string[] = [];

    // 检查必填Slot
    template.slots.forEach(slot => {
      if (slot.required) {
        const value = slotValues[slot.id];
        if (value === undefined || value === null || value === '') {
          errors.push(`必填Slot "${slot.name}" 缺少值`);
        }
      }

      // 验证Slot值类型和规则
      if (slot.validation && slotValues[slot.id] !== undefined) {
        slot.validation.forEach(rule => {
          const value = slotValues[slot.id];
          if (!this.validateSlotValue(value, rule)) {
            errors.push(`Slot "${slot.name}" 验证失败: ${rule.message}`);
          }
        });
      }
    });

    if (errors.length > 0) {
      throw new Error(`Slot验证失败:\n${errors.join('\n')}`);
    }
  }

  /**
   * 验证单个Slot值
   */
  private validateSlotValue(value: any, rule: any): boolean {
    switch (rule.type) {
      case 'required':
        return value !== undefined && value !== null && value !== '';
      case 'type':
        return typeof value === rule.value;
      case 'length':
        return typeof value === 'string' && value.length <= rule.value;
      case 'pattern':
        return typeof value === 'string' && new RegExp(rule.value).test(value);
      case 'range':
        return typeof value === 'number' && value >= rule.value.min && value <= rule.value.max;
      case 'custom':
        return rule.validator ? rule.validator(value) : true;
      default:
        return true;
    }
  }

  /**
   * 注入Slot值到模板
   */
  private async injectSlots(
    basePrompt: string,
    slots: SlotDefinition[],
    resolvedValues: Record<string, any>,
    strategy: InjectionStrategy
  ): Promise<string> {
    let result = basePrompt;

    // 根据注入策略排序Slots
    const orderedSlots = this.orderSlotsByStrategy(slots, strategy);

    // 逐个注入Slot值
    for (const slot of orderedSlots) {
      const value = resolvedValues[slot.id];
      if (value !== undefined) {
        const placeholder = `{{${slot.id}}}`;
        const regex = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        // 应用数据转换（如果配置）
        const transformedValue = slot.transformation
          ? this.applyTransformation(value, slot.transformation)
          : value;

        result = result.replace(regex, String(transformedValue));
      }
    }

    // 检查是否还有未替换的占位符
    const remainingPlaceholders = result.match(/{{[^}]+}}/g);
    if (remainingPlaceholders) {
      console.warn('发现未替换的占位符:', remainingPlaceholders);
    }

    return result;
  }

  /**
   * 根据注入策略对Slot排序
   */
  private orderSlotsByStrategy(
    slots: SlotDefinition[],
    strategy: InjectionStrategy
  ): SlotDefinition[] {
    const orderMap = new Map(strategy.order.map(o => [o.slotId, o.priority]));

    return [...slots].sort((a, b) => {
      const priorityA = orderMap.get(a.id) ?? 999;
      const priorityB = orderMap.get(b.id) ?? 999;
      return priorityA - priorityB;
    });
  }

  /**
   * 应用数据转换
   */
  private applyTransformation(value: any, transformation: any): any {
    switch (transformation.type) {
      case 'format':
        return this.formatValue(value, transformation.rules);
      case 'filter':
        return this.filterValue(value, transformation.rules);
      case 'aggregate':
        return this.aggregateValue(value, transformation.rules);
      case 'map':
        return this.mapValue(value, transformation.rules);
      default:
        return value;
    }
  }

  /**
   * 格式化值
   */
  private formatValue(value: any, rules: any[]): string {
    let result = String(value);

    rules.forEach(rule => {
      switch (rule.type) {
        case 'uppercase':
          result = result.toUpperCase();
          break;
        case 'lowercase':
          result = result.toLowerCase();
          break;
        case 'trim':
          result = result.trim();
          break;
        case 'replace':
          result = result.replace(new RegExp(rule.pattern, 'g'), rule.replacement);
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
   * 聚合值
   */
  private aggregateValue(value: any, rules: any[]): any {
    // TODO: 实现聚合逻辑
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
   * 计算性能指标
   */
  private calculateMetrics(
    compiledPrompt: string,
    compressionResult: any,
    compilationTime: number
  ): PerformanceMetrics {
    const tokenCount = this.estimateTokenCount(compiledPrompt);
    const cost = this.estimateCost(compiledPrompt);

    return {
      tokenUsage: {
        prompt: tokenCount,
        completion: 0,
        total: tokenCount,
        percentage: (tokenCount / 4000) * 100
      },
      cost: {
        input: cost,
        output: 0,
        total: cost,
        currency: 'USD'
      },
      time: {
        compilation: compilationTime,
        injection: compilationTime * 0.6,
        compression: compressionResult ? compressionResult.metrics?.processingTime || 0 : 0,
        total: compilationTime + (compressionResult?.metrics?.processingTime || 0)
      },
      quality: {
        clarity: this.assessClarity(compiledPrompt),
        relevance: this.assessRelevance(compiledPrompt),
        completeness: this.assessCompleteness(compiledPrompt),
        overall: 0 // 将在下面计算
      }
    };
  }

  /**
   * 估算Token数量
   */
  private estimateTokenCount(text: string): number {
    // 简化的Token估算：平均每4个字符1个Token
    // 实际应用中应使用更精确的Token计算器
    return Math.ceil(text.length / 4);
  }

  /**
   * 估算成本
   */
  private estimateCost(text: string): number {
    const tokenCount = this.estimateTokenCount(text);
    // 假设每1000个Token成本为$0.002
    return (tokenCount / 1000) * 0.002;
  }

  /**
   * 估算响应时间
   */
  private estimateResponseTime(text: string): number {
    const tokenCount = this.estimateTokenCount(text);
    // 基础延迟 + Token处理时间
    return 800 + (tokenCount * 2) + Math.random() * 500;
  }

  /**
   * 计算质量分数
   */
  private calculateQualityScore(compiledPrompt: string, template: PromptTemplate): number {
    let score = 0.5; // 基础分数

    // 长度合理性
    if (compiledPrompt.length > 100 && compiledPrompt.length < 2000) {
      score += 0.2;
    }

    // 包含关键指令词
    const instructionWords = ['请', '你需要', '要求', '注意', '确保'];
    if (instructionWords.some(word => compiledPrompt.includes(word))) {
      score += 0.1;
    }

    // 结构清晰
    if (compiledPrompt.includes('\n') || compiledPrompt.includes('：')) {
      score += 0.1;
    }

    // 所有占位符都被替换
    if (!compiledPrompt.includes('{{') && !compiledPrompt.includes('}}')) {
      score += 0.1;
    }

    return Math.min(score, 1.0);
  }

  /**
   * 评估清晰度
   */
  private assessClarity(text: string): number {
    // 简化的清晰度评估
    let score = 0.5;

    // 避免过长的句子
    const sentences = text.split(/[。！？.!?]/).filter(s => s.trim());
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length;
    if (avgSentenceLength < 50) score += 0.2;

    // 使用简单词汇
    const complexWords = text.match(/[复杂|困难|艰深|晦涩]/g);
    if (!complexWords || complexWords.length < 3) score += 0.2;

    return Math.min(score + 0.1, 1.0);
  }

  /**
   * 评估相关性
   */
  private assessRelevance(text: string): number {
    // 简化的相关性评估
    return 0.8 + Math.random() * 0.2;
  }

  /**
   * 评估完整性
   */
  private assessCompleteness(text: string): number {
    // 简化的完整性评估
    let score = 0.5;

    // 有明确的目标或任务
    if (text.includes('目标') || text.includes('任务') || text.includes('要求')) {
      score += 0.2;
    }

    // 有具体的指导
    if (text.includes('步骤') || text.includes('方法') || text.includes('如何')) {
      score += 0.2;
    }

    return Math.min(score + 0.1, 1.0);
  }

  /**
   * 生成优化建议
   */
  private generateOptimizationSuggestions(
    template: PromptTemplate,
    compiledPrompt: string,
    metrics: PerformanceMetrics,
    compressionResult: any
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Token使用优化
    if (metrics.tokenUsage.total > 3000) {
      suggestions.push({
        id: 'token-optimization',
        type: 'cost',
        priority: 'high',
        title: 'Token使用量过高',
        description: `当前使用${metrics.tokenUsage.total}个Token，建议启用压缩或简化内容`,
        impact: {
          tokenSaving: metrics.tokenUsage.total * 0.3,
          costSaving: metrics.cost.total * 0.3
        },
        action: {
          type: 'auto',
          instruction: '启用智能压缩',
          code: 'compressionStrategy.enabled = true'
        }
      });
    }

    // 质量改进
    if (metrics.quality.overall < 0.7) {
      suggestions.push({
        id: 'quality-improvement',
        type: 'quality',
        priority: 'medium',
        title: '内容质量可以提升',
        description: '建议增加更具体的指导和示例',
        impact: {
          qualityImprovement: 0.2
        },
        action: {
          type: 'manual',
          instruction: '在模板中添加具体示例和详细说明'
        }
      });
    }

    // 性能优化
    if (metrics.time.total > 1000) {
      suggestions.push({
        id: 'performance-optimization',
        type: 'performance',
        priority: 'low',
        title: '编译时间较长',
        description: '可以通过缓存或并行处理提升性能',
        impact: {},
        action: {
          type: 'auto',
          instruction: '启用编译缓存'
        }
      });
    }

    return suggestions;
  }

  /**
   * 检测问题
   */
  private detectIssues(
    template: PromptTemplate,
    compiledPrompt: string,
    resolvedValues: Record<string, any>,
    options: PromptCompilerOptions
  ): Issue[] {
    const issues: Issue[] = [];

    // 检查未替换的占位符
    const unreplacedPlaceholders = compiledPrompt.match(/{{[^}]+}}/g);
    if (unreplacedPlaceholders) {
      issues.push({
        id: 'unreplaced-placeholders',
        type: 'warning',
        severity: 'medium',
        message: `发现${unreplacedPlaceholders.length}个未替换的占位符`,
        suggestion: '检查Slot配置和值是否正确'
      });
    }

    // 检查空白内容
    if (compiledPrompt.trim().length === 0) {
      issues.push({
        id: 'empty-prompt',
        type: 'error',
        severity: 'critical',
        message: '编译后的Prompt为空',
        suggestion: '检查模板内容和Slot值'
      });
    }

    // 检查过长内容
    if (compiledPrompt.length > 8000) {
      issues.push({
        id: 'prompt-too-long',
        type: 'warning',
        severity: 'high',
        message: 'Prompt内容过长，可能影响性能',
        suggestion: '考虑使用压缩或精简内容'
      });
    }

    return issues;
  }

  /**
   * 缓存编译结果
   */
  private cacheResult(templateId: string, result: string, slotValues: Record<string, any>): void {
    const cacheKey = `${templateId}-${JSON.stringify(slotValues)}`;
    this.compilationCache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    // 清理过期缓存（5分钟）
    setTimeout(() => {
      this.compilationCache.delete(cacheKey);
    }, 5 * 60 * 1000);
  }

  /**
   * 获取缓存的编译结果
   */
  getCachedResult(templateId: string, slotValues: Record<string, any>): string | null {
    const cacheKey = `${templateId}-${JSON.stringify(slotValues)}`;
    const cached = this.compilationCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
      return cached.result;
    }

    return null;
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.compilationCache.clear();
  }
}