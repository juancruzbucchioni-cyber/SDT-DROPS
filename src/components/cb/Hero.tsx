import todos from "@/assets/productos/todos.png";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section id="inicio" className="border-b border-border bg-[#EAF1FC]">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 md:px-8 lg:grid-cols-[.9fr_1.1fr] lg:py-24">
        <div className="max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Importación · Distribución · Mayorista</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">Productos que mueven tu negocio.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground sm:text-lg">Importación y distribución de productos seleccionados para tu negocio.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90">Ver productos <ArrowRight className="h-4 w-4" /></a>
            <a href="#nosotros" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[#C5D5ED] bg-[#DCE8FA] px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary">Conocé SDT DROPS</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-[#C5D5ED] bg-[#DCE8FA] shadow-[0_16px_45px_rgba(17,24,39,.08)]">
          <img src={todos} alt="Selección de productos importados SDT DROPS" className="aspect-[16/8] h-full w-full object-cover object-center" />
        </div>
      </div>
    </section>
  );
}
