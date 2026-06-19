import api from './client';
import type { Idea, IdeaListQuery, PageResult, Category } from '../types';

export interface CreateIdeaPayload {
  title: string;
  description: string;
  previewContent: string;
  fullContent: string;
  price: number;
  categoryId?: string;
  tags?: string[];
}

// 获取分类树
export async function getCategories(): Promise<Category[]> {
  return api.get('/ideas/categories') as unknown as Promise<Category[]>;
}

// 创意列表（带搜索/筛选/分页）
export async function listIdeas(query: IdeaListQuery = {}): Promise<PageResult<Idea>> {
  return api.get('/ideas', { params: query }) as unknown as Promise<PageResult<Idea>>;
}

// 创意详情
export async function getIdea(id: string): Promise<Idea> {
  return api.get(`/ideas/${id}`) as unknown as Promise<Idea>;
}

// 发布创意
export async function createIdea(payload: CreateIdeaPayload): Promise<Idea> {
  return api.post('/ideas', payload) as unknown as Promise<Idea>;
}

// 我发布的创意（分页）
export async function getMyIdeas(page = 1): Promise<PageResult<Idea>> {
  return api.get('/ideas/my/ideas', { params: { page } }) as unknown as Promise<PageResult<Idea>>;
}

// 删除创意
export async function deleteIdea(id: string): Promise<void> {
  return api.delete(`/ideas/${id}`) as unknown as Promise<void>;
}
