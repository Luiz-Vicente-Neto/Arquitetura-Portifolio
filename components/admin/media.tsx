"use client";

import { useEffect, useRef, useState } from "react";
import type { GalleryImage, MediaItem } from "@/lib/types";
import { fetchMedia, uploadFiles } from "@/lib/upload-client";
import { cx, img, uid } from "@/lib/utils";
import { Button, useToast } from "./ui";

/* ---------- Modal de biblioteca de mídia ---------- */

export function MediaPicker({
  open,
  multiple,
  onClose,
  onSelect,
}: {
  open: boolean;
  multiple?: boolean;
  onClose: () => void;
  onSelect: (urls: string[]) => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setSelected([]);
    setUrl("");
    fetchMedia().then(setItems);
  }, [open]);

  if (!open) return null;

  const toggle = (u: string) =>
    setSelected((s) => (s.includes(u) ? s.filter((x) => x !== u) : multiple ? [...s, u] : [u]));

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    try {
      const saved = await uploadFiles(files);
      setItems((prev) => [...saved, ...prev]);
      setSelected((s) => (multiple ? [...s, ...saved.map((m) => m.url)] : [saved[0].url]));
      toast(`${saved.length} arquivo(s) enviado(s)`);
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  const confirm = () => {
    const urls = [...selected];
    if (url.trim()) urls.push(url.trim());
    if (urls.length) onSelect(urls);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Biblioteca de mídia"
      >
        <div className="flex items-center justify-between border-b border-[#e4e1db] px-5 py-4">
          <h2 className="font-semibold">Biblioteca de mídia</h2>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => onUpload(e.target.files)}
            />
            <Button variant="secondary" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? "Enviando…" : "Enviar arquivos"}
            </Button>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto p-5"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onUpload(e.dataTransfer.files);
          }}
        >
          {items.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-[#d6d3cd] py-16 text-center text-sm text-[#6b675f]">
              Nenhum arquivo ainda. Arraste imagens para cá ou clique em “Enviar arquivos”.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {items
                .filter((m) => m.type.startsWith("image/"))
                .map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggle(m.url)}
                    className={cx(
                      "relative aspect-square overflow-hidden rounded-lg bg-[#f0eee9] ring-2 ring-offset-2 transition",
                      selected.includes(m.url) ? "ring-ink" : "ring-transparent hover:ring-[#d6d3cd]",
                    )}
                  >
                    <img src={m.url} alt={m.name} className="h-full w-full object-cover" />
                    {selected.includes(m.url) && (
                      <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-[11px] text-white">
                        {multiple ? selected.indexOf(m.url) + 1 : "✓"}
                      </span>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-[#e4e1db] px-5 py-4 md:flex-row md:items-center">
          <input
            className="admin-input md:flex-1"
            placeholder="…ou cole a URL de uma imagem externa"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={confirm} disabled={!selected.length && !url.trim()}>
              {multiple && selected.length > 1 ? `Inserir ${selected.length} imagens` : "Inserir"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Campo de imagem única ---------- */

export function ImageField({
  label,
  value,
  onChange,
  aspect = "aspect-[16/10]",
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspect?: string;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <span className="admin-label">{label}</span>
      <div className={cx("group relative overflow-hidden rounded-lg border border-[#e4e1db] bg-[#f0eee9]", aspect)}>
        {value ? (
          <img src={img(value, 900)} alt="" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-sm text-[#6b675f] hover:bg-[#ebe8e2]"
          >
            <span className="text-2xl leading-none">+</span>
            Escolher imagem
          </button>
        )}
        {value && (
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent p-2 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
            <Button variant="secondary" className="!py-1 text-xs" onClick={() => setOpen(true)}>
              Trocar
            </Button>
            <Button variant="secondary" className="!py-1 text-xs" onClick={() => onChange("")}>
              Remover
            </Button>
          </div>
        )}
      </div>
      {hint && <span className="mt-1 block text-xs text-[#8a867e]">{hint}</span>}
      <MediaPicker open={open} onClose={() => setOpen(false)} onSelect={(urls) => onChange(urls[0])} />
    </div>
  );
}

/* ---------- Editor de galeria ---------- */

export function GalleryEditor({
  value,
  onChange,
}: {
  value: GalleryImage[];
  onChange: (v: GalleryImage[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const update = (i: number, patch: Partial<GalleryImage>) =>
    onChange(value.map((im, idx) => (idx === i ? { ...im, ...patch } : im)));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  return (
    <div>
      {value.length === 0 && (
        <p className="mb-4 rounded-lg border-2 border-dashed border-[#d6d3cd] py-10 text-center text-sm text-[#6b675f]">
          Nenhuma imagem na galeria.
        </p>
      )}
      <ul className="space-y-2">
        {value.map((im, i) => (
          <li
            key={im.id}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            className={cx(
              "flex flex-col gap-3 rounded-lg border border-[#e4e1db] bg-white p-2 sm:flex-row sm:items-center",
              dragIndex === i && "opacity-50",
            )}
          >
            <span className="hidden cursor-grab px-1 text-[#a7a39b] select-none sm:block" title="Arraste para reordenar">
              ⋮⋮
            </span>
            <img src={img(im.url, 300)} alt="" className="h-16 w-24 shrink-0 rounded object-cover" />
            <input
              className="admin-input sm:flex-1"
              placeholder="Legenda"
              value={im.caption}
              onChange={(e) => update(i, { caption: e.target.value })}
            />
            <select
              className="admin-input sm:!w-40"
              value={im.layout}
              onChange={(e) => update(i, { layout: e.target.value as GalleryImage["layout"] })}
              title="Layout no site"
            >
              <option value="full">Largura total</option>
              <option value="half">Meia largura</option>
            </select>
            <div className="flex shrink-0 gap-1">
              <Button variant="ghost" className="!px-2" onClick={() => move(i, i - 1)} aria-label="Subir">
                ↑
              </Button>
              <Button variant="ghost" className="!px-2" onClick={() => move(i, i + 1)} aria-label="Descer">
                ↓
              </Button>
              <Button
                variant="danger"
                className="!px-2"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remover"
              >
                ✕
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <Button variant="secondary" className="mt-3" onClick={() => setOpen(true)}>
        + Adicionar imagens
      </Button>
      <p className="mt-2 text-xs text-[#8a867e]">
        Imagens em “meia largura” consecutivas aparecem lado a lado no site. Arraste para reordenar.
      </p>
      <MediaPicker
        open={open}
        multiple
        onClose={() => setOpen(false)}
        onSelect={(urls) =>
          onChange([...value, ...urls.map((url) => ({ id: uid("g"), url, caption: "", layout: "full" as const }))])
        }
      />
    </div>
  );
}
