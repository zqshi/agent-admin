/**
 * 配置中心组件 - 统一管理全局配置和领域专属配置
 */

import React, { useState } from 'react';
import {
  Settings,
  Brain,
  Users,
  Shield,
  FileText,
  Wrench,
  Layers,
  ChevronRight,
  Globe,
  Building,
  Eye,
  Edit3,
  Save,
  X
} from 'lucide-react';
import type { DigitalEmployee, DomainConfig } from '../../types/employee';
import {
  PersonaSection,
  CapabilityConfigSection,
  PermissionsSection,
  RoleDefinitionSection
} from '../employee-detail';

interface ConfigurationHubProps {
  employee: DigitalEmployee;
  selectedDomainId: string;
  onDomainChange: (domainId: string) => void;
  onEmployeeChange?: (employee: DigitalEmployee) => void;
}

const ConfigurationHub: React.FC<ConfigurationHubProps> = ({
  employee,
  selectedDomainId,
  onDomainChange,
  onEmployeeChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<DigitalEmployee | null>(null);

  // 获取当前选中的领域配置
  const getCurrentDomain = (): DomainConfig | null => {
    if (selectedDomainId === 'global') return null;
    return employee.multiDomainConfig?.domains?.find(d => d.id === selectedDomainId) || null;
  };

  const currentDomain = getCurrentDomain();

  // 编辑操作
  const handleEdit = () => {
    setIsEditing(true);
    setEditedEmployee({ ...employee });
  };

  const handleSave = () => {
    if (editedEmployee && onEmployeeChange) {
      onEmployeeChange(editedEmployee);
      setIsEditing(false);
      setEditedEmployee(null);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(null);
  };

  // 配置分类
  const configurationSections = [
    {
      id: 'persona',
      title: '人设配置',
      icon: Users,
      description: '系统提示词、性格设定、角色背景',
      component: PersonaSection
    },
    {
      id: 'capability',
      title: '能力配置',
      icon: Brain,
      description: 'Prompt工程、工具管理、导师机制',
      component: CapabilityConfigSection
    },
    {
      id: 'permissions',
      title: '权限安全',
      icon: Shield,
      description: '访问权限、数据权限、操作权限',
      component: PermissionsSection
    },
    {
      id: 'role',
      title: '角色定义',
      icon: FileText,
      description: '职责范围、工作规范、业务边界',
      component: RoleDefinitionSection
    }
  ];

  // 获取当前显示的员工数据
  const getCurrentEmployee = () => editedEmployee || employee;

  return (
    <div className="space-y-6">
      {/* 配置头部 - 领域选择和操作按钮 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">配置中心</h2>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  保存
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                  取消
                </button>
              </>
            ) : (
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                编辑配置
              </button>
            )}
          </div>
        </div>

        {/* 领域选择器 */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-700 mb-2">配置范围</div>
          <div className="flex flex-wrap gap-2">
            {/* 全局配置按钮 */}
            <button
              onClick={() => onDomainChange('global')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                selectedDomainId === 'global'
                  ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Globe className="h-4 w-4" />
              全局配置
            </button>

            {/* 领域配置按钮 */}
            {employee.enableMultiDomain && employee.multiDomainConfig?.domains?.map(domain => (
              <button
                key={domain.id}
                onClick={() => onDomainChange(domain.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  selectedDomainId === domain.id
                    ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">{domain.icon}</span>
                {domain.name}
                {!domain.enabled && (
                  <span className="text-xs bg-gray-200 text-gray-500 px-1 rounded">
                    已禁用
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 当前配置范围说明 */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Eye className="h-4 w-4 text-gray-500" />
            <span className="font-medium text-gray-700">当前配置范围：</span>
            {currentDomain ? (
              <>
                <span className="text-base">{currentDomain.icon}</span>
                <span className="text-gray-900">{currentDomain.name} 领域</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{currentDomain.description}</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 text-blue-500" />
                <span className="text-gray-900">全局配置</span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">适用于所有领域的基础配置</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 配置内容区域 */}
      {currentDomain ? (
        // 领域专属配置
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDomain.name} 领域专属配置
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-700">权重配置</label>
                <div className="mt-1 text-2xl font-bold text-purple-800">
                  {currentDomain.weight}%
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${currentDomain.weight}%` }}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">启用状态</label>
                <div className={`mt-1 text-2xl font-bold ${
                  currentDomain.enabled ? 'text-green-800' : 'text-red-800'
                }`}>
                  {currentDomain.enabled ? '已启用' : '已禁用'}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {currentDomain.enabled ? '正常运行中' : '当前不参与路由'}
                </div>
              </div>
            </div>

            {/* 领域关键词 */}
            {currentDomain.keywords && currentDomain.keywords.length > 0 && (
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  领域关键词
                </label>
                <div className="flex flex-wrap gap-1">
                  {currentDomain.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 提示：领域专属配置功能开发中 */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Building className="h-5 w-5" />
                <span className="font-medium">领域专属配置</span>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                该领域的独立人设、提示词、知识库等配置功能正在开发中。
                当前显示的是全局配置内容，未来将支持领域级别的配置覆盖。
              </p>
            </div>
          </div>
        </div>
      ) : (
        // 全局配置
        <div className="space-y-6">
          {configurationSections.map((section) => {
            const SectionComponent = section.component;
            return (
              <div key={section.id} className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {section.description}
                  </p>
                </div>
                <div className="p-6">
                  <SectionComponent
                    employee={getCurrentEmployee()}
                    editedEmployee={editedEmployee}
                    isEditing={isEditing}
                    onFieldChange={isEditing ? (field: any, value: any) => {
                      if (editedEmployee) {
                        setEditedEmployee({
                          ...editedEmployee,
                          [field]: value
                        });
                      }
                    } : undefined}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ConfigurationHub;