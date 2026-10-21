import type { Portfolio } from "../../types/portfolio.types";

// Content rule: never expose sensitive data (clients, public bodies, internal figures).
// Only architecture, technical concerns, technologies and what each system is about.
// Football vocabulary follows British/international broadcast terms.

export const portfolioEN: Portfolio = {
  locale: "en",
  profile: {
    name: "Gustavo Américo Rosa",
    handle: "gustavo.dev",
    headlineBase: "Software Architect · Full Stack · AppSec (Backend • Frontend • Mobile)",
    heroHeadline: "I design and build scalable systems with solid architecture and frictionless experience.",
    heroSubheadline:
      "Backend (Node/NestJS) • Frontend (React/Next) • Mobile (React Native/Expo) — product-driven engineering, with a tight defence from the very first commit.",
    location: "Paraná, Brazil",
    bioShort: "Software engineer focused on clear architecture, evolvable systems and security — from backend to mobile.",
    bioLong: `
      I'm a Software Engineer (Unicesumar) working as an Architect and Full Stack Engineer across backend, frontend and mobile.

      My work goes beyond shipping features. I design systems with clear domain modelling, explicit contracts and architectural decisions built for long-term evolution — and I treat security (AppSec) as a design requirement, not a final step.

      Today I'm the architect, full stack developer and technical PO of a multi-tenant medical rostering SaaS in production, while also leading YourBest and building my own AI-powered products.
    `.trim()
  },
  links: {
    github: "https://github.com/Americo509",
    linkedin: "https://www.linkedin.com/in/gustavoamericorosa/",
    email: "americorosagustavo@gmail.com"
  },
  education: {
    title: "Bachelor's Degree in Software Engineering",
    detail: "Strong foundation in software architecture, system design, data structures and engineering best practices."
  },
  credibilityLine: "Software Engineer • Architecture, AppSec and full stack development",
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
        "Geolocation & Geofencing",
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
        "Multi-tenant isolation",
        "Validation & sanitisation (Zod)",
        "Geofence anti-fraud",
        "Audit logging"
      ]
    },
    {
      label: "AI & DevOps",
      items: [
        "LLM pipelines",
        "AI agents",
        "Orchestration with Claude Code",
        "Docker",
        "On-premise Linux",
        "GitHub Actions (self-hosted runners)"
      ]
    }
  ],
  lineup: {
    formation: "4-3-3",
    sectors: [
      {
        key: "defense",
        label: "Defence",
        subtitle: "AppSec / Blue Team",
        players: [
          { number: 1, position: "Goalkeeper", role: "Authentication & authorisation", items: ["JWT", "RBAC", "2FA"] },
          { number: 2, position: "Full-back", role: "Validation & sanitisation", items: ["Zod", "Input sanitisation"] },
          { number: 3, position: "Centre-back", role: "Edge protection", items: ["Rate limiting", "WAF"] },
          { number: 4, position: "Centre-back", role: "Multi-tenant isolation", items: ["Strict per-tenant isolation"] },
          { number: 6, position: "Full-back", role: "Anti-fraud", items: ["Geofencing", "Check-in validation"] }
        ]
      },
      {
        key: "midfield",
        label: "Midfield",
        subtitle: "The engine room",
        players: [
          { number: 5, position: "Holding midfielder", role: "Domain modelling", items: ["NestJS", "DDD", "Clean Architecture"] },
          { number: 8, position: "Midfielder", role: "Data", items: ["PostgreSQL", "TypeORM", "Drizzle", "Supabase"] },
          { number: 10, position: "Playmaker", role: "Queues & events", items: ["Redis", "BullMQ", "Workers"] }
        ]
      },
      {
        key: "attack",
        label: "Attack",
        subtitle: "Delivery",
        players: [
          { number: 7, position: "Winger", role: "Web", items: ["React", "Next.js", "Astro", "GSAP"] },
          { number: 9, position: "Striker", role: "Mobile", items: ["React Native", "Expo", "Offline-first"] },
          { number: 11, position: "Winger", role: "AI", items: ["LLM pipelines", "Agents", "Claude Code"] }
        ]
      }
    ],
    bench: {
      label: "Coaching staff",
      items: ["Docker", "On-premise Linux", "GitHub Actions (self-hosted)", "Observability", "Testing"]
    }
  },
  method: {
    title: "Team Talk",
    intro: "Spec-Driven Development + AI orchestration & AppSec. Specs in black and white, from kick-off to the final whistle.",
    steps: [
      {
        number: "01",
        name: "Team talk",
        verb: "Specify",
        body: "No coding in the dark. I turn the business problem into clear user stories (\"As X, I want Y, so that Z\") with a closed scope and verifiable acceptance criteria."
      },
      {
        number: "02",
        name: "Tactics board",
        verb: "Design",
        body: "I draw the architecture before the first line of code: DDD modelling, database contracts (SQL), attack-surface analysis (AppSec) and reuse of what already exists."
      },
      {
        number: "03",
        name: "Starting XI",
        verb: "Tasks + plan",
        body: "I break the solution into atomic, auditable steps and prepare the exact context to orchestrate AI agents (Claude Code) or the team without losing architectural control."
      },
      {
        number: "04",
        name: "Kick-off",
        verb: "Execute",
        body: "Clean implementation, small commits, lean infrastructure (Docker, Linux, CI/CD) and a focus on performance and cost from day zero."
      },
      {
        number: "05",
        name: "VAR & final whistle",
        verb: "Audit",
        body: "Rigorous validation against the acceptance criteria, a security review (Blue Team mindset: rate limiting, logs, sanitisation) and tests before going to production."
      }
    ]
  },
  principles: {
    title: "How I think about product",
    body: "Systems built with fire in the belly to take the pressure and traffic peaks without going down. Obsessed with a tight defence (Blue Team / AppSec) before going forward — and finishing in the details, from backend to the final experience.",
    items: [
      "Domain-driven modelling and clear separation of responsibilities.",
      "Well-defined service boundaries and explicit contracts between layers.",
      "Security as a design requirement: authentication, rate limiting, isolation and auditing.",
      "Performance and scalability treated as requirements from the design stage.",
      "Observability by default (structured logs, tracing and actionable metrics).",
      "Resilience: queues, retries, timeouts and consistent failure handling.",
      "Evolvable code with low coupling and high cohesion."
    ]
  },
  about: {
    values: [
      {
        title: "Quality and predictability",
        body: "I prefer systems that are easy to maintain and evolve: clear contracts, tests where they matter and recorded decisions."
      },
      {
        title: "Performance and accessibility",
        body: "Speed and inclusion aren't extras. Performance, a11y and UX are part of the product."
      },
      {
        title: "Security and clarity",
        body: "Authentication, validation, rate limits and useful logs — a tight defence without overcomplicating the essentials."
      },
      {
        title: "DX and collaboration",
        body: "Standards, automation and practical docs so the team saves time — and ships fewer bugs."
      }
    ],
    timeline: [
      {
        year: "2022",
        title: "Solid engineering foundations and legacy systems",
        body: "Delphi development and enterprise systems, building fundamentals in logic, data modelling, version control and engineering practices. First experience in real production environments and agile cycles."
      },
      {
        year: "2023",
        title: "Strategic move to modern web architecture",
        body: "Shifted from legacy systems to modern full stack development with React, NestJS and TypeScript. Built scalable web applications and deepened REST APIs, relational databases and modular design."
      },
      {
        year: "2024",
        title: "Technical leadership and full stack architecture",
        body: "Development lead at Nevra Software, structuring the backend with NestJS, MySQL, Redis and Angular. Secure APIs, external integrations and stronger architecture and CI/CD practices."
      },
      {
        year: "2024",
        title: "Co-founding YourBest and product vision",
        body: "Co-founder and architect of YourBest, a mobile marketplace built in a monorepo with React Native (Expo), Next.js and NestJS. Robust authentication, domain modelling and a base ready for sustainable growth."
      },
      {
        year: "2025",
        title: "Consolidating as an architecture-driven engineer",
        body: "Focus on scalable systems, DDD, observability and frictionless experience. Continuous growth across backend, mobile and product-driven architecture, consolidating my role as a Senior Full Stack Software Engineer."
      }
    ]
  },
  resenha: {
    title: "Off the terminal",
    intro: "From Paraná, Brazil. Heads down from 8am to 5:30pm — after that it's football, a cold beer, games and a good chat with friends.",
    blocks: [
      { title: "Sacred kickabout", body: "Always on the team sheet for this week's game. Just waiting for kick-off." },
      { title: "Black-and-white blood", body: "A loyal, long-suffering Corinthians fan." },
      { title: "Next mission", body: "Planning the 2027 trip with the lads." }
    ],
    nextMatchDays: [
      { weekday: 2, time: "20:00" },
      { weekday: 3, time: "20:00" },
      { weekday: 6, time: "09:00" }
    ],
    radar: {
      title: "Radar 2027",
      question: "The open debate:",
      options: ["Skiing in Chile", "A classic Europe tour"]
    },
    cards: [
      { number: "#08", caption: "Weekly kickabout", src: "/images/resenha/cromo-08.jpg", alt: "Gustavo at the weekly kickabout" },
      { number: "#19", caption: "In the stands", src: "/images/resenha/cromo-19.jpg", alt: "Gustavo at the stadium" },
      { number: "#10", caption: "After-match", src: "/images/resenha/cromo-10.jpg", alt: "Hanging out with friends" },
      { number: "#77", caption: "Radar 2027", src: "/images/resenha/cromo-77.jpg", alt: "Trip with the lads" }
    ]
  },
  projectTags: ["Backend", "Frontend", "Mobile", "Fullstack", "Architecture", "AppSec", "AI", "DevOps", "Product"],
  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Full stack mobile marketplace connecting independent beauty professionals with clients, built on scalable architecture, robust authentication and a frictionless experience.",
      tier: "sumula",
      status: "development",
      competition: "On-demand mobile marketplace",
      position: "Co-founder · Architect · Full Stack",
      featured: true,
      featuredSize: "wide",
      cover: { src: "/images/yourbest/cover.jpg", alt: "YourBest - key art" },
      tags: ["Backend", "Mobile", "Fullstack", "Architecture", "Product", "Frontend", "AppSec"],
      stack: ["React Native", "Expo", "TypeScript", "NestJS", "Next.js", "Drizzle ORM", "PostgreSQL", "Zod", "Zustand", "Tailwind CSS"],
      links: {},
      caseStudy: {
        context:
          "YourBest is a marketplace app that makes it easy to book beauty services on demand. Independent professionals sign up, list their services and visit clients at home — growing their reach and income while offering convenience to the end user.",
        role:
          "Co-founder, responsible for the architecture and full stack development (backend, web and mobile), technical standards, domain structure and the continuous evolution of the product.",
        technicalDecisions: [
          "Monorepo architecture separating backend, web and mobile responsibilities",
          "NestJS backend with domain-oriented modelling and explicit contracts",
          "Drizzle ORM with PostgreSQL for strong typing and data consistency",
          "Two-factor authentication for stronger security",
          "Structured state management with Zustand",
          "Zod validation for predictability across layers",
          "Consistent components styled with Tailwind CSS"
        ],
        challenges: [
          "Balancing delivery speed with sustainable architecture",
          "Modelling complex sign-up, service and booking flows in a scalable way",
          "Ensuring a smooth, predictable mobile UX across devices",
          "Keeping technical consistency across platforms within the monorepo"
        ],
        results: [
          "Technical base ready for new categories and features",
          "Intuitive mobile experience with predictable navigation",
          "Modular architecture supporting continuous product evolution",
          "Secure system with reinforced authentication"
        ],
        gallery: [
          { src: "/images/yourbest/yourbest.png", alt: "YourBest - project cover" },
          { src: "/images/yourbest/tela-principal.jpg", alt: "YourBest - home" },
          { src: "/images/yourbest/agenda.jpg", alt: "YourBest - schedule" },
          { src: "/images/yourbest/servicos-ativos.jpg", alt: "YourBest - active services" },
          { src: "/images/yourbest/aceitar-servico.jpg", alt: "YourBest - accepting a service" },
          { src: "/images/yourbest/financeiro.jpg", alt: "YourBest - finance" },
          { src: "/images/yourbest/conta-bancaria.jpg", alt: "YourBest - bank account" },
          { src: "/images/yourbest/profile.jpg", alt: "YourBest - profile" }
        ]
      }
    },
    {
      slug: "conecta-plantao",
      title: "CONECTA Plantão",
      summary:
        "Multi-tenant SaaS for medical shift rostering in production, with an offline-first mobile app, geofence anti-fraud validation and async queues for critical flows.",
      tier: "sumula",
      status: "production",
      competition: "Multi-tenant B2G/B2B SaaS · Healthcare",
      position: "Architect · Full Stack · Technical PO",
      featured: true,
      featuredSize: "normal",
      privateRepo: true,
      cover: { src: "/images/conecta-plantao/cover.jpg", alt: "CONECTA Plantão - key art" },
      tags: ["Backend", "Frontend", "Mobile", "Fullstack", "Architecture", "AppSec", "DevOps", "Product"],
      stack: [
        "NestJS (DDD)",
        "TypeORM",
        "PostgreSQL",
        "Redis",
        "BullMQ",
        "React",
        "React Native (Expo)",
        "Docker",
        "On-premise Linux",
        "GitHub Actions (self-hosted runners)"
      ],
      links: {},
      caseStudy: {
        context:
          "B2G/B2B SaaS in production for healthcare institutions, handling the critical management of medical shifts: rosters, working hours, check-in/check-out and financial close.",
        role: "Software architect, full stack developer and technical PO.",
        technicalDecisions: [
          "Strict multi-tenant isolation",
          "DDD architecture for complex working-hours and payment rules",
          "Async queues with BullMQ and Redis for critical flows",
          "Offline-first mobile check-in/check-out",
          "Geofence-based location anti-fraud validation"
        ],
        challenges: [
          "Reliable operation in healthcare units without stable internet",
          "Preventing location fraud when clinicians clock in",
          "Observability and automated deployment on restricted on-premise infrastructure"
        ],
        results: ["In production, processing real rosters in public healthcare", "Fewer gaps in shift coverage", "Automated financial close"],
        gallery: []
      }
    },
    {
      slug: "sol-poretti",
      title: "Sol Poretti — Clinical Nutrition",
      summary:
        "Clinical nutrition ecosystem: an interactive visual meal-plan editor (Canva/Figma-style) and a high-performance public website.",
      tier: "sumula",
      status: "production",
      competition: "Clinical platform + public website",
      position: "Full Stack · Performance front-end",
      featured: true,
      featuredSize: "normal",
      privateRepo: true,
      cover: { src: "/images/sol-poretti/cover-clinico.jpg", alt: "Sol Poretti - clinical system key art" },
      tags: ["Frontend", "Fullstack", "Product"],
      stack: ["React", "Next.js", "Astro", "GSAP", "TypeScript", "Tailwind CSS"],
      links: { demo: "https://solporettinutri.com.br" },
      caseStudy: {
        context:
          "A specialised clinical nutrition system with an interactive visual editor for building meal plans, plus a high-conversion public website.",
        role: "Development of the app, the visual editor and the public website.",
        technicalDecisions: [
          "Interactive canvas for nutritionists to build menus and handouts visually",
          "App and visual editor in React/Next.js",
          "Astro + GSAP landing page with extreme Core Web Vitals optimisation"
        ],
        challenges: [],
        results: ["Public website live at solporettinutri.com.br"],
        gallery: [
          { src: "/images/sol-poretti/home-desktop.jpg", alt: "Sol Poretti website - home (desktop)" },
          { src: "/images/sol-poretti/secoes-desktop.jpg", alt: "Sol Poretti website - sections (desktop)" },
          { src: "/images/sol-poretti/home-mobile.jpg", alt: "Sol Poretti website - home (mobile)" }
        ]
      }
    },
    {
      slug: "sentinela",
      title: "Project Sentinela",
      summary:
        "Autonomous agent and procurement-intelligence SaaS: monitors, collects and classifies public tenders with LLM pipelines.",
      tier: "sumula",
      status: "operating",
      competition: "Intelligence SaaS · GovTech",
      position: "Architect · Full Stack",
      privateRepo: true,
      cover: { src: "/images/sentinela/cover.jpg", alt: "Project Sentinela - key art" },
      tags: ["Backend", "Fullstack", "Architecture", "AI", "Product"],
      stack: ["Node.js", "TypeScript", "NestJS", "Next.js", "PostgreSQL", "Scraping queues & workers", "LLM (semantic classification)", "Docker"],
      links: {},
      caseStudy: {
        context:
          "SaaS platform that monitors, collects and classifies Brazilian public procurement notices (PNCP, BLL, official gazettes and portals), using LLM pipelines to surface opportunities with high precision.",
        role: "Architecture and full stack development, from the ingestion pipeline to the product.",
        technicalDecisions: [
          "Ingestion pipeline resilient to layout changes on public portals",
          "LLM classification with strict token-cost control",
          "Multi-account with custom filters",
          "Secure vault for qualification documents"
        ],
        challenges: [
          "Unstructured public data",
          "Severe rate limits on government portals",
          "Turning an internal agent into a multi-user SaaS product with paid plans"
        ],
        results: ["Actively operating, turning hours of manual tender screening into qualified alerts within minutes"],
        gallery: []
      }
    },
    {
      slug: "gustavo-os",
      title: "Gustavo OS",
      summary:
        "Second brain and personal productivity orchestrator: automatic morning briefing, project radar, daily wrap-up and weekly summary.",
      tier: "sumula",
      status: "operating",
      competition: "Personal automation · AI",
      position: "Architect · Developer",
      privateRepo: true,
      cover: { src: "/images/gustavo-os/cover.jpg", alt: "Gustavo OS - key art" },
      tags: ["Backend", "Architecture", "AI"],
      stack: ["TypeScript", "Supabase (PostgreSQL)", "Notion API", "Google Calendar API", "Gmail API", "AI agents", "Cron/Workers"],
      links: {},
      caseStudy: {
        context:
          "My own executive automation ecosystem that runs my day: it generates the morning briefing, watches the GitHub and project radar, does the daily wrap-up and consolidates the weekly summary.",
        role: "Concept, architecture and development.",
        technicalDecisions: [
          "Personal event-driven architecture",
          "Calendar, email, tasks and code centralised in a single relational history on Supabase",
          "Continuous context for the AI agents built from that history"
        ],
        challenges: [],
        results: ["No more manual micromanagement", "Full visibility of the week before 8am"],
        gallery: []
      }
    },
    {
      slug: "cookshow",
      title: "CookShow",
      summary:
        "Full stack recipe platform with smart ingredient-based search, built as a final-year project with a monorepo architecture and automated tests.",
      tier: "base",
      status: "done",
      competition: "Final-year project · Web platform",
      position: "Full Stack",
      cover: { src: "/images/cookshow.jpg", alt: "CookShow - project cover" },
      tags: ["Backend", "Fullstack", "Architecture", "Product", "Frontend"],
      stack: ["NestJS", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "TypeORM", "Jest", "Vercel", "GitLab CI"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context:
          "CookShow was built as a final-year project to reduce food waste. Users enter the ingredients they have at home and the platform returns only compatible recipes, using smart filtering on the backend.",
        role: "Full stack development with a NestJS backend, React frontend, database modelling, automated tests and continuous deployment.",
        technicalDecisions: [
          "Monorepo organised for a clear frontend/backend split",
          "NestJS backend with TypeORM and PostgreSQL",
          "Filtering algorithm based on the user's ingredients",
          "Automated Jest tests covering business rules",
          "Continuous deployment via GitLab CI, hosted on Vercel",
          "Consistent styling with Tailwind CSS"
        ],
        challenges: [
          "Efficient filtering logic for multiple ingredients",
          "Keeping a modular structure in a full stack project",
          "Adequate test coverage for business rules"
        ],
        results: [
          "Working full stack app with complete frontend/backend integration",
          "A practical solution to reduce household food waste",
          "A robust project demonstrating architecture and testing skills"
        ],
        gallery: [{ src: "/images/cookshow.jpg", alt: "CookShow - project cover" }]
      }
    },
    {
      slug: "pagina-de-vendas-apple-watch",
      title: "Apple Watch Sales Page",
      summary:
        "Apple-inspired landing page built with HTML, CSS and JavaScript, focused on visual hierarchy, micro-interactions and a premium feel.",
      tier: "base",
      status: "study",
      competition: "Study · Landing page",
      position: "Front-end",
      cover: { src: "/images/pagina-apple-watch.png", alt: "Apple Watch Sales Page - cover" },
      tags: ["Frontend", "Product"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context:
          "A simulated premium product page inspired by Apple, exploring bold typography, generous spacing and smooth animation to guide users through a visual narrative.",
        role: "Front-end design and implementation with plain HTML, CSS and JavaScript, focused on visual polish and performance.",
        technicalDecisions: [
          "Semantic HTML for clarity and accessibility",
          "CSS for a consistent visual hierarchy",
          "Micro-interactions in vanilla JavaScript",
          "Responsive layout for different screen sizes"
        ],
        challenges: [
          "Visual fidelity without modern frameworks",
          "A premium feel using only core technologies",
          "Balancing animation and performance"
        ],
        results: ["A visually refined landing page", "A smooth, consistent experience", "Solid demonstration of front-end fundamentals"],
        gallery: [{ src: "/images/pagina-apple-watch.png", alt: "Apple Watch Sales Page - cover" }]
      }
    },
    {
      slug: "cardapio-digital",
      title: "Digital Menu",
      summary: "React + Vite web app for dynamic, categorised menus focused on clarity and usability.",
      tier: "base",
      status: "study",
      competition: "Study · Web app",
      position: "Front-end",
      cover: { src: "/images/cardapio-digital.png", alt: "Digital Menu - cover" },
      tags: ["Frontend", "Product"],
      stack: ["React", "Vite", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context: "An app built to replace printed menus with a responsive digital solution organised by category.",
        role: "Front-end development with React, component organisation and category navigation.",
        technicalDecisions: [
          "React with Vite for fast, performant development",
          "Modular components for easier maintenance",
          "Clear organisation of data and presentation"
        ],
        challenges: ["Keeping navigation simple across many categories", "Ensuring responsiveness on mobile devices"],
        results: ["A light, well-organised interface", "Ready for future extensions (search and filters)"],
        gallery: [{ src: "/images/cardapio-digital.png", alt: "Digital Menu - cover" }]
      }
    },
    {
      slug: "audio-book",
      title: "Audio Book",
      summary: "Audiobook player built with vanilla JavaScript, focused on state management and media control.",
      tier: "base",
      status: "study",
      competition: "Study · Media player",
      position: "Front-end",
      cover: { src: "/images/audio-book.png", alt: "Audio Book - cover" },
      tags: ["Frontend", "Product"],
      stack: ["HTML", "CSS", "JavaScript"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context: "A project focused on building a working audiobook player using only native browser technologies.",
        role: "Playback logic, state control and visual structure.",
        technicalDecisions: [
          "Audio control with the native browser API",
          "Playback state management (play/pause/loading)",
          "Dynamic DOM manipulation with JavaScript"
        ],
        challenges: ["Keeping UI state in sync with playback", "Intuitive navigation between tracks"],
        results: ["A working player with clear controls", "Solid demonstration of JavaScript fundamentals"],
        gallery: [{ src: "/images/audio-book.png", alt: "Audio Book - cover" }]
      }
    },
    {
      slug: "spotify",
      title: "Spotify (UI)",
      summary: "Spotify interface clone built with React, focused on complex layout, grid and modular components.",
      tier: "base",
      status: "study",
      competition: "Study · UI clone",
      position: "Front-end",
      cover: { src: "/images/spotify.png", alt: "Spotify UI - cover" },
      tags: ["Frontend"],
      stack: ["React", "CSS"],
      links: { github: "https://github.com/Americo509" },
      caseStudy: {
        context: "A project reproducing the Spotify interface, working with a grid structure, fixed sidebar and modular components.",
        role: "Layout architecture and UI componentisation with React.",
        technicalDecisions: [
          "Grid-based layout with fixed areas",
          "Components for cards, lists and sidebar",
          "Clear separation between structure and presentation"
        ],
        challenges: ["Visual consistency across sections", "Reproducing a complex layout in an organised way"],
        results: ["An interface close to the original product", "Well-structured components", "Shows command of complex layouts in React"],
        gallery: [{ src: "/images/spotify.png", alt: "Spotify UI - cover" }]
      }
    }
  ],
  hud: {
    build: "v19.10",
    seed: "#1977",
    node: "node-2012",
    port: ":08",
    live: "Live",
    firstHalf: "1st Half",
    halfTime: "Half-Time",
    secondHalf: "2nd Half",
    addedTime: "Added Time"
  },
  copy: {
    nav: { index: "Home", projects: "Projects", about: "About", contact: "Contact", menu: "Menu", close: "Close" },
    boot: {
      title: "Tunnel walk",
      skip: "Skip [esc]",
      loading: "Floodlights %",
      lines: [
        "> leaving the tunnel: {handle} · build v19.10",
        "> floodlight 1/4 .............. ok",
        "> floodlight 2/4 .............. ok",
        "> floodlight 3/4 .............. ok",
        "> floodlight 4/4 .............. ok — kick-off"
      ]
    },
    hero: { primaryCta: "See projects", secondaryCta: "Get in touch" },
    status: {
      production: "In production",
      operating: "Operating",
      development: "In development",
      done: "Completed",
      study: "Study"
    },
    privateRepo: "Private repository — architecture in the match report",
    matchReport: {
      title: "Match report",
      competition: "Competition",
      position: "Role on the pitch",
      context: "Pre-match context",
      role: "My role on the pitch",
      lineup: "Starting XI",
      keyMoments: "Key moments",
      var: "VAR review",
      fullTime: "Full-time",
      coverage: "Match photos",
      back: "← Back to the season",
      talk: "Let's talk",
      code: "Code →",
      live: "See it live →"
    },
    sections: {
      featured: {
        eyebrow: "Classic matches",
        title: "Projects focused on product, architecture and delivery.",
        description: "Selected match reports: technical decisions, challenges and the full-time result of each game.",
        cta: "See the full season →"
      },
      toolbox: {
        eyebrow: "Starting XI",
        title: "The stack I use every day.",
        description: "Organised by line — a tight defence, an organised midfield and an attack that delivers."
      },
      about: { eyebrow: "About", title: "Care for detail. Pragmatic delivery.", cta: "Player profile" },
      contact: {
        eyebrow: "After-match",
        title: "Let's talk.",
        description: "Tell me about the product, the problem and the deadline. I'll reply with clarity and next steps.",
        direct: "Prefer to go direct?",
        form: "Open the form →"
      },
      base: {
        eyebrow: "Academy",
        title: "Where it all started.",
        description: "Study projects that built the technical foundation."
      }
    },
    footer: { statement: ["Let's build", "something", "that scales."] },
    chapters: {
      lineup: { number: "02", title: "Starting XI", kicker: "4-3-3 · tight defence, organised midfield, an attack that delivers" },
      matches: { number: "03", title: "Classic matches", kicker: "Match reports from the games I've played" },
      method: { number: "04", title: "Team talk", kicker: "From kick-off to the final whistle" },
      academy: { number: "05", title: "Academy", kicker: "Where it all started" },
      final: { number: "06", title: "Final whistle", kicker: "Full-time" }
    },
    lineup: {
      hint: "Tap a player to see their profile.",
      flow: ["auth ok", "tenant", "enqueue", "render"],
      sectorLabel: "Line",
      formationLabel: "Formation"
    },
    matchCard: { full: "Full match report →", open: "Open match report" },
    final: {
      title: "Full-time.",
      accent: "Fancy a chat after the match?",
      body: "Tell me about the product, the problem and the deadline. I'll reply with clarity and next steps.",
      cta: "Get in touch",
      secondary: "Player profile",
      email: "Or straight to my inbox:"
    },
    notFound: {
      title: "Offside.",
      body: "Goal disallowed: that route was in an offside position.",
      home: "Back to home",
      projects: "See projects"
    }
  }
};
