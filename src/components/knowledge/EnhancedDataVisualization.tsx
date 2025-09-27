/**
 * 增强的数据可视化组件
 * 提供高级图表、趋势分析和交互式可视化功能
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Activity,
  Target,
  Zap,
  Eye,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DataPoint {
  date: Date;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface EnhancedChartData {
  timeSeries: DataPoint[];
  categories: Array<{
    name: string;
    value: number;
    color: string;
    trend?: 'up' | 'down' | 'stable';
  }>;
  metrics: {
    total: number;
    average: number;
    growth: number;
    trend: 'up' | 'down' | 'stable';
  };
}

interface EnhancedDataVisualizationProps {
  data: EnhancedChartData;
  title: string;
  type?: 'timeline' | 'distribution' | 'trend' | 'correlation';
  height?: number;
  showInteractive?: boolean;
  onDataPointClick?: (point: DataPoint) => void;
}

export const EnhancedDataVisualization: React.FC<EnhancedDataVisualizationProps> = ({
  data,
  title,
  type = 'timeline',
  height = 300,
  showInteractive = true,
  onDataPointClick
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  // 处理时间序列数据
  const processedTimeSeriesData = useMemo(() => {
    if (type !== 'timeline') return [];

    const sortedData = [...data.timeSeries].sort((a, b) => a.date.getTime() - b.date.getTime());
    const maxValue = Math.max(...sortedData.map(d => d.value));
    const minValue = Math.min(...sortedData.map(d => d.value));

    return sortedData.map((point, index) => ({
      ...point,
      normalizedValue: ((point.value - minValue) / (maxValue - minValue || 1)) * 100,
      x: (index / (sortedData.length - 1 || 1)) * 100,
      isFirst: index === 0,
      isLast: index === sortedData.length - 1
    }));
  }, [data.timeSeries, type]);

  // 趋势指示器组件
  const TrendIndicator = ({ trend, value }: { trend: 'up' | 'down' | 'stable'; value?: number }) => {
    const Icon = trend === 'up' ? ArrowUp : trend === 'down' ? ArrowDown : Minus;
    const colorClass = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';

    return (
      <div className={cn('flex items-center gap-1', colorClass)}>
        <Icon className="h-3 w-3" />
        {value !== undefined && <span className="text-xs font-medium">{Math.abs(value).toFixed(1)}%</span>}
      </div>
    );
  };

  // 渲染时间轴图表
  const renderTimelineChart = () => (
    <div className="relative" style={{ height: `${height}px` }}>
      {/* 图表容器 */}
      <div className="h-full border border-gray-200 rounded-lg bg-gradient-to-b from-blue-50 via-white to-white p-4 overflow-hidden">
        {/* Y轴标签 */}
        <div className="absolute left-2 top-4 bottom-12 w-8 flex flex-col justify-between text-xs text-gray-500">
          {[100, 75, 50, 25, 0].map(val => (
            <span key={val} className="leading-none">{val}%</span>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="ml-12 mr-4 h-full pb-8 relative">
          {/* 网格线 */}
          <svg className="absolute inset-0 w-full h-full">
            {/* 水平网格线 */}
            {[0, 25, 50, 75, 100].map(y => (
              <line
                key={y}
                x1="0"
                y1={`${100 - y}%`}
                x2="100%"
                y2={`${100 - y}%`}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
            ))}

            {/* 垂直网格线 */}
            {processedTimeSeriesData.map((_, index) => {
              if (index % Math.ceil(processedTimeSeriesData.length / 8) !== 0) return null;
              const x = (index / (processedTimeSeriesData.length - 1 || 1)) * 100;
              return (
                <line
                  key={index}
                  x1={`${x}%`}
                  y1="0"
                  x2={`${x}%`}
                  y2="100%"
                  stroke="#f9fafb"
                  strokeWidth="1"
                />
              );
            })}

            {/* 数据线 */}
            {processedTimeSeriesData.length > 1 && (
              <polyline
                points={processedTimeSeriesData.map(point =>
                  `${point.x},${100 - point.normalizedValue}`
                ).join(' ')}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                className="drop-shadow-sm"
              />
            )}

            {/* 渐变定义 */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#06d6a0', stopOpacity: 1 }} />
              </linearGradient>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* 面积填充 */}
            {processedTimeSeriesData.length > 1 && (
              <polygon
                points={[
                  ...processedTimeSeriesData.map(point => `${point.x},${100 - point.normalizedValue}`),
                  `${processedTimeSeriesData[processedTimeSeriesData.length - 1]?.x || 0},100`,
                  `${processedTimeSeriesData[0]?.x || 0},100`
                ].join(' ')}
                fill="url(#areaGradient)"
              />
            )}
          </svg>

          {/* 数据点 */}
          {processedTimeSeriesData.map((point, index) => (
            <div
              key={index}
              className="absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              style={{
                left: `${point.x}%`,
                top: `${100 - point.normalizedValue}%`
              }}
              onClick={() => onDataPointClick?.(point)}
              onMouseEnter={() => setHoveredPoint(point)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <div className={cn(
                "w-3 h-3 rounded-full shadow-lg transition-all duration-200",
                "bg-gradient-to-r from-blue-500 to-purple-500",
                "group-hover:scale-150 group-hover:shadow-xl"
              )} />

              {/* 悬浮提示 */}
              {hoveredPoint === point && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg whitespace-nowrap">
                  <div className="font-medium">{point.date.toLocaleDateString()}</div>
                  <div>值: {point.value.toFixed(2)}</div>
                  {point.category && <div>分类: {point.category}</div>}
                  {/* 小三角箭头 */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* X轴标签 */}
        <div className="absolute bottom-2 left-12 right-4 flex justify-between text-xs text-gray-500">
          {processedTimeSeriesData.length > 0 && (
            <>
              <span>{processedTimeSeriesData[0]?.date.toLocaleDateString()}</span>
              <span>{processedTimeSeriesData[Math.floor(processedTimeSeriesData.length / 2)]?.date.toLocaleDateString()}</span>
              <span>{processedTimeSeriesData[processedTimeSeriesData.length - 1]?.date.toLocaleDateString()}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // 渲染分布图表
  const renderDistributionChart = () => (
    <div className="space-y-4">
      {/* 分类列表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          {data.categories.map((category, index) => {
            const percentage = (category.value / data.metrics.total) * 100;
            return (
              <div key={category.name} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{percentage.toFixed(1)}% 占比</span>
                      {category.trend && <TrendIndicator trend={category.trend} />}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                        animationDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-8 text-right">{category.value}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 环形图表示 */}
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="16"
              />
              {data.categories.map((category, index) => {
                const percentage = (category.value / data.metrics.total) * 100;
                const circumference = 2 * Math.PI * 80;
                const offset = circumference - (percentage / 100) * circumference;
                const rotation = data.categories.slice(0, index).reduce((acc, cat) =>
                  acc + (cat.value / data.metrics.total) * 360, 0
                );

                return (
                  <circle
                    key={category.name}
                    cx="96"
                    cy="96"
                    r="80"
                    fill="none"
                    stroke={category.color}
                    strokeWidth="16"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      transformOrigin: '96px 96px',
                      transform: `rotate(${rotation}deg)`,
                      transition: 'stroke-dashoffset 1s ease-in-out'
                    }}
                  />
                );
              })}
            </svg>

            {/* 中心标签 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{data.metrics.total}</div>
                <div className="text-sm text-gray-600">总数</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // 渲染趋势指标
  const renderTrendMetrics = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            <TrendIndicator trend={data.metrics.trend} value={data.metrics.growth} />
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">{data.metrics.total}</div>
          <div className="text-sm text-gray-600">总计</div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Target className="h-5 w-5 text-green-600 mr-2" />
          </div>
          <div className="text-2xl font-bold text-green-600 mb-1">
            {data.metrics.average.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">平均值</div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="h-5 w-5 text-purple-600 mr-2" />
            <TrendIndicator trend={data.metrics.trend} />
          </div>
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {data.metrics.growth > 0 ? '+' : ''}{data.metrics.growth.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-600">增长率</div>
        </CardContent>
      </Card>

      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <Activity className="h-5 w-5 text-orange-600 mr-2" />
          </div>
          <div className="text-2xl font-bold text-orange-600 mb-1">
            {data.timeSeries.length}
          </div>
          <div className="text-sm text-gray-600">数据点</div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Eye className="w-5 h-5 mr-2 text-gray-600" />
            {title}
          </h3>

          {showInteractive && (
            <div className="flex items-center gap-2">
              {type === 'timeline' && (
                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={zoomLevel >= 3}
                  >
                    <span>放大</span>
                  </button>
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 0.5))}
                    className="p-1 hover:bg-gray-100 rounded"
                    disabled={zoomLevel <= 0.5}
                  >
                    <span>缩小</span>
                  </button>
                </div>
              )}
              <Filter className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* 趋势指标 */}
          {renderTrendMetrics()}

          {/* 主图表区域 */}
          {type === 'timeline' && renderTimelineChart()}
          {type === 'distribution' && renderDistributionChart()}

          {/* 详细统计 */}
          {type === 'correlation' && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">相关性分析</h4>
              <div className="text-sm text-gray-700">
                基于当前数据显示的模式和趋势分析，识别关键因素之间的相关性。
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedDataVisualization;