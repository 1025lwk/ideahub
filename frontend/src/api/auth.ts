import api from './client';
import type { User } from '../types';

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 注册
export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return api.post('/auth/register', payload) as unknown as Promise<AuthResponse>;
}

// 登录
export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return api.post('/auth/login', payload) as unknown as Promise<AuthResponse>;
}

// 获取当前用户信息
export async function getMe(): Promise<User> {
  return api.get('/auth/profile') as unknown as Promise<User>;
}
