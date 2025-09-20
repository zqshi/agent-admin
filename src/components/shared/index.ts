/**
 * 共享组件导出
 */

// 表单组件
export { default as PersonalitySlider } from './forms/PersonalitySlider';
export { default as SelectGroup } from './forms/SelectGroup';
export type { PersonalitySliderProps } from './forms/PersonalitySlider';
export type { SelectGroupProps, SelectOption } from './forms/SelectGroup';

// 反馈组件
export { default as StatusBadge } from './feedback/StatusBadge';
export type { StatusBadgeProps, StatusVariant } from './feedback/StatusBadge';

// 布局组件
export { default as MetricCard } from './layout/MetricCard';
export type { MetricCardProps } from './layout/MetricCard';