# KingSoft - 数字员工智能管理平台

<div align="center">
  <img src="./docs/images/logo.png" alt="KingSoft Logo" width="200"/>
  
  ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=flat-square&logo=tailwind-css)
  ![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=flat-square&logo=vite)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
</div>

## 📋 项目简介

KingSoft 是一个企业级数字员工智能管理平台，专为基于 LLM+MCP 架构的AI数字员工提供全生命周期管理。平台集成了**贝叶斯统计分析引擎**、**记忆系统架构**、**MCP协议工具管理**等前沿技术，为企业提供科学化的AI员工管理解决方案。

### 🌟 核心特性

- **🎯 实时监控仪表盘** - 多维度系统健康监控，Token成本分析，服务状态实时展示
- **👥 数字员工管理** - 完整生命周期管理，支持记忆系统、知识图谱、导师汇报机制
- **🔍 会话查询追溯** - 智能搜索与筛选，对话流可视化，用户行为分析
- **🧪 A/B 测试管理** - 贝叶斯统计引擎，三层指标体系，可解释性AI洞察分析  
- **📊 数据分析报表** - 多维筛选系统，成本分析，错误监控，性能优化建议
- **🛠️ MCP工具管理** - 工具全生命周期管理，多协议支持，安全沙箱机制

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm 8+ 或 yarn 1.22+
- 现代浏览器（Chrome 90+, Firefox 88+, Safari 14+, Edge 90+）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-org/cogvision-admin.git
   cd cogvision-admin
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

3. **启动开发服务器**
   ```bash
   npm run dev
   # 或
   yarn dev
   ```

4. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 🔧 可用脚本

```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run preview      # 预览生产构建
npm run lint         # 运行代码检查
npm run test         # 运行测试用例
```

## 📁 项目结构

```
admin1/
├── public/                     # 静态资源
├── src/
│   ├── components/            # 业务组件
│   │   ├── ui/               # 基础UI组件库 (52个组件)
│   │   │   ├── PageLayout.tsx    # 页面布局
│   │   │   ├── Card.tsx          # 卡片组件
│   │   │   ├── MetricCard.tsx    # 指标卡片
│   │   │   ├── FilterSection.tsx # 筛选组件
│   │   │   └── index.ts          # 统一导出
│   │   ├── CreateDigitalEmployee.tsx  # 员工创建组件
│   │   ├── ExperimentWizard.tsx       # 实验向导
│   │   ├── CreateMCPTool.tsx         # 工具创建组件
│   │   └── ToolTestConsole.tsx       # 测试控制台
│   ├── pages/                # 六大核心页面
│   │   ├── Dashboard.tsx         # 实时监控仪表盘
│   │   ├── DigitalEmployees.tsx  # 数字员工管理
│   │   ├── Sessions.tsx          # 会话查询追溯
│   │   ├── ABTestingEnhanced.tsx # A/B测试管理 (贝叶斯统计)
│   │   ├── Analytics.tsx         # 数据分析报表
│   │   └── ToolManagement.tsx    # MCP工具管理
│   ├── types/                # TypeScript类型定义 (752行)
│   │   └── index.ts              # 完整的业务类型体系
│   ├── data/                 # 模拟数据系统
│   │   ├── mockData.ts           # 仪表盘和会话数据
│   │   ├── mockDigitalEmployees.ts  # 员工管理数据
│   │   ├── mockToolsData.ts      # MCP工具数据
│   │   └── realtimeData.ts       # 实时数据模拟
│   ├── utils/                # 工具函数
│   │   ├── cn.ts                 # 样式工具
│   │   └── toolStateMachine.ts   # 工具状态机
│   └── styles/               # 样式系统
├── docs/                     # 完整项目文档
│   ├── 产品需求文档-KingSoft数字员工管理平台.md  # V2.0更新版
│   ├── 技术架构设计.md
│   ├── API接口文档.md
│   ├── 功能规格说明书.md
│   ├── 数据字典.md
│   ├── 用户操作手册.md
│   ├── 部署运维指南.md
│   └── 需求文档总览.md
├── tailwind.config.js        # Tailwind配置
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite构建配置
└── package.json             # 项目依赖配置
```

## 🎨 技术栈

### 前端框架
- **React 18** - 现代化的用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集
- **Vite** - 快速的构建工具和开发服务器

### UI 与样式
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Lucide React** - 精美的图标库
- **React Router** - 声明式路由

### 开发工具
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **PostCSS** - CSS 后处理器

## 🏗️ 核心功能模块

### 1. 📊 实时监控仪表盘 (Dashboard)
> **实现路径：** `src/pages/Dashboard.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/F3F4F6/374151?text=Real-time+Monitoring+Dashboard" alt="Dashboard Preview" />
</div>

**🚀 已实现功能：**
- **四大核心指标** - 在线用户数、RPM、成功/失败会话数，带趋势对比
- **Token成本分析** - 按模型分类统计（GPT-4/Claude-3/GPT-3.5），成本占比可视化
- **系统健康监控** - API服务、数据库、消息队列三维状态监控
- **交互式卡片** - 24小时会话统计，成功率/失败率动态展示

### 2. 👥 数字员工管理 (DigitalEmployees)
> **实现路径：** `src/pages/DigitalEmployees.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/E0E7FF/4338CA?text=Digital+Employee+Management" alt="Employee Management Preview" />
</div>

**🚀 企业级管理功能：**
- **全生命周期管理** - 创建、编辑、启用/禁用、删除，支持批量操作
- **高级人设配置** - 系统提示词、个性化设置、对话示例训练
- **记忆系统架构** - 五层记忆模型（工作、情景、语义、程序、情感记忆）
- **知识图谱集成** - 实体关系图谱、知识点动态连接更新
- **导师汇报机制** - 多级汇报体系、定时报告生成（日/周/月）
- **智能搜索筛选** - 姓名/编号模糊搜索、状态/部门交叉筛选

### 3. 🔍 会话查询追溯 (Sessions)
> **实现路径：** `src/pages/Sessions.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/EEF2FF/4338CA?text=Session+Query+%26+Tracing" alt="Sessions Preview" />
</div>

**🚀 已实现功能：**
- **智能搜索系统** - Session ID精确匹配、用户姓名模糊搜索
- **状态筛选器** - 成功/失败会话分类，实时数量统计显示
- **对话流可视化** - 气泡式对话界面，用户/AI角色清晰区分
- **用户身份映射** - 自动将用户ID映射为可读姓名
- **会话详情分析** - 四维度信息展示：ID、用户、消息数、响应时间

### 4. 🧪 A/B测试管理 (ABTestingEnhanced)
> **实现路径：** `src/pages/ABTestingEnhanced.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/F0F9FF/0369A1?text=Bayesian+AB+Testing+Platform" alt="AB Testing Preview" />
</div>

**🚀 突破性贝叶斯统计实现：**
- **三层指标体系** - L1核心业务指标、L2支撑分析指标、L3技术监控指标
- **贝叶斯分析引擎** - 胜率计算、预期提升量、可信区间、智能停止建议
- **可解释性洞察** - 特征重要性分析、用户行为路径挖掘、改进建议生成
- **复杂度评估** - 实验复杂度自动评估、样本量科学计算
- **实时指标监控** - 5秒间隔数据更新、预算使用跟踪、成本控制

### 5. 📈 数据分析中心 (Analytics)
> **实现路径：** `src/pages/Analytics.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/FEF3C7/D97706?text=Multi-dimensional+Analytics" alt="Analytics Preview" />
</div>

**🚀 多维分析能力：**
- **灵活筛选系统** - 时间范围、分析维度、指标类型三维度联动筛选
- **Token成本分析** - 三大模型成本分布、变化趋势、动态进度条展示
- **工具调用监控** - 调用统计、失败率分析、响应时间对比
- **错误分析监控** - 五大错误类型分布、趋势指示、根因分析
- **智能状态识别** - 失败率色彩编码（>5%红色、2-5%黄色、<2%绿色）

### 6. 🛠️ MCP工具管理 (ToolManagement) 
> **实现路径：** `src/pages/ToolManagement.tsx`

<div align="center">
  <img src="https://via.placeholder.com/600x300/F0FDF4/059669?text=MCP+Tool+Lifecycle+Management" alt="Tool Management Preview" />
</div>

**🚀 工业级工具管理：**
- **全生命周期管理** - 草稿→配置→测试→发布→维护→下线的7状态管理
- **多协议连接支持** - stdio、SSE、HTTP三种连接方式，完整配置界面
- **安全沙箱机制** - 资源限制、权限控制、QPS速率限制
- **实时测试控制台** - 交互式测试、日志监控、性能分析
- **能力自动发现** - 工具启动后自动检测功能、JSON Schema验证
- **版本管理系统** - 多版本并存、一键回滚、变更历史追踪

## 🔐 权限管理

系统支持基于角色的权限控制：

| 角色 | 权限描述 |
|------|---------|
| **产品经理** | 查看所有数据、创建A/B测试、生成报表 |
| **运营人员** | 监控数据、会话查询、问题处理 |
| **AI工程师** | 技术追溯、A/B测试、性能分析 |
| **客服主管** | 会话质量分析、客户满意度数据 |

## 📚 文档与支持

### 完整文档
- [🎯 产品需求文档](./docs/产品需求文档-KingSoft数字员工管理平台.md) - 详细功能需求和业务逻辑
- [🏗️ 技术架构设计](./docs/技术架构设计.md) - 系统架构和技术选型详述
- [🔌 API接口文档](./docs/API接口文档.md) - RESTful API规范和接口详情
- [📖 用户操作手册](./docs/用户操作手册.md) - 详细的用户使用指南
- [📋 功能规格说明书](./docs/功能规格说明书.md) - 详细功能规格和交互逻辑
- [🗃️ 数据字典](./docs/数据字典.md) - 完整的数据结构定义
- [🚀 部署运维指南](./docs/部署运维指南.md) - 生产环境部署和运维手册
- [📊 需求文档总览](./docs/需求文档总览.md) - 需求文档汇总和项目概览

### API 文档
```bash
# 启动开发服务器后访问
http://localhost:3000/api/docs
```

### 演示数据
项目内置了丰富的模拟数据，包括：
- 会话记录样例
- A/B 测试数据
- 监控指标数据
- 错误分析数据

## 🚀 部署指南

### 生产构建
```bash
npm run build
```

### Docker 部署
```bash
# 构建镜像
docker build -t cogvision-admin .

# 运行容器
docker run -p 80:80 cogvision-admin
```

### Kubernetes 部署
```bash
kubectl apply -f k8s/
```

详细部署说明请参考 [部署文档](./docs/部署指南.md)

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 和 Prettier 配置
- 编写有意义的提交信息
- 添加必要的测试用例

## 📈 路线图

### 🎯 V2.0 - 企业级平台 (当前版本 ✅)
> **基于实际实现的完整功能清单**

#### 核心页面模块 (100%完成)
- [x] **实时监控仪表盘** - 四大指标、Token成本分析、系统健康监控
- [x] **数字员工管理** - 记忆系统、知识图谱、导师汇报机制  
- [x] **会话查询追溯** - 智能搜索、对话流可视化、用户映射
- [x] **A/B测试管理** - 贝叶斯统计、三层指标、可解释性分析
- [x] **数据分析中心** - 多维筛选、成本分析、错误监控
- [x] **MCP工具管理** - 全生命周期、多协议支持、安全沙箱

#### 技术架构特性 (100%完成)  
- [x] **52个UI组件** - 完整设计系统、响应式布局
- [x] **752行类型定义** - 完整TypeScript类型体系
- [x] **企业级数据模型** - 记忆系统、知识图谱、工具管理
- [x] **贝叶斯统计引擎** - 科学A/B测试分析能力
- [x] **模块化架构** - 高度解耦的组件系统

#### 用户体验优化 (100%完成)
- [x] **实时搜索筛选** - 多维度智能搜索
- [x] **交互式可视化** - 动态图表、进度条、状态指示
- [x] **移动端适配** - 完整的响应式设计
- [x] **无障碍支持** - 语义化HTML、键盘导航

### 🚀 V2.1 - 智能化增强 (规划中)
- [ ] **智能告警系统** - 基于机器学习的异常检测
- [ ] **自动优化建议** - AI驱动的性能优化建议  
- [ ] **高级图表集成** - Recharts/D3.js可视化升级
- [ ] **实时协作功能** - 多用户协同操作

### 🔮 V2.2 - 生态扩展 (未来愿景)
- [ ] **多租户架构** - 企业级SaaS支持
- [ ] **插件生态系统** - 第三方工具集成框架
- [ ] **国际化支持** - 多语言界面和时区支持  
- [ ] **开放API平台** - 完整的开发者生态

### 🎨 V3.0 - AI Native平台 (长期愿景)
- [ ] **AI Assistant集成** - 平台内置智能助手
- [ ] **自动化运维** - 智能故障诊断和修复
- [ ] **预测性分析** - 基于历史数据的趋势预测
- [ ] **知识图谱AI** - 自动化知识提取和关联

## 🐛 问题反馈

如果您遇到任何问题或有改进建议，请通过以下方式联系我们：

- [GitHub Issues](https://github.com/your-org/cogvision-admin/issues)
- [技术支持邮箱](mailto:support@cogvision.com)
- [在线文档](https://docs.cogvision.com)

## 📄 许可证

本项目基于 [MIT License](./LICENSE) 开源协议。

## 🙏 致谢

感谢以下开源项目：
- [React](https://reactjs.org/) - 用户界面库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- [Vite](https://vitejs.dev/) - 构建工具

---

<div align="center">
  <p>由 ❤️ 制作 | © 2024 KingSoft Team</p>
  
  [![Star History Chart](https://api.star-history.com/svg?repos=your-org/cogvision-admin&type=Date)](https://star-history.com/#your-org/cogvision-admin&Date)
</div>