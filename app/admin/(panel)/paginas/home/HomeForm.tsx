"use client";

import { ImageField } from "@/components/admin/media";
import Repeater from "@/components/admin/Repeater";
import { Card, PageHeader, SaveBar, TextArea, TextInput, Toggle } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveHome } from "@/lib/actions/admin";
import type { HomeContent } from "@/lib/types";

export default function HomeForm({ initial }: { initial: HomeContent }) {
  const { value: h, set, submit, pending, dirty } = useFormState(initial, saveHome);

  return (
    <div>
      <PageHeader
        title="Página inicial"
        description="As imagens do carrossel vêm dos projetos marcados como destaque."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className="text-sm text-[#6b675f] hover:text-ink">
            Ver página ↗
          </a>
        }
      />
      <div className="space-y-6">
        <Card title="Capa (hero)">
          <div className="grid gap-4">
            <TextInput label="Título" value={h.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <TextInput label="Subtítulo" value={h.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
          </div>
        </Card>

        <Card title="Manifesto" description="Frase de apresentação exibida em fonte grande logo após a capa.">
          <TextArea label="Texto" rows={4} value={h.statement} onChange={(v) => set("statement", v)} />
        </Card>

        <Card title="Atuação / serviços">
          <TextInput
            label="Título da seção"
            value={h.servicesTitle}
            onChange={(v) => set("servicesTitle", v)}
            className="mb-4"
          />
          <Repeater
            value={h.services}
            onChange={(v) => set("services", v)}
            columns={[
              { key: "title", label: "Serviço", width: "30%" },
              { key: "text", label: "Descrição", multiline: true },
            ]}
            empty={{ title: "", text: "" }}
            addLabel="+ Adicionar serviço"
          />
        </Card>

        <Card title="Sobre (chamada)">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <TextInput label="Título" value={h.aboutTeaserTitle} onChange={(v) => set("aboutTeaserTitle", v)} />
              <TextArea label="Texto" rows={5} value={h.aboutTeaserText} onChange={(v) => set("aboutTeaserText", v)} />
            </div>
            <ImageField label="Imagem" value={h.aboutTeaserImage} onChange={(v) => set("aboutTeaserImage", v)} />
          </div>
        </Card>

        <Card title="Jornal e chamada final">
          <div className="grid gap-4">
            <Toggle
              label="Mostrar últimas publicações do jornal"
              checked={h.showJournal}
              onChange={(v) => set("showJournal", v)}
            />
            <TextInput label="Título da chamada" value={h.ctaTitle} onChange={(v) => set("ctaTitle", v)} />
            <TextArea label="Texto da chamada" rows={2} value={h.ctaText} onChange={(v) => set("ctaText", v)} />
          </div>
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
