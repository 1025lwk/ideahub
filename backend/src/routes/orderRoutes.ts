import { Router } from 'express';
import { orderService } from '../services/orderService.js';
import { authRequired } from '../middleware/auth.js';
import { success } from '../middleware/error.js';

const router = Router();

// 购买创意
router.post('/purchase/:ideaId', authRequired, async (req, res, next) => {
  try {
    const result = await orderService.purchaseIdea(req.user!.id, req.params.ideaId);
    success(res, result, '购买成功');
  } catch (err) { next(err); }
});

// 获取购买记录
router.get('/purchases', authRequired, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await orderService.getMyPurchases(req.user!.id, page);
    success(res, result);
  } catch (err) { next(err); }
});

// 获取销售记录
router.get('/sales', authRequired, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await orderService.getMySales(req.user!.id, page);
    success(res, result);
  } catch (err) { next(err); }
});

// 获取收益统计
router.get('/earnings', authRequired, async (req, res, next) => {
  try {
    const result = await orderService.getEarnings(req.user!.id);
    success(res, result);
  } catch (err) { next(err); }
});

export default router;
