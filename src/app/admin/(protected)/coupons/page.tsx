"use client";

import { useCallback, useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  name: string;
  type: "PERCENTAGE" | "FIXED";
  value: string;
  minOrderAmount: string;
  maxDiscountAmount: string | null;
  active: boolean;
  eligibilityType: "NONE" | "FIRST_ORDER" | "KIDS_AGE";
  oncePerUser: boolean;
  startsAt: string | null;
  endsAt: string | null;
  usageLimit: number | null;
  usageCount: number;
};

function toInputDate(value: string | null) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
}

const emptyNewCoupon = {
  code: "",
  name: "",
  type: "PERCENTAGE",
  value: "",
  minOrderAmount: "0",
  maxDiscountAmount: "",
  eligibilityType: "NONE",
  oncePerUser: false,
  active: true,
  startsAt: "",
  endsAt: "",
  usageLimit: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editForms, setEditForms] = useState<Record<string, any>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, string>>({});

  const [newCoupon, setNewCoupon] = useState<any>(emptyNewCoupon);
  const [newLoading, setNewLoading] = useState(false);
  const [newError, setNewError] = useState("");
  const [newSuccess, setNewSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/coupons", { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load coupons");

      setCoupons(json.coupons || []);

      const forms: Record<string, any> = {};
      for (const c of json.coupons || []) {
        forms[c.id] = {
          name: c.name,
          type: c.type,
          value: c.value,
          minOrderAmount: c.minOrderAmount,
          maxDiscountAmount: c.maxDiscountAmount ?? "",
          eligibilityType: c.eligibilityType,
          oncePerUser: c.oncePerUser,
          active: c.active,
          startsAt: toInputDate(c.startsAt),
          endsAt: toInputDate(c.endsAt),
          usageLimit: c.usageLimit ?? "",
        };
      }
      setEditForms(forms);
    } catch (err: any) {
      setError(err?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const saveCoupon = async (id: string) => {
    setSavingId(id);
    setRowError((prev) => ({ ...prev, [id]: "" }));

    try {
      const form = editForms[id];

      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          value: form.value,
          minOrderAmount: form.minOrderAmount,
          maxDiscountAmount: form.maxDiscountAmount === "" ? null : form.maxDiscountAmount,
          eligibilityType: form.eligibilityType,
          oncePerUser: form.oncePerUser,
          active: form.active,
          startsAt: form.startsAt || null,
          endsAt: form.endsAt || null,
          usageLimit: form.usageLimit === "" ? null : form.usageLimit,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to update coupon");

      await load();
    } catch (err: any) {
      setRowError((prev) => ({ ...prev, [id]: err?.message || "Failed to update coupon" }));
    } finally {
      setSavingId(null);
    }
  };

  const createCoupon = async () => {
    setNewError("");
    setNewSuccess("");

    if (!newCoupon.code.trim() || !newCoupon.name.trim() || !newCoupon.value) {
      setNewError("Code, name, and value are required");
      return;
    }

    setNewLoading(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCoupon,
          maxDiscountAmount: newCoupon.maxDiscountAmount === "" ? null : newCoupon.maxDiscountAmount,
          startsAt: newCoupon.startsAt || null,
          endsAt: newCoupon.endsAt || null,
          usageLimit: newCoupon.usageLimit === "" ? null : newCoupon.usageLimit,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to create coupon");

      setNewSuccess(`Coupon "${json.coupon.code}" created`);
      setNewCoupon(emptyNewCoupon);
      await load();
    } catch (err: any) {
      setNewError(err?.message || "Failed to create coupon");
    } finally {
      setNewLoading(false);
    }
  };

  return (
    <div className="raw-admin">
      <style>{`
        .raw-admin * { all: revert; }
        .raw-admin { max-width: 1200px; margin: 0 auto; padding: 20px; background: #fff; color: #000; }
        .raw-admin table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
        .raw-admin th, .raw-admin td { border: 1px solid #000; padding: 6px 8px; text-align: left; vertical-align: top; font-size: 12px; }
        .raw-admin input,
        .raw-admin select,
        .raw-admin textarea {
          padding: 4px 6px;
          margin: 2px 0;
          font-size: 13px;
          border: 1px solid #999;
          border-radius: 3px;
          box-sizing: border-box;
        }
        .raw-admin input[type="checkbox"] {
          width: auto;
          margin: 0;
        }
        .raw-admin input[type="number"] {
          width: 80px;
        }
        .raw-admin input[type="text"] {
          min-width: 100px;
        }
        .raw-admin input[type="datetime-local"] {
          min-width: 190px;
        }
        .raw-admin button {
          padding: 4px 10px;
          cursor: pointer;
        }
        .raw-admin label {
          display: inline-block;
          margin: 4px 0;
        }
        .raw-admin .field {
          display: inline-block;
          vertical-align: top;
          margin: 0 16px 14px 0;
        }
        .raw-admin .field label {
          display: block;
          font-weight: bold;
          margin-bottom: 4px;
          font-size: 12px;
        }
        .raw-admin .field-checkbox {
          display: inline-block;
          vertical-align: top;
          margin: 0 16px 14px 0;
          padding-top: 20px;
        }
        .raw-admin .field-checkbox label {
          font-weight: bold;
          font-size: 12px;
          margin-left: 4px;
          vertical-align: middle;
        }
        .raw-admin .field-checkbox input {
          vertical-align: middle;
          margin: 0;
        }
        .raw-admin .dismiss-btn {
          margin-left: 8px;
          font-size: 11px;
          padding: 1px 8px;
        }
      `}</style>

      <h1>Coupon Management</h1>
      <p>
        <a href="/admin">Back to Dashboard</a> {" ||  "}
        <a href="/admin/orders">Order Management</a> {" ||  "}
        <a href="/admin/returns">Returns</a> {" ||  "}
        <a href="/admin/products">Products</a>  {" ||  "}
        <a href="/admin/reviews">Reviews</a>
      </p>
      <hr />

      <h2>Create New Coupon</h2>
      {newError && (
        <p style={{ color: "red" }}>
          {newError}{" "}
          <button className="dismiss-btn" onClick={() => setNewError("")}>OK</button>
        </p>
      )}
      {newSuccess && (
        <p style={{ color: "green" }}>
          {newSuccess}{" "}
          <button className="dismiss-btn" onClick={() => setNewSuccess("")}>OK</button>
        </p>
      )}

      <div>
        <div className="field">
          <label>Code</label>
          <input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon((c: any) => ({ ...c, code: e.target.value.toUpperCase() }))} size={15} />
        </div>
        <div className="field">
          <label>Name</label>
          <input type="text" value={newCoupon.name} onChange={(e) => setNewCoupon((c: any) => ({ ...c, name: e.target.value }))} size={30} />
        </div>
        <div className="field">
          <label>Type</label>
          <select value={newCoupon.type} onChange={(e) => setNewCoupon((c: any) => ({ ...c, type: e.target.value }))}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed Amount</option>
          </select>
        </div>
        <div className="field">
          <label>Value</label>
          <input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon((c: any) => ({ ...c, value: e.target.value }))} size={6} />
        </div>
      </div>
      <div>
        <div className="field">
          <label>Min Order</label>
          <input type="number" value={newCoupon.minOrderAmount} onChange={(e) => setNewCoupon((c: any) => ({ ...c, minOrderAmount: e.target.value }))} size={6} />
        </div>
        <div className="field">
          <label>Max Discount</label>
          <input type="number" value={newCoupon.maxDiscountAmount} onChange={(e) => setNewCoupon((c: any) => ({ ...c, maxDiscountAmount: e.target.value }))} size={6} placeholder="none" />
        </div>
        <div className="field">
          <label>Eligibility</label>
          <select value={newCoupon.eligibilityType} onChange={(e) => setNewCoupon((c: any) => ({ ...c, eligibilityType: e.target.value }))}>
            <option value="NONE">Anyone</option>
            <option value="FIRST_ORDER">First Order Only</option>
            <option value="KIDS_AGE">Newborn (&le; 6 months)</option>
          </select>
        </div>
        <div className="field-checkbox">
          <input type="checkbox" checked={newCoupon.oncePerUser} onChange={(e) => setNewCoupon((c: any) => ({ ...c, oncePerUser: e.target.checked }))} />
          <label>Once Per User</label>
        </div>
        <div className="field-checkbox">
          <input type="checkbox" checked={newCoupon.active} onChange={(e) => setNewCoupon((c: any) => ({ ...c, active: e.target.checked }))} />
          <label>Active</label>
        </div>
      </div>
      <div>
        <div className="field">
          <label>Starts At</label>
          <input type="datetime-local" value={newCoupon.startsAt} onChange={(e) => setNewCoupon((c: any) => ({ ...c, startsAt: e.target.value }))} />
        </div>
        <div className="field">
          <label>Ends At</label>
          <input type="datetime-local" value={newCoupon.endsAt} onChange={(e) => setNewCoupon((c: any) => ({ ...c, endsAt: e.target.value }))} />
        </div>
        <div className="field">
          <label>Usage Limit</label>
          <input type="number" value={newCoupon.usageLimit} onChange={(e) => setNewCoupon((c: any) => ({ ...c, usageLimit: e.target.value }))} size={6} placeholder="unlimited" />
        </div>
      </div>
      <p>
        <button disabled={newLoading} onClick={createCoupon}>Create Coupon</button>
      </p>
      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && (
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Max Discount</th>
              <th>Eligibility</th>
              <th>Once/User</th>
              <th>Active</th>
              <th>Starts At</th>
              <th>Ends At</th>
              <th>Usage Limit</th>
              <th>Used</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const form = editForms[c.id] || {};
              return (
                <tr key={c.id}>
                  <td><strong>{c.code}</strong></td>
                  <td>
                    <input type="text" value={form.name ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], name: e.target.value } }))} size={20} />
                  </td>
                  <td>
                    <select value={form.type ?? "PERCENTAGE"} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], type: e.target.value } }))}>
                      <option value="PERCENTAGE">Percentage</option>
                      <option value="FIXED">Fixed</option>
                    </select>
                  </td>
                  <td>
                    <input type="number" value={form.value ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], value: e.target.value } }))} size={5} />
                  </td>
                  <td>
                    <input type="number" value={form.minOrderAmount ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], minOrderAmount: e.target.value } }))} size={5} />
                  </td>
                  <td>
                    <input type="number" value={form.maxDiscountAmount ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], maxDiscountAmount: e.target.value } }))} size={5} placeholder="none" />
                  </td>
                  <td>
                    <select value={form.eligibilityType ?? "NONE"} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], eligibilityType: e.target.value } }))}>
                      <option value="NONE">Anyone</option>
                      <option value="FIRST_ORDER">First Order</option>
                      <option value="KIDS_AGE">Newborn</option>
                    </select>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={form.oncePerUser ?? false} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], oncePerUser: e.target.checked } }))} />
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <input type="checkbox" checked={form.active ?? false} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], active: e.target.checked } }))} />
                  </td>
                  <td>
                    <input type="datetime-local" value={form.startsAt ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], startsAt: e.target.value } }))} />
                  </td>
                  <td>
                    <input type="datetime-local" value={form.endsAt ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], endsAt: e.target.value } }))} />
                  </td>
                  <td>
                    <input type="number" value={form.usageLimit ?? ""} onChange={(e) => setEditForms((p) => ({ ...p, [c.id]: { ...p[c.id], usageLimit: e.target.value } }))} size={5} placeholder="unlimited" />
                  </td>
                  <td>{c.usageCount}</td>
                  <td>
                    <button disabled={savingId === c.id} onClick={() => saveCoupon(c.id)}>Save</button>
                    {rowError[c.id] && (
                      <p style={{ color: "red", fontSize: 11 }}>
                        {rowError[c.id]}{" "}
                        <button className="dismiss-btn" onClick={() => setRowError((p) => ({ ...p, [c.id]: "" }))}>OK</button>
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr><td colSpan={14}>No coupons yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
