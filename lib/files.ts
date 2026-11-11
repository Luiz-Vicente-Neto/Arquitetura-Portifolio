import "server-only";
import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "./db";
import { storageHeaders, supabaseStorageConfig } from "./data/supabase-storage";

/**
 * Armazenamento dos arquivos enviados pelo CMS.
 *
 * - Com SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → Supabase Storage (bucket público).
 * - Caso contrário → disco local em storage/uploads, servido pela rota /uploads/[...path].
 */

export interface StoredFile {
  url: string;
  storagePath: string;
}

export function fileStorageKind(): "supabase" | "local" {
  return supabaseStorageConfig() ? "supabase" : "local";
}

export async function saveFile(filename: string, body: Buffer, contentType: string): Promise<StoredFile> {
  const sb = supabaseStorageConfig();
  if (!sb) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), body);
    return { url: `/uploads/${filename}`, storagePath: filename };
  }

  const objectPath = `uploads/${filename}`;
  const res = await fetch(`${sb.url}/storage/v1/object/${sb.bucket}/${objectPath}`, {
    method: "POST",
    headers: storageHeaders(sb.key, {
      "Content-Type": contentType,
      "Cache-Control": "max-age=31536000",
      "x-upsert": "false",
    }),
    body: new Uint8Array(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Falha ao enviar para o Supabase Storage (${res.status}). ${detail.slice(0, 200)}`);
  }
  return {
    url: `${sb.url}/storage/v1/object/public/${sb.bucket}/${objectPath}`,
    storagePath: objectPath,
  };
}

export async function deleteFile(storagePath: string): Promise<void> {
  if (!storagePath) return;
  const sb = supabaseStorageConfig();
  if (!sb) {
    fs.rmSync(path.join(UPLOADS_DIR, path.basename(storagePath)), { force: true });
    return;
  }
  const res = await fetch(`${sb.url}/storage/v1/object/${sb.bucket}`, {
    method: "DELETE",
    headers: storageHeaders(sb.key, { "Content-Type": "application/json" }),
    body: JSON.stringify({ prefixes: [storagePath] }),
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`Falha ao excluir do Supabase Storage (${res.status}).`);
  }
}
