"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Package, MapPin, ArrowLeft, Download, Truck } from "lucide-react";

type OrderItem = {
  id: string;
  productName: string;
  ageGroup: string;
  color: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  shippingAddress: string;
  subtotal: string;
  discountAmount: string;
  shippingAmount: string;
  totalAmount: string;
  couponCode: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  items: OrderItem[];
};

const STATUS_BADGE: Record<string, string> = {
  FAILED: "bg-red-100 text-red-700",
  CANCELLED: "bg-red-100 text-red-700",
  PAID: "bg-emerald-100/60 text-emerald-950",
  CONFIRMED: "bg-emerald-100/60 text-emerald-950",
  SHIPPED: "bg-emerald-100/60 text-emerald-950",
  DELIVERED: "bg-emerald-100/60 text-emerald-950",
  REFUNDED: "bg-purple-100 text-purple-700",
  PENDING: "bg-amber-100 text-amber-800",
};

function formatDateTime(value: string | null) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/orders/${id}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);

        if (!res.ok) throw new Error(json?.error || "Failed to load order");

        setOrder(json.order);
      } catch (err: any) {
        setError(err?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <p className="text-muted-custom">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <p className="text-red-500 mb-4">{error || "Order not found"}</p>
        <Link href="/account" className="text-dadi-green dark:text-dadi-gold font-medium hover:underline">
          Back to Account
        </Link>
      </div>
    );
  }

  const timeline = [
    { label: "Order Placed", date: order.createdAt },
    { label: "Confirmed", date: order.confirmedAt },
    { label: "Shipped", date: order.shippedAt },
    { label: "Delivered", date: order.deliveredAt },
    { label: "Cancelled", date: order.cancelledAt },
  ].filter((step) => step.date) as { label: string; date: string }[];

  const subtotal = Number(order.subtotal);
  const discount = Number(order.discountAmount);
  const shipping = Number(order.shippingAmount);
  const total = Number(order.totalAmount);

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <Link
        href="/account"
        className="inline-flex items-center gap-1 text-sm text-dadi-green dark:text-dadi-gold font-medium hover:underline mb-4"
      >
        <ArrowLeft size={16} />
        Back to Account
      </Link>

      <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-dadi-green-dark dark:text-dadi-gold">
              Order {order.orderNumber}
            </h1>
            <p className="text-sm text-muted-custom mt-1">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {order.status}
          </span>
        </div>

        < a        
          href={`/api/orders/${order.id}/receipt`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-custom text-sm font-medium text-foreground hover:bg-muted-custom/10 transition"
        >
          <Download size={16} />
          Download Receipt
        </a>
      </div>

      <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
          <Truck size={18} className="text-dadi-green dark:text-dadi-gold" />
          Order Status
        </h2>

        <ul className="space-y-3">
          {timeline.map((step) => (
            <li key={step.label} className="flex items-center gap-3 text-sm">
              <span className="w-2 h-2 rounded-full bg-dadi-green dark:bg-dadi-gold shrink-0" />
              <span className="font-medium text-foreground">{step.label}</span>
              <span className="text-muted-custom">— {formatDateTime(step.date)}</span>
            </li>
          ))}
        </ul>

        {order.trackingNumber && (
          <div className="mt-4 pt-4 border-t border-border-custom text-sm">
            <p className="text-muted-custom">
              Tracking Number: <span className="font-medium text-foreground">{order.trackingNumber}</span>
            </p>
            {order.courierName && (
              <p className="text-muted-custom">
                Courier: <span className="font-medium text-foreground">{order.courierName}</span>
              </p>
            )}
          </div>
        )}
      </div>

      <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
          <Package size={18} className="text-dadi-green dark:text-dadi-gold" />
          Items
        </h2>

        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-sm border-b border-border-custom pb-3 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium text-foreground">{item.productName}</p>
                <p className="text-muted-custom">
                  {item.ageGroup} · {item.color} · Qty {item.quantity}
                </p>
              </div>
              <p className="font-medium text-foreground">₹{Number(item.totalPrice).toLocaleString("en-IN")}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border-custom space-y-1 text-sm">
          <div className="flex justify-between text-muted-custom">
            <span>Subtotal</span>
            <span className="text-foreground">₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-dadi-green dark:text-dadi-gold">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span>
              <span>−₹{discount.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-custom">
            <span>Shipping</span>
            <span className="text-foreground">{shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "Free"}</span>
          </div>
          <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border-custom mt-2">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-serif font-semibold text-foreground mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-dadi-green dark:text-dadi-gold" />
          Shipping Address
        </h2>
        <p className="text-sm text-muted-custom whitespace-pre-line">{order.shippingAddress}</p>
        <p className="text-sm text-muted-custom mt-3">Payment Method: {order.paymentMethod || "—"}</p>
      </div>
    </div>
  );
}
