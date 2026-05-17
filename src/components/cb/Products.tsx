import { useEffect, useMemo, useState } from "react";
import fallbackProductImage from "@/assets/productos/todos.png";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { isCloudSyncEnabled } from "@/lib/cloud-sync";

export type ProductItem = {
  id: string;
  name: string;
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
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/")) return value;
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

type OrderRecord = {
  id: string;
  createdAt: string;
  total: number;
  status?: "pending" | "confirmed" | "rejected";
  items: Array<{ name: string; qty: number; price: number }>;
};

const STORAGE_KEY = "sdt_drops_products_v3";
const ORDERS_STORAGE_KEY = "sdt_drops_orders_v1";
const ADMIN_SESSION_KEY = "sdt_drops_admin_ok";

const TYPO_RULES: Array<[RegExp, string]> = [
  [/\bccelulares\b/gi, "celulares"],
  [/\bcelulare\b/gi, "celulares"],
  [/\breloje\b/gi, "relojes"],
  [/\bacsesorios\b/gi, "accesorios"],
  [/\baccesorios\b/gi, "accesorios"],
  [/\bcosmetico\b/gi, "cosmetico"],
  [/\bperfumez\b/gi, "perfumes"],
  [/\bstanli\b/gi, "stanley"],
  [/\bmayorissta\b/gi, "mayorista"],
];

function fixCommonTypos(text: string) {
  return TYPO_RULES.reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), text).replace(/\s{2,}/g, " ").trim();
}

const defaultProducts: ProductItem[] = [
  { id: "cel-1", name: "Xiaomi Note 14 Pro+ 5G 12/512", price: 375, old: 410, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro-plus-5g/pc/2c8f4c7bb8e0a8f4e5c5c94c76f9f4e1.png", tag: "OFERTA", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-2", name: "Xiaomi Note 14 Pro+ 5G 8/256", price: 320, old: 350, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro-plus-5g/pc/2c8f4c7bb8e0a8f4e5c5c94c76f9f4e1.png", tag: "OFERTA", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-3", name: "Xiaomi Note 14 Pro 12/512", price: 280, old: 310, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/0f7e6f7d36e3f97d72e2e4db8cb4ce91.png", tag: "HOT", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-4", name: "Xiaomi Note 14 Pro 8/256", price: 235, old: 260, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14-pro/pc/0f7e6f7d36e3f97d72e2e4db8cb4ce91.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-5", name: "Xiaomi Note 14 4G 8/256", price: 180, old: 204, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14/pc/6a1df5c4b6a8cb63d31589f2cb1b5d2f.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-6", name: "Xiaomi Note 14 4G 6/128", price: 160, old: 185, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-14/pc/6a1df5c4b6a8cb63d31589f2cb1b5d2f.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-7", name: "Redmi 14C 16/256", price: 115, old: 138, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-14c/pc/4e4f9b3bcdbf6b8dc67e84e4e1cf89d3.png", tag: "OFERTA", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-8", name: "Redmi 15C 16/256", price: 150, old: 190, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-15c/pc/9b3b0ec84f4ab4f2df4d2b8bc3db20f4.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-9", name: "Redmi 15C 4/128", price: 120, old: 145, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-15c/pc/9b3b0ec84f4ab4f2df4d2b8bc3db20f4.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-10", name: "Redmi A5 8/128", price: 95, old: 120, img: "https://i02.appmifile.com/mi-com-product/fly-birds/redmi-a5/pc/76cb7ef53e7e7d8d5c74c65cfdce63e1.png", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-11", name: "Poco X7 5G 12/512", price: 280, old: 309, img: "https://i02.appmifile.com/mi-com-product/fly-birds/poco-x7-pro/pc/4f0d87d0b95ec4f8a5fdcb4f8a79e927.png", tag: "HOT", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-12", name: "Poco X7 Pro 5G 8/256", price: 299, old: 327, img: "https://i02.appmifile.com/mi-com-product/fly-birds/poco-x7-pro/pc/4f0d87d0b95ec4f8a5fdcb4f8a79e927.png", tag: "MAS VENDIDO", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-13", name: "Samsung A56 5G 8/256", price: 335, old: 370, img: "https://images.samsung.com/is/image/samsung/p6pim/ar/2501/gallery/ar-galaxy-a56-5g-sm-a566-538413-sm-a566elbgaro-thumb-544108239", tag: "MAS VENDIDO", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "cel-14", name: "Motorola Edge 50 Fusion 5G 8/256", price: 235, old: 265, img: "https://motorolaimgrepo.vtexassets.com/arquivos/ids/163845-1200-auto", cat: "Celulares", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-1", name: "9PM", price: 45000, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-2", name: "9AM Dive", price: 47000, img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-3", name: "Asad Bourbon", price: 44000, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-4", name: "Lattafa Khamrah", price: 45000, img: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-5", name: "Club de Nuit Intense Men 105ml", price: 53000, img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-6", name: "Mandarin Sky", price: 45000, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-7", name: "Candee", price: 41000, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-8", name: "Aqua", price: 42000, img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-9", name: "Mega H", price: 48000, img: "https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-10", name: "Bade Oud for Glory Negro", price: 42000, img: "https://images.unsplash.com/photo-1619994403073-2cec99c8f9d1?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-11", name: "Bade Honor & Glory Blanco", price: 42000, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-12", name: "Fakhar Negro", price: 41000, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-13", name: "Fakhar Dorado", price: 38000, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-14", name: "Fakhar Blanco", price: 41500, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-15", name: "Yara Candy", price: 40000, img: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-16", name: "Yara Rosa Eau", price: 42000, img: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-17", name: "Eclaire", price: 44000, img: "https://images.unsplash.com/photo-1588405748880-12d1d2a59db9?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-18", name: "The Kingdom", price: 63000, img: "https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-19", name: "Club de Nuit Elixir", price: 63500, img: "https://images.unsplash.com/photo-1619994403073-2cec99c8f9d1?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-20", name: "Bharara King EDP 100ml", price: 75000, img: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-21", name: "French Avenue Liquid Brun", price: 63500, img: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-22", name: "Al Haramain Amber Oud Gold 120ml", price: 71000, img: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2000&auto=format&fit=crop", tag: "EXCLUSIVO", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "perf-23", name: "Philos Pura", price: 42000, img: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?q=80&w=2000&auto=format&fit=crop", cat: "Perfumes", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-1", name: "Set Hoppies 3 en 1 + Stickers", price: 11400, img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=2000&auto=format&fit=crop", tag: "NUEVO", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-2", name: "Vaso Cafetero 500ml con Sensor de Temperatura", price: 13400, img: "https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-3", name: "Botella con Pico 350ml", price: 11000, img: "https://images.unsplash.com/photo-1600857062241-98b1688b1a1b?q=80&w=2000&auto=format&fit=crop", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-4", name: "Botella con Pico 500ml", price: 11400, img: "https://images.unsplash.com/photo-1523362628745-0c100150b504?q=80&w=2000&auto=format&fit=crop", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-5", name: "Botella con Pico 750ml", price: 11000, img: "https://images.unsplash.com/photo-1610824352934-c10d87b700cc?q=80&w=2000&auto=format&fit=crop", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-6", name: "Botella con Filtro 800ml", price: 13400, img: "https://images.unsplash.com/photo-1553456558-aff63285bdd1?q=80&w=2000&auto=format&fit=crop", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-7", name: "Botella con Pico 1000ml", price: 15650, img: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-8", name: "Termo Stanley + Mate + Bombilla", price: 24500, img: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-9", name: "Termo Stanley Media Manija 1L", price: 14900, img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=2000&auto=format&fit=crop", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-10", name: "Termo Stanley 1.2L System Boca Ancha", price: 20000, img: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "st-11", name: "Vaso Quencher 1.2", price: 15200, img: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Stanley", stock: 50, compatibleModels: ["Universal"] },
  { id: "rel-1", name: "Smartwatch 7 Mayas", price: 19000, img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Relojes", stock: 50, compatibleModels: ["Universal"] },
  { id: "rel-2", name: "Apple Watch", price: 31000, img: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Relojes", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-1", name: "Protectores de Camara", price: 3100, img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=2000&auto=format&fit=crop", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-2", name: "Fundas Silicone Case MagSafe", price: 3300, img: "https://images.unsplash.com/photo-1601593346740-925612772716?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-3", name: "Vidrios Templados iPhone 11-17 Pro Max", price: 1930, img: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-4", name: "Cargador MagSafe", price: 13400, img: "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?q=80&w=2000&auto=format&fit=crop", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-5", name: "Combo Cargador Apple", price: 8150, img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "acc-6", name: "Battery Pack", price: 15500, img: "https://images.unsplash.com/photo-1609592806596-b43f4c1b3c3b?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Accesorios", stock: 50, compatibleModels: ["Universal"] },
  { id: "cam-1", name: "Remera Argentina Suplente Tailandesa G5", price: 29000, img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Camisetas", stock: 50, compatibleModels: ["Universal"] },
  { id: "cam-2", name: "Camiseta Calidad Jugador G5 Tailandesa", price: 29000, img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Camisetas", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-1", name: "AirPods Pro 2 con Sello", price: 18900, img: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-2", name: "AirPods Max", price: 35000, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-3", name: "Auriculares Xiaomi", price: 10000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-4", name: "JBL GO 4 / GO 4 RGB", price: 17800, img: "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-5", name: "JBL Flip 6", price: 34000, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-6", name: "JBL Flip 7", price: 37000, img: "https://images.unsplash.com/photo-1512446816042-444d64126727?q=80&w=2000&auto=format&fit=crop", tag: "NUEVO", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-7", name: "Proyector 4K Ultra HD", price: 64000, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-8", name: "TV Stick con Magis TV", price: 38900, img: "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-9", name: "Camara Foco 360?", price: 18950, img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-10", name: "Game Stick 2.4 Wireless", price: 37900, img: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?q=80&w=2000&auto=format&fit=crop", tag: "GAMER", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-11", name: "Aspiradora de Mano", price: 15000, img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-12", name: "Maquina de Cortar Pelo Economica", price: 9500, img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-13", name: "Aspiradora Robot", price: 30900, img: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=2000&auto=format&fit=crop", tag: "MAS VENDIDO", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-14", name: "ELFBAR 40K", price: 25000, img: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?q=80&w=2000&auto=format&fit=crop", tag: "HOT", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-15", name: "IGNITE V250 / V300", price: 25000, img: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=2000&auto=format&fit=crop", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
  { id: "may-16", name: "IGNITE V400", price: 30000, img: "https://images.unsplash.com/photo-1560847468-5eef330f455a?q=80&w=2000&auto=format&fit=crop", tag: "PREMIUM", cat: "Mayorista", stock: 50, compatibleModels: ["Universal"] },
];

const sections = [
  { id: "cat-celulares", title: "Celulares", cats: ["Celulares"] },
  { id: "cat-perfumes", title: "Perfumes", cats: ["Perfumes"] },
  { id: "cat-stanley", title: "Stanley", cats: ["Stanley"] },
  { id: "cat-relojes", title: "Relojes", cats: ["Relojes"] },
  { id: "cat-accesorios", title: "Accesorios", cats: ["Accesorios"] },
  { id: "cat-camisetas", title: "Camisetas", cats: ["Camisetas"] },
  { id: "cat-mayorista", title: "Mayorista", cats: ["Mayorista"] },
];

const categoryOptions = ["Celulares", "Perfumes", "Stanley", "Relojes", "Accesorios", "Camisetas", "Mayorista"];

type ProductDraft = {
  id?: string;
  name: string;
  price: string;
  tierPrices: string;
  colors: string;
  old: string;
  img: string;
  tag: string;
  cat: string;
  stock: string;
  compatibleModels: string;
};

const emptyDraft: ProductDraft = {
  name: "",
  price: "",
  tierPrices: "",
  colors: "",
  old: "",
  img: "",
  tag: "",
  cat: "Celulares",
  stock: "1",
  compatibleModels: "Universal",
};

function parseColorStocks(raw: string): ColorStock[] {
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((item) => {
      const [colorRaw, stockRaw] = item.split(":").map((x) => x.trim());
      const stock = Number(stockRaw);
      if (!colorRaw || !Number.isFinite(stock) || stock < 0) return null;
      return { color: colorRaw, stock };
    })
    .filter((x): x is ColorStock => Boolean(x));
}

function serializeColorStocks(colors?: ColorStock[]) {
  if (!colors?.length) return "";
  return colors.map((c) => `${c.color}:${c.stock}`).join(", ");
}

function parseTierPrices(raw: string): TierPrice[] {
  const items = raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
  const parsed: TierPrice[] = [];
  for (const item of items) {
    const [rangePart, pricePart] = item.split(":").map((x) => x.trim());
    if (!rangePart || !pricePart) continue;
    const unitPrice = Number(pricePart);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) continue;
    if (rangePart.includes("+")) {
      const minQty = Number(rangePart.replace("+", "").trim());
      if (!Number.isFinite(minQty) || minQty <= 0) continue;
      parsed.push({ minQty, unitPrice });
      continue;
    }
    const [minRaw, maxRaw] = rangePart.split("-").map((x) => x.trim());
    const minQty = Number(minRaw);
    const maxQty = Number(maxRaw);
    if (!Number.isFinite(minQty) || minQty <= 0) continue;
    if (!Number.isFinite(maxQty) || maxQty < minQty) continue;
    parsed.push({ minQty, maxQty, unitPrice });
  }
  return parsed.sort((a, b) => a.minQty - b.minQty);
}

function serializeTierPrices(tiers?: TierPrice[]) {
  if (!tiers?.length) return "";
  return tiers
    .slice()
    .sort((a, b) => a.minQty - b.minQty)
    .map((t) => `${t.maxQty ? `${t.minQty}-${t.maxQty}` : `${t.minQty}+`}:${t.unitPrice}`)
    .join(", ");
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
}

function normalizeOrderStatus(status?: string): "pending" | "confirmed" | "rejected" {
  if (status === "confirmed" || status === "rejected") return status;
  return "pending";
}

function toDraft(p: ProductItem): ProductDraft {
  return {
    id: p.id,
    name: p.name,
    price: String(p.price),
    tierPrices: serializeTierPrices(p.tierPrices),
    colors: serializeColorStocks(p.colors),
    old: p.old ? String(p.old) : "",
    img: p.img,
    tag: p.tag ?? "",
    cat: p.cat,
    stock: String(p.stock),
    compatibleModels: p.compatibleModels.join(", "),
  };
}

function fromDraft(d: ProductDraft): ProductItem | null {
  const price = Number(d.price);
  const stock = Number(d.stock);
  if (!d.name.trim() || !Number.isFinite(price) || price <= 0 || !d.cat.trim() || !Number.isFinite(stock) || stock < 0) return null;
  const old = d.old.trim() ? Number(d.old) : undefined;
  const models = d.compatibleModels.split(",").map((m) => m.trim()).filter(Boolean);
  const tierPrices = parseTierPrices(d.tierPrices);
  const colors = parseColorStocks(d.colors);
  return {
    id: d.id ?? `p_${Date.now()}`,
    name: fixCommonTypos(d.name),
    price,
    tierPrices: tierPrices.length ? tierPrices : undefined,
    colors: colors.length ? colors : undefined,
    old: old && Number.isFinite(old) ? old : undefined,
    img: d.img.trim() || fallbackProductImage,
    tag: d.tag.trim() || undefined,
    cat: fixCommonTypos(d.cat),
    stock,
    compatibleModels: models.length ? models : ["Universal"],
  };
}

function ProductCard({ p, cartQty, onAddToCart }: { p: ProductItem; cartQty: number; onAddToCart: (product: ProductItem, color?: string) => void }) {
  const [selectedColor, setSelectedColor] = useState<string | undefined>(p.colors?.[0]?.color);
  const remaining = Math.max(0, getColorStock(p, selectedColor) - cartQty);
  const disabled = remaining <= 0;
  return (
    <article className="group relative flex flex-col border border-border/80 bg-card/55 backdrop-blur-sm glow-hover">
      <div className="relative aspect-square overflow-hidden">
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
        <button disabled={disabled} onClick={() => onAddToCart(p, selectedColor)} className="absolute inset-x-3 bottom-3 inline-flex translate-y-3 items-center justify-center gap-2 border border-primary bg-primary/95 px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60">
          <Plus className="h-4 w-4" /> {disabled ? "Sin stock" : "Anadir al carrito"}
        </button>
      </div>
      <div className="flex flex-col gap-1 p-5">
        <span className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">{p.cat}</span>
        <h3 className="font-display text-base font-bold leading-tight text-foreground">{p.name}</h3>
        <p className="text-xs text-muted-foreground">Compatibilidad: {p.compatibleModels.join(", ")}</p>
        <p className="text-xs text-muted-foreground">Stock disponible: <span className="text-neon font-bold">{remaining}</span></p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-xl font-bold text-neon">{formatPrice(p.price)}</span>
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

export function Products({ onAddToCart, cartQtyById }: { onAddToCart: (product: ProductItem) => void; cartQtyById: Record<string, number> }) {
  const [products, setProducts] = useState<ProductItem[]>(defaultProducts);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [error, setError] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSyncReady, setIsSyncReady] = useState(!isCloudSyncEnabled());

  const loadProductsFromStorage = () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as ProductItem[];
      if (!Array.isArray(parsed) || !parsed.length) return;
      const fixed = parsed.map((p) => ({
        ...p,
        name: fixCommonTypos(String(p.name ?? "")),
        cat: fixCommonTypos(String(p.cat ?? "")),
      }));
      setProducts(fixed);
    } catch {
      // noop
    }
  };

  const loadOrders = () => {
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as OrderRecord[]) : [];
      const normalized = Array.isArray(parsed)
        ? parsed
            .map((o) => ({ ...o, status: normalizeOrderStatus(o.status) }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [];
      setOrders(normalized);
    } catch {
      setOrders([]);
    }
  };

  const updateOrderStatus = (id: string, status: "pending" | "confirmed" | "rejected") => {
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as OrderRecord[]) : [];
      if (!Array.isArray(parsed)) return;
      const next = parsed.map((o) => (o.id === id ? { ...o, status } : o));
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(next));
      loadOrders();
      window.dispatchEvent(new CustomEvent("sdt-order-created"));
    } catch {
      // noop
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
      const params = new URLSearchParams(window.location.search);
      const isAdminParam = params.get("admin") === "1";
      setAdminMode(isAdminParam);
      setAdminUnlocked(isAdminParam && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok");
      loadOrders();
    } catch {
      // noop
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || !isSyncReady) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.dispatchEvent(new CustomEvent("sdt-products-updated"));
    } catch {
      setError("No se pudo guardar en el navegador. Reduce tamano/cantidad de imagenes.");
    }
  }, [products, isHydrated, isSyncReady]);

  useEffect(() => {
    const orderHandler = () => loadOrders();
    const adminHandler = () => setAdminUnlocked(true);
    const storageHandler = (ev: StorageEvent) => {
      if (ev.key === STORAGE_KEY) loadProductsFromStorage();
    };
    window.addEventListener("sdt-order-created", orderHandler as EventListener);
    window.addEventListener("sdt-admin-unlocked", adminHandler as EventListener);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("sdt-order-created", orderHandler as EventListener);
      window.removeEventListener("sdt-admin-unlocked", adminHandler as EventListener);
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

  const filteredProducts = useMemo(() => {
    const byModel = !selectedModel
      ? products
      : products.filter((p) => p.compatibleModels.includes(selectedModel) || p.compatibleModels.includes("Universal"));
    if (!searchTerm) return byModel;
    return byModel.filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, selectedModel, searchTerm]);

  const salesTotal = useMemo(() => orders.reduce((acc, o) => acc + o.total, 0), [orders]);
  const salesItems = useMemo(() => orders.reduce((acc, o) => acc + o.items.reduce((s, i) => s + i.qty, 0), 0), [orders]);

  const startEdit = (product: ProductItem) => { setEditingId(product.id); setDraft(toDraft(product)); setError(""); setAdminOpen(true); };
  const resetDraft = () => { setEditingId(null); setDraft(emptyDraft); setError(""); };

  const saveProduct = () => {
    const parsed = fromDraft(draft);
    if (!parsed) return setError("Completa nombre, categoria, precio y stock validos.");
    setProducts((prev) => prev.some((p) => p.id === parsed.id) ? prev.map((p) => (p.id === parsed.id ? parsed : p)) : [parsed, ...prev]);
    resetDraft();
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetDraft();
  };

  const onImageUpload = (_file: File | undefined) => {
    setError("Subi la imagen a Supabase Storage y pega la URL publica en el campo URL de imagen.");
  };

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

        {adminMode && !adminUnlocked && (
          <div className="mb-10 max-w-md border border-border bg-card/70 p-4">
            <p className="font-display text-sm font-bold uppercase tracking-widest">Modo administrador detectado</p>
            <p className="mt-2 text-sm text-muted-foreground">Desbloquea el acceso desde el boton "Admin" de la parte superior.</p>
          </div>
        )}

        {adminMode && adminUnlocked && (
          <>
            <div className="mb-4 flex justify-end"><button onClick={() => setAdminOpen((v) => !v)} className="border border-primary bg-primary/90 px-4 py-2.5 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground">{adminOpen ? "Ocultar gestion" : "Mostrar gestion"}</button></div>
            {adminOpen && (
              <div className="mb-10 space-y-6 border border-border bg-card/70 p-4">
                <div>
                  <h3 className="mb-3 font-display text-xl font-bold uppercase">Ventas y pedidos</h3>
                  <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="border border-border bg-background/50 p-3"><p className="text-xs uppercase tracking-widest text-muted-foreground">Pedidos totales</p><p className="mt-1 font-display text-2xl font-bold text-neon">{orders.length}</p></div>
                    <div className="border border-border bg-background/50 p-3"><p className="text-xs uppercase tracking-widest text-muted-foreground">Productos vendidos</p><p className="mt-1 font-display text-2xl font-bold text-neon">{salesItems}</p></div>
                    <div className="border border-border bg-background/50 p-3"><p className="text-xs uppercase tracking-widest text-muted-foreground">Total vendido</p><p className="mt-1 font-display text-2xl font-bold text-neon">{formatPrice(salesTotal)}</p></div>
                  </div>
                  <div className="max-h-[240px] space-y-2 overflow-auto pr-1">
                    {orders.length === 0 && <p className="text-sm text-muted-foreground">Todavia no hay pedidos registrados.</p>}
                    {orders.map((o) => (
                      <div key={o.id} className="border border-border bg-background/50 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-display text-sm font-bold uppercase text-neon">{o.id}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">Items: {o.items.map((i) => `${i.name} x${i.qty}`).join(" | ")}</p>
                        <p className="mt-1 font-display text-sm font-bold">Total: {formatPrice(o.total)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${o.status === "confirmed" ? "border-emerald-400/60 text-emerald-300" : o.status === "rejected" ? "border-red-400/60 text-red-300" : "border-amber-400/60 text-amber-300"}`}>
                            {o.status === "confirmed" ? "Confirmado" : o.status === "rejected" ? "Rechazado" : "Pendiente"}
                          </span>
                          <button onClick={() => updateOrderStatus(o.id, "confirmed")} className="border border-emerald-400/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-300">Confirmar</button>
                          <button onClick={() => updateOrderStatus(o.id, "pending")} className="border border-amber-400/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-300">Pendiente</button>
                          <button onClick={() => updateOrderStatus(o.id, "rejected")} className="border border-red-400/60 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-red-300">Rechazar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
                  <div>
                    <h3 className="mb-3 font-display text-xl font-bold uppercase">{editingId ? "Editar producto" : "Nuevo producto"}</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder="Nombre del producto" className="border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
                      <input value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} placeholder="Precio" className="border border-border bg-background px-3 py-2 text-sm" />
                      <input value={draft.tierPrices} onChange={(e) => setDraft((p) => ({ ...p, tierPrices: e.target.value }))} placeholder="Precios por tramo: 1-10:10000,11-30:9500,31+:9000" className="border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
                      <input value={draft.stock} onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))} placeholder="Stock" className="border border-border bg-background px-3 py-2 text-sm" />
                      <input value={draft.colors} onChange={(e) => setDraft((p) => ({ ...p, colors: e.target.value }))} placeholder="Colores (opcional): negro:10, rojo:6, #1e90ff:8" className="border border-border bg-background px-3 py-2 text-sm" />
                      <input value={draft.old} onChange={(e) => setDraft((p) => ({ ...p, old: e.target.value }))} placeholder="Precio anterior (opcional)" className="border border-border bg-background px-3 py-2 text-sm" />
                      <select value={draft.cat} onChange={(e) => setDraft((p) => ({ ...p, cat: e.target.value }))} className="border border-border bg-background px-3 py-2 text-sm">{categoryOptions.map((cat) => <option key={cat} value={cat}>{cat}</option>)}</select>
                      <input value={draft.tag} onChange={(e) => setDraft((p) => ({ ...p, tag: e.target.value }))} placeholder="Etiqueta (ej: NUEVO)" className="border border-border bg-background px-3 py-2 text-sm" />
                      <input value={draft.compatibleModels} onChange={(e) => setDraft((p) => ({ ...p, compatibleModels: e.target.value }))} placeholder="Modelos compatibles (separados por coma)" className="border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
                      <input value={draft.img} onChange={(e) => setDraft((p) => ({ ...p, img: e.target.value }))} placeholder="URL publica de imagen (Supabase Storage)" className="border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
                      <div className="sm:col-span-2"><label className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">archivo local (no recomendado)</label><input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files?.[0])} className="w-full border border-border bg-background px-3 py-2 text-sm" /></div>
                    </div>
                    {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
                    <div className="mt-4 flex flex-wrap gap-2"><button onClick={saveProduct} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground"><Save className="h-4 w-4" /> Guardar</button><button onClick={resetDraft} className="inline-flex items-center gap-2 border border-border px-4 py-2 font-display text-xs font-bold uppercase tracking-widest text-foreground"><X className="h-4 w-4" /> Limpiar</button></div>
                  </div>

                  <div>
                    <h3 className="mb-3 font-display text-xl font-bold uppercase">Publicaciones cargadas</h3>
                    <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
                      {products.map((p) => <div key={p.id} className="flex items-center gap-3 border border-border bg-background/50 p-2"><div className="h-12 w-12 shrink-0 bg-cover bg-center" style={{ backgroundImage: `url(${p.img})` }} /><div className="min-w-0 flex-1"><p className="truncate font-display text-xs font-bold uppercase">{p.name}</p><p className="text-xs text-muted-foreground">{formatPrice(p.price)} Ã‚Â· Stock {p.stock}</p></div><button onClick={() => startEdit(p)} className="grid h-8 w-8 place-items-center border border-border hover:border-primary"><Pencil className="h-4 w-4" /></button><button onClick={() => deleteProduct(p.id)} className="grid h-8 w-8 place-items-center border border-border hover:border-primary"><Trash2 className="h-4 w-4" /></button></div>)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {selectedModel && <p className="mb-8 text-sm text-muted-foreground">Mostrando productos filtrados por <span className="font-bold text-neon">{selectedModel}</span>.</p>}

        <div className="space-y-12">
          {sections.map((section) => {
            const list = filteredProducts.filter((p) => section.cats.includes(p.cat));
            if (!list.length) return null;
            return (
              <div id={section.id} key={section.id} className="scroll-mt-28">
                <h3 className="mb-4 font-display text-2xl font-bold uppercase tracking-widest text-neon">{section.title}</h3>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {list.map((p) => <ProductCard key={p.id} p={p} cartQty={cartQtyById[p.id] ?? 0} onAddToCart={onAddToCart} />)}
                </div>
              </div>
            );
          })}
          {filteredProducts.length === 0 && <div className="border border-border bg-card/60 p-6 text-center"><p className="font-display text-lg font-bold uppercase">No hay productos para ese filtro</p><p className="mt-2 text-sm text-muted-foreground">Proba otra opcion o deja \"Ver todos los productos\".</p></div>}
        </div>
      </div>
    </section>
  );
}

