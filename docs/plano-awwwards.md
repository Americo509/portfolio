# Noite de Jogo — Plano Awwwards (solo)

Oct 22, 2026 · @Gustavo

## Alvo e decisões

O alvo é **Site of the Day** e **Developer Award** na Awwwards, com o site feito solo e submetido na versão em inglês. Site of the Year fica fora: pede equipe de arte 3D e de som.

O júri dá nota em Design (40%), Usabilidade (30%), Criatividade (20%) e Conteúdo (10%), com no mínimo 18 jurados e as três notas mais extremas descartadas. Design e Usabilidade somam 70%: cada efeito 3D novo mira os 20% e arrisca os 30%.

- **Direção antes de quantidade.** Nenhuma feature nova entra antes do look (luz, cor, lente e câmera).
- **Solo.** Assets CC0 ou de licença permissiva, arena modelada pelo Gustavo e torcida gravada por ele na arquibancada.
- **Entrelinhas.** Continua valendo: sem escudo, hino, sirene, som oficial ou nome de patrocinador. O explícito só aparece como recompensa escondida.
- **Relação com os outros docs.** Complementa [`docs/art-direction.md`](art-direction.md) (v3) e [`docs/estadio-arena.md`](estadio-arena.md). Quando este plano corta ou troca algo, a mudança vale.

## A linguagem: transmissão de TV

A gramática de câmera do site é a da transmissão de futebol: cada capítulo é uma câmera do jogo. Isso dá sentido a "cinematográfico" sem inventar nada que o visitante precise aprender.

| Capítulo | Câmera da transmissão | O que muda na cena |
|---|---|---|
| 00 Túnel | Câmera na mão seguindo o time | Micro-tremor, foco curto, letterbox |
| 01 Entrada em campo | Plano aberto do alto | Descida da cobertura sul até o gramado |
| 02 Escalação | Câmera tática (spidercam) | Vista de cima, a prancheta no gramado |
| 03 Jogos históricos | Replay | Congelamento, timecode, telestrador |
| 04 Preleção | Close | Profundidade de campo curta, texto grande |
| 05 Categorias de base | Câmera de trilho na lateral | Travelling lateral, ritmo mais rápido |
| 06 Disputa de pênaltis | Câmera atrás do batedor | Câmera própria do jogo |
| 07 Apito final | Plano geral | Setores apagam, sobram os sinalizadores |

O resto da interface usa a mesma linguagem:

- **HUD.** É a tarja de placar da emissora (o relógio de jogo já existe).
- **Títulos de capítulo.** Entram como GC (lower third), com a faixa diagonal.
- **Transição de rota.** É a vinheta de replay: a faixa diagonal alvinegra cruza a tela no lugar do logo girando que toda emissora usa.

## Três momentos-assinatura

O site tem três momentos para o júri lembrar, e só três. Tudo o que não serve a eles vira polimento ou sai.

### Mosaico da torcida (hero)

A torcida norte levanta um mosaico e o nome se forma na arquibancada. É o frame que as pessoas gravam e postam.

- **Técnica.** InstancedMesh com milhares de placas e o flip no vertex shader, com atraso escalonado por instância. A cor vem de uma textura com o nome em Archivo rasterizado num canvas.
- **Ao rolar.** O mosaico se desfaz e se refaz: o 4-3-3 na Escalação, o #08 no meio do caminho e "BORA PRA RESENHA?" no apito final.
- **LCP.** O h1 do DOM continua sendo o LCP, opaco desde o primeiro frame. O mosaico é o eco dele na cena.
- **Tiers.** No low, menos placas e sem refazer. Com reduced motion ou sem WebGL, só o cartaz do DOM.

### A prancheta desce para o gramado (Escalação)

As linhas de giz do SVG descolam da página e pousam no gramado 3D, na vista tática (câmera a 66 m, cobertura como moldura).

- **Passes.** O fluxo auth → tenant → enqueue → render corre como rastro de luz na grama, de jogador em jogador.
- **DOM.** Os cards dos jogadores ficam no DOM, por cima, e continuam sendo os botões acessíveis.
- **Emenda.** A troca do SVG para o shader de giz no gramado acontece sem salto visível: mesma espessura, mesma rugosidade, mesma posição na tela no frame da troca.

### Telestrador nas súmulas (Jogos históricos)

Sai o ripple, o RGB shift e a curvatura pela velocidade do scroll. Entra o replay.

- **No hover ou no foco.** A capa congela, entra o timecode e um "comentarista" desenha a giz círculos e setas sobre a key art.
- **O que o giz aponta.** As decisões técnicas da súmula (isolamento por tenant, geofence, filas), lidas dos dados do projeto.
- **Duas camadas.** O recrutador vê um replay; o engenheiro lê a arquitetura.

## O look

O salto de demo técnica para filme vem de luz e lente, não de mais geometria. É a primeira coisa a fazer, porque sobe a nota de tudo o que já existe.

### Luz assada

- **Modelo híbrido.** A geometria procedural da arena (medidas de `docs/estadio-arena.md` §7) com a luz assada por um script no navegador, com o `ProgressiveLightMap` do three: um bake por setor da cobertura, empacotado nos canais RGBA de uma textura KTX2, e UV do lightmap pelo xatlas. Exportada em glTF com meshopt. Desenho em [`docs/bake-luz.md`](bake-luz.md) (aprovado o caminho em 22/10; implementação depois do aval do desenho).
- **Continua procedural.** Neblina, torcida, bandeiras, sinalizadores, fumaça e gramado.
- **Por quê.** Luz assada é o maior salto visual isolado e costuma sair mais leve do que iluminar tudo em tempo real.
- **Caminho alternativo.** Modelar e assar no Blender ([`docs/arena-blender.md`](arena-blender.md)). Ficou de reserva: o Gustavo não usa Blender, e o bake no navegador reaproveita a geometria e as luzes que o site já tem.

### Cor

- **Grading por LUT.** Uma LUT para o Expediente e outra para a Resenha. O âmbar vira grading de verdade, não só troca de token.
- **Tone mapping.** AgX.

### Lente

- **Flare anamórfico.** Riscos horizontais nos refletores, a assinatura visual de cinema.
- **Grão.** No pós-processamento, não em CSS.
- **Motion blur.** Só nos movimentos rápidos de câmera.
- **Rack focus.** O foco passa da torcida para o texto nos momentos de leitura.
- **Letterbox 2.39:1.** Só no túnel, no replay e no apito final. Usado o tempo todo, perde o efeito.

### Câmera autorada

- **Plano-sequência.** Splines com keyframes autorados, dirigidos pelo scroll, no lugar da interpolação entre presets. *(O plano original citava Theatre.js com R3F; o `@theatre/r3f` parou em maio de 2024 e exige R3F 8, e o projeto usa R3F 9. Os keyframes ficam num arquivo de dados próprio, `src/components/scene/stadium/camera-track.ts`.)*
- **Momentos de lente.** Dolly zoom na saída do túnel e micro-tremor de câmera na mão dentro dele.
- **Mobile.** Uma trilha própria, com enquadramentos verticais pensados, e não a de desktop espremida.
- **Reduced motion.** Sem plano-sequência: quadros estáticos por capítulo ou o fallback em CSS.

### Tipografia cinética

O eixo `wdth` da Archivo acompanha o scroll: o nome entra largo e condensa até o 62 de cartaz. Com reduced motion, já entra em 62.

## Som

A trilha do site é o próprio estádio, gravado pelo Gustavo na arquibancada. Não há música nem hino.

### Na interface

- **Portão no fim do túnel.** "Entrar com som / Entrar sem som". Desbloqueia o AudioContext pelo gesto e vira um momento de marca. Sem escolha, o padrão continua sem som.
- **Saída do túnel.** Um lowpass vai abrindo enquanto a câmera sai: a torcida abafada que explode.
- **Torcida espacializada.** PannerNode na posição da arquibancada norte, acompanhando a câmera.
- **Apito final.** O som cai junto com os setores que apagam; sobra o burburinho e o estalo dos sinalizadores.

### O que gravar

Gravador de mão ou celular em estéreo, num jogo na arena. Grava-se som de estádio, não música:

- o rugido da torcida;
- palmas e batucada;
- o "uuuh" do quase-gol;
- o silêncio antes de um pênalti;
- a explosão do gol.

### Cuidados

- **Cânticos.** Evitar os inteiros com melodia; muitos são adaptações de músicas que têm dono.
- **Alto-falantes.** Cortar tudo o que sai do sistema de som do estádio (anúncios e o hino tocando).
- **Vozes.** Nenhuma voz identificável de quem estava por perto.
- **Hino.** Fora. Os direitos são de editoras e o próprio clube precisou ir à Justiça para usá-lo sem pagar.

### Recompensa escondida

Um grito de "Corinthians!" da gravação do Gustavo toca só como recompensa: o comando `1910` no terminal ou a vitória na disputa de pênaltis. Quem achou, mereceu.

## Assets e licenças

Tudo o que não é feito pelo Gustavo vem de fonte com licença limpa e fica registrado em [`docs/assets-licenses.md`](assets-licenses.md).

| Necessidade | Fonte | Observação |
|---|---|---|
| Som complementar | Freesound, filtrando por CC0 | Só CC0, para não depender de atribuição |
| Som complementar | GDC Game Audio Bundle (Sonniss) | Conferir os termos da licença do pacote antes de usar |
| HDRIs, texturas, modelos | Poly Haven | CC0 |
| Modelos simples | Kenney, Quaternius | CC0 |
| Animação de torcedor | Mixamo | Para os torcedores com braços levantados e pulando |
| Arena | Geometria procedural do projeto, luz assada pelo script (`docs/bake-luz.md`) | Não usar modelo pronto do Sketchfab: licença varia, costuma vir com marca e fica genérico |
| Fontes | Archivo, Instrument Serif, JetBrains Mono | Já em uso no projeto |

**Registro em `docs/assets-licenses.md`.** Uma linha por arquivo: caminho no repositório, origem, licença, data e quem fez. Serve de crédito na submissão e mostra a mesma disciplina de compliance do lado AppSec.

**O que nunca entra.** Escudo, hino, gravação de transmissão ou de vídeo de terceiros, foto de terceiros em `public/`, nome de patrocinador e marca de fornecedor de material esportivo.

## Cortes e o que fica

Cada feature é dívida de polimento, e a nota cai pela parte mais fraca. Quatro itens saem ou mudam; o resto fica e recebe acabamento.

| Item | Decisão | Motivo |
|---|---|---|
| Jukebox de samba-rock (Web Audio) | Sai | Tem muita chance de soar amador, e é onde o jurado clica |
| Enquete Radar 2027 | Sai | Não mostra nada que o resto do site já não mostre; o cromo #77 continua |
| Histórico de clubes pinado na horizontal (`/about`) | Muda | Scroll horizontal é a galeria que todo mundo já fez |
| Ripple, RGB shift e curvatura nas capas | Muda | Vira o telestrador |
| Disputa de pênaltis | Fica e ganha prioridade | É o diferencial de criatividade |
| Terminal secreto | Fica | Barato e querido por quem é dev |
| Modo Resenha, cromos e contagem da pelada | Ficam | Sem a jukebox e sem a enquete |

### Carreira como evolução de posição

No lugar da timeline horizontal, uma mini-prancheta por temporada mostra a posição do Gustavo subindo no campo: base (estágio), lateral, volante e por fim camisa 8 com a braçadeira. O texto de cada ano continua vindo de `about.timeline`.

### Sensação de jogo no pênalti

O tempo que sobrar vai para a pegada do pênalti: hitstop no contato com a bola, antecipação visível do goleiro, a rede reagindo ao ponto do impacto e a câmera acompanhando o chute.

## Detalhes, making-of e submissão

A submissão acontece quando o site estiver pronto, não numa data. Antes dela, os detalhes baratos e um teste com gente de fora.

### Detalhes que o júri nota

- **Aba.** O título muda quando a pessoa sai ("Volta pro jogo — 2º T").
- **Favicon.** Mostra o minuto do jogo.
- **404.** O VAR traça a linha de impedimento sobre a página.

### Making-of: "Súmula deste site"

Uma página com a arquitetura de animação, os tiers de GPU, as decisões de performance, a gravação da torcida e a política de assets. Serve para o Developer Award e é o melhor case de engenharia front-end para recrutador.

### Antes de submeter

- [ ] Teste num Android intermediário: 60 fps no tier mid durante o hero.
- [ ] Teste com três pessoas de fora: um recrutador, um amigo que não é dev e alguém no celular.
- [ ] Lighthouse e axe registrados no README.
- [ ] `docs/assets-licenses.md` completo.
- [ ] Versão em inglês revisada; é ela que vai para a Awwwards.

### Divulgação

Um vídeo de 30 a 60 segundos do plano-sequência, com o mosaico e o telestrador, publicado no LinkedIn e no X no dia da submissão. Também vale mandar para FWA e CSS Design Awards.

## Ordem de execução

Seis etapas, nesta ordem, cada uma com aprovação do Gustavo antes da próxima. Toda etapa fecha com a rotina de sempre: lint, typecheck, build, Playwright, screenshots em desktop e mobile (com reduced motion e sem WebGL), commit e resumo.

1. **O look.** Arena com luz assada (bake no navegador, `docs/bake-luz.md`), glTF com meshopt e KTX2, LUTs, AgX, lente e câmera autorada com trilha mobile.
   - *Status (22/10):* a parte de código está pronta (LUTs, AgX, grão, flare anamórfico, letterbox, rack focus, motion blur, plano-sequência com trilha mobile, dolly zoom e o carregador do glTF com meshopt e KTX2). A tipografia cinética fica para a etapa 2, junto com o mosaico, porque mexe no h1 (o LCP); o HTML já nasce no estado final (wdth 62) e a animação não pode mexer no layout (CLS).
   - *Revisão (22/10), aprovadas:* troca do Theatre.js por `camera-track.ts` e tipografia cinética na etapa 2. Feito em seguida:
     - **Vermelho:** a LUT devolve a saturação na faixa de matiz do acento depois do AgX, em proporção à saturação que sobrou e com as sombras neutras. Núcleo do sinalizador medido em `#DF1B1A` (alvo `#E61919`); na Resenha, `#F0950A` (alvo `#F59E0B`). A aberração cromática só existe com o scroll em movimento (parada, a franja virava contorno vermelho).
     - **Neblina:** cor base no preto, brilho só onde há espalhamento (cones e sinalizadores) e densidade caindo com a altura. O véu cinza vinha sobretudo dos 12 cones de feixe, largos e sobrepostos: ficaram estreitos, com borda dura e poeira quebrando a luz. No centro do quadro do hero, a luminância média foi de 0,47 para 0,31 e o cinza neutro de 59% para 34% (o resto é a própria arquibancada iluminada).
     - **Câmera:** uma trilha contínua com quadros de via e de leitura, splines por comprimento de arco e easing por segmento.
     - **Diretor de câmera e overlay de desempenho** no `?debug`.
     - **Shaders:** montagem em etapas, compilando cada etapa antes de desenhá-la com compileAsync. Na revisão do commit 87ac1ef ficou só para aparelhos com `KHR_parallel_shader_compile`; sem a extensão, volta o caminho anterior (monta tudo e desenha direto). Ver a meta da etapa 6 abaixo.
     - **Categorias de base:** capa procedural única com o número do projeto; os prints saíram.
   - *Revisão do commit 87ac1ef (22/10), aprovados o vermelho e a neblina.* Feito em seguida:
     - **Área do vermelho:** o sinalizador virou ponto (núcleo quase branco, halo curto) e a luz dele cai em poucos metros na neblina, na torcida, nas bandeiras e na arquibancada; a fumaça só acende junto do fogo. A LUT só devolve o vermelho ao que já é vermelho (o rosado fraco em volta fica como está). Vermelho saturado no quadro do hero: 4,5% → 0,28% (tier alto), 4,2% → 0,43% (médio) e 5,4% → 0,76% (celular), 100% a até 48 px dos 6 sinalizadores (24 px no celular); antes, só metade ficava perto deles. Âmbar na Resenha: 47% → 0,14% (alto) e 0,19% (médio), 76–86% junto dos sinalizadores (o resto são listras de bandeira ao lado deles).
     - **LUT da Resenha:** sombras fundas neutras e calor só dos meios-tons para cima, no creme. O acento âmbar ganhou uma faixa de luminância própria: antes ele pintava de âmbar escuro o gramado no escuro. Croma médio (0–255) nas sombras fundas 17 → 0; sombras 44 → 8; meios-tons 83 → 51; altas 81 → 82.
     - **Número da capa:** a lista de `/projects` numerava pela posição no filtro (o Spotify aparecia 05 com o filtro "base"); agora usa o número da Campanha, o mesmo da súmula e da capa. Teste novo em `smoke.spec.ts`.
     - **Páginas internas:** sem a abertura, sem sinalizadores e fumaça, refletores a 40% e a torcida mais parada. Atrás do texto do cabeçalho de `/projects/spotify`: vermelho saturado 16,5% → 0% e luminância média 0,127 → 0,114.
   - *Plano B do bake (avaliação, sem implementar):* recomendado o `ProgressiveLightMap` do próprio three r186, rodando offline num script com o Chromium headless e exportando um `.glb` com o lightmap para o `ARENA_MODEL`. O `@react-three/lightmap` foi descartado: feito para R3F 6 e three 0.128, grava a UV do lightmap como `uv2` (o three passou a usar `uv1` na r151). O `three-gpu-pathtracer` é compatível, mas não gera lightmap.
   - *Bake (aprovado, desenho em [`docs/bake-luz.md`](bake-luz.md)):* um bake por setor em RGBA (luz branca, cor pela LUT), somado no shader com o peso de cada setor; UV do lightmap pelo xatlas no script; KTX2 UASTC de 512, 1024 e 2048 por tier, com raiz quadrada e dither contra degraus nos pretos. O código começa depois do aval do desenho.
   - *Falta para fechar:* o bake e o teste no Android com o overlay (mediana ≥ 55 fps e p95 ≤ 20 ms por 10 s no hero, tier médio).
   - *Depois do bake:* bandeirões como pano sem espessura, em escala compatível com a arquibancada de 14 m, com mastro visível e ondulação crescendo do mastro para a ponta.
   - *Pronto quando:* as screenshots de antes e depois mostram o salto; o hero roda a 60 fps no tier mid; o TBT da home no mobile não piora em relação ao registrado no README; os testes webgl e axe passam.
2. **Mosaico da torcida.** Nome, 4-3-3, #08 e "BORA PRA RESENHA?".
   - *Pronto quando:* o LCP do h1 não muda; o tier low funciona; reduced motion e sem WebGL mostram só o cartaz do DOM.
3. **Telestrador.** Replay nas súmulas da home e em `/projects/[slug]`.
   - *Pronto quando:* funciona no hover e no foco por teclado; as anotações vêm dos dados do projeto; sem WebGL, a capa mostra a anotação estática.
4. **Prancheta no gramado.** Giz no gramado e passes como rastro de luz.
   - *Pronto quando:* a troca do SVG para o gramado não tem salto visível; os cards continuam botões acessíveis; o teste da Escalação passa.
5. **Som.** Gravação na arena, edição, portão de áudio, lowpass na saída do túnel e torcida espacializada.
   - *Pronto quando:* o padrão continua sem som; os arquivos estão normalizados e leves; cada arquivo está em `docs/assets-licenses.md`.
6. **Cortes e polimento.** Jukebox e enquete fora, carreira por posição, sensação de jogo no pênalti, detalhes, making-of e o checklist de submissão.
   - *Pronto quando:* todos os itens de "Antes de submeter" estão marcados e o **TBT mobile da home está abaixo de 1 s**.
   - *Diagnóstico (22/10):* no ambiente de medição (Chrome headless com SwiftShader, sem GPU), o TBT da home fica em ~1,7–2,2 s. Uns 0,5 s são a hidratação do React; o resto é a página esperando shaders compilarem no primeiro desenho de cada programa. Esse ambiente não tem `KHR_parallel_shader_compile` e compila na CPU, então a montagem em etapas não consegue esconder a espera (ficou ~190 ms pior aqui, e a cena demora mais para aparecer); por isso ela só roda com a extensão. Com essa troca, 4 pares alternados deram mediana de 1,90 s no commit 42cfdfd e 2,00 s agora (antes da troca, ~190 ms de diferença); o resto está dentro do ruído do ambiente e deve vir dos shaders novos. Em aparelhos com a extensão, a montagem compila sem travar. O overlay do `?debug` mostra no celular se há compilação paralela, em quanto tempo a cena ficou pronta e o maior travamento durante a montagem. Próximos alavancas: shaders mais leves (a neblina e o gramado, com 12 cones e ruído) e hidratação mais enxuta.

## Fora do escopo (decidido)

Estes itens foram discutidos e ficam de fora por exigirem equipe ou por quebrarem a regra das entrelinhas. Não entram sem uma nova decisão do Gustavo.

- **A arena como mapa do site.** Cada rota virando um lugar do estádio (vestiário, sala de imprensa, bar). É escala de Site of the Year.
- **Torcida ao vivo e goleiro com aprendizado global.** Pede backend público, anti-abuso e moderação.
- **Artista 3D, sound designer ou músico contratados.** O plano é solo.
- **Hino, gravações de transmissão e cânticos com melodia.** Direitos de terceiros e fora da regra das entrelinhas.
- **Trilha musical.** O som do estádio é a trilha.
