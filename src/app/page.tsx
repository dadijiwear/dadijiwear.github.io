"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ProductCard } from "@/components/ui/ProductCard";
import { useStore } from "@/store";
import { WavyDivider } from "@/components/ui/WavyDivider";
import { Heart, Droplets, Scissors, ShieldCheck, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [dbProducts, setDbProducts] = useState<any[] | null>([]);
  const mockProducts: any[] = [];
  const [loading, setLoading] = useState(true);
  const displayProducts = Array.isArray(dbProducts) && dbProducts.length > 0 ? dbProducts : mockProducts; 
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch("/api/products");
        const prodData = await prodRes.json();
        setDbProducts(Array.isArray(prodData.data) ? prodData.data : []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setDbProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative bg-dadi-green text-dadi-cream overflow-hidden"> 
        <div className="absolute bottom-[2px] left-0 right-0 h-px border-b border-dashed border-black/10 z-30"></div>

        <div className="relative flex flex-col md:flex-row min-h-[600px] md:h-[650px]">
          <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-20 relative z-10">
            <div className="max-w-xl space-y-8 fade-in-up">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] tracking-tight">
                  Premium Kidswear <br />
                  Crafted with Love & 21 Years <br />
                  of Experience <span className="text-dadi-gold opacity-50">—</span>
                </h1>
                <p className="text-lg md:text-xl text-dadi-cream/90 font-light leading-relaxed max-w-md">
                  Soft on Skin. Strong in Quality.<br />
                  Made for Every Child.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/shop">
                  <Button variant="primary" size="lg" className="rounded-md px-12 shadow-xl hover:scale-105 transition-transform active:scale-95 font-bold text-base bg-dadi-gold text-dadi-green border-none">
                    Shop Now
                  </Button>
                </Link>
                <Link href="/shop">
                  <Button variant="outline" size="lg" className="rounded-md px-10 border-white/30 bg-white/10 text-white hover:bg-white hover:text-dadi-green transition-all active:scale-95 font-bold text-base">
                    Explore Collection
                  </Button>
                </Link>
              </div>
            </div>


          </div>

          <div className="w-full md:w-1/2 relative h-[350px] md:h-auto">

            <div className="absolute inset-y-0 -left-20 w-40 bg-linear-to-r from-dadi-green via-dadi-green/80 to-transparent z-20 md:block hidden blur-xl"></div>
            <div className="absolute inset-y-0 -left-5 w-10 bg-dadi-green z-20 md:block hidden"></div>

            <div className="absolute inset-0 bg-linear-to-r from-dadi-green/60 via-transparent to-transparent z-10 md:block hidden"></div>
            <div className="absolute inset-0 bg-linear-to-t from-dadi-green via-transparent to-transparent z-10 md:hidden block"></div>

            <Image
              src="/assets/banner-img.png"
              alt="Premium Kidswear"
              fill
              className="object-cover object-center scale-105"
              priority
            />

            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.15)] pointer-events-none z-15"></div>
          </div>
        </div>

        <WavyDivider 
          className="absolute bottom-0 left-0 z-40" 
        />
      </section>

      <section className="py-20 bg-dadi-cream text-center container mx-auto px-4 md:px-8">
        <div className="mb-12 fade-in-up">
        <h2 className="text-3xl md:text-4xl font-serif text-dadi-green-dark mb-4 dark:text-dadi-gold">
          Inspired by <span className="text-dadi-gold">21 Years of Expertise</span> <span className="text-dadi-gold">✦</span>
        </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
            At Mom & Son, we bring Dadi ji&apos;s care and experience into every stitch, creating softness and comfort for your little ones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto stagger-children">
          {/* girls collection */}
          <Link href="/collections" className="group rounded-xl overflow-hidden shadow-lg bg-card p-2 border border-border-custom card-hover block">
            <div className="relative aspect-4/5 bg-muted-custom/10 rounded-lg overflow-hidden mb-0 img-shine">
              <Image 
                src="https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500&auto=format&fit=crop&q=60" 
                alt="Girls Collection" 
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500" 
                loading="lazy"
              />
            </div>
            <div className="bg-dadi-red text-white py-2 font-serif text-lg shadow-sm">Girls Collection</div>
            <div className="py-3 bg-dadi-cream/30">
              <Button variant="outline" size="sm" className="px-6 text-xs border-border-custom text-foreground bg-card rounded-full font-bold">Shop Now</Button>
            </div>
          </Link>

          {/* Boys collection */}
          <Link href="/collections" className="group rounded-xl overflow-hidden shadow-lg bg-card p-2 border border-border-custom card-hover block">
            <div className="relative aspect-4/5 bg-muted-custom/10 rounded-lg overflow-hidden mb-0 img-shine">
              <Image 
                src="https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=500&auto=format&fit=crop&q=60" 
                alt="Boys Collection" 
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500" 
                loading="lazy"
              />
            </div>
            <div className="bg-dadi-green text-white py-2 font-serif text-lg shadow-sm">Boys Collection</div>
            <div className="py-3 bg-dadi-cream/30">
              <Button variant="outline" size="sm" className="px-6 text-xs border-border-custom text-foreground bg-card rounded-full font-bold">Shop Now</Button>
            </div>
          </Link>

          {/* Sets collection */}
          <Link href="/collections" className="group rounded-xl overflow-hidden shadow-lg bg-card p-2 border border-border-custom card-hover block">
            <div className="relative aspect-4/5 bg-muted-custom/10 rounded-lg overflow-hidden mb-0 img-shine">
              <Image
                src="https://images.unsplash.com/photo-1662530787590-d8a62e910630?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt="Summer Cord Sets"
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover group-hover:scale-105 transition duration-500" 
                loading="lazy"
              />
            </div>
            <div className="bg-dadi-gold text-white py-2 font-serif text-lg shadow-sm">Summer Cord Sets</div>
            <div className="py-3 bg-dadi-cream/30">
              <Button variant="outline" size="sm" className="px-6 text-xs border-border-custom text-foreground bg-card rounded-full font-bold">Shop Now</Button>
            </div>
          </Link>

          <div className="group rounded-xl overflow-hidden shadow-lg bg-card border border-border-custom h-full card-hover">
            <div className="relative w-full h-full min-h-[300px] bg-muted-custom/10 img-shine">
             <Image 
                src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=500&auto=format&fit=crop&q=60" 
                alt="Image not displaying?" 
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover" 
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>


      {/* trending  */}
      <section className="py-16 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-10 fade-in-up">
            <h2 className="text-3xl font-serif text-dadi-green-dark dark:text-dadi-gold">
              <span className="text-dadi-gold">✦ Trending Now ✦</span>
            </h2>
          </div>

          <div className="relative flex items-center">
            <button className="absolute left-0 z-10 w-10 h-10 -ml-4 bg-card border border-border-custom rounded-full flex items-center justify-center text-dadi-gold shadow-md hover:scale-110 transition md:flex">
              <ChevronLeft size={24} />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full stagger-children">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="relative aspect-4/5 w-full rounded-xl overflow-hidden bg-muted-custom/10 animate-pulse"></div>
                    <div className="h-4 bg-muted-custom/10 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-muted-custom/10 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))
              ) : (
                displayProducts.slice(0, 4).map((product: any) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))
              )}
            </div>

            <button className="absolute right-0 z-10 w-10 h-10 -mr-4 bg-card border border-border-custom rounded-full flex items-center justify-center text-dadi-gold shadow-md hover:scale-110 transition md:flex">
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </section>


      {/* USP seciton */}
      <section className="py-16 bg-dadi-cream/50 relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-center mb-10 fade-in-up">
            <h3 className="text-center font-serif text-foreground text-lg">
              <span className="text-dadi-red opacity-50">~✿~</span> Because every child deserves the comfort of <span className="text-dadi-red italic font-semibold">experience</span>. <span className="text-dadi-red opacity-50">~✿~</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto stagger-children">
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-dadi-green mb-4 border border-border-custom shadow-sm transform group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 dark:text-dadi-gold">
                <Droplets size={24} />
              </div>
              <h4 className="font-semibold text-foreground text-sm">Premium Soft Fabric</h4>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-dadi-green mb-4 border border-border-custom shadow-sm transform group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 dark:text-dadi-gold">
                <ShieldCheck size={24} />
              </div>
              <h4 className="font-semibold text-foreground text-sm">Skin-Friendly</h4>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-dadi-green mb-4 border border-border-custom shadow-sm transform group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300 dark:text-dadi-gold">
                <Scissors size={24} />
              </div>
              <h4 className="font-semibold text-foreground text-sm">Strong Stitching</h4>
            </div>

            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center text-dadi-red mb-4 border border-border-custom shadow-sm transform group-hover:-translate-y-2 group-hover:shadow-lg transition-all duration-300">
                <Heart size={24} />
              </div>
              <h4 className="font-semibold text-foreground text-sm">Made with Love</h4>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-300 to-transparent"></div>
      </section>
    </div>
  );
}
