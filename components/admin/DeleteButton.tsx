"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ActionResult } from "@/lib/actions/admin";
import { Button, useToast } from "./ui";

/** Botão de exclusão com confirmação; redireciona após excluir. */
export default function DeleteButton({
  confirmText,
  onDelete,
  redirectTo,
  successText = "Excluído",
  label = "Excluir",
}: {
  confirmText: string;
  onDelete: () => Promise<ActionResult>;
  redirectTo?: string;
  successText?: string;
  label?: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();

  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (!confirm(confirmText)) return;
        start(async () => {
          const res = await onDelete();
          if (!res.ok) {
            toast(res.error ?? "Não foi possível excluir.", "error");
            return;
          }
          toast(successText);
          if (redirectTo) router.push(redirectTo);
          router.refresh();
        });
      }}
    >
      {pending ? "Excluindo…" : label}
    </Button>
  );
}
