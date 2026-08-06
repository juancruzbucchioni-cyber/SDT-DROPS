import { ArrowRight, BadgeDollarSign, Boxes, ShieldCheck, Truck } from "lucide-react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const benefits = [
  { Icon: Truck, title: "Distribución", text: "Atención en Córdoba Capital y Villa María." },
  { Icon: Boxes, title: "Stock disponible", text: "Productos seleccionados listos para entregar." },
  { Icon: BadgeDollarSign, title: "Precios mayoristas", text: "Condiciones pensadas para tu negocio." },
  { Icon: ShieldCheck, title: "Compra segura", text: "Atención directa antes y después de comprar." },
];

export function TrustSection() {
  const sectionRef = useScrollReveal();

  return (
    <section id="nosotros" ref={sectionRef} className="border-y border-[#D7DCE3] bg-[#E5E9EE] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-7 max-w-2xl sm:mb-10 reveal">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Por qué elegirnos</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Una operación simple y confiable</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Productos seleccionados, atención cercana y condiciones comerciales para acompañar el crecimiento de tu negocio.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map(({ Icon, title, text }, index) => (
            <article key={title} className={`reveal stagger-${index + 1} group rounded-xl border border-[#D7DCE3] bg-[#F3F5F7] p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_28px_rgba(17,54,112,.09)] sm:p-6`}>
              <div className="flex items-start justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[#071632] text-blue-100"><Icon className="h-5 w-5" strokeWidth={1.7} /></span>
                <span className="text-xs font-semibold text-primary/55">0{index + 1}</span>
              </div>
              <h3 className="mt-4 text-base font-semibold normal-case tracking-normal text-foreground sm:mt-6">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CatalogCta() {
  const ctaRef = useScrollReveal();

  return (
    <section ref={ctaRef} className="bg-[#E7EAEE] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative overflow-hidden rounded-2xl bg-[#071632] px-5 py-8 text-white shadow-[0_16px_40px_rgba(7,22,50,.18)] sm:px-10 sm:py-12 reveal-scale">
          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">Catálogo mayorista</p>
              <h2 className="mt-3 text-2xl font-semibold normal-case tracking-tight text-white sm:text-3xl">Encontrá productos para hacer crecer tu negocio.</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100/70">Explorá nuestra selección y consultanos por disponibilidad y condiciones mayoristas.</p>
            </div>
            <a href="#productos" className="inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-500 sm:w-auto cta-enhanced">Explorar catálogo <ArrowRight className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
