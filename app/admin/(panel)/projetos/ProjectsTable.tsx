"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button, useToast } from "@/components/admin/ui";
import { deleteProject, moveProject, toggleProjectFlag, type ActionResult } from "@/lib/actions/admin";
import { PROJECT_STATUS_LABEL, type Category, type Project } from "@/lib/types";
import { img } from "@/lib/utils";

export default function ProjectsTable({ projects, categories }: { projects: Project[]; categories: Category[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  const run = (fn: () => Promise<ActionResult>, msg?: string) =>
    start(async () => {
      const res = await fn();
      if (!res.ok) toast(res.error ?? "Não foi possível concluir a ação.", "error");
      else if (msg) toast(msg);
      router.refresh();
    });

  const filtered = projects.filter((p) =>
    `${p.title} ${p.location} ${p.year}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="rounded-xl border border-[#e4e1db] bg-white">
      <div className="border-b border-[#e4e1db] p-3">
        <input
          className="admin-input md:!w-72"
          placeholder="Buscar projeto…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <ul className={`divide-y divide-[#efede9] ${pending ? "opacity-60" : ""}`}>
        {filtered.map((p) => {
          const index = projects.indexOf(p);
          return (
            <li key={p.id} className="flex flex-col gap-3 px-4 py-3 md:flex-row md:items-center">
              <div className="flex shrink-0 gap-0.5" aria-label="Ordem">
                <Button
                  variant="ghost"
                  className="!px-1.5 !py-1"
                  disabled={index === 0 || !!q}
                  onClick={() => run(() => moveProject(p.id, -1))}
                  aria-label="Mover para cima"
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  className="!px-1.5 !py-1"
                  disabled={index === projects.length - 1 || !!q}
                  onClick={() => run(() => moveProject(p.id, 1))}
                  aria-label="Mover para baixo"
                >
                  ↓
                </Button>
              </div>
              <Link href={`/admin/projetos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded bg-[#f0eee9]">
                  {p.cover && <img src={img(p.cover, 200)} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-[#8a867e]">
                    {catName[p.categoryId] ?? "Sem categoria"} · {p.location} · {p.year}
                  </span>
                </span>
              </Link>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={p.status === "concluido" ? "neutral" : p.status === "em-andamento" ? "blue" : "amber"}>
                  {PROJECT_STATUS_LABEL[p.status]}
                </Badge>
                <button
                  type="button"
                  onClick={() => run(() => toggleProjectFlag(p.id, "featured"))}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.featured ? "bg-ink text-white" : "bg-[#efede9] text-[#8a867e]"}`}
                  title="Alternar destaque"
                >
                  ★ Destaque
                </button>
                <button
                  type="button"
                  onClick={() => run(() => toggleProjectFlag(p.id, "published"), p.published ? "Projeto despublicado" : "Projeto publicado")}
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-[#efede9] text-[#8a867e]"}`}
                  title="Alternar publicação"
                >
                  {p.published ? "Publicado" : "Rascunho"}
                </button>
                <a href={`/projetos/${p.slug}`} target="_blank" rel="noreferrer" className="px-1 text-xs text-[#6b675f] hover:text-ink">
                  Ver ↗
                </a>
                <Button
                  variant="danger"
                  className="!px-2 !py-1 text-xs"
                  onClick={() => {
                    if (confirm(`Excluir “${p.title}”? Essa ação não pode ser desfeita.`))
                      run(() => deleteProject(p.id), "Projeto excluído");
                  }}
                >
                  Excluir
                </Button>
              </div>
            </li>
          );
        })}
        {filtered.length === 0 && <li className="px-4 py-12 text-center text-sm text-[#8a867e]">Nenhum projeto.</li>}
      </ul>
    </div>
  );
}
