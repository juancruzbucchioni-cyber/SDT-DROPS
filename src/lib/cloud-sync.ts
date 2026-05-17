const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
const LOCAL_ONLY_MODE = (import.meta.env.VITE_LOCAL_ONLY_MODE as string | undefined) === "1";

const TABLE = "sdt_app_state";
const ROW_ID = "main";

const KEYS = {
  products: "sdt_drops_products_v3",
  orders: "sdt_drops_orders_v1",
  categories: "sdt_drops_categories_v1",
  offers: "sdt_drops_offers_v1",
  cart: "sdt_drops_cart_v1",
};

let initialized = false;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let syncReady = false;

function isEnabled() {
  return !LOCAL_ONLY_MODE && Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
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

function parseOrNull(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function readLocalState() {
  return {
    products: parseOrNull(window.localStorage.getItem(KEYS.products)),
    orders: parseOrNull(window.localStorage.getItem(KEYS.orders)),
    categories: parseOrNull(window.localStorage.getItem(KEYS.categories)),
    offers: parseOrNull(window.localStorage.getItem(KEYS.offers)),
    cart: parseOrNull(window.localStorage.getItem(KEYS.cart)),
  };
}

function hasAnyLocalData(state: ReturnType<typeof readLocalState>) {
  return Object.values(state).some((v) => v !== null && v !== undefined);
}

function hasMeaningfulData(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === "object") return Object.keys(value as Record<string, unknown>).length > 0;
  return value !== null && value !== undefined;
}

function hasMeaningfulCloudData(payload: unknown) {
  if (!payload || typeof payload !== "object") return false;
  const obj = payload as Record<string, unknown>;
  return Object.values(obj).some(hasMeaningfulData);
}

function writeLocalState(payload: Partial<Record<keyof ReturnType<typeof readLocalState>, unknown>>) {
  if (payload.products !== undefined) window.localStorage.setItem(KEYS.products, JSON.stringify(payload.products));
  if (payload.orders !== undefined) window.localStorage.setItem(KEYS.orders, JSON.stringify(payload.orders));
  if (payload.categories !== undefined) window.localStorage.setItem(KEYS.categories, JSON.stringify(payload.categories));
  if (payload.offers !== undefined) window.localStorage.setItem(KEYS.offers, JSON.stringify(payload.offers));
  if (payload.cart !== undefined) window.localStorage.setItem(KEYS.cart, JSON.stringify(payload.cart));
}

async function fetchCloudState() {
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${ROW_ID}&select=id,payload`;
  const res = await fetch(url, { headers: restHeaders() });
  if (!res.ok) return null;
  const rows = (await res.json()) as Array<{ id: string; payload?: Record<string, unknown> }>;
  return rows[0]?.payload ?? null;
}

async function saveCloudState() {
  if (!isEnabled()) return;
  const payload = readLocalState();
  const body = [{ id: ROW_ID, payload, updated_at: new Date().toISOString() }];
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}?on_conflict=id`;
  await fetch(url, {
    method: "POST",
    headers: { ...restHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(body),
  });
}

function dispatchRefreshEvents() {
  window.dispatchEvent(new CustomEvent("sdt-products-updated"));
  window.dispatchEvent(new CustomEvent("sdt-categories-updated"));
  window.dispatchEvent(new CustomEvent("sdt-order-created"));
  window.dispatchEvent(new CustomEvent("sdt-offers-updated"));
  window.dispatchEvent(new CustomEvent("sdt-cart-updated"));
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    void saveCloudState();
  }, 600);
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
    const localState = readLocalState();
    const cloudPayload = await fetchCloudState();

    if (cloudPayload && hasMeaningfulCloudData(cloudPayload)) {
      writeLocalState(cloudPayload as Partial<Record<keyof ReturnType<typeof readLocalState>, unknown>>);
      dispatchRefreshEvents();
    } else if (hasAnyLocalData(localState)) {
      await saveCloudState();
    }
  } catch {
    // keep local mode silently
  }

  const watched = [
    "sdt-products-updated",
    "sdt-categories-updated",
    "sdt-order-created",
    "sdt-offers-updated",
    "sdt-cart-updated",
  ];
  watched.forEach((eventName) => window.addEventListener(eventName, scheduleSave as EventListener));
  markSyncReady();
}
