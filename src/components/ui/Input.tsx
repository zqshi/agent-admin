import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, required, helperText, errorText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className={cn('label', required && 'label-required')}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'input',
            error && 'input-error',
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500">{helperText}</p>
        )}
        {errorText && error && (
          <p className="mt-1 text-xs text-red-600">{errorText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };