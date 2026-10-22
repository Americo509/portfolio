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
- Application Security & Blue Team (postgraduate degree at FIAP)
- Distributed transactions
- System design & scalability
- Cloud architecture
- Artificial Intelligence integration

📫 Let’s build something scalable.

---

## Sobre este repositório

Portfólio em Next.js 15 (App Router) + React 19 + TypeScript + Tailwind. Direção de arte "Noite de Jogo / Prancheta Tática": veja [`docs/art-direction.md`](docs/art-direction.md).

### Rodando localmente

```bash
pnpm install
cp .env.example .env.local   # opcional: só é necessário para o envio real do formulário
pnpm dev
```

### Testes

```bash
pnpm build
pnpm test:e2e   # Playwright contra o build de produção: smoke, lógica do pênalti, cena 3D e auditoria axe
```

- `e2e/smoke.spec.ts`: rotas, navegação, formulário, capítulos, pênaltis, idiomas, Modo Resenha e terminal (desktop e mobile, sem WebGL).
- `e2e/a11y.spec.ts`: axe-core (WCAG 2.1 A/AA) nas páginas principais, no tema claro, no Modo Resenha e com o terminal aberto.
- `e2e/scene.spec.ts`: projeto `webgl`, com a cena e o pênalti 3D de verdade.
- `e2e/penalty-logic.spec.ts`: testes unitários do motor do pênalti.

### Arquitetura de animação

- **Lenis** (`lenis`): uma instância global de smooth scroll, dirigida pelo `gsap.ticker` (`src/components/providers/SmoothScroll.tsx`). Publica a velocidade do scroll em `motionState` e na variável CSS `--scroll-v`.
- **GSAP** (`gsap`, `@gsap/react`): timelines, `ScrollTrigger`, `SplitText` e as curvas `cine` e `snap` (`src/lib/gsap.ts`).
- **three + React Three Fiber + drei** (`three`, `@react-three/fiber`, `@react-three/drei`): a rede 3D em `src/components/scene`. O canvas é único, fixo, carregado com `next/dynamic` só depois do preloader e em idle, fora do caminho crítico do LCP.
- **@react-three/postprocessing / postprocessing**: pós-processamento da cena (bloom, aberração cromática) a partir da Fase 2.
- **Motion** (`motion`): microinterações de UI em componentes React; substituiu o `framer-motion`.
- **zustand**: estado discreto compartilhado entre o DOM e a cena (preloader concluído, status da cena).

### Cena do estádio (Fase 2B; arena desde out/2026)

- `src/components/scene/stadium/`: arena inspirada na de Itaquera (plano e medidas em [`docs/estadio-arena.md`](docs/estadio-arena.md)). Laterais iguais em dois anéis com o bloco do prédio atrás, fundos baixos com arco metálico e tirantes, telão atrás do gol norte, neblina em camadas (fBm) e gramado com as linhas do campo em shader. A câmera desce de cima da cobertura sul e depois é dirigida pelo scroll e pelo mouse.
- Luz: 12 grupos de refletores na borda da cobertura (3 por setor) e uma linha de LED contornando a borda; sem torres. O liga/desliga é por setor (sul, leste, oeste, norte), na ordem do preloader e do apagar no apito final.
- Torcida norte (`Arena.tsx`, `NorthCrowd`): torcedores em silhueta pulando, bandeirões e bandeiras de mastro balançando (alvinegras, sem escudo) e 6 sinalizadores com fumaça. O mesmo bloco aparece atrás do gol no pênalti.
- Tiers de GPU (`low`, `mid`, `high`) controlam as camadas de neblina, a fumaça, o tamanho da torcida, as bandeiras, a treliça da cobertura, o DPR e o pós-processamento. Para forçar um tier em QA: `?tier=low|mid|high`. `?debug` expõe `__scene`/`__gl` no `window`.
- A cena só compila depois que o preloader sai de cena (`bootDone`), para não travar a abertura.
- Os testes funcionais rodam com `--disable-webgl` (fallback); o projeto `webgl` do Playwright testa a cena.

### Home em capítulos (Fase 3)

- `ChapterTracker` publica o capítulo ativo; a câmera do estádio tem um enquadramento por capítulo (`CHAPTER_PRESETS`): vista tática na Escalação, travelling nos Jogos históricos, câmera rasteira na Preleção, e os refletores apagam no Apito final.
- **Escalação:** prancheta em SVG com traço de giz e jogadores como botões; o pulso vermelho percorre o caminho de uma requisição (auth → tenant → enqueue → render).
- **Jogos históricos:** súmulas com as key arts desenhadas por um canvas WebGL sobreposto e sincronizado com o DOM (`src/components/fx`). Ripple no mouse, RGB shift, curvatura pela velocidade do scroll e reveal. Sem WebGL, com reduced motion ou no tier baixo, fica a `next/image` normal.

### Disputa de pênaltis (Fase 4)

- Lógica pura e testada em `src/lib/penalty/engine.ts`: zonas 3 × 3, goleiro que decide antes de ver a bola lendo a frequência das suas zonas (90% leitura, 10% aleatório), regras oficiais (5 cobranças, decisão antecipada e morte súbita) e o **Modo Muralha 2012** (2 defesas seguidas = mais alcance).
- Cena 3D própria (`src/components/penalty/PenaltyScene.tsx`): goleiro estilizado (alto, camisa 12, luvas grandes e arquinho; sem rosto e sem marca), rede que deforma no gol, trajetória com efeito, câmera lenta, tremor e flashes no gol. Atrás do gol, a torcida norte da arena com bandeirões e sinalizadores (parada com movimento reduzido). O estádio de fundo pausa enquanto o jogo está na tela.
- Controles: mouse/toque (mirar, segurar para força, arrastar para efeito) e teclado (setas + espaço). Som procedural (Web Audio), desligado por padrão.
- Sem WebGL, o gol vira uma grade 3 × 3 de botões com a mesma lógica.
- Teaser de uma cobrança na home e a disputa completa em `/penalti`.

### Idiomas, páginas internas e Modo Resenha (Fase 5)

- **PT/EN:** dois layouts raiz (`src/app/(pt)` e `src/app/(en)/en`) sobre as mesmas views (`src/views`). O português fica na raiz e o inglês em `/en`, com `lang`, `hreflang` e sitemap por idioma. O seletor no header leva à mesma página no outro idioma.
- **Páginas:** Campanha (`/projects`, tabela com busca e filtros), Súmula completa (`/projects/[slug]`, com "próxima partida"), Ficha do jogador (`/about`, histórico de clubes pinado na horizontal) e Pós-jogo (`/contact`, formulário com estados de envio e erro; a API não mudou). O 404 é "Impedimento." / "Offside.".
- **Modo Resenha:** chave manual no header, salva no navegador. Força a noite e troca o vermelho pelo âmbar (DOM e estádio). O pós-jogo da home abre o "Fora do terminal": contagem para a próxima pelada (fuso de São Paulo), Radar 2027, cromos e uma jukebox de samba-rock gerada com Web Audio.
- **Fotos da resenha:** `public/images/resenha/cromo-08|19|10|77.jpg` (retrato 3:4, 900 × 1200). As fotos originais ficam em `design/resenha/`; sem o arquivo, o cromo mostra o número como placeholder.

### Terminal, transições e acabamento (Fase 6)

- **Terminal secreto:** `~` (ou `` ` ``) em qualquer página, ou o botão "~ terminal" no rodapé. Comandos: `help`, `projects [n]`, `about`, `contact`, `penalti`, `resenha`, `theme`, `clear` e `exit`, além de alguns escondidos. Diálogo modal com foco preso, histórico (↑/↓), Tab completa e Esc fecha devolvendo o foco. Textos em `copy.terminal` (PT/EN).
- **Transição de rota:** uma faixa vermelha diagonal entra na frente da cortina, a rota troca e as duas saem pela direita (`clip-path: polygon()` interpolado pelo GSAP). O terminal navega pelo mesmo caminho (`src/lib/navigate.ts`).
- **Acessibilidade:** auditoria axe automatizada. Nomes acessíveis contêm o texto visível (WCAG 2.5.3), o menu móvel fechado fica `inert`, e as revelações por scroll usam desfoque e deslocamento em vez de opacidade, para o contraste nunca cair.

#### Lighthouse (medido neste ambiente)

Build de produção servido localmente e Lighthouse 12 no Chromium headless de um container **sem GPU** (a cena 3D roda em software). No mobile o Lighthouse simula CPU 4× mais lenta e rede 4G, e mede a **primeira visita**, com o preloader.

| Página | Mobile (perf · a11y · BP · SEO) | Desktop (perf · a11y · BP · SEO) |
| --- | --- | --- |
| `/` | 63 · 100 · 100 · 100 (LCP 3,6 s, TBT 1,7 s, CLS 0) | 97 · 100 · 100 · 100 (LCP 0,7 s) |
| `/about` | 84 · 100 · 100 · 100 | 100 · 100 · 100 · 100 |
| `/contact` | 86 · 100 · 96 · 100 | 100 · 100 · 100 · 100 |
| `/projects` | 85 · 100 · 96 · 100 | 100 · 100 · 100 · 100 |
| `/projects/yourbest` | 90 · 100 · 100 · 100 | 100 · 100 · 100 · 100 |

O ponto fraco é o TBT da home no mobile: compilar a cena e montar as animações dos capítulos numa CPU limitada e sem GPU. Num aparelho real com GPU ele cai bastante, mas não foi medido aqui. O que já foi feito: cena só depois do preloader e em idle, tiers de GPU, o parágrafo do hero (elemento de LCP) nunca fica transparente (LCP mobile de 7,3 s para 3,6 s), e favicon e ícone próprios.

### Fallbacks

- Sem WebGL, com falha da cena ou antes de ela carregar: estádio estático em CSS (`StaticStadium`).
- `prefers-reduced-motion`: sem Lenis, sem preloader, sem cursor customizado e sem canvas.
- Touch: sem cursor customizado e sem botões magnéticos.
