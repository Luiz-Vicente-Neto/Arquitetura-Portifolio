import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/site/Gallery";
import PreviewBanner from "@/components/site/PreviewBanner";
import Shot from "@/components/site/Shot";
import { getSession } from "@/lib/auth";
import { getCategories, getProjectBySlug, getPublishedProjects, getSettings } from "@/lib/db";
import type { GalleryImage, GallerySection } from "@/lib/types";
import { img, pad, paragraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  if (!p.published) return { title: p.title, robots: { index: false } };
  return {
    title: p.title,
    description: p.subtitle || p.summary,
    openGraph: { images: p.cover ? [img(p.cover, 1200)] : [] },
  };
}

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`prose-arq ${className ?? ""}`}>
      {paragraphs(text).map((p, i) => (
        <p key={i} className="whitespace-pre-line">
          {p}
        </p>
      ))}
    </div>
  );
}

/** Título de bloco numerado: "02 · Lugar". */
function BlockTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <h2 className="label !font-medium !text-ink">
      <span className="text-accent">{pad(n)}</span> · {children}
    </h2>
  );
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  // Rascunhos só aparecem para quem está logado no CMS (pré-visualização).
  const preview = !project.published;
  if (preview && !(await getSession())) notFound();

  const [categories, all, settings] = await Promise.all([getCategories(), getPublishedProjects(), getSettings()]);
  const category = categories.find((c) => c.id === project.categoryId);
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : undefined;

  // Imagens por bloco, com numeração contínua de figuras ao longo da página.
  const order: GallerySection[] = ["lugar", "partido", "desenhos", "processo", "finais"];
  const bySection = {} as Record<GallerySection, { images: GalleryImage[]; start: number }>;
  let count = 0;
  for (const sec of order) {
    const images = project.gallery.filter((g) => g.section === sec);
    bySection[sec] = { images, start: count };
    count += images.length;
  }

  const facts = [
    ["Tipo", [category?.name, project.program].filter(Boolean).join(" · ")],
    ["Contexto", project.context],
    ["Local", project.location],
    ["Ano", project.year],
    ["Orientação", project.advisor],
    ["Autoria", project.authorship],
    ["Escala", project.area],
    ["Ferramentas", project.tools],
  ].filter(([, v]) => v) as [string, string][];

  // Blocos sem texto e sem imagens ficam ocultos; a numeração segue só os visíveis.
  const show = {
    problema: !!project.summary,
    lugar: !!project.siteText || bySection.lugar.images.length > 0,
    partido: !!project.conceptText || bySection.partido.images.length > 0,
    desenhos: !!project.constructionText || bySection.desenhos.images.length > 0,
    processo: !!project.processText || bySection.processo.images.length > 0,
    finais: bySection.finais.images.length > 0,
  };
  let n = 0;
  const num = () => ++n;
  const block = "flex flex-wrap items-start gap-x-12 gap-y-5 pt-[clamp(4rem,8vw,7rem)]";
  const aside = "flex flex-[0_0_13.75rem] flex-col gap-3";
  const main = "min-w-0 flex-[1_1_32rem]";

  return (
    <article className="wrap">
      {preview && <PreviewBanner editHref={`/admin/projetos/${project.id}`} />}

      <div className="label flex flex-wrap justify-between gap-x-6 pt-3">
        <Link href="/projetos" className="flex min-h-11 items-center hover:text-accent">
          ← Todos os projetos
        </Link>
        {idx >= 0 && (
          <span className="flex min-h-11 items-center">
            <span className="text-accent">{pad(idx + 1)}</span>&nbsp;/ {pad(all.length)}
            {category && ` · ${category.name}`}
          </span>
        )}
      </div>

      <header className="flex flex-col gap-5 pt-[clamp(2rem,5vw,4.5rem)] pb-10">
        <h1 className="max-w-[62rem] text-[clamp(2.5rem,6.4vw,5.5rem)] leading-none font-medium tracking-[-0.03em]">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="max-w-[45rem] text-[clamp(1.2rem,2vw,1.5rem)] leading-[1.4] text-ink-2">{project.subtitle}</p>
        )}
      </header>

      <Shot src={project.cover} alt={project.title} className="aspect-video" width={2400} eager />

      {(facts.length > 0 || project.pdfUrl) && (
        <section aria-label="Ficha do projeto" className="carimbo mt-8">
          {facts.map(([k, v]) => (
            <div key={k}>
              <span className="label !text-[11px]">{k}</span>
              <span>{v}</span>
            </div>
          ))}
          {project.pdfUrl && (
            <div>
              <span className="label !text-[11px]">Caderno</span>
              <a href={project.pdfUrl} target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-accent">
                Baixar PDF ↓
              </a>
            </div>
          )}
        </section>
      )}

      {show.problema && (
        <section className={block}>
          <div className={aside}>
            <BlockTitle n={num()}>Problema</BlockTitle>
          </div>
          <p className={`${main} max-w-[48rem] text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.3] tracking-[-0.01em] whitespace-pre-line`}>
            {project.summary}
          </p>
        </section>
      )}

      {show.lugar && (
        <section className={block}>
          <div className={aside}>
            <BlockTitle n={num()}>Lugar</BlockTitle>
            <Paragraphs text={project.siteText} className="text-[15px] text-stone" />
          </div>
          <div className={main}>
            <Gallery images={bySection.lugar.images} startIndex={bySection.lugar.start} fit="natural" />
          </div>
        </section>
      )}

      {show.partido && (
        <section className={block}>
          <div className={aside}>
            <BlockTitle n={num()}>Partido</BlockTitle>
            <Paragraphs text={project.conceptText} className="text-[15px] text-stone" />
          </div>
          <div className={main}>
            <Gallery images={bySection.partido.images} startIndex={bySection.partido.start} variant="grid" fit="contain" />
          </div>
        </section>
      )}

      {show.desenhos && (
        <section className="flex flex-col gap-6 pt-[clamp(4rem,8vw,7rem)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
            <BlockTitle n={num()}>Desenhos</BlockTitle>
            {bySection.desenhos.images.length > 0 && (
              <span className="text-[15px] text-stone">Clique em um desenho para ampliar</span>
            )}
          </div>
          <Gallery images={bySection.desenhos.images} startIndex={bySection.desenhos.start} fit="natural" />
          {project.constructionText && (
            <div className="flex max-w-[45rem] flex-col gap-4 pt-2">
              <h3 className="text-[1.4rem] font-medium">Como se constrói</h3>
              <Paragraphs text={project.constructionText} className="text-[17px] leading-[1.6] text-ink-2" />
            </div>
          )}
        </section>
      )}

      {show.processo && (
        <section className={block}>
          <div className={aside}>
            <BlockTitle n={num()}>Processo</BlockTitle>
            <Paragraphs text={project.processText} className="text-[15px] text-stone" />
          </div>
          <div className={main}>
            <Gallery images={bySection.processo.images} startIndex={bySection.processo.start} variant="grid" />
          </div>
        </section>
      )}

      {show.finais && (
        <section className="flex flex-col gap-6 pt-[clamp(4rem,8vw,7rem)]">
          <div className="border-b border-ink pb-4">
            <BlockTitle n={num()}>Imagens finais</BlockTitle>
          </div>
          <Gallery images={bySection.finais.images} startIndex={bySection.finais.start} />
        </section>
      )}

      {(project.credits || project.pdfUrl) && (
        <section className="mt-[clamp(4rem,8vw,7rem)] flex flex-wrap items-start justify-between gap-x-16 gap-y-6 bg-paper-2 p-[clamp(1.5rem,4vw,3rem)]">
          <div className="flex flex-[1_1_24rem] flex-col gap-2.5">
            <h2 className="label">Créditos</h2>
            <p className="leading-[1.6] whitespace-pre-line">
              {project.credits || `Projeto, desenhos e imagens: ${settings.architectName}.`}
            </p>
          </div>
          {project.pdfUrl && (
            <a href={project.pdfUrl} target="_blank" rel="noreferrer" className="btn-solid">
              Baixar caderno (PDF) ↓
            </a>
          )}
        </section>
      )}

      {next && next.id !== project.id && (
        <Link
          href={`/projetos/${next.slug}`}
          className="group mt-[clamp(4rem,8vw,7rem)] flex flex-wrap items-center justify-between gap-x-12 gap-y-6 border-t border-ink pt-8"
        >
          <span className="flex flex-[1_1_24rem] flex-col gap-2">
            <span className="label">
              Próximo projeto · {pad(all.findIndex((p) => p.id === next.id) + 1)} / {pad(all.length)}
            </span>
            <span className="text-[clamp(2rem,4.6vw,4rem)] leading-[1.02] font-medium tracking-[-0.025em] transition-colors group-hover:text-accent">
              {next.title} →
            </span>
            {next.program && <span className="text-stone">{next.program}</span>}
          </span>
          <Shot src={next.cover} className="aspect-video max-w-[30rem] flex-[1_1_20rem]" width={1200} />
        </Link>
      )}
    </article>
  );
}
