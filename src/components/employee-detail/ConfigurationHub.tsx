/**
 * 配置中心组件 - 统一管理全局配置和领域专属配置
 */

import React, { useState } from 'react';
import {
  Settings,
  Brain,
  Users,
  FileText,
  Wrench,
  Layers,
  ChevronRight,
  Globe,
  Building,
  Eye,
  Edit3,
  Save,
  X,
  GitBranch,
  Database
} from 'lucide-react';
import type { DigitalEmployee, DomainConfig } from '../../types/employee';
import {
  PersonaSection,
  CapabilityConfigSection,
  RoutingStrategySection,
  KnowledgeAssetsSection
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
  // 领域配置二级Tab状态管理
  const [activeDomainConfigTab, setActiveDomainConfigTab] = useState<string>('persona');
  // 单领域配置Tab状态管理
  const [activeSingleDomainConfigTab, setActiveSingleDomainConfigTab] = useState<string>('persona');

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

  // 配置分类 - 支持单/多领域模式区分
  const getConfigurationSections = () => {
    const isGlobalConfig = selectedDomainId === 'global';

    if (isGlobalConfig) {
      if (employee.enableMultiDomain) {
        // 多领域模式的全局配置：仅显示智能路由策略
        return [
          {
            id: 'routing',
            title: '智能路由策略',
            icon: GitBranch,
            description: '多领域路由模式、策略配置、敏感度设置',
            component: RoutingStrategySection,
            scope: 'global'
          }
        ];
      } else {
        // 单领域模式的配置：显示6个配置tab（无领域切换）
        return [
          {
            id: 'persona',
            title: '人设配置',
            icon: Users,
            description: '系统提示词、角色背景、行为约束',
            component: PersonaSection,
            scope: 'global'
          },
          {
            id: 'prompt',
            title: 'Prompt工程',
            icon: FileText,
            description: '提示词模板、策略配置',
            component: CapabilityConfigSection,
            scope: 'global',
            activeTab: 'prompt'
          },
          {
            id: 'tools',
            title: '工具管理',
            icon: Wrench,
            description: '工具权限、使用策略',
            component: CapabilityConfigSection,
            scope: 'global',
            activeTab: 'tools'
          },
          {
            id: 'mentor',
            title: '导师机制',
            icon: Users,
            description: '学习指导、反馈机制',
            component: CapabilityConfigSection,
            scope: 'global',
            activeTab: 'mentor'
          },
          {
            id: 'knowledge',
            title: '知识配置',
            icon: Database,
            description: '文档管理、FAQ配置、知识积累',
            component: KnowledgeAssetsSection,
            scope: 'global'
          }
        ];
      }
    } else {
      // 领域配置（仅多领域模式）
      return [
        {
          id: 'persona',
          title: '领域人设配置',
          icon: Users,
          description: '领域特定的系统提示词、角色背景、行为约束',
          component: PersonaSection,
          scope: 'domain'
        },
        {
          id: 'capability',
          title: '领域能力配置',
          icon: Brain,
          description: '领域特定的Prompt工程、工具权限、导师机制',
          component: CapabilityConfigSection,
          scope: 'domain'
        }
      ];
    }
  };

  // 获取当前显示的员工数据
  const getCurrentEmployee = () => editedEmployee || employee;

  // 单领域配置内容渲染函数
  const renderSingleDomainConfigContent = () => {
    const currentEmployee = getCurrentEmployee();
    const props = {
      employee: currentEmployee,
      selectedDomainId: 'global',
      domainConfig: null,
      editedEmployee,
      isEditing,
      onFieldChange: isEditing ? (field: any, value: any) => {
        if (editedEmployee) {
          setEditedEmployee({
            ...editedEmployee,
            [field]: value
          });
        }
      } : undefined
    };

    switch (activeSingleDomainConfigTab) {
      case 'persona':
        return <PersonaSection {...props} />;
      case 'prompt':
      case 'tools':
      case 'mentor':
        return (
          <CapabilityConfigSection
            {...props}
            activeTab={activeSingleDomainConfigTab}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeAssetsSection
            {...props}
            isDomainSpecific={false}
          />
        );
      default:
        return <PersonaSection {...props} />;
    }
  };

  // 领域配置渲染辅助函数
  const renderDomainConfigContent = () => {
    const currentEmployee = getCurrentEmployee();
    const props = {
      employee: currentEmployee,
      selectedDomainId,
      domainConfig: currentDomain?.domainConfig,
      editedEmployee,
      isEditing,
      onFieldChange: isEditing ? (field: any, value: any) => {
        if (editedEmployee) {
          setEditedEmployee({
            ...editedEmployee,
            [field]: value
          });
        }
      } : undefined
    };

    switch (activeDomainConfigTab) {
      case 'persona':
        return <PersonaSection {...props} />;
      case 'prompt':
      case 'tools':
      case 'mentor':
        // 直接使用CapabilityConfigSection，但传递activeTab参数
        return (
          <CapabilityConfigSection
            {...props}
            activeTab={activeDomainConfigTab}
          />
        );
      case 'knowledge':
        return (
          <KnowledgeAssetsSection
            {...props}
            isDomainSpecific={true}
            domainName={currentDomain?.name}
          />
        );
      default:
        return <PersonaSection {...props} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 配置头部 - 领域选择和操作按钮 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">配置中心</h2>
          </div>

          {/* 编辑配置按钮 - 已隐藏，各Tab有独立编辑能力 */}
          {/*
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
          */}
        </div>

        {/* 领域选择器 - 仅多领域模式显示 */}
        {employee.enableMultiDomain && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700 mb-2">配置范围</div>
            <div className="flex flex-wrap gap-2">
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

              {employee.multiDomainConfig?.domains?.map(domain => {
                const hasCustomConfig = domain.domainConfig && Object.keys(domain.domainConfig).length > 0;

                return (
                  <button
                    key={domain.id}
                    onClick={() => onDomainChange(domain.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      selectedDomainId === domain.id
                        ? 'bg-purple-100 text-purple-700 border-purple-300 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{domain.icon}</span>
                    {domain.name}

                    {hasCustomConfig && (
                      <span className="text-xs bg-purple-100 text-purple-600 px-1 rounded flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        已配置
                      </span>
                    )}

                    {!domain.enabled && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">禁用</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 当前配置范围说明 - 仅多领域模式显示 */}
        {employee.enableMultiDomain && (
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
        )}
      </div>

      {/* 配置内容区域 */}
      <div className="space-y-6">
        {/* 如果是领域配置，先显示领域基本信息 */}
        {currentDomain && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDomain.name} 领域基本信息
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
          </div>
        )}

        {/* 领域配置二级Tab导航 - 仅在选择具体领域时显示 */}
        {currentDomain && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">领域配置管理</h3>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                {currentDomain.name}
              </span>
            </div>

            {/* 二级Tab导航 - 5个平级Tab */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-0 overflow-x-auto">
                <button
                  onClick={() => setActiveDomainConfigTab('persona')}
                  className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeDomainConfigTab === 'persona'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">领域人设</div>
                    <div className="text-xs text-gray-500 hidden lg:block">角色背景、行为约束</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveDomainConfigTab('prompt')}
                  className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeDomainConfigTab === 'prompt'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">Prompt工程</div>
                    <div className="text-xs text-gray-500 hidden lg:block">提示词模板、策略</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveDomainConfigTab('tools')}
                  className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeDomainConfigTab === 'tools'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Wrench className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">工具管理</div>
                    <div className="text-xs text-gray-500 hidden lg:block">工具权限、使用策略</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveDomainConfigTab('mentor')}
                  className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeDomainConfigTab === 'mentor'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">导师机制</div>
                    <div className="text-xs text-gray-500 hidden lg:block">导师配置、汇报设置</div>
                  </div>
                </button>
                <button
                  onClick={() => setActiveDomainConfigTab('knowledge')}
                  className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeDomainConfigTab === 'knowledge'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">知识配置</div>
                    <div className="text-xs text-gray-500 hidden lg:block">知识库、资产管理</div>
                  </div>
                </button>
              </nav>
            </div>

            {/* Tab内容区域 */}
            <div>
              {renderDomainConfigContent()}
            </div>
          </div>
        )}

        {/* 全局配置 - 仅在选择全局配置时显示 */}
        {!currentDomain && (() => {
          const sections = getConfigurationSections();

          if (employee.enableMultiDomain) {
            // 多领域全局配置：直接显示智能路由策略（无需标签导航）
            const section = sections[0]; // 只有智能路由策略一个section
            const SectionComponent = section.component;

            return (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <section.icon className="h-5 w-5 text-blue-600" />
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
                    selectedDomainId={selectedDomainId}
                    domainConfig={currentDomain?.domainConfig}
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
          } else {
            // 单领域配置：显示6个配置tab（无需领域选择器）
            return (
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">配置管理</h3>
                </div>

                {/* 6个配置Tab导航 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="flex space-x-0 overflow-x-auto">
                    <button
                      onClick={() => setActiveSingleDomainConfigTab('persona')}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSingleDomainConfigTab === 'persona'
                          ? 'border-gray-500 text-gray-600 bg-gray-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">人设配置</div>
                        <div className="text-xs text-gray-500 hidden lg:block">角色背景、行为约束</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSingleDomainConfigTab('prompt')}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSingleDomainConfigTab === 'prompt'
                          ? 'border-gray-500 text-gray-600 bg-gray-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">Prompt工程</div>
                        <div className="text-xs text-gray-500 hidden lg:block">提示词模板、策略</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSingleDomainConfigTab('tools')}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSingleDomainConfigTab === 'tools'
                          ? 'border-gray-500 text-gray-600 bg-gray-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Wrench className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">工具管理</div>
                        <div className="text-xs text-gray-500 hidden lg:block">工具权限、使用策略</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSingleDomainConfigTab('mentor')}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSingleDomainConfigTab === 'mentor'
                          ? 'border-gray-500 text-gray-600 bg-gray-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">导师机制</div>
                        <div className="text-xs text-gray-500 hidden lg:block">学习指导、反馈</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSingleDomainConfigTab('knowledge')}
                      className={`flex items-center gap-2 px-3 py-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                        activeSingleDomainConfigTab === 'knowledge'
                          ? 'border-gray-500 text-gray-600 bg-gray-50'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Database className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">知识配置</div>
                        <div className="text-xs text-gray-500 hidden lg:block">文档、FAQ、积累</div>
                      </div>
                    </button>
                  </nav>
                </div>

                {/* 配置内容区域 */}
                <div>
                  {renderSingleDomainConfigContent()}
                </div>
              </div>
            );
          }
        })()}
      </div>
    </div>
  );
};

export default ConfigurationHub;