import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';

// 导入路由（ESM 会提升 import，但显式写在前面更规范）
import authRoutes from './routes/authRoutes.js';
import ideaRoutes from './routes/ideaRoutes.js';
import walletRoutes from './routes/walletRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler } from './middleware/error.js';

// 导入Worker（启动队列处理）
import './workers/index.js';

dotenv.config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态文件 - 存储目录
app.use('/storage', express.static(path.resolve(process.cwd(), process.env.STORAGE_DIR || 'storage')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// 健康检查
app.get('/api/health', (_req, res) => {
  res.json({ code: 200, message: 'IdeaHub API 运行中', timestamp: new Date().toISOString() });
});

// 全局错误处理
app.use(errorHandler);

const PORT = parseInt(process.env.PORT || '4000');

app.listen(PORT, () => {
  console.log(`\n🚀 IdeaHub API 服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Worker: 已内嵌启动（Mock模式）\n`);
});

export default app;
