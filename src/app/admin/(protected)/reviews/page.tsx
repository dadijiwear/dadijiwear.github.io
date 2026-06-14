"use client";

import { useCallback, useEffect, useState } from "react";

type Review = {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  verifiedPurchase: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  product: { name: string; pid: string; slug: string };
};

const LIMIT = 20;

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/admin/reviews?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load reviews");

      setReviews(json.reviews || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionId(id);
    setError("");

    try {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to update review");

      await load();
    } catch (err: any) {
      setError(err?.message || "Failed to update review");
    } finally {
      setActionId(null);
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

      <h1>Reviews</h1>
      <p>
        <a href="/admin">Back to Dashboard</a> {" ||  "}
        <a href="/admin/orders">Order Management</a> {" ||  "}
        <a href="/admin/returns">Returns</a> {" ||  "}
        <a href="/admin/products">Products</a> {" || "}
        <a href="/admin/coupons">Coupons</a>{" ||  "}
      </p>
      <hr />

      <div style={{ margin: "10px 0" }}>
        <label>
          Status:{" "}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="">All</option>
          </select>
        </label>
      </div>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Title</th>
                <th>Comment</th>
                <th>Verified</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                  <td>{r.product.name} ({r.product.pid})</td>
                  <td>{r.user.name || r.user.email}</td>
                  <td>{r.rating} / 5</td>
                  <td>{r.title || "—"}</td>
                  <td style={{ maxWidth: 300 }}>{r.comment}</td>
                  <td>{r.verifiedPurchase ? "Yes" : "No"}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status !== "APPROVED" && (
                      <button disabled={actionId === r.id} onClick={() => act(r.id, "APPROVE")}>
                        Approve
                      </button>
                    )}
                    {" "}
                    {r.status !== "REJECTED" && (
                      <button disabled={actionId === r.id} onClick={() => act(r.id, "REJECT")}>
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={9}>No reviews found.</td>
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
    </div>
  );
}
