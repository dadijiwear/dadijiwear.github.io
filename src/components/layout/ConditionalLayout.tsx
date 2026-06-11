"use client";

import { usePathname } from "next/navigation";
import React from "react";
// Adjust these imports to point to your actual Header and Footer files
import Header from "@/components/layout/Header"; 
import Footer from "@/components/layout/Footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // If it's an admin route, DO NOT render Header or Footer
  if (isAdminRoute) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  // Otherwise, render the normal storefront layout
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
