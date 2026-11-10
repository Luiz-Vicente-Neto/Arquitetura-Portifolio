import { readDb } from "@/lib/db";
import type { ProjectInput } from "@/lib/actions/admin";
import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  const { categories } = readDb();
  const initial: ProjectInput = {
    slug: "",
    title: "",
    subtitle: "",
    categoryId: categories[0]?.id ?? "",
    status: "concluido",
    location: "",
    year: String(new Date().getFullYear()),
    area: "",
    client: "",
    team: "",
    photographer: "",
    summary: "",
    description: "",
    cover: "",
    gallery: [],
    featured: false,
    published: false,
  };
  return <ProjectForm initial={initial} categories={categories} />;
}
