import Link from "next/link";
import type { Settings } from "@/lib/types";

export default function Footer({ settings, ctaTitle }: { settings: Settings; ctaTitle: string }) {
  const socials = [
    { label: "LinkedIn", href: settings.linkedin },
    { label: "Instagram", href: settings.instagram },
    { label: "Behance", href: settings.behance },
  ].filter((s) => s.href);

  return (
    <footer className="wrap mt-[clamp(4.5rem,9vw,8rem)]">
      <div className="flex flex-col gap-12 border-t border-ink pt-12 pb-10">
        {ctaTitle && (
          <div className="flex flex-wrap items-end justify-between gap-x-16 gap-y-6">
            <p className="max-w-3xl flex-[1_1_26rem] text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.08] font-medium tracking-[-0.02em]">
              {ctaTitle}
            </p>
            <Link href="/contato" className="btn-solid">
              Entrar em contato →
            </Link>
          </div>
        )}
        <div className="label flex flex-wrap items-center justify-between gap-x-8 gap-y-2">
          <span>
            © {new Date().getFullYear()} {settings.architectName}
            {settings.cau && ` · ${settings.cau}`}
          </span>
          {socials.length > 0 && (
            <span className="flex flex-wrap gap-x-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-h-11 items-center transition-colors hover:text-accent"
                >
                  {s.label} ↗
                </a>
              ))}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
