import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock,
  IndianRupee,
  LayoutDashboard,
  Package,
  Search,
  Shield,
  ShoppingCart,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useAdminStats,
  useAnalytics,
  useProducts,
  useSellers,
  useVerifySeller,
} from "../hooks/useProducts";
import type { Product, Seller } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId =
  | "overview"
  | "sellers"
  | "products"
  | "orders"
  | "users"
  | "revenue";

// Local mock seller type uses string shopImage (matches backend.d.ts reality)
type MockSeller = Omit<Seller, "shopImage"> & { shopImage: string };
// ─── Mock fallback data ───────────────────────────────────────────────────────

const MONTHS = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

const MOCK_ORDERS = [
  {
    id: "ORD-1042",
    customer: "Priya Sharma",
    amount: 2499,
    status: "delivered",
    city: "Jaipur",
    items: 3,
  },
  {
    id: "ORD-1041",
    customer: "Rahul Verma",
    amount: 1899,
    status: "shipped",
    city: "Surat",
    items: 2,
  },
  {
    id: "ORD-1040",
    customer: "Anjali Patel",
    amount: 3299,
    status: "confirmed",
    city: "Nagpur",
    items: 4,
  },
  {
    id: "ORD-1039",
    customer: "Vikram Singh",
    amount: 899,
    status: "pending",
    city: "Kanpur",
    items: 1,
  },
  {
    id: "ORD-1038",
    customer: "Meera Nair",
    amount: 4599,
    status: "delivered",
    city: "Indore",
    items: 5,
  },
];

const MOCK_USERS = [
  {
    id: "U001",
    name: "Priya Sharma",
    role: "customer",
    joined: "Jan 15, 2025",
    orders: 12,
    status: "active",
  },
  {
    id: "U002",
    name: "Rahul Verma",
    role: "customer",
    joined: "Feb 3, 2025",
    orders: 7,
    status: "active",
  },
  {
    id: "U003",
    name: "Anjali Patel",
    role: "seller",
    joined: "Dec 22, 2024",
    orders: 23,
    status: "active",
  },
  {
    id: "U004",
    name: "Vikram Singh",
    role: "customer",
    joined: "Mar 10, 2025",
    orders: 3,
    status: "suspended",
  },
  {
    id: "U005",
    name: "Meera Nair",
    role: "customer",
    joined: "Feb 28, 2025",
    orders: 9,
    status: "active",
  },
  {
    id: "U006",
    name: "Deepak Kumar",
    role: "seller",
    joined: "Jan 5, 2025",
    orders: 44,
    status: "active",
  },
];

const MOCK_MONTHLY = [
  { month: "Nov 2024", revenue: 142000, commission: 21300, net: 120700 },
  { month: "Dec 2024", revenue: 198000, commission: 29700, net: 168300 },
  { month: "Jan 2025", revenue: 224000, commission: 33600, net: 190400 },
  { month: "Feb 2025", revenue: 187000, commission: 28050, net: 158950 },
  { month: "Mar 2025", revenue: 251000, commission: 37650, net: 213350 },
  { month: "Apr 2025", revenue: 312000, commission: 46800, net: 265200 },
];

const MOCK_SELLERS: MockSeller[] = [
  {
    id: "S001",
    shopName: "Riya Fashion Hub",
    name: "Riya Desai",
    city: "Surat",
    isVerified: true,
    joinedAt: BigInt(1704067200000),
    totalSales: BigInt(124500),
    commissionRate: 0.15,
    description: "Trendy women's wear",
    pincode: "395001",
    shopImage: "",
  },
  {
    id: "S002",
    shopName: "Jaipur Threads",
    name: "Arjun Mehta",
    city: "Jaipur",
    isVerified: true,
    joinedAt: BigInt(1706745600000),
    totalSales: BigInt(89200),
    commissionRate: 0.15,
    description: "Rajasthani ethnic wear",
    pincode: "302001",
    shopImage: "",
  },
  {
    id: "S003",
    shopName: "NagpurFit Store",
    name: "Kavita Rao",
    city: "Nagpur",
    isVerified: false,
    joinedAt: BigInt(1709251200000),
    totalSales: BigInt(0),
    commissionRate: 0.15,
    description: "Sportswear & activewear",
    pincode: "440001",
    shopImage: "",
  },
  {
    id: "S004",
    shopName: "KanpurKloset",
    name: "Suresh Gupta",
    city: "Kanpur",
    isVerified: false,
    joinedAt: BigInt(1711929600000),
    totalSales: BigInt(0),
    commissionRate: 0.15,
    description: "Men's formal collection",
    pincode: "208001",
    shopImage: "",
  },
  {
    id: "S005",
    shopName: "Indore Styles",
    name: "Pooja Sharma",
    city: "Indore",
    isVerified: true,
    joinedAt: BigInt(1707350400000),
    totalSales: BigInt(67800),
    commissionRate: 0.15,
    description: "Designer kurtis & lehengas",
    pincode: "452001",
    shopImage: "",
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "P001",
    name: "Men's Oxford Formal Shirt",
    category: "Shirts",
    sellerName: "Riya Fashion Hub",
    sellerId: "S001",
    price: BigInt(1499),
    discountedPrice: BigInt(1199),
    stock: BigInt(45),
    rating: 4.3,
    reviewCount: BigInt(28),
    isVerified: true,
    hasFastDelivery: true,
    city: "Surat",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
  {
    id: "P002",
    name: "Women's Floral Midi Dress",
    category: "Dresses",
    sellerName: "Jaipur Threads",
    sellerId: "S002",
    price: BigInt(2299),
    discountedPrice: BigInt(1849),
    stock: BigInt(32),
    rating: 4.6,
    reviewCount: BigInt(54),
    isVerified: true,
    hasFastDelivery: true,
    city: "Jaipur",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
  {
    id: "P003",
    name: "Blue Slim Fit Denim Jeans",
    category: "Jeans",
    sellerName: "NagpurFit Store",
    sellerId: "S003",
    price: BigInt(1899),
    discountedPrice: BigInt(1499),
    stock: BigInt(0),
    rating: 4.1,
    reviewCount: BigInt(19),
    isVerified: false,
    hasFastDelivery: false,
    city: "Nagpur",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
  {
    id: "P004",
    name: "Classic White Sneakers",
    category: "Shoes",
    sellerName: "Indore Styles",
    sellerId: "S005",
    price: BigInt(2799),
    discountedPrice: BigInt(2499),
    stock: BigInt(18),
    rating: 4.5,
    reviewCount: BigInt(37),
    isVerified: true,
    hasFastDelivery: true,
    city: "Indore",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
  {
    id: "P005",
    name: "Casual Unisex Hoodie",
    category: "Hoodies",
    sellerName: "NagpurFit Store",
    sellerId: "S003",
    price: BigInt(1699),
    discountedPrice: BigInt(1399),
    stock: BigInt(61),
    rating: 4.2,
    reviewCount: BigInt(15),
    isVerified: false,
    hasFastDelivery: false,
    city: "Nagpur",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
  {
    id: "P006",
    name: "Embroidered Ethnic Kurta",
    category: "Ethnic Wear",
    sellerName: "KanpurKloset",
    sellerId: "S004",
    price: BigInt(1299),
    discountedPrice: BigInt(999),
    stock: BigInt(27),
    rating: 4.7,
    reviewCount: BigInt(42),
    isVerified: false,
    hasFastDelivery: true,
    city: "Kanpur",
    description: "",
    createdAt: BigInt(0),
    images: [],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: bigint | number): string {
  const val = typeof n === "bigint" ? Number(n) : n;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val}`;
}

function formatDate(ts: bigint): string {
  return new Date(Number(ts)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  delivered:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  confirmed:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  pending:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  active:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  suspended: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  sub,
  loading,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <Card className="card-shadow">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-body mb-1">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-display font-bold text-foreground truncate">
                {value}
              </p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            )}
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Tab: Overview ────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();

  const monthlyData = useMemo(() => {
    const raw = analytics?.monthlyRevenue ?? [];
    return MONTHS.map((m, i) => ({
      month: m,
      revenue:
        raw[i] !== undefined
          ? Number(raw[i]) / 100
          : (MOCK_MONTHLY[i]?.revenue ?? 0),
      commission:
        raw[i] !== undefined
          ? Math.round((Number(raw[i]) * 0.15) / 100)
          : (MOCK_MONTHLY[i]?.commission ?? 0),
    }));
  }, [analytics]);

  const categoryData = useMemo(() => {
    const cats = analytics?.topCategories ?? [];
    if (cats.length > 0)
      return cats.map(([name, val]) => ({ name, value: Number(val) }));
    return [
      { name: "Dresses", value: 3420 },
      { name: "Shirts", value: 2870 },
      { name: "Jeans", value: 2210 },
      { name: "Shoes", value: 1890 },
      { name: "Ethnic", value: 1540 },
    ];
  }, [analytics]);

  const totalRevenue = stats ? Number(stats.totalRevenue) / 100 : 1314000;
  const totalOrders = stats ? Number(stats.totalOrders) : 3892;
  const totalCommission = stats ? Number(stats.totalCommission) / 100 : 197100;
  const pendingVerif = stats ? Number(stats.pendingVerifications) : 2;
  const growth = analytics?.growth ?? 0.24;

  return (
    <div className="space-y-6" data-ocid="admin.overview.section">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          icon={IndianRupee}
          value={fmt(totalRevenue)}
          sub={`+${(growth * 100).toFixed(1)}% this month`}
          loading={statsLoading}
        />
        <KpiCard
          label="Total Orders"
          icon={ShoppingCart}
          value={totalOrders.toLocaleString("en-IN")}
          sub="All time"
          loading={statsLoading}
        />
        <KpiCard
          label="Platform Commission"
          icon={TrendingUp}
          value={fmt(totalCommission)}
          sub="15% per order"
          loading={statsLoading}
        />
        <KpiCard
          label="Pending Verifications"
          icon={AlertTriangle}
          value={pendingVerif.toString()}
          sub="Sellers awaiting review"
          loading={statsLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Revenue — Last 6 Months
            </CardTitle>
            <CardDescription>
              Total revenue vs commission earned
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={monthlyData}
                  margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip
                    formatter={(v: number) => [
                      `₹${v.toLocaleString("en-IN")}`,
                      "",
                    ]}
                    contentStyle={{
                      background: "oklch(var(--card))",
                      border: "1px solid oklch(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="oklch(var(--primary))"
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="commission"
                    name="Commission"
                    stroke="oklch(var(--chart-2))"
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-display">
              Top Categories
            </CardTitle>
            <CardDescription>Orders by category</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 8, left: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(var(--border))"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fontSize: 10,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{
                      fontSize: 11,
                      fill: "oklch(var(--muted-foreground))",
                    }}
                    width={58}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "oklch(var(--card))",
                      border: "1px solid oklch(var(--border))",
                      borderRadius: "8px",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    name="Orders"
                    fill="oklch(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Recent Orders
          </CardTitle>
          <CardDescription>Last 5 transactions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">City</TableHead>
                <TableHead className="hidden md:table-cell">Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_ORDERS.map((o, i) => (
                <TableRow
                  key={o.id}
                  data-ocid={`admin.recent_orders.item.${i + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.id}
                  </TableCell>
                  <TableCell className="font-body font-medium text-sm">
                    {o.customer}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {o.city}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-center">
                    {o.items}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ₹{o.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status] ?? ""}`}
                    >
                      {o.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Sellers ─────────────────────────────────────────────────────────────

type SellerFilter = "all" | "verified" | "pending";

function SellersTab() {
  const [filter, setFilter] = useState<SellerFilter>("all");
  const { data: backendSellers } = useSellers();
  const { mutate: verifySeller, isPending: isVerifying } = useVerifySeller();

  const sellers: MockSeller[] =
    backendSellers && backendSellers.length > 0
      ? (backendSellers as unknown as MockSeller[])
      : MOCK_SELLERS;

  const filtered = useMemo(() => {
    if (filter === "verified") return sellers.filter((s) => s.isVerified);
    if (filter === "pending") return sellers.filter((s) => !s.isVerified);
    return sellers;
  }, [sellers, filter]);

  return (
    <div className="space-y-4" data-ocid="admin.sellers.section">
      {/* Filters */}
      <div className="flex flex-wrap gap-2" data-ocid="admin.sellers.filter">
        {(["all", "verified", "pending"] as SellerFilter[]).map((f) => (
          <Button
            key={f}
            type="button"
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            data-ocid={`admin.sellers.filter.${f}`}
            className="capitalize"
          >
            {f === "pending"
              ? "Pending Verification"
              : f === "all"
                ? "All Sellers"
                : "Verified"}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">
          {filtered.length} sellers
        </span>
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shop Name</TableHead>
                <TableHead className="hidden sm:table-cell">City</TableHead>
                <TableHead className="hidden md:table-cell text-right">
                  Total Sales
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((seller, i) => (
                <TableRow
                  key={seller.id}
                  data-ocid={`admin.sellers.item.${i + 1}`}
                >
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">
                        {seller.shopName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {seller.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {seller.city}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-right font-mono text-sm">
                    {Number(seller.totalSales) > 0
                      ? fmt(Number(seller.totalSales) / 100)
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {seller.isVerified ? (
                      <span className="badge-verified">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-mono font-semibold">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                    {formatDate(seller.joinedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {seller.isVerified ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
                        data-ocid={`admin.sellers.revoke_button.${i + 1}`}
                      >
                        Revoke
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => verifySeller(seller.id)}
                        disabled={isVerifying}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                        data-ocid={`admin.sellers.verify_button.${i + 1}`}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Verify
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Products ────────────────────────────────────────────────────────────

function ProductsTab() {
  const [search, setSearch] = useState("");
  const [deactivated, setDeactivated] = useState<Set<string>>(new Set());
  const { data: backendProducts } = useProducts();

  const products: Product[] =
    backendProducts && backendProducts.length > 0
      ? backendProducts
      : MOCK_PRODUCTS;

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }, [products, search]);

  const toggle = (id: string) => {
    setDeactivated((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4" data-ocid="admin.products.section">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="pl-9"
          data-ocid="admin.products.search_input"
        />
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Seller</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Stock
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p, i) => {
                const inactive = deactivated.has(p.id);
                const outOfStock = Number(p.stock) === 0;
                return (
                  <TableRow
                    key={p.id}
                    data-ocid={`admin.products.item.${i + 1}`}
                    className={inactive ? "opacity-50" : ""}
                  >
                    <TableCell>
                      <p className="font-medium text-sm max-w-[140px] truncate">
                        {p.name}
                      </p>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                      {p.category}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground truncate max-w-[100px]">
                      {p.sellerName}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹
                      {(Number(p.discountedPrice) / 100).toLocaleString(
                        "en-IN",
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right text-sm">
                      {outOfStock ? (
                        <span className="text-destructive font-medium">0</span>
                      ) : (
                        Number(p.stock)
                      )}
                    </TableCell>
                    <TableCell>
                      {inactive ? (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      ) : outOfStock ? (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 border-0 text-xs hover:bg-green-100">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => toggle(p.id)}
                        className="text-xs"
                        data-ocid={`admin.products.${inactive ? "activate" : "deactivate"}_button.${i + 1}`}
                      >
                        {inactive ? "Activate" : "Deactivate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.products.empty_state"
                  >
                    No products match "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Orders ──────────────────────────────────────────────────────────────

type OrderStatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

const ALL_ORDERS = [
  ...MOCK_ORDERS,
  {
    id: "ORD-1037",
    customer: "Aarav Joshi",
    amount: 1599,
    status: "confirmed",
    city: "Bhopal",
    items: 2,
  },
  {
    id: "ORD-1036",
    customer: "Sneha Reddy",
    amount: 3499,
    status: "cancelled",
    city: "Pune",
    items: 3,
  },
  {
    id: "ORD-1035",
    customer: "Karan Malhotra",
    amount: 999,
    status: "shipped",
    city: "Ludhiana",
    items: 1,
  },
];

function OrdersTab() {
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>("all");

  const filtered = useMemo(() => {
    if (statusFilter === "all") return ALL_ORDERS;
    return ALL_ORDERS.filter((o) => o.status === statusFilter);
  }, [statusFilter]);

  const statuses: OrderStatusFilter[] = [
    "all",
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
  ];

  return (
    <div className="space-y-4" data-ocid="admin.orders.section">
      <div className="flex flex-wrap gap-2" data-ocid="admin.orders.filter">
        {statuses.map((s) => (
          <Button
            key={s}
            type="button"
            size="sm"
            variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            data-ocid={`admin.orders.filter.${s}`}
            className="capitalize text-xs"
          >
            {s === "all" ? "All Orders" : s}
          </Button>
        ))}
      </div>

      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">City</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  Commission (15%)
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o, i) => (
                <TableRow key={o.id} data-ocid={`admin.orders.item.${i + 1}`}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {o.id}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {o.customer}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                    {o.city}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    ₹{o.amount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell font-mono text-sm text-primary">
                    ₹{Math.round(o.amount * 0.15).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[o.status] ?? ""}`}
                    >
                      {o.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-xs h-7"
                      data-ocid={`admin.orders.edit_button.${i + 1}`}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-10 text-muted-foreground"
                    data-ocid="admin.orders.empty_state"
                  >
                    No orders with status "{statusFilter}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Users ───────────────────────────────────────────────────────────────

function UsersTab() {
  const [suspended, setSuspended] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSuspended((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4" data-ocid="admin.users.section">
      <Card className="card-shadow">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Role</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Orders
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_USERS.map((u, i) => {
                const isSuspended =
                  suspended.has(u.id) || u.status === "suspended";
                const wasOrigSuspended = u.status === "suspended";
                const actualStatus =
                  suspended.has(u.id) !== wasOrigSuspended
                    ? suspended.has(u.id)
                      ? "suspended"
                      : "active"
                    : u.status;

                return (
                  <TableRow
                    key={u.id}
                    data-ocid={`admin.users.item.${i + 1}`}
                    className={isSuspended ? "opacity-60" : ""}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                          {u.name[0]}
                        </div>
                        <span className="font-medium text-sm truncate max-w-[100px]">
                          {u.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant={u.role === "seller" ? "default" : "secondary"}
                        className="capitalize text-xs"
                      >
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {u.joined}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell text-sm font-mono">
                      {u.orders}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[actualStatus] ?? ""}`}
                      >
                        {actualStatus}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => toggle(u.id)}
                        className={`text-xs ${isSuspended ? "" : "text-destructive border-destructive/30 hover:bg-destructive/10"}`}
                        data-ocid={`admin.users.${isSuspended ? "activate" : "suspend"}_button.${i + 1}`}
                      >
                        {isSuspended ? "Activate" : "Suspend"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Tab: Revenue ─────────────────────────────────────────────────────────────

function RevenueTab() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: analytics } = useAnalytics();

  const totalRevenue = stats ? Number(stats.totalRevenue) / 100 : 1314000;
  const commission = stats ? Number(stats.totalCommission) / 100 : 197100;
  const netToSellers = totalRevenue - commission;
  const growth = analytics?.growth ?? 0.24;

  return (
    <div className="space-y-6" data-ocid="admin.revenue.section">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-shadow border-l-4 border-l-primary">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total Platform Revenue
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <p className="text-2xl font-display font-bold">
                {fmt(totalRevenue)}
              </p>
            )}
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-600 font-medium">
                +{(growth * 100).toFixed(1)}% MoM
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-chart-2">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">
              Platform Commission (15%)
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className="text-2xl font-display font-bold text-primary">
                {fmt(commission)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Auto-deducted per order
            </p>
          </CardContent>
        </Card>
        <Card className="card-shadow border-l-4 border-l-chart-3">
          <CardContent className="pt-5 pb-4">
            <p className="text-xs text-muted-foreground mb-1">
              Net Paid to Sellers
            </p>
            {isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className="text-2xl font-display font-bold">
                {fmt(netToSellers)}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              After commission deduction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly breakdown */}
      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display">
              Monthly Breakdown
            </CardTitle>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
              <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs text-green-700 dark:text-green-400 font-semibold">
                +{(growth * 100).toFixed(1)}% growth
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
                <TableHead className="text-right text-primary">
                  Commission (15%)
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  Net to Sellers
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  Growth
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MONTHLY.map((row, i) => {
                const prev = MOCK_MONTHLY[i - 1];
                const growthPct = prev
                  ? (
                      ((row.revenue - prev.revenue) / prev.revenue) *
                      100
                    ).toFixed(1)
                  : null;
                return (
                  <TableRow
                    key={row.month}
                    data-ocid={`admin.revenue.item.${i + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {row.month}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹{row.revenue.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-primary">
                      ₹{row.commission.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell font-mono text-sm text-muted-foreground">
                      ₹{row.net.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {growthPct !== null && (
                        <span
                          className={`text-xs font-medium ${Number.parseFloat(growthPct) >= 0 ? "text-green-600" : "text-destructive"}`}
                        >
                          {Number.parseFloat(growthPct) >= 0 ? "+" : ""}
                          {growthPct}%
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sellers", label: "Sellers", icon: Store },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "revenue", label: "Revenue", icon: BarChart3 },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const ActiveIcon =
    NAV_ITEMS.find((n) => n.id === activeTab)?.icon ?? LayoutDashboard;

  return (
    <div className="flex min-h-screen bg-background" data-ocid="admin.page">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-card border-r border-border shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm leading-tight truncate">
              ShopNest
            </p>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">
              ADMIN
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              onClick={() => setActiveTab(id)}
              data-ocid={`admin.nav.${id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body transition-smooth ${
                activeTab === id
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground truncate">
            admin@shopnest.in
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            Super Admin
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-3.5 flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            data-ocid="admin.mobile_menu_toggle"
            className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-smooth"
          >
            <ChevronDown
              className={`w-5 h-5 text-muted-foreground transition-smooth ${mobileMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <ActiveIcon className="w-4 h-4 text-primary shrink-0" />
            <h1 className="font-display font-bold text-base capitalize truncate">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
        </header>

        {/* Mobile nav drawer */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden bg-card border-b border-border px-3 py-2 flex flex-wrap gap-1"
            data-ocid="admin.mobile_nav"
          >
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                data-ocid={`admin.mobile_nav.${id}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-body transition-smooth ${
                  activeTab === id
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Page content */}
        <ScrollArea className="flex-1">
          <main className="px-4 lg:px-6 py-6">
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "sellers" && <SellersTab />}
            {activeTab === "products" && <ProductsTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "revenue" && <RevenueTab />}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
