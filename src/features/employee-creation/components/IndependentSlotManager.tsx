/**
 * 独立Slot管理器
 * 支持无模板依赖的slot配置
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Settings, Import, Download } from 'lucide-react';
import type { SlotDefinition } from '../../prompt-engineering/types';

interface IndependentSlotManagerProps {
  slots: SlotDefinition[];
  onSlotsChange: (slots: SlotDefinition[]) => void;
  disabled?: boolean;
  className?: string;
}

const IndependentSlotManager: React.FC<IndependentSlotManagerProps> = ({
  slots,
  onSlotsChange,
  disabled = false,
  className = ''
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
    const newSlot: SlotDefinition = {
      id: `slot_${Date.now()}`,
      name: '新建Slot',
      description: '',
      type: 'user',
      required: false,
      defaultValue: '',
      validation: [],
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: ''
      }
    };

    onSlotsChange([...slots, newSlot]);
    setEditingSlot(newSlot.id);
  };

  const updateSlot = (slotId: string, updates: Partial<SlotDefinition>) => {
    const updatedSlots = slots.map(slot =>
      slot.id === slotId ? { ...slot, ...updates } : slot
    );
    onSlotsChange(updatedSlots);
  };

  const deleteSlot = (slotId: string) => {
    onSlotsChange(slots.filter(slot => slot.id !== slotId));
  };

  const addPresetSlot = (preset: typeof slotPresets[0]) => {
    const newSlot: SlotDefinition = {
      ...preset,
      id: `${preset.id}_${Date.now()}`
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
          <p className="text-sm text-gray-600">定义可在Prompt中使用的动态变量</p>
        </div>

        <div className="flex items-center space-x-2">
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
            />
          ))
        )}
      </div>
    </div>
  );
};

// Slot编辑器子组件
interface SlotEditorProps {
  slot: SlotDefinition;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onUpdate: (updates: Partial<SlotDefinition>) => void;
  onDelete: () => void;
  disabled: boolean;
}

const SlotEditor: React.FC<SlotEditorProps> = ({
  slot,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onUpdate,
  onDelete,
  disabled
}) => {
  if (isEditing) {
    return (
      <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slot名称
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
                类型
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
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={slot.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="描述这个Slot的作用"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex items-center space-x-4 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={slot.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">必填</span>
              </label>
            </div>
          </div>

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
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h4 className="text-sm font-medium text-gray-900">{slot.name}</h4>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {slot.type}
            </span>
            {slot.required && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                必填
              </span>
            )}
          </div>
          {slot.description && (
            <p className="text-sm text-gray-600 mt-1">{slot.description}</p>
          )}
          {slot.defaultValue && (
            <p className="text-xs text-gray-500 mt-1">默认值: {slot.defaultValue}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IndependentSlotManager;