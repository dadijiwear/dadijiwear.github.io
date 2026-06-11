"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  ShoppingCart,
  Zap,
  ChevronRight,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useStore } from "@/store";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addToCart, bagLoading } = useStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [cartMessage, setCartMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${slug}`);
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 rounded-full border-4 border-emerald-100 border-t-dadi-gold animate-spin mx-auto" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-serif text-foreground mb-4">
          Product Not Found
        </h1>
        <p className="text-muted-custom mb-6">
          The product you are looking for doesn&apos;t exist.
        </p>
        <Button onClick={() => router.push("/shop")}>
          Back to Shop
        </Button>
      </div>
    );
  }

  const images = product.images?.map((img: any) => img.url || img) || [];

  const sizes = [
    ...new Set(
      product.variants
        ?.filter((v: any) => v.stock > 0)
        .map((v: any) => v.ageGroup) || []
    ),
  ].filter(Boolean);

  const colors = [
    ...new Set(
      product.variants
        ?.filter((v: any) => v.stock > 0)
        .map((v: any) => v.color) || []
    ),
  ].filter(Boolean);

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount > 0 
    ? product.reviews.reduce((acc: number, review: any) => acc + (review.rating || 5), 0) / reviewCount 
    : 0;

  const handleAddToCart = async (): Promise<boolean> => {
    if (sizes.length && !selectedSize) {
      setSizeError(true);
      return false;
    }
    setSizeError(false);
    setCartMessage(null);

    const storeProduct = {
      ...product,
      id: product.id || product._id,
      image: images[0],
    };
    
  const selectedVariant = product.variants?.find((v: any) => {
    const sizeMatch = selectedSize ? v.ageGroup === selectedSize : true;
    const colorMatch = selectedColor
    ? v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase()
    : true;
    return sizeMatch && colorMatch && v.active;
  });

  const result = await addToCart(
    storeProduct,
    selectedSize || undefined,
    quantity,
    selectedColor || undefined,
    selectedVariant?.id 
  );


    if (result.success) {
      setCartMessage({ type: "success", text: "Added to your bag!" });
      setTimeout(() => setCartMessage(null), 3000);
    } else {
      setCartMessage({ type: "error", text: result.message });
    }
  };

  const handleBuyNow = async () => {
    /* if (sizes.length && !selectedSize) {
      setSizeError(true);
      return;
    } 
    await handleAddToCart();
    // navvigation only if success
    const currentMessage = cartMessage; // capture before nav.
    if (!currentMessage || currentMessage.type !== "error") {
      router.push("/cart");
    } */


    const success = await handleAddToCart();
    if (success) {
      router.push("/cart");
    }
  };

  const getVariantStock = (size: string, color?: string | null): number => {
  return product.variants
    ?.filter((v: any) => {
      const sizeMatch = v.ageGroup === size;
      const colorMatch = color
        ? v.color?.trim().toLowerCase() === color.trim().toLowerCase()
        : true;
      return sizeMatch && colorMatch;
    })
    .reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0;
  };

  const currentSelectionStock = selectedSize
    ? getVariantStock(selectedSize, selectedColor)
    : null;

  const isOutOfStock = currentSelectionStock !== null && currentSelectionStock === 0;

  return (
    <div className="bg-dadi-cream min-h-screen">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-custom">
          <Link
            href="/"
            className="hover:text-dadi-green dark:hover:text-dadi-gold transition"
          >
            Home
          </Link>

          <ChevronRight size={14} />

          <Link
            href="/shop"
            className="hover:text-dadi-green dark:hover:text-dadi-gold transition"
          >
            Shop
          </Link>

          <ChevronRight size={14} />

          <span className="text-foreground font-medium truncate">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container mx-auto px-4 md:px-8 pb-16">
        <div className="bg-card rounded-3xl shadow-sm border border-border-custom overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-1/2 p-4 md:p-8">
              <div className="flex flex-col-reverse md:flex-row gap-4">
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:max-h-[500px] pb-2 md:pb-0">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 shrink-0 transition-all relative ${
                        selectedImage === idx
                          ? "border-dadi-green dark:border-dadi-gold shadow-md scale-105"
                          : "border-border-custom hover:border-muted-custom/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover rounded-xl"
                      />
                    </button>
                  ))}
                </div>

                <div className="flex-1 relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden bg-white border border-border-custom shadow-sm">
                  <Image
                    src={images[selectedImage] || "/assets/banner-img.png"}
                    alt={product.name}
                    fill
                    sizes="(max-width:768px) 100vw, 50vw"
                    className="object-contain transition-opacity duration-300 rounded-3xl"
                    priority
                  />

                  <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                    {product.isNew && (
                      <div className="bg-dadi-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow w-fit uppercase tracking-wider">
                        NEW ARRIVAL
                      </div>
                    )}

                    {discount > 0 && (
                      <div className="bg-dadi-green text-white text-xs font-bold px-3 py-1.5 rounded-full shadow w-fit uppercase tracking-wider">
                        {discount}% OFF
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 p-6 md:p-8 lg:border-l border-border-custom flex flex-col">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {product.category && (
                  <span className="text-xs font-semibold text-dadi-green bg-dadi-green/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    {product.category}
                  </span>
                )}

                {product.pid && (
                  <span className="text-xs font-medium text-muted-custom border border-border-custom px-3 py-1 rounded-full">
                    {product.pid}
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-serif text-foreground leading-tight mb-3">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={`${
                        star <= Math.round(averageRating)
                          ? "fill-dadi-gold text-dadi-gold"
                          : "text-muted-custom/30"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-sm text-muted-custom">
                  {reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-border-custom">
                <span className="text-3xl font-bold text-dadi-green-dark dark:text-dadi-gold">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>

                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-lg text-muted-custom line-through">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>

                    <span className="text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded">
                      Save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>

              {sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-foreground text-sm">
                      Size{" "}
                      {selectedSize && (
                        <span className="text-dadi-green">
                          : {selectedSize}
                        </span>
                      )}
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size: any) => {
                      const stockCount = getVariantStock(size as string, selectedColor);
                      const isSoldOut = selectedColor ? stockCount === 0 : false;

                      return (
                        <button
                          key={size as string}
                          onClick={() => {
                            if (isSoldOut) return;
                            setSelectedSize(size as string);
                            setSizeError(false);
                          }}
                          disabled={isSoldOut}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all flex flex-col items-center min-w-[80px] ${
                            selectedSize === size
                              ? "border-dadi-green bg-dadi-green text-white dark:border-dadi-gold dark:bg-dadi-gold dark:text-dadi-green shadow-md"
                              : isSoldOut
                              ? "border-border-custom text-muted-custom opacity-40 cursor-not-allowed"
                              : "border-border-custom text-foreground hover:border-dadi-green dark:hover:border-dadi-gold"
                          }`}
                        >
                          <span>{size as string}</span>
                          <span className={`text-[10px] font-medium mt-0.5 ${
                            selectedSize === size ? "text-white/80 dark:text-dadi-green/80"
                            : isSoldOut ? "text-red-400"
                            : "text-muted-custom"
                          }`}>
                            {isSoldOut ? "sold out" : `${stockCount} left`}
                          </span>
                        </button>
                      );
                    })}
                      
                  </div>

                  {selectedSize && (
                    <p className="text-xs text-dadi-green dark:text-dadi-gold mt-2 font-medium">
                      Stock Update: {product.variants?.filter((v: any) => v.ageGroup === selectedSize && (!selectedColor || v.color?.trim().toLowerCase() === selectedColor.trim().toLowerCase())).reduce((acc: number, v: any) => acc + (v.stock || 0), 0) || 0} items available for {selectedSize}
                    </p>
                  )}

                  {sizeError && (
                    <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">
                      <span>⚠</span> Please select a size before adding to bag.
                    </p>
                  )}
                </div>
              )}

              {colors.length > 0 && (
                <div className="mb-6">
                  <label className="font-semibold text-foreground text-sm mb-3 block">
                    Color
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {colors.map((color: any) => (
                      <button
                        key={color as string}
                        onClick={() => {
                          setSelectedColor(color as string);

                          const imageIndex = product.images.findIndex(
                            (img: any) =>
                              img.color?.trim().toLowerCase() ===
                              (color as string).trim().toLowerCase()
                          );

                          if (imageIndex !== -1) {
                            setSelectedImage(imageIndex);
                          }
                        }}
                        className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                          selectedColor === color
                            ? "border-dadi-gold bg-dadi-gold text-dadi-green-dark"
                            : "border-border-custom hover:border-muted-custom/40"
                        }`}
                      >
                        {color as string}
                      </button>
                    ))}
                  </div>
                </div>
              )}
                
              <div className="mb-6">
                <label className="font-semibold text-foreground text-sm mb-3 block">
                  Quantity
                </label>

                <div className="flex items-center gap-1 bg-muted-custom/10 rounded-lg w-fit border border-border-custom/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-muted-custom hover:text-dadi-green dark:hover:text-dadi-gold transition rounded-l-lg hover:bg-muted-custom/20"
                  >
                    <Minus size={16} />
                  </button>

                  <span className="w-12 text-center font-bold text-lg text-foreground">
                    {quantity}
                  </span>

                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-muted-custom hover:text-dadi-green dark:hover:text-dadi-gold transition rounded-r-lg hover:bg-muted-custom/20"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              {cartMessage && (
                <p className={`text-sm font-medium mb-3 ${
                  cartMessage.type === "error" ? "text-red-500" : "text-dadi-green dark:text-dadi-gold"
                  }`}>
                  {cartMessage.type === "error" ? "⚠ " : "✓ "}{cartMessage.text}
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  onClick={handleAddToCart}
                  variant="outline"
                  disabled={isOutOfStock || bagLoading}
                  className={`flex-1 py-3 text-base rounded-xl gap-2 font-semibold ${
                  isOutOfStock || bagLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  >
                  {bagLoading ? (
                    <span className="w-5 h-5 border-2 border-dadi-green/30 border-t-dadi-green dark:border-dadi-gold/30 dark:border-t-dadi-gold rounded-full animate-spin" />
                  ) : (
                  <ShoppingBag size={20} />
                  )}
                  {isOutOfStock ? "Out of Stock" : bagLoading ? "Adding..." : "Add to bag"}
                </Button>

                <Button
                  onClick={handleBuyNow}
                  variant="primary"
                  disabled={isOutOfStock || bagLoading}
                  className={`flex-1 py-3 text-base rounded-xl gap-2 font-semibold ${
                  isOutOfStock || bagLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  >
                  {bagLoading ? (
                    <span className="w-5 h-5 border-2 border-dadi-green-dark/30 border-t-dadi-green-dark rounded-full animate-spin" />
                  ) : (

                  <Zap size={20} />
                  )}
                  {isOutOfStock ? "Out of Stock" :bagLoading ? "Just a sec..." : "Buy Now"}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border-custom">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Truck size={20} className="text-dadi-gold" />
                  <span className="text-xs text-muted-custom font-medium">Free Delivery</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1.5">
                  <ShieldCheck size={20} className="text-dadi-gold" />
                  <span className="text-xs text-muted-custom font-medium">Quality Assured</span>
                </div>

                <div className="flex flex-col items-center text-center gap-1.5">
                  <RotateCcw size={20} className="text-dadi-gold" />
                  <span className="text-xs text-muted-custom font-medium">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        
          {product.description && (
            <div className="border-t border-border-custom p-6 md:p-8">
              <h2 className="text-xl font-serif text-foreground mb-4">
                Product Description
              </h2>
              <p className="text-muted-foreground leading-relaxed max-w-3xl">
                {product.description}
              </p>
            </div>
          )}

          <div className="border-t border-border-custom p-6 md:p-8 bg-card">
            <h3 className="text-lg font-serif mb-4 text-foreground">
              Shipping Information
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-custom">Delivery</span>
                <span className="font-medium text-foreground">
                  3–5 Business Days
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-custom">Shipping</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  Free on All Orders
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-custom">Returns</span>
                <span className="font-medium text-foreground">
                  7-Day Easy Returns
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-custom">Cash on Delivery</span>
                <span className="font-medium text-foreground">
                  Available
                </span>
              </div>
            </div>
          </div> 
        </div> 
      </div> 
    </div> 
  );
}
