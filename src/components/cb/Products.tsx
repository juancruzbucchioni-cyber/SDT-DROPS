import { useEffect, useMemo, useState } from "react";
import fallbackProductImage from "@/assets/productos/todos.png";
import { Plus } from "lucide-react";
import { isCloudSyncEnabled } from "@/lib/cloud-sync";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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

function resolveImageSources(src?: string) {
  const values = String(src ?? "").split(/\r?\n/).map((value) => value.trim()).filter((value) => value.startsWith("http://") || value.startsWith("https://"));
  return values.length ? values : [fallbackProductImage];
}

const SIZE_VARIANTS = new Set(["S", "M", "L", "XL", "XXL"]);

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

function getUsdPrice(product: ProductItem) {
  const marker = (product.compatibleModels ?? []).find((value) => value.startsWith("USD:"));
  const value = marker ? Number(marker.replace("USD:", "")) : 0;
  return Number.isFinite(value) && value > 0 ? value : null;
}

function ProductCard({ p, cartQty, onAddToCart }: { p: ProductItem; cartQty: number; onAddToCart: (product: ProductItem, color?: string) => void }) {
  const isCamiseta = p.cat.trim().toLocaleLowerCase("es") === "camisetas";
  const hasSizeVariants = Boolean(
    p.colors?.length &&
      p.colors.every((variant) => SIZE_VARIANTS.has(variant.color.trim().toUpperCase())),
  );
  const productImages = resolveImageSources(p.img);
  const [activeImage, setActiveImage] = useState(productImages[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(p.colors?.[0]?.color);
  const remaining = Math.max(0, getColorStock(p, selectedColor) - cartQty);
  const disabled = remaining <= 0;
  const usdPrice = getUsdPrice(p);
  const tiers = (p.tierPrices ?? []).slice().sort((a, b) => a.minQty - b.minQty);

  return (
    <article className="product-card-enhanced group relative flex flex-col overflow-hidden rounded-xl border border-[#D7DCE3] bg-[#F3F5F7]">
      <div className="relative aspect-square overflow-hidden bg-[#E8EBEF]">
        <img
          src={activeImage}
          alt={p.name}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = fallbackProductImage;
          }}
          className="absolute inset-0 h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {p.tag && <span className="absolute left-3 top-3 rounded-md border border-[#C5D5ED] bg-[#EAF1FC] px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{p.tag}</span>}
        <button
          disabled={disabled}
          onClick={() => onAddToCart(p, selectedColor)}
          className="absolute inset-x-3 bottom-3 cta-enhanced inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white opacity-100 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 lg:opacity-0 lg:group-hover:opacity-100"
        >
          <Plus className="h-4 w-4" /> {disabled ? "Sin stock" : "Añadir al carrito"}
        </button>
      </div>
      <div className="flex flex-col gap-1 p-3.5">
        {productImages.length > 1 ? <div className="mb-2 flex gap-2 overflow-x-auto">{productImages.map((image, index) => <button key={`${p.id}-image-${index}`} type="button" onClick={() => setActiveImage(image)} aria-label={`Ver imagen ${index + 1} de ${p.name}`} className={`h-10 w-10 shrink-0 overflow-hidden rounded-md border ${activeImage === image ? "border-primary" : "border-border"}`}><img src={image} alt="" className="h-full w-full object-cover" /></button>)}</div> : null}
        <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary/80">{p.cat}</span>
        <h3 className="text-base font-semibold leading-snug normal-case tracking-normal text-foreground">{p.name}</h3>
        {p.description?.trim() ? (
          <p
            className="mt-1 text-sm leading-5 text-muted-foreground"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
            title={p.description.trim()}
          >
            {p.description.trim()}
          </p>
        ) : null}
        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Precio unitario</p>
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">{formatPrice(p.price)}</span>
          {typeof p.old === "number" && p.old > 0 ? (
            <span className="text-sm text-muted-foreground line-through">{formatPrice(p.old)}</span>
          ) : null}
        </div>
        {usdPrice ? <p className="text-sm font-bold text-emerald-700">💵 USD {new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(usdPrice)}</p> : null}
        {tiers.length ? <div className="mt-2 overflow-hidden rounded-lg border border-[#AFC9F2] bg-[#E7F0FE]">
          <p className="border-b border-[#AFC9F2] bg-[#D7E7FC] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#1554B8]">Precio por cantidad</p>
          <div className="divide-y divide-[#BFD3F2]">{tiers.map((tier, index) => <div key={`${p.id}-tier-${index}`} className="flex items-center justify-between gap-3 px-2.5 py-1.5 text-xs">
            <span className="font-medium text-[#31547D]">{tier.maxQty ? `${tier.minQty} a ${tier.maxQty} unidades` : `Desde ${tier.minQty} unidades`}</span>
            <span className="shrink-0 font-bold text-[#0B5ED7]">{formatPrice(tier.unitPrice)} c/u</span>
          </div>)}</div>
        </div> : null}
        {p.colors?.length && (!isCamiseta || hasSizeVariants) ? (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{hasSizeVariants ? "Talles" : "Colores"}</span>
            <div className="flex flex-wrap gap-1.5">
              {p.colors.map((c, idx) => (
                <button
                  type="button"
                  key={`${p.id}-color-${idx}`}
                  onClick={() => setSelectedColor(c.color)}
                  aria-label={`Seleccionar ${hasSizeVariants ? "talle" : "color"} ${c.color}`}
                  className={`inline-flex min-h-7 items-center justify-center border text-xs font-bold transition ${
                    hasSizeVariants ? "rounded-md px-2 py-1" : "rounded-full p-1"
                  } ${
                    selectedColor === c.color
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {hasSizeVariants ? (
                    c.color.toUpperCase()
                  ) : (
                    <span title={c.color} className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: resolveColorCss(c.color) }} />
                  )}
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
  const sectionRef = useScrollReveal();
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
    return (
      <section id="productos" className="border-b border-border bg-[#ECEFF3] py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-7 sm:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Productos seleccionados</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={`skel-${i}`} className="flex flex-col overflow-hidden rounded-xl border border-[#D7DCE3] bg-[#F3F5F7]">
                <div className="skeleton aspect-square" />
                <div className="space-y-3 p-4">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-5 w-3/4" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-7 w-28" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }



  return (
    <section id="productos" ref={sectionRef} className="border-y border-border bg-[#ECEFF3] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-10 sm:flex-row sm:items-end sm:gap-5">
          <div className="reveal">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Productos seleccionados</h2>
          </div>
          <select aria-label="Filtrar por categoría" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="h-11 w-full rounded-lg border border-[#C5D5ED] bg-[#DCE8FA] px-3 text-sm font-semibold text-foreground outline-none focus:border-primary sm:w-56"><option value="">TODAS LAS CATEGORÍAS</option>{availableCategories.map((cat) => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}</select>
        </div>
          <div className="space-y-12">
            {sections.slice().sort((a, b) => a.title.localeCompare(b.title, "es", { sensitivity: "base" })).map((section) => {
              const list = filteredProducts.filter((p) => section.cats.includes(p.cat));
              if (!list.length) return null;
              return (
                <div id={section.id} key={section.id} className="scroll-mt-28">
                  <h3 className="mb-4 text-xl font-extrabold uppercase tracking-[0.08em] text-foreground">{section.title}</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
