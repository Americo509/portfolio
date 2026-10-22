# Prompt para recriar o portfólio do zero

Cole o bloco abaixo numa sessão nova do Claude Code, num repositório vazio. Para sair **igual**, anexe ou copie para o repositório novo também:

- `docs/art-direction.md` e `docs/estadio-arena.md` (+ `docs/estadio-arena-esboco.svg`): as decisões de design e as medidas da arena;
- `src/data/i18n/portfolio.pt.ts` e `portfolio.en.ts`: todo o conteúdo (textos, projetos, escalação, terminal), já revisado;
- `public/images/` (prints, capas, cromos) e `design/` (originais, marca do YourBest, referências da arena).

Sem esses arquivos, o prompt gera um site com a mesma estrutura e o mesmo visual, mas os textos e as imagens serão outros.

---

```
Você vai construir do zero o meu portfólio pessoal (Gustavo Américo Rosa, engenheiro de software full stack em transição para AppSec). Trabalhe em fases, com um ponto de aprovação meu no fim de cada uma. Ao fim de cada fase: lint, typecheck, build, testes Playwright, screenshots reais em desktop e mobile (inclusive com reduced motion e sem WebGL), commit e um resumo curto. Antes de começar, leia os arquivos de referência que anexei (docs/art-direction.md, docs/estadio-arena.md, src/data/i18n/*.ts, public/images, design/). Eles são a fonte da verdade: quando este prompt e eles divergirem, eles vencem.

## Conceito
"Noite de Jogo / Prancheta Tática": o site é uma partida de futebol. O visitante sai do túnel, vê o time escalado, revê os jogos históricos, ouve a preleção, bate os pênaltis e termina na resenha do pós-jogo. Três camadas de leitura: (1) para o recrutador, um portfólio brutalista preto e branco de altíssimo nível; (2) para quem é de engenharia, a prancheta é um diagrama de arquitetura de verdade (defesa = AppSec, meio-campo = DDD e filas, ataque = front e mobile); (3) para o corinthiano, referências nas entrelinhas (alvinegro, números, "muralha"), sem escudo, hino, nome de patrocinador ou marca. Régua: com as animações desligadas, o site ainda tem que parecer um cartaz de jogo e uma súmula bem diagramada.

## Stack (fixa)
Next.js 15 (App Router) + React 19 + TypeScript estrito + Tailwind 3. Lenis (smooth scroll, dirigido pelo gsap.ticker), GSAP + @gsap/react (ScrollTrigger, SplitText), three + @react-three/fiber + drei + @react-three/postprocessing, Motion para microinterações, zustand para estado entre DOM e cena, next-themes, react-hook-form + zod, Resend no formulário. pnpm. Playwright + @axe-core/playwright nos testes.

## Design
- Paleta (tokens em CSS e Tailwind): noite bg #080808, surface #111111, fg #F5F5F0, muted #8C8C88, line rgba(245,245,240,.09); dia (tema claro) bg #F5F5F0, surface #EAEAE4, fg #080808, muted #5C5C58. Vermelho de sinalizador #E61919 só em preenchimento (sinalizador, gol, foco, pulsos), signal-ink #FF2E2E/#C21414 quando é texto. Âmbar #F59E0B/#B45309 exclusivo do Modo Resenha. O vermelho é raro e nunca indica erro.
- Tipografia: Archivo variável com eixo de largura (display condensada wdth ~62, peso 800, estilo cartaz de jogo e bandeirão), Instrument Serif itálica (uma palavra por título, a "voz" da preleção e da resenha), JetBrains Mono (súmula, HUD, placar, terminal).
- Texturas procedurais, sem imagem pesada: grain, concreto, linhas de giz (filtro SVG de rugosidade) e a faixa diagonal alvinegra como elemento recorrente (divisor, máscara de transição, moldura dos cromos).
- Números decorativos são easter eggs: build v19.10, seed #1977, node-2012, porta/camisa :08 e #08, "Modo Muralha 2012".
- Contraste AA em tudo; o botão principal é off-white sobre preto com uma barra vermelha que corre no hover.

## Estrutura e conteúdo
- PT na raiz e EN em /en: dois layouts raiz sobre as mesmas views, lang, hreflang, sitemap e robots por idioma, seletor que leva à mesma página no outro idioma. Todo texto vem dos arquivos de dados (tipo Portfolio), nada fixo nos componentes.
- Regra de conteúdo: nunca expor dados sensíveis (clientes, órgãos, números internos, dados de paciente). Só arquitetura, decisões, tecnologias e o domínio de cada sistema. Repositório privado mostra o selo "Repositório privado — arquitetura disponível na súmula", nunca botão de código.
- Home em capítulos, com a câmera da cena mudando de enquadramento em cada um: 00 Túnel (preloader: setores da cobertura acendem um a um, "> setor sul ...... ok", obturador abre como a saída do túnel; pula com Esc e só aparece uma vez por sessão); 01 Entrada em campo (hero com o nome em cartaz gigante e a faixa diagonal); 02 Escalação (prancheta SVG a giz em 4-3-3, cada jogador é um botão com a ficha de tecnologias, um pulso vermelho percorre auth → tenant → enqueue → render); 03 Jogos históricos (súmulas com as capas desenhadas por um canvas WebGL sobreposto e sincronizado com o DOM: ripple no mouse, RGB shift, curvatura pela velocidade do scroll); 04 Preleção (as 5 fases do método, traço de giz e reveal palavra por palavra); 05 Categorias de base (projetos de estudo, compactos); 06 Disputa de pênaltis (uma cobrança jogável e link para /penalti); 07 Apito final (setores apagam um a um, sobram os sinalizadores, CTA de contato e convite para a Resenha).
- HUD fixo como relógio do jogo: o progresso do scroll vira minuto (1º T — 12', Intervalo, 2º T — 67', +3' Acréscimos) e "● Ao vivo".
- Súmula (case study), card na home e página /projects/[slug] completa: competição, status (Em produção / Em operação / Em desenvolvimento / Concluído / Estudo), função em campo, escalação (stack), lances decisivos (minutos decorativos pela ordem da lista), VAR (desafios; a seção some se não houver), placar final (resultados), cobertura fotográfica (galeria com lightbox) e "próxima partida".
- Páginas: /projects "Campanha" (tabela de campeonato com busca e filtros por tag), /about "Ficha do jogador" (bio, formação, histórico de clubes pinado na horizontal, valores), /contact "Pós-jogo" (formulário com estados de envio, sucesso e erro), /penalti, 404 "Impedimento." / "Offside.".
- Modo Resenha: chave manual "Expediente ●━○ Resenha" no header, salva no localStorage. Força a noite, troca o vermelho pelo âmbar (DOM e cena 3D) e abre o bloco "Fora do terminal": contagem para a próxima pelada (fuso de São Paulo, dias vindos dos dados), Radar 2027 (enquete só visual), 4 cromos 3:4 com as fotos de public/images/resenha (placeholder com o número se faltar a foto) e uma jukebox de samba-rock gerada com Web Audio (desligada por padrão).
- Terminal secreto: tecla ~ ou ` em qualquer página, ou botão no rodapé. Comandos help, projects [n], about, contact, penalti, resenha, theme, clear, exit e os escondidos 1910, socrates, cerveja (só na Resenha) e sudo hire-me. Diálogo modal com foco preso, histórico com ↑/↓, Tab completa, Esc fecha devolvendo o foco.
- Transição de rota: uma faixa vermelha diagonal entra na frente de uma cortina (clip-path interpolado pelo GSAP), a rota troca e as duas saem pela direita. Cursor customizado e botões magnéticos (só com ponteiro fino).
- Formulário: API em route handler com zod, honeypot, tempo mínimo de preenchimento, rate limit simples e Resend; sem RESEND_API_KEY responde 503 e o site segue funcionando.

## Cena 3D (o estádio)
Canvas único, fixo, atrás de todas as páginas, carregado com next/dynamic depois do preloader e em idle (fora do caminho crítico do LCP). Siga as medidas de docs/estadio-arena.md §7, em metros, com o campo de 68 × 105 na origem e norte = −z:
- Arena inspirada na de Itaquera, sem marca: laterais iguais em dois anéis (até 38 m) com o bloco do prédio de 48 m atrás; fundos baixos com anel único (14 m); arco metálico claro com tirantes sobre cada fundo, apoiado em pilares nos cantos abertos; cobertura das laterais com treliça; telão atrás do gol norte.
- Luz: 12 grupos de refletores na borda interna da cobertura (3 por setor) e uma linha de LED contornando a borda, sem torres. Liga/desliga por setor (sul, leste, oeste, norte), na ordem do preloader e do apagar no apito final.
- Neblina volumétrica falsa (planos com fBm, iluminados pelos cones e pelos sinalizadores), feixes como cones com borda suave, gramado com as linhas do campo e listras em shader, arquibancadas com fileiras reveladas pela luz.
- Torcida norte: torcedores como pontos desenhados em silhueta (alguns com braços levantados), pulando no ritmo; bandeirões e bandeiras de mastro alvinegras e sem escudo, balançando (mastro gira na base, pano ondula no vertex shader); 6 sinalizadores vermelhos com fumaça em partículas.
- Câmera: desce de cima da cobertura sul até o gramado e depois desliza entre presets por capítulo, com parallax do mouse e warp de FOV pela velocidade do scroll.
- Pós-processamento (bloom, aberração cromática, vinheta), tiers de GPU low/mid/high (camadas de neblina, fumaça, tamanho da torcida, bandeiras, treliça, DPR, pós), ?tier= para forçar e ?debug para expor a cena. Paleta da cena acompanha tema claro, escuro e Resenha.
- Fallbacks: sem WebGL, com erro ou antes de carregar, um estádio estático em CSS; com prefers-reduced-motion, sem Lenis, sem preloader, sem cursor e sem canvas.

## Disputa de pênaltis
Lógica pura e testada (src/lib/penalty/engine.ts): gol em zonas 3 × 3, cinco cobranças alternadas, decisão antecipada e morte súbita; as cobranças do "Gustavo" simuladas com ~78% de conversão. O goleiro decide antes de ver a bola, lendo a frequência das suas zonas (90% leitura, 10% aleatório); Modo Muralha 2012 depois de 2 defesas seguidas (mais alcance). Cena 3D própria: goleiro estilizado sem rosto nem marca (camisa 12), rede que deforma, trajetória em Bézier com efeito, câmera lenta, tremor, flashes no gol e a mesma torcida norte da arena atrás do gol. Controles: mirar com mouse/toque, segurar para força, arrastar para efeito; teclado com setas + espaço; resultado num aria-live. Som procedural desligado por padrão, melhor placar no localStorage, frase final com a taxa de leitura do goleiro e "Bateu bem. Agora bate um papo." levando ao contato. Sem WebGL, o gol vira uma grade 3 × 3 de botões com a mesma lógica. Enquanto o jogo roda, a cena de fundo pausa.

## Qualidade
- Acessibilidade WCAG 2.1 AA verificada com axe (tema claro, Resenha e terminal aberto incluídos); nomes acessíveis contêm o texto visível; menu móvel fechado fica inert; revelações por scroll usam desfoque e deslocamento, nunca opacidade baixa no texto.
- Performance: LCP do hero nunca transparente, cena fora do caminho crítico, imagens com next/image. Meça com Lighthouse e registre no README.
- Testes Playwright contra o build de produção: smoke (rotas, navegação, formulário, capítulos, pênaltis, idiomas, Resenha, terminal; desktop e mobile, sem WebGL), auditoria axe, um projeto "webgl" com a cena e o pênalti 3D de verdade, e testes unitários do motor do pênalti.
- README em português com como rodar, testar e a arquitetura de animação.

## Fases
1. Fundação: projeto, tokens, fontes, layouts PT/EN, dados tipados, páginas em branco, testes base.
2. Estádio: a cena 3D completa com fallback e tiers.
3. A partida: os capítulos da home (prancheta, súmulas com FX, preleção, base, apito final).
4. Pênaltis: motor, cena, teaser e /penalti.
5. Páginas internas, PT/EN completo e Modo Resenha.
6. Terminal, transição de rota, acessibilidade, performance e README.
```
