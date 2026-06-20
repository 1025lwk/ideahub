import prisma from '../utils/prisma.js';
import { aiQueue } from '../utils/queue.js';
import { orderService } from './orderService.js';
import { AIRequestStatus } from '../utils/constants.js';
import { z } from 'zod';

const generateSchema = z.object({
  ideaId: z.string().min(1, '请选择创意'),
  extraRequirements: z.string().optional(),
  techStack: z.string().optional(),
});

export const aiService = {
  // 创建AI生成任务
  async createRequest(userId: string, data: z.infer<typeof generateSchema>) {
    const { ideaId, extraRequirements, techStack } = generateSchema.parse(data);

    // 验证用户已购买该创意
    const purchaseOrder = await prisma.order.findFirst({
      where: { buyerId: userId, ideaId, type: 'IDEA_PURCHASE', status: 'COMPLETED' },
    });
    if (!purchaseOrder) {
      throw Object.assign(new Error('请先购买该创意后再使用AI生成服务'), { code: 403 });
    }

    // 创建AI生成订单并扣款
    const order = await orderService.createAIOrder(userId, ideaId);

    // 获取创意信息
    const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } });

    // 创建AI请求记录
    const aiRequest = await prisma.aIRequest.create({
      data: {
        userId,
        ideaId,
        extraRequirements,
        techStack,
        status: AIRequestStatus.PENDING,
        orderId: order.orderId,
      },
    });

    // 推入任务队列
    await aiQueue.add({
      requestId: aiRequest.id,
      ideaTitle: idea.title,
      ideaDescription: idea.description,
      ideaFullContent: idea.fullContent,
      extraRequirements,
      techStack,
    });

    return {
      requestId: aiRequest.id,
      orderId: order.orderId,
      status: AIRequestStatus.PENDING,
      message: 'AI生成任务已提交，请稍后查看进度',
    };
  },

  // 获取任务状态
  async getStatus(requestId: string, userId: string) {
    const request = await prisma.aIRequest.findUniqueOrThrow({ where: { id: requestId } });
    if (request.userId !== userId) {
      throw Object.assign(new Error('无权查看此任务'), { code: 403 });
    }
    return {
      id: request.id,
      status: request.status,
      downloadUrl: request.downloadUrl,
      errorMessage: request.errorMessage,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  },

  // 获取用户的AI生成任务列表
  async getMyRequests(userId: string, page = 1, pageSize = 10) {
    const [total, list] = await Promise.all([
      prisma.aIRequest.count({ where: { userId } }),
      prisma.aIRequest.findMany({
        where: { userId },
        include: { idea: { select: { id: true, title: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list, total, page, pageSize };
  },
};
