import {
  GALLERY_SECTIONS,
  type AboutContent,
  type GalleryImage,
  type GallerySection,
  type HomeContent,
  type Project,
  type Settings,
} from "./types";

/**
 * Conteúdo gravado por versões anteriores do site (quando ele era um site de escritório)
 * pode não ter os campos atuais. Estas funções completam o que falta sem perder o que existe.
 */

type Loose = Record<string, unknown>;
const s = (v: unknown) => (typeof v === "string" ? v : "");
const arr = (v: unknown): Loose[] => (Array.isArray(v) ? (v as Loose[]) : []);

export function normalizeGallery(v: unknown): GalleryImage[] {
  return arr(v)
    .filter((g) => s(g.url))
    .map((g, i) => ({
      id: s(g.id) || `g${i}`,
      url: s(g.url),
      caption: s(g.caption),
      layout: g.layout === "half" ? "half" : "full",
      section: GALLERY_SECTIONS.includes(g.section as GallerySection) ? (g.section as GallerySection) : "finais",
    }));
}

export function normalizeProject(p: Loose): Project {
  const legacyCredits = [
    s(p.team) && `Equipe: ${s(p.team)}.`,
    s(p.photographer) && `Imagens: ${s(p.photographer)}.`,
  ]
    .filter(Boolean)
    .join(" ");
  return {
    id: s(p.id),
    slug: s(p.slug),
    title: s(p.title),
    subtitle: s(p.subtitle),
    categoryId: s(p.categoryId),
    program: s(p.program),
    context: s(p.context),
    location: s(p.location),
    year: s(p.year),
    area: s(p.area),
    advisor: s(p.advisor),
    authorship: s(p.authorship),
    tools: s(p.tools),
    summary: s(p.summary),
    siteText: s(p.siteText),
    conceptText: typeof p.conceptText === "string" ? p.conceptText : s(p.description),
    constructionText: s(p.constructionText),
    processText: s(p.processText),
    credits: typeof p.credits === "string" ? p.credits : legacyCredits,
    cover: s(p.cover),
    pdfUrl: s(p.pdfUrl),
    gallery: normalizeGallery(p.gallery),
    featured: p.featured === true,
    published: p.published === true,
    order: typeof p.order === "number" ? p.order : 0,
    createdAt: s(p.createdAt),
    updatedAt: s(p.updatedAt),
  };
}

export function normalizeSettings(v: Loose): Settings {
  return {
    siteName: s(v.siteName),
    architectName: s(v.architectName),
    profession: s(v.profession),
    tagline: s(v.tagline),
    seoDescription: s(v.seoDescription),
    email: s(v.email),
    phone: s(v.phone),
    whatsapp: s(v.whatsapp),
    city: s(v.city),
    instagram: s(v.instagram),
    linkedin: s(v.linkedin),
    behance: s(v.behance),
    cau: s(v.cau),
    education: s(v.education),
    availability: s(v.availability),
    portfolioPdf: s(v.portfolioPdf),
    cvPdf: s(v.cvPdf),
  };
}

export function normalizeHome(v: Loose): HomeContent {
  return {
    eyebrow: s(v.eyebrow),
    heroTitle: s(v.heroTitle),
    ctaTitle: s(v.ctaTitle),
  };
}

export function normalizeAbout(v: Loose): AboutContent {
  const education = Array.isArray(v.education)
    ? arr(v.education).map((e) => ({ period: s(e.period), title: s(e.title), detail: s(e.detail) }))
    : // formato antigo: "trajetória" com ano + texto
      arr(v.timeline).map((t) => ({ period: s(t.year), title: s(t.text), detail: "" }));
  return {
    title: s(v.title) && s(v.title) !== "Escritório" ? s(v.title) : "Sobre",
    portrait: s(v.portrait),
    intro: s(v.intro),
    bio: s(v.bio),
    education,
    experience: arr(v.experience).map((e) => ({ period: s(e.period), title: s(e.title), detail: s(e.detail) })),
    tools: arr(v.tools).map((t) => ({ label: s(t.label), value: s(t.value) })),
    awards: arr(v.awards).map((a) => ({
      year: s(a.year),
      title: [s(a.title), s(a.org)].filter(Boolean).join(" — "),
    })),
  };
}
