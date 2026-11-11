"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactState } from "@/lib/actions/contact";

const TYPES = ["Residencial", "Interiores", "Comercial / Corporativo", "Reforma", "Outro"];

function Field({
  label,
  name,
  type = "text",
  required,
  textarea,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  defaultValue?: string;
}) {
  const cls =
    "peer w-full border-0 border-b border-line bg-transparent px-0 pt-6 pb-2 text-base outline-none transition-colors placeholder-transparent focus:border-ink";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} required={required} rows={5} placeholder={label} className={`${cls} resize-none`} />
      ) : (
        <input name={name} defaultValue={defaultValue} type={type} required={required} placeholder={label} className={cls} />
      )}
      <span className="pointer-events-none absolute top-0 left-0 text-[11px] tracking-[0.14em] text-stone uppercase">
        {label}
        {required && " *"}
      </span>
    </label>
  );
}

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
      <div className="border-t border-ink pt-8">
        <p className="font-display text-4xl">Mensagem enviada.</p>
        <p className="mt-3 max-w-md text-stone">
          Obrigada pelo contato. Retornaremos em até dois dias úteis.
        </p>
      </div>
    );
  }

  return (
    <form key={state.attempt} action={action} className="grid gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Nome" name="name" required defaultValue={v?.name} />
        <Field label="E-mail" name="email" type="email" required defaultValue={v?.email} />
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        <Field label="Telefone" name="phone" type="tel" defaultValue={v?.phone} />
        <label className="block">
          <span className="text-[11px] tracking-[0.14em] text-stone uppercase">Tipo de projeto</span>
          <select
            name="projectType"
            defaultValue={v?.projectType ?? ""}
            className="mt-2 w-full border-0 border-b border-line bg-transparent pb-2 text-base outline-none focus:border-ink"
          >
            <option value="" disabled>
              Selecione
            </option>
            {TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <Field label="Conte sobre o projeto" name="message" required textarea defaultValue={v?.message} />

      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="group inline-flex items-center gap-3 bg-ink px-7 py-4 text-sm text-paper transition-opacity disabled:opacity-60"
        >
          {pending ? "Enviando…" : "Enviar mensagem"}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </form>
  );
}
