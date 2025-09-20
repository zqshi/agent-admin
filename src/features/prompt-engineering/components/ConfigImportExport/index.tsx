/**
 * 配置导入导出组件
 * 支持完整配置、部分配置的导入导出，以及配置合并和冲突解决
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  Download,
  Upload,
  FileText,
  Package,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Layers,
  Zap,
  Copy,
  Eye,
  RotateCcw,
  Save,
  X,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { usePromptEngineeringStore } from '../../stores/promptEngineeringStore';
import { presetManager } from '../../services/presetManager';
import type { ConfigState, ConfigSnapshot, CompressionStrategy, InjectionStrategy, SlotDefinition } from '../../types';

export interface ConfigImportExportProps {
  className?: string;
  showHistory?: boolean;
  allowPartialExport?: boolean;
  allowMerge?: boolean;
}

export const ConfigImportExport: React.FC<ConfigImportExportProps> = ({
  className = '',
  showHistory = true,
  allowPartialExport = true,
  allowMerge = true
}) => {
  const {
    config,
    configHistory,
    exportConfig,
    importConfig,
    saveConfigSnapshot,
    loadConfigSnapshot,
    deleteConfigSnapshot,
    mergeConfig
  } = usePromptEngineeringStore();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [exportType, setExportType] = useState<'complete' | 'slots' | 'compression' | 'injection'>('complete');
  const [importData, setImportData] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any>(null);
  const [mergeConflicts, setMergeConflicts] = useState<any[]>([]);
  const [exportSettings, setExportSettings] = useState({
    includeMetadata: true,
    includeValues: true,
    includeHistory: false,
    includePresets: false
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理导出
  const handleExport = useCallback(() => {
    try {
      let exportData: any = {};
      const timestamp = new Date().toISOString();

      // 基础元数据
      if (exportSettings.includeMetadata) {
        exportData.metadata = {
          exportedAt: timestamp,
          version: '1.0.0',
          source: 'prompt-engineering-config',
          configSource: config.source,
          configMode: config.mode
        };
      }

      // 根据导出类型选择数据
      switch (exportType) {
        case 'complete':
          exportData.config = config;
          break;
        case 'slots':
          exportData.slots = config.slots;
          if (exportSettings.includeValues) {
            // 获取当前slot值
            const store = usePromptEngineeringStore.getState();
            exportData.slotValues = store.slotValues;
          }
          break;
        case 'compression':
          exportData.compressionStrategy = config.compressionStrategy;
          break;
        case 'injection':
          exportData.injectionStrategy = config.injectionStrategy;
          break;
      }

      // 包含历史记录
      if (exportSettings.includeHistory && showHistory) {
        exportData.history = configHistory;
      }

      // 包含预设
      if (exportSettings.includePresets) {
        exportData.presets = presetManager.getAllPresets();
      }

      // 生成文件名
      const fileName = `prompt-config-${exportType}-${new Date().toISOString().split('T')[0]}.json`;

      // 下载文件
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      setShowExportDialog(false);
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    }
  }, [config, configHistory, exportType, exportSettings, showHistory]);

  // 处理文件选择
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        setImportData(content);

        // 预览导入内容
        const data = JSON.parse(content);
        setImportPreview(data);

        // 检查冲突
        if (allowMerge) {
          const conflicts = detectConflicts(data);
          setMergeConflicts(conflicts);
        }
      } catch (error) {
        console.error('文件解析失败:', error);
        alert('文件格式错误，请检查文件内容');
      }
    };
    reader.readAsText(file);
  }, [allowMerge]);

  // 检测配置冲突
  const detectConflicts = useCallback((importData: any): any[] => {
    const conflicts: any[] = [];

    // 检查slot冲突
    if (importData.slots || importData.config?.slots) {
      const importSlots = importData.slots || importData.config?.slots || [];
      const currentSlots = config.slots;

      importSlots.forEach((importSlot: SlotDefinition) => {
        const existingSlot = currentSlots.find(s => s.id === importSlot.id);
        if (existingSlot) {
          const hasChanges =
            existingSlot.name !== importSlot.name ||
            existingSlot.type !== importSlot.type ||
            existingSlot.required !== importSlot.required ||
            JSON.stringify(existingSlot.defaultValue) !== JSON.stringify(importSlot.defaultValue);

          if (hasChanges) {
            conflicts.push({
              type: 'slot',
              id: importSlot.id,
              field: 'definition',
              current: existingSlot,
              incoming: importSlot,
              message: `Slot "${importSlot.name}" 已存在但配置不同`
            });
          }
        }
      });
    }

    // 检查策略冲突
    if (importData.compressionStrategy || importData.config?.compressionStrategy) {
      const importStrategy = importData.compressionStrategy || importData.config?.compressionStrategy;
      if (JSON.stringify(config.compressionStrategy) !== JSON.stringify(importStrategy)) {
        conflicts.push({
          type: 'compression',
          field: 'strategy',
          current: config.compressionStrategy,
          incoming: importStrategy,
          message: '压缩策略配置不同'
        });
      }
    }

    if (importData.injectionStrategy || importData.config?.injectionStrategy) {
      const importStrategy = importData.injectionStrategy || importData.config?.injectionStrategy;
      if (JSON.stringify(config.injectionStrategy) !== JSON.stringify(importStrategy)) {
        conflicts.push({
          type: 'injection',
          field: 'strategy',
          current: config.injectionStrategy,
          incoming: importStrategy,
          message: '注入策略配置不同'
        });
      }
    }

    return conflicts;
  }, [config]);

  // 处理导入
  const handleImport = useCallback((mergeMode: 'replace' | 'merge' | 'keep') => {
    try {
      if (!importData) return;

      const data = JSON.parse(importData);

      if (mergeMode === 'replace') {
        // 完全替换
        importConfig(importData);
      } else if (mergeMode === 'merge' && allowMerge) {
        // 合并配置
        const mergedConfig: Partial<ConfigState> = {};

        // 合并slots
        if (data.slots || data.config?.slots) {
          const importSlots = data.slots || data.config?.slots || [];
          const currentSlots = [...config.slots];

          importSlots.forEach((importSlot: SlotDefinition) => {
            const existingIndex = currentSlots.findIndex(s => s.id === importSlot.id);
            if (existingIndex >= 0) {
              // 更新现有slot
              currentSlots[existingIndex] = importSlot;
            } else {
              // 添加新slot
              currentSlots.push(importSlot);
            }
          });

          mergedConfig.slots = currentSlots;
        }

        // 合并策略
        if (data.compressionStrategy || data.config?.compressionStrategy) {
          mergedConfig.compressionStrategy = data.compressionStrategy || data.config?.compressionStrategy;
        }

        if (data.injectionStrategy || data.config?.injectionStrategy) {
          mergedConfig.injectionStrategy = data.injectionStrategy || data.config?.injectionStrategy;
        }

        mergeConfig(mergedConfig);
      }
      // keep模式不导入冲突项

      setShowImportDialog(false);
      setShowMergeDialog(false);
      setImportData('');
      setImportPreview(null);
      setMergeConflicts([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('导入失败:', error);
      alert('导入失败，请检查文件格式');
    }
  }, [importData, config, allowMerge, importConfig, mergeConfig]);

  // 保存快照
  const handleSaveSnapshot = useCallback(() => {
    const name = prompt('请输入快照名称:');
    if (name) {
      const description = prompt('请输入快照描述（可选）:') || undefined;
      saveConfigSnapshot(name, description);
    }
  }, [saveConfigSnapshot]);

  // 渲染导出对话框
  const renderExportDialog = () => {
    if (!showExportDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">导出配置</h3>
            <button
              onClick={() => setShowExportDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 导出类型 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                导出内容
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'complete', label: '完整配置', icon: Package, desc: '包含所有配置信息' },
                  { value: 'slots', label: '仅Slot配置', icon: Settings, desc: '仅导出Slot定义和值' },
                  { value: 'compression', label: '仅压缩策略', icon: Zap, desc: '仅导出压缩策略配置' },
                  { value: 'injection', label: '仅注入策略', icon: Layers, desc: '仅导出注入策略配置' }
                ].map(({ value, label, icon: Icon, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      exportType === value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      value={value}
                      checked={exportType === value}
                      onChange={(e) => setExportType(e.target.value as any)}
                      className="mt-1"
                    />
                    <Icon className={`h-5 w-5 mt-0.5 ${exportType === value ? 'text-blue-600' : 'text-gray-500'}`} />
                    <div>
                      <div className={`font-medium ${exportType === value ? 'text-blue-900' : 'text-gray-900'}`}>
                        {label}
                      </div>
                      <div className="text-sm text-gray-600">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 导出选项 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                导出选项
              </label>
              <div className="space-y-2">
                {[
                  { key: 'includeMetadata', label: '包含元数据', desc: '导出时间、版本等信息' },
                  { key: 'includeValues', label: '包含当前值', desc: '包含Slot的当前值' },
                  ...(showHistory ? [{ key: 'includeHistory', label: '包含历史记录', desc: '包含配置历史快照' }] : []),
                  { key: 'includePresets', label: '包含预设', desc: '包含自定义策略预设' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={exportSettings[key as keyof typeof exportSettings]}
                      onChange={(e) => setExportSettings(prev => ({
                        ...prev,
                        [key]: e.target.checked
                      }))}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-xs text-gray-600">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* 预览 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700 mb-2">导出预览</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>导出类型: {
                  exportType === 'complete' ? '完整配置' :
                  exportType === 'slots' ? 'Slot配置' :
                  exportType === 'compression' ? '压缩策略' : '注入策略'
                }</div>
                <div>预计文件大小: ~{Math.round(JSON.stringify(config).length / 1024)}KB</div>
                <div>包含项目: {Object.values(exportSettings).filter(Boolean).length} 项</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              导出
            </button>
            <button
              onClick={() => setShowExportDialog(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染导入对话框
  const renderImportDialog = () => {
    if (!showImportDialog) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">导入配置</h3>
            <button
              onClick={() => setShowImportDialog(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* 文件选择 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择配置文件
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 导入预览 */}
            {importPreview && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">导入预览</h4>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {importPreview.metadata && (
                      <>
                        <div>
                          <span className="text-gray-600">版本:</span>
                          <span className="ml-1 font-medium">{importPreview.metadata.version}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">导出时间:</span>
                          <span className="ml-1 font-medium">
                            {new Date(importPreview.metadata.exportedAt).toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}
                    <div>
                      <span className="text-gray-600">包含内容:</span>
                      <div className="mt-1 space-x-2">
                        {importPreview.config && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">完整配置</span>}
                        {importPreview.slots && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Slots</span>}
                        {importPreview.compressionStrategy && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">压缩策略</span>}
                        {importPreview.injectionStrategy && <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">注入策略</span>}
                        {importPreview.presets && <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">预设</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 冲突检测 */}
                {mergeConflicts.length > 0 && allowMerge && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">
                        检测到 {mergeConflicts.length} 个配置冲突
                      </span>
                    </div>
                    <div className="space-y-2">
                      {mergeConflicts.slice(0, 3).map((conflict, index) => (
                        <div key={index} className="text-xs text-orange-800">
                          • {conflict.message}
                        </div>
                      ))}
                      {mergeConflicts.length > 3 && (
                        <div className="text-xs text-orange-600">
                          还有 {mergeConflicts.length - 3} 个冲突...
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {importPreview && (
            <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => handleImport('replace')}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                替换配置
              </button>

              {allowMerge && (
                <button
                  onClick={() => {
                    if (mergeConflicts.length > 0) {
                      setShowMergeDialog(true);
                    } else {
                      handleImport('merge');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  合并配置
                </button>
              )}

              <button
                onClick={() => setShowImportDialog(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 渲染历史记录
  const renderHistory = () => {
    if (!showHistory || configHistory.length === 0) return null;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">配置历史</h4>
        <div className="space-y-2 max-h-60 overflow-auto">
          {configHistory.map((snapshot) => (
            <div
              key={snapshot.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h5 className="font-medium text-gray-900">{snapshot.name}</h5>
                  {snapshot.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                {snapshot.description && (
                  <p className="text-sm text-gray-600 mt-1">{snapshot.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(snapshot.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => loadConfigSnapshot(snapshot.id)}
                  className="p-1 text-blue-600 hover:text-blue-700"
                  title="加载此配置"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteConfigSnapshot(snapshot.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                  title="删除快照"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 主要操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowExportDialog(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          导出配置
        </button>

        <button
          onClick={() => setShowImportDialog(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Upload className="h-4 w-4" />
          导入配置
        </button>

        <button
          onClick={handleSaveSnapshot}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Save className="h-4 w-4" />
          保存快照
        </button>
      </div>

      {/* 历史记录 */}
      {renderHistory()}

      {/* 对话框 */}
      {renderExportDialog()}
      {renderImportDialog()}
    </div>
  );
};

export default ConfigImportExport;