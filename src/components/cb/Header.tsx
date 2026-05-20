import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import logo from "@/assets/logo.png";
import type { CartItem } from "@/routes/index";
import type { ProductItem } from "@/components/cb/Products";
import { getColorStock, getUnitPrice } from "@/components/cb/Products";

const nav = ["Catalogo", "Comunidad Emprendedora", "Contacto", "Instagram"];
const catalogLinks = [
  { label: "Celulares", href: "#cat-celulares" },
  { label: "Perfumes", href: "#cat-perfumes" },
  { label: "Stanley", href: "#cat-stanley" },
  { label: "Relojes", href: "#cat-relojes" },
  { label: "Accesorios", href: "#cat-accesorios" },
  { label: "Camisetas", href: "#cat-camisetas" },
  { label: "Mayorista", href: "#cat-mayorista" },
];

const ORDERS_STORAGE_KEY = "sdt_drops_orders_v1";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    currencyDisplay: "code",
  }).format(value);
}

type HeaderProps = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onUpdateColor: (key: string, color: string) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
};

type OrderRecord = {
  id: string;
  createdAt: string;
  total: number;
  status?: "pending" | "confirmed" | "rejected";
  items: Array<{ name: string; qty: number; price: number }>;
};

export function Header({ cart, cartCount, cartTotal, onIncrement, onDecrement, onUpdateColor, onRemove, onClear }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const lineKey = (item: CartItem) => `${item.id}::${item.selectedColor ?? "sin-color"}`;

  useEffect(() => {
    const onScroll = () => setCompact((window.scrollY || 0) > 120);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("sdt-product-search", { detail: { term: searchTerm } }));
  }, [searchTerm]);

  const handleCheckout = () => {
    if (!cart.length) return;
    const qtyByProductId = cart.reduce<Record<string, number>>((acc, item) => {
      acc[item.id] = (acc[item.id] ?? 0) + item.qty;
      return acc;
    }, {});

    const existingRaw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    const existingOrders: OrderRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    const orderNumber = `PED-${String(existingOrders.length + 1).padStart(4, "0")}`;

    const order: OrderRecord = {
      id: orderNumber,
      createdAt: new Date().toISOString(),
      total: cartTotal,
      status: "pending",
      items: cart.map((i) => ({
        name: `${i.name}${i.selectedColor ? ` (${i.selectedColor})` : ""}`,
        qty: i.qty,
        price: getUnitPrice(i, qtyByProductId[i.id] ?? i.qty),
      })),
    };

    // Descontar stock real del catalogo (incluyendo color si aplica)
    try {
      const productsRaw = window.localStorage.getItem("sdt_drops_products_v3");
      const products = productsRaw ? (JSON.parse(productsRaw) as ProductItem[]) : [];
      const qtyByProductId = new Map<string, number>();
      const qtyByProductColor = new Map<string, number>();
      cart.forEach((item) => {
        qtyByProductId.set(item.id, (qtyByProductId.get(item.id) ?? 0) + item.qty);
        if (item.selectedColor) {
          const key = `${item.id}::${item.selectedColor.toLowerCase()}`;
          qtyByProductColor.set(key, (qtyByProductColor.get(key) ?? 0) + item.qty);
        }
      });
      const nextProducts = products.map((p) => {
        const totalQty = qtyByProductId.get(p.id) ?? 0;
        if (totalQty <= 0) return p;
        const nextStock = Math.max(0, p.stock - totalQty);
        if (!p.colors?.length) return { ...p, stock: nextStock };
        const nextColors = p.colors.map((c) =>
          ({
            ...c,
            stock: Math.max(0, c.stock - (qtyByProductColor.get(`${p.id}::${c.color.toLowerCase()}`) ?? 0)),
          }),
        );
        return { ...p, stock: nextStock, colors: nextColors };
      });
      window.localStorage.setItem("sdt_drops_products_v3", JSON.stringify(nextProducts));
      window.dispatchEvent(new CustomEvent("sdt-products-updated"));
    } catch {
      // noop
    }

    const updated = [order, ...existingOrders];
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("sdt-order-created"));

    const itemsText = cart.map((i) => `- ${i.name} x${i.qty}`).join("%0A");
    const text = `Hola! Quiero confirmar el pedido ${orderNumber}:%0A${itemsText}%0A%0ATotal estimado: ${formatPrice(cartTotal)}`;
    window.open(`https://wa.me/5493534814420?text=${text}`, "_blank", "noopener,noreferrer");

    onClear();
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">

      {!compact && (
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="SDT DROPS" width={40} height={40} className="h-10 w-10 object-contain drop-shadow-[0_0_12px_color-mix(in_oklab,var(--neon)_60%,transparent)]" />
            <div className="hidden leading-none sm:block">
              <div className="font-display text-lg font-bold tracking-widest text-foreground">
                SDT <span className="text-neon">DROPS</span>
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-muted-foreground">mayorista / importador</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <a
                key={n}
                href={n === "Catalogo" ? "#productos" : n === "Comunidad Emprendedora" ? "https://chat.whatsapp.com/HayGktRhVcvGnIPqLQxuWt" : n === "Contacto" ? "#contacto" : "https://instagram.com/santi.villalbaa_"}
                className={`font-display text-sm font-semibold uppercase tracking-widest transition-colors hover:text-neon ${n === "Comunidad Emprendedora" ? "text-neon" : "text-muted-foreground"}`}
                target={n === "Instagram" || n === "Comunidad Emprendedora" ? "_blank" : undefined}
                rel={n === "Instagram" || n === "Comunidad Emprendedora" ? "noreferrer" : undefined}
              >
                {n}
              </a>
            ))}
          </nav>

          <div className="relative flex items-center gap-1">
            <button onClick={() => setOpen((v) => !v)} aria-label="Carrito" className="relative grid h-10 w-10 place-items-center text-muted-foreground hover:text-neon glow-hover">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-0 -top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
            </button>
            <button aria-label="Menu" className="grid h-10 w-10 place-items-center text-foreground lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            {open && <CartPanel cart={cart} cartTotal={cartTotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateColor={onUpdateColor} onRemove={onRemove} onClear={onClear} onCheckout={handleCheckout} />}
          </div>
        </div>
      )}

      <div className="border-t border-border/60">
        <div className={`mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 md:px-8 ${compact ? "py-1.5" : "py-2"}`}>
          {compact && (
            <Link to="/" className="mr-1 shrink-0 border border-border bg-card/60 px-2 py-1">
              <img src={logo} alt="SDT DROPS" className="h-6 w-6 object-contain" />
            </Link>
          )}

          {catalogLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`shrink-0 border border-border bg-card/60 font-display font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:border-primary hover:text-neon ${compact ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-xs"}`}
            >
              {item.label}
            </a>
          ))}

          <div className="ml-auto min-w-[190px] shrink-0 sm:min-w-[240px] md:min-w-[300px]">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar producto..."
              className={`w-full border border-border bg-card/70 text-foreground outline-none focus:border-primary ${
                compact ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
              }`}
            />
          </div>

          {compact && (
            <button onClick={() => setOpen((v) => !v)} aria-label="Carrito" className="relative grid h-7 w-7 shrink-0 place-items-center border border-border text-muted-foreground hover:text-neon">
              <ShoppingBag className="h-4 w-4" />
              <span className="absolute -right-1 -top-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">{cartCount}</span>
            </button>
          )}
        </div>
      </div>

      {compact && open && (
        <div className="mx-auto max-w-7xl px-4 pb-2 md:px-8">
          <CartPanel cart={cart} cartTotal={cartTotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateColor={onUpdateColor} onRemove={onRemove} onClear={onClear} onCheckout={handleCheckout} compact />
        </div>
      )}

    </header>
  );
}

type CartPanelProps = {
  cart: CartItem[];
  cartTotal: number;
  onIncrement: (key: string) => void;
  onDecrement: (key: string) => void;
  onUpdateColor: (key: string, color: string) => void;
  onRemove: (key: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  compact?: boolean;
};

function CartPanel({ cart, cartTotal, onIncrement, onDecrement, onUpdateColor, onRemove, onClear, onCheckout, compact = false }: CartPanelProps) {
  const lineKey = (item: CartItem) => `${item.id}::${item.selectedColor ?? "sin-color"}`;
  const qtyByProductId = cart.reduce<Record<string, number>>((acc, item) => {
    acc[item.id] = (acc[item.id] ?? 0) + item.qty;
    return acc;
  }, {});
  return (
    <div className={`${compact ? "relative" : "absolute right-0 top-12"} z-50 w-[330px] border border-border bg-card p-4 shadow-2xl md:w-[380px]`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold uppercase tracking-widest">Carrito</h3>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-xs uppercase tracking-widest text-muted-foreground hover:text-neon">
            Vaciar
          </button>
        )}
      </div>
      {cart.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay productos en el carrito.</p>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={lineKey(item)} className="border border-border bg-background/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-sm font-bold uppercase leading-tight">{item.name}</p>
                <button onClick={() => onRemove(lineKey(item))} className="text-muted-foreground hover:text-neon" aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.colors?.length ? (
                <select
                  value={item.selectedColor ?? item.colors[0].color}
                  onChange={(e) => onUpdateColor(lineKey(item), e.target.value)}
                  className="mt-2 w-full border border-border bg-background px-2 py-1 text-xs"
                >
                  {item.colors.map((c) => (
                    <option key={`${item.id}-${c.color}`} value={c.color}>
                      {c.color} ({c.stock})
                    </option>
                  ))}
                </select>
              ) : null}
              <p className="mt-1 text-sm text-neon">{formatPrice(getUnitPrice(item, qtyByProductId[item.id] ?? item.qty))} c/u</p>
              <p className="text-xs text-muted-foreground">Stock: {item.qty}/{getColorStock(item, item.selectedColor)}</p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => onDecrement(lineKey(item))} className="grid h-7 w-7 place-items-center border border-border hover:border-primary">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold">{item.qty}</span>
                  <button disabled={item.qty >= getColorStock(item, item.selectedColor)} onClick={() => onIncrement(lineKey(item))} className="grid h-7 w-7 place-items-center border border-border hover:border-primary disabled:cursor-not-allowed disabled:opacity-40">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="font-display text-sm font-bold">{formatPrice(getUnitPrice(item, qtyByProductId[item.id] ?? item.qty) * item.qty)}</span>
              </div>
            </div>
          ))}
          <div className="mt-3 border-t border-border pt-3">
            <div className="mb-3 flex items-center justify-between font-display text-sm uppercase">
              <span>Total</span>
              <span className="text-neon">{formatPrice(cartTotal)}</span>
            </div>
            <button onClick={onCheckout} className="inline-flex w-full items-center justify-center border border-primary bg-primary px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-primary-foreground glow-neon">
              Confirmar compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

