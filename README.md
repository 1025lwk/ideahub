# IdeaHub - 创意交易平台

> 买卖创意点子，通过 AI 一键生成可运行的代码项目，平台从中抽成盈利。

## 项目简介

IdeaHub 是一个全栈 Web 平台，核心业务是用户买卖创意点子，并通过 AI 将点子一键生成可运行的代码项目。

- **卖家**：注册 → 发布点子 → 等待购买 → 获得交易分成（90%）
- **买家**：注册 → 浏览/搜索点子 → 支付购买解锁完整内容 → AI 一键生成代码 → 下载使用
- **平台**：对点子交易抽成 10%，对 AI 开发服务抽成 20%

## 技术栈

### 前端
- React 18 + TypeScript
- Vite 构建工具
- TailwindCSS（仅基础布局和重置样式）
- Ant Design（UI 组件库）
- React Router v6

### 后端
- Node.js + Express + TypeScript（tsx 运行）
- Prisma ORM + SQLite（本地开发）/ PostgreSQL（生产）
- Zod 请求体校验
- JWT 认证
- 内存任务队列（模拟 BullMQ）
- archiver（ZIP 打包）
- 本地文件存储（模拟 MinIO）

## 项目结构

```
ideahub/
├── backend/                 # 后端
│   ├── prisma/
│   │   ├── schema.prisma    # 数据库模型
│   │   └── seed.ts          # 种子数据
│   ├── src/
│   │   ├── middleware/      # 中间件（auth, error）
│   │   ├── prompts/         # Prompt 构造器
│   │   ├── routes/          # API 路由
│   │   ├── services/        # 业务逻辑
│   │   ├── utils/           # 工具（prisma, queue, storage, constants）
│   │   ├── workers/         # AI 生成 Worker
│   │   └── index.ts         # 入口
│   ├── .env                 # 环境变量
│   └── package.json
├── frontend/                # 前端
│   ├── src/
│   │   ├── api/             # API 请求层
│   │   ├── components/      # 公共组件
│   │   ├── context/         # Auth Context
│   │   ├── pages/           # 页面
│   │   ├── types/           # 类型定义
│   │   ├── App.tsx          # 路由
│   │   └── main.tsx         # 入口
│   ├── index.html
│   └── package.json
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 18
- npm 或 yarn

### 后端启动

```bash
cd backend
npm install
npx prisma db push        # 创建数据库表
npm run db:seed           # 填充种子数据
npm run dev               # 启动开发服务器 (http://localhost:4000)
```

### 前端启动

```bash
cd frontend
npm install
npm run dev               # 启动开发服务器 (http://localhost:5173)
```

### 测试账号

| 角色 | 邮箱 | 密码 |
|------|------|------|
| 管理员 | admin@ideahub.com | 123456 |
| 卖家1 | creator@ideahub.com | 123456 |
| 卖家2 | dev@ideahub.com | 123456 |
| 买家 | buyer@ideahub.com | 123456 |

## 核心功能

### 1. 用户认证
- 注册 / 登录（JWT）
- 角色权限（USER / ADMIN）

### 2. 创意市场
- 创意浏览、搜索、筛选（分类、标签、价格区间、排序）
- 创意详情（预览内容公开，完整内容购买后解锁）
- 发布创意（标题、描述、预览/完整内容、定价、分类、标签）

### 3. 钱包系统
- 平台钱包余额系统（数据库事务保证资金安全）
- 充值 / 消费 / 收益流水记录
- 余额变动全程可追溯

### 4. 订单系统
- 点子购买订单（平台抽成 10%，卖家得 90%）
- AI 生成订单（平台抽成 20%）
- 购买记录 / 销售记录 / 收益统计

### 5. AI 代码生成
- 异步架构：前端提交 → 后端入队 → Worker 消费 → LLM 生成 → ZIP 打包
- Prompt 构造器：创意描述 + 用户需求 + 技术偏好
- 任务状态轮询（PENDING → PROCESSING → COMPLETED/FAILED）
- 代码包 ZIP 下载

## API 端点

### 认证 `/api/auth`
- `POST /register` - 注册
- `POST /login` - 登录
- `GET /profile` - 获取个人信息（需认证）
- `PUT /profile` - 更新个人信息（需认证）

### 创意 `/api/ideas`
- `GET /categories` - 获取分类列表
- `GET /` - 获取创意列表（支持搜索/筛选/分页）
- `GET /my/ideas` - 获取我发布的创意（需认证）
- `GET /:id` - 获取创意详情
- `POST /` - 发布创意（需认证）
- `PUT /:id` - 更新创意（需认证）
- `DELETE /:id` - 删除创意（需认证）

### 钱包 `/api/wallet`
- `GET /balance` - 获取余额（需认证）
- `POST /recharge` - 充值（需认证）
- `GET /transactions` - 获取流水记录（需认证）

### 订单 `/api/orders`
- `POST /purchase/:ideaId` - 购买创意（需认证）
- `GET /purchases` - 获取购买记录（需认证）
- `GET /sales` - 获取销售记录（需认证）
- `GET /earnings` - 获取收益统计（需认证）

### AI 生成 `/api/ai`
- `POST /generate` - 创建 AI 生成任务（需认证）
- `GET /status/:requestId` - 获取任务状态（需认证）
- `GET /my/requests` - 获取我的 AI 任务列表（需认证）
- `GET /download/:requestId` - 下载代码包（需认证）

## 生产部署说明

本项目 MVP 阶段使用以下本地替代方案，可通过环境变量切换至生产组件：

| 组件 | 本地开发 | 生产环境 |
|------|---------|---------|
| 数据库 | SQLite | PostgreSQL |
| 任务队列 | 内存队列 | BullMQ + Redis |
| 文件存储 | 本地文件系统 | MinIO (S3) |
| AI 生成 | Mock 模板 | OpenAI / 智谱GLM |
| 支付 | 模拟充值 | Stripe / 支付宝 |

## License

MIT
