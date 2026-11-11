import Link from "next/link";
import { db } from "@/lib/db";
import { POST_TYPE_LABEL } from "@/lib/types";
import { formatDate, img } from "@/lib/utils";
import DeletePostButton from "./DeletePostButton";

export default async function AdminJournal() {
  const posts = await (await db()).listPosts();
  return (
    <div className="pb-16">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Jornal</h1>
          <p className="mt-1 text-sm text-[#6b675f]">Notícias, publicações na imprensa, prêmios e eventos.</p>
        </div>
        <Link href="/admin/jornal/novo" className="inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white">
          + Nova publicação
        </Link>
      </div>
      <div className="rounded-xl border border-[#e4e1db] bg-white">
        <ul className="divide-y divide-[#efede9]">
          {posts.map((p) => (
            <li key={p.id} className="flex items-center gap-4 px-4 py-3">
              <Link href={`/admin/jornal/${p.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                <span className="h-12 w-16 shrink-0 overflow-hidden rounded bg-[#f0eee9]">
                  {p.cover && <img src={img(p.cover, 200)} alt="" className="h-full w-full object-cover" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="block text-xs text-[#8a867e]">
                    {POST_TYPE_LABEL[p.type]} · {formatDate(p.date)} {p.outlet && `· ${p.outlet}`}
                  </span>
                </span>
              </Link>
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${p.published ? "bg-emerald-50 text-emerald-700" : "bg-[#efede9] text-[#8a867e]"}`}>
                {p.published ? "Publicado" : "Rascunho"}
              </span>
              <DeletePostButton id={p.id} title={p.title} />
            </li>
          ))}
          {posts.length === 0 && <li className="px-4 py-12 text-center text-sm text-[#8a867e]">Nenhuma publicação.</li>}
        </ul>
      </div>
    </div>
  );
}
