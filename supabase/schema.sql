-- Gerado por: npm run db:schema
-- Documentos únicos: settings, home, about, user, secret
create table if not exists site_content (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

create table if not exists categories (
  id        text primary key,
  name      text not null,
  slug      text not null,
  position  integer not null default 0
);

create table if not exists projects (
  id            text primary key,
  slug          text not null unique,
  title         text not null,
  subtitle      text not null default '',
  category_id   text references categories(id) on delete set null,
  status        text not null default 'concluido'
                check (status in ('concluido', 'em-andamento', 'conceito')),
  location      text not null default '',
  year          text not null default '',
  area          text not null default '',
  client        text not null default '',
  team          text not null default '',
  photographer  text not null default '',
  summary       text not null default '',
  description   text not null default '',
  cover         text not null default '',
  gallery       jsonb not null default '[]'::jsonb,
  featured      boolean not null default false,
  published     boolean not null default false,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists projects_position_idx on projects (position);

create table if not exists posts (
  id            text primary key,
  slug          text not null unique,
  title         text not null,
  type          text not null default 'noticia'
                check (type in ('noticia', 'imprensa', 'premio', 'evento')),
  date          date not null default current_date,
  outlet        text not null default '',
  external_url  text not null default '',
  excerpt       text not null default '',
  body          text not null default '',
  cover         text not null default '',
  published     boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists posts_date_idx on posts (date desc);

create table if not exists messages (
  id            text primary key,
  name          text not null,
  email         text not null,
  phone         text not null default '',
  project_type  text not null default '',
  message       text not null,
  read          boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists messages_created_idx on messages (created_at desc);

create table if not exists media (
  id            text primary key,
  url           text not null,
  storage_path  text not null default '',
  name          text not null default '',
  size          bigint not null default 0,
  type          text not null default '',
  created_at    timestamptz not null default now()
);
create index if not exists media_created_idx on media (created_at desc);

-- No Supabase, tabelas do schema public ficam expostas pela API REST (chave anon).
-- Com RLS ligado e nenhuma policy, só a conexão direta do servidor consegue ler/escrever.
alter table site_content enable row level security;
alter table categories   enable row level security;
alter table projects     enable row level security;
alter table posts        enable row level security;
alter table messages     enable row level security;
alter table media        enable row level security;
