import React, { useState, useEffect } from 'react';
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
  Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

interface KnowledgeEvolutionTimelineProps {
  employeeId: string;
  events: KnowledgeEvolutionEvent[];
  onEventClick?: (event: KnowledgeEvolutionEvent) => void;
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
  onEventClick
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month' | 'quarter'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'timeline' | 'statistics' | 'insights'>('timeline');
  const [filteredEvents, setFilteredEvents] = useState<KnowledgeEvolutionEvent[]>(events);

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
    const IconComponent = config.icon;

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
            config.color,
            "text-white shadow-lg z-10"
          )}>
            <IconComponent className="w-5 h-5" />
          </div>

          {/* 事件卡片 */}
          <Card
            className={cn(
              "flex-1 cursor-pointer hover:shadow-md transition-all",
              config.bgColor
            )}
            onClick={() => onEventClick?.(event)}
          >
            <CardContent className="p-4">
              {/* 事件头部 */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge className={categoryConfig.color}>
                    {categoryConfig.label}
                  </Badge>
                  <Badge className={impactConfig.color}>
                    {impactConfig.label}影响
                  </Badge>
                </div>
                <span className="text-sm text-gray-500">
                  {event.timestamp.toLocaleString()}
                </span>
              </div>

              {/* 事件标题和描述 */}
              <h4 className={cn("font-semibold mb-1", config.textColor)}>
                {event.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {event.description}
              </p>

              {/* 指标展示 */}
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div className="text-center">
                  <div className="text-xs text-gray-500">知识增长</div>
                  <div className="font-medium">{event.metrics.knowledgeGain}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">置信度</div>
                  <div className="font-medium">{event.metrics.confidence}%</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-500">适用性</div>
                  <div className="font-medium">{event.metrics.applicability}%</div>
                </div>
              </div>

              {/* 相关概念标签 */}
              {event.relatedConcepts.length > 0 && (
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

              {/* 来源信息 */}
              <div className="text-xs text-gray-500">
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
              </TabsList>
            </Tabs>

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
    </div>
  );
};