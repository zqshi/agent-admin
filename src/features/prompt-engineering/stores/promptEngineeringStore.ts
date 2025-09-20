/**
 * Prompt Engineering 状态管理Store
 * 使用Zustand + Immer实现可维护的状态管理
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import type {
  PromptEngineeringState,
  PromptTemplate,
  SlotDefinition,
  InjectionStrategy,
  CompressionStrategy,
  PreviewResult,
  OptimizationSuggestion,
  ConfigState,
  ConfigMode,
  ConfigSnapshot,
  ConfigPreset,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigValidationResult
} from '../types';

// 默认的注入策略
const defaultInjectionStrategy: InjectionStrategy = {
  id: 'default',
  name: '默认策略',
  timing: 'immediate',
  order: [],
  performance: {
    timeout: 5000,
    retryCount: 3
  }
};

// 默认的压缩策略
const defaultCompressionStrategy: CompressionStrategy = {
  id: 'default',
  name: '智能压缩',
  algorithm: 'semantic',
  config: {
    maxTokens: 4000,
    compressionRatio: 0.7,
    qualityThreshold: 0.8,
    preserveKeywords: [],
    preserveStructure: true
  },
  rules: [],
  adaptive: {
    enabled: true,
    learningRate: 0.1,
    feedbackLoop: true,
    minSamples: 10
  }
};

// 创建默认配置状态
const createDefaultConfig = (): ConfigState => ({
  source: 'custom',
  mode: 'custom',
  baseTemplateId: undefined,
  isModified: false,
  slots: [],
  compressionStrategy: defaultCompressionStrategy,
  injectionStrategy: defaultInjectionStrategy,
  lastModified: new Date().toISOString(),
  version: '1.0.0'
});

// 内置压缩策略预设
const builtInCompressionPresets: CompressionStrategy[] = [
  {
    id: 'light-compression',
    name: '轻度压缩',
    algorithm: 'syntactic',
    config: {
      maxTokens: 8000,
      compressionRatio: 0.9,
      qualityThreshold: 0.95,
      preserveKeywords: [],
      preserveStructure: true
    },
    rules: [],
    adaptive: { enabled: false, learningRate: 0, feedbackLoop: false, minSamples: 0 }
  },
  {
    id: 'medium-compression',
    name: '中度压缩',
    algorithm: 'semantic',
    config: {
      maxTokens: 4000,
      compressionRatio: 0.7,
      qualityThreshold: 0.8,
      preserveKeywords: [],
      preserveStructure: true
    },
    rules: [],
    adaptive: { enabled: true, learningRate: 0.1, feedbackLoop: true, minSamples: 10 }
  },
  {
    id: 'heavy-compression',
    name: '重度压缩',
    algorithm: 'hybrid',
    config: {
      maxTokens: 2000,
      compressionRatio: 0.5,
      qualityThreshold: 0.6,
      preserveKeywords: [],
      preserveStructure: false
    },
    rules: [],
    adaptive: { enabled: true, learningRate: 0.2, feedbackLoop: true, minSamples: 5 }
  }
];

// 内置注入策略预设
const builtInInjectionPresets: InjectionStrategy[] = [
  {
    id: 'sequential',
    name: '顺序注入',
    timing: 'immediate',
    order: [],
    performance: { timeout: 5000, retryCount: 3 }
  },
  {
    id: 'priority-based',
    name: '优先级注入',
    timing: 'immediate',
    order: [],
    performance: { timeout: 3000, retryCount: 2 }
  },
  {
    id: 'lazy-loading',
    name: '延迟注入',
    timing: 'lazy',
    order: [],
    performance: { timeout: 10000, retryCount: 1 }
  }
];

// 初始状态
const initialState: PromptEngineeringState = {
  // 模板相关
  templates: [],
  selectedTemplate: null,
  templateCategories: [],

  // 配置状态（新增）
  config: createDefaultConfig(),
  configHistory: [],
  configPresets: [],
  configValidation: null,

  // Slot相关
  slots: [],
  slotValues: {},
  slotErrors: {},

  // 策略相关
  injectionStrategy: defaultInjectionStrategy,
  compressionStrategy: defaultCompressionStrategy,

  // 策略预设（新增）
  compressionPresets: builtInCompressionPresets,
  injectionPresets: builtInInjectionPresets,

  // 预览相关
  previewResult: null,
  isCompiling: false,
  lastCompileTime: null,

  // UI状态
  ui: {
    activeTab: 'templates',
    sidebarOpen: true,
    previewMode: 'split',
    showAdvanced: false,
    configMode: 'custom',
    showConfigModeSelector: true
  },

  // 加载状态
  loading: {
    templates: false,
    compilation: false,
    preview: false,
    presets: false,
    validation: false
  },

  // 错误状态
  errors: {
    compilation: null,
    slots: {},
    general: null,
    config: null
  }
};

export interface PromptEngineeringStore extends PromptEngineeringState {
  // ===== 模板管理 Actions =====

  // 加载模板列表
  loadTemplates: () => Promise<void>;

  // 选择模板
  selectTemplate: (template: PromptTemplate | null) => void;

  // 添加模板到收藏
  favoriteTemplate: (templateId: string) => Promise<void>;

  // 分叉模板
  forkTemplate: (templateId: string, newName: string) => Promise<PromptTemplate>;

  // ===== Slot管理 Actions =====

  // 添加Slot
  addSlot: (slot: SlotDefinition) => void;

  // 更新Slot定义
  updateSlot: (slotId: string, updates: Partial<SlotDefinition>) => void;

  // 删除Slot
  removeSlot: (slotId: string) => void;

  // 更新Slot值
  updateSlotValue: (slotId: string, value: any) => void;

  // 清除Slot值
  clearSlotValue: (slotId: string) => void;

  // 批量更新Slot值
  batchUpdateSlotValues: (values: Record<string, any>) => void;

  // 重新排序Slots
  reorderSlots: (newOrder: string[]) => void;

  // 验证Slot值
  validateSlots: () => Record<string, string>;

  // ===== 策略管理 Actions =====

  // 更新注入策略
  updateInjectionStrategy: (strategy: Partial<InjectionStrategy>) => void;

  // 更新压缩策略
  updateCompressionStrategy: (strategy: Partial<CompressionStrategy>) => void;

  // 重置策略为默认值
  resetStrategies: () => void;

  // 应用策略预设
  applyCompressionPreset: (presetId: string) => void;
  applyInjectionPreset: (presetId: string) => void;

  // ===== 配置管理 Actions =====

  // 切换配置模式
  setConfigMode: (mode: ConfigMode) => void;

  // 从模板创建配置
  createConfigFromTemplate: (templateId: string, mode: 'inherit' | 'copy') => void;

  // 创建自定义配置
  createCustomConfig: () => void;

  // 转换为混合模式
  convertToHybridMode: () => void;

  // 从模板分离
  separateFromTemplate: () => void;

  // 保存配置快照
  saveConfigSnapshot: (name: string, description?: string) => void;

  // 加载配置快照
  loadConfigSnapshot: (snapshotId: string) => void;

  // 删除配置快照
  deleteConfigSnapshot: (snapshotId: string) => void;

  // 验证配置
  validateConfig: () => Promise<ConfigValidationResult>;

  // 获取配置差异
  getConfigDiff: (baseConfigId?: string) => any;

  // 合并配置
  mergeConfig: (partialConfig: Partial<ConfigState>) => void;

  // ===== 独立Slot配置管理 Actions =====

  // 创建独立的slot配置（不依赖模板）
  createIndependentSlot: (slot: Omit<SlotDefinition, 'id'>) => void;

  // 导入slot预设
  importSlotPresets: (presets: SlotDefinition[]) => void;

  // 从模板中提取slots作为独立配置
  extractSlotsFromTemplate: (templateId: string) => void;

  // 清空所有slot配置
  clearAllSlots: () => void;

  // 导出当前slot配置
  exportSlotConfig: () => SlotDefinition[];

  // ===== 编译和预览 Actions =====

  // 编译Prompt
  compilePrompt: () => Promise<PreviewResult>;

  // 更新预览结果
  updatePreviewResult: (result: PreviewResult) => void;

  // 清除预览结果
  clearPreviewResult: () => void;

  // 应用优化建议
  applyOptimization: (suggestion: OptimizationSuggestion) => void;

  // ===== UI状态管理 Actions =====

  // 切换活跃标签
  setActiveTab: (tab: PromptEngineeringState['ui']['activeTab']) => void;

  // 切换侧边栏
  toggleSidebar: () => void;

  // 设置预览模式
  setPreviewMode: (mode: PromptEngineeringState['ui']['previewMode']) => void;

  // 切换高级选项显示
  toggleAdvanced: () => void;

  // ===== 错误处理 Actions =====

  // 设置编译错误
  setCompilationError: (error: string | null) => void;

  // 设置Slot错误
  setSlotError: (slotId: string, error: string | null) => void;

  // 设置通用错误
  setGeneralError: (error: string | null) => void;

  // 清除所有错误
  clearErrors: () => void;

  // ===== 工具函数 Actions =====

  // 重置整个状态
  resetState: () => void;

  // 导出配置
  exportConfig: () => string;

  // 导入配置
  importConfig: (config: string) => void;

  // 获取当前配置摘要
  getConfigSummary: () => {
    templateName: string | null;
    slotCount: number;
    hasErrors: boolean;
    isReady: boolean;
  };
}

export const usePromptEngineeringStore = create<PromptEngineeringStore>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // ===== 模板管理 Actions实现 =====

      loadTemplates: async () => {
        set((state) => {
          state.loading.templates = true;
          state.errors.general = null;
        });

        try {
          // TODO: 替换为实际API调用
          const mockTemplates: PromptTemplate[] = [
            {
              id: 'customer-service',
              name: '客户服务助手',
              category: '客户服务',
              description: '专业的客户服务对话模板，适用于各种客户咨询场景',
              basePrompt: '你是一位专业的{{role}}，负责为{{company}}提供优质的客户服务。请保持{{tone}}的语调，并遵循以下服务原则：{{principles}}。',
              slots: [
                {
                  id: 'role',
                  name: '角色',
                  type: 'user',
                  required: true,
                  defaultValue: '客服代表',
                  errorHandling: { strategy: 'fallback', fallbackValue: '客服代表' }
                },
                {
                  id: 'company',
                  name: '公司名称',
                  type: 'user',
                  required: true,
                  defaultValue: '',
                  errorHandling: { strategy: 'fallback', fallbackValue: '本公司' }
                },
                {
                  id: 'tone',
                  name: '语调',
                  type: 'user',
                  required: false,
                  defaultValue: '友好和专业',
                  errorHandling: { strategy: 'fallback', fallbackValue: '专业' }
                },
                {
                  id: 'principles',
                  name: '服务原则',
                  type: 'user',
                  required: false,
                  defaultValue: '1. 耐心倾听 2. 快速响应 3. 准确解答',
                  errorHandling: { strategy: 'fallback' }
                }
              ],
              metadata: {
                author: 'System',
                version: '1.0.0',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tags: ['客服', '对话', '通用'],
                examples: []
              },
              usage: {
                count: 156,
                rating: 4.6,
                reviews: [],
                avgResponseTime: 1200,
                successRate: 0.92
              },
              socialProof: {
                usedByTeams: ['客服团队', '销售团队'],
                endorsements: 23,
                forkCount: 8,
                starCount: 45
              },
              settings: {
                allowFork: true,
                allowEdit: true,
                visibility: 'public'
              }
            }
          ];

          set((state) => {
            state.templates = mockTemplates;
            state.templateCategories = Array.from(new Set(mockTemplates.map(t => t.category)));
            state.loading.templates = false;
          });
        } catch (error) {
          set((state) => {
            state.loading.templates = false;
            state.errors.general = error instanceof Error ? error.message : '加载模板失败';
          });
        }
      },

      selectTemplate: (template) => {
        set((state) => {
          state.selectedTemplate = template;

          if (template) {
            // 根据当前配置模式决定行为
            const currentMode = state.ui.configMode;

            if (currentMode === 'template-based') {
              // 模板模式：完全使用模板配置
              get().createConfigFromTemplate(template.id, 'inherit');
            } else if (currentMode === 'custom') {
              // 自定义模式：仅作为参考，不自动应用
              // 用户可以手动选择应用模板配置
            } else if (currentMode === 'mixed') {
              // 混合模式：智能合并
              get().createConfigFromTemplate(template.id, 'copy');
            }
          } else {
            // 如果取消选择模板
            if (state.config.source === 'template') {
              // 如果当前配置基于模板，转换为自定义模式
              state.config.source = 'custom';
              state.config.mode = 'custom';
              state.config.baseTemplateId = undefined;
              state.ui.configMode = 'custom';
            }
          }

          // 清除之前的错误
          state.errors.compilation = null;
          state.errors.general = null;
        });
      },

      favoriteTemplate: async (templateId) => {
        // TODO: 实现收藏API调用
        console.log('Favoriting template:', templateId);
      },

      forkTemplate: async (templateId, newName) => {
        // TODO: 实现分叉API调用
        const originalTemplate = get().templates.find(t => t.id === templateId);
        if (!originalTemplate) {
          throw new Error('Template not found');
        }

        const forkedTemplate: PromptTemplate = {
          ...originalTemplate,
          id: `${templateId}-fork-${Date.now()}`,
          name: newName,
          metadata: {
            ...originalTemplate.metadata,
            author: 'Current User', // TODO: 从用户上下文获取
            version: '1.0.0',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          usage: {
            count: 0,
            rating: 0,
            reviews: [],
            avgResponseTime: 0,
            successRate: 0
          },
          socialProof: {
            usedByTeams: [],
            endorsements: 0,
            forkCount: 0,
            starCount: 0
          }
        };

        set((state) => {
          state.templates.unshift(forkedTemplate);
        });

        return forkedTemplate;
      },

      // ===== Slot管理 Actions实现 =====

      addSlot: (slot) => {
        set((state) => {
          state.slots.push(slot);

          // 更新注入策略
          state.injectionStrategy.order.push({
            slotId: slot.id,
            priority: slot.required ? 1 : 2
          });

          // 设置默认值
          if (slot.defaultValue !== undefined) {
            state.slotValues[slot.id] = slot.defaultValue;
          }
        });
      },

      updateSlot: (slotId, updates) => {
        set((state) => {
          const slotIndex = state.slots.findIndex(s => s.id === slotId);
          if (slotIndex !== -1) {
            state.slots[slotIndex] = { ...state.slots[slotIndex], ...updates };
          }
        });
      },

      removeSlot: (slotId) => {
        set((state) => {
          state.slots = state.slots.filter(s => s.id !== slotId);
          delete state.slotValues[slotId];
          delete state.slotErrors[slotId];

          // 更新注入策略
          state.injectionStrategy.order = state.injectionStrategy.order.filter(
            o => o.slotId !== slotId
          );
        });
      },

      updateSlotValue: (slotId, value) => {
        set((state) => {
          state.slotValues[slotId] = value;

          // 清除该Slot的错误
          if (state.slotErrors[slotId]) {
            delete state.slotErrors[slotId];
          }
        });
      },

      clearSlotValue: (slotId) => {
        set((state) => {
          delete state.slotValues[slotId];
        });
      },

      batchUpdateSlotValues: (values) => {
        set((state) => {
          Object.assign(state.slotValues, values);

          // 清除相关错误
          Object.keys(values).forEach(slotId => {
            if (state.slotErrors[slotId]) {
              delete state.slotErrors[slotId];
            }
          });
        });
      },

      reorderSlots: (newOrder) => {
        set((state) => {
          const reorderedSlots = newOrder.map(id =>
            state.slots.find(slot => slot.id === id)!
          ).filter(Boolean);

          state.slots = reorderedSlots;

          // 更新注入策略顺序
          state.injectionStrategy.order = newOrder.map((slotId, index) => ({
            slotId,
            priority: index + 1
          }));
        });
      },

      validateSlots: () => {
        const { slots, slotValues } = get();
        const errors: Record<string, string> = {};

        slots.forEach(slot => {
          if (slot.required && (!slotValues[slot.id] || slotValues[slot.id] === '')) {
            errors[slot.id] = `${slot.name}是必填项`;
          }

          // TODO: 添加其他验证规则
          if (slot.validation) {
            slot.validation.forEach(rule => {
              const value = slotValues[slot.id];
              switch (rule.type) {
                case 'required':
                  if (!value) {
                    errors[slot.id] = rule.message;
                  }
                  break;
                case 'type':
                  // TODO: 实现类型验证
                  break;
                case 'length':
                  if (typeof value === 'string' && value.length > (rule.value as number)) {
                    errors[slot.id] = rule.message;
                  }
                  break;
                // TODO: 实现其他验证类型
              }
            });
          }
        });

        set((state) => {
          state.slotErrors = errors;
        });

        return errors;
      },

      // ===== 策略管理 Actions实现 =====

      updateInjectionStrategy: (strategy) => {
        set((state) => {
          state.injectionStrategy = { ...state.injectionStrategy, ...strategy };
        });
      },

      updateCompressionStrategy: (strategy) => {
        set((state) => {
          state.compressionStrategy = { ...state.compressionStrategy, ...strategy };
        });
      },

      resetStrategies: () => {
        set((state) => {
          state.injectionStrategy = { ...defaultInjectionStrategy };
          state.compressionStrategy = { ...defaultCompressionStrategy };
        });
      },

      // ===== 编译和预览 Actions实现 =====

      compilePrompt: async () => {
        const { selectedTemplate, slotValues, injectionStrategy, compressionStrategy } = get();

        if (!selectedTemplate) {
          throw new Error('No template selected');
        }

        set((state) => {
          state.loading.compilation = true;
          state.isCompiling = true;
          state.errors.compilation = null;
        });

        try {
          // 验证Slots
          const validationErrors = get().validateSlots();
          if (Object.keys(validationErrors).length > 0) {
            throw new Error('请先修正Slot验证错误');
          }

          // TODO: 实现实际的编译逻辑
          let compiledPrompt = selectedTemplate.basePrompt;

          // 简单的Slot替换实现
          selectedTemplate.slots.forEach(slot => {
            const value = slotValues[slot.id] || slot.defaultValue || '';
            const placeholder = `{{${slot.id}}}`;
            compiledPrompt = compiledPrompt.replace(new RegExp(placeholder, 'g'), value);
          });

          // 计算Token数量（简化实现）
          const tokenCount = Math.ceil(compiledPrompt.length / 4);

          // 模拟压缩（如果启用）
          let finalPrompt = compiledPrompt;
          if (compressionStrategy.config.maxTokens < tokenCount) {
            const targetLength = Math.floor(compiledPrompt.length * compressionStrategy.config.compressionRatio);
            finalPrompt = compiledPrompt.substring(0, targetLength) + '...';
          }

          const result: PreviewResult = {
            compiledPrompt: finalPrompt,
            tokenCount: Math.ceil(finalPrompt.length / 4),
            estimatedCost: Math.ceil(finalPrompt.length / 4) * 0.002, // 模拟价格
            estimatedResponseTime: 1500 + Math.random() * 1000,
            qualityScore: 0.85 + Math.random() * 0.1,
            metrics: {
              tokenUsage: {
                prompt: Math.ceil(finalPrompt.length / 4),
                completion: 0,
                total: Math.ceil(finalPrompt.length / 4),
                percentage: (Math.ceil(finalPrompt.length / 4) / 4000) * 100
              },
              cost: {
                input: Math.ceil(finalPrompt.length / 4) * 0.002,
                output: 0,
                total: Math.ceil(finalPrompt.length / 4) * 0.002,
                currency: 'USD'
              },
              time: {
                compilation: 150,
                injection: 50,
                compression: compressionStrategy.config.maxTokens < tokenCount ? 200 : 0,
                total: 200 + (compressionStrategy.config.maxTokens < tokenCount ? 200 : 0)
              },
              quality: {
                clarity: 0.9,
                relevance: 0.85,
                completeness: 0.8,
                overall: 0.85
              }
            },
            suggestions: [],
            issues: []
          };

          set((state) => {
            state.previewResult = result;
            state.loading.compilation = false;
            state.isCompiling = false;
            state.lastCompileTime = new Date().toISOString();
          });

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : '编译失败';

          set((state) => {
            state.loading.compilation = false;
            state.isCompiling = false;
            state.errors.compilation = errorMessage;
          });

          throw error;
        }
      },

      updatePreviewResult: (result) => {
        set((state) => {
          state.previewResult = result;
        });
      },

      clearPreviewResult: () => {
        set((state) => {
          state.previewResult = null;
          state.lastCompileTime = null;
        });
      },

      applyOptimization: (suggestion) => {
        // TODO: 实现优化建议应用逻辑
        console.log('Applying optimization:', suggestion);
      },

      // ===== UI状态管理 Actions实现 =====

      setActiveTab: (tab) => {
        set((state) => {
          state.ui.activeTab = tab;
        });
      },

      toggleSidebar: () => {
        set((state) => {
          state.ui.sidebarOpen = !state.ui.sidebarOpen;
        });
      },

      setPreviewMode: (mode) => {
        set((state) => {
          state.ui.previewMode = mode;
        });
      },

      toggleAdvanced: () => {
        set((state) => {
          state.ui.showAdvanced = !state.ui.showAdvanced;
        });
      },

      // ===== 错误处理 Actions实现 =====

      setCompilationError: (error) => {
        set((state) => {
          state.errors.compilation = error;
        });
      },

      setSlotError: (slotId, error) => {
        set((state) => {
          if (error) {
            state.errors.slots[slotId] = error;
          } else {
            delete state.errors.slots[slotId];
          }
        });
      },

      setGeneralError: (error) => {
        set((state) => {
          state.errors.general = error;
        });
      },

      clearErrors: () => {
        set((state) => {
          state.errors = {
            compilation: null,
            slots: {},
            general: null,
            config: null
          };
        });
      },

      // ===== 工具函数 Actions实现 =====

      resetState: () => {
        set(() => ({ ...initialState }));
      },

      exportConfig: () => {
        const { selectedTemplate, slotValues, injectionStrategy, compressionStrategy } = get();

        const config = {
          template: selectedTemplate,
          slotValues,
          injectionStrategy,
          compressionStrategy,
          exportedAt: new Date().toISOString()
        };

        return JSON.stringify(config, null, 2);
      },

      importConfig: (configString) => {
        try {
          const config = JSON.parse(configString);

          set((state) => {
            if (config.template) {
              state.selectedTemplate = config.template;
              state.slots = config.template.slots || [];
            }

            if (config.slotValues) {
              state.slotValues = config.slotValues;
            }

            if (config.injectionStrategy) {
              state.injectionStrategy = config.injectionStrategy;
            }

            if (config.compressionStrategy) {
              state.compressionStrategy = config.compressionStrategy;
            }

            // 清除错误
            state.errors = {
              compilation: null,
              slots: {},
              general: null,
              config: null
            };
          });
        } catch (error) {
          set((state) => {
            state.errors.general = '配置文件格式错误';
          });
        }
      },

      // ===== 策略预设 Actions实现 =====

      applyCompressionPreset: (presetId) => {
        set((state) => {
          const preset = state.compressionPresets.find(p => p.id === presetId);
          if (preset) {
            state.compressionStrategy = { ...preset };
            state.config.compressionStrategy = { ...preset };
            state.config.isModified = true;
            state.config.lastModified = new Date().toISOString();
          }
        });
      },

      applyInjectionPreset: (presetId) => {
        set((state) => {
          const preset = state.injectionPresets.find(p => p.id === presetId);
          if (preset) {
            state.injectionStrategy = { ...preset };
            state.config.injectionStrategy = { ...preset };
            state.config.isModified = true;
            state.config.lastModified = new Date().toISOString();
          }
        });
      },

      // ===== 配置管理 Actions实现 =====

      setConfigMode: (mode) => {
        set((state) => {
          state.ui.configMode = mode;

          // 根据模式调整配置状态
          if (mode === 'custom' && state.config.source === 'template') {
            state.config.source = 'custom';
            state.config.mode = 'custom';
            state.config.baseTemplateId = undefined;
          } else if (mode === 'template-based' && state.selectedTemplate) {
            state.config.source = 'template';
            state.config.mode = 'template-based';
            state.config.baseTemplateId = state.selectedTemplate.id;
          }
        });
      },

      createConfigFromTemplate: (templateId, mode) => {
        set((state) => {
          const template = state.templates.find(t => t.id === templateId);
          if (!template) return;

          if (mode === 'inherit') {
            // 继承模式：实时同步模板变更
            state.config = {
              source: 'template',
              mode: 'template-based',
              baseTemplateId: templateId,
              isModified: false,
              slots: template.slots,
              compressionStrategy: state.config.compressionStrategy,
              injectionStrategy: state.config.injectionStrategy,
              lastModified: new Date().toISOString(),
              version: template.metadata.version
            };
          } else if (mode === 'copy') {
            // 复制模式：复制模板配置但允许修改
            state.config = {
              source: 'hybrid',
              mode: 'mixed',
              baseTemplateId: templateId,
              isModified: false,
              slots: [...template.slots],
              compressionStrategy: state.config.compressionStrategy,
              injectionStrategy: state.config.injectionStrategy,
              lastModified: new Date().toISOString(),
              version: '1.0.0'
            };
          }

          // 同步到旧的状态结构（向后兼容）
          state.slots = state.config.slots;
          state.slotValues = {};
          state.slotErrors = {};

          // 设置默认值
          template.slots.forEach(slot => {
            if (slot.defaultValue !== undefined) {
              state.slotValues[slot.id] = slot.defaultValue;
            }
          });

          // 更新注入策略
          state.injectionStrategy.order = template.slots.map(slot => ({
            slotId: slot.id,
            priority: slot.required ? 1 : 2
          }));
        });
      },

      createCustomConfig: () => {
        set((state) => {
          state.config = createDefaultConfig();
          state.selectedTemplate = null;
          state.slots = [];
          state.slotValues = {};
          state.slotErrors = {};
          state.ui.configMode = 'custom';
        });
      },

      convertToHybridMode: () => {
        set((state) => {
          if (state.config.source === 'template') {
            state.config.source = 'hybrid';
            state.config.mode = 'mixed';
            state.config.isModified = true;
            state.config.lastModified = new Date().toISOString();
            state.ui.configMode = 'mixed';
          }
        });
      },

      separateFromTemplate: () => {
        set((state) => {
          state.config = {
            ...state.config,
            source: 'custom',
            mode: 'custom',
            baseTemplateId: undefined,
            isModified: true,
            lastModified: new Date().toISOString()
          };
          state.ui.configMode = 'custom';
        });
      },

      saveConfigSnapshot: (name, description) => {
        set((state) => {
          const snapshot: ConfigSnapshot = {
            id: `snapshot-${Date.now()}`,
            name,
            description,
            config: { ...state.config },
            createdAt: new Date().toISOString(),
            tags: []
          };
          state.configHistory.push(snapshot);
        });
      },

      loadConfigSnapshot: (snapshotId) => {
        set((state) => {
          const snapshot = state.configHistory.find(s => s.id === snapshotId);
          if (snapshot) {
            state.config = { ...snapshot.config };

            // 同步到其他状态
            state.slots = state.config.slots;
            state.compressionStrategy = state.config.compressionStrategy;
            state.injectionStrategy = state.config.injectionStrategy;
            state.ui.configMode = state.config.mode;
          }
        });
      },

      deleteConfigSnapshot: (snapshotId) => {
        set((state) => {
          state.configHistory = state.configHistory.filter(s => s.id !== snapshotId);
        });
      },

      validateConfig: async () => {
        const { config, slots, slotValues } = get();

        const errors: ConfigValidationError[] = [];
        const warnings: ConfigValidationWarning[] = [];

        // 验证slots
        slots.forEach(slot => {
          if (slot.required && (!slotValues[slot.id] || slotValues[slot.id] === '')) {
            errors.push({
              type: 'missing',
              field: `slot.${slot.id}`,
              message: `${slot.name}是必填项`,
              severity: 'error',
              suggestion: `请为${slot.name}提供有效值`
            });
          }
        });

        // 验证策略配置
        if (config.compressionStrategy.config.maxTokens < 100) {
          warnings.push({
            type: 'performance',
            field: 'compressionStrategy.maxTokens',
            message: 'Token限制过低可能影响输出质量',
            impact: 'medium',
            suggestion: '建议设置至少1000个Token'
          });
        }

        const result: ConfigValidationResult = {
          isValid: errors.length === 0,
          errors,
          warnings,
          completeness: Math.max(0, 1 - (errors.length * 0.2) - (warnings.length * 0.1))
        };

        set((state) => {
          state.configValidation = result;
        });

        return result;
      },

      getConfigDiff: (baseConfigId) => {
        const { config, configHistory } = get();

        if (!baseConfigId) {
          return {
            changed: true,
            differences: ['全新配置']
          };
        }

        const baseConfig = configHistory.find(h => h.id === baseConfigId)?.config;
        if (!baseConfig) {
          return { changed: true, differences: ['无法找到基础配置'] };
        }

        const differences: string[] = [];

        if (config.slots.length !== baseConfig.slots.length) {
          differences.push(`Slot数量: ${baseConfig.slots.length} → ${config.slots.length}`);
        }

        if (config.compressionStrategy.id !== baseConfig.compressionStrategy.id) {
          differences.push(`压缩策略: ${baseConfig.compressionStrategy.name} → ${config.compressionStrategy.name}`);
        }

        return {
          changed: differences.length > 0,
          differences
        };
      },

      mergeConfig: (partialConfig) => {
        set((state) => {
          Object.assign(state.config, partialConfig);
          state.config.isModified = true;
          state.config.lastModified = new Date().toISOString();

          // 同步到其他状态
          if (partialConfig.slots) {
            state.slots = partialConfig.slots;
          }
          if (partialConfig.compressionStrategy) {
            state.compressionStrategy = partialConfig.compressionStrategy;
          }
          if (partialConfig.injectionStrategy) {
            state.injectionStrategy = partialConfig.injectionStrategy;
          }
        });
      },

      // ===== 独立Slot配置管理 Actions实现 =====

      createIndependentSlot: (slot) => {
        const newSlot: SlotDefinition = {
          ...slot,
          id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        set((state) => {
          state.slots.push(newSlot);

          // 更新配置模式为自定义
          if (state.config.mode === 'template-based') {
            state.config.mode = 'custom';
            state.config.source = 'custom';
            state.ui.configMode = 'custom';
          }

          // 设置默认值
          if (newSlot.defaultValue !== undefined) {
            state.slotValues[newSlot.id] = newSlot.defaultValue;
          }

          // 标记为已修改
          state.config.isModified = true;
          state.config.lastModified = new Date().toISOString();
        });
      },

      importSlotPresets: (presets) => {
        set((state) => {
          // 为每个预设生成新的ID
          const slotsWithNewIds = presets.map(preset => ({
            ...preset,
            id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }));

          state.slots.push(...slotsWithNewIds);

          // 设置默认值
          slotsWithNewIds.forEach(slot => {
            if (slot.defaultValue !== undefined) {
              state.slotValues[slot.id] = slot.defaultValue;
            }
          });

          // 更新配置模式
          if (state.config.mode === 'template-based' && slotsWithNewIds.length > 0) {
            state.config.mode = 'mixed';
            state.config.source = 'hybrid';
            state.ui.configMode = 'mixed';
          }

          // 标记为已修改
          state.config.isModified = true;
          state.config.lastModified = new Date().toISOString();
        });
      },

      extractSlotsFromTemplate: (templateId) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return;

        set((state) => {
          // 清空现有slots
          state.slots = [];
          state.slotValues = {};

          // 复制模板的slots
          const extractedSlots = template.slots.map(slot => ({
            ...slot,
            id: `extracted_${slot.id}_${Date.now()}`
          }));

          state.slots = extractedSlots;

          // 设置默认值
          extractedSlots.forEach(slot => {
            if (slot.defaultValue !== undefined) {
              state.slotValues[slot.id] = slot.defaultValue;
            }
          });

          // 更新配置状态
          state.config.mode = 'custom';
          state.config.source = 'custom';
          state.config.baseTemplateId = templateId;
          state.ui.configMode = 'custom';
          state.config.isModified = true;
          state.config.lastModified = new Date().toISOString();
        });
      },

      clearAllSlots: () => {
        set((state) => {
          state.slots = [];
          state.slotValues = {};

          // 重置注入策略
          state.injectionStrategy.order = [];

          // 更新配置状态
          state.config.mode = 'custom';
          state.config.source = 'custom';
          state.config.baseTemplateId = undefined;
          state.config.isModified = true;
          state.config.lastModified = new Date().toISOString();
        });
      },

      exportSlotConfig: () => {
        return get().slots;
      },

      getConfigSummary: () => {
        const { config, selectedTemplate, slots, slotErrors, previewResult } = get();

        return {
          templateName: config.source === 'template' && selectedTemplate ? selectedTemplate.name : null,
          slotCount: slots.length,
          hasErrors: Object.keys(slotErrors).length > 0,
          isReady: config.source !== 'template' || (selectedTemplate !== null && Object.keys(slotErrors).length === 0)
        };
      }
    })),
    {
      name: 'prompt-engineering-store',
      partialize: (state) => ({
        // 只持久化必要的状态
        selectedTemplate: state.selectedTemplate,
        slotValues: state.slotValues,
        injectionStrategy: state.injectionStrategy,
        compressionStrategy: state.compressionStrategy,
        config: state.config,
        configHistory: state.configHistory,
        ui: state.ui
      })
    }
  )
);