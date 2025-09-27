/**
 * 记忆分析 React Hook
 * 提供记忆系统的分析、洞察和优化建议
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  EnhancedMemoryEntry,
  MemoryLayerType,
  MemoryAnalytics,
  TransitionSuggestion
} from '../types';

interface UseMemoryAnalyticsOptions {
  autoAnalyze?: boolean;
  analysisInterval?: number;
  enablePrediction?: boolean;
  enableRecommendations?: boolean;
}

interface UseMemoryAnalyticsReturn {
  // 分析数据
  analytics: MemoryAnalytics | null;
  insights: MemoryInsight[];
  trends: MemoryTrend[];
  patterns: MemoryPattern[];
  predictions: MemoryPrediction[];
  recommendations: TransitionSuggestion[];

  // 状态
  isAnalyzing: boolean;
  lastAnalyzed: Date | null;
  error: string | null;

  // 操作
  generateAnalytics: (timeRange?: { start: Date; end: Date }) => Promise<MemoryAnalytics>;
  analyzeLayerHealth: (layer: MemoryLayerType) => LayerHealthAnalysis;
  predictMemoryGrowth: (days: number) => MemoryGrowthPrediction;
  generateOptimizationPlan: () => OptimizationPlan;

  // 实时指标
  getRealTimeMetrics: () => RealTimeMetrics;
  getPerformanceScore: () => number;
  getHealthScore: () => number;
}

interface MemoryInsight {
  id: string;
  type: 'positive' | 'warning' | 'critical' | 'info';
  category: 'performance' | 'quality' | 'growth' | 'efficiency' | 'health';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  recommendations: string[];
  affectedLayers: MemoryLayerType[];
  timestamp: Date;
}

interface MemoryTrend {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number; // 百分比变化
  period: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

interface MemoryPattern {
  id: string;
  type: 'temporal' | 'content' | 'behavioral' | 'association';
  pattern: string;
  frequency: number;
  confidence: number;
  examples: string[];
  impact: string;
}

interface MemoryPrediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

interface LayerHealthAnalysis {
  layer: MemoryLayerType;
  overallHealth: number;
  indicators: {
    capacity: number;
    quality: number;
    coherence: number;
    efficiency: number;
  };
  issues: string[];
  recommendations: string[];
}

interface MemoryGrowthPrediction {
  timeframe: number; // days
  predictions: {
    layer: MemoryLayerType;
    currentCount: number;
    predictedCount: number;
    growthRate: number;
    confidence: number;
  }[];
  totalGrowth: {
    current: number;
    predicted: number;
    growthRate: number;
  };
}

interface OptimizationPlan {
  priority: 'high' | 'medium' | 'low';
  estimatedImpact: number;
  estimatedEffort: number;
  tasks: {
    id: string;
    task: string;
    type: 'cleanup' | 'optimization' | 'restructure' | 'enhancement';
    priority: number;
    effort: number;
    impact: number;
    affectedLayers: MemoryLayerType[];
  }[];
  expectedOutcomes: string[];
}

interface RealTimeMetrics {
  memoryUtilization: number;
  systemLoad: number;
  retrievalLatency: number;
  storageEfficiency: number;
  associationDensity: number;
  qualityScore: number;
  timestamp: Date;
}

export const useMemoryAnalytics = (
  memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>,
  options: UseMemoryAnalyticsOptions = {}
): UseMemoryAnalyticsReturn => {

  const {
    autoAnalyze = true,
    analysisInterval = 60000, // 1分钟
    enablePrediction = true,
    enableRecommendations = true
  } = options;

  // 状态管理
  const [analytics, setAnalytics] = useState<MemoryAnalytics | null>(null);
  const [insights, setInsights] = useState<MemoryInsight[]>([]);
  const [trends, setTrends] = useState<MemoryTrend[]>([]);
  const [patterns, setPatterns] = useState<MemoryPattern[]>([]);
  const [predictions, setPredictions] = useState<MemoryPrediction[]>([]);
  const [recommendations, setRecommendations] = useState<TransitionSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 自动分析
  useEffect(() => {
    if (!autoAnalyze) return;

    const interval = setInterval(async () => {
      await runFullAnalysis();
    }, analysisInterval);

    return () => clearInterval(interval);
  }, [autoAnalyze, analysisInterval, memories]);

  // 初始分析
  useEffect(() => {
    runFullAnalysis();
  }, [memories]);

  // 运行完整分析
  const runFullAnalysis = useCallback(async () => {
    try {
      setIsAnalyzing(true);
      setError(null);

      // 生成基础分析
      const analyticsData = await generateAnalytics();

      // 生成洞察
      const newInsights = generateInsights(memories);
      setInsights(newInsights);

      // 分析趋势
      const newTrends = analyzeTrends(memories);
      setTrends(newTrends);

      // 发现模式
      const newPatterns = discoverPatterns(memories);
      setPatterns(newPatterns);

      // 生成预测
      if (enablePrediction) {
        const newPredictions = generatePredictions(memories);
        setPredictions(newPredictions);
      }

      // 生成建议
      if (enableRecommendations) {
        const newRecommendations = generateRecommendations(memories, newInsights);
        setRecommendations(newRecommendations);
      }

      setLastAnalyzed(new Date());

    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
    }
  }, [memories, enablePrediction, enableRecommendations]);

  // 生成分析报告
  const generateAnalytics = useCallback(async (
    timeRange?: { start: Date; end: Date }
  ): Promise<MemoryAnalytics> => {
    const allMemories = Object.values(memories).flat();
    const filteredMemories = timeRange
      ? allMemories.filter(m =>
          m.createdAt >= timeRange.start && m.createdAt <= timeRange.end
        )
      : allMemories;

    const analytics: MemoryAnalytics = {
      timeDistribution: analyzeTimeDistribution(filteredMemories),
      typeDistribution: analyzeTypeDistribution(filteredMemories),
      sourceDistribution: analyzeSourceDistribution(filteredMemories),
      associationPatterns: analyzeAssociationPatterns(filteredMemories),
      trends: analyzeTrends(memories),
      anomalies: detectAnomalies(filteredMemories),
      optimizationSuggestions: generateOptimizationSuggestions(filteredMemories),
      generatedAt: new Date(),
      reportPeriod: timeRange || {
        start: new Date(Math.min(...allMemories.map(m => m.createdAt.getTime()))),
        end: new Date()
      }
    };

    setAnalytics(analytics);
    return analytics;
  }, [memories]);

  // 分析层级健康度
  const analyzeLayerHealth = useCallback((layer: MemoryLayerType): LayerHealthAnalysis => {
    const layerMemories = memories[layer] || [];

    if (layerMemories.length === 0) {
      return {
        layer,
        overallHealth: 1,
        indicators: { capacity: 1, quality: 1, coherence: 1, efficiency: 1 },
        issues: [],
        recommendations: [`${getLayerName(layer)}暂无记忆数据`]
      };
    }

    const capacity = calculateCapacityHealth(layer, layerMemories.length);
    const quality = calculateAverageQuality(layerMemories);
    const coherence = calculateCoherence(layerMemories);
    const efficiency = calculateEfficiency(layerMemories);

    const overallHealth = (capacity + quality + coherence + efficiency) / 4;

    const issues = [];
    const recommendations = [];

    if (capacity < 0.3) {
      issues.push('容量使用率低');
      recommendations.push('增加记忆输入和积累');
    } else if (capacity > 0.9) {
      issues.push('容量接近饱和');
      recommendations.push('清理低质量记忆或扩容');
    }

    if (quality < 0.6) {
      issues.push('记忆质量偏低');
      recommendations.push('提高记忆准确性和重要性');
    }

    if (coherence < 0.5) {
      issues.push('记忆连贯性不足');
      recommendations.push('增强记忆间的关联性');
    }

    return {
      layer,
      overallHealth,
      indicators: { capacity, quality, coherence, efficiency },
      issues,
      recommendations
    };
  }, [memories]);

  // 预测记忆增长
  const predictMemoryGrowth = useCallback((days: number): MemoryGrowthPrediction => {
    const allMemories = Object.values(memories).flat();
    const currentDate = new Date();
    const pastDate = new Date(currentDate.getTime() - days * 24 * 60 * 60 * 1000);

    const recentMemories = allMemories.filter(m => m.createdAt >= pastDate);
    const dailyGrowthRate = recentMemories.length / days;

    const predictions = (Object.keys(memories) as MemoryLayerType[]).map(layer => {
      const layerMemories = memories[layer];
      const recentLayerMemories = layerMemories.filter(m => m.createdAt >= pastDate);
      const layerGrowthRate = recentLayerMemories.length / days;

      return {
        layer,
        currentCount: layerMemories.length,
        predictedCount: Math.round(layerMemories.length + layerGrowthRate * days),
        growthRate: layerGrowthRate,
        confidence: Math.min(recentLayerMemories.length / 10, 1) // 基于数据量的置信度
      };
    });

    return {
      timeframe: days,
      predictions,
      totalGrowth: {
        current: allMemories.length,
        predicted: Math.round(allMemories.length + dailyGrowthRate * days),
        growthRate: dailyGrowthRate
      }
    };
  }, [memories]);

  // 生成优化计划
  const generateOptimizationPlan = useCallback((): OptimizationPlan => {
    const allMemories = Object.values(memories).flat();

    const tasks = [];
    let totalImpact = 0;
    let totalEffort = 0;

    // 检测需要清理的低质量记忆
    const lowQualityMemories = allMemories.filter(m => m.confidence < 0.3);
    if (lowQualityMemories.length > 0) {
      tasks.push({
        id: 'cleanup_low_quality',
        task: `清理${lowQualityMemories.length}个低质量记忆`,
        type: 'cleanup' as const,
        priority: 8,
        effort: lowQualityMemories.length * 0.1,
        impact: 6,
        affectedLayers: Array.from(new Set(lowQualityMemories.map(m => m.layer)))
      });
    }

    // 检测孤立记忆
    const isolatedMemories = allMemories.filter(m => m.associations.length === 0);
    if (isolatedMemories.length > allMemories.length * 0.3) {
      tasks.push({
        id: 'enhance_associations',
        task: '增强记忆关联性',
        type: 'enhancement' as const,
        priority: 7,
        effort: 5,
        impact: 8,
        affectedLayers: ['semantic', 'episodic']
      });
    }

    // 检测容量问题
    Object.entries(memories).forEach(([layer, layerMemories]) => {
      const capacity = getLayerCapacity(layer as MemoryLayerType);
      const utilization = layerMemories.length / capacity;

      if (utilization > 0.9) {
        tasks.push({
          id: `optimize_${layer}`,
          task: `优化${getLayerName(layer as MemoryLayerType)}存储`,
          type: 'optimization' as const,
          priority: 9,
          effort: 3,
          impact: 7,
          affectedLayers: [layer as MemoryLayerType]
        });
      }
    });

    // 计算总体优先级和影响
    tasks.forEach(task => {
      totalImpact += task.impact;
      totalEffort += task.effort;
    });

    const avgImpact = tasks.length > 0 ? totalImpact / tasks.length : 0;
    const priority = avgImpact > 7 ? 'high' : avgImpact > 5 ? 'medium' : 'low';

    return {
      priority,
      estimatedImpact: avgImpact,
      estimatedEffort: totalEffort,
      tasks: tasks.sort((a, b) => b.priority - a.priority),
      expectedOutcomes: [
        '提高记忆系统整体质量',
        '优化存储效率',
        '增强记忆关联性',
        '提升检索性能'
      ]
    };
  }, [memories]);

  // 获取实时指标
  const getRealTimeMetrics = useCallback((): RealTimeMetrics => {
    const allMemories = Object.values(memories).flat();

    return {
      memoryUtilization: calculateMemoryUtilization(memories),
      systemLoad: calculateSystemLoad(allMemories),
      retrievalLatency: 50 + Math.random() * 50, // 模拟延迟
      storageEfficiency: calculateStorageEfficiency(allMemories),
      associationDensity: calculateAssociationDensity(allMemories),
      qualityScore: calculateAverageQuality(allMemories),
      timestamp: new Date()
    };
  }, [memories]);

  // 获取性能分数
  const getPerformanceScore = useCallback((): number => {
    const metrics = getRealTimeMetrics();

    const score = (
      metrics.memoryUtilization * 0.2 +
      (1 - metrics.systemLoad) * 0.2 +
      (100 - metrics.retrievalLatency) / 100 * 0.2 +
      metrics.storageEfficiency * 0.2 +
      metrics.qualityScore * 0.2
    );

    return Math.max(0, Math.min(1, score));
  }, [getRealTimeMetrics]);

  // 获取健康分数
  const getHealthScore = useCallback((): number => {
    const layers: MemoryLayerType[] = ['working', 'episodic', 'semantic', 'procedural', 'emotional'];
    const healthScores = layers.map(layer => analyzeLayerHealth(layer).overallHealth);

    return healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
  }, [analyzeLayerHealth]);

  return {
    // 分析数据
    analytics,
    insights,
    trends,
    patterns,
    predictions,
    recommendations,

    // 状态
    isAnalyzing,
    lastAnalyzed,
    error,

    // 操作
    generateAnalytics,
    analyzeLayerHealth,
    predictMemoryGrowth,
    generateOptimizationPlan,

    // 实时指标
    getRealTimeMetrics,
    getPerformanceScore,
    getHealthScore
  };
};

// === 辅助分析函数 ===

function generateInsights(memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>): MemoryInsight[] {
  const insights: MemoryInsight[] = [];
  const allMemories = Object.values(memories).flat();

  // 检测质量问题
  const lowQualityCount = allMemories.filter(m => m.confidence < 0.5).length;
  const totalCount = allMemories.length;

  if (lowQualityCount > totalCount * 0.2) {
    insights.push({
      id: 'quality_warning',
      type: 'warning',
      category: 'quality',
      title: '记忆质量需要改善',
      description: `发现${lowQualityCount}个低质量记忆，占总数的${Math.round(lowQualityCount/totalCount*100)}%`,
      impact: 'medium',
      confidence: 0.8,
      recommendations: ['提高数据源质量', '增加验证机制', '定期清理低质量记忆'],
      affectedLayers: ['working', 'episodic'],
      timestamp: new Date()
    });
  }

  // 检测增长趋势
  const recentMemories = allMemories.filter(m =>
    Date.now() - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  );

  if (recentMemories.length > totalCount * 0.3) {
    insights.push({
      id: 'growth_positive',
      type: 'positive',
      category: 'growth',
      title: '记忆增长良好',
      description: `最近一周新增${recentMemories.length}个记忆，增长趋势积极`,
      impact: 'high',
      confidence: 0.9,
      recommendations: ['保持当前学习节奏', '关注质量控制'],
      affectedLayers: ['working', 'episodic', 'semantic'],
      timestamp: new Date()
    });
  }

  return insights;
}

function analyzeTrends(memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>): MemoryTrend[] {
  const allMemories = Object.values(memories).flat();
  const trends: MemoryTrend[] = [];

  // 分析每周记忆增长趋势
  const thisWeek = allMemories.filter(m =>
    Date.now() - m.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  const lastWeek = allMemories.filter(m => {
    const age = Date.now() - m.createdAt.getTime();
    return age >= 7 * 24 * 60 * 60 * 1000 && age < 14 * 24 * 60 * 60 * 1000;
  }).length;

  const growthRate = lastWeek > 0 ? (thisWeek - lastWeek) / lastWeek * 100 : 100;

  trends.push({
    metric: '记忆增长率',
    direction: growthRate > 5 ? 'up' : growthRate < -5 ? 'down' : 'stable',
    change: growthRate,
    period: '周',
    significance: Math.abs(growthRate) > 20 ? 'high' : Math.abs(growthRate) > 10 ? 'medium' : 'low',
    description: `相比上周${growthRate > 0 ? '增长' : '减少'}了${Math.abs(growthRate).toFixed(1)}%`
  });

  return trends;
}

function discoverPatterns(memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>): MemoryPattern[] {
  const patterns: MemoryPattern[] = [];
  const allMemories = Object.values(memories).flat();

  // 分析时间模式
  const hourCounts = Array(24).fill(0);
  allMemories.forEach(m => {
    const hour = m.createdAt.getHours();
    hourCounts[hour]++;
  });

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const peakCount = Math.max(...hourCounts);

  if (peakCount > allMemories.length * 0.2) {
    patterns.push({
      id: 'temporal_pattern',
      type: 'temporal',
      pattern: `${peakHour}:00时段记忆活跃`,
      frequency: peakCount,
      confidence: 0.7,
      examples: [`${peakHour}:00 - ${peakHour + 1}:00`],
      impact: '可用于优化系统资源分配'
    });
  }

  return patterns;
}

function generatePredictions(memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>): MemoryPrediction[] {
  const predictions: MemoryPrediction[] = [];
  const allMemories = Object.values(memories).flat();

  // 预测总记忆数量
  const currentCount = allMemories.length;
  const growthRate = 0.1; // 简化的增长率
  const predictedCount = Math.round(currentCount * (1 + growthRate));

  predictions.push({
    metric: '总记忆数量',
    currentValue: currentCount,
    predictedValue: predictedCount,
    timeframe: '下周',
    confidence: 0.7,
    factors: ['历史增长趋势', '系统活跃度', '用户交互频率']
  });

  return predictions;
}

function generateRecommendations(
  memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>,
  insights: MemoryInsight[]
): TransitionSuggestion[] {
  const recommendations: TransitionSuggestion[] = [];

  // 基于洞察生成建议
  insights.forEach(insight => {
    if (insight.type === 'warning' && insight.category === 'quality') {
      recommendations.push({
        id: 'improve_quality',
        confidence: 0.8,
        priority: 'high',
        suggestedTransition: 'quality_enhancement',
        targetMemories: [], // 应该包含实际的记忆ID
        reasoning: insight.description,
        expectedBenefits: insight.recommendations,
        potentialRisks: ['可能需要额外处理时间'],
        estimatedImpact: {
          memoryCount: 0,
          storageChange: 0,
          performanceChange: 0.2,
          qualityChange: 0.3
        },
        generatedAt: new Date(),
        generatedBy: 'analytics_engine',
        appliedCount: 0,
        successRate: 0.85
      });
    }
  });

  return recommendations;
}

// 其他辅助函数...
function analyzeTimeDistribution(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function analyzeTypeDistribution(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function analyzeSourceDistribution(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function analyzeAssociationPatterns(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function detectAnomalies(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function generateOptimizationSuggestions(memories: EnhancedMemoryEntry[]) {
  return []; // 简化实现
}

function getLayerName(layer: MemoryLayerType): string {
  const names = {
    working: '工作记忆',
    episodic: '情景记忆',
    semantic: '语义记忆',
    procedural: '程序记忆',
    emotional: '情感记忆'
  };
  return names[layer];
}

function getLayerCapacity(layer: MemoryLayerType): number {
  const capacities = {
    working: 100,
    episodic: 1000,
    semantic: 10000,
    procedural: 5000,
    emotional: 2000
  };
  return capacities[layer];
}

function calculateCapacityHealth(layer: MemoryLayerType, count: number): number {
  const capacity = getLayerCapacity(layer);
  const utilization = count / capacity;

  // 理想利用率在30%-80%之间
  if (utilization >= 0.3 && utilization <= 0.8) return 1;
  if (utilization < 0.3) return utilization / 0.3;
  return Math.max(0, 1 - (utilization - 0.8) / 0.2);
}

function calculateAverageQuality(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 1;
  return memories.reduce((sum, m) => sum + m.confidence, 0) / memories.length;
}

function calculateCoherence(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 1;
  const connectedMemories = memories.filter(m => m.associations.length > 0);
  return connectedMemories.length / memories.length;
}

function calculateEfficiency(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 1;
  // 基于访问频率和重要性的效率计算
  const totalAccess = memories.reduce((sum, m) => sum + m.accessCount, 0);
  const avgAccess = totalAccess / memories.length;
  return Math.min(avgAccess / 10, 1); // 假设10次访问为满分
}

function calculateMemoryUtilization(memories: Record<MemoryLayerType, EnhancedMemoryEntry[]>): number {
  let totalUtilization = 0;
  let layerCount = 0;

  Object.entries(memories).forEach(([layer, layerMemories]) => {
    const capacity = getLayerCapacity(layer as MemoryLayerType);
    const utilization = layerMemories.length / capacity;
    totalUtilization += utilization;
    layerCount++;
  });

  return layerCount > 0 ? totalUtilization / layerCount : 0;
}

function calculateSystemLoad(memories: EnhancedMemoryEntry[]): number {
  // 基于记忆数量和访问频率的系统负载
  const totalAccess = memories.reduce((sum, m) => sum + m.accessCount, 0);
  const avgAccess = memories.length > 0 ? totalAccess / memories.length : 0;
  return Math.min(avgAccess / 50, 1); // 归一化到0-1
}

function calculateStorageEfficiency(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 1;

  // 基于记忆质量和重要性的存储效率
  const qualityScore = memories.reduce((sum, m) => sum + m.confidence * m.importance, 0) / memories.length;
  return qualityScore;
}

function calculateAssociationDensity(memories: EnhancedMemoryEntry[]): number {
  if (memories.length === 0) return 0;

  const totalAssociations = memories.reduce((sum, m) => sum + m.associations.length, 0);
  return totalAssociations / memories.length / 10; // 归一化，假设10个关联为满分
}