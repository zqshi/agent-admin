/**
 * 线上生效策略类型定义
 */

export interface ProductionStrategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  lastUpdated: string;
  config: {
    model: string;
    prompt: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
    seed?: number;
  };
  performance: {
    taskSuccessRate: number;
    avgResponseTime: number;
    userSatisfaction: number;
    dailyRequestCount: number;
    tokenCost: number;
  };
  metadata: {
    deployedAt: string;
    version: string;
    experimentSource?: string; // 来源实验ID
    approvedBy: string;
  };
}

export interface StrategyComparison {
  baseline: ProductionStrategy;
  proposed: {
    model: string;
    prompt: string;
    temperature: number;
    maxTokens: number;
    tools: string[];
  };
  differences: {
    field: string;
    baselineValue: any;
    proposedValue: any;
    impact: 'low' | 'medium' | 'high';
    description: string;
  }[];
}