"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "@/lib/actions/admin";

export default function LoginForm({ showDefault, defaultEmail }: { showDefault: boolean; defaultEmail: string }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(login, { ok: false });

  return (
    <form action={action} className="mt-10 space-y-4">
      <label className="block">
        <span className="admin-label">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={showDefault ? defaultEmail : ""}
          className="admin-input"
        />
      </label>
      <label className="block">
        <span className="admin-label">Senha</span>
        <input name="password" type="password" required autoComplete="current-password" className="admin-input" />
      </label>
      {state.error && <p className="text-sm text-red-700">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-ink py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
      {showDefault && (
        <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
          Primeiro acesso: use <strong>{defaultEmail}</strong> e a senha <strong>admin123</strong>. Troque a senha em
          “Minha conta” logo após entrar.
        </p>
      )}
    </form>
  );
}
