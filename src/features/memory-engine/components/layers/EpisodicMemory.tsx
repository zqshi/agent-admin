/**
 * 情景记忆管理组件
 * 管理具象化事件序列、时间地点动作结果的完整情景
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  User,
  Target,
  Clock,
  Star,
  ArrowRight,
  Filter,
  Search,
  Eye,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerState } from '../../types';

interface EpisodicMemoryProps {
  employeeId: string;
  memories: EnhancedMemoryEntry[];
  layerState: MemoryLayerState;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onMemoryTransfer?: (memoryId: string, targetLayer: string) => void;
  onMemoryDelete?: (memoryId: string) => void;
}

interface EpisodicEvent {
  id: string;
  timestamp: Date;
  location?: string;
  participants: string[];
  actions: string[];
  outcomes: string[];
  context: string;
  importance: number;
  emotionalImpact: number;
  relatedMemories: string[];
}

export const EpisodicMemory: React.FC<EpisodicMemoryProps> = ({
  employeeId,
  memories,
  layerState,
  onMemorySelect,
  onMemoryTransfer,
  onMemoryDelete
}) => {
  const [selectedMemory, setSelectedMemory] = useState<EnhancedMemoryEntry | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'episodes' | 'analytics'>('timeline');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');
  const [searchQuery, setSearchQuery] = useState('');

  // 将记忆转换为情景事件
  const episodes = useMemo(() => {
    return memories.map(memory => ({
      id: memory.id,
      timestamp: memory.createdAt,
      location: memory.metadata?.location || '未知位置',
      participants: memory.metadata?.participants || ['数字员工'],
      actions: memory.metadata?.actions || [memory.content.split(' ').slice(0, 5).join(' ')],
      outcomes: memory.metadata?.outcomes || ['记忆形成'],
      context: memory.content,
      importance: memory.importance,
      emotionalImpact: memory.emotionalValence,
      relatedMemories: memory.contextIds || []
    } as EpisodicEvent));
  }, [memories]);

  // 过滤和排序情景
  const filteredEpisodes = useMemo(() => {
    let filtered = episodes;

    // 时间过滤
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (timeRange) {
        case 'day':
          cutoff.setDate(now.getDate() - 1);
          break;
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }
      filtered = filtered.filter(episode => episode.timestamp >= cutoff);
    }

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(episode =>
        episode.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        episode.participants.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [episodes, timeRange, searchQuery]);

  // 统计信息
  const stats = useMemo(() => {
    const totalEvents = filteredEpisodes.length;
    const highImpactEvents = filteredEpisodes.filter(e => e.importance > 0.7).length;
    const recentEvents = filteredEpisodes.filter(e => {
      const hoursSince = (Date.now() - e.timestamp.getTime()) / (1000 * 60 * 60);
      return hoursSince <= 24;
    }).length;

    const emotionalDistribution = {
      positive: filteredEpisodes.filter(e => e.emotionalImpact > 0.2).length,
      neutral: filteredEpisodes.filter(e => Math.abs(e.emotionalImpact) <= 0.2).length,
      negative: filteredEpisodes.filter(e => e.emotionalImpact < -0.2).length
    };

    return {
      total: totalEvents,
      highImpact: highImpactEvents,
      recent: recentEvents,
      avgImportance: totalEvents > 0
        ? filteredEpisodes.reduce((sum, e) => sum + e.importance, 0) / totalEvents
        : 0,
      emotional: emotionalDistribution
    };
  }, [filteredEpisodes]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmotionalColor = (impact: number) => {
    if (impact > 0.2) return 'text-green-600 bg-green-50';
    if (impact < -0.2) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImportanceColor = (importance: number) => {
    if (importance > 0.8) return 'bg-red-100 text-red-800';
    if (importance > 0.6) return 'bg-orange-100 text-orange-800';
    if (importance > 0.4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* 情景记忆概览 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-purple-500" />
              <h3 className="text-lg font-semibold">情景记忆</h3>
              <Badge variant="secondary">{stats.total}个情景</Badge>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">总情景数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.highImpact}</div>
              <div className="text-sm text-gray-600">高影响事件</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.recent}</div>
              <div className="text-sm text-gray-600">24小时内</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{(stats.avgImportance * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">平均重要性</div>
            </div>
          </div>

          {/* 情感分布 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">情感色彩分布</div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>积极 {stats.emotional.positive}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>中性 {stats.emotional.neutral}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>消极 {stats.emotional.negative}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            时间轴
          </Button>
          <Button
            variant={viewMode === 'episodes' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('episodes')}
          >
            情景列表
          </Button>
          <Button
            variant={viewMode === 'analytics' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('analytics')}
          >
            分析视图
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="搜索情景..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-48"
            />
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="day">今天</option>
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="all">全部</option>
          </select>
        </div>
      </div>

      {/* 时间轴视图 */}
      {viewMode === 'timeline' && (
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              {filteredEpisodes.map((episode, index) => (
                <div key={episode.id} className="flex items-start space-x-4 pb-8">
                  <div className="flex flex-col items-center">
                    <div className={`w-4 h-4 rounded-full ${getEmotionalColor(episode.emotionalImpact)} border-2 border-white shadow`}></div>
                    {index < filteredEpisodes.length - 1 && (
                      <div className="w-px h-20 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getImportanceColor(episode.importance)}>
                          重要性 {(episode.importance * 100).toFixed(0)}%
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {formatDateTime(episode.timestamp)}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <p className="text-gray-800">{episode.context}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">位置</div>
                            <div className="text-gray-600">{episode.location}</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <User className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">参与者</div>
                            <div className="text-gray-600">{episode.participants.join(', ')}</div>
                          </div>
                        </div>

                        <div className="flex items-start space-x-2">
                          <Target className="h-4 w-4 text-gray-400 mt-0.5" />
                          <div>
                            <div className="font-medium">结果</div>
                            <div className="text-gray-600">{episode.outcomes.join(', ')}</div>
                          </div>
                        </div>
                      </div>

                      {episode.actions.length > 0 && (
                        <div className="border-t pt-2">
                          <div className="font-medium text-sm mb-1">主要行为</div>
                          <div className="flex flex-wrap gap-1">
                            {episode.actions.map((action, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {action}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {episode.relatedMemories.length > 0 && (
                        <div className="border-t pt-2">
                          <div className="font-medium text-sm mb-1">关联记忆</div>
                          <div className="text-xs text-gray-500">
                            {episode.relatedMemories.length} 个相关记忆
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredEpisodes.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">暂无匹配的情景记忆</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 情景列表视图 */}
      {viewMode === 'episodes' && (
        <div className="space-y-4">
          {filteredEpisodes.map((episode) => (
            <Card key={episode.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {formatDateTime(episode.timestamp)}
                      </span>
                      <Badge className={getImportanceColor(episode.importance)}>
                        重要
                      </Badge>
                    </div>

                    <p className="text-gray-800 mb-3">{episode.context}</p>

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{episode.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{episode.participants.length} 参与者</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="h-3 w-3" />
                        <span>{episode.outcomes.length} 结果</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getEmotionalColor(episode.emotionalImpact)}`}></div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 分析视图 */}
      {viewMode === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">情景类型分布</h4>
              <div className="space-y-3">
                {['工作任务', '用户交互', '学习过程', '问题解决', '其他'].map((type) => {
                  const count = filteredEpisodes.filter(e =>
                    e.context.includes(type) ||
                    e.actions.some(a => a.includes(type))
                  ).length;
                  const percentage = filteredEpisodes.length > 0 ? (count / filteredEpisodes.length) * 100 : 0;
                  return (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">时间分布</h4>
              <div className="space-y-3">
                {[
                  { label: '早晨 (6-12)', range: [6, 12] },
                  { label: '下午 (12-18)', range: [12, 18] },
                  { label: '晚上 (18-24)', range: [18, 24] },
                  { label: '深夜 (0-6)', range: [0, 6] }
                ].map(({ label, range }) => {
                  const count = filteredEpisodes.filter(e => {
                    const hour = e.timestamp.getHours();
                    return hour >= range[0] && hour < range[1];
                  }).length;
                  const percentage = filteredEpisodes.length > 0 ? (count / filteredEpisodes.length) * 100 : 0;
                  return (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress value={percentage} className="h-2" />
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