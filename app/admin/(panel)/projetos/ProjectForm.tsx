"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteButton from "@/components/admin/DeleteButton";
import FileField from "@/components/admin/FileField";
import { GalleryEditor, ImageField } from "@/components/admin/media";
import { Card, SaveBar, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { deleteProject, saveProject, type ProjectInput } from "@/lib/actions/admin";
import type { Category } from "@/lib/types";
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
          <Card title="Apresentação">
            <div className="grid gap-4">
              <TextInput label="Título" value={p.title} onChange={(v) => set("title", v)} />
              <TextInput
                label="Frase de apresentação"
                value={p.subtitle}
                onChange={(v) => set("subtitle", v)}
                hint="Uma frase: o que é o projeto e onde fica. Aparece sob o título."
              />
              <TextInput
                label="Programa"
                value={p.program}
                onChange={(v) => set("program", v)}
                placeholder="Ex.: Habitação coletiva"
                hint="Aparece nas listas, junto do título."
              />
            </div>
          </Card>

          <Card
            title="Estudo de caso"
            description="Textos curtos. Blocos sem texto e sem imagens não aparecem no site."
          >
            <div className="grid gap-4">
              <TextArea
                label="01 · Problema"
                rows={3}
                value={p.summary}
                onChange={(v) => set("summary", v)}
                hint="Até 60 palavras: qual pergunta o trabalho responde, para quem e por que neste lugar."
              />
              <TextArea
                label="02 · Lugar"
                rows={3}
                value={p.siteText}
                onChange={(v) => set("siteText", v)}
                hint="O que a leitura do território revelou. Acompanha mapas, implantação e diagramas."
              />
              <TextArea
                label="03 · Partido"
                rows={3}
                value={p.conceptText}
                onChange={(v) => set("conceptText", v)}
                hint="A ideia central. Os diagramas contam o resto."
              />
              <TextArea
                label="04 · Desenhos — “Como se constrói”"
                rows={4}
                value={p.constructionText}
                onChange={(v) => set("constructionText", v)}
                hint="Estrutura, materiais, conforto ambiental. Uma linha por tópico."
              />
              <TextArea
                label="05 · Processo"
                rows={3}
                value={p.processText}
                onChange={(v) => set("processText", v)}
                hint="Croquis, maquetes de estudo, versões descartadas."
              />
            </div>
          </Card>

          <Card title="Imagens" description="Desenhos, diagramas, maquetes e perspectivas, organizados por bloco.">
            <GalleryEditor value={p.gallery} onChange={(v) => set("gallery", v)} />
          </Card>

          <Card title="Ficha do projeto" description="Campos vazios não aparecem no site.">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Contexto"
                value={p.context}
                onChange={(v) => set("context", v)}
                placeholder="Ex.: Projeto VI · 7º semestre"
              />
              <TextInput label="Ano" value={p.year} onChange={(v) => set("year", v)} placeholder="2026" />
              <TextInput label="Local" value={p.location} onChange={(v) => set("location", v)} placeholder="Bairro, Cidade — UF" />
              <TextInput label="Escala ou área" value={p.area} onChange={(v) => set("area", v)} placeholder="Ex.: 4.200 m²" />
              <TextInput label="Orientação" value={p.advisor} onChange={(v) => set("advisor", v)} placeholder="Nome do(a) professor(a)" />
              <TextInput
                label="Autoria"
                value={p.authorship}
                onChange={(v) => set("authorship", v)}
                placeholder="Individual"
                hint="Em equipe? Diga qual foi a sua parte."
              />
              <TextInput
                label="Ferramentas"
                value={p.tools}
                onChange={(v) => set("tools", v)}
                placeholder="Ex.: Revit, QGIS, maquete física"
                className="md:col-span-2"
              />
              <TextArea
                label="Créditos"
                rows={3}
                value={p.credits}
                onChange={(v) => set("credits", v)}
                hint="Colegas de equipe, orientação, banca, autoria das imagens."
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
                label="Capa da página inicial"
                description="O primeiro projeto marcado, na ordem da lista, abre a página inicial"
                checked={p.featured}
                onChange={(v) => set("featured", v)}
              />
            </div>
          </Card>

          <Card title="Imagem de capa">
            <ImageField
              label="A vista que explica o projeto sozinha"
              value={p.cover}
              onChange={(v) => set("cover", v)}
              aspect="aspect-video"
              hint="Formato horizontal (16:9). Sem imagem, o site mostra uma área hachurada."
            />
          </Card>

          <Card title="Caderno em PDF">
            <FileField
              label="Caderno ou prancha do projeto"
              value={p.pdfUrl}
              onChange={(v) => set("pdfUrl", v)}
            />
          </Card>

          <Card title="Classificação">
            <div className="space-y-4">
              <Select
                label="Categoria"
                value={p.categoryId}
                onChange={(v) => set("categoryId", v)}
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
