import type { SkillCategory, Project } from "../../types/portfolio.types";

export const portfolioPT  = {
  profile: {
    name: "Gustavo Américo Rosa",
    headlineBase: "Pleno Full Stack Software Engineer (Backend • Frontend • Mobile)",
    heroHeadline: "Projeto e construo sistemas escaláveis com arquitetura sólida e experiência sem fricção.",
    heroSubheadline:
      "Backend (Node/NestJS) • Frontend (React/Next) • Mobile (React Native/Expo) — engenharia orientada a produto e sustentabilidade técnica.",
    location: "Brasil",
    bioShort:
        "Engenheiro de software focado em arquitetura clara, sistemas evolutivos e experiências consistentes — do backend ao mobile.",
    bioLong: `
      Sou Engenheiro de Software formado pela Unicesumar e atuo como Full Stack Engineer com experiência em backend, frontend e mobile.

      Meu trabalho vai além da implementação de funcionalidades. Projeto sistemas com modelagem de domínio clara, contratos bem definidos e decisões arquiteturais orientadas à evolução de longo prazo.

      Acredito que bons produtos nascem da combinação entre rigor técnico e experiência sem fricção. Isso significa APIs previsíveis, observabilidade desde o início, performance tratada como requisito e interfaces consistentes.

      Atualmente lidero o desenvolvimento do YourBest, um marketplace mobile que conecta profissionais de beleza a clientes. No projeto, atuo tanto na arquitetura quanto na evolução do produto, equilibrando tecnologia, estratégia e crescimento sustentável.
    `.trim(),
  },
  links: {
    github: "https://github.com/Americo509",
    linkedin: "https://www.linkedin.com/in/gustavoamericorosa/",
    email: "americorosagustavo@gmail.com"
  },
  education: {
  title: "Engenheiro de Software — UniCesumar",
  detail:
    "Formação com foco em arquitetura de software, estruturas de dados, modelagem de sistemas e práticas de engenharia orientadas à qualidade e escalabilidade."
},
  credibilityLine:
    "Engenheiro de Software • Arquitetura e desenvolvimento full stack",
  skills: [
    {
      label: "Backend Engineering",
      items: [
        "Node.js (TypeScript)",
        "NestJS",
        "REST & GraphQL APIs",
        "Authentication (JWT, RBAC)",
        "PostgreSQL / MySQL",
        "MongoDB",
        "TypeORM / Prisma / Drizzle",
        "Redis (Cache & Queues)",
        "Kafka / RabbitMQ",
        "Testing (Jest - Unit & Integration)",
        "Docker",
        "CI/CD (GitHub Actions / Jenkins)"
      ]
    },
    {
      label: "Frontend Engineering",
      items: [
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS",
        "State Management (Zustand)",
        "Data Fetching (React Query)",
        "Build Tools (Vite, Webpack)",
        "Accessibility & Performance"
      ]
    },
    {
      label: "Mobile Engineering",
      items: [
        "React Native",
        "Expo",
        "Expo Router",
        "Navigation (React Navigation)",
        "Reanimated & Gestures",
        "Offline Support",
        "Push Notifications",
        "Camera/Media Integrations",
        "Native Modules",
        "Performance Optimization",
        "Eas build/update",
      ]
    },
    {
      label: "Architecture & Systems Design",
      items: [
        "Domain-Driven Design (DDD)",
        "Clean Architecture",
        "Microservices",
        "Event-Driven Architecture",
        "Queues (BullMQ / Redis)",
        "Observability (Logs, Metrics, Tracing)"
      ]
    }
  ] satisfies SkillCategory[],
  projectTags: ["Backend", "Frontend", "Mobile", "Fullstack", "Arquitetura", "DevOps", "Produto"],
  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Marketplace mobile full-stack que conecta profissionais autônomos de beleza a clientes, com arquitetura escalável, autenticação robusta e foco em experiência sem fricção.",
      featured: true,
      featuredSize: "wide",
      tags: ["Backend", "Mobile", "Fullstack", "Arquitetura", "Produto", "Frontend"],
      stack: [
        "React Native",
        "Expo",
        "TypeScript",
        "NestJS",
        "Next.js",
        "Drizzle ORM",
        "PostgreSQL",
        "Zod",
        "Zustand",
        "Tailwind CSS"
      ],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
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
          { src: "/projects/yourbest/cover.png", alt: "YourBest - capa do projeto" }
        ]
      }
    },

    {
      slug: "cookshow",
      title: "CookShow",
      summary:
        "Plataforma full-stack de receitas com busca inteligente por ingredientes, desenvolvida como projeto de conclusão de curso com arquitetura monorepo e testes automatizados.",
      featured: true,
      featuredSize: "normal",
      tags: ["Backend", "Fullstack", "Arquitetura", "Produto", "Frontend"],
      stack: [
        "NestJS",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "PostgreSQL",
        "TypeORM",
        "Jest",
        "Vercel",
        "GitLab CI"
      ],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
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
        gallery: [
          { src: "/projects/cookshow/cover.png", alt: "CookShow - capa do projeto" }
        ]
      }
    },

    {
      slug: "pagina-de-vendas-apple-watch",
      title: "Página de Vendas — Apple Watch",
      summary:
        "Landing page inspirada na Apple, desenvolvida com HTML, CSS e JavaScript, focada em hierarquia visual, microinterações e experiência premium.",
      featured: true,
      featuredSize: "normal",
      tags: ["Frontend", "UI", "Performance"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
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
        results: [
          "Landing page visualmente refinada",
          "Experiência fluida e consistente",
          "Demonstração sólida de fundamentos de frontend"
        ],
        gallery: [
          { src: "/projects/apple-watch/cover.png", alt: "Apple Watch Sales Page - capa" }
        ]
      }
    },

    {
      slug: "cardapio-digital",
      title: "Cardápio Digital",
      summary:
        "Aplicação web construída com React + Vite para exibição dinâmica de cardápios categorizados com foco em clareza e usabilidade.",
      tags: ["Frontend", "Produto"],
      stack: ["React", "Vite", "JavaScript"],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
      caseStudy: {
        context:
          "Aplicação criada para substituir cardápios físicos por uma solução digital responsiva e organizada por categorias.",
        role:
          "Desenvolvimento front-end com React, organização de componentes e estruturação da navegação entre categorias.",
        technicalDecisions: [
          "Uso de React com Vite para desenvolvimento rápido e performático",
          "Componentização modular para facilitar manutenção",
          "Organização clara de dados e apresentação"
        ],
        challenges: [
          "Manter simplicidade de navegação com múltiplas categorias",
          "Garantir responsividade em dispositivos móveis"
        ],
        results: [
          "Interface leve e organizada",
          "Projeto preparado para futuras extensões (busca e filtros)"
        ],
        gallery: [
          { src: "/projects/cardapio/cover.png", alt: "Cardápio Digital - capa" }
        ]
      }
    },

    {
      slug: "audio-book",
      title: "Audio Book",
      summary:
        "Player de audiolivros desenvolvido com JavaScript puro, focado em gerenciamento de estado e controle de mídia.",
      tags: ["Frontend", "Produto"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
      caseStudy: {
        context:
          "Projeto focado em implementar um player funcional de audiolivros utilizando apenas tecnologias nativas do navegador.",
        role:
          "Desenvolvimento da lógica de reprodução, controle de estados e estrutura visual.",
        technicalDecisions: [
          "Controle de áudio utilizando API nativa do navegador",
          "Gerenciamento de estados de reprodução (play/pause/loading)",
          "Manipulação dinâmica do DOM com JavaScript"
        ],
        challenges: [
          "Sincronizar estado da UI com reprodução de áudio",
          "Garantir navegação intuitiva entre faixas"
        ],
        results: [
          "Player funcional com controles claros",
          "Demonstração sólida de fundamentos JavaScript"
        ],
        gallery: [
          { src: "/projects/audiobook/cover.png", alt: "Audio Book - capa" }
        ]
      }
    },

    {
      slug: "spotify",
      title: "Spotify (UI)",
      summary:
        "Clone de interface do Spotify desenvolvido com React, focado em layout complexo, grid e componentização modular.",
      tags: ["Frontend", "UI"],
      stack: ["React", "CSS"],
      links: {
        github: "https://github.com/Americo509",
        demo: "#"
      },
      caseStudy: {
        context:
          "Projeto voltado para reproduzir a interface do Spotify, trabalhando estrutura em grid, sidebar fixa e organização modular de componentes.",
        role:
          "Construção da arquitetura de layout e componentização da UI utilizando React.",
        technicalDecisions: [
          "Estruturação do layout com grid e áreas fixas",
          "Componentização de cards, listas e sidebar",
          "Separação clara entre estrutura e apresentação"
        ],
        challenges: [
          "Manter consistência visual em múltiplas seções",
          "Reproduzir layout complexo de forma organizada"
        ],
        results: [
          "Interface visualmente próxima ao produto original",
          "Boa organização estrutural de componentes",
          "Demonstra domínio de layouts complexos em React"
        ],
        gallery: [
          { src: "/projects/spotify/cover.png", alt: "Spotify UI - capa" }
        ]
      }
    }
  ] satisfies Project[],
} as const;
