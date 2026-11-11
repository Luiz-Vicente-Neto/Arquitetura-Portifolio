"use server";

import { db } from "../db";
import { uid } from "../utils";

export type ContactValues = Record<"name" | "email" | "phone" | "projectType" | "message", string>;

export interface ContactState {
  ok: boolean;
  error?: string;
  /**
   * Valores enviados. O React 19 limpa o formulário depois de uma action — inclusive quando ela
   * retorna erro —, então devolvemos o que foi digitado para o formulário reaplicar.
   */
  values?: ContactValues;
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Honeypot anti-spam: campo invisível que humanos não preenchem.
  if (get("website")) return { ok: true };

  const name = get("name");
  const email = get("email");
  const message = get("message");
  const values: ContactValues = { name, email, phone: get("phone"), projectType: get("projectType"), message };

  if (!name || !email || !message) {
    return { ok: false, error: "Preencha nome, e-mail e mensagem.", values };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido.", values };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Mensagem muito longa (máximo de 5.000 caracteres).", values };
  }

  try {
    await (await db()).insertMessage({
      id: uid("m"),
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      phone: get("phone").slice(0, 50),
      projectType: get("projectType").slice(0, 100),
      message,
      createdAt: new Date().toISOString(),
      read: false,
    });
  } catch (err) {
    console.error("[contato] falha ao salvar mensagem", err);
    return { ok: false, error: "Não foi possível enviar agora. Tente novamente ou escreva por e-mail.", values };
  }

  return { ok: true };
}
