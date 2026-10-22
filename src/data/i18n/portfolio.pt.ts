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
    location: "Maringá - PR, Brasil",
    bioShort:
      "Engenheiro de software focado em arquitetura clara, sistemas evolutivos e segurança — do backend ao mobile.",
    bioLong: `
      Sou Engenheiro de Software formado pela Unicesumar e atuo como Arquiteto e Full Stack Engineer, com experiência em backend, frontend e mobile.

      Meu trabalho vai além da implementação de funcionalidades. Projeto sistemas com modelagem de domínio clara, contratos bem definidos e decisões arquiteturais orientadas à evolução de longo prazo — e trato segurança (AppSec) como requisito de projeto, não como etapa final.

      Hoje sou desenvolvedor full stack (PJ) no Grupo G6, responsável técnico de ponta a ponta, da arquitetura à entrega, pelo sistema web e pelo app mobile de gestão de escalas médicas usados por hospitais. Antes, fui co-CEO do YourBest e líder de desenvolvimento na Nevra Software.

      Em paralelo, construo produtos próprios com IA e curso a pós-graduação em Blue Team na FIAP, aprofundando a parte de AppSec e segurança operacional.
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
      "Graduação em Engenharia de Software pela Unicesumar (2020–2024). Pós-graduação em Blue Team na FIAP (jul/2026 – mai/2027, em andamento): fundamentos de segurança da informação, Linux, redes e shell script, cyber intelligence, OSINT e forense digital."
  },
  credibilityLine: "Engenheiro de Software • Arquitetura, AppSec e desenvolvimento full stack • Pós em Blue Team (FIAP)",
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
        "WebSockets (Socket.io)",
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
        "Data Fetching (TanStack Query)",
        "Accessibility & Performance"
      ]
    },
    {
      label: "Mobile Engineering",
      items: [
        "React Native",
        "Expo",
        "Expo Router",
        "NativeWind",
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
        "Monorepo (Turborepo, pnpm workspaces)",
        "Event-Driven Architecture",
        "Queues (BullMQ / Redis)",
        "Observability (Logs, Metrics, Tracing)"
      ]
    },
    {
      label: "AppSec & Blue Team",
      items: [
        "Authentication (JWT, RBAC, 2FA)",
        "Hashing de senhas (Argon2, bcrypt)",
        "Criptografia AES-256-GCM",
        "Row Level Security (Postgres)",
        "Hardening de CSP",
        "LGPD (consentimento e exclusão no banco)",
        "Rate limiting",
        "Isolamento multi-tenant",
        "Validação & sanitização (Zod)",
        "Antifraude por geofence",
        "Logs de auditoria",
        "Auditoria de segurança (riscos P0–P3)",
        "OSINT & forense digital (Pós FIAP, em andamento)"
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
          { number: 1, position: "Goleiro", role: "Autenticação & senhas", items: ["JWT", "RBAC", "2FA", "Argon2 / bcrypt"] },
          { number: 2, position: "Lateral", role: "Validação & sanitização", items: ["Zod", "Sanitização de entrada", "Prevenção de XSS/SQLi"] },
          { number: 3, position: "Zagueiro", role: "Proteção de borda", items: ["Rate limiting", "WAF", "Hardening de CSP"] },
          { number: 4, position: "Zagueiro", role: "Dados sensíveis & criptografia", items: ["Isolamento estrito por tenant", "RLS (Postgres)", "AES-256-GCM", "Gestão de segredos"] },
          { number: 6, position: "Lateral", role: "Conformidade & antifraude", items: ["LGPD no banco", "Geofence", "Logs de auditoria"] }
        ]
      },
      {
        key: "midfield",
        label: "Meio-campo",
        subtitle: "O motor",
        players: [
          { number: 5, position: "Volante", role: "Modelagem de domínio", items: ["NestJS", "DDD", "Clean Architecture"] },
          { number: 8, position: "Meia", role: "Dados", items: ["PostgreSQL", "TypeORM", "Prisma", "Drizzle", "Supabase"] },
          { number: 10, position: "Meia", role: "Filas, eventos & tempo real", items: ["Redis", "BullMQ", "Workers", "Socket.io"] }
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
      items: ["Docker", "Linux on-premise", "GitHub Actions (self-hosted)", "Observabilidade", "Testes", "Auditoria de segurança (P0–P3)", "Blue Team: OSINT & forense (FIAP)"]
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
        year: "2021",
        title: "Primeiro contrato: estágio na Nevra Software",
        body: "Entrada na Nevra Software como estagiário de desenvolvimento, apoiando sistemas internos e o ciclo de versionamento enquanto cursava Engenharia de Software na Unicesumar."
      },
      {
        year: "2022",
        title: "Base sólida em engenharia e sistemas legados",
        body: "Atuação com desenvolvimento em Delphi e sistemas empresariais, consolidando fundamentos em lógica, modelagem de dados, versionamento e práticas de engenharia. Experiência inicial em ambientes reais de produção e ciclos ágeis."
      },
      {
        year: "2023",
        title: "Desenvolvedor full stack e arquitetura web moderna",
        body: "Efetivado como desenvolvedor full stack na Nevra Software. Migração do foco em sistemas legados para desenvolvimento moderno com React, NestJS e TypeScript: criação de APIs e integrações com banco de dados, evolução de sistemas legados e sprints ágeis."
      },
      {
        year: "2024",
        title: "Liderança técnica e arquitetura full-stack",
        body: "Atuação como líder de desenvolvimento na Nevra Software, estruturando backend com NestJS, MySQL, Redis e Angular. Criação de APIs seguras, integração com serviços externos e fortalecimento de práticas de arquitetura e CI/CD."
      },
      {
        year: "2024",
        title: "Fundação do YourBest e visão de produto",
        body: "Co-CEO e responsável pela arquitetura do YourBest, marketplace mobile em monorepo (Turborepo + pnpm) com React Native (Expo), Next.js e NestJS com WebSockets. Autenticação reforçada, modelagem de domínio, roadmap de produto, métricas e liderança técnica do time."
      },
      {
        year: "2025",
        title: "Consolidação como engenheiro orientado a arquitetura",
        body: "Foco em sistemas escaláveis, DDD, observabilidade e experiência sem fricção. Evolução contínua em backend, mobile e arquitetura orientada a produto, consolidando atuação como Senior Full Stack Software Engineer."
      },
      {
        year: "2026",
        title: "Grupo G6: responsável técnico de ponta a ponta",
        body: "Desenvolvedor full stack (PJ) no Grupo G6, dono técnico do sistema web e do app mobile de gestão de escalas médicas usados por hospitais, da arquitetura à entrega: autenticação JWT, hashing com Argon2 e bcrypt, segredos cifrados com AES-256-GCM e CI/CD no GitHub Actions."
      },
      {
        year: "2026",
        title: "Pós em Blue Team na FIAP",
        body: "Início da pós-graduação em Blue Team. Fase 1 concluída (segurança da informação, riscos e vulnerabilidades, virtualização, Linux, redes e shell script); fase 2 em andamento, com cyber intelligence, OSINT, engenharia social, contrainteligência e forense digital."
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
      { number: "#08", caption: "Pelada da semana", src: "/images/resenha/cromo-08.jpg", alt: "Gustavo, camisa 8, finalizando na pelada da semana" },
      { number: "#19", caption: "Arquibancada", src: "/images/resenha/cromo-19.jpg", alt: "Gustavo na arquibancada do estádio, em dia de jogo" },
      { number: "#10", caption: "Resenha", src: "/images/resenha/cromo-10.jpg", alt: "Ilustração: dois copos de chope gelado num balcão de bar" },
      { number: "#77", caption: "Radar 2027", src: "/images/resenha/cromo-77.jpg", alt: "Ilustração: radar tático com o alvo 2027 travado" }
    ]
  },
  projectTags: ["Backend", "Frontend", "Mobile", "Fullstack", "Arquitetura", "AppSec", "IA", "DevOps", "Produto"],
  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Marketplace mobile full-stack que conecta profissionais autônomos de beleza a clientes, com marca própria, arquitetura escalável em monorepo, tempo real e foco em experiência sem fricção.",
      tier: "sumula",
      status: "done",
      competition: "Marketplace mobile on-demand",
      position: "Co-CEO · Arquiteto · Full Stack",
      featured: true,
      featuredSize: "wide",
      cover: { src: "/images/yourbest/cover.jpg", alt: "YourBest - logo da marca e telas do app: agendamento com mapa, serviços disponíveis e agenda" },
      tags: ["Backend", "Mobile", "Fullstack", "Arquitetura", "Produto", "Frontend", "AppSec"],
      stack: ["React Native", "Expo", "NativeWind", "TypeScript", "NestJS", "Socket.io", "Next.js", "Drizzle ORM", "PostgreSQL (Supabase)", "Turborepo", "pnpm", "Zod", "Zustand"],
      links: {},
      caseStudy: {
        context:
          "YourBest é um aplicativo marketplace desenvolvido para facilitar a contratação de serviços estéticos sob demanda. Profissionais autônomos se cadastram na plataforma oferecendo seus serviços e atendem clientes diretamente em suas residências, aumentando alcance e receita enquanto oferecem comodidade ao usuário final.",
        role:
          "Co-CEO (jul/2024 – abr/2026) e responsável pela arquitetura e desenvolvimento full-stack (backend, web e mobile): padrões técnicos, estruturação de domínio, roadmap de produto, análise de métricas e liderança técnica do time.",
        technicalDecisions: [
          "Monorepo com Turborepo e pnpm workspaces separando backend, web e mobile",
          "Backend em NestJS com modelagem orientada a domínio e contratos explícitos",
          "WebSockets (Socket.io) para as funcionalidades em tempo real",
          "Drizzle ORM sobre PostgreSQL (Supabase) para tipagem forte e consistência de dados",
          "Autenticação com dois fatores para maior segurança",
          "Validação de dados com Zod para previsibilidade entre camadas",
          "Web em Next.js e app em React Native/Expo com NativeWind; estado estruturado com Zustand",
          "Identidade visual própria (símbolo, paleta navy e areia, ícone do app) aplicada de forma consistente no app"
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
          "Sistema seguro com autenticação reforçada",
          "Marca com sistema completo de variações: logo, símbolo, ícone de app e versões para fundo claro, escuro e monocromático"
        ],
        gallery: [
          { src: "/images/yourbest/identidade-visual.jpg", alt: "YourBest - identidade visual: logo em fundo claro, navy e areia, ícones de app e símbolo" },
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
      slug: "sol-poretti-clinico",
      title: "Sol Poretti — Sistema Clínico",
      summary:
        "SaaS clínico do consultório de nutrição: pré-consulta por link, agenda com autoagendamento, prontuário com rascunho por IA que só vale com a aprovação da nutricionista, avaliação corporal ISAK, plano alimentar com PDF da marca e portal do paciente.",
      tier: "sumula",
      status: "production",
      competition: "SaaS clínico · saúde e LGPD",
      position: "Produto de ponta a ponta · Arquiteto · Full Stack",
      featured: true,
      featuredSize: "wide",
      privateRepo: true,
      cover: { src: "/images/sol-poretti-clinico/cover.jpg", alt: "Sistema clínico Sol Poretti - modo consulta mostrando a queda da pontuação de sintomas" },
      tags: ["Fullstack", "Arquitetura", "AppSec", "IA", "Produto", "Frontend"],
      stack: [
        "React 19",
        "Vite",
        "TypeScript",
        "Supabase (Postgres, Auth, Storage, Edge Functions)",
        "Row Level Security",
        "TanStack Query",
        "Tiptap",
        "Recharts",
        "Cloudflare Workers AI",
        "Sentry",
        "Vitest",
        "Playwright"
      ],
      links: {},
      caseStudy: {
        context:
          "O consultório funcionava com formulários soltos, planilhas e PDFs montados à mão. O sistema reúne o ciclo inteiro do atendimento num lugar só: questionário pré-consulta, agenda, anotação da consulta, avaliação corporal, plano alimentar com a identidade visual da nutricionista, financeiro e um portal para o paciente. Como é dado de saúde, a LGPD entrou no desenho desde o começo, não como ajuste no fim. As telas da galeria usam pacientes fictícios, num ambiente local com o mesmo banco e as mesmas regras do sistema.",
        role:
          "Produto de ponta a ponta: levantamento com a cliente, especificação, modelagem do banco, políticas de segurança, front-end, Edge Functions, testes e deploy. Também criei a identidade visual da marca e a landing page do consultório.",
        technicalDecisions: [
          "SPA estática (React 19 + Vite) sobre Supabase, sem servidor próprio: Postgres com Row Level Security e funções RPC como única porta para as regras sensíveis",
          "Link do paciente por token aleatório de uso único, um por consulta; arquivos clínicos (fotos, exames, ebooks) servidos só por URL assinada temporária",
          "Assistente de prontuário com IA numa Edge Function: credenciais só no servidor, consentimento verificado antes, saída validada por schema e conferida contra o texto da consulta; nada vira prontuário sem o \"Aprovar\" da nutricionista, e a trilha de auditoria não guarda conteúdo clínico",
          "IA quase de graça sem pagar com os dados do paciente: provedor em cota gratuita que não treina com o conteúdo, atrás de um adaptador com reserva paga de centavos; planos gratuitos que usam os dados foram descartados",
          "Antropometria pelo protocolo ISAK em funções puras e testadas: dobras, perímetros, percentual de gordura, somatotipo e escore Phantom",
          "Plano alimentar com busca de alimentos tolerante a acento e erro de digitação (pg_trgm), cálculo de macros e PDF com a marca, em layout fixo ou no editor visual com data-binding",
          "Agenda com disponibilidade por intervalos, autoagendamento público com trava contra horário duplicado, confirmação e remarcação por link, e fuso horário resolvido no banco",
          "Portal do paciente em subdomínio próprio; mensagens de WhatsApp com variáveis editáveis, lembretes de aniversário e reengajamento de quem sumiu"
        ],
        challenges: [
          "Dois motores de PDF (layout fixo e editor visual) podiam divergir nas regras de exibição: decisão registrada de não migrar no meio das entregas e de congelar a expansão até haver dado de uso",
          "Horários do autoagendamento apareciam deslocados: o cálculo de horários livres passou a tratar o fuso dentro do banco",
          "Ditado da consulta pelo navegador não funciona em todos os navegadores: o rascunho por IA aceita texto colado e não depende da captura de áudio",
          "Permissões single-tenant documentadas como decisão consciente, com o caminho de redesenho do RLS caso entre um segundo profissional"
        ],
        results: [
          "Em uso no consultório: pré-consulta, agenda, prontuário, avaliação corporal, plano alimentar, financeiro e portal do paciente",
          "Banco evoluído por mais de 60 migrations versionadas; cerca de 560 testes com Vitest, testes de segurança em SQL e e2e com Playwright",
          "Custo de IA projetado em R$ 0 na cota gratuita e abaixo de US$ 1 por mês na reserva paga"
        ],
        gallery: [
          { src: "/images/sol-poretti-clinico/visao-geral.jpg", alt: "Sol Poretti (dados fictícios) - Visão geral: consultas do dia, aniversariantes e o que mudou desde a última visita" },
          { src: "/images/sol-poretti-clinico/agenda.jpg", alt: "Sol Poretti (dados fictícios) - Agenda semanal com confirmações pendentes, tipos de atendimento e eventos pessoais" },
          { src: "/images/sol-poretti-clinico/evolucao.jpg", alt: "Sol Poretti (dados fictícios) - Ficha da paciente: evolução da pontuação de sintomas entre consultas" },
          { src: "/images/sol-poretti-clinico/prontuario-ia.jpg", alt: "Sol Poretti (dados fictícios) - Anotação da consulta com o rascunho da IA: cada frase tem fonte, e a que não confere pede confirmação" },
          { src: "/images/sol-poretti-clinico/antropometria-isak.jpg", alt: "Sol Poretti (dados fictícios) - Avaliação corporal ISAK: percentual de gordura e composição em 4 componentes (De Rose)" },
          { src: "/images/sol-poretti-clinico/plano-alimentar.jpg", alt: "Sol Poretti (dados fictícios) - Editor do plano alimentar com opções por grupo e resumo de calorias e macros" },
          { src: "/images/sol-poretti-clinico/plano-pdf.jpg", alt: "Sol Poretti (dados fictícios) - PDF do plano alimentar com a identidade visual da nutricionista" },
          { src: "/images/sol-poretti-clinico/financeiro.jpg", alt: "Sol Poretti (dados fictícios) - Financeiro: recebidos, a receber, cobranças em atraso e parcelas dos programas" },
          { src: "/images/sol-poretti-clinico/paciente-celular.jpg", alt: "Sol Poretti (dados fictícios) - Lado do paciente no celular: autoagendamento, questionário e portal de acompanhamento" }
        ]
      }
    },
    {
      slug: "sol-poretti",
      title: "Sol Poretti — Landing Page",
      summary:
        "Site público do consultório de nutrição, feito para carregar rápido e levar a visita até o agendamento.",
      tier: "sumula",
      status: "production",
      competition: "Landing page · conversão",
      position: "Front-end de performance",
      featured: true,
      featuredSize: "normal",
      cover: { src: "/images/sol-poretti/home-desktop.jpg", alt: "Landing page Sol Poretti - home (desktop)" },
      tags: ["Frontend", "Produto"],
      stack: ["Astro", "GSAP", "TypeScript", "Tailwind CSS"],
      links: { demo: "https://solporettinutri.com.br" },
      caseStudy: {
        context:
          "Porta de entrada do consultório: apresenta a nutricionista e o método e leva a visita até o agendamento, que acontece no sistema clínico.",
        role: "Identidade visual da marca (logo, paleta, tipografia e brand book), design de interface, desenvolvimento e publicação.",
        technicalDecisions: [
          "Identidade visual criada do zero (símbolo, paleta terrosa, tipografia e brand book), usada no site, no sistema e nos PDFs do plano alimentar",
          "Astro com HTML estático e JavaScript só onde há interação",
          "Animações com GSAP sem prejudicar os Core Web Vitals",
          "Integração com o autoagendamento do sistema clínico"
        ],
        challenges: [],
        results: ["No ar em solporettinutri.com.br"],
        gallery: [
          { src: "/images/sol-poretti/home-desktop.jpg", alt: "Landing page Sol Poretti - home (desktop)" },
          { src: "/images/sol-poretti/secoes-desktop.jpg", alt: "Landing page Sol Poretti - seções (desktop)" },
          { src: "/images/sol-poretti/home-mobile.jpg", alt: "Landing page Sol Poretti - home (mobile)" }
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
      next: "Próxima partida →",
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
    chapters: {
      lineup: { number: "02", title: "Escalação", kicker: "4-3-3 · defesa fechada, meio organizado, ataque que entrega" },
      matches: { number: "03", title: "Jogos históricos", kicker: "Súmulas das partidas que eu joguei" },
      method: { number: "04", title: "Preleção", kicker: "Do apito inicial ao apito final" },
      academy: { number: "05", title: "Categorias de base", kicker: "Onde tudo começou" },
      penalties: { number: "06", title: "Disputa de pênaltis", kicker: "Você contra a minha defesa" },
      final: { number: "07", title: "Apito final", kicker: "Fim de jogo" }
    },
    lang: { label: "Idioma", switchTo: "EN", switchToLabel: "Read in English" },
    terminal: {
      title: "terminal — gustavo.dev",
      open: "Abrir o terminal",
      hint: "~ terminal",
      placeholder: "digite help",
      inputLabel: "Comando do terminal",
      close: "Fechar [esc]",
      welcome: ["gustavo.dev v19.10 — node-2012 :08", "Digite help para ver os comandos. Esc fecha."],
      notFound: "comando não encontrado: {cmd}. Tente help.",
      help: [
        "help ............ esta lista",
        "projects ........ as súmulas (projects <n> abre uma)",
        "about ........... ficha do jogador",
        "contact ......... falar comigo",
        "penalti ......... disputa de pênaltis",
        "resenha ......... liga/desliga o Modo Resenha",
        "theme ........... alterna claro/escuro",
        "clear ........... limpa a tela",
        "exit ............ fecha o terminal",
        "(tem mais coisa escondida…)"
      ],
      about: ["{name}", "Arquiteto de Software · Full Stack · AppSec", "Paraná, Brasil · camisa 8 do meio-campo"],
      contact: ["email: {email}", "Abrindo o pós-jogo…"],
      projectsIntro: "Súmulas (projects <n> para abrir):",
      opening: "Abrindo…",
      e1910: [
        "01/09/1910 — Bom Retiro, São Paulo.",
        "Um time feito por operários, contra tudo e contra todos.",
        "Arquitetura também nasce assim: de quem põe a mão na massa."
      ],
      socrates: [
        "\"Ganhar ou perder, mas sempre com democracia.\"",
        "Democracia, arquitetura limpa e sangue preto e branco:",
        "decisões discutidas, registradas e assumidas pelo time."
      ],
      cerveja: ["Servindo um chope gelado… 🍺", "Saúde! A resenha está aberta."],
      cervejaOff: ["O bar só abre depois do expediente.", "Ligue o Modo Resenha (comando resenha) e peça de novo."],
      hireMe: ["[sudo] senha para recrutador: ********", "Acesso concedido.", "Paga uma rodada que a gente conversa. Abrindo o pós-jogo…"],
      resenhaOn: "Modo Resenha ligado. Bora.",
      resenhaOff: "De volta ao expediente.",
      theme: "Tema alternado."
    },
    resenha: {
      work: "Expediente",
      pub: "Resenha",
      toggleLabel: "Alternar entre Modo Expediente e Modo Resenha",
      live: "Resenha aberta",
      invite: "Abrir a resenha",
      nextMatch: "Próxima pelada",
      left: "faltam",
      now: "Bola rolando agora",
      weekdays: ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"],
      jukebox: "Jukebox",
      play: "Tocar samba-rock",
      stop: "Parar",
      photoSoon: "Foto em breve",
      versus: "ou"
    },
    projectsPage: {
      title: "Campanha",
      kicker: "Todas as partidas",
      description: "Súmulas e categorias de base. Busque por título, stack ou tag, ou filtre por setor.",
      search: "Buscar por título, stack ou tag…",
      searchLabel: "Buscar projetos",
      all: "Todos",
      empty: "Nenhum projeto encontrado. Tente remover filtros ou ajustar a busca.",
      columns: { match: "Partida", competition: "Competição", status: "Status", lineup: "Escalação" },
      tiers: { sumula: "Súmula", base: "Base" }
    },
    aboutPage: {
      title: "Ficha do jogador",
      kicker: "Quem entra em campo",
      who: "Quem eu sou",
      values: "O que eu valorizo",
      career: "Histórico de clubes",
      education: "Formação",
      ctaContact: "Falar comigo",
      ctaProjects: "Ver a campanha"
    },
    contactPage: {
      title: "Pós-jogo",
      kicker: "Contato",
      heading: "Vamos conversar.",
      description: "Me conte sobre o produto, o problema e o prazo. Eu respondo com clareza e próximos passos.",
      links: "Links"
    },
    contactForm: {
      name: "Nome",
      namePlaceholder: "Seu nome",
      email: "Email",
      emailPlaceholder: "voce@exemplo.com",
      message: "Mensagem",
      messagePlaceholder: "Me conte sobre o projeto e o que você precisa.",
      submit: "Enviar mensagem",
      sending: "Enviando…",
      sent: "Mensagem enviada ✓ — respondo em breve.",
      error: "Não foi possível enviar agora. Tente de novo ou mande um email direto.",
      errors: {
        name: "Informe seu nome.",
        email: "Email inválido.",
        message: "Escreva uma mensagem com pelo menos 10 caracteres."
      }
    },
    penalty: {
      title: "Disputa de pênaltis",
      intro: "Cinco cobranças para cada lado. O goleiro é a minha defesa: ele lê o seu padrão e pula antes de ver a bola.",
      howTo: {
        pointer: "Mire no gol, segure para dar força e solte para bater. Arraste para o lado enquanto segura para dar efeito.",
        keyboard: "Teclado: setas escolhem o canto, segure espaço para a força e solte para bater."
      },
      you: "Você",
      opponent: "Gustavo",
      start: "Bater",
      fullGame: "Jogar a disputa completa →",
      again: "Jogar de novo",
      power: "Força",
      aimHint: "Mire e segure",
      results: { goal: "Gol!", save: "Defendeu!", post: "Na trave!", miss: "Pra fora!" },
      opponentKick: "Gustavo na bola…",
      opponentResults: { goal: "Gustavo converte.", miss: "Gustavo isola!" },
      suddenDeath: "Morte súbita",
      muralha: "Modo Muralha 2012 ativado",
      win: "Você venceu a disputa.",
      lose: "A defesa segurou.",
      readRate: "O goleiro leu {pct}% das suas cobranças pela distribuição de frequência das zonas.",
      cta: "Bateu bem. Agora bate um papo.",
      best: "Melhor placar",
      sound: "Som",
      soundOff: "Sem som",
      fallbackHint: "Escolha o canto para bater.",
      zones: [
        "rasteiro à esquerda",
        "rasteiro no meio",
        "rasteiro à direita",
        "meia altura à esquerda",
        "no meio",
        "meia altura à direita",
        "ângulo esquerdo",
        "no alto, no meio",
        "ângulo direito"
      ]
    },
    lineup: {
      hint: "Toque num jogador para ver a ficha.",
      flow: ["auth ok", "tenant", "enqueue", "render"],
      sectorLabel: "Setor",
      formationLabel: "Formação"
    },
    matchCard: { full: "Súmula completa →", open: "Abrir súmula" },
    final: {
      title: "O jogo acabou.",
      accent: "Bora pra resenha?",
      body: "Me conte sobre o produto, o problema e o prazo. Eu respondo com clareza e próximos passos.",
      cta: "Falar comigo",
      secondary: "Ficha do jogador",
      email: "Ou direto no email:"
    },
    notFound: {
      title: "Impedimento.",
      body: "Lance anulado: essa rota estava em posição irregular.",
      home: "Voltar para o início",
      projects: "Ver projetos"
    }
  }
};
