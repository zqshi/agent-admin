import { 
  MCPTool, 
  MCPCapability, 
  ToolTestCase, 
  TestResult, 
  StatusHistoryEntry,
  MCPToolVersion,
  ToolCallRecord
} from '../types';

// Mock MCP工具数据
export const mockMCPTools: MCPTool[] = [
  {
    id: 'tool_001',
    name: 'weather-service',
    displayName: '天气查询服务',
    description: '提供全球城市天气查询功能，支持实时天气和预报',
    version: '1.2.0',
    author: '系统开发组',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-06-01T14:30:00Z',
    status: 'published',
    statusHistory: [
      {
        id: 'hist_001',
        fromStatus: 'testing',
        toStatus: 'published',
        timestamp: '2024-06-01T14:30:00Z',
        operator: '张三',
        reason: '测试通过，正式发布'
      }
    ],
    config: {
      connectionType: 'http',
      network: {
        url: 'https://api.weather.example.com/mcp',
        headers: {
          'Content-Type': 'application/json'
        },
        authentication: {
          type: 'api_key',
          apiKey: '***hidden***'
        },
        timeout: 5000,
        retryPolicy: {
          maxRetries: 3,
          retryDelay: 1000
        }
      },
      security: {
        sandbox: true,
        networkRestrictions: ['api.weather.example.com'],
        resourceLimits: {
          maxMemory: '512MB',
          maxCpu: '0.5',
          maxExecutionTime: 10000
        },
        rateLimiting: {
          globalQPS: 100,
          perUserQPS: 10
        }
      }
    },
    capabilities: [
      {
        type: 'tools',
        name: 'get_current_weather',
        description: '获取指定城市的当前天气信息',
        schema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: '城市名称'
            },
            country: {
              type: 'string',
              description: '国家代码'
            }
          },
          required: ['city']
        }
      },
      {
        type: 'tools',
        name: 'get_weather_forecast',
        description: '获取指定城市的天气预报',
        schema: {
          type: 'object',
          properties: {
            city: {
              type: 'string',
              description: '城市名称'
            },
            days: {
              type: 'number',
              description: '预报天数(1-7)',
              minimum: 1,
              maximum: 7
            }
          },
          required: ['city', 'days']
        }
      }
    ],
    permissions: {
      allowedDepartments: ['销售部', '客服部', '市场部'],
      requiresApproval: false
    },
    versions: [
      {
        version: '1.2.0',
        config: {
          connectionType: 'http',
          network: {
            url: 'https://api.weather.example.com/mcp',
            headers: { 'Content-Type': 'application/json' }
          }
        },
        capabilities: [],
        releaseNotes: '增加天气预报功能，提升响应速度',
        releasedAt: '2024-06-01T14:30:00Z',
        releasedBy: '张三',
        isActive: true
      }
    ],
    currentVersion: '1.2.0',
    testing: {
      testCases: [
        {
          id: 'test_001',
          name: '北京天气查询测试',
          description: '测试北京当前天气查询功能',
          toolName: 'get_current_weather',
          parameters: { city: '北京', country: 'CN' },
          expectedResult: { temperature: 25, weather: 'sunny' },
          tags: ['smoke_test'],
          createdAt: '2024-05-20T10:00:00Z',
          createdBy: '李四'
        }
      ],
      lastTestResult: {
        id: 'result_001',
        testCaseId: 'test_001',
        toolId: 'tool_001',
        status: 'passed',
        executedAt: '2024-06-01T09:00:00Z',
        executionTime: 1200,
        input: { city: '北京', country: 'CN' },
        output: { temperature: 25, weather: 'sunny', humidity: 60 },
        logs: ['连接API成功', '请求参数验证通过', '获取数据成功'],
        metadata: { apiVersion: '2.1' }
      },
      testEnvironment: 'staging'
    },
    metrics: {
      totalCalls: 15420,
      successRate: 0.985,
      avgResponseTime: 1200,
      errorRate: 0.015,
      lastUsed: '2024-06-04T16:45:00Z',
      popularityScore: 8.5
    },
    tags: ['天气', 'API', '外部服务'],
    category: '数据服务'
  },
  {
    id: 'tool_002',
    name: 'database-query',
    displayName: '数据库查询工具',
    description: '安全的数据库查询接口，支持CRM和ERP系统',
    version: '2.0.1',
    author: '数据团队',
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-06-03T11:20:00Z',
    status: 'testing',
    statusHistory: [
      {
        id: 'hist_002',
        fromStatus: 'configuring',
        toStatus: 'testing',
        timestamp: '2024-06-03T11:20:00Z',
        operator: '王五',
        reason: '配置完成，开始测试'
      }
    ],
    config: {
      connectionType: 'stdio',
      stdio: {
        command: '/usr/local/bin/db-mcp-server',
        args: ['--config', '/etc/mcp/db-config.json'],
        env: {
          'DB_CONNECTION_POOL_SIZE': '10',
          'LOG_LEVEL': 'INFO'
        },
        workingDirectory: '/opt/mcp-tools'
      },
      security: {
        sandbox: true,
        networkRestrictions: ['db.internal.company.com'],
        resourceLimits: {
          maxMemory: '1GB',
          maxCpu: '1.0',
          maxExecutionTime: 30000
        },
        rateLimiting: {
          globalQPS: 50,
          perUserQPS: 5
        }
      }
    },
    capabilities: [
      {
        type: 'tools',
        name: 'query_customer_info',
        description: '查询客户基础信息',
        schema: {
          type: 'object',
          properties: {
            customer_id: {
              type: 'string',
              description: '客户ID'
            }
          },
          required: ['customer_id']
        }
      },
      {
        type: 'resources',
        name: 'sales_reports',
        description: '销售报表数据源',
        schema: {
          type: 'object',
          properties: {
            year: { type: 'number' },
            quarter: { type: 'number' }
          }
        }
      }
    ],
    permissions: {
      allowedDepartments: ['销售部', '客服部'],
      allowedUsers: ['admin', 'sales_manager'],
      requiresApproval: true
    },
    versions: [
      {
        version: '2.0.1',
        config: {
          connectionType: 'stdio',
          stdio: {
            command: '/usr/local/bin/db-mcp-server',
            args: ['--config', '/etc/mcp/db-config.json']
          }
        },
        capabilities: [],
        releaseNotes: '修复权限验证问题',
        releasedAt: '2024-06-03T11:20:00Z',
        releasedBy: '王五',
        isActive: true
      }
    ],
    currentVersion: '2.0.1',
    testing: {
      testCases: [
        {
          id: 'test_002',
          name: '客户信息查询测试',
          description: '测试查询指定客户ID的基础信息',
          toolName: 'query_customer_info',
          parameters: { customer_id: 'CUST_001' },
          tags: ['integration_test'],
          createdAt: '2024-06-01T14:00:00Z',
          createdBy: '王五'
        }
      ],
      testEnvironment: 'test'
    },
    metrics: {
      totalCalls: 8760,
      successRate: 0.995,
      avgResponseTime: 800,
      errorRate: 0.005,
      lastUsed: '2024-06-04T15:30:00Z',
      popularityScore: 9.2
    },
    tags: ['数据库', '内部服务', '客户管理'],
    category: '数据服务'
  },
  {
    id: 'tool_003',
    name: 'code-assistant',
    displayName: '代码助手',
    description: '智能代码生成和审查工具',
    version: '1.0.0',
    author: '技术部',
    createdAt: '2024-05-20T10:00:00Z',
    updatedAt: '2024-05-20T10:00:00Z',
    status: 'draft',
    statusHistory: [],
    config: {
      connectionType: 'sse',
      network: {
        url: 'https://code-assistant.internal.com/sse',
        headers: {
          'Accept': 'text/event-stream'
        },
        authentication: {
          type: 'bearer',
          token: '***hidden***'
        },
        timeout: 30000
      },
      security: {
        sandbox: true,
        networkRestrictions: ['code-assistant.internal.com'],
        resourceLimits: {
          maxMemory: '2GB',
          maxCpu: '2.0',
          maxExecutionTime: 60000
        },
        rateLimiting: {
          globalQPS: 20,
          perUserQPS: 2
        }
      }
    },
    capabilities: [
      {
        type: 'tools',
        name: 'generate_code',
        description: '根据需求生成代码',
        schema: {
          type: 'object',
          properties: {
            language: {
              type: 'string',
              enum: ['python', 'typescript', 'java', 'go']
            },
            requirement: {
              type: 'string',
              description: '功能需求描述'
            }
          },
          required: ['language', 'requirement']
        }
      },
      {
        type: 'prompts',
        name: 'code_review_template',
        description: '代码审查提示模板',
        schema: {
          type: 'object',
          properties: {
            code: { type: 'string' },
            focus_areas: { type: 'array', items: { type: 'string' } }
          }
        }
      }
    ],
    permissions: {
      allowedDepartments: ['技术部'],
      requiresApproval: true
    },
    versions: [
      {
        version: '1.0.0',
        config: {
          connectionType: 'sse',
          network: {
            url: 'https://code-assistant.internal.com/sse'
          }
        },
        capabilities: [],
        releaseNotes: '初始版本',
        releasedAt: '2024-05-20T10:00:00Z',
        releasedBy: '赵六',
        isActive: true
      }
    ],
    currentVersion: '1.0.0',
    testing: {
      testCases: [],
      testEnvironment: 'dev'
    },
    tags: ['AI', '代码生成', '开发工具'],
    category: '开发工具'
  },
  {
    id: 'tool_004',
    name: 'email-service',
    displayName: '邮件发送服务',
    description: '企业级邮件发送和模板管理',
    version: '1.5.2',
    author: '运维团队',
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-06-02T16:00:00Z',
    status: 'maintenance',
    statusHistory: [
      {
        id: 'hist_004',
        fromStatus: 'published',
        toStatus: 'maintenance',
        timestamp: '2024-06-02T16:00:00Z',
        operator: '运维管理员',
        reason: '升级邮件服务器'
      }
    ],
    config: {
      connectionType: 'http',
      network: {
        url: 'https://mail-api.company.com/mcp',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Version': '1.5'
        },
        authentication: {
          type: 'oauth2',
          oauthConfig: {
            clientId: 'email_service_client',
            clientSecret: '***hidden***',
            tokenUrl: 'https://auth.company.com/oauth/token'
          }
        },
        timeout: 10000
      },
      security: {
        sandbox: false,
        networkRestrictions: ['mail-api.company.com', 'auth.company.com'],
        resourceLimits: {
          maxMemory: '256MB',
          maxCpu: '0.5',
          maxExecutionTime: 15000
        },
        rateLimiting: {
          globalQPS: 200,
          perUserQPS: 20
        }
      }
    },
    capabilities: [
      {
        type: 'tools',
        name: 'send_email',
        description: '发送邮件',
        schema: {
          type: 'object',
          properties: {
            to: { type: 'array', items: { type: 'string' } },
            subject: { type: 'string' },
            body: { type: 'string' },
            template_id: { type: 'string' }
          },
          required: ['to', 'subject']
        }
      },
      {
        type: 'resources',
        name: 'email_templates',
        description: '邮件模板库',
        schema: {
          type: 'object',
          properties: {
            category: { type: 'string' }
          }
        }
      }
    ],
    permissions: {
      allowedDepartments: ['销售部', '客服部', '市场部', 'HR部'],
      requiresApproval: false
    },
    versions: [
      {
        version: '1.5.2',
        config: {
          connectionType: 'http',
          network: {
            url: 'https://mail-api.company.com/mcp'
          }
        },
        capabilities: [],
        releaseNotes: '支持富文本邮件格式',
        releasedAt: '2024-06-02T16:00:00Z',
        releasedBy: '运维管理员',
        isActive: true
      }
    ],
    currentVersion: '1.5.2',
    metrics: {
      totalCalls: 25680,
      successRate: 0.998,
      avgResponseTime: 2500,
      errorRate: 0.002,
      lastUsed: '2024-06-04T17:20:00Z',
      popularityScore: 9.5
    },
    tags: ['邮件', '通知', '营销'],
    category: '通信服务'
  }
];

// Mock工具调用记录
export const mockToolCallRecords: ToolCallRecord[] = [
  {
    id: 'call_001',
    toolId: 'tool_001',
    toolName: 'weather-service',
    userId: 'user_001',
    sessionId: 'session_123',
    parameters: { city: '北京', country: 'CN' },
    result: { temperature: 25, weather: 'sunny', humidity: 60 },
    status: 'success',
    responseTime: 1200,
    timestamp: '2024-06-04T16:45:00Z'
  },
  {
    id: 'call_002',
    toolId: 'tool_002',
    toolName: 'database-query',
    userId: 'user_002',
    parameters: { customer_id: 'CUST_001' },
    result: { name: '张三', email: 'zhangsan@example.com' },
    status: 'success',
    responseTime: 800,
    timestamp: '2024-06-04T15:30:00Z'
  },
  {
    id: 'call_003',
    toolId: 'tool_004',
    toolName: 'email-service',
    userId: 'user_003',
    parameters: { 
      to: ['customer@example.com'], 
      subject: '感谢您的购买',
      template_id: 'purchase_thank_you'
    },
    status: 'failed',
    responseTime: 5000,
    timestamp: '2024-06-04T14:20:00Z',
    error: '邮件服务器连接超时'
  }
];

// 工具使用统计数据
export const mockToolUsageStats = {
  totalTools: mockMCPTools.length,
  publishedTools: mockMCPTools.filter(t => t.status === 'published').length,
  testingTools: mockMCPTools.filter(t => t.status === 'testing').length,
  draftTools: mockMCPTools.filter(t => t.status === 'draft').length,
  maintenanceTools: mockMCPTools.filter(t => t.status === 'maintenance').length,
  totalCalls: mockToolCallRecords.length,
  successfulCalls: mockToolCallRecords.filter(r => r.status === 'success').length,
  failedCalls: mockToolCallRecords.filter(r => r.status === 'failed').length,
  avgResponseTime: 1800,
  topCategories: [
    { name: '数据服务', count: 2, percentage: 50 },
    { name: '通信服务', count: 1, percentage: 25 },
    { name: '开发工具', count: 1, percentage: 25 }
  ]
};

// 工具状态统计
export const mockToolStatusDistribution = [
  { status: 'published', count: 2, color: '#10B981' },
  { status: 'testing', count: 1, color: '#F59E0B' },
  { status: 'draft', count: 1, color: '#6B7280' },
  { status: 'maintenance', count: 1, color: '#EF4444' }
];