/**
 * Prompt配置组件 - 完整实现版本
 */

import React, { useState } from 'react';
import {
  Settings,
  Database,
  Zap,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Eye,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  FileText,
  Info
} from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import ConfigModeSelector, { type ConfigMode } from '../../ConfigModeSelector';
import IndependentSlotManager from '../../IndependentSlotManager';
import type { SlotConfig, PersonalityTraits } from '../../../types';
import type { SlotDefinition } from '../../../../prompt-engineering/types';

// 使用Store中定义的类型，匹配store的promptTemplates定义

// 模板类型定义 - 匹配store定义
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  content: string;
  slots: Array<{
    id: string;
    name: string;
    description: string;
    type: 'text' | 'number' | 'date' | 'select' | 'multiselect';
    required: boolean;
    defaultValue?: string;
    options?: string[];
    placeholder?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  isBuiltIn: boolean;
}

// Slot类型定义，直接使用PromptTemplate中的定义
type SlotType = PromptTemplate['slots'][0];

// 压缩策略类型
interface CompressionStrategy {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  algorithm: 'truncate' | 'summary' | 'semantic';
  preserveStructure: boolean;
}

const PromptConfig: React.FC = () => {
  const {
    advancedConfig,
    updateAdvancedConfig,
    getPromptTemplates,
    addPromptTemplate,
    updatePromptTemplate,
    deletePromptTemplate,
    importPromptTemplates,
    incrementTemplateUsage
  } = useCreationStore();
  const [activeTab, setActiveTab] = useState<'templates' | 'slots' | 'compression'>('templates');
  const [slotValues, setSlotValues] = useState<Record<string, any>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 新增配置模式状态
  const [configMode, setConfigMode] = useState<ConfigMode>('template');
  const [independentSlots, setIndependentSlots] = useState<SlotDefinition[]>([]);

  // 获取模板数据
  const templates = getPromptTemplates();

  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // 压缩策略
  const [compressionStrategies] = useState<CompressionStrategy[]>([
    {
      id: '1',
      name: '智能截断',
      description: '保留最重要的信息，截断多余内容',
      maxTokens: 2000,
      algorithm: 'truncate',
      preserveStructure: true
    },
    {
      id: '2',
      name: '语义摘要',
      description: '使用AI生成内容摘要',
      maxTokens: 1500,
      algorithm: 'summary',
      preserveStructure: false
    },
    {
      id: '3',
      name: '语义压缩',
      description: '保持语义完整的前提下压缩内容',
      maxTokens: 1800,
      algorithm: 'semantic',
      preserveStructure: true
    }
  ]);

  // 处理模板选择
  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
  };

  // 应用模板
  const handleApplyTemplate = (template: PromptTemplate) => {
    // 更新advancedConfig中的prompt配置
    updateAdvancedConfig({
      prompt: {
        templates: [{
          id: template.id,
          name: template.name,
          category: template.category,
          basePrompt: template.content,
          variables: template.slots.map(slot => ({
            name: slot.name,
            type: 'string',
            description: (slot as any).description || '',
            required: slot.required,
            defaultValue: slot.defaultValue
          }))
        }],
        slots: template.slots.map(slot => ({
          name: slot.name,
          source: 'user' as const,
          injectionTiming: 'onStart' as const,
          injectionOrder: 1,
          required: slot.required,
          defaultValue: slot.defaultValue
        })),
        compression: {
          enabled: false,
          trigger: 'tokenLimit',
          threshold: 4000,
          strategy: 'summary',
          preserveKeys: []
        },
        errorHandling: {
          onSlotMissing: 'useDefault',
          onCompressionFail: 'fallback'
        }
      }
    });

    // 初始化slot值
    const initialSlotValues: Record<string, any> = {};
    template.slots.forEach(slot => {
      initialSlotValues[slot.name] = slot.defaultValue || '';
    });
    setSlotValues(initialSlotValues);

    // 增加模板使用计数
    incrementTemplateUsage(template.id);

    // 如果模板有预设的slot值，可以自动填充到基础信息或核心特征中
    // 这里可以根据模板类型和slot名称智能映射到相应的字段
    const { updateBasicInfo, updateCoreFeatures } = useCreationStore.getState();

    // 尝试从模板内容中提取角色信息
    if (template.category === '客服') {
      updateCoreFeatures({
        personality: {
          friendliness: template.content.includes('耐心') ? 8 : 7,
          professionalism: 8,
          patience: template.content.includes('耐心') ? 9 : 7,
          empathy: 8
        }
      });
    } else if (template.category === '技术') {
      updateCoreFeatures({
        personality: {
          friendliness: 6,
          professionalism: 9,
          patience: 7,
          empathy: 6
        }
      });
    }

    // 显示应用成功提示
    setShowSuccessMessage(`已成功应用模板：${template.name}`);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // 模板预览（使用当前slot值）
  const renderTemplatePreview = (template: PromptTemplate) => {
    let preview = template.content;
    template.slots.forEach(slot => {
      const value = slotValues[slot.name] || slot.defaultValue || `{${slot.name}}`;
      preview = preview.replace(new RegExp(`{{${slot.name}}}`, 'g'), value);
    });
    return preview;
  };

  // 更新slot值
  const updateSlotValue = (slotName: string, value: any) => {
    setSlotValues(prev => ({
      ...prev,
      [slotName]: value
    }));

    // 同时更新到advancedConfig中 - 通过模板变量更新
    if (advancedConfig?.prompt?.templates?.[0]) {
      const updatedVariables = advancedConfig.prompt.templates[0].variables.map(variable =>
        variable.name === slotName
          ? { ...variable, defaultValue: value }
          : variable
      );
      updateAdvancedConfig({
        prompt: {
          ...advancedConfig.prompt,
          templates: [{
            ...advancedConfig.prompt.templates[0],
            variables: updatedVariables
          }]
        }
      });
    }
  };

  // 保存Slot配置
  const handleSaveSlotConfig = async () => {
    setIsSaving(true);
    try {
      // 模拟保存过程
      await new Promise(resolve => setTimeout(resolve, 500));

      setShowSuccessMessage('配置已保存成功！');
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'templates', label: '模板管理', icon: Database },
    { id: 'slots', label: 'Slot配置', icon: Zap },
    { id: 'compression', label: '压缩策略', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* 成功消息提示 */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{showSuccessMessage}</span>
        </div>
      )}
      {/* Tab导航 */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 模板管理 */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          {/* 头部操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Prompt模板库</h4>
              <p className="text-sm text-gray-600">选择或创建适合的Prompt模板</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" />
                导入模板
              </button>
              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                新建模板
              </button>
            </div>
          </div>

          {/* 模板网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedTemplate?.id === template.id
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{template.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {template.category}
                      </span>
                      {template.isBuiltIn && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          内置
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // 预览模板
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                      title="预览"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {!template.isBuiltIn && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTemplate(template);
                          setIsTemplateModalOpen(true);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  使用次数: {template.usageCount} • Slot数量: {template.slots.length}
                </div>

                {selectedTemplate?.id === template.id && (
                  <div className="border-t pt-3 mt-3">
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      应用此模板
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 模板预览 */}
          {selectedTemplate && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h5 className="font-medium text-gray-900 mb-3">模板预览</h5>
              <div className="bg-white border rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {renderTemplatePreview(selectedTemplate)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot配置 */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          {/* 配置模式选择器 */}
          <ConfigModeSelector
            mode={configMode}
            onModeChange={setConfigMode}
            className="mb-6"
          />

          {/* 根据配置模式显示不同内容 */}
          {configMode === 'template' && (
            <>
              {selectedTemplate ? (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">基于模板的Slot配置</h4>
                    <p className="text-sm text-gray-600">
                      当前模板：{selectedTemplate.name} - 配置模板中的动态变量
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">当前模板：{selectedTemplate.name}</h5>
                      <p className="text-sm text-blue-700">
                        此模板包含 {selectedTemplate.slots.length} 个Slot变量
                      </p>
                    </div>

                    {selectedTemplate.slots.map((slot, index) => (
                      <div key={slot.id || slot.name || index} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">{slot.name}</span>
                              {slot.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  必填
                                </span>
                              )}
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {slot.type || 'text'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{slot.description || ''}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              当前值
                            </label>
                            {slot.type === 'select' ? (
                              <select
                                value={slotValues[slot.name] || slot.defaultValue || ''}
                                onChange={(e) => updateSlotValue(slot.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              >
                                {slot.options?.map((option: string) => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                placeholder={slot.placeholder}
                                value={slotValues[slot.name] || slot.defaultValue || ''}
                                onChange={(e) => updateSlotValue(slot.name, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                              />
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              预览效果
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                              {slotValues[slot.name] || slot.defaultValue || slot.placeholder || `{${slot.name}}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveSlotConfig}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? '保存中...' : '保存配置'}
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                        <Eye className="h-4 w-4" />
                        预览效果
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <Zap className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h5 className="text-lg font-medium text-gray-900 mb-2">请先选择模板</h5>
                  <p className="text-gray-600 mb-4">
                    在"模板管理"页面选择一个模板后，即可配置其中的Slot变量
                  </p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    选择模板
                  </button>
                </div>
              )}
            </>
          )}

          {/* 自定义模式 */}
          {configMode === 'custom' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">自定义Slot配置</h4>
                <p className="text-sm text-gray-600">
                  完全自定义配置，不依赖任何模板
                </p>
              </div>

              <IndependentSlotManager
                slots={independentSlots}
                onSlotsChange={setIndependentSlots}
              />
            </div>
          )}

          {/* 混合模式 */}
          {configMode === 'hybrid' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">混合模式配置</h4>
                <p className="text-sm text-gray-600">
                  基于模板但允许自由修改和扩展
                </p>
              </div>

              {selectedTemplate && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      当前基础模板: {selectedTemplate.name}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    您可以在此基础上自由添加、修改或删除Slot配置
                  </p>
                </div>
              )}

              <IndependentSlotManager
                slots={selectedTemplate
                  ? [...selectedTemplate.slots.map(slot => ({
                      id: slot.name,
                      name: slot.name,
                      description: (slot as any).description || '',
                      type: slot.type as any,
                      required: slot.required,
                      defaultValue: slot.defaultValue || '',
                      validation: [],
                      errorHandling: {
                        strategy: 'fallback' as const,
                        fallbackValue: ''
                      }
                    })), ...independentSlots]
                  : independentSlots
                }
                onSlotsChange={setIndependentSlots}
              />

              {!selectedTemplate && (
                <div className="text-center py-8 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-yellow-800">
                    建议先选择一个基础模板，然后在此基础上进行个性化配置
                  </p>
                  <button
                    onClick={() => setActiveTab('templates')}
                    className="mt-2 text-sm text-yellow-700 hover:text-yellow-900 underline"
                  >
                    选择基础模板
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 压缩策略 */}
      {activeTab === 'compression' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">上下文压缩策略</h4>
            <p className="text-sm text-gray-600">
              当对话上下文超出模型限制时，自动应用压缩策略
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compressionStrategies.map(strategy => (
              <div
                key={strategy.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-1">{strategy.name}</h5>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                  </div>
                  <input type="radio" name="compression-strategy" className="mt-1" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">最大Token数:</span>
                    <span className="font-medium">{strategy.maxTokens}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">压缩算法:</span>
                    <span className="font-medium">{strategy.algorithm}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">保持结构:</span>
                    <span className={`font-medium ${strategy.preserveStructure ? 'text-green-600' : 'text-red-600'}`}>
                      {strategy.preserveStructure ? '是' : '否'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 高级设置 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h5 className="font-medium text-gray-900 mb-4">高级压缩设置</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  触发阈值 (Token数)
                </label>
                <input
                  type="number"
                  defaultValue="3000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  当上下文超过此Token数时触发压缩
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  压缩保留比例
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  <option value="0.5">50% - 激进压缩</option>
                  <option value="0.7">70% - 平衡压缩</option>
                  <option value="0.8">80% - 保守压缩</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600" defaultChecked />
                <span className="text-sm text-gray-700">保留最近的对话轮次</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-700">优先保留重要信息（姓名、时间等）</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-purple-600" defaultChecked />
                <span className="text-sm text-gray-700">启用智能摘要生成</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 新建/编辑模板模态框 */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <TemplateModal
            template={editingTemplate}
            onSave={(template) => {
              if (editingTemplate) {
                updatePromptTemplate(template.id, template);
              } else {
                addPromptTemplate(template);
              }
              setIsTemplateModalOpen(false);
              setEditingTemplate(null);
            }}
            onClose={() => {
              setIsTemplateModalOpen(false);
              setEditingTemplate(null);
            }}
          />
        </div>
      )}

      {/* 导入模板模态框 */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <ImportTemplateModal
            onImport={(importedTemplates) => {
              importPromptTemplates(importedTemplates);
              setIsImportModalOpen(false);
            }}
            onClose={() => setIsImportModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

// 模板创建/编辑模态框组件
interface TemplateModalProps {
  template?: PromptTemplate | null;
  onSave: (template: PromptTemplate) => void;
  onClose: () => void;
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    content: template?.content || '',
    slots: template?.slots || [] as PromptTemplate['slots']
  });

  const [newSlot, setNewSlot] = useState<Partial<SlotType>>({
    name: '',
    description: '',
    type: 'text',
    required: false
  });

  const handleSave = () => {
    const templateData: PromptTemplate = {
      id: template?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      content: formData.content,
      slots: formData.slots,
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: template?.usageCount || 0,
      isBuiltIn: false
    };
    onSave(templateData);
  };

  const addSlot = () => {
    if (newSlot.name && newSlot.description) {
      const slot: SlotType = {
        id: Date.now().toString(),
        name: newSlot.name,
        description: newSlot.description,
        type: newSlot.type || 'text',
        required: newSlot.required || false,
        defaultValue: newSlot.defaultValue,
        options: newSlot.options,
        placeholder: newSlot.placeholder
      };
      setFormData(prev => ({
        ...prev,
        slots: [...prev.slots, slot]
      }));
      setNewSlot({ name: '', description: '', type: 'text', required: false });
    }
  };

  const removeSlot = (slotId: string) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter(slot => slot.id !== slotId)
    }));
  };

  return (
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {template ? '编辑模板' : '新建模板'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">模板名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：客服专员模板"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：客服"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">模板描述</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            placeholder="简要描述此模板的用途"
          />
        </div>

        {/* 模板内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">模板内容</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={8}
            placeholder="使用 {{变量名}} 定义动态变量，例如：你好，我是{{name}}..."
          />
          <p className="text-xs text-gray-500 mt-1">
            使用双花括号语法定义变量，例如：{`{{name}}`}、{`{{role}}`}
          </p>
        </div>

        {/* Slot配置 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">Slot变量配置</label>
            <span className="text-xs text-gray-500">{formData.slots.length} 个变量</span>
          </div>

          {/* 现有Slots */}
          <div className="space-y-3 mb-4">
            {formData.slots.map((slot, index) => (
              <div key={slot.id || slot.name || index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <span className="font-medium">{slot.name}</span>
                    {slot.required && <span className="text-red-500 ml-1">*</span>}
                  </div>
                  <div className="text-gray-600">{slot.description || ''}</div>
                  <div className="text-gray-500">{slot.type || 'text'}</div>
                  <div className="text-gray-500">{slot.defaultValue || '-'}</div>
                </div>
                <button
                  onClick={() => removeSlot(slot.id || slot.name)}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* 添加新Slot */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="变量名（如：name）"
                value={newSlot.name}
                onChange={(e) => setNewSlot(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="变量描述"
                value={newSlot.description}
                onChange={(e) => setNewSlot(prev => ({ ...prev, description: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <select
                value={newSlot.type}
                onChange={(e) => setNewSlot(prev => ({ ...prev, type: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="text">文本</option>
                <option value="number">数字</option>
                <option value="select">选择</option>
                <option value="multiselect">多选</option>
              </select>
              <input
                type="text"
                placeholder="默认值（可选）"
                value={newSlot.defaultValue || ''}
                onChange={(e) => setNewSlot(prev => ({ ...prev, defaultValue: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newSlot.required}
                  onChange={(e) => setNewSlot(prev => ({ ...prev, required: e.target.checked }))}
                  className="w-4 h-4 text-purple-600"
                />
                必填
              </label>
            </div>
            <button
              onClick={addSlot}
              disabled={!newSlot.name || !newSlot.description}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="h-4 w-4" />
              添加变量
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.name || !formData.content}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          保存模板
        </button>
      </div>
    </div>
  );
};

// 导入模板模态框组件
interface ImportTemplateModalProps {
  onImport: (templates: PromptTemplate[]) => void;
  onClose: () => void;
}

const ImportTemplateModal: React.FC<ImportTemplateModalProps> = ({ onImport, onClose }) => {
  const [importData, setImportData] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportData(content);
        setError('');
      };
      reader.readAsText(file);
    }
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importData);

      // 验证数据格式
      if (Array.isArray(parsed)) {
        const templates = parsed.map(item => ({
          ...item,
          id: Date.now().toString() + Math.random(),
          isBuiltIn: false,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));
        onImport(templates);
      } else if (parsed.name && parsed.content) {
        // 单个模板
        const template = {
          ...parsed,
          id: Date.now().toString(),
          isBuiltIn: false,
          usageCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        onImport([template]);
      } else {
        setError('无效的模板格式');
      }
    } catch (err) {
      setError('JSON格式错误，请检查文件内容');
    }
  };

  return (
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">导入模板</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            选择JSON文件
          </label>
          <input
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            或直接粘贴JSON内容
          </label>
          <textarea
            value={importData}
            onChange={(e) => {
              setImportData(e.target.value);
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={8}
            placeholder="粘贴模板的JSON数据..."
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button
          onClick={handleImport}
          disabled={!importData.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          导入模板
        </button>
      </div>
    </div>
  );
};

export default PromptConfig;