"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button, PageHeader, useToast } from "@/components/admin/ui";
import { deleteMedia } from "@/lib/actions/admin";
import type { MediaItem } from "@/lib/types";
import { uploadFiles } from "@/lib/upload-client";
import { cx, formatBytes, formatShortDate } from "@/lib/utils";

export default function MediaLibrary({
  items,
  storage,
  usage,
}: {
  items: MediaItem[];
  storage: "supabase" | "local";
  usage: Record<string, string[]>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [, start] = useTransition();
  const router = useRouter();
  const toast = useToast();

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const saved = await uploadFiles(files);
      toast(`${saved.length} arquivo(s) enviado(s)`);
      router.refresh();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(new URL(url, window.location.origin).toString());
    toast("Link copiado");
  };

  return (
    <div className="pb-16">
      <PageHeader
        title="Mídia"
        description={`Imagens e PDFs enviados (JPG, PNG, WebP, AVIF, GIF, SVG e PDF — até 15 MB). Armazenamento: ${
          storage === "supabase" ? "Supabase Storage" : "disco local do servidor"
        }.`}
        actions={
          <>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => upload(e.target.files)} />
            <Button onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? "Enviando…" : "+ Enviar arquivos"}
            </Button>
          </>
        }
      />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={cx(
          "rounded-xl border-2 border-dashed p-4 transition-colors",
          dragging ? "border-ink bg-white" : "border-[#d6d3cd]",
        )}
      >
        {items.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#6b675f]">Arraste arquivos para cá para enviar.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {items.map((m) => (
              <li key={m.id} className="group overflow-hidden rounded-lg border border-[#e4e1db] bg-white">
                <div className="aspect-square bg-[#f0eee9]">
                  {m.type.startsWith("image/") ? (
                    <img src={m.url} alt={m.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <a href={m.url} target="_blank" rel="noreferrer" className="flex h-full items-center justify-center text-sm font-medium text-[#6b675f]">
                      PDF
                    </a>
                  )}
                </div>
                <div className="p-2.5">
                  <p className="truncate text-xs font-medium" title={m.name}>
                    {m.name}
                  </p>
                  <p className="text-[11px] text-[#8a867e]">
                    {formatBytes(m.size)} · {formatShortDate(m.createdAt)}
                  </p>
                  {usage[m.url]?.length ? (
                    <p className="mt-1 truncate text-[11px] text-emerald-700" title={usage[m.url].join("\n")}>
                      Em uso: {usage[m.url].length === 1 ? usage[m.url][0] : `${usage[m.url].length} lugares`}
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-[#a7a39b]">Não utilizado</p>
                  )}
                  <div className="mt-2 flex gap-1">
                    <Button variant="secondary" className="!px-2 !py-1 text-xs" onClick={() => copy(m.url)}>
                      Copiar link
                    </Button>
                    <Button
                      variant="danger"
                      className="!px-2 !py-1 text-xs"
                      onClick={() => {
                        const used = usage[m.url] ?? [];
                        const msg = used.length
                          ? `“${m.name}” está em uso em:\n\n• ${used.join("\n• ")}\n\nSe excluir, a imagem deixará de aparecer nesses lugares. Excluir mesmo assim?`
                          : `Excluir “${m.name}”? Essa ação não pode ser desfeita.`;
                        if (!confirm(msg)) return;
                        start(async () => {
                          const res = await deleteMedia(m.id);
                          toast(res.ok ? "Arquivo excluído" : (res.error ?? "Erro ao excluir"), res.ok ? "ok" : "error");
                          router.refresh();
                        });
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
