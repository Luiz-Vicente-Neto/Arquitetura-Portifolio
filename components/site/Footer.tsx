import Link from "next/link";
import type { Settings } from "@/lib/types";

export default function Footer({ settings }: { settings: Settings }) {
  const socials = [
    { label: "Instagram", href: settings.instagram },
    { label: "LinkedIn", href: settings.linkedin },
    { label: "Pinterest", href: settings.pinterest },
    { label: "Behance", href: settings.behance },
  ].filter((s) => s.href);

  return (
    <footer className="mt-32 border-t border-line bg-paper">
      <div className="wrap grid gap-12 py-16 md:grid-cols-12 md:py-20">
        <div className="md:col-span-5">
          <p className="font-display text-4xl leading-[1.05] md:text-5xl">{settings.siteName}</p>
          <p className="mt-4 max-w-sm text-sm text-stone">{settings.tagline}</p>
        </div>

        <div className="text-sm md:col-span-3">
          <p className="eyebrow mb-4">Estúdio</p>
          <address className="leading-relaxed not-italic">
            {settings.address}
            <br />
            {settings.city}
          </address>
          {settings.officeHours && <p className="mt-3 text-stone">{settings.officeHours}</p>}
        </div>

        <div className="text-sm md:col-span-2">
          <p className="eyebrow mb-4">Contato</p>
          <ul className="space-y-1.5">
            <li>
              <a className="link-line" href={`mailto:${settings.email}`}>
                {settings.email}
              </a>
            </li>
            <li>
              <a className="link-line" href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}>
                {settings.phone}
              </a>
            </li>
          </ul>
        </div>

        <div className="text-sm md:col-span-2">
          <p className="eyebrow mb-4">Redes</p>
          <ul className="space-y-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a className="link-line" href={s.href} target="_blank" rel="noreferrer">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-xs text-stone md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {settings.siteName}
          {settings.cau && <span> · {settings.cau}</span>}
        </p>
        <nav className="flex gap-6">
          <Link className="link-line" href="/projetos">
            Projetos
          </Link>
          <Link className="link-line" href="/escritorio">
            Escritório
          </Link>
          <Link className="link-line" href="/jornal">
            Jornal
          </Link>
          <Link className="link-line" href="/contato">
            Contato
          </Link>
        </nav>
      </div>
    </footer>
  );
}
