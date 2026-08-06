import logoEffect from "@/assets/logo-effect.webp";
import { ArrowRight } from "lucide-react";
import { TypewriterText } from "@/components/cb/TypewriterText";

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden border-b border-border bg-[#ECEFF3]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:py-14 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-24">
        <div className="max-w-xl">
          <p className="hero-animate-kicker mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary sm:mb-5 sm:text-xs sm:tracking-[0.2em]">Importación · Distribución · Mayorista</p>
          <h1 className="hero-animate-title text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl min-h-[2.2em] sm:min-h-[2.1em]">
            <TypewriterText text="Productos que mueven tu negocio." speed={40} delay={250} />
          </h1>
          <p className="hero-animate-subtitle mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Importación y distribución de productos seleccionados para tu negocio.</p>
          <div className="hero-animate-buttons mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#productos" className="cta-enhanced inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-primary/90">Ver productos <ArrowRight className="h-4 w-4" /></a>
            <a href="#nosotros" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#D7DCE3] bg-[#F3F5F7] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">Conocé SDT DROPS</a>
          </div>
        </div>
        <div className="hero-animate-image flex aspect-[16/9] items-center overflow-hidden rounded-2xl border border-[#162B52] bg-[#010713] p-2 shadow-[0_16px_45px_rgba(17,24,39,.12)]">
          <img
            src={logoEffect}
            alt="SDT DROPS Importador Mayorista"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
          />
        </div>
      </div>
    </section>
  );
}
