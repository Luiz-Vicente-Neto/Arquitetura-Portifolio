"use client";

import FileField from "@/components/admin/FileField";
import { Card, PageHeader, SaveBar, TextArea, TextInput } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveSettings } from "@/lib/actions/admin";
import type { Settings } from "@/lib/types";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const { value: s, set, submit, pending, dirty } = useFormState(initial, saveSettings);
  const t = (
    key: keyof Settings,
    label: string,
    extra?: { hint?: string; placeholder?: string; type?: string; className?: string },
  ) => <TextInput label={label} value={s[key]} onChange={(v) => set(key, v)} {...extra} />;

  return (
    <div>
      <PageHeader title="Configurações" description="Identidade, resumo da página inicial, downloads, contato e redes." />
      <div className="space-y-6">
        <Card title="Identidade">
          <div className="grid gap-4 md:grid-cols-2">
            {t("architectName", "Nome exibido no cabeçalho")}
            {t("profession", "Título profissional", { hint: "Aparece sob o nome. Ex.: Arquiteta e Urbanista" })}
            {t("siteName", "Nome do site", { hint: "Usado no título da aba do navegador e no Google." })}
            {t("cau", "Registro profissional", { placeholder: "CAU A000000-0", hint: "Opcional. Aparece no rodapé." })}
          </div>
        </Card>

        <Card title="Resumo" description="Quadro que aparece logo abaixo do título da página inicial.">
          <div className="grid gap-4 md:grid-cols-2">
            {t("education", "Formação", { placeholder: "Arquitetura e Urbanismo — Universidade, ano" })}
            {t("city", "Cidade", { placeholder: "Cidade, UF" })}
            {t("availability", "Disponibilidade", {
              placeholder: "Disponível para vaga júnior a partir de jan/2027",
              hint: "Deixe em branco para ocultar o aviso.",
              className: "md:col-span-2",
            })}
          </div>
        </Card>

        <Card title="Downloads" description="Os botões de PDF só aparecem no site depois que o arquivo for enviado.">
          <div className="grid gap-6 md:grid-cols-2">
            <FileField label="Portfólio em PDF" value={s.portfolioPdf} onChange={(v) => set("portfolioPdf", v)} />
            <FileField label="Currículo em PDF" value={s.cvPdf} onChange={(v) => set("cvPdf", v)} />
          </div>
        </Card>

        <Card title="Contato">
          <div className="grid gap-4 md:grid-cols-2">
            {t("email", "E-mail")}
            {t("phone", "Telefone como aparece no site", { placeholder: "(11) 98765-4321" })}
            {t("whatsapp", "WhatsApp (para o link)", { hint: "Somente números, com DDI e DDD. Ex.: 5511987654321" })}
          </div>
        </Card>

        <Card title="Redes" description="Deixe em branco para ocultar.">
          <div className="grid gap-4 md:grid-cols-2">
            {t("linkedin", "LinkedIn", { placeholder: "https://linkedin.com/in/…" })}
            {t("instagram", "Instagram", { placeholder: "https://instagram.com/…" })}
            {t("behance", "Behance", { placeholder: "https://behance.net/…" })}
          </div>
        </Card>

        <Card title="Google e compartilhamento" description="Texto que aparece nos resultados de busca e ao compartilhar o link.">
          <TextArea label="Descrição" rows={3} value={s.seoDescription} onChange={(v) => set("seoDescription", v)} />
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
