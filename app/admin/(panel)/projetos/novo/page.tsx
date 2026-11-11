import { getCategories } from "@/lib/db";
import type { ProjectInput } from "@/lib/actions/admin";
import ProjectForm from "../ProjectForm";

export default async function NewProjectPage() {
  const categories = await getCategories();
  const initial: ProjectInput = {
    slug: "",
    title: "",
    subtitle: "",
    categoryId: categories[0]?.id ?? "",
    program: "",
    context: "",
    location: "",
    year: String(new Date().getFullYear()),
    area: "",
    advisor: "",
    authorship: "Individual",
    tools: "",
    summary: "",
    siteText: "",
    conceptText: "",
    constructionText: "",
    processText: "",
    credits: "",
    cover: "",
    pdfUrl: "",
    gallery: [],
    featured: false,
    published: false,
  };
  return <ProjectForm initial={initial} categories={categories} />;
}
