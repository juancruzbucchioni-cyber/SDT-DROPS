import { useEffect, useState } from "react";
import { Menu, ShoppingBag, Plus, Minus, Trash2, Search, UserRound } from "lucide-react";
import logo from "@/assets/logo.png";
import type { CartItem } from "@/routes/index";
import type { ProductItem } from "@/components/cb/Products";
import { getColorStock, getUnitPrice } from "@/components/cb/Products";

const nav = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "#productos" },
  { label: "Categorías", href: "#categorias" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
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
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#071632]/95 text-white shadow-sm backdrop-blur-xl">

      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:px-8">
          <a href="/" aria-label="Recargar SDT DROPS y volver al inicio" className="flex shrink-0 items-center gap-2.5">
            <img src={logo} alt="SDT DROPS" width={40} height={40} className="h-10 w-10 object-contain drop-shadow-[0_0_12px_color-mix(in_oklab,var(--neon)_60%,transparent)]" />
            <div className="hidden leading-none sm:block">
              <div className="font-display text-lg font-bold tracking-widest text-white">
                SDT <span className="text-neon">DROPS</span>
              </div>
              <div className="font-sans text-[10px] uppercase tracking-[0.3em] text-blue-200/70">mayorista / importador</div>
            </div>
          </a>

          <nav className="ml-auto hidden items-center gap-5 xl:gap-7 lg:flex">
            {nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="whitespace-nowrap text-sm font-medium text-blue-100/75 transition-colors hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <label className="relative ml-auto hidden w-44 shrink-0 xl:block">
            <span className="sr-only">Buscar producto</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-200/60" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar producto"
              className="h-10 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-sm text-white outline-none transition-colors placeholder:text-blue-200/60 focus:border-blue-400"
            />
          </label>

          <div className="relative flex shrink-0 items-center gap-1">
            <button onClick={() => setOpen((v) => !v)} aria-label="Carrito" className="relative grid h-10 w-10 place-items-center text-blue-100/80 hover:text-white">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-0 -top-0 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{cartCount}</span>
            </button>
            <a href="/santiagovillalba" aria-label="Cuenta" className="hidden h-10 w-10 place-items-center text-blue-100/80 transition-colors hover:text-white sm:grid"><UserRound className="h-5 w-5" /></a>
            <button onClick={() => setMobileOpen((value) => !value)} aria-label="Abrir menú" aria-expanded={mobileOpen} className="grid h-10 w-10 place-items-center text-white lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            {open && <CartPanel cart={cart} cartTotal={cartTotal} onIncrement={onIncrement} onDecrement={onDecrement} onUpdateColor={onUpdateColor} onRemove={onRemove} onClear={onClear} onCheckout={handleCheckout} />}
          </div>
        </div>

      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#071632] lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3 md:px-8">
            <label className="relative mb-2 block">
              <span className="sr-only">Buscar producto</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar producto"
                className="h-11 w-full rounded-xl border border-white/15 bg-white/10 pl-9 pr-3 text-white outline-none placeholder:text-blue-200/60 focus:border-blue-400"
              />
            </label>
            {nav.map((item) => (
              <a
                key={`m-${item.label}`}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium text-blue-100/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>
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
    <div className={`${compact ? "relative" : "fixed inset-x-2 bottom-2 top-[72px] sm:absolute sm:inset-auto sm:right-0 sm:top-14 sm:max-h-[calc(100vh-80px)]"} z-50 w-auto overflow-y-auto rounded-xl border border-[#C9D1DC] bg-[#F3F5F7] p-3 text-foreground shadow-[0_20px_50px_rgba(7,22,50,.22)] sm:w-[min(380px,calc(100vw-24px))] sm:p-5`}>
      <div className="mb-3 flex items-center justify-between border-b border-[#D7DCE3] pb-3 sm:mb-4 sm:pb-4">
        <h3 className="text-lg font-semibold normal-case tracking-normal text-foreground">Tu carrito</h3>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary">
            Vaciar
          </button>
        )}
      </div>
      {cart.length === 0 ? (
        <div className="py-8 text-center"><ShoppingBag className="mx-auto h-7 w-7 text-muted-foreground/60" /><p className="mt-3 text-sm text-muted-foreground">No hay productos en el carrito.</p></div>
      ) : (
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={lineKey(item)} className="rounded-lg border border-[#D7DCE3] bg-[#E8ECF1] p-3 sm:p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="pr-2 text-sm font-semibold leading-snug text-foreground">{item.name}</p>
                <button onClick={() => onRemove(lineKey(item))} className="text-muted-foreground transition-colors hover:text-red-600" aria-label="Eliminar">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              {item.colors?.length ? (
                <select
                  value={item.selectedColor ?? item.colors[0].color}
                  onChange={(e) => onUpdateColor(lineKey(item), e.target.value)}
                  className="mt-3 w-full rounded-md border border-[#C9D1DC] bg-[#F3F5F7] px-2 py-2 text-xs text-foreground"
                >
                  {item.colors.map((c) => (
                    <option key={`${item.id}-${c.color}`} value={c.color}>
                      {c.color} ({c.stock})
                    </option>
                  ))}
                </select>
              ) : null}
              <p className="mt-3 text-sm font-semibold text-primary">{formatPrice(getUnitPrice(item, qtyByProductId[item.id] ?? item.qty))} c/u</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Stock: {item.qty}/{getColorStock(item, item.selectedColor)}</p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => onDecrement(lineKey(item))} className="grid h-8 w-8 place-items-center rounded-md border border-[#C9D1DC] bg-[#F3F5F7] text-foreground hover:border-primary">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-semibold text-foreground">{item.qty}</span>
                  <button disabled={item.qty >= getColorStock(item, item.selectedColor)} onClick={() => onIncrement(lineKey(item))} className="grid h-8 w-8 place-items-center rounded-md border border-[#C9D1DC] bg-[#F3F5F7] text-foreground hover:border-primary disabled:cursor-not-allowed disabled:opacity-40">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatPrice(getUnitPrice(item, qtyByProductId[item.id] ?? item.qty) * item.qty)}</span>
              </div>
            </div>
          ))}
          <div className="mt-4 border-t border-[#D7DCE3] pt-4">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">{formatPrice(cartTotal)}</span>
            </div>
            <button onClick={onCheckout} className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600">
              Confirmar compra
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

