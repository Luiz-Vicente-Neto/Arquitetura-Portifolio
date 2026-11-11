import crypto from "node:crypto";
import path from "node:path";
import { db } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/auth";
import { saveFile } from "@/lib/files";
import type { MediaItem } from "@/lib/types";

const MAX_BYTES = 15 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
  "application/pdf": ".pdf",
};

function safeBase(name: string) {
  return (
    path
      .parse(name)
      .name.normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "arquivo"
  );
}

export async function POST(request: Request) {
  if (!(await isAuthorizedRequest(request))) {
    return Response.json({ error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Envio inválido." }, { status: 400 });
  }
  const files = form.getAll("file").filter((f): f is File => typeof f !== "string");
  if (files.length === 0) return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  // Valida todos antes de gravar qualquer um.
  for (const file of files) {
    if (!ALLOWED[file.type]) {
      return Response.json({ error: `Formato não suportado: ${file.name}` }, { status: 415 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: `${file.name} excede 15 MB.` }, { status: 413 });
    }
  }

  const saved: MediaItem[] = [];
  try {
    for (const file of files) {
      const filename = `${safeBase(file.name)}-${crypto.randomBytes(4).toString("hex")}${ALLOWED[file.type]}`;
      const stored = await saveFile(filename, Buffer.from(await file.arrayBuffer()), file.type);
      saved.push({
        id: crypto.randomUUID(),
        url: stored.url,
        storagePath: stored.storagePath,
        name: file.name.slice(0, 200),
        size: file.size,
        type: file.type,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error("[upload]", err);
    return Response.json({ error: (err as Error).message || "Falha ao salvar o arquivo." }, { status: 500 });
  }

  await (await db()).insertMedia(saved);
  return Response.json({ files: saved });
}
