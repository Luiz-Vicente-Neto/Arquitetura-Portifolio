import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { Database } from "./types";
import { createSeed } from "./seed";

/**
 * Armazenamento simples em arquivo JSON.
 * Todo o conteúdo do CMS vive em storage/content.json e os uploads em storage/uploads.
 * A interface (readDb / updateDb) isola o resto da aplicação do formato de armazenamento,
 * então trocar por SQLite, Postgres ou D1 depois exige mudar apenas este arquivo.
 */

export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage"));
export const UPLOADS_DIR = path.join(STORAGE_DIR, "uploads");
const DB_FILE = path.join(STORAGE_DIR, "content.json");

let cache: { mtimeMs: number; data: Database } | null = null;

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { hash, salt };
}

function ensureStorage() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const secret = process.env.SESSION_SECRET ?? crypto.randomBytes(32).toString("hex");
    const { hash, salt } = hashPassword("admin123");
    writeFileAtomic(DB_FILE, JSON.stringify(createSeed(secret, hash, salt), null, 2));
  }
}

function writeFileAtomic(file: string, contents: string) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, contents, "utf8");
  try {
    fs.renameSync(tmp, file);
  } catch {
    // No Windows o rename pode falhar se outro processo estiver lendo; tenta sobrescrever direto.
    fs.writeFileSync(file, contents, "utf8");
    fs.rmSync(tmp, { force: true });
  }
}

export function readDb(): Database {
  ensureStorage();
  const stat = fs.statSync(DB_FILE);
  if (cache && cache.mtimeMs === stat.mtimeMs) return cache.data;
  const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as Database;
  cache = { mtimeMs: stat.mtimeMs, data };
  return data;
}

/** Aplica uma mutação ao banco e persiste. Retorna o valor devolvido pelo mutator. */
export function updateDb<T>(mutator: (db: Database) => T): T {
  const current = readDb();
  const draft = structuredClone(current);
  const result = mutator(draft);
  writeFileAtomic(DB_FILE, JSON.stringify(draft, null, 2));
  cache = null;
  return result;
}

/* ---------- Consultas públicas ---------- */

export function getSettings() {
  return readDb().settings;
}

export function getCategories() {
  return readDb().categories;
}

export function getPublishedProjects() {
  return readDb()
    .projects.filter((p) => p.published)
    .sort((a, b) => a.order - b.order);
}

export function getProjectBySlug(slug: string) {
  return readDb().projects.find((p) => p.slug === slug);
}

export function getPublishedPosts() {
  return readDb()
    .posts.filter((p) => p.published)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPostBySlug(slug: string) {
  return readDb().posts.find((p) => p.slug === slug);
}
