/**
 * useSlotRegistry Hook
 * 提供对SlotRegistry服务的响应式访问
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  EnhancedSlotDefinition,
  SlotRegistryState,
  SlotRegistrationRecord,
  ScenarioDetectionResult,
  SlotInjectionConfig,
  SlotInjectionResult,
  DynamicInjectionContext
} from '../types';
import { slotRegistry } from '../services/SlotRegistry';
import { slotInjector } from '../services/SlotInjector';

// Hook配置选项
interface UseSlotRegistryOptions {
  autoLoad?: boolean;
  enableScenarioDetection?: boolean;
  enableCaching?: boolean;
}

// Hook返回的状态
interface SlotRegistryHookState {
  // 注册表状态
  registryState: SlotRegistryState;
  isLoading: boolean;
  error: string | null;

  // Slot数据
  allSlots: EnhancedSlotDefinition[];
  runtimeSlots: EnhancedSlotDefinition[];
  sessionSlots: EnhancedSlotDefinition[];
  persistentSlots: EnhancedSlotDefinition[];

  // 统计信息
  stats: {
    totalSlots: number;
    runtimeCount: number;
    sessionCount: number;
    persistentCount: number;
    ephemeralCount: number;
    immutableCount: number;
  };

  // 缓存信息
  cacheStats: Record<string, { hits: number; expiry: number }>;

  // 注册历史
  registrationHistory: SlotRegistrationRecord[];

  // 业务场景
  currentScenario: ScenarioDetectionResult | null;
  scenarios: ScenarioDetectionResult[];

  // 注入状态
  activeInjections: SlotInjectionResult[];
  injectionHistory: SlotInjectionResult[];
}

// Hook返回的操作方法
interface SlotRegistryHookActions {
  // Slot注册管理
  registerSlot: (slot: EnhancedSlotDefinition, layer?: 'runtime' | 'session' | 'persistent') => Promise<boolean>;
  unregisterSlot: (slotId: string) => Promise<boolean>;
  updateSlot: (slotId: string, updates: Partial<EnhancedSlotDefinition>) => Promise<boolean>;

  // Slot查询
  getSlot: (slotId: string) => EnhancedSlotDefinition | null;
  getSlotsByRole: (role: string) => EnhancedSlotDefinition[];
  getSlotsByOrigin: (origin: string) => EnhancedSlotDefinition[];
  searchSlots: (query: string) => EnhancedSlotDefinition[];
  filterSlots: (predicate: (slot: EnhancedSlotDefinition) => boolean) => EnhancedSlotDefinition[];

  // 依赖关系管理
  getSlotDependencies: (slotId: string) => string[];
  validateSlotDependencies: (slotId: string) => boolean;
  checkCyclicDependency: (slotId: string) => boolean;

  // 缓存管理
  getCachedSlotValue: (slotId: string) => any;
  setCachedSlotValue: (slotId: string, value: any, ttl?: number) => void;
  clearSlotCache: (slotId?: string) => void;
  refreshCacheStats: () => void;

  // 生命周期管理
  clearEphemeralSlots: () => void;
  clearSessionSlots: () => void;
  refreshRegistry: () => void;

  // 业务场景检测
  detectScenario: (userInput: string, context?: DynamicInjectionContext) => Promise<ScenarioDetectionResult | null>;
  applyScenario: (scenario: ScenarioDetectionResult, context: DynamicInjectionContext) => Promise<SlotInjectionResult[]>;
  clearScenarios: () => void;

  // Slot注入
  injectSlot: (slotId: string, context: DynamicInjectionContext) => Promise<SlotInjectionResult>;
  batchInjectSlots: (slotIds: string[], context: DynamicInjectionContext) => Promise<SlotInjectionResult[]>;
  createInjectionConfig: (config: SlotInjectionConfig) => void;
  updateInjectionConfig: (slotId: string, updates: Partial<SlotInjectionConfig>) => void;
  deleteInjectionConfig: (slotId: string) => void;

  // 错误处理
  clearError: () => void;
  retry: () => void;
}

export type UseSlotRegistryReturn = SlotRegistryHookState & SlotRegistryHookActions;

/**
 * useSlotRegistry Hook主函数
 */
export function useSlotRegistry(options: UseSlotRegistryOptions = {}): UseSlotRegistryReturn {
  const {
    autoLoad = true,
    enableScenarioDetection = true,
    enableCaching = true
  } = options;

  // 状态定义
  const [registryState, setRegistryState] = useState<SlotRegistryState>(slotRegistry.getState());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentScenario, setCurrentScenario] = useState<ScenarioDetectionResult | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioDetectionResult[]>([]);
  const [activeInjections, setActiveInjections] = useState<SlotInjectionResult[]>([]);
  const [injectionHistory, setInjectionHistory] = useState<SlotInjectionResult[]>([]);
  const [cacheStats, setCacheStats] = useState<Record<string, { hits: number; expiry: number }>>({});

  // 计算派生状态
  const allSlots = Array.from(registryState.persistentSlots.values())
    .concat(Array.from(registryState.sessionSlots.values()))
    .concat(Array.from(registryState.runtimeSlots.values()));

  const runtimeSlots = Array.from(registryState.runtimeSlots.values());
  const sessionSlots = Array.from(registryState.sessionSlots.values());
  const persistentSlots = Array.from(registryState.persistentSlots.values());

  const stats = {
    totalSlots: allSlots.length,
    runtimeCount: runtimeSlots.length,
    sessionCount: sessionSlots.length,
    persistentCount: persistentSlots.length,
    ephemeralCount: allSlots.filter(slot => slot.ephemeral).length,
    immutableCount: allSlots.filter(slot => slot.immutable).length
  };

  // 订阅注册表状态变化
  useEffect(() => {
    const unsubscribe = slotRegistry.subscribe((newState) => {
      setRegistryState(newState);
    });

    return unsubscribe;
  }, []);

  // 自动加载
  useEffect(() => {
    if (autoLoad) {
      refreshRegistry();
    }
  }, [autoLoad]);

  // 定期刷新缓存统计
  useEffect(() => {
    if (enableCaching) {
      const interval = setInterval(() => {
        refreshCacheStats();
      }, 5000); // 每5秒刷新一次

      return () => clearInterval(interval);
    }
  }, [enableCaching]);

  // ============ Slot注册管理方法 ============

  const registerSlot = useCallback(async (
    slot: EnhancedSlotDefinition,
    layer: 'runtime' | 'session' | 'persistent' = 'runtime'
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await slotRegistry.registerSlot(slot, layer);
      if (!success) {
        throw new Error(`Failed to register slot: ${slot.id}`);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unregisterSlot = useCallback(async (slotId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await slotRegistry.unregisterSlot(slotId);
      if (!success) {
        throw new Error(`Failed to unregister slot: ${slotId}`);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSlot = useCallback(async (
    slotId: string,
    updates: Partial<EnhancedSlotDefinition>
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await slotRegistry.updateSlot(slotId, updates);
      if (!success) {
        throw new Error(`Failed to update slot: ${slotId}`);
      }
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============ Slot查询方法 ============

  const getSlot = useCallback((slotId: string): EnhancedSlotDefinition | null => {
    return slotRegistry.getSlot(slotId);
  }, []);

  const getSlotsByRole = useCallback((role: string): EnhancedSlotDefinition[] => {
    return slotRegistry.getSlotsByRole(role);
  }, []);

  const getSlotsByOrigin = useCallback((origin: string): EnhancedSlotDefinition[] => {
    return slotRegistry.getSlotsByOrigin(origin);
  }, []);

  const searchSlots = useCallback((query: string): EnhancedSlotDefinition[] => {
    const lowercaseQuery = query.toLowerCase();
    return allSlots.filter(slot =>
      slot.name.toLowerCase().includes(lowercaseQuery) ||
      slot.description?.toLowerCase().includes(lowercaseQuery) ||
      slot.id.toLowerCase().includes(lowercaseQuery)
    );
  }, [allSlots]);

  const filterSlots = useCallback((
    predicate: (slot: EnhancedSlotDefinition) => boolean
  ): EnhancedSlotDefinition[] => {
    return allSlots.filter(predicate);
  }, [allSlots]);

  // ============ 依赖关系管理方法 ============

  const getSlotDependencies = useCallback((slotId: string): string[] => {
    return slotRegistry.getSlotDependencies(slotId);
  }, []);

  const validateSlotDependencies = useCallback((slotId: string): boolean => {
    return slotRegistry.validateSlotDependencies(slotId);
  }, []);

  const checkCyclicDependency = useCallback((slotId: string): boolean => {
    return slotRegistry.hasCyclicDependency(slotId);
  }, []);

  // ============ 缓存管理方法 ============

  const getCachedSlotValue = useCallback((slotId: string): any => {
    return slotRegistry.getCachedSlotValue(slotId);
  }, []);

  const setCachedSlotValue = useCallback((
    slotId: string,
    value: any,
    ttl?: number
  ): void => {
    slotRegistry.setCachedSlotValue(slotId, value, ttl);
  }, []);

  const clearSlotCache = useCallback((slotId?: string): void => {
    slotRegistry.clearSlotCache(slotId);
    refreshCacheStats();
  }, []);

  const refreshCacheStats = useCallback((): void => {
    setCacheStats(slotRegistry.getCacheStats());
  }, []);

  // ============ 生命周期管理方法 ============

  const clearEphemeralSlots = useCallback((): void => {
    slotRegistry.clearEphemeralSlots();
  }, []);

  const clearSessionSlots = useCallback((): void => {
    slotRegistry.clearSessionSlots();
  }, []);

  const refreshRegistry = useCallback((): void => {
    setRegistryState(slotRegistry.getState());
    refreshCacheStats();
  }, []);

  // ============ 业务场景检测方法 ============

  const detectScenario = useCallback(async (
    userInput: string,
    context?: DynamicInjectionContext
  ): Promise<ScenarioDetectionResult | null> => {
    if (!enableScenarioDetection) return null;

    setIsLoading(true);
    setError(null);

    try {
      const scenario = await slotInjector.detectScenario(userInput, context);
      if (scenario) {
        setCurrentScenario(scenario);
        setScenarios(prev => [scenario, ...prev.slice(0, 9)]); // 保留最近10个场景
      }
      return scenario;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [enableScenarioDetection]);

  const applyScenario = useCallback(async (
    scenario: ScenarioDetectionResult,
    context: DynamicInjectionContext
  ): Promise<SlotInjectionResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const slotIds = scenario.recommendedSlots.map(rec => rec.slotId);
      const results = await slotInjector.batchInjectSlots(slotIds, context);

      setActiveInjections(results.filter(r => r.success));
      setInjectionHistory(prev => [...results, ...prev.slice(0, 99)]); // 保留最近100条记录

      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearScenarios = useCallback((): void => {
    setCurrentScenario(null);
    setScenarios([]);
  }, []);

  // ============ Slot注入方法 ============

  const injectSlot = useCallback(async (
    slotId: string,
    context: DynamicInjectionContext
  ): Promise<SlotInjectionResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await slotInjector.injectSlot(slotId, context);

      if (result.success) {
        setActiveInjections(prev => {
          const filtered = prev.filter(inj => inj.slotId !== slotId);
          return [...filtered, result];
        });
      }

      setInjectionHistory(prev => [result, ...prev.slice(0, 99)]);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);

      return {
        slotId,
        success: false,
        timing: 0,
        source: 'error',
        error: errorMessage,
        metadata: {
          cached: false,
          transformed: false,
          fallbackUsed: false
        }
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const batchInjectSlots = useCallback(async (
    slotIds: string[],
    context: DynamicInjectionContext
  ): Promise<SlotInjectionResult[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const results = await slotInjector.batchInjectSlots(slotIds, context);

      const successfulResults = results.filter(r => r.success);
      setActiveInjections(prev => {
        const existingIds = new Set(successfulResults.map(r => r.slotId));
        const filtered = prev.filter(inj => !existingIds.has(inj.slotId));
        return [...filtered, ...successfulResults];
      });

      setInjectionHistory(prev => [...results, ...prev.slice(0, 99 - results.length)]);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createInjectionConfig = useCallback((config: SlotInjectionConfig): void => {
    slotInjector.createInjectionConfig(config);
  }, []);

  const updateInjectionConfig = useCallback((
    slotId: string,
    updates: Partial<SlotInjectionConfig>
  ): void => {
    slotInjector.updateInjectionConfig(slotId, updates);
  }, []);

  const deleteInjectionConfig = useCallback((slotId: string): void => {
    slotInjector.deleteInjectionConfig(slotId);
  }, []);

  // ============ 错误处理方法 ============

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const retry = useCallback((): void => {
    setError(null);
    refreshRegistry();
  }, [refreshRegistry]);

  // 返回完整的hook接口
  return {
    // 状态
    registryState,
    isLoading,
    error,
    allSlots,
    runtimeSlots,
    sessionSlots,
    persistentSlots,
    stats,
    cacheStats,
    registrationHistory: registryState.registrationHistory,
    currentScenario,
    scenarios,
    activeInjections,
    injectionHistory,

    // 操作方法
    registerSlot,
    unregisterSlot,
    updateSlot,
    getSlot,
    getSlotsByRole,
    getSlotsByOrigin,
    searchSlots,
    filterSlots,
    getSlotDependencies,
    validateSlotDependencies,
    checkCyclicDependency,
    getCachedSlotValue,
    setCachedSlotValue,
    clearSlotCache,
    refreshCacheStats,
    clearEphemeralSlots,
    clearSessionSlots,
    refreshRegistry,
    detectScenario,
    applyScenario,
    clearScenarios,
    injectSlot,
    batchInjectSlots,
    createInjectionConfig,
    updateInjectionConfig,
    deleteInjectionConfig,
    clearError,
    retry
  };
}