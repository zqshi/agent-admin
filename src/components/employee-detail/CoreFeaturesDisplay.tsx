/**
 * 核心特征展示组件
 * 用于在详情页展示和编辑数字员工的核心特征
 */

import React, { useState } from 'react';
import {
  Brain, Zap, MessageCircle, Star, TrendingUp, Info, Eye, EyeOff, Activity, Target, Edit3, Save, X, Palette, Settings,
  // MBTI图标
  Microscope, Crown, Heart, Feather, Sparkles, Package, Shield, Briefcase, Users, Wrench, Compass, Rocket, Music, MessageSquare
} from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';
import type { PersonalityTraits, WorkStyle, CommunicationStyle, MBTIProfile, PersonalityConfigMode } from '../../features/employee-creation/types';
import { mbtiTypes, personalityTemplates, workStyleOptions, communicationOptions, UI_STYLES, mbtiIcons } from '../../features/employee-creation/data/personalityData';
import { Tooltip } from '../common';

interface CoreFeaturesDisplayProps {
  employee: DigitalEmployee;
  onEmployeeChange?: (updatedEmployee: DigitalEmployee) => void;
}

const CoreFeaturesDisplay: React.FC<CoreFeaturesDisplayProps> = ({
  employee,
  onEmployeeChange
}) => {
  // 独立编辑状态
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);
  const [isApplyingMBTI, setIsApplyingMBTI] = useState(false);

  // 配置模式状态
  const [configMode, setConfigMode] = useState<PersonalityConfigMode>(() => {
    return employee?.coreFeatures?.personalityMode || 'custom';
  });

  // 当employee数据变化时，同步配置模式状态
  React.useEffect(() => {
    if (!isInternalEditing) {
      const currentMode = employee?.coreFeatures?.personalityMode || 'custom';
      setConfigMode(currentMode);
    }
  }, [employee?.coreFeatures?.personalityMode, isInternalEditing]);

  // 获取当前选中的模板（用于快速模式回显）
  const getCurrentSelectedTemplate = () => {
    const currentFeatures = getCurrentFeatures();
    if (!currentFeatures || currentFeatures.personalityMode !== 'quick') return null;

    // 通过对比当前参数找到匹配的模板
    for (const [key, template] of Object.entries(personalityTemplates)) {
      const isMatch =
        currentFeatures.personality.friendliness === template.personality.friendliness &&
        currentFeatures.personality.professionalism === template.personality.professionalism &&
        currentFeatures.personality.patience === template.personality.patience &&
        currentFeatures.personality.empathy === template.personality.empathy &&
        currentFeatures.workStyle.rigor === template.workStyle.rigor &&
        currentFeatures.workStyle.humor === template.workStyle.humor &&
        currentFeatures.workStyle.proactivity === template.workStyle.proactivity &&
        currentFeatures.workStyle.detailOrientation === template.workStyle.detailOrientation;

      if (isMatch) return key;
    }
    return null;
  };

  // 展开状态管理
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personality: true,
    workStyle: false,
    communication: false,
    mbti: false
  });

  // 切换展开状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 独立编辑控制
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
    // 确保配置模式状态与当前数据同步
    const currentMode = employee?.coreFeatures?.personalityMode || 'custom';
    setConfigMode(currentMode);
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      console.log('保存核心特征配置:', internalEditedEmployee.coreFeatures);
      // 调用父组件回调更新数据
      if (onEmployeeChange) {
        onEmployeeChange(internalEditedEmployee);
      }
      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
    // 重置配置模式状态为原始数据
    const currentMode = employee?.coreFeatures?.personalityMode || 'custom';
    setConfigMode(currentMode);
  };

  // 获取当前核心特征数据
  const getCurrentFeatures = () => {
    return internalEditedEmployee?.coreFeatures || employee?.coreFeatures;
  };

  // 更新核心特征
  const updateCoreFeatures = (updates: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        coreFeatures: {
          ...getCurrentFeatures(),
          ...updates
        }
      });
    }
  };

  // 更新性格特征
  const updatePersonality = (field: keyof PersonalityTraits, value: number) => {
    const currentFeatures = getCurrentFeatures();
    updateCoreFeatures({
      personality: {
        ...currentFeatures?.personality,
        [field]: value
      }
    });
  };

  // 更新工作风格
  const updateWorkStyle = (field: keyof WorkStyle, value: string) => {
    const currentFeatures = getCurrentFeatures();
    updateCoreFeatures({
      workStyle: {
        ...currentFeatures?.workStyle,
        [field]: value
      }
    });
  };

  // 更新沟通风格
  const updateCommunication = (field: keyof CommunicationStyle, value: string) => {
    const currentFeatures = getCurrentFeatures();
    updateCoreFeatures({
      communication: {
        ...currentFeatures?.communication,
        [field]: value
      }
    });
  };

  // 切换配置模式
  const handleModeChange = (mode: PersonalityConfigMode) => {
    setConfigMode(mode);
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        coreFeatures: {
          ...getCurrentFeatures(),
          personalityMode: mode
        }
      });
    }
  };

  // 应用MBTI配置
  const applyMBTIConfiguration = async (mbtiType: string) => {
    const mbtiData = mbtiTypes[mbtiType as keyof typeof mbtiTypes];
    if (!mbtiData || !internalEditedEmployee || isApplyingMBTI) return;

    setIsApplyingMBTI(true);

    // 添加短暂延迟，让用户看到选择反馈
    await new Promise(resolve => setTimeout(resolve, 150));

    const currentFeatures = getCurrentFeatures();
    setInternalEditedEmployee({
      ...internalEditedEmployee,
      coreFeatures: {
        ...currentFeatures,
        personality: { ...currentFeatures?.personality, ...mbtiData.mapping.personality },
        workStyle: { ...currentFeatures?.workStyle, ...mbtiData.mapping.workStyle } as WorkStyle,
        communication: { ...currentFeatures?.communication, ...mbtiData.mapping.communication } as CommunicationStyle,
        personalityMode: 'mbti',
        mbtiProfile: {
          energySource: mbtiType[0] as 'E' | 'I',
          infoGathering: mbtiType[1] as 'S' | 'N',
          decisionMaking: mbtiType[2] as 'T' | 'F',
          lifestyle: mbtiType[3] as 'J' | 'P',
          type: mbtiType,
          characteristics: mbtiData.characteristics
        }
      }
    });
    setConfigMode('mbti');

    // 延迟一下再重置状态，让动画完成
    setTimeout(() => {
      setIsApplyingMBTI(false);
    }, 300);
  };

  // 应用人格模板
  const applyPersonalityTemplate = (templateKey: string) => {
    const template = personalityTemplates[templateKey as keyof typeof personalityTemplates];
    if (!template || !internalEditedEmployee) return;

    const currentFeatures = getCurrentFeatures();
    setInternalEditedEmployee({
      ...internalEditedEmployee,
      coreFeatures: {
        ...currentFeatures,
        personality: { ...currentFeatures?.personality, ...template.personality },
        workStyle: { ...currentFeatures?.workStyle, ...template.workStyle } as WorkStyle,
        communication: { ...currentFeatures?.communication, ...template.communication } as CommunicationStyle,
        personalityMode: 'quick'
      }
    });
    setConfigMode('quick');
  };

  // 获取MBTI图标组件
  const getMBTIIcon = (type: string) => {
    const iconName = mbtiIcons[type as keyof typeof mbtiIcons];
    const iconComponents: { [key: string]: React.ComponentType<any> } = {
      Brain, Microscope, Crown, MessageSquare, Heart, Feather, Star, Sparkles,
      Package, Shield, Briefcase, Users, Wrench, Compass, Rocket, Music
    };
    const IconComponent = iconComponents[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <Brain className="h-5 w-5" />;
  };

  // 创建MBTI Tooltip内容
  const createMBTITooltip = (type: string, data: any) => (
    <div className="space-y-3">
      <div className="border-b border-gray-600 pb-2">
        <div className="font-semibold text-white mb-1">
          {type} - {data.name}
        </div>
        <div className="text-gray-300 text-xs">
          {data.description}
        </div>
      </div>

      <div className="space-y-2 text-xs">
        <div>
          <span className="text-purple-300 font-medium">📊 核心优势：</span>
          <div className="text-gray-300 mt-1">
            {data.characteristics.strengths.slice(0, 3).map((strength: string, index: number) => (
              <div key={index}>• {strength}</div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-blue-300 font-medium">💼 适用场景：</span>
          <div className="text-gray-300 mt-1">
            {data.characteristics.idealScenarios.slice(0, 2).map((scenario: string, index: number) => (
              <div key={index}>• {scenario}</div>
            ))}
          </div>
        </div>

        <div>
          <span className="text-green-300 font-medium">🎯 团队角色：</span>
          <div className="text-gray-300">{data.characteristics.teamRole}</div>
        </div>
      </div>
    </div>
  );

  const coreFeatures = getCurrentFeatures();

  // 如果没有核心特征数据，显示提示
  if (!coreFeatures) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <h4 className="text-blue-900 font-medium mb-2">核心特征未配置</h4>
            <p className="text-blue-700 mb-3">
              此数字员工暂未配置核心特征（性格维度、工作风格、沟通特征）。
              这些特征通常在创建阶段进行配置，用于定义数字员工的个性化行为模式。
            </p>
            <div className="text-blue-600 space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>性格维度：友好度、专业度、耐心度、共情能力</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>工作风格：严谨度、幽默程度、主动性、细节关注度</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                <span>沟通特征：回复长度、语言风格、专业程度</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 性格特征滑块组件
  const PersonalitySlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    description: string;
    lowLabel: string;
    highLabel: string;
    disabled?: boolean;
  }> = ({ label, value, onChange, description, lowLabel, highLabel, disabled = false }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-blue-600 font-medium transition-all duration-300 transform">
            {value}/10
          </span>
          {value >= 8 && (
            <Star className="h-3 w-3 text-yellow-500 fill-current animate-pulse" />
          )}
        </div>
      </div>
      <div>
        <input
          type="range"
          min="1"
          max="10"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          disabled={disabled || !isInternalEditing}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider disabled:cursor-not-allowed transition-all duration-300"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(value - 1) * 11.11}%, #e5e7eb ${(value - 1) * 11.11}%, #e5e7eb 100%)`,
            boxShadow: 'none',
            outline: 'none',
            filter: 'none'
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );

  // 选择组件
  const SelectGroup: React.FC<{
    label: string;
    value: string;
    options: Array<{ value: string; label: string; description?: string }>;
    onChange: (value: string) => void;
    description?: string;
    disabled?: boolean;
  }> = ({ label, value, options, onChange, description, disabled = false }) => (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => !disabled && isInternalEditing && onChange(option.value)}
            disabled={disabled || !isInternalEditing}
            className={`relative p-3 text-left border rounded-lg transition-all duration-300 transform ${
              value === option.value
                ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-200 scale-[1.02]'
                : 'border-gray-200 text-gray-700'
            } ${!disabled && isInternalEditing ? 'hover:border-gray-300 cursor-pointer hover:scale-[1.01]' : 'cursor-not-allowed opacity-75'}`}
          >
            {value === option.value && (
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              </div>
            )}
            <div className="font-medium transition-colors duration-200">{option.label}</div>
            {option.description && (
              <div className={`text-sm mt-1 transition-colors duration-200 ${
                value === option.value ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {option.description}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // 获取综合评分
  const getOverallScore = () => {
    if (!coreFeatures.personality) return 0;
    const { personality } = coreFeatures;
    const total = personality.friendliness + personality.professionalism +
                  personality.patience + personality.empathy;
    return Math.round(total / 4 * 10);
  };


  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 头部和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">核心特征配置</h3>
          {isInternalEditing && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑模式
            </span>
          )}
        </div>
        {!isInternalEditing ? (
          <button
            onClick={handleInternalEdit}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Edit3 className="h-4 w-4" />
            编辑
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleInternalCancel}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <X className="h-4 w-4" />
              取消
            </button>
            <button
              onClick={handleInternalSave}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
      {/* 配置模式切换（仅在编辑模式下显示） */}
      {isInternalEditing && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">人格配置模式</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => handleModeChange('quick')}
              className={configMode === 'quick' ? UI_STYLES.MODE_BUTTON_ACTIVE : UI_STYLES.MODE_BUTTON_INACTIVE}
            >
              <div className="flex items-center gap-2 mb-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <span className="font-medium">快速模式</span>
              </div>
              <p className="text-sm text-gray-600">选择预设人格模板，快速配置</p>
            </button>

            <button
              onClick={() => handleModeChange('mbti')}
              className={configMode === 'mbti' ? UI_STYLES.MODE_BUTTON_ACTIVE : UI_STYLES.MODE_BUTTON_INACTIVE}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-medium">MBTI模式</span>
              </div>
              <p className="text-sm text-gray-600">基于MBTI人格类型配置</p>
            </button>

            <button
              onClick={() => handleModeChange('custom')}
              className={configMode === 'custom' ? UI_STYLES.MODE_BUTTON_ACTIVE : UI_STYLES.MODE_BUTTON_INACTIVE}
            >
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <span className="font-medium">自定义模式</span>
              </div>
              <p className="text-sm text-gray-600">细粒度调整各项参数</p>
            </button>
          </div>

          {/* 快速模式 - 人格模板选择 */}
          {configMode === 'quick' && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700">选择人格模板</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(personalityTemplates).map(([key, template]) => {
                  const isSelected = getCurrentSelectedTemplate() === key;
                  return (
                    <button
                      key={key}
                      onClick={() => applyPersonalityTemplate(key)}
                      className={`p-4 border rounded-lg text-left transition-all hover:border-purple-300 ${
                        isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <h6 className="font-medium text-gray-900 mb-1">{template.name}</h6>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      {isSelected && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-purple-600">
                          <Star className="h-3 w-3 fill-current" />
                          <span>当前选中</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MBTI模式 - MBTI类型选择 */}
          {configMode === 'mbti' && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-700">选择MBTI人格类型</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(mbtiTypes).map(([type, data]) => {
                  const isSelected = getCurrentFeatures()?.mbtiProfile?.type === type;
                  return (
                    <Tooltip
                      key={type}
                      content={createMBTITooltip(type, data)}
                      placement="top"
                      delay={500}
                      maxWidth="280px"
                    >
                      <button
                        onClick={() => applyMBTIConfiguration(type)}
                        disabled={isApplyingMBTI}
                        className={`w-full p-3 border rounded-lg text-left transition-all duration-200 hover:border-purple-400 hover:shadow-lg hover:bg-purple-50/50 hover:scale-105 ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-md ring-1 ring-purple-200'
                            : 'border-gray-200'
                        } ${isApplyingMBTI ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`transition-colors duration-200 ${isSelected ? 'text-purple-700' : 'text-purple-600'} hover:text-purple-700`}>
                              {getMBTIIcon(type)}
                            </div>
                            <span className={`font-bold text-sm transition-colors duration-200 ${isSelected ? 'text-purple-700' : 'text-purple-600'} hover:text-purple-700`}>
                              {type}
                            </span>
                          </div>
                          {isSelected && (
                            <Star className="h-3 w-3 text-purple-600 fill-current" />
                          )}
                        </div>
                        <div className={`font-medium text-sm mb-1 transition-colors duration-200 ${isSelected ? 'text-gray-900' : 'text-gray-800'} hover:text-gray-900`}>
                          {data.name}
                        </div>
                        <div className="text-xs text-gray-500 transition-colors duration-200 hover:text-gray-600">{data.characteristics.teamRole}</div>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* 性格特征面板 */}
      <div className={`border border-gray-200 rounded-lg transition-all duration-300 ${
        isApplyingMBTI ? 'ring-2 ring-blue-200 bg-blue-50/30' : ''
      }`}>
        <button
          onClick={() => toggleSection('personality')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Brain className={`h-5 w-5 text-blue-600 transition-all duration-300 ${
              isApplyingMBTI ? 'animate-pulse text-blue-700' : ''
            }`} />
            <div>
              <span className="font-medium text-gray-900">
                性格特征
                {isApplyingMBTI && (
                  <span className="ml-2 text-xs text-blue-600 animate-pulse">正在更新...</span>
                )}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full transition-all duration-300 ${
                  isApplyingMBTI ? 'animate-pulse bg-blue-200' : ''
                }`}>
                  综合评分: {getOverallScore()}/100
                </span>
                {coreFeatures.personalityMode && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {coreFeatures.personalityMode === 'custom' ? '自定义模式' :
                     coreFeatures.personalityMode === 'mbti' ? 'MBTI模式' : '快速模式'}
                  </span>
                )}
                {coreFeatures.personalityMode === 'quick' && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    人格模板
                  </span>
                )}
              </div>
            </div>
          </div>
          {expandedSections.personality ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.personality && (
          <div className="px-4 pb-4 space-y-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonalitySlider
                label="友好度"
                value={coreFeatures.personality.friendliness}
                onChange={(value) => updatePersonality('friendliness', value)}
                description="决定对话的亲和力和温暖程度"
                lowLabel="冷淡"
                highLabel="热情"
              />
              <PersonalitySlider
                label="专业度"
                value={coreFeatures.personality.professionalism}
                onChange={(value) => updatePersonality('professionalism', value)}
                description="体现工作的专业性和权威性"
                lowLabel="随意"
                highLabel="权威"
              />
              <PersonalitySlider
                label="耐心度"
                value={coreFeatures.personality.patience}
                onChange={(value) => updatePersonality('patience', value)}
                description="处理复杂问题时的耐心程度"
                lowLabel="急躁"
                highLabel="耐心"
              />
              <PersonalitySlider
                label="共情能力"
                value={coreFeatures.personality.empathy}
                onChange={(value) => updatePersonality('empathy', value)}
                description="理解和回应用户情感的能力"
                lowLabel="理性"
                highLabel="感性"
              />
            </div>
          </div>
        )}
      </div>

      {/* 工作风格面板 */}
      <div className={`border border-gray-200 rounded-lg transition-all duration-300 ${
        isApplyingMBTI ? 'ring-2 ring-purple-200 bg-purple-50/30' : ''
      }`}>
        <button
          onClick={() => toggleSection('workStyle')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <Zap className={`h-5 w-5 text-purple-600 transition-all duration-300 ${
              isApplyingMBTI ? 'animate-pulse text-purple-700' : ''
            }`} />
            <span className="font-medium text-gray-900">
              工作风格
              {isApplyingMBTI && (
                <span className="ml-2 text-xs text-purple-600 animate-pulse">正在更新...</span>
              )}
            </span>
          </div>
          {expandedSections.workStyle ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.workStyle && (
          <div className="px-4 pb-4 space-y-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectGroup
                label="严谨度"
                value={coreFeatures.workStyle.rigor}
                options={workStyleOptions.rigor}
                onChange={(value) => updateWorkStyle('rigor', value)}
                description="对规则和流程的执行程度"
              />
              <SelectGroup
                label="幽默程度"
                value={coreFeatures.workStyle.humor}
                options={workStyleOptions.humor}
                onChange={(value) => updateWorkStyle('humor', value)}
                description="在对话中使用幽默的频率"
              />
              <SelectGroup
                label="主动性"
                value={coreFeatures.workStyle.proactivity}
                options={workStyleOptions.proactivity}
                onChange={(value) => updateWorkStyle('proactivity', value)}
                description="主动提供帮助和建议的程度"
              />
              <SelectGroup
                label="细节关注度"
                value={coreFeatures.workStyle.detailOrientation}
                options={workStyleOptions.detailOrientation}
                onChange={(value) => updateWorkStyle('detailOrientation', value)}
                description="对细节问题的关注程度"
              />
            </div>
          </div>
        )}
      </div>

      {/* 沟通特征面板 */}
      <div className={`border border-gray-200 rounded-lg transition-all duration-300 ${
        isApplyingMBTI ? 'ring-2 ring-green-200 bg-green-50/30' : ''
      }`}>
        <button
          onClick={() => toggleSection('communication')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <MessageCircle className={`h-5 w-5 text-green-600 transition-all duration-300 ${
              isApplyingMBTI ? 'animate-pulse text-green-700' : ''
            }`} />
            <span className="font-medium text-gray-900">
              沟通特征
              {isApplyingMBTI && (
                <span className="ml-2 text-xs text-green-600 animate-pulse">正在更新...</span>
              )}
            </span>
          </div>
          {expandedSections.communication ? (
            <EyeOff className="h-4 w-4 text-gray-500" />
          ) : (
            <Eye className="h-4 w-4 text-gray-500" />
          )}
        </button>

        {expandedSections.communication && (
          <div className="px-4 pb-4 space-y-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectGroup
                label="回复长度"
                value={coreFeatures.communication.responseLength}
                options={communicationOptions.responseLength}
                onChange={(value) => updateCommunication('responseLength', value)}
              />
              <SelectGroup
                label="语言风格"
                value={coreFeatures.communication.language}
                options={communicationOptions.language}
                onChange={(value) => updateCommunication('language', value)}
              />
              <SelectGroup
                label="专业程度"
                value={coreFeatures.communication.technicality}
                options={communicationOptions.technicality}
                onChange={(value) => updateCommunication('technicality', value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* MBTI人格展示（非编辑模式下） */}
      {coreFeatures.mbtiProfile && !isInternalEditing && (
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('mbti')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-indigo-600" />
              <div>
                <span className="font-medium text-gray-900">MBTI人格类型</span>
                <div className="text-xs text-indigo-600 mt-1">
                  {coreFeatures.mbtiProfile.type} - {coreFeatures.mbtiProfile.characteristics?.teamRole || '未定义'}
                </div>
              </div>
            </div>
            {expandedSections.mbti ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.mbti && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-indigo-600 text-lg">{coreFeatures.mbtiProfile.type}</span>
                  <span className="font-medium text-gray-900">{coreFeatures.mbtiProfile.characteristics?.teamRole}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {coreFeatures.mbtiProfile.characteristics?.strengths && (
                    <div>
                      <span className="font-medium text-indigo-800">核心优势：</span>
                      <div className="text-indigo-700 mt-1">
                        {coreFeatures.mbtiProfile.characteristics.strengths.join('、')}
                      </div>
                    </div>
                  )}
                  {coreFeatures.mbtiProfile.characteristics?.communication && (
                    <div>
                      <span className="font-medium text-indigo-800">沟通风格：</span>
                      <div className="text-indigo-700 mt-1">
                        {coreFeatures.mbtiProfile.characteristics.communication.join('、')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};

export default CoreFeaturesDisplay;