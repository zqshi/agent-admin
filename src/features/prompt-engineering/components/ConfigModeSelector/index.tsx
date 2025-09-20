/**
 * 配置模式选择器组件
 * 提供模板模式、自定义模式、混合模式的切换功能
 */

import React, { useState } from 'react';
import {
  Settings,
  Layers,
  Combine,
  Info,
  ArrowRight,
  Check,
  AlertTriangle,
  GitBranch
} from 'lucide-react';
import { usePromptEngineeringStore } from '../../stores/promptEngineeringStore';
import type { ConfigMode } from '../../types';

export interface ConfigModeSelectorProps {
  className?: string;
  showDescription?: boolean;
  onModeChange?: (mode: ConfigMode) => void;
}

export const ConfigModeSelector: React.FC<ConfigModeSelectorProps> = ({
  className = '',
  showDescription = true,
  onModeChange
}) => {
  const {
    ui,
    config,
    selectedTemplate,
    setConfigMode,
    createCustomConfig,
    convertToHybridMode,
    separateFromTemplate
  } = usePromptEngineeringStore();

  const [showConfirmDialog, setShowConfirmDialog] = useState<ConfigMode | null>(null);

  const modes = [
    {
      id: 'template-based' as ConfigMode,
      name: '模板模式',
      icon: Layers,
      description: '基于预设模板配置，自动同步模板更新',
      benefits: ['快速开始', '标准化配置', '自动更新'],
      requirements: '需要选择一个模板',
      available: !!selectedTemplate
    },
    {
      id: 'custom' as ConfigMode,
      name: '自定义模式',
      icon: Settings,
      description: '完全独立配置，不依赖任何模板',
      benefits: ['完全控制', '灵活配置', '独立管理'],
      requirements: '从零开始配置',
      available: true
    },
    {
      id: 'mixed' as ConfigMode,
      name: '混合模式',
      icon: Combine,
      description: '从模板开始，允许自由修改和扩展',
      benefits: ['快速开始', '灵活修改', '保持独立'],
      requirements: '需要先选择模板作为基础',
      available: !!selectedTemplate || config.source !== 'custom'
    }
  ];

  const currentMode = ui.configMode;

  const handleModeChange = (newMode: ConfigMode) => {
    // 检查是否需要确认
    const willLoseData = (
      (currentMode === 'template-based' && newMode !== 'template-based') ||
      (currentMode === 'mixed' && newMode === 'custom') ||
      (currentMode === 'custom' && newMode !== 'custom' && config.slots.length > 0)
    );

    if (willLoseData) {
      setShowConfirmDialog(newMode);
    } else {
      executeModeChange(newMode);
    }
  };

  const executeModeChange = (newMode: ConfigMode) => {
    switch (newMode) {
      case 'template-based':
        if (selectedTemplate) {
          setConfigMode(newMode);
        }
        break;
      case 'custom':
        if (currentMode === 'template-based' || currentMode === 'mixed') {
          separateFromTemplate();
        } else {
          createCustomConfig();
        }
        break;
      case 'mixed':
        if (currentMode === 'template-based') {
          convertToHybridMode();
        } else if (selectedTemplate) {
          setConfigMode(newMode);
        }
        break;
    }

    onModeChange?.(newMode);
    setShowConfirmDialog(null);
  };

  const renderModeCard = (mode: typeof modes[0]) => {
    const isActive = currentMode === mode.id;
    const isAvailable = mode.available;
    const Icon = mode.icon;

    return (
      <div
        key={mode.id}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
          isActive
            ? 'border-blue-500 bg-blue-50'
            : isAvailable
              ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
        } ${className}`}
        onClick={() => isAvailable && handleModeChange(mode.id)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${
            isActive
              ? 'bg-blue-100 text-blue-600'
              : isAvailable
                ? 'bg-gray-100 text-gray-600'
                : 'bg-gray-100 text-gray-400'
          }`}>
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-medium ${
                isActive ? 'text-blue-900' : isAvailable ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {mode.name}
              </h3>
              {isActive && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>

            {showDescription && (
              <>
                <p className={`text-sm mt-1 ${
                  isActive ? 'text-blue-700' : isAvailable ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {mode.description}
                </p>

                <div className="mt-2">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Info className="h-3 w-3" />
                    优势：
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {mode.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : isAvailable
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-500">
                  <span className="font-medium">要求：</span> {mode.requirements}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStatusBar = () => {
    const getStatusInfo = () => {
      switch (config.source) {
        case 'template':
          return {
            icon: Layers,
            text: `基于模板：${selectedTemplate?.name}`,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
          };
        case 'hybrid':
          return {
            icon: GitBranch,
            text: `混合模式${config.baseTemplateId ? `（源自：${selectedTemplate?.name}）` : ''}`,
            color: 'text-purple-600',
            bg: 'bg-purple-50'
          };
        case 'custom':
          return {
            icon: Settings,
            text: '自定义配置',
            color: 'text-green-600',
            bg: 'bg-green-50'
          };
        default:
          return {
            icon: Settings,
            text: '未知状态',
            color: 'text-gray-600',
            bg: 'bg-gray-50'
          };
      }
    };

    const status = getStatusInfo();
    const StatusIcon = status.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${status.bg} ${status.color}`}>
        <StatusIcon className="h-4 w-4" />
        <span className="text-sm font-medium">{status.text}</span>
        {config.isModified && (
          <span className="px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">
            已修改
          </span>
        )}
      </div>
    );
  };

  const renderConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    const targetMode = modes.find(m => m.id === showConfirmDialog);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              确认切换配置模式
            </h3>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-gray-600">
              切换到 <strong>{targetMode?.name}</strong> 将会：
            </p>

            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              {showConfirmDialog === 'custom' && (
                <li>与当前模板断开连接</li>
              )}
              {showConfirmDialog === 'template-based' && (
                <li>重置为模板默认配置</li>
              )}
              {showConfirmDialog === 'mixed' && (
                <li>保留当前配置但允许独立修改</li>
              )}
            </ul>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>注意：</strong> 此操作可能会影响当前的配置设置。
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => executeModeChange(showConfirmDialog)}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              确认切换
            </button>
            <button
              onClick={() => setShowConfirmDialog(null)}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 状态栏 */}
      {renderStatusBar()}

      {/* 模式选择器 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          选择配置模式
        </h4>

        <div className="grid gap-3">
          {modes.map(renderModeCard)}
        </div>
      </div>

      {/* 确认对话框 */}
      {renderConfirmDialog()}
    </div>
  );
};

export default ConfigModeSelector;