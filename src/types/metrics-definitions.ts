// 标准化指标体系定义
// 基于PRD的L1/L2/L3三层指标架构

export interface MetricDefinition {
  id: string;
  name: string;
  description: string;
  unit: string;
  level: 'L1' | 'L2' | 'L3';
  category: string;
  calculation: string;
  dataSource: string;
  updateFrequency: string;
  targets?: {
    excellent: number;
    good: number;
    needsImprovement: number;
    poor: number;
  };
  dependencies?: string[];
}

export interface MetricValue {
  metricId: string;
  value: number;
  timestamp: Date;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'poor';
  metadata?: Record<string, any>;
}

// L1 核心业务指标
export const L1_BUSINESS_METRICS: MetricDefinition[] = [
  {
    id: 'analysis_insight_accuracy',
    name: '分析洞察准确性',
    description: '数据分析系统提供的洞察与实际业务情况吻合的准确程度',
    unit: '%',
    level: 'L1',
    category: 'business_insight',
    calculation: '(准确洞察数量 × 权重 + 部分准确洞察数量 × 0.6 + 有价值但不完全准确洞察数量 × 0.3) / 总洞察数量 × 100',
    dataSource: 'business_events',
    updateFrequency: '1h',
    targets: {
      excellent: 90,
      good: 75,
      needsImprovement: 60,
      poor: 0
    },
    dependencies: ['insight_validation', 'expert_feedback']
  },
  {
    id: 'business_decision_support',
    name: '业务决策支撑度',
    description: '分析结果对实际业务决策制定的支撑和指导价值',
    unit: '%',
    level: 'L1',
    category: 'business_impact',
    calculation: '(可执行建议数量 × 4.0 + 战略洞察数量 × 3.5 + 风险预警数量 × 3.0 + 趋势预测数量 × 2.5 + 描述性统计数量 × 1.0) / (总分析输出数量 × 4.0) × 100',
    dataSource: 'analysis_outputs',
    updateFrequency: '1h',
    targets: {
      excellent: 85,
      good: 70,
      needsImprovement: 55,
      poor: 0
    }
  },
  {
    id: 'cost_optimization_effectiveness',
    name: '成本优化效果',
    description: '通过数据分析识别和实现的成本优化成果',
    unit: '%',
    level: 'L1',
    category: 'cost_efficiency',
    calculation: '(实际节省成本 / 识别出的潜在节省成本) × (识别准确率) × 100',
    dataSource: 'cost_analytics',
    updateFrequency: '1d',
    targets: {
      excellent: 80,
      good: 60,
      needsImprovement: 40,
      poor: 0
    }
  },
  {
    id: 'issue_early_warning_effectiveness',
    name: '问题预警有效性',
    description: '系统提前识别和预警潜在问题的准确性和及时性',
    unit: '%',
    level: 'L1',
    category: 'risk_management',
    calculation: '(提前预警成功次数 × 预警提前时间权重 × 严重性权重) / 总预警次数',
    dataSource: 'alerts',
    updateFrequency: '15m',
    targets: {
      excellent: 90,
      good: 75,
      needsImprovement: 60,
      poor: 0
    }
  }
];

// L2 支撑分析指标
export const L2_SUPPORTING_METRICS: MetricDefinition[] = [
  {
    id: 'data_quality_index',
    name: '数据质量指数',
    description: '分析系统使用数据的完整性、准确性、一致性和时效性综合评估',
    unit: '%',
    level: 'L2',
    category: 'data_foundation',
    calculation: '数据完整性 × 0.3 + 数据准确性 × 0.3 + 数据一致性 × 0.2 + 数据时效性 × 0.2',
    dataSource: 'data_quality_checks',
    updateFrequency: '30m',
    targets: {
      excellent: 95,
      good: 85,
      needsImprovement: 70,
      poor: 0
    }
  },
  {
    id: 'analysis_coverage_breadth',
    name: '分析覆盖广度',
    description: '分析系统覆盖的业务领域、指标维度和分析深度的广泛程度',
    unit: '%',
    level: 'L2',
    category: 'capability_coverage',
    calculation: '(已覆盖业务域数 / 总业务域数 × 0.4 + 已覆盖指标数 / 目标指标总数 × 0.3 + 分析深度层级数 / 最大深度层级数 × 0.3) × 100',
    dataSource: 'coverage_metrics',
    updateFrequency: '1h',
    targets: {
      excellent: 85,
      good: 70,
      needsImprovement: 55,
      poor: 0
    }
  },
  {
    id: 'insight_discovery_depth',
    name: '洞察发现深度',
    description: '分析系统能够发现隐藏模式、关联关系和深层洞察的能力',
    unit: '%',
    level: 'L2',
    category: 'analytical_capability',
    calculation: '(深层关联发现数量 × 3.0 + 隐藏模式识别数量 × 2.5 + 异常检测准确数量 × 2.0 + 趋势识别数量 × 1.5 + 基础统计数量 × 1.0) / (总分析输出数量 × 3.0) × 100',
    dataSource: 'insight_analysis',
    updateFrequency: '1h',
    targets: {
      excellent: 75,
      good: 60,
      needsImprovement: 45,
      poor: 0
    }
  },
  {
    id: 'user_satisfaction_index',
    name: '用户满意度指数',
    description: '用户对分析结果和系统体验的综合满意度评价',
    unit: '分',
    level: 'L2',
    category: 'user_experience',
    calculation: '(功能满意度 × 0.3 + 性能满意度 × 0.25 + 准确性满意度 × 0.25 + 易用性满意度 × 0.2) × 10',
    dataSource: 'user_feedback',
    updateFrequency: '1d',
    targets: {
      excellent: 8.5,
      good: 7.5,
      needsImprovement: 6.0,
      poor: 0
    }
  }
];

// L3 技术监控指标
export const L3_TECHNICAL_METRICS: MetricDefinition[] = [
  {
    id: 'computing_performance_efficiency',
    name: '计算性能效率',
    description: '分析计算任务的执行效率和资源利用情况',
    unit: '%',
    level: 'L3',
    category: 'system_performance',
    calculation: '任务成功完成率 × 0.3 + 平均计算时间效率 × 0.25 + 资源利用率 × 0.25 + 并发处理能力 × 0.2',
    dataSource: 'performance_metrics',
    updateFrequency: '5m',
    targets: {
      excellent: 85,
      good: 70,
      needsImprovement: 55,
      poor: 0
    }
  },
  {
    id: 'data_processing_throughput',
    name: '数据处理吞吐量',
    description: '系统在单位时间内处理数据的能力和稳定性',
    unit: 'MB/s',
    level: 'L3',
    category: 'system_capacity',
    calculation: '处理的数据量(MB) / 处理时间(秒)',
    dataSource: 'throughput_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 50,
      good: 30,
      needsImprovement: 15,
      poor: 0
    }
  },
  {
    id: 'algorithm_stability_index',
    name: '算法稳定性指数',
    description: '分析算法在不同数据条件下的稳定性和鲁棒性',
    unit: '%',
    level: 'L3',
    category: 'algorithm_quality',
    calculation: '结果一致性 × 0.3 + 异常数据处理能力 × 0.25 + 边界条件处理能力 × 0.25 + 版本更新稳定性 × 0.2',
    dataSource: 'algorithm_metrics',
    updateFrequency: '1h',
    targets: {
      excellent: 90,
      good: 75,
      needsImprovement: 60,
      poor: 0
    }
  },
  {
    id: 'storage_query_optimization',
    name: '存储与查询优化度',
    description: '分析数据存储架构和查询性能的优化程度',
    unit: '%',
    level: 'L3',
    category: 'infrastructure_efficiency',
    calculation: '查询响应时间优化度 × 0.3 + 存储空间利用率 × 0.25 + 缓存命中率 × 0.25 + 索引效率 × 0.2',
    dataSource: 'storage_metrics',
    updateFrequency: '15m',
    targets: {
      excellent: 85,
      good: 70,
      needsImprovement: 55,
      poor: 0
    }
  },
  // 数字员工特定的技术指标
  {
    id: 'llm_call_success_rate',
    name: 'LLM调用成功率',
    description: 'LLM调用的成功率和稳定性',
    unit: '%',
    level: 'L3',
    category: 'llm_performance',
    calculation: '成功调用次数 / 总调用次数 × 100',
    dataSource: 'llm_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 99,
      good: 95,
      needsImprovement: 90,
      poor: 0
    }
  },
  {
    id: 'llm_response_latency',
    name: 'LLM响应延迟',
    description: 'LLM调用的平均响应时间',
    unit: 'ms',
    level: 'L3',
    category: 'llm_performance',
    calculation: '所有LLM调用响应时间的P95值',
    dataSource: 'llm_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 2000,
      good: 5000,
      needsImprovement: 10000,
      poor: Infinity
    }
  },
  {
    id: 'token_cost_efficiency',
    name: 'Token成本效率',
    description: '每单位业务价值的Token消耗成本',
    unit: '$/value',
    level: 'L3',
    category: 'cost_efficiency',
    calculation: '总Token成本 / 业务价值得分',
    dataSource: 'cost_metrics',
    updateFrequency: '15m',
    targets: {
      excellent: 0.1,
      good: 0.3,
      needsImprovement: 0.5,
      poor: Infinity
    }
  },
  {
    id: 'mcp_tool_success_rate',
    name: 'MCP工具调用成功率',
    description: 'MCP工具调用的成功率',
    unit: '%',
    level: 'L3',
    category: 'mcp_performance',
    calculation: '成功的工具调用次数 / 总工具调用次数 × 100',
    dataSource: 'mcp_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 98,
      good: 95,
      needsImprovement: 90,
      poor: 0
    }
  },
  {
    id: 'session_completion_rate',
    name: '会话完成率',
    description: '用户会话成功完成的比例',
    unit: '%',
    level: 'L3',
    category: 'user_journey',
    calculation: '成功完成的会话数 / 总会话数 × 100',
    dataSource: 'session_metrics',
    updateFrequency: '5m',
    targets: {
      excellent: 85,
      good: 75,
      needsImprovement: 65,
      poor: 0
    }
  }
];

// 所有指标的完整定义
export const ALL_METRICS: MetricDefinition[] = [
  ...L1_BUSINESS_METRICS,
  ...L2_SUPPORTING_METRICS,
  ...L3_TECHNICAL_METRICS
];

// 指标分类映射
export const METRIC_CATEGORIES = {
  business_insight: '业务洞察',
  business_impact: '业务影响',
  cost_efficiency: '成本效率',
  risk_management: '风险管理',
  data_foundation: '数据基础',
  capability_coverage: '能力覆盖',
  analytical_capability: '分析能力',
  user_experience: '用户体验',
  system_performance: '系统性能',
  system_capacity: '系统容量',
  algorithm_quality: '算法质量',
  infrastructure_efficiency: '基础设施效率',
  llm_performance: 'LLM性能',
  mcp_performance: 'MCP性能',
  user_journey: '用户旅程'
};

// 指标状态颜色配置
export const METRIC_STATUS_COLORS = {
  excellent: 'text-green-600 bg-green-100',
  good: 'text-blue-600 bg-blue-100',
  'needs-improvement': 'text-yellow-600 bg-yellow-100',
  poor: 'text-red-600 bg-red-100'
};

// 指标状态文本
export const METRIC_STATUS_LABELS = {
  excellent: '优秀',
  good: '良好',
  'needs-improvement': '需改进',
  poor: '差'
};

// 获取指标状态
export function getMetricStatus(metric: MetricDefinition, value: number): 'excellent' | 'good' | 'needs-improvement' | 'poor' {
  if (!metric.targets) return 'good';
  
  // 对于越小越好的指标（如延迟、成本）
  if (metric.id.includes('latency') || metric.id.includes('cost')) {
    if (value <= metric.targets.excellent) return 'excellent';
    if (value <= metric.targets.good) return 'good';
    if (value <= metric.targets.needsImprovement) return 'needs-improvement';
    return 'poor';
  }
  
  // 对于越大越好的指标（如成功率、准确率）
  if (value >= metric.targets.excellent) return 'excellent';
  if (value >= metric.targets.good) return 'good';
  if (value >= metric.targets.needsImprovement) return 'needs-improvement';
  return 'poor';
}

// 获取指标定义
export function getMetricDefinition(metricId: string): MetricDefinition | undefined {
  return ALL_METRICS.find(metric => metric.id === metricId);
}

// 根据级别获取指标
export function getMetricsByLevel(level: 'L1' | 'L2' | 'L3'): MetricDefinition[] {
  return ALL_METRICS.filter(metric => metric.level === level);
}

// 根据分类获取指标
export function getMetricsByCategory(category: string): MetricDefinition[] {
  return ALL_METRICS.filter(metric => metric.category === category);
}