import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始种子数据初始化...');

  // 清空现有数据
  await prisma.walletTransaction.deleteMany();
  await prisma.order.deleteMany();
  await prisma.aIRequest.deleteMany();
  await prisma.idea.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // 创建用户
  const passwordHash = await bcrypt.hash('123456', 10);
  const admin = await prisma.user.create({
    data: { email: 'admin@ideahub.com', username: 'admin', password: passwordHash, role: 'ADMIN', balance: 1000 },
  });
  const seller1 = await prisma.user.create({
    data: { email: 'creator@ideahub.com', username: '创意大师', password: passwordHash, role: 'USER', balance: 50, bio: '专注创意产品开发10年' },
  });
  const seller2 = await prisma.user.create({
    data: { email: 'dev@ideahub.com', username: '极客开发者', password: passwordHash, role: 'USER', balance: 30, bio: '全栈工程师，热爱开源' },
  });
  const buyer = await prisma.user.create({
    data: { email: 'buyer@ideahub.com', username: '创业者小李', password: passwordHash, role: 'USER', balance: 200 },
  });

  console.log('  ✓ 用户创建完成');

  // 创建分类
  const web = await prisma.category.create({ data: { name: 'Web应用', sort: 1 } });
  const mobile = await prisma.category.create({ data: { name: '移动应用', sort: 2 } });
  const ai = await prisma.category.create({ data: { name: 'AI/机器学习', sort: 3 } });
  const tool = await prisma.category.create({ data: { name: '效率工具', sort: 4 } });
  const game = await prisma.category.create({ data: { name: '游戏娱乐', sort: 5 } });

  // 二级分类
  await prisma.category.create({ data: { name: '电商平台', parentId: web.id, sort: 1 } });
  await prisma.category.create({ data: { name: '社交社区', parentId: web.id, sort: 2 } });
  await prisma.category.create({ data: { name: 'SaaS服务', parentId: web.id, sort: 3 } });
  await prisma.category.create({ data: { name: 'iOS应用', parentId: mobile.id, sort: 1 } });
  await prisma.category.create({ data: { name: 'Android应用', parentId: mobile.id, sort: 2 } });
  await prisma.category.create({ data: { name: '聊天机器人', parentId: ai.id, sort: 1 } });
  await prisma.category.create({ data: { name: '图像处理', parentId: ai.id, sort: 2 } });

  console.log('  ✓ 分类创建完成');

  // 创建创意点子
  const ideas = [
    {
      title: 'AI智能简历优化助手',
      description: '基于AI的简历分析和优化平台，帮助求职者打造完美简历。用户上传简历后，AI分析并给出改进建议，还能一键生成多版本简历。',
      previewContent: '这是一个AI驱动的简历优化平台。核心功能包括：1. 简历智能分析 - 识别简历中的问题和改进空间；2. AI优化建议 - 针对每个部分给出具体建议；3. 多模板生成 - 支持多种风格的简历模板；4. 一键导出PDF。技术架构采用React前端 + Node.js后端 + OpenAI API。',
      fullContent: '## 完整产品方案\n\n### 核心功能模块\n\n1. **简历解析模块**\n   - 支持PDF/Word上传\n   - 使用pdf-parse提取文本\n   - 结构化解析简历各部分\n\n2. **AI分析引擎**\n   - 调用GPT-4分析简历质量\n   - 评分维度：内容完整性、关键词匹配、表达专业度、排版规范\n   - 生成详细分析报告\n\n3. **优化建议系统**\n   - 逐段分析并给出修改建议\n   - 提供优化后的文本示例\n   - ATS（简历筛选系统）友好度检测\n\n4. **模板生成器**\n   - 10+专业简历模板\n   - 实时预览效果\n   - 一键导出PDF/DOCX\n\n### 技术架构\n- 前端：React 18 + TypeScript + TailwindCSS\n- 后端：Node.js + Express + Prisma\n- AI：OpenAI GPT-4 API\n- 文件处理：pdf-parse, docx, puppeteer\n- 数据库：PostgreSQL\n\n### 商业模式\n- 免费版：每月3次分析\n- Pro版：¥39/月，无限分析+所有模板\n- 企业版：团队协作功能\n\n### API设计\n```\nPOST /api/resume/upload     - 上传简历\nGET  /api/resume/:id/analysis - 获取分析结果\nPOST /api/resume/:id/optimize - AI优化\nGET  /api/templates          - 模板列表\nPOST /api/resume/:id/export  - 导出简历\n```\n\n### 数据库设计\n- users, resumes, analyses, suggestions, templates, subscriptions\n\n### 部署方案\n- 前端：Vercel\n- 后端：Railway / 腾讯云\n- 文件存储：AWS S3 / 阿里云OSS',
      price: 29.9,
      categoryId: ai.id,
      sellerId: seller1.id,
      tags: JSON.stringify(['AI', '简历', 'SaaS', '求职']),
    },
    {
      title: '极简番茄钟效率工具',
      description: '一个美观且功能完整的番茄钟应用，集成任务管理、数据统计和专注模式。帮助用户提高工作效率，养成专注习惯。',
      previewContent: '极简番茄钟是一款专注于提升工作效率的时间管理工具。功能包括：25分钟专注+5分钟休息的番茄工作法、任务清单管理、每日/每周专注数据统计、白噪音背景音、成就系统。设计风格简约清新，支持深色模式。',
      fullContent: '## 产品详细方案\n\n### 核心功能\n\n1. **番茄计时器**\n   - 25分钟工作 + 5分钟休息循环\n   - 自定义时长设置\n   - 暂停/继续/重置\n   - 全屏专注模式\n   - 桌面通知提醒\n\n2. **任务管理**\n   - 创建/编辑/删除任务\n   - 任务关联番茄钟\n   - 任务优先级标记\n   - 完成进度追踪\n\n3. **数据统计**\n   - 今日专注时长\n   - 本周/本月统计图表\n   - 任务完成率\n   - 连续专注天数\n   - 热力图可视化\n\n4. **专注辅助**\n   - 白噪音（雨声、咖啡馆、森林）\n   - 专注模式屏蔽通知\n   - 激励语句\n\n5. **成就系统**\n   - 累计专注时长勋章\n   - 连续打卡奖励\n   - 任务完成成就\n\n### 技术方案\n- 前端：React + TypeScript + TailwindCSS\n- 状态管理：Zustand\n- 图表：Recharts\n- 音频：Web Audio API\n- 持久化：localStorage / IndexedDB\n- PWA支持离线使用\n\n### 页面设计\n- 主页：大号计时器 + 当前任务\n- 任务页：任务列表 + 添加\n- 统计页：图表 + 热力图\n- 设置页：偏好配置\n\n### 配色方案\n- 主色：#FF6B6B (番茄红)\n- 辅色：#4ECDC4 (薄荷绿)\n- 背景：#F7F7F7 / #1A1A2E (深色)',
      price: 9.9,
      categoryId: tool.id,
      sellerId: seller2.id,
      tags: JSON.stringify(['效率', '番茄钟', 'React', 'PWA']),
    },
    {
      title: '社区驱动的美食食谱分享平台',
      description: '类似下厨房的美食社区，用户可以分享食谱、收藏喜欢的菜谱、关注美食达人。支持图文步骤、视频教程和食材清单。',
      previewContent: '一个美食爱好者社区平台。核心功能：食谱发布（图文步骤+视频）、食材智能识别、收藏与关注、评论区互动、分类检索、季节推荐。设计风格温馨，注重阅读体验。',
      fullContent: '## 美食社区平台完整方案\n\n### 功能模块\n\n1. **食谱系统**\n   - 多步骤图文编辑器\n   - 视频教程上传\n   - 食材清单（支持用量换算）\n   - 烹饪时间/难度标注\n   - 营养信息估算\n\n2. **社区互动**\n   - 关注/粉丝体系\n   - 收藏与制作打卡\n   - 评论与讨论\n   - 私信功能\n   - 分享到社交平台\n\n3. **发现与检索**\n   - 分类浏览（中餐/西餐/烘焙/饮品）\n   - 食材搜索（冰箱里有什么做什么）\n   - 标签筛选\n   - 季节性推荐\n   - 热门排行\n\n4. **个人中心**\n   - 我的食谱\n   - 收藏夹\n   - 制作记录\n   - 关注列表\n\n### 技术架构\n- 前端：React 18 + TypeScript + Ant Design\n- 后端：Node.js + Express + Prisma\n- 数据库：PostgreSQL + Redis缓存\n- 图片存储：阿里云OSS\n- 视频转码：阿里云视频点播\n- 全文搜索：Elasticsearch\n\n### 数据库设计\n- users, recipes, steps, ingredients, collections, follows, comments, categories\n\n### 商业模式\n- 免费：基础功能\n- 会员：¥19.9/月，去广告+高级筛选+视频教程\n- 商城：厨具/食材电商',
      price: 19.9,
      categoryId: web.id,
      sellerId: seller1.id,
      tags: JSON.stringify(['社区', '美食', 'React', '全栈']),
    },
    {
      title: '实时协作白板工具',
      description: '类似Miro的在线协作白板，支持多人实时绘画、便签、流程图、思维导图。适用于远程团队头脑风暴和项目规划。',
      previewContent: '一个基于WebRTC的实时协作白板。功能包括：自由绘画、形状工具、便签、文本、流程图、思维导图、多人光标显示、无限画布、版本历史。支持导出为图片或PDF。',
      fullContent: '## 实时协作白板技术方案\n\n### 核心功能\n\n1. **画布系统**\n   - 无限画布（基于Canvas + 视口变换）\n   - 缩放/平移\n   - 网格/标尺\n   - 多层级管理\n\n2. **绘图工具**\n   - 自由画笔（贝塞尔曲线平滑）\n   - 形状（矩形/圆/箭头/连线）\n   - 文本框\n   - 便签（多色）\n   - 图片插入\n   - 橡皮擦\n\n3. **实时协作**\n   - WebSocket同步\n   - CRDT冲突解决\n   - 多人光标显示\n   - 在线状态\n   - 权限管理\n\n4. **模板库**\n   - 流程图模板\n   - 思维导图模板\n   - 用户旅程图\n   - 看板\n\n5. **导出与分享**\n   - PNG/SVG导出\n   - PDF导出\n   - 分享链接\n   - 嵌入iframe\n\n### 技术栈\n- 前端：React + TypeScript + Konva.js\n- 实时通信：Socket.IO + Redis适配器\n- 数据同步：Yjs (CRDT)\n- 后端：Node.js + Express\n- 数据库：PostgreSQL + Redis\n- 存储：MinIO/S3\n\n### 性能优化\n- Canvas离屏渲染\n- 视口裁剪（只渲染可见区域）\n- 操作历史压缩\n- 增量同步',
      price: 49.9,
      categoryId: web.id,
      sellerId: seller2.id,
      tags: JSON.stringify(['协作', '白板', 'Canvas', 'WebSocket']),
    },
    {
      title: 'AI聊天机器人客服系统',
      description: '基于大语言模型的智能客服系统，可嵌入任何网站。支持多轮对话、知识库问答、人工转接、情绪分析。',
      previewContent: '一个企业级AI客服解决方案。核心功能：基于GPT的多轮对话、企业知识库RAG检索、多渠道接入（网页/微信/API）、人工客服转接、对话情绪分析、客服数据报表。支持自定义AI人设和回复风格。',
      fullContent: '## AI客服系统完整方案\n\n### 系统架构\n\n1. **对话引擎**\n   - 基于GPT-4/GLM的多轮对话\n   - 上下文管理（滑动窗口）\n   - 意图识别\n   - 情绪检测\n   - 多语言支持\n\n2. **知识库系统（RAG）**\n   - 文档上传（PDF/Word/网页）\n   - 向量化存储（Pinecone/Milvus）\n   - 语义检索增强生成\n   - 知识库更新与版本管理\n   - 引用来源标注\n\n3. **多渠道接入**\n   - 网页Widget（可嵌入）\n   - 微信公众号/小程序\n   - API接口\n   - 钉钉/飞书机器人\n\n4. **人工客服**\n   - AI转人工无缝衔接\n   - 客服工作台\n   - 会话分配\n   - 快捷回复\n\n5. **数据分析**\n   - 对话量统计\n   - 解决率分析\n   - 满意度调查\n   - 热点问题聚类\n   - 情绪趋势\n\n### 技术栈\n- AI：OpenAI GPT-4 / 智谱GLM\n- 向量数据库：Pinecone / Milvus\n- 后端：Python FastAPI + Node.js\n- 前端：React + TypeScript\n- 消息队列：RabbitMQ\n- 数据库：PostgreSQL + Redis\n\n### API设计\n```\nPOST /api/chat/message        - 发送消息\nGET  /api/chat/history/:sid   - 对话历史\nPOST /api/knowledge/upload    - 上传知识文档\nPOST /api/knowledge/search    - 知识检索\nPOST /api/handover            - 转人工\nGET  /api/analytics/overview  - 数据概览\n```\n\n### 部署方案\n- Docker容器化\n- Kubernetes编排\n- 自动扩缩容\n- CDN加速Widget加载',
      price: 99.0,
      categoryId: ai.id,
      sellerId: seller1.id,
      tags: JSON.stringify(['AI', '客服', 'RAG', '企业级']),
    },
    {
      title: '个人记账与财务分析App',
      description: '一款简洁美观的个人记账应用，支持收支记录、预算管理、分类统计、数据可视化和多账户管理。',
      previewContent: '极简个人记账工具。功能：快速记一笔（收支分类）、月度预算设置与预警、收支统计图表、多账户管理（现金/银行卡/支付宝）、账单导入、数据导出。支持深色模式和生物识别解锁。',
      fullContent: '## 个人记账App方案\n\n### 核心功能\n\n1. **记账功能**\n   - 快速记账（3秒记一笔）\n   - 收支分类（自定义分类）\n   - 标签备注\n   - 照片附件（小票）\n   - 定期账单（自动记账）\n\n2. **预算管理**\n   - 月度总预算\n   - 分类预算\n   - 预算预警通知\n   - 超支分析\n\n3. **统计分析**\n   - 收支趋势图\n   - 分类占比饼图\n   - 月度/年度对比\n   - 消费排行\n   - 预算执行率\n\n4. **账户管理**\n   - 多账户（现金/银行卡/电子钱包）\n   - 账户转账\n   - 余额自动计算\n   - 账户隐藏\n\n5. **数据安全**\n   - 本地加密存储\n   - 生物识别解锁\n   - 云端备份\n   - 数据导出CSV\n\n### 技术方案\n- 框架：React Native / Flutter\n- 状态管理：Zustand\n- 本地存储：SQLite + SQLCipher加密\n- 图表：ECharts / Victory Native\n- 同步：自建后端API\n\n### UI设计\n- 首页：今日概览 + 快速记账按钮\n- 统计页：图表 + 筛选\n- 预算页：预算列表 + 进度条\n- 我的：账户管理 + 设置\n\n### 配色\n- 收入：#4CAF50 (绿)\n- 支出：#FF5252 (红)\n- 主色：#5C6BC0 (靛蓝)\n- 背景：#FAFAFA / #121212',
      price: 14.9,
      categoryId: mobile.id,
      sellerId: seller2.id,
      tags: JSON.stringify(['记账', '财务', 'React Native', 'App']),
    },
  ];

  for (const idea of ideas) {
    await prisma.idea.create({
      data: {
        ...idea,
        status: 'PUBLISHED',
        purchaseCount: Math.floor(Math.random() * 50) + 5,
      },
    });
  }

  console.log('  ✓ 创意点子创建完成');
  console.log('\n✅ 种子数据初始化完成！');
  console.log('\n📋 测试账号：');
  console.log('  管理员: admin@ideahub.com / 123456');
  console.log('  卖家1:  creator@ideahub.com / 123456');
  console.log('  卖家2:  dev@ideahub.com / 123456');
  console.log('  买家:   buyer@ideahub.com / 123456\n');
}

main()
  .catch((e) => {
    console.error('种子数据初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
