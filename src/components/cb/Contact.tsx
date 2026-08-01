import { Instagram, MapPin, MessageCircle, Phone, type LucideIcon } from "lucide-react";

type ContactItem = {
  Icon: LucideIcon;
  label: string;
  detail: string;
  href?: string;
};

const contactItems: ContactItem[] = [
  { Icon: MapPin, label: "Córdoba Capital", detail: "Punto de atención y coordinación de entregas" },
  { Icon: MapPin, label: "Villa María, Córdoba", detail: "Punto de atención y coordinación de entregas" },
  { Icon: Phone, label: "353 481-4420", detail: "WhatsApp · Lunes a sábado, de 9 a 19 h", href: "https://wa.me/5493534814420" },
  { Icon: Instagram, label: "@santi.villalbaa_", detail: "Novedades, ingresos y consultas", href: "https://instagram.com/santi.villalbaa_" },
];

function ContactCard({ item }: { item: ContactItem }) {
  const content = (
    <>
      <div className="grid h-10 w-10 flex-none place-items-center rounded-lg border border-primary/40 bg-background text-primary"><item.Icon className="h-4 w-4" /></div>
      <div><div className="text-sm font-semibold text-foreground">{item.label}</div><div className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.detail}</div></div>
    </>
  );

  const className = "flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_10px_24px_rgba(17,54,112,.08)]";
  return item.href ? <a href={item.href} target="_blank" rel="noreferrer" className={className}>{content}</a> : <div className={className}>{content}</div>;
}

export function Contact() {
  return (
    <section id="contacto" className="relative overflow-hidden border-b border-border py-16 sm:py-24">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Contacto</div>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Hablá con <span className="text-primary">SDT DROPS</span></h2>
          <p className="mt-4 max-w-md text-muted-foreground">Atención rápida y personalizada. Te ayudamos a elegir el producto ideal para vos o para tu negocio.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">{contactItems.map((item) => <ContactCard key={item.label} item={item} />)}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-5 sm:p-8">
          <h3 className="text-2xl font-semibold text-foreground">Enviá un mensaje</h3>
          <p className="mt-2 text-sm text-muted-foreground">Contanos qué producto buscás y te respondemos por WhatsApp.</p>
          <div className="mt-6 grid grid-cols-1 gap-4">
            <input placeholder="Nombre" aria-label="Nombre" className="border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
            <input placeholder="Producto o categoría de interés" aria-label="Producto o categoría de interés" className="border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
            <textarea rows={5} placeholder="Mensaje" aria-label="Mensaje" className="border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary" />
          </div>
          <a href="https://wa.me/5493534814420" target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-600"><MessageCircle className="h-4 w-4" /> Continuar por WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
