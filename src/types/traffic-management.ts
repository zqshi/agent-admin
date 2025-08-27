/**
 * 流量分层分桶机制类型定义
 * Traffic Layering and Bucketing System
 */

// 流量分层维度
export interface TrafficDimension {
  id: string;
  name: string;
  type: 'user_attribute' | 'context' | 'behavioral' | 'system';
  description: string;
  values: string[] | 'continuous' | 'boolean';
  priority: number; // 分层优先级，数字越小优先级越高
}

// 流量分桶规则
export interface TrafficBucket {
  id: string;
  name: string;
  description: string;
  size: number; // 桶大小百分比 (0-100)
  rules: BucketRule[];
  isDefault?: boolean; // 是否为默认桶
}

// 分桶规则
export interface BucketRule {
  dimensionId: string;
  operator: 'equals' | 'in' | 'range' | 'greater_than' | 'less_than' | 'contains';
  values: string[] | number | [number, number]; // 根据operator类型决定
  weight?: number; // 规则权重
}

// 流量层级配置
export interface TrafficLayer {
  id: string;
  name: string;
  description: string;
  priority: number;
  dimensions: TrafficDimension[];
  buckets: TrafficBucket[];
  isolationLevel: 'strict' | 'partial' | 'none'; // 层级隔离程度
}

// 流量分配策略
export interface TrafficAllocationStrategy {
  id: string;
  name: string;
  layers: TrafficLayer[];
  hashingAlgorithm: 'md5' | 'sha1' | 'murmur3' | 'xxhash';
  consistentHashing: boolean; // 是否使用一致性哈希
  fallbackStrategy: 'random' | 'default_bucket' | 'reject';
  
  // 流量调节配置
  flowControl: {
    enableRampUp: boolean; // 是否启用流量爬坡
    rampUpStrategy?: RampUpStrategy;
    maxFlowPercentage: number; // 最大流量百分比
    emergencyBrake: boolean; // 紧急熔断开关
  };
}

// 流量爬坡策略
export interface RampUpStrategy {
  type: 'linear' | 'exponential' | 'step' | 'custom';
  initialPercentage: number;
  targetPercentage: number;
  durationMinutes: number;
  steps?: RampUpStep[];
}

export interface RampUpStep {
  timeMinutes: number;
  percentage: number;
  condition?: 'auto' | 'manual' | 'metric_based';
  metricThreshold?: {
    metricId: string;
    operator: 'greater_than' | 'less_than';
    value: number;
  };
}

// 流量分配结果
export interface TrafficAllocationResult {
  userId: string;
  sessionId?: string;
  layerAllocations: LayerAllocation[];
  experimentGroup?: string;
  allocationTimestamp: Date;
  hashValue: string;
  metadata: Record<string, any>;
}

export interface LayerAllocation {
  layerId: string;
  bucketId: string;
  bucketName: string;
  confidence: number; // 分配置信度 0-1
  reasons: string[]; // 分配原因
}

// 流量监控指标
export interface TrafficMetrics {
  layerId: string;
  bucketId: string;
  totalUsers: number;
  currentUsers: number;
  allocationRate: number; // 实际分配率
  expectedRate: number; // 期望分配率
  deviation: number; // 偏差程度
  qualityScore: number; // 分配质量分数 0-1
  
  // 时间序列数据
  hourlyMetrics: HourlyTrafficMetric[];
  dailyMetrics: DailyTrafficMetric[];
}

export interface HourlyTrafficMetric {
  hour: string; // ISO datetime
  userCount: number;
  allocationRate: number;
  qualityScore: number;
}

export interface DailyTrafficMetric {
  date: string; // YYYY-MM-DD
  userCount: number;
  avgAllocationRate: number;
  avgQualityScore: number;
}

// 实验流量配置
export interface ExperimentTrafficConfig {
  experimentId: string;
  allocationStrategy: TrafficAllocationStrategy;
  targetLayers: string[]; // 目标流量层
  exclusionRules?: ExclusionRule[];
  
  // AA测试配置（流量分配验证）
  aaTestConfig?: {
    enabled: boolean;
    duration: number; // 小时
    expectedVariance: number; // 期望方差阈值
    alertThreshold: number; // 告警阈值
  };
}

// 排除规则
export interface ExclusionRule {
  id: string;
  name: string;
  description: string;
  conditions: BucketRule[];
  action: 'exclude' | 'force_control' | 'force_treatment';
  reason: string;
}

// 流量分配服务接口
export interface TrafficAllocationService {
  // 分配用户到实验组
  allocateTraffic(
    userId: string, 
    experimentId: string, 
    context?: Record<string, any>
  ): Promise<TrafficAllocationResult>;
  
  // 验证分配结果
  validateAllocation(
    result: TrafficAllocationResult
  ): Promise<{ isValid: boolean; issues: string[] }>;
  
  // 获取流量指标
  getTrafficMetrics(
    layerId: string, 
    timeRange: [Date, Date]
  ): Promise<TrafficMetrics>;
  
  // 紧急调整流量
  emergencyAdjustTraffic(
    experimentId: string, 
    adjustments: TrafficAdjustment[]
  ): Promise<void>;
}

export interface TrafficAdjustment {
  layerId: string;
  bucketId: string;
  newPercentage: number;
  reason: string;
  operator: string;
}

// 预定义常用维度
export const COMMON_TRAFFIC_DIMENSIONS: TrafficDimension[] = [
  {
    id: 'user_segment',
    name: '用户分群',
    type: 'user_attribute',
    description: '基于用户行为的分群标签',
    values: ['new_user', 'active_user', 'power_user', 'churning_user'],
    priority: 1
  },
  {
    id: 'device_type',
    name: '设备类型',
    type: 'context',
    description: '用户使用的设备类型',
    values: ['desktop', 'mobile', 'tablet'],
    priority: 2
  },
  {
    id: 'time_of_day',
    name: '时间段',
    type: 'context', 
    description: '用户访问的时间段',
    values: ['morning', 'afternoon', 'evening', 'night'],
    priority: 3
  },
  {
    id: 'geographic_region',
    name: '地理区域',
    type: 'context',
    description: '用户所在的地理区域',
    values: ['north', 'south', 'east', 'west', 'central'],
    priority: 4
  },
  {
    id: 'user_tier',
    name: '用户等级',
    type: 'user_attribute',
    description: '用户的付费等级或价值等级',
    values: ['free', 'basic', 'premium', 'enterprise'],
    priority: 1
  },
  {
    id: 'session_length',
    name: '会话长度',
    type: 'behavioral',
    description: '用户会话持续时间分类',
    values: 'continuous', // 连续值，需要设置范围
    priority: 5
  }
];

// 默认流量分配策略
export const DEFAULT_TRAFFIC_STRATEGY: Partial<TrafficAllocationStrategy> = {
  hashingAlgorithm: 'murmur3',
  consistentHashing: true,
  fallbackStrategy: 'default_bucket',
  flowControl: {
    enableRampUp: false,
    maxFlowPercentage: 100,
    emergencyBrake: true
  }
};