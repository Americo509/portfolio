import type { Portfolio } from "../../types/portfolio.types";

// Regra de conteúdo: nunca expor dados sensíveis (clientes, órgãos, números internos).
// Só arquitetura, preocupações técnicas, tecnologias e o domínio de cada sistema.

export const portfolioPT: Portfolio = {
  locale: "pt",
  profile: {
    name: "Gustavo Américo Rosa",
    handle: "gustavo.dev",
    headlineBase: "Arquiteto de Software · Full Stack · AppSec (Backend • Frontend • Mobile)",
    heroHeadline: "Projeto e construo sistemas escaláveis com arquitetura sólida e experiência sem fricção.",
    heroSubheadline:
      "Backend (Node/NestJS) • Frontend (React/Next) • Mobile (React Native/Expo) — engenharia orientada a produto, com defesa fechada desde o primeiro commit.",
    location: "Paraná, Brasil",
    bioShort:
      "Engenheiro de software focado em arquitetura clara, sistemas evolutivos e segurança — do backend ao mobile.",
    bioLong: `
      Sou Engenheiro de Software formado pela Unicesumar e atuo como Arquiteto e Full Stack Engineer, com experiência em backend, frontend e mobile.

      Meu trabalho vai além da implementação de funcionalidades. Projeto sistemas com modelagem de domínio clara, contratos bem definidos e decisões arquiteturais orientadas à evolução de longo prazo — e trato segurança (AppSec) como requisito de projeto, não como etapa final.

      Hoje atuo como arquiteto, desenvolvedor full stack e PO técnico de um SaaS multi-tenant de gestão de escalas médicas em produção, além de liderar o YourBest e construir produtos próprios com IA.
    `.trim()
  },
  links: {
    github: "https://github.com/Americo509",
    linkedin: "https://www.linkedin.com/in/gustavoamericorosa/",
    email: "americorosagustavo@gmail.com"
  },
  education: {
    title: "Engenheiro de Software",
    detail:
      "Formação com foco em arquitetura de software, estruturas de dados, modelagem de sistemas e práticas de engenharia orientadas à qualidade e escalabilidade."
  },
  credibilityLine: "Engenheiro de Software • Arquitetura, AppSec e desenvolvimento full stack",
  skills: [
    {
      label: "Backend Engineering",
      items: [
        "Node.js (TypeScript)",
        "NestJS",
        "REST & GraphQL APIs",
        "PostgreSQL / MySQL",
        "MongoDB",
        "TypeORM / Prisma / Drizzle",
        "Supabase",
        "Redis (Cache & Queues)",
        "BullMQ",
        "Kafka / RabbitMQ",
        "Testing (Jest - Unit & Integration)"
      ]
    },
    {
      label: "Frontend Engineering",
      items: [
        "React",
        "Next.js",
        "Astro",
        "TypeScript",
        "Tailwind CSS",
        "GSAP",
        "State Management (Zustand)",
        "Data Fetching (React Query)",
        "Accessibility & Performance"
      ]
    },
    {
      label: "Mobile Engineering",
      items: [
        "React Native",
        "Expo",
        "Expo Router",
        "Offline-first",
        "Geolocalização & Geofence",
        "Reanimated & Gestures",
        "Push Notifications",
        "Native Modules",
        "EAS Build/Update"
      ]
    },
    {
      label: "Architecture & Systems Design",
      items: [
        "Domain-Driven Design (DDD)",
        "Clean Architecture",
        "Multi-tenant SaaS",
        "Event-Driven Architecture",
        "Queues (BullMQ / Redis)",
        "Observability (Logs, Metrics, Tracing)"
      ]
    },
    {
      label: "AppSec & Blue Team",
      items: [
        "Authentication (JWT, RBAC, 2FA)",
        "Rate limiting",
        "Isolamento multi-tenant",
        "Validação & sanitização (Zod)",
        "Antifraude por geofence",
        "Logs de auditoria"
      ]
    },
    {
      label: "IA & DevOps",
      items: [
        "Pipelines com LLM",
        "Agentes de IA",
        "Orquestração com Claude Code",
        "Docker",
        "Linux on-premise",
        "GitHub Actions (self-hosted runners)"
      ]
    }
  ],
  lineup: {
    formation: "4-3-3",
    sectors: [
      {
        key: "defense",
        label: "Defesa",
        subtitle: "AppSec / Blue Team",
        players: [
          { number: 1, position: "Goleiro", role: "Autenticação & autorização", items: ["JWT", "RBAC", "2FA"] },
          { number: 2, position: "Lateral", role: "Validação & sanitização", items: ["Zod", "Sanitização de entrada"] },
          { number: 3, position: "Zagueiro", role: "Proteção de borda", items: ["Rate limiting", "WAF"] },
          { number: 4, position: "Zagueiro", role: "Isolamento multi-tenant", items: ["Isolamento estrito por tenant"] },
          { number: 6, position: "Lateral", role: "Antifraude", items: ["Geofence", "Validação de check-in"] }
        ]
      },
      {
        key: "midfield",
        label: "Meio-campo",
        subtitle: "O motor",
        players: [
          { number: 5, position: "Volante", role: "Modelagem de domínio", items: ["NestJS", "DDD", "Clean Architecture"] },
          { number: 8, position: "Meia", role: "Dados", items: ["PostgreSQL", "TypeORM", "Drizzle", "Supabase"] },
          { number: 10, position: "Meia", role: "Filas & eventos", items: ["Redis", "BullMQ", "Workers"] }
        ]
      },
      {
        key: "attack",
        label: "Ataque",
        subtitle: "Entrega",
        players: [
          { number: 7, position: "Ponta", role: "Web", items: ["React", "Next.js", "Astro", "GSAP"] },
          { number: 9, position: "Centroavante", role: "Mobile", items: ["React Native", "Expo", "Offline-first"] },
          { number: 11, position: "Ponta", role: "IA", items: ["Pipelines com LLM", "Agentes", "Claude Code"] }
        ]
      }
    ],
    bench: {
      label: "Comissão técnica",
      items: ["Docker", "Linux on-premise", "GitHub Actions (self-hosted)", "Observabilidade", "Testes"]
    }
  },
  method: {
    title: "Preleção",
    intro: "Spec-Driven Development + orquestração de IA & AppSec. Especificação preto no branco, do apito inicial ao apito final.",
    steps: [
      {
        number: "01",
        name: "Preleção",
        verb: "Especificar",
        body: "Nada de codar no escuro. Transformo o problema de negócio em user stories claras (\"Como X, quero Y, para que Z\"), com escopo fechado e critérios de aceite verificáveis."
      },
      {
        number: "02",
        name: "Prancheta",
        verb: "Projetar",
        body: "Desenho a arquitetura antes da primeira linha de código: modelagem DDD, contratos de banco (SQL), análise de superfície de ataque (AppSec) e reaproveitamento do que já existe."
      },
      {
        number: "03",
        name: "Escalação",
        verb: "Tarefas + plano",
        body: "Quebro a solução em etapas atômicas e auditáveis, e preparo o contexto exato para orquestrar agentes de IA (Claude Code) ou o time sem perder o controle arquitetural."
      },
      {
        number: "04",
        name: "Bola rolando",
        verb: "Executar",
        body: "Implementação limpa, commits pequenos, infraestrutura enxuta (Docker, Linux, CI/CD) e foco em performance e custo desde o dia zero."
      },
      {
        number: "05",
        name: "VAR & apito final",
        verb: "Auditar",
        body: "Validação rigorosa contra os critérios de aceite, revisão de segurança (mentalidade Blue Team: rate limit, logs, sanitização) e testes antes de ir para produção."
      }
    ]
  },
  principles: {
    title: "Como eu penso produto",
    body: "Sistema desenhado com sangue no olho para aguentar pressão e pico de tráfego sem cair. Obsessão por defesa fechada (Blue Team / AppSec) antes de ir pro ataque — e acabamento nos detalhes, do backend à experiência final.",
    items: [
      "Domain-driven modeling e separação clara de responsabilidades.",
      "Service boundaries bem definidos e contratos explícitos entre camadas.",
      "Segurança como requisito de projeto: autenticação, rate limit, isolamento e auditoria.",
      "Performance e escalabilidade tratadas como requisitos desde o design.",
      "Observabilidade por padrão (logs estruturados, tracing e métricas acionáveis).",
      "Resiliência: filas, retries, timeouts e tratamento consistente de falhas.",
      "Código evolutivo com baixo acoplamento e alta coesão."
    ]
  },
  about: {
    values: [
      {
        title: "Qualidade e previsibilidade",
        body: "Eu prefiro sistemas fáceis de manter e de evoluir: contratos claros, testes onde faz sentido e decisões registradas."
      },
      {
        title: "Performance e acessibilidade",
        body: "Velocidade e inclusão não são extras. Eu considero performance, a11y e UX como parte do produto."
      },
      {
        title: "Segurança e clareza",
        body: "Autenticação, validação, rate limits e logs úteis — defesa fechada sem complicar o essencial."
      },
      {
        title: "DX e colaboração",
        body: "Padrões, automações e documentação prática para o time ganhar tempo — e reduzir bugs."
      }
    ],
    timeline: [
      {
        year: "2022",
        title: "Base sólida em engenharia e sistemas legados",
        body: "Atuação com desenvolvimento em Delphi e sistemas empresariais, consolidando fundamentos em lógica, modelagem de dados, versionamento e práticas de engenharia. Experiência inicial em ambientes reais de produção e ciclos ágeis."
      },
      {
        year: "2023",
        title: "Transição estratégica para arquitetura web moderna",
        body: "Migração do foco em sistemas legados para desenvolvimento full stack moderno com React, NestJS e TypeScript. Desenvolvimento de aplicações web escaláveis e aprofundamento em APIs REST, banco relacional e organização modular."
      },
      {
        year: "2024",
        title: "Liderança técnica e arquitetura full-stack",
        body: "Atuação como líder de desenvolvimento na Nevra Software, estruturando backend com NestJS, MySQL, Redis e Angular. Criação de APIs seguras, integração com serviços externos e fortalecimento de práticas de arquitetura e CI/CD."
      },
      {
        year: "2024",
        title: "Fundação do YourBest e visão de produto",
        body: "Co-fundador e responsável pela arquitetura do YourBest, marketplace mobile desenvolvido em monorepo com React Native (Expo), Next.js e NestJS. Implementação de autenticação robusta, modelagem de domínio e base preparada para crescimento sustentável."
      },
      {
        year: "2025",
        title: "Consolidação como engenheiro orientado a arquitetura",
        body: "Foco em sistemas escaláveis, DDD, observabilidade e experiência sem fricção. Evolução contínua em backend, mobile e arquitetura orientada a produto, consolidando atuação como Senior Full Stack Software Engineer."
      }
    ]
  },
  resenha: {
    title: "Fora do terminal",
    intro: "Paranaense. Trabalho pesado das 8h às 17h30 — passou disso, o foco é futebol, cerveja gelada, jogos e resenha com os amigos.",
    blocks: [
      { title: "Pelada sagrada", body: "Presença confirmada no futebol da semana. Falta só a bola rolar." },
      { title: "Sangue preto e branco", body: "Sofredor fiel pelo Corinthians." },
      { title: "Próxima missão", body: "Planejando a expedição de 2027 com a rapaziada." }
    ],
    nextMatchDays: [
      { weekday: 2, time: "20:00" },
      { weekday: 3, time: "20:00" },
      { weekday: 6, time: "09:00" }
    ],
    radar: {
      title: "Radar 2027",
      question: "O dilema em aberto:",
      options: ["Esquiar no Chile", "Rodar a Europa clássica"]
    },
    cards: [
      { number: "#08", caption: "Pelada da semana", src: "/images/resenha/cromo-08.jpg", alt: "Gustavo na pelada da semana" },
      { number: "#19", caption: "Arquibancada", src: "/images/resenha/cromo-19.jpg", alt: "Gustavo no estádio" },
      { number: "#10", caption: "Resenha", src: "/images/resenha/cromo-10.jpg", alt: "Resenha com os amigos" },
      { number: "#77", caption: "Radar 2027", src: "/images/resenha/cromo-77.jpg", alt: "Viagem com a rapaziada" }
    ]
  },
  projectTags: ["Backend", "Frontend", "Mobile", "Fullstack", "Arquitetura", "AppSec", "IA", "DevOps", "Produto"],
  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Marketplace mobile full-stack que conecta profissionais autônomos de beleza a clientes, com arquitetura escalável, autenticação robusta e foco em experiência sem fricção.",
      tier: "sumula",
      status: "development",
      competition: "Marketplace mobile on-demand",
      position: "Co-founder · Arquiteto · Full Stack",
      featured: true,
      featuredSize: "wide",
      cover: { src: "/images/yourbest/yourbest.png", alt: "YourBest - capa do projeto" },
      tags: ["Backend", "Mobile", "Fullstack", "Arquitetura", "Produto", "Frontend", "AppSec"],
      stack: ["React Native", "Expo", "TypeScript", "NestJS", "Next.js", "Drizzle ORM", "PostgreSQL", "Zod", "Zustand", "Tailwind CSS"],
      links: {},
      caseStudy: {
        context:
          "YourBest é um aplicativo marketplace desenvolvido para facilitar a contratação de serviços estéticos sob demanda. Profissionais autônomos se cadastram na plataforma oferecendo seus serviços e atendem clientes diretamente em suas residências, aumentando alcance e receita enquanto oferecem comodidade ao usuário final.",
        role:
          "Co-Founder e responsável pela arquitetura e desenvolvimento full-stack (backend, web e mobile), definição de padrões técnicos, estruturação de domínio e evolução contínua do produto.",
        technicalDecisions: [
          "Arquitetura em monorepo separando responsabilidades entre backend, web e mobile",
          "Backend em NestJS com modelagem orientada a domínio e contratos explícitos",
          "Drizzle ORM com PostgreSQL para tipagem forte e consistência de dados",
          "Autenticação com dois fatores para maior segurança",
          "Gerenciamento de estado estruturado com Zustand",
          "Validação de dados com Zod para previsibilidade entre camadas",
          "Componentização consistente e estilização com Tailwind CSS"
        ],
        challenges: [
          "Equilibrar velocidade de entrega com arquitetura sustentável",
          "Modelar fluxos complexos de cadastro, serviços e agendamentos de forma escalável",
          "Garantir UX mobile fluida e previsível em diferentes dispositivos",
          "Manter consistência técnica entre múltiplas plataformas dentro do monorepo"
        ],
        results: [
          "Base técnica preparada para expansão de novas categorias e funcionalidades",
          "Experiência mobile intuitiva com navegação previsível",
          "Arquitetura modular que suporta evolução contínua do produto",
          "Sistema seguro com autenticação reforçada"
        ],
        gallery: [
          { src: "/images/yourbest/yourbest.png", alt: "YourBest - capa do projeto" },
          { src: "/images/yourbest/tela-principal.jpg", alt: "YourBest - home" },
          { src: "/images/yourbest/agenda.jpg", alt: "YourBest - agenda" },
          { src: "/images/yourbest/servicos-ativos.jpg", alt: "YourBest - tela de serviços ativos" },
          { src: "/images/yourbest/aceitar-servico.jpg", alt: "YourBest - tela de aceitação de serviço" },
          { src: "/images/yourbest/financeiro.jpg", alt: "YourBest - tela de financeiro" },
          { src: "/images/yourbest/conta-bancaria.jpg", alt: "YourBest - tela de conta bancária" },
          { src: "/images/yourbest/profile.jpg", alt: "YourBest - tela de perfil" }
        ]
      }
    },
    {
      slug: "conecta-plantao",
      title: "CONECTA Plantão",
      summary:
        "SaaS multi-tenant de gestão de escalas médicas em produção, com app mobile offline-first, validação antifraude por geofence e filas assíncronas para os fluxos críticos.",
      tier: "sumula",
      status: "production",
      competition: "SaaS B2G/B2B multi-tenant · Saúde",
      position: "Arquiteto · Full Stack · PO Técnico",
      featured: true,
      featuredSize: "normal",
      privateRepo: true,
      cover: { src: "/images/conecta-plantao/cover.jpg", alt: "CONECTA Plantão - key art" },
      tags: ["Backend", "Frontend", "Mobile", "Fullstack", "Arquitetura", "AppSec", "DevOps", "Produto"],
      stack: [
        "NestJS (DDD)",
        "TypeORM",
        "PostgreSQL",
        "Redis",
        "BullMQ",
        "React",
        "React Native (Expo)",
        "Docker",
        "Linux on-premise",
        "GitHub Actions (self-hosted runners)"
      ],
      links: {},
      caseStudy: {
        context:
          "SaaS B2G/B2B em produção para instituições de saúde, voltado à gestão crítica de plantões médicos: escalas, jornadas, check-in/check-out e fechamento financeiro.",
        role: "Arquiteto de software, desenvolvedor full stack e PO técnico.",
        technicalDecisions: [
          "Isolamento estrito multi-tenant",
          "Arquitetura em DDD para regras complexas de jornada e pagamento",
          "Filas assíncronas com BullMQ e Redis para os fluxos críticos",
          "Check-in/check-out mobile offline-first",
          "Validação antifraude de localização por geofence"
        ],
        challenges: [
          "Operação confiável em unidades de saúde sem internet estável",
          "Evitar fraude de localização no registro de ponto médico",
          "Observabilidade e deploy automatizado em infraestrutura on-premise restrita"
        ],
        results: [
          "Sistema em produção processando escalas reais na saúde pública",
          "Redução de furos de escala",
          "Fechamento financeiro automatizado"
        ],
        gallery: []
      }
    },
    {
      // LEMBRETE: os prints são da landing page; o foco deve ser o site clínico (docs/art-direction.md §13).
      slug: "sol-poretti",
      title: "Sol Poretti — Nutrição Clínica",
      summary:
        "Ecossistema para nutrição clínica: editor visual interativo de planos alimentares (estilo Canva/Figma) e portal público de alta performance.",
      tier: "sumula",
      status: "production",
      competition: "Plataforma clínica + portal público",
      position: "Full Stack · Front-end de performance",
      featured: true,
      featuredSize: "normal",
      privateRepo: true,
      cover: { src: "/images/sol-poretti/cover-clinico.jpg", alt: "Sol Poretti - key art do sistema clínico" },
      tags: ["Frontend", "Fullstack", "Produto"],
      stack: ["React", "Next.js", "Astro", "GSAP", "TypeScript", "Tailwind CSS"],
      links: { demo: "https://solporettinutri.com.br" },
      caseStudy: {
        context:
          "Sistema especializado para nutrição clínica, com um editor visual interativo para montagem de planos alimentares e um portal público de alta conversão.",
        role: "Desenvolvimento do app, do editor visual e do portal público.",
        technicalDecisions: [
          "Canvas interativo para os nutricionistas montarem cardápios e lâminas visualmente",
          "App e editor visual em React/Next.js",
          "Landing page em Astro + GSAP com otimização extrema de Core Web Vitals"
        ],
        challenges: [],
        results: ["Portal público no ar em solporettinutri.com.br"],
        gallery: [
          { src: "/images/sol-poretti/home-desktop.jpg", alt: "Portal Sol Poretti - home (desktop)" },
          { src: "/images/sol-poretti/secoes-desktop.jpg", alt: "Portal Sol Poretti - seções (desktop)" },
          { src: "/images/sol-poretti/home-mobile.jpg", alt: "Portal Sol Poretti - home (mobile)" }
        ]
      }
    },
    {
      slug: "sentinela",
      title: "Projeto Sentinela",
      summary:
        "Agente autônomo e SaaS de inteligência em licitações: monitora, coleta e classifica editais públicos com pipelines de LLM.",
      tier: "sumula",
      status: "operating",
      competition: "SaaS de inteligência · GovTech",
      position: "Arquiteto · Full Stack",
      privateRepo: true,
      cover: { src: "/images/sentinela/cover.jpg", alt: "Projeto Sentinela - key art" },
      tags: ["Backend", "Fullstack", "Arquitetura", "IA", "Produto"],
      stack: ["Node.js", "TypeScript", "NestJS", "Next.js", "PostgreSQL", "Filas & workers de scraping", "LLM (classificação semântica)", "Docker"],
      links: {},
      caseStudy: {
        context:
          "Plataforma SaaS que monitora, coleta e classifica editais de licitações públicas (PNCP, BLL, diários oficiais e portais) usando pipelines de LLM para encontrar oportunidades com alta precisão.",
        role: "Arquitetura e desenvolvimento full stack, do pipeline de ingestão ao produto.",
        technicalDecisions: [
          "Pipeline de ingestão resiliente a mudanças de layout dos portais públicos",
          "Classificação via LLM com controle rígido de custo de tokens",
          "Multi-contas com filtros personalizados",
          "Cofre seguro de documentos de habilitação"
        ],
        challenges: [
          "Dados públicos desestruturados",
          "Rate limits severos dos portais governamentais",
          "Transformar um agente interno num produto SaaS multiusuário com planos pagos"
        ],
        results: ["Em operação ativa, convertendo horas de triagem manual de editais em alertas qualificados em minutos"],
        gallery: []
      }
    },
    {
      slug: "gustavo-os",
      title: "Gustavo OS",
      summary:
        "Segundo cérebro e orquestrador pessoal de produtividade: briefing matinal automático, radar de projetos, fechamento diário e resumo semanal.",
      tier: "sumula",
      status: "operating",
      competition: "Automação pessoal · IA",
      position: "Arquiteto · Desenvolvedor",
      privateRepo: true,
      cover: { src: "/images/gustavo-os/cover.jpg", alt: "Gustavo OS - key art" },
      tags: ["Backend", "Arquitetura", "IA"],
      stack: ["TypeScript", "Supabase (PostgreSQL)", "Notion API", "Google Calendar API", "Gmail API", "Agentes de IA", "Cron/Workers"],
      links: {},
      caseStudy: {
        context:
          "Ecossistema próprio de automação executiva que roda o meu dia a dia: gera o briefing matinal, monitora o radar de GitHub e projetos, faz o fechamento diário e consolida o resumo semanal.",
        role: "Concepção, arquitetura e desenvolvimento.",
        technicalDecisions: [
          "Arquitetura orientada a eventos pessoais",
          "Calendário, e-mails, tarefas e código centralizados num único histórico relacional no Supabase",
          "Contexto contínuo para os agentes de IA a partir desse histórico"
        ],
        challenges: [],
        results: ["Fim do microgerenciamento manual", "Visibilidade total da semana antes das 8h da manhã"],
        gallery: []
      }
    },
    {
      slug: "cookshow",
      title: "CookShow",
      summary:
        "Plataforma full-stack de receitas com busca inteligente por ingredientes, desenvolvida como projeto de conclusão de curso com arquitetura monorepo e testes automatizados.",
      tier: "base",
      status: "done",
      competition: "TCC · Plataforma web",
      position: "Full Stack",
      cover: { src: "/images/cookshow.jpg", alt: "CookShow - capa do projeto" },
      tags: ["Backend", "Fullstack", "Arquitetura", "Produto", "Frontend"],
      stack: ["NestJS", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "TypeORM", "Jest", "Vercel", "GitLab CI"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context:
          "CookShow foi desenvolvido como projeto de conclusão de curso com o objetivo de reduzir desperdício alimentar. O usuário informa os ingredientes disponíveis em casa e a plataforma retorna apenas receitas compatíveis, utilizando filtros inteligentes no backend.",
        role:
          "Desenvolvimento full-stack com backend em NestJS, frontend em React, modelagem de banco, testes automatizados e configuração de deploy contínuo.",
        technicalDecisions: [
          "Arquitetura monorepo organizada para separação clara entre frontend e backend",
          "Backend em NestJS com TypeORM e PostgreSQL",
          "Algoritmo de filtragem baseado em ingredientes informados pelo usuário",
          "Testes automatizados com Jest cobrindo regras de negócio",
          "Deploy contínuo via GitLab CI e hospedagem na Vercel",
          "Estilização consistente com Tailwind CSS"
        ],
        challenges: [
          "Implementar lógica de filtragem eficiente para múltiplos ingredientes",
          "Manter organização modular em um projeto full-stack",
          "Garantir cobertura de testes adequada para regras de negócio"
        ],
        results: [
          "Aplicação full-stack funcional com integração completa entre frontend e backend",
          "Solução prática para redução de desperdício doméstico",
          "Projeto robusto que demonstra domínio de arquitetura e testes"
        ],
        gallery: [{ src: "/images/cookshow.jpg", alt: "CookShow - capa do projeto" }]
      }
    },
    {
      slug: "pagina-de-vendas-apple-watch",
      title: "Página de Vendas — Apple Watch",
      summary:
        "Landing page inspirada na Apple, desenvolvida com HTML, CSS e JavaScript, focada em hierarquia visual, microinterações e experiência premium.",
      tier: "base",
      status: "study",
      competition: "Estudo · Landing page",
      position: "Front-end",
      cover: { src: "/images/pagina-apple-watch.png", alt: "Apple Watch Sales Page - capa" },
      tags: ["Frontend", "Produto"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context:
          "Projeto criado para simular uma página de produto premium inspirada na Apple, explorando tipografia marcante, espaçamento generoso e animações suaves para conduzir o usuário por uma narrativa visual.",
        role:
          "Design e implementação front-end utilizando tecnologias puras (HTML, CSS e JavaScript), com foco em acabamento visual e performance.",
        technicalDecisions: [
          "Estruturação semântica do HTML para clareza e acessibilidade",
          "Uso de CSS para criar hierarquia visual consistente",
          "Microinterações implementadas com JavaScript puro",
          "Responsividade adaptada para diferentes tamanhos de tela"
        ],
        challenges: [
          "Manter fidelidade visual sem frameworks modernos",
          "Criar sensação premium utilizando apenas tecnologias base",
          "Equilibrar animações com performance"
        ],
        results: ["Landing page visualmente refinada", "Experiência fluida e consistente", "Demonstração sólida de fundamentos de frontend"],
        gallery: [{ src: "/images/pagina-apple-watch.png", alt: "Apple Watch Sales Page - capa" }]
      }
    },
    {
      slug: "cardapio-digital",
      title: "Cardápio Digital",
      summary:
        "Aplicação web construída com React + Vite para exibição dinâmica de cardápios categorizados com foco em clareza e usabilidade.",
      tier: "base",
      status: "study",
      competition: "Estudo · Aplicação web",
      position: "Front-end",
      cover: { src: "/images/cardapio-digital.png", alt: "Cardápio Digital - capa" },
      tags: ["Frontend", "Produto"],
      stack: ["React", "Vite", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context: "Aplicação criada para substituir cardápios físicos por uma solução digital responsiva e organizada por categorias.",
        role: "Desenvolvimento front-end com React, organização de componentes e estruturação da navegação entre categorias.",
        technicalDecisions: [
          "Uso de React com Vite para desenvolvimento rápido e performático",
          "Componentização modular para facilitar manutenção",
          "Organização clara de dados e apresentação"
        ],
        challenges: ["Manter simplicidade de navegação com múltiplas categorias", "Garantir responsividade em dispositivos móveis"],
        results: ["Interface leve e organizada", "Projeto preparado para futuras extensões (busca e filtros)"],
        gallery: [{ src: "/images/cardapio-digital.png", alt: "Cardápio Digital - capa" }]
      }
    },
    {
      slug: "audio-book",
      title: "Audio Book",
      summary: "Player de audiolivros desenvolvido com JavaScript puro, focado em gerenciamento de estado e controle de mídia.",
      tier: "base",
      status: "study",
      competition: "Estudo · Player de mídia",
      position: "Front-end",
      cover: { src: "/images/audio-book.png", alt: "Audio Book - capa" },
      tags: ["Frontend", "Produto"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context: "Projeto focado em implementar um player funcional de audiolivros utilizando apenas tecnologias nativas do navegador.",
        role: "Desenvolvimento da lógica de reprodução, controle de estados e estrutura visual.",
        technicalDecisions: [
          "Controle de áudio utilizando API nativa do navegador",
          "Gerenciamento de estados de reprodução (play/pause/loading)",
          "Manipulação dinâmica do DOM com JavaScript"
        ],
        challenges: ["Sincronizar estado da UI com reprodução de áudio", "Garantir navegação intuitiva entre faixas"],
        results: ["Player funcional com controles claros", "Demonstração sólida de fundamentos JavaScript"],
        gallery: [{ src: "/images/audio-book.png", alt: "Audio Book - capa" }]
      }
    },
    {
      slug: "spotify",
      title: "Spotify (UI)",
      summary: "Clone de interface do Spotify desenvolvido com React, focado em layout complexo, grid e componentização modular.",
      tier: "base",
      status: "study",
      competition: "Estudo · Clone de interface",
      position: "Front-end",
      cover: { src: "/images/spotify.png", alt: "Spotify UI - capa" },
      tags: ["Frontend"],
      stack: ["React", "CSS"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context:
          "Projeto voltado para reproduzir a interface do Spotify, trabalhando estrutura em grid, sidebar fixa e organização modular de componentes.",
        role: "Construção da arquitetura de layout e componentização da UI utilizando React.",
        technicalDecisions: [
          "Estruturação do layout com grid e áreas fixas",
          "Componentização de cards, listas e sidebar",
          "Separação clara entre estrutura e apresentação"
        ],
        challenges: ["Manter consistência visual em múltiplas seções", "Reproduzir layout complexo de forma organizada"],
        results: [
          "Interface visualmente próxima ao produto original",
          "Boa organização estrutural de componentes",
          "Demonstra domínio de layouts complexos em React"
        ],
        gallery: [{ src: "/images/spotify.png", alt: "Spotify UI - capa" }]
      }
    }
  ],
  hud: {
    build: "v19.10",
    seed: "#1977",
    node: "node-2012",
    port: ":08",
    live: "Ao vivo",
    firstHalf: "1º T",
    halfTime: "Intervalo",
    secondHalf: "2º T",
    addedTime: "Acréscimos"
  },
  copy: {
    nav: { index: "Início", projects: "Projetos", about: "Sobre", contact: "Contato", menu: "Menu", close: "Fechar" },
    boot: {
      title: "Saída do túnel",
      skip: "Pular [esc]",
      loading: "Refletores %",
      lines: [
        "> saindo do túnel: {handle} · build v19.10",
        "> refletor 1/4 ................ ok",
        "> refletor 2/4 ................ ok",
        "> refletor 3/4 ................ ok",
        "> refletor 4/4 ................ ok — bola rolando"
      ]
    },
    hero: { primaryCta: "Ver projetos", secondaryCta: "Falar comigo" },
    status: {
      production: "Em produção",
      operating: "Em operação",
      development: "Em desenvolvimento",
      done: "Concluído",
      study: "Estudo"
    },
    privateRepo: "Repositório privado — arquitetura disponível na súmula",
    matchReport: {
      title: "Súmula da partida",
      competition: "Competição",
      position: "Função em campo",
      context: "Contexto da partida",
      role: "Meu papel em campo",
      lineup: "Escalação",
      keyMoments: "Lances decisivos",
      var: "VAR",
      fullTime: "Placar final",
      coverage: "Cobertura fotográfica",
      back: "← Voltar para a campanha",
      talk: "Vamos conversar",
      code: "Código →",
      live: "Ver ao vivo →"
    },
    sections: {
      featured: {
        eyebrow: "Jogos históricos",
        title: "Projetos com foco em produto, arquitetura e entrega.",
        description: "Súmulas selecionadas: decisões técnicas, desafios e o placar final de cada partida.",
        cta: "Ver a campanha completa →"
      },
      toolbox: {
        eyebrow: "Escalação",
        title: "Stack que uso no dia a dia.",
        description: "Organizada por setor — defesa fechada, meio-campo organizado e ataque que entrega."
      },
      about: { eyebrow: "Sobre", title: "Cuidado com detalhes. Pragmatismo na entrega.", cta: "Ficha do jogador" },
      contact: {
        eyebrow: "Pós-jogo",
        title: "Vamos conversar.",
        description: "Me conte sobre o produto, o problema e o prazo. Eu respondo com clareza e próximos passos.",
        direct: "Prefere ir direto?",
        form: "Abrir formulário →"
      },
      base: {
        eyebrow: "Categorias de base",
        title: "Onde tudo começou.",
        description: "Projetos de estudo que formaram a base técnica."
      }
    },
    footer: { statement: ["Vamos construir", "algo", "que escala."] },
    notFound: {
      title: "Impedimento.",
      body: "Lance anulado: essa rota estava em posição irregular.",
      home: "Voltar para o início",
      projects: "Ver projetos"
    }
  }
};
