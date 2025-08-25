import { useState } from 'react';
import {
  Download,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';
import { PageLayout, PageHeader, PageContent, MetricCard, Card, CardHeader, CardBody, Button, FilterSection } from '../components/ui';

const Analytics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDimension, setSelectedDimension] = useState('model');
  const [selectedMetric, setSelectedMetric] = useState('tokens');

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
          <Button variant="secondary">
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
                  placeholder: "搜索数据..."
                }}
                filters={[
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
              
              {/* 操作按钮组 */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  刷新
                </Button>
                <Button variant="secondary" size="sm">
                  <Download className="h-4 w-4" />
                  导出
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Token成本分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h3 className="card-title">Token成本分析</h3>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {tokenCostData.map((item) => (
                  <div key={item.model} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{item.model}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                          item.change.startsWith('+') ? 'bg-red-100 text-red-600' :
                          item.change.startsWith('-') ? 'bg-green-100 text-green-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {item.change}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">${item.cost.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 每日趋势图 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="card-title">趋势分析</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="h-64 flex items-center justify-center text-gray-500">
                [这里将显示线性图表]<br/>
                数据Token消耗趋势、成本变化等
              </div>
            </CardBody>
          </Card>
        </div>

        {/* 工具调用分析 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="card-title">工具调用分析</h3>
              <Zap className="h-5 w-5 text-gray-400" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工具名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      调用次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      失败次数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      失败率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      平均时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {toolCallData.map((tool) => (
                    <tr key={tool.tool} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{tool.tool}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{tool.calls.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-red-600 font-medium">{tool.failures}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          tool.failureRate > 5 ? 'bg-red-100 text-red-800' :
                          tool.failureRate > 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {tool.failureRate.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-900">{tool.avgTime}s</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* 问题分析 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 错误类型分布 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="card-title">错误类型分布</h3>
                <AlertTriangle className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                {errorAnalysisData.map((error) => (
                  <div key={error.type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900">{error.type}</span>
                        <div className={`ml-2 flex items-center text-xs ${
                          error.trend === 'up' ? 'text-red-600' :
                          error.trend === 'down' ? 'text-green-600' :
                          'text-gray-600'
                        }`}>
                          {error.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> :
                           error.trend === 'down' ? <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" /> : null}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{error.count}</div>
                        <div className="text-sm text-gray-500">{error.percentage}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          error.trend === 'up' ? 'bg-red-500' :
                          error.trend === 'down' ? 'bg-green-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${error.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* 关键指标卡片 */}
          <div className="space-y-4">
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">总错误数</p>
                    <p className="text-3xl font-bold text-red-600">245</p>
                    <p className="text-sm text-gray-500 mt-1">较上周 -12%</p>
                  </div>
                  <AlertTriangle className="h-12 w-12 text-red-400" />
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">最常见错误</p>
                    <p className="text-lg font-bold text-gray-900">工具超时</p>
                    <p className="text-sm text-gray-500 mt-1">36.3% 的错误</p>
                  </div>
                  <Clock className="h-12 w-12 text-yellow-400" />
                </div>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">平均修复时间</p>
                    <p className="text-3xl font-bold text-blue-600">4.2分钟</p>
                    <p className="text-sm text-gray-500 mt-1">较上周 -8%</p>
                  </div>
                  <RefreshCw className="h-12 w-12 text-blue-400" />
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