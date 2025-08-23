import { 
  Users, 
  Zap, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Coins,
  AlertTriangle
} from 'lucide-react';
import { mockDashboardMetrics } from '../data/mockData';
import { PageLayout, PageHeader, PageContent, MetricCard, Card, CardHeader, CardBody } from '../components/ui';

const Dashboard = () => {
  const metrics = mockDashboardMetrics;
  const successRate = (metrics.successSessions / metrics.totalSessions * 100).toFixed(1);
  const failureRate = (metrics.failedSessions / metrics.totalSessions * 100).toFixed(1);

  return (
    <PageLayout>
      <PageHeader 
        title="全局监控仪表盘" 
        subtitle="实时监控数字员工的运行状态和关键指标"
      />

      <PageContent>
        {/* 核心指标 */}
        <div className="grid-responsive">
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
            color="green"
          />
          
          <MetricCard
            title="成功会话"
            value={metrics.successSessions}
            icon={CheckCircle}
            trend="up"
            trendValue="+15%"
            color="green"
          />
          
          <MetricCard
            title="失败会话"
            value={metrics.failedSessions}
            icon={XCircle}
            trend="down"
            trendValue="-5%"
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 会话统计 */}
          <Card>
            <CardHeader>
              <h2 className="card-title">会话统计</h2>
              <p className="card-subtitle">近24小时会话概览</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">总会话数</p>
                      <p className="text-sm text-gray-500">过去24小时</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics.totalSessions}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{successRate}%</div>
                    <div className="text-sm text-gray-600">成功率</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{failureRate}%</div>
                    <div className="text-sm text-gray-600">失败率</div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600">平均响应时间</span>
                  </div>
                  <span className="font-semibold text-gray-900">{metrics.avgResponseTime}ms</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Token使用统计 */}
          <Card>
            <CardHeader>
              <h2 className="card-title">Token使用统计</h2>
              <p className="card-subtitle">按模型分类的成本分析</p>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Coins className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">总Token数</p>
                      <p className="text-sm text-gray-500">所有模型</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {metrics.totalTokens.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(metrics.tokenCostByModel).map(([model, cost]) => (
                    <div key={model} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{model}</div>
                        <div className="text-sm text-gray-500">模型成本</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${cost.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">
                          {((cost / Object.values(metrics.tokenCostByModel).reduce((a, b) => a + b, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 系统健康状态 */}
        <Card>
          <CardHeader>
            <h2 className="card-title">系统健康状态</h2>
            <p className="card-subtitle">关键系统组件运行状态</p>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="font-semibold text-gray-900">API服务</div>
                <div className="text-sm text-green-600 mt-1">运行正常</div>
                <div className="text-xs text-gray-500 mt-2">响应时间 &lt; 100ms</div>
              </div>

              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="font-semibold text-gray-900">数据库</div>
                <div className="text-sm text-green-600 mt-1">连接正常</div>
                <div className="text-xs text-gray-500 mt-2">查询时间 &lt; 50ms</div>
              </div>

              <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <div className="font-semibold text-gray-900">消息队列</div>
                <div className="text-sm text-yellow-600 mt-1">轻微延迟</div>
                <div className="text-xs text-gray-500 mt-2">处理延迟 ~200ms</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </PageContent>
    </PageLayout>
  );
};

export default Dashboard;