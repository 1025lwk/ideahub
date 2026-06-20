import prisma from '../utils/prisma.js';
import { TransactionType } from '../utils/constants.js';
import { z } from 'zod';

const rechargeSchema = z.object({
  amount: z.number().min(1, '充值金额必须大于0'),
});

// 充值 - 使用数据库事务保证资金安全
export const walletService = {
  async recharge(userId: string, data: z.infer<typeof rechargeSchema>) {
    const { amount } = rechargeSchema.parse(data);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const balanceAfter = user.balance + amount;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { balance: balanceAfter },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          userId,
          type: TransactionType.RECHARGE,
          amount,
          balanceAfter,
          description: `充值 ¥${amount.toFixed(2)}`,
        },
      });

      return { user: updatedUser, transaction };
    });

    return {
      balance: result.user.balance,
      transaction: {
        id: result.transaction.id,
        type: result.transaction.type,
        amount: result.transaction.amount,
        balanceAfter: result.transaction.balanceAfter,
        description: result.transaction.description,
        createdAt: result.transaction.createdAt,
      },
    };
  },

  async getBalance(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return { balance: user.balance };
  },

  async getTransactions(userId: string, page = 1, pageSize = 20) {
    const [total, list] = await Promise.all([
      prisma.walletTransaction.count({ where: { userId } }),
      prisma.walletTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list, total, page, pageSize };
  },

  // 内部方法：扣款（在事务中调用）
  async deductBalance(tx: any, userId: string, amount: number, description: string, orderId?: string) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.balance < amount) {
      throw Object.assign(new Error('余额不足，请先充值'), { code: 402 });
    }
    const balanceAfter = user.balance - amount;
    await tx.user.update({ where: { id: userId }, data: { balance: balanceAfter } });
    await tx.walletTransaction.create({
      data: {
        userId,
        type: TransactionType.PURCHASE,
        amount: -amount,
        balanceAfter,
        description,
        orderId,
      },
    });
    return balanceAfter;
  },

  // 内部方法：给卖家/创作者增加收益（在事务中调用）
  async addEarning(tx: any, userId: string, amount: number, description: string, orderId?: string) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const balanceAfter = user.balance + amount;
    await tx.user.update({ where: { id: userId }, data: { balance: balanceAfter } });
    await tx.walletTransaction.create({
      data: {
        userId,
        type: TransactionType.EARNING,
        amount,
        balanceAfter,
        description,
        orderId,
      },
    });
    return balanceAfter;
  },
};
