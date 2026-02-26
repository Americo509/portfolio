export type SkillCategory = {
  label: string;
  items: string[];
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  featured?: boolean;
  featuredSize?: "normal" | "wide";
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
    challenges: string[];
    results: string[];
    gallery: { src: string; alt: string }[];
  };
};