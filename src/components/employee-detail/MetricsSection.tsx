/**
 * 员工运行统计组件（增强版 - 支持数据修正和编辑）
 */

import React, { useState, useMemo } from 'react';
import { TrendingUp, Clock, Users, Star, Activity, Edit3, Save, X, AlertTriangle, History, CheckCircle, RotateCcw, BarChart3, PieChart } from 'lucide-react';
import { DataSourceIndicator } from '../common';
import EnhancedDataVisualization, { type EnhancedChartData } from '../knowledge/EnhancedDataVisualization';
import type { DigitalEmployee } from '../../types/employee';

// 编辑记录类型
interface EditRecord {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: string;
  operator: string;
}

// 可编辑字段类型
interface EditableMetrics {
  userSatisfactionScore?: number;
  avgResponseTime?: number;
  knowledgeUtilizationRate?: number;
}

interface MetricsSectionProps {
  employee: DigitalEmployee;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ employee }) => {
  const { metrics } = employee;

  // 编辑状态管理
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState<EditableMetrics>({
    userSatisfactionScore: metrics.userSatisfactionScore,
    avgResponseTime: metrics.avgResponseTime,
    knowledgeUtilizationRate: metrics.knowledgeUtilizationRate
  });
  const [editReason, setEditReason] = useState('');
  const [showEditHistory, setShowEditHistory] = useState(false);

  // 模拟编辑历史数据
  const [editHistory] = useState<EditRecord[]>([
    {
      id: '1',
      field: 'userSatisfactionScore',
      oldValue: 4.2,
      newValue: 4.8,
      reason: '数据收集异常，根据用户反馈调查结果修正',
      timestamp: '2024-01-14 09:12:08',
      operator: '数据管理员 (data@company.com)'
    },
    {
      id: '2',
      field: 'avgResponseTime',
      oldValue: 2.8,
      newValue: 2.1,
      reason: '服务器监控数据显示异常峰值，剔除异常数据点后重新计算',
      timestamp: '2024-01-10 14:25:33',
      operator: '系统管理员 (admin@company.com)'
    }
  ]);

  // 可编辑字段配置
  const editableFields = {
    userSatisfactionScore: {
      label: '用户满意度',
      min: 1,
      max: 5,
      step: 0.1,
      unit: '分',
      icon: Star,
      description: '可修正因数据收集异常导致的评分错误'
    },
    avgResponseTime: {
      label: '平均响应时间',
      min: 0.1,
      max: 10,
      step: 0.1,
      unit: '秒',
      icon: Clock,
      description: '可修正因监控异常导致的时间统计错误'
    },
    knowledgeUtilizationRate: {
      label: '知识利用率',
      min: 0,
      max: 1,
      step: 0.001,
      unit: '%',
      icon: Activity,
      description: '可修正因计算逻辑问题导致的利用率统计错误'
    }
  };

  // 计算成功率
  const successRate = metrics.totalSessions > 0
    ? ((metrics.successfulSessions / metrics.totalSessions) * 100).toFixed(1)
    : '0.0';

  // 格式化响应时间
  const formatResponseTime = (time: number) => {
    if (time < 1) return `${(time * 1000).toFixed(0)}ms`;
    return `${time.toFixed(1)}s`;
  };

  // 获取工具使用排名
  const toolUsageRanking = Object.entries(metrics.toolUsageStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // 编辑功能处理函数
  const handleEditStart = () => {
    setIsEditing(true);
    setEditedMetrics({
      userSatisfactionScore: metrics.userSatisfactionScore,
      avgResponseTime: metrics.avgResponseTime,
      knowledgeUtilizationRate: metrics.knowledgeUtilizationRate
    });
    setEditReason('');
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditedMetrics({
      userSatisfactionScore: metrics.userSatisfactionScore,
      avgResponseTime: metrics.avgResponseTime,
      knowledgeUtilizationRate: metrics.knowledgeUtilizationRate
    });
    setEditReason('');
  };

  const handleEditSave = () => {
    if (!editReason.trim()) {
      alert('请填写修正原因');
      return;
    }

    // 这里应该调用API保存修改
    console.log('保存指标修改:', {
      metrics: editedMetrics,
      reason: editReason,
      operator: '当前用户', // 应该从用户上下文获取
      timestamp: new Date().toISOString()
    });

    // 模拟保存成功
    setIsEditing(false);
    setEditReason('');
    alert('数据修正已保存并记录到审计日志');
  };

  const handleMetricChange = (field: keyof EditableMetrics, value: number) => {
    setEditedMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleResetToOriginal = (field: keyof EditableMetrics) => {
    const originalValue = metrics[field];
    if (originalValue !== undefined) {
      setEditedMetrics(prev => ({
        ...prev,
        [field]: originalValue
      }));
    }
  };

  // 检查数据是否被修改过
  const hasBeenModified = (field: keyof EditableMetrics) => {
    return editHistory.some(record => record.field === field);
  };

  // 获取最新的编辑记录
  const getLastEditRecord = (field: keyof EditableMetrics) => {
    return editHistory
      .filter(record => record.field === field)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  // 生成时间序列数据用于可视化
  const generateMetricsVisualizationData = useMemo(() => {
    // 模拟30天的历史数据
    const days = 30;
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);

    // 用户满意度趋势数据
    const satisfactionTrendData: EnhancedChartData = {
      timeSeries: Array.from({ length: days }, (_, i) => {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        // 生成带有轻微波动的趋势数据
        const baseValue = metrics.userSatisfactionScore || 4.5;
        const variation = Math.sin((i / days) * Math.PI * 2) * 0.3 + (Math.random() - 0.5) * 0.2;
        return {
          date,
          value: Math.max(1, Math.min(5, baseValue + variation)),
          metadata: { type: 'satisfaction' }
        };
      }),
      categories: [
        {
          name: '非常满意',
          value: Math.round((metrics.successfulSessions || 0) * 0.6),
          color: '#10b981',
          trend: 'up'
        },
        {
          name: '满意',
          value: Math.round((metrics.successfulSessions || 0) * 0.3),
          color: '#f59e0b',
          trend: 'stable'
        },
        {
          name: '不满意',
          value: Math.round((metrics.totalSessions - (metrics.successfulSessions || 0)) * 0.1),
          color: '#ef4444',
          trend: 'down'
        }
      ],
      metrics: {
        total: metrics.totalSessions || 0,
        average: metrics.userSatisfactionScore || 4.5,
        growth: 8.5,
        trend: 'up'
      }
    };

    // 响应时间趋势数据
    const responseTimeTrendData: EnhancedChartData = {
      timeSeries: Array.from({ length: days }, (_, i) => {
        const date = new Date(baseDate);
        date.setDate(date.getDate() + i);
        const baseTime = metrics.avgResponseTime || 1.2;
        const variation = Math.cos((i / days) * Math.PI * 3) * 0.2 + (Math.random() - 0.5) * 0.1;
        return {
          date,
          value: Math.max(0.1, baseTime + variation),
          metadata: { type: 'response_time' }
        };
      }),
      categories: [
        {
          name: '快速响应 (<1s)',
          value: Math.round((metrics.totalSessions || 0) * 0.7),
          color: '#10b981',
          trend: 'up'
        },
        {
          name: '正常响应 (1-3s)',
          value: Math.round((metrics.totalSessions || 0) * 0.25),
          color: '#f59e0b',
          trend: 'stable'
        },
        {
          name: '慢响应 (>3s)',
          value: Math.round((metrics.totalSessions || 0) * 0.05),
          color: '#ef4444',
          trend: 'down'
        }
      ],
      metrics: {
        total: metrics.totalSessions || 0,
        average: metrics.avgResponseTime || 1.2,
        growth: -12.3,
        trend: 'down'
      }
    };

    // 工具使用分布数据
    const toolUsageDistributionData: EnhancedChartData = {
      timeSeries: Object.entries(metrics.toolUsageStats || {}).map(([tool, usage], index) => ({
        date: new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000),
        value: usage,
        category: tool,
        metadata: { tool, usage }
      })),
      categories: Object.entries(metrics.toolUsageStats || {}).map(([tool, usage]) => ({
        name: tool,
        value: usage,
        color: `hsl(${Math.abs(tool.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, 60%)`,
        trend: 'stable'
      })),
      metrics: {
        total: Object.values(metrics.toolUsageStats || {}).reduce((sum, count) => sum + count, 0),
        average: Object.values(metrics.toolUsageStats || {}).reduce((sum, count) => sum + count, 0) /
                 Math.max(1, Object.keys(metrics.toolUsageStats || {}).length),
        growth: 15.7,
        trend: 'up'
      }
    };

    return {
      satisfaction: satisfactionTrendData,
      responseTime: responseTimeTrendData,
      toolUsage: toolUsageDistributionData
    };
  }, [metrics]);

  // 可视化选项状态
  const [activeVisualization, setActiveVisualization] = useState<'satisfaction' | 'responseTime' | 'toolUsage' | null>(null);

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      {/* 标题区域 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">运行统计</h3>
          <DataSourceIndicator
            type="operational"
            size="sm"
            variant="badge"
            showTimestamp={false}
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditHistory(!showEditHistory)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <History className="h-4 w-4" />
            编辑历史
            {editHistory.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                {editHistory.length}
              </span>
            )}
          </button>
          {!isEditing ? (
            <button
              onClick={handleEditStart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              数据修正
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                <Save className="h-4 w-4" />
                保存
              </button>
              <button
                onClick={handleEditCancel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4" />
                取消
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">总会话数</p>
              <p className="text-2xl font-bold text-blue-900">{metrics.totalSessions.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-blue-600 mt-1">累计服务次数</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">成功率</p>
              <p className="text-2xl font-bold text-green-900">{successRate}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-green-600 mt-1">问题解决成功率</p>
        </div>

        <div className={`bg-purple-50 p-4 rounded-lg relative ${isEditing ? 'ring-2 ring-purple-300' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-purple-600 font-medium">平均响应</p>
                {hasBeenModified('avgResponseTime') && (
                  <div className="group relative">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      数据已修正
                    </div>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="mt-2">
                  <input
                    type="number"
                    value={editedMetrics.avgResponseTime || 0}
                    onChange={(e) => handleMetricChange('avgResponseTime', parseFloat(e.target.value) || 0)}
                    min={editableFields.avgResponseTime.min}
                    max={editableFields.avgResponseTime.max}
                    step={editableFields.avgResponseTime.step}
                    className="w-full text-lg font-bold text-purple-900 bg-white border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => handleResetToOriginal('avgResponseTime')}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      title="恢复原始值"
                    >
                      <RotateCcw className="h-3 w-3" />
                      重置
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-purple-900">
                  {formatResponseTime(editedMetrics.avgResponseTime || metrics.avgResponseTime)}
                </p>
              )}
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-purple-600">响应速度</p>
            {hasBeenModified('avgResponseTime') && (
              <DataSourceIndicator
                type="user-input"
                size="sm"
                variant="inline"
                showIcon={false}
                lastUpdated={getLastEditRecord('avgResponseTime')?.timestamp}
              />
            )}
          </div>
        </div>

        <div className={`bg-yellow-50 p-4 rounded-lg relative ${isEditing ? 'ring-2 ring-yellow-300' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm text-yellow-600 font-medium">知识利用率</p>
                {hasBeenModified('knowledgeUtilizationRate') && (
                  <div className="group relative">
                    <AlertTriangle className="h-3 w-3 text-orange-500" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      数据已修正
                    </div>
                  </div>
                )}
              </div>
              {isEditing ? (
                <div className="mt-2">
                  <input
                    type="number"
                    value={((editedMetrics.knowledgeUtilizationRate || 0) * 100).toFixed(1)}
                    onChange={(e) => handleMetricChange('knowledgeUtilizationRate', parseFloat(e.target.value) / 100 || 0)}
                    min={editableFields.knowledgeUtilizationRate.min * 100}
                    max={editableFields.knowledgeUtilizationRate.max * 100}
                    step={0.1}
                    className="w-full text-lg font-bold text-yellow-900 bg-white border border-yellow-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      onClick={() => handleResetToOriginal('knowledgeUtilizationRate')}
                      className="text-xs text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                      title="恢复原始值"
                    >
                      <RotateCcw className="h-3 w-3" />
                      重置
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-2xl font-bold text-yellow-900">
                  {((editedMetrics.knowledgeUtilizationRate || metrics.knowledgeUtilizationRate) * 100).toFixed(1)}%
                </p>
              )}
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-yellow-600">知识库使用效率</p>
            {hasBeenModified('knowledgeUtilizationRate') && (
              <DataSourceIndicator
                type="user-input"
                size="sm"
                variant="inline"
                showIcon={false}
                lastUpdated={getLastEditRecord('knowledgeUtilizationRate')?.timestamp}
              />
            )}
          </div>
        </div>
      </div>

      {/* 增强数据可视化区域 */}
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            数据趋势分析
          </h4>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveVisualization(activeVisualization === 'satisfaction' ? null : 'satisfaction')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeVisualization === 'satisfaction'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              满意度趋势
            </button>
            <button
              onClick={() => setActiveVisualization(activeVisualization === 'responseTime' ? null : 'responseTime')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeVisualization === 'responseTime'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              响应时间
            </button>
            <button
              onClick={() => setActiveVisualization(activeVisualization === 'toolUsage' ? null : 'toolUsage')}
              className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                activeVisualization === 'toolUsage'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              工具使用
            </button>
          </div>
        </div>

        {/* 可视化图表渲染区域 */}
        {activeVisualization && (
          <div className="animate-in fade-in duration-300">
            {activeVisualization === 'satisfaction' && (
              <EnhancedDataVisualization
                data={generateMetricsVisualizationData.satisfaction}
                title="用户满意度趋势分析"
                type="timeline"
                height={250}
                showInteractive={true}
                onDataPointClick={(point) => {
                  console.log('Satisfaction data point clicked:', point);
                  // 可以在这里添加详细信息显示逻辑
                }}
              />
            )}
            {activeVisualization === 'responseTime' && (
              <EnhancedDataVisualization
                data={generateMetricsVisualizationData.responseTime}
                title="响应时间趋势分析"
                type="timeline"
                height={250}
                showInteractive={true}
                onDataPointClick={(point) => {
                  console.log('Response time data point clicked:', point);
                }}
              />
            )}
            {activeVisualization === 'toolUsage' && (
              <EnhancedDataVisualization
                data={generateMetricsVisualizationData.toolUsage}
                title="工具使用分布分析"
                type="distribution"
                height={300}
                showInteractive={true}
                onDataPointClick={(point) => {
                  console.log('Tool usage data point clicked:', point);
                }}
              />
            )}
          </div>
        )}

        {/* 快速洞察总结 */}
        {!activeVisualization && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">满意度趋势</span>
              </div>
              <div className="text-2xl font-bold text-blue-900 mb-1">
                {generateMetricsVisualizationData.satisfaction.metrics.growth > 0 ? '↗️' : '↘️'}
                {Math.abs(generateMetricsVisualizationData.satisfaction.metrics.growth).toFixed(1)}%
              </div>
              <div className="text-xs text-blue-700">相比上月增长</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">响应效率</span>
              </div>
              <div className="text-2xl font-bold text-purple-900 mb-1">
                {generateMetricsVisualizationData.responseTime.metrics.growth < 0 ? '⚡' : '🐌'}
                {Math.abs(generateMetricsVisualizationData.responseTime.metrics.growth).toFixed(1)}%
              </div>
              <div className="text-xs text-purple-700">响应时间优化</div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">工具活跃度</span>
              </div>
              <div className="text-2xl font-bold text-green-900 mb-1">
                📈 {generateMetricsVisualizationData.toolUsage.metrics.growth.toFixed(1)}%
              </div>
              <div className="text-xs text-green-700">工具使用增长</div>
            </div>
          </div>
        )}
      </div>

      {/* 用户满意度 */}
      {metrics.userSatisfactionScore && (
        <div className={`mb-6 p-4 bg-gray-50 rounded-lg ${isEditing ? 'ring-2 ring-blue-300' : ''}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-gray-900">用户满意度</h4>
              {hasBeenModified('userSatisfactionScore') && (
                <div className="group relative">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    数据已修正
                  </div>
                </div>
              )}
            </div>
            {hasBeenModified('userSatisfactionScore') && (
              <DataSourceIndicator
                type="user-input"
                size="sm"
                variant="badge"
                lastUpdated={getLastEditRecord('userSatisfactionScore')?.timestamp}
              />
            )}
          </div>

          {isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        star <= (editedMetrics.userSatisfactionScore || 0)
                          ? 'text-yellow-400 fill-current hover:text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                      onClick={() => handleMetricChange('userSatisfactionScore', star)}
                    />
                  ))}
                </div>
                <input
                  type="number"
                  value={editedMetrics.userSatisfactionScore?.toFixed(1) || '0.0'}
                  onChange={(e) => handleMetricChange('userSatisfactionScore', parseFloat(e.target.value) || 0)}
                  min={editableFields.userSatisfactionScore.min}
                  max={editableFields.userSatisfactionScore.max}
                  step={editableFields.userSatisfactionScore.step}
                  className="w-20 text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500">/ 5.0</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleResetToOriginal('userSatisfactionScore')}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="恢复原始值"
                >
                  <RotateCcw className="h-4 w-4" />
                  重置为原始值
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (editedMetrics.userSatisfactionScore || metrics.userSatisfactionScore)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {(editedMetrics.userSatisfactionScore || metrics.userSatisfactionScore).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500">/ 5.0</span>
            </div>
          )}
        </div>
      )}

      {/* 工具使用统计 */}
      {toolUsageRanking.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">工具使用排行</h4>
          <div className="space-y-2">
            {toolUsageRanking.map(([tool, count], index) => {
              const maxUsage = Math.max(...Object.values(metrics.toolUsageStats));
              const percentage = (count / maxUsage) * 100;

              return (
                <div key={tool} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 w-4">#{index + 1}</span>
                  <span className="text-sm text-gray-900 flex-1">{tool}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 性能趋势 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">性能概览</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">成功会话：</span>
            <span className="font-medium text-gray-900 ml-1">
              {metrics.successfulSessions.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">失败会话：</span>
            <span className="font-medium text-gray-900 ml-1">
              {(metrics.totalSessions - metrics.successfulSessions).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">工具调用：</span>
            <span className="font-medium text-gray-900 ml-1">
              {Object.values(metrics.toolUsageStats).reduce((sum, count) => sum + count, 0).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">活跃工具：</span>
            <span className="font-medium text-gray-900 ml-1">
              {Object.keys(metrics.toolUsageStats).length}
            </span>
          </div>
        </div>
      </div>

      {/* 编辑面板 */}
      {isEditing && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Edit3 className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-medium text-blue-900">数据修正面板</h4>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                修正原因 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="请详细说明数据修正的原因，如：数据收集异常、系统故障导致的统计错误等..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                修正后的数据将记录到审计日志
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                原始数据将被保留以供追溯
              </div>
              <div className="flex items-center gap-1">
                <History className="h-3 w-3 text-blue-500" />
                支持版本回滚和数据恢复
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 编辑历史面板 */}
      {showEditHistory && editHistory.length > 0 && (
        <div className="mt-6 border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-gray-600" />
              <h4 className="text-sm font-medium text-gray-900">编辑历史记录</h4>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {editHistory.length} 条记录
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {editHistory.map((record) => {
              const fieldConfig = editableFields[record.field as keyof EditableMetrics];
              const Icon = fieldConfig?.icon || Activity;

              return (
                <div key={record.id} className="p-3 border border-gray-200 rounded-lg bg-white">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-blue-50 rounded">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium text-gray-900">
                          {fieldConfig?.label || record.field}
                        </h5>
                        <DataSourceIndicator
                          type="user-input"
                          size="sm"
                          variant="badge"
                          showTimestamp={false}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <span>从</span>
                        <span className="font-mono bg-red-50 text-red-700 px-2 py-1 rounded">
                          {record.field === 'userSatisfactionScore' || record.field === 'avgResponseTime'
                            ? record.oldValue.toFixed(1)
                            : (record.oldValue * 100).toFixed(1) + '%'}
                        </span>
                        <span>修正为</span>
                        <span className="font-mono bg-green-50 text-green-700 px-2 py-1 rounded">
                          {record.field === 'userSatisfactionScore' || record.field === 'avgResponseTime'
                            ? record.newValue.toFixed(1)
                            : (record.newValue * 100).toFixed(1) + '%'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{record.reason}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{record.operator}</span>
                        <span>{record.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsSection;