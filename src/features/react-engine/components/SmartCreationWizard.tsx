/**
 * 智能创建向导主界面
 * 整合三种创建模式：快速、标准、高级
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Zap,
  Settings,
  Cog,
  ArrowRight,
  ArrowLeft,
  Save,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Brain,
  Sparkles
} from 'lucide-react';

import NaturalLanguageInput from './NaturalLanguageInput';
import ReasoningProcess from './ReasoningProcess';
import { ReActEngine } from '../core/ReActEngine';
import { useCreationStore } from '../../employee-creation/stores/creationStore';
import type { SmartCreationWizardProps, CreationSession, CreationMode } from '../types';
import type { CreateDigitalEmployeeForm, DigitalEmployeeManagement } from '../../../types';

const SmartCreationWizard: React.FC<SmartCreationWizardProps> = ({
  mode: initialMode = 'standard',
  onModeChange,
  onSubmit,
  onCancel,
  initialInput = '',
  enableReasoningViz = true
}) => {
  const [currentMode, setCurrentMode] = useState<CreationMode>(initialMode);
  const [currentStep, setCurrentStep] = useState<'input' | 'reasoning' | 'configuring' | 'review'>('input');
  const [session, setSession] = useState<CreationSession | null>(null);
  const [userInput, setUserInput] = useState(initialInput);
  const [isProcessing, setIsProcessing] = useState(false);
  const { openModal } = useCreationStore();
  const [engine] = useState(() => new ReActEngine({ debugMode: true }));

  // 防止背景滚动
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
    };
  }, []);

  // 模式配置
  const modeConfigs = {
    quick: {
      title: '快速创建',
      subtitle: '一句话描述，AI自动生成完整配置',
      icon: Zap,
      color: 'green',
      description: '适合快速原型和简单需求'
    },
    standard: {
      title: '标准创建',
      subtitle: '智能推理过程，可调整配置参数',
      icon: Brain,
      color: 'blue',
      description: '平衡智能化和可控性'
    },
    advanced: {
      title: '高级创建',
      subtitle: '完整向导流程，支持所有高级功能',
      icon: Cog,
      color: 'purple',
      description: '适合复杂需求和专业用户'
    }
  };

  // 处理模式切换
  const handleModeChange = useCallback((newMode: CreationMode) => {
    setCurrentMode(newMode);
    onModeChange(newMode);

    // 重置状态
    setCurrentStep('input');
    setSession(null);
    setIsProcessing(false);
    setShowAdvancedForm(false);
  }, [onModeChange]);

  // 处理用户输入提交
  const handleInputSubmit = useCallback(async (input: string) => {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    setCurrentStep('reasoning');

    try {
      // 创建新会话
      const newSession = engine.createSession(currentMode, input);
      setSession(newSession);

      // 处理输入
      const processedSession = await engine.processInput(newSession.id, input);
      setSession(processedSession);

      // 根据模式决定下一步
      if (currentMode === 'quick') {
        // 快速模式直接完成
        setCurrentStep('review');
      } else if (currentMode === 'advanced') {
        // 高级模式切换到传统表单
        setShowAdvancedForm(true);
      } else {
        // 标准模式进入配置阶段
        setCurrentStep('configuring');
      }
    } catch (error) {
      console.error('处理输入失败:', error);
      // 处理错误
    } finally {
      setIsProcessing(false);
    }
  }, [currentMode, isProcessing, engine]);

  // 处理配置完成
  const handleConfigComplete = useCallback((employee: DigitalEmployeeManagement) => {
    if (session) {
      // 将 DigitalEmployeeManagement 转换为 CreateDigitalEmployeeForm 的部分字段
      const config: Partial<CreateDigitalEmployeeForm> = {
        name: employee.name,
        employeeNumber: employee.employeeNumber,
        description: employee.description,
        department: employee.department,
        systemPrompt: employee.persona.systemPrompt,
        personality: employee.persona.personality,
        responsibilities: employee.persona.responsibilities,
        exampleDialogues: employee.persona.exampleDialogues || [],
        allowedTools: employee.permissions.allowedTools,
        canSelfLearn: employee.permissions.knowledgeManagement.canSelfLearn,
        initialFAQs: employee.knowledgeBase.faqItems,
        promptConfig: employee.promptConfig
      };

      engine.updateSessionConfig(session.id, config);
      setCurrentStep('review');
    }
  }, [session, engine]);

  // 处理最终提交
  const handleFinalSubmit = useCallback(() => {
    if (session?.currentConfig) {
      onSubmit(session.currentConfig as CreateDigitalEmployeeForm);
      engine.cleanupSession(session.id);
    }
  }, [session, onSubmit, engine]);

  // 重新开始
  const handleRestart = useCallback(() => {
    if (session) {
      engine.cleanupSession(session.id);
    }
    setSession(null);
    setCurrentStep('input');
    setUserInput('');
    setIsProcessing(false);
    setShowAdvancedForm(false);
  }, [session, engine]);

  // 渲染模式选择器
  const renderModeSelector = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {(Object.entries(modeConfigs) as [CreationMode, typeof modeConfigs[CreationMode]][]).map(([mode, config]) => {
        const Icon = config.icon;
        const isSelected = currentMode === mode;

        return (
          <button
            key={mode}
            onClick={() => handleModeChange(mode)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left
              ${isSelected
                ? `border-${config.color}-500 bg-${config.color}-50`
                : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                isSelected ? `bg-${config.color}-100` : 'bg-gray-100'
              }`}>
                <Icon className={`h-5 w-5 ${
                  isSelected ? `text-${config.color}-600` : 'text-gray-600'
                }`} />
              </div>
              <h3 className={`font-semibold ${
                isSelected ? `text-${config.color}-900` : 'text-gray-900'
              }`}>
                {config.title}
              </h3>
            </div>
            <p className={`text-sm ${
              isSelected ? `text-${config.color}-700` : 'text-gray-600'
            }`}>
              {config.subtitle}
            </p>
            <p className={`text-xs mt-1 ${
              isSelected ? `text-${config.color}-600` : 'text-gray-500'
            }`}>
              {config.description}
            </p>
          </button>
        );
      })}
    </div>
  );

  // 渲染输入阶段
  const renderInputStage = () => (
    <div className="space-y-6">
      {renderModeSelector()}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {modeConfigs[currentMode].title}
          </h3>
          <p className="text-gray-600">
            {currentMode === 'quick' && '简单描述您的需求，AI将自动为您生成完整的数字员工配置'}
            {currentMode === 'standard' && '详细描述您的需求，AI将通过智能推理为您生成配置，您可以进行调整'}
            {currentMode === 'advanced' && '先通过自然语言描述基本需求，然后进入完整的配置向导'}
          </p>
        </div>

        <NaturalLanguageInput
          value={userInput}
          onChange={setUserInput}
          onSubmit={handleInputSubmit}
          loading={isProcessing}
          placeholder={`例如：我需要一个${currentMode === 'quick' ? '客服助手' : '专业的技术支持专员'}...`}
          enableVoice={true}
          enableSuggestions={true}
        />

        {currentMode !== 'quick' && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Lightbulb className="h-4 w-4" />
              <span className="font-medium">智能提示</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              描述越详细，AI生成的配置越精准。您可以包括部门、职责、性格特点、所需工具等信息。
            </p>
          </div>
        )}
      </div>
    </div>
  );

  // 渲染推理阶段
  const renderReasoningStage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI 智能推理</h3>
            <p className="text-gray-600">正在分析您的需求并生成配置...</p>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-2 text-blue-600">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-sm">思考中...</span>
              </div>
            )}
          </div>
        </div>

        {session && enableReasoningViz && (
          <ReasoningProcess
            steps={session.steps}
            currentStep={session.steps.find(s => s.status === 'processing')?.id}
            showDetails={currentMode !== 'quick'}
            showTimeline={true}
          />
        )}
      </div>
    </div>
  );

  // 渲染配置阶段
  const renderConfiguringStage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">配置调整</h3>
          <p className="text-gray-600">AI已生成基础配置，您可以进行调整优化</p>
        </div>

        {session?.generatedConfig && (
          <div className="space-y-4">
            {/* 配置质量指标 */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {(session.generatedConfig.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">AI置信度</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {(session.generatedConfig.completeness * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">配置完整度</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {(session.generatedConfig.quality * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">配置质量</div>
              </div>
            </div>

            {/* 配置预览 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">配置预览</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">员工姓名:</span>
                  <span className="ml-2 font-medium">{session.generatedConfig.form.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">所属部门:</span>
                  <span className="ml-2 font-medium">{session.generatedConfig.form.department}</span>
                </div>
                <div>
                  <span className="text-gray-600">员工编号:</span>
                  <span className="ml-2 font-medium">{session.generatedConfig.form.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">配置工具:</span>
                  <span className="ml-2 font-medium">
                    {session.generatedConfig.form.allowedTools?.length || 0} 个
                  </span>
                </div>
              </div>
            </div>

            {/* 智能建议 */}
            {session.generatedConfig.suggestions.length > 0 && (
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50">
                <h4 className="font-medium text-amber-900 mb-2">优化建议</h4>
                <div className="space-y-2">
                  {session.generatedConfig.suggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-amber-700">
                      <Lightbulb className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{suggestion.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // 渲染审核阶段
  const renderReviewStage = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">配置完成</h3>
            <p className="text-gray-600">请确认以下配置信息</p>
          </div>
        </div>

        {session?.currentConfig && (
          <div className="space-y-4">
            {/* 基本信息 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">基本信息</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">员工姓名:</span>
                  <span className="ml-2 font-medium">{session.currentConfig.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">员工编号:</span>
                  <span className="ml-2 font-medium">{session.currentConfig.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">所属部门:</span>
                  <span className="ml-2 font-medium">{session.currentConfig.department}</span>
                </div>
                <div>
                  <span className="text-gray-600">性格特点:</span>
                  <span className="ml-2 font-medium">{session.currentConfig.personality}</span>
                </div>
              </div>
            </div>

            {/* 职责和能力 */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">职责和能力</h4>
              {session.currentConfig.responsibilities && session.currentConfig.responsibilities.length > 0 && (
                <div className="mb-3">
                  <span className="text-sm text-gray-600">主要职责:</span>
                  <ul className="mt-1 text-sm">
                    {session.currentConfig.responsibilities.map((resp, index) => (
                      <li key={index} className="text-gray-700">• {resp}</li>
                    ))}
                  </ul>
                </div>
              )}
              {session.currentConfig.allowedTools && session.currentConfig.allowedTools.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">可用工具:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {session.currentConfig.allowedTools.map((tool, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 验证结果 */}
            {session.generatedConfig?.validation && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">配置验证</h4>
                <div className="flex items-center gap-2 mb-2">
                  {session.generatedConfig.validation.isValid ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className={`font-medium ${
                    session.generatedConfig.validation.isValid ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {session.generatedConfig.validation.isValid ? '配置有效' : '配置需要调整'}
                  </span>
                  <span className="text-sm text-gray-600">
                    (评分: {session.generatedConfig.validation.score}/100)
                  </span>
                </div>

                {session.generatedConfig.validation.recommendations.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">建议:</span>
                    <ul className="mt-1 text-sm text-gray-700">
                      {session.generatedConfig.validation.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">智能创建数字员工</h2>
              <p className="text-sm text-gray-600 mt-1">
                {modeConfigs[currentMode].subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* 进度指示器 */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {['input', 'reasoning', 'configuring', 'review'].map((step, index) => {
                const isActive = currentStep === step;
                const isCompleted = ['input', 'reasoning', 'configuring', 'review'].indexOf(currentStep) > index;

                return (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isActive ? 'bg-blue-500 text-white' :
                        isCompleted ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                      }`}>
                      {index + 1}
                    </div>
                    {index < 3 && (
                      <div className={`w-12 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-gray-500">
              {currentStep === 'input' && '输入需求'}
              {currentStep === 'reasoning' && 'AI推理'}
              {currentStep === 'configuring' && '配置调整'}
              {currentStep === 'review' && '确认提交'}
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStep === 'input' && renderInputStage()}
          {currentStep === 'reasoning' && renderReasoningStage()}
          {currentStep === 'configuring' && renderConfiguringStage()}
          {currentStep === 'review' && renderReviewStage()}
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {currentStep !== 'input' && (
              <button
                onClick={handleRestart}
                className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                重新开始
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </button>

            {currentStep === 'configuring' && (
              <button
                onClick={() => setCurrentStep('review')}
                className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                确认配置
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {currentStep === 'review' && (
              <button
                onClick={handleFinalSubmit}
                className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Save className="h-4 w-4" />
                创建数字员工
              </button>
            )}

            {currentMode === 'advanced' && currentStep === 'reasoning' && !isProcessing && (
              <button
                onClick={() => setShowAdvancedForm(true)}
                className="flex items-center gap-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Settings className="h-4 w-4" />
                进入高级配置
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 高级模式表单已集成到统一创建模态框中 */}
    </div>,
    document.body
  );
};

export default SmartCreationWizard;