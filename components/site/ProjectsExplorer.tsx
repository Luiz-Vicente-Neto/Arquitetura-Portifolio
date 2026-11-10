"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { PROJECT_STATUS_LABEL, type Category, type Project, type ProjectStatus } from "@/lib/types";
import { cx, img, pad } from "@/lib/utils";
import ProjectCard from "./ProjectCard";

type View = "grid" | "index";

export default function ProjectsExplorer({
  projects,
  categories,
  initialCategory,
}: {
  projects: Project[];
  categories: Category[];
  initialCategory?: string;
}) {
  const [category, setCategory] = useState<string>(initialCategory ?? "todos");
  const [status, setStatus] = useState<ProjectStatus | "todos">("todos");
  const [view, setView] = useState<View>("grid");
  const [hover, setHover] = useState<Project | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const usedCategories = categories.filter((c) => projects.some((p) => p.categoryId === c.id));

  const filtered = projects.filter(
    (p) =>
      (category === "todos" || categories.find((c) => c.slug === category)?.id === p.categoryId) &&
      (status === "todos" || p.status === status),
  );

  const selectCategory = (slug: string) => {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", slug);
    window.history.replaceState(null, "", url);
  };

  const onMove = (e: React.MouseEvent) => {
    const el = previewRef.current;
    if (el) el.style.transform = `translate3d(${e.clientX + 24}px, ${e.clientY - 120}px, 0)`;
  };

  return (
    <div>
      {/* Filtros */}
      <div className="sticky top-16 z-30 -mx-[clamp(1.25rem,4vw,3.5rem)] border-b border-line bg-paper/90 px-[clamp(1.25rem,4vw,3.5rem)] backdrop-blur-md md:top-20">
        <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <div className="-mx-1 flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[{ slug: "todos", name: "Todos" }, ...usedCategories].map((c) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => selectCategory(c.slug)}
                className={cx(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors",
                  category === c.slug ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-5 text-[13px]">
            <label className="flex items-center gap-2 text-stone">
              <span className="sr-only md:not-sr-only">Status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus | "todos")}
                className="cursor-pointer bg-transparent text-ink outline-none"
              >
                <option value="todos">Todos</option>
                {Object.entries(PROJECT_STATUS_LABEL).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <span className="h-4 w-px bg-line" />
            <div className="flex gap-3" role="group" aria-label="Visualização">
              {(["grid", "index"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cx("transition-colors", view === v ? "text-ink" : "text-stone hover:text-ink")}
                >
                  {v === "grid" ? "Grade" : "Índice"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-stone">
        {filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}
      </p>

      {filtered.length === 0 && (
        <p className="py-24 text-center text-stone">Nenhum projeto encontrado com esses filtros.</p>
      )}

      {view === "grid" ? (
        <div className="mt-6 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => (
            <div key={p.id} className={cx(i % 3 === 1 && "lg:mt-20")}>
              <ProjectCard project={p} categoryName={catName[p.categoryId]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative mt-6" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
          <div className="hidden grid-cols-12 gap-4 border-b border-line pb-3 text-[11px] tracking-[0.14em] text-stone uppercase md:grid">
            <span className="col-span-1">Nº</span>
            <span className="col-span-4">Projeto</span>
            <span className="col-span-3">Local</span>
            <span className="col-span-2">Tipologia</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-1 text-right">Ano</span>
          </div>
          <ul>
            {filtered.map((p, i) => (
              <li key={p.id} onMouseEnter={() => setHover(p)}>
                <Link
                  href={`/projetos/${p.slug}`}
                  className="grid grid-cols-12 gap-4 border-b border-line py-4 text-[15px] transition-colors hover:bg-paper-2/60"
                >
                  <span className="col-span-2 text-stone tabular-nums md:col-span-1">{pad(i + 1)}</span>
                  <span className="col-span-8 font-medium md:col-span-4">{p.title}</span>
                  <span className="col-span-2 text-right text-stone tabular-nums md:hidden">{p.year}</span>
                  <span className="col-span-10 col-start-3 -mt-3 text-sm text-stone md:col-span-3 md:col-start-auto md:mt-0 md:text-[15px] md:text-ink-2">
                    {p.location}
                  </span>
                  <span className="hidden text-ink-2 md:col-span-2 md:block">{catName[p.categoryId]}</span>
                  <span className="hidden text-sm text-stone md:col-span-1 md:block">
                    {PROJECT_STATUS_LABEL[p.status].split(" ")[0]}
                  </span>
                  <span className="hidden text-right tabular-nums md:col-span-1 md:block">{p.year}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pré-visualização que acompanha o cursor */}
          <div
            ref={previewRef}
            className={cx(
              "pointer-events-none fixed top-0 left-0 z-40 hidden w-[300px] transition-opacity duration-300 lg:block",
              hover ? "opacity-100" : "opacity-0",
            )}
          >
            {hover && (
              <img src={img(hover.cover, 700)} alt="" className="aspect-[4/5] w-full object-cover shadow-xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
