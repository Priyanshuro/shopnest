import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouter } from "@tanstack/react-router";
import { AlertCircle, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useCallerUserRole } from "../hooks/useProducts";

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; color: string }> = {
    admin: { label: "Admin", color: "bg-destructive/15 text-destructive" },
    seller: { label: "Verified Seller", color: "bg-primary/15 text-primary" },
    user: {
      label: "Customer",
      color: "bg-secondary text-secondary-foreground",
    },
    guest: { label: "Guest", color: "bg-muted text-muted-foreground" },
  };
  const entry = map[role] ?? map.guest;
  return (
    <Badge
      data-ocid="login.role_badge"
      className={`${entry.color} border-0 font-mono text-xs font-semibold`}
    >
      {entry.label}
    </Badge>
  );
}

// ─── Login page ───────────────────────────────────────────────────────────────

export default function Login() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: role } = useCallerUserRole();
  const router = useRouter();

  // Redirect after successful login
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
      data-ocid="login.page"
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-background"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-auto">
        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl shadow-lg mb-4">
            <ShoppingBag className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display font-bold text-3xl text-foreground tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Sign in to your ShopNest account
          </p>
        </div>

        <Card
          data-ocid="login.card"
          className="bg-card border border-border shadow-xl rounded-2xl overflow-hidden"
        >
          <CardContent className="p-8">
            {/* Authenticated state */}
            {isAuthenticated ? (
              <div
                data-ocid="login.success_state"
                className="flex flex-col items-center gap-4 py-4 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-semibold text-foreground text-lg">
                    You're logged in!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Redirecting you to the homepage…
                  </p>
                </div>
                {role && <RoleBadge role={String(role)} />}
                <Link
                  to="/"
                  data-ocid="login.go_home_link"
                  className="text-primary text-sm font-medium hover:underline transition-smooth"
                >
                  Go to Home →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Info banner */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/8 border border-primary/20">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Secure login via Internet Identity
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      No passwords needed. Your identity is protected by
                      cryptographic keys.
                    </p>
                  </div>
                </div>

                {/* Error state */}
                {!isInitializing && !isLoggingIn && (
                  <div
                    data-ocid="login.cta_section"
                    className="flex flex-col gap-3"
                  >
                    <Button
                      type="button"
                      data-ocid="login.internet_identity_button"
                      onClick={login}
                      disabled={isInitializing || isLoggingIn}
                      className="w-full h-12 btn-primary rounded-xl text-base gap-2.5 shadow-sm"
                      size="lg"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Login with Internet Identity
                    </Button>
                  </div>
                )}

                {/* Loading state */}
                {(isInitializing || isLoggingIn) && (
                  <div
                    data-ocid="login.loading_state"
                    className="flex flex-col items-center gap-3 py-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                      <span className="text-sm text-muted-foreground">
                        {isInitializing
                          ? "Initializing…"
                          : "Connecting to Internet Identity…"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error state (button fallback) */}
                {!isInitializing && !isLoggingIn && (
                  <div
                    data-ocid="login.error_state"
                    className="hidden items-center gap-2 text-xs text-destructive"
                  >
                    <AlertCircle className="w-4 h-4" />
                    <span>Login failed. Please try again.</span>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-card px-3 text-xs text-muted-foreground">
                      New to ShopNest?
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <Link
                    to="/register"
                    data-ocid="login.register_link"
                    className="text-sm text-primary font-medium hover:underline transition-smooth"
                  >
                    Create your account →
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-6 leading-relaxed">
          By signing in, you agree to ShopNest's{" "}
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
