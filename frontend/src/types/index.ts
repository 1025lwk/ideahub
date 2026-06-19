// 全局类型定义：与后端 Prisma Schema 对齐
// 注意：后端使用大写枚举值（PUBLISHED, COMPLETED 等）

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  balance: string; // Decimal 在 JSON 中为字符串
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  sort?: number;
  children?: Category[];
}

export type IdeaStatus = 'PENDING' | 'PUBLISHED' | 'REJECTED';

export interface Idea {
  id: string;
  title: string;
  description: string;
  previewContent: string;
  fullContent: string | null; // 未购买时为 null
  price: string;
  status: IdeaStatus;
  tags: string[];
  purchaseCount: number;
  categoryId: string | null;
  category?: Category | null;
  sellerId: string;
  seller?: Pick<User, 'id' | 'username' | 'avatar' | 'bio'>;
  hasPurchased?: boolean; // 当前用户是否已购买
  isOwner?: boolean; // 当前用户是否为作者
  createdAt: string;
  updatedAt: string;
}

export type OrderType = 'IDEA_PURCHASE' | 'AI_GENERATION';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Order {
  id: string;
  type: OrderType;
  status: OrderStatus;
  buyerId: string;
  sellerId: string | null;
  ideaId: string | null;
  idea?: Pick<Idea, 'id' | 'title' | 'price'>;
  seller?: Pick<User, 'id' | 'username'>;
  buyer?: Pick<User, 'id' | 'username'>;
  totalAmount: string;
  platformFee: string;
  sellerEarning: string;
  orderId?: string;
  createdAt: string;
}

export type TransactionType = 'RECHARGE' | 'PURCHASE' | 'EARNING' | 'REFUND';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: string; // 可为负数（消费）
  balanceAfter: string;
  description: string;
  orderId?: string | null;
  createdAt: string;
}

export type AIRequestStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AIRequest {
  id: string;
  ideaId: string;
  idea?: Pick<Idea, 'id' | 'title'>;
  userId: string;
  extraRequirements?: string;
  techStack?: string;
  combinedPrompt?: string;
  status: AIRequestStatus;
  errorMessage: string | null;
  downloadUrl: string | null; // 文件存储路径/Key（非公开URL）
  fileSize?: number | null;
  orderId: string | null;
  createdAt: string;
  updatedAt: string;
}

// 分页结果（后端统一使用 list 字段）
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

export interface IdeaListQuery {
  keyword?: string;
  categoryId?: string;
  tag?: string;
  sort?: 'latest' | 'popular' | 'price_asc' | 'price_desc';
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}
