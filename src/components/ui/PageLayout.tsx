import React from 'react';
import { cn } from '../../utils/cn';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = React.forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('page-container', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ title, subtitle, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('page-header', className)}
      {...props}
    >
      <div>
        <h1 className="page-title text-balance">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  )
);

const PageContent = React.forwardRef<HTMLDivElement, PageContentProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('space-y-8', className)}
      {...props}
    >
      {children}
    </div>
  )
);

PageLayout.displayName = 'PageLayout';
PageHeader.displayName = 'PageHeader';
PageContent.displayName = 'PageContent';

export { PageLayout, PageHeader, PageContent };