"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Edit2, Loader2 } from 'lucide-react';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory),
      });
      const data = await res.json();
      if (data.success) {
        setCategories([...categories, data.data]);
        setNewCategory({ name: '', description: '' });
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-dadi-green-dark">Manage Categories</h1>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Category Name</label>
            <input
              type="text"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. Winter Wear"
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Description (Optional)</label>
            <input
              type="text"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="Brief description..."
            />
          </div>
          <Button type="submit" disabled={isSubmitting} className="mb-[2px]">
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} className="mr-2" />}
            Add
          </Button>
        </form>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Loading categories...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">No categories found.</td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="border-b last:border-0">
                  <td className="p-4 font-medium">{cat.name}</td>
                  <td className="p-4 text-gray-600 text-sm">{cat.slug}</td>
                  <td className="p-4 text-gray-500 text-sm">{cat.description || '-'}</td>
                  <td className="p-4 text-right space-x-2">
                    <button className="text-gray-400 hover:text-dadi-green transition">
                      <Edit2 size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-dadi-red transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
