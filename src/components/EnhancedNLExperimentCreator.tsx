import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mic, MicOff, Send, Lightbulb, Sparkles, MessageCircle, 
  RefreshCw, CheckCircle, AlertCircle, ArrowRight, Info,
  Wand2, Bot, Brain, Zap, TrendingUp, Shield, Clock,
  Target, DollarSign, Users, BarChart3, Eye, Settings,
  Volume2, VolumeX
} from 'lucide-react';
import { experimentIntentParser } from '../services/experimentIntentParser';
import ExperimentPreviewCard from './ExperimentPreviewCard';
import {
  NLParseResult,
  ExtractedExperimentParams,
  ParseStatus,
  ExperimentTemplate,
  ExperimentComplexity,
  ConfidenceStrategy,
  EnhancedInputContext
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
  const [conversationHistory, setConversationHistory] = useState<Array<{
    input: string;
    response: string;
    timestamp: Date;
  }>>([]);
  
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

  // 解析用户输入（增强版）
  const parseUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setParseStatus('parsing');
    setShowPreview(false);
    
    // 模拟解析延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 1200));

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
      
      const result = experimentIntentParser.parseInput(input, context);
      
      // 评估实验配置质量
      const configQuality = experimentIntentParser.assessConfigurationQuality(
        result.extractedParams, 
        result.intent
      );
      
      setParseResult(result);
      setConfidenceBreakdown(result.extractedParams.confidenceBreakdown || null);
      
      // 根据置信度设置状态
      if (result.extractedParams.extractionConfidence >= 0.8) {
        setParseStatus('success');
        setShowPreview(true);
      } else if (result.extractedParams.extractionConfidence >= 0.5) {
        setParseStatus('needs_clarification');
        setShowPreview(true);
      } else {
        setParseStatus('error');
      }
      
      // 记录会话历史
      setConversationHistory(prev => [...prev, {
        input,
        response: result.intent.description,
        timestamp: new Date()
      }]);
      
    } catch (error) {
      console.error('解析失败:', error);
      setParseStatus('error');
    }
  }, [conversationHistory]);

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
    const updatedResult = {
      ...parseResult,
      extractedParams: updatedParams,
      missingParams: experimentIntentParser.parseInput(userInput).missingParams
    };

    setParseResult(updatedResult);
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

  // 实时输入验证
  const handleInputChange = useCallback((value: string) => {
    setUserInput(value);
    
    // 实时提示和验证
    if (value.length > 100 && !parseResult) {
      // 输入较长时给出提示
      console.log('输入内容较多，可以点击解析按钮获得智能配置建议');
    }
  }, [parseResult]);

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
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
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
            <div className="flex-1 p-6">
              <div className="h-full flex flex-col">
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
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                          e.preventDefault();
                          handleSubmit();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          handleReset();
                        }
                      }}
                      placeholder="例如：我想测试GPT-4和Claude-3在客服场景的效果，各分配50%流量，运行7天，主要关注任务完成率和用户满意度。也可以说：同时测试模型和温度参数的组合效果..."
                      className="w-full h-48 p-4 pr-16 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    
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

                  {/* 错误提示 */}
                  {parseResult && parseResult.errors.length > 0 && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-red-800 mb-2">需要完善的内容：</div>
                      <ul className="space-y-1">
                        {parseResult.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 建议提示 */}
                  {parseResult && parseResult.suggestions.length > 0 && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        优化建议：
                      </div>
                      <ul className="space-y-1">
                        {parseResult.suggestions.slice(0, 3).map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700">• {suggestion}</li>
                        ))}
                      </ul>
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
                    
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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

                {/* 操作按钮（升级版） */}
                <div className="flex items-center justify-between mt-6">
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
          </div>

          {/* 右侧：预览区域 */}
          <div className="w-1/2 overflow-y-auto">
            {showPreview && parseResult ? (
              <div className="p-6">
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
              <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="text-center max-w-md px-6">
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
                    在左侧输入您的实验需求，AI将自动解析并生成完整的实验配置预览
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
                      <span>一键创建实验</span>
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