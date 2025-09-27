/**
 * 职责配置展示组件
 * 用于在详情页展示和编辑数字员工的职责配置
 */

import React, { useState } from 'react';
import { Target, Plus, Minus, Edit3, Save, X, Briefcase, Users, Building2 } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface ResponsibilitySectionProps {
  employee: DigitalEmployee;
  onEmployeeChange?: (updatedEmployee: DigitalEmployee) => void;
}

const ResponsibilitySection: React.FC<ResponsibilitySectionProps> = ({
  employee,
  onEmployeeChange
}) => {
  // 独立编辑状态
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 获取职责数据
  const getResponsibilityData = () => {
    return internalEditedEmployee || employee;
  };

  const currentEmployee = getResponsibilityData();

  // 独立编辑控制
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee && onEmployeeChange) {
      onEmployeeChange(internalEditedEmployee);
    }
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  // 更新职责数据
  const updateEmployee = (updates: Partial<DigitalEmployee>) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        ...updates
      });
    }
  };

  // 添加职责项
  const addResponsibility = () => {
    updateEmployee({
      persona: {
        ...currentEmployee.persona,
        responsibilities: [...(currentEmployee.persona.responsibilities || []), '']
      }
    });
  };

  // 删除职责项
  const removeResponsibility = (index: number) => {
    updateEmployee({
      persona: {
        ...currentEmployee.persona,
        responsibilities: currentEmployee.persona.responsibilities?.filter((_, i) => i !== index) || []
      }
    });
  };

  // 更新职责项
  const updateResponsibility = (index: number, value: string) => {
    updateEmployee({
      persona: {
        ...currentEmployee.persona,
        responsibilities: currentEmployee.persona.responsibilities?.map((r, i) => i === index ? value : r) || []
      }
    });
  };

  // 职责列表为空或不存在时的提示
  const hasResponsibilities = currentEmployee.persona.responsibilities &&
    currentEmployee.persona.responsibilities.some(r => r.trim());

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 头部和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">职责配置</h3>
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
        {/* 基本角色信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">部门</label>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900">{currentEmployee.department}</span>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">角色描述</label>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900">{currentEmployee.description || '暂无描述'}</span>
            </div>
          </div>
        </div>

        {/* 主要职责列表 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">主要职责</label>
            {isInternalEditing && (
              <button
                onClick={addResponsibility}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                添加职责
              </button>
            )}
          </div>

          {!hasResponsibilities && !isInternalEditing ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="h-4 w-4" />
                <span className="text-sm">暂未配置具体职责</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {currentEmployee.persona.responsibilities?.map((responsibility, index) => (
                <div key={index} className="flex gap-2 items-center">
                  {isInternalEditing ? (
                    <>
                      <input
                        type="text"
                        value={responsibility}
                        onChange={(e) => updateResponsibility(index, e.target.value)}
                        placeholder="输入职责内容..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {(currentEmployee.persona.responsibilities?.length || 0) > 1 && (
                        <button
                          onClick={() => removeResponsibility(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-start gap-2 w-full p-3 bg-gray-50 rounded-lg">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-700">{responsibility}</span>
                    </div>
                  )}
                </div>
              )) || []}

              {/* 在编辑模式下，如果没有职责项，显示一个空的输入框 */}
              {isInternalEditing && (!currentEmployee.persona.responsibilities || currentEmployee.persona.responsibilities.length === 0) && (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value=""
                    onChange={(e) => updateResponsibility(0, e.target.value)}
                    placeholder="输入职责内容..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ResponsibilitySection;