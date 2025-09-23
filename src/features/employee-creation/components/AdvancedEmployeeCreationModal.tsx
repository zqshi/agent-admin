/**
 * 高级数字员工创建弹窗 - 统一版本
 * 整合了原有的SmartCreationWizard和UnifiedCreationModal功能
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle,
  Sparkles,
  Brain,
  Zap,
  Cog,
  Lightbulb,
  RefreshCw
} from 'lucide-react';

import { useCreationStore } from '../stores/creationStore';
import StageNavigator from './StageNavigator';
import BasicInfoStage from './stages/BasicInfoStage';
import CoreFeaturesStage from './stages/CoreFeaturesStage';
import DomainConfigStage from './stages/DomainConfigStage';
import AdvancedConfigStage from './stages/AdvancedConfigStage';
import FloatingSmartAssistant from './FloatingSmartAssistant';
import NaturalLanguageInput from '../../../features/react-engine/components/NaturalLanguageInput';
import ReasoningProcess from '../../../features/react-engine/components/ReasoningProcess';

import type { DigitalEmployeeManagement } from '../../../types';
import type { CreationStage, CreationSession, ReasoningStep, BasicInfo } from '../types';
import type { ReActStep } from '../../../features/react-engine/types';

export interface AdvancedEmployeeCreationModalProps {
  onSave: (employee: DigitalEmployeeManagement) => void;
  onCancel?: () => void;
  enableAIAssist?: boolean;
  enableReasoningViz?: boolean;
}

// 创建模式配置 - 简化版本
const CREATION_CONFIG = {
  title: '创建数字员工',
  subtitle: '通过向导流程创建和配置您的数字员工',
  showQuickStart: true,
  showNLInput: true
} as const;

const AdvancedEmployeeCreationModal: React.FC<AdvancedEmployeeCreationModalProps> = ({
  onSave,
  onCancel,
  enableAIAssist = true,
  enableReasoningViz = true
}) => {
  // 转换函数：将ReasoningStep转换为ReActStep
  const convertToReActSteps = (steps: ReasoningStep[]): ReActStep[] => {
    return steps.map((step, index) => ({
      id: step.id,
      type: step.type === 'thinking' ? 'reasoning' : 'acting',
      phase: 'config_generation' as const,
      title: step.title,
      content: step.content,
      timestamp: Date.parse(step.timestamp) || Date.now(),
      confidence: 0.8,
      status: step.status as any,
      error: step.status === 'error' ? 'Processing error' : undefined
    }));
  };
  const {
    isModalOpen,
    currentStage,
    stageProgress,
    isProcessing,
    validation,
    closeModal,
    nextStage,
    prevStage,
    validateCurrentStage,
    completeStage,
    toCreateDigitalEmployeeForm,
    reset,
    generateSmartConfig,
    basicInfo
  } = useCreationStore();

  // AI处理状态
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiSession, setAiSession] = useState<CreationSession | null>(null);

  // 浮动智能助手状态
  const [isAssistantVisible, setIsAssistantVisible] = useState(false);

  // 自然语言输入状态 - 修改：默认不显示快速开始界面
  const [nlInput, setNlInput] = useState('');
  const [showNLInput, setShowNLInput] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);

  // 防止背景滚动
  useEffect(() => {
    if (isModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.width = '100%';

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.width = '';
      };
    }
  }, [isModalOpen]);

  // 快速开始处理
  const handleQuickStart = useCallback(() => {
    setShowNLInput(true);
    setShowQuickStart(false);
  }, []);

  // 跳过快速开始，直接进入标准流程
  const handleSkipQuickStart = useCallback(() => {
    setShowQuickStart(false);
    setShowNLInput(false);
  }, []);

  // 自然语言输入处理
  const handleNLInputSubmit = useCallback(async (input: string) => {
    if (!input.trim() || isAIProcessing) return;

    setIsAIProcessing(true);

    try {
      // 分析用户输入，智能填充基础信息
      const parsedInfo = parseUserInput(input);
      if (parsedInfo) {
        const { updateBasicInfo } = useCreationStore.getState();
        updateBasicInfo(parsedInfo);
      }

      // 模拟AI推理过程
      const mockSession: CreationSession = {
        id: Date.now().toString(),
        mode: 'standard',
        userInput: input,
        steps: [
          {
            id: '1',
            type: 'thinking',
            title: '理解需求',
            content: '正在分析用户描述的员工需求...',
            status: 'completed',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'tool_decision',
            title: '推荐配置',
            content: '基于需求生成最优配置...',
            status: 'processing',
            timestamp: new Date().toISOString()
          }
        ],
        currentConfig: null,
        generatedConfig: null
      };

      setAiSession(mockSession);

      // 等待一段时间模拟AI处理
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 生成智能配置
      if (parsedInfo?.primaryRole) {
        const { generateSmartConfig } = useCreationStore.getState();
        await generateSmartConfig(parsedInfo.primaryRole, parsedInfo.responsibilities || []);
      }

      setShowNLInput(false);

    } catch (error) {
      console.error('AI配置生成失败:', error);
    } finally {
      setIsAIProcessing(false);
    }
  }, [isAIProcessing]);

  // 关闭处理 - 修改：默认不显示快速开始界面
  const handleClose = useCallback(() => {
    closeModal();
    reset();
    setShowQuickStart(false);
    setShowNLInput(false);
    setAiSession(null);
    onCancel?.();
  }, [closeModal, reset, onCancel]);

  // 下一步处理
  const handleNext = useCallback(async () => {
    const validationResult = await validateCurrentStage();

    if (validationResult.isValid) {
      completeStage(currentStage);
      nextStage();
    }
  }, [validateCurrentStage, completeStage, currentStage, nextStage]);

  // 最终保存
  const handleSave = useCallback(async () => {
    const validationResult = await validateCurrentStage();

    if (validationResult.isValid) {
      const formData = toCreateDigitalEmployeeForm();

      const newEmployee: DigitalEmployeeManagement = {
        id: Date.now().toString(),
        name: formData.name,
        employeeNumber: formData.employeeNumber,
        description: formData.description,
        status: 'active',
        department: formData.department,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        persona: {
          systemPrompt: formData.systemPrompt,
          personality: formData.personality,
          responsibilities: formData.responsibilities.filter(r => r.trim()),
          exampleDialogues: formData.exampleDialogues || []
        },
        promptConfig: formData.promptConfig,
        permissions: {
          allowedTools: formData.allowedTools,
          resourceAccess: formData.resourcePermissions || [],
          knowledgeManagement: {
            canSelfLearn: formData.canSelfLearn,
            canModifyKnowledge: false
          }
        },
        knowledgeBase: {
          documents: [],
          faqItems: formData.initialFAQs,
          autoLearnedItems: []
        },
        metrics: {
          totalSessions: 0,
          successfulSessions: 0,
          avgResponseTime: 0,
          knowledgeUtilizationRate: 0,
          toolUsageStats: {}
        }
      };

      if (formData.enableMentor && formData.mentorId) {
        newEmployee.mentorConfig = {
          mentorId: formData.mentorId,
          mentorName: 'AI-Manager',
          reportingCycle: formData.reportingCycle as any || 'weekly',
          reportingMethod: formData.reportingMethod || 'document'
        };
      }

      onSave(newEmployee);
      handleClose();
    }
  }, [validateCurrentStage, toCreateDigitalEmployeeForm, onSave, handleClose]);

  // 阶段配置 - 根据是否启用多领域动态调整
  const isMultiDomain = basicInfo?.enableMultiDomain || false;
  const stages = isMultiDomain ? [
    { id: 'basic', title: '基础信息', description: '员工基本信息和职责定义' },
    { id: 'features', title: '核心特征', description: '数字员工的性格特点和工作风格' },
    { id: 'domains', title: '领域配置', description: '多领域能力配置和智能路由设置' }
  ] : [
    { id: 'basic', title: '基础信息', description: '员工基本信息和职责定义' },
    { id: 'features', title: '核心特征', description: '数字员工的性格特点和工作风格' },
    { id: 'advanced', title: '高级配置', description: 'Prompt、知识库、工具等专业设置' }
  ];

  const currentStageIndex = stages.findIndex(s => s.id === currentStage);
  const isFirstStage = currentStageIndex === 0;
  const isLastStage = currentStageIndex === stages.length - 1;

  // 渲染当前阶段内容
  const renderStageContent = () => {
    switch (currentStage) {
      case 'basic':
        return <BasicInfoStage />;
      case 'features':
        return <CoreFeaturesStage />;
      case 'domains':
        return <DomainConfigStage />;
      case 'advanced':
        return <AdvancedConfigStage />;
      default:
        return null;
    }
  };

  // 获取下一步按钮文本
  const getNextButtonText = () => {
    if (isLastStage) return '创建数字员工';
    return '下一步';
  };

  // 检查是否可以进行下一步
  const canProceed = () => {
    return !isProcessing && (!validation || validation.isValid);
  };

  if (!isModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0">
          <div className="min-w-0 flex-1 mr-4">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                创建数字员工
              </h2>
              {isMultiDomain && (
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                  多领域模式
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1 text-sm sm:text-base line-clamp-2">
              {stages[currentStageIndex]?.description}
            </p>
            {isMultiDomain && currentStage === 'domains' && (
              <div className="mt-1 text-xs text-indigo-600">
                📌 领域配置包含完整的高级配置功能
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isProcessing || isAIProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 阶段导航 */}
        <div className="px-3 py-2 border-b border-gray-200 flex-shrink-0">
          <StageNavigator
            stages={stages}
            currentStage={currentStage}
            stageProgress={stageProgress}
            onStageClick={(stageId) => {
              const clickedIndex = stages.findIndex(s => s.id === stageId);
              if (clickedIndex <= currentStageIndex || stageProgress[stageId as keyof typeof stageProgress]) {
                useCreationStore.getState().setStage(stageId as any);
              }
            }}
          />
        </div>

        {/* 主要内容区域 */}
        <div className="flex-1 overflow-y-auto p-3">
          {renderStageContent()}
        </div>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0 gap-2">
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            {/* 进度信息 */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>第 {currentStageIndex + 1} / {stages.length} 步</span>
              {isMultiDomain && (
                <span className="text-indigo-600 font-medium">多领域模式</span>
              )}
            </div>

            {/* 进度条 */}
            <div className="w-32 sm:w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  isMultiDomain
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
                style={{ width: `${((currentStageIndex + 1) / stages.length) * 100}%` }}
              />
            </div>

            {/* 验证状态 */}
            {validation && !validation.isValid && (
              <div className="text-red-600 text-xs sm:text-sm truncate">
                {validation.errors.length} 个错误需要修复
              </div>
            )}
            {validation && validation.isValid && (
              <div className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">当前阶段验证通过</span>
                <span className="sm:hidden">验证通过</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={handleClose}
              className="px-3 py-2 sm:px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm"
              disabled={isProcessing || isAIProcessing}
            >
              取消
            </button>

            {/* 标准导航按钮 */}
            {!isFirstStage && (
              <button
                onClick={prevStage}
                className="flex items-center gap-1 px-3 py-2 sm:px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-sm transition-all duration-200 text-sm"
                disabled={isProcessing}
              >
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">上一步</span>
              </button>
            )}

            <button
              onClick={isLastStage ? handleSave : handleNext}
              disabled={!canProceed()}
              className={`flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg transition-all duration-200 text-sm whitespace-nowrap font-medium shadow-sm hover:shadow-md ${
                canProceed()
                  ? isLastStage
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                    : isMultiDomain
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isLastStage ? (
                <Save className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <span className="hidden sm:inline">{getNextButtonText()}</span>
              <span className="sm:hidden">{isLastStage ? '创建' : '下一步'}</span>
            </button>
          </div>
        </div>

        {/* 浮动智能助手 */}
        {enableAIAssist && (
          <FloatingSmartAssistant
            isVisible={isAssistantVisible}
            onToggle={() => setIsAssistantVisible(!isAssistantVisible)}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

// 解析用户输入的辅助函数
function parseUserInput(input: string): Partial<BasicInfo> | null {
  if (!input.trim()) return null;

  const result: Partial<BasicInfo> = {};

  // 简单的角色提取逻辑
  const rolePatterns = [
    /(?:我需要|想要|创建).*?([^，。,\s]+)(?:专员|助手|顾问|客服|销售|技术|分析师|经理)/g,
    /(?:负责|处理|管理)([^，。,\s]+)/g
  ];

  for (const pattern of rolePatterns) {
    const match = pattern.exec(input);
    if (match && match[1]) {
      result.primaryRole = match[1].trim();
      break;
    }
  }

  // 如果没有明确的角色，尝试从常见关键词推断
  if (!result.primaryRole) {
    if (input.includes('客服') || input.includes('咨询') || input.includes('服务')) {
      result.primaryRole = '客服专员';
    } else if (input.includes('销售') || input.includes('推广')) {
      result.primaryRole = '销售顾问';
    } else if (input.includes('技术') || input.includes('支持')) {
      result.primaryRole = '技术支持专员';
    } else {
      result.primaryRole = '通用助手';
    }
  }

  // 生成基本信息
  result.name = `数字${result.primaryRole}`;
  result.employeeId = `DE${Date.now().toString().slice(-6)}`;
  result.department = '数字化部门';
  result.description = input.length > 20 ? input.substring(0, 100) + '...' : input;
  result.responsibilities = [result.primaryRole || '协助用户解决问题'];
  result.serviceScope = ['在线咨询', '问题解答'];
  result.autoSuggest = true;

  return result;
}

export default AdvancedEmployeeCreationModal;