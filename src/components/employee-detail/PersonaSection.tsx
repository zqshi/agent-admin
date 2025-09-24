/**
 * 员工角色与人设配置组件
 */

import React, { useState } from 'react';
import { Brain, Plus, Edit3, Trash2, Save, X, Eye, EyeOff } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface PersonaSectionProps {
  employee: DigitalEmployee;
  editedEmployee: DigitalEmployee | null;
  isEditing: boolean;
  onFieldChange: (field: keyof DigitalEmployee, value: any) => void;
}

const PersonaSection: React.FC<PersonaSectionProps> = ({
  employee,
  editedEmployee,
  isEditing,
  onFieldChange
}) => {
  // 状态管理
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    advanced: false,
    dialogues: true,
    memory: false
  });

  const [editingDialogue, setEditingDialogue] = useState<string | null>(null);
  const [newDialogue, setNewDialogue] = useState({
    userInput: '',
    expectedResponse: '',
    tags: ''
  });

  const updatePersona = (field: string, value: any) => {
    if (editedEmployee) {
      onFieldChange('persona', {
        ...editedEmployee.persona,
        [field]: value
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

    const currentDialogues = editedEmployee?.persona?.exampleDialogues || [];
    updatePersona('exampleDialogues', [...currentDialogues, dialogue]);

    setNewDialogue({ userInput: '', expectedResponse: '', tags: '' });
  };

  // 删除对话示例
  const removeDialogue = (dialogueId: string) => {
    const currentDialogues = editedEmployee?.persona?.exampleDialogues || [];
    updatePersona('exampleDialogues', currentDialogues.filter(d => d.id !== dialogueId));
  };

  // 添加/移除职责
  const addResponsibility = (newResp: string) => {
    if (!newResp.trim()) return;
    const currentResponsibilities = editedEmployee?.persona?.responsibilities || [];
    updatePersona('responsibilities', [...currentResponsibilities, newResp.trim()]);
  };

  const removeResponsibility = (index: number) => {
    const currentResponsibilities = editedEmployee?.persona?.responsibilities || [];
    updatePersona('responsibilities', currentResponsibilities.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">角色与人设</h3>
        {isEditing && (
          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
            编辑中
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* 基础配置 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <span className="font-medium text-gray-900">基础配置</span>
            {expandedSections.basic ? (
              <EyeOff className="h-4 w-4 text-gray-500" />
            ) : (
              <Eye className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.basic && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {/* 系统提示词 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统提示词
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {isEditing ? (
                  <textarea
                    value={editedEmployee?.persona.systemPrompt || ''}
                    onChange={(e) => updatePersona('systemPrompt', e.target.value)}
                    rows={5}
                    placeholder="定义数字员工的角色、行为准则和回答风格..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg border">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {employee.persona.systemPrompt || '暂未配置系统提示词'}
                    </p>
                  </div>
                )}
              </div>

              {/* 性格特点和职责 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">性格特点</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedEmployee?.persona.personality || ''}
                      onChange={(e) => updatePersona('personality', e.target.value)}
                      placeholder="如：友好、专业、耐心..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 bg-gray-50 rounded-lg">
                      {employee.persona.personality || '未设置'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">主要职责</label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {(editedEmployee?.persona?.responsibilities || employee.persona.responsibilities || []).map((resp, index) => (
                        <div key={index} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          <span>{resp}</span>
                          {isEditing && (
                            <button
                              onClick={() => removeResponsibility(index)}
                              className="text-blue-600 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="添加新职责..."
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addResponsibility((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 对话示例 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('dialogues')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">对话示例</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {employee.persona?.exampleDialogues?.length || 0} 个
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
              {(employee.persona?.exampleDialogues || []).map((dialogue, index) => (
                <div key={dialogue.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">示例 {index + 1}</span>
                    {isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingDialogue(editingDialogue === dialogue.id ? null : dialogue.id)}
                          className="text-gray-500 hover:text-blue-600 p-1"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => removeDialogue(dialogue.id)}
                          className="text-gray-500 hover:text-red-600 p-1"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600">用户输入：</span>
                      <p className="text-gray-900 bg-white p-2 rounded border text-sm">{dialogue.userInput}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">预期回复：</span>
                      <p className="text-gray-900 bg-white p-2 rounded border text-sm">{dialogue.expectedResponse}</p>
                    </div>
                    {dialogue.tags && dialogue.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {dialogue.tags.map((tag, tagIndex) => (
                          <span key={tagIndex} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 添加新对话示例 */}
              {isEditing && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">添加新对话示例</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">用户输入</label>
                      <textarea
                        value={newDialogue.userInput}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, userInput: e.target.value }))}
                        rows={2}
                        placeholder="用户可能的提问或输入..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">预期回复</label>
                      <textarea
                        value={newDialogue.expectedResponse}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, expectedResponse: e.target.value }))}
                        rows={3}
                        placeholder="数字员工应该如何回复..."
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">标签 (逗号分隔)</label>
                      <input
                        type="text"
                        value={newDialogue.tags}
                        onChange={(e) => setNewDialogue(prev => ({ ...prev, tags: e.target.value }))}
                        placeholder="如：问候, 业务咨询, 技术支持"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      onClick={addDialogue}
                      disabled={!newDialogue.userInput || !newDialogue.expectedResponse}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
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

        {/* 记忆系统配置 */}
        {employee.memorySystem && (
          <div className="border border-gray-200 rounded-lg">
            <button
              onClick={() => toggleSection('memory')}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">记忆系统</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  已启用
                </span>
              </div>
              {expandedSections.memory ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {expandedSections.memory && (
              <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-1">工作记忆</h5>
                    <p className="text-xs text-blue-700">
                      {employee.memorySystem.workingMemory?.length || 0} 个条目
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-green-900 mb-1">情景记忆</h5>
                    <p className="text-xs text-green-700">
                      {employee.memorySystem.episodicMemory?.length || 0} 个条目
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h5 className="text-sm font-medium text-purple-900 mb-1">语义记忆</h5>
                    <p className="text-xs text-purple-700">
                      {employee.memorySystem.semanticMemory?.length || 0} 个条目
                    </p>
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

export default PersonaSection;