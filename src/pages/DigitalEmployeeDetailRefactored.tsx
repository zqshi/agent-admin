/**
 * 重构后的数字员工详情页面
 * 支持单领域和多领域双模式架构
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Settings,
  Database,
  Brain,
  Activity,
  Sparkles,
  TrendingUp,
  BarChart3,
  Eye,
  Layers,
  Network,
  PieChart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DigitalEmployee } from '../types/employee';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';
import { useToast, ToastContainer, DataSourceIndicator } from '../components/common';
import {
  BasicInfoSection,
  PersonaSection,
  PermissionsSection,
  MetricsSection,
  AdvancedConfigSection,
  InsightsCenter,
  RoleDefinitionSection,
  CapabilityConfigSection,
  KnowledgeAssetsSection,
  RoutingStrategySection,
  ConfigurationHub,
  KnowledgeInsightCenter,
  ResponsibilitySection
} from '../components/employee-detail';
import DomainManagement from '../components/employee-detail/DomainManagement';
import CoreFeaturesDisplay from '../components/employee-detail/CoreFeaturesDisplay';
import { KnowledgeGraphViewer } from '../components/knowledge';

const DigitalEmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [employee, setEmployee] = useState<DigitalEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedDomainId, setSelectedDomainId] = useState<string>('global');
  const [loading, setLoading] = useState(true);
  const { messages, toast, removeToast } = useToast();

  // 加载员工数据
  useEffect(() => {
    const loadEmployee = () => {
      setLoading(true);
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

  // 处理知识图谱节点点击
  const handleNodeClick = (node: any) => {
    console.log('知识图谱节点被点击:', node);
    if (node.type === 'concept') {
      toast.info('概念详情', `${node.name} - 置信度: ${(node.confidence * 100).toFixed(1)}%`);
    } else {
      toast.info('节点信息', `${node.name} - 详细信息可在右侧面板查看`);
    }
  };

  // 处理知识图谱边点击
  const handleEdgeClick = (edge: any) => {
    console.log('知识图谱边被点击:', edge);
    toast.info('关系信息', `${edge.type} - 强度: ${edge.weight} - ${edge.label || '无标签'}`);
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

  // 获取统一的Tab配置
  const getTabs = () => {
    return [
      {
        id: 'overview',
        label: '总览',
        icon: Eye,
        description: '基础信息、状态概览、核心特征展示',
        type: 'overview'
      },
      {
        id: 'domain-management',
        label: '领域管理',
        icon: Layers,
        description: '多领域配置、路由策略、领域权重管理',
        type: 'domain'
      },
      {
        id: 'configuration',
        label: '配置中心',
        icon: Settings,
        description: '人设、Prompt、工具、导师等详细配置',
        type: 'config'
      },
      {
        id: 'knowledge-insights',
        label: '知识洞察',
        icon: Network,
        description: '跨领域知识图谱、智能分析洞察',
        type: 'knowledge'
      },
      {
        id: 'operational-metrics',
        label: '运营指标',
        icon: BarChart3,
        description: '性能监控、对话分析、优化建议',
        type: 'metrics'
      }
    ];
  };

  const tabs = getTabs();

  // 渲染Tab内容
  const renderTabContent = () => {
    if (!employee) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <BasicInfoSection
              employee={employee}
              getStatusBadge={getStatusBadge}
            />
            <ResponsibilitySection
              employee={employee}
              onEmployeeChange={(updatedEmployee) => {
                setEmployee(updatedEmployee);
                toast.success('职责配置更新', '员工职责配置已保存');
              }}
            />
            <CoreFeaturesDisplay
              employee={employee}
              onEmployeeChange={(updatedEmployee) => {
                setEmployee(updatedEmployee);
                toast.success('核心特征更新', '人格配置已保存');
              }}
            />
          </div>
        );

      case 'domain-management':
        return (
          <DomainManagement
            employee={employee}
            onEmployeeChange={(updatedEmployee) => {
              setEmployee(updatedEmployee);
              toast.success('领域配置更新', '多领域配置已保存');
            }}
          />
        );

      case 'configuration':
        return (
          <ConfigurationHub
            employee={employee}
            selectedDomainId={selectedDomainId}
            onDomainChange={setSelectedDomainId}
            onEmployeeChange={(updatedEmployee) => {
              setEmployee(updatedEmployee);
              toast.success('配置更新成功', '员工配置已保存');
            }}
          />
        );

      case 'knowledge-insights':
        return (
          <KnowledgeInsightCenter
            employee={employee}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        );

      case 'operational-metrics':
        return (
          <div className="space-y-6">
            <MetricsSection employee={employee} />
            <InsightsCenter employee={employee} />
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>该功能正在开发中</p>
            </div>
          </div>
        );
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
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    优化版本
                  </span>
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
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {React.isValidElement(Icon) ? Icon : <Icon className="h-5 w-5" />}
                  <span>{tab.label}</span>
                  {/* 数据来源指示器 */}
                  <DataSourceIndicator
                    type={tab.type === 'config' ? 'config' : 'operational'}
                    size="sm"
                    variant="dot"
                  />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Toast通知容器 */}
      <ToastContainer messages={messages} onClose={removeToast} />
    </div>
  );
};

export default DigitalEmployeeDetail;