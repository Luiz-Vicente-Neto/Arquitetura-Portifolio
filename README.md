# Site de arquiteta + CMS

Site portfólio para arquiteta/escritório de arquitetura, com painel administrativo (CMS) próprio para gerenciar todo o conteúdo.

Feito com **React 19 + [vinext](https://github.com/cloudflare/vinext)** (App Router do Next.js rodando sobre Vite 8), **Tailwind CSS v4**, server actions e route handlers.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173
```

- Site: `http://localhost:5173`
- CMS: `http://localhost:5173/admin`
  - Primeiro acesso: **admin@studio.com** / **admin123** — troque em *Minha conta*.

Produção:

```bash
npm run build
npm run start      # vinext start (porta 3000 por padrão; use --port)
```

## Estrutura

```
app/
  (site)/            Site público
    page.tsx           Home: hero em carrossel, manifesto, projetos em grade assimétrica,
                       atuação, chamada "sobre", jornal, CTA
    projetos/          Lista com filtros (tipologia/status) e modo Grade ou Índice
    projetos/[slug]/   Capa em tela cheia, ficha técnica, texto, galeria com lightbox, próximo projeto
    escritorio/        Biografia, trajetória, filosofia, processo, prêmios, clientes
    jornal/            Notícias, imprensa, prêmios e eventos
    contato/           Dados de contato + formulário (vai para "Mensagens" no CMS)
  admin/
    login/             Tela de login
    (panel)/           Painel (protegido): projetos, categorias, jornal, mídia,
                       páginas (home/escritório), mensagens, configurações, conta
  api/admin/upload     Upload de imagens/PDF (autenticado)
  api/admin/media      Lista da biblioteca de mídia (autenticado)
  uploads/[...path]    Serve os arquivos enviados
components/site        Componentes do site (header, hero, galeria, filtros…)
components/admin       Componentes do CMS (campos, seletor de mídia, editor de galeria…)
lib/
  db.ts                Camada de dados (arquivo JSON) — único ponto a trocar para outro banco
  seed.ts              Conteúdo inicial de exemplo
  auth.ts              Sessão por cookie assinado (HMAC) + senha com scrypt
  actions/             Server actions (admin e formulário de contato)
storage/               (gerado) content.json + uploads/ — fora do git
```

## O que o CMS gerencia

- **Projetos**: título, subtítulo, resumo, descrição, capa, galeria (upload, legendas, largura total/meia largura, arrastar para reordenar), ficha técnica (local, ano, área, cliente, equipe, fotografia), categoria, status (concluído / em andamento / conceito), destaque, publicado/rascunho, ordem de exibição e slug.
- **Categorias** (tipologias usadas nos filtros).
- **Jornal**: notícias, imprensa, prêmios e eventos.
- **Página inicial** e **Escritório**: todos os textos, imagens e listas (serviços, trajetória, processo, prêmios, clientes).
- **Mídia**: biblioteca de arquivos com upload por arrastar e soltar.
- **Mensagens**: caixa de entrada do formulário de contato.
- **Configurações**: nome, slogan, SEO, contato, endereço, WhatsApp, redes sociais e registro CAU.

Atalho: **Ctrl/Cmd + S** salva qualquer formulário do painel.

## Variáveis de ambiente (opcionais)

Veja `.env.example`.

| Variável | Uso |
|---|---|
| `STORAGE_DIR` | Pasta de dados (padrão `./storage`) |
| `SESSION_SECRET` | Segredo da sessão usado ao criar o banco (senão é gerado aleatoriamente) |
| `INSECURE_COOKIES=1` | Permite login em produção sem HTTPS (só para testes) |

## Hospedagem

O armazenamento em arquivo exige um servidor Node com disco persistente (VPS, Railway, Render, Fly.io com volume…). Para Cloudflare Workers, troque a implementação de `lib/db.ts` por D1/KV e os uploads por R2 — o resto da aplicação usa apenas `readDb`/`updateDb`.

As imagens de exemplo vêm do Unsplash e servem apenas como conteúdo provisório.
