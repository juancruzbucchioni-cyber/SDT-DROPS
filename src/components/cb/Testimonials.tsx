import { Quote, Star } from "lucide-react";

const reviews = [
  {
    name: "Mateo Alvarez",
    role: "Cliente mayorista · Cordoba Capital",
    text: "Muy buen precio y entrega rapida. La calidad de productos importados es excelente.",
    initials: "MA",
  },
  {
    name: "Camila Restrepo",
    role: "Revendedora · Villa Maria, Cordoba",
    text: "Compro seguido. Perfumes, accesorios y Stanley con buena calidad y stock real.",
    initials: "CR",
  },
  {
    name: "Diego Fernandez",
    role: "Cliente frecuente · Cordoba Capital",
    text: "La atención por WhatsApp es excelente y los pedidos llegan súper rápido.",
    initials: "DF",
  },
];

const brands = ["STANLEY", "XIAOMI", "SAMSUNG", "APPLE", "JBL", "LATTAFA", "ARMAF", "KARSEELL"];

export function Testimonials() {
  return (
    <section id="clientes" className="relative border-b border-border py-24">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 03 - Clientes</div>
            <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Lo que dicen <span className="text-neon">nuestros clientes</span></h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {reviews.map((r) => (
            <article key={r.name} className="relative flex flex-col border border-border bg-card/70 p-7 backdrop-blur glow-hover">
              <Quote className="absolute right-5 top-5 h-10 w-10 text-primary/20" />
              <div className="flex items-center gap-1 text-neon">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="mt-5 text-base leading-relaxed text-foreground/90">"{r.text}"</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="grid h-11 w-11 place-items-center border border-primary/60 bg-background font-display text-sm font-bold text-neon">{r.initials}</div>
                <div>
                  <div className="font-display text-sm font-bold uppercase tracking-widest text-foreground">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.role}</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 border-y border-border py-8">
          <div className="mb-6 text-center font-display text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
            Marcas con las que trabajamos
          </div>
          <div className="overflow-hidden">
            <div className="flex w-max animate-marquee items-center gap-16 whitespace-nowrap">
              {[...brands, ...brands].map((b, i) => (
                <span key={i} className="font-display text-2xl font-bold uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-neon md:text-3xl">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
