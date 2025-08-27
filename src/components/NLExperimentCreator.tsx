import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Mic, MicOff, Send, Lightbulb, Sparkles, MessageCircle, 
  RefreshCw, CheckCircle, AlertCircle, ArrowRight, Info,
  Wand2, Bot, Brain, Zap, TrendingUp, Shield, Clock,
  Target, DollarSign, Users, BarChart3, Eye, Settings
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

interface NLExperimentCreatorProps {
  onClose: () => void;
  onExperimentCreate: (experiment: any) => void;
}

// 预设示例（升级版）
const EXAMPLE_INPUTS = [
  {
    category: '基础对比',
    examples: [
      "我想测试GPT-4和Claude-3在客服场景的效果，各分配50%流量，运行7天",
      "对比GPT-3.5和GPT-4的响应质量和成本效率",
      "测试新提示词效果：70%新版本，30%旧版本，主要看用户满意度"
    ]
  },
  {
    category: '多变量实验',
    examples: [
      "同时测试模型（GPT-4 vs Claude-3）和温度参数（0.2 vs 0.7）的组合效果",
      "正交实验：测试提示词版本和工具组合的最佳搭配",
      "多因素分析：模型、温度、max_tokens三个变量的交互影响"
    ]
  },
  {
    category: '分层实验',
    examples: [
      "新用户用简化版模型，老用户用完整版，比较转化率差异",
      "按地区分层：北美用户测试英文优化版，亚洲用户测试多语言版",
      "按使用频率分组：高频用户测试高级功能，普通用户测试标准版"
    ]
  },
  {
    category: '成本优化',
    examples: [
      "在1000美元预算内找到成本效益最优的模型配置",
      "对比高端模型vs中端模型在特定任务上的性价比",
      "预算限制500美元，优化响应速度和质量的平衡点"
    ]
  }
];

// 置信度颜色映射
const CONFIDENCE_COLORS = {
  high: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200', 
  low: 'text-red-600 bg-red-50 border-red-200'
} as const;

// 复杂度颜色映射
const COMPLEXITY_COLORS = {
  simple: 'text-blue-600 bg-blue-50',
  medium: 'text-orange-600 bg-orange-50',
  complex: 'text-red-600 bg-red-50',
  advanced: 'text-purple-600 bg-purple-50'
} as const;

const NLExperimentCreator: React.FC<NLExperimentCreatorProps> = ({
  onClose,
  onExperimentCreate
}) => {
  const [userInput, setUserInput] = useState('');
  const [parseResult, setParseResult] = useState<NLParseResult | null>(null);
  const [parseStatus, setParseStatus] = useState<ParseStatus>('idle');
  const [showPreview, setShowPreview] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    input: string;
    response: string;
    timestamp: Date;
  }>>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<ExperimentTemplate | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [experimentComplexity, setExperimentComplexity] = useState<ExperimentComplexity | null>(null);
  const [confidenceBreakdown, setConfidenceBreakdown] = useState<Record<string, number> | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // 获取模板
  const templates = experimentIntentParser.getExperimentTemplates();

  // 解析用户输入（增强版）
  const parseUserInput = useCallback(async (input: string) => {
    if (!input.trim()) return;

    setParseStatus('parsing');
    setShowPreview(false);
    
    // 模拟解析延迟以显示加载状态
    await new Promise(resolve => setTimeout(resolve, 1000));

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

  // 处理示例点击
  const handleExampleClick = (example: string) => {
    setUserInput(example);
    parseUserInput(example);
  };

  // 处理模板应用
  const handleTemplateApply = (template: ExperimentTemplate) => {
    setActiveTemplate(template);
    setUserInput(template.examples[0]);
    parseUserInput(template.examples[0]);
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
        name: parseResult.extractedParams.name || '自然语言创建的实验',
        description: parseResult.extractedParams.description || `基于用户输入：${userInput}`,
        status: 'draft' as const,
        creationType: 'human_created' as const,
        creator: {
          type: 'human' as const,
          name: '用户',
          id: 'user_001'
        },
        startDate: new Date().toISOString().split('T')[0],
        groups: createExperimentGroups(parseResult.extractedParams),
        config: createExperimentConfig(parseResult.extractedParams),
        metrics: createMockMetrics(),
        createdAt: new Date().toISOString(),
        nlContext: {
          originalInput: userInput,
          parseResult: parseResult,
          template: activeTemplate?.id
        }
      };

      // 模拟创建延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

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
    stratificationDimensions: ['user_segment', 'time_of_day'],
    environmentControl: {
      fixedSeed: 12345,
      temperature: 0.7,
      consistentParams: true
    },
    complexityLevel: 'medium' as const,
    budget: {
      maxCost: params.budget?.maxCost || 1000,
      currentSpent: 0
    },
    duration: {
      minDays: params.duration?.minDays || 7,
      maxDays: params.duration?.maxDays || 30,
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
    }
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

  // 重置状态
  const handleReset = () => {
    setUserInput('');
    setParseResult(null);
    setParseStatus('idle');
    setShowPreview(false);
    setActiveTemplate(null);
  };

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                <Wand2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">智能实验创建</h2>
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

        <div className="flex h-[calc(95vh-120px)]">
          {/* 左侧：输入区域 */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            {/* 模板选择 */}
            {!showPreview && (
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">快速开始模板</h3>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateApply(template)}
                      className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                      <div className="text-xs text-blue-600 mt-2">
                        置信度: {Math.round(template.intent.confidence * 100)}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 输入区域 */}
            <div className="flex-1 p-6">
              <div className="h-full flex flex-col">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  描述您的实验需求
                </h3>

                <div className="flex-1">
                  <textarea
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="例如：我想测试GPT-4和Claude-3在客服场景的效果，各分配50%流量，运行7天，主要关注任务完成率和用户满意度..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />

                  {/* 解析状态指示器 */}
                  {parseStatus !== 'idle' && (
                    <div className="mt-4 flex items-center gap-2">
                      {parseStatus === 'parsing' && (
                        <>
                          <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                          <span className="text-sm text-blue-600">正在分析您的需求...</span>
                        </>
                      )}
                      {parseStatus === 'success' && (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">
                            解析成功！置信度: {parseResult ? Math.round(parseResult.extractedParams.extractionConfidence * 100) : 0}%
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

                {/* 示例输入 */}
                {!showPreview && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">示例输入：</h4>
                    <div className="space-y-2">
                      {EXAMPLE_INPUTS.slice(0, 1).map((category, categoryIndex) =>
                        category.examples.slice(0, 2).map((example, index) => (
                          <button
                            key={`${categoryIndex}-${index}`}
                            onClick={() => handleExampleClick(example)}
                            className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-sm transition-colors"
                          >
                            <div className="text-xs text-gray-500 mb-1">{category.category}</div>
                            {example}
                          </button>
                        ))
                      ).flat()
                      }
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    重新开始
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={!userInput.trim() || parseStatus === 'parsing'}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {parseStatus === 'parsing' ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Brain className="h-4 w-4" />
                      )}
                      {parseStatus === 'parsing' ? '分析中...' : '智能解析'}
                    </button>
                  </div>
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
                  intelligentSuggestions={experimentIntentParser.getIntelligentSuggestions(parseResult.extractedParams)}
                  onParamUpdate={handleParamUpdate}
                  onCreateExperiment={handleCreateExperiment}
                  onEditInput={() => setShowPreview(false)}
                  isCreating={isCreating}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md px-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    AI实验配置预览
                  </h3>
                  <p className="text-gray-600 mb-6">
                    在左侧输入您的实验需求，AI将自动解析并生成完整的实验配置预览
                  </p>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span>智能参数提取</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                      <Bot className="h-4 w-4 text-blue-500" />
                      <span>自动配置生成</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 mt-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
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

export default NLExperimentCreator;