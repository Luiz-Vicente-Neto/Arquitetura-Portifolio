"use client";

import { ImageField } from "@/components/admin/media";
import Repeater from "@/components/admin/Repeater";
import { Card, PageHeader, SaveBar, TextArea, TextInput } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveAbout } from "@/lib/actions/admin";
import type { AboutContent } from "@/lib/types";

export default function AboutForm({ initial }: { initial: AboutContent }) {
  const { value: a, set, submit, pending, dirty } = useFormState(initial, saveAbout);

  return (
    <div>
      <PageHeader
        title="Escritório"
        description="Conteúdo da página sobre a arquiteta e o estúdio."
        actions={
          <a href="/escritorio" target="_blank" rel="noreferrer" className="text-sm text-[#6b675f] hover:text-ink">
            Ver página ↗
          </a>
        }
      />
      <div className="space-y-6">
        <Card title="Apresentação">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <TextInput label="Título da página" value={a.title} onChange={(v) => set("title", v)} />
              <TextArea label="Introdução" rows={3} value={a.intro} onChange={(v) => set("intro", v)} />
              <TextArea
                label="Biografia"
                rows={9}
                value={a.bio}
                onChange={(v) => set("bio", v)}
                hint="Separe parágrafos com uma linha em branco."
              />
            </div>
            <ImageField label="Retrato" value={a.portrait} onChange={(v) => set("portrait", v)} aspect="aspect-[4/5]" />
          </div>
        </Card>

        <Card title="Filosofia">
          <div className="grid gap-4">
            <TextInput label="Título" value={a.philosophyTitle} onChange={(v) => set("philosophyTitle", v)} />
            <TextArea label="Texto" rows={5} value={a.philosophy} onChange={(v) => set("philosophy", v)} />
          </div>
        </Card>

        <Card title="Trajetória" description="Formação e marcos profissionais.">
          <Repeater
            value={a.timeline}
            onChange={(v) => set("timeline", v)}
            columns={[
              { key: "year", label: "Ano", width: "6rem" },
              { key: "text", label: "Descrição" },
            ]}
            empty={{ year: "", text: "" }}
          />
        </Card>

        <Card title="Processo de trabalho" description="Etapas exibidas em colunas numeradas.">
          <Repeater
            value={a.process}
            onChange={(v) => set("process", v)}
            columns={[
              { key: "title", label: "Etapa", width: "30%" },
              { key: "text", label: "Descrição", multiline: true },
            ]}
            empty={{ title: "", text: "" }}
            addLabel="+ Adicionar etapa"
          />
        </Card>

        <Card title="Prêmios e reconhecimentos">
          <Repeater
            value={a.awards}
            onChange={(v) => set("awards", v)}
            columns={[
              { key: "year", label: "Ano", width: "6rem" },
              { key: "title", label: "Prêmio" },
              { key: "org", label: "Instituição", width: "25%" },
            ]}
            empty={{ year: "", title: "", org: "" }}
          />
        </Card>

        <Card title="Estúdio e clientes">
          <div className="grid gap-6 md:grid-cols-2">
            <ImageField label="Imagem panorâmica do estúdio" value={a.studioImage} onChange={(v) => set("studioImage", v)} />
            <TextArea
              label="Clientes e parceiros"
              rows={6}
              value={a.clients}
              onChange={(v) => set("clients", v)}
              hint="Separe os nomes por vírgula."
            />
          </div>
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
