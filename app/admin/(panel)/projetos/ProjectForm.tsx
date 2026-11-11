"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GalleryEditor, ImageField } from "@/components/admin/media";
import { Card, SaveBar, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import DeleteButton from "@/components/admin/DeleteButton";
import { deleteProject, saveProject, type ProjectInput } from "@/lib/actions/admin";
import { PROJECT_STATUS_LABEL, type Category, type ProjectStatus } from "@/lib/types";
import { slugify, slugInput } from "@/lib/utils";

export default function ProjectForm({ initial, categories }: { initial: ProjectInput; categories: Category[] }) {
  const router = useRouter();
  const isNew = !initial.id;
  const { value: p, set, submit, pending, dirty } = useFormState(initial, saveProject, {
    onSaved: (r) => {
      if (isNew && r.id) router.replace(`/admin/projetos/${r.id}`);
    },
  });

  return (
    <div className="pb-4">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/admin/projetos" className="text-sm text-[#6b675f] hover:text-ink">
            ← Projetos
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{isNew ? "Novo projeto" : p.title || "Projeto"}</h1>
        </div>
        {!isNew && initial.id && (
          <div className="flex items-center gap-2">
            <a
              href={`/projetos/${initial.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-2 text-sm text-[#6b675f] hover:text-ink"
            >
              {initial.published ? "Ver no site ↗" : "Pré-visualizar ↗"}
            </a>
            <DeleteButton
              confirmText={`Excluir “${initial.title}”? Essa ação não pode ser desfeita.`}
              onDelete={() => deleteProject(initial.id!)}
              redirectTo="/admin/projetos"
              successText="Projeto excluído"
            />
          </div>
        )}
      </div>

      {categories.length === 0 && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Nenhuma categoria cadastrada.{" "}
          <Link href="/admin/categorias" className="font-medium underline">
            Crie uma categoria
          </Link>{" "}
          para classificar os projetos.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card title="Informações principais">
            <div className="grid gap-4">
              <TextInput
                label="Título"
                value={p.title}
                onChange={(v) => set("title", v)}
                placeholder="Ex.: Casa Jabuticabeira"
              />
              <TextInput
                label="Subtítulo"
                value={p.subtitle}
                onChange={(v) => set("subtitle", v)}
                hint="Frase curta exibida na capa do projeto."
              />
              <TextArea
                label="Resumo"
                rows={3}
                value={p.summary}
                onChange={(v) => set("summary", v)}
                hint="Texto de destaque em fonte grande, logo abaixo da capa."
              />
              <TextArea
                label="Descrição"
                rows={10}
                value={p.description}
                onChange={(v) => set("description", v)}
                hint="Separe parágrafos com uma linha em branco."
              />
            </div>
          </Card>

          <Card title="Galeria" description="Fotos, desenhos, plantas e cortes do projeto.">
            <GalleryEditor value={p.gallery} onChange={(v) => set("gallery", v)} />
          </Card>

          <Card title="Ficha técnica">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Local" value={p.location} onChange={(v) => set("location", v)} placeholder="Cidade, UF" />
              <TextInput label="Ano" value={p.year} onChange={(v) => set("year", v)} placeholder="2026" />
              <TextInput label="Área" value={p.area} onChange={(v) => set("area", v)} placeholder="420 m²" />
              <TextInput label="Cliente" value={p.client} onChange={(v) => set("client", v)} />
              <TextInput label="Equipe" value={p.team} onChange={(v) => set("team", v)} className="md:col-span-2" />
              <TextInput
                label="Fotografia / créditos de imagem"
                value={p.photographer}
                onChange={(v) => set("photographer", v)}
                className="md:col-span-2"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Publicação">
            <div className="space-y-4">
              <Toggle
                label="Publicado"
                description="Visível no site"
                checked={p.published}
                onChange={(v) => set("published", v)}
              />
              <Toggle
                label="Destaque"
                description="Aparece no carrossel e na página inicial"
                checked={p.featured}
                onChange={(v) => set("featured", v)}
              />
            </div>
          </Card>

          <Card title="Capa">
            <ImageField label="Imagem de capa" value={p.cover} onChange={(v) => set("cover", v)} aspect="aspect-[4/3]" />
          </Card>

          <Card title="Classificação">
            <div className="space-y-4">
              <Select
                label="Categoria"
                value={p.categoryId}
                onChange={(v) => set("categoryId", v)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Select<ProjectStatus>
                label="Status"
                value={p.status}
                onChange={(v) => set("status", v)}
                options={Object.entries(PROJECT_STATUS_LABEL).map(([value, label]) => ({
                  value: value as ProjectStatus,
                  label,
                }))}
              />
              <TextInput
                label="Endereço (slug)"
                value={p.slug}
                onChange={(v) => set("slug", slugInput(v))}
                placeholder={slugify(p.title) || "gerado-automaticamente"}
                hint={`/projetos/${p.slug || slugify(p.title) || "…"}`}
              />
            </div>
          </Card>
        </div>
      </div>

      <SaveBar onSave={submit} pending={pending} dirty={dirty || isNew} />
    </div>
  );
}
