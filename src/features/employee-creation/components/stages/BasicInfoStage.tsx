/**
 * 基础信息阶段组件
 */

import React, { useEffect, useState } from 'react';
import { Plus, Minus, User, Building2, Target, AlertCircle, Sparkles, Loader, ChevronDown, ChevronUp, CheckCircle, Layers, Settings } from 'lucide-react';
import { useCreationStore } from '../../stores/creationStore';
import { smartAnalysisService } from '../../services/SmartAnalysisService';
import { enhancedAnalysisService } from '../../services/EnhancedAnalysisService';
import SuggestionCard from '../SuggestionCard';
import ReasoningProcess from '../../../react-engine/components/ReasoningProcess';
import type { BasicInfo } from '../../types';
import type { SmartSuggestion, AnalysisResult } from '../../services/SmartAnalysisService';
import type { EnhancedAnalysisResult } from '../../services/EnhancedAnalysisService';

const BasicInfoStage: React.FC = () => {
  const {
    basicInfo,
    updateBasicInfo,
    validation,
    validateCurrentStage
  } = useCreationStore();

  // 本地状态，避免频繁更新store
  const [localData, setLocalData] = useState<BasicInfo>({
    name: '',
    employeeId: '',
    department: '',
    description: '',
    primaryRole: '',
    responsibilities: [''],
    serviceScope: [''],
    autoSuggest: true,
    enableMultiDomain: false,
    estimatedDomains: 2,
    ...basicInfo
  });

  // AI分析相关状态
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhancedAnalysisResult | null>(null);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [showReasoningProcess, setShowReasoningProcess] = useState(false);
  const [autoMatchEnabled, setAutoMatchEnabled] = useState(true);

  // 部门选项
  const departments = [
    '客户服务部',
    '技术支持部',
    '销售部',
    '人力资源部',
    '管理层',
    '产品部',
    '运营部',
    '市场部',
    '财务部'
  ];

  // 常见职责模板
  const roleTemplates = {
    '客服专员': {
      responsibilities: ['处理客户咨询', '解决投诉问题', '提供产品信息', '跟进客户满意度'],
      serviceScope: ['售前咨询', '售后服务', '投诉处理']
    },
    '数据分析师': {
      responsibilities: ['数据收集与分析', '制作数据报表', '业务洞察挖掘', '预测模型构建'],
      serviceScope: ['业务数据分析', '市场趋势分析', '用户行为分析']
    },
    '销售顾问': {
      responsibilities: ['客户需求分析', '产品方案推荐', '商务谈判', '销售目标达成'],
      serviceScope: ['潜在客户开发', '现有客户维护', '销售流程管理']
    },
    '技术支持': {
      responsibilities: ['技术问题诊断', '解决方案提供', '产品使用指导', '技术文档维护'],
      serviceScope: ['产品技术支持', '系统故障排查', '用户培训']
    }
  };

  // 同步到store
  useEffect(() => {
    const timer = setTimeout(() => {
      updateBasicInfo(localData);
    }, 300);

    return () => clearTimeout(timer);
  }, [localData, updateBasicInfo]);

  // 当选择职责时自动填充
  useEffect(() => {
    if (localData.primaryRole && roleTemplates[localData.primaryRole as keyof typeof roleTemplates]) {
      const template = roleTemplates[localData.primaryRole as keyof typeof roleTemplates];
      setLocalData(prev => ({
        ...prev,
        responsibilities: template.responsibilities,
        serviceScope: template.serviceScope
      }));
    }
  }, [localData.primaryRole]);

  // 自动生成员工编号
  useEffect(() => {
    if (localData.name && localData.department && !localData.employeeId) {
      const deptCode = localData.department.charAt(0).toUpperCase();
      const nameCode = localData.name.slice(0, 2).toUpperCase();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setLocalData(prev => ({
        ...prev,
        employeeId: `${deptCode}${nameCode}${randomNum}`
      }));
    }
  }, [localData.name, localData.department]);

  // 字段更新处理
  const handleFieldChange = (field: keyof BasicInfo, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  // AI智能分析功能
  const handleAIAnalysis = async () => {
    if (!localData.description?.trim()) {
      alert('请先输入描述信息');
      return;
    }

    setIsAnalyzing(true);
    setShowReasoningProcess(true);

    try {
      // 使用增强的分析服务
      const enhancedResult = await enhancedAnalysisService.analyzeDescription(localData.description);
      setEnhancedResult(enhancedResult);
      
      // 如果启用自动匹配，直接应用分析结果
      if (autoMatchEnabled) {
        applyEnhancedAnalysisResult(enhancedResult);
      }

      // 同时保持原有的分析结果用于建议卡片
      const result = await smartAnalysisService.analyzeDescription(localData.description);
      setAnalysisResult(result);
    } catch (error) {
      console.error('AI分析失败:', error);
      alert('分析失败，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 应用增强分析结果
  const applyEnhancedAnalysisResult = (result: EnhancedAnalysisResult) => {
    setLocalData(prev => ({
      ...prev,
      responsibilities: result.responsibilities,
      serviceScope: result.serviceScope,
      // 将性格特征、工作风格、沟通特征存储到扩展字段
      personalityTraits: result.personalityTraits,
      workStyle: result.workStyle,
      communicationStyle: result.communicationStyle,
      toolRecommendations: result.toolRecommendations
    }));
  };

  // 应用建议
  const handleApplySuggestion = (suggestion: SmartSuggestion) => {
    const suggestionId = `${suggestion.type}-${suggestion.title}`;

    switch (suggestion.type) {
      case 'responsibilities':
        const newResponsibilities = suggestion.content as string[];
        setLocalData(prev => ({
          ...prev,
          responsibilities: [...prev.responsibilities.filter(r => r.trim()), ...newResponsibilities]
        }));
        break;

      default:
        // 其他类型的建议暂时存储，在后续阶段应用
        console.log('Building suggestion applied:', suggestion);
    }

    setAppliedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  // 忽略建议
  const handleDismissSuggestion = (suggestion: SmartSuggestion) => {
    const suggestionId = `${suggestion.type}-${suggestion.title}`;
    setDismissedSuggestions(prev => new Set([...prev, suggestionId]));
  };

  // 检查建议是否已应用
  const isSuggestionApplied = (suggestion: SmartSuggestion) => {
    const suggestionId = `${suggestion.type}-${suggestion.title}`;
    return appliedSuggestions.has(suggestionId);
  };

  // 检查建议是否已忽略
  const isSuggestionDismissed = (suggestion: SmartSuggestion) => {
    const suggestionId = `${suggestion.type}-${suggestion.title}`;
    return dismissedSuggestions.has(suggestionId);
  };

  // 添加职责
  const addResponsibility = () => {
    setLocalData(prev => ({
      ...prev,
      responsibilities: [...prev.responsibilities, '']
    }));
  };

  // 删除职责
  const removeResponsibility = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.filter((_, i) => i !== index)
    }));
  };

  // 更新职责
  const updateResponsibility = (index: number, value: string) => {
    setLocalData(prev => ({
      ...prev,
      responsibilities: prev.responsibilities.map((r, i) => i === index ? value : r)
    }));
  };

  // 添加服务范围
  const addServiceScope = () => {
    setLocalData(prev => ({
      ...prev,
      serviceScope: [...prev.serviceScope, '']
    }));
  };

  // 删除服务范围
  const removeServiceScope = (index: number) => {
    setLocalData(prev => ({
      ...prev,
      serviceScope: prev.serviceScope.filter((_, i) => i !== index)
    }));
  };

  // 更新服务范围
  const updateServiceScope = (index: number, value: string) => {
    setLocalData(prev => ({
      ...prev,
      serviceScope: prev.serviceScope.map((s, i) => i === index ? value : s)
    }));
  };

  // 获取字段错误信息
  const getFieldError = (field: string) => {
    return validation?.errors.find(error => error.field === field)?.message;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 基本信息卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">基本信息</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 员工姓名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              员工姓名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={localData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('name') ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例：AI-Alice"
            />
            {getFieldError('name') && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('name')}
              </p>
            )}
          </div>

          {/* 员工编号 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              员工编号
            </label>
            <input
              type="text"
              value={localData.employeeId}
              onChange={(e) => handleFieldChange('employeeId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="自动生成或手动输入"
            />
            <p className="text-gray-500 text-xs mt-1">系统将根据姓名和部门自动生成</p>
          </div>

          {/* 所属部门 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所属部门 <span className="text-red-500">*</span>
            </label>
            <select
              value={localData.department}
              onChange={(e) => handleFieldChange('department', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('department') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">请选择部门</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            {getFieldError('department') && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('department')}
              </p>
            )}
          </div>

          {/* 主要职责 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              主要职责 <span className="text-red-500">*</span>
            </label>
            <select
              value={localData.primaryRole}
              onChange={(e) => handleFieldChange('primaryRole', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                getFieldError('primaryRole') ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">请选择主要职责</option>
              {Object.keys(roleTemplates).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="custom">自定义</option>
            </select>
            {getFieldError('primaryRole') && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {getFieldError('primaryRole')}
              </p>
            )}
          </div>
        </div>

        {/* 描述 */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={localData.description || ''}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="详细描述这个数字员工的用途、特点、工作场景等，AI将为您智能生成配置..."
              />
            </div>

            {/* AI分析按钮 */}
            {localData.description?.trim() && (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAIAnalysis}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isAnalyzing ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>{isAnalyzing ? '分析中...' : '🤖 AI智能分析'}</span>
                </button>

                {analysisResult && (
                  <button
                    onClick={() => setShowReasoningProcess(!showReasoningProcess)}
                    className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <span className="text-sm">推理过程</span>
                    {showReasoningProcess ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
            )}

            {/* ReAct推理过程可视化 */}
            {(enhancedResult || analysisResult) && showReasoningProcess && (
              <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800">AI推理过程</span>
                </div>
                <ReasoningProcess
                  steps={enhancedResult?.reasoning || analysisResult?.reasoning || []}
                  showDetails={false}
                  showTimeline={true}
                />
              </div>
            )}

            {/* 智能分析状态提示 */}
            {enhancedResult && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">智能分析完成</span>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    置信度: {enhancedResult.confidenceScore}%
                  </span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  已自动为您配置性格特征、工作风格、沟通特征和工具建议，您可以在后续步骤中查看和调整。
                </p>
              </div>
            )}

            {/* 智能建议卡片 */}
            {analysisResult && analysisResult.suggestions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-gray-900">AI智能建议</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {analysisResult.suggestions.length} 项建议
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      key={`${suggestion.type}-${index}`}
                      suggestion={suggestion}
                      onApply={handleApplySuggestion}
                      onDismiss={handleDismissSuggestion}
                      isApplied={isSuggestionApplied(suggestion)}
                      isDismissed={isSuggestionDismissed(suggestion)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 职责配置卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">职责配置</h3>
        </div>

        {/* 具体职责 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            具体职责 <span className="text-red-500">*</span>
          </label>
          {localData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={responsibility}
                onChange={(e) => updateResponsibility(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入具体职责..."
              />
              {localData.responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeResponsibility(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addResponsibility}
            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加职责
          </button>
        </div>

        {/* 服务范围 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">服务范围</label>
          {localData.serviceScope.map((scope, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={scope}
                onChange={(e) => updateServiceScope(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入服务范围..."
              />
              {localData.serviceScope.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeServiceScope(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addServiceScope}
            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加服务范围
          </button>
        </div>
      </div>

      {/* 多领域配置 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">多领域配置</h3>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              实验性功能
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={localData.enableMultiDomain}
              onChange={(e) => handleFieldChange('enableMultiDomain', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <Settings className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-indigo-900 mb-1">
                什么是多领域数字员工？
              </h4>
              <p className="text-sm text-indigo-700 mb-2">
                多领域数字员工具备跨专业领域的综合能力，能够智能识别用户意图并自动切换到相应的专业领域进行响应。
              </p>
              <div className="text-xs text-indigo-600 space-y-1">
                <div>• 一个员工处理多个专业领域的咨询</div>
                <div>• 智能路由：自动识别用户意图并切换领域</div>
                <div>• 每个领域独立配置：人设、知识库、工具等</div>
                <div>• 减少员工数量，提升管理效率</div>
              </div>
            </div>
          </div>

          {localData.enableMultiDomain && (
            <div className="space-y-4 pl-4 border-l-2 border-indigo-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  预计配置领域数量
                </label>
                <select
                  value={localData.estimatedDomains || 2}
                  onChange={(e) => handleFieldChange('estimatedDomains', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={2}>2个领域（如：客服 + 技术支持）</option>
                  <option value={3}>3个领域（如：销售 + 客服 + 技术）</option>
                  <option value={4}>4个领域</option>
                  <option value={5}>5个领域</option>
                  <option value={8}>8个领域</option>
                  <option value={10}>10个领域</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  这将影响后续的领域配置界面，您也可以随时调整
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-yellow-800 font-medium mb-1">配置提醒</p>
                    <p className="text-yellow-700">
                      启用多领域后，系统将跳过传统的高级配置阶段，改为领域配置界面。
                      每个领域都将拥有独立的人设配置、Prompt配置、知识配置、工具管理和导师机制。
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">🎯</div>
                  <div className="font-medium text-gray-700">智能路由</div>
                  <div className="text-gray-500">自动识别意图</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">⚙️</div>
                  <div className="font-medium text-gray-700">独立配置</div>
                  <div className="text-gray-500">领域间完全隔离</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg mb-1">📊</div>
                  <div className="font-medium text-gray-700">统一管理</div>
                  <div className="text-gray-500">一个界面管理</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 智能配置选项 - 已隐藏 */}
      {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">智能配置</h3>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localData.autoSuggest}
              onChange={(e) => handleFieldChange('autoSuggest', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">启用智能建议</span>
              <p className="text-sm text-gray-500">系统将根据您的配置自动推荐最佳的性格特征、工具和配置参数</p>
            </div>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={autoMatchEnabled}
              onChange={(e) => setAutoMatchEnabled(e.target.checked)}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">自动匹配特征</span>
              <p className="text-sm text-gray-500">根据描述自动匹配职责、性格、工作风格、沟通特征等</p>
            </div>
          </label>
        </div>
      </div> */}

      {/* 配置预览 - 已隐藏 */}
      {/* {localData.name && localData.primaryRole && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">配置预览</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">员工信息：</span>
              <p className="text-gray-600">{localData.name} ({localData.employeeId})</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">所属部门：</span>
              <p className="text-gray-600">{localData.department}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">主要职责：</span>
              <p className="text-gray-600">{localData.primaryRole}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">职责数量：</span>
              <p className="text-gray-600">{localData.responsibilities.filter(r => r.trim()).length} 项</p>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default BasicInfoStage;