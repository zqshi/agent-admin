import { useState } from 'react';
import { 
  Settings, ChevronUp, ChevronDown, Plus, X, Eye, Code, 
  Move, AlertCircle, CheckCircle, Brain, Zap, FileText
} from 'lucide-react';

interface ContextConfig {
  compression: {
    strategy: 'none' | 'truncate' | 'summary' | 'extract';
    trigger: 'rounds' | 'tokens' | 'both';
    thresholds: {
      rounds?: number;
      tokens?: number;
    };
    targetLength?: number;
  };
  slotInjection: {
    enabled: boolean;
    slots: Record<string, {
      value: string;
      source: 'static' | 'dynamic';
      fallback?: string;
    }>;
    errorHandling: 'abort' | 'fallback' | 'ignore';
  };
  sequencing: {
    modules: string[];
    customOrder: boolean;
  };
  memory: {
    read: 'none' | 'full' | 'summary';
    write: 'none' | 'facts' | 'summary';
    crossSession: boolean;
  };
}

interface ContextEngineeringProps {
  config: ContextConfig;
  onChange: (config: ContextConfig) => void;
  groupId: string;
  groupName: string;
}

const ContextEngineering = ({ config, onChange, groupId, groupName }: ContextEngineeringProps) => {
  const [activeTab, setActiveTab] = useState<'compression' | 'slots' | 'sequence' | 'memory'>('compression');
  const [showPreview, setShowPreview] = useState(false);
  const [newSlotKey, setNewSlotKey] = useState('');

  const defaultModules = [
    { id: 'persona', name: '人设角色', description: 'AI助手的角色定义和行为准则' },
    { id: 'tools', name: '工具集', description: '可用的工具和功能列表' },
    { id: 'history', name: '历史记录', description: '过往对话和上下文' },
    { id: 'knowledge', name: '知识库', description: '相关知识和文档' },
    { id: 'constraints', name: '约束条件', description: '操作限制和安全规则' }
  ];

  const updateConfig = (section: keyof ContextConfig, updates: any) => {
    onChange({
      ...config,
      [section]: { ...config[section], ...updates }
    });
  };

  const addSlot = () => {
    if (newSlotKey && !config.slotInjection.slots[newSlotKey]) {
      updateConfig('slotInjection', {
        slots: {
          ...config.slotInjection.slots,
          [newSlotKey]: {
            value: '',
            source: 'static',
            fallback: ''
          }
        }
      });
      setNewSlotKey('');
    }
  };

  const removeSlot = (key: string) => {
    const { [key]: removed, ...remainingSlots } = config.slotInjection.slots;
    updateConfig('slotInjection', { slots: remainingSlots });
  };

  const updateSlot = (key: string, updates: any) => {
    updateConfig('slotInjection', {
      slots: {
        ...config.slotInjection.slots,
        [key]: { ...config.slotInjection.slots[key], ...updates }
      }
    });
  };

  const moveModule = (fromIndex: number, toIndex: number) => {
    const newModules = [...config.sequencing.modules];
    const [moved] = newModules.splice(fromIndex, 1);
    newModules.splice(toIndex, 0, moved);
    updateConfig('sequencing', { modules: newModules });
  };

  const generatePreview = () => {
    // 简化的预览生成逻辑
    const modules = config.sequencing.modules.map(moduleId => {
      const module = defaultModules.find(m => m.id === moduleId);
      return module ? `[${module.name}]` : `[${moduleId}]`;
    });

    let preview = `系统提示词预览 - ${groupName}\n\n`;
    preview += modules.join(' → ') + '\n\n';
    
    if (config.slotInjection.enabled) {
      preview += '动态变量:\n';
      Object.entries(config.slotInjection.slots).forEach(([key, slot]) => {
        preview += `  {{${key}}}: ${slot.value || '${' + slot.source + '}'}\n`;
      });
      preview += '\n';
    }

    if (config.compression.strategy !== 'none') {
      preview += `压缩策略: ${config.compression.strategy}\n`;
      preview += `触发条件: ${config.compression.trigger}\n\n`;
    }

    return preview;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">上下文工程配置</h3>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
        >
          <Eye className="h-4 w-4 mr-1" />
          {showPreview ? '隐藏预览' : '预览效果'}
        </button>
      </div>

      {/* 标签导航 */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'compression', name: '压缩策略', icon: Zap },
          { id: 'slots', name: 'Slot注入', icon: Code },
          { id: 'sequence', name: '序列组织', icon: Move },
          { id: 'memory', name: '记忆策略', icon: FileText }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* 压缩策略配置 */}
      {activeTab === 'compression' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">压缩策略</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'none', name: '无压缩', desc: '保持完整上下文' },
                { id: 'truncate', name: '截断', desc: '简单删除超出部分' },
                { id: 'summary', name: '摘要', desc: '智能压缩为摘要' },
                { id: 'extract', name: '提取', desc: '提取关键信息' }
              ].map(strategy => (
                <label key={strategy.id} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name={`compression-${groupId}`}
                    value={strategy.id}
                    checked={config.compression.strategy === strategy.id}
                    onChange={(e) => updateConfig('compression', { strategy: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{strategy.name}</div>
                    <div className="text-xs text-gray-500">{strategy.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {config.compression.strategy !== 'none' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">触发条件</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'rounds', name: '对话轮数' },
                    { id: 'tokens', name: 'Token数量' },
                    { id: 'both', name: '任一条件' }
                  ].map(trigger => (
                    <label key={trigger.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`trigger-${groupId}`}
                        value={trigger.id}
                        checked={config.compression.trigger === trigger.id}
                        onChange={(e) => updateConfig('compression', { trigger: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-sm">{trigger.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(config.compression.trigger === 'rounds' || config.compression.trigger === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">轮数阈值</label>
                    <input
                      type="number"
                      min="1"
                      value={config.compression.thresholds.rounds || 5}
                      onChange={(e) => updateConfig('compression', { 
                        thresholds: { ...config.compression.thresholds, rounds: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                )}

                {(config.compression.trigger === 'tokens' || config.compression.trigger === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token阈值</label>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={config.compression.thresholds.tokens || 2048}
                      onChange={(e) => updateConfig('compression', { 
                        thresholds: { ...config.compression.thresholds, tokens: parseInt(e.target.value) }
                      })}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                )}
              </div>

              {(config.compression.strategy === 'summary' || config.compression.strategy === 'extract') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">目标长度(字符)</label>
                  <input
                    type="number"
                    min="50"
                    value={config.compression.targetLength || 200}
                    onChange={(e) => updateConfig('compression', { targetLength: parseInt(e.target.value) })}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Slot注入配置 */}
      {activeTab === 'slots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.slotInjection.enabled}
                onChange={(e) => updateConfig('slotInjection', { enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">启用动态变量替换</span>
            </label>
          </div>

          {config.slotInjection.enabled && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">错误处理策略</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'abort', name: '中止', desc: '停止处理' },
                    { id: 'fallback', name: '默认值', desc: '使用备选值' },
                    { id: 'ignore', name: '忽略', desc: '跳过该变量' }
                  ].map(strategy => (
                    <label key={strategy.id} className="flex items-start p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`error-handling-${groupId}`}
                        value={strategy.id}
                        checked={config.slotInjection.errorHandling === strategy.id}
                        onChange={(e) => updateConfig('slotInjection', { errorHandling: e.target.value })}
                        className="mt-1 mr-2"
                      />
                      <div>
                        <div className="text-sm font-medium">{strategy.name}</div>
                        <div className="text-xs text-gray-500">{strategy.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">变量定义</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="变量名"
                      value={newSlotKey}
                      onChange={(e) => setNewSlotKey(e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <button
                      onClick={addSlot}
                      disabled={!newSlotKey}
                      className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(config.slotInjection.slots).map(([key, slot]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">{`{{${key}}}`}</code>
                        <button
                          onClick={() => removeSlot(key)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">值来源</label>
                          <select
                            value={slot.source}
                            onChange={(e) => updateSlot(key, { source: e.target.value })}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          >
                            <option value="static">静态值</option>
                            <option value="dynamic">动态获取</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            {slot.source === 'static' ? '静态值' : '数据源'}
                          </label>
                          <input
                            type="text"
                            value={slot.value}
                            onChange={(e) => updateSlot(key, { value: e.target.value })}
                            placeholder={slot.source === 'static' ? '输入固定值' : 'user.name, utils.date()'}
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      </div>
                      
                      {config.slotInjection.errorHandling === 'fallback' && (
                        <div className="mt-2">
                          <label className="block text-xs text-gray-500 mb-1">默认值</label>
                          <input
                            type="text"
                            value={slot.fallback || ''}
                            onChange={(e) => updateSlot(key, { fallback: e.target.value })}
                            placeholder="当获取失败时的默认值"
                            className="w-full p-1 text-sm border border-gray-300 rounded"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 序列组织配置 */}
      {activeTab === 'sequence' && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={config.sequencing.customOrder}
                onChange={(e) => updateConfig('sequencing', { customOrder: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">自定义模块顺序</span>
            </label>
          </div>

          {config.sequencing.customOrder && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">拖拽调整模块顺序</label>
              <div className="space-y-2">
                {config.sequencing.modules.map((moduleId, index) => {
                  const module = defaultModules.find(m => m.id === moduleId);
                  return (
                    <div key={moduleId} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full flex items-center justify-center mr-3">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-gray-900">{module?.name || moduleId}</div>
                          <div className="text-xs text-gray-500">{module?.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => moveModule(index, Math.max(0, index - 1))}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => moveModule(index, Math.min(config.sequencing.modules.length - 1, index + 1))}
                          disabled={index === config.sequencing.modules.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 记忆策略配置 */}
      {activeTab === 'memory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">读取策略</label>
              <div className="space-y-2">
                {[
                  { id: 'none', name: '不读取', desc: '忽略历史信息' },
                  { id: 'full', name: '完整读取', desc: '加载全部历史' },
                  { id: 'summary', name: '摘要读取', desc: '仅读取摘要' }
                ].map(strategy => (
                  <label key={strategy.id} className="flex items-start p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name={`memory-read-${groupId}`}
                      value={strategy.id}
                      checked={config.memory.read === strategy.id}
                      onChange={(e) => updateConfig('memory', { read: e.target.value })}
                      className="mt-1 mr-2"
                    />
                    <div>
                      <div className="text-sm font-medium">{strategy.name}</div>
                      <div className="text-xs text-gray-500">{strategy.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">写入策略</label>
              <div className="space-y-2">
                {[
                  { id: 'none', name: '不保存', desc: '不记录任何信息' },
                  { id: 'facts', name: '保存事实', desc: '仅记录关键事实' },
                  { id: 'summary', name: '保存摘要', desc: '记录对话摘要' }
                ].map(strategy => (
                  <label key={strategy.id} className="flex items-start p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name={`memory-write-${groupId}`}
                      value={strategy.id}
                      checked={config.memory.write === strategy.id}
                      onChange={(e) => updateConfig('memory', { write: e.target.value })}
                      className="mt-1 mr-2"
                    />
                    <div>
                      <div className="text-sm font-medium">{strategy.name}</div>
                      <div className="text-xs text-gray-500">{strategy.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.memory.crossSession}
                onChange={(e) => updateConfig('memory', { crossSession: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">跨会话记忆</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">启用后将在不同会话间共享记忆信息</p>
          </div>
        </div>
      )}

      {/* 配置预览 */}
      {showPreview && (
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center mb-3">
            <Eye className="h-4 w-4 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">配置预览</span>
          </div>
          <pre className="text-xs text-gray-700 bg-white p-3 rounded border overflow-x-auto">
            {generatePreview()}
          </pre>
        </div>
      )}

      {/* 配置状态提示 */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center text-green-600">
          <CheckCircle className="h-4 w-4 mr-1" />
          <span>配置已保存</span>
        </div>
        <div className="text-gray-500">
          上次更新: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default ContextEngineering;