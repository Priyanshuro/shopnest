import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { useCartStore } from "../store/cartStore";
import { useWishlistStore } from "../store/wishlistStore";

// ─── Theme toggle ─────────────────────────────────────────────────────────────

function useTheme() {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("shopnest-theme", next ? "dark" : "light");
  };
  useEffect(() => {
    const stored = localStorage.getItem("shopnest-theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  }, []);
  return { isDark, toggle };
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      void router.navigate({
        to: "/products",
        search: {
          q: query.trim(),
          category: undefined,
          minPrice: undefined,
          maxPrice: undefined,
          sort: undefined,
        },
      });
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center bg-input border border-border rounded-full overflow-hidden",
        className,
      )}
    >
      <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
      <input
        data-ocid="navbar.search_input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search fashion, brands…"
        className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </form>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <Button
        data-ocid="navbar.login_button"
        onClick={login}
        disabled={isInitializing || isLoggingIn}
        size="sm"
        className="btn-primary rounded-full text-xs px-4 py-2"
      >
        {isInitializing ? "Loading…" : isLoggingIn ? "Signing in…" : "Login"}
      </Button>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        data-ocid="navbar.user_menu"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-muted transition-smooth"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div
          data-ocid="navbar.user_dropdown_menu"
          className="absolute right-0 top-11 w-52 bg-card border border-border rounded-2xl shadow-xl z-50 py-2 overflow-hidden"
        >
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-smooth"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            My Profile
          </Link>
          <Link
            to="/orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-smooth"
          >
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
            My Orders
          </Link>
          <Link
            to="/seller"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted transition-smooth"
          >
            <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
            Seller Dashboard
          </Link>
          <div className="my-1 border-t border-border" />
          <button
            type="button"
            data-ocid="navbar.logout_button"
            onClick={() => {
              clear();
              queryClient.clear();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-smooth"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const { isDark, toggle } = useTheme();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border shadow-sm">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-center text-xs py-1.5 px-4 flex items-center justify-center gap-2">
        <Zap className="w-3 h-3" />
        <span>
          Free delivery on orders above ₹499 • 24-48 hr fast delivery from local
          sellers
        </span>
        <MapPin className="w-3 h-3" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link
            to="/"
            data-ocid="navbar.logo_link"
            className="flex items-center gap-2 shrink-0 group"
          >
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-smooth">
              <ShoppingBag className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-foreground">
              ShopNest
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            <Link
              to="/"
              data-ocid="navbar.home_link"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              Home
            </Link>
            <Link
              to="/products"
              search={{
                q: undefined,
                category: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sort: undefined,
              }}
              data-ocid="navbar.products_link"
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              Products
            </Link>
          </nav>

          {/* Search */}
          <SearchBar className="hidden md:flex flex-1 mx-4 max-w-md" />

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Wishlist */}
            <Link
              to="/profile"
              data-ocid="navbar.wishlist_button"
              className="relative p-2 rounded-full hover:bg-muted transition-smooth"
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
              {wishlistCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground border-0 flex items-center justify-center">
                  {wishlistCount}
                </Badge>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              data-ocid="navbar.cart_button"
              className="relative p-2 rounded-full hover:bg-muted transition-smooth"
            >
              <ShoppingBag className="w-5 h-5 text-muted-foreground" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] bg-primary text-primary-foreground border-0 flex items-center justify-center">
                  {totalItems}
                </Badge>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              type="button"
              data-ocid="navbar.theme_toggle"
              onClick={toggle}
              className="p-2 rounded-full hover:bg-muted transition-smooth"
              aria-label={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* User menu */}
            <UserMenu />

            {/* Mobile hamburger */}
            <button
              type="button"
              data-ocid="navbar.mobile_menu_button"
              onClick={() => setMobileOpen((o) => !o)}
              className="md:hidden p-2 rounded-full hover:bg-muted transition-smooth"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchBar className="w-full" />
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          data-ocid="navbar.mobile_menu"
          className="md:hidden border-t border-border bg-card"
        >
          <nav className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              Home
            </Link>
            <Link
              to="/products"
              search={{
                q: undefined,
                category: undefined,
                minPrice: undefined,
                maxPrice: undefined,
                sort: undefined,
              }}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
              activeProps={{ className: "text-primary bg-primary/10" }}
            >
              Products
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-4.5 h-4.5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">ShopNest</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Connecting verified local sellers in Tier-2 & Tier-3 cities with
              young digital shoppers. Affordable fashion, fast delivery, trusted
              sellers.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Hyperlocal delivery across 500+ cities</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-display font-semibold text-sm mb-3">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "New Arrivals",
                "Trending Styles",
                "Offers & Deals",
                "Brands",
              ].map((item) => (
                <li key={item}>
                  <Link
                    to="/products"
                    search={{
                      q: undefined,
                      category: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      sort: undefined,
                    }}
                    className="hover:text-primary transition-smooth"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm mb-3">Help</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {[
                "About ShopNest",
                "Become a Seller",
                "Order Tracking",
                "Returns & Refunds",
              ].map((item) => (
                <li key={item}>
                  <span className="hover:text-primary transition-smooth cursor-pointer">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© {year} ShopNest. All rights reserved.</span>
          <span>
            Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
