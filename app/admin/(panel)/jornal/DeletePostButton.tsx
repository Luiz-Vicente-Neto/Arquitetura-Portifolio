"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button, useToast } from "@/components/admin/ui";
import { deletePost } from "@/lib/actions/admin";

export default function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      className="!px-2 !py-1 text-xs"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Excluir “${title}”?`)) return;
        start(async () => {
          const res = await deletePost(id);
          toast(res.ok ? "Publicação excluída" : (res.error ?? "Erro ao excluir"), res.ok ? "ok" : "error");
          router.refresh();
        });
      }}
    >
      Excluir
    </Button>
  );
}
