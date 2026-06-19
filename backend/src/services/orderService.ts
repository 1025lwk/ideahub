import prisma from '../utils/prisma.js';
import { walletService } from './walletService.js';
import {
  OrderType, OrderStatus,
  PLATFORM_FEE_RATE_IDEA, PLATFORM_FEE_RATE_AI, AI_GENERATION_PRICE,
} from '../utils/constants.js';

export const orderService = {
  // 购买创意点子 - 数据库事务保证资金安全
  async purchaseIdea(buyerId: string, ideaId: string) {
    return prisma.$transaction(async (tx) => {
      const idea = await tx.idea.findUniqueOrThrow({
        where: { id: ideaId },
        include: { seller: true },
      });

      if (idea.status !== 'PUBLISHED') {
        throw Object.assign(new Error('该创意不可购买'), { code: 400 });
      }
      if (idea.sellerId === buyerId) {
        throw Object.assign(new Error('不能购买自己的创意'), { code: 400 });
      }

      // 检查是否已购买
      const existing = await tx.order.findFirst({
        where: { buyerId, ideaId, type: OrderType.IDEA_PURCHASE, status: OrderStatus.COMPLETED },
      });
      if (existing) {
        throw Object.assign(new Error('您已购买过该创意'), { code: 400 });
      }

      const totalAmount = idea.price;
      const platformFee = +(totalAmount * PLATFORM_FEE_RATE_IDEA).toFixed(2);
      const sellerEarning = +(totalAmount - platformFee).toFixed(2);

      // 创建订单
      const order = await tx.order.create({
        data: {
          type: OrderType.IDEA_PURCHASE,
          buyerId,
          sellerId: idea.sellerId,
          ideaId,
          totalAmount,
          platformFee,
          sellerEarning,
          status: OrderStatus.COMPLETED,
        },
      });

      // 买家扣款
      await walletService.deductBalance(tx, buyerId, totalAmount, `购买创意: ${idea.title}`, order.id);

      // 卖家获得收益（扣除平台抽成）
      await walletService.addEarning(tx, idea.sellerId, sellerEarning, `创意售出收益: ${idea.title}`, order.id);

      // 增加购买次数
      await tx.idea.update({
        where: { id: ideaId },
        data: { purchaseCount: { increment: 1 } },
      });

      return {
        orderId: order.id,
        ideaTitle: idea.title,
        totalAmount,
        platformFee,
        sellerEarning,
      };
    });
  },

  // 创建AI生成订单并扣款
  async createAIOrder(buyerId: string, ideaId: string) {
    return prisma.$transaction(async (tx) => {
      // 验证用户已购买该创意
      const purchaseOrder = await tx.order.findFirst({
        where: { buyerId, ideaId, type: OrderType.IDEA_PURCHASE, status: OrderStatus.COMPLETED },
      });
      if (!purchaseOrder) {
        throw Object.assign(new Error('请先购买该创意后再使用AI生成服务'), { code: 403 });
      }

      const totalAmount = AI_GENERATION_PRICE;
      const platformFee = +(totalAmount * PLATFORM_FEE_RATE_AI).toFixed(2);

      const order = await tx.order.create({
        data: {
          type: OrderType.AI_GENERATION,
          buyerId,
          ideaId,
          totalAmount,
          platformFee,
          status: OrderStatus.COMPLETED,
        },
      });

      // 买家扣款
      await walletService.deductBalance(tx, buyerId, totalAmount, `AI代码生成服务费`, order.id);

      return { orderId: order.id, totalAmount, platformFee };
    });
  },

  // 获取用户购买记录
  async getMyPurchases(buyerId: string, page = 1, pageSize = 10) {
    const [total, list] = await Promise.all([
      prisma.order.count({ where: { buyerId, type: OrderType.IDEA_PURCHASE } }),
      prisma.order.findMany({
        where: { buyerId, type: OrderType.IDEA_PURCHASE },
        include: {
          idea: { select: { id: true, title: true, price: true } },
          seller: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list, total, page, pageSize };
  },

  // 获取卖家销售记录
  async getMySales(sellerId: string, page = 1, pageSize = 10) {
    const [total, list] = await Promise.all([
      prisma.order.count({ where: { sellerId, type: OrderType.IDEA_PURCHASE } }),
      prisma.order.findMany({
        where: { sellerId, type: OrderType.IDEA_PURCHASE },
        include: {
          idea: { select: { id: true, title: true } },
          buyer: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list, total, page, pageSize };
  },

  // 获取收益统计
  async getEarnings(sellerId: string) {
    const sales = await prisma.order.findMany({
      where: { sellerId, type: OrderType.IDEA_PURCHASE, status: OrderStatus.COMPLETED },
      select: { sellerEarning: true, platformFee: true, totalAmount: true },
    });
    const totalEarning = sales.reduce((sum, o) => sum + (o.sellerEarning || 0), 0);
    const totalSales = sales.length;
    const totalPlatformFee = sales.reduce((sum, o) => sum + o.platformFee, 0);
    return { totalEarning, totalSales, totalPlatformFee };
  },
};
