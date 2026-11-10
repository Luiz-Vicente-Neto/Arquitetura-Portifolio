"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, Button, PageHeader, useToast } from "@/components/admin/ui";
import { deleteMessage, setMessageRead } from "@/lib/actions/admin";
import type { Message } from "@/lib/types";
import { cx, formatDateTime } from "@/lib/utils";

export default function Inbox({ messages }: { messages: Message[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(messages[0]?.id ?? null);
  const [, start] = useTransition();
  const router = useRouter();
  const toast = useToast();
  const selected = messages.find((m) => m.id === selectedId) ?? null;

  const open = (m: Message) => {
    setSelectedId(m.id);
    if (!m.read) start(async () => {
      await setMessageRead(m.id, true);
      router.refresh();
    });
  };

  return (
    <div className="pb-16">
      <PageHeader title="Mensagens" description="Contatos recebidos pelo formulário do site." />
      {messages.length === 0 ? (
        <div className="rounded-xl border border-[#e4e1db] bg-white px-5 py-16 text-center text-sm text-[#8a867e]">
          Nenhuma mensagem recebida ainda.
        </div>
      ) : (
        <div className="grid overflow-hidden rounded-xl border border-[#e4e1db] bg-white md:grid-cols-5">
          <ul className="max-h-[70vh] divide-y divide-[#efede9] overflow-y-auto border-b border-[#e4e1db] md:col-span-2 md:border-r md:border-b-0">
            {messages.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => open(m)}
                  className={cx(
                    "block w-full px-4 py-3 text-left transition-colors",
                    selectedId === m.id ? "bg-[#f5f4f1]" : "hover:bg-[#fbfaf8]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {!m.read && <span className="h-2 w-2 shrink-0 rounded-full bg-ink" />}
                    <span className={cx("flex-1 truncate text-sm", !m.read && "font-semibold")}>{m.name}</span>
                    <span className="shrink-0 text-[11px] text-[#8a867e]">{formatDateTime(m.createdAt).split(" ")[0]}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#6b675f]">{m.message}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="p-5 md:col-span-3 md:p-6">
            {selected ? (
              <article>
                <div className="flex flex-col gap-3 border-b border-[#efede9] pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    <p className="text-sm text-[#6b675f]">
                      <a href={`mailto:${selected.email}`} className="underline">
                        {selected.email}
                      </a>
                      {selected.phone && <> · {selected.phone}</>}
                    </p>
                    <p className="mt-1 text-xs text-[#8a867e]">{formatDateTime(selected.createdAt)}</p>
                  </div>
                  {selected.projectType && <Badge>{selected.projectType}</Badge>}
                </div>
                <p className="mt-5 text-[15px] leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                <div className="mt-8 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${selected.email}?subject=${encodeURIComponent("Re: contato pelo site")}`}
                    className="inline-flex rounded-lg bg-ink px-3.5 py-2 text-sm font-medium text-white"
                  >
                    Responder por e-mail
                  </a>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      start(async () => {
                        await setMessageRead(selected.id, !selected.read);
                        router.refresh();
                      })
                    }
                  >
                    Marcar como {selected.read ? "não lida" : "lida"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (!confirm("Excluir esta mensagem?")) return;
                      start(async () => {
                        await deleteMessage(selected.id);
                        setSelectedId(null);
                        toast("Mensagem excluída");
                        router.refresh();
                      });
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </article>
            ) : (
              <p className="py-16 text-center text-sm text-[#8a867e]">Selecione uma mensagem.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
