"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "@/lib/actions/contact";

const SUBJECTS = ["Vaga ou processo seletivo", "Projeto ou freela", "Colaboração ou concurso", "Outro"];

export default function ContactForm() {
  // `attempt` muda a cada envio e serve de `key` do formulário: ele remonta já com os valores
  // devolvidos pela action (o reset automático do React 19 apagaria o que a pessoa digitou).
  const [state, action, pending] = useActionState<ContactState & { attempt: number }, FormData>(
    async (prev, formData) => ({ ...(await sendContactMessage(prev, formData)), attempt: prev.attempt + 1 }),
    { ok: false, attempt: 0 },
  );
  const v = state.values;

  if (state.ok) {
    return (
      <div className="border-t border-ink pt-8" role="status">
        <p className="text-4xl font-medium tracking-[-0.02em]">Mensagem enviada.</p>
        <p className="mt-3 max-w-md text-stone">Obrigada pelo contato. Respondo assim que possível.</p>
      </div>
    );
  }

  return (
    <form key={state.attempt} action={action} className="flex flex-col gap-6">
      <h2 className="text-[1.65rem] font-medium tracking-[-0.01em]">Ou escreva por aqui</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="c-nome" className="label">
            Nome *
          </label>
          <input id="c-nome" name="name" required autoComplete="name" defaultValue={v?.name} className="field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="c-email" className="label">
            E-mail *
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            defaultValue={v?.email}
            className="field"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="c-tel" className="label">
            Telefone
          </label>
          <input id="c-tel" name="phone" type="tel" autoComplete="tel" defaultValue={v?.phone} className="field" />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="c-assunto" className="label">
            Assunto
          </label>
          <select id="c-assunto" name="projectType" defaultValue={v?.projectType || SUBJECTS[0]} className="field">
            {SUBJECTS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="c-msg" className="label">
          Mensagem *
        </label>
        <textarea id="c-msg" name="message" required rows={6} defaultValue={v?.message} className="field resize-y" />
      </div>

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <button type="submit" disabled={pending} className="btn-solid cursor-pointer disabled:opacity-60">
          {pending ? "Enviando…" : "Enviar mensagem →"}
        </button>
      </div>
    </form>
  );
}
