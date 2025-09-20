/**
 * 核心特征阶段组件
 */

import React, { useEffect, useState } from 'react';
import { Brain, MessageCircle, Zap, TrendingUp, Info, Star, Sparkles } from 'lucide-react';
import { useCreationStore } from '../../stores/creationStore';
import type { CoreFeatures, PersonalityTraits, WorkStyle, CommunicationStyle } from '../../types';

const CoreFeaturesStage: React.FC = () => {
  const {
    coreFeatures,
    basicInfo,
    updateCoreFeatures,
    suggestions,
    smartSuggestions,
    getSmartSuggestionsByType
  } = useCreationStore();

  // 本地状态
  const [localFeatures, setLocalFeatures] = useState<CoreFeatures>({
    personality: {
      friendliness: 5,
      professionalism: 5,
      patience: 5,
      empathy: 5
    },
    workStyle: {
      rigor: 'balanced',
      humor: 'occasional',
      proactivity: 'balanced',
      detailOrientation: 'medium'
    },
    communication: {
      responseLength: 'moderate',
      language: 'neutral',
      technicality: 'moderate'
    },
    ...coreFeatures
  });

  // 同步到store
  useEffect(() => {
    const timer = setTimeout(() => {
      updateCoreFeatures(localFeatures);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFeatures, updateCoreFeatures]);

  // 获取AI推荐的性格配置
  const getAIPersonalityRecommendation = () => {
    const personalitySuggestions = getSmartSuggestionsByType('personality');
    return personalitySuggestions.length > 0 ? personalitySuggestions[0].content : null;
  };

  const aiPersonalityRecommendation = getAIPersonalityRecommendation();

  // 获取AI推荐的工作风格配置
  const getAIWorkStyleRecommendation = () => {
    const workStyleSuggestions = getSmartSuggestionsByType('workStyle');
    return workStyleSuggestions.length > 0 ? workStyleSuggestions[0].content : null;
  };

  const aiWorkStyleRecommendation = getAIWorkStyleRecommendation();

  // 获取AI推荐的沟通特征配置
  const getAICommunicationRecommendation = () => {
    const communicationSuggestions = getSmartSuggestionsByType('communication');
    return communicationSuggestions.length > 0 ? communicationSuggestions[0].content : null;
  };

  const aiCommunicationRecommendation = getAICommunicationRecommendation();

  // 性格特征滑块组件
  const PersonalitySlider: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    description: string;
    lowLabel: string;
    highLabel: string;
    field: keyof PersonalityTraits;
  }> = ({ label, value, onChange, description, lowLabel, highLabel, field }) => {
    const recommendedValue = aiPersonalityRecommendation?.[field];
    const hasRecommendation = recommendedValue !== undefined;

    return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          {hasRecommendation && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span className="text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full">
                AI推荐: {recommendedValue}
              </span>
            </div>
          )}
        </div>
        <span className="text-sm text-blue-600 font-medium">{value}/10</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
      <p className="text-xs text-gray-600">{description}</p>
    </div>
  );
  };

  // 选择按钮组件
  const SelectGroup: React.FC<{
    label: string;
    value: string;
    options: Array<{ value: string; label: string; description?: string }>;
    onChange: (value: string) => void;
    description?: string;
    recommendedValue?: string;
  }> = ({ label, value, options, onChange, description, recommendedValue }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {recommendedValue && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded-full">
              AI推荐
            </span>
          </div>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <div className="grid grid-cols-1 gap-2">
        {options.map((option) => {
          const isRecommended = recommendedValue === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-3 text-left border rounded-lg transition-all relative ${
                value === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              } ${isRecommended ? 'ring-2 ring-yellow-200' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">{option.label}</div>
                {isRecommended && (
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                )}
              </div>
              {option.description && (
                <div className="text-sm text-gray-500 mt-1">{option.description}</div>
              )}
              {isRecommended && (
                <div className="text-xs text-yellow-600 mt-1">🤖 AI推荐</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // 更新性格特征
  const updatePersonality = (field: keyof PersonalityTraits, value: number) => {
    setLocalFeatures(prev => ({
      ...prev,
      personality: { ...prev.personality, [field]: value }
    }));
  };

  // 更新工作风格
  const updateWorkStyle = (field: keyof WorkStyle, value: string) => {
    setLocalFeatures(prev => ({
      ...prev,
      workStyle: { ...prev.workStyle, [field]: value }
    }));
  };

  // 更新沟通风格
  const updateCommunication = (field: keyof CommunicationStyle, value: string) => {
    setLocalFeatures(prev => ({
      ...prev,
      communication: { ...prev.communication, [field]: value }
    }));
  };

  // 工作风格选项
  const workStyleOptions = {
    rigor: [
      { value: 'strict', label: '严格', description: '高度重视规则和标准，执行力强' },
      { value: 'balanced', label: '平衡', description: '在规则和灵活性之间取得平衡' },
      { value: 'flexible', label: '灵活', description: '适应性强，注重实际效果' }
    ],
    humor: [
      { value: 'none', label: '严肃', description: '保持专业和严肃的交流风格' },
      { value: 'occasional', label: '适度', description: '在合适的时候使用轻松的语调' },
      { value: 'frequent', label: '幽默', description: '经常使用幽默缓解气氛' }
    ],
    proactivity: [
      { value: 'reactive', label: '被动响应', description: '主要响应用户请求' },
      { value: 'balanced', label: '平衡主动', description: '在响应基础上适度主动' },
      { value: 'proactive', label: '积极主动', description: '主动提供建议和帮助' }
    ],
    detailOrientation: [
      { value: 'high', label: '高度关注', description: '注重细节，追求完美' },
      { value: 'medium', label: '适度关注', description: '关注重要细节' },
      { value: 'low', label: '关注大局', description: '专注主要目标和结果' }
    ]
  };

  // 沟通风格选项
  const communicationOptions = {
    responseLength: [
      { value: 'concise', label: '简洁', description: '回答简明扼要' },
      { value: 'moderate', label: '适中', description: '提供足够的信息' },
      { value: 'detailed', label: '详细', description: '提供全面详细的解答' }
    ],
    language: [
      { value: 'formal', label: '正式', description: '使用正式的商务语言' },
      { value: 'neutral', label: '中性', description: '使用标准的交流语言' },
      { value: 'casual', label: '随和', description: '使用亲切友好的语言' }
    ],
    technicality: [
      { value: 'simple', label: '通俗易懂', description: '避免技术术语，用简单语言' },
      { value: 'moderate', label: '适度专业', description: '适当使用专业术语' },
      { value: 'technical', label: '专业技术', description: '使用专业的技术语言' }
    ]
  };

  // 获取综合评分
  const getOverallScore = () => {
    const { personality } = localFeatures;
    const total = personality.friendliness + personality.professionalism +
                  personality.patience + personality.empathy;
    return Math.round(total / 4 * 10);
  };

  // 获取角色适配度
  const getRoleCompatibility = () => {
    if (!basicInfo?.primaryRole) return null;

    const { personality } = localFeatures;
    const role = basicInfo.primaryRole;

    const compatibility = {
      '客服专员': (personality.friendliness * 0.3 + personality.patience * 0.3 +
                   personality.empathy * 0.25 + personality.professionalism * 0.15) * 10,
      '数据分析师': (personality.professionalism * 0.4 + personality.patience * 0.3 +
                    personality.friendliness * 0.15 + personality.empathy * 0.15) * 10,
      '销售顾问': (personality.friendliness * 0.35 + personality.empathy * 0.25 +
                  personality.professionalism * 0.25 + personality.patience * 0.15) * 10
    };

    return Math.round(compatibility[role as keyof typeof compatibility] || 70);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 性格特征卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">性格特征</h3>
          <div className="ml-auto bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            综合评分: {getOverallScore()}/100
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PersonalitySlider
            label="友好度"
            value={localFeatures.personality.friendliness}
            onChange={(value) => updatePersonality('friendliness', value)}
            description="决定对话的亲和力和温暖程度"
            lowLabel="冷淡"
            highLabel="热情"
            field="friendliness"
          />

          <PersonalitySlider
            label="专业度"
            value={localFeatures.personality.professionalism}
            onChange={(value) => updatePersonality('professionalism', value)}
            description="体现工作的专业性和权威性"
            lowLabel="随意"
            highLabel="权威"
            field="professionalism"
          />

          <PersonalitySlider
            label="耐心度"
            value={localFeatures.personality.patience}
            onChange={(value) => updatePersonality('patience', value)}
            description="处理复杂问题时的耐心程度"
            lowLabel="急躁"
            highLabel="耐心"
            field="patience"
          />

          <PersonalitySlider
            label="共情能力"
            value={localFeatures.personality.empathy}
            onChange={(value) => updatePersonality('empathy', value)}
            description="理解和回应用户情感的能力"
            lowLabel="理性"
            highLabel="感性"
            field="empathy"
          />
        </div>

        {/* 角色适配度 */}
        {basicInfo?.primaryRole && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium text-gray-900">角色适配度</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>与 {basicInfo.primaryRole} 的匹配度</span>
                  <span className="font-bold text-green-600">{getRoleCompatibility()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRoleCompatibility()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 工作风格卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">工作风格</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectGroup
            label="严谨度"
            value={localFeatures.workStyle.rigor}
            options={workStyleOptions.rigor}
            onChange={(value) => updateWorkStyle('rigor', value)}
            description="对规则和流程的执行程度"
            recommendedValue={aiWorkStyleRecommendation?.rigor}
          />

          <SelectGroup
            label="幽默程度"
            value={localFeatures.workStyle.humor}
            options={workStyleOptions.humor}
            onChange={(value) => updateWorkStyle('humor', value)}
            description="在对话中使用幽默的频率"
            recommendedValue={aiWorkStyleRecommendation?.humor}
          />

          <SelectGroup
            label="主动性"
            value={localFeatures.workStyle.proactivity}
            options={workStyleOptions.proactivity}
            onChange={(value) => updateWorkStyle('proactivity', value)}
            description="主动提供帮助和建议的程度"
            recommendedValue={aiWorkStyleRecommendation?.proactivity}
          />

          <SelectGroup
            label="细节关注度"
            value={localFeatures.workStyle.detailOrientation}
            options={workStyleOptions.detailOrientation}
            onChange={(value) => updateWorkStyle('detailOrientation', value)}
            description="对细节问题的关注程度"
            recommendedValue={aiWorkStyleRecommendation?.detailOrientation}
          />
        </div>
      </div>

      {/* 沟通特征卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">沟通特征</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectGroup
            label="回复长度"
            value={localFeatures.communication.responseLength}
            options={communicationOptions.responseLength}
            onChange={(value) => updateCommunication('responseLength', value)}
            recommendedValue={aiCommunicationRecommendation?.responseLength}
          />

          <SelectGroup
            label="语言风格"
            value={localFeatures.communication.language}
            options={communicationOptions.language}
            onChange={(value) => updateCommunication('language', value)}
            recommendedValue={aiCommunicationRecommendation?.language}
          />

          <SelectGroup
            label="专业程度"
            value={localFeatures.communication.technicality}
            options={communicationOptions.technicality}
            onChange={(value) => updateCommunication('technicality', value)}
            recommendedValue={aiCommunicationRecommendation?.technicality}
          />
        </div>
      </div>

      {/* 智能建议 */}
      {suggestions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Info className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-gray-900">智能建议</h3>
          </div>
          <div className="space-y-3">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                <h4 className="font-medium text-gray-900 mb-1">{suggestion.title}</h4>
                <p className="text-sm text-gray-600">{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 配置预览 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">特征预览</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">性格类型：</span>
            <p className="text-gray-600">
              {localFeatures.personality.friendliness >= 7 ? '热情' :
               localFeatures.personality.friendliness >= 4 ? '友好' : '冷静'} ·
              {localFeatures.personality.professionalism >= 7 ? '专业' : '随和'} ·
              {localFeatures.personality.patience >= 7 ? '耐心' : '高效'}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">工作风格：</span>
            <p className="text-gray-600">
              {workStyleOptions.rigor.find(o => o.value === localFeatures.workStyle.rigor)?.label} ·
              {workStyleOptions.humor.find(o => o.value === localFeatures.workStyle.humor)?.label} ·
              {workStyleOptions.proactivity.find(o => o.value === localFeatures.workStyle.proactivity)?.label}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">沟通方式：</span>
            <p className="text-gray-600">
              {communicationOptions.responseLength.find(o => o.value === localFeatures.communication.responseLength)?.label} ·
              {communicationOptions.language.find(o => o.value === localFeatures.communication.language)?.label} ·
              {communicationOptions.technicality.find(o => o.value === localFeatures.communication.technicality)?.label}
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">综合评分：</span>
            <p className="text-gray-600">{getOverallScore()}/100 分</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoreFeaturesStage;