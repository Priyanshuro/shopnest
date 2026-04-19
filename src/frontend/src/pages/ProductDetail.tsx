import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Heart,
  MapPin,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { ProductCard } from "../components/ProductCard";
import {
  useAddReview,
  useProductById,
  useProducts,
  useReviews,
} from "../hooks/useProducts";
import { cn, formatPrice, getDiscountPercent } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import type { Product, Review } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CLOTHING_CATEGORIES = [
  "Shirts",
  "Dresses",
  "Hoodies",
  "Kurtas",
  "Sarees",
];
const SIZES = ["S", "M", "L", "XL", "XXL"];

function getProductImageUrl(product: Product, index = 0): string {
  if (product.images.length > index) {
    const img = product.images[index];
    if (typeof img === "string") return img;
    if (img && typeof (img as { url?: string }).url === "string")
      return (img as { url: string }).url;
  }
  // Per-category Unsplash fallbacks
  const fallbacks: Record<string, string[]> = {
    Shirts: [
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=800&q=85",
      "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&q=80",
      "https://images.unsplash.com/photo-1561052967-61fc91e48d79?w=400&q=80",
      "https://images.unsplash.com/photo-1603251578711-3290ca1a0187?w=400&q=80",
    ],
    Dresses: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
      "https://images.unsplash.com/photo-1562137369-1a1a0bc66744?w=400&q=80",
    ],
    Jeans: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=85",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80",
      "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&q=80",
      "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=400&q=80",
    ],
    Shoes: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85",
      "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80",
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&q=80",
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80",
    ],
    Hoodies: [
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800&q=85",
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=400&q=80",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=400&q=80",
    ],
    Handbags: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85",
      "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80",
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80",
      "https://images.unsplash.com/photo-1614179689702-355944cd0918?w=400&q=80",
    ],
    Sarees: [
      "https://images.unsplash.com/photo-1610030460040-d06b0b21ef0f?w=800&q=85",
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400&q=80",
      "https://images.unsplash.com/photo-1616112134669-ddf79b6dd69a?w=400&q=80",
    ],
    Kurtas: [
      "https://images.unsplash.com/photo-1597248374161-426f0d6d2fc9?w=800&q=85",
      "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=400&q=80",
      "https://images.unsplash.com/photo-1614174486480-7a5c6ab3455a?w=400&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400&q=80",
    ],
  };
  const urls = fallbacks[product.category] ?? [
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=85",
    "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=80",
    "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400&q=80",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
  ];
  return urls[index] ?? urls[0];
}

function StarRating({
  rating,
  size = "sm",
}: { rating: number; size?: "sm" | "md" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4",
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-right text-muted-foreground">{star}</span>
      <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, delay: (5 - star) * 0.08 }}
          className="h-full bg-amber-400 rounded-full"
        />
      </div>
      <span className="w-6 text-muted-foreground">{count}</span>
    </div>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const name = review.customerId.toString().slice(0, 8).toUpperCase();
  const initials = name.slice(0, 2);
  const date = new Date(
    Number(review.createdAt) / 1_000_000,
  ).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const colors = [
    "bg-primary",
    "bg-accent",
    "bg-chart-2",
    "bg-chart-3",
    "bg-chart-5",
  ];
  const bg = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="flex gap-3 py-4 border-b border-border last:border-0"
      data-ocid={`reviews.item.${index + 1}`}
    >
      <div
        className={cn(
          "w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground",
          bg,
        )}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="font-semibold text-sm truncate">{name}…</span>
          <span className="text-[11px] text-muted-foreground shrink-0">
            {date}
          </span>
        </div>
        <StarRating rating={Number(review.rating)} />
        <p className="mt-1.5 text-sm text-foreground/80 leading-relaxed break-words">
          {review.comment}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-4 pt-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

// ─── Write a review form ──────────────────────────────────────────────────────

function WriteReviewForm({ productId }: { productId: string }) {
  const [comment, setComment] = useState("");
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const { mutate: addReview, isPending, isSuccess } = useAddReview();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim() || selectedRating === 0) return;
    addReview(
      { productId, rating: selectedRating, comment: comment.trim() },
      {
        onSuccess: () => {
          setComment("");
          setSelectedRating(0);
        },
      },
    );
  }

  if (isSuccess) {
    return (
      <div
        className="flex items-center gap-2 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium"
        data-ocid="review_form.success_state"
      >
        <CheckCircle className="w-5 h-5 shrink-0" />
        Thank you! Your review has been submitted.
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4"
      data-ocid="review_form.section"
    >
      <h3 className="font-display font-bold text-base">Write a Review</h3>

      {/* Star picker */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            aria-label={`Rate ${s} stars`}
            onClick={() => setSelectedRating(s)}
            onMouseEnter={() => setHoveredStar(s)}
            onMouseLeave={() => setHoveredStar(0)}
            className="transition-smooth hover:scale-125"
            data-ocid={`review_form.star.${s}`}
          >
            <Star
              className={cn(
                "w-6 h-6 transition-colors",
                s <= (hoveredStar || selectedRating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/40",
              )}
            />
          </button>
        ))}
        {selectedRating > 0 && (
          <span className="text-sm text-muted-foreground ml-2">
            {
              ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                selectedRating
              ]
            }
          </span>
        )}
      </div>

      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        rows={3}
        className="resize-none"
        data-ocid="review_form.textarea"
      />

      <Button
        type="submit"
        disabled={isPending || !comment.trim() || selectedRating === 0}
        className="gap-2"
        data-ocid="review_form.submit_button"
      >
        {isPending ? "Submitting…" : "Submit Review"}
      </Button>
    </form>
  );
}

// ─── Main ProductDetail page ──────────────────────────────────────────────────

export default function ProductDetail() {
  const { id } = useParams({ from: "/products/$id" });
  const { data: product, isLoading } = useProductById(id);
  const { data: reviews = [] } = useReviews(id);
  const { data: allProducts = [] } = useProducts();
  const { toggle, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useInternetIdentity();

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);
  const [descOpen, setDescOpen] = useState(false);

  if (isLoading) return <ProductDetailSkeleton />;

  if (!product) {
    return (
      <div
        className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4"
        data-ocid="product_detail.error_state"
      >
        <div className="text-5xl">🔍</div>
        <h2 className="text-xl font-display font-bold">Product Not Found</h2>
        <p className="text-muted-foreground text-sm">
          This product may have been removed or the link is invalid.
        </p>
        <Button asChild>
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
            Browse Products
          </Link>
        </Button>
      </div>
    );
  }

  const price = Number(product.price);
  const discounted = Number(product.discountedPrice);
  const discount = getDiscountPercent(price, discounted);
  const isClothing = CLOTHING_CATEGORIES.includes(product.category);
  const wishlisted = isInWishlist(product.id);
  const mainImgUrl = getProductImageUrl(product, activeImg);
  const thumbnails = [0, 1, 2, 3].map((i) => getProductImageUrl(product, i));

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Number(r.rating) === star).length,
  }));

  // Related products (same category, exclude current, up to 6)
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  function handleAddToCart() {
    addItem({
      productId: product!.id,
      name: product!.name,
      price: discounted,
      image: mainImgUrl,
      quantity,
      sellerId: product!.sellerId,
      sellerName: product!.sellerName,
    });
  }

  function handleToggleWishlist() {
    toggle({
      productId: product!.id,
      name: product!.name,
      price,
      discountedPrice: discounted,
      image: mainImgUrl,
      category: product!.category,
      isVerified: product!.isVerified,
    });
  }

  return (
    <div className="bg-background min-h-screen" data-ocid="product_detail.page">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="bg-muted/40 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Link
            to="/"
            className="hover:text-foreground transition-colors"
            data-ocid="breadcrumb.home_link"
          >
            Home
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link
            to="/products"
            search={{
              q: undefined,
              category: undefined,
              minPrice: undefined,
              maxPrice: undefined,
              sort: undefined,
            }}
            className="hover:text-foreground transition-colors"
            data-ocid="breadcrumb.products_link"
          >
            Products
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <Link
            to="/products"
            search={{
              q: undefined,
              category: product.category,
              minPrice: undefined,
              maxPrice: undefined,
              sort: undefined,
            }}
            className="hover:text-foreground transition-colors"
            data-ocid="breadcrumb.category_link"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3 h-3 shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[160px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* LEFT — Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-3"
            data-ocid="product_detail.gallery"
          >
            {/* Main image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImg}
                  src={mainImgUrl}
                  alt={product.name}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
                />
              </AnimatePresence>

              {/* Discount badge */}
              {discount > 0 && (
                <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground font-bold text-sm px-3 py-1 rounded-full">
                  -{discount}%
                </Badge>
              )}

              {/* Wishlist button */}
              <button
                type="button"
                aria-label={
                  wishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
                onClick={handleToggleWishlist}
                className={cn(
                  "absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border shadow-md transition-smooth hover:scale-110",
                  wishlisted ? "text-destructive" : "text-muted-foreground",
                )}
                data-ocid="product_detail.wishlist_toggle"
              >
                <Heart
                  className={cn("w-5 h-5", wishlisted && "fill-current")}
                />
              </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {thumbnails.map((url, i) => (
                <button
                  key={`thumb-${i + 1}`}
                  type="button"
                  aria-label={`View image ${i + 1}`}
                  onClick={() => setActiveImg(i)}
                  className={cn(
                    "w-20 h-20 shrink-0 rounded-lg overflow-hidden border-2 transition-smooth hover:scale-105",
                    activeImg === i
                      ? "border-primary shadow-md"
                      : "border-border",
                  )}
                  data-ocid={`product_detail.thumbnail.${i + 1}`}
                >
                  <img
                    src={url}
                    alt={`Thumbnail ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-4"
            data-ocid="product_detail.info"
          >
            {/* Category tag */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="secondary"
                className="text-xs font-mono uppercase tracking-wider"
              >
                {product.category}
              </Badge>
              {product.hasFastDelivery && (
                <span
                  className="badge-fast-delivery"
                  data-ocid="product_detail.fast_delivery_badge"
                >
                  <Zap className="w-3 h-3" />
                  24–48 hr delivery
                </span>
              )}
              {product.isVerified && (
                <span
                  className="badge-verified"
                  data-ocid="product_detail.verified_badge"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified Seller
                </span>
              )}
            </div>

            {/* Product name */}
            <h1 className="text-2xl md:text-3xl font-display font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating row */}
            <div className="flex items-center gap-2 flex-wrap">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm font-semibold">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({Number(product.reviewCount)} reviews)
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span
                className="text-3xl font-display font-bold text-primary"
                data-ocid="product_detail.discounted_price"
              >
                {formatPrice(discounted)}
              </span>
              {discount > 0 && (
                <>
                  <span
                    className="text-lg text-muted-foreground line-through"
                    data-ocid="product_detail.original_price"
                  >
                    {formatPrice(price)}
                  </span>
                  <Badge className="bg-green-100 text-green-700 text-sm font-bold px-3 py-0.5 rounded-full border-0">
                    {discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Size selector (clothing only) */}
            {isClothing && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">
                  Size: <span className="text-primary">{selectedSize}</span>
                </p>
                <div
                  className="flex gap-2 flex-wrap"
                  data-ocid="product_detail.size_selector"
                >
                  {SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-11 h-11 rounded-lg border text-sm font-semibold transition-smooth hover:scale-105",
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-card hover:border-primary/60",
                      )}
                      data-ocid={`product_detail.size.${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">Quantity:</span>
              <div
                className="flex items-center border border-border rounded-lg overflow-hidden"
                data-ocid="product_detail.quantity_selector"
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                  disabled={quantity <= 1}
                  data-ocid="product_detail.quantity_decrease"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span
                  className="w-12 h-10 flex items-center justify-center font-bold text-sm border-x border-border"
                  data-ocid="product_detail.quantity_value"
                >
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQuantity((q) => Math.min(Number(product.stock), q + 1))
                  }
                  className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40"
                  disabled={quantity >= Number(product.stock)}
                  data-ocid="product_detail.quantity_increase"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">
                {Number(product.stock)} in stock
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                size="lg"
                onClick={handleAddToCart}
                className="flex-1 gap-2 font-bold text-base rounded-xl"
                data-ocid="product_detail.add_to_cart_button"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                asChild
                className="flex-1 font-bold text-base rounded-xl border-primary text-primary hover:bg-primary/5"
                data-ocid="product_detail.buy_now_button"
              >
                <Link to="/checkout">Buy Now</Link>
              </Button>
            </div>

            {/* Description accordion */}
            <div className="border border-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setDescOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-sm font-semibold"
                data-ocid="product_detail.description_toggle"
              >
                <span>Product Description</span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-300",
                    descOpen && "rotate-180",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {descOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                    data-ocid="product_detail.description_content"
                  >
                    <p className="px-4 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
                      {product.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Seller info card */}
            <div
              className="rounded-xl border border-border bg-card p-4 flex items-center gap-4"
              data-ocid="product_detail.seller_card"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm truncate">
                    {product.sellerName}
                  </span>
                  {product.isVerified && (
                    <span className="badge-verified text-[10px] py-0.5">
                      <CheckCircle className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3 inline mr-0.5" />
                  {product.city}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 text-xs"
                data-ocid="product_detail.view_seller_button"
              >
                View Seller
              </Button>
            </div>
          </motion.div>
        </div>

        {/* ── Reviews section ────────────────────────────────────────────────── */}
        <section className="mt-16" data-ocid="reviews.section">
          <h2 className="text-xl font-display font-bold mb-6">
            Customer Reviews
            {reviews.length > 0 && (
              <span className="text-muted-foreground font-normal text-base ml-2">
                ({reviews.length})
              </span>
            )}
          </h2>

          <div className="grid md:grid-cols-[280px_1fr] gap-8">
            {/* Rating summary */}
            <div
              className="bg-card border border-border rounded-2xl p-5 h-fit"
              data-ocid="reviews.summary_card"
            >
              <div className="text-center mb-4">
                <div className="text-5xl font-display font-bold text-primary">
                  {product.rating.toFixed(1)}
                </div>
                <StarRating rating={product.rating} size="md" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(product.reviewCount)} reviews
                </p>
              </div>
              <div className="space-y-2">
                {ratingCounts.map(({ star, count }) => (
                  <RatingBar
                    key={star}
                    star={star}
                    count={count}
                    total={reviews.length}
                  />
                ))}
              </div>
            </div>

            {/* Review list + form */}
            <div className="space-y-6">
              {/* Write a review (authenticated only) */}
              {isAuthenticated && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <WriteReviewForm productId={id} />
                </div>
              )}

              {/* Review list */}
              {reviews.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center py-12 text-center gap-3 bg-card border border-border rounded-2xl"
                  data-ocid="reviews.empty_state"
                >
                  <Star className="w-10 h-10 text-muted-foreground/30" />
                  <p className="font-semibold">No reviews yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to share your experience.
                  </p>
                </div>
              ) : (
                <div
                  className="bg-card border border-border rounded-2xl px-5 divide-y divide-border"
                  data-ocid="reviews.list"
                >
                  {reviews.map((review, i) => (
                    <ReviewCard key={review.id} review={review} index={i} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Related Products ───────────────────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-16" data-ocid="related_products.section">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">
                Related Products
              </h2>
              <Link
                to="/products"
                search={{
                  q: undefined,
                  category: product.category,
                  minPrice: undefined,
                  maxPrice: undefined,
                  sort: undefined,
                }}
                className="text-sm text-primary hover:underline font-medium"
                data-ocid="related_products.view_all_link"
              >
                View all in {product.category}
              </Link>
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin"
              data-ocid="related_products.scroll_row"
            >
              {related.map((p, i) => (
                <div key={p.id} className="shrink-0 w-48 sm:w-56 snap-start">
                  <ProductCard product={p} index={i + 1} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
