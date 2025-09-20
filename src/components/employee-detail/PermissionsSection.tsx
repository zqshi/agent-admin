/**
 * 员工权限配置组件
 */

import React from 'react';
import { Shield, Eye, Edit, AlertTriangle } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface PermissionsSectionProps {
  employee: DigitalEmployee;
  editedEmployee: DigitalEmployee | null;
  isEditing: boolean;
  onFieldChange: (field: keyof DigitalEmployee, value: any) => void;
}

const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  employee,
  editedEmployee,
  isEditing,
  onFieldChange
}) => {
  const updatePermissions = (field: string, value: any) => {
    if (editedEmployee) {
      onFieldChange('permissions', {
        ...editedEmployee.permissions,
        [field]: value
      });
    }
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'read':
        return <Eye className="h-4 w-4" />;
      case 'write':
        return <Edit className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'read':
        return 'bg-blue-100 text-blue-800';
      case 'write':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">权限配置</h3>

      <div className="space-y-6">
        {/* 可用工具 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">可用工具</label>
          <div className="flex flex-wrap gap-2">
            {employee.permissions.allowedTools.map((tool, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
              >
                <Shield className="h-3 w-3" />
                {tool}
              </span>
            ))}
          </div>
          {employee.permissions.allowedTools.length === 0 && (
            <p className="text-gray-500 text-sm">暂未配置工具权限</p>
          )}
        </div>

        {/* 资源访问权限 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">资源访问权限</label>
          {employee.permissions.resourceAccess.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">资源名称</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">访问级别</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">限制</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employee.permissions.resourceAccess.map((resource, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">{resource.resourceName}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {resource.resourceType}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${getAccessLevelColor(resource.accessLevel)}`}>
                          {getAccessLevelIcon(resource.accessLevel)}
                          {resource.accessLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">
                        {resource.restrictions && resource.restrictions.length > 0
                          ? resource.restrictions.join(', ')
                          : '无限制'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">暂未配置资源访问权限</p>
          )}
        </div>

        {/* 知识管理权限 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">知识管理权限</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">自主学习</span>
                <p className="text-xs text-gray-500">允许从对话中学习新知识</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${employee.permissions.knowledgeManagement.canSelfLearn ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">修改知识</span>
                <p className="text-xs text-gray-500">允许修改已有知识内容</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${employee.permissions.knowledgeManagement.canModifyKnowledge ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            </div>
          </div>
        </div>

        {/* 权限统计 */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">权限统计</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">{employee.permissions.allowedTools.length}</div>
              <div className="text-xs text-gray-600">可用工具</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">{employee.permissions.resourceAccess.length}</div>
              <div className="text-xs text-gray-600">资源访问</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {Object.values(employee.permissions.knowledgeManagement).filter(Boolean).length}
              </div>
              <div className="text-xs text-gray-600">知识权限</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsSection;