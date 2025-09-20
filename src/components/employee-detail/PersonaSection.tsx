/**
 * 员工角色与人设配置组件
 */

import React from 'react';
import { Brain } from 'lucide-react';
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
  const updatePersona = (field: string, value: any) => {
    if (editedEmployee) {
      onFieldChange('persona', {
        ...editedEmployee.persona,
        [field]: value
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">角色与人设</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">系统提示词</label>
          {isEditing ? (
            <textarea
              value={editedEmployee?.persona.systemPrompt || ''}
              onChange={(e) => updatePersona('systemPrompt', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{employee.persona.systemPrompt}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">性格特点</label>
            {isEditing ? (
              <input
                type="text"
                value={editedEmployee?.persona.personality || ''}
                onChange={(e) => updatePersona('personality', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{employee.persona.personality}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">主要职责</label>
            <div className="flex flex-wrap gap-1">
              {employee.persona.responsibilities.map((resp, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {resp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 对话示例 */}
        {employee.persona.exampleDialogues && employee.persona.exampleDialogues.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">对话示例</label>
            <div className="space-y-3">
              {employee.persona.exampleDialogues.map((dialogue, index) => (
                <div key={dialogue.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">用户输入：</span>
                    <p className="text-gray-900">{dialogue.userInput}</p>
                  </div>
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700">预期回复：</span>
                    <p className="text-gray-900">{dialogue.expectedResponse}</p>
                  </div>
                  {dialogue.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {dialogue.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonaSection;