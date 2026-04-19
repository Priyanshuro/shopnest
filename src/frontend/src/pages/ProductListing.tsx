import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useNavigate, useSearch } from "@tanstack/react-router";
import {
  ChevronDown,
  FilterX,
  PackageSearch,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useProducts } from "../hooks/useProducts";
import type { Product } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortOption =
  | "price-asc"
  | "price-desc"
  | "rating"
  | "newest"
  | "relevance";

interface Filters {
  categories: string[];
  minPrice: string;
  maxPrice: string;
  rating: "all" | "3+" | "4+";
  fastDelivery: boolean;
}

const ALL_CATEGORIES = [
  "Shirts",
  "Dresses",
  "Jeans",
  "Shoes",
  "Hoodies",
  "Handbags",
  "Accessories",
];

const SORT_LABELS: Record<SortOption, string> = {
  relevance: "Relevance",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  rating: "Top Rated",
  newest: "Newest First",
};

// ─── Filter logic ─────────────────────────────────────────────────────────────

function applyFilters(products: Product[], filters: Filters): Product[] {
  return products.filter((p) => {
    if (
      filters.categories.length > 0 &&
      !filters.categories.includes(p.category)
    )
      return false;
    const price = Number(p.discountedPrice);
    if (filters.minPrice && price < Number(filters.minPrice)) return false;
    if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
    if (filters.rating === "4+" && p.rating < 4) return false;
    if (filters.rating === "3+" && p.rating < 3) return false;
    if (filters.fastDelivery && !p.hasFastDelivery) return false;
    return true;
  });
}

function applySort(products: Product[], sort: SortOption): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort(
        (a, b) => Number(a.discountedPrice) - Number(b.discountedPrice),
      );
    case "price-desc":
      return sorted.sort(
        (a, b) => Number(b.discountedPrice) - Number(a.discountedPrice),
      );
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    default:
      return sorted;
  }
}

// ─── Filter Panel (shared between sidebar & drawer) ───────────────────────────

interface FilterPanelProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  onApply?: () => void;
  onClear: () => void;
}

function FilterPanel({
  filters,
  onChange,
  onApply,
  onClear,
}: FilterPanelProps) {
  function toggleCategory(cat: string) {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-base text-foreground">
          Filters
        </h2>
        <button
          type="button"
          onClick={onClear}
          data-ocid="filter.clear_all_button"
          className="text-xs text-primary hover:underline font-medium transition-colors"
        >
          Clear All
        </button>
      </div>

      <Separator />

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold font-display text-foreground">
          Category
        </p>
        <div className="flex flex-col gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat}`}
                checked={filters.categories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
                data-ocid={`filter.category_${cat.toLowerCase()}`}
              />
              <Label
                htmlFor={`cat-${cat}`}
                className="text-sm cursor-pointer text-foreground"
              >
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price range */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold font-display text-foreground">
          Price Range
        </p>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ₹
            </span>
            <Input
              type="number"
              placeholder="Min"
              min={0}
              value={filters.minPrice}
              onChange={(e) =>
                onChange({ ...filters, minPrice: e.target.value })
              }
              className="pl-6 text-sm"
              data-ocid="filter.min_price_input"
            />
          </div>
          <span className="text-muted-foreground text-sm">–</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ₹
            </span>
            <Input
              type="number"
              placeholder="Max"
              min={0}
              value={filters.maxPrice}
              onChange={(e) =>
                onChange({ ...filters, maxPrice: e.target.value })
              }
              className="pl-6 text-sm"
              data-ocid="filter.max_price_input"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold font-display text-foreground">
          Rating
        </p>
        {(
          [
            { value: "all", label: "All Ratings" },
            { value: "3+", label: "3★ & above" },
            { value: "4+", label: "4★ & above" },
          ] as { value: Filters["rating"]; label: string }[]
        ).map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <input
              type="radio"
              id={`rating-${value}`}
              name="rating"
              value={value}
              checked={filters.rating === value}
              onChange={() => onChange({ ...filters, rating: value })}
              className="accent-primary w-4 h-4 cursor-pointer"
              data-ocid={`filter.rating_${value}`}
            />
            <Label
              htmlFor={`rating-${value}`}
              className="text-sm cursor-pointer text-foreground"
            >
              {label}
            </Label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Fast delivery toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <Label
            htmlFor="fast-delivery"
            className="text-sm font-semibold font-display cursor-pointer text-foreground"
          >
            Fast Delivery
          </Label>
          <span className="text-xs text-muted-foreground">24–48 hrs only</span>
        </div>
        <Switch
          id="fast-delivery"
          checked={filters.fastDelivery}
          onCheckedChange={(v) => onChange({ ...filters, fastDelivery: v })}
          data-ocid="filter.fast_delivery_toggle"
        />
      </div>

      {/* Apply button (used inside drawer) */}
      {onApply && (
        <>
          <Separator />
          <Button
            type="button"
            onClick={onApply}
            className="btn-primary w-full rounded-xl"
            data-ocid="filter.apply_button"
          >
            Apply Filters
          </Button>
        </>
      )}
    </div>
  );
}

// ─── Loading Skeletons ────────────────────────────────────────────────────────

function ProductSkeletons() {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      data-ocid="product.loading_state"
    >
      {["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map((id) => (
        <div
          key={id}
          className="bg-card rounded-2xl overflow-hidden border border-border/40 card-shadow"
        >
          <Skeleton className="aspect-[4/5] w-full" />
          <div className="p-3 flex flex-col gap-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-full mt-1" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 gap-5 text-center"
      data-ocid="product.empty_state"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
        <PackageSearch className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display font-bold text-xl text-foreground">
          No products found
        </p>
        <p className="text-muted-foreground text-sm max-w-xs">
          Try adjusting your filters or browse all categories.
        </p>
      </div>
      <Button
        type="button"
        onClick={onClear}
        variant="outline"
        className="gap-2 rounded-xl"
        data-ocid="product.clear_filters_button"
      >
        <FilterX className="w-4 h-4" />
        Clear Filters
      </Button>
    </div>
  );
}

// ─── Active filter chips ───────────────────────────────────────────────────────

function ActiveFilterChips({
  filters,
  sort,
  onChange,
}: {
  filters: Filters;
  sort: SortOption;
  onChange: (f: Filters) => void;
}) {
  const chips: { label: string; onRemove: () => void }[] = [];

  for (const cat of filters.categories) {
    chips.push({
      label: cat,
      onRemove: () =>
        onChange({
          ...filters,
          categories: filters.categories.filter((c) => c !== cat),
        }),
    });
  }

  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      label: `₹${filters.minPrice || "0"} – ₹${filters.maxPrice || "∞"}`,
      onRemove: () => onChange({ ...filters, minPrice: "", maxPrice: "" }),
    });
  }

  if (filters.rating !== "all") {
    chips.push({
      label: `${filters.rating} rated`,
      onRemove: () => onChange({ ...filters, rating: "all" }),
    });
  }

  if (filters.fastDelivery) {
    chips.push({
      label: "Fast Delivery",
      onRemove: () => onChange({ ...filters, fastDelivery: false }),
    });
  }

  if (sort !== "relevance") {
    chips.push({
      label: SORT_LABELS[sort],
      onRemove: () => {},
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" data-ocid="filter.active_chips">
      {chips.map((chip) => (
        <Badge
          key={chip.label}
          variant="secondary"
          className="gap-1 pr-1 rounded-full font-normal text-xs"
        >
          {chip.label}
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove ${chip.label} filter`}
            className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-foreground/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

// ─── ProductListing page ──────────────────────────────────────────────────────

export default function ProductListing() {
  const search = useSearch({ from: "/products" });
  const navigate = useNavigate();

  // URL-sourced initial category
  const urlCategory = (search as { category?: string }).category ?? "";

  const [filters, setFilters] = useState<Filters>({
    categories: urlCategory ? [urlCategory] : [],
    minPrice: "",
    maxPrice: "",
    rating: "all",
    fastDelivery: false,
  });

  const [sort, setSort] = useState<SortOption>("relevance");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  // Fetch all products (client-side filtering)
  const { data: allProducts = [], isLoading } = useProducts();

  const filteredAndSorted = useMemo(() => {
    const filtered = applyFilters(allProducts, filters);
    return applySort(filtered, sort);
  }, [allProducts, filters, sort]);

  const clearFilters = useCallback(() => {
    const empty: Filters = {
      categories: [],
      minPrice: "",
      maxPrice: "",
      rating: "all",
      fastDelivery: false,
    };
    setFilters(empty);
    setPendingFilters(empty);
    void navigate({
      to: "/products",
      search: {
        q: undefined,
        category: undefined,
        minPrice: undefined,
        maxPrice: undefined,
        sort: undefined,
      },
    });
  }, [navigate]);

  function applyDrawerFilters() {
    setFilters(pendingFilters);
    setDrawerOpen(false);
  }

  // Sync pending filters when drawer opens
  function handleDrawerOpen(open: boolean) {
    if (open) setPendingFilters(filters);
    setDrawerOpen(open);
  }

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.rating !== "all" ||
    filters.fastDelivery;

  return (
    <div className="min-h-screen bg-background">
      {/* Page header strip */}
      <div className="bg-card border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-xl text-foreground truncate">
              {filters.categories.length === 1
                ? filters.categories[0]
                : "All Products"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Affordable fashion from local sellers near you
            </p>
          </div>

          {/* Mobile: filter trigger */}
          <Sheet open={drawerOpen} onOpenChange={handleDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="md:hidden gap-2 rounded-xl shrink-0"
                data-ocid="filter.open_modal_button"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-72 p-5 overflow-y-auto"
              data-ocid="filter.dialog"
            >
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="font-display">
                  Filter Products
                </SheetTitle>
              </SheetHeader>
              <FilterPanel
                filters={pendingFilters}
                onChange={setPendingFilters}
                onApply={applyDrawerFilters}
                onClear={() => {
                  const empty: Filters = {
                    categories: [],
                    minPrice: "",
                    maxPrice: "",
                    rating: "all",
                    fastDelivery: false,
                  };
                  setPendingFilters(empty);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* ── Desktop sidebar ── */}
          <aside className="hidden md:block w-56 shrink-0">
            <div className="sticky top-6 bg-card border border-border/50 rounded-2xl p-5 card-shadow">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Topbar: count + sort + active chips */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <p
                  className="text-sm text-muted-foreground"
                  data-ocid="product.result_count"
                >
                  {isLoading ? (
                    <Skeleton className="h-4 w-32 inline-block" />
                  ) : (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {filteredAndSorted.length}
                      </span>{" "}
                      product{filteredAndSorted.length !== 1 ? "s" : ""}
                    </>
                  )}
                </p>

                {/* Sort */}
                <Select
                  value={sort}
                  onValueChange={(v) => setSort(v as SortOption)}
                >
                  <SelectTrigger
                    className="w-40 h-9 text-sm rounded-xl"
                    data-ocid="product.sort_select"
                  >
                    <ChevronDown className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
                      <SelectItem key={key} value={key}>
                        {SORT_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active chips (desktop inline; mobile below topbar) */}
              <ActiveFilterChips
                filters={filters}
                sort={sort}
                onChange={setFilters}
              />
            </div>

            {/* Fast delivery promo bar */}
            {!filters.fastDelivery && !isLoading && allProducts.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  setFilters((f) => ({ ...f, fastDelivery: true }))
                }
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium transition-smooth hover:bg-accent/15 w-fit"
                data-ocid="filter.fast_delivery_promo"
              >
                <Zap className="w-4 h-4" />
                Show only 24–48 hr fast delivery products
              </button>
            )}

            {/* Grid / loading / empty */}
            {isLoading ? (
              <ProductSkeletons />
            ) : filteredAndSorted.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                data-ocid="product.list"
              >
                {filteredAndSorted.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
