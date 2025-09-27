/**
 * 角色定义组件 - 展示和编辑数字员工的角色配置
 * 包含主要角色、职责列表、服务范围等基础信息
 */

import React, { useState } from 'react';
import { User, Edit3, Save, X, Plus, Minus, ChevronRight, Briefcase } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';
import { DataSourceIndicator } from '../common';

interface RoleDefinitionSectionProps {
  employee: DigitalEmployee;
}

// 扩展员工类型以包含角色定义字段
interface EmployeeWithRoleDefinition extends DigitalEmployee {
  primaryRole?: string;
  responsibilities?: string[];
  serviceScope?: string;
  targetAudience?: string[];
  workingHours?: string;
  specializations?: string[];
}

const RoleDefinitionSection: React.FC<RoleDefinitionSectionProps> = ({
  employee
}) => {
  // 独立编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<EmployeeWithRoleDefinition | null>(null);

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee } as EmployeeWithRoleDefinition);
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      console.log('保存角色定义:', internalEditedEmployee);
      // 这里应该调用API保存数据
      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  // 获取当前显示的员工数据
  const getCurrentEmployee = (): EmployeeWithRoleDefinition => {
    return (internalEditedEmployee || employee) as EmployeeWithRoleDefinition;
  };

  const currentEmployee = getCurrentEmployee();

  // 更新字段值
  const updateField = (field: keyof EmployeeWithRoleDefinition, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [field]: value
      });
    }
  };

  // 添加/删除列表项
  const addListItem = (field: 'responsibilities' | 'targetAudience' | 'specializations') => {
    if (internalEditedEmployee) {
      const currentList = internalEditedEmployee[field] || [];
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [field]: [...currentList, '']
      });
    }
  };

  const removeListItem = (field: 'responsibilities' | 'targetAudience' | 'specializations', index: number) => {
    if (internalEditedEmployee) {
      const currentList = internalEditedEmployee[field] || [];
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [field]: currentList.filter((_, i) => i !== index)
      });
    }
  };

  const updateListItem = (field: 'responsibilities' | 'targetAudience' | 'specializations', index: number, value: string) => {
    if (internalEditedEmployee) {
      const currentList = [...(internalEditedEmployee[field] || [])];
      currentList[index] = value;
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        [field]: currentList
      });
    }
  };

  // 渲染列表编辑器
  const renderListEditor = (
    field: 'responsibilities' | 'targetAudience' | 'specializations',
    label: string,
    placeholder: string
  ) => {
    const items = currentEmployee[field] || [];

    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          {isInternalEditing && (
            <button
              onClick={() => addListItem(field)}
              className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm"
            >
              <Plus className="h-4 w-4" />
              添加
            </button>
          )}
        </div>

        <div className="space-y-2">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                {isInternalEditing ? (
                  <>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateListItem(field, index, e.target.value)}
                      placeholder={placeholder}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => removeListItem(field, index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-900">{item || '未设置'}</span>
                )}
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-sm italic">暂未设置{label}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 标题和编辑按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <User className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">角色定义</h3>
          <DataSourceIndicator type="config" variant="dot" size="sm" />
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

      <p className="text-gray-600 mb-6">
        定义数字员工的核心角色、职责范围和服务对象，明确其在组织中的定位和价值。
      </p>

      {/* 角色配置表单 */}
      <div className="space-y-6">
        {/* 主要角色 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            主要角色 <span className="text-red-500">*</span>
          </label>
          {isInternalEditing ? (
            <input
              type="text"
              value={currentEmployee.primaryRole || ''}
              onChange={(e) => updateField('primaryRole', e.target.value)}
              placeholder="例如：智能客服助手、技术支持专家、销售顾问等"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">{currentEmployee.primaryRole || '未设置主要角色'}</span>
            </div>
          )}
        </div>

        {/* 职责列表 */}
        {renderListEditor('responsibilities', '核心职责', '输入具体职责描述')}

        {/* 服务范围 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">服务范围</label>
          {isInternalEditing ? (
            <textarea
              value={currentEmployee.serviceScope || ''}
              onChange={(e) => updateField('serviceScope', e.target.value)}
              placeholder="描述数字员工的服务边界和覆盖范围..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">{currentEmployee.serviceScope || '未设置服务范围'}</span>
            </div>
          )}
        </div>

        {/* 目标受众 */}
        {renderListEditor('targetAudience', '目标受众', '例如：内部员工、外部客户、合作伙伴等')}

        {/* 专业领域 */}
        {renderListEditor('specializations', '专业领域', '例如：技术支持、产品咨询、售后服务等')}

        {/* 工作时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">工作时间</label>
          {isInternalEditing ? (
            <input
              type="text"
              value={currentEmployee.workingHours || ''}
              onChange={(e) => updateField('workingHours', e.target.value)}
              placeholder="例如：7×24小时、工作日9:00-18:00等"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
              <span className="text-gray-900">{currentEmployee.workingHours || '未设置工作时间'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 角色定义总结 */}
      {!isInternalEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">角色总结</span>
          </div>
          <p className="text-blue-800 text-sm">
            {currentEmployee.primaryRole ? (
              `${currentEmployee.name}作为${currentEmployee.primaryRole}，负责${currentEmployee.responsibilities?.length || 0}项核心职责，服务于${currentEmployee.targetAudience?.length || 0}类目标用户群体。`
            ) : (
              '角色定义信息不完整，建议完善相关配置。'
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoleDefinitionSection;