"use client";

import { useActionState } from "react";
import { login, type ActionResult } from "@/lib/actions/admin";

export default function LoginForm({ showDefault, defaultEmail }: { showDefault: boolean; defaultEmail: string }) {
  // Guarda o e-mail digitado: o React 19 limpa o formulário depois da action, mesmo em caso de erro.
  const [state, action, pending] = useActionState<ActionResult & { email: string; attempt: number }, FormData>(
    async (prev, formData) => ({
      ...(await login(prev, formData)),
      email: String(formData.get("email") ?? ""),
      attempt: prev.attempt + 1,
    }),
    { ok: false, email: showDefault ? defaultEmail : "", attempt: 0 },
  );

  return (
    <form key={state.attempt} action={action} className="mt-10 space-y-4">
      <label className="block">
        <span className="admin-label">E-mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email}
          className="admin-input"
        />
      </label>
      <label className="block">
        <span className="admin-label">Senha</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          autoFocus={state.attempt > 0}
          className="admin-input"
        />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
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
