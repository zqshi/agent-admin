# Analytics模块产品需求文档
## 多维度数据分析平台详细设计

**文档版本：** V2.0  
**模块路径：** `/src/pages/Analytics.tsx`  
**创建日期：** 2024-08-25  
**文档目标：** 提供完整的数据分析平台实现指南，支持多维度数据挖掘和智能洞察分析

---

## 1. 功能概述

### 1.1 模块定位
Analytics模块是KingSoft平台的核心数据洞察中心，提供多维度、多指标的数据分析能力。通过灵活的筛选机制、可视化图表和智能分析，帮助用户发现数据价值，支持业务决策优化。

### 1.2 核心价值
- **多维分析**：支持模型、服务、用户、时间等多个维度的交叉分析
- **实时洞察**：提供实时数据更新和趋势分析
- **成本优化**：详细的Token成本分析和优化建议
- **性能监控**：工具调用性能和错误分析
- **决策支持**：基于数据的智能建议和优化方向

### 1.3 分析能力
- **Token成本分析**：按模型分类的成本分布和趋势分析
- **工具性能分析**：调用统计、失败率、响应时间分析
- **错误类型分析**：问题分类统计和趋势监控
- **多维度筛选**：时间、维度、指标的灵活组合分析
- **数据导出**：支持分析结果的导出和分享

---

## 2. 用户故事与业务场景说明

### 2.1 财务管理人员视角

#### 故事1：Token成本精确控制

**用户故事：**  
作为一名财务管理人员  
我希望能够实时监控和分析不同AI模型的Token使用成本  
以便于准确控制预算并优化成本结构

**业务场景：** 每月底需要制作成本报告给CEO，需要精确知道GPT-4、Claude等不同模型的使用成本分布，识别成本异常增长的原因。月度预算为50万元，需要确保不超支且能提前预警。

**痛点分析：** 
- AI模型成本不透明，Token消耗量大但难以预测月度总成本
- 缺乏按部门、项目、时间维度的精细化成本分摊数据
- 成本异常时无法快速追溯到具体的使用源头和原因
- 预算制定缺乏历史数据支撑，容易出现大幅偏差

**验收标准：**
- [ ] 支持查看最近7天/30天/90天的各模型成本趋势图表
- [ ] 显示各模型成本占比饼图和环比变化百分比
- [ ] 支持按部门、用户、项目维度多层级筛选成本数据
- [ ] 提供成本异常预警功能（当日/周成本超过阈值10%自动邮件提醒）
- [ ] 能导出Excel格式的详细成本分析报告，包含明细数据
- [ ] 基于历史数据提供下月成本趋势预测，准确率≥85%

---

#### 故事2：成本效益比分析

**用户故事：**  
作为一名财务管理人员  
我希望分析不同AI模型的成本效益比和ROI  
以便于制定更合理的模型使用策略和预算分配

**业务场景：** 发现GPT-4成本占总预算60%但不确定是否物有所值，需要对比各个模型的成功率、用户满意度与成本的关系，为技术团队提供模型选择的财务建议。

**痛点分析：**
- 只能看到成本数字，缺乏效果评价和价值衡量维度
- 无法判断高成本模型是否真正带来更好的业务效果
- 缺乏不同模型间的横向对比分析和决策依据
- 预算分配主观性强，缺乏数据化的投资回报分析

**验收标准：**
- [ ] 显示各模型的单次成功会话成本、平均处理时间等效率指标
- [ ] 提供模型性能vs成本的多维散点图分析
- [ ] 支持自定义时间范围的ROI计算和对比分析
- [ ] 能分析同类任务下不同模型的效率和成本差异
- [ ] 自动生成模型使用优化建议报告（如：建议将简单查询切换到成本更低的模型）
- [ ] 支持设置成本效益目标值，监控实际达成情况

### 2.2 技术管理者视角

#### 故事3：系统性能瓶颈识别

**用户故事：**  
作为一名技术管理者  
我希望通过数据分析快速识别系统性能瓶颈和问题根源  
以便于指导团队进行针对性优化，提升整体系统效率

**业务场景：** 用户反馈系统响应变慢，投诉增加20%，需要在2小时内定位是哪些工具、哪种请求类型或哪个时间段导致的性能问题，并制定优化方案。

**痛点分析：**
- 性能问题定位耗时长，需要查看多个系统和日志才能确定根因
- 缺乏系统性的性能趋势分析，难以预防性发现问题
- 优化工作缺乏数据支撑，效果难以量化评估
- 无法快速区分是系统负载、模型响应还是网络问题

**验收标准：**
- [ ] 实时显示所有工具的平均响应时间排名和异常标识
- [ ] 提供响应时间超过阈值(>3秒)的工具告警列表和详情
- [ ] 支持按小时、天、周维度对比优化前后的性能数据
- [ ] 能drill-down到具体工具的调用量、失败率、响应时间分布
- [ ] 自动生成性能瓶颈分析报告，包含问题定位和改进建议
- [ ] 支持设置多级性能监控阈值，不同级别触发不同处理流程

---

#### 故事4：工具使用效率优化

**用户故事：**  
作为一名技术管理者  
我希望分析各种工具的使用效率、成功率和稳定性  
以便于优化工具配置、替换低效工具，提升整体系统可靠性

**业务场景：** 系统集成了30多个工具，需要定期评估哪些工具使用频率高但成功率低（如某个查询工具调用量大但经常超时），需要重点优化或考虑替换方案。

**痛点分析：**
- 工具质量参差不齐，部分工具拖累整体服务质量
- 缺乏工具使用效率的量化评估标准和对比机制
- 无法识别需要重点关注和优化的高优先级工具
- 工具替换决策缺乏数据支撑，风险难以评估

**验收标准：**
- [ ] 展示工具调用量vs成功率的四象限矩阵分析图
- [ ] 提供工具稳定性趋势分析（7天/30天成功率变化曲线）
- [ ] 支持按工具类型、部门、时间段等维度筛选和对比分析
- [ ] 自动识别高频使用但低成功率的工具，标记为优化重点
- [ ] 提供工具优化优先级评分和排序建议
- [ ] 支持工具替换影响分析（预估替换后的效果提升）

### 2.3 数据分析师视角

#### 故事5：深度数据挖掘分析

**用户故事：**  
作为一名数据分析师  
我希望进行多维度的数据交叉分析和深度挖掘  
以便于发现隐藏的业务洞察和系统优化机会

**业务场景：** 需要分析用户行为模式（如高峰时段使用特征）、不同部门的AI使用偏好、模型效果与业务指标的关联性等，为产品优化和业务决策提供数据洞察。

**痛点分析：**
- 现有报表维度单一，无法进行复杂的多维度关联分析
- 缺乏灵活的数据探索工具，难以验证分析假设
- 数据可视化能力有限，无法直观展示复杂的数据关系
- 异常数据和趋势变化需要手动发现，效率低下

**验收标准：**
- [ ] 支持任意维度组合的交叉分析（时间+部门+模型+用户等）
- [ ] 提供数据下钻(drill-down)和上卷(roll-up)功能
- [ ] 支持自定义分析指标计算公式和派生字段
- [ ] 能生成多种类型的动态数据可视化图表（热力图、桑基图等）
- [ ] 支持同比、环比等多种数据对比分析模式
- [ ] 提供异常数据点的自动检测、标注和告警功能

---

## 3. 用户交互流程

### 3.1 主要用户路径

#### 3.1.1 数据分析主流程
```
进入分析页面 → 设置筛选条件 → 查看分析结果 → 深入钻取数据 → 导出分析报告
```

#### 3.1.2 成本分析流程
```
选择成本指标 → 设置时间范围 → 查看模型成本分布 → 分析成本趋势 → 制定优化方案
```

#### 3.1.3 问题排查流程
```
发现异常指标 → 筛选错误类型 → 查看详细统计 → 分析根因 → 制定改进措施
```

### 3.2 筛选交互流程
```
1. 时间筛选：选择时间范围 → 数据实时更新 → 显示时间标签
2. 维度筛选：选择分析维度 → 切换数据视图 → 更新图表展示
3. 指标筛选：选择关注指标 → 数据重新计算 → 图表自动适配
4. 组合筛选：多条件联动 → 交叉分析 → 精准定位问题
```

### 3.3 数据操作流程
```
查看分析结果 → 点击刷新数据 → 选择导出格式 → 下载分析报告 → 分享给团队
```

---

## 3. UI/UX设计规范

### 3.1 页面整体布局

#### 3.1.1 页面布局结构
```jsx
<PageLayout>
  <PageHeader 
    title="数据分析" 
    subtitle="多维度分析数字员工的运行数据和性能指标"
  >
    <div className="flex gap-2">
      <Button variant="ghost">
        <RefreshCw className="h-4 w-4" />
        刷新
      </Button>
      <Button variant="secondary">
        <Download className="h-4 w-4" />
        导出
      </Button>
    </div>
  </PageHeader>

  <PageContent>
    {/* 筛选条和操作栏 */}
    <Card>
      <CardBody>
        <FilterSection {...filterProps} />
      </CardBody>
    </Card>

    {/* Token成本分析 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <TokenCostAnalysis />
      <TrendAnalysisChart />
    </div>

    {/* 工具调用分析 */}
    <Card>
      <ToolPerformanceTable />
    </Card>

    {/* 问题分析 */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ErrorDistributionAnalysis />
      <KeyMetricsCards />
    </div>
  </PageContent>
</PageLayout>
```

### 3.2 筛选区域设计

#### 3.2.1 水平筛选布局
```jsx
<Card>
  <CardBody>
    <div className="flex flex-wrap items-center justify-between gap-4">
      {/* 筛选器组 */}
      <FilterSection
        searchProps={{
          value: searchTerm,
          onChange: setSearchTerm,
          placeholder: "搜索数据..."
        }}
        filters={[
          {
            key: 'timeRange',
            placeholder: '选择时间范围',
            value: selectedTimeRange,
            onChange: setSelectedTimeRange,
            showIcon: true,
            options: [
              { value: '1d', label: '近 1 天' },
              { value: '7d', label: '近 7 天' },
              { value: '30d', label: '近 30 天' },
              { value: '90d', label: '近 90 天' }
            ],
            className: 'min-w-[120px]'
          },
          {
            key: 'dimension', 
            placeholder: '选择分析维度',
            value: selectedDimension,
            onChange: setSelectedDimension,
            showIcon: true,
            options: [
              { value: 'model', label: '模型' },
              { value: 'service', label: '服务' },
              { value: 'user', label: '用户' },
              { value: 'time', label: '时间' }
            ],
            className: 'min-w-[100px]'
          },
          {
            key: 'metric',
            placeholder: '选择指标',
            value: selectedMetric,
            onChange: setSelectedMetric,
            showIcon: true,
            options: [
              { value: 'tokens', label: 'Token消耗' },
              { value: 'cost', label: '成本' },
              { value: 'sessions', label: '会话数' },
              { value: 'success_rate', label: '成功率' }
            ],
            className: 'min-w-[120px]'
          }
        ]}
        layout="horizontal"
        showCard={false}
        className="flex-1"
      />
      
      {/* 操作按钮组 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="h-4 w-4" />
          导出
        </Button>
      </div>
    </div>
  </CardBody>
</Card>
```

#### 3.2.2 筛选器联动逻辑
```typescript
const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
const [selectedDimension, setSelectedDimension] = useState('model');
const [selectedMetric, setSelectedMetric] = useState('tokens');

// 筛选器联动更新
useEffect(() => {
  const newData = fetchAnalyticsData({
    timeRange: selectedTimeRange,
    dimension: selectedDimension,
    metric: selectedMetric
  });
  setAnalyticsData(newData);
}, [selectedTimeRange, selectedDimension, selectedMetric]);

// 动态更新可用选项
const availableMetrics = useMemo(() => {
  if (selectedDimension === 'model') {
    return ['tokens', 'cost', 'success_rate'];
  } else if (selectedDimension === 'user') {
    return ['sessions', 'satisfaction', 'retention'];
  }
  return ['sessions', 'cost', 'success_rate'];
}, [selectedDimension]);
```

### 3.3 Token成本分析设计

#### 3.3.1 成本分布可视化
```jsx
<Card>
  <CardHeader>
    <h3 className="card-title">Token成本分析</h3>
  </CardHeader>
  <CardBody>
    <div className="space-y-4">
      {tokenCostData.map((item) => (
        <div key={item.model} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{item.model}</span>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                item.change.startsWith('+') ? 'bg-red-100 text-red-600' :
                item.change.startsWith('-') ? 'bg-green-100 text-green-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                {item.change}
              </span>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">${item.cost.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{item.percentage}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </CardBody>
</Card>
```

#### 3.3.2 趋势分析图表
```jsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3 className="card-title">趋势分析</h3>
      <TrendingUp className="h-5 w-5 text-gray-400" />
    </div>
  </CardHeader>
  <CardBody>
    <div className="h-64">
      {/* 这里集成图表库，如Recharts或Chart.js */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => format(new Date(value), 'MM/dd')}
          />
          <YAxis 
            tickFormatter={(value) => `$${value.toLocaleString()}`}
          />
          <Tooltip 
            labelFormatter={(value) => format(new Date(value), 'yyyy-MM-dd')}
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`, 
              modelNames[name] || name
            ]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="gpt4" 
            stroke="#8884d8" 
            name="GPT-4"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="claude3" 
            stroke="#82ca9d" 
            name="Claude-3"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="gpt35" 
            stroke="#ffc658" 
            name="GPT-3.5"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </CardBody>
</Card>
```

### 3.4 工具性能分析表格

#### 3.4.1 表格结构设计
```jsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3 className="card-title">工具调用分析</h3>
      <Zap className="h-5 w-5 text-gray-400" />
    </div>
  </CardHeader>
  <CardBody>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              工具名称
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              调用次数
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              失败次数
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              失败率
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              平均时间
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {toolCallData.map((tool) => (
            <tr key={tool.tool} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{tool.tool}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-gray-900">{tool.calls.toLocaleString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-red-600 font-medium">{tool.failures}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  tool.failureRate > 5 ? 'bg-red-100 text-red-800' :
                  tool.failureRate > 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {tool.failureRate.toFixed(2)}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="text-gray-900">{tool.avgTime}s</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </CardBody>
</Card>
```

#### 3.4.2 表格交互功能
```typescript
// 表格排序功能
const [sortConfig, setSortConfig] = useState<{
  key: string;
  direction: 'asc' | 'desc';
} | null>(null);

const sortedData = useMemo(() => {
  if (!sortConfig) return toolCallData;
  
  return [...toolCallData].sort((a, b) => {
    const aValue = a[sortConfig.key as keyof typeof a];
    const bValue = b[sortConfig.key as keyof typeof b];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}, [toolCallData, sortConfig]);

const handleSort = (key: string) => {
  setSortConfig(prev => ({
    key,
    direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
  }));
};

// 表格筛选功能
const [tableFilter, setTableFilter] = useState('');
const filteredData = useMemo(() => {
  if (!tableFilter) return sortedData;
  
  return sortedData.filter(tool =>
    tool.tool.toLowerCase().includes(tableFilter.toLowerCase())
  );
}, [sortedData, tableFilter]);
```

### 3.5 错误分析与监控

#### 3.5.1 错误类型分布图
```jsx
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <h3 className="card-title">错误类型分布</h3>
      <AlertTriangle className="h-5 w-5 text-gray-400" />
    </div>
  </CardHeader>
  <CardBody>
    <div className="space-y-4">
      {errorAnalysisData.map((error) => (
        <div key={error.type} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="font-medium text-gray-900">{error.type}</span>
              <div className={`ml-2 flex items-center text-xs ${
                error.trend === 'up' ? 'text-red-600' :
                error.trend === 'down' ? 'text-green-600' :
                'text-gray-600'
              }`}>
                {error.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : error.trend === 'down' ? (
                  <TrendingUp className="h-3 w-3 mr-1 transform rotate-180" />
                ) : null}
                {getTrendText(error.trend)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{error.count}</div>
              <div className="text-sm text-gray-500">{error.percentage}%</div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                error.trend === 'up' ? 'bg-red-500' :
                error.trend === 'down' ? 'bg-green-500' :
                'bg-gray-500'
              }`}
              style={{ width: `${error.percentage}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </CardBody>
</Card>
```

#### 3.5.2 关键指标卡片
```jsx
<div className="space-y-4">
  <Card>
    <CardBody>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">总错误数</p>
          <p className="text-3xl font-bold text-red-600">245</p>
          <p className="text-sm text-gray-500 mt-1">较上周 -12%</p>
        </div>
        <AlertTriangle className="h-12 w-12 text-red-400" />
      </div>
    </CardBody>
  </Card>
  
  <Card>
    <CardBody>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">最常见错误</p>
          <p className="text-lg font-bold text-gray-900">工具超时</p>
          <p className="text-sm text-gray-500 mt-1">36.3% 的错误</p>
        </div>
        <Clock className="h-12 w-12 text-yellow-400" />
      </div>
    </CardBody>
  </Card>
  
  <Card>
    <CardBody>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">平均修复时间</p>
          <p className="text-3xl font-bold text-blue-600">4.2分钟</p>
          <p className="text-sm text-gray-500 mt-1">较上周 -8%</p>
        </div>
        <RefreshCw className="h-12 w-12 text-blue-400" />
      </div>
    </CardBody>
  </Card>
</div>
```

### 3.6 响应式设计规范

#### 3.6.1 布局断点定义
```css
/* 移动端：< 768px */
@media (max-width: 767px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  .filter-section {
    flex-direction: column;
    gap: 0.75rem;
  }
  .table-container {
    overflow-x: scroll;
  }
}

/* 平板端：768px - 1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  .dual-column-grid {
    grid-template-columns: 1fr;
  }
}

/* 桌面端：>= 1024px */
@media (min-width: 1024px) {
  .dual-column-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

#### 3.6.2 图表适配
```typescript
const useResponsiveChart = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  useEffect(() => {
    const updateDimensions = () => {
      const container = document.querySelector('.chart-container');
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.min(container.clientWidth * 0.6, 300)
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  
  return dimensions;
};
```

---

## 4. 分析平台三层指标体系详细定义

### 4.1 L1核心业务指标详解

#### 4.1.1 分析洞察准确性 (Analysis Insight Accuracy)
**定义：** 数据分析系统提供的洞察与实际业务情况吻合的准确程度

**计算公式：**
```typescript
analysisAccuracy = (
  准确洞察数量 × 权重 + 
  部分准确洞察数量 × 0.6 +
  有价值但不完全准确洞察数量 × 0.3
) / 总洞察数量 × 100

// 准确性验证机制
const validateInsight = (insight: Insight, actualData: ActualData) => {
  const accuracyScore = calculateAccuracyScore(insight.prediction, actualData.actual);
  const relevanceScore = calculateRelevanceScore(insight.topic, actualData.context);
  const timelinessScore = calculateTimelinessScore(insight.timestamp, actualData.timestamp);
  
  return (accuracyScore × 0.5 + relevanceScore × 0.3 + timelinessScore × 0.2);
};
```

**指标解读：**
- **优秀 (≥90%)**: 分析洞察极其准确，可作为关键决策依据
- **良好 (75-89%)**: 分析洞察基本准确，可信度高
- **需改进 (60-74%)**: 分析洞察存在偏差，需要人工验证
- **差 (<60%)**: 分析洞察不准确，算法需要重大调整

**影响因素：**
- 数据源的质量和完整性
- 分析算法的先进性
- 历史数据的充分性
- 业务规则的准确建模

---

#### 4.1.2 业务决策支撑度 (Business Decision Support Level)
**定义：** 分析结果对实际业务决策制定的支撑和指导价值

**计算公式：**
```typescript
decisionSupportLevel = (
  可执行建议数量 × 4.0 +
  战略洞察数量 × 3.5 +
  风险预警数量 × 3.0 +
  趋势预测数量 × 2.5 +
  描述性统计数量 × 1.0
) / (总分析输出数量 × 4.0) × 100

// 决策影响评估
const evaluateDecisionImpact = (analysis: AnalysisResult) => {
  return {
    strategicValue: analysis.affectsStrategicPlanning ? 3.5 : 0,
    operationalValue: analysis.improvesDailyOperations ? 2.5 : 0,
    costImpactValue: analysis.identifiesCostSavings ? 3.0 : 0,
    riskMitigationValue: analysis.identifiesRisks ? 3.0 : 0,
    performanceValue: analysis.improvesPerformance ? 2.0 : 0
  };
};
```

**指标解读：**
- **优秀 (≥85%)**: 分析结果高度支撑业务决策，价值显著
- **良好 (70-84%)**: 分析结果较好支撑决策，有明确价值
- **需改进 (55-69%)**: 分析结果支撑度一般，需要加强
- **差 (<55%)**: 分析结果对决策支撑价值低

---

#### 4.1.3 成本优化效果 (Cost Optimization Effectiveness)
**定义：** 通过数据分析识别和实现的成本优化成果

**计算公式：**
```typescript
costOptimizationEffectiveness = (
  实际节省成本 / 识别出的潜在节省成本
) × (识别准确率) × 100

// 成本优化跟踪
const trackCostOptimization = (recommendations: CostRecommendation[]) => {
  return recommendations.map(rec => ({
    recommendation: rec.description,
    estimatedSaving: rec.potentialSaving,
    actualSaving: rec.realizedSaving || 0,
    implementationStatus: rec.status,
    realizationRate: (rec.realizedSaving || 0) / rec.potentialSaving,
    timeToRealization: rec.implementationDate ? 
      daysBetween(rec.recommendationDate, rec.implementationDate) : null
  }));
};
```

**指标解读：**
- **优秀 (≥80%)**: 成本优化效果显著，预期高度实现
- **良好 (60-79%)**: 成本优化效果良好，大部分预期实现
- **需改进 (40-59%)**: 成本优化效果一般，需要改进建议质量
- **差 (<40%)**: 成本优化效果差，建议价值有限

---

#### 4.1.4 问题预警有效性 (Issue Early Warning Effectiveness)
**定义：** 系统提前识别和预警潜在问题的准确性和及时性

**计算公式：**
```typescript
earlyWarningEffectiveness = (
  提前预警成功次数 × 预警提前时间权重 × 严重性权重
) / 总预警次数

// 预警评估
const evaluateWarningEffectiveness = (warning: Warning, actualIssue: Issue) => {
  const timelinessScore = calculateTimelinessScore(
    warning.timestamp, 
    actualIssue.occurrenceTime
  );
  const accuracyScore = warning.predicted === actualIssue.type ? 1.0 : 0.0;
  const severityMatchScore = Math.abs(warning.severity - actualIssue.severity) <= 1 ? 1.0 : 0.5;
  
  return (timelinessScore × 0.4 + accuracyScore × 0.4 + severityMatchScore × 0.2);
};

// 预警提前时间权重
const getEarlyWarningWeight = (hoursInAdvance: number) => {
  if (hoursInAdvance >= 24) return 1.0;      // 1天以上提前预警
  if (hoursInAdvance >= 12) return 0.9;      // 12小时以上
  if (hoursInAdvance >= 6) return 0.8;       // 6小时以上
  if (hoursInAdvance >= 2) return 0.6;       // 2小时以上
  return 0.3;                                 // 2小时以内
};
```

**指标解读：**
- **优秀 (≥90%)**: 问题预警非常有效，提前发现率高
- **良好 (75-89%)**: 问题预警较为有效，大部分问题提前发现
- **需改进 (60-74%)**: 问题预警效果一般，需要优化算法
- **差 (<60%)**: 问题预警效果差，误报率高或漏报严重

### 4.2 L2支撑分析指标详解

#### 4.2.1 数据质量指数 (Data Quality Index)
**定义：** 分析系统使用数据的完整性、准确性、一致性和时效性综合评估

**计算公式：**
```typescript
dataQualityIndex = (
  数据完整性 × 0.3 +
  数据准确性 × 0.3 +
  数据一致性 × 0.2 +
  数据时效性 × 0.2
) × 100

// 各维度计算
const calculateDataQuality = (dataset: Dataset) => {
  return {
    completeness: (非空字段数 / 总字段数),
    accuracy: (准确记录数 / 总记录数),
    consistency: (一致性检查通过数 / 一致性检查总数),
    timeliness: (及时更新的数据数 / 需要更新的数据总数)
  };
};
```

**指标解读：**
- **优秀 (≥95%)**: 数据质量优秀，分析结果高度可信
- **良好 (85-94%)**: 数据质量良好，分析结果可信
- **需改进 (70-84%)**: 数据质量有待改善，影响分析准确性
- **差 (<70%)**: 数据质量差，分析结果不可靠

---

#### 4.2.2 分析覆盖广度 (Analysis Coverage Breadth)
**定义：** 分析系统覆盖的业务领域、指标维度和分析深度的广泛程度

**计算公式：**
```typescript
analysisCoverage = (
  已覆盖业务域数 / 总业务域数 × 0.4 +
  已覆盖指标数 / 目标指标总数 × 0.3 +
  分析深度层级数 / 最大深度层级数 × 0.3
) × 100

// 覆盖度评估
const evaluateCoverageScope = {
  businessDomains: [
    '成本分析', '性能分析', '用户行为', '系统健康',
    '资源利用', '错误分析', '趋势预测', '风险评估'
  ],
  analysisDepths: [
    'descriptive',    // 描述性分析
    'diagnostic',     // 诊断性分析  
    'predictive',     // 预测性分析
    'prescriptive'    // 处方性分析
  ],
  metricCategories: [
    'business', 'technical', 'operational', 
    'financial', 'quality', 'performance'
  ]
};
```

**指标解读：**
- **优秀 (≥85%)**: 分析覆盖面广泛，全方位支撑业务
- **良好 (70-84%)**: 分析覆盖面较广，基本满足需求
- **需改进 (55-69%)**: 分析覆盖面有限，存在盲区
- **差 (<55%)**: 分析覆盖面狭窄，难以全面支撑业务

---

#### 4.2.3 洞察发现深度 (Insight Discovery Depth)
**定义：** 分析系统能够发现隐藏模式、关联关系和深层洞察的能力

**计算公式：**
```typescript
insightDiscoveryDepth = (
  深层关联发现数量 × 3.0 +
  隐藏模式识别数量 × 2.5 +
  异常检测准确数量 × 2.0 +
  趋势识别数量 × 1.5 +
  基础统计数量 × 1.0
) / (总分析输出数量 × 3.0) × 100

// 洞察层级定义
const insightLevels = {
  level1: '基础统计和描述',           // 权重 1.0
  level2: '简单趋势识别',             // 权重 1.5
  level3: '异常和离群点检测',         // 权重 2.0
  level4: '隐藏模式和规律发现',       // 权重 2.5
  level5: '深层因果关系和预测'        // 权重 3.0
};
```

**指标解读：**
- **优秀 (≥75%)**: 洞察发现能力强，能揭示深层业务规律
- **良好 (60-74%)**: 洞察发现能力较强，能识别重要模式
- **需改进 (45-59%)**: 洞察发现能力一般，主要是表面分析
- **差 (<45%)**: 洞察发现能力弱，停留在基础统计层面

### 4.3 L3技术监控指标详解

#### 4.3.1 计算性能效率 (Computing Performance Efficiency)
**定义：** 分析计算任务的执行效率和资源利用情况

**计算公式：**
```typescript
computingEfficiency = (
  任务成功完成率 × 0.3 +
  平均计算时间效率 × 0.25 +
  资源利用率 × 0.25 +
  并发处理能力 × 0.2
) × 100

// 性能计算
const calculatePerformanceMetrics = (tasks: ComputingTask[]) => {
  return {
    successRate: (成功任务数 / 总任务数) × 100,
    avgTimeEfficiency: (理想计算时间 / 实际平均计算时间) × 100,
    resourceUtilization: (有效计算资源使用 / 总分配资源) × 100,
    concurrentCapacity: Math.min(100, (实际并发数 / 设计并发数) × 100)
  };
};
```

**指标解读：**
- **优秀 (≥85%)**: 计算性能优秀，资源利用高效
- **良好 (70-84%)**: 计算性能良好，效率可接受
- **需改进 (55-69%)**: 计算性能有待优化
- **差 (<55%)**: 计算性能差，存在严重瓶颈

---

#### 4.3.2 数据处理吞吐量 (Data Processing Throughput)
**定义：** 系统在单位时间内处理数据的能力和稳定性

**计算公式：**
```typescript
dataProcessingThroughput = {
  // 数据处理速度 (MB/s)
  processingSpeed: 处理的数据量(MB) / 处理时间(秒),
  
  // 事务处理能力 (TPS)
  transactionRate: 成功处理的事务数 / 时间(秒),
  
  // 批处理效率
  batchProcessingEfficiency: 批处理成功率 × 批处理速度权重,
  
  // 实时处理延迟
  realTimeLatency: 实时数据处理的平均延迟(毫秒)
};

// 吞吐量评分
const calculateThroughputScore = (metrics: ThroughputMetrics) => {
  const speedScore = Math.min(100, metrics.processingSpeed * 2); // 50MB/s = 100分
  const tpsScore = Math.min(100, metrics.transactionRate / 10);    // 1000TPS = 100分  
  const latencyScore = Math.max(0, 100 - metrics.realTimeLatency / 10); // 1000ms = 0分
  
  return (speedScore × 0.4 + tpsScore × 0.3 + latencyScore × 0.3);
};
```

**指标解读：**
- **优秀 (≥90分)**: 数据处理吞吐量很高，性能优秀
- **良好 (75-89分)**: 数据处理吞吐量良好，满足需求
- **需改进 (60-74分)**: 数据处理吞吐量有待提升
- **差 (<60分)**: 数据处理吞吐量低，影响系统性能

---

#### 4.3.3 算法稳定性指数 (Algorithm Stability Index)
**定义：** 分析算法在不同数据条件下的稳定性和鲁棒性

**计算公式：**
```typescript
algorithmStabilityIndex = (
  结果一致性 × 0.3 +
  异常数据处理能力 × 0.25 +
  边界条件处理能力 × 0.25 +
  版本更新稳定性 × 0.2
) × 100

// 稳定性测试
const testAlgorithmStability = (algorithm: Algorithm, testCases: TestCase[]) => {
  const results = testCases.map(testCase => {
    const result = algorithm.process(testCase.input);
    return {
      consistency: compareResults(result, testCase.expectedOutput),
      handlesAnomalies: testCase.hasAnomalies ? result.success : true,
      handlesBoundary: testCase.isBoundaryCase ? result.success : true,
      executionTime: result.processingTime
    };
  });
  
  return {
    consistencyRate: results.filter(r => r.consistency).length / results.length,
    anomalyHandlingRate: results.filter(r => r.handlesAnomalies).length / results.length,
    boundaryHandlingRate: results.filter(r => r.handlesBoundary).length / results.length,
    avgExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0) / results.length
  };
};
```

**指标解读：**
- **优秀 (≥90%)**: 算法极其稳定，鲁棒性强
- **良好 (75-89%)**: 算法稳定性良好，可靠性高
- **需改进 (60-74%)**: 算法稳定性一般，需要加强
- **差 (<60%)**: 算法不稳定，存在可靠性问题

---

#### 4.3.4 存储与查询优化度 (Storage and Query Optimization)
**定义：** 分析数据存储架构和查询性能的优化程度

**计算公式：**
```typescript
storageQueryOptimization = (
  查询响应时间优化度 × 0.3 +
  存储空间利用率 × 0.25 +
  缓存命中率 × 0.25 +
  索引效率 × 0.2
) × 100

// 优化度计算
const calculateOptimizationLevel = (metrics: StorageMetrics) => {
  return {
    // 查询响应时间优化 (基准1秒)
    queryOptimization: Math.max(0, 100 - (metrics.avgQueryTime - 1000) / 100),
    
    // 存储空间利用率 (目标80%)
    storageUtilization: Math.min(100, metrics.storageUsed / metrics.storageAllocated * 125),
    
    // 缓存命中率
    cacheHitRate: metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses) * 100,
    
    // 索引效率 (使用索引的查询比例)
    indexEfficiency: metrics.indexedQueries / metrics.totalQueries * 100
  };
};
```

**指标解读：**
- **优秀 (≥85%)**: 存储查询高度优化，性能卓越
- **良好 (70-84%)**: 存储查询优化良好，性能满足需求
- **需改进 (55-69%)**: 存储查询需要进一步优化
- **差 (<55%)**: 存储查询优化不足，性能受限

## 5. 业务逻辑详述

### 5.1 数据结构定义

#### 4.1.1 分析数据模型
```typescript
interface AnalyticsData {
  timeRange: string;
  dimension: string;
  metric: string;
  
  // Token成本分析
  tokenCostData: TokenCostItem[];
  
  // 工具调用数据
  toolCallData: ToolCallItem[];
  
  // 错误分析数据
  errorAnalysisData: ErrorAnalysisItem[];
  
  // 趋势数据
  trendData: TrendDataPoint[];
  
  // 关键指标
  keyMetrics: KeyMetrics;
}

interface TokenCostItem {
  model: string;
  cost: number;
  percentage: number;
  change: string;
  tokenCount: number;
  avgCostPerToken: number;
}

interface ToolCallItem {
  tool: string;
  calls: number;
  failures: number;
  failureRate: number;
  avgTime: number;
  successRate: number;
  totalCost?: number;
}

interface ErrorAnalysisItem {
  type: string;
  count: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
  avgResolutionTime?: number;
  impactLevel: 'low' | 'medium' | 'high';
}

interface TrendDataPoint {
  date: string;
  [model: string]: number | string;
}

interface KeyMetrics {
  totalErrors: number;
  totalCost: number;
  avgResponseTime: number;
  successRate: number;
  totalSessions: number;
  costPerSession: number;
}
```

#### 4.1.2 筛选配置结构
```typescript
interface FilterConfig {
  timeRange: {
    value: string;
    label: string;
    startDate: string;
    endDate: string;
  };
  
  dimension: {
    value: string;
    label: string;
    groupBy: string;
    availableMetrics: string[];
  };
  
  metric: {
    value: string;
    label: string;
    unit: string;
    aggregation: 'sum' | 'avg' | 'count' | 'rate';
  };
  
  additionalFilters?: {
    [key: string]: any;
  };
}
```

### 4.2 数据获取与处理逻辑

#### 4.2.1 数据获取管理
```typescript
class AnalyticsDataManager {
  private cache: Map<string, CachedData> = new Map();
  private readonly CACHE_DURATION = 300000; // 5分钟
  
  async fetchAnalyticsData(config: FilterConfig): Promise<AnalyticsData> {
    const cacheKey = this.generateCacheKey(config);
    
    // 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    
    try {
      // 并行获取不同类型的数据
      const [
        tokenCostData,
        toolCallData,
        errorAnalysisData,
        trendData
      ] = await Promise.all([
        this.fetchTokenCostData(config),
        this.fetchToolCallData(config),
        this.fetchErrorAnalysisData(config),
        this.fetchTrendData(config)
      ]);
      
      const analyticsData: AnalyticsData = {
        timeRange: config.timeRange.value,
        dimension: config.dimension.value,
        metric: config.metric.value,
        tokenCostData,
        toolCallData,
        errorAnalysisData,
        trendData,
        keyMetrics: this.calculateKeyMetrics(tokenCostData, toolCallData, errorAnalysisData)
      };
      
      // 缓存结果
      this.cache.set(cacheKey, {
        data: analyticsData,
        timestamp: Date.now()
      });
      
      return analyticsData;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      throw error;
    }
  }
  
  private async fetchTokenCostData(config: FilterConfig): Promise<TokenCostItem[]> {
    const response = await api.get('/analytics/token-cost', {
      params: {
        timeRange: config.timeRange.value,
        dimension: config.dimension.value
      }
    });
    
    return response.data.map((item: any) => ({
      ...item,
      percentage: (item.cost / response.data.reduce((sum: number, i: any) => sum + i.cost, 0)) * 100,
      change: this.calculateChange(item.cost, item.previousCost)
    }));
  }
  
  private async fetchToolCallData(config: FilterConfig): Promise<ToolCallItem[]> {
    const response = await api.get('/analytics/tool-calls', {
      params: {
        timeRange: config.timeRange.value
      }
    });
    
    return response.data.map((item: any) => ({
      ...item,
      failureRate: (item.failures / item.calls) * 100,
      successRate: ((item.calls - item.failures) / item.calls) * 100
    }));
  }
  
  private async fetchErrorAnalysisData(config: FilterConfig): Promise<ErrorAnalysisItem[]> {
    const response = await api.get('/analytics/error-analysis', {
      params: {
        timeRange: config.timeRange.value
      }
    });
    
    const totalErrors = response.data.reduce((sum: number, item: any) => sum + item.count, 0);
    
    return response.data.map((item: any) => ({
      ...item,
      percentage: (item.count / totalErrors) * 100,
      trend: this.calculateTrend(item.count, item.previousCount)
    }));
  }
  
  private async fetchTrendData(config: FilterConfig): Promise<TrendDataPoint[]> {
    const response = await api.get('/analytics/trends', {
      params: {
        timeRange: config.timeRange.value,
        metric: config.metric.value,
        dimension: config.dimension.value
      }
    });
    
    return response.data;
  }
  
  private calculateKeyMetrics(
    tokenData: TokenCostItem[],
    toolData: ToolCallItem[],
    errorData: ErrorAnalysisItem[]
  ): KeyMetrics {
    return {
      totalErrors: errorData.reduce((sum, item) => sum + item.count, 0),
      totalCost: tokenData.reduce((sum, item) => sum + item.cost, 0),
      avgResponseTime: toolData.reduce((sum, item) => sum + item.avgTime, 0) / toolData.length,
      successRate: toolData.reduce((sum, item) => sum + item.successRate, 0) / toolData.length,
      totalSessions: toolData.reduce((sum, item) => sum + item.calls, 0),
      costPerSession: 0 // 需要额外计算
    };
  }
  
  private generateCacheKey(config: FilterConfig): string {
    return `${config.timeRange.value}_${config.dimension.value}_${config.metric.value}`;
  }
  
  private calculateChange(current: number, previous: number): string {
    if (!previous) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  }
  
  private calculateTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
    if (!previous) return 'neutral';
    const changeRate = (current - previous) / previous;
    if (changeRate > 0.05) return 'up';
    if (changeRate < -0.05) return 'down';
    return 'neutral';
  }
}
```

#### 4.2.2 实时数据更新
```typescript
const useRealTimeAnalytics = (config: FilterConfig) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const dataManager = useMemo(() => new AnalyticsDataManager(), []);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const newData = await dataManager.fetchAnalyticsData(config);
      setData(newData);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据获取失败');
    } finally {
      setLoading(false);
    }
  }, [config, dataManager]);
  
  // 自动刷新机制
  useEffect(() => {
    fetchData();
    
    // 每5分钟自动刷新
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);
  
  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh: fetchData
  };
};
```

### 4.3 数据分析计算逻辑

#### 4.3.1 成本分析算法
```typescript
class CostAnalyzer {
  static analyzeCostDistribution(tokenData: TokenCostItem[]): {
    distribution: CostDistribution[];
    trends: CostTrend[];
    recommendations: string[];
  } {
    const totalCost = tokenData.reduce((sum, item) => sum + item.cost, 0);
    
    // 成本分布计算
    const distribution = tokenData.map(item => ({
      model: item.model,
      percentage: (item.cost / totalCost) * 100,
      cost: item.cost,
      efficiency: item.tokenCount / item.cost // tokens per dollar
    })).sort((a, b) => b.percentage - a.percentage);
    
    // 成本趋势分析
    const trends = tokenData.map(item => {
      const changeRate = parseFloat(item.change.replace(/[+%]/g, ''));
      return {
        model: item.model,
        trend: changeRate > 0 ? 'increasing' : changeRate < 0 ? 'decreasing' : 'stable',
        changeRate: Math.abs(changeRate),
        impact: this.calculateCostImpact(item.cost, changeRate, totalCost)
      };
    });
    
    // 成本优化建议
    const recommendations = this.generateCostRecommendations(distribution, trends);
    
    return { distribution, trends, recommendations };
  }
  
  private static calculateCostImpact(
    modelCost: number, 
    changeRate: number, 
    totalCost: number
  ): 'high' | 'medium' | 'low' {
    const costWeight = modelCost / totalCost;
    const impactScore = costWeight * Math.abs(changeRate);
    
    if (impactScore > 10) return 'high';
    if (impactScore > 5) return 'medium';
    return 'low';
  }
  
  private static generateCostRecommendations(
    distribution: CostDistribution[],
    trends: CostTrend[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 高成本模型建议
    const highCostModels = distribution.filter(d => d.percentage > 40);
    if (highCostModels.length > 0) {
      recommendations.push(
        `${highCostModels[0].model}占用${highCostModels[0].percentage.toFixed(1)}%的成本，建议优化使用策略`
      );
    }
    
    // 成本增长建议
    const increasingCosts = trends.filter(t => t.trend === 'increasing' && t.impact === 'high');
    if (increasingCosts.length > 0) {
      recommendations.push(
        `${increasingCosts.map(c => c.model).join('、')}成本快速增长，需要关注使用效率`
      );
    }
    
    // 效率建议
    const lowEfficiencyModels = distribution.filter(d => d.efficiency < 1000); // 假设阈值
    if (lowEfficiencyModels.length > 0) {
      recommendations.push(
        `考虑减少低效模型的使用：${lowEfficiencyModels.map(m => m.model).join('、')}`
      );
    }
    
    return recommendations;
  }
}
```

#### 4.3.2 性能分析算法
```typescript
class PerformanceAnalyzer {
  static analyzeToolPerformance(toolData: ToolCallItem[]): {
    performance: ToolPerformance[];
    issues: PerformanceIssue[];
    recommendations: string[];
  } {
    // 性能评估
    const performance = toolData.map(tool => ({
      tool: tool.tool,
      calls: tool.calls,
      failureRate: tool.failureRate,
      avgTime: tool.avgTime,
      reliabilityScore: this.calculateReliabilityScore(tool),
      performanceScore: this.calculatePerformanceScore(tool),
      overallScore: this.calculateOverallScore(tool)
    })).sort((a, b) => b.overallScore - a.overallScore);
    
    // 问题识别
    const issues = this.identifyPerformanceIssues(toolData);
    
    // 改进建议
    const recommendations = this.generatePerformanceRecommendations(performance, issues);
    
    return { performance, issues, recommendations };
  }
  
  private static calculateReliabilityScore(tool: ToolCallItem): number {
    // 基于失败率计算可靠性分数 (0-100)
    return Math.max(0, 100 - (tool.failureRate * 10));
  }
  
  private static calculatePerformanceScore(tool: ToolCallItem): number {
    // 基于响应时间计算性能分数 (0-100)
    // 假设1秒为理想响应时间
    const idealTime = 1.0;
    const timeScore = Math.max(0, 100 - ((tool.avgTime - idealTime) / idealTime) * 50);
    return Math.min(100, timeScore);
  }
  
  private static calculateOverallScore(tool: ToolCallItem): number {
    const reliabilityScore = this.calculateReliabilityScore(tool);
    const performanceScore = this.calculatePerformanceScore(tool);
    const usageWeight = Math.min(1, tool.calls / 1000); // 基于使用量的权重
    
    return (reliabilityScore * 0.6 + performanceScore * 0.4) * (0.5 + usageWeight * 0.5);
  }
  
  private static identifyPerformanceIssues(toolData: ToolCallItem[]): PerformanceIssue[] {
    const issues: PerformanceIssue[] = [];
    
    toolData.forEach(tool => {
      if (tool.failureRate > 5) {
        issues.push({
          tool: tool.tool,
          type: 'high_failure_rate',
          severity: tool.failureRate > 10 ? 'critical' : 'high',
          description: `失败率${tool.failureRate.toFixed(2)}%，超出正常范围`,
          impact: tool.calls * (tool.failureRate / 100)
        });
      }
      
      if (tool.avgTime > 5) {
        issues.push({
          tool: tool.tool,
          type: 'slow_response',
          severity: tool.avgTime > 10 ? 'critical' : 'medium',
          description: `平均响应时间${tool.avgTime}秒，响应过慢`,
          impact: tool.calls
        });
      }
    });
    
    return issues.sort((a, b) => {
      const severityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }
  
  private static generatePerformanceRecommendations(
    performance: ToolPerformance[],
    issues: PerformanceIssue[]
  ): string[] {
    const recommendations: string[] = [];
    
    // 基于问题的建议
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    if (criticalIssues.length > 0) {
      recommendations.push(
        `紧急处理：${criticalIssues.map(i => i.tool).join('、')}存在严重性能问题`
      );
    }
    
    // 基于性能排名的建议
    const lowPerformanceTools = performance.filter(p => p.overallScore < 60);
    if (lowPerformanceTools.length > 0) {
      recommendations.push(
        `优化性能较差的工具：${lowPerformanceTools.map(p => p.tool).join('、')}`
      );
    }
    
    // 基于使用频率的建议
    const highUsageTools = performance.filter(p => p.calls > 1000);
    const needOptimization = highUsageTools.filter(p => p.overallScore < 80);
    if (needOptimization.length > 0) {
      recommendations.push(
        `优先优化高频使用工具：${needOptimization.map(p => p.tool).join('、')}`
      );
    }
    
    return recommendations;
  }
}

interface ToolPerformance {
  tool: string;
  calls: number;
  failureRate: number;
  avgTime: number;
  reliabilityScore: number;
  performanceScore: number;
  overallScore: number;
}

interface PerformanceIssue {
  tool: string;
  type: 'high_failure_rate' | 'slow_response' | 'resource_intensive';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: number;
}
```

### 4.4 数据导出功能

#### 4.4.1 导出管理器
```typescript
class AnalyticsExporter {
  static async exportData(
    data: AnalyticsData,
    format: 'csv' | 'excel' | 'pdf' | 'json',
    options: ExportOptions = {}
  ): Promise<void> {
    switch (format) {
      case 'csv':
        await this.exportToCSV(data, options);
        break;
      case 'excel':
        await this.exportToExcel(data, options);
        break;
      case 'pdf':
        await this.exportToPDF(data, options);
        break;
      case 'json':
        await this.exportToJSON(data, options);
        break;
    }
  }
  
  private static async exportToCSV(data: AnalyticsData, options: ExportOptions) {
    const csvContent = this.generateCSVContent(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, `analytics_${data.timeRange}_${Date.now()}.csv`);
  }
  
  private static async exportToExcel(data: AnalyticsData, options: ExportOptions) {
    // 使用xlsx库生成Excel文件
    const workbook = XLSX.utils.book_new();
    
    // Token成本工作表
    const tokenSheet = XLSX.utils.json_to_sheet(data.tokenCostData);
    XLSX.utils.book_append_sheet(workbook, tokenSheet, 'Token成本');
    
    // 工具调用工作表
    const toolSheet = XLSX.utils.json_to_sheet(data.toolCallData);
    XLSX.utils.book_append_sheet(workbook, toolSheet, '工具调用');
    
    // 错误分析工作表
    const errorSheet = XLSX.utils.json_to_sheet(data.errorAnalysisData);
    XLSX.utils.book_append_sheet(workbook, errorSheet, '错误分析');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    this.downloadFile(blob, `analytics_${data.timeRange}_${Date.now()}.xlsx`);
  }
  
  private static async exportToPDF(data: AnalyticsData, options: ExportOptions) {
    // 使用jsPDF生成PDF报告
    const doc = new jsPDF();
    
    // 添加标题
    doc.setFontSize(20);
    doc.text('数据分析报告', 20, 30);
    
    // 添加时间范围
    doc.setFontSize(12);
    doc.text(`分析时间范围: ${data.timeRange}`, 20, 50);
    
    // 添加Token成本分析
    doc.setFontSize(16);
    doc.text('Token成本分析', 20, 80);
    
    let yPosition = 100;
    data.tokenCostData.forEach((item, index) => {
      doc.setFontSize(12);
      doc.text(
        `${item.model}: $${item.cost.toLocaleString()} (${item.percentage.toFixed(1)}%)`,
        20,
        yPosition + index * 20
      );
    });
    
    // 添加更多内容...
    
    doc.save(`analytics_${data.timeRange}_${Date.now()}.pdf`);
  }
  
  private static generateCSVContent(data: AnalyticsData): string {
    let csv = 'Analytics Report\n\n';
    
    // Token成本数据
    csv += 'Token Cost Analysis\n';
    csv += 'Model,Cost,Percentage,Change\n';
    data.tokenCostData.forEach(item => {
      csv += `${item.model},${item.cost},${item.percentage},${item.change}\n`;
    });
    
    csv += '\nTool Call Analysis\n';
    csv += 'Tool,Calls,Failures,Failure Rate,Avg Time\n';
    data.toolCallData.forEach(item => {
      csv += `${item.tool},${item.calls},${item.failures},${item.failureRate},${item.avgTime}\n`;
    });
    
    return csv;
  }
  
  private static downloadFile(blob: Blob, filename: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
}

interface ExportOptions {
  includeCharts?: boolean;
  dateRange?: string;
  customTitle?: string;
  includeRecommendations?: boolean;
}
```

---

## 5. 状态管理逻辑

### 5.1 组件状态结构
```typescript
interface AnalyticsState {
  // 数据状态
  analyticsData: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  
  // 筛选状态
  selectedTimeRange: string;
  selectedDimension: string;
  selectedMetric: string;
  searchTerm: string;
  
  // UI状态
  showExportModal: boolean;
  tableSort: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  
  // 缓存状态
  dataCache: Map<string, CachedAnalyticsData>;
  
  // 实时更新
  autoRefresh: boolean;
  refreshInterval: number;
}
```

### 5.2 状态管理实现
```typescript
const Analytics: React.FC = () => {
  // 数据状态
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 筛选状态
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedDimension, setSelectedDimension] = useState('model');
  const [selectedMetric, setSelectedMetric] = useState('tokens');
  const [searchTerm, setSearchTerm] = useState('');
  
  // UI状态
  const [showExportModal, setShowExportModal] = useState(false);
  const [tableSort, setTableSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  // 数据管理器
  const dataManager = useMemo(() => new AnalyticsDataManager(), []);
  
  // 筛选配置
  const filterConfig = useMemo((): FilterConfig => ({
    timeRange: {
      value: selectedTimeRange,
      label: getTimeRangeLabel(selectedTimeRange),
      startDate: getStartDate(selectedTimeRange),
      endDate: new Date().toISOString()
    },
    dimension: {
      value: selectedDimension,
      label: getDimensionLabel(selectedDimension),
      groupBy: selectedDimension,
      availableMetrics: getAvailableMetrics(selectedDimension)
    },
    metric: {
      value: selectedMetric,
      label: getMetricLabel(selectedMetric),
      unit: getMetricUnit(selectedMetric),
      aggregation: getMetricAggregation(selectedMetric)
    }
  }), [selectedTimeRange, selectedDimension, selectedMetric]);
  
  // 数据获取
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await dataManager.fetchAnalyticsData(filterConfig);
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据获取失败');
    } finally {
      setLoading(false);
    }
  }, [filterConfig, dataManager]);
  
  // 初始化和筛选变化时重新获取数据
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // 自动刷新
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchData();
      }
    }, 300000); // 5分钟自动刷新
    
    return () => clearInterval(interval);
  }, [fetchData, loading]);
  
  // 表格排序
  const handleSort = useCallback((key: string) => {
    setTableSort(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  // 数据导出
  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    if (!analyticsData) return;
    
    try {
      await AnalyticsExporter.exportData(analyticsData, format);
    } catch (error) {
      console.error('Export failed:', error);
    }
  }, [analyticsData]);
  
  return (
    // JSX内容
  );
};
```

---

## 6. 性能优化要求

### 6.1 数据处理优化
```typescript
// 数据分页处理
const usePaginatedData = <T>(data: T[], pageSize: number = 50) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, pageSize]);
  
  const totalPages = Math.ceil(data.length / pageSize);
  
  return {
    data: paginatedData,
    currentPage,
    totalPages,
    setCurrentPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// 图表数据采样
const useSampledData = (data: TrendDataPoint[], maxPoints: number = 100) => {
  return useMemo(() => {
    if (data.length <= maxPoints) return data;
    
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  }, [data, maxPoints]);
};
```

### 6.2 渲染优化
```typescript
// 表格虚拟化
const VirtualizedTable: React.FC<{
  data: any[];
  columns: TableColumn[];
  rowHeight: number;
}> = ({ data, columns, rowHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const start = Math.floor(scrollTop / rowHeight);
      const end = Math.min(start + Math.ceil(clientHeight / rowHeight) + 5, data.length);
      
      setVisibleRange({ start, end });
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [rowHeight, data.length]);
  
  const visibleData = data.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={containerRef} className="virtual-table-container">
      <div style={{ height: data.length * rowHeight }}>
        <div
          style={{ 
            transform: `translateY(${visibleRange.start * rowHeight}px)` 
          }}
        >
          {visibleData.map((row, index) => (
            <TableRow key={visibleRange.start + index} data={row} columns={columns} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 6.3 性能指标要求
- **初始加载时间**：< 3秒
- **数据刷新时间**：< 2秒
- **筛选响应时间**：< 500ms
- **图表渲染时间**：< 1秒
- **导出处理时间**：< 10秒
- **内存使用**：< 150MB

---

## 7. 测试用例规范

### 7.1 功能测试
```typescript
describe('Analytics Component', () => {
  test('渲染分析页面', () => {
    render(<Analytics />);
    
    expect(screen.getByText('数据分析')).toBeInTheDocument();
    expect(screen.getByText('Token成本分析')).toBeInTheDocument();
    expect(screen.getByText('工具调用分析')).toBeInTheDocument();
  });
  
  test('筛选功能正常工作', async () => {
    render(<Analytics />);
    
    const timeRangeSelect = screen.getByDisplayValue('近 7 天');
    fireEvent.change(timeRangeSelect, { target: { value: '30d' } });
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('近 30 天')).toBeInTheDocument();
    });
  });
  
  test('数据导出功能', async () => {
    const mockExport = jest.spyOn(AnalyticsExporter, 'exportData');
    render(<Analytics />);
    
    const exportButton = screen.getByText('导出');
    fireEvent.click(exportButton);
    
    // 假设会打开导出选项
    await waitFor(() => {
      expect(mockExport).toHaveBeenCalled();
    });
  });
});
```

### 7.2 性能测试
```typescript
describe('Analytics Performance', () => {
  test('大量数据渲染性能', () => {
    const largeDataset = generateMockData(10000);
    
    const startTime = performance.now();
    render(<Analytics initialData={largeDataset} />);
    const renderTime = performance.now() - startTime;
    
    expect(renderTime).toBeLessThan(3000); // 3秒内完成渲染
  });
  
  test('筛选性能', async () => {
    render(<Analytics />);
    
    const startTime = performance.now();
    const filter = screen.getByDisplayValue('模型');
    fireEvent.change(filter, { target: { value: 'user' } });
    
    await waitFor(() => {
      const filterTime = performance.now() - startTime;
      expect(filterTime).toBeLessThan(500); // 500ms内完成筛选
    });
  });
});
```

---

## 8. 开发实现指南

### 8.1 核心依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "recharts": "^2.8.0",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.1",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

### 8.2 组件导入清单
```typescript
// 页面布局
import { PageLayout, PageHeader, PageContent } from '../components/ui';

// UI组件
import { 
  Card, CardHeader, CardBody, Button, FilterSection,
  Modal, Table, Progress
} from '../components/ui';

// 图标
import { 
  Download, RefreshCw, TrendingUp, AlertTriangle, 
  DollarSign, Zap, Clock
} from 'lucide-react';

// 图表库
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// 工具库
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

// 数据和类型
import { mockAnalyticsData } from '../data/mockAnalyticsData';
import type { AnalyticsData, FilterConfig } from '../types';
```

### 8.3 样式类名规范
```scss
// 分析页面样式
.analytics-grid {
  display: grid;
  gap: 1.5rem;
  
  &--dual-column {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-container {
  position: relative;
  width: 100%;
  height: 256px;
}

.table-container {
  overflow-x: auto;
  
  table {
    min-width: 600px;
  }
}

.filter-section {
  &--horizontal {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
}

// 进度条样式
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: theme('colors.gray.200');
  border-radius: 9999px;
  overflow: hidden;
  
  &__fill {
    height: 100%;
    transition: width 0.3s ease;
    border-radius: inherit;
  }
}

// 响应式适配
@media (max-width: 1023px) {
  .analytics-grid--dual-column {
    grid-template-columns: 1fr;
  }
  
  .filter-section--horizontal {
    flex-direction: column;
    align-items: stretch;
  }
}
```

---

## 9. Mock数据规范

### 9.1 完整分析数据
```typescript
export const mockAnalyticsData: AnalyticsData = {
  timeRange: '7d',
  dimension: 'model',
  metric: 'tokens',
  
  tokenCostData: [
    {
      model: 'GPT-4',
      cost: 23456,
      percentage: 51.3,
      change: '+12%',
      tokenCount: 2345600,
      avgCostPerToken: 0.01
    },
    {
      model: 'Claude-3',
      cost: 18234,
      percentage: 39.8,
      change: '+8%',
      tokenCount: 1823400,
      avgCostPerToken: 0.01
    },
    {
      model: 'GPT-3.5',
      cost: 5432,
      percentage: 11.9,
      change: '-3%',
      tokenCount: 543200,
      avgCostPerToken: 0.01
    }
  ],
  
  toolCallData: [
    {
      tool: 'query_sales_data',
      calls: 1234,
      failures: 12,
      failureRate: 0.97,
      avgTime: 0.8,
      successRate: 99.03,
      totalCost: 123.4
    },
    {
      tool: 'send_email',
      calls: 856,
      failures: 45,
      failureRate: 5.26,
      avgTime: 3.2,
      successRate: 94.74,
      totalCost: 85.6
    },
    {
      tool: 'generate_report',
      calls: 654,
      failures: 8,
      failureRate: 1.22,
      avgTime: 1.5,
      successRate: 98.78,
      totalCost: 65.4
    },
    {
      tool: 'query_user_info',
      calls: 432,
      failures: 3,
      failureRate: 0.69,
      avgTime: 0.4,
      successRate: 99.31,
      totalCost: 43.2
    },
    {
      tool: 'create_ticket',
      calls: 321,
      failures: 18,
      failureRate: 5.61,
      avgTime: 2.1,
      successRate: 94.39,
      totalCost: 32.1
    }
  ],
  
  errorAnalysisData: [
    {
      type: '工具超时',
      count: 89,
      percentage: 36.3,
      trend: 'up',
      avgResolutionTime: 4.2,
      impactLevel: 'high'
    },
    {
      type: 'LLM生成内容不合规',
      count: 76,
      percentage: 31.0,
      trend: 'down',
      avgResolutionTime: 2.1,
      impactLevel: 'medium'
    },
    {
      type: '参数错误',
      count: 45,
      percentage: 18.4,
      trend: 'neutral',
      avgResolutionTime: 1.8,
      impactLevel: 'low'
    },
    {
      type: '网络连接失败',
      count: 23,
      percentage: 9.4,
      trend: 'down',
      avgResolutionTime: 5.6,
      impactLevel: 'high'
    },
    {
      type: '权限不足',
      count: 12,
      percentage: 4.9,
      trend: 'neutral',
      avgResolutionTime: 1.2,
      impactLevel: 'low'
    }
  ],
  
  trendData: [
    { date: '2024-08-19', gpt4: 3200, claude3: 2800, gpt35: 800 },
    { date: '2024-08-20', gpt4: 3400, claude3: 2900, gpt35: 750 },
    { date: '2024-08-21', gpt4: 3600, claude3: 3100, gpt35: 720 },
    { date: '2024-08-22', gpt4: 3300, claude3: 2950, gpt35: 780 },
    { date: '2024-08-23', gpt4: 3500, claude3: 3000, gpt35: 760 },
    { date: '2024-08-24', gpt4: 3700, claude3: 3200, gpt35: 740 },
    { date: '2024-08-25', gpt4: 3800, claude3: 3250, gpt35: 730 }
  ],
  
  keyMetrics: {
    totalErrors: 245,
    totalCost: 47122,
    avgResponseTime: 1.58,
    successRate: 95.8,
    totalSessions: 3497,
    costPerSession: 13.47
  }
};
```

### 9.2 动态数据生成
```typescript
export const generateMockAnalyticsData = (
  timeRange: string,
  dimension: string,
  metric: string
): AnalyticsData => {
  const baseData = { ...mockAnalyticsData };
  
  // 根据时间范围调整数据
  if (timeRange === '1d') {
    baseData.tokenCostData.forEach(item => {
      item.cost = Math.floor(item.cost * 0.14); // 1/7的数据
    });
  } else if (timeRange === '30d') {
    baseData.tokenCostData.forEach(item => {
      item.cost = Math.floor(item.cost * 4.3); // 30/7的数据
    });
  }
  
  // 根据维度调整数据结构
  if (dimension === 'user') {
    // 生成用户维度的数据
    baseData.tokenCostData = [
      { model: '普通用户', cost: 15678, percentage: 45.2, change: '+5%', tokenCount: 1567800, avgCostPerToken: 0.01 },
      { model: 'VIP用户', cost: 12890, percentage: 37.1, change: '+8%', tokenCount: 1289000, avgCostPerToken: 0.01 },
      { model: '企业用户', cost: 6154, percentage: 17.7, change: '-2%', tokenCount: 615400, avgCostPerToken: 0.01 }
    ];
  }
  
  return baseData;
};
```

---

**实现完成标准：**
✅ 多维度筛选系统完整实现并正常工作  
✅ Token成本分析可视化完整展示  
✅ 工具调用性能表格功能完整  
✅ 错误分析统计正确计算和展示  
✅ 趋势分析图表正确渲染（预留图表集成）  
✅ 数据导出功能完整支持多种格式  
✅ 实时数据更新机制正常工作  
✅ 响应式设计适配各种屏幕尺寸  
✅ 性能优化措施到位，支持大量数据处理