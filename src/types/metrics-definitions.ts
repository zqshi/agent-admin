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

// L1 核心业务指标 - "The What" - 是否创造了价值？
export const L1_BUSINESS_METRICS: MetricDefinition[] = [
  {
    id: 'task_success_rate',
    name: '任务成功率',
    description: '数字员工成功完成用户任务的比例，这是最重要的指标，直接回答了"数字员工是否解决了问题？"',
    unit: '%',
    level: 'L1',
    category: 'core_business',
    calculation: '(成功完成任务的会话数 / 总会话数) × 100',
    dataSource: 'session_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 85,
      good: 75,
      needsImprovement: 65,
      poor: 0
    },
    dependencies: ['session_completion', 'user_goals']
  },
  {
    id: 'user_satisfaction_csat',
    name: '用户满意度 (CSAT)',
    description: '用户对数字员工服务的主观满意度评价，衡量用户的主观感受和服务质量',
    unit: '%',
    level: 'L1',
    category: 'core_business',
    calculation: '(满意或好评的会话数 / 总收集反馈的会话数) × 100',
    dataSource: 'user_feedback',
    updateFrequency: '5m',
    targets: {
      excellent: 90,
      good: 80,
      needsImprovement: 70,
      poor: 0
    }
  },
  {
    id: 'conversion_rate',
    name: '转化率',
    description: '用户完成特定目标行为（如购买、注册、下载）的比例，对营销、销售类数字员工至关重要',
    unit: '%',
    level: 'L1',
    category: 'core_business',
    calculation: '(完成目标行为的会话数 / 总会话数) × 100',
    dataSource: 'conversion_events',
    updateFrequency: '5m',
    targets: {
      excellent: 15,
      good: 10,
      needsImprovement: 5,
      poor: 0
    }
  },
  {
    id: 'self_service_rate',
    name: '自助服务率',
    description: '数字员工独立完成服务的比例，衡量其消化流量、降低人工成本的能力',
    unit: '%',
    level: 'L1',
    category: 'core_business',
    calculation: '(由数字员工独立完成服务的会话数 / 总会话数) × 100',
    dataSource: 'service_metrics',
    updateFrequency: '5m',
    targets: {
      excellent: 80,
      good: 70,
      needsImprovement: 60,
      poor: 0
    }
  }
];

// L2 对话与体验指标 - "The How" - 体验是否高效顺畅？
export const L2_CONVERSATION_METRICS: MetricDefinition[] = [
  {
    id: 'avg_conversation_rounds',
    name: '平均会话轮数',
    description: '每个会话的平均对话轮数，衡量效率。轮数过多可能意味着理解能力差，轮数过少可能意味着用户意图被过早切断',
    unit: '轮',
    level: 'L2',
    category: 'conversation_efficiency',
    calculation: '总对话轮数 / 总会话数',
    dataSource: 'conversation_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 3.5,
      good: 5.0,
      needsImprovement: 7.0,
      poor: 99
    }
  },
  {
    id: 'first_round_hit_rate',
    name: '单轮命中率',
    description: '首轮即提供准确回答的会话比例，衡量精准度和理解能力，高命中率代表强大的首次交互解决能力',
    unit: '%',
    level: 'L2',
    category: 'conversation_efficiency',
    calculation: '(首轮即提供准确回答的会话数 / 总会话数) × 100',
    dataSource: 'conversation_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 70,
      good: 60,
      needsImprovement: 50,
      poor: 0
    }
  },
  {
    id: 'clarification_request_ratio',
    name: '澄清问题比率',
    description: '包含澄清提问的会话比例。比率过高说明理解能力不足，适中比率表明积极确认需求',
    unit: '%',
    level: 'L2',
    category: 'conversation_efficiency',
    calculation: '(包含澄清提问的会话数 / 总会话数) × 100',
    dataSource: 'conversation_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 15,
      good: 25,
      needsImprovement: 35,
      poor: 99
    }
  },
  {
    id: 'proactive_transfer_rate',
    name: '主动转移率',
    description: '数字员工主动建议转人工的会话比例，衡量对自身能力边界的认知。适度主动转移是良好的',
    unit: '%',
    level: 'L2',
    category: 'conversation_efficiency',
    calculation: '(数字员工主动建议转人工的会话数 / 总会话数) × 100',
    dataSource: 'transfer_metrics',
    updateFrequency: '5m',
    targets: {
      excellent: 8,
      good: 12,
      needsImprovement: 20,
      poor: 99
    }
  }
];

// L3 成本与性能指标 - "The Cost" - 付出的代价是多少？
export const L3_COST_PERFORMANCE_METRICS: MetricDefinition[] = [
  {
    id: 'avg_token_consumption',
    name: '平均Token消耗',
    description: 'LLM应用的核心成本指标，每次会话平均消耗的Token数量，直接转化为现金成本',
    unit: 'tokens',
    level: 'L3',
    category: 'cost_efficiency',
    calculation: '总消耗Token数 / 总会话数',
    dataSource: 'llm_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 2000,
      good: 3500,
      needsImprovement: 5000,
      poor: Infinity
    }
  },
  {
    id: 'cost_per_session',
    name: '每次会话成本',
    description: '综合成本视图，包含LLM调用成本、工具调用成本、基础设施成本等，用于计算数字员工的单位经济效益',
    unit: 'USD',
    level: 'L3',
    category: 'cost_efficiency',
    calculation: '总成本 / 总会话数',
    dataSource: 'cost_metrics',
    updateFrequency: '5m',
    targets: {
      excellent: 0.30,
      good: 0.50,
      needsImprovement: 0.80,
      poor: Infinity
    }
  },
  {
    id: 'avg_response_latency_p95',
    name: '平均响应延迟 (P95)',
    description: '从用户发送消息到收到完整回复的95分位数时间，衡量性能。延迟直接影响用户体验',
    unit: 'ms',
    level: 'L3',
    category: 'system_performance',
    calculation: '所有会话响应时间的P95值',
    dataSource: 'performance_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 3000,
      good: 5000,
      needsImprovement: 8000,
      poor: Infinity
    }
  },
  {
    id: 'tool_call_avg_latency',
    name: '工具调用耗时',
    description: '每次调用外部工具（通过MCP）的平均耗时，帮助定位性能瓶颈',
    unit: 'ms',
    level: 'L3',
    category: 'system_performance',
    calculation: '所有工具调用时间总和 / 工具调用总次数',
    dataSource: 'mcp_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 1000,
      good: 2000,
      needsImprovement: 4000,
      poor: Infinity
    }
  }
];

// L4 运维与安全指标 - "The Reliability" - 是否稳定可靠？
export const L4_OPERATIONS_SECURITY_METRICS: MetricDefinition[] = [
  {
    id: 'tool_call_success_rate',
    name: '工具调用成功率',
    description: '数字员工所依赖的外部服务的健康度，成功率低会直接导致任务失败',
    unit: '%',
    level: 'L3',
    category: 'system_reliability',
    calculation: '(工具调用成功的次数 / 工具调用总次数) × 100',
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
    id: 'error_exception_rate',
    name: '错误率 / 异常率',
    description: '综合稳定性指标，监控各种错误（LLM异常、程序bug、网络错误等）',
    unit: '%',
    level: 'L3',
    category: 'system_reliability',
    calculation: '(抛出错误的会话数 / 总会话数) × 100',
    dataSource: 'error_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 2,
      good: 5,
      needsImprovement: 10,
      poor: 100
    }
  },
  {
    id: 'sensitive_info_leakage_events',
    name: '敏感信息泄露事件',
    description: '最高优先级的安全指标，通过日志分析和关键字检测，确保数字员工不会意外泄露用户隐私或公司机密',
    unit: '次',
    level: 'L3',
    category: 'security_compliance',
    calculation: '统计期内发现的潜在泄露次数',
    dataSource: 'security_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 0,
      good: 0,
      needsImprovement: 1,
      poor: Infinity
    }
  },
  {
    id: 'harmful_content_generation_rate',
    name: '有害内容生成率',
    description: '生成有害或不合规内容的会话比例，衡量内容安全风险',
    unit: '%',
    level: 'L3',
    category: 'security_compliance',
    calculation: '(生成有害或不合规内容的会话数 / 总会话数) × 100',
    dataSource: 'content_safety_metrics',
    updateFrequency: '1m',
    targets: {
      excellent: 0.1,
      good: 0.5,
      needsImprovement: 1.0,
      poor: 100
    }
  }
];

// L3 技术监控指标 (保留原有内容)
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
  ...L2_CONVERSATION_METRICS,
  ...L3_COST_PERFORMANCE_METRICS,
  ...L4_OPERATIONS_SECURITY_METRICS,
  ...L3_TECHNICAL_METRICS
];

// 指标分类映射
export const METRIC_CATEGORIES = {
  // L1 核心业务指标分类
  core_business: '核心业务',
  
  // L2 对话与体验指标分类
  conversation_efficiency: '对话效率',
  
  // L3 成本与性能指标分类
  cost_efficiency: '成本效率',
  system_performance: '系统性能',
  
  // L4 运维与安全指标分类
  system_reliability: '系统可靠性',
  security_compliance: '安全合规',
  
  // 保留原有分类
  business_insight: '业务洞察',
  business_impact: '业务影响',
  risk_management: '风险管理',
  data_foundation: '数据基础',
  capability_coverage: '能力覆盖',
  analytical_capability: '分析能力',
  user_experience: '用户体验',
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