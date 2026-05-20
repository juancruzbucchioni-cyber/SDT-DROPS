import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";

type Offer = {
  id: string;
  title: string;
  description: string;
  badge: string;
  img: string;
};

const STORAGE_KEY = "sdt_drops_offers_v1";

const defaultOffers: Offer[] = [
  { id: "o1", title: "Oferta del dia", description: "2x1 en accesorios seleccionados hasta agotar stock.", badge: "HOY", img: "" },
  { id: "o2", title: "Oferta semanal", description: "10% OFF en auriculares y parlantes por transferencia.", badge: "SEMANA", img: "" },
  { id: "o3", title: "Oferta mayorista", description: "Descuentos especiales desde 10 unidades combinadas.", badge: "MAYORISTA", img: "" },
];

export function Offers() {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Offer[];
        setOffers(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setOffers([]);
    }

  }, []);


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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
