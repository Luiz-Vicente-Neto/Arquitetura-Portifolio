"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/projetos", label: "Projetos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];

export default function Header({
  name,
  subtitle,
  portfolioPdf,
}: {
  name: string;
  subtitle: string;
  portfolioPdf: string;
}) {
  const pathname = usePathname();

  return (
    <header className="wrap">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-b border-ink py-4 md:py-5">
        <Link href="/" className="flex flex-col gap-0.5 py-1.5" aria-label={`${name} — página inicial`}>
          <span className="text-lg leading-tight font-semibold">{name}</span>
          {subtitle && <span className="label !text-[11px]">{subtitle}</span>}
        </Link>

        <nav aria-label="Principal" className="flex flex-wrap items-center gap-x-7 gap-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "flex min-h-11 items-center border-b text-[15px] transition-colors hover:text-accent",
                  active ? "border-ink" : "border-transparent",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          {portfolioPdf && (
            <a
              href={portfolioPdf}
              target="_blank"
              rel="noreferrer"
              className="label flex min-h-11 items-center border border-ink px-4 !text-ink transition-colors hover:bg-ink hover:!text-paper"
            >
              Portfólio PDF ↓
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
