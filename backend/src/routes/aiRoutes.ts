import { Router } from 'express';
import { aiService } from '../services/aiService.js';
import { authRequired } from '../middleware/auth.js';
import { success } from '../middleware/error.js';
import { storageService } from '../utils/storage.js';
import path from 'path';

const router = Router();

// 创建AI生成任务
router.post('/generate', authRequired, async (req, res, next) => {
  try {
    const result = await aiService.createRequest(req.user!.id, req.body);
    success(res, result, 'AI生成任务已提交');
  } catch (err) { next(err); }
});

// 获取任务状态
router.get('/status/:requestId', authRequired, async (req, res, next) => {
  try {
    const result = await aiService.getStatus(req.params.requestId, req.user!.id);
    success(res, result);
  } catch (err) { next(err); }
});

// 获取我的AI生成任务列表
router.get('/my/requests', authRequired, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await aiService.getMyRequests(req.user!.id, page);
    success(res, result);
  } catch (err) { next(err); }
});

// 下载生成的代码包
router.get('/download/:requestId', authRequired, async (req, res, next) => {
  try {
    const status = await aiService.getStatus(req.params.requestId, req.user!.id);
    if (status.status !== 'COMPLETED' || !status.downloadUrl) {
      return res.status(400).json({ code: 400, message: '代码包尚未生成完成' });
    }
    const filePath = storageService.getFilePath(status.downloadUrl);
    res.download(filePath, path.basename(filePath));
  } catch (err) { next(err); }
});

export default router;
