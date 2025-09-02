import { Session, ABTest, DashboardMetrics, ReasoningStep } from '../types';

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
      },
      {
        id: 'msg_003',
        role: 'user',
        content: '需要包含哪些指标？',
        timestamp: '2024-05-21T10:32:00Z'
      },
      {
        id: 'msg_004',
        role: 'assistant',
        content: '根据查询结果，最近30天的销售数据如下：总收入125,000元，订单数456个。建议关注转化率和客单价趋势。',
        timestamp: '2024-05-21T10:32:15Z'
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
      },
      {
        id: 'tool_002',
        sessionId: 'session_001',
        toolName: 'calculate_metrics',
        parameters: { revenue: 125000, orders: 456 },
        result: { avgOrderValue: 274.12, conversionRate: 0.032 },
        status: 'success',
        responseTime: 0.3,
        timestamp: '2024-05-21T10:32:10Z'
      }
    ],
    reasoningSteps: [
      {
        id: 'step_001_1',
        step: 1,
        type: 'thinking',
        title: '理解用户需求',
        content: '用户询问最近的销售数据。我需要：\n1. 确定查询的时间范围（默认最近30天）\n2. 确定需要的指标（收入、订单数等）\n3. 调用相应的数据查询工具',
        status: 'completed',
        timestamp: '2024-05-21T10:30:01Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 156,
          completionTokens: 89,
          temperature: 0.7,
          responseTime: 450
        }
      },
      {
        id: 'step_001_2',
        step: 2,
        type: 'tool_decision',
        title: '选择数据查询工具',
        content: '基于用户需求，我决定使用 query_sales_data 工具来获取销售数据。参数设置：\n- period: "last_30_days"\n- metrics: ["revenue", "orders"]\n\n这个工具可以提供准确的历史销售数据。',
        status: 'completed',
        timestamp: '2024-05-21T10:30:02Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 234,
          completionTokens: 67,
          temperature: 0.7,
          responseTime: 380
        }
      },
      {
        id: 'step_001_3',
        step: 3,
        type: 'tool_execution',
        title: '执行数据查询',
        content: '正在调用 query_sales_data 工具...\n\n工具调用成功！获得数据：\n- 总收入：125,000元\n- 订单数：456个\n\n数据看起来合理，准备进行进一步分析。',
        status: 'completed',
        timestamp: '2024-05-21T10:30:03Z',
        metadata: {
          toolName: 'query_sales_data',
          responseTime: 800,
          success: true
        }
      },
      {
        id: 'step_001_4',
        step: 4,
        type: 'thinking',
        title: '数据分析与洞察',
        content: '基于获取的数据进行分析：\n\n1. 收入表现：125,000元（30天）\n2. 订单量：456个\n3. 平均客单价：约274元\n\n用户可能还需要更详细的指标分析，我应该主动提供建议。',
        status: 'completed',
        timestamp: '2024-05-21T10:32:08Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 345,
          completionTokens: 123,
          temperature: 0.7,
          responseTime: 520
        }
      },
      {
        id: 'step_001_5',
        step: 5,
        type: 'tool_execution',
        title: '计算关键指标',
        content: '调用 calculate_metrics 工具计算关键业务指标...\n\n计算结果：\n- 平均客单价：274.12元\n- 转化率：3.2%\n\n这些指标将帮助用户更好地理解销售表现。',
        status: 'completed',
        timestamp: '2024-05-21T10:32:10Z',
        metadata: {
          toolName: 'calculate_metrics',
          responseTime: 300,
          success: true
        }
      },
      {
        id: 'step_001_6',
        step: 6,
        type: 'response_generation',
        title: '生成最终回复',
        content: '整合所有信息，生成对用户有价值的回复：\n\n1. 提供核心数据（收入、订单数）\n2. 计算并展示关键指标\n3. 给出业务建议\n\n确保回复简洁明了，同时包含actionable insights。',
        status: 'completed',
        timestamp: '2024-05-21T10:32:12Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 567,
          completionTokens: 156,
          temperature: 0.7,
          responseTime: 680
        }
      }
    ]
  },
  {
    id: 'session_002',
    userId: 'emp_002',
    startTime: '2024-05-21T11:15:00Z',
    endTime: '2024-05-21T11:16:30Z',
    status: 'failed',
    totalMessages: 4,
    llmCalls: 2,
    toolCalls: 2,
    tokens: 567,
    responseTime: 5.2,
    messages: [
      {
        id: 'msg_005',
        role: 'user',
        content: '帮我发送邮件给客户',
        timestamp: '2024-05-21T11:15:00Z'
      },
      {
        id: 'msg_006',
        role: 'assistant',
        content: '好的，我来帮您发送邮件。请问邮件的具体内容是什么？',
        timestamp: '2024-05-21T11:15:10Z'
      },
      {
        id: 'msg_007',
        role: 'user',
        content: '发送产品更新通知',
        timestamp: '2024-05-21T11:15:30Z'
      },
      {
        id: 'msg_008',
        role: 'assistant',
        content: '抱歉，邮件发送功能暂时不可用，请稍后再试。',
        timestamp: '2024-05-21T11:16:25Z'
      }
    ],
    llmTrace: [
      {
        id: 'llm_002',
        sessionId: 'session_002',
        messageId: 'msg_006',
        model: 'GPT-4',
        prompt: '用户请求发送邮件，需要获取更多信息...',
        response: '好的，我来帮您发送邮件。请问邮件的具体内容是什么？',
        tokens: 234,
        responseTime: 0.9,
        timestamp: '2024-05-21T11:15:05Z'
      }
    ],
    toolTrace: [
      {
        id: 'tool_003',
        sessionId: 'session_002',
        toolName: 'validate_email_template',
        parameters: { template: 'product_update', recipient: 'customer@example.com' },
        result: { valid: true, template_id: 'tpl_001' },
        status: 'success',
        responseTime: 0.5,
        timestamp: '2024-05-21T11:15:35Z'
      },
      {
        id: 'tool_004',
        sessionId: 'session_002',
        toolName: 'send_email',
        parameters: { to: 'customer@example.com', subject: '产品更新通知', template_id: 'tpl_001' },
        result: null,
        status: 'failed',
        responseTime: 5.0,
        timestamp: '2024-05-21T11:15:40Z',
        error: 'SMTP连接超时'
      }
    ],
    reasoningSteps: [
      {
        id: 'step_002_1',
        step: 1,
        type: 'thinking',
        title: '分析邮件发送请求',
        content: '用户请求发送邮件给客户。我需要：\n1. 了解邮件的具体内容和目的\n2. 确认收件人信息\n3. 选择合适的邮件模板\n4. 执行发送操作',
        status: 'completed',
        timestamp: '2024-05-21T11:15:02Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 123,
          completionTokens: 67,
          temperature: 0.7,
          responseTime: 420
        }
      },
      {
        id: 'step_002_2',
        step: 2,
        type: 'response_generation',
        title: '请求更多信息',
        content: '用户的请求比较模糊，我需要获取更多信息才能准确执行任务。我应该询问：\n- 邮件的具体内容\n- 收件人信息\n- 邮件类型（通知、营销、客服等）',
        status: 'completed',
        timestamp: '2024-05-21T11:15:05Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 234,
          completionTokens: 89,
          temperature: 0.7,
          responseTime: 480
        }
      },
      {
        id: 'step_002_3',
        step: 3,
        type: 'thinking',
        title: '处理用户补充信息',
        content: '用户提供了更多信息："发送产品更新通知"。现在我可以：\n1. 使用产品更新通知模板\n2. 验证模板的有效性\n3. 执行邮件发送',
        status: 'completed',
        timestamp: '2024-05-21T11:15:32Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 345,
          completionTokens: 78,
          temperature: 0.7,
          responseTime: 390
        }
      },
      {
        id: 'step_002_4',
        step: 4,
        type: 'tool_execution',
        title: '验证邮件模板',
        content: '调用 validate_email_template 工具验证产品更新通知模板...\n\n验证成功！\n- 模板有效\n- 模板ID: tpl_001\n- 收件人验证通过',
        status: 'completed',
        timestamp: '2024-05-21T11:15:35Z',
        metadata: {
          toolName: 'validate_email_template',
          responseTime: 500,
          success: true
        }
      },
      {
        id: 'step_002_5',
        step: 5,
        type: 'tool_execution',
        title: '发送邮件',
        content: '调用 send_email 工具发送邮件...\n\n❌ 发送失败！\n错误信息：SMTP连接超时\n\n可能的原因：\n1. 邮件服务器暂时不可用\n2. 网络连接问题\n3. 服务器配置问题',
        status: 'error',
        timestamp: '2024-05-21T11:15:40Z',
        metadata: {
          toolName: 'send_email',
          responseTime: 5000,
          success: false,
          error: 'SMTP连接超时'
        }
      },
      {
        id: 'step_002_6',
        step: 6,
        type: 'response_generation',
        title: '错误处理与用户反馈',
        content: '邮件发送失败，我需要：\n1. 向用户说明情况\n2. 提供可能的解决方案\n3. 建议稍后重试\n\n保持专业和有帮助的态度，不要让用户感到困扰。',
        status: 'completed',
        timestamp: '2024-05-21T11:16:20Z',
        metadata: {
          model: 'GPT-4',
          promptTokens: 456,
          completionTokens: 134,
          temperature: 0.7,
          responseTime: 550
        }
      }
    ]
  },
  {
    id: 'session_003',
    userId: 'emp_003',
    startTime: '2024-05-21T14:20:00Z',
    endTime: '2024-05-21T14:25:45Z',
    status: 'success',
    totalMessages: 8,
    llmCalls: 4,
    toolCalls: 3,
    tokens: 1890,
    responseTime: 3.2,
    messages: [
      {
        id: 'msg_009',
        role: 'user',
        content: '我需要生成一份销售报告',
        timestamp: '2024-05-21T14:20:00Z'
      },
      {
        id: 'msg_010',
        role: 'assistant',
        content: '好的，我来帮您生成销售报告。让我先获取相关数据。',
        timestamp: '2024-05-21T14:20:05Z'
      },
      {
        id: 'msg_011',
        role: 'user',
        content: '需要包含本月和上月的对比',
        timestamp: '2024-05-21T14:21:00Z'
      },
      {
        id: 'msg_012',
        role: 'assistant',
        content: '已为您生成包含本月和上月对比的销售报告，报告已保存到您的工作目录。',
        timestamp: '2024-05-21T14:25:30Z'
      }
    ],
    llmTrace: [
      {
        id: 'llm_003',
        sessionId: 'session_003',
        messageId: 'msg_010',
        model: 'Claude-3',
        prompt: '用户需要生成销售报告，开始数据收集流程...',
        response: '好的，我来帮您生成销售报告。让我先获取相关数据。',
        tokens: 345,
        responseTime: 1.1,
        timestamp: '2024-05-21T14:20:02Z'
      }
    ],
    toolTrace: [
      {
        id: 'tool_005',
        sessionId: 'session_003',
        toolName: 'query_sales_data',
        parameters: { period: 'current_month' },
        result: { revenue: 89000, orders: 312, customers: 156 },
        status: 'success',
        responseTime: 1.2,
        timestamp: '2024-05-21T14:20:10Z'
      },
      {
        id: 'tool_006',
        sessionId: 'session_003',
        toolName: 'query_sales_data',
        parameters: { period: 'previous_month' },
        result: { revenue: 76000, orders: 289, customers: 142 },
        status: 'success',
        responseTime: 1.0,
        timestamp: '2024-05-21T14:21:15Z'
      },
      {
        id: 'tool_007',
        sessionId: 'session_003',
        toolName: 'generate_report',
        parameters: { 
          template: 'sales_comparison',
          current_data: { revenue: 89000, orders: 312, customers: 156 },
          previous_data: { revenue: 76000, orders: 289, customers: 142 }
        },
        result: { report_path: '/reports/sales_202405.pdf', charts_generated: 3 },
        status: 'success',
        responseTime: 2.8,
        timestamp: '2024-05-21T14:22:00Z'
      }
    ],
    reasoningSteps: [
      {
        id: 'step_003_1',
        step: 1,
        type: 'thinking',
        title: '理解报告生成需求',
        content: '用户需要生成销售报告。我需要：\n1. 确定报告的时间范围和内容\n2. 收集相关的销售数据\n3. 选择合适的报告模板\n4. 生成可视化图表',
        status: 'completed',
        timestamp: '2024-05-21T14:20:01Z',
        metadata: {
          model: 'Claude-3',
          promptTokens: 178,
          completionTokens: 92,
          temperature: 0.6,
          responseTime: 520
        }
      },
      {
        id: 'step_003_2',
        step: 2,
        type: 'tool_decision',
        title: '制定数据收集策略',
        content: '为了生成完整的销售报告，我需要收集：\n1. 当前月份的销售数据\n2. 历史数据用于对比分析\n3. 关键业务指标\n\n首先调用 query_sales_data 获取当月数据。',
        status: 'completed',
        timestamp: '2024-05-21T14:20:05Z',
        metadata: {
          model: 'Claude-3',
          promptTokens: 234,
          completionTokens: 87,
          temperature: 0.6,
          responseTime: 480
        }
      },
      {
        id: 'step_003_3',
        step: 3,
        type: 'tool_execution',
        title: '获取当月销售数据',
        content: '调用 query_sales_data 获取当月数据...\n\n✅ 数据获取成功！\n- 当月收入：89,000元\n- 当月订单：312个\n- 当月客户：156人\n\n数据质量良好，继续收集对比数据。',
        status: 'completed',
        timestamp: '2024-05-21T14:20:10Z',
        metadata: {
          toolName: 'query_sales_data',
          responseTime: 1200,
          success: true
        }
      },
      {
        id: 'step_003_4',
        step: 4,
        type: 'thinking',
        title: '用户要求对比分析',
        content: '用户明确要求包含本月和上月的对比。我需要：\n1. 获取上月的销售数据\n2. 计算同比增长率\n3. 分析趋势变化\n4. 识别关键洞察点',
        status: 'completed',
        timestamp: '2024-05-21T14:21:05Z',
        metadata: {
          model: 'Claude-3',
          promptTokens: 345,
          completionTokens: 98,
          temperature: 0.6,
          responseTime: 450
        }
      },
      {
        id: 'step_003_5',
        step: 5,
        type: 'tool_execution',
        title: '获取上月对比数据',
        content: '调用 query_sales_data 获取上月数据...\n\n✅ 对比数据获取成功！\n- 上月收入：76,000元\n- 上月订单：289个\n- 上月客户：142人\n\n现在可以进行对比分析了。',
        status: 'completed',
        timestamp: '2024-05-21T14:21:15Z',
        metadata: {
          toolName: 'query_sales_data',
          responseTime: 1000,
          success: true
        }
      },
      {
        id: 'step_003_6',
        step: 6,
        type: 'thinking',
        title: '数据分析与洞察提取',
        content: '对比分析结果：\n\n📈 收入增长：+17.1% (89K vs 76K)\n📈 订单增长：+8.0% (312 vs 289)\n📈 客户增长：+9.9% (156 vs 142)\n\n关键洞察：\n- 收入增长超过订单增长，说明客单价提升\n- 新客户获取稳定增长\n- 整体业务呈现健康增长态势',
        status: 'completed',
        timestamp: '2024-05-21T14:21:45Z',
        metadata: {
          model: 'Claude-3',
          promptTokens: 567,
          completionTokens: 145,
          temperature: 0.6,
          responseTime: 620
        }
      },
      {
        id: 'step_003_7',
        step: 7,
        type: 'tool_execution',
        title: '生成销售报告',
        content: '调用 generate_report 工具生成完整报告...\n\n✅ 报告生成成功！\n- 报告路径：/reports/sales_202405.pdf\n- 包含图表：3个\n- 报告类型：销售对比分析\n\n报告包含详细的数据分析和可视化图表。',
        status: 'completed',
        timestamp: '2024-05-21T14:22:00Z',
        metadata: {
          toolName: 'generate_report',
          responseTime: 2800,
          success: true,
          outputFiles: ['/reports/sales_202405.pdf']
        }
      },
      {
        id: 'step_003_8',
        step: 8,
        type: 'response_generation',
        title: '总结报告生成结果',
        content: '报告生成完成！我需要向用户提供：\n1. 报告生成成功的确认\n2. 报告保存位置\n3. 关键发现的简要总结\n4. 后续建议（如需要）\n\n确保用户了解报告的价值和如何使用。',
        status: 'completed',
        timestamp: '2024-05-21T14:25:25Z',
        metadata: {
          model: 'Claude-3',
          promptTokens: 678,
          completionTokens: 167,
          temperature: 0.6,
          responseTime: 580
        }
      }
    ]
  }
];

export const mockABTests: ABTest[] = [
  {
    id: 'test_001',
    name: 'GPT-4 vs Claude-3 客服对比',
    description: '测试不同模型在客服场景下的表现差异',
    status: 'experimenting',
    creationType: 'human_created',
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