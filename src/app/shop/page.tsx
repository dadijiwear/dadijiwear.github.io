"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/ui/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (data.success) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:px-8 bg-dadi-cream min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif text-dadi-green-dark dark:text-dadi-gold mb-4">
          Our Collection
        </h1>

        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of premium kidswear, crafted meticulously to
          bring comfort and style to your little ones.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-64 shrink">
          <div className="bg-card p-6 rounded-xl border border-border-custom shadow-sm sticky top-24">
            <h2 className="font-serif text-xl border-b border-border-custom pb-2 mb-4 text-foreground">
              Filters
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3 text-foreground">
                  Collections
                </h3>

                <ul className="space-y-2 text-sm text-muted-custom">
                  <li className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-dadi-green dark:accent-dadi-gold"
                    />
                    Boys Collection
                  </li>

                  <li className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-dadi-green dark:accent-dadi-gold"
                    />
                    Summer Collection
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium mb-3 text-foreground">
                  Price Range
                </h3>

                <input
                  type="range"
                  className="w-full accent-dadi-green dark:accent-dadi-gold"
                />

                <div className="flex justify-between text-xs text-muted-custom mt-2">
                  <span>₹0</span>
                  <span>₹2,000+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[420px] rounded-xl bg-card border border-border-custom animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-card border border-border-custom rounded-xl p-10 text-center">
              <h3 className="text-xl font-serif text-dadi-green-dark mb-2">
                No Products Found
              </h3>

              <p className="text-muted-custom">
                Products will appear here once added.
              </p>
            </div>
          ) : (
            <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
