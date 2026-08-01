import { BadgeDollarSign, Boxes, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  { Icon: Truck, title: "Distribución", text: "Atención en Córdoba Capital y Villa María." },
  { Icon: Boxes, title: "Stock disponible", text: "Productos seleccionados listos para entregar." },
  { Icon: BadgeDollarSign, title: "Precios mayoristas", text: "Condiciones pensadas para tu negocio." },
  { Icon: ShieldCheck, title: "Compra segura", text: "Atención directa antes y después de comprar." },
];

export function TrustSection() {
  return (
    <section id="nosotros" className="border-y border-border bg-[#F3F4F6] py-14">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 md:px-8 lg:grid-cols-4">
        {benefits.map(({ Icon, title, text }) => <div key={title} className="flex gap-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.7} /><div><h3 className="text-sm font-semibold normal-case tracking-normal text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}
      </div>
    </section>
  );
}

export function CatalogCta() {
  return (
    <section className="bg-white py-16 sm:py-20"><div className="mx-auto max-w-7xl px-4 md:px-8"><div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-6 py-10 text-white sm:px-10 md:flex-row md:items-center"><h2 className="max-w-2xl text-2xl font-semibold normal-case tracking-tight sm:text-3xl">Encontrá productos para hacer crecer tu negocio.</h2><a href="#productos" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary hover:bg-gray-50">Explorar catálogo</a></div></div></section>
  );
}
