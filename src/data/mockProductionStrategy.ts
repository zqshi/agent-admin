import { ProductionStrategy } from '../types/productionStrategy';

export const mockCurrentProductionStrategy: ProductionStrategy = {
  id: 'prod-strategy-001',
  name: '当前线上AI助手配置',
  description: '基于历史实验数据优化的生产环境配置，主要针对客服场景进行了调优',
  status: 'active',
  lastUpdated: '2024-12-08T10:30:00Z',
  config: {
    model: 'gpt-4-turbo',
    prompt: '你是一个专业的AI助手，请始终以友好、准确、高效的方式帮助用户解决问题。在回答时请注意：\n1. 保持回答的准确性和相关性\n2. 使用清晰易懂的语言\n3. 如有不确定的信息，请明确说明\n4. 优先使用可用的工具来获取准确信息',
    temperature: 0.7,
    maxTokens: 2000,
    tools: ['search', 'calculator', 'knowledge_base'],
    seed: 12345
  },
  performance: {
    taskSuccessRate: 87.5, // %
    avgResponseTime: 2.3, // 秒
    userSatisfaction: 4.2, // /5.0
    dailyRequestCount: 12580,
    tokenCost: 0.032 // USD per request
  },
  metadata: {
    deployedAt: '2024-11-15T14:20:00Z',
    version: 'v2.1.3',
    experimentSource: 'exp-20241110-ai-prompt-optimization',
    approvedBy: '产品团队 + AI性能团队'
  }
};

export const getProductionStrategyComparison = (proposedConfig: any) => {
  const baseline = mockCurrentProductionStrategy;
  const differences = [];

  // 模型对比
  if (proposedConfig.model && proposedConfig.model !== baseline.config.model) {
    differences.push({
      field: '模型',
      baselineValue: baseline.config.model,
      proposedValue: proposedConfig.model,
      impact: 'high' as const,
      description: '模型变更会显著影响响应质量和成本'
    });
  }

  // Temperature对比
  if (proposedConfig.temperature && Math.abs(proposedConfig.temperature - baseline.config.temperature) > 0.1) {
    differences.push({
      field: '温度参数',
      baselineValue: baseline.config.temperature,
      proposedValue: proposedConfig.temperature,
      impact: proposedConfig.temperature > baseline.config.temperature ? 'medium' : 'low' as const,
      description: proposedConfig.temperature > baseline.config.temperature
        ? '更高的温度会增加回答的创造性但可能降低一致性'
        : '更低的温度会提高回答的一致性但可能减少创造性'
    });
  }

  // MaxTokens对比
  if (proposedConfig.maxTokens && proposedConfig.maxTokens !== baseline.config.maxTokens) {
    differences.push({
      field: '最大Token数',
      baselineValue: baseline.config.maxTokens,
      proposedValue: proposedConfig.maxTokens,
      impact: 'medium' as const,
      description: proposedConfig.maxTokens > baseline.config.maxTokens
        ? '更大的Token限制允许更详细的回答但会增加成本'
        : '更小的Token限制会降低成本但可能影响回答完整性'
    });
  }

  // 工具对比
  if (proposedConfig.tools) {
    const baselineTools = new Set(baseline.config.tools);
    const proposedTools = new Set(proposedConfig.tools);
    const addedTools = [...proposedTools].filter(tool => !baselineTools.has(tool));
    const removedTools = [...baselineTools].filter(tool => !proposedTools.has(tool));

    if (addedTools.length > 0 || removedTools.length > 0) {
      differences.push({
        field: '可用工具',
        baselineValue: baseline.config.tools.join(', '),
        proposedValue: proposedConfig.tools.join(', '),
        impact: 'medium' as const,
        description: `工具变更: ${addedTools.length > 0 ? `新增 ${addedTools.join(', ')}` : ''}${addedTools.length > 0 && removedTools.length > 0 ? '; ' : ''}${removedTools.length > 0 ? `移除 ${removedTools.join(', ')}` : ''}`
      });
    }
  }

  return {
    baseline,
    proposed: proposedConfig,
    differences
  };
};