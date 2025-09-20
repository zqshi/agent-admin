/**
 * ReAct 智能创建引擎模块入口
 * 导出所有公共 API
 */

// 核心引擎
import { ReActEngine } from './core/ReActEngine';
import { NLUProcessor } from './core/NLUProcessor';
import { ConfigGenerator } from './core/ConfigGenerator';

export { ReActEngine, NLUProcessor, ConfigGenerator };

// 组件
import SmartCreationWizard from './components/SmartCreationWizard';
import NaturalLanguageInput from './components/NaturalLanguageInput';
import ReasoningProcess from './components/ReasoningProcess';

export { SmartCreationWizard, NaturalLanguageInput, ReasoningProcess };

// Hooks
import { useReActEngine } from './hooks/useReActEngine';
export { useReActEngine };

// 类型定义
export type {
  // 核心类型
  ReActStep,
  IntentAnalysis,
  ConfigRequirements,
  GeneratedConfig,
  CreationSession,
  CreationMode,
  ReActEngineConfig,

  // 组件属性类型
  SmartCreationWizardProps,
  NaturalLanguageInputProps,
  ReasoningProcessProps,

  // 配置类型
  CompressionStrategy,
  KnowledgeBinding,
  SlotInjectionStrategy,
  AdvancedConfig,

  // 其他
  ConfigSuggestion,
  ConfigAlternative,
  ValidationResult,
  IndustryTemplate
} from './types';

// 默认配置
export const DEFAULT_REACT_CONFIG: Partial<import('./types').ReActEngineConfig> = {
  enableReasoning: true,
  maxReasoningSteps: 10,
  confidenceThreshold: 0.7,
  enableSuggestions: true,
  enableAlternatives: true,
  enableValidation: true,
  debugMode: false,
  timeout: 30000
};

// 工具函数
export const createReActEngine = (config?: Partial<import('./types').ReActEngineConfig>) => {
  const engine = new ReActEngine({ ...DEFAULT_REACT_CONFIG, ...config });
  return engine;
};

// 预设模板
export const QUICK_CREATION_EXAMPLES = [
  "我需要一个客服助手，能够回答订单问题和处理客户投诉，要求友好耐心",
  "创建一个技术支持专员，专门负责故障诊断和技术文档维护，性格专业严谨",
  "销售部需要一个AI顾问，可以介绍产品、计算报价，要求热情专业",
  "人力资源部门的助手，处理员工咨询、招聘支持，性格亲和负责",
  "产品部的需求分析助手，能够收集用户反馈、分析产品数据"
];

export const CREATION_MODE_DESCRIPTIONS = {
  quick: {
    title: '快速创建',
    description: '一句话描述，AI自动生成完整配置',
    useCase: '适合快速原型和简单需求',
    features: ['自动配置生成', '智能参数推断', '一键创建']
  },
  standard: {
    title: '标准创建',
    description: '智能推理过程，可调整配置参数',
    useCase: '平衡智能化和可控性',
    features: ['推理过程可视化', '配置参数调整', '智能建议']
  },
  advanced: {
    title: '高级创建',
    description: '完整向导流程，支持所有高级功能',
    useCase: '适合复杂需求和专业用户',
    features: ['完整配置选项', '高级功能支持', '专业级定制']
  }
};

// 验证工具
export const validateUserInput = (input: string): { isValid: boolean; message?: string } => {
  if (!input.trim()) {
    return { isValid: false, message: '请输入描述内容' };
  }

  if (input.length < 10) {
    return { isValid: false, message: '描述内容过短，请提供更多详细信息' };
  }

  if (input.length > 1000) {
    return { isValid: false, message: '描述内容过长，请精简表达' };
  }

  return { isValid: true };
};

// 格式化工具
export const formatProcessingTime = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
};

export const formatConfidence = (confidence: number): string => {
  return `${(confidence * 100).toFixed(0)}%`;
};

// 状态检查工具
export const isSessionComplete = (session: import('./types').CreationSession): boolean => {
  return session.status === 'completed' &&
         session.currentConfig &&
         Object.keys(session.currentConfig).length > 0;
};

export const hasValidConfiguration = (session: import('./types').CreationSession): boolean => {
  return session.generatedConfig?.validation?.isValid === true;
};

// 错误处理工具
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return '未知错误';
};

// 调试工具
export const debugSession = (session: import('./types').CreationSession): void => {
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    console.group(`🧠 ReAct Session: ${session.id}`);
    console.log('Mode:', session.mode);
    console.log('Status:', session.status);
    console.log('Steps:', session.steps.length);
    console.log('User Input:', session.userInput);
    console.log('Analysis:', session.analysis);
    console.log('Requirements:', session.requirements);
    console.log('Generated Config:', session.generatedConfig);
    console.log('Current Config:', session.currentConfig);
    console.groupEnd();
  }
};

// 性能监控
export const trackReActPerformance = (sessionId: string, operation: string, duration: number): void => {
  if (typeof window !== 'undefined' && (window as any).__DEV__) {
    console.log(`⚡ ReAct Performance [${sessionId}]: ${operation} took ${formatProcessingTime(duration)}`);
  }
};

const ReactEngineModule = {
  // 核心
  ReActEngine: ReActEngine,
  createReActEngine: createReActEngine,

  // 组件
  SmartCreationWizard: SmartCreationWizard,
  NaturalLanguageInput: NaturalLanguageInput,
  ReasoningProcess: ReasoningProcess,

  // Hooks
  useReActEngine: useReActEngine,

  // 工具
  validateUserInput: validateUserInput,
  formatProcessingTime: formatProcessingTime,
  formatConfidence: formatConfidence,
  isSessionComplete: isSessionComplete,
  hasValidConfiguration: hasValidConfiguration,
  getErrorMessage: getErrorMessage,
  debugSession: debugSession,
  trackReActPerformance: trackReActPerformance,

  // 常量
  DEFAULT_REACT_CONFIG: DEFAULT_REACT_CONFIG,
  QUICK_CREATION_EXAMPLES: QUICK_CREATION_EXAMPLES,
  CREATION_MODE_DESCRIPTIONS: CREATION_MODE_DESCRIPTIONS
};

export default ReactEngineModule;