import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { message } from 'antd';

// 创建 axios 实例
// 开发环境使用 Vite proxy (/api → localhost:4000)
// 生产环境通过 VITE_API_URL 环境变量指定后端地址
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

// 请求拦截器：自动附加 JWT Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('ideahub_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：统一解包 { code, message, data } → data，并处理错误
api.interceptors.response.use(
  (response) => {
    // 后端统一响应格式：{ code, message, data }
    // 这里解包返回 data 字段
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body && 'data' in body) {
      if (body.code === 200 || body.code === 201) {
        return body.data;
      }
      // 业务错误
      message.error(body.message || '操作失败');
      return Promise.reject(new Error(body.message || '操作失败'));
    }
    // 非标准格式（如文件下载），原样返回
    return body;
  },
  (error: AxiosError<{ code?: number; error?: string; message?: string; errors?: unknown[] }>) => {
    const status = error.response?.status;
    const body = error.response?.data as { message?: string; error?: string; errors?: unknown[] } | undefined;
    let msg = body?.message || body?.error || '请求失败，请稍后重试';

    // Zod 校验错误
    if (body?.errors && Array.isArray(body.errors)) {
      const first = body.errors[0] as { message?: string };
      msg = first?.message || msg;
    }

    if (status === 401) {
      localStorage.removeItem('ideahub_token');
      localStorage.removeItem('ideahub_user');
      message.error('登录已过期，请重新登录');
      if (!window.location.pathname.startsWith('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      }
    } else if (status === 403) {
      message.error(msg || '没有权限执行此操作');
    } else if (status && status >= 500) {
      message.error('服务器异常，请稍后重试');
    } else {
      message.error(msg);
    }
    return Promise.reject(error);
  }
);

export default api;
