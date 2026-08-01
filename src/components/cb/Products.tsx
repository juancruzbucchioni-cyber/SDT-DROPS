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
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#C5D5ED] bg-[#DCE8FA] transition-shadow hover:shadow-[0_12px_30px_rgba(17,24,39,.08)]">
      <div className="relative aspect-square overflow-hidden bg-[#EAF1FC]">
        <img
          src={resolveImageSrc(p.img)}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackProductImage;
          }}
          className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {p.tag && <span className="absolute left-3 top-3 rounded-md border border-[#C5D5ED] bg-[#EAF1FC] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{p.tag}</span>}
        <button
          disabled={disabled}
          onClick={() => onAddToCart(p, selectedColor)}
          className="absolute inset-x-3 bottom-3 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white opacity-100 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <Plus className="h-4 w-4" /> {disabled ? "Sin stock" : "Anadir al carrito"}
        </button>
      </div>
      <div className="flex flex-col gap-1 p-4">
        <span className="text-xs font-medium text-muted-foreground">{p.cat}</span>
        <h3 className="text-base font-semibold leading-snug normal-case tracking-normal text-foreground">{p.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground">{formatPrice(currentUnitPrice)}</span>
          {p.old && <span className="text-sm text-muted-foreground line-through">{formatPrice(p.old)}</span>}
        </div>
        {p.colors?.length ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Colores</span>
            <div className="flex flex-wrap gap-1.5">
              {p.colors.map((c, idx) => (
                <button
                  type="button"
                  key={`${p.id}-color-${idx}`}
                  onClick={() => setSelectedColor(c.color)}
                  className={`inline-flex items-center gap-1 rounded-full border p-1 ${selectedColor === c.color ? "border-primary" : "border-border"}`}
                >
                  <span title={c.color} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: resolveColorCss(c.color) }} />
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

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.cat));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const byCategory = !selectedCategory ? products : products.filter((p) => p.cat === selectedCategory);
    const bySearch = !searchTerm
      ? byCategory
      : byCategory.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return bySearch.slice().sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  }, [products, selectedCategory, searchTerm]);

  if (!isHydrated || !isSyncReady) {
    return <section id="productos" className="border-b border-border bg-[#DFE7F1] py-20"><div className="mx-auto max-w-7xl px-4 text-sm text-muted-foreground md:px-8">Cargando productos…</div></section>;
  }

  return (
    <section id="productos" className="border-y border-border bg-[#DFE7F1] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Productos seleccionados</h2></div>
          <select aria-label="Filtrar por categoría" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-11 w-full rounded-lg border border-[#C5D5ED] bg-[#DCE8FA] px-3 text-sm text-foreground outline-none focus:border-primary sm:w-56"><option value="">Todas las categorías</option>{availableCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
        </div>
          <div className="space-y-12">
            {sections.map((section) => {
              const list = filteredProducts.filter((p) => section.cats.includes(p.cat));
              if (!list.length) return null;
              return (
                <div id={section.id} key={section.id} className="scroll-mt-28">
                  <h3 className="mb-4 text-xl font-semibold normal-case tracking-normal text-foreground">{section.title}</h3>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {list.map((p) => <ProductCard key={p.id} p={p} cartQty={cartQtyById[p.id] ?? 0} onAddToCart={onAddToCart} />)}
                  </div>
                </div>
              );
            })}
            {filteredProducts.length === 0 && <div className="rounded-xl border border-[#C5D5ED] bg-[#DCE8FA] p-8 text-center"><p className="text-base font-semibold">No hay productos para ese filtro</p><p className="mt-2 text-sm text-muted-foreground">Probá con otra categoría o búsqueda.</p></div>}
          </div>
      </div>
    </section>
  );
}
