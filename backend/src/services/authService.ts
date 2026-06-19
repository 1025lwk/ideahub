import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';
import { signToken } from '../middleware/auth.js';
import { UserRole } from '../utils/constants.js';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string().min(2, '用户名至少2个字符').max(30),
  password: z.string().min(6, '密码至少6位'),
});

const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
});

export const authService = {
  async register(data: z.infer<typeof registerSchema>) {
    const { email, username, password } = registerSchema.parse(data);

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      throw Object.assign(new Error('邮箱或用户名已被注册'), { code: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, username, password: passwordHash, role: UserRole.USER, balance: 0 },
    });

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, balance: user.balance },
    };
  },

  async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = loginSchema.parse(data);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw Object.assign(new Error('邮箱或密码错误'), { code: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw Object.assign(new Error('邮箱或密码错误'), { code: 401 });
    }

    const token = signToken({ id: user.id, username: user.username, role: user.role });
    return {
      token,
      user: { id: user.id, email: user.email, username: user.username, role: user.role, balance: user.balance, avatar: user.avatar, bio: user.bio },
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      balance: user.balance,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  },

  async updateProfile(userId: string, data: { username?: string; avatar?: string; bio?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.username && { username: data.username }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
    });
    return { id: user.id, username: user.username, avatar: user.avatar, bio: user.bio };
  },
};
