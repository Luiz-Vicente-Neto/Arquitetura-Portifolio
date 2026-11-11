import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getHome, getSettings } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, home] = await Promise.all([getSettings(), getHome()]);
  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <Header name={settings.architectName} subtitle={settings.profession} portfolioPdf={settings.portfolioPdf} />
      <main id="conteudo">{children}</main>
      <Footer settings={settings} ctaTitle={home.ctaTitle} />
    </>
  );
}
