import logoEffect from "@/assets/logo-effect.webp";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function BrandShowcase() {
  const sectionRef = useScrollReveal();

  return (
    <section ref={sectionRef} className="border-b border-border bg-[#071632] py-10 sm:py-16 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="reveal-scale flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          <div className="max-w-lg space-y-4">
            <span className="inline-block rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-blue-300">
              Calidad e Importación
            </span>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl text-white">
              El respaldo que tu negocio necesita.
            </h2>
            <p className="text-sm leading-relaxed text-blue-100/70 sm:text-base">
              Catálogo actualizado en tiempo real, envíos directos a todo el país y atención personalizada para compras mayoristas.
            </p>
          </div>
          <div className="reveal-side-right relative w-full max-w-md shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-2 shadow-2xl">
            <img
              src={logoEffect}
              alt="SDT DROPS Logo Animado"
              loading="lazy"
              className="h-auto w-full object-contain transition-transform duration-700 hover:scale-[1.02]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
