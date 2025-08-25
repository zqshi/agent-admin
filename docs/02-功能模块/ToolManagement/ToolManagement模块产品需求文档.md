# ToolManagement模块产品需求文档
## MCP协议工具管理平台详细设计

**文档版本：** V2.0  
**模块路径：** `/src/pages/ToolManagement.tsx`  
**创建日期：** 2024-08-25  
**文档目标：** 提供完整的MCP协议工具管理系统实现指南，支持工具全生命周期管理和企业级安全控制

---

## 1. 功能概述

### 1.1 模块定位
ToolManagement模块是KingSoft平台的核心工具管理中心，基于MCP（Model Context Protocol）协议，提供工具的全生命周期管理。通过统一的注册、配置、测试、发布和监控流程，为数字员工提供强大的工具扩展能力。

### 1.2 核心价值
- **全生命周期管理**：从注册到下线的完整工具管理流程
- **MCP协议支持**：标准化的工具接入和通信协议
- **企业级安全**：沙箱隔离、权限控制、资源限制
- **实时测试调试**：内置测试控制台，支持工具实时调试
- **可视化监控**：工具性能指标和使用统计分析

### 1.3 技术特性
- **多连接类型支持**：stdio、SSE、HTTP等多种连接方式
- **智能能力发现**：自动检测和识别工具能力
- **版本管理**：支持工具版本控制和回滚
- **状态机管理**：完整的工具状态生命周期控制
- **测试框架集成**：内置测试用例管理和执行引擎

---

## 2. 用户故事与业务场景说明

### 2.1 技术管理者视角

#### 故事1：工具生命周期统一管理

**用户故事：**  
作为一名技术管理者  
我希望能够统一管理所有MCP工具的完整生命周期（从注册到下线）  
以便于确保工具质量、降低维护成本并提升团队效率

**业务场景：** 公司数字员工系统使用了30多个不同的MCP工具，来自不同供应商和内部开发团队。缺乏统一的管理导致工具质量参差不齐，部分工具已过期但仍在使用，新工具上线流程混乱，经常出现未经测试就直接投产的情况。

**痛点分析：**
- 工具散布在不同系统中，缺乏统一的注册和版本管理
- 新工具上线流程不规范，质量控制不到位
- 无法快速识别需要维护或下线的问题工具
- 工具的使用情况和性能数据分散，难以做出优化决策

**验收标准：**
- [ ] 支持查看所有工具的完整生命周期状态图（草稿→配置→测试→发布→维护→下线）
- [ ] 提供工具状态批量管理功能，可同时操作多个工具的状态变更
- [ ] 自动生成工具健康度评分报告，包含性能、稳定性、使用频率等指标
- [ ] 支持设置工具到期提醒和自动下线策略（如6个月未使用自动标记为待下线）
- [ ] 能够追溯任何工具的完整变更历史和操作记录
- [ ] 提供工具依赖关系图，显示工具间的调用关系，避免误下线关键工具

---

#### 故事2：工具质量门禁控制

**用户故事：**  
作为一名技术管理者  
我希望建立严格的工具质量门禁机制  
以便于确保只有经过充分测试的高质量工具才能投入生产使用

**业务场景：** 上个月由于一个未经充分测试的工具投入生产，导致20%的数字员工服务异常，影响了500多个客户。需要建立完善的质量控制流程，确保类似事件不再发生。

**痛点分析：**
- 缺乏统一的测试标准和必要的测试用例覆盖
- 工具发布审批流程不清晰，责任不明确
- 无法确保工具在各种边界条件下的稳定性
- 缺乏自动化的质量检测和准入机制

**验收标准：**
- [ ] 强制要求工具通过预设的测试用例才能从"测试中"状态转为"待发布"
- [ ] 支持自定义质量门禁规则（如最低测试覆盖率、成功率阈值等）
- [ ] 提供工具能力自动发现和验证功能，确保声明的功能真实可用
- [ ] 内置沙箱测试环境，自动进行安全性和稳定性检测
- [ ] 支持多级审批流程配置，关键工具必须经过高级管理者审批
- [ ] 自动生成工具质量报告，包含测试覆盖率、性能基准、安全检查结果

### 2.2 开发工程师视角

#### 故事3：快速工具集成与调试

**用户故事：**  
作为一名开发工程师  
我希望能够快速注册新开发的MCP工具并进行实时调试  
以便于提高开发效率并确保工具功能正确性

**业务场景：** 刚开发完成一个新的数据查询工具，需要快速集成到数字员工平台中。希望能够实时测试工具的各种功能，模拟不同的输入参数，验证输出结果是否符合预期，并能快速修复发现的问题。

**痛点分析：**
- 工具注册流程复杂，需要填写大量配置信息
- 缺乏实时调试工具，无法快速验证工具功能
- 测试环境搭建困难，影响开发效率
- 错误信息不够详细，问题定位困难

**验收标准：**
- [ ] 提供可视化的工具注册向导，自动检测工具配置和能力
- [ ] 内置强大的测试控制台，支持实时调用工具并查看详细的请求/响应数据
- [ ] 支持工具能力的自动发现，无需手动输入Schema定义
- [ ] 提供丰富的测试用例模板，可快速生成标准测试场景
- [ ] 实时显示工具执行日志和错误堆栈，便于快速问题定位
- [ ] 支持工具版本对比测试，验证新版本的向后兼容性

---

#### 故事4：工具协作开发支持

**用户故事：**  
作为一名开发工程师  
我希望能够与团队成员协作开发和维护MCP工具  
以便于提高代码质量并实现知识共享

**业务场景：** 团队正在开发一个复杂的ERP集成工具，需要3名工程师协作完成。希望能够共享工具配置、测试用例和调试经验，避免重复工作，并确保代码质量一致。

**痛点分析：**
- 缺乏协作功能，工具开发主要靠个人经验
- 测试用例和配置无法有效共享
- 工具文档维护困难，知识传承效果差
- 缺乏代码审查和质量控制机制

**验收标准：**
- [ ] 支持工具开发的协作功能，多人可同时编辑和维护同一工具
- [ ] 提供测试用例共享机制，团队成员可互相参考和复用测试用例
- [ ] 内置文档编辑器，支持Markdown格式的工具使用文档编写
- [ ] 支持工具变更的代码审查流程，重要修改需要同事审批
- [ ] 提供工具使用的最佳实践建议和常见问题解答
- [ ] 支持工具开发的版本分支管理，便于并行开发和功能验证

### 2.3 运维工程师视角

#### 故事5：工具运行监控与故障处理

**用户故事：**  
作为一名运维工程师  
我希望能够实时监控所有MCP工具的运行状态和性能指标  
以便于及时发现和处理工具故障，确保系统稳定运行

**业务场景：** 负责维护50多个生产环境的MCP工具，需要7×24小时监控工具状态。当工具出现异常时，能够快速定位问题并采取应急措施，同时需要生成详细的故障分析报告。

**痛点分析：**
- 工具状态监控不及时，故障发现延迟
- 缺乏统一的告警机制，重要故障可能被忽略
- 故障根因分析困难，处理时间过长
- 无法预测性地发现潜在问题工具

**验收标准：**
- [ ] 实时展示所有工具的运行状态，包括调用量、响应时间、错误率等关键指标
- [ ] 提供多层次的告警机制（邮件、短信、钉钉等），支持告警策略自定义
- [ ] 自动生成工具性能趋势分析，识别性能下降的工具
- [ ] 支持工具的一键重启、暂停、恢复等运维操作
- [ ] 提供详细的故障分析报告，包含时间线、影响范围、根因分析
- [ ] 内置智能故障预测算法，提前预警可能出现问题的工具

---

#### 故事6：工具资源优化管理

**用户故事：**  
作为一名运维工程师  
我希望能够监控和优化MCP工具的资源使用情况  
以便于降低运维成本并提升系统整体性能

**业务场景：** 发现系统资源使用率较高，需要识别哪些工具消耗了过多的CPU、内存或网络资源。希望能够优化资源配置，对低效工具进行调优或替换，实现成本和性能的最佳平衡。

**痛点分析：**
- 工具资源使用情况不透明，无法精确核算成本
- 缺乏资源优化的决策依据和工具
- 无法识别资源使用异常的工具
- 资源配置调整困难，影响系统稳定性

**验收标准：**
- [ ] 详细展示每个工具的资源消耗情况（CPU、内存、磁盘、网络）
- [ ] 提供资源使用趋势分析和异常检测功能
- [ ] 支持工具资源限制的动态调整，包括内存上限、超时时间等
- [ ] 自动识别资源使用效率低的工具，提供优化建议
- [ ] 支持工具的负载均衡配置，合理分配系统资源
- [ ] 生成工具资源使用的成本分析报告，支持成本核算和预算规划

### 2.4 业务管理者视角

#### 故事7：工具投资回报率分析

**用户故事：**  
作为一名业务管理者  
我希望能够分析不同MCP工具的投资回报率和业务价值  
以便于优化工具投资策略并提升业务效率

**业务场景：** 公司在MCP工具上投资了200万元，管理层要求评估这些投资的回报情况。需要分析哪些工具带来了实际的业务价值，哪些工具使用率低需要考虑下线，以及未来应该重点投资哪类工具。

**痛点分析：**
- 工具的业务价值难以量化评估
- 缺乏工具使用效果和ROI的统计数据
- 投资决策缺乏数据支撑，主要靠主观判断
- 无法识别高价值工具和低效工具

**验收标准：**
- [ ] 提供工具使用频率统计和用户满意度评分数据
- [ ] 支持工具业务价值的量化评估（如处理效率提升、成本节约等）
- [ ] 生成工具ROI分析报告，包含投资成本、使用收益、回收期等
- [ ] 支持工具使用的部门和用户维度统计分析
- [ ] 提供工具投资优化建议，识别高价值和低效工具
- [ ] 支持工具效果的对比分析，为新工具采购提供决策依据

---

## 3. 用户交互流程

### 3.1 工具全生命周期流程

#### 3.1.1 工具注册流程
```
进入工具管理 → 点击注册新工具 → 填写基础信息 → 配置连接方式 → 设置安全策略 → 添加测试用例 → 提交注册 → 状态变为草稿
```

#### 3.1.2 工具配置流程
```
选择草稿工具 → 点击编辑 → 配置详细参数 → 测试连接 → 发现能力 → 验证功能 → 保存配置 → 状态变为配置中
```

#### 3.1.3 工具测试流程
```
选择配置完成工具 → 进入测试模式 → 运行测试用例 → 实时调试 → 验证结果 → 状态变为测试中 → 测试通过后可发布
```

#### 3.1.4 工具发布流程
```
测试通过工具 → 点击发布 → 权限审核 → 部署配置 → 状态变为已发布 → 开始为数字员工提供服务
```

### 3.2 工具管理交互流程

#### 3.2.1 工具列表操作流程
```
1. 浏览工具：查看工具列表 → 筛选和搜索 → 查看详细信息
2. 状态管理：选择工具 → 执行状态操作 → 确认变更 → 记录历史
3. 批量操作：选择多个工具 → 选择操作类型 → 批量执行 → 结果反馈
4. 监控分析：查看性能指标 → 分析使用统计 → 优化建议
```

#### 3.2.2 工具测试交互流程
```
选择可测试工具 → 打开测试控制台 → 选择能力 → 输入参数 → 执行测试 → 查看结果 → 调试优化
```

### 3.3 权限控制流程
```
工具权限配置 → 部门范围设定 → 审批流程设置 → 使用监控 → 权限调整
```

---

## 4. UI/UX设计规范

### 4.1 页面整体布局

#### 4.1.1 页面布局结构
```jsx
<PageLayout>
  <PageHeader
    title="工具管理"
    subtitle="MCP协议工具的全生命周期管理"
  >
    <Button onClick={() => setShowCreateModal(true)}>
      <Plus className="h-4 w-4" />
      注册新工具
    </Button>
  </PageHeader>

  <PageContent>
    {/* 统计卡片 */}
    <div className="grid-responsive">
      <MetricCard title="总工具数" value={totalTools} icon={Settings} color="blue" />
      <MetricCard title="已发布" value={publishedTools} icon={Play} color="green" />
      <MetricCard title="测试中" value={testingTools} icon={Pause} color="yellow" />
      <MetricCard title="平均响应时间" value={`${avgResponseTime}ms`} icon={Eye} color="purple" />
    </div>

    {/* 搜索和筛选 */}
    <FilterSection {...filterProps} />

    {/* 工具列表表格 */}
    <Card>
      <ToolsTable tools={filteredTools} />
    </Card>

    {/* 模态框组件 */}
    <CreateMCPTool {...createModalProps} />
    <ToolTestConsole {...testConsoleProps} />
    <ToolDetailModal {...detailModalProps} />
  </PageContent>
</PageLayout>
```

### 4.2 工具统计卡片设计

#### 4.2.1 指标卡片配置
```jsx
<div className="grid-responsive">
  <MetricCard
    title="总工具数"
    value={mockToolUsageStats.totalTools}
    icon={Settings}
    color="blue"
    tooltip="系统中注册的所有MCP工具数量"
  />
  
  <MetricCard
    title="已发布"
    value={mockToolUsageStats.publishedTools}
    icon={Play}
    color="green"
    trend={{ value: "+3", type: "increase" }}
    tooltip="当前正在为数字员工提供服务的工具数量"
  />
  
  <MetricCard
    title="测试中"
    value={mockToolUsageStats.testingTools}
    icon={Pause}
    color="yellow"
    tooltip="正在进行功能测试和验证的工具数量"
  />
  
  <MetricCard
    title="平均响应时间"
    value={`${mockToolUsageStats.avgResponseTime}ms`}
    icon={Eye}
    color="purple"
    trend={{ value: "-15ms", type: "decrease" }}
    tooltip="所有已发布工具的平均响应时间"
  />
</div>
```

#### 3.2.2 动态指标计算
```typescript
const useToolMetrics = (tools: MCPTool[]) => {
  return useMemo(() => {
    const totalTools = tools.length;
    const publishedTools = tools.filter(t => t.status === 'published').length;
    const testingTools = tools.filter(t => t.status === 'testing').length;
    const maintenanceTools = tools.filter(t => t.status === 'maintenance').length;
    
    const avgResponseTime = tools
      .filter(t => t.metrics?.avgResponseTime)
      .reduce((sum, t) => sum + t.metrics!.avgResponseTime, 0) / 
      tools.filter(t => t.metrics?.avgResponseTime).length || 0;
    
    const totalCalls = tools.reduce((sum, t) => sum + (t.metrics?.totalCalls || 0), 0);
    const totalErrors = tools.reduce((sum, t) => sum + (t.metrics?.errorCount || 0), 0);
    const successRate = totalCalls > 0 ? ((totalCalls - totalErrors) / totalCalls) * 100 : 0;
    
    return {
      totalTools,
      publishedTools,
      testingTools,
      maintenanceTools,
      avgResponseTime: Math.round(avgResponseTime),
      totalCalls,
      successRate: Number(successRate.toFixed(1))
    };
  }, [tools]);
};
```

### 4.3 筛选区域设计

#### 4.3.1 搜索筛选配置
```jsx
<FilterSection
  searchProps={{
    value: searchTerm,
    onChange: setSearchTerm,
    placeholder: "搜索工具名称、描述或标签..."
  }}
  filters={[
    {
      key: 'status',
      placeholder: '全部状态',
      showIcon: true,
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'draft', label: '草稿', count: getStatusCount('draft') },
        { value: 'configuring', label: '配置中', count: getStatusCount('configuring') },
        { value: 'testing', label: '测试中', count: getStatusCount('testing') },
        { value: 'pending_release', label: '待发布', count: getStatusCount('pending_release') },
        { value: 'published', label: '已发布', count: getStatusCount('published') },
        { value: 'maintenance', label: '维护中', count: getStatusCount('maintenance') },
        { value: 'retired', label: '已下线', count: getStatusCount('retired') }
      ],
      showCount: true
    },
    {
      key: 'category',
      placeholder: '全部分类',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: categories.map(category => ({
        value: category,
        label: category,
        count: getCategoryCount(category)
      })),
      showCount: true
    },
    {
      key: 'connectionType',
      placeholder: '连接类型',
      value: connectionFilter,
      onChange: setConnectionFilter,
      options: [
        { value: 'stdio', label: 'STDIO', count: getConnectionTypeCount('stdio') },
        { value: 'sse', label: 'SSE', count: getConnectionTypeCount('sse') },
        { value: 'http', label: 'HTTP', count: getConnectionTypeCount('http') }
      ],
      showCount: true
    }
  ]}
/>
```

#### 3.3.2 智能筛选逻辑
```typescript
const useIntelligentFiltering = (tools: MCPTool[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm.trim()) return tools;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return tools.filter(tool => {
      // 基本字段匹配
      const basicMatch = 
        tool.displayName.toLowerCase().includes(lowerSearchTerm) ||
        tool.description.toLowerCase().includes(lowerSearchTerm) ||
        tool.name.toLowerCase().includes(lowerSearchTerm) ||
        tool.author.toLowerCase().includes(lowerSearchTerm) ||
        tool.category.toLowerCase().includes(lowerSearchTerm);
      
      // 标签匹配
      const tagMatch = tool.tags.some(tag => 
        tag.toLowerCase().includes(lowerSearchTerm)
      );
      
      // 能力匹配
      const capabilityMatch = tool.capabilities.some(cap => 
        cap.name.toLowerCase().includes(lowerSearchTerm) ||
        cap.description.toLowerCase().includes(lowerSearchTerm) ||
        cap.type.toLowerCase().includes(lowerSearchTerm)
      );
      
      // 配置匹配
      const configMatch = 
        tool.config.connectionType.toLowerCase().includes(lowerSearchTerm) ||
        (tool.config.stdio?.command && tool.config.stdio.command.toLowerCase().includes(lowerSearchTerm)) ||
        (tool.config.network?.url && tool.config.network.url.toLowerCase().includes(lowerSearchTerm));
      
      return basicMatch || tagMatch || capabilityMatch || configMatch;
    });
  }, [tools, searchTerm]);
};
```

### 3.4 工具列表表格设计

#### 3.4.1 表格结构设计
```jsx
<div className="overflow-x-auto">
  <table className="table">
    <thead className="table-header">
      <tr>
        <th className="table-header-cell">工具信息</th>
        <th className="table-header-cell">状态</th>
        <th className="table-header-cell">连接类型</th>
        <th className="table-header-cell">能力</th>
        <th className="table-header-cell">性能指标</th>
        <th className="table-header-cell">操作</th>
      </tr>
    </thead>
    <tbody className="table-body">
      {filteredTools.map((tool) => (
        <tr key={tool.id} className="table-row">
          {/* 工具信息列 */}
          <td className="table-cell">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-medium text-gray-900">
                    {tool.displayName}
                  </h3>
                  <span className="text-xs text-gray-500">v{tool.version}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 max-w-md">
                  {tool.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tool.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="info">
                      {tag}
                    </Badge>
                  ))}
                  {tool.tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{tool.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </td>
          
          {/* 状态列 */}
          <td className="table-cell">
            <Badge variant={getStatusBadgeVariant(tool.status)}>
              {getStatusText(tool.status)}
            </Badge>
            {tool.statusHistory.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                最后更新: {formatRelativeTime(tool.statusHistory[tool.statusHistory.length - 1].timestamp)}
              </div>
            )}
          </td>
          
          {/* 连接类型列 */}
          <td className="table-cell">
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {getConnectionTypeIcon(tool.config.connectionType)}
              </span>
              <div>
                <span className="text-sm text-gray-900 capitalize">
                  {tool.config.connectionType}
                </span>
                {tool.config.network?.url && (
                  <div className="text-xs text-gray-500 truncate max-w-24">
                    {new URL(tool.config.network.url).hostname}
                  </div>
                )}
              </div>
            </div>
          </td>
          
          {/* 能力列 */}
          <td className="table-cell">
            <div className="text-sm text-gray-900">
              {tool.capabilities.length} 个能力
            </div>
            <div className="text-xs text-gray-500">
              {tool.capabilities.map(cap => cap.type).slice(0, 2).join(', ')}
              {tool.capabilities.length > 2 && '...'}
            </div>
          </td>
          
          {/* 性能指标列 */}
          <td className="table-cell">
            {tool.metrics ? (
              <div className="text-sm">
                <div className="text-gray-900 flex items-center gap-1">
                  <span className={`inline-block w-2 h-2 rounded-full ${
                    tool.metrics.successRate > 0.95 ? 'bg-green-500' :
                    tool.metrics.successRate > 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
                  {(tool.metrics.successRate * 100).toFixed(1)}% 成功率
                </div>
                <div className="text-gray-500">
                  {tool.metrics.avgResponseTime}ms 平均响应
                </div>
                <div className="text-gray-500">
                  {tool.metrics.totalCalls.toLocaleString()} 次调用
                </div>
              </div>
            ) : (
              <span className="text-sm text-gray-400">暂无数据</span>
            )}
          </td>
          
          {/* 操作列 */}
          <td className="table-cell">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTool(tool)}
                title="查看详情"
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolAction(tool, 'edit')}
                title="编辑"
                disabled={tool.status === 'published'}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              
              {/* 状态相关操作按钮 */}
              {renderStatusActions(tool)}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToolAction(tool, 'delete')}
                className="text-error-600 hover:text-error-700 hover:bg-error-50"
                title="删除"
                disabled={tool.status === 'published'}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

#### 3.4.2 状态操作按钮组件
```jsx
const renderStatusActions = (tool: MCPTool) => {
  const actions = [];
  
  // 测试按钮
  if ((tool.status === 'testing' || tool.status === 'published') && tool.capabilities.length > 0) {
    actions.push(
      <Button
        key="test"
        variant="ghost"
        size="sm"
        onClick={() => handleToolAction(tool, 'test')}
        className="text-success-600 hover:text-success-700 hover:bg-success-50"
        title="测试工具"
      >
        <TestTube className="h-4 w-4" />
      </Button>
    );
  }
  
  // 发布按钮
  if (tool.status === 'testing') {
    actions.push(
      <Button
        key="publish"
        variant="ghost"
        size="sm"
        onClick={() => handleToolAction(tool, 'publish')}
        className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
        title="发布工具"
      >
        <Play className="h-4 w-4" />
      </Button>
    );
  }
  
  // 维护按钮
  if (tool.status === 'published') {
    actions.push(
      <Button
        key="maintenance"
        variant="ghost"
        size="sm"
        onClick={() => handleToolAction(tool, 'maintenance')}
        className="text-warning-600 hover:text-warning-700 hover:bg-warning-50"
        title="进入维护"
      >
        <Pause className="h-4 w-4" />
      </Button>
    );
  }
  
  return actions;
};
```

### 3.5 工具详情模态框设计

#### 3.5.1 详情模态框结构
```jsx
{selectedTool && createPortal(
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            工具详情 - {selectedTool.displayName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">查看工具的详细信息和配置</p>
        </div>
        <button
          onClick={() => setSelectedTool(null)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基础信息 */}
          <div>
            <h4 className="card-subtitle mb-3">基础信息</h4>
            <div className="space-y-3">
              <InfoRow label="工具名称" value={selectedTool.name} />
              <InfoRow label="显示名称" value={selectedTool.displayName} />
              <InfoRow label="版本" value={selectedTool.version} />
              <InfoRow label="作者" value={selectedTool.author} />
              <InfoRow label="分类" value={selectedTool.category} />
              <InfoRow 
                label="状态" 
                value={
                  <Badge variant={getStatusBadgeVariant(selectedTool.status)}>
                    {getStatusText(selectedTool.status)}
                  </Badge>
                } 
              />
              <div className="py-2">
                <div className="text-gray-600 mb-2">描述</div>
                <p className="text-sm text-gray-900">{selectedTool.description}</p>
              </div>
              <div className="py-2">
                <div className="text-gray-600 mb-2">标签</div>
                <div className="flex flex-wrap gap-1">
                  {selectedTool.tags.map((tag, index) => (
                    <Badge key={index} variant="info">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* 配置信息 */}
          <div>
            <h4 className="card-subtitle mb-3">配置信息</h4>
            <div className="space-y-3">
              <InfoRow 
                label="连接类型" 
                value={
                  <div className="flex items-center gap-2">
                    <span>{getConnectionTypeIcon(selectedTool.config.connectionType)}</span>
                    <span className="capitalize">{selectedTool.config.connectionType}</span>
                  </div>
                } 
              />
              
              {/* 网络配置 */}
              {selectedTool.config.network && (
                <>
                  <InfoRow label="URL" value={selectedTool.config.network.url} />
                  <InfoRow label="方法" value={selectedTool.config.network.method} />
                  {selectedTool.config.network.authentication && (
                    <InfoRow 
                      label="认证方式" 
                      value={selectedTool.config.network.authentication.type} 
                    />
                  )}
                </>
              )}
              
              {/* STDIO配置 */}
              {selectedTool.config.stdio && (
                <>
                  <div className="py-2 border-b border-gray-100">
                    <div className="text-gray-600 mb-2">命令</div>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded block">
                      {selectedTool.config.stdio.command}
                    </code>
                  </div>
                  {selectedTool.config.stdio.args && (
                    <div className="py-2 border-b border-gray-100">
                      <div className="text-gray-600 mb-2">参数</div>
                      <div className="text-sm font-mono">
                        {selectedTool.config.stdio.args.join(' ')}
                      </div>
                    </div>
                  )}
                  {selectedTool.config.stdio.env && (
                    <div className="py-2 border-b border-gray-100">
                      <div className="text-gray-600 mb-2">环境变量</div>
                      <div className="space-y-1">
                        {Object.entries(selectedTool.config.stdio.env).map(([key, value]) => (
                          <div key={key} className="text-sm font-mono">
                            {key}={value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              
              {/* 安全配置 */}
              {selectedTool.config.security && (
                <>
                  <InfoRow 
                    label="沙箱" 
                    value={
                      <Badge variant={selectedTool.config.security.sandbox ? 'success' : 'gray'}>
                        {selectedTool.config.security.sandbox ? '启用' : '禁用'}
                      </Badge>
                    } 
                  />
                  <InfoRow 
                    label="QPS限制" 
                    value={selectedTool.config.security.rateLimiting.globalQPS} 
                  />
                  <InfoRow 
                    label="用户QPS限制" 
                    value={selectedTool.config.security.rateLimiting.perUserQPS} 
                  />
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* 能力列表 */}
        <div className="mt-6">
          <h4 className="card-subtitle mb-3">能力列表 ({selectedTool.capabilities.length})</h4>
          <div className="space-y-3">
            {selectedTool.capabilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>暂无能力信息</p>
                <p className="text-xs">请先配置并测试工具连接</p>
              </div>
            ) : (
              selectedTool.capabilities.map((capability, index) => (
                <Card key={index}>
                  <CardBody>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="info">{capability.type}</Badge>
                      <span className="font-medium">{capability.name}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{capability.description}</p>
                    
                    {/* Schema展示 */}
                    {capability.schema && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 select-none">
                          查看Schema
                        </summary>
                        <div className="mt-2 bg-gray-50 p-3 rounded text-xs overflow-x-auto border">
                          <pre>{JSON.stringify(capability.schema, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </div>
        
        {/* 性能指标 */}
        {selectedTool.metrics && (
          <div className="mt-6">
            <h4 className="card-subtitle mb-3">性能指标</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {selectedTool.metrics.totalCalls.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">总调用次数</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(selectedTool.metrics.successRate * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">成功率</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedTool.metrics.avgResponseTime}ms
                </div>
                <div className="text-xs text-gray-500">平均响应时间</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {selectedTool.metrics.errorCount}
                </div>
                <div className="text-xs text-gray-500">错误次数</div>
              </div>
            </div>
          </div>
        )}
        
        {/* 状态历史 */}
        {selectedTool.statusHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="card-subtitle mb-3">状态历史</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedTool.statusHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((history) => (
                  <div key={history.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusBadgeVariant(history.fromStatus)}>
                        {getStatusText(history.fromStatus)}
                      </Badge>
                      <span className="text-gray-400">→</span>
                      <Badge variant={getStatusBadgeVariant(history.toStatus)}>
                        {getStatusText(history.toStatus)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900">{history.operator}</div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(history.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>,
  document.body
)}
```

#### 3.5.2 信息行组件
```jsx
const InfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-gray-600">{label}</span>
    <div className="font-medium">
      {typeof value === 'string' ? (
        <span className="text-gray-900">{value}</span>
      ) : (
        value
      )}
    </div>
  </div>
);
```

### 3.6 工具测试控制台设计

#### 3.6.1 测试控制台界面
```jsx
<ToolTestConsole
  tool={testingTool}
  isOpen={showTestConsole}
  onClose={() => {
    setShowTestConsole(false);
    setTestingTool(null);
  }}
/>
```

---

## 5. 业务逻辑详述

### 4.1 数据结构定义

#### 4.1.1 MCP工具数据模型
```typescript
interface MCPTool {
  id: string;
  name: string;
  displayName: string;
  description: string;
  version: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  
  // 状态管理
  status: MCPToolStatus;
  statusHistory: StatusHistoryEntry[];
  
  // 配置信息
  config: MCPToolConfig;
  
  // 能力信息
  capabilities: MCPCapability[];
  
  // 权限配置
  permissions: {
    allowedDepartments: string[];
    requiresApproval: boolean;
    restrictedUsers?: string[];
  };
  
  // 版本管理
  versions: string[];
  currentVersion: string;
  
  // 测试信息
  testing: {
    testCases: TestCase[];
    testEnvironment: 'dev' | 'staging' | 'prod';
    lastTestRun?: string;
    testResults?: TestResult[];
  };
  
  // 性能指标
  metrics?: {
    totalCalls: number;
    successRate: number;
    avgResponseTime: number;
    errorCount: number;
    lastCallAt?: string;
  };
  
  // 元数据
  tags: string[];
  category: string;
  documentation?: string;
}

type MCPToolStatus = 
  | 'draft'           // 草稿
  | 'configuring'     // 配置中
  | 'testing'         // 测试中
  | 'pending_release' // 待发布
  | 'published'       // 已发布
  | 'maintenance'     // 维护中
  | 'retired';        // 已下线

interface MCPToolConfig {
  connectionType: 'stdio' | 'sse' | 'http';
  
  // STDIO配置
  stdio?: {
    command: string;
    args?: string[];
    env?: Record<string, string>;
    workingDirectory?: string;
    timeout?: number;
  };
  
  // 网络配置
  network?: {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    authentication?: {
      type: 'bearer' | 'api_key' | 'oauth2';
      credentials: Record<string, string>;
    };
    timeout?: number;
    retries?: number;
  };
  
  // 安全配置
  security?: {
    sandbox: boolean;
    networkRestrictions: string[];
    resourceLimits: {
      memory?: number;
      cpu?: number;
      disk?: number;
    };
    rateLimiting: {
      globalQPS: number;
      perUserQPS: number;
      burstSize?: number;
    };
  };
}

interface MCPCapability {
  type: 'tool' | 'prompt' | 'resource';
  name: string;
  description: string;
  schema?: any;
  examples?: any[];
  version?: string;
}

interface TestCase {
  id: string;
  name: string;
  description: string;
  input: any;
  expectedOutput?: any;
  createdAt: string;
  createdBy: string;
}

interface StatusHistoryEntry {
  id: string;
  fromStatus: MCPToolStatus;
  toStatus: MCPToolStatus;
  timestamp: string;
  operator: string;
  reason?: string;
  metadata?: Record<string, any>;
}
```

#### 4.1.2 工具管理状态结构
```typescript
interface ToolManagementState {
  // 工具数据
  tools: MCPTool[];
  selectedTool: MCPTool | null;
  editingTool: MCPTool | null;
  testingTool: MCPTool | null;
  
  // 筛选状态
  searchTerm: string;
  statusFilter: MCPToolStatus | 'all';
  categoryFilter: string;
  connectionFilter: string;
  
  // UI状态
  showCreateModal: boolean;
  showEditModal: boolean;
  showTestConsole: boolean;
  loading: boolean;
  error: string | null;
  
  // 分页状态
  currentPage: number;
  pageSize: number;
  totalCount: number;
  
  // 批量操作
  selectedToolIds: string[];
  bulkOperation: string | null;
}
```

### 4.2 工具生命周期管理

#### 4.2.1 状态转换管理器
```typescript
class ToolLifecycleManager {
  private static readonly STATE_TRANSITIONS: Record<MCPToolStatus, MCPToolStatus[]> = {
    draft: ['configuring', 'retired'],
    configuring: ['testing', 'draft', 'retired'],
    testing: ['published', 'configuring', 'retired'],
    pending_release: ['published', 'testing', 'retired'],
    published: ['maintenance', 'retired'],
    maintenance: ['published', 'retired'],
    retired: []
  };
  
  static isValidTransition(from: MCPToolStatus, to: MCPToolStatus): boolean {
    return this.STATE_TRANSITIONS[from]?.includes(to) || false;
  }
  
  static getAvailableTransitions(currentStatus: MCPToolStatus): MCPToolStatus[] {
    return this.STATE_TRANSITIONS[currentStatus] || [];
  }
  
  static async transitionTool(
    tool: MCPTool, 
    toStatus: MCPToolStatus, 
    operator: string, 
    reason?: string
  ): Promise<MCPTool> {
    if (!this.isValidTransition(tool.status, toStatus)) {
      throw new Error(`Invalid status transition from ${tool.status} to ${toStatus}`);
    }
    
    // 执行状态转换前的验证
    await this.validateTransition(tool, toStatus);
    
    // 创建状态历史记录
    const historyEntry: StatusHistoryEntry = {
      id: `hist_${Date.now()}`,
      fromStatus: tool.status,
      toStatus: toStatus,
      timestamp: new Date().toISOString(),
      operator,
      reason
    };
    
    // 执行状态转换后的操作
    await this.executeTransitionActions(tool, toStatus);
    
    return {
      ...tool,
      status: toStatus,
      updatedAt: new Date().toISOString(),
      statusHistory: [...tool.statusHistory, historyEntry]
    };
  }
  
  private static async validateTransition(tool: MCPTool, toStatus: MCPToolStatus): Promise<void> {
    switch (toStatus) {
      case 'published':
        // 发布前验证
        if (tool.capabilities.length === 0) {
          throw new Error('工具必须至少有一个能力才能发布');
        }
        if (!tool.testing.testResults || tool.testing.testResults.length === 0) {
          throw new Error('工具必须通过测试才能发布');
        }
        break;
        
      case 'testing':
        // 测试前验证
        if (!tool.config.connectionType) {
          throw new Error('工具必须配置连接类型才能进入测试');
        }
        break;
    }
  }
  
  private static async executeTransitionActions(tool: MCPTool, toStatus: MCPToolStatus): Promise<void> {
    switch (toStatus) {
      case 'published':
        // 发布工具到生产环境
        await this.deployToProduction(tool);
        break;
        
      case 'maintenance':
        // 进入维护模式
        await this.enableMaintenanceMode(tool);
        break;
        
      case 'retired':
        // 下线工具
        await this.retireTool(tool);
        break;
    }
  }
  
  private static async deployToProduction(tool: MCPTool): Promise<void> {
    // 部署逻辑实现
    console.log(`Deploying tool ${tool.name} to production`);
  }
  
  private static async enableMaintenanceMode(tool: MCPTool): Promise<void> {
    // 维护模式逻辑实现
    console.log(`Enabling maintenance mode for tool ${tool.name}`);
  }
  
  private static async retireTool(tool: MCPTool): Promise<void> {
    // 下线逻辑实现
    console.log(`Retiring tool ${tool.name}`);
  }
}
```

#### 4.2.2 工具注册管理器
```typescript
class ToolRegistrationManager {
  static async registerTool(formData: CreateMCPToolForm): Promise<MCPTool> {
    // 验证工具名称唯一性
    await this.validateToolName(formData.name);
    
    // 创建工具对象
    const newTool: MCPTool = {
      id: this.generateToolId(),
      name: formData.name,
      displayName: formData.displayName,
      description: formData.description,
      version: '1.0.0',
      author: await this.getCurrentUser(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      statusHistory: [],
      
      config: this.buildToolConfig(formData),
      capabilities: [],
      permissions: {
        allowedDepartments: formData.allowedDepartments,
        requiresApproval: formData.requiresApproval
      },
      versions: ['1.0.0'],
      currentVersion: '1.0.0',
      testing: {
        testCases: formData.testCases.map((tc, index) => ({
          ...tc,
          id: `test_${Date.now()}_${index}`,
          createdAt: new Date().toISOString(),
          createdBy: await this.getCurrentUser()
        })),
        testEnvironment: 'dev'
      },
      tags: formData.tags,
      category: formData.category
    };
    
    // 保存工具
    await this.saveTool(newTool);
    
    // 初始化工具环境
    if (formData.autoDiscoverCapabilities) {
      await this.discoverCapabilities(newTool);
    }
    
    return newTool;
  }
  
  private static async validateToolName(name: string): Promise<void> {
    const existingTool = await this.findToolByName(name);
    if (existingTool) {
      throw new Error(`工具名称 "${name}" 已存在`);
    }
  }
  
  private static generateToolId(): string {
    return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private static buildToolConfig(formData: CreateMCPToolForm): MCPToolConfig {
    const config: MCPToolConfig = {
      connectionType: formData.connectionType
    };
    
    switch (formData.connectionType) {
      case 'stdio':
        config.stdio = {
          command: formData.stdioConfig!.command,
          args: formData.stdioConfig!.args,
          env: formData.stdioConfig!.env,
          workingDirectory: formData.stdioConfig!.workingDirectory,
          timeout: formData.stdioConfig!.timeout || 30000
        };
        break;
        
      case 'http':
      case 'sse':
        config.network = {
          url: formData.networkConfig!.url,
          method: formData.networkConfig!.method || 'POST',
          headers: formData.networkConfig!.headers,
          authentication: formData.networkConfig!.authentication,
          timeout: formData.networkConfig!.timeout || 10000,
          retries: formData.networkConfig!.retries || 3
        };
        break;
    }
    
    // 安全配置
    if (formData.enableSandbox || formData.rateLimiting) {
      config.security = {
        sandbox: formData.enableSandbox,
        networkRestrictions: [],
        resourceLimits: {},
        rateLimiting: formData.rateLimiting || {
          globalQPS: 100,
          perUserQPS: 10
        }
      };
    }
    
    return config;
  }
  
  private static async discoverCapabilities(tool: MCPTool): Promise<MCPCapability[]> {
    try {
      // 根据连接类型发现能力
      const discoverer = this.getCapabilityDiscoverer(tool.config.connectionType);
      const capabilities = await discoverer.discover(tool.config);
      
      // 更新工具能力
      await this.updateToolCapabilities(tool.id, capabilities);
      
      return capabilities;
    } catch (error) {
      console.error('Failed to discover capabilities:', error);
      return [];
    }
  }
  
  private static getCapabilityDiscoverer(connectionType: string): CapabilityDiscoverer {
    switch (connectionType) {
      case 'stdio':
        return new StdioCapabilityDiscoverer();
      case 'http':
        return new HttpCapabilityDiscoverer();
      case 'sse':
        return new SSECapabilityDiscoverer();
      default:
        throw new Error(`Unsupported connection type: ${connectionType}`);
    }
  }
}

// 能力发现器接口
abstract class CapabilityDiscoverer {
  abstract discover(config: MCPToolConfig): Promise<MCPCapability[]>;
}

class StdioCapabilityDiscoverer extends CapabilityDiscoverer {
  async discover(config: MCPToolConfig): Promise<MCPCapability[]> {
    if (!config.stdio) return [];
    
    try {
      // 执行MCP协议的能力发现
      const process = spawn(config.stdio.command, config.stdio.args || [], {
        env: { ...process.env, ...config.stdio.env },
        cwd: config.stdio.workingDirectory
      });
      
      // 发送MCP协议的initialize请求
      const initMessage = {
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '1.0.0',
          capabilities: {}
        }
      };
      
      process.stdin.write(JSON.stringify(initMessage) + '\n');
      
      // 等待响应
      const response = await this.waitForResponse(process.stdout);
      
      // 解析能力信息
      return this.parseCapabilities(response);
    } catch (error) {
      console.error('STDIO capability discovery failed:', error);
      return [];
    }
  }
  
  private async waitForResponse(stdout: Readable): Promise<any> {
    return new Promise((resolve, reject) => {
      let buffer = '';
      
      const timeout = setTimeout(() => {
        reject(new Error('Capability discovery timeout'));
      }, 30000);
      
      stdout.on('data', (data) => {
        buffer += data.toString();
        
        // 尝试解析JSON响应
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              if (response.id === 1) {
                clearTimeout(timeout);
                resolve(response);
                return;
              }
            } catch (e) {
              // 继续等待完整的JSON
            }
          }
        }
      });
      
      stdout.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
  
  private parseCapabilities(response: any): MCPCapability[] {
    const capabilities: MCPCapability[] = [];
    
    if (response.result?.capabilities?.tools) {
      for (const [name, tool] of Object.entries(response.result.capabilities.tools)) {
        capabilities.push({
          type: 'tool',
          name,
          description: (tool as any).description || `Tool: ${name}`,
          schema: (tool as any).inputSchema
        });
      }
    }
    
    if (response.result?.capabilities?.prompts) {
      for (const [name, prompt] of Object.entries(response.result.capabilities.prompts)) {
        capabilities.push({
          type: 'prompt',
          name,
          description: (prompt as any).description || `Prompt: ${name}`,
          schema: (prompt as any).inputSchema
        });
      }
    }
    
    if (response.result?.capabilities?.resources) {
      for (const [name, resource] of Object.entries(response.result.capabilities.resources)) {
        capabilities.push({
          type: 'resource',
          name,
          description: (resource as any).description || `Resource: ${name}`,
          schema: (resource as any).schema
        });
      }
    }
    
    return capabilities;
  }
}

class HttpCapabilityDiscoverer extends CapabilityDiscoverer {
  async discover(config: MCPToolConfig): Promise<MCPCapability[]> {
    if (!config.network) return [];
    
    try {
      // 发送HTTP请求进行能力发现
      const response = await fetch(config.network.url + '/capabilities', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...config.network.headers
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.parseHttpCapabilities(data);
    } catch (error) {
      console.error('HTTP capability discovery failed:', error);
      return [];
    }
  }
  
  private parseHttpCapabilities(data: any): MCPCapability[] {
    // 解析HTTP API的能力信息
    const capabilities: MCPCapability[] = [];
    
    if (data.tools) {
      data.tools.forEach((tool: any) => {
        capabilities.push({
          type: 'tool',
          name: tool.name,
          description: tool.description,
          schema: tool.schema
        });
      });
    }
    
    return capabilities;
  }
}

class SSECapabilityDiscoverer extends CapabilityDiscoverer {
  async discover(config: MCPToolConfig): Promise<MCPCapability[]> {
    // SSE能力发现实现
    return [];
  }
}
```

### 4.3 工具测试框架

#### 4.3.1 测试执行引擎
```typescript
class ToolTestExecutor {
  static async executeTestCase(tool: MCPTool, testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      // 根据连接类型选择测试器
      const tester = this.getTester(tool.config.connectionType);
      
      // 执行测试
      const result = await tester.execute(tool, testCase);
      
      const endTime = Date.now();
      
      return {
        testCaseId: testCase.id,
        success: true,
        result,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        logs: []
      };
    } catch (error) {
      const endTime = Date.now();
      
      return {
        testCaseId: testCase.id,
        success: false,
        error: error.message,
        duration: endTime - startTime,
        timestamp: new Date().toISOString(),
        logs: []
      };
    }
  }
  
  static async executeAllTests(tool: MCPTool): Promise<TestResult[]> {
    const results: TestResult[] = [];
    
    for (const testCase of tool.testing.testCases) {
      const result = await this.executeTestCase(tool, testCase);
      results.push(result);
    }
    
    return results;
  }
  
  private static getTester(connectionType: string): ToolTester {
    switch (connectionType) {
      case 'stdio':
        return new StdioToolTester();
      case 'http':
        return new HttpToolTester();
      case 'sse':
        return new SSEToolTester();
      default:
        throw new Error(`Unsupported connection type: ${connectionType}`);
    }
  }
}

interface TestResult {
  testCaseId: string;
  success: boolean;
  result?: any;
  error?: string;
  duration: number;
  timestamp: string;
  logs: string[];
}

abstract class ToolTester {
  abstract execute(tool: MCPTool, testCase: TestCase): Promise<any>;
}

class StdioToolTester extends ToolTester {
  async execute(tool: MCPTool, testCase: TestCase): Promise<any> {
    if (!tool.config.stdio) {
      throw new Error('STDIO configuration not found');
    }
    
    const process = spawn(tool.config.stdio.command, tool.config.stdio.args || [], {
      env: { ...process.env, ...tool.config.stdio.env },
      cwd: tool.config.stdio.workingDirectory
    });
    
    // 发送测试输入
    const message = {
      jsonrpc: '2.0',
      id: 1,
      method: testCase.input.method,
      params: testCase.input.params
    };
    
    process.stdin.write(JSON.stringify(message) + '\n');
    
    // 等待响应
    return new Promise((resolve, reject) => {
      let buffer = '';
      
      const timeout = setTimeout(() => {
        process.kill();
        reject(new Error('Test execution timeout'));
      }, 30000);
      
      process.stdout.on('data', (data) => {
        buffer += data.toString();
        
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              if (response.id === 1) {
                clearTimeout(timeout);
                process.kill();
                resolve(response);
                return;
              }
            } catch (e) {
              // 继续等待
            }
          }
        }
      });
      
      process.stderr.on('data', (data) => {
        console.error('STDERR:', data.toString());
      });
      
      process.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }
}

class HttpToolTester extends ToolTester {
  async execute(tool: MCPTool, testCase: TestCase): Promise<any> {
    if (!tool.config.network) {
      throw new Error('Network configuration not found');
    }
    
    const response = await fetch(tool.config.network.url, {
      method: tool.config.network.method,
      headers: {
        'Content-Type': 'application/json',
        ...tool.config.network.headers
      },
      body: JSON.stringify(testCase.input)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }
}

class SSEToolTester extends ToolTester {
  async execute(tool: MCPTool, testCase: TestCase): Promise<any> {
    // SSE测试实现
    throw new Error('SSE testing not implemented yet');
  }
}
```

### 4.4 性能监控系统

#### 4.4.1 指标收集器
```typescript
class ToolMetricsCollector {
  private static metrics: Map<string, ToolMetrics> = new Map();
  
  static recordCall(toolId: string, success: boolean, responseTime: number): void {
    const existing = this.metrics.get(toolId) || {
      totalCalls: 0,
      successRate: 0,
      avgResponseTime: 0,
      errorCount: 0,
      lastCallAt: undefined
    };
    
    existing.totalCalls++;
    if (!success) {
      existing.errorCount++;
    }
    existing.successRate = (existing.totalCalls - existing.errorCount) / existing.totalCalls;
    
    // 计算移动平均响应时间
    existing.avgResponseTime = (existing.avgResponseTime * (existing.totalCalls - 1) + responseTime) / existing.totalCalls;
    existing.lastCallAt = new Date().toISOString();
    
    this.metrics.set(toolId, existing);
  }
  
  static getMetrics(toolId: string): ToolMetrics | null {
    return this.metrics.get(toolId) || null;
  }
  
  static getAllMetrics(): Record<string, ToolMetrics> {
    return Object.fromEntries(this.metrics);
  }
  
  static resetMetrics(toolId: string): void {
    this.metrics.delete(toolId);
  }
}

interface ToolMetrics {
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  errorCount: number;
  lastCallAt?: string;
}
```

---

## 6. 状态管理逻辑

### 5.1 组件状态结构
```typescript
const ToolManagement: React.FC = () => {
  // 数据状态
  const [tools, setTools] = useState<MCPTool[]>(mockMCPTools);
  const [selectedTool, setSelectedTool] = useState<MCPTool | null>(null);
  const [editingTool, setEditingTool] = useState<MCPTool | null>(null);
  const [testingTool, setTestingTool] = useState<MCPTool | null>(null);
  
  // 筛选状态
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MCPToolStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [connectionFilter, setConnectionFilter] = useState<string>('all');
  
  // UI状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTestConsole, setShowTestConsole] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 批量操作
  const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
  const [bulkOperation, setBulkOperation] = useState<string | null>(null);
  
  return (
    // JSX内容
  );
};
```

### 5.2 高级状态管理模式
```typescript
// 使用useReducer管理复杂状态
const toolReducer = (state: ToolManagementState, action: ToolAction): ToolManagementState => {
  switch (action.type) {
    case 'SET_TOOLS':
      return {
        ...state,
        tools: action.payload,
        loading: false
      };
    
    case 'ADD_TOOL':
      return {
        ...state,
        tools: [...state.tools, action.payload],
        showCreateModal: false
      };
    
    case 'UPDATE_TOOL':
      return {
        ...state,
        tools: state.tools.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
        showEditModal: false,
        editingTool: null
      };
    
    case 'DELETE_TOOL':
      return {
        ...state,
        tools: state.tools.filter(t => t.id !== action.payload)
      };
    
    case 'SET_FILTER':
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        currentPage: 1 // 重置到第一页
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    default:
      return state;
  }
};

type ToolAction =
  | { type: 'SET_TOOLS'; payload: MCPTool[] }
  | { type: 'ADD_TOOL'; payload: MCPTool }
  | { type: 'UPDATE_TOOL'; payload: MCPTool }
  | { type: 'DELETE_TOOL'; payload: string }
  | { type: 'SET_FILTER'; payload: { key: string; value: any } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };
```

---

## 7. 性能优化要求

### 6.1 表格虚拟化
```typescript
const VirtualizedToolTable: React.FC<{
  tools: MCPTool[];
  onToolAction: (tool: MCPTool, action: string) => void;
}> = ({ tools, onToolAction }) => {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  
  useEffect(() => {
    if (!containerRef) return;
    
    const handleScroll = () => {
      const { scrollTop, clientHeight } = containerRef;
      const itemHeight = 80; // 每行高度
      
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + Math.ceil(clientHeight / itemHeight) + 5, tools.length);
      
      setVisibleRange({ start, end });
    };
    
    containerRef.addEventListener('scroll', handleScroll);
    return () => containerRef.removeEventListener('scroll', handleScroll);
  }, [tools.length]);
  
  const visibleTools = tools.slice(visibleRange.start, visibleRange.end);
  
  return (
    <div ref={setContainerRef} className="virtualized-table-container">
      <div style={{ height: tools.length * 80 }}>
        <div
          style={{ 
            transform: `translateY(${visibleRange.start * 80}px)` 
          }}
        >
          {visibleTools.map((tool) => (
            <ToolRow key={tool.id} tool={tool} onAction={onToolAction} />
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 6.2 数据缓存策略
```typescript
class ToolDataCache {
  private static cache: Map<string, CachedTool> = new Map();
  private static readonly CACHE_DURATION = 300000; // 5分钟
  
  static get(toolId: string): MCPTool | null {
    const cached = this.cache.get(toolId);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(toolId);
      return null;
    }
    
    return cached.tool;
  }
  
  static set(tool: MCPTool): void {
    this.cache.set(tool.id, {
      tool,
      timestamp: Date.now()
    });
  }
  
  static invalidate(toolId: string): void {
    this.cache.delete(toolId);
  }
  
  static clear(): void {
    this.cache.clear();
  }
}

interface CachedTool {
  tool: MCPTool;
  timestamp: number;
}
```

### 6.3 性能指标要求
- **初始加载时间**：< 2秒
- **工具筛选响应**：< 300ms
- **状态切换时间**：< 1秒
- **测试执行时间**：< 30秒
- **大量工具渲染**：支持1000+工具流畅显示

---

## 8. 测试用例规范

### 7.1 组件功能测试
```typescript
describe('ToolManagement Component', () => {
  test('渲染工具管理页面', () => {
    render(<ToolManagement />);
    
    expect(screen.getByText('工具管理')).toBeInTheDocument();
    expect(screen.getByText('注册新工具')).toBeInTheDocument();
  });
  
  test('工具筛选功能', () => {
    render(<ToolManagement />);
    
    const statusFilter = screen.getByDisplayValue('全部状态');
    fireEvent.change(statusFilter, { target: { value: 'published' } });
    
    // 验证筛选结果
    expect(screen.getAllByText('已发布')).toHaveLength(
      mockMCPTools.filter(t => t.status === 'published').length
    );
  });
  
  test('工具状态转换', async () => {
    render(<ToolManagement />);
    
    const publishButton = screen.getByTitle('发布工具');
    fireEvent.click(publishButton);
    
    await waitFor(() => {
      expect(screen.getByText('已发布')).toBeInTheDocument();
    });
  });
});
```

### 7.2 状态管理测试
```typescript
describe('Tool Lifecycle Management', () => {
  test('状态转换验证', () => {
    expect(ToolLifecycleManager.isValidTransition('testing', 'published')).toBe(true);
    expect(ToolLifecycleManager.isValidTransition('draft', 'published')).toBe(false);
  });
  
  test('工具注册', async () => {
    const formData: CreateMCPToolForm = {
      name: 'test-tool',
      displayName: 'Test Tool',
      description: 'A test tool',
      connectionType: 'stdio',
      // ... 其他配置
    };
    
    const tool = await ToolRegistrationManager.registerTool(formData);
    expect(tool.status).toBe('draft');
    expect(tool.name).toBe('test-tool');
  });
});
```

---

## 9. 开发实现指南

### 8.1 核心依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "clsx": "^1.2.1"
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
  MetricCard, Card, CardHeader, CardBody, Button, Badge,
  EmptyState, FilterSection, Modal
} from '../components/ui';

// 图标
import { 
  Plus, Settings, Play, Pause, Eye, Edit2, Trash2, 
  TestTube, X
} from 'lucide-react';

// 业务组件
import CreateMCPTool from '../components/CreateMCPTool';
import ToolTestConsole from '../components/ToolTestConsole';

// 数据和类型
import { mockMCPTools, mockToolUsageStats } from '../data/mockToolsData';
import type { MCPTool, MCPToolStatus, CreateMCPToolForm } from '../types';
```

---

## 10. Mock数据规范

### 9.1 完整工具数据
```typescript
export const mockMCPTools: MCPTool[] = [
  {
    id: 'tool_001',
    name: 'database-query-tool',
    displayName: '数据库查询工具',
    description: '用于查询数据库中的销售数据和用户信息',
    version: '1.2.0',
    author: '开发团队',
    createdAt: '2024-08-01T08:00:00.000Z',
    updatedAt: '2024-08-25T10:30:00.000Z',
    status: 'published',
    statusHistory: [
      {
        id: 'hist_001',
        fromStatus: 'testing',
        toStatus: 'published',
        timestamp: '2024-08-20T14:30:00.000Z',
        operator: '张三',
        reason: '测试通过，正式发布'
      }
    ],
    config: {
      connectionType: 'stdio',
      stdio: {
        command: 'python',
        args: ['/opt/tools/database-query/main.py'],
        env: {
          'DB_HOST': 'localhost',
          'DB_PORT': '5432'
        },
        workingDirectory: '/opt/tools/database-query',
        timeout: 30000
      },
      security: {
        sandbox: true,
        networkRestrictions: ['127.0.0.1'],
        resourceLimits: {
          memory: 512,
          cpu: 1
        },
        rateLimiting: {
          globalQPS: 100,
          perUserQPS: 10,
          burstSize: 20
        }
      }
    },
    capabilities: [
      {
        type: 'tool',
        name: 'query_sales_data',
        description: '查询销售数据',
        schema: {
          type: 'object',
          properties: {
            date_range: { type: 'string' },
            product_id: { type: 'string' }
          }
        }
      },
      {
        type: 'tool',
        name: 'get_user_info',
        description: '获取用户信息',
        schema: {
          type: 'object',
          properties: {
            user_id: { type: 'string' }
          }
        }
      }
    ],
    permissions: {
      allowedDepartments: ['销售部', '运营部'],
      requiresApproval: false
    },
    versions: ['1.0.0', '1.1.0', '1.2.0'],
    currentVersion: '1.2.0',
    testing: {
      testCases: [
        {
          id: 'test_001',
          name: '查询销售数据',
          description: '测试查询最近7天的销售数据',
          input: {
            method: 'query_sales_data',
            params: {
              date_range: '7d',
              product_id: 'prod_123'
            }
          },
          createdAt: '2024-08-15T10:00:00.000Z',
          createdBy: '测试工程师'
        }
      ],
      testEnvironment: 'prod'
    },
    metrics: {
      totalCalls: 1234,
      successRate: 0.97,
      avgResponseTime: 800,
      errorCount: 37,
      lastCallAt: '2024-08-25T11:45:00.000Z'
    },
    tags: ['数据库', 'SQL', '销售'],
    category: '数据查询'
  },
  // ... 更多工具数据
];

export const mockToolUsageStats = {
  totalTools: 12,
  publishedTools: 8,
  testingTools: 2,
  avgResponseTime: 950
};
```

---

**实现完成标准：**
✅ MCP工具注册和配置功能完整实现  
✅ 工具状态生命周期管理正常工作  
✅ 筛选和搜索功能支持多维度查询  
✅ 工具测试控制台功能完整  
✅ 详细工具信息展示界面完整  
✅ 能力自动发现机制正常工作  
✅ 权限和安全配置功能完整  
✅ 性能监控和指标展示正确  
✅ 批量操作和状态管理功能完整