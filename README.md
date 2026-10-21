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

### Home em capítulos (Fase 3)

- `ChapterTracker` publica o capítulo ativo; a câmera do estádio tem um enquadramento por capítulo (`CHAPTER_PRESETS`): vista tática na Escalação, travelling nos Jogos históricos, câmera rasteira na Preleção, e os refletores apagam no Apito final.
- **Escalação:** prancheta em SVG com traço de giz e jogadores como botões; o pulso vermelho percorre o caminho de uma requisição (auth → tenant → enqueue → render).
- **Jogos históricos:** súmulas com as key arts desenhadas por um canvas WebGL sobreposto e sincronizado com o DOM (`src/components/fx`). Ripple no mouse, RGB shift, curvatura pela velocidade do scroll e reveal. Sem WebGL, com reduced motion ou no tier baixo, fica a `next/image` normal.

### Disputa de pênaltis (Fase 4)

- Lógica pura e testada em `src/lib/penalty/engine.ts`: zonas 3 × 3, goleiro que decide antes de ver a bola lendo a frequência das suas zonas (90% leitura, 10% aleatório), regras oficiais (5 cobranças, decisão antecipada e morte súbita) e o **Modo Muralha 2012** (2 defesas seguidas = mais alcance).
- Cena 3D própria (`src/components/penalty/PenaltyScene.tsx`): goleiro estilizado (alto, camisa 12, luvas grandes e arquinho; sem rosto e sem marca), rede que deforma no gol, trajetória com efeito, câmera lenta, tremor e flashes no gol. O estádio de fundo pausa enquanto o jogo está na tela.
- Controles: mouse/toque (mirar, segurar para força, arrastar para efeito) e teclado (setas + espaço). Som procedural (Web Audio), desligado por padrão.
- Sem WebGL, o gol vira uma grade 3 × 3 de botões com a mesma lógica.
- Teaser de uma cobrança na home e a disputa completa em `/penalti`.

### Fallbacks

- Sem WebGL, com falha da cena ou antes de ela carregar: estádio estático em CSS (`StaticStadium`).
- `prefers-reduced-motion`: sem Lenis, sem preloader, sem cursor customizado e sem canvas.
- Touch: sem cursor customizado e sem botões magnéticos.
