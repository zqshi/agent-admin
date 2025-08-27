import React, { useState, useCallback } from 'react';
import {
  Settings, Shield, Bell, Users, DollarSign, Clock, AlertTriangle,
  CheckCircle, XCircle, Save, RefreshCw, Eye, EyeOff, Info,
  Bot, User, Zap, Lock
} from 'lucide-react';
import { ABTestSystemConfig, DEFAULT_SYSTEM_CONFIG } from '../types/system-config';

interface SystemConfigPanelProps {
  config: ABTestSystemConfig;
  onConfigUpdate: (config: ABTestSystemConfig) => void;
  onSave: () => void;
  isLoading?: boolean;
  hasUnsavedChanges?: boolean;
}

const SystemConfigPanel: React.FC<SystemConfigPanelProps> = ({
  config,
  onConfigUpdate,
  onSave,
  isLoading = false,
  hasUnsavedChanges = false
}) => {
  const [activeSection, setActiveSection] = useState<'creation' | 'approval' | 'notifications' | 'risk'>('creation');
  const [showPreview, setShowPreview] = useState(false);

  // 更新配置的通用方法
  const updateConfig = useCallback((path: string, value: any) => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const keys = path.split('.');
    let current = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    onConfigUpdate(newConfig);
  }, [config, onConfigUpdate]);

  // 重置为默认配置
  const resetToDefault = useCallback(() => {
    onConfigUpdate({ ...DEFAULT_SYSTEM_CONFIG });
  }, [onConfigUpdate]);

  const sections = [
    { id: 'creation', name: '实验创建', icon: Bot, color: 'text-purple-600' },
    { id: 'approval', name: '发布审核', icon: Shield, color: 'text-green-600' },
    { id: 'notifications', name: '通知设置', icon: Bell, color: 'text-blue-600' },
    { id: 'risk', name: '风险控制', icon: AlertTriangle, color: 'text-orange-600' }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* 头部 */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6 text-gray-600" />
              系统配置管理
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              配置A/B测试系统的实验创建、审核流程和风险控制策略
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1 text-orange-600 text-sm">
                <AlertTriangle className="h-4 w-4" />
                有未保存的更改
              </div>
            )}
            
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPreview ? '隐藏预览' : '预览配置'}
            </button>
            
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              重置默认
            </button>
            
            <button
              onClick={onSave}
              disabled={isLoading || !hasUnsavedChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              保存配置
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* 左侧导航 */}
        <div className="w-64 border-r border-gray-200">
          <nav className="p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <section.icon className={`h-5 w-5 ${section.color}`} />
                {section.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 右侧配置内容 */}
        <div className="flex-1 p-6">
          {/* 实验创建配置 */}
          {activeSection === 'creation' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">实验创建配置</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">配置说明</p>
                      <p>控制实验的创建方式和AI自动化程度。关闭人工创建要求后，AI可以根据数据洞察自动创建实验。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 人工创建实验开关 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">需要人工创建实验</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        开启后，所有实验都必须由人工创建。关闭后，AI可以自动创建实验。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateConfig('experimentCreation.requiresHumanCreation', !config.experimentCreation.requiresHumanCreation)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.experimentCreation.requiresHumanCreation ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.experimentCreation.requiresHumanCreation ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI创建权限级别 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <Bot className="h-5 w-5 text-purple-600" />
                    AI自动创建权限级别
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    控制AI可以自动创建的实验类型和风险级别
                  </p>
                </div>
                
                <div className="space-y-2">
                  {[
                    { value: 'disabled', label: '禁用', desc: 'AI无法创建任何实验' },
                    { value: 'low_risk_only', label: '仅低风险', desc: '只允许创建低风险、低成本的实验' },
                    { value: 'full_access', label: '完全权限', desc: 'AI可以创建任何类型的实验' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="aiCreationLevel"
                        value={option.value}
                        checked={config.experimentCreation.aiCreationLevel === option.value}
                        onChange={(e) => updateConfig('experimentCreation.aiCreationLevel', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-500">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 预算限制 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    自动实验预算限制
                  </h4>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">$</span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={config.experimentCreation.autoExperimentBudgetLimit}
                      onChange={(e) => updateConfig('experimentCreation.autoExperimentBudgetLimit', parseInt(e.target.value))}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    最大并发自动实验
                  </h4>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={config.experimentCreation.maxConcurrentAutoExperiments}
                    onChange={(e) => updateConfig('experimentCreation.maxConcurrentAutoExperiments', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 发布审核配置 */}
          {activeSection === 'approval' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">发布审核配置</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">审核流程说明</p>
                      <p>配置实验结束后的上线审核流程。可以设置不同的审核策略，确保实验结果的可靠性。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 人工审核开关 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">需要人工审核上线</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        开启后，所有实验结束都需要人工审核才能上线。关闭后，满足条件的实验会自动上线。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateConfig('deploymentApproval.requiresHumanApproval', !config.deploymentApproval.requiresHumanApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.deploymentApproval.requiresHumanApproval ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.deploymentApproval.requiresHumanApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* AI实验严格审核 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-orange-600" />
                    <div>
                      <h4 className="font-medium text-gray-900">AI实验严格审核</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        对AI创建的实验采用更严格的审核标准，包括更高的置信度要求和人工验证。
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => updateConfig('deploymentApproval.stricterAiExperimentApproval', !config.deploymentApproval.stricterAiExperimentApproval)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        config.deploymentApproval.stricterAiExperimentApproval ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          config.deploymentApproval.stricterAiExperimentApproval ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* 审核超时时间 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  审核超时时间（小时）
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  超过此时间未审核的实验将自动转为需要重新评估状态
                </p>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={config.deploymentApproval.approvalTimeoutHours}
                  onChange={(e) => updateConfig('deploymentApproval.approvalTimeoutHours', parseInt(e.target.value))}
                  className="w-32 p-2 border border-gray-300 rounded-md text-sm"
                />
                <span className="ml-2 text-sm text-gray-500">小时</span>
              </div>
            </div>
          )}

          {/* 通知配置 */}
          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">通知设置</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">通知说明</p>
                      <p>配置各种实验事件的通知方式，确保相关人员及时了解实验状态和决策建议。</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 通知渠道 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-600" />
                  启用的通知渠道
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'in_app', label: '站内消息', icon: Bell },
                    { id: 'email', label: '邮件通知', icon: Bell },
                    { id: 'webhook', label: 'Webhook', icon: Zap },
                    { id: 'slack', label: 'Slack集成', icon: Bell }
                  ].map((channel) => (
                    <label key={channel.id} className="flex items-center p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={config.notifications.enabledChannels.includes(channel.id as any)}
                        onChange={(e) => {
                          const channels = e.target.checked
                            ? [...config.notifications.enabledChannels, channel.id as any]
                            : config.notifications.enabledChannels.filter(c => c !== channel.id);
                          updateConfig('notifications.enabledChannels', channels);
                        }}
                        className="mr-3"
                      />
                      <channel.icon className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">{channel.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 决策通知 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    智能决策通知
                  </h4>
                  <button
                    onClick={() => updateConfig('notifications.decisionNotification.enabled', !config.notifications.decisionNotification.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.notifications.decisionNotification.enabled ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.notifications.decisionNotification.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  当AI给出实验决策建议时，自动通知相关人员进行审核。
                </p>
              </div>

              {/* 异常告警 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    异常告警通知
                  </h4>
                  <button
                    onClick={() => updateConfig('notifications.anomalyAlert.enabled', !config.notifications.anomalyAlert.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.notifications.anomalyAlert.enabled ? 'bg-orange-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        config.notifications.anomalyAlert.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  检测到实验异常或风险时，立即发送告警通知。
                </p>
              </div>
            </div>
          )}

          {/* 风险控制配置 */}
          {activeSection === 'risk' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">风险控制配置</h3>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div className="text-sm text-orange-800">
                      <p className="font-medium mb-1">风险控制说明</p>
                      <p>设置系统级别的安全限制，防止实验对业务造成过大影响。包括并发限制、预算控制等。</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 最大并发实验 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    最大并发实验数
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    系统同时运行的实验数量上限
                  </p>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={config.riskControl.maxConcurrentExperiments}
                    onChange={(e) => updateConfig('riskControl.maxConcurrentExperiments', parseInt(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>

                {/* 单实验最大预算 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    单实验最大预算
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    单个实验的预算上限（美元）
                  </p>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">$</span>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={config.riskControl.maxExperimentBudget}
                      onChange={(e) => updateConfig('riskControl.maxExperimentBudget', parseInt(e.target.value))}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* 实验流量上限 */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    实验流量上限
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    单个实验可以使用的最大流量百分比
                  </p>
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={config.riskControl.maxExperimentTraffic}
                      onChange={(e) => updateConfig('riskControl.maxExperimentTraffic', parseInt(e.target.value))}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="ml-2 text-sm text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配置预览 */}
      {showPreview && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <h3 className="text-lg font-medium text-gray-900 mb-4">当前配置预览</h3>
          <pre className="bg-white p-4 rounded-lg border border-gray-200 text-sm overflow-x-auto">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SystemConfigPanel;