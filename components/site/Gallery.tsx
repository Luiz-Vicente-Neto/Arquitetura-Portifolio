"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";
import { cx, img, pad } from "@/lib/utils";

/** Agrupa imagens "half" em pares lado a lado; "full" ocupam a largura toda. */
function toRows(images: GalleryImage[]) {
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

export default function Gallery({
  images,
  startIndex = 0,
  variant = "rows",
  fit = "cover",
}: {
  images: GalleryImage[];
  /** Quantas figuras vieram antes na página, para a numeração "Fig. NN" continuar. */
  startIndex?: number;
  /** "rows": largura total ou pares. "grid": miniaturas quadradas (diagramas, processo). */
  variant?: "rows" | "grid";
  /** "natural" mostra o desenho inteiro na proporção original; "cover" recorta numa moldura. */
  fit?: "natural" | "cover" | "contain";
}) {
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

  const figure = (im: GalleryImage, frame: string, width: number) => {
    const idx = images.indexOf(im);
    const n = pad(startIndex + idx + 1);
    return (
      <figure key={im.id} className="flex min-w-0 flex-col gap-2">
        <button
          type="button"
          onClick={() => setOpen(idx)}
          className={cx("relative block w-full cursor-zoom-in overflow-hidden bg-paper-2", fit !== "natural" && frame)}
          aria-label={`Ampliar figura ${n}${im.caption ? `: ${im.caption}` : ""}`}
        >
          <img
            src={img(im.url, width)}
            alt={im.caption}
            loading="lazy"
            className={cx(
              fit === "natural" ? "block h-auto w-full" : "absolute inset-0 h-full w-full",
              fit === "cover" && "object-cover",
              fit === "contain" && "object-contain",
            )}
          />
        </button>
        <figcaption className="font-mono text-xs text-stone">
          Fig. {n}
          {im.caption && ` — ${im.caption}`}
        </figcaption>
      </figure>
    );
  };

  return (
    <>
      {variant === "grid" ? (
        // auto-fill (e não auto-fit): uma imagem sozinha continua do tamanho de miniatura.
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,12rem),1fr))] gap-4">
          {images.map((im) => figure(im, "aspect-square", 800))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {toRows(images).map((row) => (
            <div key={row[0].id} className={cx("grid items-start gap-6", row.length === 2 && "md:grid-cols-2")}>
              {row.map((im) => figure(im, row.length === 2 ? "aspect-[4/3]" : "aspect-video", row.length === 2 ? 1400 : 2400))}
            </div>
          ))}
        </div>
      )}

      {open !== null && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-ink/97 text-paper"
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
          onClick={close}
        >
          <div className="flex items-center justify-between px-5 py-2 font-mono text-xs md:px-8">
            <span className="text-paper/70">
              Fig. {pad(startIndex + open + 1)} · {open + 1} de {images.length}
            </span>
            <button type="button" onClick={close} className="flex min-h-11 items-center underline underline-offset-4">
              Fechar
            </button>
          </div>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-20">
            <img
              src={img(images[open].url, 2400)}
              alt={images[open].caption}
              className="max-h-full max-w-full bg-paper object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
              <>
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
              </>
            )}
          </div>
          <p className="px-5 py-5 text-center text-sm text-paper/75 md:px-8">{images[open].caption}</p>
        </div>
      )}
    </>
  );
}
