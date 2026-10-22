# Estádio inspirado na arena de Itaquera (plano para o futuro)

Status: **não iniciado**. Este documento registra a direção combinada para quando o estádio do site for trocado por um inspirado na arquitetura da arena do Corinthians (Neo Química Arena).

## 1. Quem faz o quê

O estádio do hero **não é uma imagem**: é uma cena 3D gerada por código (`src/components/scene/stadium/`, three.js + shaders). As arquibancadas, os refletores, a neblina e o gramado são geometria e shader. Nenhuma imagem do Nano Banana entra nessa cena.

| Parte | Quem faz | Por quê |
|---|---|---|
| Cena 3D do hero (arquibancadas, cobertura, iluminação, telão) | **Claude, em código** | É geometria procedural; uma imagem não substitui nem melhora isso |
| Estádio do pênalti (`PenaltyScene.tsx`) | **Claude, em código** | Mesmo motivo; precisa casar com o hero |
| Fallback estático (`StaticStadium`, sem WebGL) | **Claude, em CSS/SVG** | Hoje é só CSS, sem imagem; continua leve |
| Concept art para definir o visual antes de codar | **Você, no Nano Banana** | Serve só de referência; não é publicada |
| Key arts das súmulas (CONECTA, Sentinela, Gustavo OS) e a OG image, se quiser que todas "aconteçam" na arena | **Você, no Nano Banana** (prompts no §6) | São imagens 2D; eu ajusto corte, grão e contraste antes de publicar |
| Fotos de referência da arena | **Você** | 4–6 fotos em `design/reference/arena/`, só para eu ver proporções. **Não vão para `public/`** (direito autoral de terceiros) |

Resumo: o trabalho pesado é meu; do seu lado, fotos de referência e (opcional) as imagens 2D do Nano Banana.

## 2. Regras de marca

- Inspirado **na arquitetura**, nunca na marca: sem o nome "Neo Química Arena" (é naming rights de patrocinador), sem escudo do Corinthians, sem logo de patrocinador ou de fornecedor e sem texto de marca no telão.
- Nos textos do site, se precisar citar: "a arena de Itaquera" ou "a casa". De preferência, não citar: quem conhece reconhece pela silhueta.
- A paleta não muda: preto e branco com o vermelho de sinalizador, e o âmbar no Modo Resenha. O alvinegro já combina.

## 3. O que deixa a arena reconhecível

Lista de memória: **conferir com as fotos de referência** antes de implementar.

1. **Assimetria entre os lados:** o lado oeste é um prédio alto com fachada de vidro; o lado leste tem a fachada externa de LED gigante (o "telão" de fora).
2. **Cobertura com estrutura metálica aparente:** treliças longas e cobertura clara. A silhueta da cobertura recortada contra a neblina é o que mais identifica o estádio de longe.
3. **Luz na borda da cobertura**, não em quatro torres nos cantos. É a maior mudança em relação à cena atual.
4. **Arquibancadas coladas no gramado**, com inclinação forte, e a torcida atrás do gol.
5. **Contexto (opcional):** zona leste de São Paulo, com a linha do metrô ao lado. Um trem passando ao longe pode virar easter egg.

## 4. Impacto no que já existe

| Hoje | Na arena |
|---|---|
| 4 torres de refletor nos cantos (`FLOODLIGHTS`, `Towers`, `Glows`, `Beams` em `stadium/`) | Luz saindo da borda da cobertura: muitos feixes finos (instanciados) formando uma cortina de luz na neblina. As torres somem. |
| Preloader "refletor 1/4 … ok" e apito final com "os refletores apagam um a um" | Manter o "4" como **os quatro setores da cobertura** (norte, sul, leste, oeste): `> setor leste ........ ok`. O apito final apaga setor por setor. Ajustar `copy.boot` (PT/EN) e `docs/art-direction.md` §4. |
| 4 caixas inclinadas como arquibancadas (`Stands`) | Perfil em degraus por setor (`ExtrudeGeometry` a partir de uma seção transversal 2D), com o oeste mais alto que os outros. |
| Sem cobertura | Novo `Roof`: treliças finas (`InstancedMesh` ou `LineSegments`) e uma placa semitransparente que recorta a neblina. |
| Sem telão | Telão interno com shader de "pixels" mostrando conteúdo do site: número do capítulo, placar da disputa de pênaltis e "Bora pra resenha?" no Modo Resenha. |
| Sinalizador na arquibancada do fundo (`FLARE`) | Continua atrás do gol, no meio da torcida. |
| `CHAPTER_PRESETS` (enquadramentos por capítulo) | Revisar: a vista tática de cima vai bater na cobertura, então ela precisa de uma abertura central ou a câmera fica abaixo da borda. |
| Fallback em CSS | Silhueta da cobertura em SVG + cortina de luz em gradiente. Continua sem imagem. |
| Estádio do pênalti | Mesma silhueta e mesma luz de borda ao fundo. |

**Limites de performance:** não piorar o TBT da home no mobile (hoje 1,7 s, ver README). Geometria instanciada, sem texturas grandes. No tier `low`, só a silhueta da cobertura, sem treliças.

**Testes:** os do projeto `webgl` (`e2e/scene.spec.ts`) e a auditoria axe precisam continuar passando.

## 5. Fases sugeridas

1. **Referência:** você coloca as fotos em `design/reference/arena/` e, se quiser, gera 2–3 concept arts (§6, prompt A). Eu analiso e devolvo um esboço de proporções (planta e corte) para você aprovar.
2. **Estrutura:** arquibancadas assimétricas, cobertura e luz da borda, substituindo as torres. Preloader e apito final passam a falar em setores.
3. **Telão:** conteúdo dinâmico (capítulo, placar dos pênaltis, Modo Resenha).
4. **2D:** key arts e OG image novas (se quiser), fallback estático e estádio do pênalti.
5. **Opcional:** o preloader vira a chegada à arena, com a câmera de fora vendo a fachada de LED acender e entrando pelo túnel. É a fase mais cara; só vale se as outras ficarem leves.

## 6. Prompts para o Nano Banana

Use o **estilo comum** do apêndice de `docs/art-direction.md` no início de cada prompt e, depois dele, o trecho abaixo. Sempre peça 2–3 variações.

**A. Concept da arena (só referência, não publicada):**
> …a modern football arena at night inspired by São Paulo's east-zone stadium architecture: asymmetric stands, the west side a tall building with a glass curtain wall, a long steel-truss roof with exposed structure cutting a sharp silhouette against dense fog, a continuous line of lights along the roof edge casting a curtain of thin beams onto the pitch instead of corner floodlight towers, steep stands close to the pitch, one red flare glowing in the stand behind the goal. Wide establishing shot from the pitch corner, low angle.

**B. OG image na arena (1200 × 630):**
> …the same arena seen from the tunnel exit at pitch level, the roof-edge light line and its curtain of beams cutting the fog, one red flare in the stand behind the goal, a diagonal black-and-white band crossing the frame, large empty space on the left half for the name to be added later in code. 1200×630.

**C. Fundo para as key arts das súmulas** (acrescente ao fim de cada prompt já existente no apêndice):
> …set inside the same arena: the steel-truss roof silhouette and its line of edge lights visible in the background through the fog.

Ao mandar as imagens, coloque os originais em `design/key-art/<slug>/` (como já é feito). Eu escolho, ajusto grão, contraste e corte e publico em `public/images/<slug>/cover.jpg`.
