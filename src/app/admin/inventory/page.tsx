"use client";

import { useStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import type { Product } from "@/store";
import { Plus, X, Pencil, Trash2, Loader2 } from "lucide-react";
import { useEffect } from "react";

// ── Product Form Modal ──
function ProductFormModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product;
  onSubmit: (data: Omit<Product, 'id'>) => void;
  title: string;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [mrp, setMrp] = useState(initialData?.mrp?.toString() || "");
  const [image, setImage] = useState(initialData?.image || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [sizes, setSizes] = useState(initialData?.sizes?.join(", ") || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [tagColor, setTagColor] = useState<Product["tagColor"]>(initialData?.tagColor || "orange");
  const [isNew, setIsNew] = useState(initialData?.isNew ?? true);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success) setDbCategories(data.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      price: parseFloat(price),
      mrp: mrp ? parseFloat(mrp) : undefined,
      image,
      images: image ? [image] : [],
      description,
      sizes: sizes ? sizes.split(",").map(s => s.trim()).filter(Boolean) : [],
      category,
      tagColor,
      isNew,
    });
    onClose();
  };

  const inputClass =
    "w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dadi-green/40 focus:border-dadi-green transition text-sm";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-200 z-10">
          <h2 className="text-lg font-serif text-gray-800 font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Rose Pink Ethnic Set" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
              <input type="number" required value={price} onChange={e => setPrice(e.target.value)} placeholder="950" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">MRP (₹)</label>
              <input type="number" value={mrp} onChange={e => setMrp(e.target.value)} placeholder="1499" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL *</label>
            <input type="url" required value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." className={inputClass} />
            {image && (
              <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the product..." className={inputClass + " resize-none"} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Sizes (comma-separated)</label>
            <input type="text" value={sizes} onChange={e => setSizes(e.target.value)} placeholder="2-3Y, 3-4Y, 4-5Y, 5-6Y" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass + " bg-white"}>
                <option value="">Select category</option>
                {dbCategories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
                {/* Fallbacks if DB empty */}
                {dbCategories.length === 0 && (
                  <>
                    <option value="Girls">Girls</option>
                    <option value="Boys">Boys</option>
                    <option value="Nightwear">Nightwear</option>
                    <option value="Summer Sets">Summer Sets</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tag Color</label>
              <select
                value={tagColor}
                onChange={e => setTagColor(e.target.value as Product["tagColor"])}
                className={inputClass + " bg-white"}
              >
                <option value="orange">Orange</option>
                <option value="green">Green</option>
                <option value="red">Red</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={isNew} onChange={() => setIsNew(!isNew)} className="accent-dadi-green w-4 h-4" />
            Mark as &quot;NEW&quot; product
          </label>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" className="flex-1 rounded-lg" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" className="flex-1 rounded-lg">
              {initialData ? "Save Changes" : "Add Product"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Inventory Page ──
export default function AdminInventory() {
  const { products: storeProducts, addProduct: storeAdd, updateProduct: storeUpdate, deleteProduct: storeDelete } = useStore();
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setDbProducts(data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (data: Omit<Product, 'id'>) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        setDbProducts([...dbProducts, result.data]);
        storeAdd(data); // Keep store in sync
      }
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEdit = async (data: Omit<Product, 'id'>) => {
    if (editingProduct) {
      // For now, we use the store update logic or implement a PUT api
      // storeUpdate(editingProduct._id || editingProduct.id, data);
      setEditingProduct(null);
    }
  };

  const handleDelete = async (id: string) => {
    // storeDelete(id);
    setDeleteConfirm(null);
  };

  const products = dbProducts.length > 0 ? dbProducts : storeProducts;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-serif text-gray-800 font-bold">Inventory Management</h1>
        <Button size="sm" onClick={() => setShowAddForm(true)} className="gap-1.5 rounded-lg">
          <Plus size={16} /> Add New Product
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-semibold w-16">Image</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">MRP</th>
                <th className="px-6 py-4 font-semibold">Sizes</th>
                <th className="px-6 py-4 font-semibold">Category/Tag</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    {product.isNew && <span className="text-xs text-dadi-green font-medium">NEW</span>}
                  </td>
                  <td className="px-6 py-4 text-dadi-green font-semibold">₹{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-400">
                    {product.mrp ? `₹${product.mrp.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-xs">
                    {product.sizes?.join(", ") || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full shadow-sm text-white ${
                        product.tagColor === 'red' ? 'bg-dadi-red' :
                        product.tagColor === 'green' ? 'bg-dadi-green' : 'bg-orange-500'
                      }`}>
                        {product.tagColor}
                      </span>
                      {product.category && (
                        <span className="text-xs text-gray-500">{product.category}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-dadi-gold hover:bg-dadi-gold/10 rounded-lg transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-sm text-gray-400 p-2">
        {products.length} product(s) in inventory
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSubmit={handleAdd}
        title="Add New Product"
      />

      {/* Edit Product Modal */}
      <ProductFormModal
        key={editingProduct?.id}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        initialData={editingProduct || undefined}
        onSubmit={handleEdit}
        title="Edit Product"
      />

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-serif font-bold text-gray-800 mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone. The product will be permanently removed from inventory.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-lg" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1 rounded-lg" onClick={() => handleDelete(deleteConfirm)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
