/**
 * Prompt Engineering 特性模块导出文件
 * 统一导出所有组件、hooks、服务和类型
 */

// 类型定义
export * from './types';

// 核心服务
export { PromptCompiler } from './services/promptCompiler';
export { SlotResolver } from './services/slotResolver';
export { CompressionEngine } from './services/compressionEngine';

// 状态管理
export { usePromptEngineeringStore } from './stores/promptEngineeringStore';
export type { PromptEngineeringStore } from './stores/promptEngineeringStore';

// Hooks
export { usePromptTemplate } from './hooks/usePromptTemplate';
export type { UsePromptTemplateReturn } from './hooks/usePromptTemplate';

export { useSlotManagement, useSlotTypeConfig } from './hooks/useSlotManagement';
export type { UseSlotManagementReturn } from './hooks/useSlotManagement';

export { usePreviewEngine, useCompilationPerformance } from './hooks/usePreviewEngine';
export type { UsePreviewEngineReturn } from './hooks/usePreviewEngine';

// 主要组件
export { PromptTemplateLibrary } from './components/PromptTemplateLibrary';
export type { PromptTemplateLibraryProps } from './components/PromptTemplateLibrary';

export { SlotManager } from './components/SlotManager';
export type { SlotManagerProps } from './components/SlotManager';

export { RealtimePreview } from './components/RealtimePreview';
export type { RealtimePreviewProps } from './components/RealtimePreview';

// 新增配置管理组件
export { ConfigModeSelector } from './components/ConfigModeSelector';
export type { ConfigModeSelectorProps } from './components/ConfigModeSelector';

export { SlotConfigManager } from './components/SlotConfigManager';
export type { SlotConfigManagerProps } from './components/SlotConfigManager';

export { CompressionConfigManager } from './components/CompressionConfigManager';
export type { CompressionConfigManagerProps } from './components/CompressionConfigManager';

// 策略预设库
export { StrategyPresetLibrary } from './components/StrategyPresetLibrary';
export type { StrategyPresetLibraryProps } from './components/StrategyPresetLibrary';

// 配置导入导出
export { ConfigImportExport } from './components/ConfigImportExport';
export type { ConfigImportExportProps } from './components/ConfigImportExport';

// 预设管理服务
export { PresetManager, presetManager } from './services/presetManager';

// 配置验证Hook
export { useConfigValidation } from './hooks/useConfigValidation';
export type { UseConfigValidationReturn, UseConfigValidationOptions } from './hooks/useConfigValidation';

// 默认导出主要组件
export { PromptTemplateLibrary as default } from './components/PromptTemplateLibrary';