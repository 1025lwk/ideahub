import api from './client';
import type { WalletTransaction, PageResult } from '../types';

// 获取钱包余额
export async function getBalance(): Promise<{ balance: string }> {
  return api.get('/wallet/balance') as unknown as Promise<{ balance: string }>;
}

// 充值
export async function recharge(amount: number): Promise<{ balance: string; transaction: WalletTransaction }> {
  return api.post('/wallet/recharge', { amount }) as unknown as Promise<{
    balance: string;
    transaction: WalletTransaction;
  }>;
}

// 流水列表（分页）
export async function getTransactions(page = 1): Promise<PageResult<WalletTransaction>> {
  return api.get('/wallet/transactions', { params: { page } }) as unknown as Promise<PageResult<WalletTransaction>>;
}
