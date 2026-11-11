import Link from "next/link";
import HeroSlider from "@/components/site/HeroSlider";
import ProjectCard from "@/components/site/ProjectCard";
import Reveal from "@/components/site/Reveal";
import { getCategories, getHome, getPublishedPosts, getPublishedProjects } from "@/lib/db";
import { POST_TYPE_LABEL } from "@/lib/types";
import { formatDate, img, pad } from "@/lib/utils";

export default async function HomePage() {
  const [home, projects, categories, allPosts] = await Promise.all([
    getHome(),
    getPublishedProjects(),
    getCategories(),
    getPublishedPosts(),
  ]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const featured = projects.filter((p) => p.featured);
  const heroSlides = (featured.length ? featured : projects).slice(0, 5);
  const selection = (featured.length >= 3 ? featured : projects).slice(0, 5);
  const posts = allPosts.slice(0, 3);

  return (
    <>
      <HeroSlider
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        slides={heroSlides.map((p) => ({
          slug: p.slug,
          title: p.title,
          location: p.location,
          year: p.year,
          cover: p.cover,
        }))}
      />

      {/* Manifesto */}
      <section className="wrap py-28 md:py-40">
        <div className="grid gap-8 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="eyebrow">O estúdio</p>
          </Reveal>
          <Reveal className="md:col-span-9" delay={80}>
            <p className="font-display text-[clamp(1.9rem,3.6vw,3.6rem)] leading-[1.12] tracking-[-0.005em]">
              {home.statement}
            </p>
            <Link href="/escritorio" className="mt-10 inline-flex items-center gap-2 text-sm">
              <span className="link-line">Conheça o escritório</span> <span>→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Projetos selecionados — grade assimétrica */}
      <section className="wrap">
        <div className="mb-10 flex items-end justify-between border-b border-line pb-5">
          <h2 className="font-display text-4xl md:text-5xl">Projetos selecionados</h2>
          <Link href="/projetos" className="hidden text-sm md:inline-flex">
            <span className="link-line">Ver todos os projetos</span>&nbsp;→
          </Link>
        </div>

        <div className="grid gap-x-6 gap-y-16 md:grid-cols-12">
          {selection.map((p, i) => {
            const layout = [
              "md:col-span-7",
              "md:col-span-4 md:col-start-9 md:mt-40",
              "md:col-span-5 md:col-start-2",
              "md:col-span-6 md:col-start-7 md:mt-24",
              "md:col-span-8 md:col-start-3",
            ][i % 5];
            const aspect = i === 0 || i === 4 ? "aspect-[3/2]" : "aspect-[4/5]";
            return (
              <Reveal key={p.id} className={layout}>
                <ProjectCard project={p} categoryName={catName[p.categoryId]} aspect={aspect} sizes={1800} />
              </Reveal>
            );
          })}
        </div>

        <div className="mt-16 text-center md:hidden">
          <Link href="/projetos" className="inline-flex border border-ink px-6 py-3 text-sm">
            Ver todos os projetos →
          </Link>
        </div>
      </section>

      {/* Atuação */}
      <section className="wrap mt-32 md:mt-48">
        <div className="grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="eyebrow">{home.servicesTitle}</p>
          </Reveal>
          <div className="md:col-span-9">
            <ul className="grid border-t border-line sm:grid-cols-2">
              {home.services.map((s, i) => (
                <Reveal
                  as="li"
                  key={s.title}
                  delay={i * 60}
                  className="border-b border-line py-8 sm:odd:border-r sm:odd:pr-8 sm:even:pl-8"
                >
                  <span className="text-sm text-stone tabular-nums">{pad(i + 1)}</span>
                  <h3 className="mt-3 text-xl font-medium">{s.title}</h3>
                  <p className="mt-2 max-w-sm text-[15px] leading-relaxed text-stone">{s.text}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Sobre — teaser */}
      <section className="wrap mt-32 md:mt-48">
        <div className="grid items-center gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-6">
            <div className="img-zoom aspect-[4/3] overflow-hidden bg-paper-2">
              <img
                src={img(home.aboutTeaserImage, 1600)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal className="md:col-span-5 md:col-start-8" delay={100}>
            <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">{home.aboutTeaserTitle}</h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-2">{home.aboutTeaserText}</p>
            <Link href="/escritorio" className="mt-8 inline-flex items-center gap-2 text-sm">
              <span className="link-line">Sobre o escritório</span> <span>→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Jornal */}
      {home.showJournal && posts.length > 0 && (
        <section className="wrap mt-32 md:mt-48">
          <div className="mb-10 flex items-end justify-between border-b border-line pb-5">
            <h2 className="font-display text-4xl md:text-5xl">Jornal</h2>
            <Link href="/jornal" className="text-sm">
              <span className="link-line">Todas as publicações</span>&nbsp;→
            </Link>
          </div>
          <div className="grid gap-10 md:grid-cols-3">
            {posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 80}>
                <Link href={`/jornal/${post.slug}`} className="group block">
                  <div className="img-zoom aspect-[3/2] overflow-hidden bg-paper-2">
                    {post.cover && (
                      <img src={img(post.cover, 900)} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <p className="eyebrow mt-4">
                    {POST_TYPE_LABEL[post.type]} · {formatDate(post.date, { month: "short", year: "numeric" })}
                  </p>
                  <h3 className="mt-2 text-lg leading-snug">
                    <span className="link-line">{post.title}</span>
                  </h3>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="wrap mt-32 md:mt-48">
        <Reveal className="bg-ink px-6 py-20 text-paper md:px-16 md:py-28">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <h2 className="font-display text-[clamp(2.4rem,5vw,5rem)] leading-[1] md:col-span-8">{home.ctaTitle}</h2>
            <div className="md:col-span-4">
              <p className="text-paper/70">{home.ctaText}</p>
              <Link
                href="/contato"
                className="mt-6 inline-flex items-center gap-3 bg-paper px-7 py-4 text-sm text-ink transition-opacity hover:opacity-90"
              >
                Iniciar conversa →
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
