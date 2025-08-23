import React from 'react';
import { cn } from '../../utils/cn';

export interface EmptyStateProps {
  icon?: string | React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('empty-state', className)}
        {...props}
      >
        {icon && (
          <div className="empty-icon">
            {typeof icon === 'string' ? (
              icon
            ) : React.isValidElement(icon) ? (
              icon
            ) : React.createElement(icon as React.ComponentType<{ className?: string }>, {
              className: 'h-12 w-12 mx-auto text-gray-300'
            })}
          </div>
        )}
        <h3 className="empty-title">{title}</h3>
        {description && <p className="empty-description">{description}</p>}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';

export { EmptyState };