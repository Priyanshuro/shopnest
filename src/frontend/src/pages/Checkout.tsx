import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useActor } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  MapPin,
  Package,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createActor } from "../backend";
import { useCreateOrder } from "../hooks/useProducts";
import { useCartStore } from "../store/cartStore";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressForm {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

type Step = 1 | 2 | 3;

const DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 49;

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Delivery", icon: MapPin },
  { id: 2, label: "Review", icon: Package },
  { id: 3, label: "Payment", icon: CreditCard },
];

function StepIndicator({ current }: { current: Step }) {
  return (
    <div
      className="flex items-center justify-center mb-8"
      data-ocid="checkout.step_indicator"
    >
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const isCompleted = current > step.id;
        const isActive = current === step.id;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-smooth ${
                  isCompleted
                    ? "bg-accent border-accent text-accent-foreground"
                    : isActive
                      ? "border-accent text-accent bg-accent/10"
                      : "border-border text-muted-foreground bg-muted"
                }`}
                data-ocid={`checkout.step_${step.id}`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${isActive ? "text-accent" : "text-muted-foreground"}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 sm:w-24 h-0.5 mx-2 mb-5 transition-smooth ${
                  current > step.id ? "bg-accent" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Checkout() {
  const navigate = useNavigate();
  const { actor } = useActor(createActor);
  const { items, getTotalPrice, clearCart } = useCartStore();
  const createOrder = useCreateOrder();

  const [step, setStep] = useState<Step>(1);
  const [address, setAddress] = useState<AddressForm | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressForm>();

  // ── Step 1 submit ──
  const onAddressSubmit = (data: AddressForm) => {
    setAddress(data);
    setStep(2);
  };

  // ── Step 3: initiate payment ──
  const handlePayment = async () => {
    if (!actor || !address) return;
    setIsProcessingPayment(true);
    try {
      const deliveryAddressStr = [
        address.name,
        address.phone,
        address.addressLine1,
        address.addressLine2,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      // Create order in backend
      const backendItems = items.map((item) => ({
        productId: item.productId,
        quantity: BigInt(item.quantity),
        price: BigInt(Math.round(item.price)),
      }));

      // Build Stripe shopping items
      const shoppingItems = items.map((item) => ({
        productName: item.name,
        productDescription: `Sold by ${item.sellerName}`,
        quantity: BigInt(item.quantity),
        priceInCents: BigInt(Math.round(item.price * 100)),
        currency: "inr",
      }));

      const origin = window.location.origin;
      const checkoutUrl = await actor.createCheckoutSession(
        shoppingItems,
        `${origin}/orders?payment=success`,
        `${origin}/checkout?payment=cancelled`,
      );

      // Create order record
      await createOrder.mutateAsync({
        items: backendItems,
        totalAmount: BigInt(Math.round(total)),
        deliveryAddress: deliveryAddressStr,
      });

      clearCart();
      // Redirect to Stripe
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error("Payment failed. Please try again.");
      console.error(err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (items.length === 0 && step !== 3) {
    void navigate({ to: "/cart" });
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6 text-center">
        Checkout
      </h1>

      <StepIndicator current={step} />

      {/* ── Step 1: Delivery Address ── */}
      {step === 1 && (
        <Card className="card-shadow" data-ocid="checkout.delivery_step">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <MapPin className="w-5 h-5 text-accent" />
              Delivery Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onAddressSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    placeholder="Rahul Sharma"
                    data-ocid="checkout.name_input"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p
                      className="text-destructive text-xs"
                      data-ocid="checkout.name_error"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    data-ocid="checkout.phone_input"
                    {...register("phone", {
                      required: "Phone is required",
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: "Enter a valid 10-digit mobile number",
                      },
                    })}
                  />
                  {errors.phone && (
                    <p
                      className="text-destructive text-xs"
                      data-ocid="checkout.phone_error"
                    >
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addressLine1">Address Line 1 *</Label>
                <Input
                  id="addressLine1"
                  placeholder="House No., Street, Area"
                  data-ocid="checkout.address1_input"
                  {...register("addressLine1", {
                    required: "Address is required",
                  })}
                />
                {errors.addressLine1 && (
                  <p
                    className="text-destructive text-xs"
                    data-ocid="checkout.address1_error"
                  >
                    {errors.addressLine1.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  placeholder="Landmark, Colony (optional)"
                  data-ocid="checkout.address2_input"
                  {...register("addressLine2")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Indore"
                    data-ocid="checkout.city_input"
                    {...register("city", { required: "City is required" })}
                  />
                  {errors.city && (
                    <p
                      className="text-destructive text-xs"
                      data-ocid="checkout.city_error"
                    >
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    placeholder="Madhya Pradesh"
                    data-ocid="checkout.state_input"
                    {...register("state", { required: "State is required" })}
                  />
                  {errors.state && (
                    <p
                      className="text-destructive text-xs"
                      data-ocid="checkout.state_error"
                    >
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    placeholder="452001"
                    data-ocid="checkout.pincode_input"
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: {
                        value: /^\d{6}$/,
                        message: "Enter a valid 6-digit pincode",
                      },
                    })}
                  />
                  {errors.pincode && (
                    <p
                      className="text-destructive text-xs"
                      data-ocid="checkout.pincode_error"
                    >
                      {errors.pincode.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full btn-primary mt-2"
                data-ocid="checkout.continue_button"
              >
                Continue
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Step 2: Order Review ── */}
      {step === 2 && address && (
        <div className="space-y-4" data-ocid="checkout.review_step">
          {/* Delivery address */}
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" />
                  Delivering to
                </span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-accent hover:underline font-normal"
                  data-ocid="checkout.edit_address_button"
                >
                  Edit
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-foreground space-y-0.5">
              <p className="font-semibold">{address.name}</p>
              <p className="text-muted-foreground">{address.phone}</p>
              <p className="text-muted-foreground">
                {address.addressLine1}
                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
              </p>
              <p className="text-muted-foreground">
                {address.city}, {address.state} – {address.pincode}
              </p>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="card-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Package className="w-4 h-4 text-accent" />
                Order Items ({items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.productId}
                  className="flex gap-3 items-center"
                  data-ocid={`checkout.item.${idx + 1}`}
                >
                  <img
                    src={item.image || "/assets/images/placeholder.svg"}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border border-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      by {item.sellerName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-foreground flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  {deliveryFee === 0 ? (
                    <Badge
                      variant="secondary"
                      className="text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-xs"
                    >
                      FREE
                    </Badge>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button
            type="button"
            className="w-full btn-primary text-base"
            onClick={() => setStep(3)}
            data-ocid="checkout.place_order_button"
          >
            Place Order
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* ── Step 3: Payment ── */}
      {step === 3 && (
        <Card className="card-shadow" data-ocid="checkout.payment_step">
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Lock className="w-5 h-5 text-accent" />
              Secure Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Powered by Stripe */}
            <div className="flex items-center justify-center gap-3 p-4 rounded-xl bg-muted border border-border">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                Powered by{" "}
                <span className="text-foreground font-semibold">Stripe</span> –
                256-bit SSL encrypted
              </span>
            </div>

            {/* Amount summary */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              {items.map((item, idx) => (
                <div
                  key={item.productId}
                  className="flex justify-between text-sm"
                  data-ocid={`checkout.pay_item.${idx + 1}`}
                >
                  <span className="text-muted-foreground truncate mr-2">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-accent">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Delivery address recap */}
            {address && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  Delivering to:
                </span>{" "}
                {address.addressLine1}, {address.city} – {address.pincode}
              </div>
            )}

            {/* Pay button */}
            <Button
              type="button"
              className="w-full btn-primary text-base py-3"
              onClick={() => void handlePayment()}
              disabled={isProcessingPayment}
              data-ocid="checkout.pay_button"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Pay ₹{total.toLocaleString("en-IN")} now
                </>
              )}
            </Button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-smooth"
              data-ocid="checkout.back_button"
            >
              ← Back to Review
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
