import { db, getAbout, getSettings } from "@/lib/db";
import { fileStorageKind } from "@/lib/files";
import MediaLibrary from "./MediaLibrary";

export default async function MediaPage() {
  const store = await db();
  const [media, projects, about, settings] = await Promise.all([
    store.listMedia(),
    store.listProjects(),
    getAbout(),
    getSettings(),
  ]);

  // Mapa url → lugares onde o arquivo é usado, para avisar antes de excluir.
  const usage: Record<string, string[]> = {};
  const use = (url: string, where: string) => {
    if (!url) return;
    const list = (usage[url] ??= []);
    if (!list.includes(where)) list.push(where);
  };
  for (const p of projects) {
    use(p.cover, `Projeto “${p.title}” (capa)`);
    use(p.pdfUrl, `Projeto “${p.title}” (caderno PDF)`);
    for (const g of p.gallery) use(g.url, `Projeto “${p.title}” (imagens)`);
  }
  use(about.portrait, "Sobre (retrato)");
  use(settings.portfolioPdf, "Portfólio em PDF");
  use(settings.cvPdf, "Currículo em PDF");

  return <MediaLibrary items={media} storage={fileStorageKind()} usage={usage} />;
}
