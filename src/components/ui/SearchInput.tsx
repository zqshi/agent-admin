import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  debounceMs?: number;
  loading?: boolean;
  showClearButton?: boolean;
  className?: string;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ 
    value, 
    onChange, 
    onClear,
    debounceMs = 300,
    loading = false,
    showClearButton = true,
    className,
    placeholder = "搜索...",
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value);

    // 防抖处理
    useEffect(() => {
      if (debounceMs > 0) {
        const timer = setTimeout(() => {
          onChange(internalValue);
        }, debounceMs);

        return () => clearTimeout(timer);
      } else {
        onChange(internalValue);
      }
    }, [internalValue, debounceMs, onChange]);

    // 同步外部value变化
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    const handleClear = () => {
      setInternalValue('');
      onChange('');
      onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClear();
      }
    };

    return (
      <div className={cn('relative flex-1', className)}>
        {/* 搜索图标 */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        
        {/* 输入框 */}
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'input pl-10',
            (showClearButton && internalValue) || loading ? 'pr-10' : 'pr-4'
          )}
          {...props}
        />
        
        {/* 加载状态或清空按钮 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {loading ? (
            <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
          ) : (
            showClearButton && internalValue && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                title="清空搜索"
              >
                <X className="h-3 w-3" />
              </button>
            )
          )}
        </div>
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };