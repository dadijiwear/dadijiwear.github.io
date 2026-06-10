"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store";

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: string;
};

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
  const [form, setForm] = useState<CheckoutForm>({
    fullName: "",
    email: "",
    phone: "",
    shippingAddress: "",
  });

  const total = useMemo(
    () => cart.reduce((acc, item) => acc + item.price * item.quantity, 0),
    [cart]
  );

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (authReady && currentUser) {
      void refreshCart();
    }
  }, [authReady, currentUser, refreshCart]);

  useEffect(() => {
    if (!currentUser) return;

    setForm((prev) => ({
      ...prev,
      fullName: currentUser.name || prev.fullName,
      email: currentUser.email || prev.email,
      phone: currentUser.phone || prev.phone,
      shippingAddress: currentUser.address || prev.shippingAddress,
    }));
  }, [currentUser]);

  const handleChange = (field: keyof CheckoutForm, value: string) => {
    setError("");
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
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
        name: form.fullName,
        email: form.email,
        contact: form.phone,
      },
      theme: {
        color: "#0f5f46",
      },
      modal: {
        ondismiss: () => {
          setLoading(false);
        },
      },
      handler: async (response: any) => {
        try {
          const verifyRes = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
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
      setError(response?.error?.description || "Payment failed.");
      setLoading(false);
    });

    razorpay.open();
  };

  const handleCheckout = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
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

      <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/40 rounded-xl flex items-center gap-3">
        <div className="w-10 h-10 bg-dadi-green dark:bg-dadi-gold rounded-full flex items-center justify-center text-white dark:text-dadi-green font-bold">
          {(currentUser.name || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">
            Ordering as {currentUser.name || "Customer"}
          </p>
          <p className="text-xs text-muted-custom">{currentUser.email}</p>
        </div>
      </div>

      {error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex flex-col lg:flex-row gap-10">
        <div className="lg:w-2/3">
          <form onSubmit={handleCheckout} className="space-y-8 bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border-custom">
            <section>
              <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">Shipping Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  required
                  type="text"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Full Name"
                  className="w-full p-3 border border-border-custom bg-card rounded-md focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom md:col-span-2"
                />
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email Address"
                  className="w-full p-3 border border-border-custom bg-card rounded-md focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom md:col-span-2"
                />
                <input
                  required
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone Number"
                  className="w-full p-3 border border-border-custom bg-card rounded-md focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom md:col-span-2"
                />
                <textarea
                  required
                  rows={4}
                  value={form.shippingAddress}
                  onChange={(e) => handleChange("shippingAddress", e.target.value)}
                  placeholder="Full shipping address"
                  className="w-full p-3 border border-border-custom bg-card rounded-md focus:outline-none focus:ring-1 focus:ring-dadi-green text-foreground placeholder:text-muted-custom md:col-span-2 resize-none"
                />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-serif font-semibold mb-4 text-foreground">Payment</h2>
              <div className="bg-muted-custom/10 p-4 border border-border-custom rounded-md text-sm text-muted-custom">
                UPI, NetBanking, cards, and wallets are handled securely by Razorpay.
              </div>
            </section>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? "Processing..." : `Pay ₹${total.toLocaleString("en-IN")}`}
            </Button>
          </form>
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
                    </p>
                  </div>
                  <p className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-border-custom pt-4 space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-muted-custom">
                <span>Subtotal</span>
                <span className="text-foreground">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-muted-custom">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400">Free</span>
              </div>
              <div className="flex justify-between items-end mt-4">
                <span className="font-serif text-lg font-bold text-foreground">Total</span>
                <span className="font-bold text-2xl text-dadi-green-dark dark:text-dadi-gold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
