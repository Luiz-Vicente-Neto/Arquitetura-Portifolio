import type { MediaItem } from "./types";

export async function uploadFiles(files: FileList | File[]): Promise<MediaItem[]> {
  const form = new FormData();
  for (const f of Array.from(files)) form.append("file", f);
  const res = await fetch("/api/admin/upload", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Falha no upload.");
  return data.files as MediaItem[];
}

export async function fetchMedia(): Promise<MediaItem[]> {
  const res = await fetch("/api/admin/media", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.media as MediaItem[];
}
