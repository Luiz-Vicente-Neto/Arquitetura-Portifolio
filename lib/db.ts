import "server-only";
import crypto from "node:crypto";
import path from "node:path";
import { JsonStore } from "./data/json-store";
import { PgStore } from "./data/pg-store";
import type { Store } from "./data/store";
import { normalizeAbout, normalizeHome, normalizeSettings } from "./normalize";
import { createSeed } from "./seed";
import type { AboutContent, AdminUser, HomeContent, Settings } from "./types";

/**
 * Ponto único de acesso aos dados.
 *
 * - Com DATABASE_URL definida → PostgreSQL (ex.: Supabase).
 * - Sem DATABASE_URL         → arquivo JSON em storage/content.json.
 *
 * Na primeira chamada de cada processo as tabelas são criadas (idempotente) e, se o banco
 * estiver vazio, o conteúdo inicial é inserido.
 */

export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage"));
export const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

export const DEFAULT_ADMIN_PASSWORD = "admin123";

function createStore(): Store {
  const url = process.env.DATABASE_URL?.trim();
  if (url) return PgStore.connect(url);
  return new JsonStore(path.join(STORAGE_DIR, "content.json"));
}

const g = globalThis as unknown as { __arqStore?: Store; __arqReady?: Promise<Store> };

export async function db(): Promise<Store> {
  const store = await ready();
  // No modo arquivo, se o content.json for apagado com o servidor rodando, recria o conteúdo inicial.
  if (store.kind === "json" && (await store.isEmpty())) {
    g.__arqReady = undefined;
    return ready();
  }
  return store;
}

function ready(): Promise<Store> {
  if (!g.__arqReady) {
    g.__arqReady = (async () => {
      const store = (g.__arqStore ??= createStore());
      await store.migrate();
      if (await store.isEmpty()) {
        const secret = process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString("hex");
        const { hash, salt } = hashPassword(DEFAULT_ADMIN_PASSWORD);
        await store.seed(createSeed(secret, hash, salt));
      }
      return store;
    })().catch((err) => {
      // Permite nova tentativa na próxima requisição (ex.: banco ainda subindo).
      g.__arqReady = undefined;
      throw err;
    });
  }
  return g.__arqReady;
}

async function required<T>(value: Promise<T | null>, what: string): Promise<T> {
  const v = await value;
  if (v == null) throw new Error(`Conteúdo "${what}" ausente no banco de dados.`);
  return v;
}

type Loose = Record<string, unknown>;

/* ---------- Conteúdo ---------- */

export async function getSettings(): Promise<Settings> {
  return normalizeSettings((await required((await db()).getContent("settings"), "settings")) as unknown as Loose);
}
export async function getHome(): Promise<HomeContent> {
  return normalizeHome((await required((await db()).getContent("home"), "home")) as unknown as Loose);
}
export async function getAbout(): Promise<AboutContent> {
  return normalizeAbout((await required((await db()).getContent("about"), "about")) as unknown as Loose);
}
export async function getUser(): Promise<AdminUser> {
  return required((await db()).getContent("user"), "user");
}
export async function getSecret(): Promise<string> {
  return process.env.SESSION_SECRET || (await required((await db()).getContent("secret"), "secret"));
}

/* ---------- Consultas públicas ---------- */

export async function getCategories() {
  return (await db()).listCategories();
}

export async function getPublishedProjects() {
  return (await (await db()).listProjects()).filter((p) => p.published);
}

export async function getProjectBySlug(slug: string) {
  return (await db()).getProject({ slug });
}
