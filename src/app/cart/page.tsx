"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/store";

export default function CartPage() {
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!actionError) return;
    const t = setTimeout(() => setActionError(null), 3000);
      return () => clearTimeout(t);
  }, [actionError]);

  const {
    cart,
    currentUser,
    authReady,
    bagLoading,
    hydrateAuth,
    refreshCart,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);
  {/* we do not need this, this effect force reloads the cart and sets it to default quantity.
  useEffect(() => {
    if (authReady && currentUser) {
      void refreshCart();
    }
  }, [authReady, currentUser, refreshCart]); */}
  
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (!authReady || bagLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-custom">Loading your bag...</div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card border border-border-custom rounded-2xl p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-dadi-gold/10 flex items-center justify-center text-dadi-gold">
              <Lock size={24} />
            </div>
          </div>
          <h1 className="text-3xl font-serif text-dadi-green-dark mb-3">Your Bag</h1>
          
          {actionError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium">
            ⚠ {actionError}
          </div>
          )}
          
        <p className="text-muted-custom mb-6">Please sign in to view and manage your bag.</p>
          <Link href="/account">
            <Button variant="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="bg-card border border-border-custom rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-3xl font-serif text-dadi-green-dark mb-3">Your Bag is Empty</h1>
          <p className="text-muted-custom mb-6">Add a few items to continue.</p>
          <Link href="/shop">
            <Button variant="primary">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <h1 className="text-3xl font-serif text-dadi-green-dark mb-8 border-b pb-4">Your Bag</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 bg-card p-6 rounded-2xl shadow-sm border border-border-custom">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 py-5 border-b border-border-custom last:border-b-0"
            >
              <div className="w-20 h-24 bg-muted-custom/10 rounded-md overflow-hidden shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-lg text-foreground leading-tight">{item.name}</h3>
                <p className="text-muted-custom text-sm mt-1">
                  Size: {item.selectedSize || "-"} 
                  {item.color ? ` · Color: ${item.color}` : ""} · Qty: {item.quantity}
                </p>
                <p className="font-bold text-dadi-green dark:text-dadi-gold mt-2">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const result = await updateCartQuantity(item.id, Math.max(1, item.quantity - 1));
                        if (!result.success) setActionError(result.message);
                      }}
                    className="w-9 h-9 rounded-full border border-border-custom flex items-center justify-center"
                    >
                    <Minus size={16} />
                  </button>
                  <span className="min-w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button
                  type="button"
                  onClick={async () => {
                    const result = await updateCartQuantity(item.id, item.quantity + 1);
                    if (!result.success) setActionError(result.message);
                  }}
                  className="w-9 h-9 rounded-full border border-border-custom flex items-center justify-center"
                >
                  <Plus size={16} />
                </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-dadi-red hover:text-red-600 hover:bg-dadi-red/10 rounded-full transition"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="lg:w-1/3">
          <div className="bg-card p-6 rounded-2xl shadow-md border border-dadi-gold/30 sticky top-24">
            <h2 className="text-xl font-serif font-bold mb-4 text-foreground">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6 pb-6 border-b border-border-custom">
              <div className="flex justify-between">
                <span className="text-muted-custom">Subtotal</span>
                <span className="font-medium text-foreground">₹{total.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-custom">Shipping</span>
                <span className="font-medium text-green-600 dark:text-green-400">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="font-serif text-lg text-foreground">Total</span>
              <span className="font-bold text-2xl text-dadi-green-dark dark:text-dadi-gold">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>

            <Link href="/checkout" className="block w-full">
              <Button variant="primary" className="w-full py-3 text-lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
