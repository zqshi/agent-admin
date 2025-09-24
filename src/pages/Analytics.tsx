import { useState, useEffect, useMemo } from 'react';
import {
  Download,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Zap,
  Clock,
  RefreshCw,
  Target,
  BarChart3,
  Activity,
  Brain,
  Database,
  Settings
} from 'lucide-react';
import { PageLayout, PageHeader, PageContent, MetricCard, Card, CardHeader, CardBody, Button, FilterSection } from '../components/ui';
import { ALL_METRICS, getMetricsByLevel, getMetricStatus, METRIC_STATUS_COLORS, METRIC_STATUS_LABELS, METRIC_CATEGORIES, L4_OPERATIONS_SECURITY_METRICS, type MetricValue, type MetricDefinition } from '../types/metrics-definitions';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDimension, setSelectedDimension] = useState('model');
  const [selectedMetric, setSelectedMetric] = useState('tokens');
  const [selectedMetricLevel, setSelectedMetricLevel] = useState<'L1' | 'L2' | 'L3' | 'L4' | 'all'>('all');
  const [metricsData, setMetricsData] = useState<Record<string, MetricValue>>({});
  const [loading, setLoading] = useState(false);

  // 获取筛选后的指标
  const filteredMetrics = useMemo(() => {
    if (selectedMetricLevel === 'all') {
      return ALL_METRICS;
    }
    return getMetricsByLevel(selectedMetricLevel as 'L1' | 'L2' | 'L3' | 'L4');
  }, [selectedMetricLevel]);

  // 模拟指标数据
  useEffect(() => {
    const mockMetricsData: Record<string, MetricValue> = {
      'analysis_insight_accuracy': {
        metricId: 'analysis_insight_accuracy',
        value: 87.5,
        timestamp: new Date(),
        trend: 'up',
        changePercent: 5.2,
        status: 'good'
      },
      'llm_call_success_rate': {
        metricId: 'llm_call_success_rate',
        value: 98.7,
        timestamp: new Date(),
        trend: 'stable',
        changePercent: 0.3,
        status: 'excellent'
      },
      'token_cost_efficiency': {
        metricId: 'token_cost_efficiency',
        value: 0.25,
        timestamp: new Date(),
        trend: 'down',
        changePercent: -12.5,
        status: 'good'
      },
      'tool_call_success_rate': {
        metricId: 'tool_call_success_rate',
        value: 94.3,
        timestamp: new Date(),
        trend: 'down',
        changePercent: -2.1,
        status: 'needs-improvement'
      },
      'avg_conversation_rounds': {
        metricId: 'avg_conversation_rounds',
        value: 4.2,
        timestamp: new Date(),
        trend: 'down',
        changePercent: -8.5,
        status: 'good'
      },
      'avg_token_consumption': {
        metricId: 'avg_token_consumption',
        value: 2850,
        timestamp: new Date(),
        trend: 'up',
        changePercent: 12.3,
        status: 'needs-improvement'
      },
      'session_completion_rate': {
        metricId: 'session_completion_rate',
        value: 78.9,
        timestamp: new Date(),
        trend: 'up',
        changePercent: 8.5,
        status: 'good'
      },
      'data_quality_index': {
        metricId: 'data_quality_index',
        value: 92.1,
        timestamp: new Date(),
        trend: 'stable',
        changePercent: 1.2,
        status: 'excellent'
      }
    };
    setMetricsData(mockMetricsData);
  }, [selectedTimeRange]);

  // 模拟图表数据
  const tokenCostData = [
    { model: 'GPT-4', cost: 23456, percentage: 51.3, change: '+12%' },
    { model: 'Claude-3', cost: 18234, percentage: 39.8, change: '+8%' },
    { model: 'GPT-3.5', cost: 5432, percentage: 11.9, change: '-3%' }
  ];

  const toolCallData = [
    { tool: 'query_sales_data', calls: 1234, failures: 12, failureRate: 0.97, avgTime: 0.8 },
    { tool: 'send_email', calls: 856, failures: 45, failureRate: 5.26, avgTime: 3.2 },
    { tool: 'generate_report', calls: 654, failures: 8, failureRate: 1.22, avgTime: 1.5 },
    { tool: 'query_user_info', calls: 432, failures: 3, failureRate: 0.69, avgTime: 0.4 },
    { tool: 'create_ticket', calls: 321, failures: 18, failureRate: 5.61, avgTime: 2.1 }
  ];

  const errorAnalysisData = [
    { type: '工具超时', count: 89, percentage: 36.3, trend: 'up' },
    { type: 'LLM生成内容不合规', count: 76, percentage: 31.0, trend: 'down' },
    { type: '参数错误', count: 45, percentage: 18.4, trend: 'neutral' },
    { type: '网络连接失败', count: 23, percentage: 9.4, trend: 'down' },
    { type: '权限不足', count: 12, percentage: 4.9, trend: 'neutral' }
  ];

  const timeRangeOptions = [
    { value: '1d', label: '近 1 天' },
    { value: '7d', label: '近 7 天' },
    { value: '30d', label: '近 30 天' },
    { value: '90d', label: '近 90 天' }
  ];

  const dimensionOptions = [
    { value: 'model', label: '模型' },
    { value: 'service', label: '服务' },
    { value: 'user', label: '用户' },
    { value: 'time', label: '时间' }
  ];

  const metricOptions = [
    { value: 'tokens', label: 'Token消耗' },
    { value: 'cost', label: '成本' },
    { value: 'sessions', label: '会话数' },
    { value: 'success_rate', label: '成功率' }
  ];

  const metricLevelOptions = [
    { value: 'all', label: '全部指标' },
    { value: 'L1', label: 'L1 核心业务指标 - "The What"' },
    { value: 'L2', label: 'L2 对话体验指标 - "The How"' },
    { value: 'L3', label: 'L3 成本性能指标 - "The Cost"' },
    { value: 'L4', label: 'L4 运维安全指标 - "The Reliability"' }
  ];

  // 获取指标级别图标
  const getLevelIcon = (level: 'L1' | 'L2' | 'L3' | 'L4') => {
    switch (level) {
      case 'L1': return <Target className="h-4 w-4" />;
      case 'L2': return <BarChart3 className="h-4 w-4" />;
      case 'L3': return <Activity className="h-4 w-4" />;
      case 'L4': return <Settings className="h-4 w-4" />;
    }
  };

  // 获取分类图标
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, any> = {
      // 新的四层指标分类
      'core_business': <Target className="h-5 w-5" />,
      'conversation_efficiency': <BarChart3 className="h-5 w-5" />,
      'cost_efficiency': <DollarSign className="h-5 w-5" />,
      'system_performance': <Activity className="h-5 w-5" />,
      'system_reliability': <Settings className="h-5 w-5" />,
      'security_compliance': <AlertTriangle className="h-5 w-5" />,
      // 保留原有分类
      'business_insight': <Brain className="h-5 w-5" />,
      'business_impact': <Target className="h-5 w-5" />,
      'risk_management': <AlertTriangle className="h-5 w-5" />,
      'data_foundation': <Database className="h-5 w-5" />,
      'llm_performance': <Brain className="h-5 w-5" />,
      'mcp_performance': <Zap className="h-5 w-5" />
    };
    return iconMap[category] || <Settings className="h-5 w-5" />;
  };

  // 渲染指标卡片
  const renderMetricCard = (metric: MetricDefinition) => {
    const value = metricsData[metric.id];
    if (!value) return null;

    const status = getMetricStatus(metric, value.value);
    const statusColor = METRIC_STATUS_COLORS[status];
    const statusLabel = METRIC_STATUS_LABELS[status];

    return (
      <Card key={metric.id}>
        <CardBody>
          <div className="space-y-3">
            {/* 指标标题和级别 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getLevelIcon(metric.level)}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  metric.level === 'L1' ? 'bg-red-100 text-red-700' :
                  metric.level === 'L2' ? 'bg-blue-100 text-blue-700' :
                  metric.level === 'L3' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {metric.level}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {getCategoryIcon(metric.category)}
                <span className="text-xs text-gray-500">
                  {METRIC_CATEGORIES[metric.category]}
                </span>
              </div>
            </div>
            
            {/* 指标名称 */}
            <div>
              <h4 className="font-medium text-gray-900">{metric.name}</h4>
              <p className="text-sm text-gray-500 mt-1">{metric.description}</p>
            </div>
            
            {/* 指标值和状态 */}
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {value.value.toLocaleString()}
                  <span className="text-sm font-normal text-gray-500 ml-1">
                    {metric.unit}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-sm ${
                    value.trend === 'up' ? 'text-green-600' :
                    value.trend === 'down' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {value.trend === 'up' ? '↗' : value.trend === 'down' ? '↘' : '→'}
                    {Math.abs(value.changePercent).toFixed(1)}%
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <PageLayout>
      <PageHeader 
        title="数据分析" 
        subtitle="多维度分析数字员工的运行数据和性能指标"
      >
        <div className="flex gap-2">
          <Button variant="ghost">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4" />
            导出
          </Button>
        </div>
      </PageHeader>

      <PageContent>

        {/* 筛选条和操作栏 */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* 筛选器组 */}
              <FilterSection
                searchProps={{
                  value: '',
                  onChange: () => {},
                  placeholder: "搜索指标..."
                }}
                filters={[
                  {
                    key: 'metricLevel',
                    placeholder: '选择指标级别',
                    value: selectedMetricLevel,
                    onChange: setSelectedMetricLevel,
                    showIcon: true,
                    options: metricLevelOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label
                    })),
                    className: 'min-w-[150px]'
                  },
                  {
                    key: 'timeRange',
                    placeholder: '选择时间范围',
                    value: selectedTimeRange,
                    onChange: setSelectedTimeRange,
                    showIcon: true,
                    options: timeRangeOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label
                    })),
                    className: 'min-w-[120px]'
                  },
                  {
                    key: 'dimension', 
                    placeholder: '选择分析维度',
                    value: selectedDimension,
                    onChange: setSelectedDimension,
                    showIcon: true,
                    options: dimensionOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label
                    })),
                    className: 'min-w-[100px]'
                  },
                  {
                    key: 'metric',
                    placeholder: '选择指标',
                    value: selectedMetric,
                    onChange: setSelectedMetric,
                    showIcon: true,
                    options: metricOptions.map(opt => ({
                      value: opt.value,
                      label: opt.label
                    })),
                    className: 'min-w-[120px]'
                  }
                ]}
                layout="horizontal"
                showCard={false}
                className="flex-1"
              />
              
            </div>
          </CardBody>
        </Card>

        {/* 指标级别筛选 */}
        <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: '全部指标' },
            { value: 'L1', label: 'L1 核心业务' },
            { value: 'L2', label: 'L2 对话体验' },
            { value: 'L3', label: 'L3 成本性能' },
            { value: 'L4', label: 'L4 运维安全' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setSelectedMetricLevel(item.value as 'L1' | 'L2' | 'L3' | 'L4' | 'all')}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${selectedMetricLevel === item.value ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* 标准化指标概览 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMetrics.map(renderMetricCard)}
        </div>

        {/* Token成本分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="card-title text-blue-900">Token成本分析</h3>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {tokenCostData.map((item, index) => {
                  const gradients = [
                    'from-purple-100 to-purple-200 border-purple-300',
                    'from-green-100 to-green-200 border-green-300', 
                    'from-orange-100 to-orange-200 border-orange-300'
                  ];
                  const barColors = [
                    'bg-gradient-to-r from-purple-500 to-purple-600',
                    'bg-gradient-to-r from-green-500 to-green-600',
                    'bg-gradient-to-r from-orange-500 to-orange-600'
                  ];
                  
                  return (
                    <div key={item.model} className={`p-4 rounded-lg border bg-gradient-to-br ${gradients[index]} hover:shadow-md transition-all duration-300 cursor-pointer`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <Brain className="h-4 w-4 text-gray-700 mr-2" />
                          <span className="font-semibold text-gray-900">{item.model}</span>
                          <span className={`ml-3 text-xs px-2 py-1 rounded-full font-medium ${
                            item.change.startsWith('+') ? 'bg-red-100 text-red-700' :
                            item.change.startsWith('-') ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.change}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">${item.cost.toLocaleString()}</div>
                          <div className="text-sm font-medium text-gray-700">{item.percentage}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/70 rounded-full h-3 backdrop-blur-sm">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${barColors[index]}`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600">
                        每Token成本: $0.{Math.random() > 0.5 ? '02' : '03'} • 效率评级: {item.percentage > 40 ? '高' : '中'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* 每日趋势图 */}
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="card-title text-green-900">趋势分析</h3>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-64 relative">
                {/* 模拟趋势图表 */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {/* Y轴标签 */}
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>Token消耗 (千次)</span>
                    <span>成本趋势</span>
                  </div>
                  
                  {/* 图表区域 */}
                  <div className="flex-1 flex items-end justify-between bg-white/50 rounded-lg p-4 backdrop-blur-sm">
                    {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map((day, index) => {
                      const height = Math.random() * 80 + 20; // 20-100% height
                      const cost = (Math.random() * 500 + 200).toFixed(0);
                      
                      return (
                        <div key={day} className="flex flex-col items-center space-y-2 group cursor-pointer">
                          {/* 数据点 */}
                          <div className="relative">
                            <div 
                              className="w-8 bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300 group-hover:from-green-600 group-hover:to-green-500 group-hover:scale-110"
                              style={{ height: `${height}px` }}
                            ></div>
                            {/* 悬停显示具体数值 */}
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                              ${cost}
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-medium">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 统计摘要 */}
                  <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/70 p-2 rounded">
                      <div className="text-lg font-bold text-green-700">+12.5%</div>
                      <div className="text-xs text-gray-600">周环比增长</div>
                    </div>
                    <div className="bg-white/70 p-2 rounded">
                      <div className="text-lg font-bold text-blue-700">$2,847</div>
                      <div className="text-xs text-gray-600">本周总成本</div>
                    </div>
                    <div className="bg-white/70 p-2 rounded">
                      <div className="text-lg font-bold text-purple-700">95.3%</div>
                      <div className="text-xs text-gray-600">成功率</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 工具调用分析 */}
        <Card className="">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="card-title text-purple-900">工具调用分析</h3>
              <Zap className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {toolCallData.map((tool, index) => {
                const successRate = 100 - tool.failureRate;
                const gradientColors = [
                  'from-blue-100 to-blue-200 border-blue-300',
                  'from-green-100 to-green-200 border-green-300',
                  'from-orange-100 to-orange-200 border-orange-300',
                  'from-purple-100 to-purple-200 border-purple-300',
                  'from-pink-100 to-pink-200 border-pink-300'
                ];
                
                return (
                  <div key={tool.tool} className={`bg-gradient-to-r ${gradientColors[index]} p-4 rounded-lg border hover:shadow-lg transition-all duration-300 cursor-pointer`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Zap className="h-5 w-5 text-gray-700 mr-3" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{tool.tool}</h4>
                          <p className="text-xs text-gray-600 mt-1">MCP工具调用</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">{tool.calls.toLocaleString()}</div>
                            <div className="text-xs text-gray-600">总调用</div>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 text-gray-600 mr-1" />
                              <span className="font-semibold text-gray-900">{tool.avgTime}s</span>
                            </div>
                            <div className="text-xs text-gray-600">平均时间</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {/* 成功率 */}
                      <div className="bg-white/70 p-3 rounded backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">成功率</span>
                          <span className="text-sm font-bold text-green-700">{successRate.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${successRate}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* 失败统计 */}
                      <div className="bg-white/70 p-3 rounded backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-red-600">{tool.failures}</div>
                          <div className="text-xs text-gray-600">失败次数</div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            tool.failureRate > 5 ? 'bg-red-100 text-red-700' :
                            tool.failureRate > 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {tool.failureRate.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                      
                      {/* 性能评级 */}
                      <div className="bg-white/70 p-3 rounded backdrop-blur-sm">
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">
                            {tool.avgTime < 1 ? 'A' : tool.avgTime < 2 ? 'B' : tool.avgTime < 4 ? 'C' : 'D'}
                          </div>
                          <div className="text-xs text-gray-600">性能等级</div>
                          <div className="text-xs text-blue-600 mt-1">
                            {tool.avgTime < 1 ? '优秀' : tool.avgTime < 2 ? '良好' : tool.avgTime < 4 ? '一般' : '需优化'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        {/* 问题分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 错误类型分布 */}
          <Card className="">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="card-title text-red-900">错误类型分布</h3>
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {errorAnalysisData.map((error, index) => {
                  const bgColors = [
                    'from-red-100 to-red-200 border-red-300',
                    'from-orange-100 to-orange-200 border-orange-300',
                    'from-yellow-100 to-yellow-200 border-yellow-300',
                    'from-blue-100 to-blue-200 border-blue-300',
                    'from-purple-100 to-purple-200 border-purple-300'
                  ];
                  
                  return (
                    <div key={error.type} className={`bg-gradient-to-r ${bgColors[index]} p-4 rounded-lg border hover:shadow-md transition-all duration-300`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-gray-700 mr-2" />
                          <span className="font-semibold text-gray-900">{error.type}</span>
                          <div className={`ml-3 flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            error.trend === 'up' ? 'bg-red-100 text-red-700' :
                            error.trend === 'down' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {error.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
                             error.trend === 'down' ? <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" /> : null}
                            {error.trend === 'up' ? '上升' : error.trend === 'down' ? '下降' : '稳定'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-lg">{error.count}</div>
                          <div className="text-sm font-medium text-gray-700">{error.percentage}%</div>
                        </div>
                      </div>
                      <div className="w-full bg-white/70 rounded-full h-3 backdrop-blur-sm">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            error.trend === 'up' ? 'bg-gradient-to-r from-red-400 to-red-500' :
                            error.trend === 'down' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                            'bg-gradient-to-r from-gray-400 to-gray-500'
                          }`}
                          style={{ width: `${error.percentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>影响程度: {error.percentage > 30 ? '高' : error.percentage > 15 ? '中' : '低'}</span>
                        <span>优先级: {error.trend === 'up' ? '紧急' : error.percentage > 20 ? '高' : '中'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>

          {/* 关键指标卡片 */}
          <div className="space-y-4">
            <Card className=" hover:shadow-md transition-shadow duration-200">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-700 mb-1">总错误数</p>
                    <p className="text-3xl font-bold text-red-800 mb-2">245</p>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1 transform rotate-180" />
                      <p className="text-sm text-green-700 font-medium">较上周 -12%</p>
                    </div>
                    <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <AlertTriangle className="h-12 w-12 text-red-500" />
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className=" hover:shadow-md transition-shadow duration-200">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-orange-700 mb-1">最常见错误</p>
                    <p className="text-lg font-bold text-orange-900 mb-1">工具超时</p>
                    <p className="text-sm text-orange-700 mb-2">36.3% 的错误</p>
                    <div className="bg-orange-200 px-2 py-1 rounded-full inline-block">
                      <span className="text-xs font-medium text-orange-800">需要优化</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Clock className="h-12 w-12 text-orange-500" />
                  </div>
                </div>
              </CardBody>
            </Card>
            
            <Card className=" hover:shadow-md transition-shadow duration-200">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-700 mb-1">平均修复时间</p>
                    <p className="text-3xl font-bold text-blue-800 mb-2">4.2分钟</p>
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1 transform rotate-180" />
                      <p className="text-sm text-green-700 font-medium">较上周 -8%</p>
                    </div>
                    <div className="bg-blue-200 px-2 py-1 rounded-full inline-block">
                      <span className="text-xs font-medium text-blue-800">性能良好</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <RefreshCw className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
              </CardBody>
            </Card>
            
            {/* 新增系统健康度卡片 */}
            <Card className=" hover:shadow-md transition-shadow duration-200">
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-700 mb-1">系统健康度</p>
                    <p className="text-3xl font-bold text-green-800 mb-2">92.5%</p>
                    <div className="flex items-center mb-2">
                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      <p className="text-sm text-green-700 font-medium">较上周 +3.2%</p>
                    </div>
                    <div className="bg-green-200 px-2 py-1 rounded-full inline-block">
                      <span className="text-xs font-medium text-green-800">优秀</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Activity className="h-12 w-12 text-green-500" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </PageContent>
    </PageLayout>
  );
};

export default Analytics;