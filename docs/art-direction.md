# Direção de arte v3 — "Noite de Jogo / Prancheta Tática"

> Referência viva do redesign (aprovada). Substitui o conceito "Sistema vivo" da v1.
> A arquitetura técnica da Fase 1 (Lenis, GSAP, canvas persistente, preloader, HUD, cursor, transições e testes) continua; mudam a pele, a narrativa, a cena e o conteúdo.

---

## 1. Ideia central

O site é **uma partida**. O visitante sai do túnel, vê o time escalado, revê os jogos históricos, ouve a preleção, bate os pênaltis e termina na resenha do pós-jogo.

Três camadas de leitura:
1. **Recrutador comum:** um portfólio brutalista preto e branco de altíssimo nível, com engenharia séria e uma metáfora de futebol bem executada.
2. **Quem é de engenharia:** a prancheta é um diagrama de arquitetura de verdade (defesa = AppSec, meio-campo = DDD e filas, ataque = front e mobile).
3. **Quem é corinthiano:** reconhece tudo nas entrelinhas: o alvinegro, os números, a "muralha", o "sangue no olho". Nada de escudo, hino, sirene ou som oficial.

**Régua:** com as animações desligadas, tem que continuar parecendo um cartaz de jogo e uma súmula bem diagramada, e não um template com futebol colado.

---

## 2. Paleta

| Token | Noite (padrão) | Dia (tema claro) | Uso |
|---|---|---|---|
| `bg` | `#080808` | `#F5F5F0` | Fundo |
| `surface` | `#111111` | `#EAEAE4` | Planos, súmulas, inputs |
| `fg` | `#F5F5F0` (off-white creme) | `#080808` | Texto |
| `muted` | `#8C8C88` (5,9:1) | `#5C5C58` (6,1:1) | Labels, texto secundário |
| `line` | `rgba(245,245,240,.09)` | `rgba(8,8,8,.12)` | Linhas de giz, grid, HUD |
| `signal` | `#E61919` — **sinalizador** | `#E61919` | Só preenchimento e gráfico: sinalizador, gol, foco, pulsos de "passe" |
| `signal-ink` | `#FF2E2E` (5,4:1) | `#C21414` (5,6:1) | O vermelho quando é **texto** |
| `amber` | `#F59E0B` (9,3:1) | `#B45309` (4,6:1) | **Exclusivo do Modo Resenha** |

Regras:
- O vermelho é raro: aparece no sinalizador, no gol, no hover principal e em um destaque por tela. Ele nunca indica erro; erro de formulário usa sublinhado e ícone, sem cor nova.
- O botão principal é off-white sobre preto, e o vermelho entra como uma barra que corre no hover. Texto pequeno sobre o vermelho não passa em AA, então essa combinação não é usada.
- O tema claro vira "**jogo de dia**" (giz preto sobre papel). O Modo Resenha é sempre noturno (veja §7).

## 3. Tipografia e texturas

- **Archivo condensada (wdth 62, 800):** tipografia de **cartaz de jogo histórico e bandeirão**. Já está instalada.
- **Instrument Serif itálica:** a "voz" manuscrita da preleção e da resenha, uma palavra por título.
- **JetBrains Mono:** súmula, HUD, placar, terminal.
- **Texturas, todas procedurais (sem imagem pesada):**
  - concreto de arquibancada (ruído em CSS e shader);
  - **linhas de giz** (filtro SVG de rugosidade nas linhas da prancheta);
  - grain;
  - a **faixa diagonal** alvinegra como elemento gráfico recorrente: divisor de seção, máscara de transição e moldura dos cromos.

## 4. Os números (easter eggs de classe)

Onde houver número decorativo, ele é uma referência:

| Onde | Valor | Leitura para o recrutador | Leitura para o corinthiano |
|---|---|---|---|
| Versão do build (HUD e terminal) | `v19.10` | semver | Fundação, 1910 |
| Seed da cena | `seed #1977` | seed de PRNG | O fim do jejum, 1977 |
| Nó/servidor no HUD | `node-2012` | hostname | Libertadores invicta e Mundial, 2012 |
| Porta / camisa | `:08` / `#08` | porta, número | Sócrates, a camisa 8 |
| Goleiro em sequência de defesas | `MODO MURALHA 2012` | estado do jogo | O goleiro do Mundial |

No terminal (`~`), os comandos secretos são `1910` e `socrates` (mensagens sobre "democracia, arquitetura limpa e sangue preto e branco"), além de `cerveja` (só na Resenha), `penalti` e `sudo hire-me`.

---

## 5. A narrativa: a home como partida

O HUD vira **o relógio do jogo**: o progresso do scroll vira minuto de jogo (`1º T — 12'`, `INTERVALO`, `2º T — 67'`), o rodapé é `+3' ACRÉSCIMOS` e o status passa a `● AO VIVO`.

| # | Momento | Seção | Visual e interação |
|---|---|---|---|
| 00 | **Túnel** | Preloader | Concreto escuro. Os refletores acendem um a um (`> refletor 3/4 ........ ok`) e o som da torcida chega abafado (só se o som estiver ligado). O obturador anamórfico abre como a saída do túnel. |
| 01 | **Entrada em campo** | Hero | Estádio à noite em **neblina volumétrica falsa** (shader de ruído), **cones de luz de 4 refletores** cortando a fumaça e um **sinalizador vermelho** pulsando ao longe, com fumaça própria. Nome em cartaz gigante, faixa diagonal atravessando a tela. A câmera desce do alto do refletor até o nível do campo. |
| 02 | **Escalação** | Toolbox | A rede da Fase 1 **vira prancheta**: os nós se reorganizam numa formação 4-3-3 desenhada a giz. Cada posição é uma competência, e o hover mostra o "cartão do jogador" com as tecnologias. Os pulsos de evento viram **passes** (defesa → meio → ataque), que é literalmente o fluxo de uma requisição. |
| 03 | **Jogos históricos** | Projetos em destaque | Cada projeto é uma **súmula**: placar, escalação (stack), lances decisivos, VAR e placar final. Planos WebGL com a key art (veja §10), deformados pela velocidade do scroll. |
| 04 | **Preleção** | Como eu penso | As 5 fases como **jogada ensaiada**: um traço de giz percorre 01 → 05 na prancheta, sincronizado com o scroll. O texto é grande e o reveal é palavra por palavra. |
| 05 | **Categorias de base** | Projetos antigos | *(depende da sua resposta, veja §12)* Os primeiros projetos (Apple Watch, Cardápio, Audio Book, Spotify, CookShow) como "revelados na base", em formato compacto. |
| 06 | **Disputa de pênaltis** | Jogo (teaser) | Gol a giz, uma cobrança jogável direto na home e "Jogar a disputa completa →" levando a `/penalti`. |
| 07 | **Apito final** | Contato | A neblina baixa, os refletores apagam um a um e sobra o sinalizador, que vira o CTA. A chave da Resenha aparece aqui como convite: "O jogo acabou. Bora pra resenha?" |

### Formação da Escalação (4-3-3)

> Isto é proposta; confirme ou ajuste as tecnologias em cada posição.

| Setor | Posição | Competência | Tecnologias |
|---|---|---|---|
| **Defesa (AppSec / Blue Team)** | Goleiro | Autenticação e autorização | JWT, RBAC, 2FA |
| | Zagueiro | Rate limit e proteção de borda | Rate limiting, WAF |
| | Zagueiro | Isolamento multi-tenant | Isolamento estrito por tenant |
| | Lateral | Validação e sanitização | Zod, sanitização de entrada |
| | Lateral | Antifraude | Geofence, validação de check-in |
| **Meio-campo (o motor)** | Volante | Modelagem de domínio | NestJS, DDD, Clean Architecture |
| | Meia | Filas e eventos | Redis, BullMQ, workers |
| | **Camisa 8** | Dados | PostgreSQL, TypeORM, Drizzle, Supabase |
| **Ataque (entrega)** | Ponta | Web | React, Next.js, Astro, GSAP |
| | Centroavante | Mobile | React Native, Expo, offline-first |
| | Ponta | IA | Pipelines com LLM, agentes, orquestração com Claude Code |

- **Comissão técnica (banco):** Docker, Linux on-premise, GitHub Actions (self-hosted runners), observabilidade e testes.
- O camisa 8 ganha o número `#08` em destaque. Ninguém fora da torcida vai notar.

---

## 6. Súmula: como o case study fica

O formato serve tanto para o card da home (resumido) quanto para a página `/projects/[slug]` (completa):

```
SÚMULA DA PARTIDA ............................. #03 / CONECTA PLANTÃO
Competição: SaaS B2G/B2B multi-tenant        Status: ● EM PRODUÇÃO
Função em campo: Arquiteto · Full Stack · PO Técnico

ESCALAÇÃO      NestJS (DDD) · TypeORM · PostgreSQL · Redis/BullMQ · ...
LANCES DECISIVOS
  12'  Isolamento estrito multi-tenant
  34'  DDD para regras de jornada e pagamento
  ...
VAR            [desafios, como lances revisados]
PLACAR FINAL   [resultados]
```

- Os minutos dos lances são decorativos e vêm da ordem da lista, não de dados inventados.
- A galeria vira a "**cobertura fotográfica**" do jogo; quando não houver imagem, entra a key art.

### Estrutura de dados (mudanças no tipo `Project`)

- Novos campos: `status` (`"Em produção"`, `"Em operação"`, `"Concluído"`), `competition` (tipo de produto), `position` (seu papel em campo), `tier` (`"sumula"` ou `"base"`) e `cover` opcional.
- `caseStudy` mantém `context`, `role`, `technicalDecisions`, `challenges`, `results` e `gallery`. O mapeamento para a súmula fica na apresentação, então nenhum campo é renomeado.
- Gustavo OS e Sol Poretti não têm "VAR" na sua descrição. Nesses dois a seção não aparece. **Não vou inventar desafios.**
- Novos blocos de dados: `method` (as 5 fases), `lineup` (a formação), `resenha` (o pós-jogo), `hud` (os números) e `copy` (todo texto que hoje está fixo nas páginas). Tudo em PT e EN.

---

## 7. O Modo Resenha (manual)

**Ativação:** uma chave física no header, `[ EXPEDIENTE ]  ●━━○  [ RESENHA ]`. É manual, salva no `localStorage`, e o convite também aparece no apito final.

| | Expediente (padrão) | Resenha |
|---|---|---|
| Luz | Branca de refletor; sinalizador vermelho | **Âmbar de balcão de bar**; os refletores esquentam e a neblina fica dourada |
| Accent | `signal` (vermelho) | `amber` |
| Tom do texto | Técnico | As labels e os microtextos ganham tom de conversa ("bora", "resenha", "fechou") |
| Conteúdo técnico | Visível | **Continua visível**: a resenha só adiciona |
| Extras | — | Bloco "Fora do terminal", jukebox procedural, cromos de fotos, comando `cerveja` |

**O bloco "Fora do terminal"** (na home, no pós-jogo, e em `/about`):
- **Quem é:** paranaense; trabalho pesado das 8h às 17h30; depois disso, futebol, cerveja gelada, jogos e resenha com os amigos.
- **Pelada sagrada:** um card de "presença confirmada" com contagem regressiva até o próximo jogo da semana (o dia vem dos dados).
- **Sangue preto e branco:** "Sofredor fiel pelo Corinthians", em texto e sem marca.
- **Radar 2027:** o dilema como enquete visual, "❄ Esquiar no Chile × 🏛 Rodar a Europa clássica". Só exibe; não coleta voto (isso exigiria backend).
- **Cromos:** 4 molduras estilo figurinha/polaroid técnica, em P&B granulado com linhas de giz e numeradas (`#08`, `#19`, `#10`, `#77`). São placeholders prontos para você trocar pelas fotos reais em `public/images/resenha/`, sem mexer em código.

**Jukebox:** um loop de samba-rock **gerado no navegador** com Web Audio (bumbo, caixa, um baixo simples e chiado de vinil). Zero arquivos, sem música de terceiros e sem embed do Spotify (que é pesado e rastreia o visitante). Fica desligada por padrão.

**Tema claro + Resenha:** a Resenha é sempre noite. Ativá-la no tema claro muda o visual para o noturno âmbar; desativá-la volta ao tema anterior.

---

## 8. Disputa de pênaltis

### Onde
- **Teaser na home** (capítulo 06): uma cobrança só.
- **`/penalti`:** a disputa completa em tela cheia. Também abre pelo terminal (`penalti`).

### Regras
- Você bate 5 e o "Gustavo" bate 5, alternando. As cobranças do Gustavo são simuladas e animadas rapidamente, com 78% de conversão.
- Se empatar, morte súbita. O placar fica `VOCÊ 4 × 3 GUSTAVO`.

### Controles (mouse, touch e teclado)
- **Mira:** arrastar a partir da bola define a direção, num gol dividido em 3×3 zonas.
- **Força:** segurar enche a barra. Força demais isola a bola por cima do travessão.
- **Efeito:** a curvatura do gesto vira curva na trajetória.
- **Teclado:** as setas escolhem a zona, e segurar o espaço controla a força. O resultado é anunciado num `aria-live`.

### O goleiro (a "defesa AppSec")
- **IA honesta e explicável:**
  - ele guarda a frequência das zonas que você escolheu e pula com probabilidade ponderada (90% no seu histórico e 10% de aleatório);
  - o tempo de reação depende da força do chute;
  - ele não trapaceia: decide antes de ver a bola.
- **Modo Muralha 2012:** depois de 2 defesas seguidas, o goleiro ganha alcance extra e um contorno vermelho, e o HUD mostra `MODO MURALHA 2012 ATIVADO`.
- **Placar do recrutador:** no fim, uma linha técnica explica a IA ("o goleiro leu 60% das suas cobranças pela distribuição de frequência"). É a engenharia aparecendo dentro do jogo.

### Visual e som
- Gol, linhas e marca do pênalti a **giz e laser**. A **rede deforma** no gol (vertex shader). O goleiro é uma **silhueta estilizada low-poly**, sem rosto, sem uniforme e sem marca.
- No gol: câmera lenta, flash de fotógrafos, a torcida "explode" e a neblina sacode.
- **Som procedural** (desligado por padrão): o chute, a rede, o apito e a torcida como ruído filtrado.
- **Final:** "Bateu bem. Agora bate um papo." e `sudo hire-me` levando ao contato. O melhor placar fica salvo no navegador (sem ranking online, que exigiria backend).

### Técnica
- Canvas próprio, carregado sob demanda só quando a seção entra na tela ou em `/penalti`. Enquanto o jogo está ativo, a cena de fundo pausa.
- Não usa engine de física: a trajetória é paramétrica (Bézier com efeito) e a colisão é calculada sobre as zonas. Fica leve, determinístico e fácil de testar.
- **Reduced motion:** o jogo continua jogável, sem câmera lenta nem tremor, com resultado imediato.
- **Testes:** a lógica do goleiro e o placar são funções puras com testes unitários, e um teste Playwright joga uma cobrança pelo teclado.

---

## 9. Páginas internas

| Rota | Vira | Destaques |
|---|---|---|
| `/projects` | **Campanha / Tabela** | Índice em formato de tabela de campeonato (#, projeto, competição, status, stack), com imagem seguindo o cursor. A busca e o filtro por tags continuam iguais. |
| `/projects/[slug]` | **Súmula completa** | O formato do §6, com a cobertura fotográfica (galeria com lightbox) e os links. |
| `/about` | **Ficha do jogador** | Bio, formação, a carreira como "histórico de clubes" (a timeline atual, horizontal no desktop) e o bloco "Fora do terminal". |
| `/contact` | **Pós-jogo** | O formulário com estados animados. A lógica do backend não muda. |
| `/penalti` | **Disputa** | §8. |
| 404 | **Impedimento** | "Lance anulado: essa rota estava em impedimento." |

---

## 10. Imagens (Nano Banana)

Só são necessárias para os projetos sem print público. Os prompts estão no fim deste documento. Os demais (hero, prancheta, neblina, cromos, jogo) são todos procedurais.

---

## 11. Fases (com ponto de aprovação no fim de cada uma)

| Fase | Escopo | Peso |
|---|---|---|
| **2A — Repaginação** | Paleta v3, textos do túnel e do HUD (relógio de jogo e números), dados PT/EN atualizados com os 4 projetos novos, o método, a escalação e a resenha, tipo `Project` estendido, `docs/art-direction.md` v3 | Leve |
| **2B — Estádio** | Hero: neblina volumétrica, refletores, sinalizador com fumaça, descida da câmera, faixa diagonal, abertura do túnel, física do scroll (skew e aberração cromática). Tiers de GPU e fallback estático novo (refletores em SVG e CSS) | **Pesada** |
| **3 — A partida** | A rede vira prancheta (formação 4-3-3, cartões e passes), súmulas na home, Preleção com traço de giz, Base, apito final | **Pesada** |
| **4 — Pênaltis** | Teaser na home, `/penalti`, IA do goleiro, Modo Muralha, som, acessibilidade, testes | **Pesada** |
| **5 — Páginas e Resenha** | Campanha, súmula completa, ficha do jogador, pós-jogo, 404, **chave Expediente/Resenha** com luz âmbar, cromos e jukebox | Média |
| **6 — Polimento** | Terminal `~` com todos os comandos, transição de rota em máscara diagonal, ajuste de performance, Lighthouse medido, auditoria de acessibilidade, README | Média |

Ao fim de cada fase: lint, build, testes Playwright, prints reais em desktop e mobile (incluindo reduced motion e sem WebGL), commit, push e o resumo para você aprovar.

---

## 12. Decisões registradas

1. **Súmulas:** YourBest, CONECTA Plantão, Sentinela, Gustavo OS e Sol Poretti (`tier: "sumula"`). Destaques da home: YourBest, CONECTA Plantão e Sol Poretti. Apple Watch, Cardápio, Audio Book, Spotify e CookShow ficam em **Categorias de base** (`tier: "base"`).
2. **Inglês:** seletor PT/EN na Fase 5, com vocabulário britânico de transmissão (*Match Report*, *Starting XI*, *Added Time*, *Offside*, *After-Match*).
3. **Imagens:** o Sol Poretti usa prints reais do site público. CONECTA, Sentinela e Gustavo OS usam key art (`public/images/<slug>/cover.jpg`). Enquanto o arquivo não existe, a UI usa a capa de prancheta em SVG (`BlueprintCover`).
4. **Links:** só o Sol Poretti tem link público. Os sistemas privados mostram o selo "Repositório privado — arquitetura disponível na súmula" e nunca um botão de código.
5. **Pelada:** terça, quarta e sábado, configuráveis em `resenha.nextMatchDays`.
6. **Regra de conteúdo:** nunca expor dados sensíveis. Só arquitetura, preocupações técnicas, tecnologias e o domínio de cada sistema.

## 13. Lembretes (ajustar depois)

- [ ] **Sol Poretti:** os prints atuais são da **landing page** pública (`solporettinutri.com.br`). O trabalho principal foi o **site/sistema clínico** desenvolvido para ela. Ajustar a súmula (contexto, papel, decisões e imagens) para destacar o sistema clínico, e tratar a landing page como parte secundária.
- [ ] **Horários da pelada:** a quarta às 20h foi confirmada. Terça (20h) e sábado (9h) foram assumidos; confirmar em `resenha.nextMatchDays`.
- [ ] **YourBest:** confirmar o status (hoje "Em desenvolvimento") e se o repositório é privado.
- [x] **Key arts:** geradas e aplicadas (`public/images/<slug>/cover.jpg`, e `cover-clinico.jpg` para a Sol Poretti). Os originais e as variações ficam em `design/key-art/` (fora do `public/`, então não são publicados). A OG image é `src/app/opengraph-image.jpg`.
- [x] **Key art do YourBest:** aplicada (`public/images/yourbest/cover.jpg`). a capa atual é o logo em fundo branco e destoa do site. Gerar `public/images/yourbest/cover.jpg` (prompt no apêndice, item 6). Até lá, a súmula usa a capa de prancheta.
- [ ] **Mapas de profundidade (opcional):** `cover-depth.png` para o parallax 2.5D (veja o pedido de mapa de profundidade no apêndice).
- [ ] **Cromos da resenha:** `cromo-10.jpg` (Resenha, chope no balcão) e `cromo-77.jpg` (Radar 2027) são ilustrações procedurais geradas para o site. Faltam as duas fotos reais: `cromo-08.jpg` (pelada, camisa 8) e `cromo-19.jpg` (arquibancada). Ao subir, recortar em retrato 3:4 centrado no Gustavo; na foto do estádio, o escudo da camisa e as placas de patrocínio ficam fora do quadro ou pequenos (regra "alma, sem marca").
- [ ] **Estádio:** variação das key arts inspirada na arquitetura da arena do Corinthians, sem marca e sem nome de patrocinador.

## Apêndice — prompts para o Nano Banana

**Estilo comum** (cole no início de cada prompt):

> Cinematic black-and-white key art, high contrast, deep blacks (#080808) and creamy off-white highlights (#F5F5F0), heavy film grain, night stadium atmosphere with volumetric fog and hard floodlight beams, thin chalk-drawn technical lines and small coordinate markers like a tactical board or engineering blueprint. Exactly one accent color: signal-flare red (#E61919), used sparingly. Brutalist, editorial, Swiss-grid composition, lots of negative space on the left for typography. No text, no letters, no logos, no club crests, no real people's faces, no jerseys with brands. 16:10, 2400×1500.

1. **CONECTA Plantão:**
   > …a hospital corridor at night merged with a football tactical board: a chalk grid of shifts and time slots drawn over the floor, a single smartphone on a bench glowing with a map pin inside a circular geofence drawn in chalk, red flare light leaking from a door at the end of the corridor, fog at floor level.

2. **Projeto Sentinela:**
   > …a lone watchtower/lighthouse at the edge of a dark stadium, its searchlight sweeping across an endless field of stacked paper documents rendered as faint white sheets, a few documents caught in the beam are outlined in chalk with small red markers, fog, sense of constant vigilance.

3. **Gustavo OS:**
   > …an overhead view of a dark locker-room desk at 7:59 am: a minimal mechanical keyboard, a notebook with chalk-like tactical arrows connecting small circles labelled only with abstract symbols, a calendar grid drawn in chalk, a coffee cup with steam catching a single floodlight beam, one small red dot marking "now".

4. **Sol Poretti / Nutrição clínica** (só se não usarmos o print real):
   > …a top-down still life on matte black stone: a plate divided into geometric sections by thin chalk lines like a design canvas, fresh vegetables and grains rendered in silver-grey monochrome, a single red tomato as the only color, subtle grid guides and measurement marks around the plate, studio light.

6. **YourBest** (marketplace mobile de beleza on-demand):
   > …a dark apartment doorway at night seen from the hallway, a professional's beauty kit case resting on the floor with brushes and tools rendered in silver-grey monochrome, a smartphone on top glowing with a map route drawn in chalk leading to the door, chalk tactical arrows on the floor connecting small circles (professional → client), one single red dot marking the destination, soft fog, floodlight-like beam from the left.

5. **OG image** (prévia ao compartilhar o link, 1200×630):
   > …a night stadium seen from the tunnel exit, four floodlight beams cutting dense fog, one red flare glowing in the stands, a diagonal black-and-white band crossing the frame, large empty space on the left half for the name to be added later in code. 1200×630.

> Gere 2–3 variações de cada uma e me mande as melhores. Antes de aplicar, eu ajusto o tamanho, o peso e o tratamento (grain e contraste) para elas ficarem consistentes com o site.
