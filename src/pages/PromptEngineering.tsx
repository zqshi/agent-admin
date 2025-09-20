/**
 * Prompt工程配置页面
 * 集成模板库、Slot管理器、实时预览等功能
 */

import React, { useState, useCallback } from 'react';
import {
  Settings,
  Layers,
  Zap,
  Eye,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Save,
  Download,
  Upload,
  HelpCircle
} from 'lucide-react';

// 导入Prompt工程组件
import {
  PromptTemplateLibrary,
  SlotManager,
  RealtimePreview,
  ConfigModeSelector,
  SlotConfigManager,
  CompressionConfigManager,
  usePromptEngineeringStore,
  type PromptTemplate,
  type SlotDefinition,
  type ConfigMode
} from '../features/prompt-engineering';

// 导入现有的UI组件
import { PageLayout, PageHeader, PageContent, Button } from '../components/ui';

const PromptEngineering: React.FC = () => {
  const store = usePromptEngineeringStore();

  // 布局状态
  const [layout, setLayout] = useState<'split' | 'focus-template' | 'focus-slot' | 'focus-preview'>('split');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // 当前选中的组件
  const [activeComponent, setActiveComponent] = useState<'config' | 'template' | 'slot' | 'compression' | 'preview'>('config');

  // 处理模板选择
  const handleTemplateSelect = useCallback((template: PromptTemplate) => {
    console.log('模板已选择:', template.name);
    // 根据配置模式决定下一步行为
    const currentMode = store.ui.configMode;
    if (currentMode === 'template-based') {
      setActiveComponent('preview');
    } else {
      setActiveComponent('slot');
    }
  }, [store.ui.configMode]);

  // 处理配置模式切换
  const handleConfigModeChange = useCallback((mode: ConfigMode) => {
    console.log('配置模式切换至:', mode);
    // 根据模式调整界面
    if (mode === 'template-based') {
      setActiveComponent('template');
    } else if (mode === 'custom') {
      setActiveComponent('slot');
    }
  }, []);

  // 处理Slot变化
  const handleSlotChange = useCallback((slots: SlotDefinition[]) => {
    console.log('Slot已更新:', slots.length, '个');
  }, []);

  // 处理配置保存
  const handleSaveConfig = useCallback(() => {
    try {
      const config = store.exportConfig();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'prompt-config.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('保存配置失败:', error);
    }
  }, [store]);

  // 处理配置导入
  const handleImportConfig = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = e.target?.result as string;
        store.importConfig(config);
      } catch (error) {
        console.error('导入配置失败:', error);
      }
    };
    reader.readAsText(file);
  }, [store]);

  // 重置配置
  const handleResetConfig = useCallback(() => {
    if (confirm('确定要重置所有配置吗？此操作不可撤销。')) {
      store.resetState();
    }
  }, [store]);

  // 获取布局样式
  const getLayoutStyles = () => {
    switch (layout) {
      case 'focus-template':
        return {
          config: 'hidden',
          template: 'col-span-12',
          slot: 'hidden',
          compression: 'hidden',
          preview: 'hidden'
        };
      case 'focus-slot':
        return {
          config: 'hidden',
          template: 'hidden',
          slot: 'col-span-12',
          compression: 'hidden',
          preview: 'hidden'
        };
      case 'focus-preview':
        return {
          config: 'hidden',
          template: 'hidden',
          slot: 'hidden',
          compression: 'hidden',
          preview: 'col-span-12'
        };
      default: // split
        return {
          config: sidebarCollapsed ? 'hidden' : 'col-span-3',
          template: sidebarCollapsed ? 'col-span-6' : 'col-span-3',
          slot: sidebarCollapsed ? 'col-span-3' : 'col-span-3',
          compression: 'hidden', // 默认隐藏，通过标签页切换
          preview: 'col-span-3'
        };
    }
  };

  const layoutStyles = getLayoutStyles();

  // 渲染工具栏
  const renderToolbar = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {/* 布局切换 */}
        <div className="flex border border-gray-300 rounded-lg">
          <button
            onClick={() => setLayout('split')}
            className={`p-2 ${layout === 'split' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            title="分栏布局"
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('focus-template')}
            className={`p-2 border-l border-gray-300 ${layout === 'focus-template' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            title="专注模板"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('focus-slot')}
            className={`p-2 border-l border-gray-300 ${layout === 'focus-slot' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            title="专注Slot"
          >
            <Zap className="h-4 w-4" />
          </button>
          <button
            onClick={() => setLayout('focus-preview')}
            className={`p-2 border-l border-gray-300 ${layout === 'focus-preview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
            title="专注预览"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* 侧边栏切换 */}
        {layout === 'split' && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}

        {/* 组件切换（分栏模式下） */}
        {layout === 'split' && !sidebarCollapsed && (
          <div className="flex border border-gray-300 rounded-lg">
            {['config', 'template', 'slot', 'compression'].map((component, index) => {
              const labels = {
                config: '配置',
                template: '模板',
                slot: 'Slot',
                compression: '压缩'
              };
              const isActive = activeComponent === component;

              return (
                <button
                  key={component}
                  onClick={() => setActiveComponent(component as any)}
                  className={`px-3 py-1 text-sm ${
                    index > 0 ? 'border-l border-gray-300' : ''
                  } ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {labels[component as keyof typeof labels]}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* 配置管理 */}
        <label className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer" title="导入配置">
          <Upload className="h-4 w-4" />
          <input
            type="file"
            accept=".json"
            onChange={handleImportConfig}
            className="hidden"
          />
        </label>

        <button
          onClick={handleSaveConfig}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          title="导出配置"
        >
          <Download className="h-4 w-4" />
        </button>

        <button
          onClick={handleResetConfig}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          title="重置配置"
        >
          <RotateCcw className="h-4 w-4" />
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        {/* 帮助 */}
        <button
          onClick={() => setShowHelp(true)}
          className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          title="帮助"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        {/* 保存按钮 */}
        <Button
          onClick={handleSaveConfig}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          保存配置
        </Button>
      </div>
    </div>
  );

  // 渲染步骤指示器
  const renderStepIndicator = () => {
    if (layout !== 'split') return null;

    const steps = [
      { id: 'config', label: '配置模式', component: 'config' },
      { id: 'template', label: '选择模板', component: 'template' },
      { id: 'slot', label: '配置Slot', component: 'slot' },
      { id: 'compression', label: '压缩策略', component: 'compression' },
      { id: 'preview', label: '预览结果', component: 'preview' }
    ];

    return (
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center gap-4">
          {steps.map((step, index) => {
            const isActive = activeComponent === step.component;
            const isCompleted = steps.findIndex(s => s.component === activeComponent) > index;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setActiveComponent(step.component as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : isCompleted
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-400 text-white'
                  }`}>
                    {index + 1}
                  </div>
                  {step.label}
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-300' : 'bg-gray-300'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染配置摘要
  const renderConfigSummary = () => {
    const summary = store.getConfigSummary();

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">配置摘要</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">选中模板:</span>
            <div className="font-medium text-gray-900">
              {summary.templateName || '未选择'}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Slot数量:</span>
            <div className="font-medium text-gray-900">{summary.slotCount}</div>
          </div>
          <div>
            <span className="text-gray-600">配置状态:</span>
            <div className={`font-medium ${summary.hasErrors ? 'text-red-600' : 'text-green-600'}`}>
              {summary.hasErrors ? '有错误' : '正常'}
            </div>
          </div>
          <div>
            <span className="text-gray-600">就绪状态:</span>
            <div className={`font-medium ${summary.isReady ? 'text-green-600' : 'text-orange-600'}`}>
              {summary.isReady ? '就绪' : '未就绪'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <PageHeader
        title="Prompt工程配置"
        subtitle="通过可视化工具配置和优化您的Prompt模板"
      />

      <PageContent>
        {renderToolbar()}
        {renderStepIndicator()}
        {renderConfigSummary()}

        {/* 主要内容区域 */}
        <div className="grid grid-cols-12 gap-6 min-h-[600px]">
          {/* 配置模式选择器 */}
          {!layoutStyles.config.includes('hidden') && (layout !== 'split' || activeComponent === 'config') && (
            <div className={`${layout === 'split' ? 'col-span-9' : layoutStyles.config} max-h-[600px] overflow-auto`}>
              <div className="h-full border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">配置模式</h3>
                  <p className="text-sm text-gray-600 mt-1">选择适合的配置方式</p>
                </div>
                <div className="p-4">
                  <ConfigModeSelector
                    onModeChange={handleConfigModeChange}
                    showDescription={true}
                    allowTemplateImport={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 模板库 */}
          {!layoutStyles.template.includes('hidden') && (layout !== 'split' || activeComponent === 'template') && (
            <div className={`${layout === 'split' ? 'col-span-9' : layoutStyles.template} ${layout === 'focus-template' ? '' : 'max-h-[600px] overflow-hidden'}`}>
              <div className="h-full border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">模板库</h3>
                  <p className="text-sm text-gray-600 mt-1">选择或创建Prompt模板</p>
                </div>
                <div className="p-4 h-full overflow-auto">
                  <PromptTemplateLibrary
                    onTemplateSelect={handleTemplateSelect}
                    compact={layout !== 'focus-template'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Slot配置管理器 */}
          {!layoutStyles.slot.includes('hidden') && (layout !== 'split' || activeComponent === 'slot') && (
            <div className={`${layout === 'split' ? 'col-span-9' : layoutStyles.slot} ${layout === 'focus-slot' ? '' : 'max-h-[600px] overflow-hidden'}`}>
              <div className="h-full border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Slot配置</h3>
                  <p className="text-sm text-gray-600 mt-1">配置动态变量和参数</p>
                </div>
                <div className="p-4 h-full overflow-auto">
                  <SlotConfigManager
                    showModeInfo={false}
                    allowTemplateImport={true}
                    compact={layout !== 'focus-slot'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 压缩策略管理器 */}
          {(layout !== 'split' || activeComponent === 'compression') && (
            <div className={`${layout === 'split' ? 'col-span-9' : 'col-span-4'} max-h-[600px] overflow-hidden`}>
              <div className="h-full border border-gray-200 rounded-lg bg-white">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">压缩策略</h3>
                  <p className="text-sm text-gray-600 mt-1">优化Token使用和成本</p>
                </div>
                <div className="p-4 h-full overflow-auto">
                  <CompressionConfigManager
                    showPresets={true}
                    showAdvanced={false}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 实时预览 */}
          <div className={`${layoutStyles.preview} ${layout === 'focus-preview' ? '' : 'max-h-[600px] overflow-hidden'}`}>
            <div className="h-full border border-gray-200 rounded-lg bg-white flex flex-col">
              <RealtimePreview
                layout={layout === 'focus-preview' ? 'full' : 'split'}
                showMetrics={true}
                showSuggestions={true}
                autoCompile={true}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* 帮助弹窗 */}
        {showHelp && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Prompt工程配置帮助</h3>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">使用步骤</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>在模板库中选择合适的Prompt模板，或创建新模板</li>
                    <li>配置模板中的Slot（动态变量），设置默认值和验证规则</li>
                    <li>在预览区域查看编译结果和性能指标</li>
                    <li>根据优化建议调整配置，提升性能和质量</li>
                    <li>保存配置用于创建数字员工</li>
                  </ol>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">Slot类型说明</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div><strong>用户输入:</strong> 需要用户手动输入的值</div>
                    <div><strong>系统变量:</strong> 由系统自动提供的值（如当前时间）</div>
                    <div><strong>API数据:</strong> 从外部API获取的数据</div>
                    <div><strong>计算值:</strong> 基于其他Slot计算得出的值</div>
                    <div><strong>条件值:</strong> 根据条件选择的值</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-2">快捷键</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + S</kbd> 保存配置</div>
                    <div><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + R</kbd> 重新编译</div>
                    <div><kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Ctrl + H</kbd> 显示/隐藏帮助</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageContent>
    </PageLayout>
  );
};

export default PromptEngineering;