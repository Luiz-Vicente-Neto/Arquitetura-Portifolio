"use client";

import Link from "next/link";
import { Card, PageHeader, SaveBar, TextArea, TextInput } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveHome } from "@/lib/actions/admin";
import type { HomeContent } from "@/lib/types";

export default function HomeForm({ initial }: { initial: HomeContent }) {
  const { value: h, set, submit, pending, dirty } = useFormState(initial, saveHome);

  return (
    <div>
      <PageHeader
        title="Página inicial"
        description="Apresentação, quadro de resumo, projeto de capa e lista de projetos."
        actions={
          <a href="/" target="_blank" rel="noreferrer" className="text-sm text-[#6b675f] hover:text-ink">
            Ver página ↗
          </a>
        }
      />
      <div className="space-y-6">
        <Card title="Apresentação">
          <div className="grid gap-4">
            <TextInput
              label="Linha de abertura"
              value={h.eyebrow}
              onChange={(v) => set("eyebrow", v)}
              placeholder="Portfólio 2026 · Cidade, UF"
              hint="Texto pequeno acima do título. Opcional."
            />
            <TextArea
              label="Título"
              rows={3}
              value={h.heroTitle}
              onChange={(v) => set("heroTitle", v)}
              hint="Uma ou duas frases: quem você é e o que este portfólio reúne."
            />
          </div>
        </Card>

        <Card title="Chamada do rodapé" description="Aparece no fim de todas as páginas, com o botão “Entrar em contato”.">
          <TextInput label="Texto" value={h.ctaTitle} onChange={(v) => set("ctaTitle", v)} hint="Deixe em branco para ocultar." />
        </Card>

        <Card title="O restante da página vem de outros lugares">
          <ul className="space-y-2 text-sm text-[#4a4740]">
            <li>
              <strong className="font-medium">Quadro de resumo</strong> (formação, disponibilidade, contato, downloads):{" "}
              <Link href="/admin/configuracoes" className="underline">
                Configurações
              </Link>
              .
            </li>
            <li>
              <strong className="font-medium">Projeto de capa e lista:</strong> o primeiro projeto marcado como “Capa” abre a
              página; os demais aparecem na ordem definida em{" "}
              <Link href="/admin/projetos" className="underline">
                Projetos
              </Link>
              .
            </li>
            <li>
              <strong className="font-medium">Bloco “Sobre”:</strong> usa o retrato e o primeiro parágrafo de{" "}
              <Link href="/admin/paginas/sobre" className="underline">
                Sobre e currículo
              </Link>
              .
            </li>
          </ul>
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
