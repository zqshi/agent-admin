/**
 * 表单验证hook
 */

import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
  message?: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  fieldErrors: Record<string, string>;
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  rules: ValidationRules = {}
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 验证单个字段
  const validateField = useCallback((field: string, value: any): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    // 必填验证
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return rule.message || `${field} 是必填项`;
    }

    // 如果值为空且不是必填，跳过其他验证
    if (!value && !rule.required) return null;

    // 字符串长度验证
    if (typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message || `${field} 最少需要 ${rule.minLength} 个字符`;
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message || `${field} 最多允许 ${rule.maxLength} 个字符`;
      }
    }

    // 正则表达式验证
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      return rule.message || `${field} 格式不正确`;
    }

    // 自定义验证
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  // 验证所有字段
  const validateAll = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};
    const errorList: ValidationError[] = [];

    Object.keys(rules).forEach(field => {
      const error = validateField(field, data[field]);
      if (error) {
        newErrors[field] = error;
        errorList.push({
          field,
          message: error,
          code: 'VALIDATION_ERROR'
        });
      }
    });

    setErrors(newErrors);

    return {
      isValid: errorList.length === 0,
      errors: errorList,
      fieldErrors: newErrors
    };
  }, [data, rules, validateField]);

  // 更新字段值
  const setFieldValue = useCallback((field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));

    // 如果字段已被触摸，立即验证
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [touched, validateField]);

  // 标记字段为已触摸
  const setFieldTouched = useCallback((field: string, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));

    // 如果标记为已触摸，立即验证该字段
    if (isTouched) {
      const error = validateField(field, data[field]);
      setErrors(prev => ({
        ...prev,
        [field]: error || ''
      }));
    }
  }, [data, validateField]);

  // 重置表单
  const reset = useCallback((newData?: T) => {
    setData(newData || initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // 清除错误
  const clearErrors = useCallback((fields?: string[]) => {
    if (fields) {
      setErrors(prev => {
        const newErrors = { ...prev };
        fields.forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    } else {
      setErrors({});
    }
  }, []);

  // 计算是否有错误
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => !!error);
  }, [errors]);

  // 计算是否表单脏了（有修改）
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // 获取字段的错误信息
  const getFieldError = useCallback((field: string) => {
    return errors[field] || '';
  }, [errors]);

  // 检查字段是否有错误
  const hasFieldError = useCallback((field: string) => {
    return !!errors[field];
  }, [errors]);

  return {
    // 数据
    data,
    errors,
    touched,

    // 状态
    hasErrors,
    isDirty,

    // 操作方法
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    reset,
    clearErrors,

    // 工具方法
    getFieldError,
    hasFieldError,

    // 批量操作
    setData,
    setErrors
  };
}