import { Router } from 'express';
import { ideaService } from '../services/ideaService.js';
import { authRequired, authOptional } from '../middleware/auth.js';
import { success } from '../middleware/error.js';

const router = Router();

// 获取分类列表（必须在 /:id 之前定义，否则会被 :id 捕获）
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await ideaService.getCategories();
    success(res, categories);
  } catch (err) { next(err); }
});

// 获取我发布的创意（必须在 /:id 之前定义，否则 "my" 会被当作 id）
router.get('/my/ideas', authRequired, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await ideaService.getMyIdeas(req.user!.id, page);
    success(res, result);
  } catch (err) { next(err); }
});

// 获取创意列表（市场页）
router.get('/', async (req, res, next) => {
  try {
    const result = await ideaService.list(req.query as any);
    success(res, result);
  } catch (err) { next(err); }
});

// 获取创意详情
router.get('/:id', authOptional, async (req, res, next) => {
  try {
    const idea = await ideaService.getById(req.params.id, req.user?.id);
    success(res, idea);
  } catch (err) { next(err); }
});

// 发布创意
router.post('/', authRequired, async (req, res, next) => {
  try {
    const idea = await ideaService.create(req.user!.id, req.body);
    success(res, idea, '发布成功');
  } catch (err) { next(err); }
});

// 更新创意
router.put('/:id', authRequired, async (req, res, next) => {
  try {
    const idea = await ideaService.update(req.params.id, req.user!.id, req.body);
    success(res, idea, '更新成功');
  } catch (err) { next(err); }
});

// 删除创意
router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    await ideaService.delete(req.params.id, req.user!.id);
    success(res, null, '删除成功');
  } catch (err) { next(err); }
});

export default router;
