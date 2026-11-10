import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import ProjectForm from "../ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) notFound();
  const { createdAt: _c, updatedAt: _u, order: _o, ...input } = project;
  return <ProjectForm key={project.updatedAt} initial={input} categories={db.categories} />;
}
