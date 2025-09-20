/**
 * 员工运行统计组件
 */

import React from 'react';
import { TrendingUp, Clock, Users, Star, Activity } from 'lucide-react';
import type { DigitalEmployee } from '../../types/employee';

interface MetricsSectionProps {
  employee: DigitalEmployee;
}

const MetricsSection: React.FC<MetricsSectionProps> = ({ employee }) => {
  const { metrics } = employee;

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

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">运行统计</h3>

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

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">平均响应</p>
              <p className="text-2xl font-bold text-purple-900">{formatResponseTime(metrics.avgResponseTime)}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <p className="text-xs text-purple-600 mt-1">响应速度</p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">知识利用率</p>
              <p className="text-2xl font-bold text-yellow-900">{(metrics.knowledgeUtilizationRate * 100).toFixed(1)}%</p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xs text-yellow-600 mt-1">知识库使用效率</p>
        </div>
      </div>

      {/* 用户满意度 */}
      {metrics.userSatisfactionScore && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">用户满意度</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= metrics.userSatisfactionScore!
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {metrics.userSatisfactionScore.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">/ 5.0</span>
          </div>
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
    </div>
  );
};

export default MetricsSection;