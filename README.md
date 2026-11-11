<div align="center">

# Arq Studio

**Portfólio de arquitetura com CMS próprio**

Site para arquitetos e urbanistas apresentarem projetos como estudos de caso, com currículo, contato
e um painel administrativo completo para gerenciar tudo sem tocar no código.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![vinext](https://img.shields.io/badge/vinext-App_Router-000000)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-opcional-3FCF8E?logo=supabase&logoColor=white)

</div>

---

## Sobre o projeto

Feito para o portfólio de uma arquiteta e urbanista recém-formada: os projetos da graduação viram
**estudos de caso** (Problema → Lugar → Partido → Desenhos → Processo → Imagens finais), acompanhados
de ficha técnica, caderno em PDF e créditos.

Todo o conteúdo é editável pelo **painel em `/admin`**. O conteúdo inicial usa espaços reservados entre
`[colchetes]` e os projetos começam sem imagens (o site mostra uma área hachurada no lugar).

### Destaques

- 🏛️ **Estudos de caso** com blocos de texto e imagem, legendas no estilo `Fig. 01 — …` e largura total ou meia largura
- 🗂️ **Filtro por categoria** (TFG, Arquitetura, Urbanismo…) e projeto de capa na página inicial
- ✍️ **CMS completo**: projetos, categorias, páginas, mídia, mensagens, configurações e conta
- 👀 **Pré-visualização de rascunhos** para quem está logado; visitantes recebem 404
- 🧹 **Nada vazio aparece no site**, e o painel mostra uma lista "Antes de divulgar" com o que falta
- ⌨️ **Ctrl/Cmd + S** salva qualquer formulário do painel
- 💾 **Dois modos de armazenamento**: arquivo JSON local (zero configuração) ou Supabase (Postgres + Storage)
- 🔒 **Segurança**: senha com `scrypt`, sessão em cookie assinado (HMAC), limite de tentativas de login e RLS no banco

## Stack

| Camada | Tecnologia |
|---|---|
| UI | React 19, Tailwind CSS v4 |
| Framework | [vinext](https://github.com/cloudflare/vinext): App Router do Next.js sobre Vite 8 |
| Back-end | Server actions e route handlers |
| Dados | JSON local **ou** PostgreSQL (Supabase) |
| Arquivos | Disco local **ou** Supabase Storage |

## Começando

**Pré-requisito:** Node.js 20 ou mais recente.

```bash
git clone <url-do-repositorio>
cd Arq
npm install
npm run dev
```

| | Endereço |
|---|---|
| Site | http://localhost:5173 |
| Painel | http://localhost:5173/admin |

Sem nenhuma variável de ambiente, o projeto roda em **modo local**: o conteúdo fica em `storage/content.json`
e os uploads em `storage/uploads/`. Os dois ficam fora do git.

> [!IMPORTANT]
> **Primeiro acesso ao painel:** `admin@studio.com` / `admin123`.
> Troque o e-mail e a senha em **Minha conta** antes de publicar o site. Enquanto a senha padrão estiver
> ativa, a tela de login exibe essas credenciais.

### Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build (porta 3000; use `--port` para mudar) |
| `npm run typecheck` | Checagem de tipos |
| `npm run db:setup` | Prepara o banco no Supabase (tabelas, conteúdo inicial, bucket) |
| `npm run db:schema` | Gera `supabase/schema.sql` a partir do código |

## O que o CMS gerencia

<details>
<summary><b>Projetos</b></summary>

- **Apresentação:** título, frase de apresentação, programa.
- **Estudo de caso:** textos de Problema, Lugar, Partido, "Como se constrói" e Processo.
- **Imagens:** cada uma vai para um bloco (Lugar, Partido, Desenhos, Processo, Imagens finais), com legenda
  e largura total ou meia largura. Em Lugar e Desenhos a imagem aparece inteira, sem corte.
- **Ficha:** contexto acadêmico, ano, local, escala, orientação, autoria, ferramentas, créditos.
- Capa, caderno em PDF, categoria, publicado/rascunho, ordem e slug.
- **Capa da página inicial:** o primeiro projeto marcado abre a home.

</details>

<details>
<summary><b>Demais seções</b></summary>

- **Categorias** usadas no filtro de projetos.
- **Página inicial:** linha de abertura, título e chamada do rodapé.
- **Sobre e currículo:** retrato, textos, formação, experiência, ferramentas e reconhecimentos.
- **Configurações:** nome, título profissional, formação, cidade, disponibilidade, portfólio e currículo em PDF,
  e-mail, WhatsApp, redes e descrição para o Google.
- **Mídia:** biblioteca de arquivos, indicando onde cada um é usado.
- **Mensagens:** caixa de entrada do formulário de contato.

</details>

## Armazenamento: local ou Supabase

O modo é escolhido pelas variáveis de ambiente, sem mudar código:

| Variáveis definidas | Conteúdo | Arquivos enviados |
|---|---|---|
| Nenhuma (padrão) | `storage/content.json` | `storage/uploads/` |
| `DATABASE_URL` | PostgreSQL (Supabase) | `storage/uploads/` |
| `DATABASE_URL` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | PostgreSQL (Supabase) | Supabase Storage |

Em hospedagem **serverless** (Vercel, Netlify, Cloudflare…) use a terceira linha, porque lá não existe disco persistente.

<details>
<summary><b>Passo a passo do Supabase</b></summary>

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Pegue a **connection string** em *Project Settings → Database → Connection string → URI*:
   - **Transaction pooler** (porta `6543`) para serverless;
   - **Session pooler** (porta `5432`) para um servidor Node tradicional;
   - evite a "Direct connection" (`db.<projeto>.supabase.co`), que só funciona via IPv6.
3. Em *Project Settings → API*, copie a **Project URL** e a **service_role key**.
   A service_role ignora as regras de acesso: use **somente no servidor**.
4. Crie o `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://postgres.SEU_PROJETO:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://SEU_PROJETO.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   SESSION_SECRET=uma-string-longa-e-aleatoria
   ```

   > Se a senha do banco tiver `$`, escreva `\$`: o carregador de `.env` expande `$VARIAVEIS`.

5. Prepare o banco:

   ```bash
   npm run db:setup
   ```

   Cria as tabelas, insere o conteúdo inicial (se o banco estiver vazio) e cria o bucket público `media`.
   Pode rodar quantas vezes quiser: nada existente é sobrescrito.

   Para levar o conteúdo do modo local para o Supabase (somente em banco vazio):

   ```bash
   npm run db:setup -- --import-json
   ```

   Imagens enviadas no modo local precisam ser reenviadas pelo CMS.

6. `npm run dev`. Em *Mídia*, o painel mostra qual armazenamento está em uso.

Mesmo sem o `db:setup`, a aplicação cria as tabelas e o conteúdo inicial na primeira requisição.
Se preferir criar as tabelas à mão, cole `supabase/schema.sql` no *SQL Editor*.

</details>

<details>
<summary><b>Modelo de dados</b></summary>

| Tabela | Conteúdo |
|---|---|
| `site_content` | Documentos únicos em JSONB: `settings`, `home`, `about`, `user` (login do painel), `secret` |
| `categories` | Tipologias, com ordem |
| `projects` | Ficha, textos do estudo de caso e imagens (JSONB); `position` define a ordem |
| `posts` | Sem uso (mantida para bancos já criados) |
| `messages` | Formulário de contato |
| `media` | Biblioteca de arquivos (URL pública + caminho no Storage) |

</details>

## Variáveis de ambiente

Todas são opcionais. O [`.env.example`](.env.example) traz cada uma comentada.

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL; ativa o modo banco de dados |
| `DATABASE_POOL_MAX` | Conexões simultâneas por instância (padrão 5) |
| `DATABASE_SSL=disable` | Desliga TLS (apenas Postgres local sem TLS) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Ativam o Supabase Storage para os uploads |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket (padrão `media`) |
| `SESSION_SECRET` | Segredo da sessão do painel (recomendado em produção) |
| `STORAGE_DIR` | Pasta do modo local (padrão `./storage`) |
| `INSECURE_COOKIES=1` | Permite login em produção sem HTTPS (só para testes) |

> [!CAUTION]
> Nunca faça commit do `.env.local`. Ele já está no `.gitignore`.

## Segurança

- Senha com hash `scrypt`; sessão em cookie `httpOnly` assinado (HMAC), válida por 7 dias.
- Login bloqueado por 2 minutos após 5 tentativas erradas (por IP, em memória por instância).
- Server actions e rotas de upload verificam a sessão e validam os dados recebidos.
- Uploads: só imagens e PDF, até 15 MB, com nome gerado pelo servidor.
- No Supabase, todas as tabelas têm **Row Level Security ligado e sem policies**: a chave pública `anon`
  não lê nem escreve nada. O bucket `media` é público só para leitura.

## Estrutura

<details>
<summary>Ver árvore de pastas</summary>

```
app/
  (site)/              Site público
    page.tsx             Início: apresentação, resumo, projeto de capa, índice, sobre
    projetos/            Grade com filtro por categoria
    projetos/[slug]/     Estudo de caso completo
    sobre/               Retrato, formação, experiência, ferramentas, reconhecimentos
    contato/             E-mail, WhatsApp, redes, downloads e formulário
  admin/
    login/               Tela de login
    (panel)/             Painel protegido
  api/admin/upload       Upload de imagens/PDF (autenticado)
  api/admin/media        Biblioteca de mídia (autenticado)
  uploads/[...path]      Serve os arquivos enviados (modo local)
components/
  site/                  Cabeçalho, rodapé, galeria, filtros…
  admin/                 Campos, seletor de mídia, editor de imagens…
lib/
  db.ts                  Ponto único de acesso aos dados (JSON ou Postgres)
  data/                  Implementações de armazenamento e schema SQL
  files.ts               Uploads: disco local ou Supabase Storage
  auth.ts                Sessão assinada + senha com scrypt
  seed.ts                Conteúdo inicial
  actions/               Server actions (admin e contato)
scripts/db-setup.ts      npm run db:setup
supabase/schema.sql      SQL para o SQL Editor do Supabase
storage/                 Gerado no modo local (fora do git)
```

</details>

## Hospedagem

| Onde | Configuração |
|---|---|
| Servidor Node com disco (VPS, Railway, Render, Fly.io com volume) | Funciona em qualquer modo |
| Serverless (Vercel, Netlify, Cloudflare) | Supabase para banco **e** arquivos |

## Créditos

As imagens de exemplo vêm do [Unsplash](https://unsplash.com) e servem apenas como conteúdo provisório.
