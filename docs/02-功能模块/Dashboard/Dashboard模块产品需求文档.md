# Dashboard模块产品需求文档
## 实时监控仪表盘详细设计

**文档版本：** V2.0  
**模块路径：** `/src/pages/Dashboard.tsx`  
**创建日期：** 2024-08-25  
**文档目标：** 提供完整的Dashboard模块实现指南，确保在无状态环境下重现完全相同的交互体验

---

## 1. 功能概述

### 1.1 模块定位
Dashboard是KingSoft平台的核心入口页面，提供数字员工运行状态的实时监控和关键指标展示。用户通过该页面快速了解系统整体健康状况，发现异常并进行初步诊断。

### 1.2 核心价值
- **实时性**：30秒刷新频率的实时指标更新
- **全局性**：系统整体运行状况的综合视图
- **直观性**：关键指标的可视化展示和趋势分析
- **预警性**：异常状态的及时发现和提醒

---

## 2. 用户交互流程

### 2.1 页面加载流程
```
用户访问 → 页面路由跳转 → 加载指标数据 → 渲染UI组件 → 启动定时刷新
```

### 2.2 核心交互路径
```
1. 查看实时指标 → 识别异常 → 点击具体指标 → 查看详细趋势
2. 系统健康检查 → 发现异常服务 → 点击状态卡片 → 跳转处理页面
3. Token成本分析 → 查看模型分布 → 点击模型卡片 → 跳转成本详情
4. 会话统计分析 → 查看成功率 → 点击统计卡片 → 跳转会话列表
```

### 2.3 异常处理流程
```
数据加载失败 → 显示错误状态 → 提供重试按钮 → 记录错误日志
网络超时 → 显示加载状态 → 自动重试3次 → 显示离线提示
```

---

## 2.4 用户故事与业务场景

### 2.4.1 运营人员的监控需求

#### 故事1：实时系统状态监控
**作为一名** 数字员工运营人员  
**我希望** 能够在Dashboard上实时查看系统的整体运行状态  
**以便于** 第一时间发现异常情况，保障服务稳定性

**业务场景：**
王小红是负责数字员工运维的专员，每天早上9点会首先打开Dashboard查看夜间系统运行情况。她需要快速了解：
- 昨夜是否有系统异常？
- 当前有多少用户在线？
- 各项核心指标是否正常？

**痛点分析：**
- 之前需要查看多个系统才能了解整体状况
- 问题发现滞后，用户投诉后才知道异常
- 缺乏趋势对比，无法判断是否需要关注

#### 故事2：异常快速定位
**作为一名** 运营人员  
**我希望** 当看到异常指标时，能够快速定位到具体问题  
**以便于** 及时处理问题，减少对用户的影响

**业务场景：**
当王小红看到失败会话数突然增加时，她需要：
1. 点击失败会话卡片
2. 跳转到Sessions页面查看失败详情
3. 分析失败原因并制定解决方案

### 2.4.2 产品经理的数据洞察需求

#### 故事3：业务指标监控
**作为一名** 产品经理  
**我希望** 能够监控关键业务指标的变化趋势  
**以便于** 评估产品改进效果，制定优化策略

**业务场景：**
李小明作为产品经理，每周会查看Dashboard来：
- 评估上周产品迭代的效果
- 监控用户活跃度和满意度趋势
- 发现需要优化的产品环节

#### 故事4：成本效益分析
**作为一名** 产品经理  
**我希望** 能够实时了解Token使用成本分布  
**以便于** 优化模型配置，控制运营成本

**业务场景：**
李小明需要在月底前评估：
- 哪个模型的成本效益最高？
- Token使用趋势是否合理？
- 是否需要调整模型配置策略？

### 2.4.3 AI工程师的性能分析需求

#### 故事5：系统性能监控
**作为一名** AI工程师  
**我希望** 能够监控系统的技术性能指标  
**以便于** 及时发现性能瓶颈，进行系统优化

**业务场景：**
张小华作为AI工程师，关注：
- 平均响应时间是否在合理范围？
- 系统各组件的健康状态如何？
- 是否存在性能退化趋势？

### 2.4.4 客服主管的质量监控需求

#### 故事6：服务质量评估
**作为一名** 客服主管  
**我希望** 能够监控数字员工的服务成功率  
**以便于** 评估服务质量，制定改进计划

**业务场景：**
赵小军需要每日了解：
- 数字员工整体服务成功率
- 失败会话的主要原因
- 用户满意度变化趋势

## 2.5 关键业务场景深度分析

### 场景1：早高峰流量监控
**时间：** 每日9:00-11:00  
**场景描述：** 运营人员需要密切关注早高峰期间系统负载和用户体验  
**关键指标：** 在线用户数、RPM、响应时间、成功率  
**预期行为：** 
- 发现RPM异常增长时，主动扩容
- 响应时间超过2秒时，检查系统瓶颈
- 成功率下降时，快速定位失败原因

### 场景2：系统升级后监控
**时间：** 系统发布后24小时  
**场景描述：** 工程师需要验证系统升级效果和稳定性  
**关键指标：** 成功率对比、响应时间变化、错误率趋势  
**预期行为：**
- 对比升级前后的关键指标
- 监控异常指标的恢复情况
- 评估升级的业务影响

### 场景3：成本异常调查
**时间：** 月中成本Review  
**场景描述：** 产品经理发现Token成本异常增长  
**关键指标：** 各模型成本分布、Token使用趋势  
**预期行为：**
- 分析成本增长的主要原因
- 识别成本效益最差的模型
- 制定成本优化策略

---

## 3. UI/UX设计规范

### 3.1 页面布局结构

#### 3.1.1 整体布局
```jsx
<PageLayout>
  <PageHeader title="全局监控仪表盘" subtitle="实时监控数字员工的运行状态和关键指标" />
  <PageContent>
    {/* 核心指标网格区域 */}
    <div className="grid-responsive">
      {/* 4个核心指标卡片 */}
    </div>
    
    {/* 详细统计双列布局 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 会话统计卡片 */}
      {/* Token使用统计卡片 */}
    </div>
    
    {/* 系统健康状态全宽布局 */}
    <Card>
      {/* 系统健康状态内容 */}
    </Card>
  </PageContent>
</PageLayout>
```

#### 3.1.2 响应式网格定义
```css
.grid-responsive {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

/* 大屏幕: 4列布局 */
@media (min-width: 1280px) {
  .grid-responsive {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 中屏幕: 2列布局 */
@media (min-width: 768px) and (max-width: 1279px) {
  .grid-responsive {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 小屏幕: 1列布局 */
@media (max-width: 767px) {
  .grid-responsive {
    grid-template-columns: 1fr;
  }
}
```

### 3.2 核心指标卡片设计

#### 3.2.1 MetricCard组件规范
```jsx
<MetricCard
  title="指标名称"        // 简洁明了的标题
  value="数值"           // 主要数值，支持格式化
  icon={IconComponent}   // Lucide React图标
  trend="up|down"        // 趋势方向
  trendValue="+12%"      // 具体趋势数值
  color="blue|green|red|yellow" // 主题色彩
/>
```

#### 3.2.2 卡片视觉规范
- **尺寸**：最小宽度280px，高度120px
- **间距**：卡片间隔24px，内边距24px
- **圆角**：12px统一圆角
- **阴影**：轻微投影增强层次感
- **响应**：hover时略微提升阴影

#### 3.2.3 趋势指示器设计
```jsx
// 上升趋势（绿色）
<span className="text-green-600">
  <TrendingUp className="h-4 w-4 inline mr-1" />
  +12%
</span>

// 下降趋势（红色） 
<span className="text-red-600">
  <TrendingDown className="h-4 w-4 inline mr-1" />
  -5%
</span>

// 平稳趋势（灰色）
<span className="text-gray-600">
  <Minus className="h-4 w-4 inline mr-1" />
  0%
</span>
```

### 3.3 详细统计卡片设计

#### 3.3.1 会话统计卡片结构
```jsx
<Card>
  <CardHeader>
    <h2 className="card-title">会话统计</h2>
    <p className="card-subtitle">近24小时会话概览</p>
  </CardHeader>
  <CardBody>
    {/* 总会话数展示区 */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MessageCircle className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">总会话数</p>
          <p className="text-sm text-gray-500">过去24小时</p>
        </div>
      </div>
      <span className="text-2xl font-bold text-gray-900">
        {metrics.totalSessions}
      </span>
    </div>

    {/* 成功率/失败率双列展示 */}
    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <div className="text-2xl font-bold text-green-600">{successRate}%</div>
        <div className="text-sm text-gray-600">成功率</div>
      </div>
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <div className="text-2xl font-bold text-red-600">{failureRate}%</div>
        <div className="text-sm text-gray-600">失败率</div>
      </div>
    </div>

    {/* 平均响应时间展示 */}
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">平均响应时间</span>
      </div>
      <span className="font-semibold text-gray-900">{metrics.avgResponseTime}ms</span>
    </div>
  </CardBody>
</Card>
```

#### 3.3.2 Token统计卡片结构
```jsx
<Card>
  <CardHeader>
    <h2 className="card-title">Token使用统计</h2>
    <p className="card-subtitle">按模型分类的成本分析</p>
  </CardHeader>
  <CardBody>
    {/* 总Token数展示 */}
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-yellow-100 rounded-lg">
          <Coins className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">总Token数</p>
          <p className="text-sm text-gray-500">所有模型</p>
        </div>
      </div>
      <span className="text-2xl font-bold text-gray-900">
        {metrics.totalTokens.toLocaleString()}
      </span>
    </div>

    {/* 各模型成本详情列表 */}
    <div className="space-y-3">
      {Object.entries(metrics.tokenCostByModel).map(([model, cost]) => (
        <div key={model} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
          <div>
            <div className="font-medium text-gray-900">{model}</div>
            <div className="text-sm text-gray-500">模型成本</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">${cost.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((cost / totalCost) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  </CardBody>
</Card>
```

### 3.4 系统健康状态设计

#### 3.4.1 健康状态卡片网格
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* API服务状态 */}
  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
    <div className="font-semibold text-gray-900">API服务</div>
    <div className="text-sm text-green-600 mt-1">运行正常</div>
    <div className="text-xs text-gray-500 mt-2">响应时间 &lt; 100ms</div>
  </div>

  {/* 数据库状态 */}
  <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
    <div className="font-semibold text-gray-900">数据库</div>
    <div className="text-sm text-green-600 mt-1">连接正常</div>
    <div className="text-xs text-gray-500 mt-2">查询时间 &lt; 50ms</div>
  </div>

  {/* 消息队列状态 */}
  <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
    <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
    <div className="font-semibold text-gray-900">消息队列</div>
    <div className="text-sm text-yellow-600 mt-1">轻微延迟</div>
    <div className="text-xs text-gray-500 mt-2">处理延迟 ~200ms</div>
  </div>
</div>
```

#### 3.4.2 状态指示颜色规范
```jsx
// 状态颜色映射
const statusColors = {
  healthy: {
    bg: 'bg-green-50',
    border: 'border-green-200', 
    icon: 'text-green-600',
    text: 'text-green-600'
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: 'text-yellow-600', 
    text: 'text-yellow-600'
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: 'text-red-600',
    text: 'text-red-600'
  }
};

// 状态图标映射
const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle, 
  error: XCircle
};
```

---

## 4. 业务逻辑详述

### 4.1 三层指标体系详细定义

#### 4.1.1 L1核心业务指标详解

##### 1. 当前在线用户数 (Active Users)
**定义：** 当前正在与数字员工进行对话的活跃用户数量

**计算公式：**
```typescript
activeUsers = 当前时刻有活跃会话的唯一用户数

// 活跃会话判定条件：
// 1. 会话状态为 'running' 或 'active'
// 2. 最后一次交互时间在5分钟内
// 3. 用户未明确结束会话
```

**指标解读：**
- **优秀 (≥100人)**: 用户活跃度高，系统使用频繁
- **良好 (50-99人)**: 用户活跃度正常，稳定使用
- **需改进 (20-49人)**: 活跃用户偏少，需要推广
- **差 (<20人)**: 用户活跃度很低，系统价值未体现

**影响因素：**
- 业务高峰时段
- 系统服务质量
- 用户习惯培养程度
- 推广活动效果

---

##### 2. 每分钟请求数 (RPM - Requests Per Minute)
**定义：** 系统每分钟处理的用户请求总数，反映系统负载和用户活跃度

**计算公式：**
```typescript
rpm = 过去1分钟内接收到的请求总数

// 请求计数规则：
// 1. 统计所有HTTP请求（包括API调用、WebSocket消息）
// 2. 排除健康检查、监控类请求
// 3. 按请求接收时间计算，非处理完成时间
```

**指标解读：**
- **优秀 (≥2000)**: 系统负载高，用户交互频繁
- **良好 (1000-1999)**: 系统负载适中，正常运行
- **需改进 (500-999)**: 系统负载较低，可能存在问题
- **差 (<500)**: 系统几乎无负载，需要检查服务状态

**性能警戒线：**
```typescript
// 性能阈值定义
const rpmThresholds = {
  normal: 3000,      // 正常处理能力
  warning: 4000,     // 需要关注
  critical: 5000     // 需要扩容
};
```

---

##### 3. 会话成功率 (Session Success Rate)
**定义：** 成功完成用户需求的会话占总会话的比例

**计算公式：**
```typescript
sessionSuccessRate = (成功会话数 / 总会话数) × 100%

// 成功会话判定条件：
// 1. 会话状态为 'success' 或 'completed'
// 2. 用户明确表示满意或问题解决
// 3. 会话自然结束且无异常中断
// 4. 最后一轮无用户负面反馈
```

**指标解读：**
- **优秀 (≥85%)**: 服务质量优秀，用户满意度高
- **良好 (70-84%)**: 服务质量良好，有改进空间
- **需改进 (55-69%)**: 服务质量存在问题，需要优化
- **差 (<55%)**: 服务质量差，急需改进

**关联分析：**
```typescript
// 成功率趋势分析
const analyzeSuccessRateTrend = (data: SessionData[]) => {
  const hourlySuccessRate = data.reduce((acc, session) => {
    const hour = new Date(session.startTime).getHours();
    if (!acc[hour]) acc[hour] = { total: 0, success: 0 };
    acc[hour].total++;
    if (session.status === 'success') acc[hour].success++;
    return acc;
  }, {});
  
  return Object.keys(hourlySuccessRate).map(hour => ({
    hour: parseInt(hour),
    successRate: (hourlySuccessRate[hour].success / hourlySuccessRate[hour].total) * 100
  }));
};
```

---

##### 4. 平均响应时间 (Average Response Time)
**定义：** 从用户发送消息到收到AI回复的平均时长

**计算公式：**
```typescript
avgResponseTime = Σ(每次响应时间) / 响应次数

// 响应时间计算：
responseTime = AI回复时间戳 - 用户消息时间戳

// 排除异常值的计算：
avgResponseTimeFiltered = 排除超过30秒的异常响应后的平均值
```

**指标解读：**
- **优秀 (<2秒)**: 响应极快，用户体验优秀
- **良好 (2-5秒)**: 响应合理，可接受的等待时间
- **需改进 (5-10秒)**: 响应偏慢，影响用户体验
- **差 (>10秒)**: 响应过慢，用户体验很差

**性能优化建议：**
```typescript
// 响应时间优化策略
const optimizationStrategies = {
  '<2s': '保持现状，继续监控',
  '2-5s': '考虑模型优化和缓存策略',
  '5-10s': '需要优化推理速度，检查网络延迟',
  '>10s': '紧急优化，检查系统瓶颈和资源配置'
};
```

#### 4.1.2 L2支撑分析指标详解

##### 1. Token成本效率 (Token Cost Efficiency)
**定义：** 单位成本产生的有效对话价值，衡量成本控制效果

**计算公式：**
```typescript
tokenCostEfficiency = 总有效会话数 / 总Token成本

// 成本分析维度
const costAnalysis = {
  costPerSuccessfulSession: 总Token成本 / 成功会话数,
  costPerToken: 总费用 / 总Token数,
  costPerMinute: 总费用 / 总服务时长(分钟)
};
```

**指标解读：**
- **优秀 (≥20)**: 成本控制优秀，投入产出效率高
- **良好 (10-19)**: 成本控制良好，效率合理
- **需改进 (5-9)**: 成本偏高，需要优化策略
- **差 (<5)**: 成本过高，严重影响可持续性

---

##### 2. 系统稳定性指数 (System Stability Index)
**定义：** 综合评估系统各组件健康状态的稳定性指数

**计算公式：**
```typescript
stabilityIndex = (
  apiServiceScore × 0.4 + 
  databaseScore × 0.3 + 
  messageQueueScore × 0.2 + 
  networkScore × 0.1
) / 1.0

// 各组件评分标准
const componentScores = {
  healthy: 100,
  warning: 70,
  error: 30,
  unavailable: 0
};
```

**指标解读：**
- **优秀 (≥90分)**: 系统非常稳定，各组件运行良好
- **良好 (70-89分)**: 系统基本稳定，少数组件需关注
- **需改进 (50-69分)**: 系统不够稳定，存在风险
- **差 (<50分)**: 系统不稳定，需要紧急处理

---

##### 3. 用户体验满意度 (User Experience Satisfaction)
**定义：** 基于用户行为和反馈的综合满意度评估

**计算公式：**
```typescript
uxSatisfaction = (
  会话完成率 × 0.3 +
  平均会话时长适宜度 × 0.2 +
  重复咨询率低程度 × 0.2 +
  用户反馈正面率 × 0.3
) × 100

// 适宜度计算
const sessionDurationSuitability = (avgDuration: number) => {
  // 理想会话时长：2-8分钟
  if (avgDuration >= 2 && avgDuration <= 8) return 1.0;
  if (avgDuration < 2) return 0.7; // 可能过于简单
  if (avgDuration > 8) return Math.max(0.3, 1 - (avgDuration - 8) * 0.1);
};
```

**指标解读：**
- **优秀 (≥85分)**: 用户体验优秀，满意度很高
- **良好 (70-84分)**: 用户体验良好，整体满意
- **需改进 (55-69分)**: 用户体验一般，需要改进
- **差 (<55分)**: 用户体验差，需要重大改进

#### 4.1.3 L3技术监控指标详解

##### 1. 系统资源利用率 (Resource Utilization Rate)
**定义：** 系统CPU、内存、网络等资源的综合利用效率

**计算公式：**
```typescript
resourceUtilization = {
  cpu: 当前CPU使用率,
  memory: 当前内存使用率,
  network: 网络带宽使用率,
  disk: 磁盘I/O使用率
};

// 综合利用率
overallUtilization = (
  cpu × 0.35 + 
  memory × 0.30 + 
  network × 0.20 + 
  disk × 0.15
);
```

**指标解读：**
- **优秀 (60-80%)**: 资源利用充分且不过载
- **良好 (40-59% 或 81-90%)**: 资源利用合理
- **需关注 (20-39% 或 91-95%)**: 资源利用不足或接近上限
- **异常 (<20% 或 >95%)**: 资源配置需要调整

---

##### 2. 错误率监控 (Error Rate Monitoring)
**定义：** 系统各层级错误发生的频率和严重程度

**计算公式：**
```typescript
errorRates = {
  // 4xx客户端错误率
  clientErrorRate: (4xx状态码请求数 / 总请求数) × 100,
  
  // 5xx服务端错误率  
  serverErrorRate: (5xx状态码请求数 / 总请求数) × 100,
  
  // AI推理错误率
  aiInferenceErrorRate: (推理失败次数 / 总推理次数) × 100,
  
  // 工具调用错误率
  toolCallErrorRate: (工具调用失败次数 / 总工具调用次数) × 100
};

// 综合错误率
overallErrorRate = (
  serverErrorRate × 0.4 +
  aiInferenceErrorRate × 0.3 +
  toolCallErrorRate × 0.2 +
  clientErrorRate × 0.1
);
```

**指标解读：**
- **优秀 (<0.1%)**: 系统极其稳定，错误很少
- **良好 (0.1-0.5%)**: 系统稳定，错误率可接受
- **需改进 (0.5-2.0%)**: 错误率偏高，需要优化
- **差 (>2.0%)**: 错误率过高，影响用户体验

---

##### 3. 性能响应分布 (Response Time Distribution)
**定义：** 系统响应时间的统计分布情况

**计算公式：**
```typescript
responseTimeDistribution = {
  p50: 50%请求的响应时间,
  p75: 75%请求的响应时间,
  p90: 90%请求的响应时间,
  p95: 95%请求的响应时间,
  p99: 99%请求的响应时间
};

// 性能等级评估
const performanceGrade = (p95: number) => {
  if (p95 < 2000) return '优秀';
  if (p95 < 5000) return '良好';  
  if (p95 < 10000) return '需改进';
  return '差';
};
```

**指标解读：**
- **P95 < 2秒**: 系统性能优秀
- **P95 2-5秒**: 系统性能良好
- **P95 5-10秒**: 性能需要改进
- **P95 > 10秒**: 性能差，需要紧急优化

### 4.2 数据获取逻辑

#### 4.2.1 指标数据结构
```typescript
interface DashboardMetrics {
  // L1核心业务指标
  activeUsers: number;           // 当前在线用户数
  rpm: number;                   // 每分钟请求数
  sessionSuccessRate: number;    // 会话成功率
  avgResponseTime: number;       // 平均响应时间(ms)
  
  // L2支撑分析指标
  tokenCostEfficiency: number;   // Token成本效率
  systemStabilityIndex: number;  // 系统稳定性指数
  uxSatisfaction: number;        // 用户体验满意度
  
  // L3技术监控指标
  resourceUtilization: {         // 资源利用率
    cpu: number;
    memory: number;
    network: number;
    disk: number;
    overall: number;
  };
  errorRates: {                  // 错误率监控
    client: number;
    server: number;
    aiInference: number;
    toolCall: number;
    overall: number;
  };
  responseTimeDistribution: {    // 响应时间分布
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  
  // 传统指标（保持兼容）
  totalSessions: number;         // 总会话数
  successSessions: number;       // 成功会话数
  failedSessions: number;        // 失败会话数
  totalTokens: number;           // 总Token数
  tokenCostByModel: {            // 按模型分类的成本
    [modelName: string]: number;
  };
  systemHealth: {                // 系统健康状态
    apiService: 'healthy' | 'warning' | 'error';
    database: 'healthy' | 'warning' | 'error'; 
    messageQueue: 'healthy' | 'warning' | 'error';
  };
}
```

#### 4.2.2 数据计算逻辑
// 成功率计算
const successRate = (metrics.successSessions / metrics.totalSessions * 100).toFixed(1);

// 失败率计算  
const failureRate = (metrics.failedSessions / metrics.totalSessions * 100).toFixed(1);

// 成本占比计算
const totalCost = Object.values(metrics.tokenCostByModel).reduce((a, b) => a + b, 0);
const costPercentage = (cost / totalCost * 100).toFixed(1);

// 趋势值计算（与前一时段对比）
const calculateTrend = (current: number, previous: number): string => {
  const change = ((current - previous) / previous * 100).toFixed(1);
  return change >= 0 ? `+${change}%` : `${change}%`;
};
```

### 4.2 实时更新机制

#### 4.2.1 定时刷新逻辑
```typescript
const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockDashboardMetrics);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    // 30秒刷新间隔
    const interval = setInterval(() => {
      fetchDashboardMetrics().then(newMetrics => {
        setMetrics(newMetrics);
        setLastUpdate(new Date());
      }).catch(error => {
        console.error('Failed to fetch dashboard metrics:', error);
        // 保持现有数据，显示错误提示
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    // Dashboard JSX
  );
};
```

#### 4.2.2 错误处理机制
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchDashboardMetrics = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const response = await api.getDashboardMetrics();
    return response.data;
  } catch (err) {
    setError('数据加载失败，请稍后重试');
    throw err;
  } finally {
    setLoading(false);
  }
};
```

### 4.3 交互行为逻辑

#### 4.3.1 指标卡片点击行为
```typescript
const handleMetricClick = (metricType: string, value: any) => {
  switch (metricType) {
    case 'activeUsers':
      // 跳转到实时会话监控页面
      navigate('/sessions?filter=active');
      break;
    case 'successSessions':
      // 跳转到成功会话列表
      navigate('/sessions?status=success'); 
      break;
    case 'failedSessions':
      // 跳转到失败会话列表
      navigate('/sessions?status=failed');
      break;
    case 'tokenCost':
      // 跳转到成本分析页面
      navigate('/analytics?view=cost');
      break;
    default:
      console.warn('Unhandled metric click:', metricType);
  }
};
```

#### 4.3.2 系统状态点击行为
```typescript
const handleSystemStatusClick = (service: string) => {
  switch (service) {
    case 'apiService':
      // 跳转到API监控页面
      navigate('/system/api-status');
      break;
    case 'database': 
      // 跳转到数据库监控页面
      navigate('/system/database-status');
      break;
    case 'messageQueue':
      // 跳转到队列监控页面  
      navigate('/system/queue-status');
      break;
  }
};
```

---

## 5. 状态管理逻辑

### 5.1 组件状态结构
```typescript
interface DashboardState {
  metrics: DashboardMetrics;     // 核心指标数据
  loading: boolean;              // 加载状态
  error: string | null;          // 错误信息
  lastUpdate: Date;              // 最后更新时间
  autoRefresh: boolean;          // 自动刷新开关
}
```

### 5.2 状态更新流程
```typescript
// 初始状态
const initialState: DashboardState = {
  metrics: mockDashboardMetrics,
  loading: false,
  error: null,
  lastUpdate: new Date(),
  autoRefresh: true
};

// 状态更新函数
const updateMetrics = (newMetrics: DashboardMetrics) => {
  setMetrics(newMetrics);
  setLastUpdate(new Date());
  setError(null);
};

const setLoadingState = (isLoading: boolean) => {
  setLoading(isLoading);
};

const setErrorState = (errorMessage: string) => {
  setError(errorMessage);
  setLoading(false);
};
```

### 5.3 缓存策略
```typescript
// 本地缓存策略
const CACHE_KEY = 'dashboard_metrics';
const CACHE_DURATION = 60000; // 1分钟

const getCachedMetrics = (): DashboardMetrics | null => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  
  return data;
};

const setCachedMetrics = (metrics: DashboardMetrics) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: metrics,
    timestamp: Date.now()
  }));
};
```

---

## 6. 性能优化要求

### 6.1 渲染优化
```typescript
// 使用memo优化组件重渲染
const MetricCard = memo(({ title, value, icon, trend, trendValue, color }) => {
  return (
    // MetricCard JSX
  );
});

// 使用useMemo优化计算
const calculatedMetrics = useMemo(() => ({
  successRate: (metrics.successSessions / metrics.totalSessions * 100).toFixed(1),
  failureRate: (metrics.failedSessions / metrics.totalSessions * 100).toFixed(1),
  totalCost: Object.values(metrics.tokenCostByModel).reduce((a, b) => a + b, 0)
}), [metrics]);
```

### 6.2 网络优化
```typescript
// 请求去重
const requestCache = new Map();

const fetchWithCache = async (url: string) => {
  if (requestCache.has(url)) {
    return requestCache.get(url);
  }
  
  const promise = fetch(url).then(res => res.json());
  requestCache.set(url, promise);
  
  // 5分钟后清除缓存
  setTimeout(() => requestCache.delete(url), 300000);
  
  return promise;
};
```

### 6.3 加载性能要求
- **首次加载时间**：< 2秒
- **数据刷新时间**：< 1秒  
- **页面切换时间**：< 0.5秒
- **内存使用**：< 50MB

---

## 7. 异常处理机制

### 7.1 网络异常处理
```typescript
const handleNetworkError = (error: any) => {
  if (error.code === 'NETWORK_ERROR') {
    setError('网络连接失败，请检查网络设置');
  } else if (error.code === 'TIMEOUT') {
    setError('请求超时，请稍后重试');  
  } else if (error.status === 401) {
    setError('登录已过期，请重新登录');
    navigate('/login');
  } else if (error.status >= 500) {
    setError('服务器错误，请稍后重试');
  } else {
    setError('数据加载失败，请刷新页面');
  }
};
```

### 7.2 数据异常处理
```typescript
const validateMetrics = (metrics: any): boolean => {
  // 检查必要字段
  const requiredFields = ['activeUsers', 'rpm', 'totalSessions', 'successSessions', 'failedSessions'];
  
  for (const field of requiredFields) {
    if (typeof metrics[field] !== 'number' || metrics[field] < 0) {
      console.error(`Invalid metric field: ${field}`, metrics[field]);
      return false;
    }
  }
  
  // 检查逻辑合理性
  if (metrics.successSessions + metrics.failedSessions > metrics.totalSessions) {
    console.error('Invalid session counts');
    return false;
  }
  
  return true;
};
```

### 7.3 UI异常状态展示
```jsx
// 错误状态展示
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
    <div className="flex items-center">
      <XCircle className="h-5 w-5 text-red-600 mr-3" />
      <div>
        <p className="text-red-800 font-medium">数据加载失败</p>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
      <button 
        onClick={() => window.location.reload()} 
        className="ml-auto text-red-600 hover:text-red-700"
      >
        重试
      </button>
    </div>
  </div>
)}

// 加载状态展示
{loading && (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className="h-6 w-6 animate-spin text-primary-600 mr-3" />
    <span className="text-gray-600">正在加载数据...</span>
  </div>
)}
```

---

## 8. 测试用例规范

### 8.1 功能测试用例
```typescript
describe('Dashboard Component', () => {
  test('渲染所有核心指标卡片', () => {
    render(<Dashboard />);
    expect(screen.getByText('当前在线用户')).toBeInTheDocument();
    expect(screen.getByText('每分钟请求数')).toBeInTheDocument(); 
    expect(screen.getByText('成功会话')).toBeInTheDocument();
    expect(screen.getByText('失败会话')).toBeInTheDocument();
  });
  
  test('正确计算并显示成功率', () => {
    const metrics = { successSessions: 80, totalSessions: 100, failedSessions: 20 };
    render(<Dashboard metrics={metrics} />);
    expect(screen.getByText('80.0%')).toBeInTheDocument();
  });
  
  test('点击指标卡片跳转到对应页面', () => {
    const navigate = jest.fn();
    render(<Dashboard navigate={navigate} />);
    fireEvent.click(screen.getByText('成功会话'));
    expect(navigate).toHaveBeenCalledWith('/sessions?status=success');
  });
});
```

### 8.2 性能测试用例
```typescript
test('页面加载性能', async () => {
  const startTime = performance.now();
  render(<Dashboard />);
  await waitFor(() => screen.getByText('全局监控仪表盘'));
  const loadTime = performance.now() - startTime;
  expect(loadTime).toBeLessThan(2000); // 2秒内完成加载
});
```

---

## 9. 开发实现指南

### 9.1 必需依赖包
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.8.0", 
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### 9.2 组件导入清单
```typescript
// 页面布局组件
import { PageLayout, PageHeader, PageContent } from '../components/ui';

// UI组件
import { MetricCard, Card, CardHeader, CardBody } from '../components/ui';

// 图标组件
import { 
  Users, Zap, MessageCircle, CheckCircle, XCircle, Clock, Coins, AlertTriangle,
  TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';

// 数据和类型
import { mockDashboardMetrics } from '../data/mockData';
import type { DashboardMetrics } from '../types';
```

### 9.3 CSS类名规范
```scss
// 页面级样式类
.grid-responsive { /* 响应式网格 */ }
.card-title { /* 卡片标题 */ }  
.card-subtitle { /* 卡片副标题 */ }

// 状态指示样式类
.text-green-600 { /* 成功状态文字 */ }
.text-red-600 { /* 失败状态文字 */ }
.text-yellow-600 { /* 警告状态文字 */ }
.bg-green-50 { /* 成功状态背景 */ }
.bg-red-50 { /* 失败状态背景 */ }

// 布局样式类
.flex { /* 弹性布局 */ }
.grid { /* 网格布局 */ }
.space-y-4 { /* 垂直间距 */ }
.gap-6 { /* 网格间距 */ }
```

---

## 10. 数据Mock规范

### 10.1 Mock数据结构
```typescript
export const mockDashboardMetrics: DashboardMetrics = {
  activeUsers: 147,
  rpm: 2340,
  totalSessions: 1250,
  successSessions: 1100,
  failedSessions: 150,
  avgResponseTime: 1200,
  totalTokens: 892450,
  tokenCostByModel: {
    'GPT-4': 234.56,
    'Claude-3': 187.23,
    'GPT-3.5': 98.67
  },
  systemHealth: {
    apiService: 'healthy',
    database: 'healthy', 
    messageQueue: 'warning'
  }
};
```

### 10.2 动态Mock更新
```typescript
// 模拟实时数据变化
export const generateDynamicMetrics = (): DashboardMetrics => {
  const baseMetrics = { ...mockDashboardMetrics };
  
  // 在基础数据上添加随机波动
  baseMetrics.activeUsers += Math.floor(Math.random() * 20) - 10;
  baseMetrics.rpm += Math.floor(Math.random() * 100) - 50;
  baseMetrics.avgResponseTime += Math.floor(Math.random() * 200) - 100;
  
  // 确保数据合理性
  baseMetrics.activeUsers = Math.max(0, baseMetrics.activeUsers);
  baseMetrics.rpm = Math.max(0, baseMetrics.rpm);
  baseMetrics.avgResponseTime = Math.max(100, baseMetrics.avgResponseTime);
  
  return baseMetrics;
};
```

---

## 11. 详细验收标准 (Acceptance Criteria)

### 11.1 功能验收标准

#### AC-1: 实时指标显示功能
**验收条件：**
- [ ] 页面加载时，四个核心指标卡片全部正确显示
- [ ] 每个指标卡片包含：指标名称、当前数值、趋势箭头、变化百分比
- [ ] 趋势显示逻辑正确：上升显示绿色↑，下降显示红色↓
- [ ] 数值格式化正确：用户数显示整数，RPM显示千分位，时间显示ms单位
- [ ] 所有数据来源于实际数据接口，非硬编码

**验收测试：**
```gherkin
Given 用户打开Dashboard页面
When 页面加载完成
Then 应该看到四个指标卡片：在线用户数、每分钟请求数、成功会话、失败会话
And 每个卡片显示具体数值和趋势变化
And 数值格式符合业务要求
```

#### AC-2: 实时更新机制
**验收条件：**
- [ ] 页面每30秒自动刷新数据
- [ ] 刷新时不刷新整个页面，仅更新数据
- [ ] 更新过程中显示适当的加载指示器
- [ ] 用户可以手动触发立即刷新
- [ ] 页面失焦时暂停自动刷新，重新聚焦时恢复

**验收测试：**
```gherkin
Given 用户在Dashboard页面
When 等待30秒
Then 页面数据应该自动更新
And 不应该有页面闪烁或重新加载
When 用户点击刷新按钮
Then 数据应该立即更新
```

#### AC-3: 会话统计详情展示
**验收条件：**
- [ ] 显示24小时内总会话数、成功率、失败率
- [ ] 成功率和失败率相加等于100%
- [ ] 平均响应时间显示为毫秒，精确到整数
- [ ] 统计数据与会话明细页面数据一致
- [ ] 点击统计卡片能跳转到Sessions页面

**验收测试：**
```gherkin
Given Dashboard显示会话统计
When 检查成功率和失败率
Then 两者相加应该等于100%
When 点击会话统计卡片
Then 应该跳转到Sessions页面
```

#### AC-4: Token成本分析
**验收条件：**
- [ ] 显示各模型的Token使用量和成本
- [ ] 成本按模型分类显示，包含占比
- [ ] 成本数据精确到小数点后2位
- [ ] 成本趋势变化显示正确的百分比和方向
- [ ] 点击成本卡片跳转到Analytics页面

### 11.2 性能验收标准

#### AC-5: 页面加载性能
**验收条件：**
- [ ] 首次页面加载时间 < 2秒（50th percentile）
- [ ] 数据刷新响应时间 < 1秒（95th percentile）
- [ ] 页面内存使用 < 50MB
- [ ] 图表和指标渲染时间 < 500ms

**验收测试：**
```javascript
// 性能测试
const startTime = performance.now();
await page.goto('/dashboard');
await page.waitForSelector('[data-testid="metric-cards"]');
const loadTime = performance.now() - startTime;
expect(loadTime).toBeLessThan(2000);
```

#### AC-6: 响应式设计
**验收条件：**
- [ ] 在1920x1080分辨率下显示4列指标卡片
- [ ] 在1024x768分辨率下显示2列指标卡片  
- [ ] 在768px以下宽度显示1列指标卡片
- [ ] 所有文字和图标在不同分辨率下清晰可读
- [ ] 触控设备上的交互元素大小合适（最小44x44px）

### 11.3 交互验收标准

#### AC-7: 异常状态处理
**验收条件：**
- [ ] 数据加载失败时显示友好错误提示
- [ ] 提供重试按钮且功能正常
- [ ] 网络断开时显示离线状态提示
- [ ] 部分数据失败时不影响其他模块显示
- [ ] 错误状态下仍保持页面布局完整

**验收测试：**
```gherkin
Given 网络连接异常
When 用户访问Dashboard
Then 应该显示错误提示消息
And 显示重试按钮
When 用户点击重试按钮
Then 应该重新尝试加载数据
```

#### AC-8: 用户交互反馈
**验收条件：**
- [ ] 所有可点击元素有hover效果
- [ ] 点击指标卡片有视觉反馈
- [ ] 加载状态显示适当的动画
- [ ] 跳转链接正确且在新标签页打开
- [ ] 键盘导航支持完整

### 11.4 数据准确性验收标准

#### AC-9: 数据一致性
**验收条件：**
- [ ] Dashboard显示的数据与后端API返回数据完全一致
- [ ] 指标计算公式正确（成功率 = 成功数/总数）
- [ ] 趋势计算基于与上一时段的对比
- [ ] 异常数据（如负数、null值）得到正确处理
- [ ] 数据更新时间戳显示准确

### 11.5 安全性验收标准

#### AC-10: 数据安全
**验收条件：**
- [ ] 敏感数据（如具体用户信息）不在前端显示
- [ ] API调用包含适当的认证信息
- [ ] 错误信息不泄露系统内部结构
- [ ] 用户权限控制正确实施
- [ ] XSS和CSRF攻击防护到位

### 11.6 可用性验收标准

#### AC-11: 用户体验
**验收条件：**
- [ ] 界面元素符合直觉，无需培训即可使用
- [ ] 重要信息在视觉层次中突出显示
- [ ] 色彩搭配对色盲用户友好
- [ ] 支持键盘快捷键操作
- [ ] 提供适当的帮助提示

**验收测试：**
```gherkin
Given 新用户首次使用Dashboard
When 用户查看页面
Then 应该能在10秒内理解主要功能
And 能够识别当前系统状态是否正常
When 用户需要查看详细信息  
Then 应该能直观地找到相关操作入口
```

---

**实现完成标准：**
✅ 四个核心指标卡片正确渲染并显示趋势  
✅ 会话统计和Token统计卡片完整实现  
✅ 系统健康状态三个服务的状态展示  
✅ 所有交互行为正确响应  
✅ 响应式布局在各屏幕尺寸下正常工作  
✅ 30秒自动刷新机制正常运行  
✅ 错误处理和加载状态正确显示