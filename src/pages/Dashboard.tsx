import { 
  Users, 
  Zap, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { mockDashboardMetrics } from '../data/mockData';

const Dashboard = () => {
  const metrics = mockDashboardMetrics;
  const successRate = (metrics.successSessions / metrics.totalSessions * 100).toFixed(1);
  const failureRate = (metrics.failedSessions / metrics.totalSessions * 100).toFixed(1);

  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'blue' 
  }: {
    title: string;
    value: string | number;
    icon: any;
    trend?: 'up' | 'down';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      red: 'bg-red-50 text-red-600',
      yellow: 'bg-yellow-50 text-yellow-600',
      purple: 'bg-purple-50 text-purple-600'
    }[color] || 'bg-blue-50 text-blue-600';

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center mt-2">
              <p className="text-3xl font-bold text-gray-900">{value}</p>
              {trend && trendValue && (
                <div className={`ml-3 flex items-center text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {trendValue}
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-full ${colorClasses}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">全局监控仪表盘</h1>
        <p className="text-gray-600 mt-2">实时监控数字员工的运行状态和关键指标</p>
      </div>

      {/* 实时流量面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="当前在线用户"
          value={metrics.activeUsers}
          icon={Users}
          trend="up"
          trendValue="+12%"
          color="blue"
        />
        <MetricCard
          title="每分钟请求数"
          value={metrics.rpm}
          icon={Zap}
          trend="up"
          trendValue="+8%"
          color="purple"
        />
        <MetricCard
          title="今日总会话数"
          value={metrics.totalSessions.toLocaleString()}
          icon={MessageCircle}
          trend="up"
          trendValue="+15%"
          color="green"
        />
        <MetricCard
          title="成功率"
          value={`${successRate}%`}
          icon={CheckCircle}
          trend="up"
          trendValue="+2.3%"
          color="green"
        />
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <MetricCard
          title="平均响应时间"
          value={`${metrics.avgResponseTime}s`}
          icon={Clock}
          trend="down"
          trendValue="-0.3s"
          color="blue"
        />
        <MetricCard
          title="总Token消耗"
          value={metrics.totalTokens.toLocaleString()}
          icon={Coins}
          trend="up"
          trendValue="+25%"
          color="yellow"
        />
        <MetricCard
          title="失败会话数"
          value={metrics.failedSessions}
          icon={XCircle}
          trend="down"
          trendValue="-5%"
          color="red"
        />
      </div>

      {/* 异常监控和服务状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 异常监控 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">异常监控</h3>
            <div className="flex items-center text-sm text-green-600">
              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
              正常
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-700">服务可用性</span>
              </div>
              <span className="text-sm font-semibold text-green-600">99.8%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-sm font-medium text-gray-700">平均响应时间</span>
              </div>
              <span className="text-sm font-semibold text-green-600">正常</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                <span className="text-sm font-medium text-gray-700">失败率</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600">{failureRate}%</span>
            </div>
          </div>
        </div>

        {/* 服务状态地图 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">服务状态</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">客服助手</h4>
                <p className="text-sm text-gray-500">GPT-4 + MCP工具链</p>
              </div>
              <div className="flex items-center text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">正常</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">销售分析师</h4>
                <p className="text-sm text-gray-500">Claude-3 + 数据工具</p>
              </div>
              <div className="flex items-center text-green-600">
                <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">正常</span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">内容生成器</h4>
                <p className="text-sm text-gray-500">GPT-3.5 + 文本工具</p>
              </div>
              <div className="flex items-center text-yellow-600">
                <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium">警告</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;