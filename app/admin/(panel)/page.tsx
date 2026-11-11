import Link from "next/link";
import { db as getStore, getAbout, getSettings, getUser } from "@/lib/db";
import { formatDateTime, img } from "@/lib/utils";

const isPlaceholder = (v: string) => !v || /\[.*\]/.test(v);

export default async function Dashboard() {
  const store = await getStore();
  const [projects, messages, user, settings, about] = await Promise.all([
    store.listProjects(),
    store.listMessages(),
    getUser(),
    getSettings(),
    getAbout(),
  ]);
  const unread = messages.filter((m) => !m.read);
  const recent = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const published = projects.filter((p) => p.published);

  const stats = [
    { label: "Projetos publicados", value: published.length, href: "/admin/projetos" },
    { label: "Rascunhos", value: projects.length - published.length, href: "/admin/projetos" },
    { label: "Projetos sem capa", value: published.filter((p) => !p.cover).length, href: "/admin/projetos" },
    { label: "Mensagens não lidas", value: unread.length, href: "/admin/mensagens" },
  ];

  // O que ainda falta para o portfólio poder ser divulgado.
  const todo = [
    { done: !isPlaceholder(settings.email), text: "Informar o e-mail de contato", href: "/admin/configuracoes" },
    { done: !isPlaceholder(settings.education), text: "Preencher a formação", href: "/admin/configuracoes" },
    { done: !!settings.portfolioPdf, text: "Enviar o portfólio em PDF", href: "/admin/configuracoes" },
    { done: !!settings.cvPdf, text: "Enviar o currículo em PDF", href: "/admin/configuracoes" },
    { done: !isPlaceholder(about.intro) && !!about.portrait, text: "Escrever o “Sobre” e enviar um retrato", href: "/admin/paginas/sobre" },
    {
      done: published.length > 0 && published.every((p) => !isPlaceholder(p.title) && !!p.cover),
      text: "Dar título e capa a todos os projetos publicados",
      href: "/admin/projetos",
    },
  ];
  const pendingTodo = todo.filter((t) => !t.done);

  return (
    <div className="pb-16">
      <div className="mb-8">
        <p className="text-sm text-[#6b675f]">Olá, {user.name.split(" ")[0]}</p>
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
      </div>

      {user.isDefaultPassword && (
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
                  <span className="hatch h-10 w-14 shrink-0 overflow-hidden rounded">
                    {p.cover && <img src={img(p.cover, 200)} alt="" className="h-full w-full object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.title}</span>
                    <span className="block text-xs text-[#8a867e]">
                      {p.program && `${p.program} · `}Atualizado em {formatDateTime(p.updatedAt)}
                    </span>
                  </span>
                  {!p.published && <span className="text-xs text-[#8a867e]">Rascunho</span>}
                </Link>
              </li>
            ))}
            {recent.length === 0 && <li className="px-5 py-10 text-center text-sm text-[#8a867e]">Nenhum projeto ainda.</li>}
          </ul>
        </section>

        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-[#e4e1db] bg-white">
            <header className="border-b border-[#e4e1db] px-5 py-4">
              <h2 className="text-[15px] font-semibold">Antes de divulgar</h2>
              <p className="mt-0.5 text-xs text-[#6b675f]">
                {pendingTodo.length === 0 ? "Tudo preenchido." : `${pendingTodo.length} de ${todo.length} itens pendentes`}
              </p>
            </header>
            <ul className="divide-y divide-[#efede9]">
              {todo.map((t) => (
                <li key={t.text}>
                  <Link href={t.href} className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-[#fbfaf8]">
                    <span
                      aria-hidden
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px] ${t.done ? "border-emerald-600 bg-emerald-600 text-white" : "border-[#b9b5ad]"}`}
                    >
                      {t.done ? "✓" : ""}
                    </span>
                    <span className={t.done ? "text-[#8a867e] line-through" : ""}>{t.text}</span>
                    <span className="sr-only">{t.done ? "(feito)" : "(pendente)"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-[#e4e1db] bg-white">
            <header className="flex items-center justify-between border-b border-[#e4e1db] px-5 py-4">
              <h2 className="text-[15px] font-semibold">Mensagens novas</h2>
              <Link href="/admin/mensagens" className="text-sm font-medium">
                Ver todas
              </Link>
            </header>
            {unread.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#8a867e]">Nenhuma mensagem nova.</p>
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
      </div>
    </div>
  );
}
