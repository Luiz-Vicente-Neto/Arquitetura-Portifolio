import type {
  AboutContent,
  AdminUser,
  Category,
  Database,
  HomeContent,
  MediaItem,
  Message,
  Post,
  Project,
  Settings,
} from "../types";

/** Documentos únicos (singletons) guardados por chave. */
export interface ContentMap {
  settings: Settings;
  home: HomeContent;
  about: AboutContent;
  user: AdminUser;
  secret: string;
}
export type ContentKey = keyof ContentMap;

/**
 * Contrato de armazenamento. Há duas implementações:
 * - JsonStore: arquivo local (storage/content.json) — padrão, sem configuração.
 * - PgStore: PostgreSQL (Supabase ou qualquer outro) — ativado por DATABASE_URL.
 */
export interface Store {
  readonly kind: "json" | "postgres";

  /** Cria tabelas/arquivos se necessário. Idempotente. */
  migrate(): Promise<void>;
  isEmpty(): Promise<boolean>;
  /** Popula um banco vazio com o conteúdo inicial. */
  seed(data: Database): Promise<void>;

  getContent<K extends ContentKey>(key: K): Promise<ContentMap[K] | null>;
  setContent<K extends ContentKey>(key: K, value: ContentMap[K]): Promise<void>;

  listCategories(): Promise<Category[]>;
  /** Substitui a lista inteira; projetos de categorias removidas vão para `fallbackId`. */
  replaceCategories(categories: Category[], fallbackId: string | null): Promise<void>;

  /** Ordenados por `order` crescente. */
  listProjects(): Promise<Project[]>;
  getProject(by: { id?: string; slug?: string }): Promise<Project | null>;
  upsertProject(project: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  /** Define a ordem: o índice no array vira `order` (1-based). */
  setProjectOrder(ids: string[]): Promise<void>;
  setProjectFlag(id: string, flag: "published" | "featured", value: boolean): Promise<void>;

  /** Mais recentes primeiro. */
  listPosts(): Promise<Post[]>;
  getPost(by: { id?: string; slug?: string }): Promise<Post | null>;
  upsertPost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;

  /** Mais recentes primeiro. */
  listMessages(): Promise<Message[]>;
  insertMessage(message: Message): Promise<void>;
  setMessageRead(id: string, read: boolean): Promise<void>;
  deleteMessage(id: string): Promise<void>;

  /** Mais recentes primeiro. */
  listMedia(): Promise<MediaItem[]>;
  getMedia(id: string): Promise<MediaItem | null>;
  insertMedia(items: MediaItem[]): Promise<void>;
  deleteMedia(id: string): Promise<void>;
}
