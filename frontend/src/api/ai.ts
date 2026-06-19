import api from './client';
import type { AIRequest, PageResult } from '../types';

export interface GeneratePayload {
  ideaId: string;
  extraRequirements: string;
  techStack: string;
}

export interface GenerateResult {
  requestId: string;
  orderId: string;
  status: string;
  message: string;
}

// 发起 AI 生成请求
export async function generateCode(payload: GeneratePayload): Promise<GenerateResult> {
  return api.post('/ai/generate', payload) as unknown as Promise<GenerateResult>;
}

// 查询任务状态
export async function getAIStatus(requestId: string): Promise<AIRequest> {
  return api.get(`/ai/status/${requestId}`) as unknown as Promise<AIRequest>;
}

// 我的 AI 任务列表
export async function getMyAIRequests(page = 1): Promise<PageResult<AIRequest>> {
  return api.get('/ai/my/requests', { params: { page } }) as unknown as Promise<PageResult<AIRequest>>;
}

// 下载代码包：后端直接返回文件流，需带 Token
export async function downloadCode(requestId: string): Promise<void> {
  const token = localStorage.getItem('ideahub_token');
  // 使用 fetch 带 Authorization 头获取 blob，再触发下载
  const response = await fetch(`/api/ai/download/${requestId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    throw new Error('下载失败');
  }
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-code-${requestId.slice(0, 8)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
