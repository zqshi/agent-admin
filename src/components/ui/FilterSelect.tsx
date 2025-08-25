import React from 'react';
import { ChevronDown, Filter } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showIcon?: boolean;
  showCount?: boolean;
  className?: string;
  disabled?: boolean;
}

const FilterSelect = React.forwardRef<HTMLSelectElement, FilterSelectProps>(
  ({ 
    options, 
    value, 
    onChange, 
    placeholder = "请选择", 
    label,
    showIcon = false,
    showCount = false,
    className,
    disabled = false,
    ...props 
  }, ref) => {
    return (
      <div className={cn('relative min-w-[120px]', className)}>
        {label && (
          <label className="label mb-2">
            {label}
          </label>
        )}
        
        <div className="relative">
          {showIcon && (
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          )}
          
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'input appearance-none cursor-pointer',
              showIcon && 'pl-10',
              'pr-8', // 为箭头留出空间
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            {...props}
          >
            <option value="all">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {showCount && option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
          
          {/* 自定义下拉箭头 */}
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>
    );
  }
);

FilterSelect.displayName = 'FilterSelect';

export { FilterSelect };