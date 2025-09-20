/**
 * Slot管理Hook
 * 提供Slot相关的操作和状态管理
 */

import { useCallback, useEffect, useMemo } from 'react';
import { usePromptEngineeringStore } from '../stores/promptEngineeringStore';
import { SlotResolver } from '../services/slotResolver';
import type { SlotDefinition, InjectionStrategy } from '../types';

export interface UseSlotManagementReturn {
  // 状态
  slots: SlotDefinition[];
  slotValues: Record<string, any>;
  slotErrors: Record<string, string>;
  injectionStrategy: InjectionStrategy;
  isResolving: boolean;

  // Slot CRUD操作
  addSlot: (slot: SlotDefinition) => void;
  updateSlot: (slotId: string, updates: Partial<SlotDefinition>) => void;
  removeSlot: (slotId: string) => void;
  duplicateSlot: (slotId: string) => void;
  reorderSlots: (newOrder: string[]) => void;

  // 值管理
  updateSlotValue: (slotId: string, value: any) => void;
  clearSlotValue: (slotId: string) => void;
  batchUpdateSlotValues: (values: Record<string, any>) => void;
  resetSlotValues: () => void;

  // 验证
  validateSlots: () => Record<string, string>;
  validateSlot: (slotId: string) => string | null;
  hasValidationErrors: boolean;

  // 依赖关系
  getSlotDependencies: (slotId: string) => string[];
  getDependentSlots: (slotId: string) => string[];
  validateDependencies: () => string[];

  // 解析
  resolveSlotValue: (slotId: string) => Promise<any>;
  resolveAllSlots: () => Promise<Record<string, any>>;

  // 分析
  getSlotStats: () => {
    total: number;
    byType: Record<string, number>;
    required: number;
    withDefaults: number;
    withDependencies: number;
  };

  // 工具方法
  exportSlotConfig: () => string;
  importSlotConfig: (config: string) => void;
  getSlotSuggestions: (basePrompt: string) => SlotDefinition[];
}

export const useSlotManagement = (): UseSlotManagementReturn => {
  const store = usePromptEngineeringStore();
  const slotResolver = useMemo(() => new SlotResolver(), []);

  const {
    slots,
    slotValues,
    slotErrors,
    injectionStrategy,
    addSlot: storeAddSlot,
    updateSlot: storeUpdateSlot,
    removeSlot: storeRemoveSlot,
    updateSlotValue: storeUpdateSlotValue,
    clearSlotValue: storeClearSlotValue,
    batchUpdateSlotValues: storeBatchUpdateSlotValues,
    reorderSlots: storeReorderSlots,
    validateSlots: storeValidateSlots,
    setSlotError
  } = store;

  // 添加Slot
  const addSlot = useCallback((slot: SlotDefinition) => {
    storeAddSlot(slot);
  }, [storeAddSlot]);

  // 更新Slot
  const updateSlot = useCallback((slotId: string, updates: Partial<SlotDefinition>) => {
    storeUpdateSlot(slotId, updates);
  }, [storeUpdateSlot]);

  // 删除Slot
  const removeSlot = useCallback((slotId: string) => {
    storeRemoveSlot(slotId);
  }, [storeRemoveSlot]);

  // 复制Slot
  const duplicateSlot = useCallback((slotId: string) => {
    const originalSlot = slots.find(s => s.id === slotId);
    if (!originalSlot) return;

    const duplicatedSlot: SlotDefinition = {
      ...originalSlot,
      id: `${originalSlot.id}_copy_${Date.now()}`,
      name: `${originalSlot.name} (副本)`
    };

    storeAddSlot(duplicatedSlot);
  }, [slots, storeAddSlot]);

  // 重新排序Slots
  const reorderSlots = useCallback((newOrder: string[]) => {
    storeReorderSlots(newOrder);
  }, [storeReorderSlots]);

  // 更新Slot值
  const updateSlotValue = useCallback((slotId: string, value: any) => {
    storeUpdateSlotValue(slotId, value);
  }, [storeUpdateSlotValue]);

  // 清除Slot值
  const clearSlotValue = useCallback((slotId: string) => {
    storeClearSlotValue(slotId);
  }, [storeClearSlotValue]);

  // 批量更新Slot值
  const batchUpdateSlotValues = useCallback((values: Record<string, any>) => {
    storeBatchUpdateSlotValues(values);
  }, [storeBatchUpdateSlotValues]);

  // 重置所有Slot值
  const resetSlotValues = useCallback(() => {
    const defaultValues: Record<string, any> = {};
    slots.forEach(slot => {
      if (slot.defaultValue !== undefined) {
        defaultValues[slot.id] = slot.defaultValue;
      }
    });
    storeBatchUpdateSlotValues(defaultValues);
  }, [slots, storeBatchUpdateSlotValues]);

  // 验证所有Slots
  const validateSlots = useCallback(() => {
    return storeValidateSlots();
  }, [storeValidateSlots]);

  // 验证单个Slot
  const validateSlot = useCallback((slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return null;

    const value = slotValues[slotId];

    // 必填验证
    if (slot.required && (value === undefined || value === null || value === '')) {
      return `${slot.name}是必填项`;
    }

    // 类型验证
    if (slot.validation) {
      for (const rule of slot.validation) {
        switch (rule.type) {
          case 'required':
            if (!value) return rule.message;
            break;
          case 'type':
            if (typeof value !== rule.value) return rule.message;
            break;
          case 'length':
            if (typeof value === 'string' && value.length > (rule.value as number)) {
              return rule.message;
            }
            break;
          case 'pattern':
            if (typeof value === 'string' && !new RegExp(rule.value as string).test(value)) {
              return rule.message;
            }
            break;
          case 'range':
            if (typeof value === 'number') {
              const range = rule.value as { min: number; max: number };
              if (value < range.min || value > range.max) {
                return rule.message;
              }
            }
            break;
          case 'custom':
            if (rule.validator && !rule.validator(value)) {
              return rule.message;
            }
            break;
        }
      }
    }

    return null;
  }, [slots, slotValues]);

  // 获取Slot依赖关系
  const getSlotDependencies = useCallback((slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    return slot?.dependencies || [];
  }, [slots]);

  // 获取依赖当前Slot的其他Slots
  const getDependentSlots = useCallback((slotId: string) => {
    return slots
      .filter(slot => slot.dependencies?.includes(slotId))
      .map(slot => slot.id);
  }, [slots]);

  // 验证依赖关系
  const validateDependencies = useCallback(() => {
    const errors: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const detectCycle = (slotId: string, path: string[] = []): boolean => {
      if (visiting.has(slotId)) {
        errors.push(`检测到循环依赖: ${[...path, slotId].join(' -> ')}`);
        return true;
      }

      if (visited.has(slotId)) return false;

      visiting.add(slotId);
      const dependencies = getSlotDependencies(slotId);

      for (const depId of dependencies) {
        const depSlot = slots.find(s => s.id === depId);
        if (!depSlot) {
          errors.push(`Slot "${slotId}" 依赖的Slot "${depId}" 不存在`);
          continue;
        }

        if (detectCycle(depId, [...path, slotId])) {
          return true;
        }
      }

      visiting.delete(slotId);
      visited.add(slotId);
      return false;
    };

    slots.forEach(slot => {
      if (!visited.has(slot.id)) {
        detectCycle(slot.id);
      }
    });

    return errors;
  }, [slots, getSlotDependencies]);

  // 解析单个Slot值
  const resolveSlotValue = useCallback(async (slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) throw new Error(`Slot ${slotId} 不存在`);

    try {
      const resolvedValues = await slotResolver.resolveSlots(
        [slot],
        slotValues,
        injectionStrategy
      );
      return resolvedValues[slotId];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '解析失败';
      setSlotError(slotId, errorMessage);
      throw error;
    }
  }, [slots, slotValues, injectionStrategy, slotResolver, setSlotError]);

  // 解析所有Slot值
  const resolveAllSlots = useCallback(async () => {
    try {
      return await slotResolver.resolveSlots(
        slots,
        slotValues,
        injectionStrategy
      );
    } catch (error) {
      console.error('解析Slots失败:', error);
      throw error;
    }
  }, [slots, slotValues, injectionStrategy, slotResolver]);

  // 获取Slot统计信息
  const getSlotStats = useCallback(() => {
    const stats = {
      total: slots.length,
      byType: {} as Record<string, number>,
      required: 0,
      withDefaults: 0,
      withDependencies: 0
    };

    slots.forEach(slot => {
      // 按类型统计
      stats.byType[slot.type] = (stats.byType[slot.type] || 0) + 1;

      // 必填统计
      if (slot.required) stats.required++;

      // 默认值统计
      if (slot.defaultValue !== undefined) stats.withDefaults++;

      // 依赖关系统计
      if (slot.dependencies && slot.dependencies.length > 0) {
        stats.withDependencies++;
      }
    });

    return stats;
  }, [slots]);

  // 导出Slot配置
  const exportSlotConfig = useCallback(() => {
    const config = {
      slots,
      slotValues,
      injectionStrategy,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(config, null, 2);
  }, [slots, slotValues, injectionStrategy]);

  // 导入Slot配置
  const importSlotConfig = useCallback((configString: string) => {
    try {
      const config = JSON.parse(configString);

      if (config.slots && Array.isArray(config.slots)) {
        // 清除现有Slots
        slots.forEach(slot => storeRemoveSlot(slot.id));

        // 添加新Slots
        config.slots.forEach((slot: SlotDefinition) => storeAddSlot(slot));
      }

      if (config.slotValues) {
        storeBatchUpdateSlotValues(config.slotValues);
      }

      if (config.injectionStrategy) {
        store.updateInjectionStrategy(config.injectionStrategy);
      }
    } catch (error) {
      throw new Error('配置文件格式错误');
    }
  }, [slots, storeRemoveSlot, storeAddSlot, storeBatchUpdateSlotValues, store]);

  // 从基础Prompt生成Slot建议
  const getSlotSuggestions = useCallback((basePrompt: string): SlotDefinition[] => {
    // 提取占位符
    const placeholders = basePrompt.match(/{{([^}]+)}}/g) || [];
    const suggestions: SlotDefinition[] = [];

    placeholders.forEach(placeholder => {
      const slotId = placeholder.slice(2, -2);

      // 检查是否已存在
      if (slots.some(slot => slot.id === slotId)) return;

      // 根据名称推断类型和属性
      let slotType: SlotDefinition['type'] = 'user';
      let required = true;
      let defaultValue: any = undefined;

      // 系统类型推断
      if (['current_time', 'current_date', 'current_user'].includes(slotId)) {
        slotType = 'system';
        required = false;
      }

      // API类型推断
      if (slotId.includes('api_') || slotId.includes('external_')) {
        slotType = 'api';
      }

      // 计算类型推断
      if (slotId.includes('calculated_') || slotId.includes('computed_')) {
        slotType = 'computed';
      }

      // 可选字段推断
      if (slotId.includes('optional_') || slotId.endsWith('_optional')) {
        required = false;
      }

      // 默认值推断
      if (slotId.includes('name')) {
        defaultValue = '用户';
      } else if (slotId.includes('company')) {
        defaultValue = '本公司';
      } else if (slotId.includes('tone')) {
        defaultValue = '友好专业';
      }

      suggestions.push({
        id: slotId,
        name: slotId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: slotType,
        required,
        defaultValue,
        errorHandling: {
          strategy: 'fallback',
          fallbackValue: defaultValue || ''
        }
      });
    });

    return suggestions;
  }, [slots]);

  // 计算衍生状态
  const derivedState = useMemo(() => {
    const hasValidationErrors = Object.keys(slotErrors).length > 0;
    const isResolving = false; // TODO: 从store中获取实际状态

    return {
      hasValidationErrors,
      isResolving,
      slotCount: slots.length,
      requiredSlotCount: slots.filter(s => s.required).length,
      completedSlotCount: slots.filter(s => slotValues[s.id] !== undefined).length
    };
  }, [slots, slotValues, slotErrors]);

  // 自动验证Slot值变化
  useEffect(() => {
    Object.keys(slotValues).forEach(slotId => {
      const error = validateSlot(slotId);
      if (error) {
        setSlotError(slotId, error);
      } else {
        setSlotError(slotId, null);
      }
    });
  }, [slotValues, validateSlot, setSlotError]);

  return {
    // 状态
    slots,
    slotValues,
    slotErrors,
    injectionStrategy,
    isResolving: derivedState.isResolving,

    // CRUD操作
    addSlot,
    updateSlot,
    removeSlot,
    duplicateSlot,
    reorderSlots,

    // 值管理
    updateSlotValue,
    clearSlotValue,
    batchUpdateSlotValues,
    resetSlotValues,

    // 验证
    validateSlots,
    validateSlot,
    hasValidationErrors: derivedState.hasValidationErrors,

    // 依赖关系
    getSlotDependencies,
    getDependentSlots,
    validateDependencies,

    // 解析
    resolveSlotValue,
    resolveAllSlots,

    // 分析
    getSlotStats,

    // 工具方法
    exportSlotConfig,
    importSlotConfig,
    getSlotSuggestions
  };
};

/**
 * Slot类型配置Hook
 */
export const useSlotTypeConfig = () => {
  const slotTypeConfig = useMemo(() => ({
    user: {
      name: '用户输入',
      description: '由用户手动输入的值',
      icon: 'User',
      color: 'blue',
      defaultRequired: true
    },
    system: {
      name: '系统变量',
      description: '由系统自动提供的值',
      icon: 'Settings',
      color: 'gray',
      defaultRequired: false
    },
    api: {
      name: 'API数据',
      description: '从外部API获取的数据',
      icon: 'Globe',
      color: 'purple',
      defaultRequired: true
    },
    computed: {
      name: '计算值',
      description: '基于其他Slot计算得出的值',
      icon: 'Calculator',
      color: 'green',
      defaultRequired: false
    },
    conditional: {
      name: '条件值',
      description: '根据条件选择的值',
      icon: 'GitBranch',
      color: 'orange',
      defaultRequired: false
    }
  }), []);

  const getTypeConfig = useCallback((type: SlotDefinition['type']) => {
    return slotTypeConfig[type];
  }, [slotTypeConfig]);

  const getTypeOptions = useCallback(() => {
    return Object.entries(slotTypeConfig).map(([value, config]) => ({
      value,
      label: config.name,
      description: config.description,
      icon: config.icon,
      color: config.color
    }));
  }, [slotTypeConfig]);

  return {
    slotTypeConfig,
    getTypeConfig,
    getTypeOptions
  };
};