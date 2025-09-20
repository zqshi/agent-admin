/**
 * 预设管理服务
 * 负责策略预设的创建、管理、导入导出和分享
 */

import type {
  ConfigPreset,
  CompressionStrategy,
  InjectionStrategy,
  ConfigState
} from '../types';

export class PresetManager {
  private storage: Storage;
  private keyPrefix: string;

  constructor(storage: Storage = localStorage, keyPrefix: string = 'prompt-engineering-presets') {
    this.storage = storage;
    this.keyPrefix = keyPrefix;
  }

  /**
   * 创建预设
   */
  createPreset(
    name: string,
    description: string,
    category: string,
    config: Partial<ConfigState>,
    type: 'compression' | 'injection' | 'slot' | 'complete' = 'complete'
  ): ConfigPreset {
    const preset: ConfigPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      type,
      config,
      category,
      isBuiltIn: false,
      usage: {
        count: 0,
        rating: 0
      }
    };

    this.savePreset(preset);
    return preset;
  }

  /**
   * 保存预设
   */
  savePreset(preset: ConfigPreset): void {
    const key = `${this.keyPrefix}-${preset.id}`;
    this.storage.setItem(key, JSON.stringify(preset));
  }

  /**
   * 获取所有预设
   */
  getAllPresets(): ConfigPreset[] {
    const presets: ConfigPreset[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        try {
          const preset = JSON.parse(this.storage.getItem(key) || '');
          presets.push(preset);
        } catch (error) {
          console.warn(`Failed to parse preset from key ${key}:`, error);
        }
      }
    }

    return presets.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * 获取特定类型的预设
   */
  getPresetsByType(type: 'compression' | 'injection' | 'slot' | 'complete'): ConfigPreset[] {
    return this.getAllPresets().filter(preset => preset.type === type);
  }

  /**
   * 根据ID获取预设
   */
  getPresetById(id: string): ConfigPreset | null {
    const key = `${this.keyPrefix}-${id}`;
    const data = this.storage.getItem(key);

    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`Failed to parse preset ${id}:`, error);
      return null;
    }
  }

  /**
   * 更新预设
   */
  updatePreset(id: string, updates: Partial<ConfigPreset>): boolean {
    const preset = this.getPresetById(id);
    if (!preset) return false;

    const updatedPreset = { ...preset, ...updates };
    this.savePreset(updatedPreset);
    return true;
  }

  /**
   * 删除预设
   */
  deletePreset(id: string): boolean {
    const key = `${this.keyPrefix}-${id}`;
    if (this.storage.getItem(key)) {
      this.storage.removeItem(key);
      return true;
    }
    return false;
  }

  /**
   * 复制预设
   */
  duplicatePreset(id: string, newName?: string): ConfigPreset | null {
    const original = this.getPresetById(id);
    if (!original) return null;

    const duplicate = {
      ...original,
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${original.name} (副本)`,
      usage: {
        count: 0,
        rating: 0
      }
    };

    this.savePreset(duplicate);
    return duplicate;
  }

  /**
   * 导出预设
   */
  exportPreset(id: string): string | null {
    const preset = this.getPresetById(id);
    if (!preset) return null;

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      preset: {
        ...preset,
        usage: undefined // 不导出使用统计
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导出多个预设
   */
  exportPresets(ids: string[]): string {
    const presets = ids.map(id => this.getPresetById(id)).filter(Boolean) as ConfigPreset[];

    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      presets: presets.map(preset => ({
        ...preset,
        usage: undefined // 不导出使用统计
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 导入预设
   */
  importPreset(data: string): ConfigPreset[] {
    try {
      const importData = JSON.parse(data);
      const imported: ConfigPreset[] = [];

      if (importData.preset) {
        // 单个预设导入
        const preset = this.validateAndNormalizePreset(importData.preset);
        if (preset) {
          this.savePreset(preset);
          imported.push(preset);
        }
      } else if (importData.presets && Array.isArray(importData.presets)) {
        // 多个预设导入
        importData.presets.forEach((presetData: any) => {
          const preset = this.validateAndNormalizePreset(presetData);
          if (preset) {
            this.savePreset(preset);
            imported.push(preset);
          }
        });
      }

      return imported;
    } catch (error) {
      console.error('Failed to import presets:', error);
      throw new Error('导入文件格式错误');
    }
  }

  /**
   * 验证和标准化预设数据
   */
  private validateAndNormalizePreset(data: any): ConfigPreset | null {
    if (!data || typeof data !== 'object') return null;

    // 必需字段检查
    if (!data.name || !data.type || !data.config) return null;

    // 生成新的ID以避免冲突
    const normalizedPreset: ConfigPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      description: data.description || '',
      type: data.type,
      config: data.config,
      category: data.category || '导入的预设',
      isBuiltIn: false, // 导入的预设都标记为非内置
      usage: {
        count: 0,
        rating: 0
      }
    };

    return normalizedPreset;
  }

  /**
   * 搜索预设
   */
  searchPresets(query: string, type?: string): ConfigPreset[] {
    const allPresets = this.getAllPresets();
    const lowerQuery = query.toLowerCase();

    return allPresets.filter(preset => {
      const matchesQuery =
        preset.name.toLowerCase().includes(lowerQuery) ||
        preset.description.toLowerCase().includes(lowerQuery) ||
        preset.category.toLowerCase().includes(lowerQuery);

      const matchesType = !type || preset.type === type;

      return matchesQuery && matchesType;
    });
  }

  /**
   * 获取预设统计信息
   */
  getPresetStats(): {
    total: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
    builtIn: number;
    userCreated: number;
  } {
    const presets = this.getAllPresets();

    const stats = {
      total: presets.length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      builtIn: 0,
      userCreated: 0
    };

    presets.forEach(preset => {
      // 按类型统计
      stats.byType[preset.type] = (stats.byType[preset.type] || 0) + 1;

      // 按分类统计
      stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;

      // 按来源统计
      if (preset.isBuiltIn) {
        stats.builtIn++;
      } else {
        stats.userCreated++;
      }
    });

    return stats;
  }

  /**
   * 更新预设使用统计
   */
  incrementUsage(id: string): void {
    const preset = this.getPresetById(id);
    if (preset) {
      preset.usage.count++;
      this.savePreset(preset);
    }
  }

  /**
   * 设置预设评分
   */
  ratePreset(id: string, rating: number): boolean {
    if (rating < 0 || rating > 5) return false;

    const preset = this.getPresetById(id);
    if (preset) {
      // 简单的评分更新（实际应用中可能需要更复杂的算法）
      preset.usage.rating = rating;
      this.savePreset(preset);
      return true;
    }

    return false;
  }

  /**
   * 清理所有预设
   */
  clearAllPresets(): void {
    const keys: string[] = [];

    for (let i = 0; i < this.storage.length; i++) {
      const key = this.storage.key(i);
      if (key && key.startsWith(this.keyPrefix)) {
        keys.push(key);
      }
    }

    keys.forEach(key => this.storage.removeItem(key));
  }

  /**
   * 从压缩策略创建预设
   */
  createCompressionPreset(
    strategy: CompressionStrategy,
    name?: string,
    description?: string
  ): ConfigPreset {
    return this.createPreset(
      name || strategy.name,
      description || `基于${strategy.algorithm}算法的压缩策略`,
      strategy.algorithm === 'semantic' ? '语义压缩' :
      strategy.algorithm === 'syntactic' ? '语法压缩' : '混合压缩',
      { compressionStrategy: strategy },
      'compression'
    );
  }

  /**
   * 从注入策略创建预设
   */
  createInjectionPreset(
    strategy: InjectionStrategy,
    name?: string,
    description?: string
  ): ConfigPreset {
    return this.createPreset(
      name || strategy.name,
      description || `${strategy.timing}注入策略`,
      strategy.timing === 'immediate' ? '立即注入' :
      strategy.timing === 'lazy' ? '延迟注入' : '缓存注入',
      { injectionStrategy: strategy },
      'injection'
    );
  }
}

// 默认导出单例
export const presetManager = new PresetManager();