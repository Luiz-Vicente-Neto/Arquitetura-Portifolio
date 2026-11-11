import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import PostForm from "../PostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await (await db()).getPost({ id });
  if (!post) notFound();
  const { createdAt: _c, updatedAt: _u, ...input } = post;
  return <PostForm key={post.updatedAt} initial={input} />;
}
