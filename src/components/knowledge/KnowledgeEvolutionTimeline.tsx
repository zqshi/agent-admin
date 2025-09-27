import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Brain,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Filter,
  Download,
  GitBranch,
  Clock,
  Sparkles,
  BookOpen,
  MessageSquare,
  Target,
  Lightbulb,
  Network,
  Zap,
  Link,
  ArrowRight,
  MemoryStick
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMemorySystem } from '../../features/memory-engine/hooks';
import type { EnhancedMemoryEntry } from '../../features/memory-engine/types';

export interface KnowledgeEvolutionEvent {
  id: string;
  timestamp: Date;
  type: 'learning' | 'interaction' | 'refinement' | 'synthesis' | 'milestone';
  category: 'knowledge' | 'skill' | 'experience' | 'insight';
  title: string;
  description: string;
  source: string;
  impact: 'low' | 'medium' | 'high';
  metrics: {
    knowledgeGain: number;
    confidence: number;
    applicability: number;
  };
  relatedConcepts: string[];
  tags: string[];
  evidences: Array<{
    type: 'document' | 'conversation' | 'feedback' | 'performance';
    reference: string;
    score: number;
  }>;
  // 记忆系统集成字段
  memoryAssociations?: {
    relatedMemories: string[]; // 关联的记忆ID列表
    memoryTransitions?: Array<{
      fromMemoryId: string;
      toMemoryId: string;
      transitionType: 'evolution' | 'consolidation' | 'synthesis' | 'refinement';
      confidence: number;
    }>;
    triggeredByMemory?: string; // 触发此演化的记忆ID
    generatedMemories?: string[]; // 此事件生成的新记忆ID列表
  };
  // 记忆影响分析
  memoryImpact?: {
    affectedLayers: ('working' | 'episodic' | 'semantic' | 'procedural' | 'emotional')[];
    memoryStrengthening: number; // 0-1, 对现有记忆的强化程度
    newMemoryGeneration: number; // 0-1, 新记忆生成的重要性
    crossLayerConnections: number; // 0-1, 跨层连接的建立程度
  };
}

interface KnowledgeEvolutionTimelineProps {
  employeeId: string;
  events: KnowledgeEvolutionEvent[];
  onEventClick?: (event: KnowledgeEvolutionEvent) => void;
  onMemoryNavigate?: (memoryId: string, memoryType: string) => void;
  showMemoryIntegration?: boolean; // 是否显示记忆系统集成功能
}

const EVENT_TYPE_CONFIG = {
  learning: {
    icon: BookOpen,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    label: '学习获取'
  },
  interaction: {
    icon: MessageSquare,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    label: '交互积累'
  },
  refinement: {
    icon: Target,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    label: '精化优化'
  },
  synthesis: {
    icon: Lightbulb,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    label: '综合创新'
  },
  milestone: {
    icon: Sparkles,
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    label: '重要里程碑'
  }
};

const CATEGORY_CONFIG = {
  knowledge: { label: '知识积累', color: 'bg-blue-100 text-blue-800' },
  skill: { label: '技能提升', color: 'bg-green-100 text-green-800' },
  experience: { label: '经验沉淀', color: 'bg-orange-100 text-orange-800' },
  insight: { label: '洞察生成', color: 'bg-purple-100 text-purple-800' }
};

const IMPACT_CONFIG = {
  low: { label: '轻微', color: 'bg-gray-100 text-gray-600', score: 1 },
  medium: { label: '中等', color: 'bg-blue-100 text-blue-600', score: 2 },
  high: { label: '重大', color: 'bg-red-100 text-red-600', score: 3 }
};

export const KnowledgeEvolutionTimeline: React.FC<KnowledgeEvolutionTimelineProps> = ({
  employeeId,
  events,
  onEventClick,
  onMemoryNavigate,
  showMemoryIntegration = true
}) => {
  // 记忆系统集成
  const {
    memorySystem,
    systemState,
    searchMemories,
    storeMemory
  } = useMemorySystem(employeeId);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'statistics' | 'insights' | 'memory-correlation'>('timeline');
  const [filteredEvents, setFilteredEvents] = useState<KnowledgeEvolutionEvent[]>(events);
  const [showMemoryConnections, setShowMemoryConnections] = useState(false);

  // 过滤事件
  useEffect(() => {
    let filtered = [...events];

    // 时间过滤
    if (selectedPeriod !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      switch (selectedPeriod) {
        case 'week':
          cutoff.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoff.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoff.setMonth(now.getMonth() - 3);
          break;
      }
      filtered = filtered.filter(event => event.timestamp >= cutoff);
    }

    // 类型过滤
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(event => selectedTypes.includes(event.type));
    }

    // 分类过滤
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => selectedCategories.includes(event.category));
    }

    // 按时间排序
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredEvents(filtered);
  }, [events, selectedPeriod, selectedTypes, selectedCategories]);

  // 统计分析
  const statistics = {
    totalEvents: filteredEvents.length,
    eventsByType: Object.keys(EVENT_TYPE_CONFIG).map(type => ({
      type,
      count: filteredEvents.filter(e => e.type === type).length,
      ...EVENT_TYPE_CONFIG[type as keyof typeof EVENT_TYPE_CONFIG]
    })),
    eventsByCategory: Object.keys(CATEGORY_CONFIG).map(category => ({
      category,
      count: filteredEvents.filter(e => e.category === category).length,
      ...CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG]
    })),
    impactDistribution: Object.keys(IMPACT_CONFIG).map(impact => ({
      impact,
      count: filteredEvents.filter(e => e.impact === impact).length,
      ...IMPACT_CONFIG[impact as keyof typeof IMPACT_CONFIG]
    })),
    averageMetrics: {
      knowledgeGain: filteredEvents.reduce((sum, e) => sum + e.metrics.knowledgeGain, 0) / Math.max(filteredEvents.length, 1),
      confidence: filteredEvents.reduce((sum, e) => sum + e.metrics.confidence, 0) / Math.max(filteredEvents.length, 1),
      applicability: filteredEvents.reduce((sum, e) => sum + e.metrics.applicability, 0) / Math.max(filteredEvents.length, 1)
    }
  };

  // 记忆关联分析
  const memoryCorrelationAnalysis = useMemo(() => {
    if (!showMemoryIntegration || !memorySystem) {
      return null;
    }

    const eventsWithMemories = filteredEvents.filter(e => e.memoryAssociations);
    const totalMemoryConnections = eventsWithMemories.reduce(
      (sum, e) => sum + (e.memoryAssociations?.relatedMemories?.length || 0),
      0
    );

    const memoryLayerImpact = {
      working: eventsWithMemories.filter(e =>
        e.memoryImpact?.affectedLayers?.includes('working')
      ).length,
      episodic: eventsWithMemories.filter(e =>
        e.memoryImpact?.affectedLayers?.includes('episodic')
      ).length,
      semantic: eventsWithMemories.filter(e =>
        e.memoryImpact?.affectedLayers?.includes('semantic')
      ).length,
      procedural: eventsWithMemories.filter(e =>
        e.memoryImpact?.affectedLayers?.includes('procedural')
      ).length,
      emotional: eventsWithMemories.filter(e =>
        e.memoryImpact?.affectedLayers?.includes('emotional')
      ).length
    };

    const memoryTransitions = eventsWithMemories
      .flatMap(e => e.memoryAssociations?.memoryTransitions || [])
      .reduce((acc, transition) => {
        acc[transition.transitionType] = (acc[transition.transitionType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      eventsWithMemories: eventsWithMemories.length,
      totalMemoryConnections,
      memoryLayerImpact,
      memoryTransitions,
      averageMemoryImpact: {
        strengthening: eventsWithMemories.reduce(
          (sum, e) => sum + (e.memoryImpact?.memoryStrengthening || 0),
          0
        ) / Math.max(eventsWithMemories.length, 1),
        newGeneration: eventsWithMemories.reduce(
          (sum, e) => sum + (e.memoryImpact?.newMemoryGeneration || 0),
          0
        ) / Math.max(eventsWithMemories.length, 1),
        crossLayerConnections: eventsWithMemories.reduce(
          (sum, e) => sum + (e.memoryImpact?.crossLayerConnections || 0),
          0
        ) / Math.max(eventsWithMemories.length, 1)
      }
    };
  }, [filteredEvents, memorySystem, showMemoryIntegration]);

  // 处理演化事件转换为记忆
  const handleEventToMemory = async (event: KnowledgeEvolutionEvent) => {
    try {
      const memoryEntry = {
        layer: 'episodic' as const,
        type: 'evolution_event',
        content: `能力演化事件: ${event.title} - ${event.description}`,
        contentType: 'structured' as const,
        metadata: {
          eventId: event.id,
          eventType: event.type,
          eventCategory: event.category,
          eventImpact: event.impact,
          eventMetrics: event.metrics,
          eventTimestamp: event.timestamp,
          relatedConcepts: event.relatedConcepts
        },
        confidence: event.metrics.confidence / 100,
        importance: event.impact === 'high' ? 0.9 : event.impact === 'medium' ? 0.7 : 0.5,
        clarity: 0.8,
        stability: 0.75,
        emotionalValence: 0,
        emotionalIntensity: event.impact === 'high' ? 0.7 : 0.3,
        emotionalTags: [],
        accessCount: 1,
        activationCount: 0,
        reinforcementCount: 0,
        decayRate: 0.02,
        associations: [],
        contextIds: [],
        derivedFrom: event.memoryAssociations?.relatedMemories || [],
        influences: [],
        source: 'evolution' as const,
        sourceDetails: {
          originalSource: 'knowledge_evolution',
          timestamp: new Date()
        },
        state: 'active' as const,
        tags: ['能力演化', event.type, event.category, ...event.tags],
        categories: ['演化事件', event.category],
        domainKnowledge: [event.source]
      };

      await storeMemory(memoryEntry);
      console.log(`演化事件 ${event.title} 已转换为情节记忆`);
    } catch (error) {
      console.error('演化事件转换失败:', error);
    }
  };

  const toggleFilter = (filterArray: string[], setFilter: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (filterArray.includes(value)) {
      setFilter(filterArray.filter(item => item !== value));
    } else {
      setFilter([...filterArray, value]);
    }
  };

  const TimelineEvent = ({ event, index }: { event: KnowledgeEvolutionEvent; index: number }) => {
    const config = EVENT_TYPE_CONFIG[event.type];
    const categoryConfig = CATEGORY_CONFIG[event.category];
    const impactConfig = IMPACT_CONFIG[event.impact];
    const IconComponent = config?.icon || BookOpen;

    return (
      <div className="relative">
        {/* 连接线 */}
        {index < filteredEvents.length - 1 && (
          <div className="absolute left-6 top-16 w-0.5 h-16 bg-gray-200" />
        )}

        {/* 事件内容 */}
        <div className="flex items-start space-x-4">
          {/* 时间轴节点 */}
          <div className={cn(
            "flex items-center justify-center w-12 h-12 rounded-full",
            config?.color || "bg-gray-500",
            "text-white shadow-lg z-10"
          )}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* 事件卡片 */}
          <Card
            className={cn(
              "flex-1 cursor-pointer hover:shadow-md transition-all",
              config?.bgColor || "bg-gray-50"
            )}
            onClick={() => onEventClick?.(event)}
          >
            <CardContent className="p-4">
              {/* 事件头部 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={categoryConfig?.color || "bg-gray-100 text-gray-600"}>
                    {categoryConfig?.label || "未分类"}
                  </Badge>
                  <Badge className={impactConfig?.color || "bg-gray-100 text-gray-600"}>
                    {impactConfig?.label || "未知"}影响
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {event.timestamp.toLocaleString()}
                </span>
              </div>

              {/* 事件标题和描述 */}
              <h4 className={cn("font-semibold mb-1", config?.textColor || "text-gray-800")}>
                {event.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {event.description}
              </p>

              {/* 指标展示 */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">知识增长</div>
                  <div className="font-medium">{event.metrics?.knowledgeGain || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">置信度</div>
                  <div className="font-medium">{event.metrics?.confidence || 0}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">适用性</div>
                  <div className="font-medium">{event.metrics?.applicability || 0}%</div>
                </div>
              </div>

              {/* 相关概念标签 */}
              {event.relatedConcepts && event.relatedConcepts.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {event.relatedConcepts.slice(0, 3).map(concept => (
                    <Badge key={concept} variant="secondary" className="text-xs">
                      {concept}
                    </Badge>
                  ))}
                  {event.relatedConcepts.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.relatedConcepts.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* 记忆关联信息 */}
              {showMemoryIntegration && event.memoryAssociations && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <MemoryStick className="h-3 w-3" />
                      记忆关联
                    </span>
                    {event.memoryAssociations.relatedMemories.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {event.memoryAssociations.relatedMemories.length} 个关联
                      </Badge>
                    )}
                  </div>

                  {/* 记忆影响指标 */}
                  {event.memoryImpact && (
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">记忆强化</div>
                        <div className="text-xs font-medium">
                          {Math.round(event.memoryImpact.memoryStrengthening * 100)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">新记忆生成</div>
                        <div className="text-xs font-medium">
                          {Math.round(event.memoryImpact.newMemoryGeneration * 100)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">跨层连接</div>
                        <div className="text-xs font-medium">
                          {Math.round(event.memoryImpact.crossLayerConnections * 100)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 影响的记忆层 */}
                  {event.memoryImpact?.affectedLayers && event.memoryImpact.affectedLayers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {event.memoryImpact.affectedLayers.map(layer => (
                        <Badge key={layer} variant="outline" className="text-xs">
                          {layer === 'working' ? '工作记忆' :
                           layer === 'episodic' ? '情节记忆' :
                           layer === 'semantic' ? '语义记忆' :
                           layer === 'procedural' ? '程序记忆' : '情感记忆'}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* 记忆转换信息 */}
                  {event.memoryAssociations.memoryTransitions && event.memoryAssociations.memoryTransitions.length > 0 && (
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">{event.memoryAssociations.memoryTransitions.length}</span>
                      个记忆转换事件
                    </div>
                  )}

                  {/* 操作按钮 */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      onClick={() => handleEventToMemory(event)}
                    >
                      <Brain className="h-3 w-3" />
                      转换为记忆
                    </button>

                    {event.memoryAssociations.relatedMemories.length > 0 && (
                      <button
                        className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                        onClick={() => setShowMemoryConnections(!showMemoryConnections)}
                      >
                        <Network className="h-3 w-3" />
                        查看关联
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 来源信息 */}
              <div className="text-xs text-gray-500 mt-2">
                来源: {event.source}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const StatisticsView = () => (
    <div className="space-y-6">
      {/* 总体统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{statistics.totalEvents}</div>
            <div className="text-sm text-gray-600">总事件数</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(statistics.averageMetrics.knowledgeGain)}%
            </div>
            <div className="text-sm text-gray-600">平均知识增长</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(statistics.averageMetrics.confidence)}%
            </div>
            <div className="text-sm text-gray-600">平均置信度</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(statistics.averageMetrics.applicability)}%
            </div>
            <div className="text-sm text-gray-600">平均适用性</div>
          </CardContent>
        </Card>
      </div>

      {/* 事件类型分布 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">事件类型分布</h3>
          <div className="space-y-3">
            {statistics.eventsByType.map(({ type, count, label, color }) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={cn("w-3 h-3 rounded-full", color)} />
                  <span>{label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-20">
                    <Progress
                      value={(count / Math.max(statistics.totalEvents, 1)) * 100}
                      className="h-2"
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 影响力分布 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">影响力分布</h3>
          <div className="grid grid-cols-3 gap-4">
            {statistics.impactDistribution.map(({ impact, count, label, color }) => (
              <div key={impact} className="text-center">
                <div className={cn("rounded-lg p-4", color.replace('text-', 'bg-').replace('600', '100'))}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm">{label}影响事件</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InsightsView = () => (
    <div className="space-y-6">
      {/* 学习趋势洞察 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            学习趋势洞察
          </h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">知识积累模式</h4>
              <p className="text-blue-700 text-sm">
                该数字员工展现出稳定的学习节奏，平均每周产生{' '}
                {Math.round(filteredEvents.length / Math.max(1, Math.ceil((Date.now() - Math.min(...filteredEvents.map(e => e.timestamp.getTime()))) / (7 * 24 * 60 * 60 * 1000))))}
                个学习事件，知识增长曲线呈现上升趋势。
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">交互质量评估</h4>
              <p className="text-green-700 text-sm">
                交互事件的平均置信度达到{Math.round(statistics.averageMetrics.confidence)}%，
                表明该数字员工在实际应用中表现稳定，用户反馈积极。
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">能力演化方向</h4>
              <p className="text-purple-700 text-sm">
                通过综合分析，该数字员工在{' '}
                {statistics.eventsByCategory.reduce((max, curr) =>
                  curr.count > max.count ? curr : max
                ).category === 'knowledge' ? '知识积累' :
                statistics.eventsByCategory.reduce((max, curr) =>
                  curr.count > max.count ? curr : max
                ).category === 'skill' ? '技能提升' :
                statistics.eventsByCategory.reduce((max, curr) =>
                  curr.count > max.count ? curr : max
                ).category === 'experience' ? '经验沉淀' : '洞察生成'}
                方面表现最为突出，建议继续强化该方向的培养。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 优化建议 */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            优化建议
          </h3>
          <div className="space-y-3">
            {statistics.averageMetrics.confidence < 70 && (
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-yellow-800">提升置信度</h4>
                  <p className="text-yellow-700 text-sm">
                    当前平均置信度为{Math.round(statistics.averageMetrics.confidence)}%，
                    建议增加相关领域的训练数据和案例学习。
                  </p>
                </div>
              </div>
            )}

            {statistics.eventsByType.find(t => t.type === 'synthesis')?.count || 0 < statistics.totalEvents * 0.1 && (
              <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <h4 className="font-medium text-blue-800">增强创新能力</h4>
                  <p className="text-blue-700 text-sm">
                    综合创新事件占比较低，建议设计更多跨领域的学习任务，
                    促进知识的融合与创新。
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <div>
                <h4 className="font-medium text-green-800">保持学习节奏</h4>
                <p className="text-green-700 text-sm">
                  当前学习节奏良好，建议保持定期的知识更新和能力评估，
                  确保持续的成长动力。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* 视图模式切换 */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
              <TabsList>
                <TabsTrigger value="timeline" className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>时间轴</span>
                </TabsTrigger>
                <TabsTrigger value="statistics" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>统计分析</span>
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>智能洞察</span>
                </TabsTrigger>
                {showMemoryIntegration && (
                  <TabsTrigger value="memory-correlation" className="flex items-center space-x-2">
                    <Network className="w-4 h-4" />
                    <span>记忆关联</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </Tabs>

            {/* 记忆系统状态指示器 */}
            {showMemoryIntegration && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MemoryStick className="w-4 h-4" />
                <span>记忆系统:</span>
                <div className={`w-2 h-2 rounded-full ${
                  systemState?.isHealthy ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span>{systemState?.isHealthy ? '正常' : '异常'}</span>
              </div>
            )}

            {/* 时间过滤 */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value="all">全部时间</option>
                <option value="week">最近一周</option>
                <option value="month">最近一月</option>
                <option value="quarter">最近三月</option>
              </select>
            </div>

            {/* 导出按钮 */}
            <Button variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1" />
              导出报告
            </Button>
          </div>

          {/* 过滤器 */}
          <div className="mt-4 pt-4 border-t space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">事件类型</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => (
                  <Button
                    key={type}
                    variant={selectedTypes.includes(type) ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => toggleFilter(selectedTypes, setSelectedTypes, type)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">能力分类</label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
                  <Button
                    key={category}
                    variant={selectedCategories.includes(category) ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => toggleFilter(selectedCategories, setSelectedCategories, category)}
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 主要内容区域 */}
      {viewMode === 'timeline' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-blue-500" />
                知识演化时间轴
              </h3>
              <Badge variant="secondary">
                {filteredEvents.length} 个事件
              </Badge>
            </div>

            {filteredEvents.length > 0 ? (
              <div className="space-y-6">
                {filteredEvents.map((event, index) => (
                  <TimelineEvent key={event.id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>暂无匹配的演化事件</p>
                <p className="text-sm">请调整过滤条件或等待更多数据</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {viewMode === 'statistics' && <StatisticsView />}
      {viewMode === 'insights' && <InsightsView />}
      {viewMode === 'memory-correlation' && showMemoryIntegration && <MemoryCorrelationView />}
    </div>
  );

  // 记忆关联视图
  function MemoryCorrelationView() {
    return (
      <div className="space-y-6">
        {memoryCorrelationAnalysis ? (
          <>
            {/* 记忆系统状态概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {memoryCorrelationAnalysis.eventsWithMemories}
                  </div>
                  <div className="text-sm text-gray-600">关联事件数</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {memoryCorrelationAnalysis.totalMemoryConnections}
                  </div>
                  <div className="text-sm text-gray-600">记忆连接数</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(memoryCorrelationAnalysis.averageMemoryImpact.strengthening * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">平均记忆强化</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {Math.round(memoryCorrelationAnalysis.averageMemoryImpact.crossLayerConnections * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">跨层连接度</div>
                </CardContent>
              </Card>
            </div>

            {/* 记忆层影响分布 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Network className="w-5 h-5 mr-2 text-purple-500" />
                  记忆层影响分布
                </h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.entries(memoryCorrelationAnalysis.memoryLayerImpact).map(([layer, count]) => (
                    <div key={layer} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">{count}</div>
                      <div className="text-xs text-gray-600">
                        {layer === 'working' ? '工作记忆' :
                         layer === 'episodic' ? '情节记忆' :
                         layer === 'semantic' ? '语义记忆' :
                         layer === 'procedural' ? '程序记忆' : '情感记忆'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 记忆转换模式 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <ArrowRight className="w-5 h-5 mr-2 text-blue-500" />
                  记忆转换模式
                </h3>
                <div className="space-y-3">
                  {Object.entries(memoryCorrelationAnalysis.memoryTransitions).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span className="font-medium">
                          {type === 'evolution' ? '演化转换' :
                           type === 'consolidation' ? '巩固转换' :
                           type === 'synthesis' ? '合成转换' : '精化转换'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress
                            value={(count / Math.max(Object.values(memoryCorrelationAnalysis.memoryTransitions).reduce((a, b) => a + b, 0), 1)) * 100}
                            className="h-2"
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 记忆影响分析 */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                  记忆影响分析
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">记忆强化效果</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Progress
                          value={memoryCorrelationAnalysis.averageMemoryImpact.strengthening * 100}
                          className="h-3"
                        />
                      </div>
                      <span className="text-green-700 font-medium">
                        {Math.round(memoryCorrelationAnalysis.averageMemoryImpact.strengthening * 100)}%
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-2">
                      能力演化事件对现有记忆的强化程度良好，有助于知识巩固
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">新记忆生成</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Progress
                          value={memoryCorrelationAnalysis.averageMemoryImpact.newGeneration * 100}
                          className="h-3"
                        />
                      </div>
                      <span className="text-blue-700 font-medium">
                        {Math.round(memoryCorrelationAnalysis.averageMemoryImpact.newGeneration * 100)}%
                      </span>
                    </div>
                    <p className="text-blue-700 text-sm mt-2">
                      演化过程中产生新记忆的活跃度，反映学习和创新能力
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">跨层连接建立</h4>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Progress
                          value={memoryCorrelationAnalysis.averageMemoryImpact.crossLayerConnections * 100}
                          className="h-3"
                        />
                      </div>
                      <span className="text-purple-700 font-medium">
                        {Math.round(memoryCorrelationAnalysis.averageMemoryImpact.crossLayerConnections * 100)}%
                      </span>
                    </div>
                    <p className="text-purple-700 text-sm mt-2">
                      不同记忆层之间建立连接的程度，体现知识整合能力
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Network className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>记忆系统未启用或无关联数据</p>
            <p className="text-sm">启用记忆系统集成以查看详细分析</p>
          </div>
        )}
      </div>
    );
  }
};