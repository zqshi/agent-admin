/**
 * 浮动智能助手组件
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Lightbulb,
  X,
  Minimize2,
  Maximize2,
  AlertTriangle,
  CheckCircle,
  Zap,
  TrendingUp,
  Info,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { useCreationStore } from '../stores/creationStore';
import type { ConfigSuggestion } from '../types';

interface FloatingSmartAssistantProps {
  isVisible: boolean;
  onToggle: () => void;
}

const FloatingSmartAssistant: React.FC<FloatingSmartAssistantProps> = ({
  isVisible,
  onToggle
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [width, setWidth] = useState(400);
  const [height, setHeight] = useState(600);

  const {
    suggestions,
    validation,
    autoAppliedChanges,
    currentStage,
    basicInfo,
    coreFeatures,
    applySuggestion,
    dismissSuggestion,
    generateSmartConfig
  } = useCreationStore();

  const [isGenerating, setIsGenerating] = useState(false);

  // 处理ESC键关闭
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onToggle();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [isVisible, onToggle]);

  // 触发智能配置生成
  const handleGenerateConfig = async () => {
    if (!basicInfo?.primaryRole) return;

    setIsGenerating(true);
    try {
      await generateSmartConfig(basicInfo.primaryRole, basicInfo.responsibilities || []);
    } finally {
      setIsGenerating(false);
    }
  };

  // 获取建议图标
  const getSuggestionIcon = (type: ConfigSuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'optimization':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'enhancement':
        return <Lightbulb className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取建议颜色
  const getSuggestionColor = (type: ConfigSuggestion['type']) => {
    switch (type) {
      case 'improvement':
        return 'border-blue-200 bg-blue-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'optimization':
        return 'border-purple-200 bg-purple-50';
      case 'enhancement':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  // 触发按钮
  const TriggerButton = () => (
    <button
      onClick={onToggle}
      className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
        suggestions.length > 0 || (validation && !validation.isValid)
          ? 'bg-yellow-500 hover:bg-yellow-600 animate-pulse'
          : 'bg-blue-600 hover:bg-blue-700'
      } text-white`}
      title="智能助手"
    >
      {suggestions.length > 0 || (validation && !validation.isValid) ? (
        <div className="relative">
          <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
          <div className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-ping" />
        </div>
      ) : (
        <HelpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      )}
    </button>
  );

  // 助手面板
  const AssistantPanel = () => (
    <div
      className="fixed bottom-16 sm:bottom-6 right-4 sm:right-20 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300"
      style={{
        width: isMinimized ? Math.min(320, window.innerWidth - 32) : Math.min(width, window.innerWidth - 32),
        height: isMinimized ? 60 : Math.min(height, window.innerHeight - 120),
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 80px)'
      }}
    >
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">智能助手</h3>
          {(suggestions.length > 0 || (validation && !validation.isValid)) && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title={isMinimized ? '展开' : '最小化'}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4" style={{ height: Math.min(height, window.innerHeight - 120) - 60 }}>
          {/* 智能配置生成 */}
          {currentStage === 'basic' && basicInfo?.primaryRole && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                <Zap className="h-4 w-4 text-blue-600" />
                智能配置生成
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-3">
                基于您选择的职责"{basicInfo.primaryRole}"，为您智能生成推荐配置
              </p>
              <button
                onClick={handleGenerateConfig}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4" />
                )}
                {isGenerating ? '生成中...' : '生成智能配置'}
              </button>
            </div>
          )}

          {/* 验证结果 */}
          {validation && (
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 text-green-600" />
                验证结果
              </h4>
              <div className="space-y-2">
                {validation.isValid ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    当前配置有效（评分: {validation.score}/100）
                  </div>
                ) : (
                  <div className="space-y-1">
                    {validation.errors.map((error, index) => (
                      <div key={index} className="flex items-start gap-2 text-red-600 text-sm">
                        <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{error.message}</span>
                      </div>
                    ))}
                  </div>
                )}
                {validation.warnings.map((warning, index) => (
                  <div key={index} className="flex items-start gap-2 text-yellow-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{warning.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 智能建议 */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2 text-sm sm:text-base">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                智能建议 ({suggestions.length})
              </h4>
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-3 ${getSuggestionColor(suggestion.type)}`}
                  >
                    <div className="flex items-start gap-2">
                      {getSuggestionIcon(suggestion.type)}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-gray-900">
                          {suggestion.title}
                        </h5>
                        <p className="text-xs text-gray-600 mt-1">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {suggestion.autoApplicable && (
                            <button
                              onClick={() => applySuggestion(suggestion.field)}
                              className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              应用建议
                            </button>
                          )}
                          <button
                            onClick={() => dismissSuggestion(suggestion.field)}
                            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            忽略
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 当前状态摘要 */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">配置状态</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">基础信息</span>
                <span className={`flex items-center gap-1 ${
                  basicInfo?.name && basicInfo?.primaryRole
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  <CheckCircle className="h-3 w-3" />
                  {basicInfo?.name && basicInfo?.primaryRole ? '已完成' : '待完成'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">核心特征</span>
                <span className={`flex items-center gap-1 ${
                  coreFeatures?.personality
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}>
                  <CheckCircle className="h-3 w-3" />
                  {coreFeatures?.personality ? '已配置' : '待配置'}
                </span>
              </div>
            </div>
          </div>

          {/* 自动应用的更改 */}
          {autoAppliedChanges.length > 0 && (
            <div className="bg-white rounded-lg p-3 sm:p-4 border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">最近更改</h4>
              <div className="space-y-2">
                {autoAppliedChanges.slice(-3).map((change, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>已更新 {change.field}</span>
                    </div>
                    <div className="text-xs text-gray-500 ml-5">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {autoAppliedChanges.length > 3 && (
                  <div className="text-xs text-gray-500 ml-5">
                    还有 {autoAppliedChanges.length - 3} 项更改...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 快速操作 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-3 sm:p-4 border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">快速操作</h4>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1 px-2 rounded hover:bg-white transition-colors">
                📋 查看配置模板
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1 px-2 rounded hover:bg-white transition-colors">
                🔄 重置当前阶段
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1 px-2 rounded hover:bg-white transition-colors">
                💾 保存为模板
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:text-blue-700 py-1 px-2 rounded hover:bg-white transition-colors">
                📤 导出配置
              </button>
            </div>
          </div>

          {/* 帮助提示 */}
          <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
              <Info className="h-4 w-4" />
              提示
            </h4>
            <div className="text-sm text-blue-700 space-y-1">
              {currentStage === 'basic' && (
                <p>填写职责信息后，点击"生成智能配置"获取AI推荐。</p>
              )}
              {currentStage === 'features' && (
                <p>性格特征会影响数字员工的对话风格，建议根据实际工作场景调整。</p>
              )}
              {currentStage === 'advanced' && (
                <p>高级配置是可选的，如果不确定可以使用默认设置，后续可以随时修改。</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 可调整大小的拖拽区域 - 只在桌面端显示 */}
      {!isMinimized && window.innerWidth >= 640 && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 hover:bg-gray-400 transition-colors hidden sm:block"
          style={{
            background: 'linear-gradient(-45deg, transparent 0%, transparent 30%, #9ca3af 30%, #9ca3af 70%, transparent 70%)'
          }}
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startY = e.clientY;
            const startWidth = width;
            const startHeight = height;

            const handleMouseMove = (e: MouseEvent) => {
              const newWidth = Math.max(320, Math.min(startWidth + (e.clientX - startX), window.innerWidth - 100));
              const newHeight = Math.max(400, Math.min(startHeight + (e.clientY - startY), window.innerHeight - 120));
              setWidth(newWidth);
              setHeight(newHeight);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      )}
    </div>
  );

  if (!isVisible) {
    return <TriggerButton />;
  }

  return (
    <>
      <TriggerButton />
      {createPortal(<AssistantPanel />, document.body)}
    </>
  );
};

export default FloatingSmartAssistant;