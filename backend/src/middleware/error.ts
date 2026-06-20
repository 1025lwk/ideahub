import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// 统一响应格式
export function success(res: Response, data?: any, message = '操作成功') {
  return res.json({ code: 200, message, data });
}

export function created(res: Response, data?: any, message = '创建成功') {
  return res.status(201).json({ code: 201, message, data });
}

export function fail(res: Response, code = 400, message = '操作失败') {
  return res.status(code).json({ code, message });
}

// 全局错误处理
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('[Error]', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      code: 400,
      message: '参数校验失败',
      errors: err.errors.map(e => ({ path: e.path.join('.'), message: e.message })),
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ code: 409, message: '数据已存在（唯一约束冲突）' });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ code: 404, message: '记录不存在' });
  }

  return res.status(500).json({ code: 500, message: err.message || '服务器内部错误' });
}
