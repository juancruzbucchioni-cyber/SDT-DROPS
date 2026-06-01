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

const STORAGE_KEY = "sdt_drops_products_v3";
const ADMIN_SESSION_KEY = "sdt_admin_ok_v1";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://nwshsunoxwmgddtjvaqh.supabase.co";
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "sb_publishable_e0Om4SdAs2xpHCLiQXmxzg_48ETZdxA";
const ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined) ?? "";

function headers() {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

function parseTierPrices(input: string): TierPrice[] {
  // formato: 1-9:10000,10-19:9500,20+:9000
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

function stringifyTierPrices(tiers?: TierPrice[]): string {
  if (!tiers?.length) return "";
  return tiers
    .map((t) => `${t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`}:${t.unitPrice}`)
    .join(", ");
}

function parseColors(input: string): ColorStock[] {
  // formato: negro:10,#1e90ff:8
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [colorRaw, stockRaw] = chunk.split(":").map((x) => x.trim());
      const stock = Number(stockRaw);
      if (!colorRaw || !Number.isFinite(stock)) return null;
      return { color: colorRaw, stock };
    })
    .filter((x): x is ColorStock => Boolean(x));
}

function stringifyColors(colors?: ColorStock[]): string {
  if (!colors?.length) return "";
  return colors.map((c) => `${c.color}:${c.stock}`).join(", ");
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

function AdminPage() {
  const [pass, setPass] = useState("");
  const [ok, setOk] = useState(false);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_SESSION_KEY);
    if (saved === "1") setOk(true);
  }, []);

  const grouped = useMemo(() => {
    const m = new Map<string, ProductItem[]>();
    for (const p of items) {
      if (!m.has(p.cat)) m.set(p.cat, []);
      m.get(p.cat)!.push(p);
    }
    return Array.from(m.entries()).sort((a, b) => a[0].localeCompare(b[0], "es"));
  }, [items]);

  async function reload() {
    setLoading(true);
    setMsg("");
    try {
      const data = await fetchProducts();
      setItems(data);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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

  async function save(item: ProductItem, tierInput: string, colorsInput: string) {
    setMsg("");
    const payload = {
      id: item.id,
      name: item.name,
      description: item.description ?? "",
      cat: item.cat,
      img: item.img,
      price: Number(item.price) || 0,
      old: item.old === undefined || item.old === null || Number.isNaN(Number(item.old)) ? null : Number(item.old),
      tag: item.tag ?? "",
      stock: Number(item.stock) || 0,
      compatible_models: item.compatibleModels?.length ? item.compatibleModels : ["Universal"],
      tier_prices: parseTierPrices(tierInput),
      colors: parseColors(colorsInput),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`No se pudo guardar ${item.name}: ${t}`);
    }
  }

  async function removeItem(id: string) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: headers(),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`No se pudo borrar: ${t}`);
    }
  }

  async function createNew() {
    const id = `prod-${Date.now()}`;
    const payload = {
      id,
      name: "Nuevo producto",
      description: "",
      cat: "Mayorista",
      img: "",
      price: 0,
      old: null,
      tag: "",
      stock: 0,
      compatible_models: ["Universal"],
      tier_prices: [],
      colors: [],
    };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: "POST",
      headers: { ...headers(), Prefer: "return=representation" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`No se pudo crear: ${t}`);
    }
  }

  if (!ok) {
    return (
      <main className="mx-auto max-w-md px-4 py-16 text-foreground">
        <h1 className="font-display text-3xl font-bold uppercase">Panel Admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">Ingresa la contraseña para editar productos.</p>
        <input
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="mt-4 w-full border border-border bg-background px-3 py-2"
          placeholder="Contraseña"
        />
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl font-bold uppercase">Panel Admin Productos</h1>
        <div className="flex gap-2">
          <button className="border border-border bg-card px-3 py-2 text-xs uppercase" onClick={() => void reload()} disabled={loading}>
            {loading ? "Cargando..." : "Recargar"}
          </button>
          <button
            className="border border-primary bg-primary px-3 py-2 text-xs uppercase"
            onClick={() => void createNew().then(reload).catch((e) => setMsg(String(e?.message ?? e)))}
          >
            Nuevo producto
          </button>
          <button
            className="border border-border bg-card px-3 py-2 text-xs uppercase"
            onClick={() => {
              window.localStorage.removeItem(ADMIN_SESSION_KEY);
              setOk(false);
            }}
          >
            Salir
          </button>
        </div>
      </div>

      {msg ? <p className="mb-4 text-sm text-amber-300">{msg}</p> : null}

      <div className="space-y-8">
        {grouped.map(([cat, products]) => (
          <section key={cat} className="border border-border bg-card/60 p-4">
            <h2 className="mb-3 font-display text-xl font-bold uppercase text-neon">{cat}</h2>
            <div className="space-y-4">
              {products.map((p) => (
                <ProductEditor
                  key={p.id}
                  item={p}
                  onSave={async (next, tierInput, colorsInput) => {
                    await save(next, tierInput, colorsInput);
                    await reload();
                    setMsg(`Guardado: ${next.name}`);
                  }}
                  onDelete={async () => {
                    await removeItem(p.id);
                    await reload();
                    setMsg(`Eliminado: ${p.name}`);
                  }}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function ProductEditor({
  item,
  onSave,
  onDelete,
}: {
  item: ProductItem;
  onSave: (item: ProductItem, tierInput: string, colorsInput: string) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<ProductItem>(item);
  const [tierInput, setTierInput] = useState(stringifyTierPrices(item.tierPrices));
  const [colorsInput, setColorsInput] = useState(stringifyColors(item.colors));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDraft(item);
    setTierInput(stringifyTierPrices(item.tierPrices));
    setColorsInput(stringifyColors(item.colors));
  }, [item]);

  return (
    <div className="grid gap-2 border border-border bg-background/40 p-3">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Nombre" className="border border-border bg-background px-3 py-2" />
        <input value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} placeholder="ID" className="border border-border bg-background px-3 py-2" />
      </div>
      <input value={draft.description ?? ""} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Descripcion" className="border border-border bg-background px-3 py-2" />
      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <input value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value })} placeholder="Categoria" className="border border-border bg-background px-3 py-2" />
        <input type="number" value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} placeholder="Precio base" className="border border-border bg-background px-3 py-2" />
        <input type="number" value={draft.old ?? ""} onChange={(e) => setDraft({ ...draft, old: e.target.value ? Number(e.target.value) : undefined })} placeholder="Precio anterior" className="border border-border bg-background px-3 py-2" />
        <input type="number" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })} placeholder="Stock" className="border border-border bg-background px-3 py-2" />
      </div>
      <input value={draft.img} onChange={(e) => setDraft({ ...draft, img: e.target.value })} placeholder="URL imagen" className="border border-border bg-background px-3 py-2" />
      <input value={tierInput} onChange={(e) => setTierInput(e.target.value)} placeholder="Precios por tramo: 1-9:10000,10-19:9500,20+:9000" className="border border-border bg-background px-3 py-2" />
      <input value={colorsInput} onChange={(e) => setColorsInput(e.target.value)} placeholder="Colores: negro:10,rojo:6,#1e90ff:8" className="border border-border bg-background px-3 py-2" />

      <div className="mt-1 flex gap-2">
        <button
          disabled={busy}
          className="border border-primary bg-primary px-3 py-2 text-xs uppercase"
          onClick={async () => {
            setBusy(true);
            try {
              await onSave(draft, tierInput, colorsInput);
            } finally {
              setBusy(false);
            }
          }}
        >
          Guardar
        </button>
        <button
          disabled={busy}
          className="border border-red-500 bg-red-500/20 px-3 py-2 text-xs uppercase"
          onClick={async () => {
            if (!window.confirm(`Eliminar ${draft.name}?`)) return;
            setBusy(true);
            try {
              await onDelete();
            } finally {
              setBusy(false);
            }
          }}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
