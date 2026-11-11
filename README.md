# Stephany Ruiz Arquiteta e Urbanista — site + CMS

Portfólio da arquiteta e urbanista Stephany Ruiz (recém-formada): projetos da graduação apresentados como
estudos de caso, currículo e contato, com painel administrativo (CMS) próprio para gerenciar todo o conteúdo.

> **Conteúdo inicial:** tudo o que aparece entre [colchetes] é espaço reservado para preencher pelo CMS, e os
> projetos começam sem imagens (o site mostra uma área hachurada no lugar). Nada no conteúdo inicial afirma
> fatos sobre a Stephany.

Feito com **React 19 + [vinext](https://github.com/cloudflare/vinext)** (App Router do Next.js rodando sobre Vite 8), **Tailwind CSS v4**, server actions e route handlers.

## Rodando

```bash
npm install
npm run dev        # http://localhost:5173 (ou a porta que o Vite indicar)
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
    page.tsx           Início: apresentação, quadro de resumo, projeto de capa, índice de projetos, sobre
    projetos/          Grade com filtro por categoria (TFG, Arquitetura, Urbanismo…)
    projetos/[slug]/   Estudo de caso: ficha, Problema, Lugar, Partido, Desenhos, Processo,
                       Imagens finais, créditos, PDF do caderno e próximo projeto
    sobre/             Retrato, texto, formação, experiência, ferramentas, reconhecimentos
    contato/           E-mail, WhatsApp, redes, downloads e formulário (vai para "Mensagens")
  admin/
    login/             Tela de login
    (panel)/           Painel (protegido): projetos, categorias, mídia, páginas (início / sobre),
                       mensagens, configurações, conta
  api/admin/upload     Upload de imagens/PDF (autenticado)
  api/admin/media      Lista da biblioteca de mídia (autenticado)
  uploads/[...path]    Serve os arquivos enviados (modo local)
components/site        Componentes do site (cabeçalho, rodapé, galeria, filtros…)
components/admin       Componentes do CMS (campos, seletor de mídia, editor de imagens, PDF…)
lib/
  db.ts                Ponto único de acesso aos dados (escolhe JSON ou Postgres)
  normalize.ts         Completa campos de conteúdo gravado por versões anteriores
  data/
    store.ts           Interface de armazenamento comum aos dois modos
    json-store.ts      Modo local (storage/content.json)
    pg-store.ts        PostgreSQL / Supabase
    schema.ts          Schema SQL (aplicado automaticamente)
  files.ts             Uploads: disco local ou Supabase Storage
  seed.ts              Conteúdo inicial (espaços reservados entre colchetes)
  auth.ts              Sessão por cookie assinado (HMAC) + senha com scrypt
  actions/             Server actions (admin e formulário de contato)
scripts/db-setup.ts    npm run db:setup — prepara o banco do Supabase
supabase/schema.sql    SQL para colar no SQL Editor do Supabase (opcional)
storage/               (gerado, modo local) content.json + uploads/ — fora do git
```

## O que o CMS gerencia

- **Projetos**
  - Apresentação: título, frase de apresentação, programa.
  - Estudo de caso: textos de Problema, Lugar, Partido, "Como se constrói" e Processo.
  - Imagens: cada uma vai para um bloco (Lugar, Partido, Desenhos, Processo, Imagens finais), com legenda
    ("Fig. 01 — …") e largura total ou meia largura. Em Lugar e Desenhos a imagem aparece inteira, sem corte.
  - Ficha: contexto acadêmico, ano, local, escala, orientação, autoria, ferramentas, créditos.
  - Capa, caderno em PDF, categoria, publicado/rascunho, ordem e slug.
  - "Capa da página inicial": o primeiro projeto marcado abre a página inicial.
- **Categorias** usadas no filtro de projetos.
- **Página inicial**: linha de abertura, título e chamada do rodapé.
- **Sobre e currículo**: retrato, textos, formação, experiência, ferramentas e reconhecimentos.
- **Configurações**: nome, título profissional, formação, cidade, disponibilidade, portfólio e currículo em PDF,
  e-mail, WhatsApp, redes e descrição para o Google.
- **Mídia**: biblioteca de arquivos, com aviso de onde cada um é usado.
- **Mensagens**: caixa de entrada do formulário de contato.

O que estiver vazio não aparece no site: blocos sem texto e sem imagens, campos da ficha, seções do currículo,
botões de PDF e links de redes. O painel inicial tem uma lista "Antes de divulgar" com o que falta preencher.

Atalho: **Ctrl/Cmd + S** salva qualquer formulário do painel. Rascunhos podem ser pré-visualizados no site
com uma sessão ativa no painel (aparece uma faixa de aviso); visitantes recebem 404.

## Banco de dados: modo local ou Supabase

O sistema escolhe o armazenamento pelas variáveis de ambiente — nenhum código precisa mudar:

| Situação | Conteúdo | Arquivos enviados |
|---|---|---|
| Sem variáveis (padrão) | `storage/content.json` | `storage/uploads/` |
| `DATABASE_URL` definida | PostgreSQL (Supabase) | `storage/uploads/` |
| `DATABASE_URL` + `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | PostgreSQL (Supabase) | Supabase Storage |

Para hospedagem serverless (Vercel, Netlify, Cloudflare…) use a **terceira linha**: lá não existe disco persistente.

### Configurando o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. **Connection string** — *Project Settings → Database → Connection string → URI*:
   - **Transaction pooler** (porta `6543`) para serverless;
   - **Session pooler** (porta `5432`) para um servidor Node tradicional.
   - Evite a "Direct connection" (`db.<projeto>.supabase.co`): ela só funciona via IPv6.
3. **Chaves da API** — *Project Settings → API*: copie a *Project URL* e a *service_role key*.
   A service_role ignora as regras de acesso: use **somente no servidor**, nunca no navegador.
4. Crie o `.env.local` a partir do exemplo e preencha:

   ```bash
   cp .env.example .env.local
   ```

   ```env
   DATABASE_URL=postgresql://postgres.SEU_PROJETO:SUA_SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres
   SUPABASE_URL=https://SEU_PROJETO.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=...
   SESSION_SECRET=uma-string-longa-e-aleatoria
   ```

   > Se a senha do banco tiver `$`, escreva `\$` — o carregador de `.env` expande `$VARIAVEIS`.

5. Prepare o banco:

   ```bash
   npm run db:setup
   ```

   Isso cria as tabelas, insere o conteúdo inicial (se o banco estiver vazio) e cria o bucket público
   `media` no Storage. Pode rodar quantas vezes quiser: nada existente é sobrescrito.

   Já cadastrou conteúdo no modo local e quer levá-lo para o Supabase?

   ```bash
   npm run db:setup -- --import-json
   ```

   (só funciona em banco vazio; imagens já enviadas localmente precisam ser reenviadas pelo CMS.)

6. `npm run dev` — pronto. O painel em *Mídia* indica qual armazenamento está em uso.

Mesmo sem rodar o `db:setup`, a aplicação cria as tabelas e o conteúdo inicial sozinha na primeira
requisição. Prefere criar as tabelas manualmente? Cole `supabase/schema.sql` no *SQL Editor*
(gerado a partir do código com `npm run db:schema`).

### Segurança no Supabase

- Todas as tabelas são criadas com **Row Level Security ligado e sem policies**: a API pública do
  Supabase (chave `anon`) não consegue ler nem escrever nada. Só o servidor, pela conexão direta, acessa os dados.
- O bucket `media` é público para leitura (as imagens aparecem no site); escrever e apagar exige a service_role,
  que fica apenas no servidor.

### Modelo de dados

| Tabela | Conteúdo |
|---|---|
| `site_content` | Documentos únicos em JSONB: `settings`, `home`, `about`, `user` (login do painel), `secret` |
| `categories` | Tipologias, com ordem |
| `projects` | Projetos: ficha, textos do estudo de caso e imagens (JSONB, com o bloco de cada uma); `position` define a ordem |
| `posts` | Sem uso (o jornal saiu do site; a tabela fica para bancos já criados) |
| `messages` | Formulário de contato |
| `media` | Biblioteca de arquivos (URL pública + caminho no Storage) |

## Variáveis de ambiente

Todas opcionais — veja `.env.example` (com comentários).

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL. Ativa o modo banco de dados |
| `DATABASE_POOL_MAX` | Conexões simultâneas por instância (padrão 5) |
| `DATABASE_SSL=disable` | Desliga TLS (apenas Postgres local sem TLS) |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Ativam o Supabase Storage para os uploads |
| `SUPABASE_STORAGE_BUCKET` | Nome do bucket (padrão `media`) |
| `SESSION_SECRET` | Segredo da sessão do painel (recomendado em produção) |
| `STORAGE_DIR` | Pasta do modo local (padrão `./storage`) |
| `INSECURE_COOKIES=1` | Permite login em produção sem HTTPS (só para testes) |

## Segurança do painel

- Senha com hash `scrypt`; sessão em cookie `httpOnly` assinado (HMAC), válido por 7 dias.
- Login bloqueado por 2 minutos após 5 tentativas erradas (por IP, em memória por instância).
- Todas as server actions e rotas de upload verificam a sessão e validam/limpam os dados recebidos.
- Uploads: só imagens e PDF, até 15 MB, com nome de arquivo gerado pelo servidor.

## Hospedagem

- **Servidor Node com disco** (VPS, Railway, Render, Fly.io com volume): funciona em qualquer modo.
- **Serverless**: use Supabase para banco **e** arquivos.

As imagens de exemplo vêm do Unsplash e servem apenas como conteúdo provisório.
