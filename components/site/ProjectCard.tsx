import Link from "next/link";
import { img } from "@/lib/utils";
import { PROJECT_STATUS_LABEL, type Project } from "@/lib/types";

export default function ProjectCard({
  project,
  categoryName,
  aspect = "aspect-[4/5]",
  sizes = 1200,
}: {
  project: Project;
  categoryName?: string;
  aspect?: string;
  sizes?: number;
}) {
  return (
    <Link href={`/projetos/${project.slug}`} className="group block">
      <div className={`img-zoom relative overflow-hidden bg-paper-2 ${aspect}`}>
        <img
          src={img(project.cover, sizes)}
          alt={project.title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {project.status !== "concluido" && (
          <span className="absolute top-3 left-3 bg-paper/90 px-2 py-1 text-[10px] tracking-[0.14em] uppercase">
            {PROJECT_STATUS_LABEL[project.status]}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-medium">
          <span className="link-line">{project.title}</span>
        </h3>
        <span className="shrink-0 text-sm text-stone tabular-nums">{project.year}</span>
      </div>
      <p className="mt-0.5 text-sm text-stone">
        {project.location}
        {categoryName && <> · {categoryName}</>}
      </p>
    </Link>
  );
}
