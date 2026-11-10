"use server";

import fs from "node:fs";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { UPLOADS_DIR, hashPassword, readDb, updateDb } from "../db";
import {
  SESSION_COOKIE,
  createSessionToken,
  requireAdmin,
  sessionCookieOptions,
  verifyPassword,
} from "../auth";
import type { AboutContent, Category, HomeContent, Post, Project, Settings } from "../types";
import { slugify, uid } from "../utils";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function refresh() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* as páginas são dinâmicas; revalidação é apenas uma garantia extra */
  }
}

function uniqueSlug(base: string, taken: string[], fallback: string) {
  const root = slugify(base) || fallback;
  let slug = root;
  let i = 2;
  while (taken.includes(slug)) slug = `${root}-${i++}`;
  return slug;
}

/* ---------- Autenticação ---------- */

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!verifyPassword(email, password)) {
    await new Promise((r) => setTimeout(r, 400));
    return { ok: false, error: "E-mail ou senha incorretos." };
  }
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(readDb().user.email), sessionCookieOptions);
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function updateAccount(input: {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
}): Promise<ActionResult> {
  await requireAdmin();
  const db = readDb();
  if (!verifyPassword(db.user.email, input.currentPassword)) {
    return { ok: false, error: "Senha atual incorreta." };
  }
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "E-mail inválido." };
  if (input.newPassword && input.newPassword.length < 8) {
    return { ok: false, error: "A nova senha precisa ter pelo menos 8 caracteres." };
  }
  updateDb((d) => {
    d.user.name = input.name.trim() || d.user.name;
    d.user.email = email;
    if (input.newPassword) {
      const { hash, salt } = hashPassword(input.newPassword);
      d.user.passwordHash = hash;
      d.user.salt = salt;
      d.user.isDefaultPassword = false;
    }
  });
  // E-mail pode ter mudado: reemite o cookie de sessão.
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(email), sessionCookieOptions);
  return { ok: true };
}

/* ---------- Projetos ---------- */

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "order"> & { id?: string };

export async function saveProject(input: ProjectInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) return { ok: false, error: "O projeto precisa de um título." };

  const id = updateDb((db) => {
    const others = db.projects.filter((p) => p.id !== input.id);
    const slug = uniqueSlug(input.slug || input.title, others.map((p) => p.slug), "projeto");
    const stamp = new Date().toISOString();
    const existing = db.projects.find((p) => p.id === input.id);
    if (existing) {
      Object.assign(existing, { ...input, id: existing.id, slug, updatedAt: stamp });
      return existing.id;
    }
    const project: Project = {
      ...input,
      id: uid("p"),
      slug,
      order: Math.min(0, ...db.projects.map((p) => p.order)) - 1,
      createdAt: stamp,
      updatedAt: stamp,
    };
    db.projects.push(project);
    return project.id;
  });
  refresh();
  return { ok: true, id };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.projects = db.projects.filter((p) => p.id !== id);
  });
  refresh();
  return { ok: true };
}

export async function toggleProjectFlag(id: string, flag: "published" | "featured"): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    const p = db.projects.find((x) => x.id === id);
    if (p) p[flag] = !p[flag];
  });
  refresh();
  return { ok: true };
}

export async function moveProject(id: string, direction: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    const sorted = [...db.projects].sort((a, b) => a.order - b.order);
    const i = sorted.findIndex((p) => p.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    sorted.forEach((p, idx) => {
      const target = db.projects.find((x) => x.id === p.id);
      if (target) target.order = idx + 1;
    });
  });
  refresh();
  return { ok: true };
}

/* ---------- Categorias ---------- */

export async function saveCategories(categories: Category[]): Promise<ActionResult> {
  await requireAdmin();
  const cleaned = categories
    .map((c) => ({ ...c, name: c.name.trim() }))
    .filter((c) => c.name);
  const slugs: string[] = [];
  for (const c of cleaned) {
    c.slug = uniqueSlug(c.name, slugs, "categoria");
    slugs.push(c.slug);
    if (!c.id) c.id = uid("c");
  }
  updateDb((db) => {
    const fallback = cleaned[0]?.id ?? "";
    const ids = new Set(cleaned.map((c) => c.id));
    db.categories = cleaned;
    for (const p of db.projects) if (!ids.has(p.categoryId)) p.categoryId = fallback;
  });
  refresh();
  return { ok: true };
}

/* ---------- Jornal ---------- */

export type PostInput = Omit<Post, "id" | "createdAt" | "updatedAt"> & { id?: string };

export async function savePost(input: PostInput): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) return { ok: false, error: "A publicação precisa de um título." };
  const id = updateDb((db) => {
    const others = db.posts.filter((p) => p.id !== input.id);
    const slug = uniqueSlug(input.slug || input.title, others.map((p) => p.slug), "publicacao");
    const stamp = new Date().toISOString();
    const existing = db.posts.find((p) => p.id === input.id);
    if (existing) {
      Object.assign(existing, { ...input, id: existing.id, slug, updatedAt: stamp });
      return existing.id;
    }
    const post: Post = { ...input, id: uid("n"), slug, createdAt: stamp, updatedAt: stamp };
    db.posts.push(post);
    return post.id;
  });
  refresh();
  return { ok: true, id };
}

export async function deletePost(id: string): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.posts = db.posts.filter((p) => p.id !== id);
  });
  refresh();
  return { ok: true };
}

/* ---------- Páginas e configurações ---------- */

export async function saveHome(home: HomeContent): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.home = home;
  });
  refresh();
  return { ok: true };
}

export async function saveAbout(about: AboutContent): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.about = about;
  });
  refresh();
  return { ok: true };
}

export async function saveSettings(settings: Settings): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.settings = settings;
  });
  refresh();
  return { ok: true };
}

/* ---------- Mensagens ---------- */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    const m = db.messages.find((x) => x.id === id);
    if (m) m.read = read;
  });
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  updateDb((db) => {
    db.messages = db.messages.filter((m) => m.id !== id);
  });
  return { ok: true };
}

/* ---------- Mídia ---------- */

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  const item = readDb().media.find((m) => m.id === id);
  if (!item) return { ok: false, error: "Arquivo não encontrado." };
  const file = path.join(UPLOADS_DIR, path.basename(item.url));
  fs.rmSync(file, { force: true });
  updateDb((db) => {
    db.media = db.media.filter((m) => m.id !== id);
  });
  return { ok: true };
}
