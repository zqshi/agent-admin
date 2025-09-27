/**
 * 记忆引擎服务统一导出
 */

export { MemoryEngine, type MemoryEngineConfig } from './MemoryEngine';
export { MemoryRetrieval } from './MemoryRetrieval';
export {
  MemoryOptimizer,
  type MemoryOptimizerConfig,
  type OptimizationResult,
  type DecayResult,
  type CompressionResult,
  type ConsolidationResult,
  type ReinforcementResult,
  type DeduplicationResult
} from './MemoryOptimizer';