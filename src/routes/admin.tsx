import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
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

type TabKey = "productos" | "categorias" | "resenas";

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

  function clearForm() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice(0);
    setStock(1);
    setCat("Mayorista");
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
      cat: cat.trim() || "Mayorista",
      img: imgUrl.trim(),
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
    setImgUrl(p.img ?? "");
    setColorsInput((p.colors ?? []).map((c) => c.color).join(", "));
    setTierInput((p.tierPrices ?? []).map((t) => `${t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`}:${t.unitPrice}`).join(", "));
    setExtraImages("");
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
          <p className="text-sm text-muted-foreground">Crea y edita productos, categorias y resenas conectadas a Supabase.</p>
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
        <TabBtn active={tab === "resenas"} onClick={() => setTab("resenas")}>Resenas</TabBtn>
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
            <input value={cat} onChange={(e) => setCat(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Imagen principal</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 w-full border border-border bg-background px-3 py-2"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const url = await uploadToSupabase(file);
                  setImgUrl(url);
                  setMsg("Imagen subida correctamente");
                } catch (err: any) {
                  setMsg(err?.message ?? "Error al subir imagen");
                } finally {
                  setUploading(false);
                }
              }}
            />

            <label className="mt-3 block text-sm font-semibold">Imagen principal URL</label>
            <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Colores separados por coma</label>
            <input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="Negro, Blanco, Gris" className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Precios por unidad</label>
            <input value={tierInput} onChange={(e) => setTierInput(e.target.value)} placeholder="1-9:10000,10-19:9500,20+:9000" className="mt-1 w-full border border-border bg-background px-3 py-2" />

            <label className="mt-3 block text-sm font-semibold">Mas imagenes, una por linea</label>
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
                  {items.map((p) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "categorias" ? (
        <section className="border border-border bg-card/65 p-4 text-sm text-muted-foreground">
          Edicion de categorias en siguiente paso. Ya quedan visibles: {categories.map((c) => c.name).join(", ")}.
        </section>
      ) : null}

      {tab === "resenas" ? (
        <section className="border border-border bg-card/65 p-4 text-sm text-muted-foreground">
          Edicion de resenas en siguiente paso.
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
