import type { Database, GalleryImage, Project, Post } from "./types";

const U = (id: string) => `https://images.unsplash.com/photo-${id}`;

const IMG = {
  houseTree: U("1600585154340-be6161a56a0c"),
  houseTimber: U("1600566753190-17f0baa2a6c3"),
  houseWhitePool: U("1512917774080-9991f1c4c750"),
  houseWhiteVolumes: U("1523217582562-09d0def993a6"),
  houseBrickPool: U("1580587771525-78b9dba3b914"),
  houseCladdingA: U("1600047509358-9dc75507daeb"),
  houseCladdingB: U("1600047509807-ba8f99d2cdde"),
  houseRoofPool: U("1600596542815-ffad4c1539a9"),
  houseLongPool: U("1613490493576-7fde63acd811"),
  livingWood: U("1600607687939-ce8a6c25118c"),
  stairGlass: U("1600573472550-8090b5e0745e"),
  stairWood: U("1502005229762-cf1b2da7c5d6"),
  livingBeige: U("1618221195710-dd6b41faaea6"),
  livingLight: U("1600210492486-724fe5c67fb0"),
  armchair: U("1586023492125-27b2c045efd7"),
  bedroom: U("1600607687644-c7171b42498f"),
  roomMinimal: U("1513694203232-719a280e022f"),
  office: U("1497366216548-37526070297c"),
  glassFacade: U("1481026469463-66327c86e544"),
  towers: U("1486406146926-c627a92ad1ab"),
  museum: U("1487958449943-2429e8be8625"),
  whiteCubes: U("1479839672679-a46483c0e7c8"),
  goldTowers: U("1431576901776-e539bd916ba2"),
  balconies: U("1460317442991-0ec209397118"),
  darkFacade: U("1545324418-cc1a3fa10c00"),
  drawing: U("1503387762-592deb58ef4e"),
};

export const SEED_IMAGES = IMG;

let gid = 0;
const g = (url: string, caption = "", layout: GalleryImage["layout"] = "full"): GalleryImage => ({
  id: `g${++gid}`,
  url,
  caption,
  layout,
});

const now = new Date("2026-11-01T12:00:00Z").toISOString();

function project(p: Partial<Project> & Pick<Project, "id" | "slug" | "title">, order: number): Project {
  return {
    subtitle: "",
    categoryId: "residencial",
    status: "concluido",
    location: "",
    year: "",
    area: "",
    client: "Privado",
    team: "",
    photographer: "",
    summary: "",
    description: "",
    cover: "",
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
      slug: "casa-jabuticabeira",
      title: "Casa Jabuticabeira",
      subtitle: "Uma casa organizada em torno de uma árvore centenária",
      location: "Campinas, SP",
      year: "2024",
      area: "420 m²",
      team: "Helena Duarte, Rafael Lima, Júlia Sato",
      photographer: "Estúdio Luz Rasante",
      summary:
        "Residência unifamiliar que preserva uma jabuticabeira existente e organiza os ambientes em dois volumes conectados por uma galeria envidraçada.",
      description:
        "O terreno, em declive suave, abrigava uma jabuticabeira de mais de oitenta anos. Em vez de tratá-la como obstáculo, o projeto a transformou no centro de gravidade da casa: todos os ambientes sociais se voltam para ela, e a galeria de circulação contorna sua copa.\n\nA casa se divide em dois volumes. O primeiro, em concreto aparente, abriga as áreas íntimas e se fecha para a rua. O segundo, mais leve, em estrutura metálica e caixilhos de piso a teto, acomoda estar, jantar e cozinha integrados.\n\nBrises de madeira cumaru filtram a luz poente e garantem privacidade sem perder a relação com o jardim. A cobertura verde reduz a carga térmica e devolve ao lote parte da área permeável ocupada pela construção.",
      cover: IMG.houseTree,
      featured: true,
      gallery: [
        g(IMG.houseTree, "Fachada voltada para o jardim ao entardecer"),
        g(IMG.livingWood, "Estar integrado com painel em freijó", "half"),
        g(IMG.stairGlass, "Escada em balanço e caixilhos de piso a teto", "half"),
        g(IMG.livingBeige, "Sala íntima com vista para a jabuticabeira"),
      ],
    },
    1,
  ),
  project(
    {
      id: "p2",
      slug: "casa-ripada",
      title: "Casa Ripada",
      subtitle: "Madeira, sombra e ventilação cruzada no litoral norte",
      location: "Ilhabela, SP",
      year: "2023",
      area: "380 m²",
      team: "Helena Duarte, Bruno Tavares",
      photographer: "Estúdio Luz Rasante",
      summary:
        "Casa de praia envolta por uma pele de ripas de madeira que controla a insolação e permite ventilação natural constante.",
      description:
        "Implantada entre a mata e o mar, a casa adota uma pele contínua de ripas de madeira tratada que funciona como filtro: deixa passar a brisa, controla a luz e protege os ambientes do sol intenso da tarde.\n\nO programa se distribui em um único pavimento elevado do solo, o que reduz o impacto sobre o terreno e protege a casa da umidade. Grandes beirais criam varandas sombreadas que se tornam a principal área de convivência.",
      cover: IMG.houseTimber,
      featured: true,
      gallery: [
        g(IMG.houseTimber, "Volume principal com pele de ripas"),
        g(IMG.stairWood, "Circulação vertical em madeira", "half"),
        g(IMG.livingLight, "Estar com abertura total para a varanda", "half"),
      ],
    },
    2,
  ),
  project(
    {
      id: "p3",
      slug: "casa-do-mirante",
      title: "Casa do Mirante",
      subtitle: "Volumes brancos sobre a encosta",
      location: "Florianópolis, SC",
      year: "2022",
      area: "510 m²",
      team: "Helena Duarte, Júlia Sato, Pedro Antunes",
      photographer: "André Kfouri",
      summary:
        "Volumes brancos escalonados acompanham a topografia e enquadram a vista da Lagoa da Conceição.",
      description:
        "A casa se acomoda à encosta em três platôs. Cada nível abriga uma parte do programa e se abre para uma vista diferente da lagoa.\n\nA piscina, no platô intermediário, funciona como um espelho d'água que reflete o céu e prolonga visualmente a paisagem. A paleta reduzida — branco, pedra e madeira — deixa que a luz natural defina o caráter dos espaços ao longo do dia.",
      cover: IMG.houseWhitePool,
      featured: true,
      gallery: [
        g(IMG.houseWhitePool, "Piscina no platô intermediário"),
        g(IMG.houseLongPool, "Fachada sul", "half"),
        g(IMG.houseRoofPool, "Terraço com vista para a lagoa", "half"),
        g(IMG.houseWhiteVolumes, "Composição de volumes brancos"),
      ],
    },
    3,
  ),
  project(
    {
      id: "p4",
      slug: "residencia-volumes",
      title: "Residência Volumes",
      subtitle: "Composição de cheios e vazios em lote urbano",
      location: "Belo Horizonte, MG",
      year: "2025",
      area: "360 m²",
      status: "em-andamento",
      team: "Helena Duarte, Rafael Lima",
      photographer: "Renders: Atelier Norte Visual",
      summary:
        "Residência em lote urbano estreito que alterna volumes revestidos em madeira e superfícies brancas para criar pátios internos.",
      description:
        "Em um lote de apenas 12 metros de frente, a casa se organiza a partir de dois pátios internos que garantem iluminação e ventilação a todos os ambientes.\n\nOs volumes revestidos em madeira marcam as áreas íntimas, enquanto as superfícies brancas definem os espaços de convívio. A obra tem previsão de conclusão no segundo semestre de 2026.",
      cover: IMG.houseCladdingB,
      featured: true,
      gallery: [
        g(IMG.houseCladdingB, "Fachada principal"),
        g(IMG.houseCladdingA, "Acesso de veículos e jardim frontal", "half"),
        g(IMG.houseBrickPool, "Fundos e área de lazer", "half"),
      ],
    },
    4,
  ),
  project(
    {
      id: "p5",
      slug: "sede-atelier-norte",
      title: "Sede Atelier Norte",
      subtitle: "Escritório corporativo de planta livre",
      categoryId: "comercial",
      location: "São Paulo, SP",
      year: "2023",
      area: "1.200 m²",
      client: "Atelier Norte",
      team: "Helena Duarte, Bruno Tavares, Camila Reis",
      photographer: "Estúdio Luz Rasante",
      summary:
        "Retrofit de dois pavimentos corporativos com planta livre, mobiliário sob medida e foco em conforto acústico.",
      description:
        "O projeto de retrofit eliminou as divisórias existentes e devolveu ao andar sua planta livre original. Um eixo central de apoio concentra copa, salas de reunião e áreas técnicas, liberando as fachadas para as estações de trabalho.\n\nForros acústicos e painéis de feltro reciclado garantem conforto sonoro, enquanto a iluminação em LED com controle de temperatura de cor acompanha o ciclo do dia.",
      cover: IMG.office,
      gallery: [
        g(IMG.office, "Área de trabalho em planta livre"),
        g(IMG.glassFacade, "Fachada do edifício", "half"),
        g(IMG.towers, "Contexto urbano", "half"),
      ],
    },
    5,
  ),
  project(
    {
      id: "p6",
      slug: "pavilhao-dobra",
      title: "Pavilhão Dobra",
      subtitle: "Concurso para pavilhão cultural",
      categoryId: "institucional",
      status: "conceito",
      location: "Curitiba, PR",
      year: "2025",
      area: "2.800 m²",
      client: "Concurso Público Nacional",
      team: "Helena Duarte, Pedro Antunes, Júlia Sato",
      photographer: "Imagens ilustrativas",
      summary:
        "Proposta de concurso — menção honrosa — para um pavilhão cultural cuja cobertura se dobra para criar uma praça pública.",
      description:
        "A cobertura do pavilhão se dobra sobre si mesma e desce até o nível do chão, transformando-se em uma praça inclinada aberta à cidade. Sob ela, os espaços expositivos se organizam de forma flexível.\n\nA proposta recebeu menção honrosa no concurso nacional e foi publicada em revistas especializadas.",
      cover: IMG.museum,
      gallery: [
        g(IMG.museum, "Vista da cobertura dobrada"),
        g(IMG.whiteCubes, "Estudo de volumetria", "half"),
        g(IMG.goldTowers, "Inserção urbana", "half"),
      ],
    },
    6,
  ),
  project(
    {
      id: "p7",
      slug: "apartamento-higienopolis",
      title: "Apartamento Higienópolis",
      subtitle: "Reforma de apartamento modernista dos anos 1950",
      categoryId: "interiores",
      location: "São Paulo, SP",
      year: "2024",
      area: "210 m²",
      team: "Helena Duarte, Camila Reis",
      photographer: "André Kfouri",
      summary:
        "Reforma que recupera o piso de taco original, abre a cozinha para o estar e cria marcenaria contínua ao longo das paredes.",
      description:
        "O apartamento, em um edifício modernista de 1954, havia sido compartimentado ao longo das décadas. A reforma devolveu a fluidez original, recuperou o piso de taco e os caixilhos de ferro.\n\nUma marcenaria contínua em freijó organiza biblioteca, aparador e armários, liberando o centro dos ambientes. Peças de design brasileiro dialogam com obras de arte da coleção dos moradores.",
      cover: IMG.armchair,
      featured: true,
      gallery: [
        g(IMG.livingBeige, "Estar com piso de taco recuperado"),
        g(IMG.armchair, "Detalhe do estar", "half"),
        g(IMG.bedroom, "Suíte principal", "half"),
        g(IMG.roomMinimal, "Sala íntima"),
      ],
    },
    7,
  ),
  project(
    {
      id: "p8",
      slug: "edificio-ventura",
      title: "Edifício Ventura",
      subtitle: "Edifício residencial de uso misto",
      categoryId: "comercial",
      status: "em-andamento",
      location: "Recife, PE",
      year: "2026",
      area: "8.400 m²",
      client: "Ventura Incorporações",
      team: "Helena Duarte, Rafael Lima, Bruno Tavares",
      photographer: "Renders: Atelier Norte Visual",
      summary:
        "Edifício de 14 pavimentos com térreo comercial ativo, varandas profundas e fachada ventilada em cerâmica.",
      description:
        "O edifício propõe um térreo permeável com comércio voltado para a calçada e uma pequena praça de acesso público.\n\nNos pavimentos tipo, varandas profundas funcionam como extensão das salas e como dispositivos de sombreamento — uma resposta direta ao clima do Recife.",
      cover: IMG.whiteCubes,
      gallery: [
        g(IMG.whiteCubes, "Volumetria geral"),
        g(IMG.balconies, "Varandas profundas", "half"),
        g(IMG.darkFacade, "Fachada ventilada", "half"),
      ],
    },
    8,
  ),
];

function post(p: Partial<Post> & Pick<Post, "id" | "slug" | "title" | "date">): Post {
  return {
    type: "noticia",
    outlet: "",
    externalUrl: "",
    excerpt: "",
    body: "",
    cover: "",
    published: true,
    createdAt: now,
    updatedAt: now,
    ...p,
  };
}

const posts: Post[] = [
  post({
    id: "n1",
    slug: "casa-jabuticabeira-na-revista-projeto",
    title: "Casa Jabuticabeira é destaque na Revista Projeto",
    type: "imprensa",
    date: "2026-09-12",
    outlet: "Revista Projeto",
    excerpt: "A edição de setembro dedica seis páginas à casa que se organiza em torno de uma árvore centenária.",
    body: "A Revista Projeto publicou, em sua edição de setembro, uma reportagem sobre a Casa Jabuticabeira. O texto destaca a decisão de preservar a árvore existente e o modo como ela estrutura toda a implantação.\n\nA matéria inclui entrevista com Helena Duarte sobre o processo de projeto e a relação entre arquitetura e paisagem.",
    cover: IMG.houseTree,
  }),
  post({
    id: "n2",
    slug: "mencao-honrosa-pavilhao-dobra",
    title: "Menção honrosa no Concurso Nacional para Pavilhão Cultural",
    type: "premio",
    date: "2026-06-03",
    outlet: "IAB-PR",
    excerpt: "A proposta Pavilhão Dobra foi reconhecida entre mais de 140 propostas inscritas.",
    body: "O júri destacou a capacidade da proposta de criar espaço público a partir da própria cobertura do edifício.\n\nA equipe foi formada por Helena Duarte, Pedro Antunes e Júlia Sato.",
    cover: IMG.museum,
  }),
  post({
    id: "n3",
    slug: "palestra-bienal-arquitetura",
    title: "Palestra na Bienal de Arquitetura: a casa e a paisagem",
    type: "evento",
    date: "2026-03-20",
    outlet: "Bienal de Arquitetura",
    excerpt: "Helena Duarte apresentou o trabalho do escritório na mesa dedicada à arquitetura residencial contemporânea.",
    body: "A palestra percorreu dez anos de projetos residenciais e discutiu como a implantação define a experiência cotidiana de uma casa.",
    cover: IMG.drawing,
  }),
  post({
    id: "n4",
    slug: "casa-do-mirante-archdaily",
    title: "Casa do Mirante publicada no ArchDaily",
    type: "imprensa",
    date: "2025-11-15",
    outlet: "ArchDaily Brasil",
    externalUrl: "https://www.archdaily.com.br",
    excerpt: "O projeto em Florianópolis foi selecionado para publicação com fotografias de André Kfouri.",
    body: "A publicação apresenta plantas, cortes e fotografias do projeto.",
    cover: IMG.houseWhitePool,
  }),
];

export function createSeed(secret: string, passwordHash: string, salt: string): Database {
  return {
    version: 1,
    secret,
    user: {
      email: "admin@studio.com",
      name: "Helena Duarte",
      passwordHash,
      salt,
      isDefaultPassword: true,
    },
    settings: {
      siteName: "Helena Duarte Arquitetura",
      architectName: "Helena Duarte",
      tagline: "Arquitetura residencial, interiores e espaços de trabalho",
      seoDescription:
        "Escritório de arquitetura autoral dedicado a projetos residenciais, interiores e corporativos, com foco em luz natural, materialidade e paisagem.",
      email: "contato@helenaduarte.arq.br",
      phone: "+55 11 3456-7890",
      whatsapp: "5511987654321",
      address: "Rua Fradique Coutinho, 1200 — Sala 34, Pinheiros",
      city: "São Paulo, SP — 05416-001",
      mapUrl: "https://maps.google.com/?q=Rua+Fradique+Coutinho+1200+São+Paulo",
      instagram: "https://instagram.com/",
      linkedin: "https://linkedin.com/",
      pinterest: "https://pinterest.com/",
      behance: "",
      cau: "CAU A123456-7",
      officeHours: "Segunda a sexta, das 9h às 18h",
    },
    home: {
      heroTitle: "Arquitetura feita de luz, matéria e lugar.",
      heroSubtitle: "Projetos residenciais, interiores e corporativos desde 2012.",
      statement:
        "Acreditamos que cada projeto começa pelo lugar: a topografia, a luz, o vento e as pessoas que vão habitá-lo. Desenhamos espaços serenos, duráveis e precisos — pensados para envelhecer bem.",
      servicesTitle: "Atuação",
      services: [
        {
          title: "Arquitetura residencial",
          text: "Casas unifamiliares do estudo de implantação ao detalhamento executivo.",
        },
        { title: "Interiores", text: "Reformas, marcenaria sob medida e curadoria de mobiliário e iluminação." },
        { title: "Corporativo e comercial", text: "Escritórios, lojas e espaços de hospitalidade com foco no uso." },
        { title: "Acompanhamento de obra", text: "Visitas técnicas e gestão de fornecedores até a entrega das chaves." },
      ],
      aboutTeaserTitle: "Um estúdio autoral, de escala humana.",
      aboutTeaserText:
        "Fundado por Helena Duarte em 2012, o escritório reúne uma pequena equipe multidisciplinar que acompanha cada projeto de perto, do primeiro croqui à última visita de obra.",
      aboutTeaserImage: IMG.drawing,
      ctaTitle: "Vamos conversar sobre o seu projeto?",
      ctaText: "Conte um pouco sobre o que você imagina. Respondemos em até dois dias úteis.",
      showJournal: true,
    },
    about: {
      title: "Escritório",
      portrait: U("1494790108377-be9c29b29330"),
      intro:
        "Helena Duarte Arquitetura é um estúdio de arquitetura e interiores sediado em São Paulo, com projetos em diversas regiões do Brasil.",
      bio: "Helena Duarte é arquiteta e urbanista formada pela FAU-USP, com mestrado em Projeto de Arquitetura pela Universidade do Porto. Antes de fundar o próprio escritório, trabalhou em estúdios em São Paulo e Lisboa, onde participou de projetos residenciais e culturais premiados.\n\nDesde 2012, conduz um escritório de escala propositalmente pequena, que permite acompanhar pessoalmente cada etapa do projeto. O trabalho do estúdio foi publicado em revistas nacionais e internacionais e recebeu reconhecimentos em concursos de arquitetura.",
      philosophyTitle: "Como pensamos",
      philosophy:
        "Projetamos a partir do lugar. Antes de qualquer desenho, estudamos o terreno, o percurso do sol, os ventos e a vegetação existente.\n\nPreferimos poucos materiais, bem empregados, e soluções construtivas honestas. Acreditamos que uma boa arquitetura é aquela que se torna mais bonita com o tempo de uso.",
      studioImage: IMG.drawing,
      timeline: [
        { year: "2008", text: "Graduação em Arquitetura e Urbanismo — FAU-USP" },
        { year: "2009", text: "Arquiteta colaboradora em escritório de arquitetura em São Paulo" },
        { year: "2011", text: "Mestrado em Projeto de Arquitetura — Universidade do Porto" },
        { year: "2012", text: "Fundação do escritório Helena Duarte Arquitetura" },
        { year: "2019", text: "Professora convidada de Projeto — Escola da Cidade" },
        { year: "2024", text: "Inauguração do novo estúdio em Pinheiros" },
      ],
      awards: [
        { year: "2026", title: "Menção honrosa — Concurso Nacional Pavilhão Cultural", org: "IAB-PR" },
        { year: "2024", title: "Finalista — Prêmio de Arquitetura Residencial", org: "Revista Projeto" },
        { year: "2022", title: "Seleção — Bienal Internacional de Arquitetura", org: "IAB-SP" },
      ],
      process: [
        { title: "Briefing", text: "Conversas e visita ao terreno para entender necessidades, desejos e orçamento." },
        { title: "Estudo preliminar", text: "Primeiras ideias de implantação, volumetria e organização dos espaços." },
        { title: "Anteprojeto", text: "Desenvolvimento das soluções, materiais e compatibilização inicial." },
        { title: "Projeto executivo", text: "Detalhamento completo para orçamento e construção." },
        { title: "Obra", text: "Acompanhamento técnico até a entrega, garantindo fidelidade ao projeto." },
      ],
      clients: "Atelier Norte, Ventura Incorporações, Família Moura, Família Sato, Casa Lume, Grupo Aurora",
    },
    categories: [
      { id: "residencial", name: "Residencial", slug: "residencial" },
      { id: "interiores", name: "Interiores", slug: "interiores" },
      { id: "comercial", name: "Comercial", slug: "comercial" },
      { id: "institucional", name: "Institucional", slug: "institucional" },
    ],
    projects,
    posts,
    messages: [
      {
        id: "m1",
        name: "Mariana Costa",
        email: "mariana@example.com",
        phone: "(11) 99999-0000",
        projectType: "Residencial",
        message:
          "Olá! Comprei um terreno em Itu e gostaria de conversar sobre o projeto de uma casa de aproximadamente 300 m². Vocês atendem a região?",
        createdAt: now,
        read: false,
      },
    ],
    media: [],
  };
}
