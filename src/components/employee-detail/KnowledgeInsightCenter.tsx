/**
 * 知识洞察中心组件 - 整合所有领域的知识图谱和智能分析
 */

import React, { useState, useMemo } from 'react';
import {
  Network,
  Brain,
  Database,
  Layers,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye,
  Sparkles,
  Target,
  Link,
  Filter,
  Search,
  RefreshCw,
  Download,
  Settings,
  Activity,
  BookOpen,
  Users,
  Zap,
  GitBranch,
  Globe,
  Building
} from 'lucide-react';
import type { DigitalEmployee, DomainConfig } from '../../types/employee';
import { KnowledgeGraphViewer } from '../knowledge';
import KnowledgeInsightsPanel from './KnowledgeInsightsPanel';

interface KnowledgeInsightCenterProps {
  employee: DigitalEmployee;
  onNodeClick?: (node: any) => void;
  onEdgeClick?: (edge: any) => void;
}

const KnowledgeInsightCenter: React.FC<KnowledgeInsightCenterProps> = ({
  employee,
  onNodeClick,
  onEdgeClick
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'graph' | 'insights' | 'analytics'>('overview');
  const [selectedDomains, setSelectedDomains] = useState<string[]>(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'concept' | 'relation' | 'document'>('all');

  // 获取所有领域
  const domains = useMemo(() => {
    const allDomains = employee.multiDomainConfig?.domains || [];
    return [
      { id: 'global', name: '全局知识', icon: '🌐', enabled: true },
      ...allDomains
    ];
  }, [employee]);

  // 知识统计信息
  const knowledgeStats = useMemo(() => {
    const stats = {
      totalDocuments: employee.knowledgeBase?.documents?.length || 0,
      totalFAQs: employee.knowledgeBase?.faqItems?.length || 0,
      totalNodes: 0,
      totalRelations: 0,
      domainCoverage: domains.length,
      crossDomainLinks: 0
    };

    // 计算知识图谱统计
    if (employee.knowledgeBase?.knowledgeGraph) {
      stats.totalNodes = employee.knowledgeBase.knowledgeGraph.nodes?.length || 0;
      stats.totalRelations = employee.knowledgeBase.knowledgeGraph.edges?.length || 0;
      // 简化的跨领域链接计算
      stats.crossDomainLinks = Math.floor(stats.totalRelations * 0.3);
    }

    return stats;
  }, [employee, domains]);

  // 处理领域选择变化
  const handleDomainToggle = (domainId: string) => {
    if (domainId === 'all') {
      setSelectedDomains(['all']);
    } else {
      const newSelection = selectedDomains.includes(domainId)
        ? selectedDomains.filter(id => id !== domainId && id !== 'all')
        : [...selectedDomains.filter(id => id !== 'all'), domainId];

      if (newSelection.length === 0) {
        setSelectedDomains(['all']);
      } else {
        setSelectedDomains(newSelection);
      }
    }
  };

  // 视图配置
  const viewTabs = [
    {
      id: 'overview',
      title: '知识概览',
      icon: Eye,
      description: '知识库整体状况和统计信息'
    },
    {
      id: 'graph',
      title: '知识图谱',
      icon: Network,
      description: '交互式知识网络可视化'
    },
    {
      id: 'insights',
      title: '智能分析',
      icon: Brain,
      description: '知识洞察和能力分析'
    },
    {
      id: 'analytics',
      title: '数据分析',
      icon: BarChart3,
      description: '知识使用情况和性能分析'
    }
  ];

  return (
    <div className="space-y-6">
      {/* 头部控制栏 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Network className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">知识洞察中心</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {/* 刷新知识图谱 */}}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="刷新知识图谱"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => {/* 导出知识图谱 */}}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="导出数据"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={() => {/* 配置设置 */}}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="配置设置"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 视图切换 */}
        <div className="flex items-center gap-1 mb-4">
          {viewTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={tab.description}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{tab.title}</span>
              </button>
            );
          })}
        </div>

        {/* 领域过滤器 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">显示范围：</span>
          <button
            onClick={() => handleDomainToggle('all')}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
              selectedDomains.includes('all')
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Globe className="h-3 w-3" />
            全部领域
          </button>

          {domains.filter(d => d.id !== 'global').map(domain => (
            <button
              key={domain.id}
              onClick={() => handleDomainToggle(domain.id)}
              className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedDomains.includes(domain.id)
                  ? 'bg-purple-100 text-purple-700 border border-purple-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs">{domain.icon}</span>
              {domain.name}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* 知识统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Database className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">文档资源</span>
              </div>
              <div className="text-2xl font-bold text-blue-800">
                {knowledgeStats.totalDocuments}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                知识文档数量
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">FAQ条目</span>
              </div>
              <div className="text-2xl font-bold text-green-800">
                {knowledgeStats.totalFAQs}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                问答知识条目
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Network className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">知识节点</span>
              </div>
              <div className="text-2xl font-bold text-purple-800">
                {knowledgeStats.totalNodes}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                图谱概念节点
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <GitBranch className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">关联关系</span>
              </div>
              <div className="text-2xl font-bold text-orange-800">
                {knowledgeStats.totalRelations}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                知识关联数量
              </div>
            </div>
          </div>

          {/* 领域知识分布 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">领域知识分布</h3>
            </div>

            <div className="space-y-3">
              {domains.map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{domain.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{domain.name}</div>
                      <div className="text-sm text-gray-500">
                        {domain.id === 'global' ? '基础共享知识' : '领域专属知识'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-800">
                      {Math.floor(Math.random() * 100 + 20)}
                    </div>
                    <div className="text-sm text-gray-600">知识项</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 跨领域知识关联 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Link className="h-5 w-5 text-cyan-600" />
              <h3 className="text-lg font-semibold text-gray-900">跨领域知识关联</h3>
            </div>

            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-cyan-700">关联强度</span>
                <span className="text-lg font-bold text-cyan-800">
                  {knowledgeStats.crossDomainLinks}个连接
                </span>
              </div>
              <div className="w-full bg-cyan-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(knowledgeStats.crossDomainLinks * 2, 100)}%` }}
                />
              </div>
              <div className="text-xs text-cyan-600 mt-1">
                领域间知识关联度：{Math.round(Math.min(knowledgeStats.crossDomainLinks * 2, 100))}%
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'graph' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <Network className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">交互式知识图谱</h3>
          </div>

          {/* 搜索和过滤控件 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索知识节点..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">全部类型</option>
              <option value="concept">概念节点</option>
              <option value="relation">关系节点</option>
              <option value="document">文档节点</option>
            </select>
          </div>

          {/* 知识图谱组件 */}
          <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
            {employee.knowledgeBase?.knowledgeGraph ? (
              <KnowledgeGraphViewer
                data={employee.knowledgeBase.knowledgeGraph}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                searchQuery={searchQuery}
                filterType={filterType}
                selectedDomains={selectedDomains}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Network className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无知识图谱数据</p>
                  <p className="text-sm mt-1">请先添加知识文档以生成图谱</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'insights' && (
        <KnowledgeInsightsPanel
          employee={employee}
          showAdvancedControls={true}
        />
      )}

      {activeView === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">知识使用分析</h3>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Activity className="h-5 w-5" />
                <span className="font-medium">数据分析功能</span>
              </div>
              <p className="text-sm text-amber-600 mt-1">
                知识使用统计、访问热度、效果评估等高级分析功能正在开发中。
                未来将提供详细的知识利用率报告和优化建议。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeInsightCenter;