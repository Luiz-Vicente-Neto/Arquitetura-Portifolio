import Link from "next/link";
import { db as getStore, getUser } from "@/lib/db";
import { formatDateTime, img } from "@/lib/utils";

export default async function Dashboard() {
  const store = await getStore();
  const [projects, posts, messages, user] = await Promise.all([
    store.listProjects(),
    store.listPosts(),
    store.listMessages(),
    getUser(),
  ]);
  const db = { projects, posts, messages, user };
  const unread = db.messages.filter((m) => !m.read);
  const recent = [...db.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);

  const stats = [
    { label: "Projetos publicados", value: db.projects.filter((p) => p.published).length, href: "/admin/projetos" },
    { label: "Rascunhos", value: db.projects.filter((p) => !p.published).length, href: "/admin/projetos" },
    { label: "Publicações no jornal", value: db.posts.length, href: "/admin/jornal" },
    { label: "Mensagens não lidas", value: unread.length, href: "/admin/mensagens" },
  ];

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm text-[#6b675f]">Olá, {db.user.name.split(" ")[0]}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
      </div>

      {db.user.isDefaultPassword && (
        <div className="mb-6 flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
          <span>Você ainda está usando a senha padrão. Defina uma senha própria para proteger o painel.</span>
          <Link href="/admin/conta" className="font-medium underline">
            Alterar senha
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-xl border border-[#e4e1db] bg-white p-5 transition-colors hover:border-[#cfcbc3]"
          >
            <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
            <p className="mt-1 text-[13px] text-[#6b675f]">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className="rounded-xl border border-[#e4e1db] bg-white lg:col-span-3">
          <header className="flex items-center justify-between border-b border-[#e4e1db] px-5 py-4">
            <h2 className="text-[15px] font-semibold">Projetos editados recentemente</h2>
            <Link href="/admin/projetos/novo" className="text-sm font-medium">
              + Novo projeto
            </Link>
          </header>
          <ul className="divide-y divide-[#efede9]">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/projetos/${p.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-[#fbfaf8]">
                  <img src={img(p.cover, 200)} alt="" className="h-10 w-14 rounded object-cover" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{p.title}</span>
                    <span className="block text-xs text-[#8a867e]">Atualizado em {formatDateTime(p.updatedAt)}</span>
                  </span>
                  {!p.published && <span className="text-xs text-[#8a867e]">Rascunho</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-[#e4e1db] bg-white lg:col-span-2">
          <header className="flex items-center justify-between border-b border-[#e4e1db] px-5 py-4">
            <h2 className="text-[15px] font-semibold">Mensagens novas</h2>
            <Link href="/admin/mensagens" className="text-sm font-medium">
              Ver todas
            </Link>
          </header>
          {unread.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-[#8a867e]">Nenhuma mensagem nova.</p>
          ) : (
            <ul className="divide-y divide-[#efede9]">
              {unread.slice(0, 4).map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="line-clamp-2 text-xs text-[#6b675f]">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-3">
        {[
          { href: "/admin/paginas/home", t: "Editar página inicial", d: "Título, manifesto, serviços e chamada final" },
          { href: "/admin/paginas/escritorio", t: "Editar escritório", d: "Biografia, trajetória, prêmios e processo" },
          { href: "/admin/configuracoes", t: "Dados de contato", d: "E-mail, telefone, endereço e redes sociais" },
        ].map((c) => (
          <Link key={c.href} href={c.href} className="rounded-xl border border-[#e4e1db] bg-white p-5 hover:border-[#cfcbc3]">
            <p className="text-sm font-medium">{c.t} →</p>
            <p className="mt-1 text-xs text-[#6b675f]">{c.d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
