/**
 * 实验意图解析和参数提取服务
 */

import {
  ExperimentIntent,
  ExtractedExperimentParams,
  MissingParams,
  NLParseResult,
  InputContext,
  ExperimentTemplate,
  IntelligentSuggestion,
  ExperimentComplexity,
  ConfidenceStrategy,
  EnhancedInputContext,
  VariableCombination
} from '../types/nlExperiment';

// 模型映射
const MODEL_MAPPINGS = {
  'gpt-4': 'gpt-4-turbo',
  'gpt4': 'gpt-4-turbo',
  'gpt-3.5': 'gpt-3.5-turbo',
  'gpt3.5': 'gpt-3.5-turbo',
  'claude-3': 'claude-3-opus',
  'claude3': 'claude-3-opus',
  'claude': 'claude-3-opus',
  'llama': 'llama-2-70b',
  'llama-2': 'llama-2-70b',
};

// 指标映射
const METRIC_MAPPINGS = {
  '成功率': 'task_success_rate',
  '任务完成率': 'task_success_rate',
  '完成率': 'task_success_rate',
  '响应时间': 'response_time',
  '速度': 'response_time',
  '延迟': 'response_time',
  '用户满意度': 'user_satisfaction',
  '满意度': 'user_satisfaction',
  '成本': 'token_cost',
  '费用': 'token_cost',
  'token成本': 'token_cost',
};

// 意图识别关键词（扩展版）
const INTENT_KEYWORDS = {
  comparison: ['对比', '比较', 'vs', '测试', '比对', 'AB测试', 'A/B测试', '效果对比', '性能比较'],
  optimization: ['优化', '改善', '提升', '改进', '调优', '性能', '最佳', '最优化', '效果提升'],
  exploration: ['探索', '试验', '尝试', '发现', '调研', '新功能', '测试新', '实验性'],
  cost_analysis: ['成本', '费用', '预算', '价格', '省钱', '经济', '成本效益', '花费'],
  multivariate: ['多变量', '多个变量', '同时测试', '组合测试', '多因素', '交互影响', '正交', '全因子'],
  stratified: ['分层', '分组', '不同用户', '用户群体', '细分', '定向', '按类型', '分类测试'],
  orthogonal: ['正交', '独立变量', '因子设计', '全面测试', '系统测试', '所有组合']
};

// 参数模式识别（正则表达式）
const PARAMETER_PATTERNS = {
  temperature: /(?:温度|temperature)[参数值]*[：:=\s]*(\d*\.?\d+)/gi,
  top_p: /(?:top[_\s]?p)[参数值]*[：:=\s]*(\d*\.?\d+)/gi,
  max_tokens: /(?:最大|max)[_\s]?(?:token|令牌)[数量s]*[：:=\s]*(\d+)/gi,
  model_list: /(?:模型|model).*?([a-zA-Z0-9\-_.]+(?:[，,、]\s*[a-zA-Z0-9\-_.]+)*)/gi,
  traffic_allocation: /(\d+)%[与和,，\s]+(\d+)%|各分配(\d+)%|各(\d+)%|(\d+):(\d+)/gi,
  duration: /(?:运行|持续|duration)[时间]*[：:=\s]*(\d+)[天日days?]/gi,
  sample_size: /(?:样本|sample)[数量大小size]*[：:=\s]*(\d+)/gi
};

// 预设模板（扩展版）
const EXPERIMENT_TEMPLATES: ExperimentTemplate[] = [
  {
    id: 'model_comparison',
    name: '模型对比实验',
    description: '对比不同LLM模型的性能表现',
    intent: { type: 'comparison', confidence: 0.9, description: '模型A vs 模型B效果对比' },
    params: {
      splittingStrategy: 'session',
      trafficRatio: [50, 50],
      primaryMetric: 'task_success_rate',
      duration: { minDays: 7, maxDays: 30 }
    },
    examples: [
      '测试GPT-4和Claude-3在客服场景的效果',
      '对比GPT-3.5和GPT-4的响应质量'
    ]
  },
  {
    id: 'prompt_optimization',
    name: '提示词优化实验',
    description: '优化系统提示词提升效果',
    intent: { type: 'optimization', confidence: 0.9, description: '提示词优化测试' },
    params: {
      splittingStrategy: 'user',
      trafficRatio: [30, 70],
      primaryMetric: 'user_satisfaction',
      duration: { minDays: 3, maxDays: 14 }
    },
    examples: [
      '测试新的提示词效果',
      '优化客服提示词提升满意度'
    ]
  },
  {
    id: 'multivariate_testing',
    name: '多变量实验',
    description: '同时测试多个变量的组合效果',
    intent: { type: 'multivariate', confidence: 0.85, description: '多变量组合测试' },
    params: {
      splittingStrategy: 'session',
      trafficRatio: [25, 25, 25, 25],
      primaryMetric: 'task_success_rate',
      duration: { minDays: 14, maxDays: 60 },
      variables: [
        { name: 'model', type: 'model', values: ['gpt-4-turbo', 'claude-3-opus'], isOrthogonal: true },
        { name: 'temperature', type: 'parameter', values: [0.2, 0.7], isOrthogonal: true }
      ]
    },
    examples: [
      '同时测试模型和温度参数的组合效果',
      '测试提示词和工具组合的最佳搭配'
    ]
  },
  {
    id: 'stratified_experiment',
    name: '分层实验',
    description: '在不同用户群体中测试不同策略',
    intent: { type: 'stratified', confidence: 0.8, description: '用户分层测试' },
    params: {
      splittingStrategy: 'user',
      primaryMetric: 'user_satisfaction',
      duration: { minDays: 7, maxDays: 30 },
      userSegments: [
        { name: '新用户', criteria: 'registration_date < 30 days', trafficRatio: 50 },
        { name: '老用户', criteria: 'registration_date >= 30 days', trafficRatio: 50 }
      ]
    },
    examples: [
      '新用户用简化版，老用户用完整版',
      '不同地区用户测试不同模型'
    ]
  },
  {
    id: 'cost_optimization',
    name: '成本优化实验',
    description: '寻找成本效益最优的配置',
    intent: { type: 'cost_analysis', confidence: 0.9, description: '成本效益优化' },
    params: {
      splittingStrategy: 'session',
      trafficRatio: [33, 33, 34],
      primaryMetric: 'cost_per_success',
      secondaryMetrics: ['token_cost', 'response_time'],
      duration: { minDays: 7, maxDays: 21 }
    },
    examples: [
      '找到成本最低但效果可接受的配置',
      '在预算限制下优化模型选择'
    ]
  }
];

// 置信度策略配置
const CONFIDENCE_STRATEGY: ConfidenceStrategy = {
  overall: 0.7,
  threshold: {
    high: 0.8,
    medium: 0.5,
    low: 0.3
  },
  actions: {
    high: 'auto_generate',
    medium: 'generate_with_confirmation',
    low: 'request_clarification'
  }
};

export class ExperimentIntentParser {
  /**
   * 解析自然语言输入（增强版）
   */
  public parseInput(userInput: string, context?: EnhancedInputContext): NLParseResult {
    // 预处理输入文本
    const preprocessedInput = this.preprocessInput(userInput);
    
    // 识别意图和复杂度
    const intent = this.identifyIntent(preprocessedInput, context);
    const complexity = this.assessComplexity(preprocessedInput, intent);
    
    // 提取参数
    const extractedParams = this.extractParameters(preprocessedInput, context, complexity);
    
    // 后处理和验证
    const missingParams = this.identifyMissingParams(extractedParams, intent);
    const suggestions = this.generateSuggestions(preprocessedInput, extractedParams, context);
    const errors = this.validateInput(preprocessedInput, extractedParams, intent);
    
    // 应用置信度策略
    this.applyConfidenceStrategy(extractedParams, intent);

    return {
      intent,
      extractedParams,
      missingParams,
      suggestions,
      errors
    };
  }

  /**
   * 文本预处理
   */
  private preprocessInput(input: string): string {
    return input
      .replace(/[，；。！？]/g, ',') // 统一标点符号
      .replace(/\s+/g, ' ') // 合并空格
      .trim()
      .toLowerCase();
  }

  /**
   * 评估实验复杂度
   */
  private assessComplexity(input: string, intent: ExperimentIntent): ExperimentComplexity {
    let level: ExperimentComplexity['level'] = 'simple';
    let variableCount = 1;
    let groupCount = 2;
    let metricCount = 1;
    let hasStratification = false;
    let hasOrthogonality = false;

    // 检测多变量
    if (intent.type === 'multivariate' || 
        input.includes('同时') || input.includes('组合') || input.includes('交互')) {
      variableCount = 2;
      groupCount = 4;
      level = 'medium';
    }

    // 检测正交设计
    if (intent.type === 'orthogonal' || 
        input.includes('正交') || input.includes('全因子') || input.includes('所有组合')) {
      hasOrthogonality = true;
      level = 'complex';
    }

    // 检测分层
    if (intent.type === 'stratified' || 
        input.includes('分层') || input.includes('用户群') || input.includes('细分')) {
      hasStratification = true;
      level = level === 'simple' ? 'medium' : 'complex';
    }

    // 检测多指标
    const metricKeywords = ['指标', '成功率', '满意度', '响应时间', '成本'];
    metricCount = metricKeywords.filter(keyword => input.includes(keyword)).length || 1;
    if (metricCount > 2) level = 'complex';

    // 高级功能检测
    if (input.includes('序贯') || input.includes('自适应') || input.includes('动态分配')) {
      level = 'advanced';
    }

    return {
      level,
      factors: {
        variableCount,
        groupCount,
        metricCount,
        hasStratification,
        hasOrthogonality
      },
      estimatedSetupTime: this.calculateSetupTime(level),
      recommendedMinDuration: this.calculateMinDuration(level, groupCount),
      statisticalPowerRequirement: this.calculatePowerRequirement(level)
    };
  }

  private calculateSetupTime(level: ExperimentComplexity['level']): number {
    const timeMap = { simple: 5, medium: 15, complex: 30, advanced: 60 };
    return timeMap[level];
  }

  private calculateMinDuration(level: ExperimentComplexity['level'], groupCount: number): number {
    const baseDays = { simple: 7, medium: 14, complex: 21, advanced: 30 };
    return baseDays[level] + Math.max(0, (groupCount - 2) * 3);
  }

  private calculatePowerRequirement(level: ExperimentComplexity['level']): number {
    const powerMap = { simple: 0.8, medium: 0.85, complex: 0.9, advanced: 0.95 };
    return powerMap[level];
  }

  /**
   * 应用置信度策略
   */
  private applyConfidenceStrategy(params: ExtractedExperimentParams, intent: ExperimentIntent): void {
    const confidence = params.extractionConfidence;
    
    if (confidence >= CONFIDENCE_STRATEGY.threshold.high) {
      // 高置信度：自动生成完整配置
      params.confidenceBreakdown = {
        intentRecognition: Math.min(1.0, confidence + 0.1),
        parameterExtraction: confidence,
        configurationValidity: Math.min(1.0, confidence + 0.05)
      };
    } else if (confidence >= CONFIDENCE_STRATEGY.threshold.medium) {
      // 中置信度：生成但标记需确认
      params.confidenceBreakdown = {
        intentRecognition: confidence,
        parameterExtraction: Math.max(0.5, confidence - 0.1),
        configurationValidity: Math.max(0.6, confidence)
      };
    } else {
      // 低置信度：请求澄清
      params.confidenceBreakdown = {
        intentRecognition: Math.max(0.3, confidence),
        parameterExtraction: Math.max(0.2, confidence - 0.2),
        configurationValidity: Math.max(0.3, confidence - 0.1)
      };
    }
  }

  /**
   * 识别用户意图（增强版）
   */
  private identifyIntent(input: string, context?: EnhancedInputContext): ExperimentIntent {
    let maxScore = 0;
    let bestIntent: ExperimentIntent['type'] = 'comparison';
    const subTypes: string[] = [];

    // 检查各种意图的关键词匹配（加权评分）
    Object.entries(INTENT_KEYWORDS).forEach(([intentType, keywords]) => {
      const score = keywords.reduce((count, keyword) => {
        const weight = this.getKeywordWeight(keyword, intentType as any);
        return count + (input.includes(keyword.toLowerCase()) ? weight : 0);
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intentType as ExperimentIntent['type'];
      }
    });

    // 上下文增强
    if (context?.userProfile?.commonExperimentTypes?.includes(bestIntent)) {
      maxScore += 0.5; // 用户常用类型加权
    }

    // 检测细分类型
    if (bestIntent === 'comparison') {
      if (input.includes('模型')) subTypes.push('model_comparison');
      if (input.includes('提示词')) subTypes.push('prompt_comparison');
      if (input.includes('参数')) subTypes.push('parameter_comparison');
    }

    // 根据匹配度和上下文计算置信度
    const baseConfidence = Math.min(0.95, maxScore * 0.15 + 0.4);
    const contextBoost = context ? 0.1 : 0;
    const confidence = Math.min(0.98, baseConfidence + contextBoost);

    const descriptions = {
      comparison: '模型或配置对比测试',
      optimization: '参数或策略优化实验',
      exploration: '新功能或方法探索',
      cost_analysis: '成本效益分析实验',
      multivariate: '多变量组合测试实验',
      stratified: '用户分层测试实验',
      orthogonal: '正交设计全因子实验'
    };

    return {
      type: bestIntent,
      confidence,
      description: descriptions[bestIntent],
      subTypes: subTypes.length > 0 ? subTypes : undefined
    };
  }

  /**
   * 获取关键词权重
   */
  private getKeywordWeight(keyword: string, intentType: string): number {
    const highWeightKeywords = {
      comparison: ['vs', 'A/B测试', '对比'],
      multivariate: ['多变量', '正交', '组合测试'],
      stratified: ['分层', '用户群体', '细分']
    };

    if (highWeightKeywords[intentType as keyof typeof highWeightKeywords]?.includes(keyword)) {
      return 1.5;
    }
    return 1.0;
  }

  /**
   * 提取实验参数（增强版）
   */
  private extractParameters(input: string, context?: EnhancedInputContext, complexity?: ExperimentComplexity): ExtractedExperimentParams {
    const params: ExtractedExperimentParams = {
      extractionConfidence: 0
    };

    let confidenceScore = 0;
    let totalChecks = 0;

    // 使用正则表达式模式提取参数
    const extractedData = this.extractWithPatterns(input);
    
    // 提取模型信息
    const models = this.extractModels(input);
    if (models.length > 0) {
      params.models = models;
      confidenceScore += 0.25;
    }
    totalChecks += 0.25;

    // 提取参数配置
    const parameterConfig = this.extractParameterConfig(input, extractedData);
    if (parameterConfig.temperatures) params.temperatures = parameterConfig.temperatures;
    if (parameterConfig.topP) params.topP = parameterConfig.topP;
    if (parameterConfig.maxTokens) params.maxTokens = parameterConfig.maxTokens;
    if (Object.keys(parameterConfig).length > 0) {
      confidenceScore += 0.15;
    }
    totalChecks += 0.15;

    // 提取流量分配
    const trafficRatio = this.extractTrafficRatio(input);
    if (trafficRatio.length > 0) {
      params.trafficRatio = trafficRatio;
      confidenceScore += 0.15;
    }
    totalChecks += 0.15;

    // 提取指标信息
    const metrics = this.extractMetrics(input);
    if (metrics.primary) {
      params.primaryMetric = metrics.primary;
      confidenceScore += 0.12;
    }
    if (metrics.secondary.length > 0) {
      params.secondaryMetrics = metrics.secondary;
      confidenceScore += 0.03;
    }
    totalChecks += 0.15;

    // 提取时间duration（增强版）
    const duration = this.extractDuration(input);
    if (duration.minDays || duration.maxDays || duration.targetSamples) {
      params.duration = duration;
      confidenceScore += 0.1;
    }
    totalChecks += 0.1;

    // 提取预算信息（增强版）
    const budget = this.extractBudget(input);
    if (budget.maxCost) {
      params.budget = budget;
      confidenceScore += 0.08;
    }
    totalChecks += 0.08;

    // 提取变量配置（多变量实验）
    if (complexity?.level === 'medium' || complexity?.level === 'complex') {
      const variables = this.extractVariables(input, models);
      if (variables.length > 0) {
        params.variables = variables;
        confidenceScore += 0.1;
      }
      totalChecks += 0.1;
    }

    // 提取分层信息
    const stratification = this.extractStratification(input);
    if (stratification.dimensions.length > 0 || stratification.segments.length > 0) {
      params.stratificationDimensions = stratification.dimensions;
      params.userSegments = stratification.segments;
      confidenceScore += 0.05;
    }
    totalChecks += 0.05;

    // 生成实验名称和描述
    if (!params.name) {
      params.name = this.generateExperimentName(input, params);
    }
    
    if (!params.description) {
      params.description = this.generateExperimentDescription(input);
    }
    
    params.extractionConfidence = totalChecks > 0 ? confidenceScore / totalChecks : 0;

    return params;
  }

  /**
   * 提取模型信息
   */
  private extractModels(input: string): string[] {
    const models: string[] = [];
    const inputLower = input.toLowerCase();

    Object.entries(MODEL_MAPPINGS).forEach(([key, value]) => {
      if (inputLower.includes(key.toLowerCase())) {
        if (!models.includes(value)) {
          models.push(value);
        }
      }
    });

    return models;
  }

  /**
   * 使用正则模式提取参数
   */
  private extractWithPatterns(input: string): Record<string, any> {
    const extracted: Record<string, any> = {};
    
    Object.entries(PARAMETER_PATTERNS).forEach(([key, pattern]) => {
      const matches = Array.from(input.matchAll(pattern));
      if (matches.length > 0) {
        extracted[key] = matches.map(match => match[1] || match[0]).filter(Boolean);
      }
    });
    
    return extracted;
  }

  /**
   * 提取参数配置
   */
  private extractParameterConfig(input: string, extractedData: Record<string, any>): {
    temperatures?: number[];
    topP?: number[];
    maxTokens?: number[];
  } {
    const config: any = {};
    
    if (extractedData.temperature) {
      config.temperatures = extractedData.temperature.map((t: string) => parseFloat(t)).filter((t: number) => t >= 0 && t <= 2);
    }
    
    if (extractedData.top_p) {
      config.topP = extractedData.top_p.map((p: string) => parseFloat(p)).filter((p: number) => p >= 0 && p <= 1);
    }
    
    if (extractedData.max_tokens) {
      config.maxTokens = extractedData.max_tokens.map((t: string) => parseInt(t)).filter((t: number) => t > 0 && t <= 4000);
    }
    
    return config;
  }

  /**
   * 提取变量配置（多变量实验）
   */
  private extractVariables(input: string, models?: string[]): any[] {
    const variables = [];
    
    // 检测模型变量
    if (models && models.length > 1) {
      variables.push({
        name: 'model',
        type: 'model',
        values: models,
        isOrthogonal: input.includes('正交') || input.includes('组合')
      });
    }
    
    // 检测参数变量
    if (input.includes('温度') || input.includes('temperature')) {
      const temps = input.match(/([0-9.]+)/g)?.map(t => parseFloat(t)).filter(t => t >= 0 && t <= 2) || [];
      if (temps.length > 1) {
        variables.push({
          name: 'temperature',
          type: 'parameter',
          values: temps.slice(0, 2),
          isOrthogonal: true
        });
      }
    }
    
    return variables;
  }

  /**
   * 提取分层信息
   */
  private extractStratification(input: string): {
    dimensions: string[];
    segments: any[];
  } {
    const dimensions: string[] = [];
    const segments: any[] = [];
    
    if (input.includes('新用户') || input.includes('老用户')) {
      dimensions.push('user_tenure');
      segments.push(
        { name: '新用户', criteria: 'registration_date < 30 days', trafficRatio: 50 },
        { name: '老用户', criteria: 'registration_date >= 30 days', trafficRatio: 50 }
      );
    }
    
    if (input.includes('地区') || input.includes('区域')) {
      dimensions.push('geographic_region');
    }
    
    if (input.includes('时间') || input.includes('时段')) {
      dimensions.push('time_segment');
    }
    
    return { dimensions, segments };
  }

  /**
   * 提取流量分配（增强版）
   */
  private extractTrafficRatio(input: string): number[] {
    // 尝试多种模式
    const patterns = [
      /(\d+)%[与和,，\s]+(\d+)%/g, // 50%与50%
      /各分配(\d+)%/g,             // 各分配50%
      /各(\d+)%/g,                // 各50%
      /(\d+):(\d+)/g,             // 1:1 或 7:3
      /均匀分配|平均分配|对半分/g    // 均匀表述
    ];
    
    for (const pattern of patterns) {
      const matches = Array.from(input.matchAll(pattern));
      if (matches.length > 0) {
        const match = matches[0];
        
        if (pattern.source.includes('均匀') || pattern.source.includes('平均') || pattern.source.includes('对半')) {
          return [50, 50];
        }
        
        const numbers = match.filter(m => m && /^\d+$/.test(m)).map(n => parseInt(n));
        if (numbers.length >= 2) {
          let ratio1 = numbers[0];
          let ratio2 = numbers[1];
          
          // 处理比例形式 (如 7:3)
          if (pattern.source.includes(':')) {
            const total = ratio1 + ratio2;
            ratio1 = Math.round((ratio1 / total) * 100);
            ratio2 = Math.round((ratio2 / total) * 100);
          }
          
          // 验证总和
          if (Math.abs((ratio1 + ratio2) - 100) <= 5) {
            return [ratio1, ratio2];
          }
        }
      }
    }
    
    // 特殊情况处理
    if (input.includes('小流量') || input.includes('少量')) {
      return [20, 80];
    }
    if (input.includes('大部分') || input.includes('主要')) {
      return [80, 20];
    }
    
    return [];
  }

  /**
   * 提取指标信息
   */
  private extractMetrics(input: string): { primary?: string; secondary: string[] } {
    let primary: string | undefined;
    const secondary: string[] = [];

    Object.entries(METRIC_MAPPINGS).forEach(([key, value]) => {
      if (input.includes(key)) {
        if (!primary) {
          primary = value;
        } else if (!secondary.includes(value)) {
          secondary.push(value);
        }
      }
    });

    return { primary, secondary };
  }

  /**
   * 提取持续时间（增强版）
   */
  private extractDuration(input: string): { minDays?: number; maxDays?: number; targetSamples?: number; autoStopConditions?: string[] } {
    const duration: any = {};
    const autoStopConditions: string[] = [];

    // 匹配时间表述
    const timePatterns = {
      days: /(\d+)天/g,
      weeks: /(\d+)周/g,
      months: /(\d+)个?月/g,
      range: /(\d+)[到至-](\d+)天/g
    };

    // 处理天数
    const dayMatch = input.match(timePatterns.days);
    if (dayMatch) {
      const days = parseInt(dayMatch[0].match(/\d+/)![0]);
      duration.minDays = days;
      duration.maxDays = days;
    }

    // 处理周
    const weekMatch = input.match(timePatterns.weeks);
    if (weekMatch) {
      const weeks = parseInt(weekMatch[0].match(/\d+/)![0]);
      duration.minDays = weeks * 7;
      duration.maxDays = weeks * 7;
    }

    // 处理月
    const monthMatch = input.match(timePatterns.months);
    if (monthMatch) {
      const months = parseInt(monthMatch[0].match(/\d+/)![0]);
      duration.minDays = months * 30;
      duration.maxDays = months * 30;
    }

    // 处理时间范围
    const rangeMatch = input.match(timePatterns.range);
    if (rangeMatch) {
      const numbers = rangeMatch[0].match(/\d+/g);
      if (numbers && numbers.length >= 2) {
        duration.minDays = parseInt(numbers[0]);
        duration.maxDays = parseInt(numbers[1]);
      }
    }

    // 提取样本量目标
    const samplePattern = /(?:样本|sample)[数量大小size]*[：:=\s]*(\d+)/gi;
    const sampleMatch = input.match(samplePattern);
    if (sampleMatch) {
      const sampleSize = parseInt(sampleMatch[0].match(/\d+/)![0]);
      duration.targetSamples = sampleSize;
    }

    // 检测自动停止条件
    if (input.includes('显著') || input.includes('statistical')) {
      autoStopConditions.push('statistical_significance');
    }
    if (input.includes('预算') || input.includes('成本')) {
      autoStopConditions.push('budget_exhausted');
    }
    if (input.includes('样本') && input.includes('达到')) {
      autoStopConditions.push('target_sample_reached');
    }

    if (autoStopConditions.length > 0) {
      duration.autoStopConditions = autoStopConditions;
    }

    return duration;
  }

  /**
   * 提取预算信息（增强版）
   */
  private extractBudget(input: string): { maxCost?: number; dailyLimit?: number; costPerGroup?: number[] } {
    const budget: any = {};

    // 匹配总预算
    const totalBudgetPatterns = [
      /预算[限制制]*(\d+)[美元$]?/gi,
      /(\d+)[美元$]/gi,
      /成本[不]?超过(\d+)/gi,
      /最多花费(\d+)/gi
    ];

    for (const pattern of totalBudgetPatterns) {
      const match = input.match(pattern);
      if (match) {
        const numberMatch = match[0].match(/\d+/);
        if (numberMatch) {
          budget.maxCost = parseInt(numberMatch[0]);
          break;
        }
      }
    }

    // 匹配每日预算
    const dailyBudgetPattern = /每天[不]?超过(\d+)|日预算(\d+)/gi;
    const dailyMatch = input.match(dailyBudgetPattern);
    if (dailyMatch) {
      const numberMatch = dailyMatch[0].match(/\d+/);
      if (numberMatch) {
        budget.dailyLimit = parseInt(numberMatch[0]);
      }
    }

    // 匹配分组预算
    if (input.includes('每组') || input.includes('分组')) {
      const groupBudgetPattern = /每组(\d+)|分组.*?(\d+)/gi;
      const groupMatch = input.match(groupBudgetPattern);
      if (groupMatch) {
        const numberMatch = groupMatch[0].match(/\d+/);
        if (numberMatch) {
          const costPerGroup = parseInt(numberMatch[0]);
          budget.costPerGroup = [costPerGroup, costPerGroup]; // 假设两组相等
        }
      }
    }

    return budget;
  }

  /**
   * 生成实验名称
   */
  private generateExperimentName(input: string, params: ExtractedExperimentParams): string {
    if (params.models && params.models.length >= 2) {
      const modelNames = params.models.map(m => m.replace('-turbo', '').replace('-opus', '').toUpperCase());
      return `${modelNames.join(' vs ')} 效果对比实验`;
    }

    if (input.includes('提示词') || input.includes('prompt')) {
      return '提示词优化A/B实验';
    }

    if (input.includes('成本') || input.includes('费用')) {
      return '成本效益分析实验';
    }

    return '智能A/B对比实验';
  }

  /**
   * 生成实验描述
   */
  private generateExperimentDescription(input: string): string {
    return `基于自然语言输入创建的实验：${input.substring(0, 100)}${input.length > 100 ? '...' : ''}`;
  }

  /**
   * 识别缺失参数（增强版）
   */
  private identifyMissingParams(params: ExtractedExperimentParams, intent: ExperimentIntent): MissingParams {
    const required = [];
    const optional = [];

    // 基于实验类型调整必需参数
    const requirementsByType = {
      comparison: { minModels: 2, requiresPrimary: true, requiresVariables: false, requiresSegmentation: false, requiresBudget: false },
      multivariate: { minModels: 1, requiresPrimary: true, requiresVariables: true, requiresSegmentation: false, requiresBudget: false },
      stratified: { minModels: 1, requiresPrimary: true, requiresVariables: false, requiresSegmentation: true, requiresBudget: false },
      optimization: { minModels: 1, requiresPrimary: true, requiresVariables: false, requiresSegmentation: false, requiresBudget: false },
      exploration: { minModels: 1, requiresPrimary: false, requiresVariables: false, requiresSegmentation: false, requiresBudget: false },
      cost_analysis: { minModels: 1, requiresPrimary: true, requiresVariables: false, requiresSegmentation: false, requiresBudget: true },
      orthogonal: { minModels: 1, requiresPrimary: true, requiresVariables: true, requiresSegmentation: false, requiresBudget: false }
    };

    const requirements = requirementsByType[intent.type] || requirementsByType.comparison;

    // 必需参数检查
    if (!params.models || params.models.length < requirements.minModels) {
      required.push({
        field: 'models',
        description: `请选择至少${requirements.minModels}个模型`,
        options: ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'llama-2-70b'],
        default: requirements.minModels === 1 ? ['gpt-4-turbo'] : ['gpt-4-turbo', 'claude-3-opus']
      });
    }

    if (requirements.requiresPrimary && !params.primaryMetric) {
      required.push({
        field: 'primaryMetric',
        description: '请选择主要评估指标',
        options: ['task_success_rate', 'response_time', 'user_satisfaction', 'token_cost', 'conversion_rate'],
        default: 'task_success_rate'
      });
    }

    if (requirements.requiresVariables && (!params.variables || params.variables.length === 0)) {
      required.push({
        field: 'variables',
        description: '请定义实验变量',
        options: ['model', 'temperature', 'prompt', 'tools'],
        default: [{ name: 'model', type: 'model', values: params.models || [] }]
      });
    }

    if (requirements.requiresSegmentation && (!params.userSegments || params.userSegments.length === 0)) {
      required.push({
        field: 'userSegments',
        description: '请定义用户分层策略',
        options: ['user_tenure', 'geographic_region', 'usage_frequency'],
        default: [{ name: '新用户', criteria: 'registration_date < 30 days', trafficRatio: 50 }]
      });
    }

    if (requirements.requiresBudget && !params.budget?.maxCost) {
      required.push({
        field: 'budget',
        description: '成本分析实验需要设定预算限制',
        options: [100, 500, 1000, 2000, 5000],
        default: 1000
      });
    }

    // 可选参数检查（基于实验复杂度）
    if (!params.trafficRatio) {
      const defaultRatio = intent.type === 'multivariate' && params.variables ? 
        new Array(Math.pow(2, params.variables.length)).fill(100 / Math.pow(2, params.variables.length)) : 
        [50, 50];
      
      optional.push({
        field: 'trafficRatio',
        description: '流量分配比例',
        options: [[50, 50], [70, 30], [80, 20]],
        default: defaultRatio
      });
    }

    if (!params.duration) {
      const minDuration = intent.type === 'multivariate' || intent.type === 'orthogonal' ? 14 : 7;
      optional.push({
        field: 'duration',
        description: '实验运行时长',
        options: [3, 7, 14, 21, 30],
        default: minDuration
      });
    }

    if (!params.budget && !requirements.requiresBudget) {
      optional.push({
        field: 'budget',
        description: '实验预算限制 (USD)',
        options: [100, 500, 1000, 2000, 5000],
        default: 1000
      });
    }

    // 高级配置参数
    if (intent.type === 'multivariate' && !params.splittingStrategy) {
      optional.push({
        field: 'splittingStrategy',
        description: '流量分配策略',
        options: ['session', 'user', 'request'],
        default: 'session'
      });
    }

    return { required, optional };
  }

  /**
   * 生成建议（增强版）
   */
  private generateSuggestions(input: string, params: ExtractedExperimentParams, context?: EnhancedInputContext): string[] {
    const suggestions: string[] = [];

    // 基于置信度的建议
    if (params.extractionConfidence < 0.4) {
      suggestions.push('建议提供更详细的实验描述，包括具体的模型、指标和时长要求');
      suggestions.push('可以参考示例模板来完善实验需求描述');
    } else if (params.extractionConfidence < 0.7) {
      suggestions.push('实验配置基本清晰，建议确认关键参数后即可创建');
    }

    // 基于实验类型的建议
    if (params.models && params.models.length === 1 && !params.variables) {
      suggestions.push('单模型实验建议设置参数对比组，或添加另一个模型进行对比');
    }

    // 流量分配建议
    if (params.trafficRatio) {
      const isEqual = params.trafficRatio.every(ratio => ratio === params.trafficRatio![0]);
      if (isEqual && params.trafficRatio[0] === 50) {
        suggestions.push('当前为均匀分配，如果是新功能测试，建议考虑20/80的保守分配');
      }
      if (params.models && params.models.length > params.trafficRatio.length) {
        suggestions.push('检测到模型数量与流量分配不匹配，将自动调整为均匀分配');
      }
    }

    // 预算优化建议
    if (params.budget?.maxCost) {
      if (params.budget.maxCost < 100) {
        suggestions.push('预算较低，建议延长实验时间或减少并发组数以获得更可靠结果');
      } else if (params.budget.maxCost > 5000) {
        suggestions.push('预算充足，可考虑增加更多对比组或延长实验时间提高统计检验力');
      }
    }

    // 时长建议
    if (params.duration) {
      const minDays = params.duration.minDays || 0;
      const variableCount = params.variables?.length || 1;
      const recommendedMinDays = Math.max(7, variableCount * 3);
      
      if (minDays < recommendedMinDays) {
        suggestions.push(`基于实验复杂度，建议运行至少${recommendedMinDays}天以获得统计显著性`);
      }
      
      if (params.duration.targetSamples && !minDays) {
        suggestions.push('设定了目标样本量但未设置时长，建议添加最大运行时间作为安全边界');
      }
    }

    // 多变量实验建议
    if (params.variables && params.variables.length > 1) {
      const totalCombinations = params.variables.reduce((acc, v) => acc * v.values.length, 1);
      if (totalCombinations > 8) {
        suggestions.push(`检测到${totalCombinations}个实验组合，建议使用正交设计或分阶段测试以控制复杂度`);
      }
      
      if (!params.variables.some(v => v.isOrthogonal)) {
        suggestions.push('多变量实验建议启用正交设计以分析变量间交互效应');
      }
    }

    // 指标建议
    if (params.primaryMetric === 'token_cost' && !params.secondaryMetrics?.includes('task_success_rate')) {
      suggestions.push('成本优化实验建议同时监控任务完成率，避免过度优化成本而损失效果');
    }

    // 基于用户历史的个性化建议
    if (context?.userProfile) {
      const { experienceLevel, commonExperimentTypes } = context.userProfile;
      
      if (experienceLevel === 'beginner') {
        suggestions.push('建议从简单的A/B对比开始，积累经验后再尝试多变量实验');
      } else if (experienceLevel === 'expert' && !params.variables) {
        suggestions.push('作为资深用户，可考虑设计多变量实验以获得更深入的洞察');
      }
      
      if (commonExperimentTypes.includes('cost_analysis') && !params.budget) {
        suggestions.push('检测到您经常进行成本分析，建议设置预算限制以更好地控制实验成本');
      }
    }

    // 季节性和业务周期建议
    if (context?.seasonality) {
      const { dayOfWeek, businessCycle } = context.seasonality;
      if (dayOfWeek === 'weekend') {
        suggestions.push('周末流量模式可能不同，建议在工作日启动实验或延长实验时间覆盖完整周期');
      }
      if (businessCycle === 'peak_season') {
        suggestions.push('当前为业务高峰期，建议谨慎调整流量分配避免影响关键业务指标');
      }
    }

    return suggestions.slice(0, 5); // 限制建议数量避免信息过载
  }

  /**
   * 验证输入（增强版）
   */
  private validateInput(input: string, params: ExtractedExperimentParams, intent: ExperimentIntent): string[] {
    const errors: string[] = [];

    // 基础验证
    if (!input || input.trim().length < 5) {
      errors.push('输入描述过短，请提供更详细的实验需求');
    }

    // 流量分配验证
    if (params.trafficRatio) {
      const total = params.trafficRatio.reduce((a, b) => a + b, 0);
      if (Math.abs(total - 100) > 5) {
        errors.push(`流量分配总和为${total}%，应该接近100%`);
      }
      if (params.trafficRatio.some(ratio => ratio < 1)) {
        errors.push('单组流量分配不能少于1%');
      }
      if (params.trafficRatio.some(ratio => ratio > 95)) {
        errors.push('单组流量分配不应超过95%，请保留足够的对照组流量');
      }
    }

    // 预算验证
    if (params.budget) {
      if (params.budget.maxCost !== undefined && params.budget.maxCost <= 0) {
        errors.push('预算金额必须大于0');
      }
      if (params.budget.dailyLimit && params.budget.maxCost && 
          params.budget.dailyLimit > params.budget.maxCost) {
        errors.push('日预算限制不能超过总预算');
      }
    }

    // 时长验证
    if (params.duration) {
      if (params.duration.minDays !== undefined && params.duration.minDays < 1) {
        errors.push('实验运行时长至少为1天');
      }
      if (params.duration.maxDays !== undefined && params.duration.maxDays > 365) {
        errors.push('实验运行时长不应超过365天');
      }
      if (params.duration.minDays && params.duration.maxDays && 
          params.duration.minDays > params.duration.maxDays) {
        errors.push('最小运行时长不能超过最大运行时长');
      }
      if (params.duration.targetSamples !== undefined && params.duration.targetSamples < 100) {
        errors.push('目标样本量至少为100以获得有意义的统计结果');
      }
    }

    // 模型验证
    if (params.models) {
      const validModels = ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'llama-2-70b'];
      const invalidModels = params.models.filter(model => !validModels.includes(model));
      if (invalidModels.length > 0) {
        errors.push(`不支持的模型: ${invalidModels.join(', ')}`);
      }
    }

    // 参数范围验证
    if (params.temperatures) {
      const invalidTemps = params.temperatures.filter(t => t < 0 || t > 2);
      if (invalidTemps.length > 0) {
        errors.push(`温度参数必须在0-2范围内，当前有无效值: ${invalidTemps.join(', ')}`);
      }
    }

    if (params.topP) {
      const invalidTopP = params.topP.filter(p => p < 0 || p > 1);
      if (invalidTopP.length > 0) {
        errors.push(`top_p参数必须在0-1范围内，当前有无效值: ${invalidTopP.join(', ')}`);
      }
    }

    // 多变量实验特殊验证
    if (intent.type === 'multivariate' || intent.type === 'orthogonal') {
      if (!params.variables || params.variables.length < 2) {
        errors.push('多变量实验需要至少定义2个变量');
      }
      
      if (params.variables) {
        const totalCombinations = params.variables.reduce((acc, v) => acc * v.values.length, 1);
        if (totalCombinations > 16) {
          errors.push(`变量组合过多(${totalCombinations}个)，建议简化设计或使用分阶段测试`);
        }
        
        // 检查流量分配是否匹配组合数
        if (params.trafficRatio && params.trafficRatio.length !== totalCombinations) {
          errors.push(`流量分配组数(${params.trafficRatio.length})与变量组合数(${totalCombinations})不匹配`);
        }
      }
    }

    // 分层实验验证
    if (intent.type === 'stratified') {
      if (!params.userSegments || params.userSegments.length === 0) {
        errors.push('分层实验需要定义用户细分策略');
      }
      
      if (params.userSegments) {
        const totalSegmentTraffic = params.userSegments.reduce((sum, seg) => sum + seg.trafficRatio, 0);
        if (Math.abs(totalSegmentTraffic - 100) > 5) {
          errors.push(`用户分层流量分配总和为${totalSegmentTraffic}%，应该等于100%`);
        }
      }
    }

    // 业务逻辑验证
    if (intent.type === 'cost_analysis') {
      if (!params.budget?.maxCost) {
        errors.push('成本分析实验必须设置预算限制');
      }
      if (!params.primaryMetric || !['token_cost', 'cost_per_success'].includes(params.primaryMetric)) {
        errors.push('成本分析实验的主要指标应该是成本相关指标');
      }
    }

    return errors;
  }

  /**
   * 获取智能建议（全面升级版）
   */
  public getIntelligentSuggestions(params: ExtractedExperimentParams, context?: EnhancedInputContext): IntelligentSuggestion[] {
    const suggestions: IntelligentSuggestion[] = [];

    // 模型推荐建议
    if (params.models && params.models.length < 2) {
      suggestions.push({
        type: 'model_recommendation',
        title: '推荐添加对比模型',
        description: '基于当前选择，推荐使用GPT-4和Claude-3进行对比以获得更全面的性能评估',
        confidence: 0.85,
        priority: 'high',
        category: 'performance',
        impact: '提升实验可信度，获得更有价值的对比洞察',
        implementationEffort: 'low',
        relatedParams: ['models', 'trafficRatio']
      });
    }

    // 统计效力建议
    if (params.duration && params.duration.minDays && params.duration.minDays < 7) {
      suggestions.push({
        type: 'statistical_power',
        title: '延长实验时间',
        description: `当前${params.duration.minDays}天可能不足以获得统计显著性，建议至少运行7天`,
        confidence: 0.9,
        priority: 'high',
        category: 'statistics',
        impact: '确保实验结果具有统计显著性',
        implementationEffort: 'low',
        relatedParams: ['duration']
      });
    }

    // 样本量建议
    const estimatedDailyTraffic = context?.projectContext?.constraints?.includes('low_traffic') ? 100 : 1000;
    const totalEstimatedSamples = params.duration?.minDays ? params.duration.minDays * estimatedDailyTraffic : 0;
    if (totalEstimatedSamples > 0 && totalEstimatedSamples < 1000) {
      suggestions.push({
        type: 'sample_size',
        title: '样本量可能不足',
        description: `预计总样本量约${totalEstimatedSamples}，建议延长时间或增加流量以达到至少1000样本`,
        confidence: 0.75,
        priority: 'medium',
        category: 'statistics',
        impact: '确保足够样本量以检测实际效果差异',
        implementationEffort: 'medium',
        relatedParams: ['duration', 'trafficRatio']
      });
    }

    // 多变量实验建议
    if (params.variables && params.variables.length > 1) {
      const totalCombinations = params.variables.reduce((acc, v) => acc * v.values.length, 1);
      if (totalCombinations > 8) {
        suggestions.push({
          type: 'variable_interaction',
          title: '简化多变量设计',
          description: `当前有${totalCombinations}个组合，建议使用分数因子设计减少复杂度`,
          confidence: 0.8,
          priority: 'medium',
          category: 'statistics',
          impact: '降低实验复杂度，提高结果可解释性',
          implementationEffort: 'medium',
          relatedParams: ['variables', 'trafficRatio']
        });
      }
    }

    // 成本优化建议
    if (params.budget?.maxCost && params.models) {
      const costlyModels = params.models.filter(m => m.includes('gpt-4') || m.includes('claude-3-opus'));
      if (costlyModels.length > 0 && params.budget.maxCost < 500) {
        suggestions.push({
          type: 'budget_optimization',
          title: '模型成本优化',
          description: '当前选择的高级模型成本较高，建议添加更经济的模型如GPT-3.5作为对比',
          confidence: 0.7,
          priority: 'medium',
          category: 'cost',
          impact: '在预算限制内获得更全面的性能对比',
          implementationEffort: 'low',
          relatedParams: ['models', 'budget']
        });
      }
    }

    // 用户分层建议
    if (!params.userSegments && context?.userProfile?.experienceLevel === 'expert') {
      suggestions.push({
        type: 'user_segmentation',
        title: '考虑用户分层',
        description: '基于您的专业水平，建议考虑按用户特征分层以获得更精细的洞察',
        confidence: 0.6,
        priority: 'low',
        category: 'user_experience',
        impact: '发现不同用户群体的差异化需求',
        implementationEffort: 'high',
        relatedParams: ['userSegments', 'splittingStrategy']
      });
    }

    // 序贯优化建议
    if (params.variables && params.variables.length === 1 && !params.duration?.autoStopConditions) {
      suggestions.push({
        type: 'sequential_optimization',
        title: '启用序贯检验',
        description: '单变量实验建议启用序贯检验，可在达到统计显著性时提前停止',
        confidence: 0.75,
        priority: 'low',
        category: 'statistics',
        impact: '缩短实验时间，降低机会成本',
        implementationEffort: 'medium',
        relatedParams: ['duration']
      });
    }

    // 风险缓解建议
    if (params.trafficRatio && Math.max(...params.trafficRatio) > 80) {
      suggestions.push({
        type: 'risk_mitigation',
        title: '流量分配风险提醒',
        description: '高比例流量分配给实验组存在风险，建议先小流量验证',
        confidence: 0.9,
        priority: 'high',
        category: 'risk',
        impact: '降低实验失败对业务的影响',
        implementationEffort: 'low',
        relatedParams: ['trafficRatio']
      });
    }

    // 根据优先级和置信度排序
    return suggestions
      .sort((a, b) => {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 6); // 限制建议数量
  }

  /**
   * 获取实验模板
   */
  public getExperimentTemplates(): ExperimentTemplate[] {
    return EXPERIMENT_TEMPLATES;
  }

  /**
   * 基于模板补充参数（增强版）
   */
  public applyTemplate(templateId: string, userParams: ExtractedExperimentParams): ExtractedExperimentParams {
    const template = EXPERIMENT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return userParams;

    const mergedParams = {
      ...template.params,
      ...userParams,
      extractionConfidence: Math.max(userParams.extractionConfidence, 0.85)
    };

    // 特殊处理：确保数组参数正确合并
    if (template.params.trafficRatio && !userParams.trafficRatio) {
      mergedParams.trafficRatio = [...template.params.trafficRatio];
    }

    if (template.params.variables && userParams.models) {
      // 根据用户选择的模型更新变量配置
      mergedParams.variables = template.params.variables?.map(v => {
        if (v.name === 'model' && userParams.models) {
          return { ...v, values: userParams.models };
        }
        return v;
      });
    }

    return mergedParams;
  }

  /**
   * 生成变量组合
   */
  public generateVariableCombinations(variables: any[]): VariableCombination[] {
    if (!variables || variables.length === 0) return [];

    const combinations: VariableCombination[] = [];
    const generateCombos = (varIndex: number, currentCombo: Record<string, any>) => {
      if (varIndex >= variables.length) {
        const id = Object.entries(currentCombo).map(([k, v]) => `${k}_${v}`).join('_');
        combinations.push({
          id,
          variables: { ...currentCombo },
          expectedTrafficRatio: 100 / Math.pow(2, variables.length), // 均匀分配
          groupName: this.generateGroupName(currentCombo),
          description: this.generateGroupDescription(currentCombo),
          isControl: varIndex === 0 // 第一个组合作为对照组
        });
        return;
      }

      const variable = variables[varIndex];
      for (const value of variable.values) {
        generateCombos(varIndex + 1, { ...currentCombo, [variable.name]: value });
      }
    };

    generateCombos(0, {});
    return combinations;
  }

  private generateGroupName(combo: Record<string, any>): string {
    return Object.entries(combo)
      .map(([key, value]) => `${key}=${value}`)
      .join('_');
  }

  private generateGroupDescription(combo: Record<string, any>): string {
    return Object.entries(combo)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  /**
   * 评估实验配置质量
   */
  public assessConfigurationQuality(params: ExtractedExperimentParams, intent: ExperimentIntent): {
    score: number;
    feedback: string[];
    recommendations: string[];
  } {
    let score = 0;
    const feedback: string[] = [];
    const recommendations: string[] = [];

    // 基础配置完整性 (40分)
    if (params.models && params.models.length >= 2) {
      score += 15;
      feedback.push('✅ 模型配置完整');
    } else {
      feedback.push('⚠️ 缺少对比模型');
      recommendations.push('添加对比模型以获得更有价值的实验结果');
    }

    if (params.primaryMetric) {
      score += 10;
      feedback.push('✅ 主要指标已设定');
    } else {
      feedback.push('❌ 缺少主要评估指标');
      recommendations.push('设定明确的主要指标来衡量实验成功');
    }

    if (params.trafficRatio && params.trafficRatio.length > 0) {
      score += 8;
      feedback.push('✅ 流量分配已配置');
    }

    if (params.duration?.minDays && params.duration.minDays >= 7) {
      score += 7;
      feedback.push('✅ 实验时长合理');
    } else {
      feedback.push('⚠️ 实验时长可能不足');
      recommendations.push('延长实验时间至少7天以获得可靠结果');
    }

    // 高级配置 (30分)
    if (params.budget?.maxCost) {
      score += 10;
      feedback.push('✅ 预算控制已设置');
    }

    if (params.secondaryMetrics && params.secondaryMetrics.length > 0) {
      score += 8;
      feedback.push('✅ 包含次要指标');
    }

    if (params.variables && params.variables.length > 1) {
      score += 12;
      feedback.push('✅ 多变量设计');
    }

    // 质量和风险控制 (30分)
    if (params.extractionConfidence >= 0.8) {
      score += 15;
      feedback.push('✅ 解析置信度高');
    } else if (params.extractionConfidence >= 0.6) {
      score += 8;
      feedback.push('⚠️ 解析置信度中等');
    } else {
      feedback.push('❌ 解析置信度低');
      recommendations.push('提供更详细的实验描述以提高配置准确性');
    }

    if (params.duration?.autoStopConditions && params.duration.autoStopConditions.length > 0) {
      score += 8;
      feedback.push('✅ 设置了自动停止条件');
    }

    if (!params.trafficRatio?.some(ratio => ratio > 90)) {
      score += 7;
      feedback.push('✅ 流量分配风险可控');
    } else {
      feedback.push('⚠️ 高流量分配存在风险');
      recommendations.push('考虑降低实验组流量分配以控制风险');
    }

    return {
      score: Math.min(100, score),
      feedback,
      recommendations
    };
  }
}

// 单例导出
export const experimentIntentParser = new ExperimentIntentParser();

// 导出配置常量供其他模块使用
export { INTENT_KEYWORDS, PARAMETER_PATTERNS, EXPERIMENT_TEMPLATES, CONFIDENCE_STRATEGY };