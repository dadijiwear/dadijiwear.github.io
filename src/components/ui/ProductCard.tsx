"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "./Button";

export function ProductCard({ product }: { product: any }) {
  const addToCart = useStore((state) => state.addToCart);
  const [isHovered, setIsHovered] = useState(false);

  const id = product._id || product.id;
  const href = product.slug
    ? `/product/${product.slug}`
    : `/product/${id}`;

  const image =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "/assets/banner-img.png";

  const getTagColor = (color: string) => {
    switch (color) {
      case "orange":
        return "bg-orange-500";
      case "green":
        return "bg-dadi-green";
      case "red":
        return "bg-dadi-red";
      default:
        return "bg-orange-500";
    }
  };

  const discount = product.mrp
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <div
      className="bg-card border border-border-custom rounded-xl overflow-hidden shadow-sm flex flex-col group relative p-2 card-hover"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href} className="block">
        <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden img-shine bg-muted-custom/20">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 25vw"
              className={`object-cover transition-transform duration-700 ease-out ${
                isHovered ? "scale-110" : "scale-100"
              }`}
              loading="lazy"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-custom font-serif">
                No Image
              </span>
            </div>
          )}

          {product.isNew && (
            <div
              className={`absolute top-2 right-2 ${getTagColor(
                product.tagColor || "orange"
              )} text-white text-xs font-bold px-3 py-1 rounded shadow-sm z-10`}
            >
              NEW
            </div>
          )}

          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-dadi-green text-white text-xs font-bold px-2 py-1 rounded shadow-sm z-10">
              {discount}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 text-center flex flex-col grow justify-between">
        <Link href={href}>
          {product.pid && (
            <div className="text-[11px] text-muted-custom mb-1 font-medium tracking-wide">
              {product.pid}
            </div>
          )}

          <h4 className="text-foreground font-medium text-sm lg:text-base leading-tight mb-2 hover:text-dadi-green transition min-h-[42px]">
            {product.name}
          </h4>

          <div className="flex items-center justify-center gap-2 mb-1">
            <p className="font-bold text-foreground">
              ₹{new Intl.NumberFormat("en-IN").format(product.price)}
            </p>

            {product.mrp && product.mrp > product.price && (
              <p className="text-sm text-muted-custom line-through">
                ₹{new Intl.NumberFormat("en-IN").format(product.mrp)}
              </p>
            )}
          </div>

          {product.variants && (
            <p className="text-xs text-muted-custom mb-2">
              {product.variants.length} variants available
            </p>
          )}
        </Link>

        <Button
          variant="secondary"
          className="w-full rounded-full py-1.5 text-sm font-semibold"
          onClick={(e) => {
            e.preventDefault();

            const storeProduct = {
              ...product,
              id,
              image,
            };

            addToCart(storeProduct);
          }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
