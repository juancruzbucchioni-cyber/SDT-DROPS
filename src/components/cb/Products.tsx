import { useEffect, useMemo, useState } from "react";
import fallbackProductImage from "@/assets/productos/todos.png";
import { Plus } from "lucide-react";
import { isCloudSyncEnabled } from "@/lib/cloud-sync";

export type ProductItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  tierPrices?: TierPrice[];
  colors?: ColorStock[];
  old?: number;
  img: string;
  tag?: string;
  cat: string;
  stock: number;
  compatibleModels: string[];
};

export type TierPrice = {
  minQty: number;
  maxQty?: number;
  unitPrice: number;
};

export type ColorStock = {
  color: string;
  stock: number;
};

const STORAGE_KEY = "sdt_drops_products_v3";

export function getColorStock(product: ProductItem, selectedColor?: string) {
  if (!selectedColor || !product.colors?.length) return product.stock;
  const found = product.colors.find((c) => c.color.toLowerCase() === selectedColor.toLowerCase());
  return found ? found.stock : product.stock;
}

function resolveColorCss(color: string) {
  const c = color.trim().toLowerCase();
  const map: Record<string, string> = {
    negro: "#000000",
    blanco: "#ffffff",
    azul: "#2563eb",
    rojo: "#dc2626",
    verde: "#16a34a",
    amarillo: "#facc15",
    gris: "#6b7280",
    rosa: "#ec4899",
    violeta: "#7c3aed",
    naranja: "#f97316",
    marron: "#92400e",
    celeste: "#38bdf8",
  };
  return map[c] ?? color;
}

function resolveImageSrc(src?: string) {
  const value = String(src ?? "").trim();
  if (!value) return fallbackProductImage;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return fallbackProductImage;
}

export function getUnitPrice(product: ProductItem, qty: number) {
  const tiers = (product.tierPrices ?? []).slice().sort((a, b) => a.minQty - b.minQty);
  for (const tier of tiers) {
    const matchesMin = qty >= tier.minQty;
    const matchesMax = tier.maxQty === undefined ? true : qty <= tier.maxQty;
    if (matchesMin && matchesMax) return tier.unitPrice;
  }
  return product.price;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

function ProductCard({ p, cartQty, onAddToCart }: { p: ProductItem; cartQty: number; onAddToCart: (product: ProductItem, color?: string) => void }) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(p.colors?.[0]?.color);
  const remaining = Math.max(0, getColorStock(p, selectedColor) - cartQty);
  const disabled = remaining <= 0;
  const currentUnitPrice = getUnitPrice(p, Math.max(1, cartQty));

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border/80 bg-card/55 backdrop-blur-sm glow-hover overflow-hidden">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
        <img
          src={resolveImageSrc(p.img)}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackProductImage;
          }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {p.tag && <span className="absolute left-3 top-3 border border-primary bg-background/80 px-2 py-1 font-display text-[10px] font-bold tracking-widest text-neon backdrop-blur">{p.tag}</span>}
        <button
          disabled={disabled}
          onClick={() => onAddToCart(p, selectedColor)}
          className="absolute inset-x-3 bottom-3 inline-flex translate-y-0 items-center justify-center gap-2 border border-primary bg-primary/95 px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground opacity-100 transition-all lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" /> {disabled ? "Sin stock" : "Anadir al carrito"}
        </button>
      </div>
      <div className="flex flex-col gap-1 rounded-b-2xl p-5">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{p.cat}</span>
        <h3 className="font-display text-base font-bold leading-tight text-foreground">{p.name}</h3>
        {p.description ? <p className="text-xs text-muted-foreground">{p.description}</p> : null}
        <p className="text-xs text-muted-foreground">Compatibilidad: {p.compatibleModels.join(", ")}</p>
        <p className="text-xs text-muted-foreground">Stock disponible: <span className="text-neon font-bold">{remaining}</span></p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-neon">{formatPrice(currentUnitPrice)}</span>
          {p.old && <span className="text-sm text-muted-foreground line-through">{formatPrice(p.old)}</span>}
        </div>
        {p.tierPrices?.length ? (
          <div className="mt-2 rounded border border-border/70 bg-background/35 p-2 text-[10px] uppercase tracking-wide text-muted-foreground">
            {p.tierPrices.map((t, idx) => (
              <div key={`${p.id}-tier-${idx}`}>
                {t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`} unid: <span className="font-bold text-neon">{formatPrice(t.unitPrice)}</span>
              </div>
            ))}
          </div>
        ) : null}
        {p.colors?.length ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Colores:</span>
            <div className="flex flex-wrap gap-1.5">
              {p.colors.map((c, idx) => (
                <button
                  type="button"
                  key={`${p.id}-color-${idx}`}
                  onClick={() => setSelectedColor(c.color)}
                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] ${selectedColor === c.color ? "border-primary bg-primary/10" : "border-border"}`}
                >
                  <span title={c.color} className="h-3.5 w-3.5 rounded border border-border" style={{ backgroundColor: resolveColorCss(c.color) }} />
                  <span className="font-bold text-neon">{c.stock}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

const sections = [
  { id: "cat-celulares", title: "Celulares", cats: ["Celulares"] },
  { id: "cat-perfumes", title: "Perfumes", cats: ["Perfumes"] },
  { id: "cat-stanley", title: "Stanley", cats: ["Stanley"] },
  { id: "cat-relojes", title: "Relojes", cats: ["Relojes"] },
  { id: "cat-accesorios", title: "Accesorios", cats: ["Accesorios", "accesorios"] },
  { id: "cat-camisetas", title: "Camisetas", cats: ["Camisetas"] },
  { id: "cat-mayorista", title: "Mayorista", cats: ["Mayorista"] },
];

export function Products({ onAddToCart, cartQtyById }: { onAddToCart: (product: ProductItem, color?: string) => void; cartQtyById: Record<string, number> }) {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncReady, setIsSyncReady] = useState(!isCloudSyncEnabled());

  const loadProductsFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as ProductItem[]) : [];
      setProducts(Array.isArray(parsed) ? parsed : []);
    } catch {
      setProducts([]);
    }
  };

  useEffect(() => {
    const readyHandler = () => setIsSyncReady(true);
    window.addEventListener("sdt-cloud-sync-ready", readyHandler as EventListener);
    return () => window.removeEventListener("sdt-cloud-sync-ready", readyHandler as EventListener);
  }, []);

  useEffect(() => {
    try {
      loadProductsFromStorage();
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEY) loadProductsFromStorage();
    };
    window.addEventListener("sdt-products-updated", loadProductsFromStorage as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("sdt-products-updated", loadProductsFromStorage as EventListener);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  useEffect(() => {
    const searchHandler = (ev: Event) => {
      const custom = ev as CustomEvent<{ term?: string }>;
      setSearchTerm(String(custom.detail?.term ?? "").trim());
    };
    window.addEventListener("sdt-product-search", searchHandler as EventListener);
    return () => window.removeEventListener("sdt-product-search", searchHandler as EventListener);
  }, []);

  const availableModels = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.compatibleModels.forEach((m) => { if (m !== "Universal") set.add(m); }));
    return Array.from(set).sort();
  }, [products]);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.cat));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const byModel = !selectedModel
      ? products
      : products.filter((p) => p.compatibleModels.includes(selectedModel) || p.compatibleModels.includes("Universal"));
    const byCategory = !selectedCategory ? byModel : byModel.filter((p) => p.cat === selectedCategory);
    const bySearch = !searchTerm
      ? byCategory
      : byCategory.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return bySearch.slice().sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }, [products, selectedModel, selectedCategory, searchTerm]);

  if (!isHydrated || !isSyncReady) {
    return <section id="productos" className="relative border-b border-border py-24"><div className="mx-auto max-w-7xl px-4 md:px-8 text-sm text-muted-foreground">Cargando productos...</div></section>;
  }

  return (
    <section id="productos" className="relative border-b border-border py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 02 - Catalogo</div>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Productos por categoria</h2>
          </div>
          <div className="w-full max-w-sm border border-border bg-card/70 p-3">
            <label htmlFor="model-filter" className="mb-2 block font-display text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Filtro adicional (opcional)</label>
            <select id="model-filter" value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary">
              <option value="">Ver todos los productos</option>
              {availableModels.map((model) => <option key={model} value={model}>{model}</option>)}
            </select>
          </div>
        </div>

        {selectedModel && <p className="mb-8 text-sm text-muted-foreground">Mostrando productos filtrados por <span className="font-bold text-neon">{selectedModel}</span>.</p>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[290px_minmax(0,1fr)] lg:items-start">
          <aside className="border border-border bg-card/65 p-5 backdrop-blur-sm lg:sticky lg:top-28">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-xl font-bold uppercase tracking-widest text-neon">Categorias</h3>
              <button
                onClick={() => setSelectedCategory("")}
                className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-neon"
              >
                Reiniciar
              </button>
            </div>
            <div className="space-y-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="radio" name="cat-filter" checked={selectedCategory === ""} onChange={() => setSelectedCategory("")} />
                Todas las categorias
              </label>
              {availableCategories.map((cat) => (
                <label key={cat} className="inline-flex items-center gap-2 text-sm">
                  <input type="radio" name="cat-filter" checked={selectedCategory === cat} onChange={() => setSelectedCategory(cat)} />
                  {cat}
                </label>
              ))}
            </div>
          </aside>

          <div className="space-y-12">
            {sections.map((section) => {
              const list = filteredProducts.filter((p) => section.cats.includes(p.cat));
              if (!list.length) return null;
              return (
                <div id={section.id} key={section.id} className="scroll-mt-28">
                  <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-widest text-neon">{section.title}</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {list.map((p) => <ProductCard key={p.id} p={p} cartQty={cartQtyById[p.id] ?? 0} onAddToCart={onAddToCart} />)}
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && <div className="border border-border bg-card/60 p-6 text-center"><p className="font-display text-lg font-bold uppercase">No hay productos para ese filtro</p><p className="mt-2 text-sm text-muted-foreground">Carga productos en Supabase para mostrarlos aqui.</p></div>}
          </div>
        </div>
      </div>
    </section>
  );
}
