/**
 * Slot配置管理器组件
 * 独立的Slot管理，支持所有配置模式
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Plus,
  Settings,
  Copy,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Download,
  Upload,
  Layers,
  CheckCircle,
  AlertTriangle,
  Info,
  Filter,
  Search
} from 'lucide-react';
import { usePromptEngineeringStore } from '../../stores/promptEngineeringStore';
import { SlotManager } from '../SlotManager';
import type { SlotDefinition, ConfigMode } from '../../types';

export interface SlotConfigManagerProps {
  className?: string;
  showModeInfo?: boolean;
  allowTemplateImport?: boolean;
  compact?: boolean;
}

export const SlotConfigManager: React.FC<SlotConfigManagerProps> = ({
  className = '',
  showModeInfo = true,
  allowTemplateImport = true,
  compact = false
}) => {
  const {
    config,
    slots,
    selectedTemplate,
    templates,
    ui,
    addSlot,
    removeSlot,
    updateSlot,
    createConfigFromTemplate,
    separateFromTemplate
  } = usePromptEngineeringStore();

  const [showTemplateImport, setShowTemplateImport] = useState(false);
  const [showSlotLibrary, setShowSlotLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'required' | 'optional'>('all');

  const currentMode = ui.configMode;
  const isTemplateMode = currentMode === 'template-based';
  const canEdit = currentMode !== 'template-based' || config.source !== 'template';

  // 过滤后的slots
  const filteredSlots = useMemo(() => {
    let filtered = slots;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(slot =>
        slot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slot.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 类型过滤
    if (filterType !== 'all') {
      filtered = filtered.filter(slot =>
        filterType === 'required' ? slot.required : !slot.required
      );
    }

    return filtered;
  }, [slots, searchTerm, filterType]);

  // 常用Slot模板
  const slotTemplates = [
    {
      id: 'role',
      name: '角色',
      type: 'user' as const,
      description: '定义AI助手的角色身份',
      defaultValue: '专业助手',
      required: true
    },
    {
      id: 'context',
      name: '上下文',
      type: 'user' as const,
      description: '提供相关背景信息',
      defaultValue: '',
      required: false
    },
    {
      id: 'instructions',
      name: '指令',
      type: 'user' as const,
      description: '具体的任务指令',
      defaultValue: '',
      required: true
    },
    {
      id: 'format',
      name: '输出格式',
      type: 'user' as const,
      description: '期望的输出格式',
      defaultValue: '简洁明了的回答',
      required: false
    },
    {
      id: 'constraints',
      name: '约束条件',
      type: 'user' as const,
      description: '限制和注意事项',
      defaultValue: '',
      required: false
    }
  ];

  const handleImportFromTemplate = useCallback((templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template && canEdit) {
      // 如果当前是自定义模式，合并slots
      if (currentMode === 'custom') {
        template.slots.forEach(slot => {
          const exists = slots.find(s => s.id === slot.id);
          if (!exists) {
            addSlot(slot);
          }
        });
      } else {
        // 其他模式直接应用模板
        createConfigFromTemplate(templateId, 'copy');
      }
    }
    setShowTemplateImport(false);
  }, [templates, slots, currentMode, canEdit, addSlot, createConfigFromTemplate]);

  const handleAddSlotTemplate = useCallback((template: typeof slotTemplates[0]) => {
    if (canEdit) {
      const newSlot: SlotDefinition = {
        ...template,
        id: `${template.id}-${Date.now()}`,
        errorHandling: {
          strategy: 'fallback',
          fallbackValue: template.defaultValue
        }
      };
      addSlot(newSlot);
    }
    setShowSlotLibrary(false);
  }, [canEdit, addSlot]);

  const handleSeparateFromTemplate = useCallback(() => {
    if (window.confirm('确定要从模板分离吗？分离后将无法自动同步模板更新。')) {
      separateFromTemplate();
    }
  }, [separateFromTemplate]);

  const renderModeInfo = () => {
    if (!showModeInfo) return null;

    const getModeInfo = () => {
      switch (currentMode) {
        case 'template-based':
          return {
            icon: Layers,
            title: '模板模式',
            description: '当前配置基于模板，修改将自动同步',
            color: 'blue',
            actions: canEdit ? [
              { label: '从模板分离', action: handleSeparateFromTemplate }
            ] : []
          };
        case 'custom':
          return {
            icon: Settings,
            title: '自定义模式',
            description: '完全独立的配置，可自由添加和修改Slot',
            color: 'green',
            actions: allowTemplateImport ? [
              { label: '从模板导入', action: () => setShowTemplateImport(true) }
            ] : []
          };
        case 'mixed':
          return {
            icon: Copy,
            title: '混合模式',
            description: '基于模板但可独立修改，不受模板更新影响',
            color: 'purple',
            actions: []
          };
        default:
          return null;
      }
    };

    const modeInfo = getModeInfo();
    if (!modeInfo) return null;

    const Icon = modeInfo.icon;

    return (
      <div className={`p-4 border rounded-lg bg-${modeInfo.color}-50 border-${modeInfo.color}-200`}>
        <div className="flex items-start gap-3">
          <Icon className={`h-5 w-5 text-${modeInfo.color}-600 mt-0.5`} />
          <div className="flex-1">
            <h4 className={`font-medium text-${modeInfo.color}-900`}>
              {modeInfo.title}
            </h4>
            <p className={`text-sm text-${modeInfo.color}-700 mt-1`}>
              {modeInfo.description}
            </p>
            {modeInfo.actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {modeInfo.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className={`px-3 py-1 text-sm bg-${modeInfo.color}-100 text-${modeInfo.color}-700 rounded hover:bg-${modeInfo.color}-200 transition-colors`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderControls = () => {
    return (
      <div className="space-y-4">
        {/* 搜索和过滤 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索Slot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">全部</option>
            <option value="required">必填</option>
            <option value="optional">可选</option>
          </select>

          <button
            onClick={() => setShowSlotLibrary(true)}
            disabled={!canEdit}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="h-4 w-4" />
            {compact ? '添加' : '添加Slot'}
          </button>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>总计: {slots.length}</span>
          <span>必填: {slots.filter(s => s.required).length}</span>
          <span>可选: {slots.filter(s => !s.required).length}</span>
          {searchTerm || filterType !== 'all' ? (
            <span>已过滤: {filteredSlots.length}</span>
          ) : null}
        </div>
      </div>
    );
  };

  const renderTemplateImportDialog = () => {
    if (!showTemplateImport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">从模板导入Slot</h3>
            <button
              onClick={() => setShowTemplateImport(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {templates.map(template => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleImportFromTemplate(template.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{template.slots.length} 个Slot</span>
                      <span>{template.category}</span>
                    </div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSlotLibraryDialog = () => {
    if (!showSlotLibrary) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Slot模板库</h3>
            <button
              onClick={() => setShowSlotLibrary(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            {slotTemplates.map(template => (
              <div
                key={template.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddSlotTemplate(template)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {template.required && (
                      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                        必填
                      </span>
                    )}
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 模式信息 */}
      {renderModeInfo()}

      {/* 控制面板 */}
      {renderControls()}

      {/* Slot管理器 */}
      <div className="border border-gray-200 rounded-lg">
        <SlotManager
          onSlotChange={() => {}}
          showAddButton={false}
          allowReorder={canEdit}
          compact={compact}
        />
      </div>

      {/* 对话框 */}
      {renderTemplateImportDialog()}
      {renderSlotLibraryDialog()}
    </div>
  );
};

export default SlotConfigManager;