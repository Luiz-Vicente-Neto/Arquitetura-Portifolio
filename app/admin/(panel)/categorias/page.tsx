import { db } from "@/lib/db";
import CategoriesForm from "./CategoriesForm";

export default async function CategoriesPage() {
  const store = await db();
  const [categories, projects] = await Promise.all([store.listCategories(), store.listProjects()]);
  const counts = Object.fromEntries(categories.map((c) => [c.id, projects.filter((p) => p.categoryId === c.id).length]));
  return <CategoriesForm initial={categories} counts={counts} />;
}
