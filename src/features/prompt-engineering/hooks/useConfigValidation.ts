/**
 * 配置验证Hook
 * 提供实时配置验证、错误检测和修复建议
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePromptEngineeringStore } from '../stores/promptEngineeringStore';
import type {
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  SlotDefinition,
  CompressionStrategy,
  InjectionStrategy
} from '../types';

export interface UseConfigValidationOptions {
  autoValidate?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

export interface UseConfigValidationReturn {
  validation: ConfigValidationResult | null;
  isValidating: boolean;
  validate: () => Promise<ConfigValidationResult>;
  clearValidation: () => void;
  hasErrors: boolean;
  hasWarnings: boolean;
  errorCount: number;
  warningCount: number;
  completeness: number;
  getFieldErrors: (field: string) => ConfigValidationError[];
  getFieldWarnings: (field: string) => ConfigValidationWarning[];
}

export const useConfigValidation = (
  options: UseConfigValidationOptions = {}
): UseConfigValidationReturn => {
  const {
    autoValidate = true,
    validateOnChange = true,
    debounceMs = 500
  } = options;

  const {
    config,
    slots,
    slotValues,
    selectedTemplate,
    validateConfig
  } = usePromptEngineeringStore();

  const [validation, setValidation] = useState<ConfigValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<number | null>(null);

  // 验证slots
  const validateSlots = useCallback((slots: SlotDefinition[], values: Record<string, any>): {
    errors: ConfigValidationError[];
    warnings: ConfigValidationWarning[];
  } => {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    slots.forEach(slot => {
      const value = values[slot.id];

      // 必填验证
      if (slot.required && (value === undefined || value === null || value === '')) {
        errors.push({
          type: 'missing',
          field: `slot.${slot.id}`,
          message: `${slot.name}是必填项`,
          severity: 'error',
          suggestion: `请为${slot.name}提供有效值`
        });
      }

      // 类型验证
      if (value !== undefined && value !== null && value !== '') {
        if (slot.validation) {
          slot.validation.forEach(rule => {
            switch (rule.type) {
              case 'type':
                if (rule.value === 'number' && isNaN(Number(value))) {
                  errors.push({
                    type: 'invalid',
                    field: `slot.${slot.id}`,
                    message: rule.message,
                    severity: 'error',
                    suggestion: '请输入有效的数字'
                  });
                }
                break;
              case 'length':
                if (typeof value === 'string' && value.length > (rule.value as number)) {
                  warnings.push({
                    type: 'best-practice',
                    field: `slot.${slot.id}`,
                    message: rule.message,
                    impact: 'medium',
                    suggestion: `建议控制在${rule.value}个字符以内`
                  });
                }
                break;
              case 'pattern':
                if (typeof value === 'string' && rule.value instanceof RegExp && !rule.value.test(value)) {
                  errors.push({
                    type: 'invalid',
                    field: `slot.${slot.id}`,
                    message: rule.message,
                    severity: 'error',
                    suggestion: '请检查输入格式'
                  });
                }
                break;
              case 'custom':
                if (rule.validator && !rule.validator(value)) {
                  errors.push({
                    type: 'invalid',
                    field: `slot.${slot.id}`,
                    message: rule.message,
                    severity: 'error'
                  });
                }
                break;
            }
          });
        }
      }

      // 性能警告
      if (typeof value === 'string' && value.length > 1000) {
        warnings.push({
          type: 'performance',
          field: `slot.${slot.id}`,
          message: '输入内容较长可能影响处理性能',
          impact: 'medium',
          suggestion: '考虑精简内容或使用压缩'
        });
      }

      // 安全检查
      if (typeof value === 'string') {
        // 检查潜在的注入风险
        const suspiciousPatterns = [
          /javascript:/i,
          /<script[^>]*>/i,
          /eval\s*\(/i,
          /function\s*\(/i
        ];

        suspiciousPatterns.forEach(pattern => {
          if (pattern.test(value)) {
            warnings.push({
              type: 'best-practice',
              field: `slot.${slot.id}`,
              message: '检测到潜在的安全风险内容',
              impact: 'high',
              suggestion: '请避免使用可执行代码或脚本'
            });
          }
        });
      }
    });

    // 检查slot依赖
    slots.forEach(slot => {
      if (slot.dependencies) {
        slot.dependencies.forEach(depId => {
          const depSlot = slots.find(s => s.id === depId);
          if (!depSlot) {
            errors.push({
              type: 'missing',
              field: `slot.${slot.id}`,
              message: `依赖的Slot "${depId}" 不存在`,
              severity: 'error',
              suggestion: '请添加依赖的Slot或移除依赖关系'
            });
          } else if (depSlot.required && !values[depId]) {
            warnings.push({
              type: 'compatibility',
              field: `slot.${slot.id}`,
              message: `依赖的Slot "${depSlot.name}" 未设置值`,
              impact: 'medium',
              suggestion: `请先设置${depSlot.name}的值`
            });
          }
        });
      }
    });

    return { errors, warnings };
  }, []);

  // 验证压缩策略
  const validateCompressionStrategy = useCallback((strategy: CompressionStrategy): {
    errors: ConfigValidationError[];
    warnings: ConfigValidationWarning[];
  } => {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // 检查配置合理性
    if (strategy.config.maxTokens < 100) {
      warnings.push({
        type: 'performance',
        field: 'compressionStrategy.maxTokens',
        message: 'Token限制过低可能严重影响输出质量',
        impact: 'high',
        suggestion: '建议设置至少500个Token'
      });
    }

    if (strategy.config.compressionRatio < 0.3) {
      warnings.push({
        type: 'performance',
        field: 'compressionStrategy.compressionRatio',
        message: '压缩比例过高可能丢失重要信息',
        impact: 'high',
        suggestion: '建议保持压缩比例在30%以上'
      });
    }

    if (strategy.config.qualityThreshold < 0.5) {
      warnings.push({
        type: 'best-practice',
        field: 'compressionStrategy.qualityThreshold',
        message: '质量阈值过低可能影响输出效果',
        impact: 'medium',
        suggestion: '建议设置质量阈值至少为50%'
      });
    }

    // 检查算法与配置的匹配度
    if (strategy.algorithm === 'semantic' && strategy.config.compressionRatio < 0.5) {
      warnings.push({
        type: 'compatibility',
        field: 'compressionStrategy.algorithm',
        message: '语义压缩通常不适合过高的压缩比例',
        impact: 'medium',
        suggestion: '考虑使用混合算法或降低压缩比例'
      });
    }

    if (strategy.algorithm === 'syntactic' && strategy.config.qualityThreshold > 0.9) {
      warnings.push({
        type: 'compatibility',
        field: 'compressionStrategy.algorithm',
        message: '语法压缩难以达到很高的质量阈值',
        impact: 'medium',
        suggestion: '考虑使用语义算法或降低质量阈值'
      });
    }

    return { errors, warnings };
  }, []);

  // 验证注入策略
  const validateInjectionStrategy = useCallback((strategy: InjectionStrategy): {
    errors: ConfigValidationError[];
    warnings: ConfigValidationWarning[];
  } => {
    const errors: ConfigValidationError[] = [];
    const warnings: ConfigValidationWarning[] = [];

    // 检查超时设置
    if (strategy.performance.timeout < 1000) {
      warnings.push({
        type: 'performance',
        field: 'injectionStrategy.timeout',
        message: '超时时间过短可能导致注入失败',
        impact: 'medium',
        suggestion: '建议设置至少1000ms的超时时间'
      });
    }

    if (strategy.performance.timeout > 30000) {
      warnings.push({
        type: 'performance',
        field: 'injectionStrategy.timeout',
        message: '超时时间过长可能影响用户体验',
        impact: 'low',
        suggestion: '考虑优化数据源或降低超时时间'
      });
    }

    // 检查重试次数
    if (strategy.performance.retryCount > 5) {
      warnings.push({
        type: 'performance',
        field: 'injectionStrategy.retryCount',
        message: '重试次数过多可能导致响应延迟',
        impact: 'medium',
        suggestion: '建议重试次数不超过3次'
      });
    }

    // 检查注入时机与性能配置的匹配度
    if (strategy.timing === 'immediate' && strategy.performance.timeout > 5000) {
      warnings.push({
        type: 'compatibility',
        field: 'injectionStrategy.timing',
        message: '立即注入不应设置过长的超时时间',
        impact: 'low',
        suggestion: '考虑使用延迟注入或降低超时时间'
      });
    }

    return { errors, warnings };
  }, []);

  // 执行完整验证
  const performValidation = useCallback(async (): Promise<ConfigValidationResult> => {
    setIsValidating(true);

    try {
      const allErrors: ConfigValidationError[] = [];
      const allWarnings: ConfigValidationWarning[] = [];

      // 验证基础配置
      if (config.source === 'template' && !selectedTemplate) {
        allErrors.push({
          type: 'missing',
          field: 'template',
          message: '模板模式下必须选择一个模板',
          severity: 'error',
          suggestion: '请选择一个模板或切换到自定义模式'
        });
      }

      // 验证slots
      const slotValidation = validateSlots(slots, slotValues);
      allErrors.push(...slotValidation.errors);
      allWarnings.push(...slotValidation.warnings);

      // 验证压缩策略
      const compressionValidation = validateCompressionStrategy(config.compressionStrategy);
      allErrors.push(...compressionValidation.errors);
      allWarnings.push(...compressionValidation.warnings);

      // 验证注入策略
      const injectionValidation = validateInjectionStrategy(config.injectionStrategy);
      allErrors.push(...injectionValidation.errors);
      allWarnings.push(...injectionValidation.warnings);

      // 计算完整度
      const totalChecks = slots.length + 2; // slots + compression + injection
      const passedChecks = totalChecks - allErrors.length;
      const completeness = Math.max(0, Math.min(1, passedChecks / totalChecks));

      const result: ConfigValidationResult = {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        completeness
      };

      setValidation(result);
      return result;
    } finally {
      setIsValidating(false);
    }
  }, [config, slots, slotValues, selectedTemplate, validateSlots, validateCompressionStrategy, validateInjectionStrategy]);

  // 防抖验证
  const debouncedValidate = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      performValidation();
    }, debounceMs);

    setDebounceTimer(timer);
  }, [debounceTimer, debounceMs, performValidation]);

  // 立即验证
  const validate = useCallback(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    return performValidation();
  }, [debounceTimer, performValidation]);

  // 清除验证结果
  const clearValidation = useCallback(() => {
    setValidation(null);
  }, []);

  // 监听配置变化
  useEffect(() => {
    if (validateOnChange && autoValidate) {
      debouncedValidate();
    }
  }, [config, slots, slotValues, validateOnChange, autoValidate, debouncedValidate]);

  // 初始验证
  useEffect(() => {
    if (autoValidate) {
      performValidation();
    }
  }, [autoValidate]); // 只在autoValidate变化时执行

  // 清理定时器
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // 计算派生状态
  const derivedState = useMemo(() => {
    if (!validation) {
      return {
        hasErrors: false,
        hasWarnings: false,
        errorCount: 0,
        warningCount: 0,
        completeness: 0
      };
    }

    return {
      hasErrors: validation.errors.length > 0,
      hasWarnings: validation.warnings.length > 0,
      errorCount: validation.errors.length,
      warningCount: validation.warnings.length,
      completeness: validation.completeness
    };
  }, [validation]);

  // 获取特定字段的错误
  const getFieldErrors = useCallback((field: string): ConfigValidationError[] => {
    if (!validation) return [];
    return validation.errors.filter(error => error.field === field);
  }, [validation]);

  // 获取特定字段的警告
  const getFieldWarnings = useCallback((field: string): ConfigValidationWarning[] => {
    if (!validation) return [];
    return validation.warnings.filter(warning => warning.field === field);
  }, [validation]);

  return {
    validation,
    isValidating,
    validate,
    clearValidation,
    ...derivedState,
    getFieldErrors,
    getFieldWarnings
  };
};

export default useConfigValidation;