import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Contato" };

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default async function ContactPage() {
  const s = await getSettings();
  const wa = s.whatsapp.replace(/\D/g, "");

  const rows: { label: string; text: string; href?: string }[] = [
    wa ? { label: "WhatsApp", text: `${s.phone || `+${wa}`} ↗`, href: `https://wa.me/${wa}` } : null,
    !wa && s.phone ? { label: "Telefone", text: s.phone } : null,
    s.linkedin ? { label: "LinkedIn", text: "Ver perfil ↗", href: s.linkedin } : null,
    s.instagram ? { label: "Instagram", text: "Ver perfil ↗", href: s.instagram } : null,
    s.behance ? { label: "Behance", text: "Ver perfil ↗", href: s.behance } : null,
    s.city ? { label: "Onde estou", text: s.city } : null,
  ].filter((r) => r !== null);

  return (
    <div className="wrap">
      <section className="flex flex-col items-start gap-6 pt-[clamp(3rem,7vw,6rem)]">
        {s.availability && (
          <p className="label flex items-baseline gap-2.5">
            <span aria-hidden className="inline-block h-[9px] w-[9px] flex-none bg-accent" />
            <span>{s.availability}</span>
          </p>
        )}
        <h1 className="text-[clamp(2.75rem,7vw,6rem)] leading-none font-medium tracking-[-0.03em]">Contato</h1>
        {s.email &&
          (isEmail(s.email) ? (
            <a
              href={`mailto:${s.email}`}
              className="py-2 text-[clamp(1.5rem,3.4vw,3rem)] leading-[1.15] font-medium tracking-[-0.02em] break-all underline decoration-1 underline-offset-8 hover:text-accent"
            >
              {s.email}
            </a>
          ) : (
            <span className="py-2 text-[clamp(1.5rem,3.4vw,3rem)] leading-[1.15] font-medium tracking-[-0.02em]">{s.email}</span>
          ))}
      </section>

      <section className="flex flex-wrap items-start gap-x-16 gap-y-12 pt-[clamp(3rem,6vw,5.5rem)]">
        {(rows.length > 0 || s.portfolioPdf || s.cvPdf) && (
          <div className="carimbo flex-[1_1_19rem] !grid-cols-1">
            {rows.map((r) => (
              <div key={r.label}>
                <span className="label !text-[11px]">{r.label}</span>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="text-lg hover:text-accent">
                    {r.text}
                  </a>
                ) : (
                  <span className="text-lg">{r.text}</span>
                )}
              </div>
            ))}
            {(s.portfolioPdf || s.cvPdf) && (
              <div>
                <span className="label !text-[11px]">Para levar</span>
                <span className="flex flex-col text-lg">
                  {s.portfolioPdf && (
                    <a href={s.portfolioPdf} target="_blank" rel="noreferrer" className="hover:text-accent">
                      Portfólio em PDF ↓
                    </a>
                  )}
                  {s.cvPdf && (
                    <a href={s.cvPdf} target="_blank" rel="noreferrer" className="hover:text-accent">
                      Currículo em PDF ↓
                    </a>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
        <div className="min-w-0 flex-[2_1_28rem]">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
