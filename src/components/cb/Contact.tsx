import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";

export function Contact() {
  const contactItems = [
    { I: MapPin, label: "Córdoba Capital", detail: "Punto de atención y coordinación de entregas" },
    { I: MapPin, label: "Villa María, Córdoba", detail: "Punto de atención y coordinación de entregas" },
    { I: Phone, label: "353 481-4420", detail: "WhatsApp · Lunes a sábado, de 9 a 19 h" },
    { I: Instagram, label: "@santi.villalbaa_", detail: "Novedades, ingresos y consultas" },
  ];

  return (
    <section id="contacto" className="relative overflow-hidden border-b border-border py-16 sm:py-24">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">Contacto</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Hablá con <span className="text-neon">SDT DROPS</span></h2>
          <p className="mt-4 max-w-md text-muted-foreground">Atención rápida y personalizada. Te ayudamos a elegir el producto ideal para vos o para tu negocio.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {contactItems.map(({ I, label, detail }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4 glow-hover">
                <div className="grid h-10 w-10 flex-none place-items-center rounded-lg border border-primary/50 bg-background text-neon"><I className="h-4 w-4" /></div>
                <div><div className="font-display text-sm font-bold text-foreground">{label}</div><div className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur sm:p-8">
          <h3 className="font-display text-2xl font-bold text-foreground">Enviá un mensaje</h3>
          <p className="mt-2 text-sm text-muted-foreground">Contanos qué producto buscás y te respondemos por WhatsApp.</p>
          <div className="mt-6 grid grid-cols-1 gap-4">
            <input placeholder="Nombre" aria-label="Nombre" className="border border-border bg-background px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
            <input placeholder="Producto o categoría de interés" aria-label="Producto o categoría de interés" className="border border-border bg-background px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
            <textarea rows={5} placeholder="Mensaje" aria-label="Mensaje" className="border border-border bg-background px-4 py-3 font-sans text-foreground outline-none focus:border-primary" />
          </div>
          <a href="https://wa.me/5493534814420" target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-neon">
            <MessageCircle className="h-4 w-4" /> Continuar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
