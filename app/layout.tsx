import type { Metadata } from "next";
import { getSettings } from "@/lib/db";
import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.siteName, template: `%s — ${s.siteName}` },
    description: s.seoDescription,
    openGraph: { title: s.siteName, description: s.seoDescription, type: "website", locale: "pt_BR" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300;400;500;600&display=swap"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23161513'/><text x='16' y='22' text-anchor='middle' font-family='Georgia,serif' font-size='17' fill='%23f3f1ec'>SR</text></svg>"
        />
      </head>
      {/* suppressHydrationWarning: extensões do navegador costumam injetar atributos no body */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
