"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, getUser, hashPassword } from "../db";
import { deleteFile } from "../files";
import {
  SESSION_COOKIE,
  createSessionToken,
  requireAdmin,
  sessionCookieOptions,
  verifyPassword,
} from "../auth";
import {
  GALLERY_SECTIONS,
  type AboutContent,
  type Category,
  type GalleryImage,
  type GallerySection,
  type HomeContent,
  type Project,
  type Settings,
} from "../types";
import { slugify, uid } from "../utils";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
  /** Valor como ficou salvo (após normalização), para o formulário exibir exatamente o que está no banco. */
  data?: unknown;
}

function refresh() {
  try {
    revalidatePath("/", "layout");
  } catch {
    /* as páginas são dinâmicas; a revalidação é só uma garantia extra */
  }
}

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function uniqueSlug(base: string, taken: string[], fallback: string) {
  const root = slugify(base) || fallback;
  let slug = root;
  let i = 2;
  while (taken.includes(slug)) slug = `${root}-${i++}`;
  return slug;
}

const text = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const longText = (v: unknown) => text(v, 50_000);
const bool = (v: unknown) => v === true;
const url = (v: unknown) => {
  const s = text(v, 2000);
  return /^(https?:\/\/|\/)/i.test(s) || s === "" ? s : "";
};
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ---------- Autenticação ---------- */

// Proteção simples contra força bruta: 5 tentativas erradas bloqueiam por 2 minutos (por IP).
const attempts = new Map<string, { count: number; until: number }>();

export async function login(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const entry = attempts.get(ip);
  if (entry && entry.until > now) {
    return fail("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
  }

  const email = text(formData.get("email"), 200);
  const password = String(formData.get("password") ?? "");
  if (!(await verifyPassword(email, password))) {
    // Se um bloqueio anterior já expirou, recomeça a contagem.
    const previous = entry && entry.until === 0 ? entry.count : 0;
    const count = previous + 1;
    attempts.set(ip, { count, until: count >= 5 ? now + 2 * 60_000 : 0 });
    await new Promise((r) => setTimeout(r, 400));
    return fail("E-mail ou senha incorretos.");
  }
  attempts.delete(ip);

  const user = await getUser();
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(user.email), sessionCookieOptions);
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
  const user = await getUser();
  if (!(await verifyPassword(user.email, String(input.currentPassword ?? "")))) {
    return fail("Senha atual incorreta.");
  }
  const email = text(input.email, 200).toLowerCase();
  if (!isEmail(email)) return fail("E-mail inválido.");
  const newPassword = String(input.newPassword ?? "");
  if (newPassword && newPassword.length < 8) return fail("A nova senha precisa ter pelo menos 8 caracteres.");

  const next = { ...user, name: text(input.name, 120) || user.name, email };
  if (newPassword) {
    const { hash, salt } = hashPassword(newPassword);
    Object.assign(next, { passwordHash: hash, salt, isDefaultPassword: false });
  }
  await (await db()).setContent("user", next);

  // O e-mail faz parte da sessão: reemite o cookie.
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(email), sessionCookieOptions);
  return { ok: true };
}

/* ---------- Projetos ---------- */

export type ProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt" | "order"> & { id?: string };

function cleanGallery(v: unknown): GalleryImage[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((g) => ({
      id: text(g?.id, 60) || uid("g"),
      url: url(g?.url),
      caption: text(g?.caption, 300),
      layout: g?.layout === "half" ? ("half" as const) : ("full" as const),
      section: GALLERY_SECTIONS.includes(g?.section) ? (g.section as GallerySection) : ("finais" as const),
    }))
    .filter((g) => g.url)
    .slice(0, 200);
}

export async function saveProject(input: ProjectInput): Promise<ActionResult> {
  await requireAdmin();
  const store = await db();
  const title = text(input.title, 200);
  if (!title) return fail("O projeto precisa de um título.");

  const [projects, categories] = await Promise.all([store.listProjects(), store.listCategories()]);
  const existing = input.id ? projects.find((p) => p.id === input.id) : undefined;
  if (input.id && !existing) return fail("Projeto não encontrado — ele pode ter sido excluído.");

  const categoryId = categories.some((c) => c.id === input.categoryId) ? input.categoryId : (categories[0]?.id ?? "");
  const slug = uniqueSlug(
    text(input.slug, 120) || title,
    projects.filter((p) => p.id !== existing?.id).map((p) => p.slug),
    "projeto",
  );
  const stamp = new Date().toISOString();

  const project: Project = {
    id: existing?.id ?? uid("p"),
    slug,
    title,
    subtitle: text(input.subtitle, 300),
    categoryId,
    program: text(input.program, 200),
    context: text(input.context, 200),
    location: text(input.location, 200),
    year: text(input.year, 20),
    area: text(input.area, 80),
    advisor: text(input.advisor, 200),
    authorship: text(input.authorship, 300),
    tools: text(input.tools, 300),
    summary: text(input.summary, 2000),
    siteText: longText(input.siteText),
    conceptText: longText(input.conceptText),
    constructionText: longText(input.constructionText),
    processText: longText(input.processText),
    credits: text(input.credits, 2000),
    cover: url(input.cover),
    pdfUrl: url(input.pdfUrl),
    gallery: cleanGallery(input.gallery),
    featured: bool(input.featured),
    published: bool(input.published),
    // Projetos novos entram no topo da lista.
    order: existing?.order ?? Math.min(1, ...projects.map((p) => p.order)) - 1,
    createdAt: existing?.createdAt ?? stamp,
    updatedAt: stamp,
  };

  await store.upsertProject(project);
  if (!existing) await store.setProjectOrder([project.id, ...projects.map((p) => p.id)]);
  refresh();
  return { ok: true, id: project.id };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  await (await db()).deleteProject(String(id));
  refresh();
  return { ok: true };
}

export async function toggleProjectFlag(id: string, flag: "published" | "featured"): Promise<ActionResult> {
  await requireAdmin();
  if (flag !== "published" && flag !== "featured") return fail("Campo inválido.");
  const store = await db();
  const p = await store.getProject({ id: String(id) });
  if (!p) return fail("Projeto não encontrado.");
  await store.setProjectFlag(p.id, flag, !p[flag]);
  refresh();
  return { ok: true };
}

export async function moveProject(id: string, direction: -1 | 1): Promise<ActionResult> {
  await requireAdmin();
  const store = await db();
  const ids = (await store.listProjects()).map((p) => p.id);
  const i = ids.indexOf(String(id));
  const j = i + (direction === -1 ? -1 : 1);
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true };
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await store.setProjectOrder(ids);
  refresh();
  return { ok: true };
}

/* ---------- Categorias ---------- */

export async function saveCategories(categories: Category[]): Promise<ActionResult> {
  await requireAdmin();
  if (!Array.isArray(categories)) return fail("Dados inválidos.");
  const cleaned: Category[] = [];
  for (const c of categories) {
    const name = text(c?.name, 80);
    if (!name) continue;
    const slug = uniqueSlug(name, cleaned.map((x) => x.slug), "categoria");
    cleaned.push({ id: text(c?.id, 60) || uid("c"), name, slug });
  }
  if (cleaned.length === 0) return fail("Mantenha pelo menos uma categoria.");
  await (await db()).replaceCategories(cleaned, cleaned[0].id);
  refresh();
  return { ok: true };
}

/* ---------- Páginas e configurações ---------- */

const rows = <K extends string>(v: unknown, keys: K[], max = 50): Record<K, string>[] =>
  Array.isArray(v)
    ? v
        .map((row) => Object.fromEntries(keys.map((k) => [k, text(row?.[k], 1000)])) as Record<K, string>)
        .filter((row) => keys.some((k) => row[k]))
        .slice(0, max)
    : [];

export async function saveHome(home: HomeContent): Promise<ActionResult> {
  await requireAdmin();
  const data: HomeContent = {
    eyebrow: text(home.eyebrow, 200),
    heroTitle: text(home.heroTitle, 400),
    ctaTitle: text(home.ctaTitle, 200),
  };
  await (await db()).setContent("home", data);
  refresh();
  return { ok: true, data };
}

export async function saveAbout(about: AboutContent): Promise<ActionResult> {
  await requireAdmin();
  const data: AboutContent = {
    title: text(about.title, 100) || "Sobre",
    portrait: url(about.portrait),
    intro: text(about.intro, 2000),
    bio: longText(about.bio),
    education: rows(about.education, ["period", "title", "detail"]),
    experience: rows(about.experience, ["period", "title", "detail"]),
    tools: rows(about.tools, ["label", "value"]),
    awards: rows(about.awards, ["year", "title"]),
  };
  await (await db()).setContent("about", data);
  refresh();
  return { ok: true, data };
}

export async function saveSettings(s: Settings): Promise<ActionResult> {
  await requireAdmin();
  const email = text(s.email, 200);
  // Aceita o espaço reservado "[e-mail]" do conteúdo inicial, mas não um endereço malformado.
  if (email && !isEmail(email) && !/^\[.*\]$/.test(email)) return fail("E-mail de contato inválido.");
  if (!text(s.siteName, 200)) return fail("Informe o nome do site.");
  const data: Settings = {
    siteName: text(s.siteName, 200),
    architectName: text(s.architectName, 120),
    profession: text(s.profession, 120),
    tagline: text(s.tagline, 300),
    seoDescription: text(s.seoDescription, 500),
    email,
    phone: text(s.phone, 50),
    whatsapp: text(s.whatsapp, 30).replace(/\D/g, ""),
    city: text(s.city, 200),
    instagram: url(s.instagram),
    linkedin: url(s.linkedin),
    behance: url(s.behance),
    cau: text(s.cau, 50),
    education: text(s.education, 300),
    availability: text(s.availability, 300),
    portfolioPdf: url(s.portfolioPdf),
    cvPdf: url(s.cvPdf),
  };
  await (await db()).setContent("settings", data);
  refresh();
  return { ok: true, data };
}

/* ---------- Mensagens ---------- */

export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  await requireAdmin();
  await (await db()).setMessageRead(String(id), read === true);
  return { ok: true };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  await (await db()).deleteMessage(String(id));
  return { ok: true };
}

/* ---------- Mídia ---------- */

export async function deleteMedia(id: string): Promise<ActionResult> {
  await requireAdmin();
  const store = await db();
  const item = await store.getMedia(String(id));
  if (!item) return fail("Arquivo não encontrado.");
  try {
    await deleteFile(item.storagePath);
  } catch (e) {
    return fail((e as Error).message);
  }
  await store.deleteMedia(item.id);
  return { ok: true };
}
