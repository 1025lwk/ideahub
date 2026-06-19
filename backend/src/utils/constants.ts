// 应用层枚举常量（SQLite不支持Prisma enum，使用String+常量）

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

export const IdeaStatus = {
  PENDING: 'PENDING',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
} as const;

export const OrderType = {
  IDEA_PURCHASE: 'IDEA_PURCHASE',
  AI_GENERATION: 'AI_GENERATION',
} as const;

export const OrderStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

export const TransactionType = {
  RECHARGE: 'RECHARGE',
  PURCHASE: 'PURCHASE',
  EARNING: 'EARNING',
  REFUND: 'REFUND',
} as const;

export const AIRequestStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

// 平台抽成比例
export const PLATFORM_FEE_RATE_IDEA = parseFloat(process.env.PLATFORM_FEE_RATE_IDEA || '0.10');
export const PLATFORM_FEE_RATE_AI = parseFloat(process.env.PLATFORM_FEE_RATE_AI || '0.20');

// AI生成服务定价
export const AI_GENERATION_PRICE = 10.0;
