# Direção de arte — "Sistema vivo"

Referência viva para todas as fases do redesign. Se uma decisão de implementação conflitar com este documento, este documento ganha (ou é atualizado de forma explícita).

## 1. Ideia central

O portfólio é um **sistema distribuído em produção**, e o visitante é o operador que o atravessa. Cada capítulo é um "serviço", os projetos são nós com tráfego real e o contato é o ponto para onde todos os eventos convergem.

Régua: **com as animações desligadas, o site ainda tem de parecer uma peça editorial**, e não um template. A identidade vem da tipografia, do grid e da linguagem de HUD; o 3D amplifica.

## 2. Paleta

| Token | Escuro (padrão) | Claro ("blueprint") | Uso |
|---|---|---|---|
| `--bg` | `#07080A` (void) | `#ECE9E2` (papel) | Fundo |
| `--surface` | `#0E1014` | `#E2DED5` | Planos, inputs |
| `--fg` | `#EDEAE3` (off-white quente) | `#0B0C0E` | Texto principal |
| `--muted` | `#8B9099` | `#5A5E66` | Texto secundário, labels |
| `--line` | `rgba(237,234,227,.09)` | `rgba(11,12,14,.12)` | Linhas de HUD e divisórias |
| `--signal` | `#D4FF3A` | `#D4FF3A` (só como fundo, nunca como texto) | **Accent único** |
| `--alert` | `#FF5A36` | `#E0401C` | Somente erro de formulário e estado "falha" |

**Por que um verde-ácido de fósforo, e não o azul que todo dev usa:** é a cor de terminal CRT e do status `healthy` de um dashboard. Conversa diretamente com o conceito (sistema em operação) e contrasta com o off-white quente, que tira o ar "neon frio" genérico do sci-fi. Ele aparece pouco: pulsos de eventos, cursor, foco, CTAs e destaque de palavra. No tema claro, `--signal` é usado apenas como preenchimento sob texto escuro (contraste 15:1), nunca como cor de texto sobre papel.

## 3. Tipografia (Google Fonts via `next/font`, todas gratuitas)

| Papel | Fonte | Por quê |
|---|---|---|
| Display e corpo | **Archivo** (variável: `wght` 100–900, `wdth` 62–125) | Grotesca com eixo de largura: o mesmo arquivo dá a display ultracondensada (`wdth 62`, `wght 800`) e o corpo legível (`wdth 100`). O eixo `wdth` também é animável (respiração tipográfica no scroll). |
| Acento editorial | **Instrument Serif** (itálico) | Uma ou duas palavras por título, em contraste com a grotesca. É o "toque humano" no meio do sistema. |
| HUD, labels, terminal | **JetBrains Mono** | Coordenadas, numeração de capítulos, metadados, terminal. |

Escala:
- Display de capítulo: `clamp(4rem, 12vw, 14rem)`, `line-height .82`, `letter-spacing -0.02em`, caixa alta, `wdth 62`.
- Título de seção: `clamp(2.25rem, 5.5vw, 5rem)`.
- Corpo: 17px/1.6 (mobile 16px). Labels mono: 11–12px, caixa alta, `letter-spacing .14em`.

## 4. Grid e HUD

- 12 colunas, gutter `clamp(16px, 2vw, 28px)`, margem lateral `clamp(16px, 4vw, 56px)`. A largura do conteúdo é a da tela; não existe mais o container centralizado de 6xl.
- Composição assimétrica: projetos alternam colunas `1–8` e `5–12`, textos longos em `2–8` e labels mono na coluna 1.
- **Moldura HUD fixa:** linhas de 1px em `--line` a cerca de 20px das bordas, marcadores `+` nos cantos, à esquerda o capítulo atual (`01 / 05`), à direita a hora local e o status `● SYSTEM ONLINE`, em mono 11px.
- Grain sutil global (SVG noise a 6%, `mix-blend-mode: overlay`).

## 5. Linguagem de movimento

| Nome | Curva | Duração | Uso |
|---|---|---|---|
| `cine` | `cubic-bezier(.76, 0, .24, 1)` | 0,9–1,4 s | Cortinas, obturador, transições de rota |
| `reveal` | `expo.out` | 0,8–1,2 s | Entrada de texto (linhas sobem de uma máscara) |
| `snap` | `cubic-bezier(.2, .8, .2, 1)` | 0,2–0,35 s | Hover, foco, microinterações |
| `scrub` | linear, ligado ao scroll | — | Parallax, separação de palavras, câmera |

Regras:
1. Texto **nunca** aparece com fade puro: sobe de dentro de uma máscara (linhas) ou é decodificado (caracteres mono, efeito "scramble").
2. Toda animação de entrada roda uma vez; o scrub é reversível.
3. A velocidade do scroll (`lenis.velocity`) é a "física" global: skew e distorção proporcionais, com teto.
4. Com `prefers-reduced-motion`, nada se move além de mudanças de opacidade de até 200 ms.

## 6. A cena 3D por capítulo

| Capítulo | Câmera | Rede |
|---|---|---|
| Boot (preloader) | Dentro do nó central, tela quase toda escura | Somente o núcleo pulsando |
| 01 Hero | Zoom-out explosivo até o enquadramento aberto, com leve rotação seguindo o mouse | Constelação completa; fluxos com curl noise; pulsos de eventos em `--signal` |
| 02 Projetos | Dolly lateral; para cada projeto, aproxima de um nó, que acende | O nó do projeto ativo emite mais tráfego |
| 03 Toolbox | Recua e inclina, vista de cima | Os nós se reorganizam em 4 clusters (Backend, Frontend, Mobile, Arquitetura) |
| 04 Como eu penso | Câmera quase parada; profundidade de campo forte | A rede desfoca e vira textura de fundo para o texto |
| 05 Contato | Avança até o centro | Todos os fluxos convergem num único ponto pulsante (o CTA) |

**Enquadramento inicial:** a rede ocupa o terço direito e o centro; o nome em display gigante fica à esquerda, vazando pela borda inferior da primeira dobra. **Quando a câmera chega a um projeto:** o nó acende em `--signal`, as conexões dele ficam mais densas e o card do projeto entra como plano com a imagem, que deforma levemente com a velocidade do scroll e faz ripple sob o mouse.

## 7. Fallbacks

- **Sem WebGL, falha na cena ou tier baixo:** gradiente radial e uma rede estática em SVG (os mesmos nós), com o grain. A página fica visualmente completa.
- **Reduced motion:** sem Lenis, sem scrub, sem preloader animado; a cena é substituída pelo fallback estático.
- **Touch:** sem cursor customizado e sem botões magnéticos; o hover vira estado de toque.

## 8. Riscos técnicos

1. **Custo de GPU** no mobile: tiers de partículas e DPR, `PerformanceMonitor` e pausa fora de vista.
2. **LCP:** o canvas só monta depois do primeiro paint, em `requestIdleCallback`; o título do hero é texto SSR.
3. **ScrollTrigger com Lenis e troca de rota:** uma instância só, limpeza via `useGSAP` e `ScrollTrigger.refresh()` após a transição.
4. **Fontes variáveis com `wdth`:** declarar `axes: ['wdth']` no `next/font` e testar o fallback.
5. **Hidratação:** o preloader não pode depender de estado do cliente para o conteúdo existir no HTML.

## 9. Imagens

As capturas atuais de projetos em `public/images` são suficientes para os planos WebGL. Assets novos (OG image, textura de fallback) serão pedidos com prompts prontos, se necessários.
