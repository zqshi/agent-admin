/**
 * 阶段导航组件
 */

import React from 'react';
import { CheckCircle, Circle, User, Brain, Settings } from 'lucide-react';
import type { CreationStage } from '../types';

interface Stage {
  id: string;
  title: string;
  description: string;
}

interface StageNavigatorProps {
  stages: Stage[];
  currentStage: CreationStage;
  stageProgress: Record<CreationStage, boolean>;
  onStageClick: (stageId: string) => void;
}

const StageNavigator: React.FC<StageNavigatorProps> = ({
  stages,
  currentStage,
  stageProgress,
  onStageClick
}) => {
  // 阶段图标映射
  const stageIcons = {
    basic: User,
    features: Brain,
    advanced: Settings
  };

  // 获取阶段状态
  const getStageStatus = (stageId: string, index: number) => {
    const currentIndex = stages.findIndex(s => s.id === currentStage);

    if (stageProgress[stageId as CreationStage]) {
      return 'completed';
    } else if (stageId === currentStage) {
      return 'current';
    } else if (index < currentIndex) {
      return 'incomplete';
    } else {
      return 'pending';
    }
  };

  // 检查是否可点击
  const isClickable = (stageId: string, index: number) => {
    const currentIndex = stages.findIndex(s => s.id === currentStage);
    return index <= currentIndex || stageProgress[stageId as CreationStage];
  };

  return (
    <div className="flex items-center justify-between max-w-4xl mx-auto">
      {stages.map((stage, index) => {
        const Icon = stageIcons[stage.id as keyof typeof stageIcons] || Circle;
        const status = getStageStatus(stage.id, index);
        const clickable = isClickable(stage.id, index);
        const isActive = stage.id === currentStage;

        return (
          <React.Fragment key={stage.id}>
            {/* 阶段节点 */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => clickable && onStageClick(stage.id)}
                className={`relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  status === 'completed'
                    ? 'border-green-500 bg-green-500 text-white'
                    : status === 'current'
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : status === 'incomplete'
                    ? 'border-orange-300 bg-orange-50 text-orange-600'
                    : 'border-gray-300 bg-gray-50 text-gray-400'
                } ${
                  clickable
                    ? 'hover:scale-105 cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                disabled={!clickable}
              >
                {status === 'completed' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <Icon className="h-6 w-6" />
                )}

                {/* 活动指示器 */}
                {isActive && (
                  <div className="absolute -inset-1 border-2 border-blue-300 rounded-full animate-pulse" />
                )}
              </button>

              {/* 阶段信息 */}
              <div className="mt-3 text-center">
                <h3 className={`text-sm font-medium ${
                  isActive
                    ? 'text-blue-600'
                    : status === 'completed'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}>
                  {stage.title}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-32">
                  {stage.description}
                </p>
              </div>
            </div>

            {/* 连接线 */}
            {index < stages.length - 1 && (
              <div className="flex-1 mx-4">
                <div className={`h-0.5 transition-colors duration-300 ${
                  getStageStatus(stages[index + 1].id, index + 1) === 'completed' ||
                  index < stages.findIndex(s => s.id === currentStage)
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StageNavigator;