"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPaymentStatus } from "@/lib/format";

type OrderItem = {
  id: string;
  productName: string;
  ageGroup: string;
  color: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

type StatusHistoryEntry = {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  note: string | null;
  createdAt: string;
};

type PaymentEventEntry = {
  id: string;
  provider: string;
  eventType: string;
  createdAt: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  totalAmount: string;
  subtotal: string;
  discountAmount: string;
  shippingAmount: string;
  couponCode: string | null;
  trackingNumber: string | null;
  courierName: string | null;
  createdAt: string;
  items: OrderItem[];
  statusHistory?: StatusHistoryEntry[];
  paymentEvents?: PaymentEventEntry[];
};

const STATUS_OPTIONS = ["", "PENDING", "PAID", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED", "REFUNDED"];
const PAYMENT_METHOD_OPTIONS = ["", "RAZORPAY", "COD"];
const LIMIT = 20;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (paymentMethod) params.set("paymentMethod", paymentMethod);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/admin/orders?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load orders");

      setOrders(json.orders || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [status, paymentMethod, search, page]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const openOrder = async (id: string) => {
    setDetailLoading(true);
    setActionError("");
    setSelectedOrder(null);

    try {
      const res = await fetch(`/api/admin/orders/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load order");

      setSelectedOrder(json.order);
      setTrackingNumber(json.order?.trackingNumber || "");
      setCourierName(json.order?.courierName || "");
    } catch (err: any) {
      setActionError(err?.message || "Failed to load order");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrder = () => {
    setSelectedOrder(null);
    setActionError("");
  };

  const runAction = async (action: string) => {
    if (!selectedOrder) return;
    setActionLoading(true);
    setActionError("");

    try {
      const body: any = { action };
      if (action === "SHIP") {
        body.trackingNumber = trackingNumber;
        body.courierName = courierName;
      }

      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Action failed");

      await openOrder(selectedOrder.id);
      await loadOrders();
    } catch (err: any) {
      setActionError(err?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="raw-admin">
      <style>{`
        .raw-admin * {
          all: revert;
        }
        .raw-admin {
          max-width: 1100px;
          margin: 0 auto;
          padding: 20px;
          background: #fff;
          color: #000;
        }
        .raw-admin table {
          border-collapse: collapse;
          width: 100%;
          margin-bottom: 10px;
        }
        .raw-admin th,
        .raw-admin td {
          border: 1px solid #000;
          padding: 6px 10px;
          text-align: left;
          vertical-align: top;
        }
      `}</style>

      <h1>Order Management</h1>
      <p><a href="/admin">Back to Dashboard</a> {"   "} <a href="/admin/returns">Returns</a></p>
      <hr />

      <div style={{ margin: "10px 0" }}>
        <label>
          Status:{" "}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt || "All"}</option>
            ))}
          </select>
        </label>
        {"   "}
        <label>
          Payment Method:{" "}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
          >
            {PAYMENT_METHOD_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt || "All"}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>
          Search:{" "}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                void loadOrders();
              }
            }}
            placeholder="Order number, name, email, or phone"
            size={40}
          />
        </label>
        {"  "}
        <button
          onClick={() => {
            setPage(1);
            void loadOrders();
          }}
        >
          Search
        </button>
      </div>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Order no.</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Method</th>
                <th>Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>
                    {order.customerName}
                    <br />
                    {order.customerEmail}
                  </td>
                  <td>₹{order.totalAmount}</td>
                  <td>{order.status}</td>
                  <td>{formatPaymentStatus(order.paymentStatus)}</td>
                  <td>{order.paymentMethod}</td>
                  <td>{new Date(order.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => openOrder(order.id)}>View</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={8}>No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div style={{ margin: "10px 0" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            {"   "}
            Page {page} of {totalPages}
            {"   "}
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Next
            </button>
          </div>
        </>
      )}

      {selectedOrder && (
        <>
          <hr />
          <h2>Order {selectedOrder.orderNumber}</h2>
          <p><button onClick={closeOrder}>Close</button></p>

          {detailLoading && <p>Loading order...</p>}
          {actionError && <p style={{ color: "red" }}>{actionError}</p>}

          <h3>Customer</h3>
          <p>
            {selectedOrder.customerName}
            <br />
            {selectedOrder.customerEmail}
            <br />
            {selectedOrder.customerPhone}
          </p>

          <h3>Shipping Address</h3>
          <p>{selectedOrder.shippingAddress}</p>

          <h3>Items</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.ageGroup}</td>
                  <td>{item.color}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.unitPrice}</td>
                  <td>₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Order Totals</h3>
          <p>
            Subtotal: ₹{selectedOrder.subtotal}
            <br />
            Discount: ₹{selectedOrder.discountAmount} {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}
            <br />
            Shipping: ₹{selectedOrder.shippingAmount}
            <br />
            <strong>Total: ₹{selectedOrder.totalAmount}</strong>
          </p>

          <h3>Status</h3>
          <p>
            Order Status: <strong>{selectedOrder.status}</strong>
            <br />
            Payment Status: <strong>{formatPaymentStatus(selectedOrder.paymentStatus)}</strong>
            <br />
            Payment Method: {selectedOrder.paymentMethod || "—"}
            <br />
            {selectedOrder.trackingNumber && (
              <>
                Tracking: {selectedOrder.trackingNumber} ({selectedOrder.courierName})
                <br />
              </>
            )}
          </p>

          <h3>Actions</h3>
          <p>
            {(selectedOrder.status === "PENDING" || selectedOrder.status === "PAID") && (
              <button disabled={actionLoading} onClick={() => runAction("CONFIRM")}>
                Confirm Order
              </button>
            )}
            {"   "}
            {["PENDING", "PAID", "CONFIRMED"].includes(selectedOrder.status) && (
              <button disabled={actionLoading} onClick={() => runAction("CANCEL")}>
                Cancel Order
              </button>
            )}
            {selectedOrder.status !== "PENDING" &&
              selectedOrder.status !== "PAID" &&
              selectedOrder.status !== "CONFIRMED" &&
              selectedOrder.status !== "SHIPPED" && <span>No action required.</span>}
          </p>

          {selectedOrder.status === "CONFIRMED" && (
            <p>
              <label>
                Tracking Number:{" "}
                <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
              </label>
              {"   "}
              <label>
                Courier:{" "}
                <input type="text" value={courierName} onChange={(e) => setCourierName(e.target.value)} />
              </label>
              {"   "}
              <button disabled={actionLoading} onClick={() => runAction("SHIP")}>
                Mark as Shipped
              </button>
            </p>
          )}

          {selectedOrder.status === "SHIPPED" && (
            <p>
              <button disabled={actionLoading} onClick={() => runAction("DELIVER")}>
                Mark as Delivered
              </button>
            </p>
          )}

          <hr />
          <h3>Status History</h3>
          <ul>
            {(selectedOrder.statusHistory || []).map((h) => (
              <li key={h.id}>
                {new Date(h.createdAt).toLocaleString()} {"|"} {h.fromStatus || "-"} {"-->"} {h.toStatus}
                {h.note ? ` (${h.note})` : ""}
              </li>
            ))}
            {(!selectedOrder.statusHistory || selectedOrder.statusHistory.length === 0) && <li>No history.</li>}
          </ul>

          <h3>Payment Events</h3>
          <ul>
            {(selectedOrder.paymentEvents || []).map((p) => (
              <li key={p.id}>
                {new Date(p.createdAt).toLocaleString()} — {p.provider} / {p.eventType}
              </li>
            ))}
            {(!selectedOrder.paymentEvents || selectedOrder.paymentEvents.length === 0) && <li>No payment events.</li>}
          </ul>
        </>
      )}
    </div>
  );
}
