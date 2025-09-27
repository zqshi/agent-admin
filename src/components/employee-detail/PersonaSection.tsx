/**
 * 员工角色与人设配置组件 - 增强版
 * 整合所有人设相关配置功能
 */

import React, { useState } from 'react';
import { Brain, Plus, Edit3, Trash2, Save, X, Eye, EyeOff, User, FileText, MessageSquare, AlertTriangle, Minus, Sparkles, Activity } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';
import CoreFeaturesDisplay from './CoreFeaturesDisplay';

interface PersonaSectionProps {
  employee: DigitalEmployee;
}

const PersonaSection: React.FC<PersonaSectionProps> = ({
  employee
}) => {
  // 内部编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 状态管理
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    coreFeatures: true,
    advanced: true,
    dialogues: true
  });

  const [editingDialogue, setEditingDialogue] = useState<string | null>(null);
  const [newDialogue, setNewDialogue] = useState({
    userInput: '',
    expectedResponse: '',
    tags: ''
  });

  const [newConstraint, setNewConstraint] = useState('');
  const [newResponsibility, setNewResponsibility] = useState('');

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      // 这里应该调用API保存数据
      console.log('保存人设配置:', internalEditedEmployee.persona);

      // 实际项目中这里应该调用API更新员工数据
      // await updateEmployeePersona(employee.id, internalEditedEmployee.persona);

      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  const updatePersona = (field: string, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        persona: {
          ...internalEditedEmployee.persona,
          [field]: value
        }
      });
    }
  };

  // 切换展开状态
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // 添加新对话示例
  const addDialogue = () => {
    if (!newDialogue.userInput || !newDialogue.expectedResponse) return;

    const dialogue = {
      id: `${Date.now()}`,
      userInput: newDialogue.userInput,
      expectedResponse: newDialogue.expectedResponse,
      tags: newDialogue.tags ? newDialogue.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };

    const currentDialogues = internalEditedEmployee?.persona?.exampleDialogues || [];
    updatePersona('exampleDialogues', [...currentDialogues, dialogue]);

    setNewDialogue({ userInput: '', expectedResponse: '', tags: '' });
  };

  // 删除对话示例
  const removeDialogue = (dialogueId: string) => {
    const currentDialogues = internalEditedEmployee?.persona?.exampleDialogues || [];
    updatePersona('exampleDialogues', currentDialogues.filter(d => d.id !== dialogueId));
  };

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

  // 应用模板
  const applyTemplate = (template: typeof promptTemplates[0]) => {
    updatePersona('systemPrompt', template.template);
  };

  // 添加/移除职责
  const addResponsibility = () => {
    if (!newResponsibility.trim()) return;
    const currentResponsibilities = internalEditedEmployee?.persona?.responsibilities || [];
    updatePersona('responsibilities', [...currentResponsibilities, newResponsibility.trim()]);
    setNewResponsibility('');
  };

  const removeResponsibility = (index: number) => {
    const currentResponsibilities = internalEditedEmployee?.persona?.responsibilities || [];
    updatePersona('responsibilities', currentResponsibilities.filter((_, i) => i !== index));
  };

  // 添加/移除约束
  const addConstraint = () => {
    if (!newConstraint.trim()) return;
    const currentConstraints = internalEditedEmployee?.persona?.constraints || [];
    updatePersona('constraints', [...currentConstraints, newConstraint.trim()]);
    setNewConstraint('');
  };

  const removeConstraint = (index: number) => {
    const currentConstraints = internalEditedEmployee?.persona?.constraints || [];
    updatePersona('constraints', currentConstraints.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">角色与人设配置</h3>
          <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-2 py-1 rounded-full">
            增强版
          </span>
          {isInternalEditing && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑中
            </span>
          )}
        </div>
        {!isInternalEditing ? (
          <button
            onClick={handleInternalEdit}
            className="text-purple-600 hover:text-purple-700 flex items-center gap-1 px-3 py-2 border border-purple-200 rounded-lg hover:bg-purple-50"
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
              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* 基础人设配置 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-900">基础人设配置</span>
            </div>
            {expandedSections.basic ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.basic && (
            <div className="px-4 pb-4 space-y-6 border-t border-gray-100">
              {/* 系统提示词 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    系统提示词 <span className="text-red-500">*</span>
                  </label>
                  {isInternalEditing && promptTemplates.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-500" />
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
                {isInternalEditing ? (
                  <textarea
                    value={internalEditedEmployee?.persona.systemPrompt || ''}
                    onChange={(e) => updatePersona('systemPrompt', e.target.value)}
                    rows={8}
                    placeholder="定义数字员工的角色、职责、性格和对话风格..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {employee.persona.systemPrompt || '暂未配置系统提示词'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  系统提示词是数字员工的"人格基础"，将决定其行为方式和对话风格
                </p>
              </div>

              {/* 角色背景故事 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  角色背景故事
                </label>
                {isInternalEditing ? (
                  <textarea
                    value={internalEditedEmployee?.persona.characterBackground || ''}
                    onChange={(e) => updatePersona('characterBackground', e.target.value)}
                    rows={4}
                    placeholder="描述数字员工的背景故事、工作经历、专业特长等..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {employee.persona.characterBackground || '暂未配置角色背景'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  可选配置，有助于让数字员工的回答更加生动和个性化
                </p>
              </div>

              {/* 性格特点和职责 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 性格特点 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">性格特点</label>
                  {isInternalEditing ? (
                    <input
                      type="text"
                      value={internalEditedEmployee?.persona.personality || ''}
                      onChange={(e) => updatePersona('personality', e.target.value)}
                      placeholder="如：友好、专业、耐心、热情..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                      {employee.persona.personality || '暂未设置性格特点'}
                    </p>
                  )}
                </div>

                {/* 主要职责 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主要职责</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {(isInternalEditing ? internalEditedEmployee?.persona?.responsibilities : employee.persona.responsibilities || []).map((resp, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          <span>{resp}</span>
                          {isInternalEditing && (
                            <button
                              onClick={() => removeResponsibility(index)}
                              className="text-blue-600 hover:text-red-600 ml-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isInternalEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newResponsibility}
                          onChange={(e) => setNewResponsibility(e.target.value)}
                          placeholder="添加新职责..."
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addResponsibility();
                            }
                          }}
                        />
                        <button
                          onClick={addResponsibility}
                          disabled={!newResponsibility.trim()}
                          className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 核心特征配置 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('coreFeatures')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              <span className="font-medium text-gray-900">核心特征配置</span>
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                性格・工作・沟通
              </span>
            </div>
            {expandedSections.coreFeatures ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.coreFeatures && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <CoreFeaturesDisplay
                employee={employee}
                editedEmployee={internalEditedEmployee}
                isEditing={isInternalEditing}
                onFieldChange={(field, value) => {
                  if (internalEditedEmployee) {
                    setInternalEditedEmployee({
                      ...internalEditedEmployee,
                      [field]: value
                    });
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* 高级人设配置 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('advanced')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-gray-900">高级人设配置</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                行为约束
              </span>
            </div>
            {expandedSections.advanced ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.advanced && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {/* 行为约束 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  行为约束
                </label>
                <div className="space-y-2">
                  {(isInternalEditing ? internalEditedEmployee?.persona?.constraints : employee.persona?.constraints || []).map((constraint, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                      <span className="text-orange-800 text-sm flex-1">{constraint}</span>
                      {isInternalEditing && (
                        <button
                          onClick={() => removeConstraint(index)}
                          className="text-orange-600 hover:text-red-600 p-1"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {isInternalEditing && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newConstraint}
                        onChange={(e) => setNewConstraint(e.target.value)}
                        placeholder="例：不得泄露客户隐私信息"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addConstraint();
                          }
                        }}
                      />
                      <button
                        onClick={addConstraint}
                        disabled={!newConstraint.trim()}
                        className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
                      >
                        <Plus className="h-4 w-4" />
                        添加约束
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  定义数字员工不应该做的事情，确保行为合规
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 对话示例管理 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('dialogues')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">对话示例管理</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {(isInternalEditing ? internalEditedEmployee?.persona?.exampleDialogues : employee.persona?.exampleDialogues || []).length} 个示例
              </span>
            </div>
            {expandedSections.dialogues ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.dialogues && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {/* 现有对话示例 */}
              {(isInternalEditing ? internalEditedEmployee?.persona?.exampleDialogues : employee.persona?.exampleDialogues || []).length === 0 ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">暂无对话示例</p>
                  <p className="text-xs text-gray-400 mt-1">
                    添加对话示例可以帮助数字员工更好地理解期望的回答方式
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(isInternalEditing ? internalEditedEmployee?.persona?.exampleDialogues : employee.persona?.exampleDialogues || []).map((dialogue, index) => (
                    <div key={dialogue.id} className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">示例 {index + 1}</span>
                          {dialogue.tags && dialogue.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {dialogue.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {isInternalEditing && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingDialogue(editingDialogue === dialogue.id ? null : dialogue.id)}
                              className="text-gray-500 hover:text-blue-600 p-1"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => removeDialogue(dialogue.id)}
                              className="text-gray-500 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <span className="text-xs font-medium text-green-700 uppercase tracking-wide">用户输入</span>
                          <p className="text-gray-900 bg-white p-3 rounded-lg border text-sm mt-1 border-green-200">{dialogue.userInput}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">预期回复</span>
                          <p className="text-gray-900 bg-white p-3 rounded-lg border text-sm mt-1 border-blue-200">{dialogue.expectedResponse}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 添加新对话示例 */}
              {isInternalEditing && (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Plus className="h-5 w-5 text-green-600" />
                    <h5 className="font-medium text-green-900">添加新对话示例</h5>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">用户输入</label>
                      <textarea
                        value={newDialogue.userInput}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, userInput: e.target.value }))}
                        rows={2}
                        placeholder="用户可能的提问或输入..."
                        className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">预期回复</label>
                      <textarea
                        value={newDialogue.expectedResponse}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, expectedResponse: e.target.value }))}
                        rows={3}
                        placeholder="数字员工应该如何回复..."
                        className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-green-700 mb-2">标签 (逗号分隔)</label>
                      <input
                        type="text"
                        value={newDialogue.tags}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="如：问候, 业务咨询, 技术支持"
                        className="w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                    <button
                      onClick={addDialogue}
                      disabled={!newDialogue.userInput || !newDialogue.expectedResponse}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      添加示例
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

export default PersonaSection;