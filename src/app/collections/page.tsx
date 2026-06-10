"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { useStore } from "@/store";
import { ArrowRight, Clock } from "lucide-react";

export default function CollectionsPage() {
  const products = useStore((state) => state.products);

  const girlsProducts = products.filter(p => p.category === "Girls");
  const boysProducts = products.filter(p => p.category === "Boys");
  const nightwearProducts = products.filter(p => p.category === "Nightwear");
  const summerProducts = products.filter(p => p.category === "Summer Sets");

  return (
    <div className="bg-dadi-cream min-h-screen">

      {/* Hero */}
      <section className="relative bg-dadi-green text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dadi-gold rounded-full mix-blend-multiply filter blur-[120px] transform translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-dadi-red rounded-full mix-blend-multiply filter blur-[100px] transform -translate-x-1/4 translate-y-1/4"></div>
        </div>
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-24 text-center relative z-10">
          <span className="text-dadi-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4 block">Browse By Category</span>
          <h1 className="text-4xl md:text-6xl font-serif mb-4">
            Our <span className="text-dadi-gold italic">Collections</span>
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">Carefully curated categories designed for every little fashionista.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-8 py-16 space-y-20">

        {/* Girls Collection */}
        <section className="fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold flex items-center gap-3">
                <span className="w-2 h-8 bg-dadi-red rounded-full inline-block"></span>
                Girls Collection
              </h2>
              <p className="text-muted-custom mt-2 ml-5">Elegant designs for your little princess</p>
            </div>
            <Link href="/shop" className="text-dadi-green font-semibold text-sm hover:text-dadi-gold transition flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {girlsProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
            {girlsProducts.length === 0 && (
              <div className="col-span-full text-center py-12 bg-card rounded-xl border border-border-custom">
                <p className="text-muted-custom">Products coming soon in this category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Boys Collection — Coming Soon */}
        <section className="fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold flex items-center gap-3">
                <span className="w-2 h-8 bg-dadi-green rounded-full inline-block"></span>
                Boys Collection
                <span className="shimmer-badge text-dadi-green dark:text-dadi-gold text-xs font-bold px-3 py-1 rounded-full ml-2 flex items-center gap-1">
                  <Clock size={12} /> COMING SOON
                </span>
              </h2>
              <p className="text-muted-custom mt-2 ml-5">Cool styles for your little champion — launching soon!</p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-border-custom bg-card">
            <div className="absolute inset-0 bg-linear-to-r from-dadi-green/5 to-dadi-gold/5"></div>
            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 items-center">
              <div className="space-y-6">
                <div className="shimmer-badge w-fit text-dadi-green dark:text-dadi-gold text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2">
                  <Clock size={16} /> Coming Soon
                </div>
                <h3 className="text-2xl md:text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold">
                  Something Amazing is<br /><span className="text-dadi-gold italic">Brewing!</span>
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  We&apos;re working hard behind the scenes to bring you the most stylish and comfortable boys
                  collection ever. Built with the same 21 years of expertise and love that defines Dadijwears.
                  Stay tuned for cool kurtas, smart casuals, and trendy ethnic sets for your little heroes!
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="px-4 py-2 bg-dadi-green/5 border border-dadi-green/15 rounded-lg text-sm text-dadi-green dark:text-dadi-gold font-medium">
                    ✦ Ethnic Kurtas
                  </div>
                  <div className="px-4 py-2 bg-dadi-green/5 border border-dadi-green/15 rounded-lg text-sm text-dadi-green dark:text-dadi-gold font-medium">
                    ✦ Smart Casuals
                  </div>
                  <div className="px-4 py-2 bg-dadi-green/5 border border-dadi-green/15 rounded-lg text-sm text-dadi-green dark:text-dadi-gold font-medium">
                    ✦ Night Sets
                  </div>
                </div>
                <p className="text-sm text-muted-custom italic">Expected launch: Summer 2026</p>
              </div>
              <div className="relative">
                <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg border-4 border-card img-shine">
                  <Image
                    src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80"
                    alt="Boys Collection Preview"
                    fill
                    sizes="(max-width: 768px) 100vw, 400px"
                    className="object-cover grayscale-30 opacity-90"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-dadi-gold text-dadi-green rounded-xl px-5 py-3 shadow-lg font-serif font-bold pulse-glow z-10">
                  Coming Soon ✦
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nightwear */}
        <section className="fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold flex items-center gap-3">
                <span className="w-2 h-8 bg-dadi-blue rounded-full inline-block"></span>
                Nightwear
              </h2>
              <p className="text-muted-custom mt-2 ml-5">Dreamy comfort for peaceful nights</p>
            </div>
            <Link href="/shop" className="text-dadi-green font-semibold text-sm hover:text-dadi-gold transition flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {nightwearProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Summer Sets */}
        <section className="fade-in-up">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold flex items-center gap-3">
                <span className="w-2 h-8 bg-dadi-gold rounded-full inline-block"></span>
                Summer Cord Sets
              </h2>
              <p className="text-muted-custom mt-2 ml-5">Cool & breathable picks for sunny days</p>
            </div>
            <Link href="/shop" className="text-dadi-green font-semibold text-sm hover:text-dadi-gold transition flex items-center gap-1">
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {summerProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
