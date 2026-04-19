import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { CartItem as BackendCartItem } from "../backend";
import type {
  AdminStats,
  Analytics,
  Order,
  Product,
  Review,
  Seller,
} from "../types";

// ─── Products ────────────────────────────────────────────────────────────────

export function useProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProducts() as Promise<Product[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProductById(id: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProductById(id) as Promise<Product | null>;
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useProductsByCategory(category: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProductsByCategory(category) as Promise<Product[]>;
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

export function useFeaturedProducts() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFeaturedProducts() as Promise<Product[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

export function useReviews(productId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Review[]>({
    queryKey: ["reviews", productId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getReviews(productId) as Promise<Review[]>;
    },
    enabled: !!actor && !isFetching && !!productId,
  });
}

export function useAddReview() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: string;
      rating: number;
      comment: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addReview(productId, BigInt(rating), comment);
    },
    onSuccess: (_data, { productId }) => {
      void queryClient.invalidateQueries({ queryKey: ["reviews", productId] });
    },
  });
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export function useOrders(customerId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order[]>({
    queryKey: ["orders", customerId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getOrders(customerId) as Promise<Order[]>;
    },
    enabled: !!actor && !isFetching && !!customerId,
  });
}

export function useOrderById(orderId: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Order | null>({
    queryKey: ["order", orderId],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getOrderById(orderId) as Promise<Order | null>;
    },
    enabled: !!actor && !isFetching && !!orderId,
  });
}

export function useCreateOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      totalAmount,
      deliveryAddress,
    }: {
      items: BackendCartItem[];
      totalAmount: bigint;
      deliveryAddress: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createOrder(items, totalAmount, deliveryAddress);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateOrderStatus(orderId, status);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      void queryClient.invalidateQueries({ queryKey: ["order"] });
    },
  });
}

// ─── Sellers ─────────────────────────────────────────────────────────────────

export function useSellers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Seller[]>({
    queryKey: ["sellers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSellers() as Promise<Seller[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifiedSellers() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Seller[]>({
    queryKey: ["sellers", "verified"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVerifiedSellers() as Promise<Seller[]>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifySeller() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sellerId: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.verifySeller(sellerId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sellers"] });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminStats() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<AdminStats>({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAdminStats() as Promise<AdminStats>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAnalytics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Analytics>({
    queryKey: ["admin", "analytics"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAnalytics() as Promise<Analytics>;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerUserRole() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "guest";
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}
