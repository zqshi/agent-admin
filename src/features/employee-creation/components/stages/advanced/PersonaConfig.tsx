/**
 * 人设配置组件
 */

import React, { useState, useEffect } from 'react';
import { Plus, Minus, FileText, MessageSquare, AlertTriangle } from 'lucide-react';
import { useCreationStore } from '../../../stores/creationStore';
import type { DialogueExample, AdvancedConfig } from '../../../types';

// Props接口定义
interface PersonaConfigProps {
  config?: AdvancedConfig['persona'];
  onChange?: (updates: Partial<AdvancedConfig['persona']>) => void;
}

const PersonaConfig: React.FC<PersonaConfigProps> = ({ config, onChange }) => {
  const store = useCreationStore();

  // 判断是领域模式还是全局模式
  const isGlobalMode = !config && !onChange;
  const actualConfig = config || store.advancedConfig?.persona;
  const actualOnChange = onChange || ((updates: Partial<AdvancedConfig['persona']>) => {
    store.updateAdvancedConfig({ persona: { ...store.advancedConfig?.persona, ...updates } });
  });

  // 本地状态
  const [localPersona, setLocalPersona] = useState({
    systemPrompt: '',
    characterBackground: '',
    constraints: [''],
    examples: [] as DialogueExample[],
    ...actualConfig
  });

  // 同步配置变化
  useEffect(() => {
    if (actualConfig) {
      setLocalPersona(prev => ({
        ...prev,
        ...actualConfig
      }));
    }
  }, [actualConfig]);

  // 同步到配置
  useEffect(() => {
    const timer = setTimeout(() => {
      actualOnChange(localPersona);
    }, 300);

    return () => clearTimeout(timer);
  }, [localPersona]);

  // 系统提示词模板
  const promptTemplates = [
    {
      id: 'customer_service',
      name: '客服专员',
      template: `你是一名专业的客服专员，负责为客户提供优质的服务体验。

核心职责：
- 友好、耐心地回答客户咨询
- 快速准确地解决客户问题
- 在无法解决时及时转接相关部门
- 收集客户反馈，持续改进服务质量

对话风格：
- 使用友好、专业的语言
- 保持耐心，即使面对困难客户
- 提供准确、详细的信息
- 始终站在客户角度思考问题

请记住，客户满意是我们的首要目标。`
    },
    {
      id: 'data_analyst',
      name: '数据分析师',
      template: `你是一名资深的数据分析师，专门负责业务数据的分析和洞察挖掘。

核心职责：
- 收集、清理和分析各类业务数据
- 制作清晰易懂的数据报表和可视化图表
- 从数据中挖掘有价值的业务洞察
- 为业务决策提供数据支持和建议

工作特点：
- 严谨、准确，重视数据质量
- 善于用图表和数字说话
- 能够将复杂的数据简化为易懂的结论
- 持续关注业务趋势和异常变化

在回答问题时，请确保数据的准确性，并提供必要的解释和背景信息。`
    },
    {
      id: 'sales_consultant',
      name: '销售顾问',
      template: `你是一名经验丰富的销售顾问，致力于为客户提供最适合的产品方案。

核心职责：
- 深入了解客户需求和痛点
- 推荐最适合的产品和服务
- 提供专业的产品咨询和解决方案
- 维护客户关系，实现长期合作

沟通风格：
- 主动、热情，但不过分推销
- 善于倾听，理解客户真实需求
- 用通俗易懂的方式介绍产品优势
- 诚实透明，建立信任关系

记住，成功的销售是解决客户问题，而不是强行推销产品。`
    }
  ];

  // 更新字段
  const updateField = (field: string, value: any) => {
    setLocalPersona(prev => ({ ...prev, [field]: value }));
  };

  // 添加约束
  const addConstraint = () => {
    setLocalPersona(prev => ({
      ...prev,
      constraints: [...prev.constraints, '']
    }));
  };

  // 删除约束
  const removeConstraint = (index: number) => {
    setLocalPersona(prev => ({
      ...prev,
      constraints: prev.constraints.filter((_, i) => i !== index)
    }));
  };

  // 更新约束
  const updateConstraint = (index: number, value: string) => {
    setLocalPersona(prev => ({
      ...prev,
      constraints: prev.constraints.map((c, i) => i === index ? value : c)
    }));
  };

  // 添加对话示例
  const addExample = () => {
    setLocalPersona(prev => ({
      ...prev,
      examples: [...prev.examples, {
        scenario: '',
        userInput: '',
        expectedResponse: ''
      }]
    }));
  };

  // 删除对话示例
  const removeExample = (index: number) => {
    setLocalPersona(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  // 更新对话示例
  const updateExample = (index: number, field: keyof DialogueExample, value: string) => {
    setLocalPersona(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) =>
        i === index ? { ...ex, [field]: value } : ex
      )
    }));
  };

  // 应用模板
  const applyTemplate = (template: typeof promptTemplates[0]) => {
    setLocalPersona(prev => ({
      ...prev,
      systemPrompt: template.template
    }));
  };

  return (
    <div className="space-y-6">
      {/* 系统提示词 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            系统提示词 <span className="text-red-500">*</span>
          </label>
          {promptTemplates.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">快速应用模板：</span>
              {promptTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <textarea
          value={localPersona.systemPrompt}
          onChange={(e) => updateField('systemPrompt', e.target.value)}
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="定义数字员工的角色、职责、性格和对话风格..."
        />
        <p className="text-xs text-gray-500 mt-1">
          系统提示词是数字员工的"人格基础"，将决定其行为方式和对话风格
        </p>
      </div>

      {/* 角色背景 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          角色背景故事
        </label>
        <textarea
          value={localPersona.characterBackground}
          onChange={(e) => updateField('characterBackground', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="描述数字员工的背景故事、工作经历、专业特长等..."
        />
        <p className="text-xs text-gray-500 mt-1">
          可选配置，有助于让数字员工的回答更加生动和个性化
        </p>
      </div>

      {/* 行为约束 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          行为约束
        </label>
        {localPersona.constraints.map((constraint, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={constraint}
              onChange={(e) => updateConstraint(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="例：不得泄露客户隐私信息"
            />
            {localPersona.constraints.length > 1 && (
              <button
                onClick={() => removeConstraint(index)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addConstraint}
          className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          添加约束
        </button>
        <p className="text-xs text-gray-500 mt-2">
          定义数字员工不应该做的事情，确保行为合规
        </p>
      </div>

      {/* 对话示例 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            对话示例
          </label>
          <button
            onClick={addExample}
            className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            添加示例
          </button>
        </div>

        {localPersona.examples.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">暂无对话示例</p>
            <p className="text-xs text-gray-400 mt-1">
              添加对话示例可以帮助数字员工更好地理解期望的回答方式
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {localPersona.examples.map((example, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    示例 {index + 1}
                  </span>
                  <button
                    onClick={() => removeExample(index)}
                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      场景描述
                    </label>
                    <input
                      type="text"
                      value={example.scenario}
                      onChange={(e) => updateExample(index, 'scenario', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：客户询问退款政策"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      用户输入
                    </label>
                    <input
                      type="text"
                      value={example.userInput}
                      onChange={(e) => updateExample(index, 'userInput', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：请问你们的退款政策是怎样的？"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      期望回答
                    </label>
                    <textarea
                      value={example.expectedResponse}
                      onChange={(e) => updateExample(index, 'expectedResponse', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="例：感谢您的咨询！我们的退款政策是..."
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 配置提示 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-amber-800 mb-1">配置提示</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc list-inside">
              <li>系统提示词是必填项，建议详细描述角色职责和对话风格</li>
              <li>行为约束可以防止数字员工做出不当行为</li>
              <li>对话示例有助于提高回答质量，建议添加3-5个典型场景</li>
              <li>可以随时修改和优化这些配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonaConfig;