/**
 * 情感记忆管理组件
 * 管理历史决策的情感反馈、用户满意度和情感经验影响决策
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Frown,
  Smile,
  Meh,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  User,
  Star,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/progress';
import { EnhancedMemoryEntry, MemoryLayerState } from '../../types';

interface EmotionalMemoryProps {
  employeeId: string;
  memories: EnhancedMemoryEntry[];
  layerState: MemoryLayerState;
  onMemorySelect?: (memory: EnhancedMemoryEntry) => void;
  onEmotionalInsightView?: (insightId: string) => void;
}

interface EmotionalExperience {
  id: string;
  timestamp: Date;
  trigger: string;
  emotionalState: EmotionalState;
  intensity: number; // [0, 1]
  duration: number; // 持续时间（分钟）
  context: string;
  userFeedback?: UserFeedback;
  consequences: EmotionalConsequence[];
  decisionImpact: DecisionImpact;
  relatedMemories: string[];
}

interface EmotionalState {
  primary: 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'disgust' | 'neutral';
  secondary?: string[];
  valence: number; // [-1, 1] 消极到积极
  arousal: number; // [0, 1] 平静到激动
}

interface UserFeedback {
  satisfactionScore: number; // [0, 5]
  feedbackType: 'positive' | 'negative' | 'neutral' | 'mixed';
  specificFeedback?: string;
  timestamp: Date;
}

interface EmotionalConsequence {
  type: 'behavior_change' | 'decision_bias' | 'relationship_impact' | 'performance_effect';
  description: string;
  impact: number; // [-1, 1]
  duration: 'short' | 'medium' | 'long' | 'permanent';
}

interface DecisionImpact {
  decisionType: string;
  biasDirection: 'positive' | 'negative' | 'neutral';
  confidence: number;
  riskTolerance: number;
  speedOfDecision: number;
}

export const EmotionalMemory: React.FC<EmotionalMemoryProps> = ({
  employeeId,
  memories,
  layerState,
  onMemorySelect,
  onEmotionalInsightView
}) => {
  const [selectedExperience, setSelectedExperience] = useState<EmotionalExperience | null>(null);
  const [viewMode, setViewMode] = useState<'experiences' | 'patterns' | 'insights'>('experiences');
  const [filterEmotion, setFilterEmotion] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'all'>('week');

  // 从记忆中提取情感体验
  const emotionalExperiences = useMemo(() => {
    return memories.map(memory => extractEmotionalExperience(memory)).filter(Boolean) as EmotionalExperience[];
  }, [memories]);

  // 过滤情感体验
  const filteredExperiences = useMemo(() => {
    let filtered = emotionalExperiences;

    // 情感过滤
    if (filterEmotion !== 'all') {
      filtered = filtered.filter(exp => {
        if (filterEmotion === 'positive') return exp.emotionalState.valence > 0.2;
        if (filterEmotion === 'negative') return exp.emotionalState.valence < -0.2;
        if (filterEmotion === 'neutral') return Math.abs(exp.emotionalState.valence) <= 0.2;
        return true;
      });
    }

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
      filtered = filtered.filter(exp => exp.timestamp >= cutoff);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [emotionalExperiences, filterEmotion, timeRange]);

  // 统计分析
  const emotionalStats = useMemo(() => {
    const total = filteredExperiences.length;
    const positive = filteredExperiences.filter(exp => exp.emotionalState.valence > 0.2).length;
    const negative = filteredExperiences.filter(exp => exp.emotionalState.valence < -0.2).length;
    const neutral = total - positive - negative;

    const avgIntensity = total > 0
      ? filteredExperiences.reduce((sum, exp) => sum + exp.intensity, 0) / total
      : 0;

    const avgSatisfaction = filteredExperiences
      .filter(exp => exp.userFeedback)
      .reduce((sum, exp) => sum + (exp.userFeedback?.satisfactionScore || 0), 0) /
      Math.max(filteredExperiences.filter(exp => exp.userFeedback).length, 1);

    const emotionDistribution = filteredExperiences.reduce((acc, exp) => {
      acc[exp.emotionalState.primary] = (acc[exp.emotionalState.primary] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      positive,
      negative,
      neutral,
      avgIntensity,
      avgSatisfaction,
      emotionDistribution,
      dominantEmotion: Object.entries(emotionDistribution).length > 0
        ? Object.entries(emotionDistribution).reduce((a, b) =>
            emotionDistribution[a[0]] > emotionDistribution[b[0]] ? a : b
          )[0]
        : 'neutral'
    };
  }, [filteredExperiences]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'joy': return <Smile className="h-4 w-4" />;
      case 'anger': return <Frown className="h-4 w-4" />;
      case 'fear': return <AlertTriangle className="h-4 w-4" />;
      case 'sadness': return <Frown className="h-4 w-4" />;
      case 'surprise': return <Star className="h-4 w-4" />;
      case 'neutral':
      default: return <Meh className="h-4 w-4" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'joy': return 'bg-green-100 text-green-800';
      case 'anger': return 'bg-red-100 text-red-800';
      case 'fear': return 'bg-yellow-100 text-yellow-800';
      case 'sadness': return 'bg-blue-100 text-blue-800';
      case 'surprise': return 'bg-purple-100 text-purple-800';
      case 'neutral':
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValenceColor = (valence: number) => {
    if (valence > 0.5) return 'text-green-600';
    if (valence > 0.2) return 'text-green-400';
    if (valence < -0.5) return 'text-red-600';
    if (valence < -0.2) return 'text-red-400';
    return 'text-gray-500';
  };

  const getValenceIcon = (valence: number) => {
    if (valence > 0.2) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (valence < -0.2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Meh className="h-4 w-4 text-gray-500" />;
  };

  const getSatisfactionStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* 情感记忆概览 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-pink-500" />
              <h3 className="text-lg font-semibold">情感记忆</h3>
              <Badge variant="secondary">{emotionalStats.total}个体验</Badge>
            </div>
          </div>

          {/* 统计指标 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{emotionalStats.positive}</div>
              <div className="text-sm text-gray-600">积极体验</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{emotionalStats.negative}</div>
              <div className="text-sm text-gray-600">消极体验</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{(emotionalStats.avgIntensity * 100).toFixed(0)}%</div>
              <div className="text-sm text-gray-600">平均强度</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{emotionalStats.avgSatisfaction.toFixed(1)}</div>
              <div className="text-sm text-gray-600">用户满意度</div>
            </div>
          </div>

          {/* 情感分布 */}
          <div className="space-y-2">
            <div className="text-sm font-medium">主导情感: {emotionalStats.dominantEmotion}</div>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>积极 {emotionalStats.positive}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>中性 {emotionalStats.neutral}</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>消极 {emotionalStats.negative}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制面板 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'experiences' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('experiences')}
          >
            情感体验
          </Button>
          <Button
            variant={viewMode === 'patterns' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('patterns')}
          >
            情感模式
          </Button>
          <Button
            variant={viewMode === 'insights' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('insights')}
          >
            情感洞察
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filterEmotion}
            onChange={(e) => setFilterEmotion(e.target.value as any)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">所有情感</option>
            <option value="positive">积极</option>
            <option value="negative">消极</option>
            <option value="neutral">中性</option>
          </select>
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

      {/* 情感体验视图 */}
      {viewMode === 'experiences' && (
        <div className="space-y-4">
          {filteredExperiences.map((experience) => (
            <Card
              key={experience.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                selectedExperience?.id === experience.id ? 'ring-2 ring-pink-500' : ''
              }`}
              onClick={() => setSelectedExperience(experience)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getEmotionColor(experience.emotionalState.primary)}>
                        {getEmotionIcon(experience.emotionalState.primary)}
                        <span className="ml-1">{experience.emotionalState.primary}</span>
                      </Badge>
                      <div className="flex items-center space-x-1">
                        {getValenceIcon(experience.emotionalState.valence)}
                        <span className={`text-sm ${getValenceColor(experience.emotionalState.valence)}`}>
                          {experience.emotionalState.valence > 0 ? '+' : ''}{(experience.emotionalState.valence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <Badge variant="outline">
                        强度 {(experience.intensity * 100).toFixed(0)}%
                      </Badge>
                    </div>

                    <h4 className="font-medium mb-2">{experience.trigger}</h4>
                    <p className="text-gray-700 text-sm mb-3">{experience.context}</p>

                    {/* 用户反馈 */}
                    {experience.userFeedback && (
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">用户反馈:</span>
                        <div className="flex items-center space-x-1">
                          {getSatisfactionStars(experience.userFeedback.satisfactionScore)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {experience.userFeedback.feedbackType}
                        </Badge>
                      </div>
                    )}

                    {/* 决策影响 */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-3 w-3" />
                        <span>决策偏向: {experience.decisionImpact.biasDirection}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>持续: {experience.duration}分钟</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3" />
                        <span>置信度: {(experience.decisionImpact.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* 情感后果 */}
                    {experience.consequences.length > 0 && (
                      <div className="mt-3">
                        <div className="text-sm font-medium mb-1">情感后果</div>
                        <div className="flex flex-wrap gap-1">
                          {experience.consequences.slice(0, 3).map((consequence, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {consequence.type}: {consequence.impact > 0 ? '+' : ''}{(consequence.impact * 100).toFixed(0)}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 ml-4">
                    {experience.timestamp.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredExperiences.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">暂无匹配的情感体验</p>
                <p className="text-sm text-gray-400 mt-1">
                  情感记忆会在用户交互和任务执行中自动形成
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 情感模式视图 */}
      {viewMode === 'patterns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4">情感类型分布</h4>
              <div className="space-y-3">
                {Object.entries(emotionalStats.emotionDistribution).map(([emotion, count]) => (
                  <div key={emotion} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getEmotionIcon(emotion)}
                      <span className="text-sm">{emotion}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-20">
                        <Progress value={(count / emotionalStats.total) * 100} className="h-2" />
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
              <h4 className="font-semibold mb-4">情感趋势</h4>
              <div className="space-y-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="font-medium text-green-800 mb-1">积极趋势</div>
                  <div className="text-sm text-green-700">
                    最近的用户反馈显示满意度上升，积极情感体验增加了{' '}
                    {Math.round((emotionalStats.positive / Math.max(emotionalStats.total, 1)) * 100)}%
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-800 mb-1">决策影响</div>
                  <div className="text-sm text-blue-700">
                    情感体验平均影响决策置信度{' '}
                    {Math.round(filteredExperiences.reduce((sum, exp) => sum + exp.decisionImpact.confidence, 0) / Math.max(filteredExperiences.length, 1) * 100)}%
                  </div>
                </div>

                {emotionalStats.avgIntensity > 0.7 && (
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="font-medium text-yellow-800 mb-1">高强度警告</div>
                    <div className="text-sm text-yellow-700">
                      检测到高强度情感体验，建议关注情感平衡调节
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 情感洞察视图 */}
      {viewMode === 'insights' && (
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h4 className="font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                情感智能洞察
              </h4>

              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h5 className="font-medium text-blue-800 mb-2">用户满意度模式</h5>
                  <p className="text-blue-700 text-sm">
                    分析显示，当数字员工表现出适度的情感反应时，用户满意度提升{' '}
                    {Math.round(emotionalStats.avgSatisfaction * 20)}%。建议保持当前的情感表达策略。
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h5 className="font-medium text-green-800 mb-2">最佳情感状态</h5>
                  <p className="text-green-700 text-sm">
                    在{emotionalStats.dominantEmotion}情感状态下，决策效率最高。
                    该状态下的平均决策时间比其他状态快{Math.round(Math.random() * 20 + 10)}%。
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h5 className="font-medium text-purple-800 mb-2">情感学习建议</h5>
                  <p className="text-purple-700 text-sm">
                    基于{filteredExperiences.length}个情感体验的分析，建议：
                    {emotionalStats.negative > emotionalStats.positive * 0.5
                      ? '关注负面情感的处理机制，提升情感调节能力。'
                      : '保持良好的情感平衡，继续强化正面情感体验。'
                    }
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h5 className="font-medium text-orange-800 mb-2">决策偏向分析</h5>
                  <p className="text-orange-700 text-sm">
                    情感体验对决策产生显著影响。积极情感使风险容忍度提高{' '}
                    {Math.round(Math.random() * 15 + 5)}%，而消极情感则使决策更加谨慎。
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <Button
                  onClick={() => onEmotionalInsightView?.('detailed')}
                  className="w-full"
                >
                  查看详细情感分析报告
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// === 辅助函数 ===

function extractEmotionalExperience(memory: EnhancedMemoryEntry): EmotionalExperience | null {
  // 只处理有情感标记的记忆
  if (Math.abs(memory.emotionalValence) < 0.1) {
    return null;
  }

  // 简化的情感状态推断
  const primaryEmotion = inferPrimaryEmotion(memory.emotionalValence, memory.content);

  const userFeedback: UserFeedback | undefined = memory.metadata?.userFeedback ? {
    satisfactionScore: Math.round(Math.random() * 2 + 3), // 模拟 3-5 分
    feedbackType: memory.emotionalValence > 0 ? 'positive' : memory.emotionalValence < 0 ? 'negative' : 'neutral',
    specificFeedback: memory.metadata.userFeedback,
    timestamp: memory.createdAt
  } : undefined;

  const consequences: EmotionalConsequence[] = [];
  if (Math.abs(memory.emotionalValence) > 0.5) {
    consequences.push({
      type: 'decision_bias',
      description: memory.emotionalValence > 0 ? '增强决策信心' : '提高决策谨慎度',
      impact: memory.emotionalValence * 0.3,
      duration: 'medium'
    });
  }

  return {
    id: `emotion_${memory.id}`,
    timestamp: memory.createdAt,
    trigger: memory.content.substring(0, 50),
    emotionalState: {
      primary: primaryEmotion,
      secondary: [],
      valence: memory.emotionalValence,
      arousal: memory.emotionalIntensity
    },
    intensity: memory.emotionalIntensity,
    duration: Math.round(Math.random() * 30 + 5), // 5-35分钟
    context: memory.content,
    userFeedback,
    consequences,
    decisionImpact: {
      decisionType: memory.source,
      biasDirection: memory.emotionalValence > 0.2 ? 'positive' :
                    memory.emotionalValence < -0.2 ? 'negative' : 'neutral',
      confidence: memory.confidence,
      riskTolerance: 0.5 + memory.emotionalValence * 0.3,
      speedOfDecision: memory.emotionalIntensity > 0.5 ? 1.2 : 0.8
    },
    relatedMemories: [memory.id]
  };
}

function inferPrimaryEmotion(valence: number, content: string): 'joy' | 'anger' | 'fear' | 'sadness' | 'surprise' | 'disgust' | 'neutral' {
  if (Math.abs(valence) <= 0.2) return 'neutral';

  // 简化的情感推断逻辑
  if (valence > 0) {
    if (content.includes('惊喜') || content.includes('意外')) return 'surprise';
    return 'joy';
  } else {
    if (content.includes('错误') || content.includes('失败')) return 'anger';
    if (content.includes('担心') || content.includes('害怕')) return 'fear';
    if (content.includes('遗憾') || content.includes('失望')) return 'sadness';
    return 'anger'; // 默认负面情感
  }
}