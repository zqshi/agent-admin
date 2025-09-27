/**
 * 记忆系统 React Hook
 * 提供记忆引擎的状态管理和操作接口
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  EnhancedMemoryEntry,
  MemoryLayerType,
  MemorySystemState,
  MemoryLayerState,
  MemoryQuery,
  MemorySearchResponse,
  MemoryAnalytics
} from '../types';
import { MemoryEngine, MemoryRetrieval, MemoryOptimizer } from '../services';

interface UseMemorySystemOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableAnalytics?: boolean;
}

interface UseMemorySystemReturn {
  // 状态
  memorySystem: Record<MemoryLayerType, EnhancedMemoryEntry[]>;
  systemState: MemorySystemState | null;
  layerStates: Record<MemoryLayerType, MemoryLayerState>;
  isLoading: boolean;
  error: string | null;

  // 操作
  storeMemory: (memory: Omit<EnhancedMemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'version'>) => Promise<EnhancedMemoryEntry>;
  retrieveMemory: (memoryId: string) => EnhancedMemoryEntry | null;
  updateMemory: (memoryId: string, updates: Partial<EnhancedMemoryEntry>) => Promise<EnhancedMemoryEntry>;
  deleteMemory: (memoryId: string) => Promise<boolean>;
  transferMemory: (memoryId: string, targetLayer: MemoryLayerType) => Promise<boolean>;

  // 搜索
  searchMemories: (query: MemoryQuery) => Promise<MemorySearchResponse>;
  searchByLayer: (layer: MemoryLayerType, query: string) => EnhancedMemoryEntry[];

  // 系统操作
  refreshMemories: () => Promise<void>;
  optimizeSystem: () => Promise<void>;
  exportMemories: (layer?: MemoryLayerType) => void;

  // 分析
  generateAnalytics: (timeRange?: { start: Date; end: Date }) => Promise<MemoryAnalytics>;
  getMemoryStats: () => MemorySystemStats;
}

interface MemorySystemStats {
  totalMemories: number;
  memoriesByLayer: Record<MemoryLayerType, number>;
  avgQuality: number;
  avgImportance: number;
  systemHealth: number;
  growthTrend: 'up' | 'down' | 'stable';
}

export const useMemorySystem = (
  employeeId: string,
  options: UseMemorySystemOptions = {}
): UseMemorySystemReturn => {
  // 选项配置
  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30秒
    enableAnalytics = true
  } = options;

  // 状态管理
  const [memoryEngine] = useState(() => new MemoryEngine());
  const [memoryRetrieval] = useState(() => new MemoryRetrieval());
  const [memoryOptimizer] = useState(() => new MemoryOptimizer());

  const [memorySystem, setMemorySystem] = useState<Record<MemoryLayerType, EnhancedMemoryEntry[]>>({
    working: [],
    episodic: [],
    semantic: [],
    procedural: [],
    emotional: []
  });

  const [systemState, setSystemState] = useState<MemorySystemState | null>(null);
  const [layerStates, setLayerStates] = useState<Record<MemoryLayerType, MemoryLayerState>>({
    working: createEmptyLayerState('working'),
    episodic: createEmptyLayerState('episodic'),
    semantic: createEmptyLayerState('semantic'),
    procedural: createEmptyLayerState('procedural'),
    emotional: createEmptyLayerState('emotional')
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化系统
  useEffect(() => {
    initializeMemorySystem();
  }, [employeeId]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      await refreshMemories();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // 初始化记忆系统
  const initializeMemorySystem = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 初始化记忆引擎配置
      memoryOptimizer.setMemoryStore(
        memoryEngine['memories'], // 假设memoryEngine有这个属性
        memoryEngine['layerStates'] // 假设memoryEngine有这个属性
      );

      // 加载现有记忆数据
      await loadMemoriesFromStorage();

      // 获取系统状态
      const state = memoryEngine.getSystemState();
      setSystemState(state);

      // 更新层级状态
      updateLayerStates();

    } catch (err) {
      setError(err instanceof Error ? err.message : '初始化记忆系统失败');
      console.error('Memory system initialization failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 从存储加载记忆数据
  const loadMemoriesFromStorage = async () => {
    try {
      // 这里应该从后端API或本地存储加载数据
      // 现在使用模拟数据
      const mockMemories = generateMockMemories(employeeId);

      // 按层级分组
      const memoriesByLayer: Record<MemoryLayerType, EnhancedMemoryEntry[]> = {
        working: [],
        episodic: [],
        semantic: [],
        procedural: [],
        emotional: []
      };

      mockMemories.forEach(memory => {
        memoriesByLayer[memory.layer].push(memory);
      });

      setMemorySystem(memoriesByLayer);

      // 将记忆存储到引擎中
      for (const memory of mockMemories) {
        await memoryEngine.storeMemory(memory);
        await memoryRetrieval.indexMemory(memory);
      }

    } catch (err) {
      throw new Error('加载记忆数据失败');
    }
  };

  // 更新层级状态
  const updateLayerStates = useCallback(() => {
    const layers: MemoryLayerType[] = ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    const newLayerStates: Record<MemoryLayerType, MemoryLayerState> = {} as any;

    layers.forEach(layer => {
      const memories = memoryEngine.getMemoriesByLayer(layer);
      newLayerStates[layer] = {
        layer,
        totalMemories: memories.length,
        activeMemories: memories.filter(m => m.state === 'active').length,
        capacity: getLayerCapacity(layer),
        utilizationRate: memories.length / getLayerCapacity(layer),
        averageAge: calculateAverageAge(memories),
        averageImportance: calculateAverageImportance(memories),
        averageConfidence: calculateAverageConfidence(memories),
        layerSpecificMetrics: {},
        recentActivities: [],
        healthIndicators: {
          fragmentationLevel: calculateFragmentation(memories),
          redundancyRate: calculateRedundancy(memories),
          coherenceScore: calculateCoherence(memories),
          updateFrequency: calculateUpdateFrequency(memories)
        }
      };
    });

    setLayerStates(newLayerStates);
  }, [memoryEngine]);

  // 存储记忆
  const storeMemory = useCallback(async (
    memory: Omit<EnhancedMemoryEntry, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Promise<EnhancedMemoryEntry> => {
    try {
      setError(null);
      const storedMemory = await memoryEngine.storeMemory(memory);
      await memoryRetrieval.indexMemory(storedMemory);

      // 更新本地状态
      setMemorySystem(prev => ({
        ...prev,
        [memory.layer]: [...prev[memory.layer], storedMemory]
      }));

      updateLayerStates();
      return storedMemory;
    } catch (err) {
      const error = err instanceof Error ? err.message : '存储记忆失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryEngine, memoryRetrieval, updateLayerStates]);

  // 检索记忆
  const retrieveMemory = useCallback((memoryId: string): EnhancedMemoryEntry | null => {
    for (const memories of Object.values(memorySystem)) {
      const memory = memories.find(m => m.id === memoryId);
      if (memory) return memory;
    }
    return null;
  }, [memorySystem]);

  // 更新记忆
  const updateMemory = useCallback(async (
    memoryId: string,
    updates: Partial<EnhancedMemoryEntry>
  ): Promise<EnhancedMemoryEntry> => {
    try {
      setError(null);
      const updatedMemory = await memoryEngine.updateMemory(memoryId, updates);

      // 更新本地状态
      setMemorySystem(prev => {
        const newState = { ...prev };
        for (const layer of Object.keys(newState) as MemoryLayerType[]) {
          const index = newState[layer].findIndex(m => m.id === memoryId);
          if (index !== -1) {
            newState[layer] = [...newState[layer]];
            newState[layer][index] = updatedMemory;
            break;
          }
        }
        return newState;
      });

      updateLayerStates();
      return updatedMemory;
    } catch (err) {
      const error = err instanceof Error ? err.message : '更新记忆失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryEngine, updateLayerStates]);

  // 删除记忆
  const deleteMemory = useCallback(async (memoryId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await memoryEngine.deleteMemory(memoryId);
      if (success) {
        await memoryRetrieval.removeFromIndex(memoryId);

        // 更新本地状态
        setMemorySystem(prev => {
          const newState = { ...prev };
          for (const layer of Object.keys(newState) as MemoryLayerType[]) {
            newState[layer] = newState[layer].filter(m => m.id !== memoryId);
          }
          return newState;
        });

        updateLayerStates();
      }
      return success;
    } catch (err) {
      const error = err instanceof Error ? err.message : '删除记忆失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryEngine, memoryRetrieval, updateLayerStates]);

  // 转移记忆
  const transferMemory = useCallback(async (
    memoryId: string,
    targetLayer: MemoryLayerType
  ): Promise<boolean> => {
    try {
      setError(null);
      const result = await memoryEngine.executeTransition(memoryId, targetLayer);

      if (result.success && result.newMemoryId) {
        // 从原层级移除，添加到新层级
        const originalMemory = retrieveMemory(memoryId);
        const newMemory = retrieveMemory(result.newMemoryId);

        if (originalMemory && newMemory) {
          setMemorySystem(prev => ({
            ...prev,
            [originalMemory.layer]: prev[originalMemory.layer].filter(m => m.id !== memoryId),
            [targetLayer]: [...prev[targetLayer], newMemory]
          }));

          updateLayerStates();
          return true;
        }
      }

      return false;
    } catch (err) {
      const error = err instanceof Error ? err.message : '转移记忆失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryEngine, retrieveMemory, updateLayerStates]);

  // 搜索记忆
  const searchMemories = useCallback(async (query: MemoryQuery): Promise<MemorySearchResponse> => {
    try {
      setError(null);
      return await memoryRetrieval.crossLayerRetrieval(query);
    } catch (err) {
      const error = err instanceof Error ? err.message : '搜索记忆失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryRetrieval]);

  // 按层级搜索
  const searchByLayer = useCallback((
    layer: MemoryLayerType,
    query: string
  ): EnhancedMemoryEntry[] => {
    const layerMemories = memorySystem[layer] || [];
    return layerMemories.filter(memory =>
      memory.content.toLowerCase().includes(query.toLowerCase()) ||
      memory.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [memorySystem]);

  // 刷新记忆
  const refreshMemories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 重新加载记忆数据
      await loadMemoriesFromStorage();

      // 更新系统状态
      const state = memoryEngine.getSystemState();
      setSystemState(state);

      // 更新层级状态
      updateLayerStates();

    } catch (err) {
      setError(err instanceof Error ? err.message : '刷新记忆失败');
    } finally {
      setIsLoading(false);
    }
  }, [memoryEngine, updateLayerStates]);

  // 优化系统
  const optimizeSystem = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);

      const result = await memoryOptimizer.optimizeSystem();
      console.log('系统优化完成:', result);

      // 刷新状态
      await refreshMemories();

      return result;
    } catch (err) {
      const error = err instanceof Error ? err.message : '系统优化失败';
      setError(error);
      throw new Error(error);
    } finally {
      setIsLoading(false);
    }
  }, [memoryOptimizer, refreshMemories]);

  // 导出记忆
  const exportMemories = useCallback((layer?: MemoryLayerType) => {
    try {
      const memories = layer ? memorySystem[layer] : Object.values(memorySystem).flat();
      const dataStr = JSON.stringify(memories, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `memory-export-${layer || 'all'}-${Date.now()}.json`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError('导出记忆失败');
    }
  }, [memorySystem]);

  // 生成分析报告
  const generateAnalytics = useCallback(async (
    timeRange?: { start: Date; end: Date }
  ): Promise<MemoryAnalytics> => {
    try {
      return await memoryEngine.generateAnalytics(timeRange);
    } catch (err) {
      const error = err instanceof Error ? err.message : '生成分析报告失败';
      setError(error);
      throw new Error(error);
    }
  }, [memoryEngine]);

  // 获取记忆统计
  const getMemoryStats = useCallback((): MemorySystemStats => {
    const allMemories = Object.values(memorySystem).flat();
    const totalMemories = allMemories.length;

    const memoriesByLayer = {
      working: memorySystem.working.length,
      episodic: memorySystem.episodic.length,
      semantic: memorySystem.semantic.length,
      procedural: memorySystem.procedural.length,
      emotional: memorySystem.emotional.length
    };

    const avgQuality = totalMemories > 0
      ? allMemories.reduce((sum, m) => sum + m.confidence, 0) / totalMemories
      : 0;

    const avgImportance = totalMemories > 0
      ? allMemories.reduce((sum, m) => sum + m.importance, 0) / totalMemories
      : 0;

    const systemHealth = systemState
      ? (systemState.systemCoherence + systemState.retrievalEfficiency + systemState.averageMemoryQuality) / 3
      : 0;

    const growthTrend: 'up' | 'down' | 'stable' = systemState
      ? systemState.growthRate > 0.1 ? 'up'
        : systemState.growthRate < -0.1 ? 'down'
        : 'stable'
      : 'stable';

    return {
      totalMemories,
      memoriesByLayer,
      avgQuality,
      avgImportance,
      systemHealth,
      growthTrend
    };
  }, [memorySystem, systemState]);

  return {
    // 状态
    memorySystem,
    systemState,
    layerStates,
    isLoading,
    error,

    // 操作
    storeMemory,
    retrieveMemory,
    updateMemory,
    deleteMemory,
    transferMemory,

    // 搜索
    searchMemories,
    searchByLayer,

    // 系统操作
    refreshMemories,
    optimizeSystem,
    exportMemories,

    // 分析
    generateAnalytics,
    getMemoryStats
  };
};

// === 辅助函数 ===

function createEmptyLayerState(layer: MemoryLayerType): MemoryLayerState {
  return {
    layer,
    totalMemories: 0,
    activeMemories: 0,
    capacity: getLayerCapacity(layer),
    utilizationRate: 0,
    averageAge: 0,
    averageImportance: 0,
    averageConfidence: 0,
    layerSpecificMetrics: {},
    recentActivities: [],
    healthIndicators: {
      fragmentationLevel: 0,
      redundancyRate: 0,
      coherenceScore: 1,
      updateFrequency: 0
    }
  };
}

function getLayerCapacity(layer: MemoryLayerType): number {
  const capacities = {
    working: 100,
    episodic: 1000,
    semantic: 10000,
    procedural: 5000,
    emotional: 2000
  };
  return capacities[layer];
}

function calculateAverageAge(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 0;
  const now = Date.now();
  return memories.reduce((sum, m) => sum + (now - m.createdAt.getTime()), 0) / memories.length / (1000 * 60 * 60 * 24);
}

function calculateAverageImportance(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 0;
  return memories.reduce((sum, m) => sum + m.importance, 0) / memories.length;
}

function calculateAverageConfidence(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 0;
  return memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
}

function calculateFragmentation(memories: EnhancedMemoryEntry[]): number {
  // 简化的碎片化计算：孤立记忆的比例
  const isolatedMemories = memories.filter(m => m.associations.length === 0);
  return memories.length > 0 ? isolatedMemories.length / memories.length : 0;
}

function calculateRedundancy(memories: EnhancedMemoryEntry[]): number {
  // 简化的冗余计算：基于内容相似性
  if (memories.length < 2) return 0;

  let duplicates = 0;
  for (let i = 0; i < memories.length - 1; i++) {
    for (let j = i + 1; j < memories.length; j++) {
      const similarity = calculateContentSimilarity(memories[i].content, memories[j].content);
      if (similarity > 0.8) duplicates++;
    }
  }

  return duplicates / (memories.length * (memories.length - 1) / 2);
}

function calculateCoherence(memories: EnhancedMemoryEntry[]): number {
  // 简化的连贯性计算：关联记忆的比例
  const connectedMemories = memories.filter(m => m.associations.length > 0);
  return memories.length > 0 ? connectedMemories.length / memories.length : 1;
}

function calculateUpdateFrequency(memories: EnhancedMemoryEntry[]): number {
  // 简化的更新频率计算：最近更新的比例
  const recentlyUpdated = memories.filter(m => {
    const daysSinceUpdate = (Date.now() - m.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate <= 7;
  });
  return memories.length > 0 ? recentlyUpdated.length / memories.length : 0;
}

function calculateContentSimilarity(content1: string, content2: string): number {
  const words1 = new Set(content1.toLowerCase().split(/\s+/));
  const words2 = new Set(content2.toLowerCase().split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

function generateMockMemories(employeeId: string): EnhancedMemoryEntry[] {
  // 生成模拟记忆数据
  const mockMemories: EnhancedMemoryEntry[] = [];

  // 工作记忆样本
  for (let i = 0; i < 5; i++) {
    mockMemories.push({
      id: `working_${employeeId}_${i}`,
      layer: 'working',
      type: 'dialogue',
      content: `工作记忆内容 ${i + 1}: 用户询问关于产品功能的问题`,
      contentType: 'text',
      metadata: {},
      createdAt: new Date(Date.now() - i * 3600000), // 每小时一个
      updatedAt: new Date(Date.now() - i * 3600000),
      lastAccessedAt: new Date(Date.now() - i * 1800000), // 最近访问
      confidence: 0.8 + Math.random() * 0.2,
      importance: 0.5 + Math.random() * 0.3,
      clarity: 0.7 + Math.random() * 0.3,
      stability: 0.6 + Math.random() * 0.4,
      emotionalValence: Math.random() - 0.5,
      emotionalIntensity: Math.random() * 0.5,
      emotionalTags: [],
      accessCount: Math.floor(Math.random() * 10) + 1,
      activationCount: Math.floor(Math.random() * 5),
      reinforcementCount: Math.floor(Math.random() * 3),
      decayRate: 0.1 + Math.random() * 0.1,
      associations: [],
      contextIds: [],
      derivedFrom: [],
      influences: [],
      source: 'conversation',
      sourceDetails: {
        originalSource: 'user_interaction',
        timestamp: new Date()
      },
      state: 'active',
      version: 1,
      tags: ['对话', '产品'],
      categories: ['客户服务'],
      domainKnowledge: ['产品知识']
    });
  }

  // 为其他层级生成类似的样本数据...
  // 这里简化处理，实际应该为每个层级生成适合的数据

  return mockMemories;
}