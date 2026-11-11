"use client";

import { useRef, useState } from "react";
import { uploadFiles } from "@/lib/upload-client";
import { Button, useToast } from "./ui";

/** Campo para um arquivo PDF (portfólio, currículo, caderno do projeto): envia ou cola um link. */
export default function FileField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const [saved] = await uploadFiles([files[0]]);
      onChange(saved.url);
      toast("Arquivo enviado — salve para aplicar");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div>
      <span className="admin-label">{label}</span>
      <div className="flex flex-col gap-2">
        <input
          className="admin-input"
          placeholder="Envie um PDF ou cole um link (https://…)"
          aria-label={`${label} — link`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <input ref={ref} type="file" accept="application/pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
          <Button variant="secondary" onClick={() => ref.current?.click()} disabled={busy}>
            {busy ? "Enviando…" : value ? "Trocar PDF" : "Enviar PDF"}
          </Button>
          {value && (
            <>
              <a href={value} target="_blank" rel="noreferrer" className="px-2 text-sm text-[#4a4740] underline">
                Abrir ↗
              </a>
              <Button variant="danger" onClick={() => onChange("")}>
                Remover
              </Button>
            </>
          )}
        </div>
      </div>
      <span className="mt-1 block text-xs text-[#8a867e]">{hint ?? "PDF de até 15 MB."}</span>
    </div>
  );
}
