import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouter } from "@tanstack/react-router";
import {
  Info,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Form field component ─────────────────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  ocid?: string;
}

function Field({
  id,
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  required,
  error,
  ocid,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <Input
        id={id}
        data-ocid={ocid}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-input border-input rounded-xl h-11 text-sm focus:ring-2 focus:ring-primary/30 transition-smooth"
      />
      {error && (
        <p
          data-ocid={`${ocid}.field_error`}
          className="text-xs text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Customer registration form ───────────────────────────────────────────────

function CustomerForm({
  onLogin,
  isLoggingIn,
  isInitializing,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
  isInitializing: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const validate = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    } else {
      setNameError("");
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
    return valid;
  };

  const handleLogin = () => {
    if (validate()) onLogin();
  };

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Field
        id="customer-name"
        ocid="register.customer_name_input"
        label="Full Name"
        placeholder="Priya Sharma"
        value={name}
        onChange={setName}
        required
        error={nameError}
      />
      <Field
        id="customer-email"
        ocid="register.customer_email_input"
        label="Email Address"
        placeholder="priya@example.com"
        value={email}
        onChange={setEmail}
        type="email"
        error={emailError}
      />

      <Button
        type="button"
        data-ocid="register.customer_login_button"
        onClick={handleLogin}
        disabled={isInitializing || isLoggingIn}
        className="w-full h-12 btn-primary rounded-xl text-base gap-2.5 shadow-sm mt-1"
        size="lg"
      >
        {isLoggingIn || isInitializing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {isInitializing ? "Initializing…" : "Connecting…"}
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Continue with Internet Identity
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Seller registration form ─────────────────────────────────────────────────

function SellerForm({
  onLogin,
  isLoggingIn,
  isInitializing,
}: {
  onLogin: () => void;
  isLoggingIn: boolean;
  isInitializing: boolean;
}) {
  const [name, setName] = useState("");
  const [shopName, setShopName] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Your name is required.";
    if (!shopName.trim()) next.shopName = "Shop name is required.";
    if (!city.trim()) next.city = "City is required.";
    if (!pincode.trim()) next.pincode = "Pincode is required.";
    else if (!/^\d{6}$/.test(pincode.trim()))
      next.pincode = "Enter a valid 6-digit pincode.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = () => {
    if (validate()) onLogin();
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="seller-name"
          ocid="register.seller_name_input"
          label="Your Name"
          placeholder="Rahul Verma"
          value={name}
          onChange={setName}
          required
          error={errors.name}
        />
        <Field
          id="seller-shopname"
          ocid="register.seller_shopname_input"
          label="Shop Name"
          placeholder="Verma Fashion House"
          value={shopName}
          onChange={setShopName}
          required
          error={errors.shopName}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          id="seller-city"
          ocid="register.seller_city_input"
          label="City"
          placeholder="Varanasi"
          value={city}
          onChange={setCity}
          required
          error={errors.city}
        />
        <Field
          id="seller-pincode"
          ocid="register.seller_pincode_input"
          label="Pincode"
          placeholder="221001"
          value={pincode}
          onChange={setPincode}
          required
          error={errors.pincode}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="seller-desc"
          className="text-sm font-medium text-foreground"
        >
          Shop Description
        </Label>
        <Textarea
          id="seller-desc"
          data-ocid="register.seller_description_textarea"
          placeholder="Describe your shop — what you sell, your speciality, years in business…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="bg-input border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/30 transition-smooth resize-none"
        />
      </div>

      <Button
        type="button"
        data-ocid="register.seller_login_button"
        onClick={handleLogin}
        disabled={isInitializing || isLoggingIn}
        className="w-full h-12 btn-primary rounded-xl text-base gap-2.5 shadow-sm"
        size="lg"
      >
        {isLoggingIn || isInitializing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            {isInitializing ? "Initializing…" : "Connecting…"}
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            Register as Seller
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Register page ────────────────────────────────────────────────────────────

export default function Register() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"customer" | "seller">("customer");

  // Redirect after successful registration/login
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        void router.navigate({ to: "/" });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  return (
    <div
      data-ocid="register.page"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-background"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg mx-auto">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-lg mb-4">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground tracking-tight">
            Create Account
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Join thousands of shoppers and sellers on ShopNest
          </p>
        </div>

        <Card
          data-ocid="register.card"
          className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden"
        >
          <CardContent className="p-8">
            {/* Success state */}
            {isAuthenticated ? (
              <div
                data-ocid="register.success_state"
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-lg">
                    Account created!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Welcome to ShopNest. Redirecting…
                  </p>
                </div>
                <Badge className="bg-primary/15 text-primary border-0 font-mono text-xs">
                  {activeTab === "seller" ? "Seller Registration" : "Customer"}
                </Badge>
                <Link
                  to="/"
                  data-ocid="register.go_home_link"
                  className="text-primary text-sm font-medium hover:underline transition-smooth"
                >
                  Go to Home →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/8 border border-accent/20">
                  <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground">
                      We use Internet Identity
                    </span>{" "}
                    for secure, passwordless login — no email or password
                    required. Fast, safe, and private.
                  </p>
                </div>

                {/* Account type tabs */}
                <Tabs
                  value={activeTab}
                  onValueChange={(v) =>
                    setActiveTab(v as "customer" | "seller")
                  }
                >
                  <TabsList
                    data-ocid="register.account_type_tabs"
                    className="w-full bg-muted rounded-xl p-1 h-11"
                  >
                    <TabsTrigger
                      value="customer"
                      data-ocid="register.customer_tab"
                      className="flex-1 gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-smooth"
                    >
                      <User className="w-4 h-4" />
                      Customer
                    </TabsTrigger>
                    <TabsTrigger
                      value="seller"
                      data-ocid="register.seller_tab"
                      className="flex-1 gap-2 rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm transition-smooth"
                    >
                      <Store className="w-4 h-4" />
                      Seller
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="customer">
                    <CustomerForm
                      onLogin={login}
                      isLoggingIn={isLoggingIn}
                      isInitializing={isInitializing}
                    />
                  </TabsContent>

                  <TabsContent value="seller">
                    <SellerForm
                      onLogin={login}
                      isLoggingIn={isLoggingIn}
                      isInitializing={isInitializing}
                    />
                    <p className="text-xs text-muted-foreground mt-3 text-center">
                      Your shop will be reviewed by our team before going live.
                    </p>
                  </TabsContent>
                </Tabs>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      Already have an account?
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    data-ocid="register.login_link"
                    className="text-sm text-primary font-medium hover:underline transition-smooth"
                  >
                    Sign in to ShopNest →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          By creating an account, you agree to ShopNest's{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          &{" "}
          <span className="text-primary cursor-pointer hover:underline">
            Privacy Policy
          </span>
          .
        </p>
      </div>
    </div>
  );
}
