import { notFound } from "next/navigation";
import { readDb } from "@/lib/db";
import PostForm from "../PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = readDb().posts.find((p) => p.id === id);
  if (!post) notFound();
  const { createdAt: _c, updatedAt: _u, ...input } = post;
  return <PostForm key={post.updatedAt} initial={input} />;
}
