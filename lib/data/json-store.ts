import fs from "node:fs";
import path from "node:path";
import { normalizeProject } from "../normalize";
import type { Database, Post, Project } from "../types";
import type { ContentKey, ContentMap, Store } from "./store";

/**
 * Armazenamento em arquivo JSON único. Ideal para desenvolvimento e servidores com disco persistente.
 * As operações de leitura-modificação-escrita são síncronas, então não há corrida dentro de um processo.
 */
export class JsonStore implements Store {
  readonly kind = "json" as const;
  private cache: { mtimeMs: number; data: Database } | null = null;

  constructor(private readonly file: string) {}

  async migrate() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
  }

  async isEmpty() {
    return !fs.existsSync(this.file);
  }

  async seed(data: Database) {
    if (!(await this.isEmpty())) return;
    this.write(data);
  }

  private read(): Database {
    const stat = fs.statSync(this.file);
    if (this.cache && this.cache.mtimeMs === stat.mtimeMs) return this.cache.data;
    const data = JSON.parse(fs.readFileSync(this.file, "utf8")) as Database;
    // Arquivos gravados por versões anteriores recebem os campos atuais.
    data.projects = (data.projects ?? []).map((p) => normalizeProject(p as unknown as Record<string, unknown>));
    data.posts ??= [];
    data.messages ??= [];
    data.media ??= [];
    for (const m of data.media) m.storagePath ??= path.basename(m.url);
    this.cache = { mtimeMs: stat.mtimeMs, data };
    return data;
  }

  private write(data: Database) {
    const contents = JSON.stringify(data, null, 2);
    const tmp = `${this.file}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmp, contents, "utf8");
    try {
      fs.renameSync(tmp, this.file);
    } catch {
      // No Windows o rename pode falhar se outro processo estiver lendo; sobrescreve direto.
      fs.writeFileSync(this.file, contents, "utf8");
      fs.rmSync(tmp, { force: true });
    }
    this.cache = null;
  }

  private mutate(fn: (db: Database) => void) {
    const draft = structuredClone(this.read());
    fn(draft);
    this.write(draft);
  }

  /* ---------- conteúdo ---------- */

  async getContent<K extends ContentKey>(key: K): Promise<ContentMap[K] | null> {
    const db = this.read();
    return (db[key] as ContentMap[K]) ?? null;
  }

  async setContent<K extends ContentKey>(key: K, value: ContentMap[K]) {
    this.mutate((db) => {
      (db as unknown as Record<string, unknown>)[key] = value;
    });
  }

  /* ---------- categorias ---------- */

  async listCategories() {
    return this.read().categories;
  }

  async replaceCategories(categories: Database["categories"], fallbackId: string | null) {
    this.mutate((db) => {
      const ids = new Set(categories.map((c) => c.id));
      db.categories = categories;
      for (const p of db.projects) if (!ids.has(p.categoryId)) p.categoryId = fallbackId ?? "";
    });
  }

  /* ---------- projetos ---------- */

  async listProjects() {
    return [...this.read().projects].sort((a, b) => a.order - b.order);
  }

  async getProject(by: { id?: string; slug?: string }) {
    return this.read().projects.find((p) => (by.id ? p.id === by.id : p.slug === by.slug)) ?? null;
  }

  async upsertProject(project: Project) {
    this.mutate((db) => {
      const i = db.projects.findIndex((p) => p.id === project.id);
      if (i >= 0) db.projects[i] = project;
      else db.projects.push(project);
    });
  }

  async deleteProject(id: string) {
    this.mutate((db) => {
      db.projects = db.projects.filter((p) => p.id !== id);
    });
  }

  async setProjectOrder(ids: string[]) {
    this.mutate((db) => {
      ids.forEach((id, idx) => {
        const p = db.projects.find((x) => x.id === id);
        if (p) p.order = idx + 1;
      });
    });
  }

  async setProjectFlag(id: string, flag: "published" | "featured", value: boolean) {
    this.mutate((db) => {
      const p = db.projects.find((x) => x.id === id);
      if (p) {
        p[flag] = value;
        p.updatedAt = new Date().toISOString();
      }
    });
  }

  /* ---------- jornal (fora do site; mantido para bancos já criados) ---------- */

  async listPosts() {
    return [...this.read().posts].sort((a, b) => b.date.localeCompare(a.date));
  }

  async getPost(by: { id?: string; slug?: string }) {
    return this.read().posts.find((p) => (by.id ? p.id === by.id : p.slug === by.slug)) ?? null;
  }

  async upsertPost(post: Post) {
    this.mutate((db) => {
      const i = db.posts.findIndex((p) => p.id === post.id);
      if (i >= 0) db.posts[i] = post;
      else db.posts.push(post);
    });
  }

  async deletePost(id: string) {
    this.mutate((db) => {
      db.posts = db.posts.filter((p) => p.id !== id);
    });
  }

  /* ---------- mensagens ---------- */

  async listMessages() {
    return [...this.read().messages].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async insertMessage(message: Database["messages"][number]) {
    this.mutate((db) => {
      db.messages.unshift(message);
    });
  }

  async setMessageRead(id: string, read: boolean) {
    this.mutate((db) => {
      const m = db.messages.find((x) => x.id === id);
      if (m) m.read = read;
    });
  }

  async deleteMessage(id: string) {
    this.mutate((db) => {
      db.messages = db.messages.filter((m) => m.id !== id);
    });
  }

  /* ---------- mídia ---------- */

  async listMedia() {
    return [...this.read().media].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async getMedia(id: string) {
    return this.read().media.find((m) => m.id === id) ?? null;
  }

  async insertMedia(items: Database["media"]) {
    this.mutate((db) => {
      db.media.unshift(...items);
    });
  }

  async deleteMedia(id: string) {
    this.mutate((db) => {
      db.media = db.media.filter((m) => m.id !== id);
    });
  }
}
