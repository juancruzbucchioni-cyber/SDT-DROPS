import { Users } from "lucide-react";

export function Instagram() {
  return (
    <section className="relative border-b border-border py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="border border-border bg-card/70 p-8 text-center">
          <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 07 - Comunidad</div>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">Comunidad Emprendedora</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Sumate al grupo de WhatsApp para novedades, drops y promociones mayoristas.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://chat.whatsapp.com/HayGktRhVcvGnIPqLQxuWt"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-neon"
            >
              <Users className="h-4 w-4" /> Unirme al grupo
            </a>
            <a
              href="https://instagram.com/santi.villalbaa_"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-border bg-card/60 px-6 py-3 font-display text-sm font-bold uppercase tracking-widest text-foreground glow-hover hover:text-neon"
            >
              Ir a Instagram
            </a>
          </div>
          <a
            href="https://instagram.com/santi.villalbaa_"
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-block font-display text-2xl font-bold tracking-wider text-neon hover:underline md:text-3xl"
          >
            @santi.villalbaa_
          </a>
        </div>
      </div>
    </section>
  );
}
