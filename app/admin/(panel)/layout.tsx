import type { Metadata } from "next";
import Sidebar from "@/components/admin/Sidebar";
import { ToastProvider } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { readDb } from "@/lib/db";

export const metadata: Metadata = { title: "CMS", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const db = readDb();
  const unread = db.messages.filter((m) => !m.read).length;

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f7f6f3] text-ink">
        <Sidebar siteName={db.settings.siteName} userName={db.user.name} unread={unread} />
        <div className="lg:pl-64">
          <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8 md:pt-10">{children}</div>
        </div>
      </div>
    </ToastProvider>
  );
}
