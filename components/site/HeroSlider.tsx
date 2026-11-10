"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cx, img, pad } from "@/lib/utils";

export interface HeroSlide {
  slug: string;
  title: string;
  location: string;
  year: string;
  cover: string;
}

const INTERVAL = 6000;

export default function HeroSlider({
  slides,
  title,
  subtitle,
}: {
  slides: HeroSlide[];
  title: string;
  subtitle: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % slides.length), INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, slides.length]);

  const current = slides[index];

  return (
    <section
      className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carrossel"
    >
      {slides.map((s, i) => (
        <div
          key={s.slug}
          className={cx(
            "absolute inset-0 transition-opacity duration-[1600ms] ease-out",
            i === index ? "opacity-100" : "opacity-0",
          )}
          aria-hidden={i !== index}
        >
          <img
            src={img(s.cover, 2400)}
            alt={s.title}
            className={cx(
              "h-full w-full object-cover transition-transform duration-[8000ms] ease-out",
              i === index ? "scale-105" : "scale-100",
            )}
            fetchPriority={i === 0 ? "high" : "low"}
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/30" />

      <div className="wrap relative flex h-full flex-col justify-end pb-10 md:pb-14">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <h1 className="max-w-4xl font-display text-[clamp(2.6rem,6.4vw,6.5rem)] leading-[0.98] tracking-[-0.01em]">
              {title}
            </h1>
            {subtitle && <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">{subtitle}</p>}
          </div>

          {current && (
            <div className="flex flex-col gap-4 md:col-span-4 md:items-end md:text-right">
              <Link href={`/projetos/${current.slug}`} className="group block">
                <span className="text-[11px] tracking-[0.16em] text-white/70 uppercase">
                  {pad(index + 1)} / {pad(slides.length)} — Projeto em destaque
                </span>
                <span className="mt-1 block text-lg">
                  <span className="link-line">{current.title}</span>
                </span>
                <span className="block text-sm text-white/70">
                  {current.location} · {current.year}
                </span>
              </Link>
              <div className="flex gap-2" role="tablist" aria-label="Selecionar projeto">
                {slides.map((s, i) => (
                  <button
                    key={s.slug}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={s.title}
                    onClick={() => setIndex(i)}
                    className="relative h-[2px] w-10 overflow-hidden bg-white/30"
                  >
                    <span
                      key={`${index}-${paused}`}
                      className={cx(
                        "absolute inset-y-0 left-0 bg-white",
                        i < index && "w-full",
                        i > index && "w-0",
                      )}
                      style={
                        i === index
                          ? {
                              width: paused ? "100%" : undefined,
                              animation: paused ? undefined : `hero-progress ${INTERVAL}ms linear forwards`,
                            }
                          : undefined
                      }
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes hero-progress { from { width: 0% } to { width: 100% } }`}</style>
    </section>
  );
}
