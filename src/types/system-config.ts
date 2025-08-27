/**
 * A/B测试系统配置类型定义
 * AB Testing System Configuration
 */

// 系统配置开关
export interface ABTestSystemConfig {
  // 实验创建配置
  experimentCreation: {
    // 是否需要人工创建实验（关闭时AI可自行创建）
    requiresHumanCreation: boolean;
    // AI自动创建实验的权限级别
    aiCreationLevel: 'disabled' | 'low_risk_only' | 'full_access';
    // 自动实验的预算限制
    autoExperimentBudgetLimit: number;
    // 自动实验的最大并发数
    maxConcurrentAutoExperiments: number;
  };

  // 上线发布审核配置
  deploymentApproval: {
    // 是否需要人工审核上线发布
    requiresHumanApproval: boolean;
    // AI创建的实验是否需要更严格的审核
    stricterAiExperimentApproval: boolean;
    // 自动上线的条件阈值
    autoDeploymentThresholds: AutoDeploymentThresholds;
    // 审核超时时间（小时）
    approvalTimeoutHours: number;
    // 审核人员配置
    approvers: ApproverConfig[];
  };

  // 通知配置
  notifications: {
    // 启用通知渠道
    enabledChannels: ('email' | 'webhook' | 'in_app' | 'slack')[];
    // 决策推荐通知配置
    decisionNotification: {
      enabled: boolean;
      recipients: string[];
      threshold: number; // 置信度阈值，超过此值才通知
    };
    // 异常告警通知
    anomalyAlert: {
      enabled: boolean;
      severity: ('low' | 'medium' | 'high' | 'critical')[];
      recipients: string[];
    };
  };

  // 风险控制配置
  riskControl: {
    // 最大并发实验数
    maxConcurrentExperiments: number;
    // 单个实验最大预算
    maxExperimentBudget: number;
    // 自动熔断条件
    circuitBreaker: {
      enabled: boolean;
      errorRateThreshold: number; // 错误率阈值
      responseTimeThreshold: number; // 响应时间阈值（毫秒）
      consecutiveFailures: number; // 连续失败次数
    };
    // 实验流量上限
    maxExperimentTraffic: number; // 百分比
  };

  // 权限控制配置
  permissions: {
    // 实验管理权限
    experimentManagement: RolePermissions;
    // 数据查看权限
    dataAccess: RolePermissions;
    // 系统配置权限
    systemConfig: RolePermissions;
  };

  // 数据保留配置
  dataRetention: {
    // 实验数据保留期（天）
    experimentDataDays: number;
    // 归档数据保留期（天）
    archivedDataDays: number;
    // 自动清理配置
    autoCleanup: {
      enabled: boolean;
      scheduleType: 'daily' | 'weekly' | 'monthly';
      cleanupTime: string; // HH:MM格式
    };
  };
}

// 自动部署阈值配置
export interface AutoDeploymentThresholds {
  // 统计显著性阈值
  statisticalSignificance: {
    pValueThreshold: number;
    confidenceLevel: number; // 0.9, 0.95, 0.99等
  };
  
  // 实际意义阈值
  practicalSignificance: {
    minimumEffectSize: number;
    minimumSampleSize: number;
  };
  
  // 业务指标阈值
  businessMetrics: {
    minimumImprovement: number; // 最小改进百分比
    riskTolerance: number; // 风险容忍度
  };
  
  // 稳定性要求
  stability: {
    minimumRunDays: number; // 最小运行天数
    consecutiveWinningDays: number; // 连续获胜天数
    varianceThreshold: number; // 方差阈值
  };
}

// 审核人员配置
export interface ApproverConfig {
  userId: string;
  userName: string;
  role: 'primary' | 'secondary' | 'emergency';
  permissions: string[];
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    slack?: string;
  };
  // 审核权限范围
  scope: {
    maxBudget?: number; // 最大可审核预算
    allowedDepartments?: string[];
    experimentTypes?: ('human_created' | 'ai_created')[];
  };
}

// 角色权限配置
export interface RolePermissions {
  admin: Permission[];
  manager: Permission[];
  analyst: Permission[];
  viewer: Permission[];
}

export interface Permission {
  action: string;
  resource: string;
  conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  field: string;
  operator: 'equals' | 'in' | 'greater_than' | 'less_than';
  value: any;
}

// 实验状态流转配置
export interface ExperimentStatusFlow {
  // 状态转换规则
  transitions: StatusTransition[];
  // 自动状态转换配置
  autoTransitions: AutoTransition[];
  // 状态持久化配置
  persistence: {
    enableHistory: boolean;
    maxHistoryEntries: number;
  };
}

export interface StatusTransition {
  from: ExperimentStatus;
  to: ExperimentStatus;
  conditions: TransitionCondition[];
  requiredPermissions: string[];
  notifications: NotificationTrigger[];
}

export interface AutoTransition {
  from: ExperimentStatus;
  to: ExperimentStatus;
  trigger: 'time_based' | 'metric_based' | 'condition_based';
  configuration: TimeBasedConfig | MetricBasedConfig | ConditionBasedConfig;
}

export interface TransitionCondition {
  type: 'user_action' | 'system_check' | 'approval_required' | 'time_elapsed';
  configuration: Record<string, any>;
}

export interface NotificationTrigger {
  event: 'transition_start' | 'transition_complete' | 'transition_failed';
  channels: string[];
  recipients: string[];
  template: string;
}

// 实验状态枚举（完整版本）
export type ExperimentStatus = 
  | 'draft'              // 草稿
  | 'pending_experiment' // 待实验
  | 'experimenting'      // 实验中
  | 'experiment_ended'   // 已结束
  | 'deploying'         // 上线中
  | 'deployed'          // 已上线
  | 'offline'           // 已下线
  | 'archived';         // 归档

// 状态中文映射（更新版本）
export const AB_TEST_STATUS_LABELS: Record<ExperimentStatus, string> = {
  'draft': '草稿',
  'pending_experiment': '待实验',
  'experimenting': '实验中',
  'experiment_ended': '已结束',
  'deploying': '上线中',
  'deployed': '已上线',
  'offline': '已下线',
  'archived': '归档'
};

// 创建方式标签
export const CREATION_TYPE_LABELS = {
  'human_created': '人工创建',
  'ai_created': 'AI创建'
};

// 状态颜色配置
export const EXPERIMENT_STATUS_COLORS: Record<ExperimentStatus, string> = {
  'draft': 'text-gray-600 bg-gray-100',
  'pending_experiment': 'text-yellow-600 bg-yellow-100',
  'experimenting': 'text-blue-600 bg-blue-100',
  'experiment_ended': 'text-purple-600 bg-purple-100',
  'deploying': 'text-orange-600 bg-orange-100',
  'deployed': 'text-green-600 bg-green-100',
  'offline': 'text-red-600 bg-red-100',
  'archived': 'text-gray-500 bg-gray-50'
};

// 默认系统配置
export const DEFAULT_SYSTEM_CONFIG: ABTestSystemConfig = {
  experimentCreation: {
    requiresHumanCreation: true,
    aiCreationLevel: 'low_risk_only',
    autoExperimentBudgetLimit: 100,
    maxConcurrentAutoExperiments: 3
  },
  deploymentApproval: {
    requiresHumanApproval: true,
    stricterAiExperimentApproval: true,
    autoDeploymentThresholds: {
      statisticalSignificance: {
        pValueThreshold: 0.05,
        confidenceLevel: 0.95
      },
      practicalSignificance: {
        minimumEffectSize: 0.1,
        minimumSampleSize: 1000
      },
      businessMetrics: {
        minimumImprovement: 5, // 5%
        riskTolerance: 0.1
      },
      stability: {
        minimumRunDays: 7,
        consecutiveWinningDays: 3,
        varianceThreshold: 0.05
      }
    },
    approvalTimeoutHours: 72,
    approvers: []
  },
  notifications: {
    enabledChannels: ['in_app', 'email'],
    decisionNotification: {
      enabled: true,
      recipients: [],
      threshold: 0.95
    },
    anomalyAlert: {
      enabled: true,
      severity: ['high', 'critical'],
      recipients: []
    }
  },
  riskControl: {
    maxConcurrentExperiments: 10,
    maxExperimentBudget: 5000,
    circuitBreaker: {
      enabled: true,
      errorRateThreshold: 0.05,
      responseTimeThreshold: 5000,
      consecutiveFailures: 5
    },
    maxExperimentTraffic: 20
  },
  permissions: {
    experimentManagement: {
      admin: [
        { action: 'create', resource: 'experiment' },
        { action: 'update', resource: 'experiment' },
        { action: 'delete', resource: 'experiment' },
        { action: 'deploy', resource: 'experiment' }
      ],
      manager: [
        { action: 'create', resource: 'experiment' },
        { action: 'update', resource: 'experiment' },
        { action: 'view', resource: 'experiment' }
      ],
      analyst: [
        { action: 'view', resource: 'experiment' },
        { action: 'analyze', resource: 'experiment' }
      ],
      viewer: [
        { action: 'view', resource: 'experiment' }
      ]
    },
    dataAccess: {
      admin: [{ action: 'full_access', resource: 'data' }],
      manager: [{ action: 'department_access', resource: 'data' }],
      analyst: [{ action: 'read_access', resource: 'data' }],
      viewer: [{ action: 'limited_access', resource: 'data' }]
    },
    systemConfig: {
      admin: [{ action: 'full_access', resource: 'config' }],
      manager: [],
      analyst: [],
      viewer: []
    }
  },
  dataRetention: {
    experimentDataDays: 365,
    archivedDataDays: 1095, // 3年
    autoCleanup: {
      enabled: true,
      scheduleType: 'weekly',
      cleanupTime: '02:00'
    }
  }
};

// 自动转换配置类型
interface TimeBasedConfig {
  delayMinutes?: number;
  scheduleExpression?: string; // Cron表达式
}

interface MetricBasedConfig {
  metricId: string;
  threshold: number;
  operator: 'greater_than' | 'less_than' | 'equals';
  samplingWindow: number; // 采样窗口（分钟）
}

interface ConditionBasedConfig {
  conditions: TransitionCondition[];
  logicalOperator: 'AND' | 'OR';
}