/**
 * 记忆引擎类型定义统一导出
 */

// 核心记忆类型
export type {
  MemoryLayerType,
  MemorySource,
  MemoryImportance,
  EmotionalValence,
  MemoryState,
  EnhancedMemoryEntry,
  MemoryAssociation,
  MemoryRelationType,
  MemorySourceDetails,
  MemoryContext,
  MemoryLayerState,
  MemorySystemState,
  MemoryAnalytics,
  MemoryQuery,
  MemorySearchResult,
  MemorySearchResponse
} from './memory.types';

// 记忆转换类型
export type {
  MemoryTransition,
  TransitionCondition,
  ConditionType,
  ConditionOperator,
  MemoryTransformFunction,
  MemoryValidationFunction,
  TransitionResult,
  MemoryChange,
  BatchTransitionTask,
  BatchTransitionStatus,
  TransitionStrategy,
  TransitionScenario,
  TransitionMonitor,
  TransitionAlert,
  LayerTransitionConfig,
  TransitionContext,
  TransitionSuggestion
} from './transition.types';

// 便利类型别名
export type MemoryLayer = MemoryLayerType;
export type MemoryEntry = EnhancedMemoryEntry;