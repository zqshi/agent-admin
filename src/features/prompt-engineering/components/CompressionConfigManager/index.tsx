/**
 * 压缩策略配置管理器组件
 * 独立管理压缩策略，支持预设和自定义配置
 */

import React, { useState, useCallback } from 'react';
import {
  Zap,
  Settings,
  Layers,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle,
  Sliders,
  Save,
  RotateCcw,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { usePromptEngineeringStore } from '../../stores/promptEngineeringStore';
import type { CompressionStrategy, CompressionAlgorithm } from '../../types';

export interface CompressionConfigManagerProps {
  className?: string;
  showPresets?: boolean;
  showAdvanced?: boolean;
  compact?: boolean;
}

export const CompressionConfigManager: React.FC<CompressionConfigManagerProps> = ({
  className = '',
  showPresets = true,
  showAdvanced = false,
  compact = false
}) => {
  const {
    compressionStrategy,
    compressionPresets,
    config,
    updateCompressionStrategy,
    applyCompressionPreset
  } = usePromptEngineeringStore();

  const [showAdvancedSettings, setShowAdvancedSettings] = useState(showAdvanced);
  const [showPresetDialog, setShowPresetDialog] = useState(false);
  const [tempStrategy, setTempStrategy] = useState<CompressionStrategy>(compressionStrategy);

  const algorithms: { id: CompressionAlgorithm; name: string; description: string }[] = [
    {
      id: 'semantic',
      name: '语义压缩',
      description: '基于语义理解进行压缩，保持核心意思'
    },
    {
      id: 'syntactic',
      name: '语法压缩',
      description: '基于语法结构进行压缩，快速但可能影响质量'
    },
    {
      id: 'hybrid',
      name: '混合压缩',
      description: '结合语义和语法的智能压缩策略'
    }
  ];

  const handleStrategyUpdate = useCallback((updates: Partial<CompressionStrategy>) => {
    const newStrategy = { ...compressionStrategy, ...updates };
    setTempStrategy(newStrategy);
  }, [compressionStrategy]);

  const handleApplyChanges = useCallback(() => {
    updateCompressionStrategy(tempStrategy);
  }, [tempStrategy, updateCompressionStrategy]);

  const handleResetToDefault = useCallback(() => {
    const defaultPreset = compressionPresets.find(p => p.id === 'medium-compression');
    if (defaultPreset) {
      setTempStrategy(defaultPreset);
      updateCompressionStrategy(defaultPreset);
    }
  }, [compressionPresets, updateCompressionStrategy]);

  const handleApplyPreset = useCallback((presetId: string) => {
    const preset = compressionPresets.find(p => p.id === presetId);
    if (preset) {
      setTempStrategy(preset);
      applyCompressionPreset(presetId);
    }
    setShowPresetDialog(false);
  }, [compressionPresets, applyCompressionPreset]);

  const getEffectivenessScore = useCallback((strategy: CompressionStrategy) => {
    const { compressionRatio, qualityThreshold } = strategy.config;
    return Math.round((1 - compressionRatio) * qualityThreshold * 100);
  }, []);

  const renderPresets = () => {
    if (!showPresets) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900">快速预设</h4>
          <button
            onClick={() => setShowPresetDialog(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            查看全部
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {compressionPresets.slice(0, 3).map(preset => {
            const isActive = compressionStrategy.id === preset.id;
            const effectiveness = getEffectivenessScore(preset);

            return (
              <button
                key={preset.id}
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  isActive
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-sm font-medium ${
                    isActive ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {preset.name}
                  </span>
                  {isActive && <CheckCircle className="h-3 w-3 text-blue-600" />}
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  压缩率: {Math.round((1 - preset.config.compressionRatio) * 100)}%
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${
                        effectiveness > 70 ? 'bg-green-500' :
                        effectiveness > 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${effectiveness}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{effectiveness}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBasicSettings = () => {
    return (
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">基础设置</h4>

        {/* 算法选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            压缩算法
          </label>
          <select
            value={tempStrategy.algorithm}
            onChange={(e) => handleStrategyUpdate({
              algorithm: e.target.value as CompressionAlgorithm
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {algorithms.map(algorithm => (
              <option key={algorithm.id} value={algorithm.id}>
                {algorithm.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            {algorithms.find(a => a.id === tempStrategy.algorithm)?.description}
          </p>
        </div>

        {/* 最大Token数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            最大Token数
          </label>
          <input
            type="number"
            value={tempStrategy.config.maxTokens}
            onChange={(e) => handleStrategyUpdate({
              config: {
                ...tempStrategy.config,
                maxTokens: Number(e.target.value)
              }
            })}
            min="100"
            max="32000"
            step="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 压缩比例 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            压缩比例: {Math.round((1 - tempStrategy.config.compressionRatio) * 100)}%
          </label>
          <input
            type="range"
            value={tempStrategy.config.compressionRatio}
            onChange={(e) => handleStrategyUpdate({
              config: {
                ...tempStrategy.config,
                compressionRatio: Number(e.target.value)
              }
            })}
            min="0.1"
            max="0.9"
            step="0.1"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>高压缩</span>
            <span>低压缩</span>
          </div>
        </div>

        {/* 质量阈值 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            质量阈值: {Math.round(tempStrategy.config.qualityThreshold * 100)}%
          </label>
          <input
            type="range"
            value={tempStrategy.config.qualityThreshold}
            onChange={(e) => handleStrategyUpdate({
              config: {
                ...tempStrategy.config,
                qualityThreshold: Number(e.target.value)
              }
            })}
            min="0.5"
            max="1.0"
            step="0.05"
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>可接受</span>
            <span>严格</span>
          </div>
        </div>
      </div>
    );
  };

  const renderAdvancedSettings = () => {
    if (!showAdvancedSettings) return null;

    return (
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900">高级设置</h4>

        {/* 保留关键词 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            保留关键词
          </label>
          <textarea
            value={tempStrategy.config.preserveKeywords.join(', ')}
            onChange={(e) => handleStrategyUpdate({
              config: {
                ...tempStrategy.config,
                preserveKeywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
              }
            })}
            placeholder="输入要保留的关键词，用逗号分隔"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 保持结构 */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="preserveStructure"
            checked={tempStrategy.config.preserveStructure}
            onChange={(e) => handleStrategyUpdate({
              config: {
                ...tempStrategy.config,
                preserveStructure: e.target.checked
              }
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="preserveStructure" className="text-sm text-gray-700">
            保持文本结构
          </label>
        </div>

        {/* 自适应学习 */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="adaptiveEnabled"
              checked={tempStrategy.adaptive.enabled}
              onChange={(e) => handleStrategyUpdate({
                adaptive: {
                  ...tempStrategy.adaptive,
                  enabled: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="adaptiveEnabled" className="text-sm text-gray-700">
              启用自适应学习
            </label>
          </div>

          {tempStrategy.adaptive.enabled && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  学习率: {tempStrategy.adaptive.learningRate}
                </label>
                <input
                  type="range"
                  value={tempStrategy.adaptive.learningRate}
                  onChange={(e) => handleStrategyUpdate({
                    adaptive: {
                      ...tempStrategy.adaptive,
                      learningRate: Number(e.target.value)
                    }
                  })}
                  min="0.01"
                  max="0.5"
                  step="0.01"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  最小样本数
                </label>
                <input
                  type="number"
                  value={tempStrategy.adaptive.minSamples}
                  onChange={(e) => handleStrategyUpdate({
                    adaptive: {
                      ...tempStrategy.adaptive,
                      minSamples: Number(e.target.value)
                    }
                  })}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderControls = () => {
    const hasChanges = JSON.stringify(tempStrategy) !== JSON.stringify(compressionStrategy);

    return (
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        <button
          onClick={handleApplyChanges}
          disabled={!hasChanges}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          应用设置
        </button>

        <button
          onClick={handleResetToDefault}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          重置
        </button>

        <button
          onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Sliders className="h-4 w-4" />
          {showAdvancedSettings ? '隐藏' : '显示'}高级
        </button>

        {hasChanges && (
          <div className="flex items-center gap-1 text-sm text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            有未保存的更改
          </div>
        )}
      </div>
    );
  };

  const renderPresetDialog = () => {
    if (!showPresetDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">压缩策略预设</h3>
            <button
              onClick={() => setShowPresetDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid gap-3">
            {compressionPresets.map(preset => {
              const isActive = compressionStrategy.id === preset.id;
              const effectiveness = getEffectivenessScore(preset);

              return (
                <div
                  key={preset.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleApplyPreset(preset.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-medium ${
                          isActive ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {preset.name}
                        </h4>
                        {isActive && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">算法:</span>
                          <span className="ml-1 font-medium">{preset.algorithm}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">压缩率:</span>
                          <span className="ml-1 font-medium">
                            {Math.round((1 - preset.config.compressionRatio) * 100)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">质量:</span>
                          <span className="ml-1 font-medium">
                            {Math.round(preset.config.qualityThreshold * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-xs text-gray-500">效果评分:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              effectiveness > 70 ? 'bg-green-500' :
                              effectiveness > 40 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${effectiveness}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{effectiveness}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 预设选择 */}
      {renderPresets()}

      {/* 基础设置 */}
      {renderBasicSettings()}

      {/* 高级设置 */}
      {renderAdvancedSettings()}

      {/* 控制按钮 */}
      {renderControls()}

      {/* 预设对话框 */}
      {renderPresetDialog()}
    </div>
  );
};

export default CompressionConfigManager;