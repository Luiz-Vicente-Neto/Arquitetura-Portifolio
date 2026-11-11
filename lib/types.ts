/** Bloco do estudo de caso em que a imagem aparece na página do projeto. */
export type GallerySection = "lugar" | "partido" | "desenhos" | "processo" | "finais";

export const GALLERY_SECTIONS: GallerySection[] = ["lugar", "partido", "desenhos", "processo", "finais"];

export const GALLERY_SECTION_LABEL: Record<GallerySection, string> = {
  lugar: "Lugar",
  partido: "Partido",
  desenhos: "Desenhos",
  processo: "Processo",
  finais: "Imagens finais",
};

export type GalleryLayout = "full" | "half";

export interface GalleryImage {
  id: string;
  url: string;
  caption: string;
  layout: GalleryLayout;
  section: GallerySection;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Uma frase: o que é o projeto e onde fica. */
  subtitle: string;
  categoryId: string;
  /** Programa, ex.: "Habitação coletiva". */
  program: string;
  /** Contexto acadêmico, ex.: "Projeto VI · 7º semestre". */
  context: string;
  location: string;
  year: string;
  /** Escala ou área, ex.: "4.200 m²". */
  area: string;
  advisor: string;
  /** Ex.: "Individual" ou "Em equipe — responsável por implantação e cortes". */
  authorship: string;
  tools: string;
  /** Bloco "Problema". */
  summary: string;
  /** Bloco "Lugar". */
  siteText: string;
  /** Bloco "Partido". */
  conceptText: string;
  /** Texto "Como se constrói", dentro do bloco "Desenhos". */
  constructionText: string;
  /** Bloco "Processo". */
  processText: string;
  credits: string;
  cover: string;
  /** Caderno ou prancha em PDF para download. */
  pdfUrl: string;
  gallery: GalleryImage[];
  /** Projeto de capa da página inicial (vale o primeiro marcado, na ordem da lista). */
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

/** O jornal saiu do site; o tipo permanece porque a tabela existe em bancos já criados. */
export type PostType = "noticia" | "imprensa" | "premio" | "evento";

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
  /** Assunto escolhido no formulário de contato. */
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

export interface Settings {
  siteName: string;
  architectName: string;
  /** Título profissional exibido sob o nome no cabeçalho. */
  profession: string;
  tagline: string;
  seoDescription: string;
  email: string;
  /** Telefone como deve aparecer no site. */
  phone: string;
  /** Somente dígitos, com DDI e DDD, para o link do WhatsApp. */
  whatsapp: string;
  city: string;
  instagram: string;
  linkedin: string;
  behance: string;
  cau: string;
  /** Formação em uma linha, ex.: "Arquitetura e Urbanismo — UFXX, 2026". */
  education: string;
  /** Ex.: "Disponível para vaga júnior a partir de jan/2027". Vazio oculta o aviso. */
  availability: string;
  portfolioPdf: string;
  cvPdf: string;
}

export interface HomeContent {
  /** Linha pequena acima do título, ex.: "Portfólio 2026 · Campinas, SP". */
  eyebrow: string;
  heroTitle: string;
  /** Chamada do rodapé. */
  ctaTitle: string;
}

export interface PeriodItem {
  period: string;
  title: string;
  detail: string;
}

export interface LabelValue {
  label: string;
  value: string;
}

export interface AwardItem {
  year: string;
  title: string;
}

export interface AboutContent {
  title: string;
  portrait: string;
  /** Primeiro parágrafo, em destaque. Também aparece na página inicial. */
  intro: string;
  bio: string;
  education: PeriodItem[];
  experience: PeriodItem[];
  tools: LabelValue[];
  awards: AwardItem[];
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
