/**
 * 推理过程可视化组件
 * 展示 ReAct 引擎的推理和行动步骤
 */

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Eye,
  Settings,
  Loader2,
  Lightbulb,
  Target,
  Cog
} from 'lucide-react';
import type { ReasoningProcessProps, ReActStep } from '../types';

const ReasoningProcess: React.FC<ReasoningProcessProps> = ({
  steps,
  currentStep,
  showDetails = true,
  showTimeline = true,
  onStepClick,
  className = ''
}) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [animatingSteps, setAnimatingSteps] = useState<Set<string>>(new Set());

  // 自动展开当前步骤
  useEffect(() => {
    if (currentStep) {
      setExpandedSteps(prev => new Set([...prev, currentStep]));
    }
  }, [currentStep]);

  // 处理步骤状态变化动画
  useEffect(() => {
    steps.forEach(step => {
      if (step.status === 'processing') {
        setAnimatingSteps(prev => new Set([...prev, step.id]));
      } else {
        setAnimatingSteps(prev => {
          const newSet = new Set(prev);
          newSet.delete(step.id);
          return newSet;
        });
      }
    });
  }, [steps]);

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepIcon = (step: ReActStep) => {
    const iconProps = { className: "h-4 w-4" };

    if (step.status === 'processing') {
      return <Loader2 {...iconProps} className="h-4 w-4 animate-spin" />;
    }

    if (step.status === 'error') {
      return <AlertCircle {...iconProps} className="h-4 w-4 text-red-500" />;
    }

    if (step.status === 'completed') {
      return <CheckCircle {...iconProps} className="h-4 w-4 text-green-500" />;
    }

    // 根据步骤类型和阶段选择图标
    switch (step.phase) {
      case 'intent_analysis':
        return step.type === 'reasoning' ? <Brain {...iconProps} /> : <Eye {...iconProps} />;
      case 'requirement_derivation':
        return step.type === 'reasoning' ? <Lightbulb {...iconProps} /> : <Target {...iconProps} />;
      case 'config_generation':
        return step.type === 'reasoning' ? <Settings {...iconProps} /> : <Cog {...iconProps} />;
      case 'optimization':
        return <Zap {...iconProps} />;
      case 'validation':
        return <CheckCircle {...iconProps} />;
      default:
        return step.type === 'reasoning' ? <Brain {...iconProps} /> : <Zap {...iconProps} />;
    }
  };

  const getStepColor = (step: ReActStep) => {
    if (step.status === 'error') return 'red';
    if (step.status === 'completed') return 'green';
    if (step.status === 'processing') return 'blue';
    if (step.type === 'reasoning') return 'purple';
    return 'orange';
  };

  const getPhaseLabel = (phase: ReActStep['phase']) => {
    const labels = {
      intent_analysis: '意图分析',
      requirement_derivation: '需求推导',
      config_generation: '配置生成',
      optimization: '智能优化',
      validation: '配置验证'
    };
    return labels[phase] || phase;
  };

  const getTypeLabel = (type: ReActStep['type']) => {
    return type === 'reasoning' ? '推理' : '行动';
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const renderStepContent = (step: ReActStep) => {
    const isExpanded = expandedSteps.has(step.id);

    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-3 overflow-hidden">
        {/* 步骤头部 */}
        <div
          className={`p-4 cursor-pointer transition-all duration-200 ${
            step.id === currentStep ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-gray-50'
          } ${animatingSteps.has(step.id) ? 'animate-pulse' : ''}`}
          onClick={() => {
            toggleStepExpansion(step.id);
            onStepClick?.(step);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 步骤图标 */}
              <div className={`flex items-center justify-center w-8 h-8 rounded-full
                ${step.status === 'error' ? 'bg-red-100' :
                  step.status === 'completed' ? 'bg-green-100' :
                  step.status === 'processing' ? 'bg-blue-100' :
                  step.type === 'reasoning' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                {getStepIcon(step)}
              </div>

              {/* 步骤信息 */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{step.title}</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium
                    ${step.type === 'reasoning'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-orange-100 text-orange-700'
                    }`}>
                    {getTypeLabel(step.type)}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                    {getPhaseLabel(step.phase)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{step.content}</p>
              </div>
            </div>

            {/* 右侧状态和控制 */}
            <div className="flex items-center gap-2">
              {/* 置信度 */}
              {step.confidence !== undefined && (
                <div className="text-xs text-gray-500">
                  置信度: {(step.confidence * 100).toFixed(0)}%
                </div>
              )}

              {/* 处理时间 */}
              {step.duration && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {formatDuration(step.duration)}
                </div>
              )}

              {/* 展开/收起图标 */}
              {showDetails && (
                <div className="text-gray-400">
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 步骤详情 */}
        {showDetails && isExpanded && (
          <div className="border-t border-gray-100">
            <div className="p-4 space-y-4">
              {/* 时间信息 */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>开始时间: {formatTimestamp(step.timestamp)}</span>
                {step.duration && <span>耗时: {formatDuration(step.duration)}</span>}
              </div>

              {/* 输入数据 */}
              {step.input && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">输入数据</h5>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {typeof step.input === 'string' ? step.input : JSON.stringify(step.input, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* 输出结果 */}
              {step.output && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">输出结果</h5>
                  <div className="bg-blue-50 rounded-lg p-3">
                    {step.phase === 'intent_analysis' && step.output.entities ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">主要意图:</span>
                            <span className="ml-2 text-blue-700">{step.output.primaryIntent}</span>
                          </div>
                          <div>
                            <span className="font-medium">置信度:</span>
                            <span className="ml-2 text-blue-700">{(step.output.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        {step.output.entities.name && (
                          <div className="text-sm">
                            <span className="font-medium">识别的员工名称:</span>
                            <span className="ml-2 text-blue-700">{step.output.entities.name}</span>
                          </div>
                        )}
                        {step.output.entities.department && (
                          <div className="text-sm">
                            <span className="font-medium">所属部门:</span>
                            <span className="ml-2 text-blue-700">{step.output.entities.department}</span>
                          </div>
                        )}
                        {step.output.entities.responsibilities && step.output.entities.responsibilities.length > 0 && (
                          <div className="text-sm">
                            <span className="font-medium">职责列表:</span>
                            <ul className="ml-4 mt-1">
                              {step.output.entities.responsibilities.map((resp: string, index: number) => (
                                <li key={index} className="text-blue-700">• {resp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : step.phase === 'config_generation' && step.output.form ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">配置质量:</span>
                            <span className="ml-2 text-blue-700">{(step.output.quality * 100).toFixed(0)}%</span>
                          </div>
                          <div>
                            <span className="font-medium">完整度:</span>
                            <span className="ml-2 text-blue-700">{(step.output.completeness * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">生成的员工名称:</span>
                          <span className="ml-2 text-blue-700">{step.output.form.name}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">员工编号:</span>
                          <span className="ml-2 text-blue-700">{step.output.form.employeeNumber}</span>
                        </div>
                      </div>
                    ) : (
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {typeof step.output === 'string' ? step.output : JSON.stringify(step.output, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}

              {/* 错误信息 */}
              {step.error && (
                <div>
                  <h5 className="font-medium text-red-900 mb-2">错误信息</h5>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-700">{step.error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">推理过程</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>共 {steps.length} 个步骤</span>
          {steps.filter(s => s.status === 'completed').length > 0 && (
            <span>• 已完成 {steps.filter(s => s.status === 'completed').length} 个</span>
          )}
        </div>
      </div>

      {/* 时间轴视图 */}
      {showTimeline && steps.length > 0 && (
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* 步骤列表 */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* 时间轴节点 */}
                <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white z-10
                  ${step.status === 'error' ? 'bg-red-500' :
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'processing' ? 'bg-blue-500' :
                    'bg-gray-300'
                  }`}>
                </div>

                {/* 步骤内容 */}
                <div className="ml-8">
                  {renderStepContent(step)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无时间轴的简单列表视图 */}
      {!showTimeline && (
        <div className="space-y-3">
          {steps.map(step => (
            <div key={step.id}>
              {renderStepContent(step)}
            </div>
          ))}
        </div>
      )}

      {/* 空状态 */}
      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>暂无推理步骤</p>
          <p className="text-sm mt-1">开始输入需求后将显示AI的推理过程</p>
        </div>
      )}

      {/* 统计信息 */}
      {steps.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">推理统计</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">推理步骤:</span>
              <span className="ml-2 font-medium">{steps.filter(s => s.type === 'reasoning').length}</span>
            </div>
            <div>
              <span className="text-gray-600">行动步骤:</span>
              <span className="ml-2 font-medium">{steps.filter(s => s.type === 'acting').length}</span>
            </div>
            <div>
              <span className="text-gray-600">总耗时:</span>
              <span className="ml-2 font-medium">
                {formatDuration(steps.reduce((acc, step) => acc + (step.duration || 0), 0))}
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均置信度:</span>
              <span className="ml-2 font-medium">
                {steps.length > 0
                  ? (steps.reduce((acc, step) => acc + step.confidence, 0) / steps.length * 100).toFixed(0)
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReasoningProcess;