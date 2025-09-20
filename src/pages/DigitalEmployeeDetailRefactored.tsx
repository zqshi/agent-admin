/**
 * 重构后的数字员工详情页面
 * 使用拆分的组件提高可维护性
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Database, Brain, Activity } from 'lucide-react';

import { DigitalEmployee } from '../types/employee';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';
import {
  BasicInfoSection,
  PersonaSection,
  PermissionsSection,
  MetricsSection,
  KnowledgeManagement
} from '../components/employee-detail';

const DigitalEmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [employee, setEmployee] = useState<DigitalEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'metrics'>('config');
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<DigitalEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  // 加载员工数据
  useEffect(() => {
    const loadEmployee = () => {
      setLoading(true);
      // 模拟API调用
      setTimeout(() => {
        const foundEmployee = mockDigitalEmployees.find(emp => emp.id === id);
        if (foundEmployee) {
          setEmployee(foundEmployee as DigitalEmployee);
        } else {
          navigate('/digital-employees', { replace: true });
        }
        setLoading(false);
      }, 500);
    };

    if (id) {
      loadEmployee();
    }
  }, [id, navigate]);

  // 编辑处理函数
  const handleEdit = () => {
    setIsEditing(true);
    setEditedEmployee(employee ? { ...employee } : null);
  };

  const handleSave = () => {
    if (editedEmployee) {
      setEmployee(editedEmployee);
      setIsEditing(false);
      setEditedEmployee(null);
      // 这里应该调用API保存数据
      console.log('保存员工数据:', editedEmployee);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(null);
  };

  const handleFieldChange = (field: keyof DigitalEmployee, value: any) => {
    if (editedEmployee) {
      setEditedEmployee({
        ...editedEmployee,
        [field]: value
      });
    }
  };

  // 状态标签组件
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '启用', className: 'bg-green-100 text-green-800' },
      disabled: { label: '禁用', className: 'bg-red-100 text-red-800' },
      retired: { label: '停用', className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.disabled;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // Tab配置
  const tabs = [
    { id: 'config', label: '配置管理', icon: Settings, description: '基础信息、人设、权限配置' },
    { id: 'knowledge', label: '知识库', icon: Database, description: '文档、FAQ、自学知识管理' },
    { id: 'metrics', label: '运行统计', icon: Activity, description: '性能指标、使用统计' }
  ];

  // 渲染Tab内容
  const renderTabContent = () => {
    if (!employee) return null;

    switch (activeTab) {
      case 'config':
        return (
          <div className="space-y-6">
            <BasicInfoSection
              employee={employee}
              editedEmployee={editedEmployee}
              isEditing={isEditing}
              onEdit={handleEdit}
              onSave={handleSave}
              onCancel={handleCancel}
              onFieldChange={handleFieldChange}
              getStatusBadge={getStatusBadge}
            />
            <PersonaSection
              employee={employee}
              editedEmployee={editedEmployee}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
            <PermissionsSection
              employee={employee}
              editedEmployee={editedEmployee}
              isEditing={isEditing}
              onFieldChange={handleFieldChange}
            />
          </div>
        );

      case 'knowledge':
        return <KnowledgeManagement employee={employee} />;

      case 'metrics':
        return <MetricsSection employee={employee} />;

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">未找到员工信息</p>
          <button
            onClick={() => navigate('/digital-employees')}
            className="text-blue-600 hover:text-blue-700"
          >
            返回员工列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/digital-employees')}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <Brain className="h-8 w-8 text-blue-600" />
                  {employee.name}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {employee.employeeNumber} • {employee.department}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(employee.status)}
            </div>
          </div>
        </div>
      </div>

      {/* Tab导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab描述 */}
        <div className="mb-6">
          <p className="text-gray-600">
            {tabs.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab内容 */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DigitalEmployeeDetail;