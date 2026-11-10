import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { readDb } from "@/lib/db";
import { img, pad, paragraphs } from "@/lib/utils";

export const metadata: Metadata = { title: "Escritório" };

export default function AboutPage() {
  const { about, settings } = readDb();
  const clients = about.clients
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div className="pt-32 md:pt-44">
      {/* Intro */}
      <section className="wrap grid gap-10 md:grid-cols-12">
        <h1 className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9] md:col-span-7">{about.title}</h1>
        <p className="self-end text-xl leading-relaxed text-ink-2 md:col-span-5">{about.intro}</p>
      </section>

      {/* Retrato + bio */}
      <section className="wrap mt-20 grid gap-12 md:mt-28 md:grid-cols-12">
        <Reveal className="md:col-span-5">
          <div className="aspect-[4/5] overflow-hidden bg-paper-2">
            {about.portrait && (
              <img
                src={img(about.portrait, 1200)}
                alt={settings.architectName}
                className="h-full w-full object-cover grayscale"
              />
            )}
          </div>
          <p className="mt-3 text-sm text-stone">
            {settings.architectName}
            {settings.cau && ` — Arquiteta e urbanista, ${settings.cau}`}
          </p>
        </Reveal>
        <Reveal className="md:col-span-6 md:col-start-7" delay={100}>
          <p className="eyebrow">Biografia</p>
          <div className="prose-arq mt-6 text-[17px] leading-[1.75] text-ink-2">
            {paragraphs(about.bio).map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {about.timeline.length > 0 && (
            <div className="mt-14">
              <p className="eyebrow mb-4">Trajetória</p>
              <ul className="border-t border-line">
                {about.timeline.map((t, i) => (
                  <li key={i} className="grid grid-cols-[5rem_1fr] gap-4 border-b border-line py-3 text-[15px]">
                    <span className="text-stone tabular-nums">{t.year}</span>
                    <span>{t.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>
      </section>

      {/* Filosofia */}
      <section className="mt-32 bg-paper-2 py-24 md:mt-44 md:py-36">
        <div className="wrap grid gap-10 md:grid-cols-12">
          <Reveal className="md:col-span-3">
            <p className="eyebrow">{about.philosophyTitle}</p>
          </Reveal>
          <Reveal className="space-y-8 md:col-span-8" delay={80}>
            {paragraphs(about.philosophy).map((p, i) => (
              <p key={i} className="font-display text-[clamp(1.7rem,3vw,3rem)] leading-[1.15]">
                {p}
              </p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Processo */}
      {about.process.length > 0 && (
        <section className="wrap mt-32 md:mt-44">
          <div className="mb-12 flex items-end justify-between border-b border-line pb-5">
            <h2 className="font-display text-4xl md:text-5xl">Processo</h2>
            <p className="hidden text-sm text-stone md:block">Do primeiro encontro à entrega da obra</p>
          </div>
          <ol className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-5">
            {about.process.map((step, i) => (
              <Reveal as="li" key={i} delay={i * 60} className="bg-paper p-6 pb-10">
                <span className="font-display text-5xl text-stone/60">{pad(i + 1)}</span>
                <h3 className="mt-6 text-lg font-medium">{step.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-stone">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {/* Imagem do estúdio */}
      {about.studioImage && (
        <section className="wrap mt-32 md:mt-44">
          <Reveal>
            <div className="aspect-[21/9] overflow-hidden bg-paper-2">
              <img src={img(about.studioImage, 2400)} alt="Estúdio" loading="lazy" className="h-full w-full object-cover" />
            </div>
          </Reveal>
        </section>
      )}

      {/* Reconhecimento + clientes */}
      <section className="wrap mt-32 grid gap-16 md:mt-44 md:grid-cols-12">
        {about.awards.length > 0 && (
          <div className="md:col-span-7">
            <p className="eyebrow mb-4">Prêmios e reconhecimentos</p>
            <ul className="border-t border-line">
              {about.awards.map((a, i) => (
                <li key={i} className="grid grid-cols-[4rem_1fr] gap-4 border-b border-line py-4 md:grid-cols-[5rem_1fr_10rem]">
                  <span className="text-stone tabular-nums">{a.year}</span>
                  <span>{a.title}</span>
                  <span className="col-start-2 text-sm text-stone md:col-start-auto md:text-right">{a.org}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {clients.length > 0 && (
          <div className="md:col-span-4 md:col-start-9">
            <p className="eyebrow mb-4">Clientes e parceiros</p>
            <ul className="border-t border-line">
              {clients.map((c) => (
                <li key={c} className="border-b border-line py-4">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="wrap mt-32 text-center">
        <p className="font-display text-4xl md:text-6xl">Tem um projeto em mente?</p>
        <Link href="/contato" className="mt-8 inline-flex bg-ink px-7 py-4 text-sm text-paper">
          Fale com o escritório →
        </Link>
      </section>
    </div>
  );
}
