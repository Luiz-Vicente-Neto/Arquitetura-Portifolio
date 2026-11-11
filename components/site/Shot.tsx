import { cx, img } from "@/lib/utils";

/**
 * Moldura de imagem com proporção fixa. Sem imagem, mostra a área hachurada —
 * assim o layout se mantém enquanto o conteúdo ainda não foi enviado pelo CMS.
 */
export default function Shot({
  src,
  alt = "",
  className,
  width = 1600,
  contain,
  eager,
}: {
  src: string;
  alt?: string;
  /** Inclua a proporção, ex.: "aspect-video". */
  className?: string;
  width?: number;
  /** Mostra a imagem inteira, sem cortar (desenhos e diagramas). */
  contain?: boolean;
  eager?: boolean;
}) {
  return (
    <div className={cx("relative overflow-hidden", src ? "bg-paper-2" : "hatch", className)}>
      {src && (
        <img
          src={img(src, width)}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : undefined}
          className={cx("absolute inset-0 h-full w-full", contain ? "object-contain" : "object-cover")}
        />
      )}
    </div>
  );
}
