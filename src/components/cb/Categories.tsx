import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { CATEGORIES_STORAGE_KEY, defaultCategories, type CategoryItem } from "@/components/cb/catalog-config";
import type { ProductItem } from "@/components/cb/Products";

const STORAGE_KEY = "sdt_drops_products_v3";

export function Categories() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    const load = () => {
      try {
        const rawCategories = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
        const parsedCategories = rawCategories ? (JSON.parse(rawCategories) as CategoryItem[]) : [];
        const rawProducts = window.localStorage.getItem(STORAGE_KEY);
        const parsedProducts = rawProducts ? (JSON.parse(rawProducts) as ProductItem[]) : [];
        setCategories(Array.isArray(parsedCategories) ? parsedCategories : []);
        setProducts(Array.isArray(parsedProducts) ? parsedProducts : []);
      } catch {
        setCategories([]);
        setProducts([]);
      }
    };

    load();
    window.addEventListener("sdt-categories-updated", load as EventListener);
    window.addEventListener("sdt-products-updated", load as EventListener);
    return () => {
      window.removeEventListener("sdt-categories-updated", load as EventListener);
      window.removeEventListener("sdt-products-updated", load as EventListener);
    };
  }, []);

  const cats = useMemo(
    () =>
      categories
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          ...c,
          count: products.filter((p) => p.cat.toLowerCase() === c.name.toLowerCase()).length,
        })),
    [categories, products],
  );

  return (
    <section id="categorias" className="relative border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 04 - Categorias</div>
            <h2 className="mt-3 font-display text-4xl font-bold text-foreground md:text-6xl">
              Explora por <span className="text-neon">categorias</span>
            </h2>
          </div>
          <div className="w-full max-w-sm border border-border bg-card/70 p-2">
            <label htmlFor="product-search" className="sr-only">
              Buscar productos
            </label>
            <div className="flex items-center gap-2">
              <Search className="ml-1 h-4 w-4 text-muted-foreground" />
              <input
                id="product-search"
                placeholder="Buscar producto por nombre"
                className="w-full bg-transparent px-2 py-2 text-sm outline-none"
                onChange={(e) => window.dispatchEvent(new CustomEvent("sdt-product-search", { detail: { term: e.target.value } }))}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {cats.map((c) => (
            <a key={c.id} href={`#${c.id}`} className="group relative min-h-[150px] overflow-hidden border border-border/80 bg-card/45 p-5 backdrop-blur-sm glow-hover">
              {c.img && (
                <div
                  className="absolute inset-0 opacity-35 transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${c.img})`, backgroundSize: "cover", backgroundPosition: "center" }}
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-background/25 via-background/45 to-background/80" />
              <div className="relative flex h-full flex-col justify-between">
                <div className="flex items-start justify-between">
                  <span className="font-display text-xs font-bold tracking-[0.3em] text-neon">/CAT</span>
                  <ArrowUpRight className="h-5 w-5 text-foreground transition-all group-hover:rotate-12 group-hover:text-neon" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">{c.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{c.count} productos</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
