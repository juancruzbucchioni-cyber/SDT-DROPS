import { useEffect, useState } from "react";
import type { ProductItem } from "@/components/cb/Products";
import { CATEGORIES_STORAGE_KEY, defaultCategories, type CategoryItem } from "@/components/cb/catalog-config";
import fallbackProductImage from "@/assets/productos/todos.png";

const STORAGE_KEY = "sdt_drops_products_v3";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

function resolveImageSrc(src?: string) {
  const value = String(src ?? "").trim();
  if (!value) return fallbackProductImage;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return fallbackProductImage;
}

export function TrendingProducts() {
  const [items, setItems] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);

  useEffect(() => {
    const load = () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as ProductItem[]) : [];
        setItems(Array.isArray(parsed) ? parsed.filter((p: any) => p?.isTrending || /MAS VENDIDO|HOT/i.test(String(p?.tag ?? ""))).slice(0, 8) : []);
      } catch {
        setItems([]);
      }
    };

    load();
    window.addEventListener("storage", load);
    window.addEventListener("sdt-products-updated", load as EventListener);
    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("sdt-products-updated", load as EventListener);
    };
  }, []);

  useEffect(() => {
    const loadCategories = () => {
      try {
        const raw = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CategoryItem[]) : [];
        setCategories(Array.isArray(parsed) && parsed.length ? parsed : defaultCategories);
      } catch {
        setCategories(defaultCategories);
      }
    };
    loadCategories();
    window.addEventListener("sdt-categories-updated", loadCategories as EventListener);
    return () => window.removeEventListener("sdt-categories-updated", loadCategories as EventListener);
  }, []);

  const openProductInCategory = (product: ProductItem) => {
    window.dispatchEvent(new CustomEvent("sdt-open-liked-product", { detail: { name: product.name } }));
  };

  const categoryHref = (catName: string) => {
    const found = categories.find((c) => c.name === catName);
    return `#${found?.id ?? "productos"}`;
  };

  if (!items.length) return null;

  return (
    <section id="tendencias" className="relative border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10">
          <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 03 - Tendencias</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Productos <span className="text-neon">mas vendidos</span></h2>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <a key={p.id} href={categoryHref(p.cat)} onClick={() => openProductInCategory(p)} className="block border border-border bg-card/70 p-4">
              <img
                src={resolveImageSrc(p.img)}
                alt={p.name}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = fallbackProductImage;
                }}
                className="mb-3 aspect-square w-full object-cover"
              />
              <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">{p.cat}</p>
              <h3 className="mt-1 font-display text-lg font-bold uppercase">{p.name}</h3>
              <p className="mt-2 font-display text-xl font-bold text-neon">{formatPrice(p.price)}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}




