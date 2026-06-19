import api from './client';
import type { Order, PageResult } from '../types';

export interface PurchaseResult {
  orderId: string;
  ideaTitle: string;
  totalAmount: number;
  platformFee: number;
  sellerEarning: number;
}

// 购买创意（ideaId 作为 URL 参数）
export async function purchaseIdea(ideaId: string): Promise<PurchaseResult> {
  return api.post(`/orders/purchase/${ideaId}`) as unknown as Promise<PurchaseResult>;
}

// 我的购买记录
export async function getMyPurchases(page = 1): Promise<PageResult<Order>> {
  return api.get('/orders/purchases', { params: { page } }) as unknown as Promise<PageResult<Order>>;
}

// 我的销售记录
export async function getMySales(page = 1): Promise<PageResult<Order>> {
  return api.get('/orders/sales', { params: { page } }) as unknown as Promise<PageResult<Order>>;
}

// 我的收益统计
export async function getMyEarnings(): Promise<{
  totalEarning: number;
  totalSales: number;
  totalPlatformFee: number;
}> {
  return api.get('/orders/earnings') as unknown as Promise<{
    totalEarning: number;
    totalSales: number;
    totalPlatformFee: number;
  }>;
}
