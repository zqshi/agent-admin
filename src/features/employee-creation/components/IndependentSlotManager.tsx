/**
 * 独立Slot管理器
 * 支持无模板依赖的slot配置
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Settings, Import, Download, Clock, Shield, Users, Database } from 'lucide-react';
import type { SlotDefinition } from '../../prompt-engineering/types';
import type { EnhancedSlotDefinition } from '../types';

interface IndependentSlotManagerProps {
  slots: EnhancedSlotDefinition[];
  onSlotsChange: (slots: EnhancedSlotDefinition[]) => void;
  disabled?: boolean;
  className?: string;
  // 新增属性
  showAdvancedFields?: boolean;
  showRegistryControls?: boolean;
  onRegisterSlot?: (slot: EnhancedSlotDefinition) => Promise<boolean>;
  onUnregisterSlot?: (slotId: string) => Promise<boolean>;
}

const IndependentSlotManager: React.FC<IndependentSlotManagerProps> = ({
  slots,
  onSlotsChange,
  disabled = false,
  className = '',
  showAdvancedFields = true,
  showRegistryControls = false,
  onRegisterSlot,
  onUnregisterSlot
}) => {
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  // 预设slot模板
  const slotPresets = [
    {
      id: 'user_name',
      name: '用户姓名',
      description: '用户的姓名或称呼',
      type: 'user' as const,
      required: true,
      defaultValue: '{{user_name}}',
      validation: [],
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      }
    },
    {
      id: 'context',
      name: '上下文信息',
      description: '对话的背景上下文',
      type: 'user' as const,
      required: false,
      defaultValue: '{{context}}',
      validation: [],
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      }
    },
    {
      id: 'task_type',
      name: '任务类型',
      description: '当前处理的任务类型',
      type: 'user' as const,
      required: true,
      defaultValue: '{{task_type}}',
      options: ['咨询', '投诉', '建议', '其他'],
      validation: [],
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      }
    },
    {
      id: 'urgency_level',
      name: '紧急程度',
      description: '任务的紧急程度',
      type: 'user' as const,
      required: false,
      defaultValue: '{{urgency_level}}',
      options: ['低', '中', '高', '紧急'],
      validation: [],
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      }
    }
  ];

  const createNewSlot = () => {
    const now = new Date().toISOString();
    const newSlot: EnhancedSlotDefinition = {
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '新建Slot',
      description: '',
      role: 'user',
      type: 'text',
      required: false,
      defaultValue: '',

      // 新增的增强字段
      immutable: false,
      ephemeral: false,
      updatedAt: now,
      origin: 'custom',

      // 错误处理配置
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      },

      // 可选的高级配置
      validation: {
        rules: []
      },

      audit: {
        createdBy: 'user',
        lastModifiedBy: 'user',
        changeLog: [{
          id: `change_${Date.now()}`,
          timestamp: now,
          action: 'create',
          operator: 'user',
          reason: 'Manual creation'
        }]
      }
    };

    onSlotsChange([...slots, newSlot]);
    setEditingSlot(newSlot.id);
  };

  const updateSlot = (slotId: string, updates: Partial<EnhancedSlotDefinition>) => {
    const updatedSlots = slots.map(slot => {
      if (slot.id === slotId) {
        const updatedSlot = {
          ...slot,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        // 更新审计日志
        if (updatedSlot.audit) {
          updatedSlot.audit = {
            ...updatedSlot.audit,
            lastModifiedBy: 'user',
            changeLog: [
              ...updatedSlot.audit.changeLog,
              {
                id: `change_${Date.now()}`,
                timestamp: new Date().toISOString(),
                action: 'update',
                operator: 'user',
                reason: 'Manual update',
                oldValue: slot,
                newValue: updates
              }
            ]
          };
        }

        return updatedSlot;
      }
      return slot;
    });
    onSlotsChange(updatedSlots);
  };

  const deleteSlot = (slotId: string) => {
    onSlotsChange(slots.filter(slot => slot.id !== slotId));
  };

  const addPresetSlot = (preset: typeof slotPresets[0]) => {
    const now = new Date().toISOString();
    const newSlot: EnhancedSlotDefinition = {
      ...preset,
      id: `${preset.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      // 增强字段
      role: 'user',
      immutable: false,
      ephemeral: false,
      updatedAt: now,
      origin: 'preset',
      dependencies: [],
      metadata: {},

      // 审计信息
      audit: {
        createdBy: 'user',
        lastModifiedBy: 'user',
        changeLog: [{
          id: `change_${Date.now()}`,
          timestamp: now,
          action: 'create',
          operator: 'user',
          reason: 'Added from preset'
        }]
      }
    };
    onSlotsChange([...slots, newSlot]);
    setShowPresets(false);
  };

  const exportSlots = () => {
    const dataStr = JSON.stringify(slots, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'slot-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSlots = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSlots = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedSlots)) {
          onSlotsChange([...slots, ...importedSlots]);
        }
      } catch (error) {
        alert('文件格式错误，请选择有效的JSON文件');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Slot配置</h3>
          <p className="text-sm text-gray-600">
            定义可在Prompt中使用的动态变量
            {slots.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({slots.length} 个Slot)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* 高级功能切换 */}
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showAdvancedFields}
              onChange={(e) => {
                // 这里需要父组件传递setState函数，或者通过回调通知
                console.log('Toggle advanced fields:', e.target.checked);
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">增强模式</span>
          </label>

          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Settings className="h-4 w-4 mr-1" />
            预设
          </button>

          <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
            <Import className="h-4 w-4 mr-1" />
            导入
            <input
              type="file"
              accept=".json"
              onChange={importSlots}
              className="sr-only"
              disabled={disabled}
            />
          </label>

          <button
            type="button"
            onClick={exportSlots}
            disabled={disabled || slots.length === 0}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4 mr-1" />
            导出
          </button>

          {/* 注册表功能 */}
          {showRegistryControls && (
            <button
              type="button"
              onClick={() => {
                // 批量注册所有Slots到注册表
                slots.forEach(async (slot) => {
                  if (onRegisterSlot) {
                    await onRegisterSlot(slot);
                  }
                });
              }}
              disabled={disabled || slots.length === 0}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Database className="h-4 w-4 mr-1" />
              批量注册 ({slots.length})
            </button>
          )}

          <button
            type="button"
            onClick={createNewSlot}
            disabled={disabled}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            新建Slot
          </button>
        </div>
      </div>

      {/* 统计信息和快速操作 */}
      {slots.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{slots.length}</div>
              <div className="text-gray-600">总数</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {slots.filter(s => s.required).length}
              </div>
              <div className="text-gray-600">必填</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600">
                {slots.filter(s => s.immutable).length}
              </div>
              <div className="text-gray-600">不可变</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {slots.filter(s => s.ephemeral).length}
              </div>
              <div className="text-gray-600">临时</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {slots.filter(s => s.dependencies && s.dependencies.length > 0).length}
              </div>
              <div className="text-gray-600">有依赖</div>
            </div>
          </div>

          {/* 快速筛选按钮 */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
              显示必填 ({slots.filter(s => s.required).length})
            </button>
            <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
              显示不可变 ({slots.filter(s => s.immutable).length})
            </button>
            <button className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">
              显示临时 ({slots.filter(s => s.ephemeral).length})
            </button>
            <button className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
              显示有依赖 ({slots.filter(s => s.dependencies && s.dependencies.length > 0).length})
            </button>
          </div>
        </div>
      )}

      {/* 预设面板 */}
      {showPresets && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">选择预设Slot</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {slotPresets.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPresetSlot(preset)}
                disabled={disabled}
                className="text-left p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-white transition-colors disabled:opacity-50"
              >
                <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                <div className="text-xs text-gray-600 mt-1">{preset.description}</div>
                <div className="text-xs text-blue-600 mt-1">类型: {preset.type}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Slot列表 */}
      <div className="space-y-4">
        {slots.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">暂无Slot配置</h4>
            <p className="text-gray-600 mb-4">添加Slot变量来定制您的Prompt</p>
            <button
              type="button"
              onClick={createNewSlot}
              disabled={disabled}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              创建第一个Slot
            </button>
          </div>
        ) : (
          slots.map(slot => (
            <SlotEditor
              key={slot.id}
              slot={slot}
              isEditing={editingSlot === slot.id}
              onEdit={() => setEditingSlot(slot.id)}
              onSave={() => setEditingSlot(null)}
              onCancel={() => setEditingSlot(null)}
              onUpdate={(updates) => updateSlot(slot.id, updates)}
              onDelete={() => deleteSlot(slot.id)}
              disabled={disabled}
              showAdvancedFields={showAdvancedFields}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Slot编辑器子组件
interface SlotEditorProps {
  slot: EnhancedSlotDefinition;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<EnhancedSlotDefinition>) => void;
  onDelete: () => void;
  disabled: boolean;
  showAdvancedFields?: boolean;
}

const SlotEditor: React.FC<SlotEditorProps> = ({
  slot,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
  onDelete,
  disabled,
  showAdvancedFields = true
}) => {
  if (isEditing) {
    return (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="space-y-6">
          {/* 基本信息 */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">基本信息</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slot名称 *
                </label>
                <input
                  type="text"
                  value={slot.name}
                  onChange={(e) => onUpdate({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="输入Slot名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  数据类型
                </label>
                <select
                  value={slot.type}
                  onChange={(e) => onUpdate({ type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="text">文本</option>
                  <option value="number">数字</option>
                  <option value="enum">枚举</option>
                  <option value="boolean">布尔值</option>
                  <option value="array">数组</option>
                  <option value="object">对象</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                描述
              </label>
              <textarea
                value={slot.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="描述这个Slot的作用和用途"
              />
            </div>
          </div>

          {/* 增强字段 */}
          {showAdvancedFields && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">增强配置</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色
                  </label>
                  <select
                    value={slot.role}
                    onChange={(e) => onUpdate({ role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="system">系统</option>
                    <option value="user">用户</option>
                    <option value="context">上下文</option>
                    <option value="dynamic">动态</option>
                    <option value="computed">计算</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    来源
                  </label>
                  <select
                    value={slot.origin}
                    onChange={(e) => onUpdate({ origin: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="preset">预设</option>
                    <option value="custom">自定义</option>
                    <option value="runtime">运行时</option>
                    <option value="api">API</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    默认值
                  </label>
                  <input
                    type="text"
                    value={slot.defaultValue || ''}
                    onChange={(e) => onUpdate({ defaultValue: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="默认值"
                  />
                </div>

                <div className="flex items-center space-x-6 pt-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slot.required}
                      onChange={(e) => onUpdate({ required: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">必填</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slot.immutable || false}
                      onChange={(e) => onUpdate({ immutable: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">不可变</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={slot.ephemeral || false}
                      onChange={(e) => onUpdate({ ephemeral: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">临时</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 依赖关系 */}
          {showAdvancedFields && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">依赖关系</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  依赖的Slots（以逗号分隔）
                </label>
                <input
                  type="text"
                  value={slot.dependencies?.join(', ') || ''}
                  onChange={(e) => onUpdate({
                    dependencies: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="例：user_name, context"
                />
              </div>
            </div>
          )}

          {/* 验证规则 */}
          {showAdvancedFields && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">验证规则</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最小长度
                  </label>
                  <input
                    type="number"
                    value={slot.validation?.rules?.find(v => v.type === 'minLength')?.value || ''}
                    onChange={(e) => {
                      const rules = slot.validation?.rules || [];
                      const newRules = rules.filter(v => v.type !== 'minLength');
                      if (e.target.value) {
                        newRules.push({ type: 'minLength', value: parseInt(e.target.value) });
                      }
                      onUpdate({ validation: { ...slot.validation, rules: newRules } });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="最小字符数"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大长度
                  </label>
                  <input
                    type="number"
                    value={slot.validation?.rules?.find(v => v.type === 'maxLength')?.value || ''}
                    onChange={(e) => {
                      const rules = slot.validation?.rules || [];
                      const newRules = rules.filter(v => v.type !== 'maxLength');
                      if (e.target.value) {
                        newRules.push({ type: 'maxLength', value: parseInt(e.target.value) });
                      }
                      onUpdate({ validation: { ...slot.validation, rules: newRules } });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="最大字符数"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  正则表达式
                </label>
                <input
                  type="text"
                  value={slot.validation?.rules?.find(v => v.type === 'pattern')?.pattern || ''}
                  onChange={(e) => {
                    const rules = slot.validation || [];
                    const newRules = rules.filter(v => v.type !== 'pattern');
                    if (e.target.value) {
                      newRules.push({ type: 'pattern', pattern: e.target.value });
                    }
                    onUpdate({ validation: newRules });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="例：^[a-zA-Z0-9]+$"
                />
              </div>
            </div>
          )}

          {/* 错误处理 */}
          {showAdvancedFields && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">错误处理</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    处理策略
                  </label>
                  <select
                    value={slot.errorHandling?.strategy || 'fallback'}
                    onChange={(e) => onUpdate({
                      errorHandling: {
                        ...slot.errorHandling,
                        strategy: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="fallback">回退</option>
                    <option value="error">抛出错误</option>
                    <option value="ignore">忽略</option>
                    <option value="retry">重试</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    回退值
                  </label>
                  <input
                    type="text"
                    value={slot.errorHandling?.fallbackValue || ''}
                    onChange={(e) => onUpdate({
                      errorHandling: {
                        ...slot.errorHandling,
                        fallbackValue: e.target.value
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="错误时使用的值"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="button"
              onClick={onSave}
              className="px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="text-sm font-medium text-gray-900">{slot.name}</h4>

            {/* 数据类型标签 */}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {slot.type}
            </span>

            {/* 角色标签 */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              slot.role === 'system' ? 'bg-blue-100 text-blue-800' :
              slot.role === 'user' ? 'bg-green-100 text-green-800' :
              slot.role === 'context' ? 'bg-yellow-100 text-yellow-800' :
              slot.role === 'dynamic' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <Users className="h-3 w-3 mr-1" />
              {slot.role}
            </span>

            {/* 来源标签 */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
              slot.origin === 'preset' ? 'bg-gray-100 text-gray-800' :
              slot.origin === 'custom' ? 'bg-blue-100 text-blue-800' :
              slot.origin === 'runtime' ? 'bg-orange-100 text-orange-800' :
              'bg-green-100 text-green-800'
            }`}>
              <Database className="h-3 w-3 mr-1" />
              {slot.origin}
            </span>

            {/* 属性标签 */}
            {slot.required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                必填
              </span>
            )}

            {slot.immutable && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                <Shield className="h-3 w-3 mr-1" />
                不可变
              </span>
            )}

            {slot.ephemeral && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                临时
              </span>
            )}
          </div>

          {slot.description && (
            <p className="text-sm text-gray-600 mb-2">{slot.description}</p>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
            {slot.defaultValue && (
              <div>
                <span className="font-medium">默认值: </span>
                <span>{slot.defaultValue}</span>
              </div>
            )}

            {slot.dependencies && slot.dependencies.length > 0 && (
              <div>
                <span className="font-medium">依赖: </span>
                <span>{slot.dependencies.length}个</span>
              </div>
            )}

            {slot.validation && slot.validation.length > 0 && (
              <div>
                <span className="font-medium">验证规则: </span>
                <span>{slot.validation.length}个</span>
              </div>
            )}

            <div>
              <span className="font-medium">更新时间: </span>
              <span>{new Date(slot.updatedAt).toLocaleDateString('zh-CN')}</span>
            </div>
          </div>

          {/* 依赖关系显示 */}
          {slot.dependencies && slot.dependencies.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 font-medium">依赖Slots: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {slot.dependencies.map(dep => (
                  <span key={dep} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    {dep}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 验证规则显示 */}
          {slot.validation && slot.validation.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500 font-medium">验证规则: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {slot.validation.map((rule, index) => (
                  <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-600">
                    {rule.type}: {rule.pattern || rule.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="编辑"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled || slot.immutable}
            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
            title={slot.immutable ? "不可变Slot无法删除" : "删除"}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndependentSlotManager;