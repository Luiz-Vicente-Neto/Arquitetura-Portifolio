/**
 * Prepara o banco PostgreSQL (ex.: Supabase) para o CMS.
 *
 *   npm run db:setup            cria as tabelas, popula com o conteúdo inicial (se vazio)
 *                               e cria o bucket do Supabase Storage (se configurado)
 *   npm run db:setup -- --import-json
 *                               além disso, copia o conteúdo de storage/content.json
 *                               (útil para migrar o que já foi cadastrado localmente)
 *   npm run db:schema           apenas imprime o SQL (para colar no SQL Editor do Supabase)
 *
 * Lê DATABASE_URL (e SUPABASE_*) de .env.local / .env, como o servidor faz.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { PgStore } from "../lib/data/pg-store";
import { SCHEMA_SQL } from "../lib/data/schema";
import { ensureBucket } from "../lib/data/supabase-storage";
import { normalizeProject } from "../lib/normalize";
import { createSeed } from "../lib/seed";
import type { Database } from "../lib/types";

const args = new Set(process.argv.slice(2));

if (args.has("--print")) {
  process.stdout.write(`-- Gerado por: npm run db:schema\n${SCHEMA_SQL.trim()}\n`);
  process.exit(0);
}

async function loadEnv() {
  try {
    // Mesmo carregador (e mesmas regras, inclusive expansão de $VAR) usado pelo vinext.
    const mod = (await import("vinext/internal/config/dotenv")) as {
      loadDotenv: (o: { root: string; mode: string }) => { loadedFiles: string[] };
    };
    const { loadedFiles } = mod.loadDotenv({ root: process.cwd(), mode: process.env.NODE_ENV ?? "development" });
    if (loadedFiles.length) console.log(`• Variáveis carregadas de: ${loadedFiles.join(", ")}`);
  } catch {
    for (const f of [".env.local", ".env"]) {
      if (fs.existsSync(f)) process.loadEnvFile(f);
    }
  }
}

function log(step: string) {
  console.log(`• ${step}`);
}

async function main() {
  await loadEnv();
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("✖ DATABASE_URL não definida. Copie .env.example para .env.local e preencha a conexão do Supabase.");
    process.exit(1);
  }

  const host = (() => {
    try {
      return new URL(url).host;
    } catch {
      return "(URL inválida)";
    }
  })();
  log(`Conectando em ${host}…`);
  const store = PgStore.connect(url);

  await store.migrate();
  log("Tabelas criadas/atualizadas.");

  if (args.has("--import-json")) {
    const file = path.resolve(process.env.STORAGE_DIR ?? "storage", "content.json");
    if (!fs.existsSync(file)) throw new Error(`Arquivo não encontrado: ${file}`);
    if (!(await store.isEmpty())) {
      throw new Error("O banco já tem conteúdo. A importação só é feita em banco vazio, para não sobrescrever dados.");
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8")) as Database;
    // Conteúdo gravado por versões anteriores ganha os campos atuais.
    data.projects = data.projects.map((p) => normalizeProject(p as unknown as Record<string, unknown>));
    for (const m of data.media) m.storagePath ??= path.basename(m.url);
    await store.seed(data);
    log(`Conteúdo importado de ${path.relative(process.cwd(), file)}.`);
    if (data.media.some((m) => m.url.startsWith("/uploads/"))) {
      console.warn(
        "⚠ Há arquivos em storage/uploads referenciados localmente. Eles continuam no disco; " +
          "se o servidor de produção não tiver esses arquivos, reenvie-os pelo CMS.",
      );
    }
  } else if (await store.isEmpty()) {
    const secret = process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString("hex");
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = crypto.scryptSync("admin123", salt, 64).toString("hex");
    await store.seed(createSeed(secret, hash, salt));
    log("Banco vazio: conteúdo inicial inserido (login admin@studio.com / admin123).");
  } else {
    log("Banco já possui conteúdo — nada foi sobrescrito.");
  }

  const bucket = await ensureBucket();
  if (bucket === "skipped") {
    log("Supabase Storage não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY): uploads irão para o disco local.");
  } else {
    log(`Bucket "${process.env.SUPABASE_STORAGE_BUCKET || "media"}" ${bucket === "created" ? "criado" : "já existe"}.`);
  }

  console.log("✔ Pronto.");
}

main()
  .catch((err) => {
    console.error(`✖ ${(err as Error).message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    const g = globalThis as unknown as { __arqSql?: { end: (o?: { timeout?: number }) => Promise<void> } };
    await g.__arqSql?.end({ timeout: 5 });
  });
