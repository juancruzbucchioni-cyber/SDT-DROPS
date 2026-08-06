import { useEffect, useState } from "react";
import { CATEGORIES_STORAGE_KEY, defaultCategories, type CategoryItem } from "@/components/cb/catalog-config";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export function Categories() {
  const sectionRef = useScrollReveal();
  const [categories, setCategories] = useState<CategoryItem[]>(defaultCategories);

  useEffect(() => {
    const loadCategories = () => {
      try {
        const raw = window.localStorage.getItem(CATEGORIES_STORAGE_KEY);
        const parsed = raw ? (JSON.parse(raw) as CategoryItem[]) : [];
        const visible = (Array.isArray(parsed) && parsed.length ? parsed : defaultCategories)
          .filter((category) => category.name.trim().toLowerCase() !== "todos")
          .sort((a, b) => a.order - b.order);
        setCategories(visible);
      } catch {
        setCategories(defaultCategories);
      }
    };

    loadCategories();
    window.addEventListener("sdt-categories-updated", loadCategories as EventListener);
    window.addEventListener("storage", loadCategories);
    return () => {
      window.removeEventListener("sdt-categories-updated", loadCategories as EventListener);
      window.removeEventListener("storage", loadCategories);
    };
  }, []);

  const fallbackFor = (name: string) => defaultCategories.find((category) => category.name.toLowerCase() === name.toLowerCase())?.img ?? defaultCategories[0].img;

  return (
    <section id="categorias" ref={sectionRef} className="bg-[#E7EAEE] py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8 reveal">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Categorías</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Explorá nuestra selección</h2></div>
          <a href="#productos" className="hidden text-sm font-semibold text-primary hover:underline sm:block">Ver catálogo completo</a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => (
            <a key={category.id} href={`#${category.id.startsWith("cat-") ? category.id : `cat-${category.id}`}`} className={`group reveal-side-right card-shimmer stagger-${Math.min(index + 1, 7)} overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(17,24,39,.08)]`}>
              <img src={category.img || fallbackFor(category.name)} alt={category.name} loading="lazy" onError={(event) => { event.currentTarget.src = fallbackFor(category.name); }} className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="flex items-center justify-between gap-2 p-3 sm:p-4"><h3 className="truncate text-sm font-extrabold uppercase tracking-[0.08em] text-foreground sm:text-base">{category.name}</h3><span className="text-xs font-semibold text-primary sm:text-sm">Ver</span></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
