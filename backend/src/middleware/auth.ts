import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

// 扩展 Request 类型，加入 user 字段
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string; role: string };
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'ideahub_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload: { id: string; username: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export function verifyToken(token: string): { id: string; username: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
  } catch {
    return null;
  }
}

// 必须登录中间件
export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '请先登录' });
  }
  const token = header.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' });
  }
  req.user = decoded;
  next();
}

// 可选登录中间件（不强制但会解析token）
export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) req.user = decoded;
  }
  next();
}

// 管理员权限中间件
export function adminRequired(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ code: 403, message: '需要管理员权限' });
  }
  next();
}
