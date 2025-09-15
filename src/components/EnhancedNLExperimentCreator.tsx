import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mic, MicOff, Send, Lightbulb, Sparkles, MessageCircle,
  RefreshCw, CheckCircle, AlertCircle, ArrowRight, Info,
  Wand2, Bot, Brain, Zap, TrendingUp, Shield, Clock,
  Target, DollarSign, Users, BarChart3, Eye, Settings,
  Volume2, VolumeX, AlertTriangle
} from 'lucide-react';
import { experimentIntentParser } from '../services/experimentIntentParser';
import ExperimentPreviewCard from './ExperimentPreviewCard';
import ProductionBaselineCard from './ProductionBaselineCard';
import ExperimentComparisonView from './ExperimentComparisonView';
import { mockCurrentProductionStrategy, getProductionStrategyComparison } from '../data/mockProductionStrategy';
import {
  NLParseResult,
  ExtractedExperimentParams,
  ParseStatus,
  ExperimentTemplate,
  ExperimentComplexity,
  ConfidenceStrategy,
  EnhancedInputContext,
  ExperimentIntent
} from '../types/nlExperiment';

interface EnhancedNLExperimentCreatorProps {
  onClose: () => void;
  onExperimentCreate: (experiment: any) => void;
}

// 预设示例（全面升级版）
const EXAMPLE_INPUTS = [
  {
    category: '基础对比',
    icon: <BarChart3 className="h-4 w-4" />,
    examples: [
      "我想测试GPT-4和Claude-3在客服场景的效果，各分配50%流量，运行7天",
      "对比GPT-3.5和GPT-4的响应质量和成本效率，预算限制1000美元",
      "测试新提示词效果：70%新版本，30%旧版本，主要看用户满意度"
    ]
  },
  {
    category: '多变量实验',
    icon: <Target className="h-4 w-4" />,
    examples: [
      "同时测试模型（GPT-4 vs Claude-3）和温度参数（0.2 vs 0.7）的组合效果",
      "正交实验：测试提示词版本和工具组合的最佳搭配",
      "多因素分析：模型、温度、max_tokens三个变量的交互影响"
    ]
  },
  {
    category: '分层实验',
    icon: <Users className="h-4 w-4" />,
    examples: [
      "新用户用简化版模型，老用户用完整版，比较转化率差异",
      "按地区分层：北美用户测试英文优化版，亚洲用户测试多语言版",
      "按使用频率分组：高频用户测试高级功能，普通用户测试标准版"
    ]
  },
  {
    category: '成本优化',
    icon: <DollarSign className="h-4 w-4" />,
    examples: [
      "在1000美元预算内找到成本效益最优的模型配置",
      "对比高端模型vs中端模型在特定任务上的性价比",
      "预算限制500美元，优化响应速度和质量的平衡点"
    ]
  }
];

// 置信度颜色映射
const CONFIDENCE_COLORS = {
  high: 'text-green-700 bg-green-50 border-green-200',
  medium: 'text-yellow-700 bg-yellow-50 border-yellow-200', 
  low: 'text-red-700 bg-red-50 border-red-200'
} as const;

// 复杂度颜色映射
const COMPLEXITY_COLORS = {
  simple: 'text-blue-700 bg-blue-50 border-blue-200',
  medium: 'text-orange-700 bg-orange-50 border-orange-200',
  complex: 'text-red-700 bg-red-50 border-red-200',
  advanced: 'text-purple-700 bg-purple-50 border-purple-200'
} as const;

// 智能提示词库
const SUGGESTION_KEYWORDS = {
  models: ['GPT-4', 'GPT-3.5', 'Claude-3', 'Claude-3-opus', 'Claude-3-sonnet', '模型对比'],
  metrics: ['任务完成率', '响应时间', '用户满意度', 'Token成本', '转化率', '准确率'],
  duration: ['7天', '14天', '30天', '一周', '两周', '一个月'],
  traffic: ['50%', '70%', '80%', '均匀分配', '对半分', '小流量测试'],
  actions: ['测试', '对比', '优化', '分析', '实验', '验证'],
  scenarios: ['客服场景', '内容生成', '代码助手', '问答系统', '文档处理'],
  budgets: ['1000美元', '500美元', '2000美元', '预算限制'],
  common_phrases: [
    '测试{model1}和{model2}的效果',
    '在{scenario}下对比性能',
    '优化{metric}指标',
    '运行{duration}的实验',
    '预算控制在{budget}'
  ]
};

// 智能提示触发词
const TRIGGER_WORDS = {
  models: ['模型', 'gpt', 'claude', 'llama'],
  metrics: ['指标', '成功率', '时间', '满意度', '成本'],
  duration: ['天', '周', '月', '时间', '运行'],
  traffic: ['流量', '分配', '%', '比例'],
  budget: ['预算', '成本', '费用', '美元', '元']
};

const EnhancedNLExperimentCreator: React.FC<EnhancedNLExperimentCreatorProps> = ({
  onClose,
  onExperimentCreate
}) => {
  // 基础状态
  const [userInput, setUserInput] = useState('');
  const [parseResult, setParseResult] = useState<NLParseResult | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ExperimentTemplate | null>(null);
  
  // 增强功能状态
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [experimentComplexity, setExperimentComplexity] = useState<ExperimentComplexity | null>(null);
  const [confidenceBreakdown, setConfidenceBreakdown] = useState<Record<string, number> | null>(null);

  // 智能提示相关状态
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputSuggestions, setInputSuggestions] = useState<string[]>([]);
  const [highlightedSuggestion, setHighlightedSuggestion] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    input: string;
    response: string;
    timestamp: Date;
  }>>([]);

  // 对照基准相关状态
  const [showProductionBaseline, setShowProductionBaseline] = useState(true);
  const [comparisonData, setComparisonData] = useState<any>(null);
  
  // 引用
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取模板
  const templates = experimentIntentParser.getExperimentTemplates();

  // 检测语音输入支持
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setVoiceSupported(!!SpeechRecognition);
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(prev => prev + ' ' + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // 语音输入控制
  const toggleVoiceInput = useCallback(() => {
    if (!voiceSupported || !recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }, [isListening, voiceSupported]);

  // 解析用户输入（增强版 - 移除人工延迟）
  const parseUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setParseStatus('parsing');
    setShowPreview(false);
    setParseResult(null);

    // 使用真实的解析时间，无人工延迟

    try {
      // 构建增强上下文
      const context: EnhancedInputContext = {
        userInput: input,
        conversationHistory,
        userProfile: {
          experienceLevel: 'intermediate',
          commonExperimentTypes: ['comparison', 'optimization'],
          preferredModels: ['gpt-4-turbo', 'claude-3-opus'],
          typicalBudget: 1000
        },
        projectContext: {
          domain: 'ai_assistant',
          targetMetrics: ['task_success_rate', 'user_satisfaction'],
          constraints: []
        },
        seasonality: {
          timeOfDay: new Date().getHours() < 18 ? 'business_hours' : 'after_hours',
          dayOfWeek: new Date().getDay() === 0 || new Date().getDay() === 6 ? 'weekend' : 'weekday',
          businessCycle: 'normal'
        }
      };

      // 调用解析服务
      const result = experimentIntentParser.parseInput(input, context);

      // 验证解析结果
      if (!result || !result.extractedParams) {
        throw new Error('解析结果无效');
      }

      // 确保最低置信度
      if (result.extractedParams.extractionConfidence < 0.3) {
        result.extractedParams.extractionConfidence = 0.3;
        result.suggestions.unshift('输入描述较为简单，建议添加更多实验细节信息');
      }

      // 评估实验配置质量
      const configQuality = experimentIntentParser.assessConfigurationQuality(
        result.extractedParams,
        result.intent
      );

      setParseResult(result);
      setConfidenceBreakdown(result.extractedParams.confidenceBreakdown || null);

      // 根据置信度设置状态
      if (result.extractedParams.extractionConfidence >= 0.7) {
        setParseStatus('success');
        setShowPreview(true);
      } else if (result.extractedParams.extractionConfidence >= 0.4) {
        setParseStatus('needs_clarification');
        setShowPreview(true);
      } else {
        setParseStatus('error');
        // 提供具体的改进建议
        result.suggestions = [
          '请提供更详细的实验描述，包括：',
          '• 要对比的模型或配置',
          '• 主要关注的指标',
          '• 预期的流量分配',
          '• 计划的实验时长'
        ];
      }

      // 记录会话历史
      setConversationHistory(prev => [...prev, {
        input,
        response: result.intent.description,
        timestamp: new Date()
      }]);

      // 生成对比数据
      if (result.extractedParams.extractionConfidence >= 0.4) {
        const comparison = getProductionStrategyComparison({
          model: result.extractedParams.models?.[0] || mockCurrentProductionStrategy.config.model,
          temperature: result.extractedParams.temperatures?.[0] || mockCurrentProductionStrategy.config.temperature,
          maxTokens: result.extractedParams.maxTokens?.[0] || mockCurrentProductionStrategy.config.maxTokens,
          tools: result.extractedParams.tools || mockCurrentProductionStrategy.config.tools
        });
        setComparisonData(comparison);
      } else {
        setComparisonData(null);
      }

    } catch (error) {
      console.error('解析失败:', error);
      const errorResult = handleParsingError(error, input);
      setParseStatus(errorResult.status);
      setParseResult(errorResult.result);
    }
  }, [conversationHistory]);

  // 增强的错误处理机制
  const handleParsingError = useCallback((error: unknown, input: string) => {
    let errorType = 'unknown';
    let errorMessage = '未知错误';
    let suggestions: string[] = [];
    let status: ParseStatus = 'error';

    // 分析错误类型
    if (error instanceof Error) {
      errorMessage = error.message;

      if (error.message.includes('解析结果无效')) {
        errorType = 'invalid_result';
        status = 'error';
        suggestions = [
          '输入内容无法被正确解析，请检查：',
          '• 是否包含明确的实验目标',
          '• 模型名称是否正确（如 GPT-4、Claude-3）',
          '• 是否提到了关键指标'
        ];
      } else if (error.message.includes('输入描述过短')) {
        errorType = 'input_too_short';
        status = 'needs_clarification';
        suggestions = [
          '请提供更详细的实验描述，例如：',
          '• "测试GPT-4和Claude-3在客服场景的效果"',
          '• "比较两个模型的响应速度和准确性"',
          '• "优化提示词提升用户满意度"'
        ];
      } else if (error.message.includes('网络') || error.message.includes('timeout')) {
        errorType = 'network_error';
        status = 'error';
        suggestions = [
          '网络连接问题，请：',
          '• 检查网络连接',
          '• 稍后重试',
          '• 或使用离线模式'
        ];
      }
    }

    // 根据输入长度提供不同建议
    if (input.length < 10) {
      suggestions.unshift('输入过短，建议至少包含20个字符的描述');
    } else if (input.length > 500) {
      suggestions.unshift('输入过长，建议精简到重点信息');
    }

    // 构建错误结果
    const result: NLParseResult = {
      intent: {
        type: 'comparison',
        confidence: 0.2,
        description: '无法识别实验意图'
      },
      extractedParams: {
        extractionConfidence: 0.2,
        name: `解析失败的实验_${Date.now()}`
      },
      missingParams: {
        required: [
          {
            field: 'models',
            description: '请至少选择一个模型进行测试',
            options: ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
            default: ['gpt-4-turbo']
          },
          {
            field: 'primaryMetric',
            description: '请选择主要评估指标',
            options: ['task_success_rate', 'response_time', 'user_satisfaction', 'token_cost'],
            default: 'task_success_rate'
          }
        ],
        optional: [
          {
            field: 'duration',
            description: '实验运行时长（天数）',
            options: [3, 7, 14, 21, 30],
            default: 7
          }
        ]
      },
      suggestions: suggestions.length > 0 ? suggestions : [
        '请尝试重新描述您的实验需求',
        '可以参考左侧的示例输入',
        '或点击模板快速开始'
      ],
      errors: [`错误类型: ${errorType}`, `详细信息: ${errorMessage}`]
    };

    return { status, result };
  }, []);

  // 生成智能提示建议
  const generateSuggestions = useCallback((input: string, cursorPos: number): string[] => {
    const suggestions: string[] = [];
    const inputLower = input.toLowerCase();
    const words = inputLower.split(/\s+/);
    const currentWord = getCurrentWord(input, cursorPos);

    // 基于触发词生成建议
    Object.entries(TRIGGER_WORDS).forEach(([category, triggerWords]) => {
      const triggered = triggerWords.some(word => inputLower.includes(word.toLowerCase()));
      if (triggered) {
        const categoryKeywords = SUGGESTION_KEYWORDS[category as keyof typeof SUGGESTION_KEYWORDS];
        if (categoryKeywords) {
          suggestions.push(...categoryKeywords.filter(suggestion =>
            suggestion.toLowerCase().includes(currentWord.toLowerCase()) ||
            currentWord.toLowerCase().includes(suggestion.toLowerCase())
          ));
        }
      }
    });

    // 基于当前输入上下文的建议
    if (currentWord.length >= 2) {
      // 模型名称建议
      if (/^(gpt|claude|llama)/i.test(currentWord)) {
        suggestions.push(...SUGGESTION_KEYWORDS.models.filter(model =>
          model.toLowerCase().startsWith(currentWord.toLowerCase())
        ));
      }

      // 数字相关建议（天数、百分比等）
      if (/^\d+/.test(currentWord)) {
        suggestions.push(...SUGGESTION_KEYWORDS.duration.filter(duration =>
          duration.startsWith(currentWord)
        ));
        suggestions.push(...SUGGESTION_KEYWORDS.traffic.filter(traffic =>
          traffic.startsWith(currentWord)
        ));
      }

      // 动作词建议
      if (['测', '对', '优', '分', '实', '验'].some(char => currentWord.includes(char))) {
        suggestions.push(...SUGGESTION_KEYWORDS.actions.filter(action =>
          action.includes(currentWord) || currentWord.includes(action)
        ));
      }
    }

    // 智能短语建议
    if (input.length > 5) {
      const contextSuggestions = generateContextualPhrases(inputLower);
      suggestions.push(...contextSuggestions);
    }

    // 去重并限制数量
    return [...new Set(suggestions)].slice(0, 8);
  }, []);

  // 获取光标位置的当前单词
  const getCurrentWord = useCallback((text: string, position: number): string => {
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);

    const wordStart = Math.max(
      beforeCursor.lastIndexOf(' '),
      beforeCursor.lastIndexOf('，'),
      beforeCursor.lastIndexOf(',')
    ) + 1;

    const wordEnd = position + afterCursor.search(/[\s，,]|$/);

    return text.substring(wordStart, wordEnd);
  }, []);

  // 生成上下文相关的短语建议
  const generateContextualPhrases = useCallback((input: string): string[] => {
    const phrases: string[] = [];

    // 检测已有内容，生成补全建议
    if (input.includes('测试') && !input.includes('效果')) {
      phrases.push('的效果对比');
    }

    if (input.includes('模型') && !input.includes('运行')) {
      phrases.push('运行7天', '运行14天');
    }

    if (input.includes('预算') && !input.includes('美元')) {
      phrases.push('1000美元', '500美元');
    }

    if (input.includes('流量') && !input.includes('%')) {
      phrases.push('各50%', '70%和30%');
    }

    if (input.includes('关注') && !input.includes('指标')) {
      phrases.push('任务完成率', '用户满意度', '响应时间');
    }

    return phrases;
  }, []);

  // 处理输入提交
  const handleSubmit = () => {
    if (userInput.trim()) {
      parseUserInput(userInput);
    }
  };

  // 处理示例点击（增强版）
  const handleExampleClick = (example: string) => {
    setUserInput(example);
    // 聚焦到文本框并自动解析
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(example.length, example.length);
      }
    }, 100);
    parseUserInput(example);
  };

  // 处理模板应用（增强版）
  const handleTemplateApply = (template: ExperimentTemplate) => {
    setActiveTemplate(template);
    const exampleText = template.examples[0];
    setUserInput(exampleText);
    // 应用模板默认参数并解析
    parseUserInput(exampleText);
  };

  // 处理参数更新
  const handleParamUpdate = (field: string, value: any) => {
    if (!parseResult) return;

    const updatedParams = { ...parseResult.extractedParams, [field]: value };

    // 重新计算缺失参数，基于更新后的参数
    const updatedMissingParams = recalculateMissingParams(updatedParams, parseResult.intent);

    const updatedResult = {
      ...parseResult,
      extractedParams: updatedParams,
      missingParams: updatedMissingParams
    };

    setParseResult(updatedResult);
  };

  // 重新计算缺失参数
  const recalculateMissingParams = (params: ExtractedExperimentParams, intent: ExperimentIntent) => {
    const required = [];
    const optional = [];

    // 基于实验类型的要求
    const requirementsByType = {
      comparison: { minModels: 2, requiresPrimary: true, requiresBudget: false },
      multivariate: { minModels: 1, requiresPrimary: true, requiresBudget: false },
      stratified: { minModels: 1, requiresPrimary: true, requiresBudget: false },
      optimization: { minModels: 1, requiresPrimary: true, requiresBudget: false },
      exploration: { minModels: 1, requiresPrimary: false, requiresBudget: false },
      cost_analysis: { minModels: 1, requiresPrimary: true, requiresBudget: true }
    };

    const requirements = requirementsByType[intent.type] || requirementsByType.comparison;

    // 检查模型
    if (!params.models || params.models.length < requirements.minModels) {
      required.push({
        field: 'models',
        description: `请选择至少${requirements.minModels}个模型`,
        options: ['gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet'],
        default: requirements.minModels === 1 ? ['gpt-4-turbo'] : ['gpt-4-turbo', 'claude-3-opus']
      });
    }

    // 检查主要指标
    if (requirements.requiresPrimary && !params.primaryMetric) {
      required.push({
        field: 'primaryMetric',
        description: '请选择主要评估指标',
        options: ['task_success_rate', 'response_time', 'user_satisfaction', 'token_cost'],
        default: 'task_success_rate'
      });
    }

    // 检查预算（对于成本分析类型）
    if (requirements.requiresBudget && (!params.budget || !params.budget.maxCost)) {
      required.push({
        field: 'budget',
        description: '请设置实验预算',
        options: [500, 1000, 2000, 5000],
        default: { maxCost: 1000, dailyLimit: 200 }
      });
    }

    // 可选参数检查
    if (!params.duration) {
      optional.push({
        field: 'duration',
        description: '实验运行时长（天数）',
        options: [3, 7, 14, 21, 30],
        default: { minDays: 7, maxDays: 14 }
      });
    }

    if (!params.trafficRatio) {
      optional.push({
        field: 'trafficRatio',
        description: '流量分配比例',
        options: [[50, 50], [70, 30], [80, 20]],
        default: [50, 50]
      });
    }

    return { required, optional };
  };

  // 创建实验
  const handleCreateExperiment = async () => {
    if (!parseResult) return;

    setIsCreating(true);
    
    try {
      // 构建实验配置
      const experimentConfig = {
        id: Date.now().toString(),
        name: parseResult.extractedParams.name || '智能创建的A/B实验',
        description: parseResult.extractedParams.description || `基于自然语言输入：${userInput}`,
        status: 'draft' as const,
        creationType: 'ai_created' as const,
        creator: {
          type: 'ai' as const,
          name: 'AI实验助手',
          id: 'ai_assistant'
        },
        startDate: new Date().toISOString().split('T')[0],
        groups: createExperimentGroups(parseResult.extractedParams),
        config: createExperimentConfig(parseResult.extractedParams),
        metrics: createMockMetrics(),
        createdAt: new Date().toISOString(),
        nlContext: {
          originalInput: userInput,
          parseResult: parseResult,
          template: activeTemplate?.id,
          confidence: parseResult.extractedParams.extractionConfidence,
          complexity: experimentComplexity
        }
      };

      // 模拟创建延迟
      await new Promise(resolve => setTimeout(resolve, 2000));

      onExperimentCreate(experimentConfig);
      onClose();
    } catch (error) {
      console.error('创建实验失败:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // 创建实验组配置
  const createExperimentGroups = (params: ExtractedExperimentParams) => {
    const models = params.models || ['gpt-4-turbo', 'claude-3-opus'];
    const trafficRatio = params.trafficRatio || [50, 50];
    
    return models.map((model, index) => ({
      id: index === 0 ? 'control' : `treatment_${index}`,
      name: index === 0 ? '对照组' : `实验组${index}`,
      description: `使用${model}模型的实验组`,
      trafficRatio: trafficRatio[index] || (100 / models.length),
      config: {
        model,
        prompt: params.prompts?.[index] || '你是一个专业的AI助手，请帮助用户解决问题。',
        temperature: params.temperatures?.[index] || 0.7,
        topP: params.topP?.[index] || 1.0,
        maxTokens: params.maxTokens?.[index] || 2000,
        seed: 12345,
        tools: params.tools || ['search', 'calculator']
      },
      realTimeMetrics: {
        currentSessions: 0,
        totalSessions: 0,
        conversionRate: 0,
        avgMetricValues: {
          taskSuccessRate: 0,
          avgResponseTime: 0,
          userSatisfaction: 0
        },
        costSpent: 0,
        sampleDistribution: []
      }
    }));
  };

  // 创建实验配置
  const createExperimentConfig = (params: ExtractedExperimentParams) => ({
    splittingStrategy: params.splittingStrategy || 'session',
    stratificationDimensions: params.stratificationDimensions || ['user_segment', 'time_of_day'],
    environmentControl: {
      fixedSeed: 12345,
      temperature: 0.7,
      consistentParams: true
    },
    complexityLevel: experimentComplexity?.level || 'medium' as const,
    budget: {
      maxCost: params.budget?.maxCost || 1000,
      dailyLimit: params.budget?.dailyLimit,
      currentSpent: 0
    },
    duration: {
      minDays: params.duration?.minDays || 7,
      maxDays: params.duration?.maxDays || 30,
      targetSamples: params.duration?.targetSamples,
      autoStop: true
    },
    metrics: {
      primary: params.primaryMetric || 'task_success_rate',
      secondary: params.secondaryMetrics || ['response_time', 'user_satisfaction']
    },
    stopCriteria: {
      statistical: true,
      practical: true,
      pValue: 0.05,
      minEffectSize: 0.2
    },
    variables: params.variables || [],
    userSegments: params.userSegments || []
  });

  // 创建模拟指标
  const createMockMetrics = () => ({
    businessMetrics: {
      taskSuccessRate: 0,
      userValueDensity: 0,
      retentionRate7d: 0,
      retentionRate30d: 0,
      userActivation: 0
    },
    supportMetrics: {
      effectiveInteractionDepth: 0,
      clarificationRequestRatio: 0,
      firstResponseHitRate: 0,
      timeToResolution: 0,
      knowledgeCoverage: 0
    },
    technicalMetrics: {
      totalSessions: 0,
      successRate: 0,
      avgResponseTime: 0,
      p95ResponseTime: 0,
      avgTokenCost: 0,
      tokenCostPerSession: 0,
      retryRate: 0,
      earlyExitRate: 0,
      toolCallSuccessRate: 0,
      modelFailureRate: 0
    }
  });

  // 重置状态（增强版）
  const handleReset = () => {
    setUserInput('');
    setParseResult(null);
    setParseStatus('idle');
    setShowPreview(false);
    setActiveTemplate(null);
    setSelectedCategory(0);
    setExperimentComplexity(null);
    setConfidenceBreakdown(null);
    setShowAdvancedOptions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // 获取置信度级别
  const getConfidenceLevel = (confidence: number): 'high' | 'medium' | 'low' => {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  };

  // 获取置信度描述
  const getConfidenceDescription = (level: 'high' | 'medium' | 'low') => {
    const descriptions = {
      high: '解析准确，可直接创建实验',
      medium: '解析基本正确，建议确认关键参数',
      low: '解析存在不确定性，需要补充信息'
    };
    return descriptions[level];
  };

  // 实时输入验证和智能提示
  const handleInputChange = useCallback((value: string, selectionStart?: number) => {
    setUserInput(value);

    const cursor = selectionStart || value.length;
    setCursorPosition(cursor);

    // 生成智能提示
    if (value.length > 0 && cursor > 0) {
      const suggestions = generateSuggestions(value, cursor);
      setInputSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
      setHighlightedSuggestion(-1);
    } else {
      setShowSuggestions(false);
      setInputSuggestions([]);
    }

    // 实时验证和提示
    if (value.length > 100 && !parseResult) {
      console.log('输入内容较多，可以点击解析按钮获得智能配置建议');
    }
  }, [parseResult, generateSuggestions]);

  // 处理建议选择
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const currentInput = userInput;
    const currentWord = getCurrentWord(currentInput, cursorPosition);

    // 替换当前单词
    const beforeWord = currentInput.substring(0, cursorPosition - currentWord.length);
    const afterWord = currentInput.substring(cursorPosition);
    const newInput = beforeWord + suggestion + afterWord;

    setUserInput(newInput);
    setShowSuggestions(false);
    setInputSuggestions([]);

    // 设置光标位置
    setTimeout(() => {
      const newCursorPos = beforeWord.length + suggestion.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  }, [userInput, cursorPosition, getCurrentWord]);

  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedSuggestion(prev =>
          prev < inputSuggestions.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedSuggestion(prev =>
          prev > 0 ? prev - 1 : inputSuggestions.length - 1
        );
        break;

      case 'Tab':
      case 'Enter':
        if (highlightedSuggestion >= 0) {
          e.preventDefault();
          handleSuggestionSelect(inputSuggestions[highlightedSuggestion]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setHighlightedSuggestion(-1);
        break;
    }
  }, [showSuggestions, inputSuggestions, highlightedSuggestion, handleSuggestionSelect]);

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-lg">
                <Wand2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  智能实验创建助手
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </h2>
                <p className="text-blue-100 mt-1">
                  用自然语言描述您的实验需求，AI将自动生成完整的A/B测试配置
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(95vh-140px)]">
          {/* 左侧：输入区域 */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col overflow-hidden">
            {/* 模板选择（升级版） */}
            {!showPreview && (
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    快速开始模板
                  </h3>
                  <button
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Settings className="h-3 w-3" />
                    {showAdvancedOptions ? '隐藏' : '显示'}高级选项
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {templates.slice(0, 4).map((template, index) => {
                    const isActive = activeTemplate?.id === template.id;
                    return (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateApply(template)}
                        className={`text-left p-3 rounded-lg border transition-all ${
                          isActive 
                            ? 'bg-blue-100 border-blue-300 shadow-sm' 
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                          {template.intent.confidence >= 0.9 && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xs px-2 py-1 rounded border ${
                            CONFIDENCE_COLORS[getConfidenceLevel(template.intent.confidence)]
                          }`}>
                            置信度: {Math.round(template.intent.confidence * 100)}%
                          </div>
                          {template.intent.type === 'multivariate' && (
                            <div className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">
                              多变量
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* 高级选项 */}
                {showAdvancedOptions && (
                  <div className="border-t pt-3 mt-3">
                    <div className="text-xs text-gray-700 mb-2">实验复杂度偏好：</div>
                    <div className="flex gap-2">
                      {(['simple', 'medium', 'complex'] as const).map((level) => (
                        <button
                          key={level}
                          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                            COMPLEXITY_COLORS[level]
                          }`}
                        >
                          {level === 'simple' ? '简单' : level === 'medium' ? '中等' : '复杂'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 输入区域（升级版） */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    描述您的实验需求
                  </h3>
                  
                  {/* 语音输入按钮 */}
                  {voiceSupported && (
                    <button
                      onClick={toggleVoiceInput}
                      disabled={parseStatus === 'parsing'}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                        isListening 
                          ? 'bg-red-50 border-red-300 text-red-700' 
                          : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {isListening ? (
                        <>
                          <MicOff className="h-4 w-4 animate-pulse" />
                          <span className="text-sm">点击停止</span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          <span className="text-sm">语音输入</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={userInput}
                      onChange={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        handleInputChange(target.value, target.selectionStart || 0);
                      }}
                      onSelect={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        setCursorPosition(target.selectionStart || 0);
                      }}
                      onKeyDown={(e) => {
                        handleKeyDown(e);

                        // 原有的快捷键处理
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSubmit();
                        } else if (e.key === 'Escape' && !showSuggestions) {
                          e.preventDefault();
                          handleReset();
                        }
                      }}
                      onFocus={() => {
                        if (userInput.length > 0 && cursorPosition > 0) {
                          const suggestions = generateSuggestions(userInput, cursorPosition);
                          setInputSuggestions(suggestions);
                          setShowSuggestions(suggestions.length > 0);
                        }
                      }}
                      onBlur={(e) => {
                        // 延迟隐藏，允许点击建议
                        setTimeout(() => {
                          if (!e.relatedTarget?.closest('.suggestions-dropdown')) {
                            setShowSuggestions(false);
                          }
                        }, 300);
                      }}
                      placeholder="例如：我想测试GPT-4和Claude-3在客服场景的效果，各分配50%流量，运行7天，主要关注任务完成率和用户满意度。也可以说：同时测试模型和温度参数的组合效果..."
                      className="w-full h-48 p-4 pr-16 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />

                    {/* 智能提示下拉框 */}
                    {showSuggestions && inputSuggestions.length > 0 && (
                      <div className="suggestions-dropdown absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {inputSuggestions.map((suggestion, index) => (
                          <div
                            key={`${suggestion}-${index}`}
                            className={`px-4 py-2 text-sm cursor-pointer transition-colors ${
                              index === highlightedSuggestion
                                ? 'bg-blue-50 text-blue-700 border-l-2 border-blue-500'
                                : 'hover:bg-gray-50'
                            }`}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionSelect(suggestion)}
                            onMouseEnter={() => setHighlightedSuggestion(index)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="flex-1">{suggestion}</span>
                              <span className="text-xs text-gray-400 ml-2">
                                {suggestion.includes('GPT') || suggestion.includes('Claude') ? '🤖' :
                                 suggestion.includes('%') || suggestion.includes('天') ? '⚙️' :
                                 suggestion.includes('率') || suggestion.includes('时间') ? '📊' : '💡'}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div className="px-4 py-2 text-xs text-gray-500 border-t bg-gray-50">
                          💡 使用 ↑↓ 选择，Tab/Enter 确认，Esc 关闭
                        </div>
                      </div>
                    )}
                    
                    {/* 字符计数和状态指示器 */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <span className={`text-xs ${
                        userInput.length > 500 ? 'text-red-500' : 
                        userInput.length > 200 ? 'text-yellow-600' : 'text-gray-400'
                      }`}>
                        {userInput.length}/1000
                      </span>
                      {isListening && (
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-600">录音中</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 解析状态指示器（升级版） */}
                  {parseStatus !== 'idle' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        {parseStatus === 'parsing' && (
                          <>
                            <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                            <span className="text-sm text-blue-600">正在分析您的需求...</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-1 ml-2">
                              <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                          </>
                        )}
                        
                        {parseStatus === 'success' && parseResult && (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-600">
                                  解析成功！置信度: {Math.round(parseResult.extractedParams.extractionConfidence * 100)}%
                                </span>
                                <span className={`text-xs px-2 py-1 rounded border ${
                                  CONFIDENCE_COLORS[getConfidenceLevel(parseResult.extractedParams.extractionConfidence)]
                                }`}>
                                  {getConfidenceDescription(getConfidenceLevel(parseResult.extractedParams.extractionConfidence))}
                                </span>
                              </div>
                              
                              {/* 置信度详细分解 */}
                              {confidenceBreakdown && (
                                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <Target className="h-3 w-3 text-blue-500" />
                                    <span>意图识别: {Math.round((confidenceBreakdown.intentRecognition || 0) * 100)}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <BarChart3 className="h-3 w-3 text-green-500" />
                                    <span>参数提取: {Math.round((confidenceBreakdown.parameterExtraction || 0) * 100)}%</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-purple-500" />
                                    <span>配置验证: {Math.round((confidenceBreakdown.configurationValidity || 0) * 100)}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        
                        {parseStatus === 'needs_clarification' && (
                          <>
                            <Info className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm text-yellow-600">
                              解析基本成功，但建议确认以下关键参数以提高准确性
                            </span>
                          </>
                        )}
                        
                        {parseStatus === 'error' && (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm text-red-600">解析遇到问题，请尝试更详细的描述</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 增强的错误提示 */}
                  {parseResult && parseResult.errors.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-red-800 mb-3 flex items-center gap-2">
                            遇到了一些问题，别担心！
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              {parseResult.errors.length} 项需要改进
                            </span>
                          </div>

                          <div className="space-y-3">
                            {parseResult.errors.map((error, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                                <div className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-red-700 mb-2">{error}</p>

                                    {/* 根据错误类型提供快速操作 */}
                                    {error.includes('模型') && (
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => handleInputChange(userInput + ' GPT-4和Claude-3')}
                                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                                        >
                                          + 添加模型对比
                                        </button>
                                        <button
                                          onClick={() => handleExampleClick(EXAMPLE_INPUTS[0].examples[0])}
                                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                                        >
                                          📋 使用示例
                                        </button>
                                      </div>
                                    )}

                                    {error.includes('指标') && (
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => handleInputChange(userInput + ' 关注任务完成率')}
                                          className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                                        >
                                          + 添加主要指标
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-3 pt-3 border-t border-red-200">
                            <div className="flex items-center justify-between text-xs text-red-600">
                              <span>💡 提示：点击上方按钮快速修复，或参考右侧示例</span>
                              <button
                                onClick={handleReset}
                                className="hover:text-red-800 underline"
                              >
                                重新开始
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 增强的建议提示 */}
                  {parseResult && parseResult.suggestions.length > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            AI智能建议
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {parseResult.suggestions.length} 条优化建议
                            </span>
                          </div>

                          <div className="space-y-3">
                            {parseResult.suggestions.slice(0, 4).map((suggestion, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-blue-200 hover:border-blue-300 transition-colors">
                                <div className="flex items-start gap-3">
                                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm text-blue-700 mb-2">{suggestion}</p>

                                    {/* 根据建议内容提供快速操作 */}
                                    {suggestion.includes('示例') && (
                                      <button
                                        onClick={() => setSelectedCategory(0)}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                      >
                                        👀 查看示例
                                      </button>
                                    )}

                                    {suggestion.includes('模板') && (
                                      <button
                                        onClick={() => handleTemplateApply(templates[0])}
                                        className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                      >
                                        🚀 使用模板
                                      </button>
                                    )}

                                    {suggestion.includes('详细') && (
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          onClick={() => handleInputChange(userInput + ' 运行7天')}
                                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                        >
                                          ⏱️ 添加时长
                                        </button>
                                        <button
                                          onClick={() => handleInputChange(userInput + ' 各50%流量')}
                                          className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors"
                                        >
                                          📊 添加流量分配
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {parseResult.suggestions.length > 4 && (
                            <div className="mt-3 text-center">
                              <button className="text-xs text-blue-600 hover:text-blue-800 underline">
                                查看更多建议 ({parseResult.suggestions.length - 4} 条)
                              </button>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between">
                            <div className="text-xs text-blue-600">
                              🎯 根据您的输入智能生成的个性化建议
                            </div>
                            <div className="flex items-center gap-2 text-xs text-blue-500">
                              <Clock className="h-3 w-3" />
                              <span>实时更新</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 示例输入（升级版） */}
                {!showPreview && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">示例输入：</h4>
                      <div className="flex gap-1">
                        {EXAMPLE_INPUTS.map((category, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedCategory(index)}
                            className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                              selectedCategory === index
                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-150'
                            }`}
                          >
                            {category.icon}
                            {category.category}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {EXAMPLE_INPUTS[selectedCategory].examples.map((example, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example)}
                          className="w-full text-left p-3 bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-blue-100 rounded-lg border border-gray-200 hover:border-blue-300 text-sm transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between">
                            <span className="flex-1">{example}</span>
                            <ArrowRight className="h-3 w-3 text-gray-400 group-hover:text-blue-500 mt-1 flex-shrink-0 ml-2" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* 操作按钮（固定在底部） */}
            <div className="border-t border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    disabled={parseStatus === 'parsing'}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    重新开始
                  </button>

                  {parseResult && parseStatus === 'success' && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>可以创建实验</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* 快速操作按钮 */}
                  {userInput.trim() && !parseResult && (
                    <div className="text-xs text-gray-500 mr-2">
                      按回车键快速解析
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || parseStatus === 'parsing'}
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      !userInput.trim() || parseStatus === 'parsing'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {parseStatus === 'parsing' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>AI分析中...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="h-4 w-4" />
                        <span>智能解析</span>
                        <Sparkles className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 键盘快捷键提示 */}
              <div className="mt-2 text-xs text-gray-400 text-center">
                提示：Ctrl+Enter 快速解析，Esc 重置输入
              </div>
            </div>
          </div>

          {/* 右侧：预览区域 */}
          <div className="w-1/2 overflow-y-auto">
            {showPreview && parseResult ? (
              <div className="p-6 space-y-6">
                {/* 当前线上策略对照基准 */}
                {showProductionBaseline && (
                  <div>
                    <ProductionBaselineCard
                      strategy={mockCurrentProductionStrategy}
                      className="mb-4"
                    />

                    {/* 实验配置对比 */}
                    {comparisonData && (
                      <ExperimentComparisonView
                        comparison={comparisonData}
                        className="mb-4"
                      />
                    )}
                  </div>
                )}

                {/* 实验预览卡片 */}
                <ExperimentPreviewCard
                  intent={parseResult.intent}
                  extractedParams={parseResult.extractedParams}
                  missingParams={parseResult.missingParams}
                  suggestions={parseResult.suggestions}
                  intelligentSuggestions={experimentIntentParser.getIntelligentSuggestions(
                    parseResult.extractedParams,
                    {
                      userInput,
                      conversationHistory,
                      userProfile: {
                        experienceLevel: 'intermediate',
                        commonExperimentTypes: ['comparison', 'optimization'],
                        preferredModels: ['gpt-4-turbo', 'claude-3-opus'],
                        typicalBudget: 1000
                      }
                    } as EnhancedInputContext
                  )}
                  onParamUpdate={handleParamUpdate}
                  onCreateExperiment={handleCreateExperiment}
                  onEditInput={() => setShowPreview(false)}
                  isCreating={isCreating}
                />
              </div>
            ) : (
              <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-6">
                {/* 默认显示对照基准 */}
                <div className="mb-6">
                  <ProductionBaselineCard
                    strategy={mockCurrentProductionStrategy}
                    showDetailedConfig={false}
                  />
                </div>

                {/* AI预览介绍 */}
                <div className="text-center max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="relative">
                      <Sparkles className="h-12 w-12 text-blue-600" />
                      <div className="absolute -top-2 -right-2">
                        <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    AI实验配置预览
                  </h3>
                  <p className="text-gray-600 mb-6">
                    在左侧输入您的实验需求，AI将基于上述对照基准自动生成完整的A/B测试配置
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>智能参数提取</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span>自动配置生成</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>配置质量验证</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-purple-500" />
                      <span>基于对照基准的对比分析</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EnhancedNLExperimentCreator;