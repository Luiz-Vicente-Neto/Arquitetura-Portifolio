import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-4 font-display text-6xl md:text-8xl">Página não encontrada</h1>
      <p className="mt-4 text-stone">O endereço pode ter mudado ou o conteúdo foi removido.</p>
      <Link href="/" className="mt-10 bg-ink px-7 py-4 text-sm text-paper">
        Voltar ao início
      </Link>
    </div>
  );
}
