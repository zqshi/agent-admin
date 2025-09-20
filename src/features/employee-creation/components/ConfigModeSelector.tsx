/**
 * 配置模式选择器
 * 支持模板模式、自定义模式和混合模式
 */

import React from 'react';
import { FileText, Settings, Shuffle } from 'lucide-react';

export type ConfigMode = 'template' | 'custom' | 'hybrid';

interface ConfigModeSelectorProps {
  mode: ConfigMode;
  onModeChange: (mode: ConfigMode) => void;
  disabled?: boolean;
  className?: string;
}

const ConfigModeSelector: React.FC<ConfigModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false,
  className = ''
}) => {
  const modes = [
    {
      id: 'template' as const,
      name: '模板模式',
      description: '基于预设模板快速配置',
      icon: FileText,
      color: 'blue'
    },
    {
      id: 'custom' as const,
      name: '自定义模式',
      description: '完全自定义配置所有参数',
      icon: Settings,
      color: 'green'
    },
    {
      id: 'hybrid' as const,
      name: '混合模式',
      description: '基于模板但可自由修改',
      icon: Shuffle,
      color: 'purple'
    }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">配置模式</h3>
        <span className="text-sm text-gray-500">选择您的配置方式</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {modes.map((modeOption) => {
          const Icon = modeOption.icon;
          const isSelected = mode === modeOption.id;

          return (
            <button
              key={modeOption.id}
              type="button"
              disabled={disabled}
              onClick={() => onModeChange(modeOption.id)}
              className={`
                relative p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                  ? (modeOption.color === 'blue' ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' :
                     modeOption.color === 'green' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' :
                     'border-purple-500 bg-purple-50 ring-2 ring-purple-200')
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSelected ? (
                  modeOption.color === 'blue' ? 'focus:ring-blue-500' :
                  modeOption.color === 'green' ? 'focus:ring-green-500' :
                  'focus:ring-purple-500'
                ) : 'focus:ring-gray-500'}
              `}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  className={`
                    h-6 w-6 mt-0.5 flex-shrink-0
                    ${isSelected ? (
                      modeOption.color === 'blue' ? 'text-blue-600' :
                      modeOption.color === 'green' ? 'text-green-600' :
                      'text-purple-600'
                    ) : 'text-gray-400'}
                  `}
                />
                <div className="flex-1 min-w-0">
                  <p className={`
                    text-sm font-medium
                    ${isSelected ? (
                      modeOption.color === 'blue' ? 'text-blue-900' :
                      modeOption.color === 'green' ? 'text-green-900' :
                      'text-purple-900'
                    ) : 'text-gray-900'}
                  `}>
                    {modeOption.name}
                  </p>
                  <p className={`
                    text-xs mt-1
                    ${isSelected ? (
                      modeOption.color === 'blue' ? 'text-blue-700' :
                      modeOption.color === 'green' ? 'text-green-700' :
                      'text-purple-700'
                    ) : 'text-gray-500'}
                  `}>
                    {modeOption.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className={`
                  absolute top-2 right-2 h-3 w-3 rounded-full ${
                    modeOption.color === 'blue' ? 'bg-blue-500' :
                    modeOption.color === 'green' ? 'bg-green-500' :
                    'bg-purple-500'
                  }
                `} />
              )}
            </button>
          );
        })}
      </div>

      {/* 模式说明 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm text-gray-600">
          {mode === 'template' && (
            <div>
              <strong>模板模式</strong>：选择预设模板，系统会自动配置相关参数。适合快速上手。
            </div>
          )}
          {mode === 'custom' && (
            <div>
              <strong>自定义模式</strong>：不依赖任何模板，完全自主配置所有Slot和策略。适合有经验的用户。
            </div>
          )}
          {mode === 'hybrid' && (
            <div>
              <strong>混合模式</strong>：先选择模板作为基础，然后可以自由修改任何参数。平衡了便利性和灵活性。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigModeSelector;