import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Package,
  RotateCcw,
  ShieldCheck,
  Store,
  Truck,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { ProductCard } from "../components/ProductCard";
import { useFeaturedProducts, useVerifiedSellers } from "../hooks/useProducts";
import type { Seller } from "../types";

// ─── Shared search params helper ──────────────────────────────────────────────

const emptySearch = {
  q: undefined as string | undefined,
  category: undefined as string | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
  sort: undefined as string | undefined,
};

function categorySearch(category: string) {
  return { ...emptySearch, category };
}

// ─── Static data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  {
    label: "All",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=200&q=60",
  },
  {
    label: "Shirts",
    image:
      "https://images.unsplash.com/photo-1604695573706-53170668f6a6?w=200&q=60",
  },
  {
    label: "Dresses",
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=200&q=60",
  },
  {
    label: "Jeans",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&q=60",
  },
  {
    label: "Shoes",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=60",
  },
  {
    label: "Hoodies",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=200&q=60",
  },
  {
    label: "Handbags",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&q=60",
  },
];

const TRENDING_STYLES = [
  {
    label: "Boho Summer",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=70",
  },
  {
    label: "Street Style",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=70",
  },
  {
    label: "Work Formals",
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4b4468?w=400&q=70",
  },
  {
    label: "Casual Chic",
    image:
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=400&q=70",
  },
];

const TRUST_ITEMS = [
  { icon: RotateCcw, label: "Free Returns", desc: "Within 7 days" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected" },
  { icon: CheckCircle, label: "Verified Sellers", desc: "10K+ trusted shops" },
  { icon: Truck, label: "Fast Delivery", desc: "24-48 hours" },
];

// ─── Seller image helper ──────────────────────────────────────────────────────

const SELLER_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=400&q=70",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&q=70",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=70",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&q=70",
];

function getSellerImage(seller: Seller, idx: number): string {
  const img = seller.shopImage;
  if (typeof img === "string" && img.startsWith("http")) return img;
  return SELLER_FALLBACK_IMAGES[idx % SELLER_FALLBACK_IMAGES.length];
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }, (_, i) => `skeleton-product-${i}`).map(
        (id) => (
          <div
            key={id}
            className="rounded-xl overflow-hidden border border-border"
          >
            <Skeleton className="aspect-[4/5] w-full" />
            <div className="p-3 space-y-2">
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-8 w-full mt-2" />
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function SellerGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }, (_, i) => `skeleton-seller-${i}`).map((id) => (
        <div
          key={id}
          className="rounded-xl overflow-hidden border border-border"
        >
          <Skeleton className="aspect-[4/3] w-full" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-8 w-full mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Home page ────────────────────────────────────────────────────────────────

export default function Home() {
  const navigate = useNavigate();
  const { data: featuredProducts, isLoading: loadingProducts } =
    useFeaturedProducts();
  const { data: verifiedSellers, isLoading: loadingSellers } =
    useVerifiedSellers();

  return (
    <div className="flex flex-col" data-ocid="home.page">
      {/* 1. HERO */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
        data-ocid="home.hero.section"
      >
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&q=85"
          alt="Young shoppers enjoying fashion"
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/20" />

        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center gap-6">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge className="mb-4 bg-primary/90 text-primary-foreground border-primary/30 px-4 py-1.5 text-xs tracking-widest uppercase">
              <Zap className="w-3 h-3 mr-1" />
              Hyperlocal Fashion Platform
            </Badge>
            <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
              Affordable Fashion{" "}
              <span className="text-primary">from Local Sellers</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="text-xl md:text-2xl text-white/80 font-body max-w-xl"
          >
            Shop Smart. Shop Local.{" "}
            <span className="font-semibold text-white">ShopNest.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button
              type="button"
              size="lg"
              onClick={() => navigate({ to: "/products", search: emptySearch })}
              className="rounded-full px-8 py-3 font-display font-bold text-base hover:scale-105 transition-smooth shadow-lg"
              data-ocid="home.hero.explore_button"
            >
              Explore Now
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={() => navigate({ to: "/seller" })}
              className="rounded-full px-8 py-3 font-display font-bold text-base bg-transparent border-2 border-white text-white hover:bg-white hover:text-foreground hover:scale-105 transition-smooth"
              data-ocid="home.hero.start_selling_button"
            >
              <Store className="mr-2 w-4 h-4" />
              Start Selling
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-4"
          >
            {[
              { icon: Store, text: "10K+ Sellers" },
              { icon: Package, text: "2M+ Products" },
              { icon: Truck, text: "24-48hr Delivery" },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-white/90 text-sm font-medium"
              >
                <Icon className="w-4 h-4 text-primary" />
                {text}
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 2. CATEGORY STRIP */}
      <section className="py-6 px-4 bg-card border-b border-border overflow-hidden">
        <div
          className="flex gap-3 overflow-x-auto pb-1"
          data-ocid="home.category.list"
        >
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              to="/products"
              search={
                cat.label === "All" ? emptySearch : categorySearch(cat.label)
              }
              className="shrink-0 group"
              data-ocid="home.category.item"
            >
              <div className="relative flex flex-col items-center gap-2">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-primary transition-smooth">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-smooth" />
                </div>
                <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS */}
      <section
        className="py-12 px-4 bg-background"
        data-ocid="home.featured.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display font-bold text-2xl md:text-3xl">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Curated picks from top local sellers
              </p>
            </div>
            <Link
              to="/products"
              search={emptySearch}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              data-ocid="home.featured.view_all_link"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <ProductGridSkeleton />
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {featuredProducts.slice(0, 8).map((product, i) => (
                <motion.div
                  key={product.id}
                  variants={{
                    hidden: { opacity: 0, y: 24 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.4 },
                    },
                  }}
                >
                  <ProductCard product={product} index={i + 1} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="home.featured.empty_state"
            >
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Products loading soon</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. TOP LOCAL SELLERS */}
      <section
        className="py-12 px-4 bg-muted/30"
        data-ocid="home.sellers.section"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl md:text-3xl">
              Top Local Sellers
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Verified shops near you
            </p>
          </div>

          {loadingSellers ? (
            <SellerGridSkeleton />
          ) : verifiedSellers && verifiedSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {verifiedSellers.slice(0, 8).map((seller, i) => (
                <motion.div
                  key={seller.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="group rounded-xl overflow-hidden bg-card border border-border card-shadow hover:shadow-lg transition-smooth"
                  data-ocid={`home.seller.item.${i + 1}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getSellerImage(seller, i)}
                      alt={seller.shopName}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {seller.isVerified && (
                      <span className="absolute top-2 left-2 badge-verified shadow-sm">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-display font-semibold text-sm truncate">
                      {seller.shopName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {seller.city}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {Number(seller.totalSales).toLocaleString("en-IN")} sales
                    </p>
                    <Link
                      to="/products"
                      search={emptySearch}
                      className="mt-2 block"
                      data-ocid={`home.seller.view_products.${i + 1}`}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                      >
                        View Products
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="home.sellers.empty_state"
            >
              <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Sellers loading soon</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. TRENDING STYLES BANNER */}
      <section
        className="relative py-20 px-4 overflow-hidden"
        data-ocid="home.trending.section"
      >
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=80"
          alt="Trending fashion"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-primary/90 text-primary-foreground px-4 py-1 text-xs tracking-widest uppercase">
              New Arrivals
            </Badge>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-white">
              Trending This Season
            </h2>
            <Link
              to="/products"
              search={emptySearch}
              data-ocid="home.trending.shop_the_look_button"
            >
              <Button
                type="button"
                size="lg"
                className="mt-6 rounded-full px-8 font-display font-bold hover:scale-105 transition-smooth"
              >
                Shop the Look
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            {TRENDING_STYLES.map((style, i) => (
              <motion.div
                key={style.label}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="shrink-0 w-48 md:w-56 rounded-xl overflow-hidden group cursor-pointer"
                data-ocid={`home.trending.item.${i + 1}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.label}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-3 right-3 text-white font-display font-bold text-sm">
                    {style.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. OFFERS SECTION */}
      <section
        className="py-12 px-4 bg-background"
        data-ocid="home.offers.section"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-6">
            Hot Deals &amp; Offers
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative rounded-2xl overflow-hidden h-52 cursor-pointer hover:scale-105 transition-smooth"
              data-ocid="home.offer.item.1"
            >
              <img
                src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80"
                alt="Dresses sale"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600/80 via-rose-500/60 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-center px-8">
                <p className="text-white/90 text-sm font-medium uppercase tracking-wider">
                  Limited Time
                </p>
                <h3 className="font-display font-bold text-4xl text-white leading-tight">
                  Up to 50% OFF
                </h3>
                <p className="text-white/80 text-lg mt-1">on Dresses</p>
                <Link
                  to="/products"
                  search={categorySearch("Dresses")}
                  data-ocid="home.offer.shop_now.1"
                >
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 rounded-full bg-white text-pink-700 font-bold hover:bg-white/90 w-fit"
                  >
                    Shop Now
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative rounded-2xl overflow-hidden h-52 cursor-pointer hover:scale-105 transition-smooth"
              data-ocid="home.offer.item.2"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary via-amber-600 to-orange-400" />
              <div className="relative z-10 h-full flex flex-col justify-center px-8">
                <p className="text-white/90 text-sm font-medium uppercase tracking-wider">
                  New Customers
                </p>
                <h3 className="font-display font-bold text-4xl text-white leading-tight">
                  Flat 20% OFF
                </h3>
                <p className="text-white/80 text-lg mt-1">
                  on your first order
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="bg-white/20 border border-white/30 rounded-lg px-4 py-1.5">
                    <p className="text-white font-mono font-bold tracking-widest text-sm">
                      SHOPNEST20
                    </p>
                  </div>
                  <span className="text-white/70 text-xs">Use at checkout</span>
                </div>
                <Link
                  to="/products"
                  search={emptySearch}
                  data-ocid="home.offer.shop_now.2"
                >
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 rounded-full bg-white text-primary font-bold hover:bg-white/90 w-fit"
                  >
                    Shop Now
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 7. TRUST STRIP */}
      <section
        className="py-10 px-4 bg-muted/30 border-t border-border"
        data-ocid="home.trust.section"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <p className="font-display font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
