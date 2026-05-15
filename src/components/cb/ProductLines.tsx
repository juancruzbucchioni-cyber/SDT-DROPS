const productLines = [
  "CELULARES",
  "PERFUMES",
  "STANLEY",
  "RELOJES",
  "ACCESORIOS",
  "CAMISETAS",
  "MAYORISTA",
  "COSMETICOS",
  "AURICULARES Y PARLANTES",
  "CARGADORES Y CABLES",
  "FUNDAS Y VIDRIOS TEMPLADOS",
  "REGALERIA PREMIUM",
  "REMERAS IMPORTADAS TAILANDESAS",
];

export function ProductLines() {
  return (
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 text-center font-display text-xs font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Productos que trabajamos
        </div>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-16 whitespace-nowrap">
            {[...productLines, ...productLines].map((b, i) => (
              <span key={i} className="font-display text-2xl font-bold uppercase tracking-[0.25em] text-foreground/40 transition-colors hover:text-neon md:text-3xl">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
