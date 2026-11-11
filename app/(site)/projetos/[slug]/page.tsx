import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/site/Gallery";
import Reveal from "@/components/site/Reveal";
import PreviewBanner from "@/components/site/PreviewBanner";
import { getSession } from "@/lib/auth";
import { getCategories, getProjectBySlug, getPublishedProjects } from "@/lib/db";
import { PROJECT_STATUS_LABEL } from "@/lib/types";
import { img, paragraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProjectBySlug(slug);
  if (!p) return {};
  if (!p.published) return { title: p.title, robots: { index: false } };
  return {
    title: p.title,
    description: p.summary,
    openGraph: { images: p.cover ? [img(p.cover, 1200)] : [] },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  // Rascunhos só aparecem para quem está logado no CMS (pré-visualização).
  const preview = !project.published;
  if (preview && !(await getSession())) notFound();

  const [categories, all] = await Promise.all([getCategories(), getPublishedProjects()]);
  const category = categories.find((c) => c.id === project.categoryId);
  const idx = all.findIndex((p) => p.id === project.id);
  const next = all.length ? all[(idx + 1) % all.length] : undefined;

  const facts = [
    ["Local", project.location],
    ["Ano", project.year],
    ["Área", project.area],
    ["Tipologia", category?.name],
    ["Status", PROJECT_STATUS_LABEL[project.status]],
    ["Cliente", project.client],
    ["Equipe", project.team],
    ["Fotografia", project.photographer],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <article>
      {preview && <PreviewBanner editHref={`/admin/projetos/${project.id}`} />}
      {/* Capa */}
      <section className="relative h-[92svh] min-h-[520px] overflow-hidden bg-ink text-white">
        <img
          src={img(project.cover, 2400)}
          alt={project.title}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-black/30" />
        <div className="wrap relative flex h-full flex-col justify-end pb-10 md:pb-14">
          <p className="text-[11px] tracking-[0.16em] text-white/75 uppercase">
            {category?.name} · {project.location}
          </p>
          <h1 className="mt-3 font-display text-[clamp(3rem,8vw,8.5rem)] leading-[0.92]">{project.title}</h1>
          {project.subtitle && <p className="mt-4 max-w-xl text-lg text-white/80">{project.subtitle}</p>}
        </div>
      </section>

      {/* Ficha técnica + texto */}
      <section className="wrap grid gap-14 py-20 md:grid-cols-12 md:py-28">
        <aside className="md:col-span-4 lg:col-span-3">
          <dl className="sticky top-28 divide-y divide-line border-y border-line text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-3 gap-3 py-3">
                <dt className="text-stone">{k}</dt>
                <dd className="col-span-2">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className="md:col-span-8 lg:col-span-7 lg:col-start-5">
          {project.summary && (
            <Reveal>
              <p className="font-display text-[clamp(1.7rem,2.8vw,2.7rem)] leading-[1.15]">{project.summary}</p>
            </Reveal>
          )}
          <Reveal className="prose-arq mt-10 max-w-2xl text-[17px] leading-[1.75] text-ink-2" delay={80}>
            {paragraphs(project.description).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Galeria */}
      <section className="wrap">
        <Gallery images={project.gallery} />
      </section>

      {/* Próximo projeto */}
      {next && next.id !== project.id && (
        <section className="wrap mt-28">
          <Link href={`/projetos/${next.slug}`} className="group grid items-end gap-6 border-t border-line pt-8 md:grid-cols-12">
            <div className="md:col-span-6">
              <p className="eyebrow">Próximo projeto</p>
              <p className="mt-3 font-display text-5xl leading-none md:text-7xl">
                <span className="link-line">{next.title}</span>
              </p>
              <p className="mt-3 text-sm text-stone">
                {next.location} · {next.year}
              </p>
            </div>
            <div className="img-zoom aspect-[16/9] overflow-hidden bg-paper-2 md:col-span-6">
              <img src={img(next.cover, 1400)} alt="" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Link>
        </section>
      )}
    </article>
  );
}
