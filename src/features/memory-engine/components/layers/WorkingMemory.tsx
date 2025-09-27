/**
 * 工作记忆管理组件
 * 管理短期记忆、上下文对话和临时数据缓存
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Brain,
  Clock,
  Zap,
  Trash2,
  Archive,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerState } from '../../types';

interface WorkingMemoryProps {
  employeeId: string;
  memories: EnhancedMemoryEntry[];
  layerState: MemoryLayerState;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onMemoryTransfer?: (memoryId: string, targetLayer: string) => void;
  onMemoryDelete?: (memoryId: string) => void;
  onRefresh?: () => void;
}

export const WorkingMemory: React.FC<WorkingMemoryProps> = ({
  employeeId,
  memories,
  layerState,
  onMemorySelect,
  onMemoryTransfer,
  onMemoryDelete,
  onRefresh
}) => {
  const [selectedMemory, setSelectedMemory] = useState<EnhancedMemoryEntry | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'timeline' | 'metrics'>('list');
  const [sortBy, setSortBy] = useState<'recency' | 'importance' | 'activity'>('recency');

  // 计算工作记忆统计信息
  const stats = useMemo(() => {
    const activeMemories = memories.filter(m => m.state === 'active');
    const recentMemories = memories.filter(m => {
      const hoursSinceAccess = (Date.now() - (m.lastAccessedAt?.getTime() || m.createdAt.getTime())) / (1000 * 60 * 60);
      return hoursSinceAccess < 1;
    });

    return {
      total: memories.length,
      active: activeMemories.length,
      recent: recentMemories.length,
      averageAge: memories.length > 0
        ? memories.reduce((sum, m) => sum + (Date.now() - m.createdAt.getTime()), 0) / memories.length / (1000 * 60 * 60)
        : 0,
      capacityUsage: memories.length / layerState.capacity,
      avgImportance: memories.length > 0
        ? memories.reduce((sum, m) => sum + m.importance, 0) / memories.length
        : 0
    };
  }, [memories, layerState.capacity]);

  // 排序记忆
  const sortedMemories = useMemo(() => {
    return [...memories].sort((a, b) => {
      switch (sortBy) {
        case 'recency':
          const aTime = a.lastAccessedAt?.getTime() || a.createdAt.getTime();
          const bTime = b.lastAccessedAt?.getTime() || b.createdAt.getTime();
          return bTime - aTime;
        case 'importance':
          return b.importance - a.importance;
        case 'activity':
          return b.accessCount - a.accessCount;
        default:
          return 0;
      }
    });
  }, [memories, sortBy]);

  // 处理记忆选择
  const handleMemoryClick = (memory: EnhancedMemoryEntry) => {
    setSelectedMemory(memory);
    onMemorySelect?.(memory);
  };

  // 处理记忆转移
  const handleTransfer = (memory: EnhancedMemoryEntry, targetLayer: string) => {
    onMemoryTransfer?.(memory.id, targetLayer);
  };

  // 格式化时间显示
  const formatTimeAgo = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
    if (minutes < 60) return `${minutes}分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    return `${days}天前`;
  };

  // 获取记忆状态颜色
  const getMemoryStatusColor = (memory: EnhancedMemoryEntry) => {
    const age = (Date.now() - memory.createdAt.getTime()) / (1000 * 60 * 60);
    if (age < 0.5) return 'bg-green-100 text-green-800'; // 新鲜
    if (age < 2) return 'bg-blue-100 text-blue-800';     // 活跃
    if (age < 6) return 'bg-yellow-100 text-yellow-800';  // 老化
    return 'bg-red-100 text-red-800';                     // 过期
  };

  return (
    <div className="space-y-6">
      {/* 工作记忆概览 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-blue-500" />
              <h3 className="text-lg font-semibold">工作记忆</h3>
              <Badge variant="secondary">{stats.total}个记忆</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={onRefresh}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>刷新</span>
              </Button>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">活跃记忆</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
              <div className="text-sm text-gray-600">最近访问</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.averageAge.toFixed(1)}h</div>
              <div className="text-sm text-gray-600">平均年龄</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{(stats.avgImportance * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">平均重要性</div>
            </div>
          </div>

          {/* 容量使用率 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>容量使用率</span>
              <span>{(stats.capacityUsage * 100).toFixed(1)}%</span>
            </div>
            <Progress
              value={stats.capacityUsage * 100}
              className="h-2"
            />
            {stats.capacityUsage > 0.8 && (
              <div className="flex items-center space-x-2 text-sm text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span>工作记忆接近饱和，建议清理或转移部分记忆</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 视图控制 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            列表视图
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            时间轴
          </Button>
          <Button
            variant={viewMode === 'metrics' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('metrics')}
          >
            指标分析
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="recency">按时间排序</option>
            <option value="importance">按重要性排序</option>
            <option value="activity">按活跃度排序</option>
          </select>
        </div>
      </div>

      {/* 记忆列表 */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {sortedMemories.length > 0 ? (
            sortedMemories.map((memory) => (
              <Card
                key={memory.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedMemory?.id === memory.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleMemoryClick(memory)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 记忆标题和状态 */}
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getMemoryStatusColor(memory)}>
                          工作记忆
                        </Badge>
                        <Badge variant="secondary">
                          重要性: {(memory.importance * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(memory.lastAccessedAt || memory.createdAt)}
                        </span>
                      </div>

                      {/* 记忆内容预览 */}
                      <p className="text-gray-800 mb-2 line-clamp-2">
                        {memory.content}
                      </p>

                      {/* 记忆指标 */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>访问 {memory.accessCount} 次</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>置信度 {(memory.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span>稳定性 {(memory.stability * 100).toFixed(0)}%</span>
                        </div>
                      </div>

                      {/* 标签 */}
                      {memory.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {memory.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center space-x-1 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransfer(memory, 'episodic');
                        }}
                        title="转移到情景记忆"
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMemoryDelete?.(memory.id);
                        }}
                        title="删除记忆"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无工作记忆</p>
                <p className="text-sm text-gray-400 mt-1">
                  工作记忆会在对话和任务执行过程中自动产生
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 时间轴视图 */}
      {viewMode === 'timeline' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {sortedMemories.map((memory, index) => (
                <div key={memory.id} className="flex items-start space-x-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    {index < sortedMemories.length - 1 && (
                      <div className="w-px h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">
                        {formatTimeAgo(memory.createdAt)}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {memory.source}
                      </Badge>
                    </div>
                    <p className="text-gray-700 text-sm">{memory.content}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Progress
                        value={memory.importance * 100}
                        className="w-16 h-1"
                      />
                      <span className="text-xs text-gray-500">
                        重要性 {(memory.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 指标分析视图 */}
      {viewMode === 'metrics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">记忆来源分布</h4>
              <div className="space-y-3">
                {Object.entries(
                  memories.reduce((acc, m) => {
                    acc[m.source] = (acc[m.source] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <span className="text-sm">{source}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20">
                        <Progress value={(count / memories.length) * 100} className="h-2" />
                      </div>
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">记忆质量分布</h4>
              <div className="space-y-3">
                {[
                  { label: '高质量', range: [0.8, 1], color: 'bg-green-500' },
                  { label: '中等质量', range: [0.5, 0.8], color: 'bg-yellow-500' },
                  { label: '低质量', range: [0, 0.5], color: 'bg-red-500' }
                ].map(({ label, range, color }) => {
                  const count = memories.filter(m =>
                    m.confidence >= range[0] && m.confidence < range[1]
                  ).length;
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress
                            value={(count / memories.length) * 100}
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};