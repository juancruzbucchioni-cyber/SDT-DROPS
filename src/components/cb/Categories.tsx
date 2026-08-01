import celulares from "@/assets/productos/celulares.png";
import perfumes from "@/assets/productos/perfumes.png";
import stanley from "@/assets/productos/stanley.png";
import relojes from "@/assets/productos/relojes.png";

const categories = [
  { name: "Celulares", href: "#cat-celulares", image: celulares },
  { name: "Perfumes", href: "#cat-perfumes", image: perfumes },
  { name: "Stanley", href: "#cat-stanley", image: stanley },
  { name: "Relojes", href: "#cat-relojes", image: relojes },
];

export function Categories() {
  return (
    <section id="categorias" className="bg-[#E7EAEE] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Categorías</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Explorá nuestra selección</h2></div>
          <a href="#productos" className="hidden text-sm font-semibold text-primary hover:underline sm:block">Ver catálogo completo</a>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((category) => (
            <a key={category.name} href={category.href} className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(17,24,39,.08)]">
              <img src={category.image} alt={category.name} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
              <div className="flex items-center justify-between p-4"><h3 className="text-base font-semibold normal-case tracking-normal text-foreground">{category.name}</h3><span className="text-sm text-primary">Ver</span></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
