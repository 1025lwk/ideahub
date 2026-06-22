// Vercel Serverless Function 入口
// 将 Express 应用导出为 Vercel 无服务器函数

import app from './src/index.js';

// 导出 Express app 作为 Vercel Serverless Function
export default app;