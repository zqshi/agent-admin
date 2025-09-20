/**
 * 员工创建模块导出
 */

// 主要组件
export { default as AdvancedEmployeeCreationModal } from './components/AdvancedEmployeeCreationModal';

// 状态管理
export { useCreationStore } from './stores/creationStore';

// 类型定义
export type {
  CreationStage,
  BasicInfo,
  CoreFeatures,
  AdvancedConfig,
  EmployeeCreationConfig,
  ConfigSuggestion,
  ValidationResult
} from './types';