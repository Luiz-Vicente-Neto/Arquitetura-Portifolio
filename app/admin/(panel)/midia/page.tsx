import { db, getAbout, getHome } from "@/lib/db";
import { fileStorageKind } from "@/lib/files";
import MediaLibrary from "./MediaLibrary";

export default async function MediaPage() {
  const store = await db();
  const [media, projects, posts, home, about] = await Promise.all([
    store.listMedia(),
    store.listProjects(),
    store.listPosts(),
    getHome(),
    getAbout(),
  ]);

  // Mapa url → lugares onde o arquivo é usado, para avisar antes de excluir.
  const usage: Record<string, string[]> = {};
  const use = (url: string, where: string) => {
    if (!url) return;
    (usage[url] ??= []).includes(where) || usage[url].push(where);
  };
  for (const p of projects) {
    use(p.cover, `Projeto “${p.title}” (capa)`);
    for (const g of p.gallery) use(g.url, `Projeto “${p.title}” (galeria)`);
  }
  for (const p of posts) use(p.cover, `Jornal “${p.title}”`);
  use(home.aboutTeaserImage, "Página inicial");
  use(about.portrait, "Escritório (retrato)");
  use(about.studioImage, "Escritório (imagem do estúdio)");

  return <MediaLibrary items={media} storage={fileStorageKind()} usage={usage} />;
}
