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
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23111312'/><text x='16' y='21.5' text-anchor='middle' font-family='Arial,sans-serif' font-weight='600' font-size='14' fill='%23ffffff'>SR</text></svg>"
        />
      </head>
      {/* suppressHydrationWarning: extensões do navegador costumam injetar atributos no body */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
