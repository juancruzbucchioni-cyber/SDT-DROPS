const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const KEYS = {
  products: "sdt_drops_products_v3",
  orders: "sdt_drops_orders_v1",
  categories: "sdt_drops_categories_v1",
  offers: "sdt_drops_offers_v1",
  cart: "sdt_drops_cart_v1",
};

let initialized = false;
let syncReady = false;

function isEnabled() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function isCloudSyncEnabled() {
  return isEnabled();
}

function markSyncReady() {
  syncReady = true;
  window.dispatchEvent(new CustomEvent("sdt-cloud-sync-ready"));
}

function restHeaders() {
  return {
    apikey: SUPABASE_ANON_KEY as string,
    Authorization: `Bearer ${SUPABASE_ANON_KEY as string}`,
    "Content-Type": "application/json",
  };
}

function dispatchRefreshEvents() {
  window.dispatchEvent(new CustomEvent("sdt-products-updated"));
  window.dispatchEvent(new CustomEvent("sdt-categories-updated"));
  window.dispatchEvent(new CustomEvent("sdt-order-created"));
  window.dispatchEvent(new CustomEvent("sdt-offers-updated"));
  window.dispatchEvent(new CustomEvent("sdt-cart-updated"));
}

type DbProduct = {
  id: string;
  name: string;
  cat: string;
  img: string;
  price: number;
  old?: number | null;
  tag?: string | null;
  stock: number;
  compatible_models?: string[] | null;
  colors?: unknown;
  tier_prices?: unknown;
};

type DbCategory = { id: string; name: string; img: string; order: number };
type DbOffer = { id: string; title: string; description: string; badge: string; img?: string | null };

async function fetchProducts() {
  const url = `${SUPABASE_URL}/rest/v1/products?select=id,name,cat,img,price,old,tag,stock,compatible_models,colors,tier_prices`;
  const res = await fetch(url, { headers: restHeaders() });
  if (!res.ok) return null;
  const rows = (await res.json()) as DbProduct[];
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    cat: p.cat,
    img: p.img,
    price: Number(p.price) || 0,
    old: p.old === null || p.old === undefined ? undefined : Number(p.old),
    tag: p.tag ?? undefined,
    stock: Number(p.stock) || 0,
    compatibleModels: Array.isArray(p.compatible_models) && p.compatible_models.length ? p.compatible_models : ["Universal"],
    colors: Array.isArray(p.colors) ? p.colors : undefined,
    tierPrices: Array.isArray(p.tier_prices) ? p.tier_prices : undefined,
  }));
}

async function fetchCategories() {
  const url = `${SUPABASE_URL}/rest/v1/categories?select=id,name,img,order&order=order.asc`;
  const res = await fetch(url, { headers: restHeaders() });
  if (!res.ok) return null;
  return (await res.json()) as DbCategory[];
}

async function fetchOffers() {
  const url = `${SUPABASE_URL}/rest/v1/offers?select=id,title,description,badge,img`;
  const res = await fetch(url, { headers: restHeaders() });
  if (!res.ok) return null;
  return (await res.json()) as DbOffer[];
}

export async function initializeCloudSync() {
  if (initialized) {
    if (syncReady) markSyncReady();
    return;
  }
  initialized = true;
  if (!isEnabled()) {
    markSyncReady();
    return;
  }

  try {
    const [products, categories, offers] = await Promise.all([fetchProducts(), fetchCategories(), fetchOffers()]);
    window.localStorage.setItem(KEYS.products, JSON.stringify(products ?? []));
    window.localStorage.setItem(KEYS.categories, JSON.stringify(categories ?? []));
    window.localStorage.setItem(KEYS.offers, JSON.stringify(offers ?? []));
    dispatchRefreshEvents();
  } catch {
    window.localStorage.setItem(KEYS.products, JSON.stringify([]));
    window.localStorage.setItem(KEYS.categories, JSON.stringify([]));
    window.localStorage.setItem(KEYS.offers, JSON.stringify([]));
    dispatchRefreshEvents();
  }
  markSyncReady();
}
