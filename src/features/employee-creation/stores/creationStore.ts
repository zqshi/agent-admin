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
  ResponsibilityAnalysis,
  DomainConfig,
  MultiDomainConfig,
  RoutingStrategy
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

  // ============ 多领域配置相关状态 ============

  // 多领域配置
  multiDomainConfig: MultiDomainConfig | null;

  // 当前选中的领域
  selectedDomainId: string | null;

  // 领域验证结果
  domainValidation: Map<string, ValidationResult>;
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

  // ============ 多领域配置相关方法 ============

  // 多领域配置管理
  enableMultiDomain: (enable: boolean) => void;
  initializeMultiDomain: () => void;
  setRoutingStrategy: (strategy: RoutingStrategy) => void;

  // 领域管理
  addDomain: (domain: Omit<DomainConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDomain: (id: string, updates: Partial<DomainConfig>) => void;
  deleteDomain: (id: string) => void;
  toggleDomain: (id: string) => void;
  setDomainWeight: (id: string, weight: number) => void;
  selectDomain: (id: string) => void;
  duplicateDomain: (id: string) => void;

  // 领域高级配置管理
  updateDomainPersona: (domainId: string, persona: Partial<AdvancedConfig['persona']>) => void;
  updateDomainPrompt: (domainId: string, prompt: Partial<AdvancedConfig['prompt']>) => void;
  updateDomainKnowledge: (domainId: string, knowledge: Partial<AdvancedConfig['knowledge']>) => void;
  updateDomainTools: (domainId: string, tools: Partial<AdvancedConfig['tools']>) => void;
  updateDomainMentor: (domainId: string, mentor: Partial<AdvancedConfig['mentor']>) => void;

  // 全局默认配置管理
  updateGlobalDefaults: (config: Partial<AdvancedConfig>) => void;

  // 领域验证
  validateDomain: (id: string) => Promise<ValidationResult>;
  validateAllDomains: () => Promise<Map<string, ValidationResult>>;

  // 权重管理
  normalizeWeights: () => void;
  getWeightSummary: () => { total: number; isValid: boolean; };

  // 获取方法
  getDomain: (id: string) => DomainConfig | null;
  getActiveDomains: () => DomainConfig[];
  isMultiDomainEnabled: () => boolean;
}

const initialState: CreationState = {
  currentStage: 'basic',
  isModalOpen: false,
  isProcessing: false,

  stageProgress: {
    basic: false,
    features: false,
    domains: false,
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
  ],

  // ============ 多领域配置初始状态 ============

  // 多领域配置
  multiDomainConfig: null,

  // 当前选中的领域
  selectedDomainId: null,

  // 领域验证结果
  domainValidation: new Map()
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
      const { currentStage, basicInfo } = get();

      // 添加空值检查
      if (!basicInfo) {
        console.warn('BasicInfo not initialized, cannot navigate');
        return;
      }

      const isMultiDomain = basicInfo.enableMultiDomain;
      const stages: CreationStage[] = isMultiDomain
        ? ['basic', 'features', 'domains', 'advanced']
        : ['basic', 'features', 'advanced'];

      // 添加阶段验证
      if (currentStage === 'features' && isMultiDomain) {
        // 在多领域模式下，确保多领域配置已初始化
        const multiDomainConfig = get().multiDomainConfig;
        if (!multiDomainConfig) {
          console.warn('Multi-domain not properly initialized');
          get().initializeMultiDomain();
        }
      }

      const currentIndex = stages.indexOf(currentStage);

      if (currentIndex < stages.length - 1) {
        set({ currentStage: stages[currentIndex + 1] });
      }
    },

    prevStage: () => {
      const { currentStage, basicInfo } = get();

      // 添加空值检查
      if (!basicInfo) {
        console.warn('BasicInfo not initialized, cannot navigate');
        return;
      }

      // 根据是否启用多领域决定阶段流程
      const isMultiDomain = basicInfo.enableMultiDomain;
      const stages: CreationStage[] = isMultiDomain
        ? ['basic', 'features', 'domains', 'advanced']
        : ['basic', 'features', 'advanced'];

      const currentIndex = stages.indexOf(currentStage);

      if (currentIndex > 0) {
        set({ currentStage: stages[currentIndex - 1] });
      }
    },

    completeStage: (stage) => set((state) => ({
      stageProgress: { ...state.stageProgress, [stage]: true }
    })),

    // 数据更新
    updateBasicInfo: (info) => set((state) => {
      const newBasicInfo = state.basicInfo ? { ...state.basicInfo, ...info } : info as BasicInfo;

      // 如果启用多领域且尚未初始化，立即初始化
      if (newBasicInfo.enableMultiDomain && !state.multiDomainConfig) {
        // 使用 setTimeout 避免在 setState 中调用另一个 setState
        setTimeout(() => {
          get().initializeMultiDomain();
        }, 0);
      }

      // 如果禁用多领域，清理相关配置
      if (!newBasicInfo.enableMultiDomain && state.multiDomainConfig) {
        return {
          basicInfo: newBasicInfo,
          multiDomainConfig: null,
          selectedDomainId: null,
          validation: null
        };
      }

      return {
        basicInfo: newBasicInfo,
        validation: null
      };
    }),

    updateCoreFeatures: (features) => set((state) => ({
      coreFeatures: state.coreFeatures ? { ...state.coreFeatures, ...features } : features as CoreFeatures,
      validation: null // 清除验证状态
    })),

    updateAdvancedConfig: (config) => set((state) => {
      const newAdvancedConfig = state.advancedConfig ? { ...state.advancedConfig, ...config } : config as AdvancedConfig;

      // 如果多领域模式已启用，同时更新globalDefaults
      const updatedMultiDomainConfig = state.multiDomainConfig ? {
        ...state.multiDomainConfig,
        globalDefaults: {
          ...state.multiDomainConfig.globalDefaults,
          ...config
        }
      } : state.multiDomainConfig;

      return {
        advancedConfig: newAdvancedConfig,
        multiDomainConfig: updatedMultiDomainConfig,
        validation: null // 清除验证状态
      };
    }),

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
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        { ...slot, id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` }
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
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    },

    // ============ 多领域配置相关方法实现 ============

    // 多领域配置管理
    enableMultiDomain: (enable) => {
      if (enable) {
        get().initializeMultiDomain();
      } else {
        set({ multiDomainConfig: null, selectedDomainId: null });
      }
    },

    initializeMultiDomain: () => {
      const { advancedConfig, coreFeatures } = get();

      // 创建基础默认配置
      const createDefaultConfig = (): AdvancedConfig => ({
        persona: { systemPrompt: '', characterBackground: '', constraints: [], examples: [] },
        prompt: { templates: [], slots: [], compression: { enabled: false, trigger: 'tokenLimit', threshold: 2048, strategy: 'summary', preserveKeys: [] }, errorHandling: { onSlotMissing: 'useDefault', onCompressionFail: 'retry' } },
        knowledge: { documents: { files: [], maxSize: 10485760, allowedFormats: ['.txt', '.md', '.pdf'] }, faq: { items: [], importSource: 'manual' }, retention: { enabled: false, strategy: 'internalize', updateFrequency: 'realtime' }, knowledgeBase: { type: 'internal', internalSources: [], externalAPIs: [] }, knowledgeGraph: { enabled: false, autoGenerate: false, updateTrigger: 'manual', visualization: false } },
        tools: { recommendedTools: [], selectedTools: [], usagePolicy: { requireConfirmation: false, loggingLevel: 'basic' } },
        mentor: { enabled: false, mentor: { id: '', name: '', role: '' }, reporting: { enabled: false, schedule: 'weekly', method: 'email', template: '' }, supervision: { reviewDecisions: false, approvalRequired: [], escalationRules: [] } }
      });

      // 使用当前实际配置作为全局默认，如果没有则使用空默认配置
      const globalDefaults: AdvancedConfig = advancedConfig ? {
        ...createDefaultConfig(),
        ...advancedConfig
      } : createDefaultConfig();

      const multiDomainConfig: MultiDomainConfig = {
        enabled: true,
        domains: [],
        routingStrategy: 'hybrid',
        maxConcurrentDomains: 5,
        globalDefaults,
        routingConfig: {
          keywordSensitivity: 0.7,
          semanticThreshold: 0.8,
          contextMemoryLength: 10,
          fallbackBehavior: 'default'
        }
      };

      set({ multiDomainConfig, domainValidation: new Map() });
    },

    setRoutingStrategy: (strategy) => set((state) => {
      if (state.multiDomainConfig) {
        return {
          multiDomainConfig: {
            ...state.multiDomainConfig,
            routingStrategy: strategy
          }
        };
      }
      return state;
    }),

    // 领域管理
    addDomain: (domainData) => {
      const now = new Date().toISOString();
      // 生成更可靠的唯一ID：时间戳 + 随机数
      const uniqueId = `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newDomain: DomainConfig = {
        ...domainData,
        id: uniqueId,
        createdAt: now,
        updatedAt: now,
        advancedConfig: get().multiDomainConfig?.globalDefaults || {
          persona: { systemPrompt: '', characterBackground: '', constraints: [], examples: [] },
          prompt: { templates: [], slots: [], compression: { enabled: false, trigger: 'tokenLimit', threshold: 2048, strategy: 'summary', preserveKeys: [] }, errorHandling: { onSlotMissing: 'useDefault', onCompressionFail: 'retry' } },
          knowledge: { documents: { files: [], maxSize: 10485760, allowedFormats: ['.txt', '.md', '.pdf'] }, faq: { items: [], importSource: 'manual' }, retention: { enabled: false, strategy: 'internalize', updateFrequency: 'realtime' }, knowledgeBase: { type: 'internal', internalSources: [], externalAPIs: [] }, knowledgeGraph: { enabled: false, autoGenerate: false, updateTrigger: 'manual', visualization: false } },
          tools: { recommendedTools: [], selectedTools: [], usagePolicy: { requireConfirmation: false, loggingLevel: 'basic' } },
          mentor: { enabled: false, mentor: { id: '', name: '', role: '' }, reporting: { enabled: false, schedule: 'weekly', method: 'email', template: '' }, supervision: { reviewDecisions: false, approvalRequired: [], escalationRules: [] } }
        }
      };

      set((state) => {
        if (state.multiDomainConfig) {
          return {
            multiDomainConfig: {
              ...state.multiDomainConfig,
              domains: [...state.multiDomainConfig.domains, newDomain]
            },
            selectedDomainId: newDomain.id
          };
        }
        return state;
      });
    },

    updateDomain: (id, updates) => set((state) => {
      if (state.multiDomainConfig) {
        return {
          multiDomainConfig: {
            ...state.multiDomainConfig,
            domains: state.multiDomainConfig.domains.map(domain =>
              domain.id === id ? { ...domain, ...updates, updatedAt: new Date().toISOString() } : domain
            )
          }
        };
      }
      return state;
    }),

    deleteDomain: (id) => set((state) => {
      if (state.multiDomainConfig) {
        const newDomains = state.multiDomainConfig.domains.filter(d => d.id !== id);
        return {
          multiDomainConfig: {
            ...state.multiDomainConfig,
            domains: newDomains
          },
          selectedDomainId: state.selectedDomainId === id ? null : state.selectedDomainId
        };
      }
      return state;
    }),

    toggleDomain: (id) => set((state) => {
      if (state.multiDomainConfig) {
        return {
          multiDomainConfig: {
            ...state.multiDomainConfig,
            domains: state.multiDomainConfig.domains.map(domain =>
              domain.id === id ? { ...domain, enabled: !domain.enabled, updatedAt: new Date().toISOString() } : domain
            )
          }
        };
      }
      return state;
    }),

    setDomainWeight: (id, weight) => get().updateDomain(id, { weight }),

    selectDomain: (id) => set({ selectedDomainId: id }),

    duplicateDomain: (id) => {
      const domain = get().getDomain(id);
      if (domain) {
        get().addDomain({
          ...domain,
          name: `${domain.name} (副本)`,
          isDefault: false
        });
      }
    },

    // 领域高级配置管理
    updateDomainPersona: (domainId, persona) => {
      const domain = get().getDomain(domainId);
      if (domain) {
        get().updateDomain(domainId, {
          advancedConfig: {
            ...domain.advancedConfig,
            persona: { ...domain.advancedConfig.persona, ...persona }
          }
        });
      }
    },

    updateDomainPrompt: (domainId, prompt) => {
      const domain = get().getDomain(domainId);
      if (domain) {
        get().updateDomain(domainId, {
          advancedConfig: {
            ...domain.advancedConfig,
            prompt: { ...domain.advancedConfig.prompt, ...prompt }
          }
        });
      }
    },

    updateDomainKnowledge: (domainId, knowledge) => {
      const domain = get().getDomain(domainId);
      if (domain) {
        get().updateDomain(domainId, {
          advancedConfig: {
            ...domain.advancedConfig,
            knowledge: { ...domain.advancedConfig.knowledge, ...knowledge }
          }
        });
      }
    },

    updateDomainTools: (domainId, tools) => {
      const domain = get().getDomain(domainId);
      if (domain) {
        get().updateDomain(domainId, {
          advancedConfig: {
            ...domain.advancedConfig,
            tools: { ...domain.advancedConfig.tools, ...tools }
          }
        });
      }
    },

    updateDomainMentor: (domainId, mentor) => {
      const domain = get().getDomain(domainId);
      if (domain) {
        get().updateDomain(domainId, {
          advancedConfig: {
            ...domain.advancedConfig,
            mentor: { ...domain.advancedConfig.mentor, ...mentor }
          }
        });
      }
    },


    updateGlobalDefaults: (config) => {
      set((state) => {
        if (state.multiDomainConfig) {
          return {
            multiDomainConfig: {
              ...state.multiDomainConfig,
              globalDefaults: {
                ...state.multiDomainConfig.globalDefaults,
                ...config
              }
            }
          };
        }
        return state;
      });
    },


    // 领域验证
    validateDomain: async (id) => {
      const domain = get().getDomain(id);
      if (!domain) {
        return { isValid: false, errors: [{ field: 'domain', message: '领域不存在', code: 'NOT_FOUND' }], warnings: [], score: 0 };
      }

      const result: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        score: 100
      };

      // 基本验证
      if (!domain.name?.trim()) {
        result.errors.push({ field: 'name', message: '请输入领域名称', code: 'REQUIRED_FIELD' });
      }

      if (!domain.description?.trim()) {
        result.warnings.push({ field: 'description', message: '建议添加领域描述' });
      }

      if (domain.weight < 0 || domain.weight > 100) {
        result.errors.push({ field: 'weight', message: '权重必须在0-100之间', code: 'INVALID_RANGE' });
      }

      result.isValid = result.errors.length === 0;
      result.score = Math.max(0, 100 - result.errors.length * 20 - result.warnings.length * 5);

      // 更新验证结果
      set((state) => {
        const newValidation = new Map(state.domainValidation);
        newValidation.set(id, result);
        return { domainValidation: newValidation };
      });

      return result;
    },

    validateAllDomains: async () => {
      const { multiDomainConfig } = get();
      if (!multiDomainConfig) return new Map();

      const validationMap = new Map<string, ValidationResult>();

      for (const domain of multiDomainConfig.domains) {
        const result = await get().validateDomain(domain.id);
        validationMap.set(domain.id, result);
      }

      return validationMap;
    },

    // 获取方法
    getDomain: (id) => {
      const { multiDomainConfig } = get();
      return multiDomainConfig?.domains.find(d => d.id === id) || null;
    },

    getActiveDomains: () => {
      const { multiDomainConfig } = get();
      return multiDomainConfig?.domains.filter(d => d.enabled) || [];
    },

    isMultiDomainEnabled: () => {
      const { basicInfo } = get();
      return basicInfo?.enableMultiDomain || false;
    },

    // 权重管理
    normalizeWeights: () => {
      const { multiDomainConfig } = get();
      if (!multiDomainConfig) return;

      const activeDomains = multiDomainConfig.domains.filter(d => d.enabled);
      if (activeDomains.length === 0) return;

      const totalWeight = activeDomains.reduce((sum, d) => sum + d.weight, 0);

      if (totalWeight !== 100) {
        // 自动调整权重使总和为100
        const factor = 100 / totalWeight;
        const normalizedDomains = multiDomainConfig.domains.map(domain => {
          if (!domain.enabled) return domain;
          return {
            ...domain,
            weight: Math.round(domain.weight * factor),
            updatedAt: new Date().toISOString()
          };
        });

        // 处理舍入误差
        const newTotal = normalizedDomains
          .filter(d => d.enabled)
          .reduce((sum, d) => sum + d.weight, 0);

        if (newTotal !== 100 && activeDomains.length > 0) {
          const diff = 100 - newTotal;
          const firstActiveDomain = normalizedDomains.find(d => d.enabled);
          if (firstActiveDomain) {
            firstActiveDomain.weight += diff;
          }
        }

        set({
          multiDomainConfig: {
            ...multiDomainConfig,
            domains: normalizedDomains
          }
        });
      }
    },

    getWeightSummary: () => {
      const { multiDomainConfig } = get();
      if (!multiDomainConfig) return { total: 0, isValid: false };

      const activeDomains = multiDomainConfig.domains.filter(d => d.enabled);
      const total = activeDomains.reduce((sum, d) => sum + d.weight, 0);

      return {
        total,
        isValid: total === 100
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