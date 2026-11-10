"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cx } from "@/lib/utils";

const NAV = [
  { href: "/projetos", label: "Projetos" },
  { href: "/escritorio", label: "Escritório" },
  { href: "/jornal", label: "Jornal" },
  { href: "/contato", label: "Contato" },
];

export default function Header({ name, subtitle }: { name: string; subtitle: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Páginas com imagem de capa em tela cheia usam o header transparente.
  const overHero = pathname === "/" || /^\/projetos\/[^/]+$/.test(pathname);
  const transparent = overHero && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-colors duration-500",
          transparent ? "text-white" : "bg-paper/90 text-ink backdrop-blur-md",
          !transparent && scrolled && "border-b border-line/70",
        )}
      >
        <div className="wrap flex h-16 items-center justify-between md:h-20">
          <Link href="/" className="group flex flex-col leading-none" aria-label="Página inicial">
            <span className="text-[15px] font-medium tracking-[0.02em]">{name}</span>
            <span
              className={cx(
                "mt-1 text-[11px] tracking-[0.14em] uppercase",
                transparent ? "text-white/70" : "text-stone",
              )}
            >
              {subtitle}
            </span>
          </Link>

          <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="link-line pb-0.5 text-[14px]"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className="relative -mr-2 flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
          >
            <span
              className={cx(
                "absolute h-px w-6 bg-current transition-transform duration-300",
                open ? "rotate-45" : "-translate-y-1",
              )}
            />
            <span
              className={cx(
                "absolute h-px w-6 bg-current transition-transform duration-300",
                open ? "-rotate-45" : "translate-y-1",
              )}
            />
          </button>
        </div>
      </header>

      <div
        className={cx(
          "fixed inset-0 z-40 flex flex-col justify-end bg-paper px-5 pb-12 transition-opacity duration-500 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <nav className="flex flex-col gap-2" aria-label="Menu móvel">
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-display text-5xl leading-tight"
              style={{ transitionDelay: `${i * 40}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
