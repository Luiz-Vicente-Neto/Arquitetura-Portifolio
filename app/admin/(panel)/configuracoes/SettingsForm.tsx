"use client";

import { Card, PageHeader, SaveBar, TextArea, TextInput } from "@/components/admin/ui";
import { useFormState } from "@/components/admin/useSave";
import { saveSettings } from "@/lib/actions/admin";
import type { Settings } from "@/lib/types";

export default function SettingsForm({ initial }: { initial: Settings }) {
  const { value: s, set, submit, pending, dirty } = useFormState(initial, saveSettings);
  const t = (key: keyof Settings, label: string, extra?: { hint?: string; placeholder?: string; type?: string; className?: string }) => (
    <TextInput label={label} value={s[key]} onChange={(v) => set(key, v)} {...extra} />
  );

  return (
    <div>
      <PageHeader title="Configurações" description="Identidade, SEO, contato e redes sociais." />
      <div className="space-y-6">
        <Card title="Identidade">
          <div className="grid gap-4 md:grid-cols-2">
            {t("siteName", "Nome do site / escritório")}
            {t("architectName", "Nome exibido no cabeçalho")}
            {t("tagline", "Slogan", { className: "md:col-span-2" })}
            {t("cau", "Registro profissional", { placeholder: "CAU A000000-0" })}
          </div>
        </Card>

        <Card title="SEO" description="Texto que aparece no Google e ao compartilhar o site.">
          <TextArea label="Descrição" rows={3} value={s.seoDescription} onChange={(v) => set("seoDescription", v)} />
        </Card>

        <Card title="Contato">
          <div className="grid gap-4 md:grid-cols-2">
            {t("email", "E-mail", { type: "email" })}
            {t("phone", "Telefone")}
            {t("whatsapp", "WhatsApp", { hint: "Somente números, com DDI e DDD. Ex.: 5511987654321" })}
            {t("officeHours", "Horário de atendimento")}
            {t("address", "Endereço", { className: "md:col-span-2" })}
            {t("city", "Cidade / CEP")}
            {t("mapUrl", "Link do mapa", { placeholder: "https://maps.google.com/…" })}
          </div>
        </Card>

        <Card title="Redes sociais" description="Deixe em branco para ocultar.">
          <div className="grid gap-4 md:grid-cols-2">
            {t("instagram", "Instagram", { placeholder: "https://instagram.com/…" })}
            {t("linkedin", "LinkedIn", { placeholder: "https://linkedin.com/in/…" })}
            {t("pinterest", "Pinterest", { placeholder: "https://pinterest.com/…" })}
            {t("behance", "Behance", { placeholder: "https://behance.net/…" })}
          </div>
        </Card>
      </div>
      <SaveBar onSave={submit} pending={pending} dirty={dirty} />
    </div>
  );
}
