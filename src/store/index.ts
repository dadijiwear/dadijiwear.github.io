import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  images?: string[];
  description?: string;
  sizes?: string[];
  category?: string;
  isNew?: boolean;
  tagColor?: "orange" | "green" | "red";
}

export interface CartItem {
  id: string;
  cartItemId: string;
  productId: string;
  productVariantId: string;
  productPid: string;
  name: string;
  image: string;
  price: number;
  mrp?: number;
  quantity: number;
  selectedSize?: string;
  color?: string;
  slug?: string;
  category?: string;
  images?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role?: "CUSTOMER" | "ADMIN";
}

export const MOCK_PRODUCTS: Product[] = [];

interface StoreState {
  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  cart: CartItem[];
  bagCount: number;
  bagLoading: boolean;
  currentUser: UserProfile | null;
  authReady: boolean;

  hydrateAuth: () => Promise<void>;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, size?: string, quantity?: number, color?: string, variantId?: string) => Promise<{ success: boolean; message: string }>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  clearCart: () => Promise<void>;
  logout: () => Promise<void>;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function mapApiItem(item: any): CartItem {
  const colorImage = item?.product?.images?.find(
    (img: any) =>
      img.color &&
      item.color &&
      img.color.trim().toLowerCase() === item.color.trim().toLowerCase()
  )?.url;

  const primaryImage =
    colorImage ??
    item?.product?.images?.find((img: any) => img.isPrimary)?.url ??
    item?.product?.images?.[0]?.url ??
    "";

  return {
    id: item.id,
    cartItemId: item.id,
    productId: item.productId,
    productVariantId: item.productVariantId,
    productPid: item.productPid,
    name: item.productName ?? item?.product?.name ?? "",
    image: primaryImage,
    price: toNumber(item.unitPrice ?? item?.product?.price),
    mrp: toNumber(item?.product?.mrp) || undefined,
    quantity: item.quantity,
    selectedSize: item.ageGroup,
    color: item.color ?? undefined,
    slug: item?.product?.slug,
    category: item?.product?.category,
    images: item?.product?.images?.map((img: any) => img.url) ?? [],
  };
}

function sumBagCount(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.quantity, 0);
}

export const useStore = create<StoreState>((set, get) => ({
  products: MOCK_PRODUCTS,
  cart: [],
  bagCount: 0,
  bagLoading: false,
  currentUser: null,
  authReady: false,

  setProducts: (products) => set({ products }),

  addProduct: (productData) =>
    set((state) => {
      const id = `p_${Date.now().toString(36)}`;
      return { products: [...state.products, { ...productData, id }] };
    }),

  updateProduct: (id, data) =>
    set((state) => ({
      products: state.products.map((product) => (product.id === id ? { ...product, ...data } : product)),
    })),

  deleteProduct: (id) =>
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    })),

  hydrateAuth: async () => {
    try {
      const profileRes = await fetch("/api/profile", { cache: "no-store" });

      if (!profileRes.ok) {
        set({ currentUser: null, cart: [], bagCount: 0, authReady: true });
        return;
      }

      const payload = await profileRes.json();
      const user = payload?.user
        ? {
            id: payload.user.id,
            name: payload.user.name ?? "",
            email: payload.user.email ?? "",
            phone: payload.user.phone ?? null,
            address: payload.user.address ?? null,
            role: payload.user.role ?? "CUSTOMER",
          }
        : null;

      set({ currentUser: user, authReady: true });

      if (user) {
        await get().refreshCart();
      } else {
        set({ cart: [], bagCount: 0 });
      }
    } catch {
      set({ currentUser: null, cart: [], bagCount: 0, authReady: true });
    }
  },

  refreshCart: async () => {
    set({ bagLoading: true });

    try {
      const res = await fetch("/api/cart", { cache: "no-store" });

      if (!res.ok) {
        if (res.status === 401) {
          set({ cart: [], bagCount: 0, bagLoading: false });
          return;
        }
        throw new Error("Failed to load bag");
      }

      const data = await res.json();
      const items = Array.isArray(data?.cart?.items) ? data.cart.items.map(mapApiItem) : [];

      set({
        cart: items,
        bagCount: sumBagCount(items),
        bagLoading: false,
      });
    } catch {
      set({
        cart: [],
        bagCount: 0,
        bagLoading: false,
      });
    }
  },

  addToCart: async (product, size, quantity = 1, color, variantId) => {
    const state = get();

    if (!state.authReady) {
      await state.hydrateAuth();
    }

    if (!get().currentUser) {
      return { success: false, message: "Please sign in to add items to your bag." };
    }

    set({ bagLoading: true });

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          variantId,
          size,
          color,
          quantity,
        }),
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to add item");
      }

      const items = Array.isArray(payload?.cart?.items) ? payload.cart.items.map(mapApiItem) : [];
      set({
        cart: items,
        bagCount: sumBagCount(items),
        bagLoading: false,
      });

      return { success: true, message: "Added to your bag." };
    } catch (error: any) {
      set({ bagLoading: false });
      return { success: false, message: error?.message || "Failed to add item." };
    }
  },

  removeFromCart: async (cartItemId) => {
    set({ bagLoading: true });
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
      });

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Failed to remove item");
      }

      const items = Array.isArray(payload?.cart?.items)
        ? payload.cart.items.map(mapApiItem)
        : [];

      set({
        cart: items,
        bagCount: sumBagCount(items),
        bagLoading: false,
      });
    } catch {
      set({ bagLoading: false });
    }
  }, 
  
  updateCartQuantity: async (cartItemId, quantity) => {
  set((state) => {
    const items = state.cart.map((item) =>
      item.id === cartItemId ? { ...item, quantity } : item
    );
    return { cart: items, bagCount: sumBagCount(items) };
  });

  try {
    const res = await fetch(`/api/cart/${cartItemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });

    const payload = await res.json();

    if (!res.ok) {
      await get().refreshCart(); // restore correct db store
      return { success: false, message: payload?.error || "Failed to update quantity" };
    }

    const items = Array.isArray(payload?.cart?.items)
      ? payload.cart.items.map(mapApiItem)
      : [];
      set({ cart: items, bagCount: sumBagCount(items) });
      return { success: true, message: "Updated" };
      } catch {
      await get().refreshCart();
      return { success: false, message: "Failed to update quantity" };
    }
  },  
  
  clearCart: async () => {
    set({ bagLoading: true });

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to clear bag");
      }

      set({ cart: [], bagCount: 0, bagLoading: false });
    } catch {
      set({ bagLoading: false });
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({
      currentUser: null,
      cart: [],
      bagCount: 0,
      authReady: true,
    });
  },
}));
