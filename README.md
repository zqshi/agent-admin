# CogVision - 数字员工智能管理平台

<div align="center">
  <img src="./docs/images/logo.png" alt="CogVision Logo" width="200"/>
  
  ![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.3-38B2AC?style=flat-square&logo=tailwind-css)
  ![Vite](https://img.shields.io/badge/Vite-4.4.5-646CFF?style=flat-square&logo=vite)
  ![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)
</div>

## 📋 项目简介

CogVision 是一个为基于 LLM+MCP 架构的数字员工提供全面管理能力的智能平台。平台提供实时监控、深入分析和 A/B 实验功能，帮助团队确保数字员工的可靠性、可控性和持续优化。

### 🌟 核心特性

- **🎯 实时监控仪表盘** - 全方位监控数字员工运行状态和关键指标
- **🔍 会话查询追溯** - 详细分析用户对话，支持 LLM 推理和工具调用追踪
- **🧪 A/B 测试管理** - 科学对比不同配置，数据驱动优化决策
- **📊 数据分析报表** - 多维度历史数据分析和自定义报表生成

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
cogvision-admin/
├── public/                 # 静态资源
├── src/
│   ├── components/         # 通用组件
│   │   └── Layout.tsx     # 主布局组件
│   ├── pages/             # 页面组件
│   │   ├── Dashboard.tsx  # 监控仪表盘
│   │   ├── Sessions.tsx   # 会话查询
│   │   ├── ABTesting.tsx  # A/B测试管理
│   │   └── Analytics.tsx  # 数据分析
│   ├── types/             # TypeScript 类型定义
│   ├── data/              # 模拟数据
│   ├── utils/             # 工具函数
│   └── styles/            # 样式文件
├── docs/                  # 项目文档
│   ├── 产品需求文档.md
│   ├── 技术架构设计.md
│   └── 用户操作手册.md
└── README.md
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

## 🏗️ 核心功能

### 1. 📊 监控仪表盘 (Dashboard)
<div align="center">
  <img src="https://via.placeholder.com/600x300/F3F4F6/374151?text=Real-time+Monitoring+Dashboard" alt="Dashboard Preview" />
</div>

- **实时指标展示** - 在线用户数、每分钟请求数、系统成功率
- **性能监控** - 响应时间趋势、Token消耗统计、成本分析
- **智能告警** - 自定义阈值的异常检测和告警推送
- **服务状态** - 多业务线数字员工健康状态总览

### 2. 🔍 实时会话监控与追溯 (Sessions Enhanced)
<div align="center">
  <img src="https://via.placeholder.com/600x300/EEF2FF/4338CA?text=Session+Monitoring+%26+Tracing" alt="Sessions Preview" />
</div>

**🚀 全新升级功能**:
- **双模式监控** - 实时监控 + 历史查询双模式切换
- **三维度聚合** - 全局活动/数字员工/人类员工聚合视图
- **Chain-of-Thought可视化** - 完整推理过程时间线展示
- **深度追溯** - LLM推理链路 + MCP工具调用链路追踪
- **智能搜索** - 多维度搜索和高级筛选功能

**核心特性**:
- 实时会话动态监控
- 推理步骤可视化(思考→决策→执行→回复)
- 工具调用参数和结果详情展示
- 双维度员工状态聚合

### 3. 🧪 A/B测试管理 (AB Testing)
<div align="center">
  <img src="https://via.placeholder.com/600x300/F0F9FF/0369A1?text=AB+Testing+Platform" alt="AB Testing Preview" />
</div>

- **实验生命周期管理** - 创建、配置、监控、分析全流程
- **多变量测试** - 模型、提示词、工具链多维度对比
- **科学统计分析** - 置信区间、显著性检验、效应大小计算
- **智能流量分配** - 动态流量分配和提前停止机制

### 4. 📈 数据分析中心 (Analytics)
<div align="center">
  <img src="https://via.placeholder.com/600x300/FEF3C7/D97706?text=Data+Analytics+Center" alt="Analytics Preview" />
</div>

- **性能趋势分析** - 响应时间、成功率、Token使用量历史趋势
- **成本效益分析** - 模型调用成本统计和优化建议
- **用户行为洞察** - 交互模式分析和满意度评估
- **业务影响评估** - 自定义KPI跟踪和ROI计算

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
- [🎯 产品需求文档](./docs/产品需求文档-CogVision数字员工管理平台.md) - 详细功能需求和业务逻辑
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

### 🎯 V1.0 - MVP版本 (已完成 ✅)
- [x] 核心监控仪表盘
- [x] 会话查询与追溯
- [x] A/B测试基础功能
- [x] 数据分析报表

### 🚀 V1.1 - 增强版本 (当前版本 ✅)
- [x] **实时会话监控** - 双模式监控系统
- [x] **三维度聚合视图** - 全局/数字员工/人类员工
- [x] **Chain-of-Thought可视化** - 推理过程时间线
- [x] **深度追溯** - LLM推理和工具调用链路
- [x] **高级搜索** - 多维度筛选和查询

### 🔮 V1.2 (规划中)
- [ ] 智能告警系统
- [ ] 移动端适配优化
- [ ] 多语言国际化支持
- [ ] 高级数据可视化图表

### 🎨 V2.0 (未来愿景)
- [ ] 多租户支持
- [ ] 插件生态系统
- [ ] AI驱动的优化建议
- [ ] 知识库管理集成

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
  <p>由 ❤️ 制作 | © 2024 CogVision Team</p>
  
  [![Star History Chart](https://api.star-history.com/svg?repos=your-org/cogvision-admin&type=Date)](https://star-history.com/#your-org/cogvision-admin&Date)
</div>