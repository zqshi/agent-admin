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
import IndependentSlotManager from '../../IndependentSlotManager';
import type {
  SlotConfig,
  PersonalityTraits,
  PromptManagement,
  PromptExample,
  EnhancedSlotDefinition,
  PromptConfig as PromptConfigType
} from '../../../types';
import type { SlotDefinition } from '../../../../prompt-engineering/types';
import { slotRegistry } from '../../../services/SlotRegistry';
import { slotInjector } from '../../../services/SlotInjector';

// 直接使用PromptManagement类型

// 压缩策略类型
interface CompressionStrategy {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  algorithm: 'truncate' | 'summary' | 'semantic';
  preserveStructure: boolean;
}

// Props接口定义
interface PromptConfigProps {
  config?: PromptConfigType;
  onChange?: (updates: Partial<PromptConfigType>) => void;
}

const PromptConfig: React.FC<PromptConfigProps> = ({ config, onChange }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.advancedConfig?.prompt;
  const actualOnChange = onChange || ((updates: Partial<PromptConfigType>) => {
    store.updateAdvancedConfig({ prompt: { ...store.advancedConfig?.prompt, ...updates } });
  });

  const {
    createPrompt,
    updatePrompt,
    deletePrompt,
    duplicatePrompt,
    incrementPromptUsage
  } = store;

  // 直接使用PromptManagement数据
  const getAllPrompts = (): PromptManagement[] => {
    return store.promptManagement.prompts;
  };
  const [activeTab, setActiveTab] = useState<'prompts' | 'slots' | 'registry' | 'compression'>('prompts');
  const [slotValues, setSlotValues] = useState<Record<string, any>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null);
  const [showErrorMessage, setShowErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // 独立Slot状态
  const [independentSlots, setIndependentSlots] = useState<EnhancedSlotDefinition[]>([]);

  // 预览效果模态框状态
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');

  // Prompt管理增强状态
  const [currentPrompt, setCurrentPrompt] = useState<PromptManagement | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptManagement | null>(null);

  // 辅助函数
  const showError = (message: string) => {
    setShowErrorMessage(message);
    setTimeout(() => setShowErrorMessage(null), 5000);
  };

  const showSuccess = (message: string) => {
    setShowSuccessMessage(message);
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }));
  };

  const withErrorHandling = async (operation: () => Promise<void>, errorContext: string) => {
    try {
      await operation();
    } catch (error) {
      console.error(`${errorContext}:`, error);
      showError(`${errorContext}失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };
  const [promptVersion, setPromptVersion] = useState<string>('1.0.0');
  const [promptExamples, setPromptExamples] = useState<PromptExample[]>([]);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Slot注册管理状态
  const [enhancedSlots, setEnhancedSlots] = useState<EnhancedSlotDefinition[]>([]);
  const [slotSearchQuery, setSlotSearchQuery] = useState('');
  const [slotFilterRole, setSlotFilterRole] = useState('');
  const [slotFilterOrigin, setSlotFilterOrigin] = useState('');
  const [showEphemeralSlots, setShowEphemeralSlots] = useState(true);

  // 场景检测相关状态
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(true);
  const [currentScenario, setCurrentScenario] = useState<any>(null);


  // 初始化时加载enhancedSlots数据
  React.useEffect(() => {
    if (activeTab === 'registry') {
      loadEnhancedSlots();
    }
  }, [activeTab, slotSearchQuery, slotFilterRole, slotFilterOrigin, showEphemeralSlots]);

  // 直接使用PromptManagement数据
  const prompts = getAllPrompts();

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

  // 处理Prompt选择和应用
  const handlePromptSelect = (prompt: PromptManagement) => {
    const newPromptConfig: Partial<PromptConfigType> = {
      templates: [{
        id: prompt.id,
        name: prompt.name,
        category: prompt.category,
        basePrompt: prompt.content,
        variables: [],
        isDefault: true
      }]
    };

    // 应用到当前配置
    actualOnChange(newPromptConfig);

    // 增加使用计数
    incrementPromptUsage(prompt.id);

    showSuccess(`已应用Prompt"${prompt.name}"`);
  };

  // Prompt预览（使用当前slot值）
  const previewPrompt = (promptContent: string): string => {
    let preview = promptContent;
    Object.entries(slotValues).forEach(([key, value]) => {
      const regex = new RegExp(`\{\{${key}\}\}`, 'g');
      preview = preview.replace(regex, String(value || ''));
    });
    return preview;
  };

  // 更新slot值
  const updateSlotValue = (slotName: string, value: any) => {
    setSlotValues(prev => ({
      ...prev,
      [slotName]: value
    }));

    // 同时更新到配置中 - 通过模板变量更新
    if (actualConfig?.templates?.[0]) {
      const updatedVariables = actualConfig.templates[0].variables.map(variable =>
        variable.name === slotName
          ? { ...variable, defaultValue: value }
          : variable
      );
      actualOnChange({
        ...actualConfig,
        templates: [{
          ...actualConfig.templates[0],
          variables: updatedVariables
        }]
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

  // ============ Prompt管理增强方法 ============

  // 创建新的Prompt
  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setIsPromptModalOpen(true);
  };

  // 编辑Prompt
  const handleEditPrompt = (prompt: PromptManagement) => {
    setEditingPrompt(prompt);
    setIsPromptModalOpen(true);
  };

  // 保存Prompt
  const handleSavePrompt = async (promptData: Omit<PromptManagement, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => {
    setLoading('savePrompt', true);

    await withErrorHandling(async () => {
      // 验证必填字段
      if (!promptData.name?.trim()) {
        throw new Error('Prompt名称不能为空');
      }
      if (!promptData.content?.trim()) {
        throw new Error('Prompt内容不能为空');
      }

      if (editingPrompt) {
        store.updatePrompt(editingPrompt.id, promptData);
      } else {
        const newId = store.createPrompt(promptData);
        setCurrentPrompt(store.promptManagement.prompts.find(p => p.id === newId) || null);
      }

      setIsPromptModalOpen(false);
      setEditingPrompt(null);
      showSuccess(editingPrompt ? 'Prompt已更新' : 'Prompt已创建');
    }, 'Prompt保存');

    setLoading('savePrompt', false);
  };

  // 删除Prompt
  const handleDeletePrompt = (id: string) => {
    if (confirm('确定要删除这个Prompt吗？')) {
      store.deletePrompt(id);
      if (currentPrompt?.id === id) {
        setCurrentPrompt(null);
      }
      setShowSuccessMessage('Prompt已删除');
      setTimeout(() => setShowSuccessMessage(null), 3000);
    }
  };

  // 复制Prompt
  const handleDuplicatePrompt = (id: string) => {
    const newId = store.duplicatePrompt(id);
    const newPrompt = store.promptManagement.prompts.find(p => p.id === newId);
    if (newPrompt) {
      setCurrentPrompt(newPrompt);
      setShowSuccessMessage('Prompt已复制');
      setTimeout(() => setShowSuccessMessage(null), 3000);
    }
  };

  // ============ Slot注册管理方法 ============

  // 注册Slot到注册表
  const handleRegisterSlot = async (slot: EnhancedSlotDefinition) => {
    const success = await slotRegistry.registerSlot(slot);
    if (success) {
      setShowSuccessMessage(`Slot "${slot.name}" 已注册`);
      loadEnhancedSlots();
    } else {
      setShowSuccessMessage(`Slot "${slot.name}" 注册失败`);
    }
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // 取消注册Slot
  const handleUnregisterSlot = async (slotId: string) => {
    const success = await slotRegistry.unregisterSlot(slotId);
    if (success) {
      setShowSuccessMessage('Slot已取消注册');
      loadEnhancedSlots();
    } else {
      setShowSuccessMessage('Slot取消注册失败');
    }
    setTimeout(() => setShowSuccessMessage(null), 3000);
  };

  // 加载增强的Slots
  const loadEnhancedSlots = () => {
    let slots = slotRegistry.getAllSlots();

    // 应用搜索过滤
    if (slotSearchQuery) {
      slots = slots.filter(slot =>
        slot.name.toLowerCase().includes(slotSearchQuery.toLowerCase()) ||
        slot.description?.toLowerCase().includes(slotSearchQuery.toLowerCase())
      );
    }

    // 应用角色过滤
    if (slotFilterRole) {
      slots = slots.filter(slot => slot.role === slotFilterRole);
    }

    // 应用来源过滤
    if (slotFilterOrigin) {
      slots = slots.filter(slot => slot.origin === slotFilterOrigin);
    }

    // 是否显示临时slots
    if (!showEphemeralSlots) {
      slots = slots.filter(slot => !slot.ephemeral);
    }

    setEnhancedSlots(slots);
  };

  // 业务场景检测
  const handleDetectScenario = async (userInput: string) => {
    if (!autoDetectionEnabled) return;

    try {
      const scenario = await slotInjector.detectScenario(userInput);
      setCurrentScenario(scenario);

      if (scenario) {
        setShowSuccessMessage(`检测到场景: ${scenario.name}`);
        setTimeout(() => setShowSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error('场景检测失败:', error);
    }
  };

  // 应用场景推荐的slots
  const handleApplyScenarioSlots = async () => {
    if (!currentScenario) return;

    try {
      const context = {
        sessionId: `session_${Date.now()}`,
        userInput: 'scenario application',
        conversationHistory: [],
        timestamp: new Date().toISOString(),
        metadata: { scenario: currentScenario }
      };

      for (const recommendation of currentScenario.recommendedSlots) {
        await slotInjector.injectSlot(recommendation.slotId, context);
      }

      setShowSuccessMessage('场景推荐的Slots已应用');
      setTimeout(() => setShowSuccessMessage(null), 3000);
    } catch (error) {
      console.error('应用场景slots失败:', error);
    }
  };


  // 预览效果功能
  const handlePreviewEffect = () => {
    // 获取当前选中的Prompt或者构建一个示例Prompt
    let promptContent = '';

    if (currentPrompt) {
      promptContent = currentPrompt.content;
    } else if (actualConfig?.templates && actualConfig.templates.length > 0) {
      promptContent = actualConfig.templates[0].basePrompt;
    } else {
      promptContent = '请先选择或创建一个Prompt，然后添加一些Slot来查看预览效果。\n\n示例：你好 {{userName}}，欢迎使用我们的 {{productName}} 服务！';
    }

    // 使用当前slot值和独立slots进行替换
    let processedContent = promptContent;

    // 替换已有的slotValues
    Object.entries(slotValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, String(value || `[${key}]`));
    });

    // 替换独立slots的默认值
    independentSlots.forEach(slot => {
      const regex = new RegExp(`\\{\\{${slot.name}\\}\\}`, 'g');
      const replacement = slot.defaultValue || `[${slot.name}]`;
      processedContent = processedContent.replace(regex, String(replacement));
    });

    setPreviewContent(processedContent);
    setIsPreviewModalOpen(true);
  };

  const tabs = [
    { id: 'prompts', label: 'Prompt模板管理', icon: FileText },
    { id: 'slots', label: 'Slot配置', icon: Zap },
    { id: 'registry', label: 'Slot注册表', icon: Settings },
    { id: 'compression', label: '压缩策略', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* 成功消息提示 */}
      {showSuccessMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="text-green-800">{showSuccessMessage}</span>
          <button
            onClick={() => setShowSuccessMessage(null)}
            className="ml-auto text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 错误消息提示 */}
      {showErrorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-red-800">{showErrorMessage}</span>
          <button
            onClick={() => setShowErrorMessage(null)}
            className="ml-auto text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      {/* Tab导航 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-0 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>


      {/* Prompt管理 */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          {/* 标题和描述 */}
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">Prompt模板管理</h4>
            <p className="text-sm text-gray-600">
              管理数字员工的Prompt配置和版本，支持创建、编辑、复制和删除Prompt模板
            </p>
          </div>

          {/* 搜索和操作工具 */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex flex-1 gap-3">
              <input
                type="text"
                placeholder="搜索Prompt..."
                value={store.promptManagement.searchQuery}
                onChange={(e) => store.searchPrompts(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={store.promptManagement.filterCategory}
                onChange={(e) => store.filterPrompts(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有分类</option>
                <option value="客户服务">客户服务</option>
                <option value="技术支持">技术支持</option>
                <option value="销售咨询">销售咨询</option>
                <option value="人力资源">人力资源</option>
              </select>
            </div>
            <button
              onClick={handleCreatePrompt}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              新建Prompt
            </button>
          </div>

          {/* Prompt列表 */}
          <div className="space-y-4">
            {prompts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">暂无Prompt配置</h4>
                <p className="text-gray-600 mb-4">创建您的第一个Prompt来开始配置数字员工</p>
                <button
                  onClick={handleCreatePrompt}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建Prompt
                </button>
              </div>
            ) : (
              prompts
                .filter(prompt => {
                  const matchesSearch = !store.promptManagement.searchQuery ||
                    prompt.name.toLowerCase().includes(store.promptManagement.searchQuery.toLowerCase()) ||
                    prompt.description.toLowerCase().includes(store.promptManagement.searchQuery.toLowerCase());
                  const matchesCategory = !store.promptManagement.filterCategory ||
                    prompt.category === store.promptManagement.filterCategory;
                  return matchesSearch && matchesCategory;
                })
                .map(prompt => (
                  <div
                    key={prompt.id}
                    className={`border rounded-lg p-6 transition-all ${
                      currentPrompt?.id === prompt.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h5 className="text-lg font-medium text-gray-900">{prompt.displayName || prompt.name}</h5>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            v{prompt.version}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {prompt.category}
                          </span>
                          {prompt.isBuiltIn && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              内置
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{prompt.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">关联Slots: </span>
                            <span className="font-medium">{prompt.slots.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">示例数量: </span>
                            <span className="font-medium">{prompt.example.length}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">使用次数: </span>
                            <span className="font-medium">{prompt.usageCount}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">更新时间: </span>
                            <span className="font-medium">
                              {new Date(prompt.updatedAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                        </div>
                        {prompt.tags.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            <span className="text-xs text-gray-500">标签:</span>
                            {prompt.tags.map(tag => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setCurrentPrompt(prompt)}
                          className={`p-2 rounded-lg transition-colors ${
                            currentPrompt?.id === prompt.id
                              ? 'bg-blue-100 text-blue-600'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="选择"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePrompt(prompt.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="复制"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {!prompt.isBuiltIn && (
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* 当前选中的Prompt详情 */}
          {currentPrompt && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h5 className="text-lg font-medium text-gray-900">Prompt详情</h5>
                <button
                  onClick={() => setShowVersionHistory(!showVersionHistory)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {showVersionHistory ? '隐藏' : '查看'}版本历史
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                    <div className="text-sm text-gray-900">{currentPrompt.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
                    <div className="text-sm text-gray-900">{currentPrompt.displayName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
                    <div className="text-sm text-gray-900">{currentPrompt.version}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">作者</label>
                    <div className="text-sm text-gray-900">{currentPrompt.author}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prompt内容</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">{currentPrompt.content}</pre>
                  </div>
                </div>

                {currentPrompt.slots.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">关联Slots</label>
                    <div className="flex flex-wrap gap-2">
                      {currentPrompt.slots.map(slotName => (
                        <span key={slotName} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {slotName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {currentPrompt.example.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">使用示例</label>
                    <div className="space-y-2">
                      {currentPrompt.example.map((example, index) => (
                        <div key={example.id || index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-sm text-gray-900 mb-1">{example.title}</div>
                          <div className="text-xs text-gray-600 mb-2">{example.description}</div>
                          <div className="text-xs text-gray-500">场景: {example.scenario}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">参数配置</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <pre className="text-xs text-gray-600">{JSON.stringify(currentPrompt.parameter, null, 2)}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Slot配置 */}
      {activeTab === 'slots' && (
        <div className="space-y-6">
          {/* 标题和描述 */}
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">Slot动态变量配置</h4>
            <p className="text-sm text-gray-600">
              配置和管理数字员工的动态变量Slot，支持创建自定义Slot变量并预览替换效果
            </p>
          </div>

          {/* 独立Slot管理器 */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="mb-4">
              <h5 className="font-medium text-gray-900">自定义Slot配置</h5>
              <p className="text-sm text-gray-600 mt-1">通过下方组件管理Slot变量</p>
            </div>

            <IndependentSlotManager
              slots={independentSlots}
              onSlotsChange={setIndependentSlots}
              showExportButton={false}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveSlotConfig}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="h-4 w-4" />
                {isSaving ? '保存中...' : '保存配置'}
              </button>
              <button
                onClick={handlePreviewEffect}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" />
                预览效果
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slot注册表 */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          {/* 标题和描述 */}
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">Slot注册表管理</h4>
            <p className="text-sm text-gray-600">
              管理运行时、会话级和持久化的Slot配置，提供统一的Slot注册中心和监控面板
            </p>
          </div>

          {/* 搜索和过滤工具 */}
          <div className="flex flex-col gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="搜索Slot..."
                value={slotSearchQuery}
                onChange={(e) => setSlotSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={slotFilterRole}
                onChange={(e) => setSlotFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有角色</option>
                <option value="system">系统</option>
                <option value="user">用户</option>
                <option value="context">上下文</option>
                <option value="dynamic">动态</option>
                <option value="computed">计算</option>
              </select>
              <select
                value={slotFilterOrigin}
                onChange={(e) => setSlotFilterOrigin(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">所有来源</option>
                <option value="preset">预设</option>
                <option value="custom">自定义</option>
                <option value="runtime">运行时</option>
                <option value="api">API</option>
              </select>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showEphemeralSlots}
                  onChange={(e) => setShowEphemeralSlots(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                显示临时Slots
              </label>
              <button
                onClick={() => loadEnhancedSlots()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                刷新注册表
              </button>
            </div>
          </div>

          {/* 存储层级概览 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h5 className="font-medium text-blue-900">运行时存储</h5>
              </div>
              <p className="text-sm text-blue-700 mb-2">会话期间临时存储的Slots</p>
              <div className="text-lg font-semibold text-blue-800">
                {enhancedSlots.filter(slot => slot.origin === 'runtime').length}
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h5 className="font-medium text-green-900">会话级存储</h5>
              </div>
              <p className="text-sm text-green-700 mb-2">会话内持续存在的Slots</p>
              <div className="text-lg font-semibold text-green-800">
                {enhancedSlots.filter(slot => slot.origin === 'custom').length}
              </div>
            </div>
            <div className="bg-blue-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h5 className="font-medium text-purple-900">持久化存储</h5>
              </div>
              <p className="text-sm text-blue-700 mb-2">跨会话保持的Slots</p>
              <div className="text-lg font-semibold text-purple-800">
                {enhancedSlots.filter(slot => slot.origin === 'preset' || slot.origin === 'api').length}
              </div>
            </div>
          </div>

          {/* 注册的Slots列表 */}
          <div className="space-y-4">
            {enhancedSlots.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Database className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">暂无注册的Slots</h4>
                <p className="text-gray-600 mb-4">注册Slots后将在此处显示</p>
                <button
                  onClick={() => loadEnhancedSlots()}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  加载Slots
                </button>
              </div>
            ) : (
              enhancedSlots.map(slot => (
                <div
                  key={slot.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="text-lg font-medium text-gray-900">{slot.name}</h5>

                        {/* 角色标签 */}
                        <span className={`text-xs px-2 py-1 rounded ${
                          slot.role === 'system' ? 'bg-blue-100 text-blue-700' :
                          slot.role === 'user' ? 'bg-green-100 text-green-700' :
                          slot.role === 'context' ? 'bg-yellow-100 text-yellow-700' :
                          slot.role === 'dynamic' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {slot.role}
                        </span>

                        {/* 来源标签 */}
                        <span className={`text-xs px-2 py-1 rounded ${
                          slot.origin === 'preset' ? 'bg-gray-100 text-gray-700' :
                          slot.origin === 'custom' ? 'bg-blue-100 text-blue-700' :
                          slot.origin === 'runtime' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {slot.origin}
                        </span>

                        {/* 属性标签 */}
                        {slot.immutable && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            不可变
                          </span>
                        )}
                        {slot.ephemeral && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                            临时
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{slot.description}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">类型: </span>
                          <span className="font-medium">{slot.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">默认值: </span>
                          <span className="font-medium">{slot.defaultValue || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">依赖数量: </span>
                          <span className="font-medium">{slot.dependencies?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">更新时间: </span>
                          <span className="font-medium">
                            {new Date(slot.updatedAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                      </div>

                      {/* 依赖关系 */}
                      {slot.dependencies && slot.dependencies.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 mb-1 block">依赖Slots:</span>
                          <div className="flex flex-wrap gap-1">
                            {slot.dependencies.map(dep => (
                              <span key={dep} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {dep}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 验证规则 */}
                      {slot.validation && slot.validation.rules && slot.validation.rules.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 mb-1 block">验证规则:</span>
                          <div className="flex flex-wrap gap-1">
                            {slot.validation.rules.map((rule, index) => (
                              <span key={index} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                {rule.type}: {rule.pattern || rule.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => {
                          console.log('编辑Slot:', slot);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(JSON.stringify(slot, null, 2));
                          setShowSuccessMessage('Slot配置已复制到剪贴板');
                          setTimeout(() => setShowSuccessMessage(null), 3000);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="复制配置"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {slot.origin !== 'preset' && !slot.immutable && (
                        <button
                          onClick={() => handleUnregisterSlot(slot.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="取消注册"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 扩展信息 */}
                  {slot.audit?.changeLog && slot.audit.changeLog.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">变更历史:</div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <div className="text-xs text-gray-600">
                          最后修改: {slot.audit.lastModifiedBy}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 注册操作面板 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h5 className="font-medium text-gray-900 mb-4">注册新Slot</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">快速注册</label>
                <p className="text-xs text-gray-500 mb-3">
                  从IndependentSlotManager中的Slots一键注册到注册表
                </p>
                <button
                  onClick={() => {
                    // 从独立Slot管理器中获取配置并注册
                    independentSlots.forEach(async (slot) => {
                      await handleRegisterSlot(slot);
                    });
                  }}
                  disabled={independentSlots.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  注册自定义Slots ({independentSlots.length})
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">批量导入</label>
                <p className="text-xs text-gray-500 mb-3">
                  从JSON文件或配置文本导入Slot定义
                </p>
                <button
                  onClick={() => {
                    // TODO: 实现批量导入功能
                    console.log('批量导入Slots');
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  批量导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 压缩策略 */}
      {activeTab === 'compression' && (
        <div className="space-y-6">
          {/* 标题和描述 */}
          <div className="space-y-2">
            <h4 className="text-xl font-semibold text-gray-900">上下文压缩策略配置</h4>
            <p className="text-sm text-gray-600">
              配置对话上下文压缩规则，当上下文超出限制时自动应用压缩策略，支持智能截断、语义摘要和语义压缩等多种策略
            </p>
          </div>

          {/* 压缩策略配置 */}
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
                  <input
                    type="radio"
                    name="compression-strategy"
                    className="mt-1"
                    defaultChecked={strategy.id === '1'}
                  />
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

          {/* 高级压缩设置 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h5 className="font-medium text-gray-900 mb-4">压缩配置</h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  触发阈值 (Token数)
                </label>
                <input
                  type="number"
                  defaultValue="4000"
                  min="1000"
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  当上下文超过此Token数时触发压缩
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  压缩保留比例
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  defaultValue="0.7"
                >
                  <option value="0.5">50% - 激进压缩</option>
                  <option value="0.7">70% - 平衡压缩</option>
                  <option value="0.8">80% - 保守压缩</option>
                </select>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                <span className="text-sm text-gray-700">保留最近的对话轮次</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                <span className="text-sm text-gray-700">优先保留重要信息（姓名、时间等）</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" defaultChecked />
                <span className="text-sm text-gray-700">启用智能摘要生成</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700">记录压缩历史用于溯源</span>
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                保存配置
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                重置为默认
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 新建/编辑Prompt模态框 */}
      {isPromptModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PromptModal
            prompt={editingPrompt}
            onSave={handleSavePrompt}
            onClose={() => {
              setIsPromptModalOpen(false);
              setEditingPrompt(null);
            }}
            loadingStates={loadingStates}
          />
        </div>
      )}


      {/* 预览效果模态框 */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <PreviewModal
            content={previewContent}
            slots={independentSlots}
            slotValues={slotValues}
            onClose={() => setIsPreviewModalOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

// 简化的PromptModal组件
interface PromptModalProps {
  prompt?: PromptManagement | null;
  onSave: (prompt: Omit<PromptManagement, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onClose: () => void;
  loadingStates: Record<string, boolean>;
}

const PromptModal: React.FC<PromptModalProps> = ({ prompt, onSave, onClose, loadingStates }) => {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    displayName: prompt?.displayName || '',
    description: prompt?.description || '',
    content: prompt?.content || '',
    category: prompt?.category || '',
    version: prompt?.version || '1.0.0',
    author: prompt?.author || 'User',
    tags: prompt?.tags || [],
    slots: prompt?.slots || [],
    example: prompt?.example || [],
    parameter: prompt?.parameter || {},
    isBuiltIn: prompt?.isBuiltIn || false
  });

  const handleSave = () => {
    if (!formData.name || !formData.content) return;

    onSave(formData);
  };

  return (
    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">
          {prompt ? '编辑Prompt' : '创建新Prompt'}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入Prompt名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">显示名称</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="输入显示名称"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="描述Prompt的用途"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">选择分类</option>
            <option value="客户服务">客户服务</option>
            <option value="技术支持">技术支持</option>
            <option value="销售咨询">销售咨询</option>
            <option value="人力资源">人力资源</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prompt内容 *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="输入Prompt内容，可以使用{{变量名}}的形式定义动态变量"
          />
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={!formData.name || !formData.content || loadingStates.savePrompt}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
        >
          {loadingStates.savePrompt && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {loadingStates.savePrompt ? '保存中...' : '保存Prompt'}
        </button>
      </div>
    </div>
  );
};


// 预览效果模态框组件
interface PreviewModalProps {
  content: string;
  slots: EnhancedSlotDefinition[];
  slotValues: Record<string, any>;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  content,
  slots,
  slotValues,
  onClose
}) => {
  const [tempSlotValues, setTempSlotValues] = useState<Record<string, any>>({
    ...slotValues,
    // 为所有slot添加默认值
    ...slots.reduce((acc, slot) => {
      if (!acc[slot.name]) {
        acc[slot.name] = slot.defaultValue || '';
      }
      return acc;
    }, {} as Record<string, any>)
  });

  // 实时预览内容
  const getPreviewContent = () => {
    let processedContent = content;

    // 替换所有slot值
    Object.entries(tempSlotValues).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processedContent = processedContent.replace(regex, String(value || `[${key}]`));
    });

    // 为未设置值的slot添加占位符
    const slotRegex = /\{\{([^}]+)\}\}/g;
    processedContent = processedContent.replace(slotRegex, (match, slotName) => {
      return `[${slotName}]`;
    });

    return processedContent;
  };

  const updateSlotValue = (slotName: string, value: any) => {
    setTempSlotValues(prev => ({
      ...prev,
      [slotName]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Prompt预览效果</h3>
            <p className="text-sm text-gray-600 mt-1">实时查看Prompt替换Slot变量后的效果</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Slot值配置面板 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Slot变量配置</h4>

            {slots.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                暂无Slot变量，请先添加一些Slot来进行配置
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {slots.map(slot => (
                  <div key={slot.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">
                        {slot.name}
                      </label>
                      <span className="text-xs text-gray-500">{slot.type}</span>
                    </div>
                    {slot.description && (
                      <p className="text-xs text-gray-500 mb-2">{slot.description}</p>
                    )}
                    <input
                      type={slot.type === 'number' ? 'number' : 'text'}
                      value={tempSlotValues[slot.name] || ''}
                      onChange={(e) => updateSlotValue(slot.name, e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      placeholder={slot.defaultValue || `输入${slot.name}的值`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 预览效果面板 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">预览效果</h4>
            <div className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">生成的Prompt</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(getPreviewContent())}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    复制
                  </button>
                </div>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
                  {getPreviewContent()}
                </pre>
              </div>
            </div>

            {/* 统计信息 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h5 className="text-sm font-medium text-blue-900 mb-2">预览统计</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">字符数：</span>
                  <span className="font-medium text-blue-900">
                    {getPreviewContent().length}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">单词数：</span>
                  <span className="font-medium text-blue-900">
                    {getPreviewContent().split(/\s+/).length}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">未填充Slot：</span>
                  <span className="font-medium text-blue-900">
                    {(getPreviewContent().match(/\[[^\]]+\]/g) || []).length}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">总Slot数：</span>
                  <span className="font-medium text-blue-900">
                    {slots.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          关闭预览
        </button>
      </div>
    </div>
  );
};

export default PromptConfig;
