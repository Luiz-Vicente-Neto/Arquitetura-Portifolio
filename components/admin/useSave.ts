"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import type { ActionResult } from "@/lib/actions/admin";
import { useToast } from "./ui";

/**
 * Estado de formulário com controle de "sujo", salvamento via server action,
 * toast de feedback, atalho Ctrl/Cmd+S e aviso ao sair com alterações pendentes.
 */
export function useFormState<T>(initial: T, save: (v: T) => Promise<ActionResult>, opts?: { onSaved?: (r: ActionResult) => void }) {
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(initial));
  const [pending, start] = useTransition();
  const toast = useToast();
  const router = useRouter();
  const dirty = JSON.stringify(value) !== saved;

  const valueRef = useRef(value);
  valueRef.current = value;

  const submit = () =>
    start(async () => {
      const current = valueRef.current;
      let res: ActionResult;
      try {
        res = await save(current);
      } catch (err) {
        // redirect() do Next (ex.: sessão expirada) também chega aqui e precisa seguir adiante.
        if (err && typeof err === "object" && "digest" in err && String(err.digest).startsWith("NEXT_REDIRECT")) throw err;
        console.error(err);
        toast("Erro de conexão ao salvar. Verifique sua internet e tente de novo.", "error");
        return;
      }
      if (res.ok) {
        if (res.data !== undefined) {
          // O servidor pode normalizar valores (ex.: WhatsApp só com dígitos): exibe o que ficou salvo,
          // a menos que a pessoa tenha continuado editando durante o salvamento.
          if (valueRef.current === current) setValue(res.data as T);
          setSaved(JSON.stringify(res.data));
        } else {
          setSaved(JSON.stringify(current));
        }
        toast("Alterações salvas");
        opts?.onSaved?.(res);
        router.refresh();
      } else {
        toast(res.error ?? "Não foi possível salvar.", "error");
      }
    });

  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        submitRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [dirty]);

  const set = <K extends keyof T>(key: K, v: T[K]) => setValue((prev) => ({ ...prev, [key]: v }));

  return { value, setValue, set, submit, pending, dirty };
}
