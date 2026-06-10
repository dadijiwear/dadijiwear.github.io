"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store";
import { createClient } from "@/utils/supabase/client";
import { ShoppingBag, Menu, User, LogOut, ChevronDown, X } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const cart = useStore((state) => state.cart);
  const currentUser = useStore((state) => state.currentUser);
  const logout = useStore((state) => state.logout);
  const setCurrentUser = useStore((state) => (state as any).setCurrentUser); 
  
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const fetchProfileName = async (sessionUser: any) => {
      try {
        const res = await fetch("/api/profile");
        if (res.ok) {
          const json = await res.json();
          const name = json.user?.name ?? sessionUser.user_metadata?.name ?? sessionUser.email ?? "";
          if (mounted) setDisplayName(name);
        } else if (mounted) {
          setDisplayName(sessionUser.user_metadata?.name ?? sessionUser.email ?? "");
        }
      } catch {
        if (mounted) setDisplayName(sessionUser.user_metadata?.name ?? sessionUser.email ?? "");
      }
    };

    const checkInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        if (setCurrentUser) setCurrentUser(session.user);
        await fetchProfileName(session.user);
      }
    };
    void checkInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (session?.user) {
        if (setCurrentUser) setCurrentUser(session.user);
        
        if (currentUser?.name) {
          setDisplayName(currentUser.name);
        } else {
          await fetchProfileName(session.user);
        }
      } else {
        if (setCurrentUser) setCurrentUser(null);
        setDisplayName("");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [currentUser, supabase, setCurrentUser]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label = displayName || currentUser?.name || currentUser?.email || "";
  
  const firstName = useMemo(() => {
    if (!label) return "";
    const base = label.includes("@") ? label.split("@")[0] : label;
    return base.trim().split(/[\s._-]+/)[0] || "User";
  }, [label]);

  const isUserLoggedIn = !!(label || currentUser);

  return (
    <header className="sticky top-0 z-50 w-full bg-dadi-green py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-8">
        
        <Link href="/" className="group flex items-center gap-2 text-2xl font-serif tracking-wide text-dadi-cream transition hover:text-dadi-gold">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-dadi-gold bg-dadi-cream text-xl font-bold text-dadi-green shadow-sm transition-transform group-hover:scale-105">
            <span>{isUserLoggedIn && firstName ? firstName[0].toUpperCase() : "Y"}</span>
          </div>
          <span className="hidden font-serif sm:block">Mom &amp; Son</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/" className="text-dadi-cream transition hover:text-dadi-gold">Home</Link>
          <Link href="/shop" className="text-dadi-cream transition hover:text-dadi-gold">Shop</Link>
          <Link href="/about" className="text-dadi-cream transition hover:text-dadi-gold">About Us</Link>
          <Link href="/contact" className="text-dadi-cream transition hover:text-dadi-gold">Contact</Link>
        </nav>

        <div className="flex items-center gap-3">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hidden text-dadi-cream transition hover:text-dadi-gold sm:block">
            <Image src="/assets/instagram.png" alt="Instagram" width={30} height={30} />
          </a>

          <Link href="/cart" className="group relative text-dadi-cream transition hover:text-dadi-gold">
            <ShoppingBag size={20} className="transition-transform group-hover:scale-110" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-dadi-red text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {isUserLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm text-dadi-cream transition hover:bg-white/20"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-dadi-gold text-xs font-bold text-dadi-green">
                  {firstName ? firstName[0].toUpperCase() : "U"}
                </div>
                <span className="hidden max-w-[120px] truncate sm:block">{firstName}</span>
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border-custom bg-card shadow-xl">
                  <div className="border-b border-border-custom bg-muted-custom/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-foreground">{label || "Account User"}</p>
                    <p className="truncate text-xs text-muted-custom">{currentUser?.email || ""}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition hover:bg-muted-custom/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User size={16} className="text-muted-custom" />
                      My Profile &amp; Orders
                    </Link>

                    <button
                      onClick={async () => {
                        try {
                          // 1. Terminate Supabase Session
                          await supabase.auth.signOut();
                        } catch (error) {
                          console.error("Sign-out error:", error);
                        } finally {
                          // 2. Clear local states
                          logout();
                          setUserMenuOpen(false);
                          setDisplayName("");
                          
                          // 3. Force Next.js to update cached components & route
                          router.push("/");
                          router.refresh(); 
                        }
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-dadi-red transition hover:bg-dadi-red/10"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/account"
              className="rounded-full bg-dadi-gold px-4 py-1.5 text-sm font-semibold text-dadi-green shadow-sm transition hover:bg-yellow-400"
            >
              Account
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-dadi-cream transition hover:bg-white/10 md:hidden"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-white/10 bg-dadi-green-dark/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-3 px-6 py-4 text-sm font-medium text-dadi-cream">
            <Link href="/" className="py-2 transition hover:text-dadi-gold" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/shop" className="py-2 transition hover:text-dadi-gold" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
            <Link href="/about" className="py-2 transition hover:text-dadi-gold" onClick={() => setMobileMenuOpen(false)}>About Us</Link>
            <Link href="/contact" className="py-2 transition hover:text-dadi-gold" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            <Link href="/account" className="py-2 text-left transition hover:text-dadi-gold" onClick={() => setMobileMenuOpen(false)}>
              {isUserLoggedIn ? firstName : "Login / Sign Up"}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
