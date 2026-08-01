import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/cb/Header";
import { Hero } from "@/components/cb/Hero";
import { Products, getColorStock, getUnitPrice, type ProductItem } from "@/components/cb/Products";
import { Contact } from "@/components/cb/Contact";
import { Footer } from "@/components/cb/Footer";
import { Categories } from "@/components/cb/Categories";
import { CatalogCta, TrustSection } from "@/components/cb/CommerceSections";
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
    <main className="min-h-screen bg-background text-foreground">
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
      <Categories />
      <Products onAddToCart={addToCart} cartQtyById={cartQtyById} />
      <TrustSection />
      <CatalogCta />
      <Contact />
      <Footer />
    </main>
  );
}
