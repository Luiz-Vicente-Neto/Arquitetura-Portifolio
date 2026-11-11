import type { Metadata } from "next";
import ContactForm from "@/components/site/ContactForm";
import { getSettings } from "@/lib/db";

export const metadata: Metadata = { title: "Contato" };

export default async function ContactPage() {
  const s = await getSettings();
  const wa = s.whatsapp.replace(/\D/g, "");

  return (
    <div className="wrap pt-32 md:pt-44">
      <h1 className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9]">Contato</h1>

      <div className="mt-16 grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="space-y-10 md:col-span-4">
          <div>
            <p className="eyebrow mb-3">Novos projetos</p>
            <a href={`mailto:${s.email}`} className="text-xl">
              <span className="link-line">{s.email}</span>
            </a>
          </div>
          <div>
            <p className="eyebrow mb-3">Telefone</p>
            <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="text-xl">
              <span className="link-line">{s.phone}</span>
            </a>
            {wa && (
              <p className="mt-2">
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="text-sm text-stone">
                  <span className="link-line">Conversar pelo WhatsApp</span> ↗
                </a>
              </p>
            )}
          </div>
          <div>
            <p className="eyebrow mb-3">Estúdio</p>
            <address className="text-[17px] leading-relaxed not-italic">
              {s.address}
              <br />
              {s.city}
            </address>
            {s.officeHours && <p className="mt-2 text-sm text-stone">{s.officeHours}</p>}
            {s.mapUrl && (
              <a href={s.mapUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm">
                <span className="link-line">Ver no mapa</span> ↗
              </a>
            )}
          </div>
        </div>

        <div className="md:col-span-7 md:col-start-6">
          <p className="mb-10 max-w-lg text-lg leading-relaxed text-ink-2">
            Conte um pouco sobre o seu projeto — localização, programa, prazos e expectativas. Quanto mais
            detalhes, melhor conseguimos orientar a primeira conversa.
          </p>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
