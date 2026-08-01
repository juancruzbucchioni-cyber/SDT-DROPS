import logoGrande from "@/assets/logo-grande.png";
import fondo from "@/assets/background-main.png";
import { ArrowRight, MapPin, MessageCircle, PackageCheck, ShieldCheck } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border" aria-label="Portada SDT DROPS">
      <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${fondo})` }} />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/35" />
      <div className="relative mx-auto grid min-h-[640px] max-w-7xl items-center gap-10 px-4 py-20 md:px-8 lg:min-h-[720px] lg:grid-cols-[1.05fr_.95fr] lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neon">
            <PackageCheck className="h-4 w-4" /> Mayorista e importador
          </div>
          <h1 className="mt-6 text-4xl font-bold leading-[1.02] sm:text-5xl md:text-6xl lg:text-7xl">
            Productos importados para <span className="text-neon">hacer crecer tu negocio</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tecnología, perfumes, Stanley, accesorios, camisetas y mucho más, con atención personalizada en Córdoba Capital y Villa María.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-primary-foreground glow-neon">
              Ver productos <ArrowRight className="h-4 w-4" />
            </a>
            <a href="https://wa.me/5493534814420?text=Hola%20SDT%20DROPS%2C%20quiero%20recibir%20informaci%C3%B3n" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border bg-card/70 px-6 py-3 font-display text-sm font-bold uppercase tracking-[0.16em] hover:border-primary hover:text-neon">
              <MessageCircle className="h-4 w-4" /> Comprar por WhatsApp
            </a>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-neon" /> Atención confiable</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-neon" /> Córdoba Capital y Villa María</span>
          </div>
        </div>
        <div className="relative hidden items-center justify-center lg:flex">
          <div className="absolute h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative rounded-3xl border border-primary/25 bg-card/45 p-8 shadow-2xl backdrop-blur-sm">
            <img src={logoGrande} alt="SDT DROPS" className="w-full max-w-[520px] object-contain drop-shadow-[0_0_30px_color-mix(in_oklab,var(--neon)_35%,transparent)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
