import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { getSettings } from "@/lib/db";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <Header name={settings.architectName} subtitle={settings.profession} />
      <main>{children}</main>
      <Footer settings={settings} />
    </>
  );
}
