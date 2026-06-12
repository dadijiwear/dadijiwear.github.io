"use client";

import { useCallback, useEffect, useState } from "react";

type ReturnItem = {
  id: string;
  quantity: number;
  orderItem: {
    id: string;
    productName: string;
    ageGroup: string;
    color: string;
    quantity: number;
    unitPrice: string;
  };
};

type ReturnRequest = {
  id: string;
  status: string;
  reason: string;
  details: string | null;
  resolutionNote: string | null;
  requestedAt: string;
  reviewedAt: string | null;
  completedAt: string | null;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string | null;
    totalAmount: string;
    refundAmount: string;
  };
  items: ReturnItem[];
};

const STATUS_OPTIONS = ["", "REQUESTED", "APPROVED", "REJECTED", "PICKED_UP", "RECEIVED", "REFUNDED"];
const LIMIT = 20;

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<ReturnRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [razorpayRefundId, setRazorpayRefundId] = useState("");

  const [createOrderNumber, setCreateOrderNumber] = useState("");
  const [createOrder, setCreateOrder] = useState<any | null>(null);
  const [createQuantities, setCreateQuantities] = useState<Record<string, number>>({});
  const [createReason, setCreateReason] = useState("");
  const [createDetails, setCreateDetails] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/admin/returns?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load return requests");

      setReturns(json.returnRequests || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load return requests");
    } finally {
      setLoading(false);
    }
  }, [status, search, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadOrderForReturn = async () => {
    setCreateError("");
    setCreateSuccess("");
    setCreateOrder(null);
    setCreateQuantities({});

    const orderNumber = createOrderNumber.trim();

    if (!orderNumber) {
      setCreateError("Enter an order number");
      return;
    }

    try {
      const searchRes = await fetch(`/api/admin/orders?search=${encodeURIComponent(orderNumber)}&limit=5`, {
        cache: "no-store",
      });
      const searchJson = await searchRes.json().catch(() => null);

      if (!searchRes.ok) throw new Error(searchJson?.error || "Failed to find order");

      const match = (searchJson.orders || []).find((o: any) => o.orderNumber === orderNumber);

      if (!match) {
        setCreateError("Order not found");
        return;
      }

      const detailRes = await fetch(`/api/admin/orders/${match.id}`, { cache: "no-store" });
      const detailJson = await detailRes.json().catch(() => null);

      if (!detailRes.ok) throw new Error(detailJson?.error || "Failed to load order");

      setCreateOrder(detailJson.order);
    } catch (err: any) {
      setCreateError(err?.message || "Failed to load order");
    }
  };

  const submitAdminReturn = async () => {
    if (!createOrder) return;
    setCreateError("");
    setCreateSuccess("");

    if (!createReason.trim()) {
      setCreateError("Please enter a reason");
      return;
    }

    const items = Object.entries(createQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([orderItemId, quantity]) => ({ orderItemId, quantity }));

    if (items.length === 0) {
      setCreateError("Select at least one item to return");
      return;
    }

    setCreateLoading(true);

    try {
      const res = await fetch("/api/admin/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: createOrder.id,
          reason: createReason.trim(),
          details: createDetails.trim(),
          items,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to create return request");

      setCreateSuccess(`Return request created (status: ${json.returnRequest.status})`);
      setCreateOrder(null);
      setCreateOrderNumber("");
      setCreateQuantities({});
      setCreateReason("");
      setCreateDetails("");
      await load();
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create return request");
    } finally {
      setCreateLoading(false);
    }
  };
  const openReturn = async (id: string) => {
    setActionError("");
    setSelected(null);
    setResolutionNote("");
    setRazorpayRefundId("");

    try {
      const res = await fetch(`/api/admin/returns/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load return request");

      setSelected(json.returnRequest);
    } catch (err: any) {
      setActionError(err?.message || "Failed to load return request");
    }
  };

  const runAction = async (action: string) => {
    if (!selected) return;
    setActionLoading(true);
    setActionError("");

    try {
      const body: any = { action };
      if (action === "REJECT") body.resolutionNote = resolutionNote;
      if (action === "REFUND") body.razorpayRefundId = razorpayRefundId;

      const res = await fetch(`/api/admin/returns/${selected.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Action failed");

      await openReturn(selected.id);
      await load();
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
        .raw-admin * { all: revert; }
        .raw-admin { max-width: 1100px; margin: 0 auto; padding: 20px; background: #fff; color: #000; }
        .raw-admin table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
        .raw-admin th, .raw-admin td { border: 1px solid #000; padding: 6px 10px; text-align: left; vertical-align: top; }
      `}</style>

      <h1>Return Requests</h1>
      <p>
        <a href="/admin">Back to Dashboard</a>
        {"   "}
        <a href="/admin/orders">Order Management</a>
      </p>
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
                void load();
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
            void load();
          }}
        >
          Search
        </button>
      </div>

      <hr />

      <h2>Create Return Request</h2>

      <div style={{ margin: "10px 0" }}>
        <label>
          Order Number:{" "}
          <input
            type="text"
            value={createOrderNumber}
            onChange={(e) => setCreateOrderNumber(e.target.value)}
            placeholder="ORD-XXXXXXXX-XXXXXXXX"
            size={30}
          />
        </label>
        {"  "}
        <button onClick={loadOrderForReturn}>Load Order</button>
      </div>

      {createError && <p style={{ color: "red" }}>{createError}</p>}
      {createSuccess && <p style={{ color: "green" }}>{createSuccess}</p>}

      {createOrder && (
        <div style={{ margin: "10px 0" }}>
          <p>
            Customer: {createOrder.customerName} ({createOrder.customerEmail})
            <br />
            Order Status: {createOrder.status}
          </p>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Ordered Qty</th>
                <th>Return Qty</th>
              </tr>
            </thead>
            <tbody>
              {createOrder.items.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td>{item.ageGroup}</td>
                  <td>{item.color}</td>
                  <td>{item.quantity}</td>
                  <td>
                    <select
                      value={createQuantities[item.id] || 0}
                      onChange={(e) =>
                        setCreateQuantities((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                      }
                    >
                      {Array.from({ length: item.quantity + 1 }, (_, n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <label>
              Reason:{" "}
              <input type="text" value={createReason} onChange={(e) => setCreateReason(e.target.value)} size={40} />
            </label>
          </p>
          <p>
            <label>
              Details:{" "}
              <input type="text" value={createDetails} onChange={(e) => setCreateDetails(e.target.value)} size={50} />
            </label>
          </p>

          <button disabled={createLoading} onClick={submitAdminReturn}>
            Create Return Request
          </button>
        </div>
      )}

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Requested</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td>{r.order.orderNumber}</td>
                  <td>
                    {r.order.customerName}
                    <br />
                    {r.order.customerEmail}
                  </td>
                  <td>{r.reason}</td>
                  <td>{r.status}</td>
                  <td>{new Date(r.requestedAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => openReturn(r.id)}>View</button>
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr>
                  <td colSpan={6}>No return requests found.</td>
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

      {selected && (
        <>
          <hr />
          <h2>Return Request for {selected.order.orderNumber}</h2>
          <p>
            <button onClick={() => setSelected(null)}>Close</button>
          </p>

          {actionError && <p style={{ color: "red" }}>{actionError}</p>}

          <h3>Customer</h3>
          <p>
            {selected.order.customerName}
            <br />
            {selected.order.customerEmail}
            <br />
            {selected.order.customerPhone}
          </p>

          <h3>Order</h3>
          <p>
            Total: ₹{selected.order.totalAmount}
            <br />
            Already Refunded: ₹{selected.order.refundAmount}
            <br />
            Payment Method: {selected.order.paymentMethod || "—"}
          </p>

          <h3>Reason</h3>
          <p>
            {selected.reason}
            {selected.details && (
              <>
                <br />
                {selected.details}
              </>
            )}
          </p>

          <h3>Items to Return</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Return Qty</th>
                <th>Unit Price</th>
                <th>Refund Amount</th>
              </tr>
            </thead>
            <tbody>
              {selected.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.orderItem.productName}</td>
                  <td>{item.orderItem.ageGroup}</td>
                  <td>{item.orderItem.color}</td>
                  <td>{item.quantity}</td>
                  <td>₹{item.orderItem.unitPrice}</td>
                  <td>₹{(Number(item.orderItem.unitPrice) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Status</h3>
          <p>
            Status: <strong>{selected.status}</strong>
            <br />
            Requested: {new Date(selected.requestedAt).toLocaleString()}
            <br />
            {selected.reviewedAt && (
              <>
                Reviewed: {new Date(selected.reviewedAt).toLocaleString()}
                <br />
              </>
            )}
            {selected.completedAt && (
              <>
                Completed: {new Date(selected.completedAt).toLocaleString()}
                <br />
              </>
            )}
            {selected.resolutionNote && (
              <>
                Note: {selected.resolutionNote}
                <br />
              </>
            )}
          </p>

          <h3>Actions</h3>

          {selected.status === "REQUESTED" && (
            <div>
              <button disabled={actionLoading} onClick={() => runAction("APPROVE")}>
                Approve
              </button>
              {"   "}
              <label>
                Rejection reason:{" "}
                <input type="text" value={resolutionNote} onChange={(e) => setResolutionNote(e.target.value)} size={30} />
              </label>
              {"   "}
              <button disabled={actionLoading} onClick={() => runAction("REJECT")}>
                Reject
              </button>
            </div>
          )}

          {selected.status === "APPROVED" && (
            <div>
              <button disabled={actionLoading} onClick={() => runAction("RECEIVE")}>
                Mark as Received
              </button>
            </div>
          )}

          {selected.status === "RECEIVED" && (
            <div>
              <label>
                Razorpay Refund ID (optional, for online payments):{" "}
                <input type="text" value={razorpayRefundId} onChange={(e) => setRazorpayRefundId(e.target.value)} size={30} />
              </label>
              {"   "}
              <button disabled={actionLoading} onClick={() => runAction("REFUND")}>
                Mark as Refunded
              </button>
            </div>
          )}

          {["REJECTED", "REFUNDED"].includes(selected.status) && <p>No further actions available.</p>}
        </>
      )}
    </div>
  );
}
