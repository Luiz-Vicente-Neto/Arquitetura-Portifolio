"use client";

import { Button, Card, PageHeader, SaveBar } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveCategories } from "@/lib/actions/admin";
import type { Category } from "@/lib/types";
import { slugify } from "@/lib/utils";

export default function CategoriesForm({ initial, counts }: { initial: Category[]; counts: Record<string, number> }) {
  const { value, setValue, submit, pending, dirty } = useFormState(initial, saveCategories);

  const update = (i: number, name: string) => setValue(value.map((c, idx) => (idx === i ? { ...c, name } : c)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    setValue(next);
  };

  return (
    <div>
      <PageHeader
        title="Categorias"
        description="Tipologias usadas para filtrar os projetos no site. A ordem aqui define a ordem dos filtros."
      />
      <Card>
        <ul className="space-y-2">
          {value.map((c, i) => (
            <li key={c.id || i} className="flex items-center gap-2">
              <input className="admin-input" value={c.name} onChange={(e) => update(i, e.target.value)} placeholder="Nome" />
              <span className="hidden w-40 shrink-0 truncate text-xs text-[#8a867e] md:block">
                ?categoria={slugify(c.name)}
              </span>
              <span className="w-20 shrink-0 text-right text-xs text-[#8a867e]">{counts[c.id] ?? 0} projetos</span>
              <Button variant="ghost" className="!px-2" onClick={() => move(i, -1)} aria-label="Subir">
                ↑
              </Button>
              <Button variant="ghost" className="!px-2" onClick={() => move(i, 1)} aria-label="Descer">
                ↓
              </Button>
              <Button
                variant="danger"
                className="!px-2"
                aria-label="Remover"
                onClick={() => {
                  if (!counts[c.id] || confirm(`“${c.name}” tem projetos. Eles serão movidos para a primeira categoria. Continuar?`))
                    setValue(value.filter((_, idx) => idx !== i));
                }}
              >
                ✕
              </Button>
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="mt-4" onClick={() => setValue([...value, { id: "", name: "", slug: "" }])}>
          + Nova categoria
        </Button>
      </Card>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
