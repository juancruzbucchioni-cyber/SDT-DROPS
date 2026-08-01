import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

export const Route = createFileRoute("/santiagovillalba")({
  component: AdminPage,
});

type TierPrice = { minQty: number; maxQty?: number; unitPrice: number };
type ColorStock = { color: string; stock: number };

type ProductItem = {
  id: string;
  name: string;
  description?: string;
  cat: string;
  img: string;
  price: number;
  old?: number;
  tag?: string;
  stock: number;
  compatibleModels: string[];
  colors?: ColorStock[];
  tierPrices?: TierPrice[];
};

type CategoryItem = { id: string; name: string; img: string; order: number };

type TabKey = "productos" | "categorias";

const STORAGE_KEY = "sdt_drops_products_v3";
const ADMIN_SESSION_KEY = "sdt_admin_ok_v1";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://nwshsunoxwmgddtjvaqh.supabase.co";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "sb_publishable_e0Om4SdAs2xpHCLiQXmxzg_48ETZdxA";
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "Santivillalba2025";

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseTierPrices(input: string): TierPrice[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [rangeRaw, priceRaw] = chunk.split(":").map((x) => x.trim());
      if (!rangeRaw || !priceRaw) return null;
      const unitPrice = Number(priceRaw);
      if (!Number.isFinite(unitPrice)) return null;
      if (rangeRaw.endsWith("+")) {
        const minQty = Number(rangeRaw.replace("+", ""));
        if (!Number.isFinite(minQty)) return null;
        return { minQty, unitPrice };
      }
      const [minRaw, maxRaw] = rangeRaw.split("-").map((x) => x.trim());
      const minQty = Number(minRaw);
      const maxQty = Number(maxRaw);
      if (!Number.isFinite(minQty) || !Number.isFinite(maxQty)) return null;
      return { minQty, maxQty, unitPrice };
    })
    .filter((x): x is TierPrice => Boolean(x));
}

function parseColorsSimple(input: string): ColorStock[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((color) => ({ color, stock: 0 }));
}

function mapDbToUi(row: any): ProductItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    cat: row.cat,
    img: row.img ?? "",
    price: Number(row.price) || 0,
    old: row.old === null || row.old === undefined ? undefined : Number(row.old),
    tag: row.tag ?? "",
    stock: Number(row.stock) || 0,
    compatibleModels: Array.isArray(row.compatible_models) && row.compatible_models.length ? row.compatible_models : ["Universal"],
    colors: Array.isArray(row.colors) ? row.colors : [],
    tierPrices: Array.isArray(row.tier_prices) ? row.tier_prices : [],
  };
}

async function fetchProducts(): Promise<ProductItem[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,name,description,cat,img,price,old,tag,stock,compatible_models,colors,tier_prices&order=cat.asc,name.asc`, {
    headers: headers(),
  });
  if (!res.ok) throw new Error("No se pudieron cargar productos");
  const rows = await res.json();
  return (rows as any[]).map(mapDbToUi);
}

async function fetchCategories(): Promise<CategoryItem[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=id,name,img,order&order=order.asc`, {
    headers: headers(),
  });
  if (!res.ok) return [];
  const rows = await res.json();
  return rows as CategoryItem[];
}

async function uploadToSupabase(file: File): Promise<string> {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const fileName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${ext}`;
  const buckets = ["products", "Products"];

  for (const bucket of buckets) {
    const uploadRes = await fetch(`${SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "x-upsert": "true",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });

    if (uploadRes.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
    }
  }

  throw new Error("No se pudo subir imagen. Revisa policies de Storage.");
}

function AdminPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [tab, setTab] = useState<TabKey>("productos");
  const [items, setItems] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(1);
  const [cat, setCat] = useState("Mayorista");
  const [imgUrl, setImgUrl] = useState("");
  const [colorsInput, setColorsInput] = useState("");
  const [tierInput, setTierInput] = useState("");
  const [extraImages, setExtraImages] = useState("");
  const [uploading, setUploading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "available" | "low" | "empty">("all");
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (saved === "1") setOk(true);
  }, []);

  async function reload() {
    setLoading(true);
    setMsg("");
    try {
      const [products, cats] = await Promise.all([fetchProducts(), fetchCategories()]);
      setItems(products);
      setCategories(cats);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent("sdt-products-updated"));
    } catch (e: any) {
      setMsg(e?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (ok) void reload();
  }, [ok]);

  const totalStock = useMemo(() => items.reduce((acc, p) => acc + (p.stock || 0), 0), [items]);
  const lowStock = useMemo(() => items.filter((p) => (p.stock || 0) > 0 && (p.stock || 0) <= 5).length, [items]);
  const filteredAdminItems = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    return items.filter((product) => {
      const matchesSearch = !term || product.name.toLowerCase().includes(term) || product.cat.toLowerCase().includes(term);
      const matchesCategory = !categoryFilter || product.cat === categoryFilter;
      const matchesStock = stockFilter === "all" || (stockFilter === "available" && product.stock > 0) || (stockFilter === "low" && product.stock > 0 && product.stock <= 5) || (stockFilter === "empty" && product.stock <= 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [items, productSearch, categoryFilter, stockFilter]);
  const groupedAdminItems = useMemo(() => Array.from(filteredAdminItems.reduce<Map<string, ProductItem[]>>((groups, product) => {
    const key = product.cat || "Sin categoría";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(product);
    return groups;
  }, new Map())).sort((a, b) => a[0].localeCompare(b[0], "es")), [filteredAdminItems]);

  function toggleCategory(category: string) {
    setCollapsedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category); else next.add(category);
      return next;
    });
  }

  function clearForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setStock(1);
    setCat(categories[0]?.name ?? "Mayorista");
    setImgUrl("");
    setColorsInput("");
    setTierInput("");
    setExtraImages("");
  }

  async function saveProduct() {
    if (!name.trim()) {
      setMsg("El nombre es obligatorio");
      return;
    }

    const id = editingId || `${slugify(name)}-${Date.now()}`;
    const payload = {
      id,
      name: name.trim(),
      description: description.trim(),
      cat: cat.trim() || categories[0]?.name || "Mayorista",
      img: [imgUrl.trim(), ...extraImages.split(/\r?\n/).map((url) => url.trim()).filter(Boolean)].filter(Boolean).join("\n"),
      price: Number(price) || 0,
      old: null,
      tag: "",
      stock: Number(stock) || 0,
      compatible_models: ["Universal"],
      colors: parseColorsSimple(colorsInput),
      tier_prices: parseTierPrices(tierInput),
    };

    const method = editingId ? "PATCH" : "POST";
    const url = editingId
      ? `${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`
      : `${SUPABASE_URL}/rest/v1/products`;

    const res = await fetch(url, {
      method,
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`No se pudo guardar: ${t}`);
    }

    await reload();
    setMsg(`Guardado: ${name}`);
    if (!editingId) clearForm();
  }

  async function removeProduct(id: string) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`No se pudo borrar: ${t}`);
    }
    await reload();
    if (editingId === id) clearForm();
  }

  function startEdit(p: ProductItem) {
    setEditingId(p.id);
    setName(p.name);
    setDescription(p.description ?? "");
    setPrice(p.price ?? 0);
    setStock(p.stock ?? 0);
    setCat(p.cat ?? "Mayorista");
    const productImages = String(p.img ?? "").split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
    setImgUrl(productImages[0] ?? "");
    setColorsInput((p.colors ?? []).map((c) => c.color).join(", "));
    setTierInput((p.tierPrices ?? []).map((t) => `${t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`}:${t.unitPrice}`).join(", "));
    setExtraImages(productImages.slice(1).join("\n"));
    setTab("productos");
  }

  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-foreground">
        <h1 className="font-display text-3xl font-bold uppercase">Panel administrador</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ingresa la contraseña para editar.</p>
        <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="mt-4 w-full border border-border bg-background px-3 py-2" placeholder="Contraseña" />
        <button
          className="mt-3 w-full border border-primary bg-primary px-4 py-2 font-display text-xs font-bold uppercase"
          onClick={() => {
            if (!ADMIN_PASSWORD || pass !== ADMIN_PASSWORD) {
              setMsg("Contraseña incorrecta o VITE_ADMIN_PASSWORD no configurada");
              return;
            }
            window.localStorage.setItem(ADMIN_SESSION_KEY, "1");
            setOk(true);
            setMsg("");
          }}
        >
          Entrar
        </button>
        {msg ? <p className="mt-3 text-sm text-red-400">{msg}</p> : null}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 text-foreground">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase">Panel administrador</h1>
          <p className="text-sm text-muted-foreground">Crea y edita productos y categorias conectadas a Supabase.</p>
        </div>
        <div className="flex gap-2">
          <button className="border border-border bg-card px-3 py-2 text-xs uppercase" onClick={() => void reload()} disabled={loading}>
            {loading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <StatCard title="Productos" value={items.length} />
        <StatCard title="Categorias" value={categories.length} />
        <StatCard title="Stock total" value={totalStock} />
        <StatCard title="Stock bajo" value={lowStock} />
      </div>

      <div className="mb-6 flex gap-2">
        <TabBtn active={tab === "productos"} onClick={() => setTab("productos")}>Productos</TabBtn>
        <TabBtn active={tab === "categorias"} onClick={() => setTab("categorias")}>Categorias</TabBtn>
      </div>

      {msg ? <p className="mb-4 text-sm text-amber-300">{msg}</p> : null}

      {tab === "productos" ? (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <section className="border border-border bg-card/65 p-4">
            <h2 className="font-display text-2xl font-bold uppercase">{editingId ? "Editar producto" : "Nuevo producto"}</h2>

            <label className="mt-3 block text-sm font-semibold">Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Descripcion</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold">Precio ARS</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Stock</label>
                <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="mt-1 w-full border border-border bg-background px-3 py-2" />
              </div>
            </div>

            <label className="mt-3 block text-sm font-semibold">Categoria</label>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2">
              <option value="" disabled>Seleccionar categoría</option>
              {categories.slice().sort((a, b) => a.order - b.order).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
            {!categories.length ? <p className="mt-1 text-xs text-amber-600">Primero creá una categoría en la pestaña Categorías.</p> : null}

            <label className="mt-3 block text-sm font-semibold">Imágenes del producto</label>
            <p className="mt-1 text-xs text-muted-foreground">Elegí una o varias imágenes de tu galería o carpeta de descargas. La primera será la principal.</p>
            <input
              type="file"
              accept="image/*"
              multiple
              className="mt-1 w-full border border-border bg-background px-3 py-2"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setUploading(true);
                try {
                  const urls: string[] = [];
                  for (const file of files) urls.push(await uploadToSupabase(file));
                  const current = [imgUrl.trim(), ...extraImages.split(/\r?\n/).map((url) => url.trim()).filter(Boolean)].filter(Boolean);
                  const all = [...current, ...urls];
                  setImgUrl(all[0] ?? "");
                  setExtraImages(all.slice(1).join("\n"));
                  setMsg(`${urls.length} ${urls.length === 1 ? "imagen subida" : "imágenes subidas"} correctamente`);
                } catch (err: any) {
                  setMsg(err?.message ?? "Error al subir imágenes");
                } finally {
                  setUploading(false);
                }
              }}
            />

            <label className="mt-3 block text-sm font-semibold">Imagen principal</label>
            <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Colores separados por coma</label>
            <input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="Negro, Blanco, Gris" className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Precios por unidad</label>
            <input value={tierInput} onChange={(e) => setTierInput(e.target.value)} placeholder="1-9:10000,10-19:9500,20+:9000" className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Imágenes adicionales</label>
            <textarea value={extraImages} onChange={(e) => setExtraImages(e.target.value)} rows={3} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <div className="mt-4 flex gap-2">
              <button
                disabled={uploading}
                className="border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase"
                onClick={() => void saveProduct().catch((e) => setMsg(String(e?.message ?? e)))}
              >
                Guardar
              </button>
              <button className="border border-border bg-card px-4 py-2 text-xs font-bold uppercase" onClick={clearForm}>
                Limpiar
              </button>
            </div>
          </section>

          <section className="border border-border bg-card/65 p-4">
            <div className="mb-4 grid gap-3 border-b border-border pb-4 md:grid-cols-[minmax(220px,1fr)_180px_160px]">
              <label className="relative block">
                <span className="sr-only">Buscar productos</span>
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Buscar producto…" className="h-11 w-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary" />
              </label>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="h-11 border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                <option value="">Todas las categorías</option>
                {categories.slice().sort((a, b) => a.order - b.order).map((category) => <option key={`filter-${category.id}`} value={category.name}>{category.name}</option>)}
              </select>
              <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value as typeof stockFilter)} className="h-11 border border-border bg-background px-3 text-sm outline-none focus:border-primary">
                <option value="all">Todo el stock</option>
                <option value="available">Con stock</option>
                <option value="low">Stock bajo</option>
                <option value="empty">Sin stock</option>
              </select>
            </div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <span>{filteredAdminItems.length} {filteredAdminItems.length === 1 ? "producto" : "productos"}</span>
              <div className="flex gap-2">
                <button onClick={() => setCollapsedCategories(new Set(groupedAdminItems.map(([category]) => category)))} className="rounded-md border border-border bg-background px-3 py-1.5 hover:border-primary">Contraer todo</button>
                <button onClick={() => setCollapsedCategories(new Set())} className="rounded-md border border-border bg-background px-3 py-1.5 hover:border-primary">Expandir todo</button>
              </div>
            </div>
            <div className="overflow-auto">
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-neon">
                    <th className="px-2 py-2">Producto</th>
                    <th className="px-2 py-2">Categoria</th>
                    <th className="px-2 py-2">Precio</th>
                    <th className="px-2 py-2">Stock</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedAdminItems.flatMap(([categoryName, list]) => [
                      <tr key={`sep-${categoryName}`} className="border-y border-primary/30 bg-primary/10">
                        <td colSpan={5}>
                          <button onClick={() => toggleCategory(categoryName)} aria-expanded={!collapsedCategories.has(categoryName)} className="flex w-full items-center justify-between px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-primary">
                            <span className="flex items-center gap-2">{collapsedCategories.has(categoryName) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{categoryName}</span>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px]">{list.length}</span>
                          </button>
                        </td>
                      </tr>,
                      ...(collapsedCategories.has(categoryName) ? [] : list
                        .slice()
                        .sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }))
                        .map((p) => (
                          <tr key={p.id} className="border-b border-border/60">
                            <td className="px-2 py-3">{p.name}</td>
                            <td className="px-2 py-3">{p.cat}</td>
                            <td className="px-2 py-3">{formatPrice(p.price)}</td>
                            <td className="px-2 py-3">{p.stock}</td>
                            <td className="px-2 py-3">
                              <div className="flex gap-2">
                                <button className="border border-border bg-card px-2 py-1 text-xs uppercase" onClick={() => startEdit(p)}>Editar</button>
                                <button
                                  className="border border-red-500 bg-red-500/20 px-2 py-1 text-xs uppercase"
                                  onClick={() => {
                                    if (!window.confirm(`Eliminar ${p.name}?`)) return;
                                    void removeProduct(p.id).catch((e) => setMsg(String(e?.message ?? e)));
                                  }}
                                >
                                  Borrar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))),
                    ])}
                  {!groupedAdminItems.length ? <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">No se encontraron productos con esos filtros.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "categorias" ? (
        <section className="border border-border bg-card/65 p-4">
          <div className="overflow-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-neon">
                  <th className="px-2 py-2">ID</th>
                  <th className="px-2 py-2">Nombre</th>
                  <th className="px-2 py-2">Imagen URL</th>
                  <th className="px-2 py-2">Orden</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <CategoryRow
                    key={c.id}
                    item={c}
                    onSave={async (next) => {
                      const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?id=eq.${encodeURIComponent(c.id)}`, {
                        method: "PATCH",
                        headers: { ...headers(), Prefer: "return=representation" },
                        body: JSON.stringify(next),
                      });
                      if (!res.ok) {
                        const t = await res.text();
                        throw new Error(`No se pudo guardar categoria: ${t}`);
                      }
                      await reload();
                      setMsg(`Categoria guardada: ${next.name}`);
                    }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="border border-border bg-card/65 p-3">
      <div className="text-xs uppercase text-muted-foreground">{title}</div>
      <div className="mt-1 font-display text-2xl font-bold text-neon">{value}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`border px-4 py-2 text-sm font-bold ${active ? "border-primary bg-primary/25 text-neon" : "border-border bg-card text-foreground"}`}
    >
      {children}
    </button>
  );
}

function CategoryRow({
  item,
  onSave,
}: {
  item: CategoryItem;
  onSave: (next: CategoryItem) => Promise<void>;
}) {
  const [draft, setDraft] = useState<CategoryItem>(item);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(item);
  }, [item]);

  return (
    <tr className="border-b border-border/60">
      <td className="px-2 py-2">{draft.id}</td>
      <td className="px-2 py-2">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full border border-border bg-background px-2 py-1" />
      </td>
      <td className="px-2 py-2">
        <div className="min-w-[260px] space-y-2">
          {draft.img ? <img src={draft.img} alt={`Imagen de ${draft.name}`} className="h-16 w-24 rounded-md border border-border object-cover" /> : null}
          <input value={draft.img} onChange={(e) => setDraft({ ...draft, img: e.target.value })} placeholder="URL de la imagen" className="w-full border border-border bg-background px-2 py-1" />
          <label className="inline-flex cursor-pointer items-center rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold transition-colors hover:border-primary">
            {busy ? "Subiendo…" : "Elegir de galería"}
            <input
              type="file"
              accept="image/*"
              disabled={busy}
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setBusy(true);
                try {
                  const url = await uploadToSupabase(file);
                  setDraft((current) => ({ ...current, img: url }));
                } catch (error: any) {
                  window.alert(error?.message ?? "No se pudo subir la imagen");
                } finally {
                  setBusy(false);
                  event.target.value = "";
                }
              }}
            />
          </label>
        </div>
      </td>
      <td className="px-2 py-2">
        <input type="number" value={draft.order} onChange={(e) => setDraft({ ...draft, order: Number(e.target.value) || 0 })} className="w-24 border border-border bg-background px-2 py-1" />
      </td>
      <td className="px-2 py-2">
        <button
          disabled={busy}
          className="border border-primary bg-primary px-2 py-1 text-xs uppercase"
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(draft);
            } finally {
              setBusy(false);
            }
          }}
        >
          Guardar
        </button>
      </td>
    </tr>
  );
}

