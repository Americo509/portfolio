import type { SkillCategory, Project } from "../../types/portfolio.types";

export const portfolioEN = {
  profile: {
    name: "Gustavo Américo Rosa",
    headlineBase:
      "Pleno Software Engineer focused on scalable architecture and product-driven development",

    heroHeadline:
      "I design and build scalable systems with strong architecture and frictionless user experience.",

    heroSubheadline:
      "Backend (Node/NestJS) • Frontend (React/Next) • Mobile (React Native/Expo) — product-oriented engineering.",

    bioShort:
      "Software engineer focused on scalable architecture, evolvable systems, and consistent user experience.",

    bioLong: `
      I’m a Software Engineer working across backend, frontend, and mobile environments.

      My focus goes beyond implementing features. I design systems with clear domain modeling, explicit service contracts, and architectural decisions that support long-term evolution.

      I believe great products balance technical rigor and frictionless experience. That means predictable APIs, built-in observability, performance by design, and thoughtful interfaces.

      Currently, I lead the development of YourBest, a mobile marketplace platform, combining product strategy with pragmatic engineering.
    `.trim(),
  },

  links: {
    github: "https://github.com/Americo509",
    linkedin: "https://www.linkedin.com/in/gustavoamericorosa/",
    email: "americorosagustavo@gmail.com",
  },

  education: {
    title: "Bachelor’s Degree in Software Engineering — UniCesumar",
    detail:
      "Strong foundation in software architecture, system design, data structures, and engineering best practices."
  },

  credibilityLine:
    "Software Engineer • Architecture, Backend, Frontend & Mobile",

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

  projectTags: [
    "Backend",
    "Frontend",
    "Mobile",
    "Fullstack",
    "Architecture",
    "Product",
    "Performance",
  ],

  projects: [
    {
      slug: "yourbest",
      title: "YourBest",
      summary:
        "Mobile marketplace connecting beauty professionals and clients, built with scalable architecture and product-driven mindset.",
      featured: true,
      featuredSize: "wide",
      tags: ["Fullstack", "Mobile", "Architecture", "Product"],
      stack: ["React Native", "Expo", "Node.js", "NestJS", "TypeScript", "DDD"],
      links: {
        github: "https://github.com/Americo509",
        demo: "#",
      },
      caseStudy: {
        context:
          "YourBest is a mobile marketplace designed to connect independent beauty professionals with clients through a seamless booking experience.",
        role:
          "My role included system architecture, backend and mobile development, and product-level technical decisions.",
        technicalDecisions: [
          "Domain-driven design to centralize business rules.",
          "Clear separation of layers to ensure long-term scalability.",
          "Reusable UI components for consistency and maintainability.",
        ],
        challenges: [
          "Designing a smooth booking flow on mobile.",
          "Maintaining performance across multiple devices.",
        ],
        results: [
          "(placeholder) Improved onboarding conversion.",
          "(placeholder) Scalable base for future expansion.",
        ],
        gallery: [],
      },
    },
  ] satisfies Project[],
} as const;