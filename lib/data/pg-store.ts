import postgres from "postgres";
import { normalizeGallery } from "../normalize";
import type { Category, Database, MediaItem, Message, Post, PostType, Project } from "../types";
import { SCHEMA_SQL } from "./schema";
import type { ContentKey, ContentMap, Store } from "./store";

type Sql = ReturnType<typeof postgres>;
type Row = Record<string, unknown>;

const iso = (v: unknown) => (v instanceof Date ? v.toISOString() : String(v ?? ""));
const str = (v: unknown) => (v == null ? "" : String(v));
const json = (sql: Sql, v: unknown) => sql.json(v as Parameters<Sql["json"]>[0]);

function toProject(r: Row): Project {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    subtitle: str(r.subtitle),
    categoryId: str(r.category_id),
    program: str(r.program),
    context: str(r.study_context),
    location: str(r.location),
    year: str(r.year),
    area: str(r.area),
    advisor: str(r.advisor),
    authorship: str(r.authorship),
    tools: str(r.tools),
    summary: str(r.summary),
    siteText: str(r.site_text),
    // A coluna "description" já existia: guarda o texto do bloco "Partido".
    conceptText: str(r.description),
    constructionText: str(r.construction_text),
    processText: str(r.process_text),
    credits: str(r.credits),
    cover: str(r.cover),
    pdfUrl: str(r.pdf_url),
    gallery: normalizeGallery(r.gallery),
    featured: Boolean(r.featured),
    published: Boolean(r.published),
    order: Number(r.position ?? 0),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function toPost(r: Row): Post {
  return {
    id: str(r.id),
    slug: str(r.slug),
    title: str(r.title),
    type: str(r.type) as PostType,
    date: str(r.date),
    outlet: str(r.outlet),
    externalUrl: str(r.external_url),
    excerpt: str(r.excerpt),
    body: str(r.body),
    cover: str(r.cover),
    published: Boolean(r.published),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function toMessage(r: Row): Message {
  return {
    id: str(r.id),
    name: str(r.name),
    email: str(r.email),
    phone: str(r.phone),
    projectType: str(r.project_type),
    message: str(r.message),
    read: Boolean(r.read),
    createdAt: iso(r.created_at),
  };
}

function toMedia(r: Row): MediaItem {
  return {
    id: str(r.id),
    url: str(r.url),
    storagePath: str(r.storage_path),
    name: str(r.name),
    size: Number(r.size ?? 0),
    type: str(r.type),
    createdAt: iso(r.created_at),
  };
}

// Colunas de posts com a data em texto (YYYY-MM-DD), evitando conversões de fuso horário.
const POST_COLS = `id, slug, title, type, date::text as date, outlet, external_url, excerpt, body, cover,
  published, created_at, updated_at`;

/**
 * Armazenamento em PostgreSQL. Pensado para o Supabase, mas funciona com qualquer Postgres 13+.
 * Usa `prepare: false` para ser compatível com o pooler de transações do Supabase (porta 6543).
 */
export class PgStore implements Store {
  readonly kind = "postgres" as const;

  constructor(private readonly sql: Sql) {}

  static connect(url: string): PgStore {
    // Reaproveita a conexão entre recarregamentos do servidor de desenvolvimento.
    const g = globalThis as unknown as { __arqSql?: Sql; __arqSqlUrl?: string };
    if (!g.__arqSql || g.__arqSqlUrl !== url) {
      const host = (() => {
        try {
          return new URL(url).hostname;
        } catch {
          return "";
        }
      })();
      const local = ["localhost", "127.0.0.1", "::1"].includes(host);
      const hasSslParam = /[?&]sslmode=/.test(url);
      g.__arqSql = postgres(url, {
        prepare: false,
        max: Number(process.env.DATABASE_POOL_MAX ?? 5),
        idle_timeout: 20,
        connect_timeout: 15,
        // Supabase exige TLS; se a URL não disser nada, usa "require" fora do localhost.
        ...(hasSslParam ? {} : { ssl: process.env.DATABASE_SSL === "disable" || local ? false : "require" }),
        onnotice: () => {},
      });
      g.__arqSqlUrl = url;
    }
    return new PgStore(g.__arqSql);
  }

  async migrate() {
    await this.sql.unsafe(SCHEMA_SQL).simple();
  }

  async isEmpty() {
    const [row] = await this.sql`select count(*)::int as n from site_content where key = 'settings'`;
    return Number(row.n) === 0;
  }

  async seed(data: Database) {
    await this.sql.begin(async (tx) => {
      // Trava para evitar seed duplicado se duas instâncias subirem juntas.
      await tx`select pg_advisory_xact_lock(814211)`;
      const [row] = await tx`select count(*)::int as n from site_content where key = 'settings'`;
      if (Number(row.n) > 0) return;

      const t = new PgStore(tx as unknown as Sql);
      for (const key of ["secret", "user", "settings", "home", "about"] as const) {
        await t.setContent(key, data[key]);
      }
      await t.replaceCategories(data.categories, null);
      for (const p of data.projects) await t.upsertProject(p);
      for (const p of data.posts) await t.upsertPost(p);
      for (const m of data.messages) await t.insertMessage(m);
      if (data.media.length) await t.insertMedia(data.media);
    });
  }

  /* ---------- conteúdo ---------- */

  async getContent<K extends ContentKey>(key: K): Promise<ContentMap[K] | null> {
    const rows = await this.sql`select value from site_content where key = ${key}`;
    return rows.length ? (rows[0].value as ContentMap[K]) : null;
  }

  async setContent<K extends ContentKey>(key: K, value: ContentMap[K]) {
    await this.sql`
      insert into site_content (key, value, updated_at)
      values (${key}, ${json(this.sql, value)}, now())
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
  }

  /* ---------- categorias ---------- */

  async listCategories(): Promise<Category[]> {
    const rows = await this.sql`select id, name, slug from categories order by position, name`;
    return rows.map((r) => ({ id: str(r.id), name: str(r.name), slug: str(r.slug) }));
  }

  async replaceCategories(categories: Category[], fallbackId: string | null) {
    const run = async (tx: Sql) => {
      for (const [i, c] of categories.entries()) {
        await tx`
          insert into categories (id, name, slug, position) values (${c.id}, ${c.name}, ${c.slug}, ${i})
          on conflict (id) do update set name = excluded.name, slug = excluded.slug, position = excluded.position`;
      }
      const ids = categories.map((c) => c.id);
      // Reatribui os projetos antes de apagar, para não perder a categoria.
      await tx`
        update projects set category_id = ${fallbackId}
        where category_id is null or category_id <> all(${ids}::text[])`;
      await tx`delete from categories where id <> all(${ids}::text[])`;
    };
    // Dentro de uma transação já aberta (seed) não abre outra.
    if ("savepoint" in this.sql) await run(this.sql);
    else await this.sql.begin((tx) => run(tx as unknown as Sql));
  }

  /* ---------- projetos ---------- */

  async listProjects() {
    const rows = await this.sql`select * from projects order by position, created_at`;
    return rows.map(toProject);
  }

  async getProject(by: { id?: string; slug?: string }) {
    const rows = by.id
      ? await this.sql`select * from projects where id = ${by.id}`
      : await this.sql`select * from projects where slug = ${by.slug ?? ""}`;
    return rows.length ? toProject(rows[0]) : null;
  }

  async upsertProject(p: Project) {
    await this.sql`
      insert into projects (
        id, slug, title, subtitle, category_id, program, study_context, location, year, area,
        advisor, authorship, tools, summary, site_text, description, construction_text,
        process_text, credits, cover, pdf_url, gallery, featured, published, position,
        created_at, updated_at
      ) values (
        ${p.id}, ${p.slug}, ${p.title}, ${p.subtitle}, ${p.categoryId || null}, ${p.program},
        ${p.context}, ${p.location}, ${p.year}, ${p.area}, ${p.advisor}, ${p.authorship},
        ${p.tools}, ${p.summary}, ${p.siteText}, ${p.conceptText}, ${p.constructionText},
        ${p.processText}, ${p.credits}, ${p.cover}, ${p.pdfUrl}, ${json(this.sql, p.gallery)},
        ${p.featured}, ${p.published}, ${p.order}, ${p.createdAt}, ${p.updatedAt}
      )
      on conflict (id) do update set
        slug = excluded.slug, title = excluded.title, subtitle = excluded.subtitle,
        category_id = excluded.category_id, program = excluded.program,
        study_context = excluded.study_context, location = excluded.location, year = excluded.year,
        area = excluded.area, advisor = excluded.advisor, authorship = excluded.authorship,
        tools = excluded.tools, summary = excluded.summary, site_text = excluded.site_text,
        description = excluded.description, construction_text = excluded.construction_text,
        process_text = excluded.process_text, credits = excluded.credits, cover = excluded.cover,
        pdf_url = excluded.pdf_url, gallery = excluded.gallery, featured = excluded.featured,
        published = excluded.published, position = excluded.position, updated_at = excluded.updated_at`;
  }

  async deleteProject(id: string) {
    await this.sql`delete from projects where id = ${id}`;
  }

  async setProjectOrder(ids: string[]) {
    if (!ids.length) return;
    await this.sql`
      update projects set position = o.ord
      from unnest(${ids}::text[]) with ordinality as o(id, ord)
      where projects.id = o.id`;
  }

  async setProjectFlag(id: string, flag: "published" | "featured", value: boolean) {
    if (flag === "published") await this.sql`update projects set published = ${value}, updated_at = now() where id = ${id}`;
    else await this.sql`update projects set featured = ${value}, updated_at = now() where id = ${id}`;
  }

  /* ---------- jornal (fora do site; mantido para bancos já criados) ---------- */

  async listPosts() {
    const rows = await this.sql.unsafe(`select ${POST_COLS} from posts order by date desc, created_at desc`);
    return rows.map(toPost);
  }

  async getPost(by: { id?: string; slug?: string }) {
    const rows = by.id
      ? await this.sql.unsafe(`select ${POST_COLS} from posts where id = $1`, [by.id])
      : await this.sql.unsafe(`select ${POST_COLS} from posts where slug = $1`, [by.slug ?? ""]);
    return rows.length ? toPost(rows[0]) : null;
  }

  async upsertPost(p: Post) {
    await this.sql`
      insert into posts (
        id, slug, title, type, date, outlet, external_url, excerpt, body, cover, published, created_at, updated_at
      ) values (
        ${p.id}, ${p.slug}, ${p.title}, ${p.type}, ${p.date || null}::date, ${p.outlet}, ${p.externalUrl},
        ${p.excerpt}, ${p.body}, ${p.cover}, ${p.published}, ${p.createdAt}, ${p.updatedAt}
      )
      on conflict (id) do update set
        slug = excluded.slug, title = excluded.title, type = excluded.type, date = excluded.date,
        outlet = excluded.outlet, external_url = excluded.external_url, excerpt = excluded.excerpt,
        body = excluded.body, cover = excluded.cover, published = excluded.published,
        updated_at = excluded.updated_at`;
  }

  async deletePost(id: string) {
    await this.sql`delete from posts where id = ${id}`;
  }

  /* ---------- mensagens ---------- */

  async listMessages() {
    const rows = await this.sql`select * from messages order by created_at desc`;
    return rows.map(toMessage);
  }

  async insertMessage(m: Message) {
    await this.sql`
      insert into messages (id, name, email, phone, project_type, message, read, created_at)
      values (${m.id}, ${m.name}, ${m.email}, ${m.phone}, ${m.projectType}, ${m.message}, ${m.read}, ${m.createdAt})
      on conflict (id) do nothing`;
  }

  async setMessageRead(id: string, read: boolean) {
    await this.sql`update messages set read = ${read} where id = ${id}`;
  }

  async deleteMessage(id: string) {
    await this.sql`delete from messages where id = ${id}`;
  }

  /* ---------- mídia ---------- */

  async listMedia() {
    const rows = await this.sql`select * from media order by created_at desc`;
    return rows.map(toMedia);
  }

  async getMedia(id: string) {
    const rows = await this.sql`select * from media where id = ${id}`;
    return rows.length ? toMedia(rows[0]) : null;
  }

  async insertMedia(items: MediaItem[]) {
    for (const m of items) {
      await this.sql`
        insert into media (id, url, storage_path, name, size, type, created_at)
        values (${m.id}, ${m.url}, ${m.storagePath}, ${m.name}, ${m.size}, ${m.type}, ${m.createdAt})
        on conflict (id) do nothing`;
    }
  }

  async deleteMedia(id: string) {
    await this.sql`delete from media where id = ${id}`;
  }
}
