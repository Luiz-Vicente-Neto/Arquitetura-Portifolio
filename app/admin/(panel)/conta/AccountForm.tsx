"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button, Card, PageHeader, TextInput, useToast } from "@/components/admin/ui";
import { updateAccount } from "@/lib/actions/admin";

export default function AccountForm({ name, email, isDefault }: { name: string; email: string; isDefault: boolean }) {
  const [form, setForm] = useState({ name, email, currentPassword: "", newPassword: "", confirm: "" });
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    if (form.newPassword && form.newPassword !== form.confirm) {
      toast("A confirmação não confere com a nova senha.", "error");
      return;
    }
    start(async () => {
      const res = await updateAccount(form);
      if (res.ok) {
        toast("Conta atualizada");
        setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirm: "" }));
        router.refresh();
      } else toast(res.error ?? "Erro ao salvar", "error");
    });
  };

  return (
    <div className="max-w-2xl pb-16">
      <PageHeader title="Minha conta" description="Dados de acesso ao painel." />
      {isDefault && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Você está usando a senha padrão <strong>admin123</strong>. Defina uma nova senha abaixo.
        </p>
      )}
      <div className="space-y-6">
        <Card title="Perfil">
          <div className="grid gap-4">
            <TextInput label="Nome" value={form.name} onChange={set("name")} />
            <TextInput label="E-mail de acesso" type="email" value={form.email} onChange={set("email")} />
          </div>
        </Card>
        <Card title="Senha" description="Deixe a nova senha em branco para manter a atual.">
          <div className="grid gap-4">
            <TextInput
              label="Senha atual (obrigatória para salvar)"
              type="password"
              autoComplete="current-password"
              value={form.currentPassword}
              onChange={set("currentPassword")}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput
                label="Nova senha"
                type="password"
                autoComplete="new-password"
                value={form.newPassword}
                onChange={set("newPassword")}
                hint="Mínimo de 8 caracteres."
              />
              <TextInput
                label="Confirmar nova senha"
                type="password"
                autoComplete="new-password"
                value={form.confirm}
                onChange={set("confirm")}
              />
            </div>
          </div>
        </Card>
        <div className="flex justify-end">
          <Button onClick={save} disabled={pending || !form.currentPassword}>
            {pending ? "Salvando…" : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
