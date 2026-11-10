import fs from "node:fs";
import path from "node:path";
import { UPLOADS_DIR } from "@/lib/db";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
};

export async function GET(_request: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const params = await ctx.params;
  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const name = path.basename(segments.join("/"));
  const file = path.join(UPLOADS_DIR, name);

  if (!file.startsWith(UPLOADS_DIR) || !fs.existsSync(file)) {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(name).toLowerCase();
  const headers: Record<string, string> = {
    "Content-Type": TYPES[ext] ?? "application/octet-stream",
    "Cache-Control": "public, max-age=31536000, immutable",
  };
  if (ext === ".svg") headers["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'";

  return new Response(fs.readFileSync(file), { headers });
}
