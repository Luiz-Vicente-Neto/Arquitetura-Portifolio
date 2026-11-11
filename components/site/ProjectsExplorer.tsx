"use client";

import Link from "next/link";
import { useState } from "react";
import type { Category, Project } from "@/lib/types";
import { cx, pad } from "@/lib/utils";
import Shot from "./Shot";

export default function ProjectsExplorer({
  projects,
  categories,
  initialCategory,
}: {
  projects: Project[];
  categories: Category[];
  initialCategory?: string;
}) {
  const used = categories.filter((c) => projects.some((p) => p.categoryId === c.id));
  const [category, setCategory] = useState<string>(
    initialCategory && used.some((c) => c.slug === initialCategory) ? initialCategory : "todos",
  );

  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const activeId = used.find((c) => c.slug === category)?.id;
  const filtered = activeId ? projects.filter((p) => p.categoryId === activeId) : projects;

  const select = (slug: string) => {
    setCategory(slug);
    const url = new URL(window.location.href);
    if (slug === "todos") url.searchParams.delete("categoria");
    else url.searchParams.set("categoria", slug);
    window.history.replaceState(null, "", url);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-y border-ink py-3">
        <div role="group" aria-label="Filtrar por área" className="flex flex-wrap gap-2">
          {[{ slug: "todos", name: "Todos" }, ...used].map((c) => {
            const on = category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={on}
                onClick={() => select(c.slug)}
                className={cx(
                  "label min-h-11 border border-ink px-4 transition-colors",
                  on ? "bg-ink !text-paper" : "!text-ink hover:bg-paper-2",
                )}
              >
                {c.name}
              </button>
            );
          })}
        </div>
        <span className="label" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "projeto" : "projetos"}
        </span>
      </div>

      {filtered.length === 0 && <p className="py-24 text-center text-stone">Nenhum projeto publicado ainda.</p>}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,23rem),1fr))] gap-x-8 gap-y-14 pt-10">
        {filtered.map((p) => (
          <Link key={p.id} href={`/projetos/${p.slug}`} className="group flex flex-col gap-3.5">
            <Shot src={p.cover} alt={p.title} className="aspect-[4/3]" width={1200} />
            <div className="label flex items-baseline justify-between gap-4">
              <span>
                <span className="text-accent">{pad(projects.indexOf(p) + 1)}</span>
                {catName[p.categoryId] && ` · ${catName[p.categoryId]}`}
              </span>
              <span>{p.year}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-2xl leading-[1.15] font-medium tracking-[-0.01em] transition-colors group-hover:text-accent">
                {p.title}
              </span>
              {p.program && <span className="text-stone">{p.program}</span>}
              {(p.context || p.authorship) && (
                <span className="text-sm text-stone">{[p.context, p.authorship].filter(Boolean).join(" · ")}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
