import Link from "next/link";

/** Faixa exibida quando a administradora visualiza um rascunho no site. */
export default function PreviewBanner({ editHref }: { editHref: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] flex items-center justify-center gap-4 bg-amber-100 px-4 py-2.5 text-[13px] text-amber-950 shadow-[0_-1px_0_rgba(0,0,0,0.08)]">
      <span>
        <strong className="font-medium">Pré-visualização de rascunho</strong> — visível apenas para você.
      </span>
      <Link href={editHref} className="underline underline-offset-2">
        Voltar ao CMS
      </Link>
    </div>
  );
}
