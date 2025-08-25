import React from 'react';
import { SearchInput, SearchInputProps } from './SearchInput';
import { FilterSelect, FilterSelectProps, FilterOption } from './FilterSelect';
import { Card, CardBody } from './Card';
import { cn } from '../../utils/cn';

export interface FilterConfig extends Omit<FilterSelectProps, 'options' | 'value' | 'onChange'> {
  key: string;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

export interface FilterSectionProps {
  searchProps: SearchInputProps;
  filters?: FilterConfig[];
  layout?: 'horizontal' | 'vertical' | 'responsive';
  className?: string;
  showCard?: boolean;
  gap?: 'sm' | 'md' | 'lg';
}

const FilterSection: React.FC<FilterSectionProps> = ({
  searchProps,
  filters = [],
  layout = 'responsive',
  className,
  showCard = true,
  gap = 'md'
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6'
  };

  const layoutClasses = {
    horizontal: 'flex flex-row items-center',
    vertical: 'flex flex-col',
    responsive: 'flex flex-col lg:flex-row lg:items-center'
  };

  const filterContent = (
    <div className={cn(
      layoutClasses[layout],
      gapClasses[gap],
      className
    )}>
      {/* 搜索框 */}
      <SearchInput {...searchProps} />
      
      {/* 筛选器组 */}
      {filters.length > 0 && (
        <div className={cn(
          'flex items-center',
          layout === 'vertical' ? 'flex-col gap-3 w-full' : 'gap-2 flex-wrap'
        )}>
          {filters.map((filter) => (
            <FilterSelect
              key={filter.key}
              options={filter.options}
              value={filter.value}
              onChange={filter.onChange}
              placeholder={filter.placeholder}
              label={filter.label}
              showIcon={filter.showIcon}
              showCount={filter.showCount}
              className={filter.className}
              disabled={filter.disabled}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardBody>
          {filterContent}
        </CardBody>
      </Card>
    );
  }

  return filterContent;
};

export { FilterSection };