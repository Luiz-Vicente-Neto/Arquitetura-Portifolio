import type { Metadata } from "next";
import ProjectsExplorer from "@/components/site/ProjectsExplorer";
import { getCategories, getPublishedProjects } from "@/lib/db";

export const metadata: Metadata = { title: "Projetos" };

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const projects = getPublishedProjects();
  const categories = getCategories();

  return (
    <div className="wrap pt-32 md:pt-44">
      <header className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12">
        <h1 className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9] md:col-span-8">Projetos</h1>
        <p className="self-end text-[15px] leading-relaxed text-stone md:col-span-4">
          Uma seleção de obras construídas, projetos em andamento e propostas de concurso — casas, interiores,
          espaços de trabalho e equipamentos culturais.
        </p>
      </header>
      <ProjectsExplorer projects={projects} categories={categories} initialCategory={categoria} />
    </div>
  );
}
