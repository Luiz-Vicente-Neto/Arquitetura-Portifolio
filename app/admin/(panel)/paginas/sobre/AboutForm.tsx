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
        title="Sobre e currículo"
        description="Seções com a lista vazia não aparecem no site. O PDF do currículo é enviado em Configurações."
        actions={
          <a href="/sobre" target="_blank" rel="noreferrer" className="text-sm text-[#6b675f] hover:text-ink">
            Ver página ↗
          </a>
        }
      />
      <div className="space-y-6">
        <Card title="Apresentação">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <TextInput label="Título da página" value={a.title} onChange={(v) => set("title", v)} />
              <TextArea
                label="Primeiro parágrafo (em destaque)"
                rows={4}
                value={a.intro}
                onChange={(v) => set("intro", v)}
                hint="Em primeira pessoa: quem é, onde se formou, o que gosta de projetar. Também aparece na página inicial."
              />
              <TextArea
                label="Segundo parágrafo"
                rows={6}
                value={a.bio}
                onChange={(v) => set("bio", v)}
                hint="O que aprendeu, como trabalha e que oportunidade procura. Separe parágrafos com uma linha em branco."
              />
            </div>
            <ImageField label="Retrato" value={a.portrait} onChange={(v) => set("portrait", v)} aspect="aspect-[4/5]" />
          </div>
        </Card>

        <Card title="Formação" description="Graduação, intercâmbio, iniciação científica, cursos.">
          <Repeater
            value={a.education}
            onChange={(v) => set("education", v)}
            columns={[
              { key: "period", label: "Período", width: "9rem" },
              { key: "title", label: "Curso ou atividade" },
              { key: "detail", label: "Instituição e detalhes" },
            ]}
            empty={{ period: "", title: "", detail: "" }}
          />
        </Card>

        <Card title="Experiência" description="Estágios, monitoria, escritório modelo, extensão. Diga o que você fez de fato.">
          <Repeater
            value={a.experience}
            onChange={(v) => set("experience", v)}
            columns={[
              { key: "period", label: "Período", width: "9rem" },
              { key: "title", label: "Função e lugar" },
              { key: "detail", label: "O que você fez", multiline: true },
            ]}
            empty={{ period: "", title: "", detail: "" }}
          />
        </Card>

        <Card title="Ferramentas e idiomas" description="Agrupe por tipo: desenho e BIM, modelagem, mapas, diagramação, à mão, idiomas.">
          <Repeater
            value={a.tools}
            onChange={(v) => set("tools", v)}
            columns={[
              { key: "label", label: "Grupo", width: "30%" },
              { key: "value", label: "Ferramentas" },
            ]}
            empty={{ label: "", value: "" }}
            addLabel="+ Adicionar grupo"
          />
        </Card>

        <Card title="Reconhecimentos" description="Concursos, exposições, publicações, menções em banca. Opcional.">
          <Repeater
            value={a.awards}
            onChange={(v) => set("awards", v)}
            columns={[
              { key: "year", label: "Ano", width: "6rem" },
              { key: "title", label: "Descrição" },
            ]}
            empty={{ year: "", title: "" }}
          />
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
