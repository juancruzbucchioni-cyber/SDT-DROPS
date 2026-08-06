import { useCallback, useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/cb/Header";
import { Hero } from "@/components/cb/Hero";
import { Products, getColorStock, getUnitPrice, type ProductItem } from "@/components/cb/Products";
import { Contact } from "@/components/cb/Contact";
import { Footer } from "@/components/cb/Footer";
import { Categories } from "@/components/cb/Categories";
import { CatalogCta, TrustSection } from "@/components/cb/CommerceSections";
import { BrandShowcase } from "@/components/cb/BrandShowcase";
import { initializeCloudSync } from "@/lib/cloud-sync";
import { useToast, ToastContainer } from "@/components/cb/Toast";
import { ArrowUp, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

export type CartItem = ProductItem & { qty: number; selectedColor?: string };
const CART_STORAGE_KEY = "sdt_drops_cart_v1";
const cartKey = (id: string, selectedColor?: string) => `${id}::${selectedColor ?? "sin-color"}`;

function Index() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartHydrated, setCartHydrated] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { toasts, show: showToast } = useToast();

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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

  const addToCart = useCallback((product: ProductItem, selectedColor?: string) => {
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
    showToast(`${product.name} agregado al carrito`);
  }, [showToast]);

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
      <BrandShowcase />
      <Categories />
      <Products onAddToCart={addToCart} cartQtyById={cartQtyById} />
      <TrustSection />
      <CatalogCta />
      <Contact />
      <Footer />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/5493534814420"
        target="_blank"
        rel="noreferrer"
        aria-label="Contactanos por WhatsApp"
        className="whatsapp-float fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg sm:bottom-6 sm:right-6"
      >
        <MessageCircle className="h-6 w-6" fill="white" strokeWidth={0} />
      </a>

      {/* Back to top button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Volver arriba"
          className="back-to-top fixed bottom-24 right-5 z-50 grid h-11 w-11 place-items-center rounded-full border border-[#C9D1DC] bg-[#F3F5F7] text-foreground shadow-md sm:bottom-24 sm:right-6"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} />
    </main>
  );
}
