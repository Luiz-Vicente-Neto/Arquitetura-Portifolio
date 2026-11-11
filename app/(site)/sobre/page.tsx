import type { Metadata } from "next";
import Link from "next/link";
import Shot from "@/components/site/Shot";
import { getAbout, getSettings } from "@/lib/db";
import type { PeriodItem } from "@/lib/types";
import { pad, paragraphs } from "@/lib/utils";

export const metadata: Metadata = { title: "Sobre e currículo" };

function PeriodList({ items }: { items: PeriodItem[] }) {
  return (
    <ul className="min-w-0 flex-[1_1_32rem] border-t border-ink">
      {items.map((it, i) => (
        <li key={i} className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line py-[1.1rem]">
          <span className="flex-[0_0_9rem] pt-[3px] font-mono text-[13px] text-stone">{it.period}</span>
          <span className="flex flex-[1_1_20rem] flex-col gap-0.5">
            <span className="text-lg font-medium">{it.title}</span>
            {it.detail && <span className="text-stone">{it.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);

  let n = 0;
  const heading = (title: string) => (
    <h2 className="label flex-[0_0_13.75rem] !font-medium !text-ink">
      <span className="text-accent">{pad(++n)}</span> · {title}
    </h2>
  );
  const block = "flex flex-wrap items-start gap-x-12 gap-y-5 pt-[clamp(3.5rem,7vw,6rem)]";

  return (
    <div className="wrap">
      <section className="flex flex-wrap items-start gap-x-16 gap-y-10 pt-[clamp(3rem,7vw,6rem)]">
        <div className="flex max-w-[27.5rem] flex-[1_1_19rem] flex-col gap-2.5">
          <Shot src={about.portrait} alt={settings.architectName} className="aspect-[4/5]" width={1200} eager />
          <span className="font-mono text-xs text-stone">
            {[settings.architectName, settings.city].filter(Boolean).join(" · ")}
          </span>
        </div>
        <div className="flex flex-[2_1_28rem] flex-col items-start gap-7">
          <h1 className="text-[clamp(2.75rem,7vw,6rem)] leading-none font-medium tracking-[-0.03em]">{about.title}</h1>
          {about.intro && (
            <p className="text-[clamp(1.35rem,2.4vw,2rem)] leading-[1.3] tracking-[-0.01em]">{about.intro}</p>
          )}
          {about.bio && (
            <div className="prose-arq max-w-[40rem] text-lg leading-[1.6] text-ink-2">
              {paragraphs(about.bio).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {settings.cvPdf && (
              <a href={settings.cvPdf} target="_blank" rel="noreferrer" className="btn-solid">
                Baixar currículo (PDF) ↓
              </a>
            )}
            <Link href="/contato" className="btn-outline">
              Entrar em contato →
            </Link>
          </div>
        </div>
      </section>

      {about.education.length > 0 && (
        <section className={block}>
          {heading("Formação")}
          <PeriodList items={about.education} />
        </section>
      )}

      {about.experience.length > 0 && (
        <section className={block}>
          {heading("Experiência")}
          <PeriodList items={about.experience} />
        </section>
      )}

      {about.tools.length > 0 && (
        <section className={block}>
          {heading("Ferramentas")}
          <div className="carimbo min-w-0 flex-[1_1_32rem]">
            {about.tools.map((t, i) => (
              <div key={i}>
                <span className="label !text-[11px]">{t.label}</span>
                <span>{t.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {about.awards.length > 0 && (
        <section className={block}>
          {heading("Reconhecimentos")}
          <ul className="min-w-0 flex-[1_1_32rem] border-t border-ink">
            {about.awards.map((a, i) => (
              <li key={i} className="flex flex-wrap gap-x-6 gap-y-1 border-b border-line py-[1.1rem]">
                <span className="flex-[0_0_9rem] pt-[3px] font-mono text-[13px] text-stone">{a.year}</span>
                <span className="flex-[1_1_20rem] text-lg">{a.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
