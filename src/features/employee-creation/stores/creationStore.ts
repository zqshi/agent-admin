/**
 * 统一员工创建状态管理
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  CreationStage,
  BasicInfo,
  CoreFeatures,
  AdvancedConfig,
  EmployeeCreationConfig,
  ConfigSuggestion,
  ValidationResult,
  ConfigExport,
  ResponsibilityAnalysis
} from '../types';
import type { CreateDigitalEmployeeForm } from '../../../types';
import type { SmartSuggestion, AnalysisResult } from '../services/SmartAnalysisService';

interface CreationState {
  // 当前状态
  currentStage: CreationStage;
  isModalOpen: boolean;
  isProcessing: boolean;

  // 阶段进度
  stageProgress: Record<CreationStage, boolean>;

  // 配置数据
  basicInfo: BasicInfo | null;
  coreFeatures: CoreFeatures | null;
  advancedConfig: AdvancedConfig | null;

  // 智能推荐
  suggestions: ConfigSuggestion[];
  autoAppliedChanges: Array<{
    field: string;
    oldValue: any;
    newValue: any;
    timestamp: string;
  }>;

  // AI智能分析
  aiAnalysisResult: AnalysisResult | null;
  smartSuggestions: SmartSuggestion[];
  appliedSuggestions: Set<string>;
  dismissedSuggestions: Set<string>;

  // 验证结果
  validation: ValidationResult | null;

  // 新增：Prompt配置模式
  promptConfigMode: 'template' | 'custom' | 'hybrid';
  independentSlots: Array<{
    id: string;
    name: string;
    description: string;
    type: 'text' | 'number' | 'enum' | 'boolean';
    required: boolean;
    defaultValue: string;
    validation: Record<string, any>;
  }>;

  // 配置模板
  availableTemplates: Array<{
    id: string;
    name: string;
    description: string;
    config: Partial<EmployeeCreationConfig>;
  }>;

  // Prompt模板
  promptTemplates: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    content: string;
    slots: Array<{
      id: string;
      name: string;
      description: string;
      type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
      required: boolean;
      defaultValue?: string;
      options?: string[];
      placeholder?: string;
    }>;
    createdAt: string;
    updatedAt: string;
    usageCount: number;
    isBuiltIn: boolean;
  }>;
}

interface CreationActions {
  // 模态框控制
  openModal: () => void;
  closeModal: () => void;

  // 阶段导航
  setStage: (stage: CreationStage) => void;
  nextStage: () => void;
  prevStage: () => void;
  completeStage: (stage: CreationStage) => void;

  // 数据更新
  updateBasicInfo: (info: Partial<BasicInfo>) => void;
  updateCoreFeatures: (features: Partial<CoreFeatures>) => void;
  updateAdvancedConfig: (config: Partial<AdvancedConfig>) => void;

  // 验证控制
  clearValidation: () => void;

  // 智能功能
  generateSmartConfig: (role: string, responsibilities: string[]) => Promise<void>;
  applySuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;

  // AI智能分析
  setAIAnalysisResult: (result: AnalysisResult) => void;
  applySmartSuggestion: (suggestion: SmartSuggestion) => void;
  dismissSmartSuggestion: (suggestion: SmartSuggestion) => void;
  getSmartSuggestionsByType: (type: SmartSuggestion['type']) => SmartSuggestion[];
  clearAIAnalysis: () => void;

  // 验证
  validateCurrentStage: () => Promise<ValidationResult>;
  validateFullConfig: () => Promise<ValidationResult>;

  // 模板管理
  loadTemplate: (templateId: string) => void;
  saveAsTemplate: (name: string, description: string) => void;

  // Prompt模板管理
  getPromptTemplates: () => typeof initialState.promptTemplates;
  addPromptTemplate: (template: Omit<typeof initialState.promptTemplates[0], 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  updatePromptTemplate: (id: string, template: Partial<typeof initialState.promptTemplates[0]>) => void;
  deletePromptTemplate: (id: string) => void;
  importPromptTemplates: (templates: typeof initialState.promptTemplates) => void;
  incrementTemplateUsage: (id: string) => void;

  // 导出/导入
  exportConfig: (includeAdvanced?: boolean) => ConfigExport;
  importConfig: (config: ConfigExport) => void;

  // 重置
  reset: () => void;

  // 新增：Prompt配置模式管理
  setPromptConfigMode: (mode: 'template' | 'custom' | 'hybrid') => void;
  updateIndependentSlots: (slots: CreationState['independentSlots']) => void;
  addIndependentSlot: (slot: Omit<CreationState['independentSlots'][0], 'id'>) => void;
  removeIndependentSlot: (id: string) => void;

  // 转换为旧格式（兼容性）
  toCreateDigitalEmployeeForm: () => CreateDigitalEmployeeForm;
}

const initialState: CreationState = {
  currentStage: 'basic',
  isModalOpen: false,
  isProcessing: false,

  stageProgress: {
    basic: false,
    features: false,
    advanced: false
  },

  basicInfo: null,
  coreFeatures: null,
  advancedConfig: null,

  suggestions: [],
  autoAppliedChanges: [],

  // AI智能分析初始状态
  aiAnalysisResult: null,
  smartSuggestions: [],
  appliedSuggestions: new Set(),
  dismissedSuggestions: new Set(),

  validation: null,
  availableTemplates: [],

  // 新增字段
  promptConfigMode: 'template',
  independentSlots: [],
  promptTemplates: [
    {
      id: '1',
      name: '客服专员模板',
      description: '适用于客户服务场景的专业模板',
      category: '客服',
      content: `你是一名专业的客户服务代表，名字是{{name}}。

你的主要职责：
{{responsibilities}}

服务原则：
1. 始终保持耐心和礼貌
2. 准确理解客户需求
3. 提供专业的解决方案
4. 及时跟进问题进展

回复风格：{{tone}}
回复长度：{{response_length}}

请根据以上设定，为客户提供优质的服务体验。`,
      slots: [
        { id: '1', name: 'name', description: '数字员工姓名', type: 'text', required: true, placeholder: '例：小王' },
        { id: '2', name: 'responsibilities', description: '主要职责列表', type: 'text', required: true, placeholder: '例：处理客户咨询、解决技术问题' },
        { id: '3', name: 'tone', description: '回复语调', type: 'select', required: false, defaultValue: '友好专业', options: ['友好专业', '正式严谨', '轻松幽默'] },
        { id: '4', name: 'response_length', description: '回复长度', type: 'select', required: false, defaultValue: '适中', options: ['简洁', '适中', '详细'] }
      ],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      usageCount: 23,
      isBuiltIn: true
    },
    {
      id: '2',
      name: '技术支持模板',
      description: '专为技术支持场景设计',
      category: '技术',
      content: `我是{{name}}，专业的技术支持工程师。

技术专长：
{{specialties}}

解决问题的流程：
1. 理解问题现象
2. 收集相关信息
3. 分析可能原因
4. 提供解决方案
5. 确认问题解决

技术水平：{{technical_level}}
回复详细程度：{{detail_level}}`,
      slots: [
        { id: '5', name: 'name', description: '技术支持姓名', type: 'text', required: true },
        { id: '6', name: 'specialties', description: '技术专长', type: 'text', required: true },
        { id: '7', name: 'technical_level', description: '技术表达水平', type: 'select', required: false, options: ['通俗易懂', '技术专业', '深度技术'] },
        { id: '8', name: 'detail_level', description: '回复详细程度', type: 'select', required: false, options: ['简要说明', '详细解释', 'step-by-step'] }
      ],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      usageCount: 15,
      isBuiltIn: true
    }
  ]
};

export const useCreationStore = create<CreationState & CreationActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // 模态框控制
    openModal: () => set({ isModalOpen: true }),
    closeModal: () => set({ isModalOpen: false }),

    // 阶段导航
    setStage: (stage) => set({ currentStage: stage }),

    nextStage: () => {
      const { currentStage } = get();
      const stages: CreationStage[] = ['basic', 'features', 'advanced'];
      const currentIndex = stages.indexOf(currentStage);

      if (currentIndex < stages.length - 1) {
        set({ currentStage: stages[currentIndex + 1] });
      }
    },

    prevStage: () => {
      const { currentStage } = get();
      const stages: CreationStage[] = ['basic', 'features', 'advanced'];
      const currentIndex = stages.indexOf(currentStage);

      if (currentIndex > 0) {
        set({ currentStage: stages[currentIndex - 1] });
      }
    },

    completeStage: (stage) => set((state) => ({
      stageProgress: { ...state.stageProgress, [stage]: true }
    })),

    // 数据更新
    updateBasicInfo: (info) => set((state) => ({
      basicInfo: state.basicInfo ? { ...state.basicInfo, ...info } : info as BasicInfo,
      validation: null // 清除验证状态
    })),

    updateCoreFeatures: (features) => set((state) => ({
      coreFeatures: state.coreFeatures ? { ...state.coreFeatures, ...features } : features as CoreFeatures,
      validation: null // 清除验证状态
    })),

    updateAdvancedConfig: (config) => set((state) => ({
      advancedConfig: state.advancedConfig ? { ...state.advancedConfig, ...config } : config as AdvancedConfig,
      validation: null // 清除验证状态
    })),

    // 验证控制
    clearValidation: () => set({ validation: null }),

    // 智能配置生成
    generateSmartConfig: async (role: string, responsibilities: string[]) => {
      set({ isProcessing: true });

      try {
        // 模拟智能配置生成（实际实现时需要调用服务）
        const smartConfig = await generateConfigFromRole(role, responsibilities);

        // 更新核心特征
        set((state) => ({
          coreFeatures: smartConfig.features,
          suggestions: [...state.suggestions, ...smartConfig.suggestions],
          autoAppliedChanges: [
            ...state.autoAppliedChanges,
            {
              field: 'coreFeatures',
              oldValue: state.coreFeatures,
              newValue: smartConfig.features,
              timestamp: new Date().toISOString()
            }
          ]
        }));

        // 推荐工具
        if (smartConfig.recommendedTools) {
          set((state) => ({
            advancedConfig: {
              ...state.advancedConfig,
              tools: {
                ...state.advancedConfig?.tools,
                recommendedTools: smartConfig.recommendedTools,
                selectedTools: smartConfig.recommendedTools.slice(0, 3) // 自动选择前3个
              }
            }
          }));
        }

      } catch (error) {
        console.error('智能配置生成失败:', error);
      } finally {
        set({ isProcessing: false });
      }
    },

    applySuggestion: (suggestionId) => {
      const { suggestions } = get();
      const suggestion = suggestions.find(s => s.field === suggestionId);

      if (suggestion && suggestion.autoApplicable && suggestion.value) {
        // 应用建议的值
        if (suggestion.field.startsWith('basic.')) {
          const field = suggestion.field.replace('basic.', '');
          get().updateBasicInfo({ [field]: suggestion.value });
        } else if (suggestion.field.startsWith('features.')) {
          const field = suggestion.field.replace('features.', '');
          get().updateCoreFeatures({ [field]: suggestion.value });
        } else if (suggestion.field.startsWith('advanced.')) {
          const field = suggestion.field.replace('advanced.', '');
          get().updateAdvancedConfig({ [field]: suggestion.value });
        }

        // 移除已应用的建议
        get().dismissSuggestion(suggestionId);
      }
    },

    dismissSuggestion: (suggestionId) => set((state) => ({
      suggestions: state.suggestions.filter(s => s.field !== suggestionId)
    })),

    // AI智能分析方法
    setAIAnalysisResult: (result) => set({
      aiAnalysisResult: result,
      smartSuggestions: result.suggestions
    }),

    applySmartSuggestion: (suggestion) => {
      const suggestionId = `${suggestion.type}-${suggestion.title}`;

      // 应用建议到对应的数据
      switch (suggestion.type) {
        case 'responsibilities':
          const currentBasicInfo = get().basicInfo;
          if (currentBasicInfo) {
            const newResponsibilities = [...currentBasicInfo.responsibilities.filter(r => r.trim()), ...(suggestion.content as string[])];
            get().updateBasicInfo({ responsibilities: newResponsibilities });
          }
          break;

        case 'personality':
          get().updateCoreFeatures({ personality: suggestion.content });
          break;

        case 'workStyle':
          get().updateCoreFeatures({ workStyle: suggestion.content });
          break;

        case 'communication':
          get().updateCoreFeatures({ communication: suggestion.content });
          break;

        case 'tools':
          // 工具建议暂时存储，在高级配置阶段应用
          console.log('Tools suggestion to be applied in advanced stage:', suggestion.content);
          break;
      }

      // 记录已应用的建议
      set((state) => ({
        appliedSuggestions: new Set([...state.appliedSuggestions, suggestionId])
      }));
    },

    dismissSmartSuggestion: (suggestion) => {
      const suggestionId = `${suggestion.type}-${suggestion.title}`;
      set((state) => ({
        dismissedSuggestions: new Set([...state.dismissedSuggestions, suggestionId])
      }));
    },

    getSmartSuggestionsByType: (type) => {
      const { smartSuggestions } = get();
      return smartSuggestions.filter(s => s.type === type);
    },

    clearAIAnalysis: () => set({
      aiAnalysisResult: null,
      smartSuggestions: [],
      appliedSuggestions: new Set(),
      dismissedSuggestions: new Set()
    }),

    // 验证
    validateCurrentStage: async () => {
      const { currentStage, basicInfo, coreFeatures, advancedConfig } = get();

      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        score: 100
      };

      if (currentStage === 'basic' && basicInfo) {
        if (!basicInfo.name?.trim()) {
          result.errors.push({
            field: 'name',
            message: '请输入数字员工姓名',
            code: 'REQUIRED_FIELD'
          });
        }

        if (!basicInfo.primaryRole?.trim()) {
          result.errors.push({
            field: 'primaryRole',
            message: '请输入主要职责',
            code: 'REQUIRED_FIELD'
          });
        }

        if (!basicInfo.department?.trim()) {
          result.errors.push({
            field: 'department',
            message: '请选择所属部门',
            code: 'REQUIRED_FIELD'
          });
        }
      }

      result.isValid = result.errors.length === 0;
      result.score = Math.max(0, 100 - result.errors.length * 20 - result.warnings.length * 5);

      set({ validation: result });
      return result;
    },

    validateFullConfig: async () => {
      // 全量验证逻辑
      const validation = await get().validateCurrentStage();
      return validation;
    },

    // 模板管理
    loadTemplate: (templateId) => {
      const { availableTemplates } = get();
      const template = availableTemplates.find(t => t.id === templateId);

      if (template && template.config) {
        if (template.config.basic) get().updateBasicInfo(template.config.basic);
        if (template.config.features) get().updateCoreFeatures(template.config.features);
        if (template.config.advanced) get().updateAdvancedConfig(template.config.advanced);
      }
    },

    saveAsTemplate: (name, description) => {
      const { basicInfo, coreFeatures, advancedConfig } = get();

      const template = {
        id: Date.now().toString(),
        name,
        description,
        config: {
          basic: basicInfo,
          features: coreFeatures,
          advanced: advancedConfig
        }
      };

      set((state) => ({
        availableTemplates: [...state.availableTemplates, template]
      }));
    },

    // 导出配置
    exportConfig: (includeAdvanced = true) => {
      const { basicInfo, coreFeatures, advancedConfig } = get();

      const config: EmployeeCreationConfig = {
        basic: basicInfo!,
        features: coreFeatures!,
        advanced: includeAdvanced ? advancedConfig! : {},
        meta: {
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      return {
        config,
        format: 'json' as const,
        includeAdvanced
      };
    },

    // 导入配置
    importConfig: (configExport) => {
      const { config } = configExport;

      if (config.basic) get().updateBasicInfo(config.basic);
      if (config.features) get().updateCoreFeatures(config.features);
      if (config.advanced) get().updateAdvancedConfig(config.advanced);
    },

    // Prompt模板管理
    getPromptTemplates: () => get().promptTemplates,

    addPromptTemplate: (template) => {
      const newTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        usageCount: 0
      };

      set((state) => ({
        promptTemplates: [...state.promptTemplates, newTemplate]
      }));
    },

    updatePromptTemplate: (id, updates) => {
      set((state) => ({
        promptTemplates: state.promptTemplates.map(template =>
          template.id === id
            ? { ...template, ...updates, updatedAt: new Date().toISOString() }
            : template
        )
      }));
    },

    deletePromptTemplate: (id) => {
      set((state) => ({
        promptTemplates: state.promptTemplates.filter(template =>
          template.id !== id && !template.isBuiltIn
        )
      }));
    },

    importPromptTemplates: (templates) => {
      const newTemplates = templates.map(template => ({
        ...template,
        id: Date.now().toString() + Math.random(),
        isBuiltIn: false,
        usageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      set((state) => ({
        promptTemplates: [...state.promptTemplates, ...newTemplates]
      }));
    },

    incrementTemplateUsage: (id) => {
      set((state) => ({
        promptTemplates: state.promptTemplates.map(template =>
          template.id === id
            ? { ...template, usageCount: template.usageCount + 1 }
            : template
        )
      }));
    },

    // 重置
    reset: () => set(initialState),

    // 新增：Prompt配置模式管理
    setPromptConfigMode: (mode) => set({ promptConfigMode: mode }),

    updateIndependentSlots: (slots) => set({ independentSlots: slots }),

    addIndependentSlot: (slot) => set((state) => ({
      independentSlots: [
        ...state.independentSlots,
        { ...slot, id: `slot_${Date.now()}` }
      ]
    })),

    removeIndependentSlot: (id) => set((state) => ({
      independentSlots: state.independentSlots.filter(slot => slot.id !== id)
    })),

    // 转换为旧格式（兼容性）
    toCreateDigitalEmployeeForm: (): CreateDigitalEmployeeForm => {
      const { basicInfo, coreFeatures, advancedConfig } = get();

      return {
        name: basicInfo?.name || '',
        employeeNumber: basicInfo?.employeeId || '',
        description: basicInfo?.description || '',
        department: basicInfo?.department || '',

        systemPrompt: advancedConfig?.persona?.systemPrompt || '',
        personality: `友好度: ${coreFeatures?.personality.friendliness || 5}/10, 专业度: ${coreFeatures?.personality.professionalism || 5}/10`,
        responsibilities: basicInfo?.responsibilities || [''],

        exampleDialogues: advancedConfig?.persona?.examples?.map(ex => ({
          id: Date.now().toString(),
          userInput: ex.userInput,
          expectedResponse: ex.expectedResponse,
          tags: []
        })) || [],

        enableMentor: advancedConfig?.mentor?.enabled || false,
        allowedTools: advancedConfig?.tools?.selectedTools?.map(t => t.id) || [],
        resourcePermissions: [],
        canSelfLearn: advancedConfig?.knowledge?.retention?.enabled || false,
        initialFAQs: advancedConfig?.knowledge?.faq?.items || [],

        promptConfig: {
          mode: 'simple' as const,
          basePrompt: advancedConfig?.persona?.systemPrompt || '',
          slots: [],
          quickSettings: {
            tone: coreFeatures?.communication?.language === 'neutral' ? 'friendly' : (coreFeatures?.communication?.language || 'friendly'),
            responseLength: coreFeatures?.communication?.responseLength === 'concise' ? 'brief' : (coreFeatures?.communication?.responseLength || 'moderate'),
            creativity: 'balanced' as const
          }
        }
      };
    }
  }))
);

// 智能配置生成服务（模拟）
async function generateConfigFromRole(role: string, responsibilities: string[]): Promise<{
  features: CoreFeatures;
  suggestions: ConfigSuggestion[];
  recommendedTools?: any[];
}> {
  // 模拟异步处理
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 角色映射规则
  const roleMappings: Record<string, any> = {
    '客服专员': {
      personality: { friendliness: 9, professionalism: 7, patience: 10, empathy: 8 },
      workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'proactive', detailOrientation: 'high' },
      communication: { responseLength: 'moderate', language: 'neutral', technicality: 'simple' },
      tools: ['order_query', 'faq_search', 'customer_info']
    },
    '数据分析师': {
      personality: { friendliness: 6, professionalism: 10, patience: 7, empathy: 5 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'balanced', detailOrientation: 'high' },
      communication: { responseLength: 'detailed', language: 'formal', technicality: 'technical' },
      tools: ['data_query', 'report_generator', 'visualization_tool']
    },
    '销售顾问': {
      personality: { friendliness: 10, professionalism: 8, patience: 8, empathy: 9 },
      workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'medium' },
      communication: { responseLength: 'moderate', language: 'casual', technicality: 'simple' },
      tools: ['crm_access', 'pricing_calc', 'product_catalog']
    }
  };

  const mapping = roleMappings[role] || roleMappings['客服专员']; // 默认客服

  return {
    features: mapping,
    suggestions: [
      {
        type: 'enhancement',
        field: 'personality.empathy',
        title: '建议调整共情能力',
        description: '基于您的职责，建议将共情能力设置为较高水平',
        severity: 'medium',
        autoApplicable: true,
        value: mapping.personality.empathy
      }
    ],
    recommendedTools: mapping.tools.map((toolId: string, index: number) => ({
      id: toolId,
      name: toolId.replace('_', ' '),
      category: 'general',
      description: `${toolId} 工具`,
      capabilities: ['基础功能']
    }))
  };
}