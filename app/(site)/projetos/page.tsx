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
  const [projects, categories] = await Promise.all([getPublishedProjects(), getCategories()]);

  return (
    <div className="wrap">
      <header className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6 pt-[clamp(3rem,7vw,6rem)] pb-10">
        <h1 className="text-[clamp(2.75rem,7vw,6rem)] leading-none font-medium tracking-[-0.03em]">Projetos</h1>
        <p className="max-w-[26rem] flex-[0_1_26rem] text-[17px] text-stone">
          Trabalhos selecionados da graduação: arquitetura, urbanismo e paisagismo.
        </p>
      </header>
      <ProjectsExplorer projects={projects} categories={categories} initialCategory={categoria} />
    </div>
  );
}
