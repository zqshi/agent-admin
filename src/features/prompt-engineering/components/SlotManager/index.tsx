/**
 * Slot管理器组件
 * 提供Slot的增删改查、拖拽排序、配置管理等功能
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Copy,
  GripVertical,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Calculator,
  User,
  Globe,
  GitBranch,
  ChevronDown,
  ChevronRight,
  Info,
  Zap,
  Link
} from 'lucide-react';
import { useSlotManagement, useSlotTypeConfig } from '../../hooks/useSlotManagement';
import type { SlotDefinition } from '../../types';

export interface SlotManagerProps {
  onSlotChange?: (slots: SlotDefinition[]) => void;
  onSlotSelect?: (slot: SlotDefinition | null) => void;
  className?: string;
  showAddButton?: boolean;
  allowReorder?: boolean;
  compact?: boolean;
}

export const SlotManager: React.FC<SlotManagerProps> = ({
  onSlotChange,
  onSlotSelect,
  className = '',
  showAddButton = true,
  allowReorder = true,
  compact = false
}) => {
  const {
    slots,
    slotValues,
    slotErrors,
    addSlot,
    updateSlot,
    removeSlot,
    duplicateSlot,
    reorderSlots,
    updateSlotValue,
    validateSlot,
    getSlotDependencies,
    getDependentSlots,
    getSlotStats
  } = useSlotManagement();

  const { getTypeConfig, getTypeOptions } = useSlotTypeConfig();

  // 本地状态
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [draggedSlot, setDraggedSlot] = useState<string | null>(null);

  // 统计信息
  const stats = useMemo(() => getSlotStats(), [getSlotStats]);

  // 处理Slot选择
  const handleSlotSelect = useCallback((slot: SlotDefinition | null) => {
    setSelectedSlotId(slot?.id || null);
    onSlotSelect?.(slot);
  }, [onSlotSelect]);

  // 处理添加Slot
  const handleAddSlot = useCallback((slot: SlotDefinition) => {
    addSlot(slot);
    setShowAddForm(false);
    onSlotChange?.(slots);
  }, [addSlot, slots, onSlotChange]);

  // 处理更新Slot
  const handleUpdateSlot = useCallback((slotId: string, updates: Partial<SlotDefinition>) => {
    updateSlot(slotId, updates);
    onSlotChange?.(slots);
  }, [updateSlot, slots, onSlotChange]);

  // 处理删除Slot
  const handleRemoveSlot = useCallback((slotId: string) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    // 检查依赖关系
    const dependentSlots = getDependentSlots(slotId);
    if (dependentSlots.length > 0) {
      const confirm = window.confirm(
        `删除"${slot.name}"会影响${dependentSlots.length}个依赖的Slot，确定要删除吗？`
      );
      if (!confirm) return;
    }

    removeSlot(slotId);
    if (selectedSlotId === slotId) {
      setSelectedSlotId(null);
    }
    onSlotChange?.(slots);
  }, [slots, removeSlot, getDependentSlots, selectedSlotId, onSlotChange]);

  // 处理复制Slot
  const handleDuplicateSlot = useCallback((slotId: string) => {
    duplicateSlot(slotId);
    onSlotChange?.(slots);
  }, [duplicateSlot, slots, onSlotChange]);

  // 处理拖拽
  const handleDragStart = useCallback((slotId: string) => {
    setDraggedSlot(slotId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetSlotId: string) => {
    e.preventDefault();
    if (!draggedSlot || draggedSlot === targetSlotId) return;

    const currentOrder = slots.map(s => s.id);
    const draggedIndex = currentOrder.indexOf(draggedSlot);
    const targetIndex = currentOrder.indexOf(targetSlotId);

    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedSlot);

    reorderSlots(newOrder);
    setDraggedSlot(null);
    onSlotChange?.(slots);
  }, [draggedSlot, slots, reorderSlots, onSlotChange]);

  // 切换Slot展开状态
  const toggleSlotExpansion = useCallback((slotId: string) => {
    setExpandedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotId)) {
        newSet.delete(slotId);
      } else {
        newSet.add(slotId);
      }
      return newSet;
    });
  }, []);

  // 渲染统计信息
  const renderStats = () => {
    if (compact) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Slot统计</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">总数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.required}</div>
            <div className="text-xs text-gray-600">必填</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.withDefaults}</div>
            <div className="text-xs text-gray-600">有默认值</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.withDependencies}</div>
            <div className="text-xs text-gray-600">有依赖</div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染Slot列表
  const renderSlotList = () => {
    if (slots.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无Slot</h3>
          <p className="text-gray-600 mb-4">Slot是Prompt中的可变部分，添加Slot来让您的模板更加灵活</p>
          {showAddButton && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              添加第一个Slot
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <SlotItem
            key={slot.id}
            slot={slot}
            index={index}
            isSelected={selectedSlotId === slot.id}
            isExpanded={expandedSlots.has(slot.id)}
            value={slotValues[slot.id]}
            error={slotErrors[slot.id]}
            dependencies={getSlotDependencies(slot.id)}
            dependents={getDependentSlots(slot.id)}
            typeConfig={getTypeConfig(slot.type)}
            allowReorder={allowReorder}
            onSelect={handleSlotSelect}
            onUpdate={handleUpdateSlot}
            onRemove={handleRemoveSlot}
            onDuplicate={handleDuplicateSlot}
            onValueChange={updateSlotValue}
            onToggleExpansion={toggleSlotExpansion}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`slot-manager ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Slot管理器</h2>
          {!compact && (
            <p className="text-gray-600 mt-1">配置Prompt中的动态变量</p>
          )}
        </div>
        {showAddButton && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            添加Slot
          </button>
        )}
      </div>

      {renderStats()}

      {/* Slot列表 */}
      {renderSlotList()}

      {/* 添加Slot表单 */}
      {showAddForm && (
        <AddSlotForm
          onSubmit={handleAddSlot}
          onCancel={() => setShowAddForm(false)}
          existingSlotIds={slots.map(s => s.id)}
          typeOptions={getTypeOptions()}
        />
      )}
    </div>
  );
};

// Slot项组件
interface SlotItemProps {
  slot: SlotDefinition;
  index: number;
  isSelected: boolean;
  isExpanded: boolean;
  value: any;
  error?: string;
  dependencies: string[];
  dependents: string[];
  typeConfig: any;
  allowReorder: boolean;
  onSelect: (slot: SlotDefinition) => void;
  onUpdate: (slotId: string, updates: Partial<SlotDefinition>) => void;
  onRemove: (slotId: string) => void;
  onDuplicate: (slotId: string) => void;
  onValueChange: (slotId: string, value: any) => void;
  onToggleExpansion: (slotId: string) => void;
  onDragStart: (slotId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, slotId: string) => void;
}

const SlotItem: React.FC<SlotItemProps> = ({
  slot,
  index,
  isSelected,
  isExpanded,
  value,
  error,
  dependencies,
  dependents,
  typeConfig,
  allowReorder,
  onSelect,
  onUpdate,
  onRemove,
  onDuplicate,
  onValueChange,
  onToggleExpansion,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons = {
      user: User,
      system: Settings,
      api: Globe,
      computed: Calculator,
      conditional: GitBranch
    };
    const Icon = icons[type as keyof typeof icons] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusIcon = () => {
    if (error) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
    if (value !== undefined) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (slot.required) {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  return (
    <div
      className={`slot-item border rounded-lg transition-all ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
      } ${error ? 'border-red-300' : ''}`}
      draggable={allowReorder}
      onDragStart={() => onDragStart(slot.id)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, slot.id)}
    >
      {/* 头部 */}
      <div className="flex items-center gap-3 p-4">
        {allowReorder && (
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
        )}

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            typeConfig?.color === 'blue' ? 'bg-blue-100 text-blue-600' :
            typeConfig?.color === 'green' ? 'bg-green-100 text-green-600' :
            typeConfig?.color === 'purple' ? 'bg-purple-100 text-purple-600' :
            typeConfig?.color === 'orange' ? 'bg-orange-100 text-orange-600' :
            'bg-gray-100 text-gray-600'
          }`}
        >
          {getTypeIcon(slot.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {slot.name}
            </h4>
            <span className="text-xs text-gray-500">({slot.id})</span>
            {slot.required && (
              <span className="text-xs text-red-500">*</span>
            )}
            {getStatusIcon()}
          </div>
          <p className="text-xs text-gray-600 truncate">{slot.description || typeConfig?.description}</p>
        </div>

        <div className="flex items-center gap-1">
          {dependencies.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Link className="h-3 w-3 mr-1" />
              {dependencies.length}
            </div>
          )}

          <button
            onClick={() => onToggleExpansion(slot.id)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-400 hover:text-blue-600 rounded"
          >
            <Edit3 className="h-4 w-4" />
          </button>

          <button
            onClick={() => onDuplicate(slot.id)}
            className="p-1 text-gray-400 hover:text-green-600 rounded"
          >
            <Copy className="h-4 w-4" />
          </button>

          <button
            onClick={() => onRemove(slot.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {/* 展开内容 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <SlotValueEditor
            slot={slot}
            value={value}
            error={error}
            onChange={(newValue) => onValueChange(slot.id, newValue)}
          />

          {/* 依赖关系 */}
          {(dependencies.length > 0 || dependents.length > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="text-sm font-medium text-gray-900 mb-2">依赖关系</h5>
              {dependencies.length > 0 && (
                <div className="mb-2">
                  <span className="text-xs text-gray-600">依赖于: </span>
                  {dependencies.map(dep => (
                    <span key={dep} className="inline-block text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1">
                      {dep}
                    </span>
                  ))}
                </div>
              )}
              {dependents.length > 0 && (
                <div>
                  <span className="text-xs text-gray-600">被依赖: </span>
                  {dependents.map(dep => (
                    <span key={dep} className="inline-block text-xs bg-green-100 text-green-800 px-2 py-1 rounded mr-1">
                      {dep}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 编辑表单 */}
      {isEditing && (
        <EditSlotForm
          slot={slot}
          onSave={(updates) => {
            onUpdate(slot.id, updates);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  );
};

// Slot值编辑器
interface SlotValueEditorProps {
  slot: SlotDefinition;
  value: any;
  error?: string;
  onChange: (value: any) => void;
}

const SlotValueEditor: React.FC<SlotValueEditorProps> = ({
  slot,
  value,
  error,
  onChange
}) => {
  const renderEditor = () => {
    switch (slot.type) {
      case 'user':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={slot.defaultValue || `请输入${slot.name}`}
            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'system':
        return (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            系统值: {value || slot.defaultValue || '自动获取'}
          </div>
        );

      case 'api':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">API数据源配置</div>
            <div className="bg-gray-50 p-2 rounded text-xs font-mono">
              {slot.dataSource?.endpoint || '未配置'}
            </div>
          </div>
        );

      case 'computed':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">计算表达式</div>
            <div className="bg-gray-50 p-2 rounded text-xs font-mono">
              {slot.dataSource?.config?.expression || '未配置'}
            </div>
          </div>
        );

      case 'conditional':
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">条件配置</div>
            <div className="bg-gray-50 p-2 rounded text-xs">
              {slot.dataSource?.config?.conditions?.length || 0} 个条件
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500">
            暂不支持此类型的编辑
          </div>
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {slot.name}值
        {slot.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderEditor()}
      {slot.defaultValue && (
        <div className="text-xs text-gray-500">
          默认值: {slot.defaultValue}
        </div>
      )}
    </div>
  );
};

// 添加Slot表单（简化版本）
interface AddSlotFormProps {
  onSubmit: (slot: SlotDefinition) => void;
  onCancel: () => void;
  existingSlotIds: string[];
  typeOptions: any[];
}

const AddSlotForm: React.FC<AddSlotFormProps> = ({
  onSubmit,
  onCancel,
  existingSlotIds,
  typeOptions
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: 'user' as SlotDefinition['type'],
    description: '',
    required: false,
    defaultValue: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newSlot: SlotDefinition = {
      id: formData.id,
      name: formData.name,
      type: formData.type,
      description: formData.description,
      required: formData.required,
      defaultValue: formData.defaultValue || undefined,
      errorHandling: {
        strategy: 'fallback',
        fallbackValue: formData.defaultValue || ''
      }
    };

    onSubmit(newSlot);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">添加新Slot</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={formData.id}
              onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="例: user_name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="例: 用户姓名"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="描述这个Slot的用途..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">默认值</label>
            <input
              type="text"
              value={formData.defaultValue}
              onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              placeholder="可选的默认值"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">必填</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              添加
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 编辑Slot表单（简化版本）
interface EditSlotFormProps {
  slot: SlotDefinition;
  onSave: (updates: Partial<SlotDefinition>) => void;
  onCancel: () => void;
}

const EditSlotForm: React.FC<EditSlotFormProps> = ({
  slot,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: slot.name,
    description: slot.description || '',
    required: slot.required,
    defaultValue: slot.defaultValue || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      required: formData.required,
      defaultValue: formData.defaultValue || undefined
    });
  };

  return (
    <div className="border-t border-gray-200 p-4 bg-gray-50">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">默认值</label>
          <input
            type="text"
            value={formData.defaultValue}
            onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">必填</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default SlotManager;