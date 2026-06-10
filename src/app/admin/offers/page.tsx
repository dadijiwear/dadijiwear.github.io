"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Edit2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function OffersAdmin() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newOffer, setNewOffer] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '/shop',
    buttonText: 'Shop Now',
    order: 0
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch('/api/offers');
      const data = await res.json();
      if (data.success) setOffers(data.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer),
      });
      const data = await res.json();
      if (data.success) {
        setOffers([...offers, data.data]);
        setNewOffer({
          title: '',
          subtitle: '',
          image: '',
          link: '/shop',
          buttonText: 'Shop Now',
          order: offers.length + 1
        });
      }
    } catch (error) {
      console.error("Error adding offer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-serif text-dadi-green-dark">Manage Hero Carousel</h1>
      </div>

      {/* Add Offer Form */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Slide</h2>
        <form onSubmit={handleAddOffer} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={newOffer.title}
              onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. Summer Sale 50% Off"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subtitle</label>
            <input
              type="text"
              value={newOffer.subtitle}
              onChange={(e) => setNewOffer({ ...newOffer, subtitle: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="e.g. For limited time only"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Image URL</label>
            <input
              type="text"
              value={newOffer.image}
              onChange={(e) => setNewOffer({ ...newOffer, image: e.target.value })}
              className="w-full p-2 border rounded-md"
              placeholder="https://..."
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Button Text</label>
            <input
              type="text"
              value={newOffer.buttonText}
              onChange={(e) => setNewOffer({ ...newOffer, buttonText: e.target.value })}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} className="mr-2" />}
              Add Slide to Carousel
            </Button>
          </div>
        </form>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p>Loading carousel slides...</p>
        ) : offers.length === 0 ? (
          <p>No slides added yet. Using default fallback slides.</p>
        ) : (
          offers.map((offer) => (
            <div key={offer._id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="h-40 relative bg-gray-100">
                {offer.image ? (
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                   <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-dadi-green"><Edit2 size={16} /></button>
                   <button className="p-2 bg-white rounded-full shadow-md text-gray-600 hover:text-dadi-red"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h3 className="font-bold">{offer.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{offer.subtitle}</p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">Order: {offer.order}</span>
                  <span className={`text-xs px-2 py-1 rounded ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
