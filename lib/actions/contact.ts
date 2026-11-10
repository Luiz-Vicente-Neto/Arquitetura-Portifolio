"use server";

import { updateDb } from "../db";
import { uid } from "../utils";

export interface ContactState {
  ok: boolean;
  error?: string;
}

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Honeypot anti-spam: campo invisível que humanos não preenchem.
  if (get("website")) return { ok: true };

  const name = get("name");
  const email = get("email");
  const message = get("message");

  if (!name || !email || !message) {
    return { ok: false, error: "Preencha nome, e-mail e mensagem." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Informe um e-mail válido." };
  }
  if (message.length > 5000) {
    return { ok: false, error: "Mensagem muito longa." };
  }

  updateDb((db) => {
    db.messages.unshift({
      id: uid("m"),
      name: name.slice(0, 200),
      email: email.slice(0, 200),
      phone: get("phone").slice(0, 50),
      projectType: get("projectType").slice(0, 100),
      message,
      createdAt: new Date().toISOString(),
      read: false,
    });
  });

  return { ok: true };
}
