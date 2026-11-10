import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { readDb } from "@/lib/db";
import { img } from "@/lib/utils";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  const db = readDb();
  const cover = db.projects.find((p) => p.featured)?.cover ?? "";

  return (
    <div className="grid min-h-screen bg-[#f7f6f3] lg:grid-cols-2">
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="text-[11px] font-medium tracking-[0.14em] text-[#8a867e] uppercase">Gerenciador de conteúdo</p>
          <h1 className="mt-2 font-display text-5xl leading-none">{db.settings.siteName}</h1>
          <p className="mt-3 text-sm text-[#6b675f]">Entre para editar projetos, páginas e publicações.</p>
          <LoginForm showDefault={db.user.isDefaultPassword} defaultEmail={db.user.email} />
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        {cover && <img src={img(cover, 1600)} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />}
      </div>
    </div>
  );
}
