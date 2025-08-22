import { DigitalEmployeeManagement } from '../types';

export const mockDigitalEmployees: DigitalEmployeeManagement[] = [
  {
    id: '1',
    name: 'AI-Alice',
    employeeNumber: 'DE001',
    description: '专业的客户服务数字员工，擅长处理各类客户咨询',
    status: 'active',
    department: '客户服务部',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-02-20T10:30:00Z',
    lastActiveAt: '2024-02-28T14:45:00Z',
    
    persona: {
      systemPrompt: '你是一名专业的客户服务代表，始终保持友好、耐心和专业的态度。你需要准确理解客户需求，提供清晰的解答，并在必要时将复杂问题转接给人工客服。',
      personality: '友好、耐心、专业、细心',
      responsibilities: ['客户咨询处理', '订单状态查询', '退换货申请处理', '基础产品介绍', '投诉处理'],
      exampleDialogues: [
        {
          id: '1',
          userInput: '我的订单什么时候能到？',
          expectedResponse: '您好！我很乐意帮您查询订单状态。请提供您的订单号，我马上为您查询物流信息。',
          tags: ['订单查询', '物流']
        }
      ]
    },
    
    mentorConfig: {
      mentorId: '2',
      mentorName: 'AI-Manager',
      reportingCycle: 'weekly',
      reportingMethod: 'document',
      documentPath: '/reports/alice-weekly.md'
    },
    
    permissions: {
      allowedTools: ['order_query', 'logistics_track', 'customer_info', 'faq_search'],
      resourceAccess: [
        {
          resourceType: 'database',
          resourceId: 'customer_db',
          resourceName: '客户数据库',
          accessLevel: 'read'
        },
        {
          resourceType: 'api',
          resourceId: 'logistics_api',
          resourceName: '物流查询API',
          accessLevel: 'read'
        }
      ],
      knowledgeManagement: {
        canSelfLearn: true,
        canModifyKnowledge: false
      }
    },
    
    knowledgeBase: {
      documents: [
        {
          id: '1',
          name: '客户服务手册.pdf',
          type: 'pdf',
          filePath: '/knowledge/customer-service-manual.pdf',
          uploadedAt: '2024-01-15T09:00:00Z',
          size: 2048576,
          processedAt: '2024-01-15T09:15:00Z',
          tags: ['客服', '流程', '规范'],
          metadata: { pages: 45, language: 'zh-CN' }
        }
      ],
      faqItems: [
        {
          id: '1',
          question: '如何查询订单状态？',
          answer: '您可以在订单详情页面查看当前状态，或提供订单号让我为您查询。',
          tags: ['订单', '查询'],
          confidence: 0.95,
          usageCount: 156,
          lastUsed: '2024-02-28T14:30:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-02-20T11:00:00Z'
        }
      ],
      autoLearnedItems: [
        {
          id: '1',
          content: '客户经常询问春节期间的配送安排',
          source: 'conversation',
          confidence: 0.85,
          reviewStatus: 'approved',
          learnedAt: '2024-02-10T16:00:00Z',
          reviewedAt: '2024-02-11T09:00:00Z',
          reviewedBy: 'supervisor',
          tags: ['节假日', '配送']
        }
      ]
    },
    
    memorySystem: {
      workingMemory: [
        {
          id: '1',
          type: 'working',
          content: '用户询问订单DE123456的配送状态',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          importance: 0.8,
          accessCount: 1,
          associatedIds: ['order_DE123456'],
          metadata: { sessionId: 'sess_001', queryType: 'order_status' }
        },
        {
          id: '2',
          type: 'working',
          content: '正在处理退货申请，需要验证订单信息',
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
          importance: 0.9,
          accessCount: 2,
          associatedIds: ['return_request'],
          metadata: { sessionId: 'sess_002', urgency: 'high' }
        }
      ],
      episodicMemory: [
        {
          id: '3',
          type: 'episodic',
          content: '2024-02-28 14:30: 成功帮助客户王女士解决了账户登录问题，客户表示非常满意',
          timestamp: '2024-02-28T14:30:00Z',
          importance: 0.7,
          accessCount: 3,
          associatedIds: ['customer_wang', 'login_issue'],
          metadata: { outcome: 'positive', satisfaction: 5, issue_type: 'account' }
        },
        {
          id: '4',
          type: 'episodic',
          content: '2024-02-27 16:20: 处理了复杂的商品咨询，涉及多个产品规格对比',
          timestamp: '2024-02-27T16:20:00Z',
          importance: 0.6,
          accessCount: 1,
          associatedIds: ['product_comparison', 'complex_query'],
          metadata: { duration: 1800, products_discussed: 3 }
        }
      ],
      semanticMemory: [
        {
          id: '5',
          type: 'semantic',
          content: '客户服务黄金准则：倾听、理解、解决、跟进',
          timestamp: '2024-01-15T10:00:00Z',
          importance: 0.95,
          accessCount: 156,
          associatedIds: ['service_principles'],
          metadata: { category: 'core_values', source: 'training_manual' }
        },
        {
          id: '6',
          type: 'semantic',
          content: '订单状态流程：待付款→已付款→处理中→已发货→配送中→已签收→交易完成',
          timestamp: '2024-01-15T10:30:00Z',
          importance: 0.9,
          accessCount: 89,
          associatedIds: ['order_workflow', 'business_process'],
          metadata: { category: 'business_logic', version: '2.1' }
        }
      ],
      proceduralMemory: [
        {
          id: '7',
          type: 'procedural',
          content: '订单查询标准流程：1.验证用户身份 2.检查订单号格式 3.调用查询API 4.解析结果 5.友好回复',
          timestamp: '2024-01-20T09:00:00Z',
          importance: 0.85,
          accessCount: 234,
          associatedIds: ['order_query_tool', 'standard_procedure'],
          metadata: { steps: 5, success_rate: 0.96, avg_duration: 45 }
        }
      ],
      emotionalMemory: [
        {
          id: '8',
          type: 'emotional',
          content: '用户对快速响应的积极反馈增强了优先处理紧急问题的倾向',
          timestamp: '2024-02-20T15:00:00Z',
          importance: 0.7,
          accessCount: 12,
          associatedIds: ['positive_feedback', 'urgency_handling'],
          metadata: { emotion: 'confidence', reinforcement: 0.8 }
        }
      ]
    },
    
    metrics: {
      totalSessions: 1250,
      successfulSessions: 1188,
      avgResponseTime: 1.2,
      userSatisfactionScore: 4.6,
      knowledgeUtilizationRate: 0.78,
      toolUsageStats: {
        'order_query': 450,
        'logistics_track': 320,
        'faq_search': 280
      }
    }
  },
  
  {
    id: '2',
    name: 'AI-Manager',
    employeeNumber: 'DE002',
    description: '高级管理数字员工，负责团队协调和复杂问题处理',
    status: 'active',
    department: '管理层',
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-02-25T15:20:00Z',
    lastActiveAt: '2024-02-28T16:00:00Z',
    
    persona: {
      systemPrompt: '你是一名资深的团队管理者，具备战略思维和决策能力。你需要协调团队资源，处理复杂问题，并指导初级数字员工的工作。',
      personality: '理性、决断、负责、有远见',
      responsibilities: ['团队协调', '复杂问题处理', '决策支持', '绩效分析', '流程优化'],
      exampleDialogues: []
    },
    
    permissions: {
      allowedTools: ['team_analytics', 'performance_review', 'decision_support', 'resource_allocation'],
      resourceAccess: [
        {
          resourceType: 'database',
          resourceId: 'analytics_db',
          resourceName: '分析数据库',
          accessLevel: 'read'
        }
      ],
      knowledgeManagement: {
        canSelfLearn: true,
        canModifyKnowledge: true
      }
    },
    
    knowledgeBase: {
      documents: [],
      faqItems: [],
      autoLearnedItems: []
    },
    
    metrics: {
      totalSessions: 385,
      successfulSessions: 370,
      avgResponseTime: 2.8,
      userSatisfactionScore: 4.8,
      knowledgeUtilizationRate: 0.92,
      toolUsageStats: {
        'team_analytics': 120,
        'decision_support': 95,
        'performance_review': 80
      }
    }
  },
  
  {
    id: '3',
    name: 'AI-Tech',
    employeeNumber: 'DE003',
    description: '技术支持数字员工，专注于产品技术问题解答',
    status: 'disabled',
    department: '技术支持部',
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-02-15T12:00:00Z',
    lastActiveAt: '2024-02-15T12:00:00Z',
    
    persona: {
      systemPrompt: '你是一名技术支持专家，具备深厚的产品技术知识。你需要准确诊断技术问题，提供详细的解决方案，并协助用户完成技术操作。',
      personality: '严谨、逻辑性强、乐于助人、专业',
      responsibilities: ['技术问题诊断', '解决方案提供', '技术文档编写', '用户指导', '产品反馈收集'],
      exampleDialogues: []
    },
    
    permissions: {
      allowedTools: ['tech_diagnosis', 'solution_search', 'log_analysis', 'product_docs'],
      resourceAccess: [
        {
          resourceType: 'database',
          resourceId: 'tech_kb',
          resourceName: '技术知识库',
          accessLevel: 'read'
        }
      ],
      knowledgeManagement: {
        canSelfLearn: true,
        canModifyKnowledge: false
      }
    },
    
    knowledgeBase: {
      documents: [],
      faqItems: [],
      autoLearnedItems: []
    },
    
    metrics: {
      totalSessions: 720,
      successfulSessions: 684,
      avgResponseTime: 3.5,
      userSatisfactionScore: 4.4,
      knowledgeUtilizationRate: 0.85,
      toolUsageStats: {
        'tech_diagnosis': 280,
        'solution_search': 240,
        'log_analysis': 120
      }
    }
  },
  
  {
    id: '4',
    name: 'AI-Sales',
    employeeNumber: 'DE004',
    description: '销售助理数字员工，协助销售团队进行客户开发和维护',
    status: 'active',
    department: '销售部',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-28T09:30:00Z',
    lastActiveAt: '2024-02-28T17:30:00Z',
    
    persona: {
      systemPrompt: '你是一名专业的销售助理，具备出色的沟通技巧和商业敏感度。你需要协助识别销售机会，维护客户关系，并提供个性化的产品推荐。',
      personality: '热情、善于沟通、目标导向、机敏',
      responsibilities: ['潜在客户筛选', '客户需求分析', '产品推荐', '商机跟进', '销售数据分析'],
      exampleDialogues: []
    },
    
    permissions: {
      allowedTools: ['crm_access', 'product_catalog', 'pricing_calc', 'lead_scoring'],
      resourceAccess: [
        {
          resourceType: 'database',
          resourceId: 'crm_db',
          resourceName: 'CRM数据库',
          accessLevel: 'write'
        }
      ],
      knowledgeManagement: {
        canSelfLearn: true,
        canModifyKnowledge: false
      }
    },
    
    knowledgeBase: {
      documents: [],
      faqItems: [],
      autoLearnedItems: []
    },
    
    metrics: {
      totalSessions: 890,
      successfulSessions: 845,
      avgResponseTime: 1.8,
      userSatisfactionScore: 4.5,
      knowledgeUtilizationRate: 0.73,
      toolUsageStats: {
        'crm_access': 320,
        'product_catalog': 280,
        'lead_scoring': 180
      }
    }
  },
  
  {
    id: '5',
    name: 'AI-HR',
    employeeNumber: 'DE005',
    description: '人力资源数字员工，处理员工相关事务和政策咨询',
    status: 'retired',
    department: '人力资源部',
    createdAt: '2023-12-15T08:00:00Z',
    updatedAt: '2024-01-30T16:00:00Z',
    lastActiveAt: '2024-01-30T16:00:00Z',
    
    persona: {
      systemPrompt: '你是一名人力资源专员，熟悉公司的各项人事政策和流程。你需要为员工提供准确的政策解释，协助处理人事事务，并维护良好的员工关系。',
      personality: '亲和、公正、严谨、保密性强',
      responsibilities: ['政策咨询', '流程指导', '员工关怀', '数据统计', '合规检查'],
      exampleDialogues: []
    },
    
    permissions: {
      allowedTools: ['hr_policies', 'employee_data', 'leave_management', 'compliance_check'],
      resourceAccess: [
        {
          resourceType: 'database',
          resourceId: 'hr_db',
          resourceName: '人事数据库',
          accessLevel: 'read'
        }
      ],
      knowledgeManagement: {
        canSelfLearn: false,
        canModifyKnowledge: false
      }
    },
    
    knowledgeBase: {
      documents: [],
      faqItems: [],
      autoLearnedItems: []
    },
    
    metrics: {
      totalSessions: 245,
      successfulSessions: 230,
      avgResponseTime: 2.1,
      userSatisfactionScore: 4.3,
      knowledgeUtilizationRate: 0.88,
      toolUsageStats: {
        'hr_policies': 95,
        'employee_data': 75,
        'leave_management': 60
      }
    }
  }
];