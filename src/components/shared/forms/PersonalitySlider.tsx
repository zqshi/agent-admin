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

      <style>{`
        .personality-slider {
          -webkit-appearance: none !important;
          -moz-appearance: none !important;
          appearance: none !important;
          background: transparent !important;
          outline: none !important;
          box-shadow: none !important;
          border: none !important;
          filter: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        .personality-slider::-webkit-slider-track {
          background: #e5e7eb !important;
          height: 8px !important;
          border-radius: 4px !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }

        .personality-slider::-webkit-slider-thumb {
          -webkit-appearance: none !important;
          appearance: none !important;
          height: 18px !important;
          width: 18px !important;
          border-radius: 50% !important;
          background: #3b82f6 !important;
          cursor: pointer !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          border: 2px solid white !important;
          outline: none !important;
          filter: none !important;
          -webkit-filter: none !important;
        }

        .personality-slider::-moz-range-track {
          background: #e5e7eb !important;
          height: 8px !important;
          border-radius: 4px !important;
          box-shadow: none !important;
          -moz-box-shadow: none !important;
          border: none !important;
        }

        .personality-slider::-moz-range-thumb {
          height: 18px !important;
          width: 18px !important;
          border-radius: 50% !important;
          background: #3b82f6 !important;
          cursor: pointer !important;
          box-shadow: none !important;
          -moz-box-shadow: none !important;
          border: 2px solid white !important;
          outline: none !important;
          filter: none !important;
          -moz-filter: none !important;
        }

        .personality-slider:focus {
          outline: none !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
          -moz-box-shadow: none !important;
        }

        .personality-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          -webkit-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .personality-slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          -moz-box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }
      `}</style>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className={`personality-slider w-full h-2 bg-gray-200 rounded-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        style={{
          background: '#e5e7eb',
          outline: 'none',
          boxShadow: 'none',
          border: 'none',
          filter: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none'
        }}
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