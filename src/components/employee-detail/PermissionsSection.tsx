/**
 * 员工权限配置组件 - 增强版
 * 整合工具管理、权限配置、安全策略
 */

import React, { useState } from 'react';
import { Shield, Eye, Edit, AlertTriangle, Plus, X, Settings, Wrench, Database, Lock, Users, CheckCircle, Minus } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface PermissionsSectionProps {
  employee: DigitalEmployee;
}

const PermissionsSection: React.FC<PermissionsSectionProps> = ({
  employee
}) => {
  // 内部编辑状态管理
  const [isInternalEditing, setIsInternalEditing] = useState(false);
  const [internalEditedEmployee, setInternalEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 状态管理
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    tools: true,
    resources: true,
    knowledge: true,
    security: false
  });
  const [newTool, setNewTool] = useState('');
  const [newResource, setNewResource] = useState({ resourceName: '', resourceType: '', accessLevel: 'read', restrictions: '' });

  // 内部编辑控制方法
  const handleInternalEdit = () => {
    setIsInternalEditing(true);
    setInternalEditedEmployee({ ...employee });
  };

  const handleInternalSave = () => {
    if (internalEditedEmployee) {
      // 这里应该调用API保存数据
      console.log('保存权限配置:', internalEditedEmployee.permissions);

      // 实际项目中这里应该调用API更新员工数据
      // await updateEmployeePermissions(employee.id, internalEditedEmployee.permissions);

      setIsInternalEditing(false);
      setInternalEditedEmployee(null);
    }
  };

  const handleInternalCancel = () => {
    setIsInternalEditing(false);
    setInternalEditedEmployee(null);
  };

  const updatePermissions = (field: string, value: any) => {
    if (internalEditedEmployee) {
      setInternalEditedEmployee({
        ...internalEditedEmployee,
        permissions: {
          ...internalEditedEmployee.permissions,
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

  // 工具管理函数
  const addTool = () => {
    if (!newTool.trim()) return;
    const currentTools = internalEditedEmployee?.permissions?.allowedTools || employee.permissions.allowedTools || [];
    if (!currentTools.includes(newTool.trim())) {
      updatePermissions('allowedTools', [...currentTools, newTool.trim()]);
    }
    setNewTool('');
  };

  const removeTool = (toolIndex: number) => {
    const currentTools = internalEditedEmployee?.permissions?.allowedTools || employee.permissions.allowedTools || [];
    updatePermissions('allowedTools', currentTools.filter((_, index) => index !== toolIndex));
  };

  // 资源管理函数
  const addResource = () => {
    if (!newResource.resourceName.trim() || !newResource.resourceType.trim()) return;
    const currentResources = internalEditedEmployee?.permissions?.resourceAccess || employee.permissions.resourceAccess || [];
    const resource = {
      resourceName: newResource.resourceName.trim(),
      resourceType: newResource.resourceType.trim(),
      accessLevel: newResource.accessLevel as 'read' | 'write' | 'admin',
      restrictions: newResource.restrictions ? newResource.restrictions.split(',').map(r => r.trim()).filter(Boolean) : []
    };
    updatePermissions('resourceAccess', [...currentResources, resource]);
    setNewResource({ resourceName: '', resourceType: '', accessLevel: 'read', restrictions: '' });
  };

  const removeResource = (resourceIndex: number) => {
    const currentResources = internalEditedEmployee?.permissions?.resourceAccess || employee.permissions.resourceAccess || [];
    updatePermissions('resourceAccess', currentResources.filter((_, index) => index !== resourceIndex));
  };

  // 知识管理权限切换
  const toggleKnowledgePermission = (permission: 'canSelfLearn' | 'canModifyKnowledge') => {
    const currentKnowledgePerms = internalEditedEmployee?.permissions?.knowledgeManagement || employee.permissions.knowledgeManagement;
    updatePermissions('knowledgeManagement', {
      ...currentKnowledgePerms,
      [permission]: !currentKnowledgePerms[permission]
    });
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

  // 预定义工具列表
  const availableTools = [
    'Web搜索', 'API调用', '文件上传', '图像处理', '数据分析',
    '代码执行', '邮件发送', 'PDF生成', '表格处理', '日历管理',
    '第三方集成', '数据库查询', '消息推送', '语音合成', '图表生成'
  ];

  const currentPermissions = isInternalEditing ? internalEditedEmployee?.permissions : employee.permissions;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">权限与工具配置</h3>
          <span className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-2 py-1 rounded-full">
            整合版
          </span>
          {isInternalEditing && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              编辑中
            </span>
          )}
        </div>
        {!isInternalEditing ? (
          <button
            onClick={handleInternalEdit}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 px-3 py-2 border border-blue-200 rounded-lg hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
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
              <Shield className="h-4 w-4" />
              保存
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* 工具权限管理 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('tools')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">工具权限管理</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {currentPermissions.allowedTools?.length || 0} 个工具
              </span>
            </div>
            {expandedSections.tools ? (
              <Minus className="h-4 w-4 text-gray-500" />
            ) : (
              <Plus className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.tools && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {/* 已配置工具 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">已配置工具</label>
                <div className="flex flex-wrap gap-2">
                  {(currentPermissions.allowedTools || []).map((tool, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>{tool}</span>
                      {isInternalEditing && (
                        <button
                          onClick={() => removeTool(index)}
                          className="text-blue-600 hover:text-red-600 ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {!currentPermissions.allowedTools?.length && (
                  <p className="text-gray-500 text-sm">暂未配置工具权限</p>
                )}
              </div>

              {/* 添加新工具 */}
              {isInternalEditing && (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <h5 className="font-medium text-blue-900">添加工具权限</h5>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-2">选择工具</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {availableTools
                          .filter(tool => !currentPermissions.allowedTools?.includes(tool))
                          .map(tool => (
                            <button
                              key={tool}
                              onClick={() => {
                                const currentTools = currentPermissions.allowedTools || [];
                                updatePermissions('allowedTools', [...currentTools, tool]);
                              }}
                              className="text-xs bg-white text-blue-700 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                            >
                              + {tool}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTool}
                        onChange={(e) => setNewTool(e.target.value)}
                        placeholder="或输入自定义工具名称..."
                        className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTool();
                          }
                        }}
                      />
                      <button
                        onClick={addTool}
                        disabled={!newTool.trim()}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 资源访问权限 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('resources')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">资源访问权限</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {currentPermissions.resourceAccess?.length || 0} 个资源
              </span>
            </div>
            {expandedSections.resources ? (
              <Minus className="h-4 w-4 text-gray-500" />
            ) : (
              <Plus className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.resources && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {currentPermissions.resourceAccess && currentPermissions.resourceAccess.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">资源名称</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">访问级别</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">限制</th>
                        {isInternalEditing && <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">操作</th>}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentPermissions.resourceAccess.map((resource, index) => (
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
                          {isInternalEditing && (
                            <td className="px-4 py-2 text-sm">
                              <button
                                onClick={() => removeResource(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">暂未配置资源访问权限</p>
              )}

              {/* 添加新资源 */}
              {isInternalEditing && (
                <div className="border-2 border-dashed border-green-300 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-4 w-4 text-green-600" />
                    <h5 className="font-medium text-green-900">添加资源权限</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={newResource.resourceName}
                      onChange={(e) => setNewResource(prev => ({ ...prev, resourceName: e.target.value }))}
                      placeholder="资源名称"
                      className="px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <input
                      type="text"
                      value={newResource.resourceType}
                      onChange={(e) => setNewResource(prev => ({ ...prev, resourceType: e.target.value }))}
                      placeholder="资源类型"
                      className="px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <select
                      value={newResource.accessLevel}
                      onChange={(e) => setNewResource(prev => ({ ...prev, accessLevel: e.target.value }))}
                      className="px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="read">只读</option>
                      <option value="write">读写</option>
                      <option value="admin">管理员</option>
                    </select>
                    <input
                      type="text"
                      value={newResource.restrictions}
                      onChange={(e) => setNewResource(prev => ({ ...prev, restrictions: e.target.value }))}
                      placeholder="限制条件(逗号分隔)"
                      className="px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  <button
                    onClick={addResource}
                    disabled={!newResource.resourceName.trim() || !newResource.resourceType.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    添加资源
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 知识管理权限 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('knowledge')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-900">知识管理权限</span>
            </div>
            {expandedSections.knowledge ? (
              <Minus className="h-4 w-4 text-gray-500" />
            ) : (
              <Plus className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.knowledge && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-3 border rounded-lg transition-colors ${
                  currentPermissions.knowledgeManagement?.canSelfLearn
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">自主学习</span>
                      <p className="text-xs text-gray-500">允许从对话中学习新知识</p>
                    </div>
                    {isInternalEditing ? (
                      <button
                        onClick={() => toggleKnowledgePermission('canSelfLearn')}
                        className={`w-6 h-6 rounded-full transition-colors ${
                          currentPermissions.knowledgeManagement?.canSelfLearn
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {currentPermissions.knowledgeManagement?.canSelfLearn && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        currentPermissions.knowledgeManagement?.canSelfLearn
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                </div>

                <div className={`p-3 border rounded-lg transition-colors ${
                  currentPermissions.knowledgeManagement?.canModifyKnowledge
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">修改知识</span>
                      <p className="text-xs text-gray-500">允许修改已有知识内容</p>
                    </div>
                    {isInternalEditing ? (
                      <button
                        onClick={() => toggleKnowledgePermission('canModifyKnowledge')}
                        className={`w-6 h-6 rounded-full transition-colors ${
                          currentPermissions.knowledgeManagement?.canModifyKnowledge
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {currentPermissions.knowledgeManagement?.canModifyKnowledge && (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      <div className={`w-3 h-3 rounded-full ${
                        currentPermissions.knowledgeManagement?.canModifyKnowledge
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 安全策略 */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleSection('security')}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
          >
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-red-600" />
              <span className="font-medium text-gray-900">安全策略</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                高级
              </span>
            </div>
            {expandedSections.security ? (
              <Minus className="h-4 w-4 text-gray-500" />
            ) : (
              <Plus className="h-4 w-4 text-gray-500" />
            )}
          </button>

          {expandedSections.security && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">访问限制</span>
                  </div>
                  <p className="text-xs text-orange-700">
                    基于时间、地理位置等条件的访问限制策略
                  </p>
                </div>
                <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">用户验证</span>
                  </div>
                  <p className="text-xs text-purple-700">
                    多因素认证和用户身份验证机制
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500 italic">
                💡 安全策略功能正在开发中，敬请期待
              </div>
            </div>
          )}
        </div>

        {/* 权限统计 */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            权限配置统计
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-lg font-bold text-blue-600">{currentPermissions.allowedTools?.length || 0}</div>
              <div className="text-xs text-gray-600">可用工具</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-lg font-bold text-green-600">{currentPermissions.resourceAccess?.length || 0}</div>
              <div className="text-xs text-gray-600">资源访问</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-lg font-bold text-purple-600">
                {Object.values(currentPermissions.knowledgeManagement || {}).filter(Boolean).length}
              </div>
              <div className="text-xs text-gray-600">知识权限</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <div className="text-lg font-bold text-orange-600">
                {isInternalEditing ? '编辑中' : '查看模式'}
              </div>
              <div className="text-xs text-gray-600">当前状态</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PermissionsSection;