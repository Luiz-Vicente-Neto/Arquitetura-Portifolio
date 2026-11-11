"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ImageField } from "@/components/admin/media";
import { Card, SaveBar, Select, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import DeleteButton from "@/components/admin/DeleteButton";
import { deletePost, savePost, type PostInput } from "@/lib/actions/admin";
import { POST_TYPE_LABEL, type PostType } from "@/lib/types";
import { slugify, slugInput } from "@/lib/utils";

export default function PostForm({ initial }: { initial: PostInput }) {
  const router = useRouter();
  const isNew = !initial.id;
  const { value: p, set, submit, pending, dirty } = useFormState(initial, savePost, {
    onSaved: (r) => {
      if (isNew && r.id) router.replace(`/admin/jornal/${r.id}`);
    },
  });

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/admin/jornal" className="text-sm text-[#6b675f] hover:text-ink">
            ← Jornal
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{isNew ? "Nova publicação" : p.title || "Publicação"}</h1>
        </div>
        {!isNew && initial.id && (
          <div className="flex items-center gap-2">
            <a
              href={`/jornal/${initial.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-2 text-sm text-[#6b675f] hover:text-ink"
            >
              {initial.published ? "Ver no site ↗" : "Pré-visualizar ↗"}
            </a>
            <DeleteButton
              confirmText={`Excluir “${initial.title}”? Essa ação não pode ser desfeita.`}
              onDelete={() => deletePost(initial.id!)}
              redirectTo="/admin/jornal"
              successText="Publicação excluída"
            />
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <div className="grid gap-4">
              <TextInput label="Título" value={p.title} onChange={(v) => set("title", v)} />
              <TextArea label="Resumo" rows={3} value={p.excerpt} onChange={(v) => set("excerpt", v)} />
              <TextArea
                label="Texto"
                rows={12}
                value={p.body}
                onChange={(v) => set("body", v)}
                hint="Separe parágrafos com uma linha em branco."
              />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Publicação">
            <div className="space-y-4">
              <Toggle label="Publicado" checked={p.published} onChange={(v) => set("published", v)} />
              <Select<PostType>
                label="Tipo"
                value={p.type}
                onChange={(v) => set("type", v)}
                options={Object.entries(POST_TYPE_LABEL).map(([value, label]) => ({ value: value as PostType, label }))}
              />
              <TextInput label="Data" type="date" value={p.date} onChange={(v) => set("date", v)} />
              <TextInput label="Veículo / instituição" value={p.outlet} onChange={(v) => set("outlet", v)} />
              <TextInput
                label="Link externo"
                type="url"
                value={p.externalUrl}
                onChange={(v) => set("externalUrl", v)}
                placeholder="https://"
              />
              <TextInput
                label="Endereço (slug)"
                value={p.slug}
                onChange={(v) => set("slug", slugInput(v))}
                placeholder={slugify(p.title) || "gerado-automaticamente"}
              />
            </div>
          </Card>
          <Card title="Imagem">
            <ImageField label="Capa" value={p.cover} onChange={(v) => set("cover", v)} />
          </Card>
        </div>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty || isNew} />
    </div>
  );
}
