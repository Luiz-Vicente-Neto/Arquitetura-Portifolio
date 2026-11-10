"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";
import { cx, img, pad } from "@/lib/utils";
import Reveal from "./Reveal";

/** Agrupa imagens "half" em pares lado a lado; "full" ocupam a largura toda. */
function rows(images: GalleryImage[]) {
  const out: GalleryImage[][] = [];
  let pending: GalleryImage | null = null;
  for (const im of images) {
    if (im.layout === "half") {
      if (pending) {
        out.push([pending, im]);
        pending = null;
      } else pending = im;
    } else {
      if (pending) {
        out.push([pending]);
        pending = null;
      }
      out.push([im]);
    }
  }
  if (pending) out.push([pending]);
  return out;
}

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="space-y-4 md:space-y-6">
        {rows(images).map((row) => (
          <div key={row[0].id} className={cx("grid gap-4 md:gap-6", row.length === 2 && "md:grid-cols-2")}>
            {row.map((im) => {
              const idx = images.indexOf(im);
              return (
                <Reveal key={im.id}>
                  <figure>
                    <button
                      type="button"
                      onClick={() => setOpen(idx)}
                      className={cx(
                        "img-zoom block w-full cursor-zoom-in overflow-hidden bg-paper-2",
                        row.length === 2 || im.layout === "half" ? "aspect-[4/5]" : "aspect-[16/10]",
                      )}
                      aria-label={`Ampliar imagem: ${im.caption || `imagem ${idx + 1}`}`}
                    >
                      <img
                        src={img(im.url, row.length === 2 ? 1400 : 2400)}
                        alt={im.caption}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </button>
                    {im.caption && (
                      <figcaption className="mt-2.5 flex gap-3 text-[13px] text-stone">
                        <span className="tabular-nums">{pad(idx + 1)}</span>
                        <span>{im.caption}</span>
                      </figcaption>
                    )}
                  </figure>
                </Reveal>
              );
            })}
          </div>
        ))}
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink/97 text-paper"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de imagens"
          onClick={close}
        >
          <div className="flex items-center justify-between px-5 py-4 text-sm md:px-8">
            <span className="tabular-nums text-paper/70">
              {pad(open + 1)} / {pad(images.length)}
            </span>
            <button type="button" onClick={close} className="link-line">
              Fechar
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <img
              src={img(images[open].url, 2400)}
              alt={images[open].caption}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute inset-y-0 left-0 w-1/4 cursor-w-resize"
              aria-label="Imagem anterior"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute inset-y-0 right-0 w-1/4 cursor-e-resize"
              aria-label="Próxima imagem"
            />
          </div>
          <p className="px-5 py-5 text-center text-sm text-paper/70 md:px-8">{images[open].caption}</p>
        </div>
      )}
    </>
  );
}
