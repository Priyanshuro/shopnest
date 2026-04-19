import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pencil,
  PlusCircle,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "products" | "orders" | "earnings" | "add-product";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountedPrice: number;
  stock: number;
  status: "Active" | "Inactive";
  image: string;
  description: string;
  city: string;
  hasFastDelivery: boolean;
  images: string[];
}

interface Order {
  id: string;
  product: string;
  customer: string;
  amount: number;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
  date: string;
  items: number;
}

interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: string;
  discountedPrice: string;
  stock: string;
  image1: string;
  image2: string;
  image3: string;
  image4: string;
  city: string;
  hasFastDelivery: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "Shirts",
  "T-Shirts",
  "Dresses",
  "Jeans",
  "Shoes",
  "Sarees",
  "Hoodies",
  "Handbags",
  "Ethnic Wear",
  "Accessories",
];

const CATEGORY_IMAGES: Record<string, string> = {
  Shirts:
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=80&h=80&fit=crop",
  "T-Shirts":
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop",
  Dresses:
    "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=80&h=80&fit=crop",
  Jeans:
    "https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=80&h=80&fit=crop",
  Shoes:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop",
  Sarees:
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&h=80&fit=crop",
  Hoodies:
    "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=80&h=80&fit=crop",
  Handbags:
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop",
  "Ethnic Wear":
    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=80&h=80&fit=crop",
  Accessories:
    "https://images.unsplash.com/photo-1509941943102-10c232535736?w=80&h=80&fit=crop",
};

const SHIRTS_IMG = CATEGORY_IMAGES.Shirts;
const DRESSES_IMG = CATEGORY_IMAGES.Dresses;
const JEANS_IMG = CATEGORY_IMAGES.Jeans;
const TSHIRTS_IMG = CATEGORY_IMAGES["T-Shirts"];
const SHOES_IMG = CATEGORY_IMAGES.Shoes;
const SAREES_IMG = CATEGORY_IMAGES.Sarees;

const mockProducts: Product[] = [
  {
    id: "P001",
    name: "Classic Oxford Shirt",
    category: "Shirts",
    price: 1299,
    discountedPrice: 899,
    stock: 45,
    status: "Active",
    image: SHIRTS_IMG,
    description: "Premium cotton oxford shirt for formal occasions",
    city: "Jaipur",
    hasFastDelivery: true,
    images: [SHIRTS_IMG],
  },
  {
    id: "P002",
    name: "Floral Wrap Dress",
    category: "Dresses",
    price: 1799,
    discountedPrice: 1199,
    stock: 28,
    status: "Active",
    image: DRESSES_IMG,
    description: "Lightweight floral wrap dress for summer",
    city: "Jaipur",
    hasFastDelivery: true,
    images: [DRESSES_IMG],
  },
  {
    id: "P003",
    name: "Slim Fit Denim Jeans",
    category: "Jeans",
    price: 2199,
    discountedPrice: 1499,
    stock: 60,
    status: "Active",
    image: JEANS_IMG,
    description: "Blue slim fit denim jeans",
    city: "Jaipur",
    hasFastDelivery: false,
    images: [JEANS_IMG],
  },
  {
    id: "P004",
    name: "Graphic Print Tee",
    category: "T-Shirts",
    price: 699,
    discountedPrice: 499,
    stock: 0,
    status: "Inactive",
    image: TSHIRTS_IMG,
    description: "Bold graphic print tee in cotton",
    city: "Jaipur",
    hasFastDelivery: true,
    images: [TSHIRTS_IMG],
  },
  {
    id: "P005",
    name: "Running Sports Shoes",
    category: "Shoes",
    price: 3499,
    discountedPrice: 2799,
    stock: 20,
    status: "Active",
    image: SHOES_IMG,
    description: "Lightweight running shoes with cushioned sole",
    city: "Jaipur",
    hasFastDelivery: false,
    images: [SHOES_IMG],
  },
  {
    id: "P006",
    name: "Banarasi Silk Saree",
    category: "Sarees",
    price: 5999,
    discountedPrice: 4499,
    stock: 12,
    status: "Active",
    image: SAREES_IMG,
    description: "Traditional Banarasi silk saree with gold zari",
    city: "Varanasi",
    hasFastDelivery: false,
    images: [SAREES_IMG],
  },
];

const mockOrders: Order[] = [
  {
    id: "#SN-2001",
    product: "Classic Oxford Shirt",
    customer: "Arjun Sharma",
    amount: 899,
    status: "Delivered",
    date: "Apr 15, 2026",
    items: 2,
  },
  {
    id: "#SN-2002",
    product: "Floral Wrap Dress",
    customer: "Priya Mehta",
    amount: 1199,
    status: "Shipped",
    date: "Apr 16, 2026",
    items: 1,
  },
  {
    id: "#SN-2003",
    product: "Slim Fit Denim Jeans",
    customer: "Rohan Gupta",
    amount: 2998,
    status: "Confirmed",
    date: "Apr 17, 2026",
    items: 2,
  },
  {
    id: "#SN-2004",
    product: "Graphic Print Tee",
    customer: "Sneha Patel",
    amount: 499,
    status: "Pending",
    date: "Apr 18, 2026",
    items: 1,
  },
  {
    id: "#SN-2005",
    product: "Running Sports Shoes",
    customer: "Karan Singh",
    amount: 2799,
    status: "Confirmed",
    date: "Apr 18, 2026",
    items: 1,
  },
  {
    id: "#SN-2006",
    product: "Banarasi Silk Saree",
    customer: "Anjali Verma",
    amount: 4499,
    status: "Delivered",
    date: "Apr 12, 2026",
    items: 1,
  },
  {
    id: "#SN-2007",
    product: "Classic Oxford Shirt",
    customer: "Vikram Nair",
    amount: 899,
    status: "Shipped",
    date: "Apr 19, 2026",
    items: 1,
  },
];

const earningsMonthLabels: Record<string, string> = {
  Nov: "Nov 2025",
  Dec: "Dec 2025",
  Jan: "Jan 2026",
  Feb: "Feb 2026",
  Mar: "Mar 2026",
  Apr: "Apr 2026",
};

const earningsData = [
  { month: "Nov", earnings: 18400, commission: 2760 },
  { month: "Dec", earnings: 27300, commission: 4095 },
  { month: "Jan", earnings: 22100, commission: 3315 },
  { month: "Feb", earnings: 31500, commission: 4725 },
  { month: "Mar", earnings: 29800, commission: 4470 },
  { month: "Apr", earnings: 38200, commission: 5730 },
];

const areaData = [
  { month: "Nov", revenue: 18400 },
  { month: "Dec", revenue: 27300 },
  { month: "Jan", revenue: 22100 },
  { month: "Feb", revenue: 31500 },
  { month: "Mar", revenue: 29800 },
  { month: "Apr", revenue: 38200 },
];

// ─── Status badge helper ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Delivered:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Shipped: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Confirmed: "bg-accent/15 text-accent",
    Pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    Active:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    Inactive: "bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}) {
  return (
    <Card className="card-shadow">
      <CardContent className="p-5 flex items-start gap-4">
        <div
          className={`p-3 rounded-xl ${accent ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wide">
            {label}
          </p>
          <p className="text-2xl font-display font-bold text-foreground truncate">
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Product Form Modal ───────────────────────────────────────────────────────

function ProductModal({
  open,
  onClose,
  editProduct,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editProduct?: Product | null;
  onSave?: (product: Product) => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: editProduct
      ? {
          name: editProduct.name,
          category: editProduct.category,
          description: editProduct.description,
          price: String(editProduct.price),
          discountedPrice: String(editProduct.discountedPrice),
          stock: String(editProduct.stock),
          image1: editProduct.images[0] ?? "",
          image2: editProduct.images[1] ?? "",
          image3: editProduct.images[2] ?? "",
          image4: editProduct.images[3] ?? "",
          city: editProduct.city,
          hasFastDelivery: editProduct.hasFastDelivery,
        }
      : { hasFastDelivery: false },
  });

  const onSubmit = (data: ProductFormData) => {
    const images = [data.image1, data.image2, data.image3, data.image4].filter(
      Boolean,
    );
    const saved: Product = {
      id: editProduct?.id ?? `P${Date.now()}`,
      name: data.name,
      category: data.category,
      description: data.description,
      price: Number(data.price),
      discountedPrice: Number(data.discountedPrice) || Number(data.price),
      stock: Number(data.stock),
      status: Number(data.stock) > 0 ? "Active" : "Inactive",
      image: images[0] ?? CATEGORY_IMAGES[data.category] ?? "",
      city: data.city,
      hasFastDelivery: data.hasFastDelivery,
      images,
    };
    onSave?.(saved);
    toast.success(
      editProduct
        ? "Product updated successfully!"
        : "Product added successfully!",
    );
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent
        data-ocid="product.dialog"
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {editProduct ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                data-ocid="product.input"
                id="name"
                placeholder="e.g. Classic Oxford Shirt"
                {...register("name", { required: "Product name is required" })}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger data-ocid="product.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              data-ocid="product.textarea"
              id="description"
              placeholder="Describe your product..."
              rows={3}
              {...register("description")}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                data-ocid="product.price_input"
                id="price"
                type="number"
                placeholder="1299"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 1, message: "Must be > 0" },
                })}
              />
              {errors.price && (
                <p className="text-xs text-destructive">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="discountedPrice">Sale Price (₹)</Label>
              <Input
                id="discountedPrice"
                type="number"
                placeholder="999"
                {...register("discountedPrice")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Cannot be negative" },
                })}
              />
              {errors.stock && (
                <p className="text-xs text-destructive">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-3">
              Product Images (URLs) — use images matching your category
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["image1", "image2", "image3", "image4"] as const).map(
                (f, i) => (
                  <div key={f} className="space-y-1.5">
                    <Label htmlFor={f}>
                      Image {i + 1} URL {i === 0 ? "*" : "(optional)"}
                    </Label>
                    <Input
                      id={f}
                      placeholder={`https://... (${CATEGORIES[0]} image)`}
                      {...register(
                        f,
                        i === 0
                          ? { required: "At least one image is required" }
                          : {},
                      )}
                    />
                    {i === 0 && errors.image1 && (
                      <p className="text-xs text-destructive">
                        {errors.image1.message}
                      </p>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="e.g. Jaipur"
                {...register("city", { required: "City is required" })}
              />
              {errors.city && (
                <p className="text-xs text-destructive">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 pb-1">
              <Controller
                name="hasFastDelivery"
                control={control}
                render={({ field }) => (
                  <Switch
                    data-ocid="product.switch"
                    id="fast-delivery"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="fast-delivery"
                className="flex items-center gap-1 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 text-accent" /> Fast Delivery
                (24–48h)
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              data-ocid="product.cancel_button"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-ocid="product.submit_button"
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              {editProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab() {
  const recentOrders = mockOrders.slice(0, 5);
  const totalEarnings = earningsData.reduce((s, d) => s + d.earnings, 0);
  const totalCommission = earningsData.reduce((s, d) => s + d.commission, 0);

  return (
    <div className="space-y-6">
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="dashboard.section"
      >
        <StatCard
          label="Total Products"
          value={String(mockProducts.length)}
          sub="In your store"
          icon={Package}
        />
        <StatCard
          label="Active Orders"
          value="7"
          sub="This week"
          icon={ShoppingBag}
          accent
        />
        <StatCard
          label="Month Earnings"
          value={`₹${(38200).toLocaleString("en-IN")}`}
          sub="April 2026"
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Commission Paid"
          value={`₹${(5730).toLocaleString("en-IN")}`}
          sub="15% of revenue"
          icon={CheckCircle2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Revenue — Last 6 Months
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={areaData}
                margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="oklch(var(--accent))"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="oklch(var(--accent))"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(var(--border))"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  stroke="oklch(var(--muted-foreground))"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  stroke="oklch(var(--muted-foreground))"
                  tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  formatter={(v: number) => [
                    `₹${v.toLocaleString("en-IN")}`,
                    "Revenue",
                  ]}
                  contentStyle={{
                    background: "oklch(var(--card))",
                    border: "1px solid oklch(var(--border))",
                    borderRadius: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="oklch(var(--accent))"
                  strokeWidth={2.5}
                  fill="url(#earningsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                label: "Total Revenue",
                value: `₹${totalEarnings.toLocaleString("en-IN")}`,
              },
              {
                label: "Commission (15%)",
                value: `₹${totalCommission.toLocaleString("en-IN")}`,
              },
              {
                label: "Net Earnings",
                value: `₹${(totalEarnings - totalCommission).toLocaleString("en-IN")}`,
              },
              {
                label: "Avg Order Value",
                value: `₹${Math.round(totalEarnings / mockOrders.length).toLocaleString("en-IN")}`,
              },
              { label: "Total Orders", value: String(mockOrders.length) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-1.5 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((o, i) => (
                  <TableRow
                    key={o.id}
                    data-ocid={`dashboard.recent_orders.item.${i + 1}`}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {o.id}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {o.customer}
                    </TableCell>
                    <TableCell className="text-sm">{o.items}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹{o.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {o.date}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({
  onAdd,
  products,
  setProducts,
}: {
  onAdd: () => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}) {
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast.success("Product deleted.");
  };

  const handleSave = (saved: Product) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
    setEditProduct(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg">My Products</h2>
        <Button
          type="button"
          data-ocid="products.add_button"
          onClick={onAdd}
          className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
        >
          <PlusCircle className="h-4 w-4" /> Add Product
        </Button>
      </div>
      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p, i) => (
                  <TableRow key={p.id} data-ocid={`products.item.${i + 1}`}>
                    <TableCell>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover border border-border"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium line-clamp-1">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.city}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {p.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div>
                        <p className="text-sm font-mono font-semibold">
                          ₹{p.discountedPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs text-muted-foreground line-through">
                          ₹{p.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {p.stock}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          data-ocid={`products.edit_button.${i + 1}`}
                          onClick={() => setEditProduct(p)}
                          className="h-8 w-8 hover:text-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          data-ocid={`products.delete_button.${i + 1}`}
                          onClick={() => handleDelete(p.id)}
                          className="h-8 w-8 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <ProductModal
        open={!!editProduct}
        editProduct={editProduct}
        onClose={() => setEditProduct(null)}
        onSave={handleSave}
      />
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const ORDER_STATUSES = ["Confirmed", "Shipped", "Delivered"] as const;

function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);

  const updateStatus = (id: string, status: Order["status"]) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    toast.success(`Order ${id} marked as ${status}.`);
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display font-semibold text-lg">Orders</h2>
      <Card className="card-shadow">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o, i) => (
                  <TableRow key={o.id} data-ocid={`orders.item.${i + 1}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {o.id}
                    </TableCell>
                    <TableCell className="text-sm max-w-[140px] truncate">
                      {o.product}
                    </TableCell>
                    <TableCell className="text-sm">{o.customer}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹{o.amount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={o.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {o.date}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            data-ocid={`orders.status_button.${i + 1}`}
                            className="h-7 text-xs gap-1"
                          >
                            Update <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ORDER_STATUSES.map((s) => (
                            <DropdownMenuItem
                              key={s}
                              data-ocid={`orders.status_${s.toLowerCase()}.${i + 1}`}
                              onClick={() => updateStatus(o.id, s)}
                              className={
                                o.status === s
                                  ? "text-accent font-semibold"
                                  : ""
                              }
                            >
                              {s}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Earnings Tab ─────────────────────────────────────────────────────────────

function EarningsTab() {
  const totalEarnings = earningsData.reduce((s, d) => s + d.earnings, 0);
  const totalCommission = earningsData.reduce((s, d) => s + d.commission, 0);
  const netEarnings = totalEarnings - totalCommission;

  return (
    <div className="space-y-6">
      <h2 className="font-display font-semibold text-lg">Earnings</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Earnings"
          value={`₹${totalEarnings.toLocaleString("en-IN")}`}
          sub="Last 6 months"
          icon={TrendingUp}
          accent
        />
        <StatCard
          label="Commission (15%)"
          value={`₹${totalCommission.toLocaleString("en-IN")}`}
          sub="Platform fee"
          icon={CheckCircle2}
        />
        <StatCard
          label="Net Earnings"
          value={`₹${netEarnings.toLocaleString("en-IN")}`}
          sub="After commission"
          icon={TrendingUp}
        />
      </div>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Monthly Revenue vs Commission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={earningsData}
              margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="oklch(var(--border))"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="oklch(var(--muted-foreground))"
              />
              <YAxis
                tick={{ fontSize: 11 }}
                stroke="oklch(var(--muted-foreground))"
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip
                formatter={(v: number, name: string) => [
                  `₹${v.toLocaleString("en-IN")}`,
                  name === "earnings" ? "Revenue" : "Commission",
                ]}
                contentStyle={{
                  background: "oklch(var(--card))",
                  border: "1px solid oklch(var(--border))",
                  borderRadius: 8,
                }}
              />
              <Bar
                dataKey="earnings"
                fill="oklch(var(--accent))"
                radius={[4, 4, 0, 0]}
                name="earnings"
              />
              <Bar
                dataKey="commission"
                fill="oklch(var(--muted-foreground))"
                radius={[4, 4, 0, 0]}
                name="commission"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="card-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">
            Monthly Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Gross Earnings</TableHead>
                  <TableHead className="text-right">Commission (15%)</TableHead>
                  <TableHead className="text-right">Net Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earningsData.map((row, i) => (
                  <TableRow
                    key={row.month}
                    data-ocid={`earnings.item.${i + 1}`}
                  >
                    <TableCell className="font-medium">
                      {earningsMonthLabels[row.month] ?? row.month}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      ₹{row.earnings.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      ₹{row.commission.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-accent">
                      ₹{(row.earnings - row.commission).toLocaleString("en-IN")}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/40 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right font-mono">
                    ₹{totalEarnings.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
                    ₹{totalCommission.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-accent">
                    ₹{netEarnings.toLocaleString("en-IN")}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "My Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "earnings", label: "Earnings", icon: TrendingUp },
  { id: "add-product", label: "Add Product", icon: PlusCircle },
];

function Sidebar({
  activeTab,
  setActiveTab,
  onClose,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  onClose?: () => void;
}) {
  return (
    <aside className="flex flex-col h-full bg-card border-r border-border">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground">
            ShopNest
          </span>
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="px-3 pb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-3 mb-1">
          Seller Panel
        </p>
      </div>
      <Separator />
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="seller.sidebar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`seller.nav.${item.id}`}
              onClick={() => {
                setActiveTab(
                  item.id === "add-product" ? "products" : (item.id as Tab),
                );
                if (onClose) onClose();
                if (item.id === "add-product")
                  setTimeout(
                    () => document.getElementById("open-add-product")?.click(),
                    50,
                  );
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                active
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          );
        })}
      </nav>
      <Separator />
      {/* User */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <span className="text-xs font-display font-bold text-accent">RS</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">Rajesh Sharma</p>
          <p className="text-xs text-muted-foreground truncate">
            Verified Seller · Jaipur
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 hover:text-destructive"
          data-ocid="seller.logout_button"
        >
          <LogOut className="h-3.5 w-3.5" />
        </Button>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const handleSetTab = (tab: Tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const handleAddSave = (saved: Product) => {
    setProducts((prev) => [...prev, saved]);
    setAddProductOpen(false);
  };

  return (
    <div
      className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background"
      data-ocid="seller.page"
    >
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:shrink-0">
        <div className="w-full">
          <Sidebar activeTab={activeTab} setActiveTab={handleSetTab} />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            role="button"
            tabIndex={0}
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSidebarOpen(false);
            }}
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={handleSetTab}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 lg:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              data-ocid="seller.menu_button"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="font-display font-semibold text-base capitalize">
                {activeTab === "add-product"
                  ? "Add Product"
                  : activeTab.replace("-", " ")}
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Manage your ShopNest store
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-verified hidden sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Verified
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="seller.add_product_button"
              id="open-add-product"
              className="gap-1.5 text-xs h-8 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                setActiveTab("products");
                setAddProductOpen(true);
              }}
            >
              <PlusCircle className="h-3.5 w-3.5" /> Add Product
            </Button>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "dashboard" && <DashboardTab />}
          {activeTab === "products" && (
            <ProductsTab
              onAdd={() => setAddProductOpen(true)}
              products={products}
              setProducts={setProducts}
            />
          )}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "earnings" && <EarningsTab />}
        </main>
      </div>

      {/* Add Product Modal */}
      <ProductModal
        open={addProductOpen}
        onClose={() => setAddProductOpen(false)}
        onSave={handleAddSave}
      />
    </div>
  );
}
