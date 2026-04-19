import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";

const DELIVERY_THRESHOLD = 999;
const DELIVERY_FEE = 49;

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  const subtotal = getTotalPrice();
  const deliveryFee = subtotal > DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div
        className="min-h-[70vh] flex flex-col items-center justify-center gap-6 px-4"
        data-ocid="cart.empty_state"
      >
        <div className="rounded-full bg-muted p-8">
          <ShoppingCart className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground">
            Looks like you haven't added anything yet.
          </p>
        </div>
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
          <Button
            type="button"
            className="btn-primary"
            data-ocid="cart.start_shopping_button"
          >
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-display font-bold text-foreground mb-6">
        Shopping Cart ({items.length} item{items.length !== 1 ? "s" : ""})
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left column: Cart items ── */}
        <div className="flex-1 space-y-4" data-ocid="cart.list">
          {items.map((item, idx) => (
            <Card
              key={item.productId}
              className="card-shadow"
              data-ocid={`cart.item.${idx + 1}`}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product image */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.image || "/assets/images/placeholder.svg"}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover border border-border"
                    />
                  </div>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-display font-semibold text-foreground truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          by {item.sellerName}
                        </p>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth flex-shrink-0"
                        aria-label="Remove item"
                        data-ocid={`cart.delete_button.${idx + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price + quantity row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity selector */}
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="px-3 py-1.5 hover:bg-muted transition-smooth text-foreground"
                          aria-label="Decrease quantity"
                          data-ocid={`cart.decrease_button.${idx + 1}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold border-x border-border min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="px-3 py-1.5 hover:bg-muted transition-smooth text-foreground"
                          aria-label="Increase quantity"
                          data-ocid={`cart.increase_button.${idx + 1}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <div className="text-right">
                        <div className="font-display font-bold text-foreground">
                          ₹
                          {(item.price * item.quantity).toLocaleString("en-IN")}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-xs text-muted-foreground">
                            ₹{item.price.toLocaleString("en-IN")} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Right column: Order Summary ── */}
        <div className="lg:w-80 xl:w-96 flex-shrink-0">
          <Card
            className="card-shadow sticky top-24"
            data-ocid="cart.order_summary"
          >
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Item breakdown */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground truncate mr-2 max-w-[160px]">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-foreground flex-shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2 text-sm">
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
                {deliveryFee > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Add ₹
                    {(DELIVERY_THRESHOLD - subtotal + 1).toLocaleString(
                      "en-IN",
                    )}{" "}
                    more for free delivery
                  </p>
                )}
              </div>

              <Separator />

              <div className="flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span className="text-accent">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              <Button
                type="button"
                className="w-full btn-primary text-base py-3"
                onClick={() => void navigate({ to: "/checkout" })}
                data-ocid="cart.checkout_button"
              >
                Proceed to Checkout
              </Button>

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
                {" "}
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  data-ocid="cart.continue_shopping_button"
                >
                  Continue Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
