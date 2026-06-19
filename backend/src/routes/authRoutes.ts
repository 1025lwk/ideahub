import { Router } from 'express';
import { authService } from '../services/authService.js';
import { authRequired } from '../middleware/auth.js';
import { success, fail } from '../middleware/error.js';

const router = Router();

// 注册
router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    success(res, result, '注册成功');
  } catch (err) { next(err); }
});

// 登录
router.post('/login', async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    success(res, result, '登录成功');
  } catch (err) { next(err); }
});

// 获取个人信息
router.get('/profile', authRequired, async (req, res, next) => {
  try {
    const profile = await authService.getProfile(req.user!.id);
    success(res, profile);
  } catch (err) { next(err); }
});

// 更新个人信息
router.put('/profile', authRequired, async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user!.id, req.body);
    success(res, result, '更新成功');
  } catch (err) { next(err); }
});

export default router;
