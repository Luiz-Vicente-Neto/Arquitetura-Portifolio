import Link from "next/link";
import { readDb } from "@/lib/db";
import ProjectsTable from "./ProjectsTable";

export default function AdminProjects() {
  const db = readDb();
  const projects = [...db.projects].sort((a, b) => a.order - b.order);
  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="mt-1 text-sm text-[#6b675f]">
            A ordem desta lista é a ordem exibida no site. Projetos em destaque aparecem no carrossel e na página inicial.
          </p>
        </div>
        <Link href="/admin/projetos/novo" className="inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white">
          + Novo projeto
        </Link>
      </div>
      <ProjectsTable projects={projects} categories={db.categories} />
    </div>
  );
}
