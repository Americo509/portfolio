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
    location: "Maringá, Brazil (Remote / Open to Relocation)",
    bioShort: "Software engineer focused on clear architecture, evolvable systems and security — from backend to mobile.",
    bioLong: `
      I'm a Software Engineer (Unicesumar) working as an Architect and Full Stack Engineer across backend, frontend and mobile.

      My work goes beyond shipping features. I design systems with clear domain modelling, explicit contracts and architectural decisions built for long-term evolution — and I treat security (AppSec) as a design requirement, not a final step.

      Today I'm a Full Stack Developer (independent contractor) at Grupo G6, the end-to-end technical owner, from architecture to delivery, of the medical shift-scheduling web system and mobile app used by hospitals. Before that I was co-CEO of YourBest and development lead at Nevra Software.

      On the side, I build my own AI-powered products and I'm pursuing a postgraduate degree in Blue Team (Cybersecurity) at FIAP, going deeper into AppSec and security operations.
    `.trim()
  },
  links: {
    github: "https://github.com/Americo509",
    linkedin: "https://www.linkedin.com/in/gustavoamericorosa/",
    email: "americorosagustavo@gmail.com"
  },
  education: {
    title: "Bachelor's Degree in Software Engineering",
    detail:
      "Bachelor's in Software Engineering from Unicesumar (2020–2024). Postgraduate degree in Blue Team (Cybersecurity) at FIAP (Jul 2026 – May 2027, in progress): information security fundamentals, Linux, networking and shell scripting, cyber intelligence, OSINT and digital forensics."
  },
  credibilityLine: "Software Engineer • Architecture, AppSec and full stack development • Blue Team postgrad (FIAP)",
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
        "Password hashing (Argon2, bcrypt)",
        "AES-256-GCM encryption",
        "Row Level Security (Postgres)",
        "CSP hardening",
        "LGPD/GDPR (database-level consent & deletion)",
        "Rate limiting",
        "Multi-tenant isolation",
        "Validation & sanitisation (Zod)",
        "Geofence anti-fraud",
        "Audit logging",
        "Security auditing (P0–P3 risk triage)",
        "OSINT & digital forensics (FIAP postgrad, in progress)"
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
          { number: 1, position: "Goalkeeper", role: "Authentication & passwords", items: ["JWT", "RBAC", "2FA", "Argon2 / bcrypt"] },
          { number: 2, position: "Full-back", role: "Validation & sanitisation", items: ["Zod", "Input sanitisation", "XSS/SQLi prevention"] },
          { number: 3, position: "Centre-back", role: "Edge protection", items: ["Rate limiting", "WAF", "CSP hardening"] },
          { number: 4, position: "Centre-back", role: "Sensitive data & encryption", items: ["Strict per-tenant isolation", "RLS (Postgres)", "AES-256-GCM", "Secrets management"] },
          { number: 6, position: "Full-back", role: "Compliance & anti-fraud", items: ["LGPD/GDPR in the database", "Geofencing", "Audit logging"] }
        ]
      },
      {
        key: "midfield",
        label: "Midfield",
        subtitle: "The engine room",
        players: [
          { number: 5, position: "Holding midfielder", role: "Domain modelling", items: ["NestJS", "DDD", "Clean Architecture"] },
          { number: 8, position: "Midfielder", role: "Data", items: ["PostgreSQL", "TypeORM", "Prisma", "Drizzle", "Supabase"] },
          { number: 10, position: "Playmaker", role: "Queues, events & real time", items: ["Redis", "BullMQ", "Workers", "Socket.io"] }
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
      items: ["Docker", "On-premise Linux", "GitHub Actions (self-hosted)", "Observability", "Testing", "Security auditing (P0–P3)", "Blue Team: OSINT & forensics (FIAP)"]
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
        year: "2021",
        title: "First contract: internship at Nevra Software",
        body: "Joined Nevra Software as a development intern, supporting internal systems and the version-control workflow while studying Software Engineering at Unicesumar."
      },
      {
        year: "2022",
        title: "Solid engineering foundations and legacy systems",
        body: "Delphi development and enterprise systems, building fundamentals in logic, data modelling, version control and engineering practices. First experience in real production environments and agile cycles."
      },
      {
        year: "2023",
        title: "Full stack developer and modern web architecture",
        body: "Hired as a full stack developer at Nevra Software. Shifted from legacy systems to modern development with React, NestJS and TypeScript: APIs and database integrations, legacy system evolution and agile sprints."
      },
      {
        year: "2024",
        title: "Technical leadership and full stack architecture",
        body: "Development lead at Nevra Software, structuring the backend with NestJS, MySQL, Redis and Angular. Secure APIs, external integrations and stronger architecture and CI/CD practices."
      },
      {
        year: "2024",
        title: "Co-founding YourBest and product vision",
        body: "Co-CEO and architect of YourBest, a mobile marketplace built in a monorepo (Turborepo + pnpm) with React Native (Expo), Next.js and NestJS with WebSockets. Reinforced authentication, domain modelling, product roadmap, metrics and technical team leadership."
      },
      {
        year: "2025",
        title: "Consolidating as an architecture-driven engineer",
        body: "Focus on scalable systems, DDD, observability and frictionless experience. Continuous growth across backend, mobile and product-driven architecture, consolidating my role as a Senior Full Stack Software Engineer."
      },
      {
        year: "2026",
        title: "Grupo G6: end-to-end technical owner",
        body: "Full stack developer (independent contractor) at Grupo G6, technical owner of the medical shift-scheduling web system and mobile app used by hospitals, from architecture to delivery: JWT authentication, Argon2 and bcrypt hashing, secrets encrypted with AES-256-GCM and CI/CD on GitHub Actions."
      },
      {
        year: "2026",
        title: "Blue Team postgrad at FIAP",
        body: "Started a postgraduate degree in Blue Team (Cybersecurity). Phase 1 completed (information security, risks and vulnerabilities, virtualization, Linux, networking and shell scripting); phase 2 in progress, covering cyber intelligence, OSINT, social engineering, counterintelligence and digital forensics."
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
      { number: "#08", caption: "Weekly kickabout", src: "/images/resenha/cromo-08.jpg", alt: "Gustavo, number 8, shooting at the weekly kickabout" },
      { number: "#19", caption: "In the stands", src: "/images/resenha/cromo-19.jpg", alt: "Gustavo in the stands on match day" },
      { number: "#10", caption: "After-match", src: "/images/resenha/cromo-10.jpg", alt: "Illustration: two cold pints on a bar counter" },
      { number: "#77", caption: "Radar 2027", src: "/images/resenha/cromo-77.jpg", alt: "Illustration: tactical radar locked on target 2027" }
    ]
  },
  projectTags: ["Backend", "Frontend", "Mobile", "Fullstack", "Architecture", "AppSec", "AI", "DevOps", "Product"],
  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Full stack mobile marketplace connecting independent beauty professionals with clients, with its own brand, a scalable monorepo architecture, real-time features and a frictionless experience.",
      tier: "sumula",
      status: "done",
      competition: "On-demand mobile marketplace",
      position: "Co-CEO · Architect · Full Stack",
      featured: true,
      featuredSize: "wide",
      cover: { src: "/images/yourbest/cover.jpg", alt: "YourBest - brand logo and app screens: booking with map, available services and schedule" },
      tags: ["Backend", "Mobile", "Fullstack", "Architecture", "Product", "Frontend", "AppSec"],
      stack: ["React Native", "Expo", "NativeWind", "TypeScript", "NestJS", "Socket.io", "Next.js", "Drizzle ORM", "PostgreSQL (Supabase)", "Turborepo", "pnpm", "Zod", "Zustand"],
      links: {},
      caseStudy: {
        context:
          "YourBest is a marketplace app that makes it easy to book beauty services on demand. Independent professionals sign up, list their services and visit clients at home — growing their reach and income while offering convenience to the end user.",
        role:
          "Co-CEO (Jul 2024 – Apr 2026), responsible for the architecture and full stack development (backend, web and mobile): technical standards, domain structure, product roadmap, metrics analysis and technical team leadership.",
        technicalDecisions: [
          "Turborepo and pnpm workspaces monorepo separating backend, web and mobile",
          "NestJS backend with domain-oriented modelling and explicit contracts",
          "WebSockets (Socket.io) for real-time features",
          "Drizzle ORM over PostgreSQL (Supabase) for strong typing and data consistency",
          "Two-factor authentication for stronger security",
          "Zod validation for predictability across layers",
          "Next.js on the web and React Native/Expo with NativeWind on mobile; structured state with Zustand",
          "Its own visual identity (symbol, navy and sand palette, app icon) applied consistently across the app"
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
          "Secure system with reinforced authentication",
          "A brand with a full set of variations: logo, symbol, app icon and versions for light, dark and monochrome backgrounds"
        ],
        gallery: [
          { src: "/images/yourbest/identidade-visual.jpg", alt: "YourBest - visual identity: logo on light, navy and sand backgrounds, app icons and symbol" },
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
      slug: "sol-poretti-clinico",
      title: "Sol Poretti — Clinical System",
      summary:
        "Clinical SaaS for a nutrition practice: pre-consultation by link, scheduling with self-booking, clinical notes with an AI draft that only counts once the nutritionist approves it, ISAK body assessment, meal plans with branded PDFs and a patient portal.",
      tier: "sumula",
      status: "production",
      competition: "Clinical SaaS · health data and LGPD",
      position: "End-to-end product · Architect · Full Stack",
      featured: true,
      featuredSize: "wide",
      privateRepo: true,
      cover: { src: "/images/sol-poretti-clinico/cover.jpg", alt: "Sol Poretti clinical system - consultation mode showing the drop in symptom score" },
      tags: ["Fullstack", "Architecture", "AppSec", "AI", "Product", "Frontend"],
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
          "The practice ran on loose forms, spreadsheets and hand-made PDFs. The system brings the whole care cycle into one place: pre-consultation questionnaire, diary, consultation notes, body assessment, meal plans in the nutritionist's own visual identity, finances and a patient portal. Because it is health data, LGPD (Brazil's data protection law) was part of the design from day one, not a fix at the end. The gallery screens use fictional patients, in a local environment with the same database and rules as the real system.",
        role:
          "End-to-end product: discovery with the client, specification, database modelling, security policies, front end, Edge Functions, testing and deployment. I also created the brand identity and built the practice's landing page.",
        technicalDecisions: [
          "Static SPA (React 19 + Vite) on Supabase with no server of its own: Postgres with Row Level Security and RPC functions as the only gateway to sensitive rules",
          "Patient links use a random single-use token, one per appointment; clinical files (photos, lab results, ebooks) are served only through short-lived signed URLs",
          "AI notes assistant in an Edge Function: credentials stay on the server, consent is checked first, output is validated against a schema and checked against the consultation text; nothing reaches the record without the nutritionist's \"Approve\", and the audit trail stores no clinical content",
          "Near-free AI without paying with patient data: a free-tier provider that does not train on the content, behind an adapter with a pennies-a-month paid fallback; free tiers that use the data were ruled out",
          "Anthropometry following the ISAK protocol in pure, tested functions: skinfolds, girths, body fat percentage, somatotype and Phantom z-scores",
          "Meal plans with accent- and typo-tolerant food search (pg_trgm), macro calculation and a branded PDF, either in a fixed layout or through the visual editor with data binding",
          "Diary with availability in time ranges, public self-booking with a lock against double booking, confirmation and rescheduling by link, and time zones handled in the database",
          "Patient portal on its own subdomain; WhatsApp messages with editable variables, birthday reminders and re-engagement for patients who drifted away"
        ],
        challenges: [
          "Two PDF engines (fixed layout and visual editor) could drift apart on display rules: a recorded decision not to migrate mid-delivery and to freeze new features until there is usage data",
          "Self-booking slots showed up shifted: free-slot calculation now handles the time zone inside the database",
          "Browser dictation does not work in every browser: the AI draft accepts pasted text and does not depend on audio capture",
          "Single-tenant permissions documented as a conscious decision, with the RLS redesign path ready if a second practitioner joins"
        ],
        results: [
          "In daily use at the practice: pre-consultation, diary, notes, body assessment, meal plans, finances and patient portal",
          "Database evolved through 60+ versioned migrations; around 560 Vitest tests, SQL security tests and Playwright end-to-end tests",
          "AI cost projected at R$ 0 on the free tier and under US$ 1 a month on the paid fallback"
        ],
        gallery: [
          { src: "/images/sol-poretti-clinico/visao-geral.jpg", alt: "Sol Poretti (fictional data) - Overview: today's appointments, birthdays and what changed since the last visit" },
          { src: "/images/sol-poretti-clinico/agenda.jpg", alt: "Sol Poretti (fictional data) - Weekly diary with pending confirmations, appointment types and personal events" },
          { src: "/images/sol-poretti-clinico/evolucao.jpg", alt: "Sol Poretti (fictional data) - Patient record: symptom score trend across consultations" },
          { src: "/images/sol-poretti-clinico/prontuario-ia.jpg", alt: "Sol Poretti (fictional data) - Consultation notes with the AI draft: every sentence has a source, and the ones that don't match ask for confirmation" },
          { src: "/images/sol-poretti-clinico/antropometria-isak.jpg", alt: "Sol Poretti (fictional data) - ISAK body assessment: body fat percentage and 4-component composition (De Rose)" },
          { src: "/images/sol-poretti-clinico/plano-alimentar.jpg", alt: "Sol Poretti (fictional data) - Meal plan editor with options per food group and a calorie and macro summary" },
          { src: "/images/sol-poretti-clinico/plano-pdf.jpg", alt: "Sol Poretti (fictional data) - Meal plan PDF in the nutritionist's own visual identity" },
          { src: "/images/sol-poretti-clinico/financeiro.jpg", alt: "Sol Poretti (fictional data) - Finances: received, receivable, overdue charges and programme instalments" },
          { src: "/images/sol-poretti-clinico/paciente-celular.jpg", alt: "Sol Poretti (fictional data) - Patient side on mobile: self-booking, questionnaire and follow-up portal" }
        ]
      }
    },
    {
      slug: "sol-poretti",
      title: "Sol Poretti — Landing Page",
      summary: "Public website for the nutrition practice, built to load fast and take visitors to booking.",
      tier: "sumula",
      status: "production",
      competition: "Landing page · conversion",
      position: "Performance front end",
      featured: true,
      featuredSize: "normal",
      cover: { src: "/images/sol-poretti/home-desktop.jpg", alt: "Sol Poretti landing page - home (desktop)" },
      tags: ["Frontend", "Product"],
      stack: ["Astro", "GSAP", "TypeScript", "Tailwind CSS"],
      links: { demo: "https://solporettinutri.com.br" },
      caseStudy: {
        context:
          "The practice's front door: it introduces the nutritionist and her method and takes visitors to booking, which happens in the clinical system.",
        role: "Brand identity (logo, palette, typography and brand book), interface design, development and launch.",
        technicalDecisions: [
          "Brand identity built from scratch (symbol, earthy palette, typography and brand book), used across the website, the system and the meal plan PDFs",
          "Astro with static HTML and JavaScript only where there is interaction",
          "GSAP animation without hurting Core Web Vitals",
          "Hooked into the clinical system's self-booking"
        ],
        challenges: [],
        results: ["Live at solporettinutri.com.br"],
        gallery: [
          { src: "/images/sol-poretti/home-desktop.jpg", alt: "Sol Poretti landing page - home (desktop)" },
          { src: "/images/sol-poretti/secoes-desktop.jpg", alt: "Sol Poretti landing page - sections (desktop)" },
          { src: "/images/sol-poretti/home-mobile.jpg", alt: "Sol Poretti landing page - home (mobile)" }
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
      next: "Next match →",
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
      penalties: { number: "06", title: "Penalty shootout", kicker: "You against my defence" },
      final: { number: "07", title: "Final whistle", kicker: "Full-time" }
    },
    lang: { label: "Language", switchTo: "PT", switchToLabel: "Ler em português" },
    terminal: {
      title: "terminal — gustavo.dev",
      open: "Open the terminal",
      hint: "~ terminal",
      placeholder: "type help",
      inputLabel: "Terminal command",
      close: "Close [esc]",
      welcome: ["gustavo.dev v19.10 — node-2012 :08", "Type help to see the commands. Esc closes."],
      notFound: "command not found: {cmd}. Try help.",
      help: [
        "help ............ this list",
        "projects ........ match reports (projects <n> opens one)",
        "about ........... player profile",
        "contact ......... get in touch",
        "penalti ......... penalty shootout",
        "resenha ......... toggles After-match mode",
        "theme ........... toggles light/dark",
        "clear ........... clears the screen",
        "exit ............ closes the terminal",
        "(there's more hidden in here…)"
      ],
      about: ["{name}", "Software Architect · Full Stack · AppSec", "Paraná, Brazil · number 8 in midfield"],
      contact: ["email: {email}", "Opening the after-match…"],
      projectsIntro: "Match reports (projects <n> to open):",
      opening: "Opening…",
      e1910: [
        "1 September 1910 — Bom Retiro, São Paulo.",
        "A club founded by workers, against all odds.",
        "Good architecture starts the same way: hands-on."
      ],
      socrates: [
        "\"Win or lose, but always with democracy.\"",
        "Democracy, clean architecture and black-and-white blood:",
        "decisions discussed, recorded and owned by the team."
      ],
      cerveja: ["Pouring a cold one… 🍺", "Cheers! The after-match is on."],
      cervejaOff: ["The bar only opens after hours.", "Turn on After-match mode (command resenha) and ask again."],
      hireMe: ["[sudo] password for recruiter: ********", "Access granted.", "Buy a round and let's talk. Opening the after-match…"],
      resenhaOn: "After-match mode on. Let's go.",
      resenhaOff: "Back on the clock.",
      theme: "Theme toggled."
    },
    resenha: {
      work: "On the clock",
      pub: "After-match",
      toggleLabel: "Switch between On-the-clock and After-match mode",
      live: "Pub's open",
      invite: "Head to the after-match",
      nextMatch: "Next kickabout",
      left: "in",
      now: "Kick-off right now",
      weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      jukebox: "Jukebox",
      play: "Play samba-rock",
      stop: "Stop",
      photoSoon: "Photo coming soon",
      versus: "or"
    },
    projectsPage: {
      title: "The season",
      kicker: "Every match",
      description: "Match reports and academy projects. Search by title, stack or tag, or filter by line.",
      search: "Search by title, stack or tag…",
      searchLabel: "Search projects",
      all: "All",
      empty: "No projects found. Try removing filters or changing the search.",
      columns: { match: "Match", competition: "Competition", status: "Status", lineup: "Starting XI" },
      tiers: { sumula: "Match report", base: "Academy" }
    },
    aboutPage: {
      title: "Player profile",
      kicker: "Who takes the pitch",
      who: "Who I am",
      values: "What I value",
      career: "Career history",
      education: "Education",
      ctaContact: "Get in touch",
      ctaProjects: "See the season"
    },
    contactPage: {
      title: "After-match",
      kicker: "Contact",
      heading: "Let's talk.",
      description: "Tell me about the product, the problem and the deadline. I'll reply with clarity and next steps.",
      links: "Links"
    },
    contactForm: {
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "you@example.com",
      message: "Message",
      messagePlaceholder: "Tell me about the project and what you need.",
      submit: "Send message",
      sending: "Sending…",
      sent: "Message sent ✓ — I'll get back to you soon.",
      error: "Couldn't send right now. Please try again or email me directly.",
      errors: {
        name: "Please enter your name.",
        email: "Invalid email.",
        message: "Write a message with at least 10 characters."
      }
    },
    penalty: {
      title: "Penalty shootout",
      intro: "Five penalties each. The keeper is my defence: he reads your pattern and dives before he sees the ball.",
      howTo: {
        pointer: "Aim at the goal, hold to build power and release to shoot. Drag sideways while holding to add curl.",
        keyboard: "Keyboard: arrows pick the corner, hold space for power and release to shoot."
      },
      you: "You",
      opponent: "Gustavo",
      start: "Shoot",
      fullGame: "Play the full shootout →",
      again: "Play again",
      power: "Power",
      aimHint: "Aim and hold",
      results: { goal: "Goal!", save: "Saved!", post: "Off the post!", miss: "Wide!" },
      opponentKick: "Gustavo steps up…",
      opponentResults: { goal: "Gustavo scores.", miss: "Gustavo skies it!" },
      suddenDeath: "Sudden death",
      muralha: "Wall Mode 2012 activated",
      win: "You won the shootout.",
      lose: "The defence held firm.",
      readRate: "The keeper read {pct}% of your penalties from the frequency distribution of your zones.",
      cta: "Nice strike. Now let's talk.",
      best: "Best score",
      sound: "Sound",
      soundOff: "Muted",
      fallbackHint: "Pick a corner to shoot.",
      zones: [
        "low left",
        "low centre",
        "low right",
        "mid-height left",
        "down the middle",
        "mid-height right",
        "top left corner",
        "high, centre",
        "top right corner"
      ]
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
