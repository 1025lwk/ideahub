import { Router } from 'express';
import { walletService } from '../services/walletService.js';
import { authRequired } from '../middleware/auth.js';
import { success } from '../middleware/error.js';

const router = Router();

// 获取余额
router.get('/balance', authRequired, async (req, res, next) => {
  try {
    const result = await walletService.getBalance(req.user!.id);
    success(res, result);
  } catch (err) { next(err); }
});

// 充值
router.post('/recharge', authRequired, async (req, res, next) => {
  try {
    const result = await walletService.recharge(req.user!.id, req.body);
    success(res, result, '充值成功');
  } catch (err) { next(err); }
});

// 获取流水记录
router.get('/transactions', authRequired, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await walletService.getTransactions(req.user!.id, page);
    success(res, result);
  } catch (err) { next(err); }
});

export default router;
