import todos from "@/assets/productos/todos.png";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="inicio" className="border-b border-border bg-[#ECEFF3]">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:py-14 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-12 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary sm:mb-5 sm:text-xs sm:tracking-[0.2em]">Importación · Distribución · Mayorista</p>
          <h1 className="text-[2.15rem] font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">Productos que mueven tu negocio.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Importación y distribución de productos seleccionados para tu negocio.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90">Ver productos <ArrowRight className="h-4 w-4" /></a>
            <a href="#nosotros" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#D7DCE3] bg-[#F3F5F7] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">Conocé SDT DROPS</a>
          </div>
        </div>
        <div className="flex aspect-[16/8] items-center overflow-hidden rounded-2xl border border-[#162B52] bg-[#010713] shadow-[0_16px_45px_rgba(17,24,39,.12)]">
          <img src={todos} alt="Selección de productos importados SDT DROPS" className="h-auto w-full object-contain" />
        </div>
      </div>
    </section>
  );
}
