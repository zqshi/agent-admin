/**
 * 核心特征阶段组件
 */

import React, { useEffect, useState } from 'react';
import { Brain, MessageCircle, Zap, TrendingUp, Info, Star, Sparkles, Users, Palette, Settings } from 'lucide-react';
import { useCreationStore } from '../../stores/creationStore';
import type { CoreFeatures, PersonalityTraits, WorkStyle, CommunicationStyle, MBTIProfile, PersonalityConfigMode } from '../../types';

const CoreFeaturesStage: React.FC = () => {
  const {
    coreFeatures,
    basicInfo,
    multiDomainConfig,
    updateCoreFeatures,
    suggestions,
    smartSuggestions,
    getSmartSuggestionsByType
  } = useCreationStore();

  // MBTI类型数据
  const mbtiTypes = {
    'INTJ': {
      name: '建筑师',
      description: '富有想象力和战略性的思想家，一切皆在计划之中',
      characteristics: {
        strengths: ['战略思维', '独立自主', '高效执行', '专注深度'],
        workStyle: ['系统性思考', '追求完美', '重视效率', '独立工作'],
        communication: ['逻辑清晰', '简洁直接', '重视准确性'],
        teamRole: '战略规划者',
        idealScenarios: ['技术咨询', '策略分析', '产品规划', '系统设计']
      },
      mapping: {
        personality: { friendliness: 6, professionalism: 8, patience: 7, empathy: 5 },
        workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'high' },
        communication: { responseLength: 'concise', language: 'formal', technicality: 'technical' }
      }
    },
    'ENFP': {
      name: '竞选者',
      description: '热情洋溢、富有创造力的社交家，总能找到理由微笑',
      characteristics: {
        strengths: ['富有创造力', '善于社交', '适应性强', '激励他人'],
        workStyle: ['灵活变通', '团队合作', '创新思维', '积极主动'],
        communication: ['热情友好', '善于表达', '激励性强'],
        teamRole: '团队激励者',
        idealScenarios: ['客户服务', '市场推广', '培训指导', '创意咨询']
      },
      mapping: {
        personality: { friendliness: 9, professionalism: 7, patience: 6, empathy: 8 },
        workStyle: { rigor: 'flexible', humor: 'frequent', proactivity: 'proactive', detailOrientation: 'medium' },
        communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
      }
    },
    'ISTJ': {
      name: '物流师',
      description: '实用和注重事实的人，其可靠性无可怀疑',
      characteristics: {
        strengths: ['责任心强', '注重细节', '遵守规则', '可靠稳定'],
        workStyle: ['按部就班', '严谨细致', '重视传统', '稳步推进'],
        communication: ['准确无误', '条理清晰', '实事求是'],
        teamRole: '质量保证者',
        idealScenarios: ['技术支持', '质量管控', '流程管理', '客户服务']
      },
      mapping: {
        personality: { friendliness: 6, professionalism: 9, patience: 8, empathy: 6 },
        workStyle: { rigor: 'strict', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
        communication: { responseLength: 'moderate', language: 'formal', technicality: 'moderate' }
      }
    },
    'ESFJ': {
      name: '执政官',
      description: '极有同情心、喜欢社交和受欢迎的人，总是愿意帮助他人',
      characteristics: {
        strengths: ['善解人意', '团队协作', '服务精神', '组织能力'],
        workStyle: ['以人为本', '团队合作', '积极主动', '关注细节'],
        communication: ['温暖友善', '体贴入微', '善于倾听'],
        teamRole: '团队协调者',
        idealScenarios: ['客户服务', '人事管理', '社区运营', '教育培训']
      },
      mapping: {
        personality: { friendliness: 9, professionalism: 8, patience: 9, empathy: 9 },
        workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'proactive', detailOrientation: 'high' },
        communication: { responseLength: 'detailed', language: 'casual', technicality: 'simple' }
      }
    }
  };

  // 人格模板数据
  const personalityTemplates = {
    'friendly-assistant': {
      name: '友好助手型',
      description: '温暖友善，善于与用户建立良好关系',
      personality: { friendliness: 8, professionalism: 7, patience: 8, empathy: 8 },
      workStyle: { rigor: 'balanced', humor: 'occasional', proactivity: 'balanced', detailOrientation: 'medium' },
      communication: { responseLength: 'moderate', language: 'casual', technicality: 'simple' }
    },
    'professional-consultant': {
      name: '专业顾问型',
      description: '专业权威，提供精准的专业建议',
      personality: { friendliness: 6, professionalism: 9, patience: 7, empathy: 6 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'proactive', detailOrientation: 'high' },
      communication: { responseLength: 'detailed', language: 'formal', technicality: 'technical' }
    },
    'tech-expert': {
      name: '技术专家型',
      description: '技术精湛，能够解决复杂技术问题',
      personality: { friendliness: 5, professionalism: 9, patience: 6, empathy: 5 },
      workStyle: { rigor: 'strict', humor: 'none', proactivity: 'reactive', detailOrientation: 'high' },
      communication: { responseLength: 'concise', language: 'neutral', technicality: 'technical' }
    }
  };

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
    personalityMode: 'custom',
    ...coreFeatures
  });

  // 配置模式状态
  const [configMode, setConfigMode] = useState<PersonalityConfigMode>('custom');

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

  // 检查是否在多领域模式下
  const isMultiDomainMode = basicInfo?.enableMultiDomain;

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

  // 应用MBTI配置
  const applyMBTIConfiguration = (mbtiType: string) => {
    const mbtiData = mbtiTypes[mbtiType as keyof typeof mbtiTypes];
    if (!mbtiData) return;

    setLocalFeatures(prev => ({
      ...prev,
      personality: { ...prev.personality, ...mbtiData.mapping.personality },
      workStyle: { ...prev.workStyle, ...mbtiData.mapping.workStyle },
      communication: { ...prev.communication, ...mbtiData.mapping.communication },
      personalityMode: 'mbti',
      mbtiProfile: {
        energySource: mbtiType[0] as 'E' | 'I',
        infoGathering: mbtiType[1] as 'S' | 'N',
        decisionMaking: mbtiType[2] as 'T' | 'F',
        lifestyle: mbtiType[3] as 'J' | 'P',
        type: mbtiType,
        characteristics: mbtiData.characteristics
      }
    }));
  };

  // 应用人格模板
  const applyPersonalityTemplate = (templateKey: string) => {
    const template = personalityTemplates[templateKey as keyof typeof personalityTemplates];
    if (!template) return;

    setLocalFeatures(prev => ({
      ...prev,
      personality: { ...prev.personality, ...template.personality },
      workStyle: { ...prev.workStyle, ...template.workStyle },
      communication: { ...prev.communication, ...template.communication },
      personalityMode: 'quick'
    }));
  };

  // 切换配置模式
  const handleModeChange = (mode: PersonalityConfigMode) => {
    setConfigMode(mode);
    setLocalFeatures(prev => ({
      ...prev,
      personalityMode: mode
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
      {/* 多领域模式提示 */}
      {isMultiDomainMode && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="text-indigo-900 font-medium mb-2">多领域共享人格配置</h4>
              <p className="text-indigo-700 mb-3">
                您正在配置数字员工的基础人格特征，这些特征将作为所有领域的共同基础。
                每个专业领域可以在此基础上进行针对性调整，但核心人格保持一致。
              </p>
              <div className="text-indigo-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                  <span>基础人格：跨所有领域保持一致</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
                  <span>专业调整：每个领域可独立微调</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 人格配置模式选择 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">人格配置模式</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleModeChange('quick')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              configMode === 'quick'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Palette className="h-5 w-5 text-purple-600" />
              <span className="font-medium">快速模式</span>
            </div>
            <p className="text-sm text-gray-600">选择预设人格模板，快速配置</p>
          </button>

          <button
            onClick={() => handleModeChange('mbti')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              configMode === 'mbti'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-medium">MBTI模式</span>
            </div>
            <p className="text-sm text-gray-600">基于MBTI人格类型配置</p>
          </button>

          <button
            onClick={() => handleModeChange('custom')}
            className={`p-4 border-2 rounded-lg text-left transition-all ${
              configMode === 'custom'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
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
            <h4 className="text-sm font-medium text-gray-700">选择人格模板</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(personalityTemplates).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => applyPersonalityTemplate(key)}
                  className={`p-4 border rounded-lg text-left transition-all hover:border-purple-300 ${
                    localFeatures.personalityMode === 'quick' ? 'border-purple-200 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <h5 className="font-medium text-gray-900 mb-1">{template.name}</h5>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MBTI模式 - MBTI类型选择 */}
        {configMode === 'mbti' && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">选择MBTI人格类型</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(mbtiTypes).map(([type, data]) => (
                <button
                  key={type}
                  onClick={() => applyMBTIConfiguration(type)}
                  className={`p-4 border rounded-lg text-left transition-all hover:border-purple-300 ${
                    localFeatures.mbtiProfile?.type === type ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-purple-600">{type}</span>
                    <span className="font-medium text-gray-900">{data.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{data.description}</p>
                  <div className="text-xs text-gray-500">
                    <div className="mb-1">
                      <span className="font-medium">适用场景：</span>
                      {data.characteristics.idealScenarios.slice(0, 2).join('、')}
                    </div>
                    <div>
                      <span className="font-medium">团队角色：</span>
                      {data.characteristics.teamRole}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* MBTI特征展示 */}
            {localFeatures.mbtiProfile && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <h5 className="font-medium text-purple-900 mb-3">
                  {localFeatures.mbtiProfile.type} - {mbtiTypes[localFeatures.mbtiProfile.type as keyof typeof mbtiTypes]?.name}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-purple-800">核心优势：</span>
                    <div className="text-purple-700 mt-1">
                      {localFeatures.mbtiProfile.characteristics.strengths.join('、')}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-purple-800">沟通风格：</span>
                    <div className="text-purple-700 mt-1">
                      {localFeatures.mbtiProfile.characteristics.communication.join('、')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* 特征预览 - 已隐藏 */}
      {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
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
      </div> */}
    </div>
  );
};

export default CoreFeaturesStage;