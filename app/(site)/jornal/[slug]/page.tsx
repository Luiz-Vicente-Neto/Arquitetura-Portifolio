import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/db";
import { POST_TYPE_LABEL } from "@/lib/types";
import { formatDate, img, paragraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPostBySlug(slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !post.published) notFound();

  return (
    <article className="wrap pt-32 md:pt-44">
      <div className="mx-auto max-w-3xl">
        <Link href="/jornal" className="text-sm text-stone">
          ← <span className="link-line">Jornal</span>
        </Link>
        <p className="eyebrow mt-10">
          {POST_TYPE_LABEL[post.type]} · {formatDate(post.date)}
          {post.outlet && ` · ${post.outlet}`}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,5.5vw,5rem)] leading-[1]">{post.title}</h1>
        {post.excerpt && <p className="mt-6 text-xl leading-relaxed text-ink-2">{post.excerpt}</p>}
      </div>

      {post.cover && (
        <div className="mx-auto mt-14 max-w-5xl">
          <img src={img(post.cover, 2000)} alt="" className="aspect-[16/9] w-full object-cover" />
        </div>
      )}

      <div className="prose-arq mx-auto mt-14 max-w-2xl text-[17px] leading-[1.75] text-ink-2">
        {paragraphs(post.body).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {post.externalUrl && (
          <p className="pt-4">
            <a href={post.externalUrl} target="_blank" rel="noreferrer" className="text-ink">
              <span className="link-line">Ler a publicação original</span> ↗
            </a>
          </p>
        )}
      </div>
    </article>
  );
}
