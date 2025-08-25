# KingSoft API 接口文档

## 概览

KingSoft 数字员工管理平台 API 提供了完整的后端接口，支持实时监控、会话查询、A/B测试管理和数据分析功能。

**API 基础信息:**
- **Base URL:** `https://api.kingsoft.com/v1`
- **认证方式:** Bearer Token
- **数据格式:** JSON
- **字符编码:** UTF-8

## 认证

### 获取访问令牌
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expires_in": 3600,
    "user": {
      "id": "user_123",
      "name": "张三",
      "role": "product_manager",
      "permissions": ["dashboard:read", "sessions:read", "experiments:write"]
    }
  }
}
```

### 使用令牌
所有API请求都需要在Header中包含认证信息：
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 监控仪表盘 API

### 获取仪表盘指标
```http
GET /dashboard/metrics?timeRange={timeRange}
```

**参数:**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| timeRange | string | 否 | 时间范围: 1h, 6h, 24h, 7d, 30d |

**响应:**
```json
{
  "success": true,
  "data": {
    "activeUsers": 1247,
    "rpm": 85,
    "totalSessions": 3456,
    "successSessions": 3211,
    "failedSessions": 245,
    "avgResponseTime": 2.3,
    "totalTokens": 4567890,
    "tokenCostByModel": {
      "GPT-4": 23456,
      "Claude-3": 18234,
      "GPT-3.5": 5432
    },
    "timestamp": "2024-08-21T08:00:00Z"
  }
}
```

### 获取服务状态
```http
GET /dashboard/services
```

**响应:**
```json
{
  "success": true,
  "data": [
    {
      "id": "customer_service",
      "name": "客服助手",
      "description": "GPT-4 + MCP工具链",
      "status": "healthy",
      "metrics": {
        "availability": 99.8,
        "avgResponseTime": 2.1,
        "requestsPerMinute": 42
      }
    }
  ]
}
```

## 会话管理 API

### 搜索会话
```http
POST /sessions/search
Content-Type: application/json

{
  "query": {
    "sessionId": "session_001",
    "userId": "user_123",
    "keyword": "订单查询",
    "status": "success",
    "timeRange": {
      "start": "2024-08-20T00:00:00Z",
      "end": "2024-08-21T00:00:00Z"
    }
  },
  "pagination": {
    "page": 1,
    "limit": 20
  },
  "sort": {
    "field": "startTime",
    "order": "desc"
  }
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_001",
        "userId": "user_123",
        "startTime": "2024-08-21T10:30:00Z",
        "endTime": "2024-08-21T10:35:22Z",
        "status": "success",
        "totalMessages": 6,
        "llmCalls": 3,
        "toolCalls": 2,
        "tokens": 1245,
        "responseTime": 2.1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 获取会话详情
```http
GET /sessions/{sessionId}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "session_001",
    "userId": "user_123",
    "startTime": "2024-08-21T10:30:00Z",
    "endTime": "2024-08-21T10:35:22Z",
    "status": "success",
    "totalMessages": 6,
    "llmCalls": 3,
    "toolCalls": 2,
    "tokens": 1245,
    "responseTime": 2.1,
    "messages": [
      {
        "id": "msg_001",
        "role": "user",
        "content": "请帮我查询最近的销售数据",
        "timestamp": "2024-08-21T10:30:00Z"
      },
      {
        "id": "msg_002",
        "role": "assistant",
        "content": "好的，我来帮您查询最近的销售数据。",
        "timestamp": "2024-08-21T10:30:05Z"
      }
    ],
    "llmTrace": [
      {
        "id": "llm_001",
        "sessionId": "session_001",
        "messageId": "msg_002",
        "model": "GPT-4",
        "prompt": "用户询问：请帮我查询最近的销售数据...",
        "response": "好的，我来帮您查询最近的销售数据。",
        "tokens": 456,
        "responseTime": 1.2,
        "timestamp": "2024-08-21T10:30:02Z"
      }
    ],
    "toolTrace": [
      {
        "id": "tool_001",
        "sessionId": "session_001",
        "toolName": "query_sales_data",
        "parameters": {
          "period": "last_30_days",
          "metrics": ["revenue", "orders"]
        },
        "result": {
          "revenue": 125000,
          "orders": 456
        },
        "status": "success",
        "responseTime": 0.8,
        "timestamp": "2024-08-21T10:30:03Z"
      }
    ]
  }
}
```

## A/B测试管理 API

### 获取实验列表
```http
GET /experiments?status={status}&page={page}&limit={limit}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "experiments": [
      {
        "id": "exp_001",
        "name": "GPT-4 vs Claude-3 客服对比",
        "description": "测试不同模型在客服场景下的表现差异",
        "status": "running",
        "startDate": "2024-08-15T00:00:00Z",
        "endDate": null,
        "createdBy": "user_123",
        "groups": [
          {
            "id": "group_a",
            "name": "对照组 (GPT-4)",
            "trafficRatio": 50
          },
          {
            "id": "group_b", 
            "name": "实验组 (Claude-3)",
            "trafficRatio": 50
          }
        ],
        "metrics": {
          "totalSessions": 2456,
          "successRate": 92.3,
          "avgResponseTime": 2.1,
          "avgTokenCost": 0.045
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 23,
      "totalPages": 3
    }
  }
}
```

### 创建实验
```http
POST /experiments
Content-Type: application/json

{
  "name": "新模型测试实验",
  "description": "测试新模型的性能表现",
  "goal": "improve_success_rate",
  "groups": [
    {
      "name": "对照组",
      "trafficRatio": 50,
      "config": {
        "model": "GPT-4",
        "temperature": 0.7,
        "maxTokens": 2048,
        "prompt": "你是一个专业的助手...",
        "tools": ["query_order", "cancel_order"]
      }
    },
    {
      "name": "实验组",
      "trafficRatio": 50,
      "config": {
        "model": "Claude-3",
        "temperature": 0.7,
        "maxTokens": 2048,
        "prompt": "你是一个专业的助手...",
        "tools": ["query_order", "cancel_order"]
      }
    }
  ],
  "settings": {
    "minSampleSize": 1000,
    "maxDuration": 30,
    "confidenceLevel": 0.95
  }
}
```

### 控制实验
```http
PATCH /experiments/{experimentId}/control
Content-Type: application/json

{
  "action": "start" | "pause" | "stop",
  "reason": "实验配置调整完成，开始收集数据"
}
```

### 获取实验结果
```http
GET /experiments/{experimentId}/results
```

**响应:**
```json
{
  "success": true,
  "data": {
    "experiment": {
      "id": "exp_001",
      "name": "GPT-4 vs Claude-3 客服对比",
      "status": "completed"
    },
    "results": {
      "winnerGroup": "group_b",
      "confidence": 0.95,
      "pValue": 0.032,
      "isSignificant": true,
      "recommendation": "建议采用实验组配置",
      "groupResults": [
        {
          "groupId": "group_a",
          "groupName": "对照组 (GPT-4)",
          "metrics": {
            "totalSessions": 1228,
            "successRate": 91.2,
            "avgResponseTime": 2.3,
            "avgTokenCost": 0.048
          }
        },
        {
          "groupId": "group_b", 
          "groupName": "实验组 (Claude-3)",
          "metrics": {
            "totalSessions": 1228,
            "successRate": 93.4,
            "avgResponseTime": 1.9,
            "avgTokenCost": 0.042
          }
        }
      ]
    }
  }
}
```

## 数据分析 API

### 获取分析数据
```http
POST /analytics/query
Content-Type: application/json

{
  "timeRange": {
    "start": "2024-08-01T00:00:00Z",
    "end": "2024-08-21T23:59:59Z"
  },
  "dimensions": ["model", "service"],
  "metrics": ["sessions", "success_rate", "tokens", "cost"],
  "filters": {
    "model": ["GPT-4", "Claude-3"],
    "status": ["success"]
  },
  "groupBy": "day"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "date": "2024-08-21",
        "model": "GPT-4",
        "sessions": 1234,
        "success_rate": 92.3,
        "tokens": 234567,
        "cost": 45.67
      }
    ],
    "summary": {
      "totalSessions": 25678,
      "avgSuccessRate": 91.8,
      "totalTokens": 4567890,
      "totalCost": 892.34
    }
  }
}
```

### 获取Token成本分析
```http
GET /analytics/token-cost?timeRange={timeRange}&groupBy={groupBy}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "breakdown": [
      {
        "model": "GPT-4",
        "totalCost": 23456,
        "percentage": 51.3,
        "trend": "+12%"
      },
      {
        "model": "Claude-3", 
        "totalCost": 18234,
        "percentage": 39.8,
        "trend": "+8%"
      }
    ],
    "trends": [
      {
        "date": "2024-08-21",
        "GPT-4": 1234,
        "Claude-3": 987,
        "GPT-3.5": 234
      }
    ]
  }
}
```

### 获取工具调用分析
```http
GET /analytics/tool-calls?timeRange={timeRange}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "tools": [
      {
        "name": "query_sales_data",
        "totalCalls": 1234,
        "failedCalls": 12,
        "failureRate": 0.97,
        "avgResponseTime": 0.8
      }
    ],
    "errorAnalysis": [
      {
        "type": "工具超时",
        "count": 89,
        "percentage": 36.3,
        "trend": "up"
      }
    ]
  }
}
```

## 导出功能 API

### 导出会话数据
```http
POST /export/sessions
Content-Type: application/json

{
  "query": {
    "timeRange": {
      "start": "2024-08-01T00:00:00Z", 
      "end": "2024-08-21T23:59:59Z"
    },
    "status": "success"
  },
  "format": "csv" | "json" | "excel",
  "fields": ["id", "userId", "status", "responseTime"],
  "maskSensitiveData": true
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "status": "processing",
    "downloadUrl": null,
    "estimatedTime": 120
  }
}
```

### 获取导出状态
```http
GET /export/{exportId}/status
```

**响应:**
```json
{
  "success": true,
  "data": {
    "exportId": "export_123",
    "status": "completed",
    "downloadUrl": "https://api.kingsoft.com/downloads/export_123.csv",
    "fileSize": 2048576,
    "expiresAt": "2024-08-22T10:00:00Z"
  }
}
```

## 错误处理

### HTTP状态码
- **200** - 请求成功
- **201** - 创建成功
- **400** - 请求参数错误
- **401** - 未授权
- **403** - 权限不足
- **404** - 资源不存在
- **429** - 请求过于频繁
- **500** - 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "请求参数不合法",
    "details": {
      "field": "timeRange",
      "reason": "时间范围格式错误"
    }
  },
  "timestamp": "2024-08-21T08:00:00Z"
}
```

### 常见错误码
| 错误码 | 说明 |
|-------|------|
| `AUTHENTICATION_FAILED` | 认证失败 |
| `PERMISSION_DENIED` | 权限不足 |
| `INVALID_PARAMETER` | 参数不合法 |
| `RESOURCE_NOT_FOUND` | 资源不存在 |
| `RATE_LIMIT_EXCEEDED` | 超过请求频率限制 |
| `INTERNAL_ERROR` | 内部服务器错误 |

## 限流规则

| 接口类型 | 限制 |
|---------|------|
| 认证接口 | 10次/分钟 |
| 读取接口 | 100次/分钟 |
| 写入接口 | 50次/分钟 |
| 导出接口 | 5次/分钟 |

## SDK 示例

### JavaScript/TypeScript
```javascript
import { KingSoftClient } from '@kingsoft/sdk';

const client = new KingSoftClient({
  baseURL: 'https://api.kingsoft.com/v1',
  token: 'your-access-token'
});

// 获取仪表盘指标
const metrics = await client.dashboard.getMetrics({
  timeRange: '24h'
});

// 搜索会话
const sessions = await client.sessions.search({
  query: { status: 'success' },
  pagination: { page: 1, limit: 20 }
});

// 创建实验
const experiment = await client.experiments.create({
  name: '新实验',
  groups: [...]
});
```

### Python
```python
from kingsoft import KingSoftClient

client = KingSoftClient(
    base_url='https://api.kingsoft.com/v1',
    token='your-access-token'
)

# 获取仪表盘指标
metrics = client.dashboard.get_metrics(time_range='24h')

# 搜索会话
sessions = client.sessions.search(
    query={'status': 'success'},
    pagination={'page': 1, 'limit': 20}
)

# 创建实验
experiment = client.experiments.create(
    name='新实验',
    groups=[...]
)
```

## 变更日志

### v1.0.0 (2024-08-21)
- 初始API版本发布
- 支持监控、会话、实验和分析功能
- 完整的认证和权限控制
- 支持数据导出功能

### v1.1.0 (计划中)
- 增加实时WebSocket接口
- 支持批量操作API
- 增加告警配置API
- 优化性能和响应时间

---

**文档版本:** v1.0  
**最后更新:** 2024-08-21  
**联系方式:** api-support@kingsoft.com