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
