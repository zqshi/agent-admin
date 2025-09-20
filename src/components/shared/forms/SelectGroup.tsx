/**
 * 通用选择按钮组组件
 */

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SelectGroupProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  description?: string;
  disabled?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid';
  gridCols?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'button';
  className?: string;
  required?: boolean;
  error?: string;
}

const SelectGroup: React.FC<SelectGroupProps> = ({
  label,
  value,
  options,
  onChange,
  description,
  disabled = false,
  layout = 'vertical',
  gridCols = 1,
  size = 'md',
  variant = 'default',
  className = '',
  required = false,
  error
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 text-sm';
      case 'lg':
        return 'p-4 text-base';
      default:
        return 'p-3 text-sm';
    }
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'horizontal':
        return 'flex flex-wrap gap-2';
      case 'grid':
        return `grid grid-cols-${gridCols} gap-2`;
      default:
        return 'space-y-2';
    }
  };

  const getVariantClasses = (option: SelectOption, isSelected: boolean) => {
    const baseClasses = `text-left border rounded-lg transition-all cursor-pointer ${getSizeClasses()} ${
      disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`;

    switch (variant) {
      case 'card':
        return `${baseClasses} ${
          isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
            : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
        }`;
      case 'button':
        return `${baseClasses} ${
          isSelected
            ? 'border-blue-500 bg-blue-600 text-white'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`;
      default:
        return `${baseClasses} ${
          isSelected
            ? 'border-blue-500 bg-blue-50 text-blue-700'
            : 'border-gray-200 hover:border-gray-300 text-gray-700'
        }`;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}

      <div className={getLayoutClasses()}>
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                if (!disabled && !option.disabled) {
                  onChange(option.value);
                }
              }}
              disabled={disabled || option.disabled}
              className={getVariantClasses(option, isSelected)}
            >
              <div className="flex items-start gap-2">
                {Icon && (
                  <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default SelectGroup;