/**
 * 数字员工详情页面 - 统一设计风格版本
 * 使用Apple风格设计系统，与主页保持一致
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Database, Brain, Activity, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 导入统一UI组件系统
import {
  PageLayout,
  PageHeader,
  PageContent,
  Card,
  CardHeader,
  CardBody,
  Button,
  Badge,
  MetricCard,
  Input
} from '../components/ui';

import { DigitalEmployee } from '../types/employee';
import { mockDigitalEmployees } from '../data/mockDigitalEmployees';
import {
  KnowledgeManagement,
  ConfigurationCenter,
  EnhancedMetricsSection
} from '../components/employee-detail';
import { KnowledgeGraphViewer, KnowledgeEvolutionTimeline } from '../components/knowledge';

const DigitalEmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [employee, setEmployee] = useState<DigitalEmployee | null>(null);
  const [activeTab, setActiveTab] = useState<'config' | 'knowledge' | 'metrics' | 'evolution'>('config');
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

  // 编辑操作处理
  const handleEdit = () => {
    setIsEditing(true);
    setEditedEmployee(employee ? { ...employee } : null);
  };

  const handleSave = () => {
    if (editedEmployee) {
      setEmployee(editedEmployee);
      setIsEditing(false);
      // 这里可以添加API调用来保存数据
      console.log('保存员工信息:', editedEmployee);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(null);
  };

  const handleFieldChange = (field: string, value: any) => {
    if (editedEmployee) {
      setEditedEmployee({
        ...editedEmployee,
        [field]: value
      });
    }
  };

  // 状态徽章样式
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '运行中', variant: 'success' as const },
      disabled: { label: '已停用', variant: 'warning' as const },
      retired: { label: '已下线', variant: 'neutral' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  // Tab配置 - 整合后的简化版本
  const tabs = [
    { id: 'config', label: '配置中心', icon: Settings, description: '统一配置管理、版本控制、智能建议' },
    { id: 'knowledge', label: '知识库', icon: Database, description: '文档、FAQ、自学知识管理' },
    { id: 'metrics', label: '运行分析', icon: Activity, description: '性能监控、智能洞察、趋势分析' },
    { id: 'evolution', label: '能力演化', icon: Sparkles, description: '知识图谱、演化历史、沉淀策略' }
  ];

  // 渲染Tab内容
  const renderTabContent = () => {
    if (!employee) return null;

    switch (activeTab) {
      case 'config':
        return (
          <ConfigurationCenter
            employee={employee}
            editedEmployee={editedEmployee}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
            onFieldChange={handleFieldChange}
            getStatusBadge={getStatusBadge}
          />
        );

      case 'knowledge':
        return <KnowledgeManagement employee={employee} />;

      case 'metrics':
        return <EnhancedMetricsSection employee={employee} />;

      case 'evolution':
        // 生成模拟的知识演化事件数据
        const mockEvolutionEvents = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            type: 'learning' as const,
            category: 'knowledge' as const,
            title: '学习新的技术文档',
            description: '通过分析用户上传的React Hook文档，掌握了新的状态管理模式',
            source: '用户文档上传',
            impact: 'medium' as const,
            metrics: {
              knowledgeGrowth: 15,
              accuracyImprovement: 8,
              responseQuality: 12
            },
            tags: ['React', 'Hooks', '状态管理']
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            type: 'optimization' as const,
            category: 'performance' as const,
            title: '响应速度优化',
            description: '基于用户反馈数据，优化了问答逻辑，响应时间减少30%',
            source: '自动优化算法',
            impact: 'high' as const,
            metrics: {
              responseTime: -30,
              userSatisfaction: 25,
              throughput: 40
            },
            tags: ['性能优化', '响应时间', '用户体验']
          }
        ];

        return (
          <div className="space-y-6">
            {/* 知识图谱 */}
            <Card>
              <CardHeader>
                <h3 className="card-title">知识图谱网络</h3>
                <p className="card-subtitle">可视化展示知识结构和关联关系</p>
              </CardHeader>
              <CardBody>
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
                      confidence: relation.confidence || 0.8
                    }))
                  } : { nodes: [], edges: [] }}
                  onNodeClick={(node) => console.log('点击节点:', node)}
                  onEdgeClick={(edge) => console.log('点击边:', edge)}
                />
              </CardBody>
            </Card>

            {/* 能力演化时间线 */}
            <Card>
              <CardHeader>
                <h3 className="card-title">能力演化历史</h3>
                <p className="card-subtitle">追踪数字员工的学习和优化历程</p>
              </CardHeader>
              <CardBody>
                <KnowledgeEvolutionTimeline
                  events={mockEvolutionEvents}
                  onEventClick={(event) => console.log('点击事件:', event)}
                />
              </CardBody>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  // 加载状态
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 员工不存在
  if (!employee) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-gray-600 mb-4">未找到员工信息</p>
            <Button
              onClick={() => navigate('/digital-employees')}
              variant="secondary"
            >
              返回员工列表
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* 页面头部 - 自定义布局，不使用默认PageHeader */}
      <div className="flex items-center justify-between mb-8 p-6 bg-white border-b border-gray-200">
        {/* 左侧：返回按钮 + 员工信息 */}
        <div className="flex items-center gap-6">
          <Button
            onClick={() => navigate('/digital-employees')}
            variant="ghost"
            size="sm"
            className="flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* 员工头像和基本信息 */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xl font-medium shadow-lg">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-3" style={{fontWeight: 600, letterSpacing: '-0.02em'}}>
                {employee.name}
                {getStatusBadge(employee.status)}
              </h1>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600 flex items-center gap-2" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
                  <Brain className="h-4 w-4" />
                  {employee.department}
                </p>
                <p className="text-sm text-gray-500" style={{fontWeight: 400, letterSpacing: '-0.005em'}}>
                  创建于 {new Date(employee.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：操作按钮组 */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            导出配置
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEdit}
            disabled={isEditing}
          >
            {isEditing ? '编辑中' : '编辑'}
          </Button>
          {isEditing && (
            <>
              <Button
                variant="success"
                size="sm"
                onClick={handleSave}
              >
                保存
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                取消
              </Button>
            </>
          )}
        </div>
      </div>

      <PageContent>
        {/* 统计概览区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="会话统计"
            value={employee.metrics.totalSessions.toLocaleString()}
            icon={MessageSquare}
            trend="up"
            trendValue="+12%"
            color="primary"
          />
          <MetricCard
            title="消息处理"
            value={employee.metrics.totalMessages.toLocaleString()}
            icon={Activity}
            trend="up"
            trendValue="+8%"
            color="success"
          />
          <MetricCard
            title="满意度"
            value={(employee.metrics.satisfactionScore * 100).toFixed(1) + '%'}
            icon={TrendingUp}
            trend="up"
            trendValue="+5%"
            color="success"
          />
          <MetricCard
            title="运行时间"
            value={Math.floor((Date.now() - new Date(employee.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
            icon={Brain}
            color="neutral"
          />
        </div>

        {/* Tab导航 */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="hidden sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab内容 */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default DigitalEmployeeDetail;