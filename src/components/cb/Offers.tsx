import { useEffect, useState } from "react";
import { Megaphone, Pencil, Save, X } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  description: string;
  badge: string;
  img: string;
};

const STORAGE_KEY = "sdt_drops_offers_v1";
const ADMIN_SESSION_KEY = "sdt_drops_admin_ok";
const ADMIN_QUERY_KEY = "panel";
const ADMIN_QUERY_TOKEN = "sdt-super-admin-9f2a7";
const MAX_IMAGE_SIZE_BYTES = 1_500_000;

const defaultOffers: Offer[] = [
  { id: "o1", title: "Oferta del dia", description: "2x1 en accesorios seleccionados hasta agotar stock.", badge: "HOY", img: "" },
  { id: "o2", title: "Oferta semanal", description: "10% OFF en auriculares y parlantes por transferencia.", badge: "SEMANA", img: "" },
  { id: "o3", title: "Oferta mayorista", description: "Descuentos especiales desde 10 unidades combinadas.", badge: "MAYORISTA", img: "" },
];

const emptyOffer: Offer = { id: "", title: "", description: "", badge: "", img: "" };

export function Offers() {
  const [offers, setOffers] = useState<Offer[]>(defaultOffers);
  const [adminMode, setAdminMode] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Offer>(emptyOffer);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Offer[];
        if (Array.isArray(parsed) && parsed.length) setOffers(parsed);
      }
    } catch {
      // noop
    }

    const params = new URLSearchParams(window.location.search);
    const isAdminParam = params.get(ADMIN_QUERY_KEY) === ADMIN_QUERY_TOKEN;
    setAdminMode(isAdminParam);
    setAdminUnlocked(isAdminParam && window.sessionStorage.getItem(ADMIN_SESSION_KEY) === "ok");
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    window.dispatchEvent(new CustomEvent("sdt-offers-updated"));
  }, [offers]);



  const startEdit = (offer: Offer) => {
    setEditingId(offer.id);
    setDraft(offer);
  };

  const reset = () => {
    setEditingId(null);
    setDraft(emptyOffer);
  };

  const saveOffer = () => {
    if (!draft.title.trim() || !draft.description.trim()) return;
    const next: Offer = {
      id: draft.id || `o_${Date.now()}`,
      title: draft.title.trim(),
      description: draft.description.trim(),
      badge: draft.badge.trim() || "PROMO",
      img: draft.img.trim(),
    };
    setOffers((prev) => (prev.some((o) => o.id === next.id) ? prev.map((o) => (o.id === next.id ? next : o)) : [next, ...prev]));
    reset();
  };

  const removeOffer = (id: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== id));
    if (editingId === id) reset();
  };

  const onImageUpload = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE_BYTES) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setDraft((prev): Offer => ({
  ...prev,
  img: reader.result as string,
}));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section id="ofertas" className="relative border-b border-border py-24">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10">
          <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 03 - Ofertas</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Promociones y <span className="text-neon">ofertas</span></h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {offers.map((offer) => (
            <article key={offer.id} className="relative border border-border bg-card/70 p-7 backdrop-blur glow-hover">
              {offer.img && (
                <div className="mb-4 h-36 w-full overflow-hidden border border-border bg-background/60">
                  <div className="h-full w-full bg-cover bg-center transition-transform duration-500 hover:scale-105" style={{ backgroundImage: `url(${offer.img})` }} />
                </div>
              )}
              <div className="mb-4 inline-flex items-center gap-2 border border-primary/50 bg-background/70 px-2 py-1 text-xs font-bold uppercase tracking-widest text-neon">
                <Megaphone className="h-3.5 w-3.5" /> {offer.badge}
              </div>
              <h3 className="font-display text-xl font-bold uppercase">{offer.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{offer.description}</p>
              {adminMode && adminUnlocked && (
                <div className="mt-4 flex gap-2">
                  <button onClick={() => startEdit(offer)} className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs uppercase tracking-widest">
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button onClick={() => removeOffer(offer.id)} className="inline-flex items-center gap-1 border border-border px-2 py-1 text-xs uppercase tracking-widest">
                    <X className="h-3.5 w-3.5" /> Borrar
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>

        {adminMode && adminUnlocked && (
          <div className="mt-8 border border-border bg-card/70 p-4">
            <h3 className="font-display text-lg font-bold uppercase">{editingId ? "Editar oferta" : "Nueva oferta"}</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <input value={draft.title} onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} placeholder="Titulo" className="border border-border bg-background px-3 py-2 text-sm" />
              <input value={draft.badge} onChange={(e) => setDraft((p) => ({ ...p, badge: e.target.value }))} placeholder="Badge (ej: MES)" className="border border-border bg-background px-3 py-2 text-sm" />
              <input value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} placeholder="Descripcion de la oferta" className="border border-border bg-background px-3 py-2 text-sm md:col-span-3" />
              <input value={draft.img} onChange={(e) => setDraft((p) => ({ ...p, img: e.target.value }))} placeholder="URL de imagen (opcional)" className="border border-border bg-background px-3 py-2 text-sm md:col-span-2" />
              <input type="file" accept="image/*" onChange={(e) => onImageUpload(e.target.files?.[0])} className="border border-border bg-background px-3 py-2 text-sm md:col-span-1" />
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={saveOffer} className="inline-flex items-center gap-2 border border-primary bg-primary px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                <Save className="h-3.5 w-3.5" /> Guardar oferta
              </button>
              <button onClick={reset} className="inline-flex items-center gap-2 border border-border px-4 py-2 text-xs font-bold uppercase tracking-widest">
                <X className="h-3.5 w-3.5" /> Limpiar
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

