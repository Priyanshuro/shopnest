import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  ChevronRight,
  ClipboardCopy,
  Heart,
  MapPin,
  Pencil,
  ReceiptText,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useOrders } from "../hooks/useProducts";
import { cn, formatPrice } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function truncatePrincipal(p: string): string {
  if (p.length <= 20) return p;
  return `${p.slice(0, 10)}…${p.slice(-8)}`;
}

function formatOrderDate(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getMemberSince(ts: bigint): string {
  return new Date(Number(ts) / 1_000_000).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function ProfileAvatar({
  name,
  size = "lg",
}: { name: string; size?: "sm" | "lg" }) {
  const initials = getInitials(name || "U");
  const lg = size === "lg";
  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-display font-bold shrink-0",
        "bg-primary text-primary-foreground",
        lg ? "w-20 h-20 text-2xl" : "w-10 h-10 text-sm",
      )}
    >
      {initials}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
}: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-1 rounded-xl bg-muted/60 border border-border px-4 py-3 text-center">
      <Icon className="w-4 h-4 text-primary mb-0.5" />
      <p className="text-lg font-bold font-display text-foreground leading-none">
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}

// ─── Wishlist Mini Card ───────────────────────────────────────────────────────

function WishlistCard({
  item,
  index,
}: {
  item: {
    productId: string;
    name: string;
    price: number;
    discountedPrice: number;
    image: string;
    category: string;
    isVerified: boolean;
  };
  index: number;
}) {
  const { removeItem } = useWishlistStore();
  const { addItem } = useCartStore();

  function handleAddToCart() {
    addItem({
      productId: item.productId,
      name: item.name,
      price: item.discountedPrice,
      image: item.image,
      quantity: 1,
      sellerId: "",
      sellerName: "",
    });
    toast.success("Added to cart!");
  }

  function handleRemove() {
    removeItem(item.productId);
    toast.success("Removed from wishlist");
  }

  const discount =
    item.price > 0 && item.discountedPrice < item.price
      ? Math.round(((item.price - item.discountedPrice) / item.price) * 100)
      : 0;

  return (
    <div
      className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all duration-200"
      data-ocid={`wishlist.item.${index}`}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={handleRemove}
        aria-label="Remove from wishlist"
        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-card/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
        data-ocid={`wishlist.remove_button.${index}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[10px] font-bold bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        </div>
      )}

      {/* Image */}
      <Link to="/products/$id" params={{ id: item.productId }}>
        <div className="aspect-[4/5] overflow-hidden bg-muted">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
            loading="lazy"
          />
        </div>
      </Link>

      {/* Info */}
      <div className="p-2.5 flex flex-col gap-1.5">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide truncate">
          {item.category}
        </p>
        <p className="text-xs font-semibold font-display line-clamp-2 leading-snug">
          {item.name}
        </p>

        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-bold text-primary">
            {formatPrice(item.discountedPrice)}
          </span>
          {discount > 0 && (
            <span className="text-[10px] text-muted-foreground line-through">
              {formatPrice(item.price)}
            </span>
          )}
        </div>

        {item.isVerified && (
          <div className="flex items-center gap-1">
            <BadgeCheck className="w-3 h-3 text-green-600" />
            <span className="text-[10px] text-green-700">Verified</span>
          </div>
        )}

        <Button
          type="button"
          size="sm"
          onClick={handleAddToCart}
          className="mt-1 w-full gap-1.5 text-[11px] h-7 rounded-lg font-semibold"
          data-ocid={`wishlist.add_to_cart.${index}`}
        >
          <ShoppingCart className="w-3 h-3" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

// ─── Order Mini Card ──────────────────────────────────────────────────────────

function OrderMiniCard({
  order,
  index,
}: {
  order: {
    id: string;
    status: string;
    createdAt: bigint;
    totalAmount: bigint;
    items: { productName: string; quantity: bigint }[];
  };
  index: number;
}) {
  const navigate = useNavigate();
  const firstItem = order.items[0];
  const statusStyle =
    STATUS_STYLES[order.status] ??
    "bg-muted text-muted-foreground border-border";

  return (
    <button
      type="button"
      onClick={() => navigate({ to: "/orders/$id", params: { id: order.id } })}
      className="w-full flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-sm transition-all duration-200 text-left"
      data-ocid={`orders.item.${index}`}
    >
      {/* Order icon placeholder */}
      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <ShoppingBag className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold font-display truncate">
          {firstItem ? firstItem.productName : `Order #${order.id.slice(0, 8)}`}
          {order.items.length > 1 && (
            <span className="text-muted-foreground font-normal">
              {" "}
              +{order.items.length - 1} more
            </span>
          )}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {formatOrderDate(order.createdAt)}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span className="text-sm font-bold text-primary">
          {formatPrice(Number(order.totalAmount))}
        </span>
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize",
            statusStyle,
          )}
        >
          {order.status}
        </span>
      </div>

      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UserProfile() {
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal().toText() ?? "";

  // Persistent display name & city (stored in localStorage for this demo)
  const [displayName, setDisplayName] = useState<string>(
    () => localStorage.getItem("shopnest-display-name") ?? "ShopNest User",
  );
  const [city, setCity] = useState<string>(
    () => localStorage.getItem("shopnest-city") ?? "",
  );
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [cityInput, setCityInput] = useState(city);
  const [savingProfile, setSavingProfile] = useState(false);

  const wishlistItems = useWishlistStore((s) => s.items);
  const { data: orders = [], isLoading: ordersLoading } = useOrders(principal);

  const recentOrders = orders.slice(0, 4);
  const totalSpent = orders.reduce((s, o) => s + Number(o.totalAmount), 0);

  // Member since: use earliest order date or fallback to today
  const memberSince =
    orders.length > 0
      ? getMemberSince(
          orders.reduce(
            (earliest, o) => (o.createdAt < earliest ? o.createdAt : earliest),
            orders[0].createdAt,
          ),
        )
      : "New Member";

  function handleSaveName() {
    if (!nameInput.trim()) return;
    setDisplayName(nameInput.trim());
    localStorage.setItem("shopnest-display-name", nameInput.trim());
    setEditingName(false);
  }

  async function handleSaveProfile() {
    setSavingProfile(true);
    await new Promise((r) => setTimeout(r, 600));
    setDisplayName(nameInput.trim() || displayName);
    setCity(cityInput.trim());
    localStorage.setItem(
      "shopnest-display-name",
      nameInput.trim() || displayName,
    );
    if (cityInput.trim())
      localStorage.setItem("shopnest-city", cityInput.trim());
    setSavingProfile(false);
    toast.success("Profile updated!");
  }

  function handleCopyPrincipal() {
    void navigator.clipboard.writeText(principal);
    toast.success("Principal ID copied!");
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="profile.page">
      {/* ── Top banner ── */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {/* Avatar + name row */}
          <div className="flex items-center gap-4">
            <ProfileAvatar name={displayName} size="lg" />

            <div className="flex-1 min-w-0">
              {/* Inline name editing */}
              {editingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveName();
                      if (e.key === "Escape") setEditingName(false);
                    }}
                    className="h-8 text-lg font-display font-bold px-2 max-w-xs"
                    autoFocus
                    data-ocid="profile.name_input"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveName}
                    data-ocid="profile.save_name_button"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingName(false)}
                    data-ocid="profile.cancel_name_button"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-bold text-foreground truncate">
                    {displayName}
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setNameInput(displayName);
                      setEditingName(true);
                    }}
                    aria-label="Edit name"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="profile.edit_name_button"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* City */}
              {city && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{city}</span>
                </div>
              )}

              {/* Principal */}
              {principal && (
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {truncatePrincipal(principal)}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPrincipal}
                    aria-label="Copy principal ID"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    data-ocid="profile.copy_principal_button"
                  >
                    <ClipboardCopy className="w-3 h-3" />
                  </button>
                </div>
              )}

              <p className="text-[11px] text-muted-foreground mt-1">
                Member since {memberSince}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-2.5 mt-5">
            <StatCard label="Orders" value={orders.length} icon={ReceiptText} />
            <StatCard
              label="Spent"
              value={formatPrice(totalSpent)}
              icon={ShoppingBag}
            />
            <StatCard
              label="Wishlist"
              value={wishlistItems.length}
              icon={Heart}
            />
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        <Tabs defaultValue="profile" data-ocid="profile.tabs">
          <TabsList className="w-full mb-6 h-10" data-ocid="profile.tab_list">
            <TabsTrigger
              value="profile"
              className="flex-1 gap-2"
              data-ocid="profile.tab.profile"
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="wishlist"
              className="flex-1 gap-2"
              data-ocid="profile.tab.wishlist"
            >
              <Heart className="w-3.5 h-3.5" />
              Wishlist
              {wishlistItems.length > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 text-[10px] px-1.5 py-0 h-4 rounded-full"
                >
                  {wishlistItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent
            value="profile"
            className="space-y-6 mt-0"
            data-ocid="profile.profile_section"
          >
            <div className="rounded-2xl bg-card border border-border p-5 shadow-sm">
              <h2 className="text-base font-display font-semibold mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Edit Profile
              </h2>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-name"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    Display Name
                  </label>
                  <Input
                    id="profile-name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    data-ocid="profile.edit_name_input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="profile-city"
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="profile-city"
                      value={cityInput}
                      onChange={(e) => setCityInput(e.target.value)}
                      placeholder="e.g. Jaipur, Indore, Patna"
                      className="pl-9"
                      data-ocid="profile.city_input"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="w-full gap-2"
                  data-ocid="profile.save_profile_button"
                >
                  {savingProfile ? (
                    <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  ) : null}
                  {savingProfile ? "Saving…" : "Save Profile"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ── Wishlist Tab ── */}
          <TabsContent
            value="wishlist"
            className="mt-0"
            data-ocid="profile.wishlist_section"
          >
            {wishlistItems.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl bg-card border border-border text-center"
                data-ocid="wishlist.empty_state"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground">
                    Your wishlist is empty
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Save items you love to find them later
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
                    variant="outline"
                    className="gap-2"
                    data-ocid="wishlist.browse_button"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {wishlistItems.map((item, i) => (
                  <WishlistCard
                    key={item.productId}
                    item={item}
                    index={i + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* ── Orders Section ── */}
        <section data-ocid="profile.orders_section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-display font-semibold flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-primary" />
              My Orders
            </h2>
            <Link to="/orders">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1 text-primary hover:text-primary text-xs"
                data-ocid="orders.view_all_button"
              >
                View All
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {ordersLoading ? (
            <div className="space-y-3" data-ocid="orders.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl bg-card border border-border text-center"
              data-ocid="orders.empty_state"
            >
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-display font-semibold text-foreground">
                  No orders yet
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start shopping to see your orders here
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
                  className="gap-2 mt-1"
                  data-ocid="orders.shop_now_button"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((order, i) => (
                <OrderMiniCard key={order.id} order={order} index={i + 1} />
              ))}
            </div>
          )}
        </section>

        {/* ── Danger zone ── */}
        <section className="rounded-2xl bg-card border border-border p-5">
          <h2 className="text-sm font-semibold text-destructive mb-3 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Danger Zone
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Clearing your wishlist or cart is irreversible. Make sure before
            proceeding.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/5 gap-2 text-xs"
              onClick={() => {
                const items = useWishlistStore.getState().items;
                for (const i of items) {
                  useWishlistStore.getState().removeItem(i.productId);
                }
                toast.success("Wishlist cleared");
              }}
              data-ocid="profile.clear_wishlist_button"
            >
              <Heart className="w-3.5 h-3.5" />
              Clear Wishlist
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
