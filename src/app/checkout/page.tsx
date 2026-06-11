"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store";
import { MapPin, Mail, Phone, User, Tag, X, Loader2, Wallet, CreditCard, ShieldCheck } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (document.getElementById("razorpay-checkout-script")) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    currentUser,
    authReady,
    bagLoading,
    hydrateAuth,
    refreshCart,
    clearCart,
  } = useStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (authReady && currentUser) {
      void refreshCart();
    }
  }, [authReady, currentUser, refreshCart]);

  useEffect(() => {
    if (currentUser?.address) {
      setShippingAddress(currentUser.address);
    }
  }, [currentUser]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await fetch("/api/checkout/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim() }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(json?.error || "Failed to apply coupon");
      }

      setCouponCode(json.couponCode);
      setDiscount(json.discountAmount);
      setCouponSuccess(`Coupon ${json.couponCode} applied`);
    } catch (err: any) {
      setCouponCode(null);
      setDiscount(0);
      setCouponError(err?.message || "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    try {
      await fetch("/api/checkout/apply-coupon", { method: "DELETE" });
    } finally {
      setCouponCode(null);
      setDiscount(0);
      setCouponInput("");
      setCouponError("");
      setCouponSuccess("");
      setCouponLoading(false);
    }
  };

  const openRazorpay = async () => {
    const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

    if (!key) {
      setError("Razorpay key is missing.");
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setError("Unable to load Razorpay checkout.");
      return;
    }

    const prepareRes = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddress }),
    });

    const prepareJson = await prepareRes.json().catch(() => null);

    if (!prepareRes.ok) {
      if (prepareRes.status === 401) {
        router.push("/account?next=/checkout");
        return;
      }
      throw new Error(prepareJson?.error || "Failed to create order");
    }

    const options = {
      key,
      amount: prepareJson.amount,
      currency: prepareJson.currency,
      name: "momnson.co",
      description: `Order ${prepareJson.orderNumber}`,
      order_id: prepareJson.razorpayOrderId,
      prefill: {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        contact: currentUser?.phone || "",
      },
      theme: {
        color: "#0f5f46",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
          fetch("/api/checkout/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: prepareJson.orderId,
              reason: "Payment cancelled by user",
            }),
          }).catch(() => {});
        },
      },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: prepareJson.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyJson = await verifyRes.json().catch(() => null);

          if (!verifyRes.ok) {
            throw new Error(verifyJson?.error || "Payment verification failed");
          }

          await clearCart();
          await refreshCart();
          router.push(`/account?order=${prepareJson.orderNumber}`);
        } catch (err: any) {
          setError(err?.message || "Payment verification failed.");
        } finally {
          setLoading(false);
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", (response: any) => {
      const reason = response?.error?.description || response?.error?.reason || "Payment failed";
      setError(reason);
      setLoading(false);

      fetch("/api/checkout/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: prepareJson.orderId,
          reason: `Payment failed: ${reason}`,
        }),
      }).catch(() => {});
    });

    razorpay.open();
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!currentUser) {
      router.push("/account?next=/checkout");
      return;
    }

    if (!cart.length) {
      setError("Your bag is empty.");
      return;
    }

    if (!shippingAddress.trim()) {
      setError("Please enter a shipping address.");
      return;
    }

    setLoading(true);

    try {
      if (paymentMethod === "cod") {
        const res = await fetch("/api/checkout/cod-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shippingAddress }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) {
          throw new Error(json?.error || "Failed to place order");
        }

        await clearCart();
        await refreshCart();
        router.push(`/account?order=${json.orderNumber}`);
        return;
      }

      await openRazorpay();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Checkout failed.");
    }
  };

  if (!authReady || bagLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-custom">Loading checkout...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card border border-border-custom rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-3xl font-serif text-dadi-green-dark mb-3">Checkout</h1>
          <p className="text-muted-custom mb-6">Please sign in to continue.</p>
          <Link href="/account?next=/checkout">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <h1 className="text-2xl font-serif mb-4 text-foreground">No items to checkout</h1>
        <Link href="/shop">
          <Button>Return to Shop</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold mb-8 border-b border-border-custom pb-4">
        Checkout
      </h1>

      {error ? (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium">
          {error}
        </div>
      ) : null}

      <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 space-y-6">
          <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-5">
              Delivery Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted-custom/10 border border-border-custom/50">
                <div className="w-9 h-9 rounded-full bg-dadi-green/10 dark:bg-dadi-gold/10 flex items-center justify-center text-dadi-green dark:text-dadi-gold shrink-0">
                  <User size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-custom">Full Name</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted-custom/10 border border-border-custom/50">
                <div className="w-9 h-9 rounded-full bg-dadi-green/10 dark:bg-dadi-gold/10 flex items-center justify-center text-dadi-green dark:text-dadi-gold shrink-0">
                  <Phone size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-custom">Phone</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.phone || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted-custom/10 border border-border-custom/50 sm:col-span-2">
                <div className="w-9 h-9 rounded-full bg-dadi-green/10 dark:bg-dadi-gold/10 flex items-center justify-center text-dadi-green dark:text-dadi-gold shrink-0">
                  <Mail size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-custom">Email</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-custom mb-4">
              Need to update your name, phone, or email?{" "}
              <Link href="/account" className="text-dadi-green dark:text-dadi-gold font-medium hover:underline">
                Edit your profile
              </Link>
              .
            </p>

            <label className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
              <MapPin size={16} className="text-dadi-green dark:text-dadi-gold" />
              Shipping Address
            </label>
            <textarea
              required
              rows={4}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="House no, street, area, city, state, PIN code"
              className="w-full p-3 border border-border-custom bg-card rounded-xl focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom resize-none"
            />
          </div>

          <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
              <Tag size={18} className="text-dadi-green dark:text-dadi-gold" />
              Have a Coupon?
            </h2>

            {couponCode ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40">
                <div>
                  <p className="text-sm font-semibold text-dadi-green dark:text-dadi-gold">
                    {couponCode}
                  </p>
                  <p className="text-xs text-muted-custom">
                    You saved ₹{discount.toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  disabled={couponLoading}
                  className="p-2 rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value.toUpperCase());
                    setCouponError("");
                    setCouponSuccess("");
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 p-3 border border-border-custom bg-card rounded-xl focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom uppercase"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-6 rounded-xl font-semibold"
                >
                  {couponLoading ? <Loader2 size={18} className="animate-spin" /> : "Apply"}
                </Button>
              </div>
            )}

            {couponError && (
              <p className="text-xs text-red-500 mt-2 font-medium">{couponError}</p>
            )}
            {couponSuccess && !couponError && (
              <p className="text-xs text-dadi-green dark:text-dadi-gold mt-2 font-medium">
                {couponSuccess}
              </p>
            )}
          </div>

          <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-serif font-semibold text-foreground mb-4">
              Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-dadi-green bg-dadi-green/5 dark:border-dadi-gold dark:bg-dadi-gold/10"
                    : "border-border-custom hover:border-muted-custom/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === "razorpay"
                      ? "bg-dadi-green text-white dark:bg-dadi-gold dark:text-dadi-green"
                      : "bg-muted-custom/10 text-muted-custom"
                  }`}
                >
                  <CreditCard size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Pay Online</p>
                  <p className="text-xs text-muted-custom mt-0.5">
                    UPI, Cards, NetBanking & Wallets
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                  paymentMethod === "cod"
                    ? "border-dadi-green bg-dadi-green/5 dark:border-dadi-gold dark:bg-dadi-gold/10"
                    : "border-border-custom hover:border-muted-custom/40"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                    paymentMethod === "cod"
                      ? "bg-dadi-green text-white dark:bg-dadi-gold dark:text-dadi-green"
                      : "bg-muted-custom/10 text-muted-custom"
                  }`}
                >
                  <Wallet size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                  <p className="text-xs text-muted-custom mt-0.5">
                    Pay when your order arrives
                  </p>
                </div>
              </button>
            </div>

            {paymentMethod === "razorpay" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-custom bg-muted-custom/10 border border-border-custom rounded-xl p-3">
                <ShieldCheck size={16} className="text-dadi-green dark:text-dadi-gold shrink-0" />
                Payments are encrypted and processed securely by Razorpay.
              </div>
            )}
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-card p-6 rounded-2xl shadow-md border border-dadi-gold/30 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-4 border-b border-border-custom pb-2 text-foreground">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <div className="w-12 h-16 bg-muted-custom/20 rounded shrink-0 overflow-hidden">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1 text-foreground">{item.name}</p>
                    <p className="text-muted-custom">
                      Qty: {item.quantity}
                      {item.selectedSize ? ` · ${item.selectedSize}` : ""}
                      {item.color ? ` · ${item.color}` : ""}
                    </p>
                  </div>
                  <p className="font-medium text-foreground">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-border-custom pt-4 space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-muted-custom">
                <span>Subtotal</span>
                <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-dadi-green dark:text-dadi-gold">
                  <span>Coupon Discount</span>
                  <span>−₹{discount.toLocaleString("en-IN")}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-custom">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-end mt-4 pt-2 border-t border-border-custom">
                <span className="font-serif text-lg font-bold text-foreground">Total</span>
                <span className="font-bold text-2xl text-dadi-green-dark dark:text-dadi-gold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full py-3 text-lg" disabled={loading}>
              {loading
                ? "Processing..."
                : paymentMethod === "cod"
                ? `Place Order · ₹${total.toLocaleString("en-IN")}`
                : `Pay ₹${total.toLocaleString("en-IN")}`}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
