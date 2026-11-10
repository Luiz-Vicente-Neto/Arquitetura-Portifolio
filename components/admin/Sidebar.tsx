"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/lib/actions/admin";
import { cx } from "@/lib/utils";

const GROUPS = [
  {
    label: "Conteúdo",
    items: [
      { href: "/admin", label: "Painel", icon: "◫" },
      { href: "/admin/projetos", label: "Projetos", icon: "▦" },
      { href: "/admin/categorias", label: "Categorias", icon: "◇" },
      { href: "/admin/jornal", label: "Jornal", icon: "≡" },
      { href: "/admin/midia", label: "Mídia", icon: "▢" },
    ],
  },
  {
    label: "Páginas",
    items: [
      { href: "/admin/paginas/home", label: "Página inicial", icon: "⌂" },
      { href: "/admin/paginas/escritorio", label: "Escritório", icon: "◎" },
    ],
  },
  {
    label: "Contato",
    items: [{ href: "/admin/mensagens", label: "Mensagens", icon: "✉", badge: true }],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/configuracoes", label: "Configurações", icon: "⚙" },
      { href: "/admin/conta", label: "Minha conta", icon: "●" },
    ],
  },
];

export default function Sidebar({
  siteName,
  userName,
  unread,
}: {
  siteName: string;
  userName: string;
  unread: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  return (
    <>
      {/* Barra superior mobile */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e4e1db] bg-white px-4 lg:hidden">
        <span className="text-sm font-semibold">{siteName}</span>
        <button type="button" onClick={() => setOpen((v) => !v)} className="text-sm" aria-expanded={open}>
          {open ? "Fechar" : "Menu"}
        </button>
      </div>

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[#e4e1db] bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="border-b border-[#e4e1db] px-5 py-5">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a867e] uppercase">CMS</p>
          <p className="mt-1 truncate text-[15px] font-semibold">{siteName}</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {GROUPS.map((g) => (
            <div key={g.label} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-medium tracking-[0.1em] text-[#a7a39b] uppercase">{g.label}</p>
              <ul className="space-y-0.5">
                {g.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        isActive(item.href) ? "bg-[#efede9] font-medium text-ink" : "text-[#4a4740] hover:bg-[#f5f4f1]",
                      )}
                    >
                      <span className="w-4 text-center text-[#8a867e]">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {"badge" in item && item.badge && unread > 0 && (
                        <span className="rounded-full bg-ink px-1.5 text-[11px] text-white">{unread}</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#e4e1db] p-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-[#4a4740] hover:bg-[#f5f4f1]"
          >
            Ver site <span>↗</span>
          </a>
          <div className="flex items-center justify-between px-2">
            <span className="truncate text-xs text-[#6b675f]">{userName}</span>
            <form action={logout}>
              <button type="submit" className="text-xs text-[#6b675f] hover:text-ink">
                Sair
              </button>
            </form>
          </div>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setOpen(false)} />}
    </>
  );
}
