/**
 * 记忆引擎系统 - 主入口
 * 基于五层记忆架构的数字员工认知系统
 */

// 核心服务
export { MemoryEngine } from './services/MemoryEngine';
export { MemoryRetrieval } from './services/MemoryRetrieval';
export { MemoryOptimizer } from './services/MemoryOptimizer';

// 组件
export { MemoryDashboard } from './components/dashboard/MemoryDashboard';
export { MemoryFlow } from './components/visualization/MemoryFlow';

// 记忆层组件
export { WorkingMemory } from './components/layers/WorkingMemory';
export { EpisodicMemory } from './components/layers/EpisodicMemory';
export { SemanticMemory } from './components/layers/SemanticMemory';
export { ProceduralMemory } from './components/layers/ProceduralMemory';
export { EmotionalMemory } from './components/layers/EmotionalMemory';

// Hooks
export { useMemorySystem } from './hooks/useMemorySystem';
export { useMemoryAnalytics } from './hooks/useMemoryAnalytics';

// 类型定义
export type {
  EnhancedMemoryEntry,
  MemoryLayer,
  MemoryTransition,
  MemoryAssociation,
  MemoryContext,
  MemorySystemState,
  MemoryAnalytics
} from './types';