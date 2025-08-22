import { useState } from 'react';
import {
  Calendar,
  Download,
  Filter,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Zap,
  Clock,
  RefreshCw
} from 'lucide-react';

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
    <div className="p-6">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">数据分析与报表</h1>
        <p className="text-gray-600 mt-2">多维度分析数字员工的运行数据和性能指标</p>
      </div>

      {/* 筛选条和操作栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {timeRangeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedDimension}
              onChange={(e) => setSelectedDimension(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {dimensionOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
            >
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新
            </button>
            <button className="flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700">
              <Download className="h-4 w-4 mr-2" />
              导出
            </button>
          </div>
        </div>
      </div>

      {/* Token成本分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Token成本分析</h3>
            <DollarSign className="h-5 w-5 text-gray-400" />
          </div>
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
        </div>

        {/* 每日趋势图 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">趋势分析</h3>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center text-gray-500">
            [这里将显示线性图表]<br/>
            数据Token消耗趋势、成本变化等
          </div>
        </div>
      </div>

      {/* 工具调用分析 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">工具调用分析</h3>
          <Zap className="h-5 w-5 text-gray-400" />
        </div>
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
      </div>

      {/* 问题分析 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 错误类型分布 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">错误类型分布</h3>
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          </div>
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
        </div>

        {/* 关键指标卡片 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总错误数</p>
                <p className="text-3xl font-bold text-red-600">245</p>
                <p className="text-sm text-gray-500 mt-1">较上周 -12%</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">最常见错误</p>
                <p className="text-lg font-bold text-gray-900">工具超时</p>
                <p className="text-sm text-gray-500 mt-1">36.3% 的错误</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均修复时间</p>
                <p className="text-3xl font-bold text-blue-600">4.2分钟</p>
                <p className="text-sm text-gray-500 mt-1">较上周 -8%</p>
              </div>
              <RefreshCw className="h-12 w-12 text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;