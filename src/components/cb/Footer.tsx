import logo from "@/assets/logo.png";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const supportLinks = [
  {
    label: "Cambios",
    href: `https://wa.me/5493534814420?text=${encodeURIComponent("Hola, quiero consultar por un cambio.")}`,
  },
  {
    label: "Envíos",
    href: `https://wa.me/5493534814420?text=${encodeURIComponent("Hola, quiero consultar por un envío.")}`,
  },
  { label: "Garantía", href: "#contacto" },
];

export function Footer() {
  const footerRef = useScrollReveal();

  return (
    <footer ref={footerRef} className="border-t border-border bg-background">
      <div className="reveal mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:py-16 md:grid-cols-4 md:px-8">
        <div className="col-span-2">
          <img src={logo} alt="SDT DROPS" width={64} height={64} className="h-14 w-auto object-contain drop-shadow-[0_0_18px_color-mix(in_oklab,var(--neon)_55%,transparent)]" />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Tienda mayorista e importadora.
            Tecnología, perfumes, Stanley, accesorios, camisetas y más.
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
            {supportLinks.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="hover:text-neon"
                  {...(link.href.startsWith("https://") ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-8">
          <p className="text-center font-display text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest md:text-left">© 2026 SDT DROPS · Todos los derechos reservados</p>
          <p className="text-center font-display text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs sm:tracking-widest md:text-right">Córdoba Capital · Villa María, Córdoba</p>
        </div>
      </div>
    </footer>
  );
}
