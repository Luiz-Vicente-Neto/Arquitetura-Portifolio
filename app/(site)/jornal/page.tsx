import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/site/Reveal";
import { getPublishedPosts } from "@/lib/db";
import { POST_TYPE_LABEL } from "@/lib/types";
import { formatDate, img } from "@/lib/utils";

export const metadata: Metadata = { title: "Jornal" };

export default function JournalPage() {
  const posts = getPublishedPosts();
  const [first, ...rest] = posts;

  return (
    <div className="wrap pt-32 md:pt-44">
      <header className="mb-14 grid gap-6 md:grid-cols-12">
        <h1 className="font-display text-[clamp(3rem,8vw,8rem)] leading-[0.9] md:col-span-8">Jornal</h1>
        <p className="self-end text-[15px] leading-relaxed text-stone md:col-span-4">
          Notícias do escritório, publicações na imprensa, prêmios e eventos.
        </p>
      </header>

      {posts.length === 0 && <p className="py-24 text-center text-stone">Nenhuma publicação ainda.</p>}

      {first && (
        <Reveal>
          <Link href={`/jornal/${first.slug}`} className="group grid gap-8 border-t border-line pt-8 md:grid-cols-12">
            <div className="img-zoom aspect-[3/2] overflow-hidden bg-paper-2 md:col-span-7">
              {first.cover && <img src={img(first.cover, 1600)} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="md:col-span-5">
              <p className="eyebrow">
                {POST_TYPE_LABEL[first.type]} · {formatDate(first.date)}
              </p>
              <h2 className="mt-4 font-display text-4xl leading-[1.05] md:text-5xl">
                <span className="link-line">{first.title}</span>
              </h2>
              <p className="mt-5 text-[17px] leading-relaxed text-ink-2">{first.excerpt}</p>
              {first.outlet && <p className="mt-4 text-sm text-stone">{first.outlet}</p>}
            </div>
          </Link>
        </Reveal>
      )}

      {rest.length > 0 && (
        <ul className="mt-20 border-t border-line">
          {rest.map((post) => (
            <Reveal as="li" key={post.id}>
              <Link
                href={`/jornal/${post.slug}`}
                className="group grid items-center gap-4 border-b border-line py-6 md:grid-cols-12"
              >
                <span className="text-sm text-stone md:col-span-2">{formatDate(post.date, { month: "short", year: "numeric" })}</span>
                <span className="eyebrow md:col-span-2">{POST_TYPE_LABEL[post.type]}</span>
                <span className="text-xl md:col-span-6">
                  <span className="link-line">{post.title}</span>
                </span>
                <span className="text-sm text-stone md:col-span-2 md:text-right">{post.outlet}</span>
              </Link>
            </Reveal>
          ))}
        </ul>
      )}
    </div>
  );
}
