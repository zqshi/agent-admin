/**
 * 重构后的数字员工详情页面
 * 使用拆分的组件提高可维护性
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Database, Brain, Activity, Sparkles, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { DigitalEmployee } from '../types/employee';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';
import {
  BasicInfoSection,
  PersonaSection,
  PermissionsSection,
  MetricsSection,
  KnowledgeManagement,
  AdvancedConfigSection,
  ConfigVersionManager
} from '../components/employee-detail';
import { KnowledgeGraphViewer, KnowledgeEvolutionTimeline } from '../components/knowledge';

const DigitalEmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [employee, setEmployee] = useState<DigitalEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'metrics' | 'insights' | 'evolution'>('config');
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
    { id: 'metrics', label: '运行统计', icon: Activity, description: '性能指标、使用统计' },
    { id: 'insights', label: '智能洞察', icon: Brain, description: '高级配置、Prompt工程、多领域管理', isNew: true },
    { id: 'evolution', label: '能力演化', icon: Sparkles, description: '知识图谱、演化历史、沉淀策略', isNew: true }
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

      case 'insights':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="config" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="config">高级配置</TabsTrigger>
                <TabsTrigger value="version">版本管理</TabsTrigger>
              </TabsList>

              <TabsContent value="config" className="mt-6">
                <AdvancedConfigSection
                  employee={employee}
                  editedEmployee={editedEmployee}
                  isEditing={isEditing}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="version" className="mt-6">
                <ConfigVersionManager
                  employee={employee}
                  onVersionRestore={(version) => {
                    console.log('恢复版本:', version);
                    // 这里可以实现版本恢复逻辑
                    // 通常会调用API来恢复指定版本的配置
                  }}
                  onSuggestionApply={(suggestion) => {
                    console.log('应用建议:', suggestion);
                    // 这里可以实现智能建议应用逻辑
                    // 根据建议类型执行相应的配置更新
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>
        );

      case 'evolution':
        // 生成模拟的知识演化事件数据
        const mockEvolutionEvents = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7天前
            type: 'learning' as const,
            category: 'knowledge' as const,
            title: '学习新的技术文档',
            description: '通过分析用户上传的React Hook文档，掌握了新的状态管理模式',
            source: '用户文档上传',
            impact: 'medium' as const,
            metrics: {
              knowledgeGain: 85,
              confidence: 78,
              applicability: 92
            },
            relatedConcepts: ['React Hooks', '状态管理', '函数式组件'],
            tags: ['前端开发', 'React'],
            evidences: [
              { type: 'document' as const, reference: 'react-hooks-guide.pdf', score: 0.85 },
              { type: 'performance' as const, reference: '问答准确率提升12%', score: 0.78 }
            ]
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5天前
            type: 'interaction' as const,
            category: 'experience' as const,
            title: '处理复杂用户查询',
            description: '成功解决了关于微服务架构设计的复杂问题，获得用户高分评价',
            source: '用户对话',
            impact: 'high' as const,
            metrics: {
              knowledgeGain: 65,
              confidence: 88,
              applicability: 95
            },
            relatedConcepts: ['微服务架构', 'API设计', '分布式系统'],
            tags: ['后端架构', '系统设计'],
            evidences: [
              { type: 'conversation' as const, reference: 'conversation-#2847', score: 0.95 },
              { type: 'feedback' as const, reference: '用户评分5/5星', score: 1.0 }
            ]
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3天前
            type: 'synthesis' as const,
            category: 'insight' as const,
            title: '跨领域知识融合',
            description: '将前端组件设计原理与后端API设计模式相结合，形成了全栈开发的新见解',
            source: '自主学习',
            impact: 'high' as const,
            metrics: {
              knowledgeGain: 92,
              confidence: 82,
              applicability: 87
            },
            relatedConcepts: ['全栈开发', '组件设计', 'API设计', '系统架构'],
            tags: ['全栈', '架构设计', '最佳实践'],
            evidences: [
              { type: 'performance' as const, reference: '跨领域问题解答率提升25%', score: 0.87 }
            ]
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2天前
            type: 'refinement' as const,
            category: 'skill' as const,
            title: '优化代码生成能力',
            description: '基于用户反馈，改进了JavaScript代码生成的质量和可读性',
            source: '反馈学习',
            impact: 'medium' as const,
            metrics: {
              knowledgeGain: 58,
              confidence: 85,
              applicability: 90
            },
            relatedConcepts: ['代码生成', 'JavaScript', '代码质量'],
            tags: ['代码生成', 'JavaScript', '优化'],
            evidences: [
              { type: 'feedback' as const, reference: '代码质量反馈改善', score: 0.85 },
              { type: 'performance' as const, reference: '代码可读性评分提升18%', score: 0.90 }
            ]
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1天前
            type: 'milestone' as const,
            category: 'knowledge' as const,
            title: '达成专业领域里程碑',
            description: '在Web开发领域的综合能力评估中达到专家级水平',
            source: '能力评估',
            impact: 'high' as const,
            metrics: {
              knowledgeGain: 0, // 里程碑事件不直接增加知识
              confidence: 95,
              applicability: 98
            },
            relatedConcepts: ['Web开发', '专业技能', '综合能力'],
            tags: ['里程碑', 'Web开发', '专家级'],
            evidences: [
              { type: 'performance' as const, reference: '专业能力评估报告', score: 0.95 }
            ]
          }
        ];

        return (
          <div className="space-y-6">
            {/* 知识图谱 */}
            <div className="bg-white rounded-lg border border-gray-200">
              <KnowledgeGraphViewer
                data={employee.knowledgeBase?.knowledgeGraph ? {
                  nodes: employee.knowledgeBase.knowledgeGraph.entities.map(entity => ({
                    id: entity.id,
                    name: entity.name,
                    type: entity.type as any,
                    x: Math.random() * 600 + 100,
                    y: Math.random() * 400 + 100,
                    size: 20 + Math.random() * 15,
                    confidence: entity.confidence || 0.8,
                    properties: entity.properties
                  })),
                  edges: employee.knowledgeBase.knowledgeGraph.relations.map(relation => ({
                    id: relation.id,
                    source: relation.sourceId,
                    target: relation.targetId,
                    type: relation.type as any,
                    weight: relation.strength || 0.5,
                    label: relation.label
                  })),
                  metadata: {
                    totalNodes: employee.knowledgeBase.knowledgeGraph.entities.length,
                    totalEdges: employee.knowledgeBase.knowledgeGraph.relations.length,
                    lastUpdated: employee.knowledgeBase.knowledgeGraph.lastUpdated
                  }
                } : null}
                height={500}
                interactive={true}
                showControls={true}
                onNodeClick={(node) => console.log('Node clicked:', node)}
                onEdgeClick={(edge) => console.log('Edge clicked:', edge)}
              />
            </div>

            {/* 知识演化时间轴 */}
            <KnowledgeEvolutionTimeline
              employeeId={employee.id}
              events={mockEvolutionEvents}
              onEventClick={(event) => {
                console.log('Evolution event clicked:', event);
                // 这里可以添加事件详情查看逻辑
              }}
            />
          </div>
        );

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
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    升级版本
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
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline flex items-center gap-2">
                    {tab.label}
                    {(tab as any).isNew && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        新
                      </span>
                    )}
                  </span>
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