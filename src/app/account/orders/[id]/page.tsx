"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Package, MapPin, ArrowLeft, Download, Truck, RotateCcw } from "lucide-react";

type OrderItem = {
  id: string;
  productName: string;
  ageGroup: string;
  color: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type ReturnRequestItemData = {
  id: string;
  orderItemId: string;
  quantity: number;
};

type ReturnRequestData = {
  id: string;
  status: string;
  reason: string;
  details: string | null;
  resolutionNote: string | null;
  requestedAt: string;
  items: ReturnRequestItemData[];
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
  returnRequests?: ReturnRequestData[];
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

const RETURN_STATUS_BADGE: Record<string, string> = {
  REQUESTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100/60 text-emerald-950",
  REJECTED: "bg-red-100 text-red-700",
  PICKED_UP: "bg-emerald-100/60 text-emerald-950",
  RECEIVED: "bg-emerald-100/60 text-emerald-950",
  REFUNDED: "bg-purple-100 text-purple-700",
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

  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [returnReason, setReturnReason] = useState("");
  const [returnDetails, setReturnDetails] = useState("");
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState(false);

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

  const handleSubmitReturn = async () => {
    if (!order) return;
    setReturnError("");

    if (!returnReason) {
      setReturnError("Please select a reason for the return.");
      return;
    }

    const items = Object.entries(returnQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }));

    if (items.length === 0) {
      setReturnError("Please select at least one item to return.");
      return;
    }

    setReturnSubmitting(true);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: returnReason,
          details: returnDetails,
          items,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to submit return request");

      setReturnSuccess(true);
      setOrder((prev) =>
        prev ? { ...prev, returnRequests: [json.returnRequest, ...(prev.returnRequests || [])] } : prev
      );
    } catch (err: any) {
      setReturnError(err?.message || "Failed to submit return request");
    } finally {
      setReturnSubmitting(false);
    }
  };

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

  const RETURN_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;
  const returnWindowExpired = order.deliveredAt
    ? Date.now() - new Date(order.deliveredAt).getTime() > RETURN_WINDOW_MS
    : true;

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
        
      {order.status === "DELIVERED" && (
        <div className="bg-card border border-border-custom rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-lg font-serif font-semibold text-foreground mb-4 flex items-center gap-2">
            <RotateCcw size={18} className="text-dadi-green dark:text-dadi-gold" />
            Returns
          </h2>

          {order.returnRequests && order.returnRequests.length > 0 && (
            <div className="mb-4 space-y-2 text-sm">
              {order.returnRequests.map((rr) => (
                <div key={rr.id} className="p-3 rounded-xl bg-muted-custom/10 border border-border-custom">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Return Request</span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                        RETURN_STATUS_BADGE[rr.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {rr.status}
                    </span>
                  </div>
                  <p className="text-muted-custom mt-1">Reason: {rr.reason}</p>
                  {rr.details && <p className="text-muted-custom">Details: {rr.details}</p>}
                  {rr.resolutionNote && <p className="text-muted-custom">Note: {rr.resolutionNote}</p>}
                  <p className="text-muted-custom text-xs mt-1">Requested on {formatDateTime(rr.requestedAt)}</p>
                </div>
              ))}
            </div>
          )}

          {(!order.returnRequests || order.returnRequests.length === 0) && (
            <div className="space-y-3">
              {returnSuccess ? (
                <p className="text-sm text-dadi-green dark:text-dadi-gold">Your return request has been submitted.</p>
              ) : returnWindowExpired ? (
                <p className="text-sm text-muted-custom">
                  The return window for this order has closed. Return should have been requested within 5 days of delivery.
                </p>
              ) : (
                <>

                <p className="text-sm font-medium text-foreground">Select items to return</p>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-foreground">
                        {item.productName} ({item.ageGroup}, {item.color}) · Qty {item.quantity}
                      </span>
                      <select
                        value={returnQuantities[item.id] || 0}
                        onChange={(e) =>
                          setReturnQuantities((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                        }
                        className="border border-border-custom rounded-lg px-2 py-1 bg-card text-foreground"
                      >
                        {Array.from({ length: item.quantity + 1 }, (_, n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                  ))}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Reason</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      className="w-full border border-border-custom rounded-lg px-3 py-2 bg-card text-foreground"
                    >
                      <option value="">Select a reason</option>
                      <option value="Wrong size or fit">Wrong size or fit</option>
                      <option value="Item defective or damaged">Item defective or damaged</option>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Additional details (optional)</label>
                    <textarea
                      rows={3}
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      className="w-full border border-border-custom rounded-lg px-3 py-2 bg-card text-foreground resize-none"
                    />
                  </div>

                  {returnError && <p className="text-sm text-red-500">{returnError}</p>}

                  <button
                    type="button"
                    disabled={returnSubmitting}
                    onClick={handleSubmitReturn}
                    className="px-4 py-2 rounded-xl border border-border-custom text-sm font-medium text-foreground hover:bg-muted-custom/10 transition"
                  >
                    {returnSubmitting ? "Submitting..." : "Submit Return Request"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

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
