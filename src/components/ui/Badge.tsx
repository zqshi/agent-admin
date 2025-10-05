import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'error' | 'neutral' | 'warning' | 'info';
  children: React.ReactNode;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variantClasses = {
      default: 'badge text-gray-900 bg-white shadow-base',
      secondary: 'badge text-gray-600 bg-gray-100',
      outline: 'badge text-gray-600 bg-transparent border border-gray-200',
      success: 'badge text-white bg-success shadow-base',
      error: 'badge text-white bg-error shadow-base',
      neutral: 'badge text-gray-600 bg-gray-100',
      warning: 'badge text-white bg-warning shadow-base',
      info: 'badge text-white bg-info shadow-base'
    };

    return (
      <div
        ref={ref}
        className={cn(variantClasses[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };