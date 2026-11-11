import type { Database, Project } from "./types";

/**
 * Conteúdo inicial. Tudo entre [colchetes] é um espaço reservado para a Stephany preencher
 * pelo CMS — nada aqui afirma fatos sobre ela. Os projetos começam sem imagens: o site mostra
 * uma área hachurada no lugar até que as imagens sejam enviadas.
 */

const now = new Date("2026-11-11T12:00:00Z").toISOString();

function project(
  p: Partial<Project> & Pick<Project, "id" | "slug" | "title" | "categoryId" | "program">,
  order: number,
): Project {
  return {
    subtitle: "[Uma frase que diz o que é o projeto e onde ele fica.]",
    context: "[Disciplina] · [semestre]",
    location: "[Cidade, UF]",
    year: "[Ano]",
    area: "",
    advisor: "",
    authorship: "Individual",
    tools: "",
    summary: "[Até 60 palavras: qual pergunta o trabalho responde, para quem e por que neste lugar.]",
    siteText: "",
    conceptText: "",
    constructionText: "",
    processText: "",
    credits: "",
    cover: "",
    pdfUrl: "",
    gallery: [],
    featured: false,
    published: true,
    createdAt: now,
    updatedAt: now,
    ...p,
    order,
  };
}

const projects: Project[] = [
  project(
    {
      id: "p1",
      slug: "trabalho-final-de-graduacao",
      title: "[Título do TFG]",
      categoryId: "tfg",
      program: "[Tema do trabalho final]",
      context: "Trabalho Final de Graduação",
      advisor: "[Nome do(a) orientador(a)]",
      area: "[Área em m² ou ha]",
      tools: "[Softwares e técnicas]",
      siteText: "[Duas ou três linhas sobre o que a leitura do território revelou.]",
      conceptText: "[A ideia central do projeto, em poucas frases. Os diagramas contam o resto.]",
      constructionText:
        "[Três ou quatro tópicos curtos: sistema estrutural, materiais, conforto ambiental e a decisão técnica mais importante.]",
      processText: "[Croquis, maquetes de estudo e versões descartadas: como a ideia amadureceu.]",
      credits: "Projeto, desenhos e imagens: Stephany Ruiz.\nOrientação: [nome]. Banca: [nomes].",
      featured: true,
    },
    1,
  ),
  project(
    { id: "p2", slug: "habitacao-coletiva", title: "[Título do projeto]", categoryId: "arquitetura", program: "Habitação coletiva" },
    2,
  ),
  project(
    {
      id: "p3",
      slug: "plano-de-bairro",
      title: "[Título do projeto]",
      categoryId: "urbanismo",
      program: "Plano de bairro",
      authorship: "Em equipe — [diga qual foi a sua parte]",
    },
    3,
  ),
  project(
    { id: "p4", slug: "requalificacao-de-praca", title: "[Título do projeto]", categoryId: "paisagismo", program: "Requalificação de praça" },
    4,
  ),
  project(
    {
      id: "p5",
      slug: "escola-de-educacao-infantil",
      title: "[Título do projeto]",
      categoryId: "arquitetura",
      program: "Escola de educação infantil",
    },
    5,
  ),
  project(
    {
      id: "p6",
      slug: "concurso-estudantil",
      title: "[Título do projeto]",
      categoryId: "concurso",
      program: "Concurso estudantil",
      context: "[Nome do concurso]",
      authorship: "Em equipe — [diga qual foi a sua parte]",
    },
    6,
  ),
];

export function createSeed(secret: string, passwordHash: string, salt: string): Database {
  return {
    version: 2,
    secret,
    user: {
      email: "admin@studio.com",
      name: "Stephany Ruiz",
      passwordHash,
      salt,
      isDefaultPassword: true,
    },
    settings: {
      siteName: "Stephany Ruiz Arquiteta e Urbanista",
      architectName: "Stephany Ruiz",
      profession: "Arquiteta e Urbanista",
      tagline: "Portfólio de arquitetura e urbanismo",
      seoDescription: "Portfólio de Stephany Ruiz, arquiteta e urbanista: projetos selecionados da graduação, currículo e contato.",
      email: "[e-mail]",
      phone: "",
      whatsapp: "",
      city: "[Cidade, UF]",
      instagram: "",
      linkedin: "",
      behance: "",
      cau: "",
      education: "Arquitetura e Urbanismo — [Universidade], [ano]",
      availability: "Disponível para [vaga júnior / freelas] a partir de [mês/ano]",
      portfolioPdf: "",
      cvPdf: "",
    },
    home: {
      eyebrow: "Portfólio 2026 · [Cidade, UF]",
      heroTitle:
        "Arquiteta e urbanista formada pela [Universidade]. Este portfólio reúne projetos da graduação, do edifício ao bairro.",
      ctaTitle: "Vamos conversar sobre uma vaga ou um projeto?",
    },
    about: {
      title: "Sobre",
      portrait: "",
      intro: "[Primeiro parágrafo, em primeira pessoa: quem é, onde se formou e o que mais gosta de projetar.]",
      bio: "[Segundo parágrafo: o que aprendeu no TFG e nos estágios, como trabalha em equipe e que tipo de oportunidade procura agora. No máximo cinco linhas.]",
      education: [
        {
          period: "[ano] – [ano]",
          title: "Bacharelado em Arquitetura e Urbanismo",
          detail: "[Universidade] · TFG: [título], orientação de [nome]",
        },
      ],
      experience: [
        {
          period: "[mês/ano] – [mês/ano]",
          title: "Estágio em [escritório]",
          detail: "[O que você fez de fato: desenhos executivos, modelagem, levantamentos, acompanhamento de obra.]",
        },
      ],
      tools: [
        { label: "Desenho e BIM", value: "[Ex.: AutoCAD, Revit]" },
        { label: "Modelagem e imagem", value: "[Ex.: SketchUp, V-Ray]" },
        { label: "Urbanismo e mapas", value: "[Ex.: QGIS]" },
        { label: "Diagramação", value: "[Ex.: InDesign, Photoshop]" },
        { label: "À mão", value: "[Ex.: croqui, maquete física]" },
        { label: "Idiomas", value: "[Ex.: português nativo, inglês ___]" },
      ],
      awards: [],
    },
    categories: [
      { id: "tfg", name: "TFG", slug: "tfg" },
      { id: "arquitetura", name: "Arquitetura", slug: "arquitetura" },
      { id: "urbanismo", name: "Urbanismo", slug: "urbanismo" },
      { id: "paisagismo", name: "Paisagismo", slug: "paisagismo" },
      { id: "concurso", name: "Concurso", slug: "concurso" },
    ],
    projects,
    posts: [],
    messages: [],
    media: [],
  };
}
