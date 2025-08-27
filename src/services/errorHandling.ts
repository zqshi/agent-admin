/**
 * 错误处理和用户反馈机制
 */

export interface ErrorContext {
  userInput: string;
  parseResult?: any;
  timestamp: Date;
  sessionId: string;
  userAgent: string;
}

export interface UserFeedback {
  type: 'positive' | 'negative' | 'suggestion';
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  context: ErrorContext;
  category: 'parsing_accuracy' | 'suggestion_quality' | 'ui_experience' | 'performance';
}

export interface ParseError {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  userMessage: string;
  suggestions: string[];
  recoveryActions: string[];
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: Array<{ error: ParseError; context: ErrorContext }> = [];
  private feedbackLog: UserFeedback[] = [];

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * 处理解析错误
   */
  public handleParseError(error: any, context: ErrorContext): ParseError {
    const parseError = this.categorizeError(error, context);
    
    // 记录错误日志
    this.errorLog.push({ error: parseError, context });
    
    // 限制日志大小
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }
    
    return parseError;
  }

  /**
   * 错误分类和处理
   */
  private categorizeError(error: any, context: ErrorContext): ParseError {
    // 输入太短
    if (!context.userInput || context.userInput.trim().length < 5) {
      return {
        code: 'INPUT_TOO_SHORT',
        message: 'User input is too short',
        severity: 'medium',
        userMessage: '请提供更详细的实验描述，至少包含您想测试的内容和期望目标',
        suggestions: [
          '描述您想要对比的模型或配置',
          '说明实验的主要目的（如提升响应质量、降低成本等）',
          '指定期望的评估指标（如用户满意度、任务完成率）'
        ],
        recoveryActions: [
          '查看示例输入获取灵感',
          '使用快速模板开始',
          '尝试语音输入功能'
        ]
      };
    }

    // 意图识别失败
    if (error.type === 'INTENT_RECOGNITION_FAILED') {
      return {
        code: 'INTENT_UNCLEAR',
        message: 'Failed to recognize experiment intent',
        severity: 'high',
        userMessage: '无法准确理解您的实验意图，请尝试更明确的表述',
        suggestions: [
          '使用关键词如"对比"、"测试"、"优化"来明确意图',
          '说明具体要对比的对象（模型、参数、提示词等）',
          '描述预期的改进方向或目标'
        ],
        recoveryActions: [
          '重新组织语言表述',
          '选择相似的模板作为起点',
          '分步骤描述实验需求'
        ]
      };
    }

    // 参数提取不完整
    if (error.type === 'PARAMETER_EXTRACTION_INCOMPLETE') {
      return {
        code: 'MISSING_PARAMETERS',
        message: 'Critical parameters could not be extracted',
        severity: 'medium',
        userMessage: '实验配置缺少关键信息，请补充以下内容',
        suggestions: [
          '明确指定要对比的模型或配置',
          '说明流量分配比例（如50%对50%）',
          '设定实验运行时长和预算限制'
        ],
        recoveryActions: [
          '逐步完善实验描述',
          '使用模板填充缺失参数',
          '查看参数提示和建议'
        ]
      };
    }

    // 配置冲突
    if (error.type === 'CONFIGURATION_CONFLICT') {
      return {
        code: 'CONFIG_CONFLICT',
        message: 'Conflicting configuration detected',
        severity: 'high',
        userMessage: '检测到实验配置冲突，请检查以下问题',
        suggestions: [
          '确保流量分配总和为100%',
          '检查预算限制是否合理',
          '验证实验时长设置是否可行'
        ],
        recoveryActions: [
          '修正冲突的配置项',
          '使用推荐的默认值',
          '简化实验设计复杂度'
        ]
      };
    }

    // 网络或服务错误
    if (error.type === 'NETWORK_ERROR' || error.type === 'SERVICE_ERROR') {
      return {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        severity: 'high',
        userMessage: '服务暂时不可用，请稍后重试',
        suggestions: [
          '检查网络连接状态',
          '稍后再试或联系技术支持',
          '保存当前输入内容以备后用'
        ],
        recoveryActions: [
          '刷新页面重新尝试',
          '使用离线模式（如果可用）',
          '联系技术支持团队'
        ]
      };
    }

    // 默认未知错误
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred',
      severity: 'medium',
      userMessage: '遇到未知问题，我们正在努力解决',
      suggestions: [
        '尝试重新表述您的需求',
        '使用更简单的实验设计',
        '检查输入格式是否正确'
      ],
      recoveryActions: [
        '重新开始实验创建',
        '联系技术支持',
        '查看帮助文档'
      ]
    };
  }

  /**
   * 记录用户反馈
   */
  public recordFeedback(feedback: UserFeedback): void {
    this.feedbackLog.push(feedback);
    
    // 限制反馈日志大小
    if (this.feedbackLog.length > 500) {
      this.feedbackLog.shift();
    }
    
    // 分析反馈模式
    this.analyzeFeedbackPatterns();
  }

  /**
   * 分析反馈模式
   */
  private analyzeFeedbackPatterns(): void {
    const recentFeedback = this.feedbackLog.slice(-50);
    
    // 统计负面反馈的常见原因
    const negativeFeedback = recentFeedback.filter(f => f.type === 'negative');
    const commonIssues = this.groupBy(negativeFeedback, 'category');
    
    // 如果某类问题频繁出现，记录日志
    Object.entries(commonIssues).forEach(([category, issues]) => {
      if (issues.length > 5) {
        console.warn(`High frequency of negative feedback in category: ${category}`, issues);
      }
    });
  }

  /**
   * 获取改进建议
   */
  public getImprovementSuggestions(userInput: string, context?: any): string[] {
    const suggestions: string[] = [];
    
    // 基于输入长度的建议
    if (userInput.length < 20) {
      suggestions.push('尝试提供更详细的实验描述');
    }
    
    // 基于关键词的建议
    if (!this.containsExperimentKeywords(userInput)) {
      suggestions.push('使用明确的实验相关词汇，如"对比"、"测试"、"优化"');
    }
    
    // 基于历史错误的建议
    const commonErrors = this.getCommonErrorPatterns();
    commonErrors.forEach(error => {
      if (this.inputMatchesErrorPattern(userInput, error.pattern)) {
        suggestions.push(...error.suggestions);
      }
    });
    
    return suggestions.slice(0, 3); // 限制建议数量
  }

  /**
   * 智能修复建议
   */
  public getSmartFixSuggestions(parseResult: any, userInput: string): Array<{
    title: string;
    description: string;
    action: string;
    confidence: number;
  }> {
    const fixes = [];
    
    // 模型缺失修复
    if (!parseResult?.extractedParams?.models || parseResult.extractedParams.models.length < 2) {
      fixes.push({
        title: '添加对比模型',
        description: '实验需要至少两个模型进行对比',
        action: 'add_comparison_model',
        confidence: 0.9
      });
    }
    
    // 流量分配修复
    if (!parseResult?.extractedParams?.trafficRatio) {
      fixes.push({
        title: '设置流量分配',
        description: '建议设置50/50的均匀流量分配',
        action: 'set_traffic_ratio',
        confidence: 0.8
      });
    }
    
    // 指标缺失修复
    if (!parseResult?.extractedParams?.primaryMetric) {
      fixes.push({
        title: '选择主要指标',
        description: '建议使用"任务完成率"作为主要评估指标',
        action: 'set_primary_metric',
        confidence: 0.85
      });
    }
    
    return fixes.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 渐进式引导
   */
  public getProgressiveGuidance(step: number, context: any): {
    title: string;
    description: string;
    examples: string[];
    nextStep?: string;
  } {
    const guidanceSteps = {
      1: {
        title: '第1步：描述实验目的',
        description: '简单说明您想要测试什么',
        examples: [
          '我想测试哪个模型效果更好',
          '我想优化响应速度',
          '我想降低使用成本'
        ],
        nextStep: '选择对比对象'
      },
      2: {
        title: '第2步：指定对比对象',
        description: '说明要对比的具体内容',
        examples: [
          'GPT-4 vs Claude-3',
          '温度参数 0.2 vs 0.7',
          '新提示词 vs 旧提示词'
        ],
        nextStep: '设置实验参数'
      },
      3: {
        title: '第3步：设置基本参数',
        description: '指定流量分配和运行时间',
        examples: [
          '各分配50%流量',
          '运行7天',
          '预算限制1000美元'
        ],
        nextStep: '选择评估指标'
      }
    };
    
    return guidanceSteps[step as keyof typeof guidanceSteps] || guidanceSteps[1];
  }

  // 工具方法
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      groups[groupKey] = groups[groupKey] || [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private containsExperimentKeywords(input: string): boolean {
    const keywords = ['对比', '测试', '优化', '实验', 'vs', '比较', '提升', '改进'];
    return keywords.some(keyword => input.toLowerCase().includes(keyword.toLowerCase()));
  }

  private getCommonErrorPatterns(): Array<{
    pattern: string;
    suggestions: string[];
  }> {
    // 基于历史错误数据的常见模式
    return [
      {
        pattern: '只提到一个模型',
        suggestions: ['添加另一个模型进行对比', '考虑使用不同参数设置']
      },
      {
        pattern: '没有提到指标',
        suggestions: ['明确说明要关注的评估指标', '如响应时间、准确率或用户满意度']
      }
    ];
  }

  private inputMatchesErrorPattern(input: string, pattern: string): boolean {
    // 简化的模式匹配逻辑
    return input.length < 30 && pattern.includes('只提到一个模型');
  }

  /**
   * 生成错误报告
   */
  public generateErrorReport(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    commonIssues: Array<{ issue: string; frequency: number }>;
    userSatisfactionScore: number;
  } {
    const errorsByCategory = this.groupBy(this.errorLog, 'error');
    const recentFeedback = this.feedbackLog.slice(-100);
    
    // 计算用户满意度
    const avgRating = recentFeedback.reduce((sum, f) => sum + f.rating, 0) / recentFeedback.length;
    const userSatisfactionScore = (avgRating / 5) * 100;
    
    return {
      totalErrors: this.errorLog.length,
      errorsByCategory: Object.fromEntries(
        Object.entries(errorsByCategory).map(([key, errors]) => [key, errors.length])
      ),
      commonIssues: this.getTopIssues(),
      userSatisfactionScore: Math.round(userSatisfactionScore)
    };
  }

  private getTopIssues(): Array<{ issue: string; frequency: number }> {
    const issueCount: Record<string, number> = {};
    
    this.errorLog.forEach(({ error }) => {
      issueCount[error.code] = (issueCount[error.code] || 0) + 1;
    });
    
    return Object.entries(issueCount)
      .map(([issue, frequency]) => ({ issue, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);
  }
}

// 单例导出
export const errorHandler = ErrorHandler.getInstance();

// 工具函数：生成会话ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 工具函数：获取用户代理信息
export function getUserAgent(): string {
  return navigator.userAgent || 'Unknown';
}