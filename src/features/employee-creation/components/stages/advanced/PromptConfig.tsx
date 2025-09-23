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
import type {
  SlotConfig,
  PersonalityTraits,
  PromptManagement,
  PromptExample,
  EnhancedSlotDefinition
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
  config?: PromptConfig;
  onChange?: (updates: Partial<PromptConfig>) => void;
}

const PromptConfig: React.FC<PromptConfigProps> = ({ config, onChange }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.advancedConfig?.prompt;
  const actualOnChange = onChange || ((updates: Partial<PromptConfig>) => {
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

  // 新增配置模式状态
  const [configMode, setConfigMode] = useState<ConfigMode>('template');
  const [independentSlots, setIndependentSlots] = useState<EnhancedSlotDefinition[]>([]);

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

  // 业务场景检测状态
  const [currentScenario, setCurrentScenario] = useState<any>(null);
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState(true);

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
    const newPromptConfig = {
      current: {
        promptId: prompt.id,
        content: prompt.content,
        variables: {}
      }
    };

    // 应用到当前配置
    actualOnChange(newPromptConfig);

    // 增加使用计数
    incrementPromptUsage(prompt.id);

    showSuccess(`已应用Prompt"${prompt.name}"`);
  };

  // Prompt预览（使用当前slot值）
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


      {/* Prompt管理 */}
      {activeTab === 'prompts' && (
        <div className="space-y-6">
          {/* 头部操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Prompt管理</h4>
              <p className="text-sm text-gray-600">管理数字员工的Prompt配置和版本</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="搜索Prompt..."
                value={store.promptManagement.searchQuery}
                onChange={(e) => store.searchPrompts(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={store.promptManagement.filterCategory}
                onChange={(e) => store.filterPrompts(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">所有分类</option>
                <option value="客户服务">客户服务</option>
                <option value="技术支持">技术支持</option>
                <option value="销售咨询">销售咨询</option>
                <option value="人力资源">人力资源</option>
              </select>
              <button
                onClick={handleCreatePrompt}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="h-4 w-4" />
                新建Prompt
              </button>
            </div>
          </div>

          {/* Prompt列表 */}
          <div className="space-y-4">
            {getManagedPrompts().length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">暂无Prompt配置</h4>
                <p className="text-gray-600 mb-4">创建您的第一个Prompt来开始配置数字员工</p>
                <button
                  onClick={handleCreatePrompt}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建Prompt
                </button>
              </div>
            ) : (
              getManagedPrompts()
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
                    className={`border rounded-lg p-4 transition-all ${
                      currentPrompt?.id === prompt.id
                        ? 'border-purple-500 bg-purple-50'
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
                          className={`p-2 rounded-lg ${
                            currentPrompt?.id === prompt.id
                              ? 'bg-purple-100 text-purple-600'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                          title="选择"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEditPrompt(prompt)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="编辑"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicatePrompt(prompt.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                          title="复制"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        {!prompt.isBuiltIn && (
                          <button
                            onClick={() => handleDeletePrompt(prompt.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
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
                  className="text-sm text-purple-600 hover:text-purple-700"
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

                  {/* 业务场景推荐集成 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 mb-3">
                      <Eye className="h-4 w-4 inline mr-2" />
                      业务场景智能推荐
                    </h5>
                    <p className="text-sm text-blue-700 mb-4">
                      基于当前模板类型（{selectedTemplate.category}），为您推荐相关的业务场景和Slot配置
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          name: selectedTemplate.category === '客户服务' ? '客户咨询处理' :
                                selectedTemplate.category === '技术支持' ? '故障诊断' :
                                selectedTemplate.category === '销售咨询' ? '产品推荐' : '通用场景',
                          description: selectedTemplate.category === '客户服务' ? '用户询问产品信息、价格等' :
                                      selectedTemplate.category === '技术支持' ? '用户遇到技术问题需要帮助' :
                                      selectedTemplate.category === '销售咨询' ? '为用户推荐合适的产品方案' : '标准业务处理流程',
                          keywords: selectedTemplate.category === '客户服务' ? ['价格', '产品', '咨询', '了解'] :
                                   selectedTemplate.category === '技术支持' ? ['问题', '错误', '不能用', '故障'] :
                                   selectedTemplate.category === '销售咨询' ? ['推荐', '选择', '比较', '购买'] : ['处理', '操作', '查询'],
                          recommendedSlots: selectedTemplate.category === '客户服务' ? ['user_intent', 'product_category', 'inquiry_type'] :
                                           selectedTemplate.category === '技术支持' ? ['issue_type', 'error_message', 'user_environment'] :
                                           selectedTemplate.category === '销售咨询' ? ['budget_range', 'requirements', 'usage_scenario'] : ['user_request', 'context']
                        }
                      ].map((scenario, index) => (
                        <div key={index} className="border border-blue-200 rounded-lg p-3 bg-white">
                          <h6 className="font-medium text-blue-900 mb-2">{scenario.name}</h6>
                          <p className="text-sm text-blue-700 mb-3">{scenario.description}</p>

                          <div className="mb-3">
                            <span className="text-xs text-blue-600 font-medium">关键词:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scenario.keywords.map(keyword => (
                                <span key={keyword} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mb-3">
                            <span className="text-xs text-blue-600 font-medium">推荐Slots:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {scenario.recommendedSlots.map(slot => (
                                <span key={slot} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                  {slot}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              // 应用场景推荐的Slots到当前模板
                              const newSlots = scenario.recommendedSlots.map((slotName, idx) => ({
                                id: `${selectedTemplate.id}_scenario_${idx}_${Date.now()}`,
                                name: slotName,
                                description: `${scenario.name}场景推荐的${slotName}变量`,
                                type: 'text' as const,
                                required: false,
                                defaultValue: '',
                                placeholder: `输入${slotName}`
                              }));

                              // 更新模板的slots
                              const updatedTemplate = {
                                ...selectedTemplate,
                                slots: [...selectedTemplate.slots, ...newSlots]
                              };
                              setSelectedTemplate(updatedTemplate);

                              // 显示成功提示
                              setShowSuccessMessage(`已应用${scenario.name}场景的推荐Slots`);
                              setTimeout(() => setShowSuccessMessage(null), 3000);
                            }}
                            className="w-full text-sm px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            应用此场景推荐
                          </button>
                        </div>
                      ))}
                    </div>
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
                      role: 'user' as const,
                      type: (slot.type === 'text' || slot.type === 'number' || slot.type === 'select' || slot.type === 'multiselect')
                        ? (slot.type === 'select' || slot.type === 'multiselect' ? 'enum' : slot.type === 'number' ? 'number' : 'text')
                        : 'text',
                      description: (slot as any).description || '',
                      required: slot.required,
                      defaultValue: slot.defaultValue || '',
                      immutable: false,
                      ephemeral: false,
                      updatedAt: new Date().toISOString(),
                      origin: 'custom' as const,
                      validation: {
                        rules: []
                      },
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

      {/* Slot注册表 */}
      {activeTab === 'registry' && (
        <div className="space-y-6">
          {/* 头部操作 */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Slot注册表</h4>
              <p className="text-sm text-gray-600">管理运行时、会话级和持久化的Slot配置</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="搜索Slot..."
                value={slotSearchQuery}
                onChange={(e) => setSlotSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
              <select
                value={slotFilterRole}
                onChange={(e) => setSlotFilterRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">所有来源</option>
                <option value="preset">预设</option>
                <option value="custom">自定义</option>
                <option value="runtime">运行时</option>
                <option value="api">API</option>
              </select>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={showEphemeralSlots}
                  onChange={(e) => setShowEphemeralSlots(e.target.checked)}
                  className="w-4 h-4 text-purple-600"
                />
                显示临时Slots
              </label>
              <button
                onClick={() => loadEnhancedSlots()}
                className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <h5 className="font-medium text-purple-900">持久化存储</h5>
              </div>
              <p className="text-sm text-purple-700 mb-2">跨会话保持的Slots</p>
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
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
                          slot.role === 'dynamic' ? 'bg-purple-100 text-purple-700' :
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
                      {slot.validation && slot.validation.length > 0 && (
                        <div className="mt-3">
                          <span className="text-xs text-gray-500 mb-1 block">验证规则:</span>
                          <div className="flex flex-wrap gap-1">
                            {slot.validation.map((rule, index) => (
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
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
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
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="复制配置"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      {slot.origin !== 'preset' && !slot.immutable && (
                        <button
                          onClick={() => handleUnregisterSlot(slot.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="取消注册"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 扩展信息 */}
                  {slot.metadata && Object.keys(slot.metadata).length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-2">扩展信息:</div>
                      <div className="bg-gray-50 border border-gray-200 rounded p-2">
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                          {JSON.stringify(slot.metadata, null, 2)}
                        </pre>
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  <Upload className="h-4 w-4" />
                  批量导入
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 业务场景 */}
      {activeTab === 'compression' && (
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">上下文压缩策略</h4>
            <p className="text-sm text-gray-600">
              当对话上下文超出模型限制时，自动应用压缩策略。支持压缩历史记录和原始信息溯源。
            </p>
          </div>

          {/* 压缩溯源机制 */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h5 className="font-medium text-green-900 mb-4">
              <Database className="h-4 w-4 inline mr-2" />
              压缩溯源机制
            </h5>
            <p className="text-sm text-green-700 mb-4">
              每次压缩都会保留原始信息的索引映射，支持从压缩信息溯源到完整的原始对话内容。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 压缩历史记录 */}
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-3">压缩历史记录</h6>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {[
                    {
                      id: '1',
                      timestamp: '2024-01-15 14:30:25',
                      strategy: '智能截断',
                      originalTokens: 4500,
                      compressedTokens: 2000,
                      compressionRatio: 0.44,
                      preservedSections: ['最近3轮对话', '用户关键信息', '当前任务上下文']
                    },
                    {
                      id: '2',
                      timestamp: '2024-01-15 14:25:12',
                      strategy: '语义摘要',
                      originalTokens: 3800,
                      compressedTokens: 1500,
                      compressionRatio: 0.39,
                      preservedSections: ['核心意图', '关键实体', '决策点']
                    },
                    {
                      id: '3',
                      timestamp: '2024-01-15 14:20:45',
                      strategy: '语义压缩',
                      originalTokens: 5200,
                      compressedTokens: 1800,
                      compressionRatio: 0.35,
                      preservedSections: ['完整语义结构', '重要时间节点', '状态变更']
                    }
                  ].map((record) => (
                    <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{record.strategy}</span>
                        <span className="text-xs text-gray-500">{record.timestamp}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                        <div>原始: {record.originalTokens} tokens</div>
                        <div>压缩: {record.compressedTokens} tokens</div>
                        <div className="col-span-2">
                          压缩率: <span className="font-medium text-green-600">{Math.round(record.compressionRatio * 100)}%</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        <span className="font-medium">保留内容:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {record.preservedSections.map(section => (
                            <span key={section} className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowSuccessMessage(`正在加载压缩记录 ${record.id} 的原始内容...`);
                          setTimeout(() => setShowSuccessMessage(null), 3000);
                        }}
                        className="w-full text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        查看原始内容
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 溯源查看器 */}
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-3">溯源查看器</h6>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">选择压缩片段进行溯源</label>
                    <select className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg">
                      <option value="">选择要查看的压缩片段...</option>
                      <option value="summary_1">用户询问产品价格相关信息</option>
                      <option value="summary_2">技术支持问题处理流程</option>
                      <option value="summary_3">订单状态查询对话</option>
                    </select>
                  </div>

                  {/* 溯源结果示例 */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">原始位置:</span> 对话轮次 #15-18 (2024-01-15 14:25:30)
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">压缩前内容:</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded p-2 text-xs text-gray-700 mb-3 max-h-32 overflow-y-auto">
                      用户: 我想了解一下你们的企业版价格，我们公司大概有200人...
                      <br />
                      助手: 感谢您的咨询！针对200人规模的企业，我们有专门的企业版套餐...
                      <br />
                      用户: 这个价格包含哪些功能呢？
                      <br />
                      助手: 企业版包含以下功能：1. 无限用户数量...
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      <span className="font-medium">压缩后内容:</span>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-700">
                      用户咨询200人规模企业版价格和功能详情，已提供企业版套餐信息
                    </div>

                    {/* 溯源操作 */}
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                        恢复原始片段
                      </button>
                      <button className="flex-1 text-xs px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                        导出对比
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 溯源配置 */}
            <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
              <h6 className="text-sm font-medium text-gray-700 mb-3">溯源配置选项</h6>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">历史记录保留期限</label>
                  <select className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="7">7天</option>
                    <option value="30">30天</option>
                    <option value="90">90天</option>
                    <option value="365">1年</option>
                    <option value="-1">永久保留</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">索引粒度</label>
                  <select className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="sentence">句子级别</option>
                    <option value="paragraph">段落级别</option>
                    <option value="turn">对话轮次</option>
                    <option value="topic">主题片段</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">存储策略</label>
                  <select className="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="memory">内存缓存</option>
                    <option value="local">本地存储</option>
                    <option value="database">数据库</option>
                    <option value="cloud">云端备份</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4 text-green-600" defaultChecked />
                  启用自动溯源索引生成
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4 text-green-600" defaultChecked />
                  保留关键实体和时间戳映射
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="w-4 h-4 text-green-600" />
                  允许用户手动标记重要片段
                </label>
              </div>
            </div>
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
            showExamples={false}
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
  showExamples?: boolean; // 新增参数控制是否显示使用示例
}

const TemplateModal: React.FC<TemplateModalProps> = ({ template, onSave, onClose, showExamples = false }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || '',
    content: template?.content || '',
    slots: template?.slots || [] as PromptTemplate['slots']
  });

  // 增强字段支持PromptManagement格式
  const [enhancedFormData, setEnhancedFormData] = useState({
    displayName: template?.name || '',
    version: '1.0.0',
    author: 'System',
    tags: [template?.category || ''].filter(Boolean),
    examples: [] as PromptExample[],
    parameter: {
      category: template?.category || '',
      isBuiltIn: false
    }
  });

  const [newSlot, setNewSlot] = useState<Partial<SlotType>>({
    name: '',
    description: '',
    type: 'text',
    required: false
  });

  const [newExample, setNewExample] = useState<Partial<PromptExample>>({
    title: '',
    description: '',
    scenario: '',
    input: '',
    expectedOutput: ''
  });

  const handleSave = () => {
    // 构造增强的模板数据，支持PromptManagement所有字段
    const templateData: PromptTemplate = {
      id: template?.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    // 同时保存到PromptManagement格式
    const promptManagementData: PromptManagement = {
      id: templateData.id,
      name: formData.name,
      displayName: enhancedFormData.displayName,
      description: formData.description,
      version: enhancedFormData.version,
      parameter: {
        ...enhancedFormData.parameter,
        category: formData.category
      },
      slots: formData.slots.map(slot => slot.name),
      example: enhancedFormData.examples,
      content: formData.content,
      category: formData.category,
      createdAt: templateData.createdAt,
      updatedAt: templateData.updatedAt,
      author: enhancedFormData.author,
      tags: enhancedFormData.tags,
      isBuiltIn: false,
      usageCount: 0
    };

    // 保存到store的promptManagement
    const store = useCreationStore.getState();
    if (template) {
      store.updatePrompt(template.id, promptManagementData);
    } else {
      store.createPrompt(promptManagementData);
    }

    onSave(templateData);
  };

  const addSlot = () => {
    if (newSlot.name && newSlot.description) {
      const slot: SlotType = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

  // 示例管理方法
  const addExample = () => {
    if (newExample.title && newExample.description && newExample.scenario) {
      const example: PromptExample = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newExample.title!,
        description: newExample.description!,
        scenario: newExample.scenario!,
        input: { content: newExample.input || '' },
        expectedOutput: newExample.expectedOutput || '',
        metadata: {
          difficulty: 'basic' as const,
          tags: [],
          createdAt: new Date().toISOString()
        }
      };
      setEnhancedFormData(prev => ({
        ...prev,
        examples: [...prev.examples, example]
      }));
      setNewExample({ title: '', description: '', scenario: '', input: '', expectedOutput: '' });
    }
  };

  const removeExample = (exampleId: string) => {
    setEnhancedFormData(prev => ({
      ...prev,
      examples: prev.examples.filter(example => example.id !== exampleId)
    }));
  };

  // 标签管理方法
  const addTag = (tag: string) => {
    if (tag && !enhancedFormData.tags.includes(tag)) {
      setEnhancedFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setEnhancedFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
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
            <label className="block text-sm font-medium text-gray-700 mb-2">模板名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：客服专员模板"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
            <input
              type="text"
              value={enhancedFormData.displayName}
              onChange={(e) => setEnhancedFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="用于显示的友好名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">选择分类</option>
              <option value="客户服务">客户服务</option>
              <option value="技术支持">技术支持</option>
              <option value="销售咨询">销售咨询</option>
              <option value="人力资源">人力资源</option>
              <option value="产品推荐">产品推荐</option>
              <option value="问题解答">问题解答</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">版本</label>
            <input
              type="text"
              value={enhancedFormData.version}
              onChange={(e) => setEnhancedFormData(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：1.0.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">模板描述 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="详细描述此模板的用途和适用场景"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
            <input
              type="text"
              value={enhancedFormData.author}
              onChange={(e) => setEnhancedFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="模板创建者"
            />
          </div>
        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {enhancedFormData.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="添加标签"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
            />
            <button
              type="button"
              onClick={(e) => {
                const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                addTag(input.value);
                input.value = '';
              }}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              添加
            </button>
          </div>
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

        {/* 使用示例管理 - 仅在Prompt管理中显示 */}
        {showExamples && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">使用示例</label>
              <span className="text-xs text-gray-500">{enhancedFormData.examples.length} 个示例</span>
            </div>

          {/* 现有示例 */}
          <div className="space-y-3 mb-4">
            {enhancedFormData.examples.map((example, index) => (
              <div key={example.id || index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 mb-1">{example.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{example.description}</div>
                    <div className="text-xs text-gray-500">场景: {example.scenario}</div>
                  </div>
                  <button
                    onClick={() => removeExample(example.id!)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {example.input && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">输入示例: </span>
                    <span className="text-gray-700">{typeof example.input === 'string' ? example.input : example.input.content || JSON.stringify(example.input)}</span>
                  </div>
                )}
                {example.expectedOutput && (
                  <div className="mt-1 text-xs">
                    <span className="text-gray-500">期望输出: </span>
                    <span className="text-gray-700">{example.expectedOutput}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 添加新示例 */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="示例标题"
                value={newExample.title}
                onChange={(e) => setNewExample(prev => ({ ...prev, title: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="适用场景"
                value={newExample.scenario}
                onChange={(e) => setNewExample(prev => ({ ...prev, scenario: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="示例描述"
                value={newExample.description}
                onChange={(e) => setNewExample(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <textarea
                placeholder="输入示例（可选）"
                value={newExample.input}
                onChange={(e) => setNewExample(prev => ({ ...prev, input: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
              <textarea
                placeholder="期望输出（可选）"
                value={newExample.expectedOutput}
                onChange={(e) => setNewExample(prev => ({ ...prev, expectedOutput: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <button
              onClick={addExample}
              disabled={!newExample.title || !newExample.description || !newExample.scenario}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="h-4 w-4" />
              添加示例
            </button>
          </div>
        </div>
        )}
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
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

// Prompt创建/编辑模态框组件
interface PromptModalProps {
  prompt?: PromptManagement | null;
  onSave: (promptData: Omit<PromptManagement, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>) => void;
  onClose: () => void;
  loadingStates?: Record<string, boolean>;
}

const PromptModal: React.FC<PromptModalProps> = ({ prompt, onSave, onClose, loadingStates = {} }) => {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    displayName: prompt?.displayName || '',
    description: prompt?.description || '',
    category: prompt?.category || '',
    content: prompt?.content || '',
    version: prompt?.version || '1.0.0',
    author: prompt?.author || 'System',
    tags: prompt?.tags || [],
    slots: prompt?.slots || [],
    example: prompt?.example || [],
    parameter: prompt?.parameter || {}
  });

  const [newTag, setNewTag] = useState('');
  const [newSlot, setNewSlot] = useState('');
  const [newExample, setNewExample] = useState<Partial<PromptExample>>({
    title: '',
    description: '',
    scenario: '',
    input: '',
    expectedOutput: ''
  });

  const handleSave = () => {
    onSave(formData);
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addSlot = () => {
    if (newSlot && !formData.slots.includes(newSlot)) {
      setFormData(prev => ({
        ...prev,
        slots: [...prev.slots, newSlot]
      }));
      setNewSlot('');
    }
  };

  const removeSlot = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      slots: prev.slots.filter(s => s !== slot)
    }));
  };

  const addExample = () => {
    if (newExample.title && newExample.description && newExample.scenario) {
      const example: PromptExample = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newExample.title!,
        description: newExample.description!,
        scenario: newExample.scenario!,
        input: { content: newExample.input || '' },
        expectedOutput: newExample.expectedOutput || '',
        metadata: {
          difficulty: 'basic' as const,
          tags: [],
          createdAt: new Date().toISOString()
        }
      };
      setFormData(prev => ({
        ...prev,
        example: [...prev.example, example]
      }));
      setNewExample({ title: '', description: '', scenario: '', input: '', expectedOutput: '' });
    }
  };

  const removeExample = (exampleId: string) => {
    setFormData(prev => ({
      ...prev,
      example: prev.example.filter(example => example.id !== exampleId)
    }));
  };

  return (
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {prompt ? '编辑Prompt' : '新建Prompt'}
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt名称 *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：客服专员Prompt"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">显示名称</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="用于显示的友好名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类 *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">选择分类</option>
              <option value="客户服务">客户服务</option>
              <option value="技术支持">技术支持</option>
              <option value="销售咨询">销售咨询</option>
              <option value="人力资源">人力资源</option>
              <option value="产品推荐">产品推荐</option>
              <option value="问题解答">问题解答</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">版本</label>
            <input
              type="text"
              value={formData.version}
              onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="例：1.0.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prompt描述 *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="详细描述此Prompt的用途和适用场景"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">作者</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Prompt创建者"
            />
          </div>
        </div>

        {/* 标签管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="添加标签"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
            <button
              type="button"
              onClick={addTag}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              添加
            </button>
          </div>
        </div>

        {/* Prompt内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Prompt内容 *</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            rows={8}
            placeholder="输入Prompt内容..."
          />
        </div>

        {/* Slot管理 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">关联Slots</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.slots.map((slot, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                {slot}
                <button
                  type="button"
                  onClick={() => removeSlot(slot)}
                  className="text-green-500 hover:text-green-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
              placeholder="添加Slot名称"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSlot();
                }
              }}
            />
            <button
              type="button"
              onClick={addSlot}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              添加
            </button>
          </div>
        </div>

        {/* 使用示例管理 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">使用示例</label>
            <span className="text-xs text-gray-500">{formData.example.length} 个示例</span>
          </div>

          {/* 现有示例 */}
          <div className="space-y-3 mb-4">
            {formData.example.map((example, index) => (
              <div key={example.id || index} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 mb-1">{example.title}</div>
                    <div className="text-xs text-gray-600 mb-2">{example.description}</div>
                    <div className="text-xs text-gray-500">场景: {example.scenario}</div>
                  </div>
                  <button
                    onClick={() => removeExample(example.id!)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {example.input && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">输入示例: </span>
                    <span className="text-gray-700">{typeof example.input === 'string' ? example.input : example.input.content || JSON.stringify(example.input)}</span>
                  </div>
                )}
                {example.expectedOutput && (
                  <div className="mt-1 text-xs">
                    <span className="text-gray-500">期望输出: </span>
                    <span className="text-gray-700">{example.expectedOutput}</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 添加新示例 */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                placeholder="示例标题"
                value={newExample.title}
                onChange={(e) => setNewExample(prev => ({ ...prev, title: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
              <input
                type="text"
                placeholder="适用场景"
                value={newExample.scenario}
                onChange={(e) => setNewExample(prev => ({ ...prev, scenario: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="mb-3">
              <textarea
                placeholder="示例描述"
                value={newExample.description}
                onChange={(e) => setNewExample(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <textarea
                placeholder="输入示例（可选）"
                value={newExample.input}
                onChange={(e) => setNewExample(prev => ({ ...prev, input: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
              <textarea
                placeholder="期望输出（可选）"
                value={newExample.expectedOutput}
                onChange={(e) => setNewExample(prev => ({ ...prev, expectedOutput: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                rows={2}
              />
            </div>
            <button
              onClick={addExample}
              disabled={!newExample.title || !newExample.description || !newExample.scenario}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <Plus className="h-4 w-4" />
              添加示例
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
          disabled={!formData.name || !formData.content || loadingStates.savePrompt}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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

export default PromptConfig;