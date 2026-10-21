export type SkillCategory = {
  label: string;
  items: string[];
};

export type Media = { src: string; alt: string };

/** "sumula": case principal (súmula da partida). "base": projeto de estudo (categorias de base). */
export type ProjectTier = "sumula" | "base";
export type ProjectStatus = "production" | "operating" | "development" | "done" | "study";

export type Project = {
  slug: string;
  title: string;
  summary: string;
  tier: ProjectTier;
  status: ProjectStatus;
  /** Tipo de produto ("SaaS B2G/B2B multi-tenant"). */
  competition: string;
  /** Função em campo ("Arquiteto · Full Stack · PO Técnico"). */
  position: string;
  featured?: boolean;
  featuredSize?: "normal" | "wide";
  /** Repositório privado: a súmula não mostra link de código. */
  privateRepo?: boolean;
  /** Capa. Se o arquivo não existir em /public, a UI usa a capa de prancheta (BlueprintCover). */
  cover?: Media;
  tags: string[]; // used for filters
  stack: string[];
  links: {
    github?: string;
    demo?: string;
  };
  caseStudy: {
    context: string;
    role: string;
    technicalDecisions: string[];
    /** Pode ficar vazio: a seção "VAR" só aparece quando há desafios reais. */
    challenges: string[];
    results: string[];
    gallery: Media[];
  };
};

export type LineupPlayer = {
  number: number;
  position: string;
  role: string;
  items: string[];
};

export type Lineup = {
  formation: string;
  sectors: { key: "defense" | "midfield" | "attack"; label: string; subtitle: string; players: LineupPlayer[] }[];
  bench: { label: string; items: string[] };
};

export type MethodStep = {
  number: string;
  name: string;
  verb: string;
  body: string;
};

export type MatchDay = {
  /** 0 = domingo ... 6 = sábado */
  weekday: number;
  time: string;
};

export type Resenha = {
  title: string;
  intro: string;
  blocks: { title: string; body: string }[];
  /** Dias e horários da pelada, para a contagem regressiva. */
  nextMatchDays: MatchDay[];
  radar: { title: string; question: string; options: string[] };
  /** Cromos: placeholders até as fotos reais entrarem em /public/images/resenha. */
  cards: (Media & { number: string; caption: string })[];
};

export type TimelineItem = { year: string; title: string; body: string };

export type Portfolio = {
  locale: "pt" | "en";
  profile: {
    name: string;
    handle: string;
    headlineBase: string;
    heroHeadline: string;
    heroSubheadline: string;
    location: string;
    bioShort: string;
    bioLong: string;
  };
  links: { github: string; linkedin: string; email: string };
  education: { title: string; detail: string };
  credibilityLine: string;
  skills: SkillCategory[];
  lineup: Lineup;
  method: { title: string; intro: string; steps: MethodStep[] };
  principles: { title: string; body: string; items: string[] };
  about: { values: { title: string; body: string }[]; timeline: TimelineItem[] };
  resenha: Resenha;
  projectTags: string[];
  projects: Project[];
  /** Números decorativos do HUD e do terminal (easter eggs). */
  hud: {
    build: string;
    seed: string;
    node: string;
    port: string;
    live: string;
    firstHalf: string;
    halfTime: string;
    secondHalf: string;
    addedTime: string;
  };
  copy: {
    nav: { index: string; projects: string; about: string; contact: string; menu: string; close: string };
    boot: { title: string; skip: string; lines: string[]; loading: string };
    hero: { primaryCta: string; secondaryCta: string };
    status: Record<ProjectStatus, string>;
    privateRepo: string;
    matchReport: {
      title: string;
      competition: string;
      position: string;
      context: string;
      role: string;
      lineup: string;
      keyMoments: string;
      var: string;
      fullTime: string;
      coverage: string;
      back: string;
      talk: string;
      code: string;
      live: string;
    };
    sections: {
      featured: { eyebrow: string; title: string; description: string; cta: string };
      toolbox: { eyebrow: string; title: string; description: string };
      about: { eyebrow: string; title: string; cta: string };
      contact: { eyebrow: string; title: string; description: string; direct: string; form: string };
      base: { eyebrow: string; title: string; description: string };
    };
    footer: { statement: [string, string, string] };
    /** Títulos de capítulo da home (a partida). */
    chapters: Record<
      "lineup" | "matches" | "method" | "academy" | "penalties" | "final",
      { number: string; title: string; kicker: string }
    >;
    penalty: {
      title: string;
      intro: string;
      howTo: { pointer: string; keyboard: string };
      you: string;
      opponent: string;
      start: string;
      fullGame: string;
      again: string;
      power: string;
      aimHint: string;
      results: { goal: string; save: string; post: string; miss: string };
      opponentKick: string;
      opponentResults: { goal: string; miss: string };
      suddenDeath: string;
      muralha: string;
      win: string;
      lose: string;
      readRate: string;
      cta: string;
      best: string;
      sound: string;
      soundOff: string;
      fallbackHint: string;
      zones: string[];
    };
    lineup: { hint: string; flow: [string, string, string, string]; sectorLabel: string; formationLabel: string };
    matchCard: { full: string; open: string };
    final: { title: string; accent: string; body: string; cta: string; secondary: string; email: string };
    notFound: { title: string; body: string; home: string; projects: string };
  };
};
