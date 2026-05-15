import logo from "@/assets/logo.png";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="col-span-2">
          <img src={logo} alt="SDT DROPS" width={64} height={64} className="h-14 w-auto object-contain drop-shadow-[0_0_18px_color-mix(in_oklab,var(--neon)_55%,transparent)]" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Tienda mayorista e importadora.
            Tecnologia, perfumes, Stanley, accesorios, camisetas y mas.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">Tienda</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Celulares", "Perfumes", "Stanley", "Relojes", "Accesorios", "Camisetas", "Mayorista"].map((x) => (
              <li key={x}>
                <a href="#productos" className="hover:text-neon">
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">Soporte</h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Cambios", "Envios", "Garantia", "Preguntas frecuentes", "Contacto"].map((x) => (
              <li key={x}>
                <a href="#contacto" className="hover:text-neon">
                  {x}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-8">
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">(c) 2026 SDT DROPS - Todos los derechos reservados</p>
          <p className="font-display text-xs uppercase tracking-widest text-muted-foreground">Cordoba Capital y Villa Maria, Cordoba</p>
        </div>
      </div>
    </footer>
  );
}
