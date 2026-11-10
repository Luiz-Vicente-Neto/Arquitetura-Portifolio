import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/db";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <>
      <Header name={settings.architectName} subtitle="Arquitetura" />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
