"use client";

import { useCallback, useEffect, useState } from "react";

type ProductVariant = {
  id: string;
  ageGroup: string;
  color: string;
  sku: string;
  stock: number;
  reserved: number;
  active: boolean;
};

type ProductImage = {
  id: string;
  color: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

type Product = {
  id: string;
  pid: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  collection: string;
  season: string | null;
  mrp: string;
  price: string;
  discountPercent: string;
  active: boolean;
  featured: boolean;
  isNew: boolean;
  variants: ProductVariant[];
  images: ProductImage[];
};

const LIMIT = 20;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Product | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [productForm, setProductForm] = useState<any>(null);
  const [productSaving, setProductSaving] = useState(false);
  const [productError, setProductError] = useState("");
  const [productSuccess, setProductSuccess] = useState("");

  const [variantForms, setVariantForms] = useState<Record<string, any>>({});
  const [variantSavingId, setVariantSavingId] = useState<string | null>(null);
  const [variantError, setVariantError] = useState("");

  const [newVariant, setNewVariant] = useState({ ageGroup: "", color: "", sku: "", stock: "0" });
  const [newVariantLoading, setNewVariantLoading] = useState(false);
  const [newVariantError, setNewVariantError] = useState("");

  const [newProduct, setNewProduct] = useState({
    pid: "",
    slug: "",
    name: "",
    category: "",
    collection: "",
    season: "",
    description: "",
    mrp: "",
    price: "",
    discountPercent: "0",
  });
  const [newProductLoading, setNewProductLoading] = useState(false);
  const [newProductError, setNewProductError] = useState("");
  const [newProductSuccess, setNewProductSuccess] = useState("");

  const [uploadColor, setUploadColor] = useState("");
  const [uploadAlt, setUploadAlt] = useState("");
  const [uploadIsPrimary, setUploadIsPrimary] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (activeFilter) params.set("active", activeFilter);
      params.set("page", String(page));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load products");

      setProducts(json.products || []);
      setTotal(json.total || 0);
    } catch (err: any) {
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [search, activeFilter, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openProduct = async (id: string) => {
    setDetailLoading(true);
    setProductError("");
    setProductSuccess("");
    setVariantError("");
    setSelected(null);

    try {
      const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to load product");

      const product = json.product as Product;
      setSelected(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        category: product.category,
        collection: product.collection,
        season: product.season || "",
        mrp: product.mrp,
        price: product.price,
        discountPercent: product.discountPercent,
        featured: product.featured,
        isNew: product.isNew,
        active: product.active,
      });

      const forms: Record<string, any> = {};
      for (const v of product.variants) {
        forms[v.id] = { ageGroup: v.ageGroup, color: v.color, stock: String(v.stock), active: v.active, reason: "" };
      }
      setVariantForms(forms);
    } catch (err: any) {
      setProductError(err?.message || "Failed to load product");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeProduct = () => {
    setSelected(null);
    setProductForm(null);
  };

  const saveProduct = async () => {
    if (!selected || !productForm) return;
    setProductSaving(true);
    setProductError("");
    setProductSuccess("");

    try {
      const res = await fetch(`/api/admin/products/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productForm),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to save product");

      setProductSuccess("Product updated");
      await openProduct(selected.id);
      await load();
    } catch (err: any) {
      setProductError(err?.message || "Failed to save product");
    } finally {
      setProductSaving(false);
    }
  };

  const saveVariant = async (variantId: string) => {
    if (!selected) return;
    setVariantSavingId(variantId);
    setVariantError("");

    try {
      const form = variantForms[variantId];

      const res = await fetch(`/api/admin/products/${selected.id}/variants/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: form.ageGroup,
          color: form.color,
          active: form.active,
          stock: Number(form.stock),
          reason: form.reason,
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to update variant");

      await openProduct(selected.id);
      await load();
    } catch (err: any) {
      setVariantError(err?.message || "Failed to update variant");
    } finally {
      setVariantSavingId(null);
    }
  };

  const addVariant = async () => {
    if (!selected) return;
    setNewVariantLoading(true);
    setNewVariantError("");

    try {
      if (!newVariant.ageGroup.trim() || !newVariant.color.trim() || !newVariant.sku.trim()) {
        throw new Error("Size, color, and SKU are required");
      }

      const res = await fetch(`/api/admin/products/${selected.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageGroup: newVariant.ageGroup.trim(),
          color: newVariant.color.trim(),
          sku: newVariant.sku.trim(),
          stock: Number(newVariant.stock || 0),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to add variant");

      setNewVariant({ ageGroup: "", color: "", sku: "", stock: "0" });
      await openProduct(selected.id);
      await load();
    } catch (err: any) {
      setNewVariantError(err?.message || "Failed to add variant");
    } finally {
      setNewVariantLoading(false);
    }
  };

  const saveAllVariants = async () => {
    if (!selected) return;
    setVariantError("");
    setVariantSavingId("ALL");

    try {
      const changed = selected.variants.filter((v) => {
        const form = variantForms[v.id];
        if (!form) return false;
        return (
          form.ageGroup !== v.ageGroup ||
          form.color !== v.color ||
          form.active !== v.active ||
          Number(form.stock) !== v.stock
        );
      });

      if (changed.length === 0) {
        setVariantError("No changes to save");
        return;
      }

      for (const v of changed) {
        const form = variantForms[v.id];

        const res = await fetch(`/api/admin/products/${selected.id}/variants/${v.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ageGroup: form.ageGroup,
            color: form.color,
            active: form.active,
            stock: Number(form.stock),
            reason: form.reason,
          }),
        });

        const json = await res.json().catch(() => null);

        if (!res.ok) throw new Error(json?.error || `Failed to update ${form.ageGroup} / ${form.color}`);
      }

      await openProduct(selected.id);
      await load();
    } catch (err: any) {
      setVariantError(err?.message || "Failed to save changes");
    } finally {
      setVariantSavingId(null);
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!selected) return;
    if (!window.confirm("Delete this variant? This cannot be undone.")) return;

    setVariantSavingId(variantId);
    setVariantError("");

    try {
      const res = await fetch(`/api/admin/products/${selected.id}/variants/${variantId}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to delete variant");

      await openProduct(selected.id);
      await load();
    } catch (err: any) {
      setVariantError(err?.message || "Failed to delete variant");
    } finally {
      setVariantSavingId(null);
    }
  };

  const createProduct = async () => {
    setNewProductError("");
    setNewProductSuccess("");

    if (
      !newProduct.pid.trim() ||
      !newProduct.slug.trim() ||
      !newProduct.name.trim() ||
      !newProduct.category.trim() ||
      !newProduct.collection.trim() ||
      !newProduct.mrp ||
      !newProduct.price
    ) {
      setNewProductError("PID, slug, name, category, collection, MRP, and price are required");
      return;
    }

    setNewProductLoading(true);

    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newProduct,
          mrp: Number(newProduct.mrp),
          price: Number(newProduct.price),
          discountPercent: Number(newProduct.discountPercent || 0),
        }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to create product");

      setNewProductSuccess(`Product "${json.product.name}" created. Add sizes/colors and images below.`);
      setNewProduct({
        pid: "",
        slug: "",
        name: "",
        category: "",
        collection: "",
        season: "",
        description: "",
        mrp: "",
        price: "",
        discountPercent: "0",
      });
      await load();
      await openProduct(json.product.id);
    } catch (err: any) {
      setNewProductError(err?.message || "Failed to create product");
    } finally {
      setNewProductLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!selected) return;
    setUploadError("");

    if (!uploadFile) {
      setUploadError("Choose an image file");
      return;
    }

    if (!uploadColor.trim()) {
      setUploadError("Color is required");
      return;
    }

    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("color", uploadColor.trim());
      formData.append("alt", uploadAlt.trim());
      formData.append("isPrimary", String(uploadIsPrimary));

      const res = await fetch(`/api/admin/products/${selected.id}/images`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to upload image");

      setUploadColor("");
      setUploadAlt("");
      setUploadIsPrimary(false);
      setUploadFile(null);
      await openProduct(selected.id);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image");
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!selected) return;
    if (!window.confirm("Delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/products/${selected.id}/images/${imageId}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);

      if (!res.ok) throw new Error(json?.error || "Failed to delete image");

      await openProduct(selected.id);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to delete image");
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

      <h1>Product Management</h1>
      <p>
        <a href="/admin">Back to Dashboard</a> {"  ||  "}
        <a href="/admin/orders">Order Management</a>{"  ||  "}
        <a href="/admin/returns">Returns</a> {" ||  "}
        <a href="/admin/reviews">Reviews</a>{" || "}
        <a href="/admin/coupons">Coupons</a>{" ||  "}
        </p>
      <hr />

      <div style={{ margin: "10px 0" }}>
        <label>
          Active:{" "}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </label>
        {"   "}
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
            placeholder="Name, PID, or slug"
            size={30}
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

      <h2>Create New Product</h2>
      {newProductError && (
        <p style={{ color: "red" }}>
          {newProductError}{" "}
          <button className="dismiss-btn" onClick={() => setNewProductError("")}>OK</button>
        </p>
      )}
      {newProductSuccess && (
        <p style={{ color: "green" }}>
          {newProductSuccess}{" "}
          <button className="dismiss-btn" onClick={() => setNewProductSuccess("")}>OK</button>
        </p>
      )}

      <div>
        <div className="field">
          <label>PID</label>
          <input type="text" value={newProduct.pid} onChange={(e) => setNewProduct((p) => ({ ...p, pid: e.target.value }))} placeholder="PID0004" size={10} />
        </div>
        <div className="field">
          <label>Slug</label>
          <input type="text" value={newProduct.slug} onChange={(e) => setNewProduct((p) => ({ ...p, slug: e.target.value }))} placeholder="my-new-product" size={25} />
        </div>
        <div className="field">
          <label>Name</label>
          <input type="text" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} size={30} />
        </div>
      </div>
      <div>
        <div className="field">
          <label>Category</label>
          <input type="text" value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} size={15} />
        </div>
        <div className="field">
          <label>Collection</label>
          <input type="text" value={newProduct.collection} onChange={(e) => setNewProduct((p) => ({ ...p, collection: e.target.value }))} size={15} />
        </div>
        <div className="field">
          <label>Season</label>
          <input type="text" value={newProduct.season} onChange={(e) => setNewProduct((p) => ({ ...p, season: e.target.value }))} size={10} />
        </div>
      </div>
      <div>
        <div className="field">
          <label>MRP</label>
          <input type="number" value={newProduct.mrp} onChange={(e) => setNewProduct((p) => ({ ...p, mrp: e.target.value }))} size={8} />
        </div>
        <div className="field">
          <label>Price</label>
          <input type="number" value={newProduct.price} onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))} size={8} />
        </div>
        <div className="field">
          <label>Discount %</label>
          <input type="number" value={newProduct.discountPercent} onChange={(e) => setNewProduct((p) => ({ ...p, discountPercent: e.target.value }))} size={5} />
        </div>
      </div>
      <div>
        <div className="field" style={{ display: "block" }}>
          <label>Description</label>
          <textarea value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} rows={2} cols={60} />
        </div>
      </div>
      <p>
        <button disabled={newProductLoading} onClick={createProduct}>Create Product</button>
      </p>

      <hr />

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}


      {!loading && !error && (
        <>
          <table>
            <thead>
              <tr>
                <th>PID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Total Stock</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
                return (
                  <tr key={p.id}>
                    <td>{p.pid}</td>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>₹{p.price}</td>
                    <td>{totalStock}</td>
                    <td>{p.active ? "Yes" : "No"}</td>
                    <td>
                      <button onClick={() => openProduct(p.id)}>View</button>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr>
                  <td colSpan={7}>No products found.</td>
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

      {detailLoading && <p>Loading product...</p>}

      {selected && productForm && (
        <>
          <hr />
          <h2>
            {selected.name} ({selected.pid})
          </h2>
          <p>
            <button onClick={closeProduct}>Close</button>
          </p>

          {productError && <p style={{ color: "red" }}>{productError}</p>}
          {productSuccess && <p style={{ color: "green" }}>{productSuccess}</p>}

          <h3>Details</h3>
          <table>
            <tbody>
              <tr>
                <th>Name</th>
                <td>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, name: e.target.value }))}
                    size={50}
                  />
                </td>
              </tr>
              <tr>
                <th>Description</th>
                <td>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    cols={60}
                  />
                </td>
              </tr>
              <tr>
                <th>Category</th>
                <td>
                  <input
                    type="text"
                    value={productForm.category}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, category: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Collection</th>
                <td>
                  <input
                    type="text"
                    value={productForm.collection}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, collection: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Season</th>
                <td>
                  <input
                    type="text"
                    value={productForm.season}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, season: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>MRP</th>
                <td>
                  <input
                    type="number"
                    value={productForm.mrp}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, mrp: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Price</th>
                <td>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, price: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Discount %</th>
                <td>
                  <input
                    type="number"
                    value={productForm.discountPercent}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, discountPercent: e.target.value }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Featured</th>
                <td>
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, featured: e.target.checked }))}
                  />
                </td>
              </tr>
              <tr>
                <th>New</th>
                <td>
                  <input
                    type="checkbox"
                    checked={productForm.isNew}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, isNew: e.target.checked }))}
                  />
                </td>
              </tr>
              <tr>
                <th>Active (visible on shop)</th>
                <td>
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) => setProductForm((f: any) => ({ ...f, active: e.target.checked }))}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          <p>
            <button disabled={productSaving} onClick={saveProduct}>
              Save Product Details
            </button>
          </p>

          <h3>Variants (Sizes / Colors / Stock)</h3>
            {variantError && <p style={{ color: "red" }}>{variantError}</p>}
              <p>
                <button disabled={variantSavingId !== null} onClick={saveAllVariants}>
                  Save All Changes
                </button>
              </p>

          <table>
            <thead>
              <tr>
                <th>Size</th>
                <th>Color</th>
                <th>SKU</th>
                <th>Stock</th>
                <th>Reserved</th>
                <th>Active</th>
                <th>Reason (for stock change)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selected.variants.map((v) => {
                const form = variantForms[v.id] || {};
                return (
                  <tr key={v.id}>
                    <td>
                      <input
                        type="text"
                        value={form.ageGroup ?? v.ageGroup}
                        onChange={(e) =>
                          setVariantForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], ageGroup: e.target.value } }))
                        }
                        size={8}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.color ?? v.color}
                        onChange={(e) =>
                          setVariantForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], color: e.target.value } }))
                        }
                        size={10}
                      />
                    </td>
                    <td>{v.sku}</td>
                    <td>
                      <input
                        type="number"
                        value={form.stock ?? String(v.stock)}
                        onChange={(e) =>
                          setVariantForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], stock: e.target.value } }))
                        }
                        size={5}
                        min={0}
                      />
                    </td>
                    <td>{v.reserved}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={form.active ?? v.active}
                        onChange={(e) =>
                          setVariantForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], active: e.target.checked } }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={form.reason ?? ""}
                        onChange={(e) =>
                          setVariantForms((prev) => ({ ...prev, [v.id]: { ...prev[v.id], reason: e.target.value } }))
                        }
                        placeholder="Optional"
                        size={20}
                      />
                    </td>
                      <td>
                      <button
                        disabled={variantSavingId === v.id || variantSavingId === "ALL"}
                        onClick={() => saveVariant(v.id)}
                      >
                        Save
                      </button>
                      {"  "}
                      <button
                        disabled={variantSavingId === v.id || variantSavingId === "ALL"}
                        onClick={() => deleteVariant(v.id)}
                      >
                        Delete
                      </button>
                    </td>                  
                  </tr>
                );
              })}
            </tbody>
          </table>

        <h3>Images</h3>
          {uploadError && <p style={{ color: "red" }}>{uploadError}</p>}

          <table>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Color</th>
                <th>Alt Text</th>
                <th>Sort Order</th>
                <th>Primary</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {selected.images.map((img) => (
                <tr key={img.id}>
                  <td>
                    <img src={img.url} alt={img.alt || ""} style={{ width: 60, height: 80, objectFit: "cover" }} />
                  </td>
                  <td>{img.color}</td>
                  <td>{img.alt || "—"}</td>
                  <td>{img.sortOrder}</td>
                  <td>{img.isPrimary ? "Yes" : "No"}</td>
                  <td>
                    <button onClick={() => deleteImage(img.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {selected.images.length === 0 && (
                <tr>
                  <td colSpan={6}>No images yet.</td>
                </tr>
              )}
            </tbody>
          </table>

          <h4>Upload New Image</h4>
          <p>
            <label>
              File:{" "}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </label>
            {"   "}
            <label>
              Color: <input type="text" value={uploadColor} onChange={(e) => setUploadColor(e.target.value)} size={15} />
            </label>
            {"   "}
            <label>
              Alt Text: <input type="text" value={uploadAlt} onChange={(e) => setUploadAlt(e.target.value)} size={25} />
            </label>
            {"   "}
            <label>
              Primary: <input type="checkbox" checked={uploadIsPrimary} onChange={(e) => setUploadIsPrimary(e.target.checked)} />
            </label>
            {"   "}
            <button disabled={uploadLoading} onClick={uploadImage}>
              Upload
            </button>
          </p>
          
          <h3>Add New Size / Color</h3>
          {newVariantError && <p style={{ color: "red" }}>{newVariantError}</p>}
          <p>
            <label>
              Size:{" "}
              <input
                type="text"
                value={newVariant.ageGroup}
                onChange={(e) => setNewVariant((v) => ({ ...v, ageGroup: e.target.value }))}
                placeholder="e.g. 5-6Y"
                size={10}
              />
            </label>
            {"   "}
            <label>
              Color:{" "}
              <input
                type="text"
                value={newVariant.color}
                onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))}
                size={10}
              />
            </label>
            {"   "}
            <label>
              SKU:{" "}
              <input
                type="text"
                value={newVariant.sku}
                onChange={(e) => setNewVariant((v) => ({ ...v, sku: e.target.value }))}
                size={20}
              />
            </label>
            {"   "}
            <label>
              Initial Stock:{" "}
              <input
                type="number"
                value={newVariant.stock}
                onChange={(e) => setNewVariant((v) => ({ ...v, stock: e.target.value }))}
                size={5}
                min={0}
              />
            </label>
            {"   "}
            <button disabled={newVariantLoading} onClick={addVariant}>
              Add Variant
            </button>
          </p>
        </>
      )}
    </div>
  );
}
