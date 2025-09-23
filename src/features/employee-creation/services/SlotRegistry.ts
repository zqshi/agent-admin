/**
 * Slot注册表服务
 * 负责管理slot的运行时注册、缓存、依赖关系等
 */

import type {
  EnhancedSlotDefinition,
  SlotRegistryState,
  SlotRegistrationRecord,
  SlotChangeLogEntry
} from '../types';

export class SlotRegistry {
  private state: SlotRegistryState;
  private listeners: Set<(state: SlotRegistryState) => void> = new Set();

  constructor() {
    this.state = {
      runtimeSlots: new Map(),
      sessionSlots: new Map(),
      persistentSlots: new Map(),
      dependencyGraph: new Map(),
      registrationHistory: [],
      cache: new Map()
    };
  }

  // ============ 核心注册方法 ============

  /**
   * 注册slot到指定存储层
   */
  async registerSlot(
    slot: EnhancedSlotDefinition,
    layer: 'runtime' | 'session' | 'persistent' = 'runtime'
  ): Promise<boolean> {
    try {
      // 验证slot定义
      if (!this.validateSlotDefinition(slot)) {
        throw new Error(`Invalid slot definition: ${slot.id}`);
      }

      // 检查依赖关系
      if (!this.validateDependencies(slot)) {
        throw new Error(`Unresolved dependencies for slot: ${slot.id}`);
      }

      // 更新slot时间戳
      const enhancedSlot: EnhancedSlotDefinition = {
        ...slot,
        updatedAt: new Date().toISOString(),
        audit: {
          ...slot.audit,
          lastModifiedBy: 'system',
          changeLog: [
            ...(slot.audit?.changeLog || []),
            this.createChangeLogEntry('register', 'slot registered', slot.id)
          ]
        }
      };

      // 注册到相应的存储层
      const targetMap = this.getStorageMap(layer);
      targetMap.set(slot.id, enhancedSlot);

      // 更新依赖图
      this.updateDependencyGraph(slot);

      // 记录注册历史
      this.addRegistrationRecord({
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slotId: slot.id,
        action: 'register',
        timestamp: new Date().toISOString(),
        source: layer,
        success: true
      });

      // 通知监听者
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Failed to register slot:', error);

      // 记录失败的注册
      this.addRegistrationRecord({
        id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slotId: slot.id,
        action: 'register',
        timestamp: new Date().toISOString(),
        source: layer,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });

      return false;
    }
  }

  /**
   * 取消注册slot
   */
  async unregisterSlot(slotId: string): Promise<boolean> {
    try {
      let found = false;

      // 从所有存储层中移除
      for (const [layer, map] of [
        ['runtime', this.state.runtimeSlots],
        ['session', this.state.sessionSlots],
        ['persistent', this.state.persistentSlots]
      ] as const) {
        if (map.has(slotId)) {
          map.delete(slotId);
          found = true;
        }
      }

      if (!found) {
        throw new Error(`Slot not found: ${slotId}`);
      }

      // 更新依赖图
      this.removeDependencies(slotId);

      // 清除相关缓存
      this.clearSlotCache(slotId);

      // 记录取消注册历史
      this.addRegistrationRecord({
        id: `unreg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        slotId,
        action: 'unregister',
        timestamp: new Date().toISOString(),
        source: 'system',
        success: true
      });

      // 通知监听者
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Failed to unregister slot:', error);
      return false;
    }
  }

  /**
   * 更新slot定义
   */
  async updateSlot(slotId: string, updates: Partial<EnhancedSlotDefinition>): Promise<boolean> {
    try {
      const slot = this.getSlot(slotId);
      if (!slot) {
        throw new Error(`Slot not found: ${slotId}`);
      }

      // 创建更新后的slot
      const updatedSlot: EnhancedSlotDefinition = {
        ...slot,
        ...updates,
        updatedAt: new Date().toISOString(),
        audit: {
          ...slot.audit,
          lastModifiedBy: 'system',
          changeLog: [
            ...(slot.audit?.changeLog || []),
            this.createChangeLogEntry('update', 'slot updated', slotId, slot, updates)
          ]
        }
      };

      // 验证更新后的slot
      if (!this.validateSlotDefinition(updatedSlot)) {
        throw new Error(`Invalid updated slot definition: ${slotId}`);
      }

      // 更新存储
      const layer = this.findSlotLayer(slotId);
      if (layer) {
        const targetMap = this.getStorageMap(layer);
        targetMap.set(slotId, updatedSlot);

        // 更新依赖图
        this.updateDependencyGraph(updatedSlot);

        // 清除相关缓存
        this.clearSlotCache(slotId);

        // 记录更新历史
        this.addRegistrationRecord({
          id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          slotId,
          action: 'update',
          timestamp: new Date().toISOString(),
          source: layer,
          success: true
        });

        // 通知监听者
        this.notifyListeners();

        return true;
      }

      throw new Error(`Could not determine storage layer for slot: ${slotId}`);
    } catch (error) {
      console.error('Failed to update slot:', error);
      return false;
    }
  }

  // ============ 查询方法 ============

  /**
   * 获取slot定义
   */
  getSlot(slotId: string): EnhancedSlotDefinition | null {
    // 按优先级查找：persistent -> session -> runtime
    return (
      this.state.persistentSlots.get(slotId) ||
      this.state.sessionSlots.get(slotId) ||
      this.state.runtimeSlots.get(slotId) ||
      null
    );
  }

  /**
   * 按角色获取slots
   */
  getSlotsByRole(role: string): EnhancedSlotDefinition[] {
    const result: EnhancedSlotDefinition[] = [];

    for (const map of [this.state.persistentSlots, this.state.sessionSlots, this.state.runtimeSlots]) {
      for (const slot of map.values()) {
        if (slot.role === role) {
          result.push(slot);
        }
      }
    }

    return result;
  }

  /**
   * 按来源获取slots
   */
  getSlotsByOrigin(origin: string): EnhancedSlotDefinition[] {
    const result: EnhancedSlotDefinition[] = [];

    for (const map of [this.state.persistentSlots, this.state.sessionSlots, this.state.runtimeSlots]) {
      for (const slot of map.values()) {
        if (slot.origin === origin) {
          result.push(slot);
        }
      }
    }

    return result;
  }

  /**
   * 获取所有已注册的slots
   */
  getAllSlots(): EnhancedSlotDefinition[] {
    const result: EnhancedSlotDefinition[] = [];
    const seen = new Set<string>();

    // 按优先级合并：persistent -> session -> runtime
    for (const map of [this.state.persistentSlots, this.state.sessionSlots, this.state.runtimeSlots]) {
      for (const [id, slot] of map) {
        if (!seen.has(id)) {
          result.push(slot);
          seen.add(id);
        }
      }
    }

    return result;
  }

  // ============ 依赖关系管理 ============

  /**
   * 获取slot的依赖项
   */
  getSlotDependencies(slotId: string): string[] {
    return this.state.dependencyGraph.get(slotId) || [];
  }

  /**
   * 验证slot依赖关系
   */
  validateSlotDependencies(slotId: string): boolean {
    const dependencies = this.getSlotDependencies(slotId);

    for (const depId of dependencies) {
      if (!this.getSlot(depId)) {
        return false;
      }
    }

    return true;
  }

  /**
   * 检查循环依赖
   */
  hasCyclicDependency(slotId: string, visited = new Set<string>()): boolean {
    if (visited.has(slotId)) {
      return true;
    }

    visited.add(slotId);
    const dependencies = this.getSlotDependencies(slotId);

    for (const depId of dependencies) {
      if (this.hasCyclicDependency(depId, new Set(visited))) {
        return true;
      }
    }

    return false;
  }

  // ============ 缓存管理 ============

  /**
   * 获取缓存的slot值
   */
  getCachedSlotValue(slotId: string): any {
    const cached = this.state.cache.get(slotId);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() > cached.expiry) {
      this.state.cache.delete(slotId);
      return null;
    }

    // 增加命中次数
    cached.hits++;

    return cached.value;
  }

  /**
   * 设置缓存的slot值
   */
  setCachedSlotValue(slotId: string, value: any, ttl: number = 3600): void {
    this.state.cache.set(slotId, {
      value,
      expiry: Date.now() + ttl * 1000,
      hits: 0
    });
  }

  /**
   * 清除slot缓存
   */
  clearSlotCache(slotId?: string): void {
    if (slotId) {
      this.state.cache.delete(slotId);
    } else {
      this.state.cache.clear();
    }
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): Record<string, { hits: number; expiry: number }> {
    const stats: Record<string, { hits: number; expiry: number }> = {};

    for (const [slotId, cached] of this.state.cache) {
      stats[slotId] = {
        hits: cached.hits,
        expiry: cached.expiry
      };
    }

    return stats;
  }

  // ============ 临时slot管理 ============

  /**
   * 清除临时(ephemeral)slots
   */
  clearEphemeralSlots(): void {
    for (const map of [this.state.runtimeSlots, this.state.sessionSlots]) {
      for (const [id, slot] of map) {
        if (slot.ephemeral) {
          map.delete(id);
        }
      }
    }

    this.notifyListeners();
  }

  /**
   * 清除会话级slots
   */
  clearSessionSlots(): void {
    this.state.sessionSlots.clear();
    this.notifyListeners();
  }

  // ============ 状态管理 ============

  /**
   * 获取当前状态
   */
  getState(): SlotRegistryState {
    return { ...this.state };
  }

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: SlotRegistryState) => void): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  // ============ 私有辅助方法 ============

  private validateSlotDefinition(slot: EnhancedSlotDefinition): boolean {
    return !!(
      slot.id &&
      slot.name &&
      slot.role &&
      slot.type &&
      slot.errorHandling
    );
  }

  private validateDependencies(slot: EnhancedSlotDefinition): boolean {
    if (!slot.dependencies) return true;

    for (const depId of slot.dependencies) {
      if (!this.getSlot(depId)) {
        return false;
      }
    }

    return true;
  }

  private getStorageMap(layer: 'runtime' | 'session' | 'persistent'): Map<string, EnhancedSlotDefinition> {
    switch (layer) {
      case 'runtime': return this.state.runtimeSlots;
      case 'session': return this.state.sessionSlots;
      case 'persistent': return this.state.persistentSlots;
    }
  }

  private findSlotLayer(slotId: string): 'runtime' | 'session' | 'persistent' | null {
    if (this.state.persistentSlots.has(slotId)) return 'persistent';
    if (this.state.sessionSlots.has(slotId)) return 'session';
    if (this.state.runtimeSlots.has(slotId)) return 'runtime';
    return null;
  }

  private updateDependencyGraph(slot: EnhancedSlotDefinition): void {
    if (slot.dependencies) {
      this.state.dependencyGraph.set(slot.id, [...slot.dependencies]);
    }
  }

  private removeDependencies(slotId: string): void {
    this.state.dependencyGraph.delete(slotId);

    // 移除其他slot对此slot的依赖
    for (const [id, deps] of this.state.dependencyGraph) {
      const newDeps = deps.filter(depId => depId !== slotId);
      if (newDeps.length !== deps.length) {
        this.state.dependencyGraph.set(id, newDeps);
      }
    }
  }

  private addRegistrationRecord(record: SlotRegistrationRecord): void {
    this.state.registrationHistory.push(record);

    // 保持历史记录数量在合理范围内
    if (this.state.registrationHistory.length > 1000) {
      this.state.registrationHistory = this.state.registrationHistory.slice(-500);
    }
  }

  private createChangeLogEntry(
    action: SlotChangeLogEntry['action'],
    reason: string,
    slotId: string,
    oldValue?: any,
    newValue?: any
  ): SlotChangeLogEntry {
    return {
      id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action,
      operator: 'system',
      reason,
      oldValue,
      newValue
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in slot registry listener:', error);
      }
    }
  }
}

// 单例实例
export const slotRegistry = new SlotRegistry();