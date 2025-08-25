import { Session, ABTest, DashboardMetrics } from '../types';

export const mockDashboardMetrics: DashboardMetrics = {
  activeUsers: 1247,
  rpm: 85,
  totalSessions: 3456,
  successSessions: 3211,
  failedSessions: 245,
  avgResponseTime: 2.3,
  totalTokens: 4567890,
  tokenCostByModel: {
    'GPT-4': 23456,
    'Claude-3': 18234,
    'GPT-3.5': 5432
  }
};

export const mockSessions: Session[] = [
  {
    id: 'session_001',
    userId: 'emp_001',
    startTime: '2024-05-21T10:30:00Z',
    endTime: '2024-05-21T10:35:22Z',
    status: 'success',
    totalMessages: 6,
    llmCalls: 3,
    toolCalls: 2,
    tokens: 1245,
    responseTime: 2.1,
    messages: [
      {
        id: 'msg_001',
        role: 'user',
        content: '请帮我查询最近的销售数据',
        timestamp: '2024-05-21T10:30:00Z'
      },
      {
        id: 'msg_002',
        role: 'assistant',
        content: '好的，我来帮您查询最近的销售数据。让我调用数据分析工具来获取相关信息。',
        timestamp: '2024-05-21T10:30:05Z'
      }
    ],
    llmTrace: [
      {
        id: 'llm_001',
        sessionId: 'session_001',
        messageId: 'msg_002',
        model: 'GPT-4',
        prompt: '用户询问：请帮我查询最近的销售数据\\n\\n系统指令：作为销售助手，帮助用户分析销售数据...',
        response: '好的，我来帮您查询最近的销售数据。让我调用数据分析工具来获取相关信息。',
        tokens: 456,
        responseTime: 1.2,
        timestamp: '2024-05-21T10:30:02Z'
      }
    ],
    toolTrace: [
      {
        id: 'tool_001',
        sessionId: 'session_001',
        toolName: 'query_sales_data',
        parameters: { period: 'last_30_days', metrics: ['revenue', 'orders'] },
        result: { revenue: 125000, orders: 456 },
        status: 'success',
        responseTime: 0.8,
        timestamp: '2024-05-21T10:30:03Z'
      }
    ]
  },
  {
    id: 'session_002',
    userId: 'emp_002',
    startTime: '2024-05-21T11:15:00Z',
    endTime: '2024-05-21T11:16:30Z',
    status: 'failed',
    totalMessages: 2,
    llmCalls: 1,
    toolCalls: 1,
    tokens: 234,
    responseTime: 5.2,
    messages: [
      {
        id: 'msg_003',
        role: 'user',
        content: '帮我发送邮件给客户',
        timestamp: '2024-05-21T11:15:00Z'
      },
      {
        id: 'msg_004',
        role: 'assistant',
        content: '抱歉，邮件发送功能暂时不可用，请稍后再试。',
        timestamp: '2024-05-21T11:16:25Z'
      }
    ],
    llmTrace: [],
    toolTrace: [
      {
        id: 'tool_002',
        sessionId: 'session_002',
        toolName: 'send_email',
        parameters: { to: 'customer@example.com', subject: '测试邮件' },
        result: null,
        status: 'failed',
        responseTime: 5.0,
        timestamp: '2024-05-21T11:15:30Z',
        error: 'SMTP连接超时'
      }
    ]
  }
];

export const mockABTests: ABTest[] = [
  {
    id: 'test_001',
    name: 'GPT-4 vs Claude-3 客服对比',
    description: '测试不同模型在客服场景下的表现差异',
    status: 'running',
    startDate: '2024-05-15T00:00:00Z',
    config: {
      splittingStrategy: 'session',
      stratificationDimensions: ['user_type', 'query_complexity'],
      environmentControl: {
        fixedSeed: 12345,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'medium',
      budget: {
        maxTokens: 1000000,
        maxCost: 500,
        currentSpent: 234.56
      }
    },
    groups: [
      {
        id: 'group_a',
        name: '对照组 (GPT-4)',
        trafficRatio: 50,
        config: {
          model: 'GPT-4',
          prompt: '你是一个专业的客服助手...',
          tools: ['query_order', 'cancel_order', 'refund']
        }
      },
      {
        id: 'group_b',
        name: '实验组 (Claude-3)',
        trafficRatio: 50,
        config: {
          model: 'Claude-3',
          prompt: '你是一个专业的客服助手...',
          tools: ['query_order', 'cancel_order', 'refund']
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 92.3,
        userValueDensity: 0.85,
        retentionRate7d: 0.78,
        retentionRate30d: 0.65,
        userActivation: 0.82
      },
      supportMetrics: {
        effectiveInteractionDepth: 3.2,
        clarificationRequestRatio: 0.15,
        firstResponseHitRate: 0.87,
        timeToResolution: 120,
        knowledgeCoverage: 0.75
      },
      technicalMetrics: {
        totalSessions: 2456,
        successRate: 92.3,
        avgResponseTime: 2.1,
        p95ResponseTime: 4.5,
        avgTokenCost: 0.045,
        tokenCostPerSession: 0.12,
        retryRate: 0.08,
        earlyExitRate: 0.05,
        toolCallSuccessRate: 0.94,
        modelFailureRate: 0.02
      },
      satisfactionScore: 4.2
    }
  },
  {
    id: 'test_002',
    name: '提示词优化测试',
    description: '测试新的提示词模板对响应质量的影响',
    status: 'completed',
    startDate: '2024-05-01T00:00:00Z',
    endDate: '2024-05-14T23:59:59Z',
    winnerGroup: 'group_b',
    config: {
      splittingStrategy: 'user',
      stratificationDimensions: ['user_experience'],
      environmentControl: {
        fixedSeed: 54321,
        temperature: 0.8,
        consistentParams: true
      },
      complexityLevel: 'low',
      budget: {
        maxTokens: 500000,
        maxCost: 300,
        currentSpent: 289.43
      }
    },
    groups: [
      {
        id: 'group_a',
        name: '原版提示词',
        trafficRatio: 50,
        config: {
          model: 'GPT-4',
          prompt: '原始提示词内容...',
        }
      },
      {
        id: 'group_b',
        name: '优化提示词',
        trafficRatio: 50,
        config: {
          model: 'GPT-4',
          prompt: '优化后的提示词内容...',
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 94.7,
        userValueDensity: 0.91,
        retentionRate7d: 0.82,
        retentionRate30d: 0.71,
        userActivation: 0.87
      },
      supportMetrics: {
        effectiveInteractionDepth: 3.8,
        clarificationRequestRatio: 0.12,
        firstResponseHitRate: 0.91,
        timeToResolution: 95,
        knowledgeCoverage: 0.82
      },
      technicalMetrics: {
        totalSessions: 5678,
        successRate: 94.7,
        avgResponseTime: 1.8,
        p95ResponseTime: 3.2,
        avgTokenCost: 0.038,
        tokenCostPerSession: 0.095,
        retryRate: 0.06,
        earlyExitRate: 0.03,
        toolCallSuccessRate: 0.96,
        modelFailureRate: 0.015
      },
      satisfactionScore: 4.5
    }
  }
];