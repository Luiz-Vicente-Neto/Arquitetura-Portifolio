import { readDb } from "@/lib/db";
import CategoriesForm from "./CategoriesForm";

export default function CategoriesPage() {
  const db = readDb();
  const counts = Object.fromEntries(
    db.categories.map((c) => [c.id, db.projects.filter((p) => p.categoryId === c.id).length]),
  );
  return <CategoriesForm initial={db.categories} counts={counts} />;
}
