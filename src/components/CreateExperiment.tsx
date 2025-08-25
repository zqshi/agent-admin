import { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Save, Play, AlertTriangle, CheckCircle, Settings, 
  Users, Target, DollarSign, Clock, Zap, Brain, Copy
} from 'lucide-react';
import ContextEngineering from './ContextEngineering';

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

interface ExperimentGroup {
  id: string;
  name: string;
  description: string;
  trafficRatio: number;
  config: {
    model: string;
    prompt: string;
    temperature: number;
    seed: number;
    tools: string[];
  };
  contextConfig?: ContextConfig;
}

interface CreateExperimentProps {
  onClose: () => void;
  onSave: (experiment: any) => void;
  initialConfig?: any;
}

const CreateExperiment = ({ onClose, onSave, initialConfig }: CreateExperimentProps) => {
  const [experimentName, setExperimentName] = useState(initialConfig?.name || '');
  const [experimentDescription, setExperimentDescription] = useState(initialConfig?.description || '');
  const defaultContextConfig: ContextConfig = {
    compression: {
      strategy: 'none',
      trigger: 'rounds',
      thresholds: { rounds: 5, tokens: 2048 },
      targetLength: 200
    },
    slotInjection: {
      enabled: false,
      slots: {},
      errorHandling: 'fallback'
    },
    sequencing: {
      modules: ['persona', 'tools', 'history', 'knowledge', 'constraints'],
      customOrder: false
    },
    memory: {
      read: 'full',
      write: 'summary',
      crossSession: false
    }
  };

  const [groups, setGroups] = useState<ExperimentGroup[]>([
    {
      id: 'control',
      name: '对照组',
      description: '当前基线配置',
      trafficRatio: 50,
      config: {
        model: 'gpt-4-turbo',
        prompt: '你是一个专业的AI助手，请帮助用户解决问题。',
        temperature: 0.7,
        seed: 12345,
        tools: ['search', 'calculator']
      },
      contextConfig: { ...defaultContextConfig }
    },
    {
      id: 'treatment',
      name: '实验组',
      description: '新的优化配置',
      trafficRatio: 50,
      config: {
        model: 'claude-3-opus',
        prompt: '你是一个专业的AI助手，请提供准确、有用的回答来帮助用户。',
        temperature: 0.7,
        seed: 12345,
        tools: ['search', 'calculator']
      },
      contextConfig: { ...defaultContextConfig, compression: { ...defaultContextConfig.compression, strategy: 'summary' } }
    }
  ]);

  const [experimentConfig, setExperimentConfig] = useState({
    splittingStrategy: initialConfig?.config?.splittingStrategy || 'session',
    stratification: ['user_segment', 'time_of_day'],
    budget: {
      maxCost: initialConfig?.config?.budget?.maxCost || 1000,
      alertThresholds: [0.5, 0.8, 0.95]
    },
    duration: {
      minDays: 7,
      maxDays: 30,
      autoStop: true
    },
    metrics: {
      primary: 'task_success_rate',
      secondary: ['response_time', 'user_satisfaction', 'token_cost']
    },
    stopCriteria: {
      statistical: true,
      practical: true,
      pValue: 0.05,
      minEffectSize: 0.2
    }
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const availableModels = [
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', cost: 0.01 },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', cost: 0.002 },
    { id: 'claude-3-opus', name: 'Claude-3 Opus', cost: 0.015 },
    { id: 'claude-3-sonnet', name: 'Claude-3 Sonnet', cost: 0.003 },
    { id: 'llama-2-70b', name: 'Llama 2 70B', cost: 0.0007 }
  ];

  const availableTools = [
    { id: 'search', name: '网络搜索', description: '搜索最新信息' },
    { id: 'calculator', name: '计算器', description: '数学计算' },
    { id: 'code_interpreter', name: '代码解释器', description: '执行代码' },
    { id: 'file_reader', name: '文件读取', description: '读取文档' },
    { id: 'image_analysis', name: '图像分析', description: '分析图片' }
  ];

  // 更新实验组配置
  const updateGroupConfig = (groupId: string, field: string, value: any) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, config: { ...group.config, [field]: value } }
        : group
    ));
  };

  // 更新流量分配
  const updateTrafficRatio = (groupId: string, ratio: number) => {
    const otherGroups = groups.filter(g => g.id !== groupId);
    const remainingRatio = 100 - ratio;
    const avgRemainingRatio = remainingRatio / otherGroups.length;

    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, trafficRatio: ratio }
        : { ...group, trafficRatio: avgRemainingRatio }
    ));
  };

  // 更新上下文配置
  const updateGroupContextConfig = (groupId: string, contextConfig: ContextConfig) => {
    setGroups(groups.map(group => 
      group.id === groupId 
        ? { ...group, contextConfig }
        : group
    ));
  };

  // 复制配置到其他组
  const copyConfigToGroup = (fromGroupId: string, toGroupId: string) => {
    const fromGroup = groups.find(g => g.id === fromGroupId);
    if (!fromGroup) return;

    setGroups(groups.map(group => 
      group.id === toGroupId 
        ? { ...group, config: { ...fromGroup.config }, contextConfig: fromGroup.contextConfig ? { ...fromGroup.contextConfig } : { ...defaultContextConfig } }
        : group
    ));
  };

  // 验证实验配置
  const validateExperiment = () => {
    setIsValidating(true);
    const errors: string[] = [];

    // 基本信息验证
    if (!experimentName.trim()) {
      errors.push('实验名称不能为空');
    }
    if (!experimentDescription.trim()) {
      errors.push('实验描述不能为空');
    }

    // 流量分配验证
    const totalTraffic = groups.reduce((sum, group) => sum + group.trafficRatio, 0);
    if (Math.abs(totalTraffic - 100) > 0.1) {
      errors.push('流量分配必须总计100%');
    }

    // 组配置验证
    groups.forEach((group, index) => {
      if (!group.config.model) {
        errors.push(`${group.name}必须选择模型`);
      }
      if (!group.config.prompt.trim()) {
        errors.push(`${group.name}的提示词不能为空`);
      }
      if (group.config.temperature < 0 || group.config.temperature > 2) {
        errors.push(`${group.name}的温度参数必须在0-2之间`);
      }
    });

    // 预算验证
    if (experimentConfig.budget.maxCost <= 0) {
      errors.push('最大预算必须大于0');
    }

    setValidationErrors(errors);
    setIsValidating(false);
    return errors.length === 0;
  };

  // 估算实验成本
  const estimateCost = () => {
    // 简化的成本估算逻辑
    const avgTokensPerSession = 2000; // 假设值
    const estimatedSessions = 1000; // 假设值
    
    return groups.reduce((total, group) => {
      const model = availableModels.find(m => m.id === group.config.model);
      const modelCost = model?.cost || 0.01;
      const groupCost = (estimatedSessions * group.trafficRatio / 100) * avgTokensPerSession * modelCost / 1000;
      return total + groupCost;
    }, 0);
  };

  // 保存并启动实验
  const handleSaveAndStart = () => {
    if (!validateExperiment()) {
      return;
    }

    const experiment = {
      id: Date.now().toString(),
      name: experimentName,
      description: experimentDescription,
      status: 'running',
      startDate: new Date().toISOString(),
      groups,
      config: experimentConfig,
      estimatedCost: estimateCost(),
      createdAt: new Date().toISOString()
    };

    onSave(experiment);
  };

  // 保存为草稿
  const handleSaveDraft = () => {
    const experiment = {
      id: Date.now().toString(),
      name: experimentName || '未命名实验',
      description: experimentDescription,
      status: 'draft',
      groups,
      config: experimentConfig,
      estimatedCost: estimateCost(),
      createdAt: new Date().toISOString()
    };

    onSave(experiment);
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">创建A/B实验</h2>
            <p className="text-sm text-gray-600 mt-1">配置实验参数并启动智能测试</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex overflow-hidden" style={{ height: 'calc(95vh - 120px)' }}>
          {/* 主要配置区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* 基本信息 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">实验名称</label>
                    <input
                      type="text"
                      value={experimentName}
                      onChange={(e) => setExperimentName(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="如：GPT-4 vs Claude-3 对比测试"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">主要指标</label>
                    <select 
                      value={experimentConfig.metrics.primary}
                      onChange={(e) => setExperimentConfig({
                        ...experimentConfig,
                        metrics: { ...experimentConfig.metrics, primary: e.target.value }
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="task_success_rate">任务完成率</option>
                      <option value="response_time">响应时间</option>
                      <option value="user_satisfaction">用户满意度</option>
                      <option value="token_cost">Token成本</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">实验描述</label>
                  <textarea
                    value={experimentDescription}
                    onChange={(e) => setExperimentDescription(e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="描述这个实验的目的、假设和预期结果..."
                  />
                </div>
              </div>

              {/* 实验组配置 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">实验组配置</h3>
                  <div className="text-sm text-gray-500">
                    总流量: {groups.reduce((sum, g) => sum + g.trafficRatio, 0).toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-6">
                  {groups.map((group, index) => (
                    <div key={group.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            group.id === 'control' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <input
                              type="text"
                              value={group.name}
                              onChange={(e) => setGroups(groups.map(g => 
                                g.id === group.id ? { ...g, name: e.target.value } : g
                              ))}
                              className="font-medium text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none"
                            />
                            <div className="text-sm text-gray-500 mt-1">{group.description}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-sm">
                            <label className="block text-gray-500">流量分配</label>
                            <div className="flex items-center mt-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={group.trafficRatio}
                                onChange={(e) => updateTrafficRatio(group.id, parseFloat(e.target.value))}
                                className="w-16 p-1 text-center border border-gray-300 rounded"
                              />
                              <span className="ml-1 text-gray-500">%</span>
                            </div>
                          </div>
                          
                          {index > 0 && (
                            <button
                              onClick={() => copyConfigToGroup(groups[0].id, group.id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="复制对照组配置"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 模型选择 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">模型</label>
                          <select
                            value={group.config.model}
                            onChange={(e) => updateGroupConfig(group.id, 'model', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          >
                            {availableModels.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.name} (${model.cost}/1K tokens)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* 温度参数 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">温度</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="2"
                            value={group.config.temperature}
                            onChange={(e) => updateGroupConfig(group.id, 'temperature', parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        {/* 随机种子 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">种子</label>
                          <input
                            type="number"
                            value={group.config.seed}
                            onChange={(e) => updateGroupConfig(group.id, 'seed', parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                          />
                        </div>

                        {/* 工具选择 */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">工具</label>
                          <div className="text-xs text-gray-500">
                            已选择: {group.config.tools.length} 个工具
                          </div>
                        </div>
                      </div>

                      {/* 提示词配置 */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">系统提示词</label>
                        <textarea
                          value={group.config.prompt}
                          onChange={(e) => updateGroupConfig(group.id, 'prompt', e.target.value)}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-md text-sm"
                          placeholder="输入系统提示词..."
                        />
                      </div>

                      {/* 工具详细选择 */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">可用工具</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {availableTools.map(tool => (
                            <label key={tool.id} className="flex items-center p-2 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                              <input
                                type="checkbox"
                                checked={group.config.tools.includes(tool.id)}
                                onChange={(e) => {
                                  const tools = e.target.checked
                                    ? [...group.config.tools, tool.id]
                                    : group.config.tools.filter(t => t !== tool.id);
                                  updateGroupConfig(group.id, 'tools', tools);
                                }}
                                className="mr-2"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{tool.name}</div>
                                <div className="text-xs text-gray-500">{tool.description}</div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 上下文工程配置 */}
                      <div className="mt-6">
                        <ContextEngineering
                          config={group.contextConfig || defaultContextConfig}
                          onChange={(contextConfig) => updateGroupContextConfig(group.id, contextConfig)}
                          groupId={group.id}
                          groupName={group.name}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 高级配置 */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">高级配置</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 分流策略 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">分流策略</label>
                    <div className="space-y-2">
                      {[
                        { id: 'session', label: '会话级分流', desc: '每个会话保持一致' },
                        { id: 'user', label: '用户级分流', desc: '用户始终在同一组' }
                      ].map(strategy => (
                        <label key={strategy.id} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="splittingStrategy"
                            value={strategy.id}
                            checked={experimentConfig.splittingStrategy === strategy.id}
                            onChange={(e) => setExperimentConfig({
                              ...experimentConfig,
                              splittingStrategy: e.target.value
                            })}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{strategy.label}</div>
                            <div className="text-sm text-gray-500">{strategy.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 停止条件 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">自动停止条件</label>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={experimentConfig.stopCriteria.statistical}
                          onChange={(e) => setExperimentConfig({
                            ...experimentConfig,
                            stopCriteria: { ...experimentConfig.stopCriteria, statistical: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">达到统计显著性</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={experimentConfig.stopCriteria.practical}
                          onChange={(e) => setExperimentConfig({
                            ...experimentConfig,
                            stopCriteria: { ...experimentConfig.stopCriteria, practical: e.target.checked }
                          })}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">达到实际意义阈值</span>
                      </label>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div>
                          <label className="block text-xs text-gray-500">P值阈值</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="0.1"
                            value={experimentConfig.stopCriteria.pValue}
                            onChange={(e) => setExperimentConfig({
                              ...experimentConfig,
                              stopCriteria: { ...experimentConfig.stopCriteria, pValue: parseFloat(e.target.value) }
                            })}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">最小效果量</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="1"
                            value={experimentConfig.stopCriteria.minEffectSize}
                            onChange={(e) => setExperimentConfig({
                              ...experimentConfig,
                              stopCriteria: { ...experimentConfig.stopCriteria, minEffectSize: parseFloat(e.target.value) }
                            })}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 预算控制 */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">预算控制</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最大预算 (USD)</label>
                      <input
                        type="number"
                        value={experimentConfig.budget.maxCost}
                        onChange={(e) => setExperimentConfig({
                          ...experimentConfig,
                          budget: { ...experimentConfig.budget, maxCost: parseFloat(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最小运行天数</label>
                      <input
                        type="number"
                        value={experimentConfig.duration.minDays}
                        onChange={(e) => setExperimentConfig({
                          ...experimentConfig,
                          duration: { ...experimentConfig.duration, minDays: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最大运行天数</label>
                      <input
                        type="number"
                        value={experimentConfig.duration.maxDays}
                        onChange={(e) => setExperimentConfig({
                          ...experimentConfig,
                          duration: { ...experimentConfig.duration, maxDays: parseInt(e.target.value) }
                        })}
                        className="w-full p-2 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 验证错误 */}
              {validationErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-800">配置验证失败</span>
                  </div>
                  <ul className="space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* 侧边栏 - 预览和操作 */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* 实验预览 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">实验预览</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">实验组数</span>
                      <span className="font-medium">{groups.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">主要指标</span>
                      <span className="font-medium">{experimentConfig.metrics.primary}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">分流策略</span>
                      <span className="font-medium">
                        {experimentConfig.splittingStrategy === 'session' ? '会话级' : '用户级'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">预估成本</span>
                      <span className="font-medium text-green-600">${estimateCost().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 流量分配图 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">流量分配</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    {groups.map(group => (
                      <div key={group.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            group.id === 'control' ? 'bg-blue-500' : 'bg-green-500'
                          }`}></div>
                          <span className="text-sm text-gray-700">{group.name}</span>
                        </div>
                        <span className="text-sm font-medium">{group.trafficRatio}%</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* 简单的进度条可视化 */}
                  <div className="mt-4">
                    <div className="flex h-4 bg-gray-200 rounded-full overflow-hidden">
                      {groups.map((group, index) => (
                        <div 
                          key={group.id}
                          className={group.id === 'control' ? 'bg-blue-500' : 'bg-green-500'}
                          style={{ width: `${group.trafficRatio}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 预算状态 */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">预算状态</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">最大预算</span>
                      <span className="font-medium">${experimentConfig.budget.maxCost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">预估花费</span>
                      <span className="font-medium text-orange-600">${estimateCost().toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">预算使用率</span>
                      <span className="font-medium">
                        {Math.round((estimateCost() / experimentConfig.budget.maxCost) * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  {estimateCost() > experimentConfig.budget.maxCost && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-center text-red-700 text-sm">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        预估成本超出预算
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="space-y-3">
                <button
                  onClick={handleSaveAndStart}
                  disabled={validationErrors.length > 0 || isValidating}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="h-4 w-4 mr-2" />
                  保存并启动实验
                </button>
                
                <button
                  onClick={handleSaveDraft}
                  className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存为草稿
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
              </div>

              {/* 提示信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <div className="font-medium mb-1">提示</div>
                    <div>
                      启动实验后，系统将自动开始收集数据并进行实时分析。
                      你可以随时在实验面板中查看进展和结果。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateExperiment;