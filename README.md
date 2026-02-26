# Gustavo Américo Rosa — Portfolio (Next.js)

Portfólio premium/minimalista (Apple-like) em **Next.js (App Router) + TypeScript + Tailwind + Framer Motion**.

## Rodar localmente

> Recomendado: **pnpm** (mas funciona com npm também)

```bash
pnpm install
pnpm dev
```

Abrir: http://localhost:3000

### Build

```bash
pnpm build
pnpm start
```

## Onde editar conteúdo (IMPORTANTE)

Tudo fica centralizado em **`src/data/portfolio.ts`**:

- `profile`: nome, headline, bio curta/longa, hero, localização
- `links`: GitHub / LinkedIn / email
- `education`: formação (Unicesumar)
- `skills`: toolbox por categoria
- `projects`: lista completa (cards + case study)

## Imagens / prints (galeria)

Substitua os placeholders em:

- `public/images/placeholder-*.jpg`

E ajuste as entradas `gallery` dentro de cada projeto no `portfolio.ts`.

## Tema claro/escuro

- Toggle no header
- Persistência via `next-themes` (storage key: `gustavo-portfolio-theme`)

## Notas

- O formulário de contato é **frontend-only** (placeholder).  
  Para envio real, você pode criar um endpoint em `src/app/api/contact/route.ts` ou integrar com um serviço gratuito.

