import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type OrderId = string;
export interface CartItem {
    productId: ProductId;
    quantity: bigint;
    price: bigint;
}
export type Timestamp = bigint;
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type SellerId = string;
export interface Seller {
    id: SellerId;
    shopImage: string;
    city: string;
    name: string;
    joinedAt: Timestamp;
    description: string;
    totalSales: bigint;
    isVerified: boolean;
    shopName: string;
    commissionRate: number;
    pincode: string;
}
export interface OrderItem {
    productId: ProductId;
    productName: string;
    sellerName: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: OrderId;
    status: string;
    deliveryAddress: string;
    createdAt: Timestamp;
    totalAmount: bigint;
    paymentId: string;
    commissionAmount: bigint;
    customerId: UserId;
    items: Array<OrderItem>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type UserId = Principal;
export interface ShoppingItem {
    productName: string;
    currency: string;
    quantity: bigint;
    priceInCents: bigint;
    productDescription: string;
}
export interface Analytics {
    growth: number;
    topCategories: Array<[string, bigint]>;
    monthlyRevenue: Array<bigint>;
}
export interface AdminStats {
    totalOrders: bigint;
    totalCommission: bigint;
    totalRevenue: bigint;
    pendingVerifications: bigint;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export type StripeSessionStatus = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
    };
};
export interface StripeConfiguration {
    allowedCountries: Array<string>;
    secretKey: string;
}
export type ReviewId = string;
export type ProductId = string;
export interface Review {
    id: ReviewId;
    createdAt: Timestamp;
    productId: ProductId;
    comment: string;
    customerId: UserId;
    rating: bigint;
}
export interface Product {
    id: ProductId;
    city: string;
    name: string;
    createdAt: Timestamp;
    description: string;
    sellerName: string;
    stock: bigint;
    isVerified: boolean;
    category: string;
    sellerId: SellerId;
    rating: number;
    price: bigint;
    reviewCount: bigint;
    discountedPrice: bigint;
    hasFastDelivery: boolean;
    images: Array<string>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addReview(productId: ProductId, rating: bigint, comment: string): Promise<Review>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCheckoutSession(items: Array<ShoppingItem>, successUrl: string, cancelUrl: string): Promise<string>;
    createOrder(items: Array<CartItem>, totalAmount: bigint, deliveryAddress: string): Promise<Order>;
    deleteProduct(productId: ProductId): Promise<void>;
    getAdminStats(): Promise<AdminStats>;
    getAllOrders(): Promise<Array<Order>>;
    getAllUsers(): Promise<Array<Principal>>;
    getAnalytics(): Promise<Analytics>;
    getCallerUserRole(): Promise<UserRole>;
    getFeaturedProducts(): Promise<Array<Product>>;
    getOrderById(orderId: OrderId): Promise<Order | null>;
    getOrders(_customerId: string): Promise<Array<Order>>;
    getProductById(id: ProductId): Promise<Product | null>;
    getProducts(): Promise<Array<Product>>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getReviews(productId: ProductId): Promise<Array<Review>>;
    getSellerEarnings(sellerId: SellerId): Promise<bigint>;
    getSellerOrders(sellerId: SellerId): Promise<Array<Order>>;
    getSellerProducts(sellerId: SellerId): Promise<Array<Product>>;
    getSellers(): Promise<Array<Seller>>;
    getStripeSessionStatus(sessionId: string): Promise<StripeSessionStatus>;
    getVerifiedSellers(): Promise<Array<Seller>>;
    isCallerAdmin(): Promise<boolean>;
    isStripeConfigured(): Promise<boolean>;
    setStripeConfiguration(config: StripeConfiguration): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: OrderId, status: string): Promise<boolean>;
    upsertProduct(product: Product): Promise<void>;
    verifySeller(sellerId: SellerId): Promise<boolean>;
}
