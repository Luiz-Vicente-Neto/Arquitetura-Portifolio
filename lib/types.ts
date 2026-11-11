export type ProjectStatus = "concluido" | "em-andamento" | "conceito";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  concluido: "Concluído",
  "em-andamento": "Em andamento",
  conceito: "Conceito / Concurso",
};

export type GalleryLayout = "full" | "half";

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  layout: GalleryLayout;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  categoryId: string;
  status: ProjectStatus;
  location: string;
  year: string;
  area: string;
  client: string;
  team: string;
  photographer: string;
  summary: string;
  description: string;
  cover: string;
  gallery: GalleryImage[];
  featured: boolean;
  published: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type PostType = "noticia" | "imprensa" | "premio" | "evento";

export const POST_TYPE_LABEL: Record<PostType, string> = {
  noticia: "Notícia",
  imprensa: "Imprensa",
  premio: "Prêmio",
  evento: "Evento",
};

export interface Post {
  id: string;
  slug: string;
  title: string;
  type: PostType;
  date: string;
  outlet: string;
  externalUrl: string;
  excerpt: string;
  body: string;
  cover: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  projectType: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface MediaItem {
  id: string;
  url: string;
  /** Caminho no armazenamento de arquivos (disco local ou bucket do Supabase). */
  storagePath: string;
  name: string;
  size: number;
  type: string;
  createdAt: string;
}

export interface TitleText {
  title: string;
  text: string;
}

export interface Settings {
  siteName: string;
  architectName: string;
  /** Título profissional exibido sob o nome no cabeçalho, ex.: "Arquiteta e Urbanista" */
  profession: string;
  tagline: string;
  seoDescription: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  mapUrl: string;
  instagram: string;
  linkedin: string;
  pinterest: string;
  behance: string;
  cau: string;
  officeHours: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  statement: string;
  servicesTitle: string;
  services: TitleText[];
  aboutTeaserTitle: string;
  aboutTeaserText: string;
  aboutTeaserImage: string;
  ctaTitle: string;
  ctaText: string;
  showJournal: boolean;
}

export interface TimelineItem {
  year: string;
  text: string;
}

export interface AwardItem {
  year: string;
  title: string;
  org: string;
}

export interface AboutContent {
  title: string;
  portrait: string;
  intro: string;
  bio: string;
  philosophyTitle: string;
  philosophy: string;
  studioImage: string;
  timeline: TimelineItem[];
  awards: AwardItem[];
  process: TitleText[];
  clients: string;
}

export interface AdminUser {
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  isDefaultPassword: boolean;
}

export interface Database {
  version: number;
  secret: string;
  user: AdminUser;
  settings: Settings;
  home: HomeContent;
  about: AboutContent;
  categories: Category[];
  projects: Project[];
  posts: Post[];
  messages: Message[];
  media: MediaItem[];
}
