import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import {
  AlertCircle,
  Box,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  MapPin,
  Package,
  PackageCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useOrderById, useOrders } from "../hooks/useProducts";
import type { Order, OrderItem } from "../types";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badgeClass: string }
> = {
  pending: {
    label: "Pending",
    color: "text-yellow-600",
    badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
  },
  shipped: {
    label: "Shipped",
    color: "text-purple-600",
    badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
  },
  "out for delivery": {
    label: "Out for Delivery",
    color: "text-orange-500",
    badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
  },
  delivered: {
    label: "Delivered",
    color: "text-green-600",
    badgeClass: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    badgeClass: "bg-red-100 text-red-700 border-red-200",
  },
};

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const cfg = STATUS_CONFIG[key] ?? {
    label: status,
    color: "text-muted-foreground",
    badgeClass: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badgeClass}`}
    >
      {cfg.label}
    </span>
  );
}

// ─── Timeline step ─────────────────────────────────────────────────────────────

const TIMELINE_STEPS = [
  { key: "placed", label: "Order Placed", icon: ShoppingBag },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Package },
  { key: "out for delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: PackageCheck },
];

function getStepIndex(status: string): number {
  const s = status.toLowerCase();
  if (s === "pending" || s === "placed") return 0;
  if (s === "confirmed") return 1;
  if (s === "shipped") return 2;
  if (s === "out for delivery") return 3;
  if (s === "delivered") return 4;
  return 0;
}

function OrderTimeline({ status }: { status: string }) {
  const currentIdx = getStepIndex(status);
  const isCancelled = status.toLowerCase() === "cancelled";

  return (
    <div className="space-y-0" data-ocid="order.timeline">
      {TIMELINE_STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isCompleted = idx < currentIdx;
        const isCurrent = idx === currentIdx && !isCancelled;
        const isFuture = idx > currentIdx;

        return (
          <div key={step.key} className="flex gap-4">
            {/* Connector + dot column */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  relative z-10 flex items-center justify-center w-9 h-9 rounded-full border-2 flex-shrink-0
                  ${
                    isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : isCurrent
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-background border-border text-muted-foreground"
                  }
                `}
              >
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
                )}
                <Icon className="w-4 h-4 relative z-10" />
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div
                  className={`w-0.5 h-10 mt-0.5 ${isCompleted ? "bg-green-400" : "bg-border"}`}
                />
              )}
            </div>

            {/* Label column */}
            <div className="pb-8 pt-1.5 min-w-0">
              <p
                className={`text-sm font-semibold leading-tight ${
                  isCompleted
                    ? "text-green-600"
                    : isCurrent
                      ? "text-primary"
                      : isFuture
                        ? "text-muted-foreground"
                        : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Currently at this step
                </p>
              )}
              {isCompleted && (
                <p className="text-xs text-green-600 mt-0.5">Completed</p>
              )}
            </div>
          </div>
        );
      })}

      {isCancelled && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-9 h-9 rounded-full border-2 bg-red-100 border-red-300 text-red-600 flex-shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="pt-1.5">
            <p className="text-sm font-semibold text-red-600">
              Order Cancelled
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This order has been cancelled
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order items list ──────────────────────────────────────────────────────────

function OrderItemRow({ item, index }: { item: OrderItem; index: number }) {
  return (
    <div
      className="flex items-center gap-3 py-3"
      data-ocid={`order.item.${index + 1}`}
    >
      {/* placeholder thumbnail */}
      <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 border border-border">
        <Box className="w-6 h-6 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">
          {item.productName}
        </p>
        <p className="text-xs text-muted-foreground">by {item.sellerName}</p>
        <p className="text-xs text-muted-foreground">
          Qty: {String(item.quantity)}
        </p>
      </div>
      <p className="text-sm font-bold text-primary flex-shrink-0">
        ₹{(Number(item.price) * Number(item.quantity)).toLocaleString("en-IN")}
      </p>
    </div>
  );
}

// ─── Order detail view ─────────────────────────────────────────────────────────

function OrderDetail({ orderId }: { orderId: string }) {
  const { data: order, isLoading, isError } = useOrderById(orderId);

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError || !order) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-4"
        data-ocid="order.error_state"
      >
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center">
          Order not found. Please check the order ID.
        </p>
        <Link to="/orders">
          <Button type="button" variant="outline">
            Back to My Orders
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (acc, item) => acc + Number(item.price) * Number(item.quantity),
    0,
  );
  const dateStr = new Date(
    Number(order.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
      data-ocid="order.detail_section"
    >
      {/* Header breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/orders" className="hover:text-primary transition-colors">
          My Orders
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium truncate">
          #{order.id.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* Order title row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Placed on {dateStr}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Timeline + items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                Delivery Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTimeline status={order.status} />
            </CardContent>
          </Card>

          {/* Order items */}
          <Card className="card-shadow">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-display font-semibold flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border">
                {order.items.map((item, idx) => (
                  <OrderItemRow
                    key={`${item.productId}-${item.sellerName}`}
                    item={item}
                    index={idx}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Address + Summary + Help */}
        <div className="space-y-6">
          {/* Delivery address */}
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground leading-relaxed">
                {order.deliveryAddress || "Address not available"}
              </p>
            </CardContent>
          </Card>

          {/* Payment summary */}
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display font-semibold">
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <Separator />
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
              {order.paymentId && (
                <p className="text-xs text-muted-foreground pt-1">
                  Payment ID:{" "}
                  <span className="font-mono">{order.paymentId}</span>
                </p>
              )}
            </CardContent>
          </Card>

          {/* Need help */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-border hover:border-primary hover:text-primary transition-colors"
            data-ocid="order.help_button"
          >
            <HelpCircle className="w-4 h-4" />
            Need Help?
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Orders list view ──────────────────────────────────────────────────────────

function OrderCard({
  order,
  index,
}: {
  order: Order;
  index: number;
}) {
  const dateStr = new Date(
    Number(order.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const firstItem = order.items[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      data-ocid={`orders.item.${index + 1}`}
    >
      <Card className="card-shadow hover:shadow-lg transition-shadow group">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-wrap items-start gap-3">
            {/* Thumbnail placeholder */}
            <div className="w-16 h-16 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
              <Box className="w-7 h-7 text-muted-foreground" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground font-mono">
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <StatusBadge status={order.status} />
              </div>
              <p className="text-xs text-muted-foreground">{dateStr}</p>
              {firstItem && (
                <p className="text-sm text-foreground truncate">
                  {firstItem.productName}
                  {order.items.length > 1 && (
                    <span className="text-muted-foreground">
                      {" "}
                      +{order.items.length - 1} more
                    </span>
                  )}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Price + action */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <p className="text-base font-bold text-primary">
                ₹{Number(order.totalAmount).toLocaleString("en-IN")}
              </p>
              <Link to="/orders/$id" params={{ id: order.id }}>
                <Button
                  type="button"
                  size="sm"
                  className="gap-1 text-xs"
                  data-ocid={`orders.track_button.${index + 1}`}
                >
                  Track Order
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function OrdersList({ customerId }: { customerId: string }) {
  const { data: orders, isLoading, isError } = useOrders(customerId);

  if (isLoading) return <OrdersListSkeleton />;

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 gap-4"
        data-ocid="orders.error_state"
      >
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">
          Failed to load orders. Please try again.
        </p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-24 gap-5"
        data-ocid="orders.empty_state"
      >
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-display font-semibold text-foreground">
            No orders yet
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Start shopping and your orders will appear here.
          </p>
        </div>
        <Link
          to="/products"
          search={{
            q: undefined,
            category: undefined,
            minPrice: undefined,
            maxPrice: undefined,
            sort: undefined,
          }}
        >
          <Button
            type="button"
            className="gap-2"
            data-ocid="orders.shop_now_button"
          >
            <ShoppingBag className="w-4 h-4" />
            Shop Now
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ocid="orders.list">
      {orders.map((order, idx) => (
        <OrderCard key={order.id} order={order} index={idx} />
      ))}
    </div>
  );
}

// ─── Skeleton loaders ──────────────────────────────────────────────────────────

function OrdersListSkeleton() {
  return (
    <div className="space-y-4" data-ocid="orders.loading_state">
      {(["a", "b", "c", "d"] as const).map((k) => (
        <Card key={k} className="card-shadow">
          <CardContent className="p-5">
            <div className="flex gap-3">
              <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="flex flex-col items-end gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6" data-ocid="order.loading_state">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-5 w-64" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              {(["step1", "step2", "step3", "step4", "step5"] as const).map(
                (k) => (
                  <div key={k} className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ),
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-4">
              {(["item1", "item2", "item3"] as const).map((k) => (
                <div key={k} className="flex gap-3 py-2">
                  <Skeleton className="w-14 h-14 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Main page component ───────────────────────────────────────────────────────

export default function OrderTracking() {
  const { identity } = useInternetIdentity();
  const params = useParams({ strict: false }) as { id?: string };
  const orderId = params.id;

  // Derive customerId from Internet Identity principal
  const customerId = identity?.getPrincipal().toText() ?? "";

  return (
    <div className="min-h-screen bg-background" data-ocid="order_tracking.page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {orderId ? (
          <OrderDetail orderId={orderId} />
        ) : (
          <>
            {/* Page header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 mb-8"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">
                  My Orders
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track and manage your purchases
                </p>
              </div>
            </motion.div>

            <OrdersList customerId={customerId} />
          </>
        )}
      </div>
    </div>
  );
}
