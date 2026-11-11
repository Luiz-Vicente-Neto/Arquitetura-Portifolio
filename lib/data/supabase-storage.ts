/**
 * Configuração e criação do bucket do Supabase Storage.
 * Sem "server-only" para poder ser usado também pelo script `npm run db:setup`.
 */

export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
  "application/pdf",
];

export function supabaseStorageConfig() {
  const url = process.env.SUPABASE_URL?.trim().replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return { url, key, bucket: process.env.SUPABASE_STORAGE_BUCKET?.trim() || "media" };
}

export function storageHeaders(key: string, extra: Record<string, string> = {}) {
  return { Authorization: `Bearer ${key}`, apikey: key, ...extra };
}

/** Cria o bucket público se ainda não existir. */
export async function ensureBucket(): Promise<"created" | "exists" | "skipped"> {
  const sb = supabaseStorageConfig();
  if (!sb) return "skipped";
  const headers = storageHeaders(sb.key, { "Content-Type": "application/json" });
  const get = await fetch(`${sb.url}/storage/v1/bucket/${sb.bucket}`, { headers });
  if (get.ok) return "exists";
  const res = await fetch(`${sb.url}/storage/v1/bucket`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      id: sb.bucket,
      name: sb.bucket,
      public: true,
      file_size_limit: 15 * 1024 * 1024,
      allowed_mime_types: ALLOWED_UPLOAD_TYPES,
    }),
  });
  if (!res.ok) throw new Error(`Não foi possível criar o bucket "${sb.bucket}" (${res.status}): ${await res.text()}`);
  return "created";
}
