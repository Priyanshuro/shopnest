import type { backendInterface } from "../backend.d";
import { UserRole } from "../backend.d";
import type { Principal } from "@icp-sdk/core/principal";

const now = BigInt(Date.now()) * BigInt(1_000_000);

const mockProducts = [
  {
    id: "p1",
    city: "Jaipur",
    name: "Men's Classic White Formal Shirt",
    createdAt: now,
    description: "Crisp white formal shirt perfect for office and events.",
    sellerName: "Rajesh Textiles",
    stock: BigInt(50),
    isVerified: true,
    category: "Shirts",
    sellerId: "s1",
    rating: 4.5,
    price: BigInt(1299),
    reviewCount: BigInt(128),
    discountedPrice: BigInt(899),
    hasFastDelivery: true,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    ],
  },
  {
    id: "p2",
    city: "Surat",
    name: "Women's Floral Summer Dress",
    createdAt: now,
    description: "Light and breezy floral dress for warm days.",
    sellerName: "Priya Fashion Hub",
    stock: BigInt(35),
    isVerified: true,
    category: "Dresses",
    sellerId: "s2",
    rating: 4.7,
    price: BigInt(1599),
    reviewCount: BigInt(87),
    discountedPrice: BigInt(999),
    hasFastDelivery: true,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
    ],
  },
  {
    id: "p3",
    city: "Ludhiana",
    name: "Blue Slim Fit Denim Jeans",
    createdAt: now,
    description: "Slim fit denim jeans in classic blue wash.",
    sellerName: "Denim World",
    stock: BigInt(60),
    isVerified: false,
    category: "Jeans",
    sellerId: "s3",
    rating: 4.3,
    price: BigInt(1899),
    reviewCount: BigInt(212),
    discountedPrice: BigInt(1299),
    hasFastDelivery: false,
    images: [
      "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=600&q=80",
    ],
  },
  {
    id: "p4",
    city: "Agra",
    name: "Black Canvas Sneakers",
    createdAt: now,
    description: "Versatile black canvas sneakers for everyday wear.",
    sellerName: "Step Right Footwear",
    stock: BigInt(45),
    isVerified: true,
    category: "Shoes",
    sellerId: "s4",
    rating: 4.6,
    price: BigInt(999),
    reviewCount: BigInt(340),
    discountedPrice: BigInt(699),
    hasFastDelivery: true,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    ],
  },
  {
    id: "p5",
    city: "Indore",
    name: "Men's Casual Grey Hoodie",
    createdAt: now,
    description: "Comfortable cotton blend hoodie for casual outings.",
    sellerName: "Comfort Wear Co.",
    stock: BigInt(28),
    isVerified: true,
    category: "Hoodies",
    sellerId: "s5",
    rating: 4.4,
    price: BigInt(1499),
    reviewCount: BigInt(95),
    discountedPrice: BigInt(999),
    hasFastDelivery: true,
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    ],
  },
  {
    id: "p6",
    city: "Nashik",
    name: "Women's Brown Leather Handbag",
    createdAt: now,
    description: "Stylish brown faux leather handbag with multiple compartments.",
    sellerName: "Bag Emporium",
    stock: BigInt(20),
    isVerified: false,
    category: "Bags",
    sellerId: "s6",
    rating: 4.2,
    price: BigInt(2499),
    reviewCount: BigInt(67),
    discountedPrice: BigInt(1799),
    hasFastDelivery: false,
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80",
    ],
  },
];

const mockSellers = [
  {
    id: "s1",
    shopImage:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80",
    city: "Jaipur",
    name: "Rajesh Kumar",
    joinedAt: now,
    description: "Traditional and modern Indian wear specialist in Jaipur.",
    totalSales: BigInt(1234),
    isVerified: true,
    shopName: "Rajesh Textiles",
    commissionRate: 15,
    pincode: "302001",
  },
  {
    id: "s2",
    shopImage:
      "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80",
    city: "Surat",
    name: "Priya Shah",
    joinedAt: now,
    description: "Women's fashion boutique with latest trends.",
    totalSales: BigInt(879),
    isVerified: true,
    shopName: "Priya Fashion Hub",
    commissionRate: 15,
    pincode: "395001",
  },
  {
    id: "s3",
    shopImage:
      "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
    city: "Ludhiana",
    name: "Harinder Singh",
    joinedAt: now,
    description: "Premium denim and casualwear from Punjab.",
    totalSales: BigInt(456),
    isVerified: false,
    shopName: "Denim World",
    commissionRate: 15,
    pincode: "141001",
  },
];

const mockReviews = [
  {
    id: "r1",
    createdAt: now,
    productId: "p1",
    comment: "Excellent quality shirt, fits perfectly!",
    customerId: { toText: () => "user-1" } as unknown as Principal,
    rating: BigInt(5),
  },
  {
    id: "r2",
    createdAt: now,
    productId: "p1",
    comment: "Good material, fast delivery.",
    customerId: { toText: () => "user-2" } as unknown as Principal,
    rating: BigInt(4),
  },
];

const mockOrders = [
  {
    id: "ord1",
    status: "delivered",
    deliveryAddress: "123 Main Street, Jaipur 302001",
    createdAt: now,
    totalAmount: BigInt(1798),
    paymentId: "pay_123",
    commissionAmount: BigInt(270),
    customerId: { toText: () => "user-1" } as unknown as Principal,
    items: [
      {
        productId: "p1",
        productName: "Men's Classic White Formal Shirt",
        sellerName: "Rajesh Textiles",
        quantity: BigInt(2),
        price: BigInt(899),
      },
    ],
  },
];

export const mockBackend: backendInterface = {
  addReview: async (_productId, rating, comment) => ({
    id: "r-new",
    createdAt: now,
    productId: _productId,
    comment,
    customerId: { toText: () => "user-1" } as unknown as Principal,
    rating,
  }),

  assignCallerUserRole: async () => undefined,

  createCheckoutSession: async () => "https://checkout.stripe.com/mock-session",

  createOrder: async (items, totalAmount, deliveryAddress) => ({
    id: "ord-new",
    status: "pending",
    deliveryAddress,
    createdAt: now,
    totalAmount,
    paymentId: "",
    commissionAmount: totalAmount / BigInt(100) * BigInt(15),
    customerId: { toText: () => "user-1" } as unknown as Principal,
    items: items.map((item) => ({
      productId: item.productId,
      productName: "Product",
      sellerName: "Seller",
      quantity: item.quantity,
      price: item.price,
    })),
  }),

  deleteProduct: async () => undefined,

  getAdminStats: async () => ({
    totalOrders: BigInt(1234),
    totalCommission: BigInt(185100),
    totalRevenue: BigInt(1234000),
    pendingVerifications: BigInt(5),
  }),

  getAllOrders: async () => mockOrders,

  getAllUsers: async () => [],

  getAnalytics: async () => ({
    growth: 23.5,
    topCategories: [
      ["Shirts", BigInt(340)],
      ["Dresses", BigInt(280)],
      ["Jeans", BigInt(210)],
      ["Shoes", BigInt(190)],
    ],
    monthlyRevenue: [
      BigInt(85000),
      BigInt(92000),
      BigInt(78000),
      BigInt(105000),
      BigInt(118000),
      BigInt(134000),
    ],
  }),

  getCallerUserRole: async () => UserRole.user,

  getFeaturedProducts: async () => mockProducts,

  getOrderById: async (orderId) =>
    mockOrders.find((o) => o.id === orderId) ?? null,

  getOrders: async () => mockOrders,

  getProductById: async (id) =>
    mockProducts.find((p) => p.id === id) ?? null,

  getProducts: async () => mockProducts,

  getProductsByCategory: async (category) =>
    mockProducts.filter((p) => p.category === category),

  getReviews: async () => mockReviews,

  getSellerEarnings: async () => BigInt(45200),

  getSellerOrders: async () => mockOrders,

  getSellerProducts: async (sellerId) =>
    mockProducts.filter((p) => p.sellerId === sellerId),

  getSellers: async () => mockSellers,

  getStripeSessionStatus: async () => ({
    __kind__: "failed",
    failed: { error: "mock" },
  }),

  getVerifiedSellers: async () => mockSellers.filter((s) => s.isVerified),

  isCallerAdmin: async () => false,

  isStripeConfigured: async () => false,

  setStripeConfiguration: async () => undefined,

  transform: async (input) => ({
    status: input.response.status,
    body: input.response.body,
    headers: input.response.headers,
  }),

  updateOrderStatus: async () => true,

  upsertProduct: async () => undefined,

  verifySeller: async () => true,
};
