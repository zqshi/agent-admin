import { useState, useEffect } from 'react';
import { 
  Users, 
  Zap, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Coins,
  AlertTriangle,
  Brain,
  Target,
  Activity,
  TrendingUp,
  BarChart3,
  Eye,
  Shield,
  Layers,
  GitBranch,
  Bell,
  Settings,
  RefreshCw,
  Wifi,
  Database,
  Server,
  FileText,
  Lightbulb,
  TrendingDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { mockDashboardMetrics } from '../data/mockData';
import { PageLayout, PageHeader, PageContent, MetricCard, Card, CardHeader, CardBody, Button, Modal } from '../components/ui';
import { ALL_METRICS, getMetricsByLevel, METRIC_CATEGORIES, L1_BUSINESS_METRICS, getMetricStatus } from '../types/metrics-definitions';
import type { MetricValue } from '../types/metrics-definitions';

const Dashboard = () => {
  const [selectedMetricLevel, setSelectedMetricLevel] = useState<'all' | 'L1' | 'L2' | 'L3' | 'L4'>('L1');
  const [realTimeData, setRealTimeData] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [showOptimizationSuggestions, setShowOptimizationSuggestions] = useState(false);
  
  // 模拟实时数据
  const metrics = mockDashboardMetrics;
  const successRate = (metrics.successSessions / metrics.totalSessions * 100).toFixed(1);
  const failureRate = (metrics.failedSessions / metrics.totalSessions * 100).toFixed(1);
  
  // L1核心业务指标模拟数据
  const [coreMetrics, setCoreMetrics] = useState<Record<string, MetricValue>>({});

  // 初始化核心指标数据
  useEffect(() => {
    // 从L1业务指标中选择几个关键指标
    const keyMetrics = L1_BUSINESS_METRICS.filter(metric => 
      ['task_success_rate', 'user_satisfaction_csat', 'analysis_insight_accuracy'].includes(metric.id)
    );

    // 生成模拟数据
    const initialMetrics: Record<string, MetricValue> = {};
    keyMetrics.forEach(metric => {
      // 生成基于目标值的模拟值
      let value = 0;
      if (metric.id === 'task_success_rate') value = 82.5; // 良好
      else if (metric.id === 'user_satisfaction_csat') value = 88.2; // 接近优秀
      else if (metric.id === 'analysis_insight_accuracy') value = 87.3; // 良好

      // 生成趋势和变化百分比
      const trendOptions = ['up', 'down', 'stable'];
      const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
      const changePercent = trend === 'stable' ? 0 : parseFloat((Math.random() * 10 - 5).toFixed(1));

      // 确定状态
      const status = getMetricStatus(metric, value);

      initialMetrics[metric.id] = {
        metricId: metric.id,
        value,
        timestamp: new Date(),
        trend: trend as 'up' | 'down' | 'stable',
        changePercent,
        status
      };
    });

    setCoreMetrics(initialMetrics);
  }, []);
  
  // 实验状态模拟数据
  const [experimentSummary] = useState({
    running: 3,
    completed: 8,
    significant: 2,
    totalParticipants: 15420,
    avgLift: 12.8
  });
  
  // 系统健康度评分
  const [systemHealth] = useState({
    overall: 94.2,
    components: {
      llm_services: { score: 98.1, status: 'excellent', latency: 1.2 },
      mcp_tools: { score: 92.4, status: 'good', success_rate: 96.8 },
      data_pipeline: { score: 89.7, status: 'good', throughput: 1240 },
      storage: { score: 96.3, status: 'excellent', query_time: 45 }
    }
  });
  
  // 智能告警数据
  const [alertSummary] = useState({
    critical: 0,
    warning: 2,
    info: 5,
    resolved: 12,
    mttr: 4.2 // 平均修复时间(分钟)
  });
  
  // 实时数据更新
  useEffect(() => {
    if (!realTimeData) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // 这里可以添加实时数据更新逻辑
    }, 30000);
    
    return () => clearInterval(interval);
  }, [realTimeData]);
  
  const getHealthColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 85) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <PageLayout>
      <PageHeader 
        title="智能观测仪表盘" 
        subtitle="基于L1/L2/L3指标体系的全链路数字员工智能监控"
      >
        <div className="flex items-center gap-3">
          {/* 实时状态指示器 */}
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700 font-medium">实时监控</span>
            <span className="text-xs text-green-600">
              {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          
          {/* 指标级别切换 - 带说明 */}
          <div className="flex bg-white rounded-lg border border-gray-200 p-1 relative group">
            {[
              { key: 'L1', label: 'L1', tooltip: '核心业务指标 - 直接衡量业务价值和成效' },
              { key: 'L2', label: 'L2', tooltip: '支撑分析指标 - 支撑业务指标的中间层分析' },
              { key: 'L3', label: 'L3', tooltip: '技术监控指标 - 底层技术性能和系统稳定性' },
              { key: 'L4', label: 'L4', tooltip: '运维与安全指标 - 系统可靠性与安全合规性' },
              { key: 'all', label: '全部', tooltip: '显示所有层级的指标' }
            ].map((level) => (
              <div key={level.key} className="relative">
                <button
                  onClick={() => setSelectedMetricLevel(level.key as any)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    selectedMetricLevel === level.key
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={level.tooltip}
                >
                  {level.label}
                </button>
              </div>
            ))}
            
            {/* 指标体系说明浮窗 */}
            <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
              <h4 className="font-semibold text-gray-900 mb-3">L1/L2/L3/L4 指标体系说明</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-700 rounded-full font-medium text-xs">L1</span>
                  <div>
                    <div className="font-medium text-gray-900">核心业务指标</div>
                    <div className="text-gray-600">直接反映业务价值的关键成效指标，如分析准确性、决策支撑度等</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 rounded-full font-medium text-xs">L2</span>
                  <div>
                    <div className="font-medium text-gray-900">支撑分析指标</div>
                    <div className="text-gray-600">支撑L1业务指标的中间层分析指标，如数据质量、用户体验等</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-700 rounded-full font-medium text-xs">L3</span>
                  <div>
                    <div className="font-medium text-gray-900">技术监控指标</div>
                    <div className="text-gray-600">底层技术性能和系统运行指标，如响应时间、成功率、资源使用等</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full font-medium text-xs">L4</span>
                  <div>
                    <div className="font-medium text-gray-900">运维与安全指标</div>
                    <div className="text-gray-600">系统可靠性、安全性和合规性指标，如错误率、敏感信息保护等</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>
      </PageHeader>

      <PageContent>
        
        {/* 系统健康度总览 */}
        <Card className="mb-6">
          <CardBody>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">系统整体健康度</h3>
                <p className="text-gray-600">基于多维度实时监控的智能评分</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600 mb-1">{systemHealth.overall.toString()}%</div>
                <div className="text-sm text-blue-600 font-medium">优秀状态</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(systemHealth.components).map(([key, component]) => {
              const icons = {
                llm_services: <Brain className="h-5 w-5" />,
                mcp_tools: <Zap className="h-5 w-5" />,
                data_pipeline: <Activity className="h-5 w-5" />,
                storage: <Database className="h-5 w-5" />
              };
              const labels = {
                llm_services: 'LLM服务',
                mcp_tools: 'MCP工具',
                data_pipeline: '数据管道',
                storage: '存储系统'
              };
              return (
                <div key={key} className={`p-4 rounded-lg border ${getHealthColor(component.score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {icons[key as keyof typeof icons]}
                      <span className="font-medium text-sm">{labels[key as keyof typeof labels]}</span>
                    </div>
                    <span className="text-lg font-bold">{component.score}%</span>
                  </div>
                  <div className="text-xs opacity-75">
                    {key === 'llm_services' && 'latency' in component && `延迟: ${component.latency}s`}
                    {key === 'mcp_tools' && 'success_rate' in component && `成功率: ${component.success_rate}%`}
                    {key === 'data_pipeline' && 'throughput' in component && `吞吐: ${component.throughput}/min`}
                    {key === 'storage' && 'query_time' in component && `查询: ${component.query_time}ms`}
                  </div>
                </div>
              );
            })}
          </div>
          </CardBody>
        </Card>
        
        {/* L1核心业务指标 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">L1 核心业务指标</h3>
            <span className="text-sm text-gray-500">最关键的业务成效指标</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(coreMetrics).map(([key, metric]) => {
              const metricDef = ALL_METRICS.find(m => m.id === key);
              const statusColors = {
                excellent: 'border-green-200 bg-green-50 text-green-700',
                good: 'border-blue-200 bg-blue-50 text-blue-700',
                'needs-improvement': 'border-yellow-200 bg-yellow-50 text-yellow-700',
                poor: 'border-red-200 bg-red-50 text-red-700'
              };
              return (
                <div key={key} className={`p-6 rounded-xl border-2 ${statusColors[metric.status]} hover:shadow-lg transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{metricDef?.name || key}</h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-white bg-opacity-80 font-medium">
                      L1
                    </span>
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {metric.value.toLocaleString()}{metricDef?.unit || ''}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' :
                      metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.trend === 'up' ? '↗' : metric.trend === 'down' ? '↘' : '→'}
                      {Math.abs(metric.changePercent).toFixed(1)}%
                    </span>
                    <span className="text-xs font-medium">{metric.status === 'excellent' ? '优秀' : metric.status === 'good' ? '良好' : metric.status === 'needs-improvement' ? '待改进' : '差'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* A/B实验概览和告警中心 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* A/B实验智能概览 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h3 className="card-title text-purple-900">A/B实验概览</h3>
              </div>
              <p className="card-subtitle text-purple-700">智能实验分析与决策支持</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-white bg-opacity-80 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{experimentSummary.running}</div>
                  <div className="text-sm text-gray-600">进行中</div>
                </div>
                <div className="text-center p-3 bg-white bg-opacity-80 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{experimentSummary.significant}</div>
                  <div className="text-sm text-gray-600">显著效果</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">总参与用户:</span>
                  <span className="font-medium">{experimentSummary.totalParticipants.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">平均提升:</span>
                  <span className="font-medium text-green-600">+{experimentSummary.avgLift}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">完成实验:</span>
                  <span className="font-medium">{experimentSummary.completed} 个</span>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* 智能告警中心 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <h3 className="card-title text-orange-900">智能告警中心</h3>
              </div>
              <p className="card-subtitle text-orange-700">预测性异常检测与响应</p>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="text-center p-2 bg-red-100 rounded">
                  <div className="text-lg font-bold text-red-600">{alertSummary.critical}</div>
                  <div className="text-xs text-red-600">紧急</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 rounded">
                  <div className="text-lg font-bold text-yellow-600">{alertSummary.warning}</div>
                  <div className="text-xs text-yellow-600">警告</div>
                </div>
                <div className="text-center p-2 bg-blue-100 rounded">
                  <div className="text-lg font-bold text-blue-600">{alertSummary.info}</div>
                  <div className="text-xs text-blue-600">信息</div>
                </div>
                <div className="text-center p-2 bg-green-100 rounded">
                  <div className="text-lg font-bold text-green-600">{alertSummary.resolved}</div>
                  <div className="text-xs text-green-600">已解决</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">平均修复时间:</span>
                  <span className="font-medium text-blue-600">{alertSummary.mttr} 分钟</span>
                </div>
                <div className="p-2 bg-green-100 rounded text-green-700 text-xs">
                  ✓ 系统运行稳定，无紧急告警
                </div>
                <div className="p-2 bg-yellow-100 rounded text-yellow-700 text-xs">
                  ⚠ Token成本上升趋势，建议优化
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* 传统指标 - 增强版 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="活跃用户"
            value={metrics.activeUsers}
            icon={Users}
            trend="up"
            trendValue="+12%"
            color="primary"
          />
          
          <MetricCard
            title="会话成功率"
            value={`${successRate}%`}
            icon={CheckCircle}
            trend="up"
            trendValue="+3.2%"
            color="success"
          />
          
          <MetricCard
            title="响应时间P95"
            value={`${metrics.avgResponseTime}ms`}
            icon={Clock}
            trend="down"
            trendValue="-15%"
            color="success"
          />
          
          <MetricCard
            title="Token成本效率"
            value="$0.23"
            icon={Coins}
            trend="down"
            trendValue="-8%"
            color="success"
          />
        </div>

        {/* 链路追踪和性能监控 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 分布式链路追踪概览 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-600" />
                <h3 className="card-title text-indigo-900">链路追踪概览</h3>
              </div>
              <p className="card-subtitle text-indigo-700">分布式系统调用链分析</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white bg-opacity-80 rounded-lg">
                    <div className="text-lg font-bold text-indigo-600">1,247</div>
                    <div className="text-xs text-gray-600">活跃Traces</div>
                  </div>
                  <div className="text-center p-3 bg-white bg-opacity-80 rounded-lg">
                    <div className="text-lg font-bold text-green-600">96.8%</div>
                    <div className="text-xs text-gray-600">成功率</div>
                  </div>
                  <div className="text-center p-3 bg-white bg-opacity-80 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">2.1s</div>
                    <div className="text-xs text-gray-600">平均耗时</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">LLM调用延迟:</span>
                    <span className="font-medium">1.2s (P95: 2.8s)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">工具调用成功率:</span>
                    <span className="font-medium text-green-600">98.3%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">数据库查询:</span>
                    <span className="font-medium">45ms (平均)</span>
                  </div>
                </div>
                
                <div className="bg-white bg-opacity-80 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">热点服务 Top 3</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>llm-gateway</span>
                      <span className="text-red-600 font-medium">2.8s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>mcp-executor</span>
                      <span className="text-yellow-600 font-medium">1.4s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>data-fetcher</span>
                      <span className="text-green-600 font-medium">0.3s</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Token使用和成本分析 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-yellow-600" />
                <h3 className="card-title text-yellow-900">Token成本分析</h3>
              </div>
              <p className="card-subtitle text-yellow-700">智能成本优化建议</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white bg-opacity-80 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">今日总成本</p>
                    <p className="text-sm text-gray-500">所有模型</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">$234.56</div>
                    <div className="text-sm text-green-600">-8% ↓</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {Object.entries(metrics.tokenCostByModel).map(([model, cost], index) => {
                    const colors = ['bg-purple-100', 'bg-green-100', 'bg-blue-100'];
                    const textColors = ['text-purple-700', 'text-green-700', 'text-blue-700'];
                    return (
                      <div key={model} className={`flex items-center justify-between p-3 ${colors[index]} rounded-lg`}>
                        <div className="flex items-center gap-2">
                          <Brain className={`h-4 w-4 ${textColors[index]}`} />
                          <div>
                            <div className="font-medium text-gray-900">{model}</div>
                            <div className="text-xs text-gray-500">
                              {((cost / Object.values(metrics.tokenCostByModel).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}% 占比
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">${cost.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {(cost / 1000 * 24).toFixed(1)}K tokens/天
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="bg-blue-100 p-3 rounded-lg">
                  <div className="text-xs text-blue-600 font-medium mb-1">💡 智能建议</div>
                  <div className="text-xs text-blue-700">
                    • GPT-4使用过多，建议部分场景切换至Claude-3<br/>
                    • 缓存命中率仅68%，可优化15%成本
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 预测性洞察和趋势分析 */}
        <Card className="bg-gray-800 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-blue-300" />
                  <h3 className="text-xl font-bold">24小时预测洞察</h3>
                </div>
                <p className="text-blue-200 mt-1">基于AI的智能分析与预测</p>
              </div>
              <div className="text-blue-200 text-sm">
                最后更新: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 性能预测 */}
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-green-300" />
                  <h4 className="font-semibold text-white">性能预测</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">24小时内:</span>
                    <span className="text-green-300 font-medium">响应时间 ↓12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">负载预测:</span>
                    <span className="text-yellow-300 font-medium">峰值 +25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">瓶颈风险:</span>
                    <span className="text-red-300 font-medium">LLM网关 (高)</span>
                  </div>
                </div>
              </div>
              
              {/* 业务洞察 */}
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-5 w-5 text-purple-300" />
                  <h4 className="font-semibold text-white">业务洞察</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-200">用户满意度:</span>
                    <span className="text-green-300 font-medium">趋势 ↑</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">转化提升:</span>
                    <span className="text-green-300 font-medium">A/B实验 +12%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-200">成本优化:</span>
                    <span className="text-blue-300 font-medium">潜力 -15%</span>
                  </div>
                </div>
              </div>
              
              {/* 异常检测 */}
              <div className="bg-white bg-opacity-10 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-orange-300" />
                  <h4 className="font-semibold text-white">异常检测</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-green-300">系统运行正常</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-yellow-300">Token使用异常上升</span>
                  </div>
                  <div className="text-xs text-blue-200 mt-2">
                    🔍 建议: 检查新部署的模型参数配置
                  </div>
                </div>
              </div>
            </div>
            
            {/* 快速操作面板 */}
            <div className="mt-6 flex items-center justify-between p-4 bg-white bg-opacity-5 rounded-lg">
              <div className="text-sm text-blue-200">
                基于多维数据分析，AI助手为您提供个性化运维建议
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  onClick={() => setShowDetailedReport(true)}
                >
                  <FileText className="h-4 w-4" />
                  查看详细报告
                </Button>
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => setShowOptimizationSuggestions(true)}
                >
                  <Lightbulb className="h-4 w-4" />
                  优化建议
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </PageContent>

      {/* 详细报告模态框 */}
      <Modal
        isOpen={showDetailedReport}
        onClose={() => setShowDetailedReport(false)}
        title="系统详细分析报告"
        size="xl"
      >
        <div className="space-y-6">
          {/* 报告概览 */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">系统健康度评估</h3>
                <p className="text-blue-700 text-sm mb-3">
                  基于过去24小时的数据分析，系统整体运行状态良好，各项核心指标表现稳定。
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-blue-600">{systemHealth.overall}%</div>
                  <div className="text-sm text-blue-600">综合健康评分</div>
                </div>
              </div>
            </div>
          </div>

          {/* 关键指标趋势分析 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">关键指标趋势分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">会话成功率</h4>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">+3.2%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{successRate}%</div>
                <p className="text-sm text-gray-600 mt-2">
                  相比昨日同期提升3.2%，主要得益于LLM响应优化
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">平均响应时间</h4>
                  <div className="flex items-center text-green-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">-15%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime}ms</div>
                <p className="text-sm text-gray-600 mt-2">
                  响应时间显著改善，系统优化效果明显
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Token成本效率</h4>
                  <div className="flex items-center text-green-600">
                    <ArrowDown className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">-8%</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">$0.23</div>
                <p className="text-sm text-gray-600 mt-2">
                  单次会话成本下降，成本控制效果良好
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">系统稳定性</h4>
                  <div className="flex items-center text-blue-600">
                    <ArrowUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-medium">稳定</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">99.8%</div>
                <p className="text-sm text-gray-600 mt-2">
                  系统可用性保持高水平，无重大故障
                </p>
              </div>
            </div>
          </div>

          {/* 组件健康状态详情 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">组件健康状态详情</h3>
            <div className="space-y-3">
              {Object.entries(systemHealth.components).map(([key, component]) => {
                const icons = {
                  llm_services: <Brain className="h-5 w-5" />,
                  mcp_tools: <Zap className="h-5 w-5" />,
                  data_pipeline: <Activity className="h-5 w-5" />,
                  storage: <Database className="h-5 w-5" />
                };
                const labels = {
                  llm_services: 'LLM服务',
                  mcp_tools: 'MCP工具',
                  data_pipeline: '数据管道',
                  storage: '存储系统'
                };
                const statusTexts = {
                  excellent: '优秀',
                  good: '良好',
                  'needs-improvement': '需要改进',
                  poor: '差'
                };
                return (
                  <div key={key} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {icons[key as keyof typeof icons]}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{labels[key as keyof typeof labels]}</h4>
                        <p className="text-sm text-gray-600">
                          {key === 'llm_services' && `平均延迟: ${(component as { latency: number }).latency}s`}
                          {key === 'mcp_tools' && `成功率: ${(component as { success_rate: number }).success_rate}%`}
                          {key === 'data_pipeline' && `吞吐量: ${(component as { throughput: number }).throughput}/min`}
                          {key === 'storage' && `查询时间: ${(component as { query_time: number }).query_time}ms`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">{component.score}%</div>
                      <div className="text-sm text-gray-600">{statusTexts[component.status]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 数据总结 */}
          <div className="bg-gray-800 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">24小时数据总结</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-300">{metrics.totalSessions}</div>
                <div className="text-sm text-gray-300">总会话数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-300">{metrics.successSessions}</div>
                <div className="text-sm text-gray-300">成功会话</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-300">{metrics.totalTokens.toLocaleString()}</div>
                <div className="text-sm text-gray-300">消耗Token</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-300">{metrics.activeUsers}</div>
                <div className="text-sm text-gray-300">活跃用户</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* 优化建议模态框 */}
      <Modal
        isOpen={showOptimizationSuggestions}
        onClose={() => setShowOptimizationSuggestions(false)}
        title="系统优化建议"
        size="xl"
      >
        <div className="space-y-6">
          {/* 优化建议概览 */}
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Lightbulb className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900 mb-2">智能优化建议</h3>
                <p className="text-green-700 text-sm">
                  基于系统运行数据和AI分析，为您提供个性化的优化建议，预计可提升15-20%的整体性能。
                </p>
              </div>
            </div>
          </div>

          {/* 高优先级建议 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              高优先级建议
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Coins className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">Token成本优化</h4>
                    <p className="text-red-800 text-sm mb-3">
                      GPT-4使用占比过高(45%)，建议部分场景切换至Claude-3或优化prompt长度。
                    </p>
                    <div className="text-sm text-red-700">
                      <strong>预期收益：</strong>降低成本15-25% | <strong>实施难度：</strong>中等 | <strong>预计时间：</strong>1-2周
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900 mb-2">响应时间优化</h4>
                    <p className="text-orange-800 text-sm mb-3">
                      LLM网关P95延迟2.8s偏高，建议增加缓存层和实现流式响应。
                    </p>
                    <div className="text-sm text-orange-700">
                      <strong>预期收益：</strong>响应时间降低30-40% | <strong>实施难度：</strong>高 | <strong>预计时间：</strong>2-3周
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 中优先级建议 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-yellow-500" />
              中优先级建议
            </h3>
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Activity className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 mb-2">数据管道优化</h4>
                    <p className="text-yellow-800 text-sm mb-3">
                      数据管道吞吐量1240/min可进一步提升，建议优化批处理策略。
                    </p>
                    <div className="text-sm text-yellow-700">
                      <strong>预期收益：</strong>处理效率提升20% | <strong>实施难度：</strong>中等 | <strong>预计时间：</strong>1周
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-2">模型推理优化</h4>
                    <p className="text-blue-800 text-sm mb-3">
                      建议实现动态批处理和模型量化，提升推理效率。
                    </p>
                    <div className="text-sm text-blue-700">
                      <strong>预期收益：</strong>推理速度提升15% | <strong>实施难度：</strong>中等 | <strong>预计时间：</strong>2周
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 长期建议 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              长期优化建议
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">监控告警完善</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  建议完善预测性告警机制，实现问题前置发现和自动修复。
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Layers className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">架构扩展性</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  考虑微服务拆分和容器化部署，提升系统扩展性和容错能力。
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <h4 className="font-medium text-gray-900">数据驱动决策</h4>
                </div>
                <p className="text-gray-700 text-sm">
                  建立更完善的数据分析体系，支持A/B测试和业务决策优化。
                </p>
              </div>
            </div>
          </div>

          {/* 实施路线图 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">建议实施路线图</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-semibold text-sm">1</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">第1周：Token成本优化</div>
                  <div className="text-sm text-gray-600">分析使用场景，制定模型切换策略</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-semibold text-sm">2</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">第2-3周：响应时间优化</div>
                  <div className="text-sm text-gray-600">实施缓存策略和流式响应</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 font-semibold text-sm">3</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">第4-5周：数据管道和推理优化</div>
                  <div className="text-sm text-gray-600">并行进行批处理和模型量化优化</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </PageLayout>
  );
};

export default Dashboard;