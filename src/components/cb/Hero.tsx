import { useEffect, useState } from "react";
import logoGrande from "@/assets/logo-grande.png";
import fondo from "@/assets/background-main.png";
import { ChevronDown } from "lucide-react";

export function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setOffset(Math.min(y * 0.35, 260));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scale = Math.max(0.62, 1 - offset / 520);

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-border" aria-label="Portada SDT DROPS">
      <div className="absolute inset-0 bg-cover bg-center opacity-35" style={{ backgroundImage: `url(${fondo})` }} />
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `translateY(-${offset}px) scale(${scale})` }}>
        <img src={logoGrande} alt="SDT DROPS" className="w-[78vw] max-w-[980px] object-contain opacity-95 drop-shadow-[0_0_30px_color-mix(in_oklab,var(--neon)_45%,transparent)]" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-end px-4 pb-14 text-center md:px-8">
        <p className="font-display text-xs font-bold uppercase tracking-[0.45em] text-neon">SDT DROPS</p>
        <h1 className="mt-3 font-display text-4xl font-bold uppercase md:text-6xl">Catalogo mayorista e importador</h1>
        <a href="#productos" className="mt-7 inline-flex items-center gap-2 border border-primary bg-background/70 px-5 py-3 font-display text-sm font-bold uppercase tracking-[0.22em] text-foreground glow-hover">
          Ver catalogo <ChevronDown className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
