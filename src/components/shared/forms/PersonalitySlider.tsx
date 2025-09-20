/**
 * 通用性格特征滑块组件
 */

import React from 'react';

export interface PersonalitySliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  description?: string;
  lowLabel?: string;
  highLabel?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  showValue?: boolean;
  className?: string;
}

const PersonalitySlider: React.FC<PersonalitySliderProps> = ({
  label,
  value,
  onChange,
  description,
  lowLabel = '低',
  highLabel = '高',
  min = 1,
  max = 10,
  step = 1,
  disabled = false,
  showValue = true,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {showValue && (
          <span className="text-sm text-blue-600 font-medium">{value}/{max}</span>
        )}
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>

      {description && (
        <p className="text-xs text-gray-600">{description}</p>
      )}
    </div>
  );
};

export default PersonalitySlider;