# 🚀 Gustavo Américo Rosa

Full-Stack Software Engineer focused on scalable SaaS platforms, distributed systems, and clean architecture.

I specialize in building production-ready applications using:

- ⚙️ NestJS + TypeORM + MySQL / PostgreSQL
- ⚛️ React, Next.js & Angular
- 📱 React Native (Expo)
- 🧱 Domain-Driven Design (DDD)
- 🔄 Event-Driven Architecture (Redis / Queues)
- 🐳 Docker & CI/CD pipelines
- ☁️ Cloud deployments (AWS / Azure / Vercel)

I build real-world systems:
- Multi-tenant ERP platforms
- Financial workflow engines
- Payment automation systems
- On-demand marketplace mobile apps

Currently improving my expertise in:
- Distributed transactions
- System design & scalability
- Cloud architecture
- Artificial Intelligence integration

📫 Let’s build something scalable.

---

## Sobre este repositório

Portfólio em Next.js 15 (App Router) + React 19 + TypeScript + Tailwind. Direção de arte "Sistema vivo": veja [`docs/art-direction.md`](docs/art-direction.md).

### Rodando localmente

```bash
pnpm install
cp .env.example .env.local   # opcional: só é necessário para o envio real do formulário
pnpm dev
```

### Testes

```bash
pnpm build
pnpm test:e2e   # smoke tests com Playwright (desktop e mobile) contra o build de produção
```

### Arquitetura de animação

- **Lenis** (`lenis`): uma instância global de smooth scroll, dirigida pelo `gsap.ticker` (`src/components/providers/SmoothScroll.tsx`). Publica a velocidade do scroll em `motionState` e na variável CSS `--scroll-v`.
- **GSAP** (`gsap`, `@gsap/react`): timelines, `ScrollTrigger`, `SplitText` e as curvas `cine` e `snap` (`src/lib/gsap.ts`).
- **three + React Three Fiber + drei** (`three`, `@react-three/fiber`, `@react-three/drei`): a rede 3D em `src/components/scene`. O canvas é único, fixo, carregado com `next/dynamic` só depois do preloader e em idle, fora do caminho crítico do LCP.
- **@react-three/postprocessing / postprocessing**: pós-processamento da cena (bloom, aberração cromática) a partir da Fase 2.
- **Motion** (`motion`): microinterações de UI em componentes React; substituiu o `framer-motion`.
- **zustand**: estado discreto compartilhado entre o DOM e a cena (preloader concluído, status da cena).

### Cena do estádio (Fase 2B)

- `src/components/scene/stadium/`: neblina em camadas (fBm), cones de luz dos 4 refletores, gramado com as linhas do campo em shader, arquibancadas em silhueta, sinalizador com fumaça, e a câmera que desce do refletor e depois é dirigida pelo scroll e pelo mouse.
- Tiers de GPU (`low`, `mid`, `high`) controlam as camadas de neblina, as partículas, o DPR e o pós-processamento. Para forçar um tier em QA: `?tier=low|mid|high`. `?debug` expõe `__scene`/`__gl` no `window`.
- A cena só compila depois que o preloader sai de cena (`bootDone`), para não travar a abertura.
- Os testes funcionais rodam com `--disable-webgl` (fallback); o projeto `webgl` do Playwright testa a cena.

### Fallbacks

- Sem WebGL, com falha da cena ou antes de ela carregar: estádio estático em CSS (`StaticStadium`).
- `prefers-reduced-motion`: sem Lenis, sem preloader, sem cursor customizado e sem canvas.
- Touch: sem cursor customizado e sem botões magnéticos.
