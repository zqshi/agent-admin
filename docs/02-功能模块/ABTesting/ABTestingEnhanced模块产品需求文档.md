# ABTestingEnhanced模块产品需求文档
## 贝叶斯A/B测试管理系统详细设计

**文档版本：** V2.0  
**模块路径：** `/src/pages/ABTestingEnhanced.tsx`  
**创建日期：** 2024-08-25  
**文档目标：** 提供完整的贝叶斯A/B测试系统实现指南，支持科学统计分析和可解释性AI

---

## 1. 功能概述

### 1.1 模块定位
ABTestingEnhanced模块是KingSoft平台的核心科学分析工具，提供基于贝叶斯统计的A/B测试管理。通过三层指标体系、可解释性洞察和智能决策支持，帮助产品团队进行科学的实验设计和数据驱动的优化决策。

### 1.2 核心价值
- **科学决策**：基于贝叶斯统计的概率性决策支持
- **全面洞察**：三层指标体系的多维度分析
- **智能优化**：可解释性AI的改进建议
- **风险控制**：实验复杂度评估和预算管理

### 1.3 突破性特性
- **贝叶斯统计引擎**：超越传统频率学派的概率性分析
- **三层指标体系**：L1业务指标、L2支撑指标、L3技术指标
- **可解释性洞察**：特征重要性分析、用户路径挖掘
- **复杂度自适应**：实验难度评估和样本量智能计算
- **实时决策支持**：5秒刷新的智能停止建议

---

## 2. 用户交互流程

### 2.1 实验全生命周期流程

#### 2.1.1 实验创建流程
```
进入A/B测试页面 → 点击创建实验 → 使用实验向导 → 复杂度评估 → 配置实验参数 → 设置预算限制 → 创建测试组 → 启动实验
```

#### 2.1.2 实验监控流程  
```
查看实验列表 → 选择运行中实验 → 实时指标监控 → 贝叶斯分析结果 → 决策建议评估 → 执行停止决策
```

#### 2.1.3 结果分析流程
```
实验完成 → 查看完整分析 → 贝叶斯vs频率学派对比 → 可解释性洞察 → 改进建议 → 应用优胜方案
```

### 2.2 实验向导交互流程
```
1. 基础配置：实验名称 → 目标设定 → 假设描述
2. 复杂度评估：自动计算复杂度 → 显示难度等级 → 样本量建议
3. 参数配置：模型选择 → 参数设置 → 流量分配
4. 预算设置：Token预算 → 成本限制 → 时间约束  
5. 确认创建：检查配置 → 风险提示 → 启动实验
```

### 2.3 决策支持交互流程
```
实时监控 → 贝叶斯胜率计算 → 置信区间评估 → 停止建议生成 → 用户决策确认 → 执行操作
```

---

## 2.4 用户故事与业务场景

### 2.4.1 产品经理的科学决策需求

#### 故事1：科学验证产品假设
**作为一名** 产品经理  
**我希望** 能够通过A/B测试科学验证产品改进假设  
**以便于** 用数据支撑产品决策，减少主观判断风险

**业务场景：**
李小明想验证"降低模型温度参数是否能提升回答准确性"这个假设：
1. 创建A/B实验：对照组温度0.7，实验组温度0.5
2. 设置核心指标：任务成功率、用户满意度
3. 运行实验并监控贝叶斯分析结果
4. 基于统计显著性决定是否采用新配置

**痛点分析：**
- 之前凭经验和直觉做决策，风险高
- 无法量化改进效果，投入产出不明确
- 缺乏科学的实验设计和分析方法

**验收标准：**
- [ ] 实验向导引导完成实验设计，包含假设描述
- [ ] 支持多种分流策略：会话级、用户级、混合分流
- [ ] 贝叶斯分析实时显示胜率和置信区间
- [ ] 提供明确的决策建议：继续、停止采用A、停止采用B
- [ ] 实验结果可导出为报告，支持向上汇报

#### 故事2：复杂多变量实验管理
**作为一名** 产品经理  
**我希望** 能够同时测试多个变量的组合效果  
**以便于** 找到最优的参数组合，最大化产品价值

**业务场景：**
李小明需要同时测试：模型选择、提示词模板、温度参数的最佳组合：
- 模型：GPT-4 vs Claude-3
- 提示词：标准版 vs 优化版  
- 温度：0.5 vs 0.7
- 总计2×2×2=8个实验组

**验收标准：**
- [ ] 复杂度评估系统准确评估实验难度
- [ ] 样本量计算器给出科学的样本需求
- [ ] 支持因子实验设计，减少实验组合数
- [ ] 交互效应分析，识别变量间的相互影响
- [ ] 预算控制机制，避免成本超支

### 2.4.2 AI工程师的优化验证需求

#### 故事3：模型性能优化验证
**作为一名** AI工程师  
**我希望** 能够科学验证模型调优的效果  
**以便于** 确保优化真正提升了系统性能

**业务场景：**
张小华进行了提示词优化，需要验证：
- 新提示词是否真的提升了回答质量？
- 性能提升是否在统计上显著？
- 优化效果是否值得付出额外的成本？

**验收标准：**
- [ ] 支持技术指标的A/B测试：响应时间、成功率、Token成本
- [ ] 贝叶斯vs频率学派双重分析，确保结论可靠
- [ ] 实时监控实验进展，支持早停机制
- [ ] 可解释性分析，解释为什么B组更优
- [ ] 成本效益分析，评估优化的投入产出比

#### 故事4：系统稳定性实验
**作为一名** AI工程师  
**我希望** 能够测试新版本对系统稳定性的影响  
**以便于** 确保升级不会引入新的问题

**业务场景：**
张小华要上线新的工具调用机制，担心影响稳定性：
- 小流量灰度测试新机制
- 监控关键稳定性指标
- 一旦发现问题立即回滚

**验收标准：**
- [ ] 支持小流量（1%、5%、10%）渐进式实验
- [ ] 实时监控系统健康指标：错误率、响应时间
- [ ] 自动异常检测，触发告警和建议停止
- [ ] 一键回滚机制，快速恢复到原版本
- [ ] 详细的实验日志，便于问题排查

### 2.4.3 运营人员的效果监控需求

#### 故事5：业务指标监控
**作为一名** 运营人员  
**我希望** 能够监控A/B测试对业务指标的影响  
**以便于** 确保实验不会损害用户体验和业务目标

**业务场景：**
王小红需要监控正在进行的A/B测试：
- 用户投诉是否增加？
- 服务成功率是否下降？
- 用户满意度是否受到影响？

**验收标准：**
- [ ] 实时监控三层指标体系的所有核心指标
- [ ] 异常指标自动高亮显示并告警
- [ ] 支持按时间维度查看指标变化趋势
- [ ] 提供实验组对比视图，快速发现差异
- [ ] 移动端友好的监控界面，支持随时查看

### 2.4.4 客服主管的质量保障需求

#### 故事6：服务质量风险控制
**作为一名** 客服主管  
**我希望** 能够确保A/B测试不会损害服务质量  
**以便于** 维护用户满意度和品牌形象

**业务场景：**
赵小军担心A/B测试中的新版本影响服务质量：
- 需要实时监控用户满意度变化
- 如果满意度下降需要及时干预
- 确保实验不会让用户流失

**验收标准：**
- [ ] 用户满意度指标实时监控和对比
- [ ] 质量下降时的自动告警机制
- [ ] 支持人工介入和强制停止实验
- [ ] 实验期间的用户反馈收集和分析
- [ ] 服务质量报告自动生成

## 2.5 贝叶斯统计的业务价值场景

### 场景1：早期决策支持
**场景描述：** 传统方法需要等待大样本才能得出结论，贝叶斯方法在小样本下就能提供概率性指导

**具体案例：**
- 实验运行3天，样本量1000
- 传统方法：p=0.08，不显著，需要继续等待
- 贝叶斯方法：B组胜率78%，建议采用B组配置
- **业务价值**：提前5天做出决策，加快产品迭代速度

### 场景2：风险量化决策
**场景描述：** 贝叶斯方法提供决策风险的量化评估，支持更精细的风险控制

**具体案例：**
- 传统方法：显著性，但不知道错误决策的风险
- 贝叶斯方法：采用B组的错误风险为12%，预期收益+15%
- **业务价值**：管理者可以基于风险容忍度做出更好的决策

### 场景3：成本效益优化
**场景描述：** 考虑实验成本，在统计确定性与成本之间找到最优平衡点

**具体案例：**
- 当前胜率85%，继续实验成本$500/天
- 贝叶斯分析：继续实验的信息价值仅$200
- **业务价值**：及时停止实验，避免不必要的成本浪费

---

## 3. UI/UX设计规范

### 3.1 页面整体布局

#### 3.1.1 多标签页结构
```jsx
<PageLayout>
  <PageHeader 
    title="A/B测试管理" 
    subtitle="基于贝叶斯统计的智能实验分析平台"
  >
    <Button onClick={() => setShowExperimentWizard(true)}>
      <Plus className="h-4 w-4" />
      创建实验
    </Button>
  </PageHeader>

  <PageContent>
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="overview">实验概览</TabsTrigger>
        <TabsTrigger value="analysis">贝叶斯分析</TabsTrigger>
        <TabsTrigger value="insights">洞察分析</TabsTrigger>
        <TabsTrigger value="settings">实验配置</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        {/* 实验概览内容 */}
      </TabsContent>
      
      <TabsContent value="analysis">
        {/* 贝叶斯统计分析 */}
      </TabsContent>
      
      <TabsContent value="insights">
        {/* 可解释性洞察 */}
      </TabsContent>
      
      <TabsContent value="settings">
        {/* 实验配置管理 */}
      </TabsContent>
    </Tabs>
  </PageContent>
</PageLayout>
```

### 3.2 实验概览设计

#### 3.2.1 实验状态卡片
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {experiments.map(experiment => (
    <Card key={experiment.id} className="experiment-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 truncate">
            {experiment.name}
          </h3>
          <Badge variant={getExperimentStatusVariant(experiment.status)}>
            {getExperimentStatusText(experiment.status)}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 line-clamp-2">
          {experiment.description}
        </p>
      </CardHeader>

      <CardBody>
        {/* 核心指标展示 */}
        <div className="space-y-4">
          {/* 贝叶斯胜率指示器 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">贝叶斯胜率</span>
              <span className="text-xs text-gray-500">组B vs 组A</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${experiment.statisticalAnalysis?.bayesianResults?.probabilityABeatsB || 0}%` }}
                  />
                </div>
              </div>
              <span className="text-lg font-bold text-purple-700">
                {(experiment.statisticalAnalysis?.bayesianResults?.probabilityABeatsB || 0).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* 关键指标网格 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-gray-900">
                {experiment.groups[0]?.realTimeMetrics?.totalSessions || 0}
              </div>
              <div className="text-xs text-gray-500">样本量</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {experiment.statisticalAnalysis?.effectSize?.toFixed(3) || '0.000'}
              </div>
              <div className="text-xs text-gray-500">效果量</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                ${(experiment.config.budget.currentSpent || 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">已花费</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg font-bold text-orange-600">
                {experiment.config.complexityLevel}
              </div>
              <div className="text-xs text-gray-500">复杂度</div>
            </div>
          </div>

          {/* 决策建议 */}
          {experiment.statisticalAnalysis?.recommendation && (
            <div className={`p-3 rounded-lg border ${getRecommendationStyle(experiment.statisticalAnalysis.recommendation)}`}>
              <div className="flex items-center gap-2 mb-1">
                {getRecommendationIcon(experiment.statisticalAnalysis.recommendation)}
                <span className="font-medium text-sm">
                  智能建议
                </span>
              </div>
              <div className="text-sm">
                {getRecommendationText(experiment.statisticalAnalysis.recommendation)}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="primary" 
              size="sm" 
              className="flex-1"
              onClick={() => viewExperimentDetail(experiment)}
            >
              查看详情
            </Button>
            {experiment.status === 'running' && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => pauseExperiment(experiment.id)}
              >
                暂停
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  ))}
</div>
```

### 3.3 贝叶斯分析界面设计

#### 3.3.1 统计分析仪表板
```jsx
<div className="space-y-6">
  {/* 贝叶斯 vs 频率学派对比 */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* 贝叶斯分析结果 */}
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <h3 className="card-title">贝叶斯分析</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* 胜率环形图 */}
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="64" cy="64" r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - (experiment.statisticalAnalysis?.bayesianResults?.probabilityABeatsB || 0) / 100)}`}
                  className="text-purple-500 transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">
                    {(experiment.statisticalAnalysis?.bayesianResults?.probabilityABeatsB || 0).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">胜率</div>
                </div>
              </div>
            </div>
          </div>

          {/* 贝叶斯指标 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">预期提升</span>
              <span className="font-bold text-purple-700">
                +{(experiment.statisticalAnalysis?.bayesianResults?.expectedLift || 0).toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">可信区间 (95%)</span>
              <span className="font-mono text-sm text-purple-700">
                [{(experiment.statisticalAnalysis?.bayesianResults?.credibleInterval?.[0] || 0).toFixed(3)}, 
                 {(experiment.statisticalAnalysis?.bayesianResults?.credibleInterval?.[1] || 0).toFixed(3)}]
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">建议操作</span>
              <Badge variant={experiment.statisticalAnalysis?.bayesianResults?.shouldStop ? "warning" : "success"}>
                {experiment.statisticalAnalysis?.bayesianResults?.shouldStop ? "停止实验" : "继续运行"}
              </Badge>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>

    {/* 频率学派分析结果 */}
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <h3 className="card-title">频率学派分析</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* P值可视化 */}
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {(experiment.statisticalAnalysis?.pValue || 0).toFixed(4)}
            </div>
            <div className="text-sm text-gray-600">P值</div>
            <div className={`text-xs mt-1 ${
              (experiment.statisticalAnalysis?.pValue || 1) < 0.05 
                ? 'text-green-600' : 'text-orange-600'
            }`}>
              {(experiment.statisticalAnalysis?.pValue || 1) < 0.05 ? '统计显著' : '不显著'}
            </div>
          </div>

          {/* 频率学派指标 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">效果量 (Cohen's d)</span>
              <span className="font-bold text-blue-700">
                {(experiment.statisticalAnalysis?.effectSize || 0).toFixed(3)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">置信区间 (95%)</span>
              <span className="font-mono text-sm text-blue-700">
                [{(experiment.statisticalAnalysis?.confidenceInterval?.[0] || 0).toFixed(3)}, 
                 {(experiment.statisticalAnalysis?.confidenceInterval?.[1] || 0).toFixed(3)}]
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">实际意义</span>
              <Badge variant={experiment.statisticalAnalysis?.practicalSignificance ? "success" : "warning"}>
                {experiment.statisticalAnalysis?.practicalSignificance ? "有意义" : "待评估"}
              </Badge>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  </div>

  {/* 决策矩阵 */}
  <Card>
    <CardHeader>
      <h3 className="card-title">决策支持矩阵</h3>
      <p className="card-subtitle">基于统计显著性与实际意义的四象限决策</p>
    </CardHeader>
    <CardBody>
      <div className="grid grid-cols-2 gap-4 h-64">
        {/* 第一象限：显著且有意义 */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
          <div className="text-center">
            <div className="font-bold text-green-800">显著且有意义</div>
            <div className="text-sm text-green-600 mt-1">推荐采用</div>
          </div>
        </div>

        {/* 第二象限：显著但无意义 */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-2" />
          <div className="text-center">
            <div className="font-bold text-yellow-800">显著但无意义</div>
            <div className="text-sm text-yellow-600 mt-1">谨慎评估</div>
          </div>
        </div>

        {/* 第三象限：不显著但有意义 */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <Clock className="h-8 w-8 text-blue-600 mb-2" />
          <div className="text-center">
            <div className="font-bold text-blue-800">不显著但有意义</div>
            <div className="text-sm text-blue-600 mt-1">继续观察</div>
          </div>
        </div>

        {/* 第四象限：不显著且无意义 */}
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center">
          <XCircle className="h-8 w-8 text-gray-600 mb-2" />
          <div className="text-center">
            <div className="font-bold text-gray-800">不显著且无意义</div>
            <div className="text-sm text-gray-600 mt-1">停止实验</div>
          </div>
        </div>
      </div>
    </CardBody>
  </Card>
</div>
```

### 3.4 三层指标体系设计

#### 3.4.1 L1核心业务指标
```jsx
<Card>
  <CardHeader>
    <h3 className="card-title">L1 核心业务指标</h3>
    <p className="card-subtitle">直接反映业务成果的关键指标</p>
  </CardHeader>
  <CardBody>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="任务完成率"
        value={`${(experiment.metrics.businessMetrics.taskSuccessRate * 100).toFixed(1)}%`}
        change="+2.3%"
        trend="up"
        color="green"
        tooltip="用户成功完成预期任务的比例，核心业务成果指标"
      />
      <MetricCard
        title="用户价值密度"
        value={experiment.metrics.businessMetrics.userValueDensity.toFixed(2)}
        change="+0.12"
        trend="up" 
        color="blue"
        tooltip="单次会话平均创造的用户价值量化"
      />
      <MetricCard
        title="7日留存率"
        value={`${(experiment.metrics.businessMetrics.retentionRate7d * 100).toFixed(1)}%`}
        change="+1.5%"
        trend="up"
        color="purple"
        tooltip="用户7天后仍然活跃的比例，短期黏性指标"
      />
      <MetricCard
        title="30日留存率" 
        value={`${(experiment.metrics.businessMetrics.retentionRate30d * 100).toFixed(1)}%`}
        change="+0.8%"
        trend="up"
        color="orange"
        tooltip="用户30天后仍然活跃的比例，长期价值指标"
      />
      <MetricCard
        title="用户激活率"
        value={`${(experiment.metrics.businessMetrics.userActivation * 100).toFixed(1)}%`}
        change="+3.2%"
        trend="up"
        color="green"
        tooltip="新用户完成关键激活行为的比例"
      />
    </div>
  </CardBody>
</Card>
```

#### 3.4.2 L2支撑分析指标
```jsx
<Card className="mt-6">
  <CardHeader>
    <h3 className="card-title">L2 支撑分析指标</h3>
    <p className="card-subtitle">支撑业务指标的过程性分析指标</p>
  </CardHeader>
  <CardBody>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <MetricCard
        title="有效交互深度"
        value={experiment.metrics.supportMetrics.effectiveInteractionDepth.toFixed(1)}
        change="+0.3"
        trend="up"
        color="blue"
        tooltip="用户与系统有意义对话的平均轮次"
      />
      <MetricCard
        title="澄清请求比例"
        value={`${(experiment.metrics.supportMetrics.clarificationRequestRatio * 100).toFixed(1)}%`}
        change="-2.1%"
        trend="down"
        color="green"
        tooltip="系统主动澄清用户意图的会话占比，越低越好"
      />
      <MetricCard
        title="首次命中率"
        value={`${(experiment.metrics.supportMetrics.firstResponseHitRate * 100).toFixed(1)}%`}
        change="+4.2%"
        trend="up"
        color="green"
        tooltip="首次回复就满足用户需求的成功率"
      />
      <MetricCard
        title="问题解决时间"
        value={`${(experiment.metrics.supportMetrics.timeToResolution / 1000).toFixed(1)}s`}
        change="-0.8s"
        trend="down"
        color="green"
        tooltip="从用户提出问题到得到满意答案的平均时长"
      />
      <MetricCard
        title="知识覆盖度"
        value={`${(experiment.metrics.supportMetrics.knowledgeCoverage * 100).toFixed(1)}%`}
        change="+1.2%"
        trend="up"
        color="purple"
        tooltip="系统能够回答用户问题的知识覆盖程度"
      />
    </div>
  </CardBody>
</Card>
```

#### 3.4.3 L3技术监控指标
```jsx
<Card className="mt-6">
  <CardHeader>
    <h3 className="card-title">L3 技术监控指标</h3>
    <p className="card-subtitle">系统技术性能和稳定性指标</p>
  </CardHeader>
  <CardBody>
    <div className="space-y-6">
      {/* 性能指标组 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">系统性能</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="成功率"
            value={`${(experiment.metrics.technicalMetrics.successRate * 100).toFixed(2)}%`}
            change="+0.15%"
            trend="up"
            color="green"
            size="sm"
          />
          <MetricCard
            title="平均响应时间"
            value={`${experiment.metrics.technicalMetrics.avgResponseTime}ms`}
            change="-23ms"
            trend="down"
            color="green"
            size="sm"
          />
          <MetricCard
            title="P95响应时间"
            value={`${experiment.metrics.technicalMetrics.p95ResponseTime}ms`}
            change="-45ms"
            trend="down"
            color="green"
            size="sm"
          />
          <MetricCard
            title="重试率"
            value={`${(experiment.metrics.technicalMetrics.retryRate * 100).toFixed(2)}%`}
            change="-0.08%"
            trend="down"
            color="green"
            size="sm"
          />
        </div>
      </div>

      {/* 成本指标组 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">成本控制</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="平均Token成本"
            value={`$${experiment.metrics.technicalMetrics.avgTokenCost.toFixed(4)}`}
            change="-$0.0012"
            trend="down"
            color="green"
            size="sm"
          />
          <MetricCard
            title="会话Token成本"
            value={`$${experiment.metrics.technicalMetrics.tokenCostPerSession.toFixed(3)}`}
            change="-$0.008"
            trend="down"
            color="green"
            size="sm"
          />
          <MetricCard
            title="模型失效率"
            value={`${(experiment.metrics.technicalMetrics.modelFailureRate * 100).toFixed(2)}%`}
            change="-0.03%"
            trend="down"
            color="green"
            size="sm"
          />
        </div>
      </div>

      {/* 质量指标组 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">服务质量</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            title="早期退出率"
            value={`${(experiment.metrics.technicalMetrics.earlyExitRate * 100).toFixed(2)}%`}
            change="-1.2%"
            trend="down"
            color="green"
            size="sm"
          />
          <MetricCard
            title="工具调用成功率"
            value={`${(experiment.metrics.technicalMetrics.toolCallSuccessRate * 100).toFixed(2)}%`}
            change="+0.5%"
            trend="up"
            color="green"
            size="sm"
          />
          <MetricCard
            title="总会话数"
            value={experiment.metrics.technicalMetrics.totalSessions.toLocaleString()}
            change="+234"
            trend="up"
            color="blue"
            size="sm"
          />
        </div>
      </div>
    </div>
  </CardBody>
</Card>
```

### 3.5 可解释性洞察设计

#### 3.5.1 特征重要性分析
```jsx
<Card>
  <CardHeader>
    <h3 className="card-title">特征重要性分析</h3>
    <p className="card-subtitle">影响实验结果的关键因素权重分布</p>
  </CardHeader>
  <CardBody>
    <div className="space-y-4">
      {Object.entries(experiment.explainability?.featureImportance || {})
        .sort(([,a], [,b]) => b - a)
        .map(([feature, importance]) => (
          <div key={feature} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-900">{getFeatureName(feature)}</span>
              <span className="text-sm font-semibold text-primary-600">
                {(importance * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-700"
                style={{ width: `${importance * 100}%` }}
              />
            </div>
          </div>
        ))
      }
    </div>
  </CardBody>
</Card>
```

#### 3.5.2 用户行为路径分析
```jsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
  {/* 成功路径 */}
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <h3 className="card-title text-green-800">成功路径模式</h3>
      </div>
    </CardHeader>
    <CardBody>
      <div className="space-y-3">
        {experiment.explainability?.successfulPaths?.map((path, index) => (
          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">
                模式 #{index + 1}
              </span>
              <span className="text-xs text-green-600">
                频率: {path.frequency}次
              </span>
            </div>
            <div className="text-sm text-green-700 mb-2">
              {path.pattern.join(' → ')}
            </div>
            <div className="flex items-center justify-between text-xs text-green-600">
              <span>平均会话时长: {path.avgSessionLength}s</span>
              <span>共同特征: {path.commonFeatures.length}个</span>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>

  {/* 失败路径 */}
  <Card>
    <CardHeader>
      <div className="flex items-center gap-2">
        <XCircle className="h-5 w-5 text-red-600" />
        <h3 className="card-title text-red-800">失败路径模式</h3>
      </div>
    </CardHeader>
    <CardBody>
      <div className="space-y-3">
        {experiment.explainability?.failurePaths?.map((path, index) => (
          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">
                问题模式 #{index + 1}
              </span>
              <span className="text-xs text-red-600">
                频率: {path.frequency}次
              </span>
            </div>
            <div className="text-sm text-red-700 mb-2">
              {path.pattern.join(' → ')}
            </div>
            <div className="flex items-center justify-between text-xs text-red-600">
              <span>平均会话时长: {path.avgSessionLength}s</span>
              <span>共同特征: {path.commonFeatures.length}个</span>
            </div>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
</div>
```

#### 3.5.3 智能改进建议
```jsx
<Card className="mt-6">
  <CardHeader>
    <div className="flex items-center gap-2">
      <Lightbulb className="h-5 w-5 text-yellow-600" />
      <h3 className="card-title">智能改进建议</h3>
    </div>
    <p className="card-subtitle">基于数据分析的优化方向建议</p>
  </CardHeader>
  <CardBody>
    <div className="space-y-4">
      {/* 立即行动项 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-orange-600" />
          立即行动项
        </h4>
        <div className="space-y-2">
          <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
            <div className="font-medium text-orange-800">优化响应质量</div>
            <div className="text-sm text-orange-700 mt-1">
              当前响应质量影响权重42%，建议优化提示词模板和模型参数调优
            </div>
          </div>
          <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg">
            <div className="font-medium text-orange-800">加强工具稳定性</div>
            <div className="text-sm text-orange-700 mt-1">
              工具调用失败率偏高，建议增加重试机制和错误处理优化
            </div>
          </div>
        </div>
      </div>

      {/* 长期规划项 */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Calendar className="h-4 w-4 text-blue-600" />
          长期规划项
        </h4>
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div className="font-medium text-blue-800">建设专门澄清系统</div>
            <div className="text-sm text-blue-700 mt-1">
              澄清请求比例较高，建议开发专门的意图澄清子系统
            </div>
          </div>
          <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <div className="font-medium text-blue-800">用户行为预测模型</div>
            <div className="text-sm text-blue-700 mt-1">
              基于成功路径模式，构建用户行为预测和引导系统
            </div>
          </div>
        </div>
      </div>
    </div>
  </CardBody>
</Card>
```

### 3.6 实验向导设计

#### 3.6.1 多步骤向导界面
```jsx
<Modal isOpen={showWizard} onClose={() => setShowWizard(false)} size="xl">
  <ModalHeader>
    <h2 className="text-xl font-semibold">创建A/B实验</h2>
    <div className="flex items-center mt-4">
      {wizardSteps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className={`
            flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
            ${index <= currentStep 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-200 text-gray-500'
            }
          `}>
            {index + 1}
          </div>
          <div className="ml-2 text-sm font-medium text-gray-900">
            {step.title}
          </div>
          {index < wizardSteps.length - 1 && (
            <div className={`
              h-1 w-12 mx-4
              ${index < currentStep ? 'bg-primary-600' : 'bg-gray-200'}
            `} />
          )}
        </div>
      ))}
    </div>
  </ModalHeader>

  <ModalBody>
    {currentStep === 0 && <BasicConfigStep />}
    {currentStep === 1 && <ComplexityAssessmentStep />}
    {currentStep === 2 && <ParameterConfigStep />}
    {currentStep === 3 && <BudgetConfigStep />}
    {currentStep === 4 && <ReviewStep />}
  </ModalBody>

  <ModalFooter>
    <Button 
      variant="ghost" 
      onClick={currentStep === 0 ? () => setShowWizard(false) : previousStep}
    >
      {currentStep === 0 ? '取消' : '上一步'}
    </Button>
    <Button 
      variant="primary" 
      onClick={currentStep === wizardSteps.length - 1 ? createExperiment : nextStep}
      loading={creating}
    >
      {currentStep === wizardSteps.length - 1 ? '创建实验' : '下一步'}
    </Button>
  </ModalFooter>
</Modal>
```

---

## 4. 业务逻辑详述

### 4.1 核心数据结构

#### 4.1.1 增强的A/B测试定义
```typescript
interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  groups: ABTestGroup[];
  metrics: ABTestMetrics;
  winnerGroup?: string;
  
  // 实验配置
  config: {
    splittingStrategy: 'session' | 'user' | 'hybrid';
    stratificationDimensions: string[];
    environmentControl: {
      fixedSeed: number;
      temperature: number;
      consistentParams: boolean;
    };
    complexityLevel: 'low' | 'medium' | 'high';
    budget: {
      maxTokens?: number;
      maxCost?: number;
      currentSpent: number;
    };
  };
  
  // 统计分析结果
  statisticalAnalysis?: {
    pValue: number;
    effectSize: number;
    confidenceInterval: [number, number];
    practicalSignificance: boolean;
    statisticalSignificance: boolean;
    bayesianResults?: BayesianAnalysis;
    recommendation: 'continue' | 'stop_a_wins' | 'stop_b_wins' | 'inconclusive';
  };
  
  // 可解释性分析
  explainability?: {
    featureImportance: Record<string, number>;
    successfulPaths: UserPath[];
    failurePaths: UserPath[];
    causalEffects: CausalEffect[];
    timeSeriesAdjustment?: TimeSeriesAdjustment;
  };
}
```

#### 4.1.2 贝叶斯分析结果
```typescript
interface BayesianAnalysis {
  probabilityABeatsB: number;
  expectedLift: number;
  credibleInterval: [number, number];
  shouldStop: boolean;
  recommendation: string;
  
  // 扩展贝叶斯指标
  posteriorDistribution: {
    mean: number;
    variance: number;
    samples: number[];
  };
  
  decisionMetrics: {
    riskOfError: number;
    valueOfInformation: number;
    regretBounds: [number, number];
  };
}
```

#### 4.1.3 三层指标体系
```typescript
interface ABTestMetrics {
  // L1 核心业务指标
  businessMetrics: {
    taskSuccessRate: number;
    userValueDensity: number;
    retentionRate7d: number;
    retentionRate30d: number;
    userActivation: number;
  };
  
  // L2 支撑分析指标
  supportMetrics: {
    effectiveInteractionDepth: number;
    clarificationRequestRatio: number;
    firstResponseHitRate: number;
    timeToResolution: number;
    knowledgeCoverage: number;
  };
  
  // L3 技术监控指标
  technicalMetrics: {
    totalSessions: number;
    successRate: number;
    avgResponseTime: number;
    p95ResponseTime: number;
    avgTokenCost: number;
    tokenCostPerSession: number;
    retryRate: number;
    earlyExitRate: number;
    toolCallSuccessRate: number;
    modelFailureRate: number;
  };
  
  // 满意度（可选）
  satisfactionScore?: number;
}
```

### 4.2 三层指标体系详细定义

#### 4.2.1 L1核心业务指标详解

##### 1. 任务完成率 (Task Success Rate)
**定义：** 用户成功完成预期任务的比例，衡量系统满足用户核心需求的能力

**计算公式：**
```typescript
taskSuccessRate = (成功完成任务的会话数 / 总会话数) × 100%

// 成功任务判定条件：
// 1. 用户明确表示满意或问题已解决
// 2. 会话自然结束且最后一轮用户无负面反馈
// 3. 用户后续行为显示采纳了建议(7天内)
```

**指标解读：**
- **优秀 (≥85%)**: 系统能很好满足用户需求，用户体验优秀
- **良好 (70-84%)**: 系统基本满足需求，有改进空间
- **需改进 (50-69%)**: 系统存在明显问题，需要重点优化
- **差 (<50%)**: 系统严重不满足用户需求，需要重新设计

**影响因素：**
- 回答准确性和相关性
- 系统理解能力
- 工具调用成功率
- 知识库完整性

---

##### 2. 用户价值密度 (User Value Density)
**定义：** 单次会话为用户创造的价值量化指标，综合考虑问题解决质量和效率

**计算公式：**
```typescript
userValueDensity = Σ(会话价值得分) / 总会话数

// 会话价值计算：
会话价值 = (问题复杂度权重 × 解决完整度 × 满意度 × 时效性) / 100
问题复杂度权重 = [1.0(简单), 1.5(中等), 2.5(复杂), 4.0(专家级)]
解决完整度 = [0-1] 基于用户反馈和后续行为
满意度 = [1-5] 用户评分或推断
时效性 = max(0.5, 1 - (实际用时 - 理想用时) / 理想用时)
```

**指标解读：**
- **优秀 (≥4.0)**: 每次会话都能为用户创造高价值
- **良好 (3.0-3.9)**: 大部分会话有价值，少数低效
- **需改进 (2.0-2.9)**: 价值创造不稳定，存在浪费
- **差 (<2.0)**: 大量无效会话，价值密度过低

**业务意义：**
- 衡量系统投入产出效率
- 指导资源分配优先级
- 评估服务质量提升效果

---

##### 3. 7日留存率 (7-Day Retention Rate)
**定义：** 首次使用后7天内再次使用系统的用户比例，反映短期用户黏性

**计算公式：**
```typescript
retentionRate7d = (7天内回访的新用户数 / 7天前的新用户总数) × 100%

// 统计逻辑：
// 1. 统计T日的新增用户数N
// 2. 统计这N个用户中在T+1至T+7日内有访问行为的用户数R
// 3. 留存率 = R/N × 100%
```

**指标解读：**
- **优秀 (≥40%)**: 用户体验优秀，形成使用习惯
- **良好 (25-39%)**: 有一定吸引力，部分用户会回来
- **需改进 (15-24%)**: 缺乏足够吸引力，需要激活策略
- **差 (<15%)**: 用户体验差，一次性使用居多

**影响因素：**
- 首次体验质量
- 功能实用性
- 学习成本
- 激活邮件效果

---

##### 4. 30日留存率 (30-Day Retention Rate)
**定义：** 首次使用后30天内仍有使用行为的用户比例，反映长期价值认知

**计算公式：**
```typescript
retentionRate30d = (30天内有活跃的新用户数 / 30天前的新用户总数) × 100%

// 活跃定义：30天内至少有3次有效会话
// 有效会话：非测试性质，会话轮次≥2，持续时间≥30秒
```

**指标解读：**
- **优秀 (≥20%)**: 用户认可长期价值，可能成为核心用户
- **良好 (12-19%)**: 有潜在价值，需要培养使用习惯
- **需改进 (5-11%)**: 长期价值不明显，需要功能优化
- **差 (<5%)**: 产品价值定位有问题

**与7日留存对比分析：**
```typescript
// 留存衰减率
retentionDecayRate = (retentionRate7d - retentionRate30d) / retentionRate7d
// 正常衰减率应在50-70%之间
```

---

##### 5. 用户激活率 (User Activation Rate)
**定义：** 新用户完成关键激活行为的比例，标志着用户真正开始使用系统

**计算公式：**
```typescript
userActivation = (完成激活行为的新用户数 / 新用户总数) × 100%

// 激活行为定义（满足任一条件）：
// 1. 完成≥3次有效对话且平均满意度≥4.0
// 2. 成功使用≥2个不同工具
// 3. 单次会话时长≥5分钟且任务完成
// 4. 主动保存对话或设置个人偏好
```

**指标解读：**
- **优秀 (≥60%)**: 新手引导优秀，用户能快速上手
- **良好 (40-59%)**: 大部分用户能激活，有优化空间
- **需改进 (20-39%)**: 激活门槛过高，需要简化流程
- **差 (<20%)**: 新用户体验差，流失严重

**优化策略：**
- 降低首次使用门槛
- 优化引导流程
- 提供更好的示例和教程
- 改善首次回答质量

#### 4.2.2 L2支撑分析指标详解

##### 1. 有效交互深度 (Effective Interaction Depth)
**定义：** 用户与系统进行有意义对话的平均轮次，反映系统引导深度对话的能力

**计算公式：**
```typescript
effectiveInteractionDepth = Σ(有效交互轮次) / 总会话数

// 有效交互判定：
// 1. 用户输入长度 ≥ 10个字符
// 2. 系统回复包含实质性内容（非纯礼貌用语）
// 3. 两轮对话间隔 < 5分钟（连续性）
// 4. 无重复性提问（用户理解了上一轮回复）
```

**指标解读：**
- **优秀 (≥4.0)**: 能够维持深度对话，用户参与度高
- **良好 (3.0-3.9)**: 基本能引导多轮对话
- **需改进 (2.0-2.9)**: 对话偏浅，缺少深入引导
- **差 (<2.0)**: 多为单轮问答，缺乏交互性

**优化方向：**
- 提升主动询问和澄清能力
- 增强上下文理解和记忆
- 优化追问策略和话题延展

---

##### 2. 澄清请求比例 (Clarification Request Ratio)
**定义：** 系统主动澄清用户意图的会话占比，衡量理解能力和主动性

**计算公式：**
```typescript
clarificationRequestRatio = (包含澄清请求的会话数 / 总会话数) × 100%

// 澄清请求识别：
// 1. 包含疑问词："您是指...吗？"、"需要我..."
// 2. 提供选择项："是A还是B？"
// 3. 请求补充信息："能详细说明..."
// 4. 确认理解："我理解的是..."
```

**指标解读：**
- **合理范围 (8-15%)**: 适度澄清，平衡效率和准确性
- **过高 (>20%)**: 理解能力不足，用户体验差
- **过低 (<5%)**: 可能存在理解错误但未澄清的风险
- **理想状态**: 随着系统优化应逐步降低

**分析维度：**
```typescript
// 澄清成功率
clarificationSuccessRate = (澄清后用户确认数 / 澄清请求总数) × 100%
// 澄清必要性
clarificationNecessity = (避免错误理解的澄清数 / 澄清请求总数) × 100%
```

---

##### 3. 首次命中率 (First Response Hit Rate)
**定义：** 首次回复就满足用户需求的成功率，衡量理解准确性和回答质量

**计算公式：**
```typescript
firstResponseHitRate = (首次回复成功的会话数 / 总会话数) × 100%

// 首次成功判定：
// 1. 用户对首次回复表示满意（显性反馈）
// 2. 用户未追问相同问题（隐性满意）
// 3. 会话在首次回复后自然结束且无负面情绪
// 4. 用户采纳了首次回复的建议（后续行为验证）
```

**指标解读：**
- **优秀 (≥70%)**: 理解准确，回答高质量
- **良好 (55-69%)**: 大部分情况下能一次解决
- **需改进 (40-54%)**: 理解或回答质量有问题
- **差 (<40%)**: 系统理解能力严重不足

**关联指标分析：**
```typescript
// 首次失败后的修正成功率
correctionSuccessRate = (二次回复成功数 / 首次回复失败数) × 100%
// 平均修正轮次
avgCorrectionRounds = Σ(修正轮次) / 首次失败会话数
```

---

##### 4. 问题解决时间 (Time to Resolution)
**定义：** 从用户提出问题到得到满意答案的平均时长，衡量解决效率

**计算公式：**
```typescript
timeToResolution = Σ(单个会话解决时长) / 解决成功的会话数

// 解决时长计算：
解决时长 = 最后一次满意回复时间戳 - 首次提问时间戳
// 仅统计最终解决成功的会话
// 排除用户长时间无响应的等待时间（>5分钟的间隔不计入）
```

**指标解读：**
- **优秀 (<60秒)**: 响应迅速，效率很高
- **良好 (60-120秒)**: 响应合理，基本及时
- **需改进 (120-300秒)**: 响应较慢，需要优化
- **差 (>300秒)**: 响应太慢，用户体验差

**分析维度：**
```typescript
// 按问题复杂度分层
简单问题解决时间目标: < 30秒
中等问题解决时间目标: < 90秒  
复杂问题解决时间目标: < 180秒
专家级问题解决时间目标: < 300秒
```

---

##### 5. 知识覆盖度 (Knowledge Coverage)
**定义：** 系统能够回答用户问题的知识覆盖程度，衡量知识库完整性

**计算公式：**
```typescript
knowledgeCoverage = (能够回答的问题数 / 总问题数) × 100%

// 能够回答的判定：
// 1. 系统给出了实质性回答（非"不知道"类回复）
// 2. 答案相关性评分 ≥ 0.7（基于语义匹配）
// 3. 用户未表示"答非所问"
// 4. 后续追问是深入而非重复提问
```

**指标解读：**
- **优秀 (≥90%)**: 知识覆盖面广，能处理绝大部分问题
- **良好 (80-89%)**: 覆盖较全，少数盲区
- **需改进 (65-79%)**: 存在明显知识缺口
- **差 (<65%)**: 知识库严重不足

**知识缺口分析：**
```typescript
// 按领域统计缺口
domainCoverageGaps = {
  技术类: (技术问题无法回答数 / 技术问题总数) × 100%,
  业务类: (业务问题无法回答数 / 业务问题总数) × 100%,
  通用类: (通用问题无法回答数 / 通用问题总数) × 100%
}
```

#### 4.2.3 L3技术监控指标详解

##### 系统性能指标组

##### 1. 成功率 (Success Rate)
**定义：** 系统正常处理请求的成功比例，衡量系统稳定性

**计算公式：**
```typescript
successRate = (成功处理的请求数 / 总请求数) × 100%

// 成功处理定义：
// 1. HTTP状态码为200
// 2. 返回了预期格式的响应
// 3. 无系统级别错误（超时、崩溃等）
// 4. 用户收到了完整回复
```

**指标解读：**
- **优秀 (≥99.5%)**: 系统极其稳定
- **良好 (99.0-99.4%)**: 系统稳定，偶有小问题
- **需改进 (95.0-98.9%)**: 存在稳定性问题
- **差 (<95.0%)**: 系统不稳定，严重影响用户体验

---

##### 2. 平均响应时间 (Average Response Time)
**定义：** 系统处理请求的平均耗时，从接收请求到返回完整响应

**计算公式：**
```typescript
avgResponseTime = Σ(单次请求响应时间) / 总请求数

// 响应时间测量：
响应时间 = 响应完成时间戳 - 请求接收时间戳
// 包含：网络传输、请求解析、业务处理、响应生成的总时间
```

**指标解读：**
- **优秀 (<2秒)**: 响应迅速，用户体验优秀
- **良好 (2-5秒)**: 响应合理，可接受
- **需改进 (5-10秒)**: 响应较慢，需优化
- **差 (>10秒)**: 响应太慢，用户难以接受

---

##### 3. P95响应时间 (P95 Response Time)  
**定义：** 95%的请求响应时间都不超过的阈值，衡量系统性能稳定性

**计算公式：**
```typescript
p95ResponseTime = 按响应时间排序后第95百分位的值

// 计算方法：
// 1. 将所有响应时间按升序排列
// 2. 取第(0.95 × 总数)位的值
// 3. 反映系统在高负载下的表现
```

**指标解读：**
- **优秀 (<5秒)**: 即使在高负载下也能快速响应
- **良好 (5-10秒)**: 高负载时性能良好
- **需改进 (10-20秒)**: 高负载时性能下降明显
- **差 (>20秒)**: 系统在压力下表现不佳

##### 成本控制指标组

##### 4. 平均Token成本 (Average Token Cost)
**定义：** 单个Token的平均成本，衡量成本效率

**计算公式：**
```typescript
avgTokenCost = 总Token费用支出 / 总Token使用量

// 成本构成：
// 1. 输入Token成本：输入Token数 × 输入单价
// 2. 输出Token成本：输出Token数 × 输出单价  
// 3. 工具调用成本：工具调用次数 × 调用单价
```

**指标解读：**
- **优秀 (<$0.002/token)**: 成本控制优秀
- **良好 ($0.002-0.005)**: 成本合理
- **需改进 ($0.005-0.01)**: 成本偏高
- **差 (>$0.01)**: 成本过高，需要优化

---

##### 5. 会话Token成本 (Token Cost Per Session)
**定义：** 单次会话的平均Token消耗成本

**计算公式：**
```typescript
tokenCostPerSession = 总Token成本 / 总会话数

// 成本优化考虑：
// 1. 上下文长度控制
// 2. 回复长度优化
// 3. 工具调用效率
// 4. 缓存机制使用
```

**指标解读：**
- **优秀 (<$0.05)**: 单会话成本很低
- **良好 ($0.05-0.15)**: 成本控制良好
- **需改进 ($0.15-0.50)**: 成本偏高，需要优化
- **差 (>$0.50)**: 成本过高，不可持续

##### 服务质量指标组

##### 6. 重试率 (Retry Rate)
**定义：** 因各种原因需要重试请求的比例

**计算公式：**
```typescript
retryRate = (重试请求总次数 / 原始请求总数) × 100%

// 重试原因分类：
// 1. 网络超时重试
// 2. 模型服务异常重试
// 3. 工具调用失败重试
// 4. 用户主动重试
```

**指标解读：**
- **优秀 (<1%)**: 系统稳定，很少需要重试
- **良好 (1-3%)**: 偶有重试，总体稳定
- **需改进 (3-8%)**: 重试较频繁，需要调查原因
- **差 (>8%)**: 重试过多，系统不稳定

---

##### 7. 早期退出率 (Early Exit Rate)
**定义：** 用户在会话早期（前3轮内）就退出的比例

**计算公式：**
```typescript
earlyExitRate = (3轮内结束的会话数 / 总会话数) × 100%

// 早期退出原因分析：
// 1. 首次回复不满意
// 2. 系统响应太慢
// 3. 理解偏差严重
// 4. 技术故障
```

**指标解读：**
- **优秀 (<10%)**: 用户黏性强，很少早期退出
- **良好 (10-20%)**: 大部分用户会继续对话
- **需改进 (20-35%)**: 较多用户早期退出，需要优化
- **差 (>35%)**: 大量早期退出，体验存在严重问题

---

##### 8. 工具调用成功率 (Tool Call Success Rate)
**定义：** 工具调用正常完成的成功率

**计算公式：**
```typescript
toolCallSuccessRate = (成功的工具调用次数 / 总工具调用次数) × 100%

// 成功调用判定：
// 1. 工具返回预期结果
// 2. 无异常或错误
// 3. 响应时间在合理范围内
// 4. 结果能被后续流程正常使用
```

**指标解读：**
- **优秀 (≥95%)**: 工具集成稳定可靠
- **良好 (90-94%)**: 工具调用基本稳定
- **需改进 (80-89%)**: 工具调用不够稳定
- **差 (<80%)**: 工具集成存在严重问题

---

##### 9. 模型失效率 (Model Failure Rate)
**定义：** AI模型无法正常提供服务的失效比例

**计算公式：**
```typescript
modelFailureRate = (模型失效次数 / 模型调用总次数) × 100%

// 失效类型：
// 1. 模型服务不可用
// 2. 输出格式异常
// 3. 内容安全过滤
// 4. 上下文长度超限
```

**指标解读：**
- **优秀 (<0.5%)**: 模型服务极其稳定
- **良好 (0.5-2%)**: 模型服务稳定
- **需改进 (2-5%)**: 模型服务不够稳定
- **差 (>5%)**: 模型服务严重不稳定

### 4.3 贝叶斯统计引擎实现

#### 4.2.1 贝叶斯A/B测试分析器
```typescript
class BayesianABAnalyzer {
  private priorAlpha: number = 1;  // Beta分布先验参数
  private priorBeta: number = 1;
  
  // 计算贝叶斯胜率
  calculateBayesianWinProbability(groupA: ABTestGroup, groupB: ABTestGroup): number {
    const successA = groupA.realTimeMetrics?.totalSessions * (groupA.realTimeMetrics?.conversionRate || 0);
    const trialsA = groupA.realTimeMetrics?.totalSessions || 0;
    
    const successB = groupB.realTimeMetrics?.totalSessions * (groupB.realTimeMetrics?.conversionRate || 0);
    const trialsB = groupB.realTimeMetrics?.totalSessions || 0;
    
    // 后验Beta分布参数
    const alphaA = this.priorAlpha + successA;
    const betaA = this.priorBeta + trialsA - successA;
    
    const alphaB = this.priorAlpha + successB;
    const betaB = this.priorBeta + trialsB - successB;
    
    // Monte Carlo抽样计算P(B > A)
    return this.monteCarloWinProbability(alphaA, betaA, alphaB, betaB);
  }
  
  private monteCarloWinProbability(
    alphaA: number, betaA: number,
    alphaB: number, betaB: number,
    samples: number = 100000
  ): number {
    let wins = 0;
    
    for (let i = 0; i < samples; i++) {
      const sampleA = this.betaSample(alphaA, betaA);
      const sampleB = this.betaSample(alphaB, betaB);
      
      if (sampleB > sampleA) {
        wins++;
      }
    }
    
    return wins / samples;
  }
  
  private betaSample(alpha: number, beta: number): number {
    // 使用Gamma分布生成Beta分布样本
    const gammaA = this.gammaSample(alpha, 1);
    const gammaB = this.gammaSample(beta, 1);
    
    return gammaA / (gammaA + gammaB);
  }
  
  private gammaSample(shape: number, scale: number): number {
    // 简化的Gamma分布抽样（实际应使用更精确的算法）
    if (shape < 1) {
      return this.gammaSample(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }
  
  private normalSample(): number {
    // Box-Muller变换生成标准正态分布样本
    static let hasSpare = false;
    static let spare: number;
    
    if (hasSpare) {
      hasSpare = false;
      return spare;
    }
    
    hasSpare = true;
    const u = Math.random();
    const v = Math.random();
    const mag = Math.sqrt(-2 * Math.log(u));
    spare = mag * Math.cos(2 * Math.PI * v);
    
    return mag * Math.sin(2 * Math.PI * v);
  }
  
  // 计算预期提升
  calculateExpectedLift(groupA: ABTestGroup, groupB: ABTestGroup): number {
    const conversionA = groupA.realTimeMetrics?.conversionRate || 0;
    const conversionB = groupB.realTimeMetrics?.conversionRate || 0;
    
    return ((conversionB - conversionA) / conversionA) * 100;
  }
  
  // 计算可信区间
  calculateCredibleInterval(
    groupA: ABTestGroup, 
    groupB: ABTestGroup, 
    confidence: number = 0.95
  ): [number, number] {
    // 使用Bootstrap方法计算可信区间
    const samples: number[] = [];
    const numSamples = 10000;
    
    for (let i = 0; i < numSamples; i++) {
      // 重抽样计算提升量
      const sampleA = this.resampleConversionRate(groupA);
      const sampleB = this.resampleConversionRate(groupB);
      const lift = ((sampleB - sampleA) / sampleA) * 100;
      samples.push(lift);
    }
    
    samples.sort((a, b) => a - b);
    const lowerIndex = Math.floor((1 - confidence) / 2 * numSamples);
    const upperIndex = Math.floor((1 + confidence) / 2 * numSamples);
    
    return [samples[lowerIndex], samples[upperIndex]];
  }
  
  private resampleConversionRate(group: ABTestGroup): number {
    const totalSessions = group.realTimeMetrics?.totalSessions || 0;
    const conversions = totalSessions * (group.realTimeMetrics?.conversionRate || 0);
    
    // 二项式重抽样
    let newConversions = 0;
    for (let i = 0; i < totalSessions; i++) {
      if (Math.random() < (conversions / totalSessions)) {
        newConversions++;
      }
    }
    
    return newConversions / totalSessions;
  }
  
  // 停止决策
  shouldStopExperiment(analysis: BayesianAnalysis): boolean {
    // 基于多个条件的复合决策
    const hasStrongEvidence = analysis.probabilityABeatsB > 95 || analysis.probabilityABeatsB < 5;
    const hasPracticalSignificance = Math.abs(analysis.expectedLift) > 5; // 5%的提升阈值
    const hasEnoughData = true; // 可以基于样本量判断
    
    return hasStrongEvidence && hasPracticalSignificance && hasEnoughData;
  }
}
```

#### 4.2.2 频率学派统计分析
```typescript
class FrequentistABAnalyzer {
  // 计算Z检验
  calculateZTest(groupA: ABTestGroup, groupB: ABTestGroup): {
    zScore: number;
    pValue: number;
    isSignificant: boolean;
  } {
    const nA = groupA.realTimeMetrics?.totalSessions || 0;
    const nB = groupB.realTimeMetrics?.totalSessions || 0;
    const pA = groupA.realTimeMetrics?.conversionRate || 0;
    const pB = groupB.realTimeMetrics?.conversionRate || 0;
    
    // 合并比例
    const pPooled = (nA * pA + nB * pB) / (nA + nB);
    
    // 标准误
    const se = Math.sqrt(pPooled * (1 - pPooled) * (1/nA + 1/nB));
    
    // Z分数
    const zScore = (pB - pA) / se;
    
    // P值（双尾检验）
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    return {
      zScore,
      pValue,
      isSignificant: pValue < 0.05
    };
  }
  
  // 计算效果量 (Cohen's d)
  calculateEffectSize(groupA: ABTestGroup, groupB: ABTestGroup): number {
    const pA = groupA.realTimeMetrics?.conversionRate || 0;
    const pB = groupB.realTimeMetrics?.conversionRate || 0;
    
    // 对于比例数据，使用Cohen's h
    const h = 2 * (Math.asin(Math.sqrt(pB)) - Math.asin(Math.sqrt(pA)));
    
    return h;
  }
  
  // 置信区间
  calculateConfidenceInterval(
    groupA: ABTestGroup, 
    groupB: ABTestGroup, 
    confidence: number = 0.95
  ): [number, number] {
    const nA = groupA.realTimeMetrics?.totalSessions || 0;
    const nB = groupB.realTimeMetrics?.totalSessions || 0;
    const pA = groupA.realTimeMetrics?.conversionRate || 0;
    const pB = groupB.realTimeMetrics?.conversionRate || 0;
    
    const diff = pB - pA;
    const se = Math.sqrt((pA * (1 - pA)) / nA + (pB * (1 - pB)) / nB);
    
    const alpha = 1 - confidence;
    const zCritical = this.normalInverseCDF(1 - alpha / 2);
    
    const margin = zCritical * se;
    
    return [diff - margin, diff + margin];
  }
  
  private normalCDF(x: number): number {
    // 标准正态分布累积分布函数的近似
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }
  
  private normalInverseCDF(p: number): number {
    // 标准正态分布分位数函数的近似
    if (p === 0.5) return 0;
    
    const sign = p > 0.5 ? 1 : -1;
    p = p > 0.5 ? p : 1 - p;
    
    const a = 0.147;
    const ln = Math.log(1 - p * p);
    const part1 = 2 / (Math.PI * a) + ln / 2;
    const part2 = ln / a;
    
    return sign * Math.sqrt(-part1 + Math.sqrt(part1 * part1 - part2));
  }
  
  private erf(x: number): number {
    // 误差函数的近似
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return sign * y;
  }
}
```

### 4.3 可解释性分析引擎

#### 4.3.1 特征重要性分析器
```typescript
class ExplainabilityAnalyzer {
  // 计算特征重要性
  calculateFeatureImportance(experiment: ABTest): Record<string, number> {
    const features = {
      'response_quality': 0,
      'response_speed': 0,
      'tool_usage': 0,
      'user_satisfaction': 0,
      'knowledge_coverage': 0,
      'interaction_depth': 0
    };
    
    // 基于相关性和方差分析计算特征重要性
    const metrics = experiment.metrics;
    
    // 响应质量的重要性（基于成功率和满意度的相关性）
    features.response_quality = this.calculateCorrelationImportance(
      metrics.technicalMetrics.successRate,
      metrics.satisfactionScore || 0
    );
    
    // 响应速度的重要性
    features.response_speed = this.calculateSpeedImportance(
      metrics.technicalMetrics.avgResponseTime,
      metrics.businessMetrics.taskSuccessRate
    );
    
    // 工具使用的重要性
    features.tool_usage = this.calculateToolImportance(
      metrics.technicalMetrics.toolCallSuccessRate,
      metrics.businessMetrics.userValueDensity
    );
    
    // 标准化权重
    const total = Object.values(features).reduce((sum, val) => sum + val, 0);
    Object.keys(features).forEach(key => {
      features[key] = features[key] / total;
    });
    
    return features;
  }
  
  private calculateCorrelationImportance(metric1: number, metric2: number): number {
    // 简化的相关性重要性计算
    return Math.abs(metric1 * metric2) / (metric1 + metric2 + 0.001);
  }
  
  private calculateSpeedImportance(responseTime: number, successRate: number): number {
    // 响应时间与成功率的反相关重要性
    const normalizedSpeed = Math.max(0, 1 - responseTime / 5000); // 5秒为基准
    return normalizedSpeed * successRate;
  }
  
  private calculateToolImportance(toolSuccessRate: number, valueRate: number): number {
    return toolSuccessRate * valueRate;
  }
  
  // 用户路径分析
  analyzeUserPaths(experiment: ABTest): {
    successfulPaths: UserPath[];
    failurePaths: UserPath[];
  } {
    // 模拟用户路径数据分析
    const successfulPaths: UserPath[] = [
      {
        id: 'success_1',
        pattern: ['进入系统', '提出问题', '获得准确回答', '确认满意'],
        frequency: 156,
        outcomeType: 'success',
        avgSessionLength: 45,
        commonFeatures: ['清晰问题', '标准场景', '直接回答']
      },
      {
        id: 'success_2', 
        pattern: ['进入系统', '复杂询问', '澄清需求', '工具调用', '满意回答'],
        frequency: 89,
        outcomeType: 'success',
        avgSessionLength: 78,
        commonFeatures: ['复杂问题', '主动澄清', '工具辅助']
      }
    ];
    
    const failurePaths: UserPath[] = [
      {
        id: 'failure_1',
        pattern: ['进入系统', '提出问题', '回答不准确', '重复询问', '放弃'],
        frequency: 34,
        outcomeType: 'failure',
        avgSessionLength: 120,
        commonFeatures: ['歧义问题', '理解偏差', '缺乏澄清']
      },
      {
        id: 'failure_2',
        pattern: ['进入系统', '复杂询问', '工具调用失败', '无法回答', '退出'],
        frequency: 23,
        outcomeType: 'failure', 
        avgSessionLength: 95,
        commonFeatures: ['工具依赖', '技术故障', '缺乏降级']
      }
    ];
    
    return { successfulPaths, failurePaths };
  }
  
  // 因果效应分析
  analyzeCausalEffects(experiment: ABTest): CausalEffect[] {
    return [
      {
        variable: 'response_quality',
        effect: 0.23,
        confidence: 0.89,
        mechanism: '高质量回答直接提升用户满意度和任务完成率'
      },
      {
        variable: 'tool_reliability',
        effect: 0.18,
        confidence: 0.76,
        mechanism: '工具调用稳定性影响复杂问题的解决能力'
      },
      {
        variable: 'clarification_proactive',
        effect: -0.12,
        confidence: 0.65,
        mechanism: '主动澄清减少误解，但可能增加交互轮次'
      }
    ];
  }
  
  // 生成改进建议
  generateImprovementSuggestions(
    featureImportance: Record<string, number>,
    userPaths: { successfulPaths: UserPath[]; failurePaths: UserPath[] },
    causalEffects: CausalEffect[]
  ): {
    immediate: string[];
    longTerm: string[];
  } {
    const immediate: string[] = [];
    const longTerm: string[] = [];
    
    // 基于特征重要性生成建议
    const topFeatures = Object.entries(featureImportance)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    topFeatures.forEach(([feature, importance]) => {
      if (importance > 0.3) {
        switch (feature) {
          case 'response_quality':
            immediate.push('优化响应质量：调整提示词模板，提高回答准确性');
            break;
          case 'response_speed':
            immediate.push('提升响应速度：优化模型推理参数，减少延迟');
            break;
          case 'tool_usage':
            immediate.push('加强工具稳定性：增加重试机制和错误处理');
            break;
        }
      }
    });
    
    // 基于失败路径生成长期建议
    userPaths.failurePaths.forEach(path => {
      if (path.frequency > 20) {
        if (path.commonFeatures.includes('缺乏澄清')) {
          longTerm.push('建设专门澄清系统：开发意图理解和澄清机制');
        }
        if (path.commonFeatures.includes('工具依赖')) {
          longTerm.push('工具降级策略：开发工具失败时的备用解决方案');
        }
      }
    });
    
    return { immediate, longTerm };
  }
}
```

### 4.4 实验复杂度评估

#### 4.4.1 复杂度评估算法
```typescript
class ComplexityAssessment {
  assessExperimentComplexity(config: ExperimentConfig): ComplexityAssessment {
    let score = 0;
    let variables = 0;
    let interactions = 0;
    
    // 变量复杂度评估
    if (config.testMultipleModels) {
      score += 20;
      variables += config.modelCount || 2;
    }
    
    if (config.testPromptVariations) {
      score += 15;
      variables += config.promptVariationCount || 2;
    }
    
    if (config.testToolConfigurations) {
      score += 25;
      variables += config.toolConfigCount || 2;
    }
    
    if (config.testUserSegments) {
      score += 30;
      variables += config.segmentCount || 2;
    }
    
    // 交互效应复杂度
    if (variables > 2) {
      interactions = Math.pow(2, variables - 2);
      score += interactions * 5;
    }
    
    // 指标复杂度
    const metricCount = (config.primaryMetrics?.length || 1) + 
                       (config.secondaryMetrics?.length || 0);
    score += metricCount * 3;
    
    // 时间复杂度
    if (config.expectedDuration > 30) { // 30天以上
      score += 15;
    }
    
    // 样本量需求计算
    const requiredSampleSize = this.calculateRequiredSampleSize(
      config.expectedEffectSize || 0.05,
      0.8, // 统计功效
      0.05 // 显著性水平
    );
    
    if (requiredSampleSize > 10000) {
      score += 20;
    }
    
    // 分析复杂度
    let analysisComplexity = 1;
    if (config.useBayesianAnalysis) analysisComplexity += 0.5;
    if (config.useMultipleComparisons) analysisComplexity += 0.3;
    if (config.accountForCovariates) analysisComplexity += 0.4;
    
    score += analysisComplexity * 10;
    
    // 确定复杂度级别
    let level: 'beginner' | 'intermediate' | 'expert';
    if (score < 50) {
      level = 'beginner';
    } else if (score < 100) {
      level = 'intermediate';
    } else {
      level = 'expert';
    }
    
    // 生成建议
    const recommendations = this.generateComplexityRecommendations(level, score, variables);
    
    return {
      score,
      level,
      variables,
      interactions,
      requiredSampleSize,
      analysisComplexity,
      recommendations
    };
  }
  
  private calculateRequiredSampleSize(
    effectSize: number,
    power: number,
    alpha: number
  ): number {
    // 使用Cohen's方法计算样本量
    const zAlpha = this.normalInverseCDF(1 - alpha / 2);
    const zBeta = this.normalInverseCDF(power);
    
    const n = Math.pow((zAlpha + zBeta) / effectSize, 2) * 2;
    
    return Math.ceil(n);
  }
  
  private generateComplexityRecommendations(
    level: 'beginner' | 'intermediate' | 'expert',
    score: number,
    variables: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (level === 'expert') {
      recommendations.push('建议分阶段执行，先进行简化版本测试');
      recommendations.push('需要专业的实验设计和统计分析支持');
      recommendations.push('考虑使用贝叶斯方法减少样本量需求');
    }
    
    if (variables > 4) {
      recommendations.push('变量过多，建议使用因子设计减少实验组合数');
    }
    
    if (score > 80) {
      recommendations.push('复杂度较高，建议延长实验周期确保充足样本');
      recommendations.push('准备详细的实验监控和中期分析计划');
    }
    
    return recommendations;
  }
}
```

---

## 5. 状态管理逻辑

### 5.1 复杂状态结构
```typescript
interface ABTestingState {
  // 实验数据
  experiments: ABTest[];
  selectedExperiment: ABTest | null;
  
  // UI状态
  activeTab: 'overview' | 'analysis' | 'insights' | 'settings';
  loading: boolean;
  error: string | null;
  
  // 实验向导状态
  showWizard: boolean;
  wizardStep: number;
  wizardData: Partial<CreateExperimentForm>;
  
  // 实时更新
  realTimeEnabled: boolean;
  updateInterval: number;
  lastUpdate: Date;
  
  // 分析状态
  analysisLoading: boolean;
  bayesianResults: Map<string, BayesianAnalysis>;
  frequentistResults: Map<string, FrequentistAnalysis>;
  
  // 可解释性结果
  explainabilityResults: Map<string, ExplainabilityResults>;
}
```

### 5.2 实验状态管理
```typescript
const ABTestingEnhanced: React.FC = () => {
  // 核心状态
  const [experiments, setExperiments] = useState<ABTest[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<ABTest | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // UI状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 实验向导状态
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardData, setWizardData] = useState<Partial<CreateExperimentForm>>({});
  
  // 分析结果缓存
  const [bayesianResults, setBayesianResults] = useState<Map<string, BayesianAnalysis>>(new Map());
  const [explainabilityResults, setExplainabilityResults] = useState<Map<string, ExplainabilityResults>>(new Map());
  
  // 实时更新机制
  useEffect(() => {
    if (selectedExperiment?.status === 'running') {
      const interval = setInterval(() => {
        updateExperimentMetrics(selectedExperiment.id);
      }, 5000); // 5秒更新
      
      return () => clearInterval(interval);
    }
  }, [selectedExperiment]);
  
  // 贝叶斯分析计算
  useEffect(() => {
    if (selectedExperiment && selectedExperiment.groups.length >= 2) {
      const analyzer = new BayesianABAnalyzer();
      const result = analyzer.analyzeBayesianResults(selectedExperiment);
      
      setBayesianResults(prev => new Map(prev).set(selectedExperiment.id, result));
    }
  }, [selectedExperiment?.groups]);
  
  // 可解释性分析
  useEffect(() => {
    if (selectedExperiment && selectedExperiment.status === 'completed') {
      const analyzer = new ExplainabilityAnalyzer();
      const result = analyzer.analyzeExperiment(selectedExperiment);
      
      setExplainabilityResults(prev => new Map(prev).set(selectedExperiment.id, result));
    }
  }, [selectedExperiment?.status]);
  
  const updateExperimentMetrics = async (experimentId: string) => {
    try {
      const updatedMetrics = await api.getExperimentMetrics(experimentId);
      
      setExperiments(prev => prev.map(exp => 
        exp.id === experimentId 
          ? { ...exp, metrics: updatedMetrics, updatedAt: new Date().toISOString() }
          : exp
      ));
      
      // 更新选中实验
      if (selectedExperiment?.id === experimentId) {
        setSelectedExperiment(prev => prev ? { ...prev, metrics: updatedMetrics } : null);
      }
    } catch (error) {
      console.error('Failed to update experiment metrics:', error);
    }
  };
  
  return (
    // JSX内容
  );
};
```

### 5.3 缓存和优化策略

#### 5.3.1 分析结果缓存
```typescript
class AnalysisCache {
  private static readonly CACHE_KEY = 'ab_testing_analysis';
  private static readonly CACHE_DURATION = 300000; // 5分钟
  
  private static cache: Map<string, CachedAnalysis> = new Map();
  
  static get(experimentId: string, analysisType: string): any | null {
    const key = `${experimentId}_${analysisType}`;
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  static set(experimentId: string, analysisType: string, data: any): void {
    const key = `${experimentId}_${analysisType}`;
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    // 限制缓存大小
    if (this.cache.size > 100) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }
  
  static invalidate(experimentId: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(experimentId)) {
        this.cache.delete(key);
      }
    }
  }
}

interface CachedAnalysis {
  data: any;
  timestamp: number;
}
```

#### 5.3.2 实时更新优化
```typescript
const useOptimizedRealTimeUpdates = (experimentId: string | null) => {
  const [updateQueue, setUpdateQueue] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 批量更新队列
  useEffect(() => {
    if (updateQueue.length === 0 || isUpdating) return;
    
    const processUpdates = async () => {
      setIsUpdating(true);
      
      try {
        // 批量获取更新
        const updates = await api.batchGetExperimentUpdates(updateQueue);
        
        // 应用更新
        updates.forEach(update => {
          applyExperimentUpdate(update);
        });
        
        setUpdateQueue([]);
      } catch (error) {
        console.error('Failed to process updates:', error);
      } finally {
        setIsUpdating(false);
      }
    };
    
    const timer = setTimeout(processUpdates, 1000); // 1秒批量处理
    return () => clearTimeout(timer);
  }, [updateQueue, isUpdating]);
  
  const queueUpdate = useCallback((experimentId: string) => {
    setUpdateQueue(prev => [...new Set([...prev, experimentId])]);
  }, []);
  
  return { queueUpdate, isUpdating };
};
```

---

## 6. 性能优化要求

### 6.1 计算优化
```typescript
// 使用Worker线程进行重计算任务
class StatisticalWorker {
  private worker: Worker | null = null;
  
  constructor() {
    // 创建Web Worker处理统计计算
    const workerCode = `
      self.onmessage = function(e) {
        const { type, data } = e.data;
        
        switch (type) {
          case 'bayesian_analysis':
            const result = performBayesianAnalysis(data);
            self.postMessage({ type: 'bayesian_result', result });
            break;
          case 'monte_carlo':
            const mcResult = runMonteCarloSimulation(data);
            self.postMessage({ type: 'monte_carlo_result', result: mcResult });
            break;
        }
      };
      
      function performBayesianAnalysis(data) {
        // 实现贝叶斯分析逻辑
        return { probabilityABeatsB: 0.87, expectedLift: 12.3 };
      }
      
      function runMonteCarloSimulation(data) {
        // 实现蒙特卡罗模拟
        return { samples: [], mean: 0, variance: 0 };
      }
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }
  
  async runBayesianAnalysis(data: any): Promise<BayesianAnalysis> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'));
        return;
      }
      
      const timeout = setTimeout(() => {
        reject(new Error('Analysis timeout'));
      }, 30000); // 30秒超时
      
      this.worker.onmessage = (e) => {
        if (e.data.type === 'bayesian_result') {
          clearTimeout(timeout);
          resolve(e.data.result);
        }
      };
      
      this.worker.postMessage({ type: 'bayesian_analysis', data });
    });
  }
}
```

### 6.2 渲染优化
```typescript
// 实验卡片虚拟化
const VirtualizedExperimentGrid: React.FC<{
  experiments: ABTest[];
  onSelectExperiment: (experiment: ABTest) => void;
}> = ({ experiments, onSelectExperiment }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { scrollTop, clientHeight } = containerRef.current;
      const itemHeight = 300; // 实验卡片高度
      const itemsPerRow = 3; // 每行显示的卡片数
      
      const start = Math.floor(scrollTop / itemHeight) * itemsPerRow;
      const end = Math.min(
        start + Math.ceil(clientHeight / itemHeight) * itemsPerRow + itemsPerRow,
        experiments.length
      );
      
      setVisibleRange({ start, end });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [experiments.length]);
  
  const visibleExperiments = experiments.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={containerRef} className="experiment-grid-container">
      <div style={{ height: Math.ceil(experiments.length / 3) * 300 }}>
        <div
          style={{ 
            transform: `translateY(${Math.floor(visibleRange.start / 3) * 300}px)`,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem'
          }}
        >
          {visibleExperiments.map(experiment => (
            <ExperimentCard
              key={experiment.id}
              experiment={experiment}
              onSelect={() => onSelectExperiment(experiment)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 6.3 性能指标要求
- **统计计算时间**：< 5秒 (贝叶斯分析)
- **实时更新延迟**：< 2秒
- **页面切换时间**：< 500ms  
- **图表渲染时间**：< 1秒
- **内存使用**：< 200MB (50个实验)
- **CPU使用率**：< 30% (正常操作)

---

## 7. 测试用例规范

### 7.1 统计算法测试
```typescript
describe('BayesianABAnalyzer', () => {
  let analyzer: BayesianABAnalyzer;
  
  beforeEach(() => {
    analyzer = new BayesianABAnalyzer();
  });
  
  test('计算贝叶斯胜率', () => {
    const groupA: ABTestGroup = {
      id: 'a',
      name: 'Control',
      trafficRatio: 0.5,
      config: {},
      realTimeMetrics: {
        totalSessions: 1000,
        conversionRate: 0.15,
        currentSessions: 0,
        avgMetricValues: {},
        costSpent: 0,
        sampleDistribution: []
      }
    };
    
    const groupB: ABTestGroup = {
      id: 'b', 
      name: 'Treatment',
      trafficRatio: 0.5,
      config: {},
      realTimeMetrics: {
        totalSessions: 1000,
        conversionRate: 0.18,
        currentSessions: 0,
        avgMetricValues: {},
        costSpent: 0,
        sampleDistribution: []
      }
    };
    
    const winProbability = analyzer.calculateBayesianWinProbability(groupA, groupB);
    
    expect(winProbability).toBeGreaterThan(0.5);
    expect(winProbability).toBeLessThan(1.0);
  });
  
  test('预期提升计算', () => {
    const groupA = createMockGroup(0.15);
    const groupB = createMockGroup(0.18);
    
    const expectedLift = analyzer.calculateExpectedLift(groupA, groupB);
    
    expect(expectedLift).toBeCloseTo(20, 1); // (0.18-0.15)/0.15 * 100 ≈ 20%
  });
});
```

### 7.2 UI组件测试  
```typescript
describe('ExperimentCard Component', () => {
  test('显示实验基础信息', () => {
    const mockExperiment = createMockExperiment();
    
    render(<ExperimentCard experiment={mockExperiment} onSelect={jest.fn()} />);
    
    expect(screen.getByText(mockExperiment.name)).toBeInTheDocument();
    expect(screen.getByText(mockExperiment.description)).toBeInTheDocument();
  });
  
  test('贝叶斯胜率进度条', () => {
    const mockExperiment = createMockExperiment({
      statisticalAnalysis: {
        bayesianResults: {
          probabilityABeatsB: 75
        }
      }
    });
    
    render(<ExperimentCard experiment={mockExperiment} onSelect={jest.fn()} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveStyle('width: 75%');
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
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.8.0",
    "d3": "^7.8.0",
    "@types/d3": "^7.4.0"
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
  Card, CardHeader, CardBody, Button, Badge, 
  Tabs, TabsList, TabsTrigger, TabsContent,
  Modal, MetricCard, Progress
} from '../components/ui';

// 图标
import { 
  Plus, TrendingUp, CheckCircle, XCircle, AlertTriangle,
  Clock, Calendar, Lightbulb, Brain, Target
} from 'lucide-react';

// 业务组件
import ExperimentWizard from '../components/ExperimentWizard';
import BayesianAnalysisChart from '../components/BayesianAnalysisChart';
import ExplainabilityInsights from '../components/ExplainabilityInsights';

// 统计分析
import { BayesianABAnalyzer, FrequentistABAnalyzer, ExplainabilityAnalyzer } from '../utils/statistics';

// 数据和类型
import { mockABTests } from '../data/mockABTestData';
import type { ABTest, BayesianAnalysis, ExplainabilityResults } from '../types';
```

---

## 9. Mock数据规范

### 9.1 完整实验数据
```typescript
export const mockABTests: ABTest[] = [
  {
    id: 'exp_001',
    name: '响应优化实验',
    description: '测试不同模型配置对响应质量和速度的影响',
    status: 'running',
    startDate: '2024-08-20T00:00:00.000Z',
    groups: [
      {
        id: 'control',
        name: '对照组',
        trafficRatio: 0.5,
        config: {
          model: 'gpt-4',
          temperature: 0.7,
          seed: 12345
        },
        realTimeMetrics: {
          currentSessions: 45,
          totalSessions: 2450,
          conversionRate: 0.73,
          avgMetricValues: {
            'task_success_rate': 0.73,
            'response_time': 1200,
            'user_satisfaction': 4.2
          },
          costSpent: 127.45,
          sampleDistribution: []
        }
      },
      {
        id: 'treatment',
        name: '实验组',
        trafficRatio: 0.5,
        config: {
          model: 'gpt-4',
          temperature: 0.5,
          seed: 12345
        },
        realTimeMetrics: {
          currentSessions: 52,
          totalSessions: 2387,
          conversionRate: 0.79,
          avgMetricValues: {
            'task_success_rate': 0.79,
            'response_time': 980,
            'user_satisfaction': 4.5
          },
          costSpent: 119.23,
          sampleDistribution: []
        }
      }
    ],
    metrics: {
      businessMetrics: {
        taskSuccessRate: 0.76,
        userValueDensity: 3.4,
        retentionRate7d: 0.68,
        retentionRate30d: 0.43,
        userActivation: 0.52
      },
      supportMetrics: {
        effectiveInteractionDepth: 2.8,
        clarificationRequestRatio: 0.15,
        firstResponseHitRate: 0.74,
        timeToResolution: 45000,
        knowledgeCoverage: 0.82
      },
      technicalMetrics: {
        totalSessions: 4837,
        successRate: 0.955,
        avgResponseTime: 1090,
        p95ResponseTime: 2100,
        avgTokenCost: 0.0034,
        tokenCostPerSession: 0.051,
        retryRate: 0.023,
        earlyExitRate: 0.087,
        toolCallSuccessRate: 0.934,
        modelFailureRate: 0.012
      },
      satisfactionScore: 4.35
    },
    config: {
      splittingStrategy: 'session',
      stratificationDimensions: ['user_type', 'time_segment'],
      environmentControl: {
        fixedSeed: 12345,
        temperature: 0.7,
        consistentParams: true
      },
      complexityLevel: 'medium',
      budget: {
        maxTokens: 1000000,
        maxCost: 500.0,
        currentSpent: 246.68
      }
    },
    statisticalAnalysis: {
      pValue: 0.0234,
      effectSize: 0.156,
      confidenceInterval: [0.023, 0.289],
      practicalSignificance: true,
      statisticalSignificance: true,
      recommendation: 'stop_b_wins',
      bayesianResults: {
        probabilityABeatsB: 87.3,
        expectedLift: 16.4,
        credibleInterval: [8.2, 24.8],
        shouldStop: true,
        recommendation: '实验组表现显著优于对照组，建议采用实验组配置',
        posteriorDistribution: {
          mean: 0.164,
          variance: 0.0045,
          samples: []
        },
        decisionMetrics: {
          riskOfError: 0.127,
          valueOfInformation: 234.5,
          regretBounds: [0, 45.2]
        }
      }
    },
    explainability: {
      featureImportance: {
        'response_quality': 0.42,
        'response_speed': 0.28,
        'tool_usage': 0.18,
        'user_satisfaction': 0.12
      },
      successfulPaths: [
        {
          id: 'success_1',
          pattern: ['用户提问', '准确理解', '快速回复', '满意确认'],
          frequency: 1245,
          outcomeType: 'success',
          avgSessionLength: 45,
          commonFeatures: ['明确问题', '标准场景', '直接回答']
        }
      ],
      failurePaths: [
        {
          id: 'failure_1',
          pattern: ['用户提问', '理解偏差', '不准确回复', '用户不满'],
          frequency: 156,
          outcomeType: 'failure',
          avgSessionLength: 89,
          commonFeatures: ['模糊问题', '理解困难', '需要澄清']
        }
      ],
      causalEffects: [
        {
          variable: 'response_quality',
          effect: 0.23,
          confidence: 0.89,
          mechanism: '高质量回答直接提升用户满意度'
        }
      ]
    }
  }
];
```

---

**实现完成标准：**
✅ 贝叶斯统计分析引擎正确实现并工作  
✅ 三层指标体系完整展示和实时更新  
✅ 可解释性洞察分析功能完整  
✅ 实验向导流程完整且用户友好  
✅ 决策支持矩阵正确显示和交互  
✅ 实时更新机制正常工作（5秒间隔）  
✅ 复杂度评估算法正确计算和建议  
✅ 所有统计计算性能满足要求  
✅ UI响应性和交互体验优秀