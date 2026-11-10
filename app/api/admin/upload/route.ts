import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { UPLOADS_DIR, updateDb } from "@/lib/db";
import { isAuthorizedRequest } from "@/lib/auth";
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

export async function POST(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Não autorizado." }, { status: 401 });
  }

  const form = await request.formData();
  const files = form.getAll("file").filter((f): f is File => typeof f !== "string");
  if (files.length === 0) return Response.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const saved: MediaItem[] = [];

  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) return Response.json({ error: `Tipo não suportado: ${file.type || file.name}` }, { status: 415 });
    if (file.size > MAX_BYTES) return Response.json({ error: `${file.name} excede 15 MB.` }, { status: 413 });

    const base =
      path
        .parse(file.name)
        .name.normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 50) || "arquivo";
    const filename = `${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(await file.arrayBuffer()));

    saved.push({
      id: crypto.randomUUID(),
      url: `/uploads/${filename}`,
      name: file.name,
      size: file.size,
      type: file.type,
      createdAt: new Date().toISOString(),
    });
  }

  updateDb((db) => {
    db.media.unshift(...saved);
  });

  return Response.json({ files: saved });
}
