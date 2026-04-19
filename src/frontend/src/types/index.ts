import type { Principal } from "@icp-sdk/core/principal";

// ─── Core domain types (matching backend exactly) ────────────────────────────

export interface Product {
  id: string;
  city: string;
  name: string;
  createdAt: bigint;
  description: string;
  sellerName: string;
  stock: bigint;
  isVerified: boolean;
  category: string;
  sellerId: string;
  rating: number;
  price: bigint;
  reviewCount: bigint;
  discountedPrice: bigint;
  hasFastDelivery: boolean;
  images: string[];
}

export interface Seller {
  id: string;
  shopImage: string;
  city: string;
  name: string;
  joinedAt: bigint;
  description: string;
  totalSales: bigint;
  isVerified: boolean;
  shopName: string;
  commissionRate: number;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  sellerName: string;
  quantity: bigint;
  price: bigint;
}

export interface Order {
  id: string;
  status: string;
  deliveryAddress: string;
  createdAt: bigint;
  totalAmount: bigint;
  paymentId: string;
  commissionAmount: bigint;
  customerId: Principal;
  items: OrderItem[];
}

export interface Review {
  id: string;
  createdAt: bigint;
  productId: string;
  comment: string;
  customerId: Principal;
  rating: bigint;
}

export interface AdminStats {
  totalRevenue: bigint;
  totalOrders: bigint;
  totalCommission: bigint;
  pendingVerifications: bigint;
}

export interface Analytics {
  growth: number;
  topCategories: [string, bigint][];
  monthlyRevenue: bigint[];
}

// ─── Frontend-only types ──────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerName: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  discountedPrice: number;
  image: string;
  category: string;
  isVerified: boolean;
}

export interface UserProfile {
  name: string;
  email?: string;
  avatar?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

export type UserRole = "admin" | "user" | "guest";
