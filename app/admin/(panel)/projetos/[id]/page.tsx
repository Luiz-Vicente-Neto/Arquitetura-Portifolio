import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await db();
  const [project, categories] = await Promise.all([store.getProject({ id }), store.listCategories()]);
  if (!project) notFound();
  const { createdAt: _c, updatedAt: _u, order: _o, ...input } = project;
  return <ProjectForm key={project.updatedAt} initial={input} categories={categories} />;
}
