import React from 'react';
import { Tooltip } from './Tooltip';

interface MetricDefinition {
  name: string;
  description: string;
  formula: string;
  unit?: string;
  interpretation: string;
}

interface MetricTooltipProps {
  children: React.ReactNode;
  metric: MetricDefinition;
  className?: string;
}

const MetricTooltip: React.FC<MetricTooltipProps> = ({ 
  children, 
  metric, 
  className 
}) => {
  const tooltipContent = (
    <div className="text-left w-80">
      <div className="font-semibold text-white mb-2">{metric.name}</div>
      <div className="text-gray-200 text-sm mb-2 leading-relaxed">{metric.description}</div>
      
      <div className="border-t border-gray-600 pt-2 mb-2">
        <div className="font-medium text-gray-100 mb-1">计算公式:</div>
        <div className="text-gray-200 text-sm font-mono bg-gray-700 px-2 py-1 rounded break-words">
          {metric.formula}
        </div>
      </div>
      
      <div className="border-t border-gray-600 pt-2">
        <div className="font-medium text-gray-100 mb-1">指标解读:</div>
        <div className="text-gray-200 text-sm leading-relaxed">{metric.interpretation}</div>
      </div>
    </div>
  );

  return (
    <Tooltip 
      content={tooltipContent} 
      position="auto" 
      className={className}
    >
      {children}
    </Tooltip>
  );
};

export { MetricTooltip };