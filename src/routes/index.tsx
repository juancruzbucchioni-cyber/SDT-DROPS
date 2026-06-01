import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/cb/Header";
import { Hero } from "@/components/cb/Hero";
import { Products, getColorStock, getUnitPrice, type ProductItem } from "@/components/cb/Products";
import { Instagram } from "@/components/cb/Instagram";
import { Contact } from "@/components/cb/Contact";
import { Footer } from "@/components/cb/Footer";
import { ProductLines } from "@/components/cb/ProductLines";
import { TrendingProducts } from "@/components/cb/TrendingProducts";
import { initializeCloudSync } from "@/lib/cloud-sync";

export const Route = createFileRoute("/")({
  component: Index,
});

export type CartItem = ProductItem & { qty: number; selectedColor?: string };
const CART_STORAGE_KEY = "sdt_drops_cart_v1";
const cartKey = (id: string, selectedColor?: string) => `${id}::${selectedColor ?? "sin-color"}`;

function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);

  useEffect(() => {
    void initializeCloudSync().then(() => {
      try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CartItem[]) : [];
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {
        // noop
      } finally {
        setCartHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent("sdt-cart-updated"));
    } catch {
      // noop
    }
  }, [cart, cartHydrated]);

  const addToCart = (product: ProductItem, selectedColor?: string) => {
    setCart((prev) => {
      const found = prev.find((i) => cartKey(i.id, i.selectedColor) === cartKey(product.id, selectedColor));
      if (found) {
        const maxStock = getColorStock(found, found.selectedColor);
        if (found.qty >= maxStock) return prev;
        return prev.map((i) =>
          cartKey(i.id, i.selectedColor) === cartKey(product.id, selectedColor) ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      if (product.stock <= 0) return prev;
      return [...prev, { ...product, qty: 1, selectedColor }];
    });
  };

  const increment = (key: string) => {
    setCart((prev) =>
      prev.map((i) => {
        if (cartKey(i.id, i.selectedColor) !== key) return i;
        const maxStock = getColorStock(i, i.selectedColor);
        if (i.qty >= maxStock) return i;
        return { ...i, qty: i.qty + 1 };
      }),
    );
  };

  const updateColor = (key: string, color: string) => {
    setCart((prev) =>
      prev.map((i) => {
        if (cartKey(i.id, i.selectedColor) !== key) return i;
        const maxStock = getColorStock(i, color);
        return { ...i, selectedColor: color, qty: Math.max(1, Math.min(i.qty, maxStock || 1)) };
      }),
    );
  };

  const decrement = (key: string) => {
    setCart((prev) =>
      prev
        .map((i) => (cartKey(i.id, i.selectedColor) === key ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const removeItem = (key: string) => {
    setCart((prev) => prev.filter((i) => cartKey(i.id, i.selectedColor) !== key));
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((acc, i) => acc + i.qty, 0), [cart]);
  const cartQtyById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const item of cart) {
      map[item.id] = (map[item.id] ?? 0) + item.qty;
    }
    return map;
  }, [cart]);

  const cartTotal = useMemo(
    () => cart.reduce((acc, i) => acc + getUnitPrice(i, cartQtyById[i.id] ?? i.qty) * i.qty, 0),
    [cart, cartQtyById],
  );

  return (
    <main className="relative min-h-screen text-foreground">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "radial-gradient(circle at 40% 65%, #14356f 0%, #0f2f66 35%, #0b2656 65%, #081a3f 100%)",
        }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-background/72" />
      <Header
        cart={cart}
        cartCount={cartCount}
        cartTotal={cartTotal}
        onIncrement={increment}
        onDecrement={decrement}
        onUpdateColor={updateColor}
        onRemove={removeItem}
        onClear={clearCart}
      />
      <Hero />
      <ProductLines />
      <TrendingProducts />
      <Products onAddToCart={addToCart} cartQtyById={cartQtyById} />
      <Instagram />
      <Contact />
      <Footer />
    </main>
  );
}
