import prisma from '../utils/prisma.js';
import { IdeaStatus } from '../utils/constants.js';
import { z } from 'zod';

const createIdeaSchema = z.object({
  title: z.string().min(3, '标题至少3个字符').max(100),
  description: z.string().min(10, '描述至少10个字符'),
  previewContent: z.string().min(20, '预览内容至少20个字符'),
  fullContent: z.string().min(50, '完整内容至少50个字符'),
  price: z.number().min(0, '价格不能为负'),
  categoryId: z.string().min(1, '请选择分类'),
  tags: z.array(z.string()).optional().default([]),
});

const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  keyword: z.string().optional(),
  categoryId: z.string().optional(),
  tag: z.string().optional(),
  sort: z.enum(['latest', 'popular', 'price_asc', 'price_desc']).optional().default('latest'),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export const ideaService = {
  async create(sellerId: string, data: z.infer<typeof createIdeaSchema>) {
    const parsed = createIdeaSchema.parse(data);
    const idea = await prisma.idea.create({
      data: {
        ...parsed,
        tags: JSON.stringify(parsed.tags),
        sellerId,
        status: IdeaStatus.PUBLISHED, // MVP阶段自动发布，生产环境应为PENDING待审核
      },
      include: { category: true, seller: { select: { id: true, username: true, avatar: true } } },
    });
    return { ...idea, tags: JSON.parse(idea.tags) };
  },

  async list(query: z.infer<typeof listQuerySchema>) {
    const { page, pageSize, keyword, categoryId, tag, sort, minPrice, maxPrice } = listQuerySchema.parse(query);
    const where: any = { status: IdeaStatus.PUBLISHED };

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (tag) where.tags = { contains: tag };
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy: any = {
      latest: { createdAt: 'desc' },
      popular: { purchaseCount: 'desc' },
      price_asc: { price: 'asc' },
      price_desc: { price: 'desc' },
    }[sort];

    const [total, list] = await Promise.all([
      prisma.idea.count({ where }),
      prisma.idea.findMany({
        where,
        include: {
          category: true,
          seller: { select: { id: true, username: true, avatar: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      list: list.map(i => ({ ...i, tags: JSON.parse(i.tags) })),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  },

  async getById(id: string, userId?: string) {
    const idea = await prisma.idea.findUnique({
      where: { id },
      include: {
        category: true,
        seller: { select: { id: true, username: true, avatar: true, bio: true } },
      },
    });
    if (!idea) throw Object.assign(new Error('创意不存在'), { code: 404 });

    // 判断当前用户是否已购买
    let hasPurchased = false;
    if (userId) {
      const order = await prisma.order.findFirst({
        where: { buyerId: userId, ideaId: id, type: 'IDEA_PURCHASE', status: 'COMPLETED' },
      });
      hasPurchased = !!order;
    }

    const isOwner = userId === idea.sellerId;
    const showFullContent = hasPurchased || isOwner;

    return {
      ...idea,
      tags: JSON.parse(idea.tags),
      hasPurchased,
      isOwner,
      // 未购买且非作者时隐藏完整内容
      fullContent: showFullContent ? idea.fullContent : null,
    };
  },

  async getMyIdeas(sellerId: string, page = 1, pageSize = 10) {
    const [total, list] = await Promise.all([
      prisma.idea.count({ where: { sellerId } }),
      prisma.idea.findMany({
        where: { sellerId },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return { list: list.map(i => ({ ...i, tags: JSON.parse(i.tags) })), total, page, pageSize };
  },

  async getCategories() {
    const categories = await prisma.category.findMany({
      include: { children: true },
      where: { parentId: null },
      orderBy: { sort: 'asc' },
    });
    return categories;
  },

  async update(id: string, sellerId: string, data: Partial<z.infer<typeof createIdeaSchema>>) {
    const idea = await prisma.idea.findUniqueOrThrow({ where: { id } });
    if (idea.sellerId !== sellerId) {
      throw Object.assign(new Error('无权修改他人的创意'), { code: 403 });
    }
    const updated = await prisma.idea.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.previewContent && { previewContent: data.previewContent }),
        ...(data.fullContent && { fullContent: data.fullContent }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
      },
      include: { category: true },
    });
    return { ...updated, tags: JSON.parse(updated.tags) };
  },

  async delete(id: string, sellerId: string) {
    const idea = await prisma.idea.findUniqueOrThrow({ where: { id } });
    if (idea.sellerId !== sellerId) {
      throw Object.assign(new Error('无权删除他人的创意'), { code: 403 });
    }
    await prisma.idea.delete({ where: { id } });
    return true;
  },
};
