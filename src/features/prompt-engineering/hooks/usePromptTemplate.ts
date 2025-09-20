/**
 * Prompt模板管理Hook
 * 提供模板相关的操作和状态管理
 */

import { useCallback, useEffect, useMemo } from 'react';
import { usePromptEngineeringStore } from '../stores/promptEngineeringStore';
import type { PromptTemplate } from '../types';

export interface UsePromptTemplateReturn {
  // 状态
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;
  templateCategories: string[];
  isLoading: boolean;
  error: string | null;

  // 操作
  loadTemplates: () => Promise<void>;
  selectTemplate: (template: PromptTemplate | null) => void;
  favoriteTemplate: (templateId: string) => Promise<void>;
  forkTemplate: (templateId: string, newName: string) => Promise<PromptTemplate>;

  // 筛选和搜索
  filterTemplatesByCategory: (category: string) => PromptTemplate[];
  searchTemplates: (query: string) => PromptTemplate[];
  getTemplatesByUsage: () => PromptTemplate[];
  getFeaturedTemplates: () => PromptTemplate[];

  // 模板分析
  getTemplateStats: (templateId: string) => {
    slotCount: number;
    avgRating: number;
    usageCount: number;
    complexity: 'low' | 'medium' | 'high';
  } | null;

  // 模板验证
  validateTemplate: (template: PromptTemplate) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };
}

export const usePromptTemplate = (): UsePromptTemplateReturn => {
  const store = usePromptEngineeringStore();

  // 从store中提取状态
  const {
    templates,
    selectedTemplate,
    templateCategories,
    loading,
    errors,
    loadTemplates: storeLoadTemplates,
    selectTemplate: storeSelectTemplate,
    favoriteTemplate: storeFavoriteTemplate,
    forkTemplate: storeForkTemplate
  } = store;

  // 加载模板
  const loadTemplates = useCallback(async () => {
    try {
      await storeLoadTemplates();
    } catch (error) {
      console.error('加载模板失败:', error);
    }
  }, [storeLoadTemplates]);

  // 选择模板
  const selectTemplate = useCallback((template: PromptTemplate | null) => {
    storeSelectTemplate(template);
  }, [storeSelectTemplate]);

  // 收藏模板
  const favoriteTemplate = useCallback(async (templateId: string) => {
    try {
      await storeFavoriteTemplate(templateId);
    } catch (error) {
      console.error('收藏模板失败:', error);
      throw error;
    }
  }, [storeFavoriteTemplate]);

  // 分叉模板
  const forkTemplate = useCallback(async (templateId: string, newName: string) => {
    try {
      return await storeForkTemplate(templateId, newName);
    } catch (error) {
      console.error('分叉模板失败:', error);
      throw error;
    }
  }, [storeForkTemplate]);

  // 按分类筛选模板
  const filterTemplatesByCategory = useCallback((category: string) => {
    if (category === 'all') return templates;
    return templates.filter(template => template.category === category);
  }, [templates]);

  // 搜索模板
  const searchTemplates = useCallback((query: string) => {
    if (!query.trim()) return templates;

    const lowerQuery = query.toLowerCase();
    return templates.filter(template =>
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }, [templates]);

  // 按使用量排序模板
  const getTemplatesByUsage = useCallback(() => {
    return [...templates].sort((a, b) => b.usage.count - a.usage.count);
  }, [templates]);

  // 获取推荐模板
  const getFeaturedTemplates = useCallback(() => {
    return templates.filter(template =>
      template.usage.rating >= 4.0 &&
      template.usage.count >= 10
    ).slice(0, 6);
  }, [templates]);

  // 获取模板统计信息
  const getTemplateStats = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return null;

    // 计算复杂度
    let complexity: 'low' | 'medium' | 'high' = 'low';
    const slotCount = template.slots.length;
    const hasComplexSlots = template.slots.some(slot =>
      slot.type === 'api' ||
      slot.type === 'computed' ||
      slot.dependencies && slot.dependencies.length > 0
    );

    if (slotCount > 10 || hasComplexSlots) {
      complexity = 'high';
    } else if (slotCount > 5) {
      complexity = 'medium';
    }

    return {
      slotCount: template.slots.length,
      avgRating: template.usage.rating,
      usageCount: template.usage.count,
      complexity
    };
  }, [templates]);

  // 验证模板
  const validateTemplate = useCallback((template: PromptTemplate) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 基础验证
    if (!template.name?.trim()) {
      errors.push('模板名称不能为空');
    }

    if (!template.basePrompt?.trim()) {
      errors.push('模板内容不能为空');
    }

    if (!template.category?.trim()) {
      errors.push('模板分类不能为空');
    }

    // Slot验证
    if (template.slots?.length === 0) {
      warnings.push('模板没有定义任何Slot');
    }

    // 检查Slot配置
    template.slots?.forEach((slot, index) => {
      if (!slot.name?.trim()) {
        errors.push(`Slot ${index + 1} 缺少名称`);
      }

      if (!slot.id?.trim()) {
        errors.push(`Slot ${index + 1} 缺少ID`);
      }

      // 检查必填Slot是否有默认值
      if (slot.required && slot.defaultValue === undefined) {
        warnings.push(`必填Slot "${slot.name}" 没有默认值`);
      }

      // 检查API类型Slot的配置
      if (slot.type === 'api' && !slot.dataSource) {
        errors.push(`API类型Slot "${slot.name}" 缺少数据源配置`);
      }

      // 检查依赖关系
      if (slot.dependencies) {
        slot.dependencies.forEach(depId => {
          const dependsOn = template.slots?.find(s => s.id === depId);
          if (!dependsOn) {
            errors.push(`Slot "${slot.name}" 依赖的Slot "${depId}" 不存在`);
          }
        });
      }
    });

    // 检查模板中的占位符
    const placeholders = template.basePrompt?.match(/{{([^}]+)}}/g) || [];
    placeholders.forEach(placeholder => {
      const slotId = placeholder.slice(2, -2);
      const slot = template.slots?.find(s => s.id === slotId);
      if (!slot) {
        warnings.push(`模板中的占位符 "${placeholder}" 没有对应的Slot定义`);
      }
    });

    // 检查未使用的Slot
    template.slots?.forEach(slot => {
      const placeholder = `{{${slot.id}}}`;
      if (!template.basePrompt?.includes(placeholder)) {
        warnings.push(`Slot "${slot.name}" 在模板中未被使用`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, []);

  // 组件挂载时自动加载模板
  useEffect(() => {
    if (templates.length === 0 && !loading.templates) {
      loadTemplates();
    }
  }, [templates.length, loading.templates, loadTemplates]);

  // 计算衍生状态
  const derivedState = useMemo(() => ({
    hasTemplates: templates.length > 0,
    hasSelectedTemplate: selectedTemplate !== null,
    selectedTemplateStats: selectedTemplate ? getTemplateStats(selectedTemplate.id) : null,
    categoriesWithCounts: templateCategories.map(category => ({
      name: category,
      count: templates.filter(t => t.category === category).length
    }))
  }), [templates, selectedTemplate, templateCategories, getTemplateStats]);

  return {
    // 基础状态
    templates,
    selectedTemplate,
    templateCategories,
    isLoading: loading.templates,
    error: errors.general,

    // 操作方法
    loadTemplates,
    selectTemplate,
    favoriteTemplate,
    forkTemplate,

    // 筛选和搜索
    filterTemplatesByCategory,
    searchTemplates,
    getTemplatesByUsage,
    getFeaturedTemplates,

    // 分析方法
    getTemplateStats,
    validateTemplate,

    // 衍生状态（通过扩展返回类型可以添加）
    ...derivedState
  } as UsePromptTemplateReturn;
};

/**
 * 模板缓存Hook - 用于优化模板加载性能
 */
export const useTemplateCache = () => {
  const templateCache = useMemo(() => new Map<string, PromptTemplate>(), []);

  const cacheTemplate = useCallback((template: PromptTemplate) => {
    templateCache.set(template.id, template);
  }, [templateCache]);

  const getCachedTemplate = useCallback((templateId: string) => {
    return templateCache.get(templateId) || null;
  }, [templateCache]);

  const clearCache = useCallback(() => {
    templateCache.clear();
  }, [templateCache]);

  return {
    cacheTemplate,
    getCachedTemplate,
    clearCache,
    cacheSize: templateCache.size
  };
};

/**
 * 模板比较Hook - 用于比较不同版本的模板
 */
export const useTemplateComparison = () => {
  const compareTemplates = useCallback((templateA: PromptTemplate, templateB: PromptTemplate) => {
    const differences = {
      name: templateA.name !== templateB.name,
      basePrompt: templateA.basePrompt !== templateB.basePrompt,
      category: templateA.category !== templateB.category,
      slots: {
        added: templateB.slots.filter(slotB =>
          !templateA.slots.find(slotA => slotA.id === slotB.id)
        ),
        removed: templateA.slots.filter(slotA =>
          !templateB.slots.find(slotB => slotB.id === slotA.id)
        ),
        modified: templateB.slots.filter(slotB => {
          const slotA = templateA.slots.find(s => s.id === slotB.id);
          return slotA && JSON.stringify(slotA) !== JSON.stringify(slotB);
        })
      },
      metadata: {
        tags: JSON.stringify(templateA.metadata.tags) !== JSON.stringify(templateB.metadata.tags),
        version: templateA.metadata.version !== templateB.metadata.version
      }
    };

    const hasChanges = differences.name ||
                      differences.basePrompt ||
                      differences.category ||
                      differences.slots.added.length > 0 ||
                      differences.slots.removed.length > 0 ||
                      differences.slots.modified.length > 0 ||
                      differences.metadata.tags ||
                      differences.metadata.version;

    return {
      hasChanges,
      differences
    };
  }, []);

  return {
    compareTemplates
  };
};