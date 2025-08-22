import { Session, ChatMessage, LLMTrace, ToolTrace } from '../types';

// 数字员工实例数据
export interface DigitalEmployee {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'busy' | 'offline';
  currentSessions: number;
  todayTotal: number;
  avgResponseTime: number;
  successRate: number;
  capabilities: string[];
}

// 人类员工数据
export interface HumanEmployee {
  id: string;
  name: string;
  department: string;
  currentDigitalEmployee?: string;
  sessionStatus: 'active' | 'waiting' | 'idle';
  waitingTime?: number; // 等待时间(秒)
}

// 实时会话数据
export interface LiveSession extends Session {
  isLive: boolean;
  currentStep: string; // "思考中", "调用工具中", "回复中", "等待用户"
  lastActivity: string;
  reasoningSteps: ReasoningStep[];
}

// 推理步骤
export interface ReasoningStep {
  id: string;
  step: number;
  type: 'thinking' | 'tool_decision' | 'tool_execution' | 'response_generation';
  title: string;
  content: string;
  status: 'completed' | 'processing' | 'pending' | 'error';
  timestamp: string;
  metadata?: Record<string, any>;
}

// 工具调用决策节点
export interface DecisionNode {
  id: string;
  type: 'request' | 'decision' | 'tool_call' | 'result' | 'response';
  title: string;
  content: string;
  status: 'success' | 'error' | 'processing';
  children?: DecisionNode[];
  metadata?: {
    toolName?: string;
    parameters?: Record<string, any>;
    result?: any;
    error?: string;
    duration?: number;
  };
}

// 模拟数字员工实例
export const digitalEmployees: DigitalEmployee[] = [
  {
    id: 'de_finance_001',
    name: '财务小智',
    role: '财务顾问',
    status: 'busy',
    currentSessions: 3,
    todayTotal: 47,
    avgResponseTime: 2.1,
    successRate: 94.2,
    capabilities: ['费用审批', '报销查询', '财务分析', '预算规划']
  },
  {
    id: 'de_hr_001', 
    name: 'HR助手小丽',
    role: 'HR助理',
    status: 'busy',
    currentSessions: 2,
    todayTotal: 32,
    avgResponseTime: 1.8,
    successRate: 96.7,
    capabilities: ['考勤查询', '请假申请', '薪资查询', '政策咨询']
  },
  {
    id: 'de_it_001',
    name: 'IT支持小明',
    role: 'IT技术支持',
    status: 'idle',
    currentSessions: 0,
    todayTotal: 28,
    avgResponseTime: 3.2,
    successRate: 88.5,
    capabilities: ['故障处理', '权限申请', '软件安装', '密码重置']
  },
  {
    id: 'de_legal_001',
    name: '法务小助手',
    role: '法务顾问',
    status: 'busy',
    currentSessions: 1,
    todayTotal: 15,
    avgResponseTime: 4.5,
    successRate: 92.3,
    capabilities: ['合同审查', '法律咨询', '合规检查', '风险评估']
  }
];

// 模拟人类员工数据
export const humanEmployees: HumanEmployee[] = [
  {
    id: 'emp_001',
    name: '张三',
    department: '财务部',
    currentDigitalEmployee: 'de_finance_001',
    sessionStatus: 'active'
  },
  {
    id: 'emp_002',
    name: '李四',
    department: '财务部',
    currentDigitalEmployee: 'de_finance_001',
    sessionStatus: 'waiting',
    waitingTime: 45
  },
  {
    id: 'emp_003',
    name: '王五',
    department: '人事部',
    currentDigitalEmployee: 'de_hr_001',
    sessionStatus: 'active'
  },
  {
    id: 'emp_004',
    name: '赵六',
    department: '技术部',
    sessionStatus: 'idle'
  },
  {
    id: 'emp_005',
    name: '孙七',
    department: '法务部',
    currentDigitalEmployee: 'de_legal_001',
    sessionStatus: 'active'
  },
  {
    id: 'emp_006',
    name: '周八',
    department: '财务部',
    currentDigitalEmployee: 'de_finance_001',
    sessionStatus: 'waiting',
    waitingTime: 12
  }
];

// 增强的推理步骤示例
const sampleReasoningSteps: ReasoningStep[] = [
  {
    id: 'step_1',
    step: 1,
    type: 'thinking',
    title: '理解用户请求',
    content: `用户询问"帮我查询上个月的差旅费报销情况"，需要进行深度分析：

🎯 请求解析：
• 查询对象：差旅费报销记录
• 时间范围：上个月 (2024年7月)
• 操作类型：数据查询
• 用户角色：财务相关人员

🧠 推理路径：
1. 确定需要访问财务系统
2. 需要验证用户权限
3. 构建查询参数
4. 选择合适的API接口`,
    status: 'completed',
    timestamp: '2024-08-21T14:30:01.123Z',
    metadata: {
      model: 'GPT-4-turbo',
      promptTokens: 156,
      completionTokens: 89,
      temperature: 0.3,
      responseTime: 850,
      promptTemplate: 'financial_assistant_v2.1'
    }
  },
  {
    id: 'step_2', 
    step: 2,
    type: 'tool_decision',
    title: '决策调用工具',
    content: `经过分析，确定需要调用财务系统API获取报销数据：

⚡ 工具选择决策树：
├─ 是否需要外部数据？ ✅ 是
├─ 数据类型？ 💰 财务报销数据
├─ 用户权限？ ✅ 有财务查询权限
└─ 最佳工具：query_expense_reports

📋 调用参数准备：
• employee_id: emp_001 (来源：会话上下文)
• date_range: 2024-07-01 至 2024-07-31
• expense_type: travel (差旅费)
• include_status: true (包含审批状态)

🎯 预期结果：结构化的报销记录列表`,
    status: 'completed',
    timestamp: '2024-08-21T14:30:02.456Z',
    metadata: {
      model: 'GPT-4-turbo',
      promptTokens: 203,
      completionTokens: 125,
      temperature: 0.1,
      responseTime: 1200,
      promptTemplate: 'financial_assistant_v2.1',
      decisionScore: 0.94,
      alternativeTools: ['get_user_expenses', 'financial_query_generic']
    }
  },
  {
    id: 'step_3',
    step: 3,
    type: 'tool_execution',
    title: '执行财务查询工具',
    content: `正在调用 query_expense_reports 工具...

🔄 执行状态：
• 工具调用已发起
• 等待财务系统响应
• 预计耗时：1-3秒

📡 请求详情：
• API端点：/api/v2/expense-reports
• 方法：POST
• 认证：Bearer Token (已验证)
• 超时设置：5秒`,
    status: 'processing',
    timestamp: '2024-08-21T14:30:03.789Z',
    metadata: {
      toolName: 'query_expense_reports',
      parameters: {
        employee_id: 'emp_001',
        date_range: '2024-07-01,2024-07-31',
        expense_type: 'travel',
        include_status: true,
        include_details: true
      },
      apiEndpoint: '/api/v2/expense-reports',
      requestId: 'req_789abc123',
      startTime: '2024-08-21T14:30:03.789Z'
    }
  },
  {
    id: 'step_4',
    step: 4,
    type: 'response_generation',
    title: '生成用户回复',
    content: `基于获取的数据生成结构化回复：

📊 数据处理：
• 成功获取 5 条报销记录
• 总金额：¥3,250.00
• 全部已审批通过

✍️ 回复策略：
• 使用表格格式展示明细
• 突出显示总金额和状态
• 提供后续操作建议
• 保持专业友好的语调`,
    status: 'completed',
    timestamp: '2024-08-21T14:30:05.123Z',
    metadata: {
      model: 'GPT-4-turbo',
      promptTokens: 445,
      completionTokens: 178,
      temperature: 0.4,
      responseTime: 980,
      promptTemplate: 'financial_assistant_v2.1',
      outputFormat: 'structured_table',
      qualityScore: 0.96
    }
  }
];

// 决策树示例
const sampleDecisionTree: DecisionNode = {
  id: 'root',
  type: 'request',
  title: '用户请求',
  content: '帮我查询上个月的差旅费报销情况',
  status: 'success',
  children: [
    {
      id: 'decision_1',
      type: 'decision',
      title: '分析请求类型',
      content: '识别为财务查询请求，需要调用工具',
      status: 'success',
      children: [
        {
          id: 'tool_call_1',
          type: 'tool_call',
          title: '调用财务查询工具',
          content: 'query_expense_reports',
          status: 'processing',
          metadata: {
            toolName: 'query_expense_reports',
            parameters: {
              employee_id: 'emp_001',
              date_range: '2024-07-01,2024-07-31',
              expense_type: 'travel'
            },
            duration: 1.2
          },
          children: [
            {
              id: 'result_1',
              type: 'result',
              title: '工具执行结果',
              content: '成功获取报销记录',
              status: 'success',
              metadata: {
                result: {
                  total_amount: 3250.00,
                  records_count: 5,
                  status: '已审批'
                }
              }
            }
          ]
        }
      ]
    }
  ]
};

// 实时会话数据
export const liveSessions: LiveSession[] = [
  {
    id: 'live_session_001',
    userId: 'emp_001',
    startTime: '2024-08-21T14:30:00Z',
    status: 'success',
    totalMessages: 3,
    llmCalls: 2,
    toolCalls: 1,
    tokens: 456,
    responseTime: 2.1,
    isLive: true,
    currentStep: '调用工具中',
    lastActivity: '2024-08-21T14:30:03Z',
    reasoningSteps: sampleReasoningSteps,
    messages: [
      {
        id: 'msg_live_001',
        role: 'user',
        content: '帮我查询上个月的差旅费报销情况',
        timestamp: '2024-08-21T14:30:00Z'
      },
      {
        id: 'msg_live_002',
        role: 'assistant',
        content: '好的，我来帮您查询上个月的差旅费报销情况。让我调用财务系统查询相关记录...',
        timestamp: '2024-08-21T14:30:01Z'
      }
    ],
    llmTrace: [
      {
        id: 'llm_live_001',
        sessionId: 'live_session_001',
        messageId: 'msg_live_002',
        model: 'GPT-4',
        prompt: '用户询问：帮我查询上个月的差旅费报销情况\n\n作为财务助手，请分析用户需求并制定查询计划...',
        response: '好的，我来帮您查询上个月的差旅费报销情况。让我调用财务系统查询相关记录...',
        tokens: 256,
        responseTime: 1.1,
        timestamp: '2024-08-21T14:30:01Z'
      }
    ],
    toolTrace: [
      {
        id: 'tool_live_001',
        sessionId: 'live_session_001',
        toolName: 'query_expense_reports',
        parameters: {
          employee_id: 'emp_001',
          date_range: '2024-07-01,2024-07-31',
          expense_type: 'travel'
        },
        result: null, // 还在执行中
        status: 'success',
        responseTime: 1.2,
        timestamp: '2024-08-21T14:30:03Z'
      }
    ]
  },
  {
    id: 'live_session_002',
    userId: 'emp_003',
    startTime: '2024-08-21T14:25:00Z',
    status: 'success',
    totalMessages: 4,
    llmCalls: 3,
    toolCalls: 2,
    tokens: 678,
    responseTime: 1.8,
    isLive: true,
    currentStep: '回复中',
    lastActivity: '2024-08-21T14:26:30Z',
    reasoningSteps: [],
    messages: [
      {
        id: 'msg_live_003',
        role: 'user',
        content: '我想申请明天请假',
        timestamp: '2024-08-21T14:25:00Z'
      },
      {
        id: 'msg_live_004',
        role: 'assistant', 
        content: '好的，我来帮您处理请假申请。请问您需要请假的具体时间和原因是什么？',
        timestamp: '2024-08-21T14:25:15Z'
      },
      {
        id: 'msg_live_005',
        role: 'user',
        content: '明天全天，因为家里有事',
        timestamp: '2024-08-21T14:26:00Z'
      }
    ],
    llmTrace: [],
    toolTrace: []
  }
];

// 生成实时状态更新的工具函数
export const generateLiveUpdate = () => {
  const now = new Date().toISOString();
  const steps = ['思考中', '调用工具中', '回复中', '等待用户'];
  const randomStep = steps[Math.floor(Math.random() * steps.length)];
  
  return {
    timestamp: now,
    currentStep: randomStep,
    activeSessionsCount: Math.floor(Math.random() * 10) + 5,
    newSessionsCount: Math.floor(Math.random() * 3),
    totalActiveEmployees: humanEmployees.filter(emp => emp.sessionStatus === 'active').length
  };
};

// 模拟实时数据更新
export const mockRealtimeUpdates = {
  digitalEmployeeUpdates: () => {
    return digitalEmployees.map(de => ({
      ...de,
      currentSessions: Math.max(0, de.currentSessions + Math.floor(Math.random() * 3) - 1),
      avgResponseTime: de.avgResponseTime + (Math.random() - 0.5) * 0.5
    }));
  },
  
  humanEmployeeUpdates: () => {
    return humanEmployees.map(he => ({
      ...he,
      waitingTime: he.waitingTime ? Math.max(0, he.waitingTime + Math.floor(Math.random() * 10) - 5) : undefined
    }));
  },

  sessionUpdates: () => {
    return liveSessions.map(session => ({
      ...session,
      lastActivity: new Date().toISOString(),
      currentStep: generateLiveUpdate().currentStep
    }));
  }
};