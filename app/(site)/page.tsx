import Link from "next/link";
import Shot from "@/components/site/Shot";
import { getAbout, getCategories, getHome, getPublishedProjects, getSettings } from "@/lib/db";
import { pad } from "@/lib/utils";

export default async function HomePage() {
  const [home, about, settings, projects, categories] = await Promise.all([
    getHome(),
    getAbout(),
    getSettings(),
    getPublishedProjects(),
    getCategories(),
  ]);
  const catName = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  // Capa: o primeiro projeto marcado como destaque (ou o primeiro da lista).
  const lead = projects.find((p) => p.featured) ?? projects[0];
  const others = projects.filter((p) => p.id !== lead?.id).slice(0, 6);
  const number = (id: string) => pad(projects.findIndex((p) => p.id === id) + 1);
  const hasDownloads = settings.portfolioPdf || settings.cvPdf;

  return (
    <div className="wrap">
      {/* Apresentação */}
      <section className="flex flex-col gap-8 pt-[clamp(3.5rem,9vw,8rem)] pb-14">
        {home.eyebrow && <p className="label">{home.eyebrow}</p>}
        <h1 className="max-w-[68rem] text-[clamp(2.1rem,5.2vw,4.5rem)] leading-[1.04] font-medium tracking-[-0.02em]">
          {home.heroTitle}
        </h1>
      </section>

      {/* Carimbo */}
      <section aria-label="Resumo" className="carimbo">
        {settings.education && (
          <div>
            <span className="label !text-[11px]">Formação</span>
            <span>{settings.education}</span>
          </div>
        )}
        {settings.availability && (
          <div>
            <span className="label !text-[11px]">Disponibilidade</span>
            <span className="flex items-baseline gap-2.5">
              <span aria-hidden className="inline-block h-[9px] w-[9px] flex-none bg-accent" />
              <span>{settings.availability}</span>
            </span>
          </div>
        )}
        <div>
          <span className="label !text-[11px]">Contato</span>
          <span className="flex flex-col">
            {settings.email && (
              <Link href="/contato" className="hover:text-accent">
                {settings.email}
              </Link>
            )}
            {settings.linkedin && (
              <a href={settings.linkedin} target="_blank" rel="noreferrer" className="hover:text-accent">
                LinkedIn ↗
              </a>
            )}
            {settings.city && <span className="text-stone">{settings.city}</span>}
          </span>
        </div>
        {hasDownloads && (
          <div>
            <span className="label !text-[11px]">Downloads</span>
            <span className="flex flex-col">
              {settings.portfolioPdf && (
                <a href={settings.portfolioPdf} target="_blank" rel="noreferrer" className="hover:text-accent">
                  Portfólio em PDF ↓
                </a>
              )}
              {settings.cvPdf && (
                <a href={settings.cvPdf} target="_blank" rel="noreferrer" className="hover:text-accent">
                  Currículo em PDF ↓
                </a>
              )}
            </span>
          </div>
        )}
      </section>

      {/* Projeto de capa */}
      {lead && (
        <section className="flex flex-col gap-7 pt-[clamp(4.5rem,9vw,8rem)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="label !font-medium !text-ink">
              <span className="text-accent">{number(lead.id)}</span>
              {(lead.context || catName[lead.categoryId]) && ` · ${lead.context || catName[lead.categoryId]}`}
            </h2>
            <span className="label">{lead.year}</span>
          </div>
          <Link href={`/projetos/${lead.slug}`} aria-label={`Ver o projeto ${lead.title}`} className="block">
            <Shot src={lead.cover} alt={lead.title} className="aspect-video" width={2400} eager />
          </Link>
          <div className="flex flex-wrap items-start gap-x-16 gap-y-6">
            <h3 className="flex-[1_1_22rem] text-[clamp(1.75rem,3.4vw,2.75rem)] leading-[1.08] font-medium tracking-[-0.015em]">
              {lead.title}
            </h3>
            <div className="flex flex-[1_1_22rem] flex-col items-start gap-5">
              {(lead.subtitle || lead.summary) && (
                <p className="text-lg leading-[1.55] text-ink-2">{lead.subtitle || lead.summary}</p>
              )}
              <p className="label">
                {[lead.program, lead.location, lead.advisor && `Orientação: ${lead.advisor}`].filter(Boolean).join(" · ")}
              </p>
              <Link href={`/projetos/${lead.slug}`} className="link-under">
                Ver o projeto completo →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Índice */}
      {others.length > 0 && (
        <section className="flex flex-col pt-[clamp(4.5rem,9vw,8rem)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-ink pb-4">
            <h2 className="text-[clamp(1.6rem,3vw,2.5rem)] font-medium tracking-[-0.015em]">Projetos selecionados</h2>
            <Link href="/projetos" className="flex min-h-11 items-center text-[15px] hover:text-accent">
              Ver todos ({projects.length}) →
            </Link>
          </div>
          {others.map((p) => (
            <Link
              key={p.id}
              href={`/projetos/${p.slug}`}
              className="group flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-line py-[1.1rem] transition-colors hover:bg-paper-2"
            >
              <span className="flex-[0_0_2.25rem] font-mono text-[13px] text-stone">{number(p.id)}</span>
              <Shot src={p.cover} className="h-20 flex-[0_0_7.5rem]" width={400} />
              <span className="flex flex-[4_1_17rem] flex-col gap-0.5">
                <span className="text-xl font-medium transition-colors group-hover:text-accent">{p.title}</span>
                {p.program && <span className="text-[15px] text-stone">{p.program}</span>}
              </span>
              <span className="label flex-[1_1_8rem]">{catName[p.categoryId]}</span>
              <span className="flex-[2_1_12rem] text-[15px] text-stone">{p.context}</span>
              <span className="flex-[0_0_3.5rem] text-right font-mono text-[13px] text-stone">{p.year}</span>
            </Link>
          ))}
        </section>
      )}

      {/* Sobre */}
      {(about.intro || about.portrait) && (
        <section className="flex flex-wrap items-start gap-x-16 gap-y-8 pt-[clamp(4.5rem,9vw,8rem)]">
          <Shot src={about.portrait} alt={settings.architectName} className="aspect-[4/5] max-w-[25rem] flex-[1_1_17rem]" width={1000} />
          <div className="flex flex-[2_1_26rem] flex-col items-start gap-6">
            <h2 className="label">Sobre</h2>
            <p className="text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.3] tracking-[-0.01em]">{about.intro}</p>
            <div className="flex flex-wrap gap-x-7 gap-y-1">
              <Link href="/sobre" className="link-under">
                Formação e currículo →
              </Link>
              {settings.cvPdf && (
                <a href={settings.cvPdf} target="_blank" rel="noreferrer" className="flex min-h-11 items-center hover:text-accent">
                  Baixar CV em PDF ↓
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
