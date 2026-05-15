import celularesImg from "@/assets/productos/celulares.png";
import perfumesImg from "@/assets/productos/perfumes.png";
import stanleyImg from "@/assets/productos/stanley.png";
import relojesImg from "@/assets/productos/relojes.png";
import accesoriosImg from "@/assets/productos/accesorios.png";
import camisetasImg from "@/assets/productos/camisetas.png";
import mayoristaImg from "@/assets/productos/mayorista.png";

export type CategoryItem = {
  id: string;
  name: string;
  img: string;
  order: number;
};

export const CATEGORIES_STORAGE_KEY = "sdt_drops_categories_v1";

export const defaultCategories: CategoryItem[] = [
  { id: "cat-celulares", name: "Celulares", img: celularesImg, order: 1 },
  { id: "cat-perfumes", name: "Perfumes", img: perfumesImg, order: 2 },
  { id: "cat-stanley", name: "Stanley", img: stanleyImg, order: 3 },
  { id: "cat-relojes", name: "Relojes", img: relojesImg, order: 4 },
  { id: "cat-accesorios", name: "Accesorios", img: accesoriosImg, order: 5 },
  { id: "cat-camisetas", name: "Camisetas", img: camisetasImg, order: 6 },
  { id: "cat-mayorista", name: "Mayorista", img: mayoristaImg, order: 7 },
];

export function slugifyCategory(name: string) {
  return (
    "cat-" +
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
