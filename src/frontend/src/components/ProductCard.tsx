import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { CheckCircle, Heart, ShoppingCart, Star, Zap } from "lucide-react";
import { formatPrice, getDiscountPercent } from "../lib/utils";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";
import type { Product } from "../types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns the best URL string for a product image */
function getProductImageUrl(product: Product): string {
  if (product.images.length > 0) {
    const img = product.images[0];
    // images are strings in the backend type
    if (typeof img === "string" && img.length > 0) return img;
  }
  // Category-matched fallback images (Unsplash, exact match)
  const fallbacks: Record<string, string> = {
    Shirts:
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=600&q=80",
    Dresses:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
    Jeans:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    Shoes:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    Hoodies:
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
    Handbags:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
    Sarees:
      "https://images.unsplash.com/photo-1610030460040-d06b0b21ef0f?w=600&q=80",
    Kurtas:
      "https://images.unsplash.com/photo-1597248374161-426f0d6d2fc9?w=600&q=80",
  };
  return (
    fallbacks[product.category] ??
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"
  );
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 1 }: ProductCardProps) {
  const { toggle, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const price = Number(product.price);
  const discounted = Number(product.discountedPrice);
  const discount = getDiscountPercent(price, discounted);
  const wishlisted = isInWishlist(product.id);
  const imageUrl = getProductImageUrl(product);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: discounted,
      image: imageUrl,
      quantity: 1,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
    });
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      productId: product.id,
      name: product.name,
      price,
      discountedPrice: discounted,
      image: imageUrl,
      category: product.category,
      isVerified: product.isVerified,
    });
  }

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group block rounded-xl overflow-hidden bg-card border border-border card-shadow hover:shadow-lg transition-smooth"
      data-ocid={`product.item.${index}`}
    >
      {/* Image area */}
      <div className="relative overflow-hidden aspect-[4/5] bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Discount badge — top left */}
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[11px] font-bold px-2 py-0.5 rounded-full">
            -{discount}%
          </Badge>
        )}

        {/* Fast delivery — top right */}
        <div className="absolute top-2 right-10">
          {product.hasFastDelivery && (
            <span className="badge-fast-delivery shadow-sm">
              <Zap className="w-3 h-3" />
              Fast
            </span>
          )}
        </div>

        {/* Wishlist heart — far top right */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-card/80 backdrop-blur-sm border border-border transition-smooth hover:scale-110",
            wishlisted ? "text-destructive" : "text-muted-foreground",
          )}
          data-ocid={`product.wishlist_toggle.${index}`}
        >
          <Heart className={cn("w-4 h-4", wishlisted && "fill-current")} />
        </button>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1">
        {/* Category */}
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide truncate">
          {product.category}
        </p>

        {/* Name */}
        <p className="text-sm font-display font-semibold line-clamp-2 leading-snug min-w-0">
          {product.name}
        </p>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-base font-bold text-primary">
            {formatPrice(discounted)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(price)}
            </span>
          )}
        </div>

        {/* Seller + verified */}
        <div className="flex items-center gap-1 mt-0.5">
          {product.isVerified && (
            <CheckCircle className="w-3.5 h-3.5 text-green-600 shrink-0" />
          )}
          <span className="text-[11px] text-muted-foreground truncate">
            {product.sellerName}
          </span>
          <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
            {product.city}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-medium">
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            ({Number(product.reviewCount)})
          </span>
        </div>

        {/* Add to cart */}
        <Button
          type="button"
          size="sm"
          onClick={handleAddToCart}
          className="mt-2 w-full gap-2 rounded-lg text-xs font-semibold"
          data-ocid={`product.add_to_cart.${index}`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          Add to Cart
        </Button>
      </div>
    </Link>
  );
}
