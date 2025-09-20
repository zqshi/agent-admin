/**
 * 员工基础信息编辑组件
 */

import React from 'react';
import { Edit3, Save, X, User } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface BasicInfoSectionProps {
  employee: DigitalEmployee;
  editedEmployee: DigitalEmployee | null;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFieldChange: (field: keyof DigitalEmployee, value: any) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  employee,
  editedEmployee,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFieldChange,
  getStatusBadge
}) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">基础信息</h3>
        {!isEditing && (
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Edit3 className="h-4 w-4" />
            编辑
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">员工姓名</label>
          {isEditing ? (
            <input
              type="text"
              value={editedEmployee?.name || ''}
              onChange={(e) => onFieldChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{employee.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">员工编号</label>
          <p className="text-gray-900">{employee.employeeNumber}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">所属部门</label>
          {isEditing ? (
            <select
              value={editedEmployee?.department || ''}
              onChange={(e) => onFieldChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="客户服务部">客户服务部</option>
              <option value="技术支持部">技术支持部</option>
              <option value="销售部">销售部</option>
              <option value="人力资源部">人力资源部</option>
              <option value="管理层">管理层</option>
            </select>
          ) : (
            <p className="text-gray-900">{employee.department}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
          {isEditing ? (
            <select
              value={editedEmployee?.status || ''}
              onChange={(e) => onFieldChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">启用</option>
              <option value="disabled">禁用</option>
              <option value="retired">停用</option>
            </select>
          ) : (
            getStatusBadge(employee.status)
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
        {isEditing ? (
          <textarea
            value={editedEmployee?.description || ''}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="输入数字员工的描述..."
          />
        ) : (
          <p className="text-gray-900">{employee.description || '暂无描述'}</p>
        )}
      </div>

      {/* 编辑操作按钮 */}
      {isEditing && (
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-1"
          >
            <X className="h-4 w-4" />
            取消
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            保存
          </button>
        </div>
      )}
    </div>
  );
};

export default BasicInfoSection;