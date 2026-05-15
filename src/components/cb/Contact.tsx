import { MapPin, Phone } from "lucide-react";

export function Contact() {
  return (
    <section id="contacto" className="relative overflow-hidden border-b border-border py-24">
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 md:px-8 lg:grid-cols-2">
        <div>
          <div className="font-display text-xs font-semibold uppercase tracking-[0.4em] text-neon">// 05 - Contacto</div>
          <h2 className="mt-3 font-display text-4xl font-bold md:text-6xl">Habla con <span className="text-neon">SDT DROPS</span></h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Atencion rapida por WhatsApp e Instagram. Te ayudamos a elegir el producto ideal.
          </p>
          <div className="mt-8 space-y-4">
            {[
              { I: Phone, l: "3534814420", s: "Lunes a sabado de 9 a 19" },
              { I: Phone, l: "Instagram: @santi.villalbaa_", s: "Respuesta rapida" },
              { I: MapPin, l: "Cordoba Capital y Villa Maria, Cordoba", s: "Atencion en ambas ubicaciones" },
            ].map(({ I, l, s }) => (
              <div key={l} className="flex items-start gap-4 border border-border bg-card/60 p-4 glow-hover">
                <div className="grid h-10 w-10 flex-none place-items-center border border-primary/50 bg-background text-neon">
                  <I className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-display text-base font-bold text-foreground">{l}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">{s}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form className="border border-border bg-card/60 p-8 backdrop-blur">
          <h3 className="font-display text-2xl font-bold text-foreground">Envia un mensaje</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input placeholder="Nombre" className="border border-border bg-background px-4 py-3 font-sans text-sm text-foreground outline-none focus:border-primary" />
            <input placeholder="Producto o categoria de interes" className="border border-border bg-background px-4 py-3 font-sans text-sm text-foreground outline-none focus:border-primary sm:col-span-2" />
            <textarea rows={5} placeholder="Mensaje" className="border border-border bg-background px-4 py-3 font-sans text-sm text-foreground outline-none focus:border-primary sm:col-span-2" />
          </div>
          <button type="submit" className="mt-6 w-full border border-primary bg-primary px-6 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground glow-neon transition-transform hover:-translate-y-0.5">
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
}
