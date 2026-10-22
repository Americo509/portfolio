# Luz assada no navegador (plano B do bake)

**Status (22/10):** desenho aprovado na revisão de c51c6fd, com os acréscimos 5 a 11 daquela revisão incorporados abaixo (marcados com o número). Implementado; resultados no §9. O caminho pelo Blender (`docs/arena-blender.md`) é alternativo.

## Resumo

- Um script assa a luz da arena no Chromium headless, com o `ProgressiveLightMap` do three r186, a partir da mesma geometria procedural que o site já desenha.
- São quatro bakes, um por setor da cobertura, em luz branca, empacotados nos canais RGBA de uma textura só. A cor continua vindo da paleta e da LUT.
- No shader, a luz da arquibancada é a soma dos quatro canais, cada um pesado pela intensidade do seu setor (`uLightOn`). O apito final e a meia-luz das páginas internas continuam acendendo e apagando por setor, agora com sombras de verdade (a borda da cobertura na arquibancada superior, a treliça, o arco).
- A UV do lightmap sai do xatlas, dentro do script. A textura vai em KTX2 UASTC, com uma resolução por tier e codificação pensada para não criar degraus nos pretos.

## 1. O que é assado e o que continua no código

| Assado (lightmap) | Continua no código |
|---|---|
| Arquibancadas laterais e dos fundos, prédios, coberturas, treliça, arcos, pilares, tirantes e moldura do telão: tudo o que `ProceduralStructure` desenha hoje | Gramado (os cones de luz no gramado já são analíticos e baratos), neblina, feixes, lâmpadas, LED, telão, torcida, bandeiras, sinalizadores e fumaça |

A torcida e as bandeiras se mexem, então não dá para assar. Elas continuam com a luz analítica (`sectorSpill`), mas calibrada contra o bake: o script mede a luz assada em pontos das arquibancadas norte e sul e grava um ganho, para a torcida não ficar mais clara nem mais escura que o degrau atrás dela.

## 2. Um bake por setor, em RGBA (item 6)

**Canais.** A ordem é a de `SECTORS` em `config.ts`, a mesma de `uLightOn` e do apito final:

| Canal | Setor | Índice |
|---|---|---|
| R | sul | 0 |
| G | leste | 1 |
| B | oeste | 2 |
| A | norte (apaga por último) | 3 |

**O que cada canal guarda.** A irradiância da luz branca daquele setor: só a luz, sem cor e sem albedo. A cor do material continua no shader (`uBase`, fileiras) e a cor da noite vem da paleta (`uFg`) e da LUT. Assim o mesmo lightmap serve para o Expediente, a Resenha e o tema claro.

**No shader** (a arquibancada, no lugar de `sectorSpill`):

```
L   = texture(uLightmap, vUv1)        // RGBA, linear
L   = L * L                           // a textura guarda a raiz (ver §5)
lit = dot(L, vec4(uLightOn[0], uLightOn[1], uLightOn[2], uLightOn[3]) * uGain)
```

O resto da fórmula atual (`mix(uBg, uFg, uBase) + uFg * lit * (...)` e as fileiras) não muda. Sai o laço de 4 segmentos por pixel e entra uma leitura de textura, que é mais barata.

**Comportamento por setor:**
- **Apito final:** cada `uLightOn[i]` cai do 1 ao 0 na ordem de hoje e leva junto o seu canal, com a sombra da cobertura daquele setor.
- **Páginas internas:** refletores a 40%, de novo só pelo `uLightOn`.
- **Preloader:** hoje as linhas do preloader seguem a mesma ordem no DOM, mas a cena não desenha durante ele. Se um dia a cena acender junto, basta animar o `uLightOn`, sem bake novo.

**As luzes do bake**, por setor, saem de `LIGHTS` e `ARENA` em `config.ts`, a mesma fonte do site (nada de tabela duplicada):
- Os 3 grupos de refletores como `SpotLight` com sombra. O ângulo é mais aberto que o feixe visível (o `CONE_TAN` estreito é só o facho na neblina); a borda é suave e a queda física (decay 2). A cada iteração, a posição varia dentro de um retângulo de 6 × 1 m, o tamanho do grupo: isso dá a penumbra.
- A luz da arquibancada: uma fileira de spots sob a borda da cobertura daquele setor, abertos e suaves, apontando para os degraus. É o equivalente físico do `sectorSpill` de hoje (luz em volta do segmento de refletores de cada setor): apagar um setor continua escurecendo a arquibancada dele, agora com a sombra da laje.
- O rebote do gramado: uma luz fraca por setor, do centro da mancha que aquele setor faz no gramado, apontando para cima, com sombra. É a luz que sobe do campo e acende o degrau de baixo, e a laje da arquibancada superior bloqueia.

**Ganhos e calibração.** Para não mudar a exposição aprovada, cada setor é calibrado contra a luz analítica de hoje: o script renderiza também um mapa de posições no espaço do lightmap, calcula o `sectorSpill` de cada texel visível e escolhe o ganho do setor para que a média assada bata com a analítica. Depois cada canal é normalizado pelo seu percentil 99,9 (um texel quente perto de um refletor não achata o resto). Ganhos, escalas, a versão do bake e o hash do §9 vão num `arena-light.json` ao lado da textura. Com a média calibrada, a torcida (analítica) não destoa do degrau atrás dela, sem ganho próprio.

## 3. UV2 com xatlas (item 7)

- **Mesma geometria nos dois lados.** Os construtores de geometria saem de `Arena.tsx` para um módulo puro (`stadium/geometry.ts`), usado pelo site e pelo script. O `.glb` sai com os mesmos vértices que o site desenha hoje, mais a UV do lightmap.
- **Texels onde a câmera olha (5).** Quais faces ficam fora do atlas sai de amostragem das câmeras reais, não de suposição:
  - trilha desktop e trilha mobile, de g = 0 a 7 a cada 0,02, cada amostra com os 4 extremos do deslocamento do ponteiro (±2,4 m em x, ±1 m em y);
  - a abertura vista de cima da cobertura sul (dolly e descida, desktop e mobile), com o tremor da câmera na mão no máximo;
  - os quadros das páginas internas;
  - a câmera do pênalti (no pênalti, a arquibancada norte aparece deslocada; a câmera é levada para as coordenadas da arena), em proporção desktop e mobile, com o tremor do gol.
  - Cada amostra renderiza a estrutura com o número da face como cor, num quadro com margem de proporção (21:9 no desktop, 9:20 no celular) e FOV 10% maior, e marca as faces que aparecem em pelo menos um pixel. A torcida e as bandeiras não entram como oclusoras (mais conservador).
  - As faces nunca vistas continuam na geometria (a malha do site é a mesma da procedural), mas a UV delas aponta para uma ilha-reserva sem luz dentro do atlas.
  - O relatório do bake lista quantas faces e quanta área ficaram de fora e gera uma prancha com quadros da abertura em que as faces fora do atlas aparecem em magenta. Critério: zero pixel magenta nos quadros da abertura e das trilhas.
- **xatlas** (`xatlasjs`, WASM):
  - resolução 2048 e margem de 8 texels (2 no tier de 512);
  - `bilinear` ligado;
  - `blockAlign` ligado: as ilhas ficam alinhadas aos blocos 4 × 4 do ASTC, do BC7 e do ETC2, para a compressão não misturar duas ilhas no mesmo bloco;
  - densidade de texels uniforme.
  - Plano B do plano B: `xatlas-three`, o mesmo xatlas com outra embalagem.
- **Entrada do xatlas:** os vértices são soldados por posição antes (sem isso, cada triângulo vira uma ilha). O xatlas separa as ilhas pela normal das faces e devolve os vértices novos, com o mapa para os antigos.
- **Encaixe no `ProgressiveLightMap` sem modificá-lo.** A classe empacota as UVs de cada objeto com potpack e grava `uv1`. O script entrega um objeto só, a geometria mesclada, com o atlas do xatlas no atributo `uv`. Com uma caixa só, o potpack vira a identidade (só a margem da classe) e o `uv1` sai igual ao atlas.
- **Exportação.** O `GLTFExporter` grava o `uv1` como `TEXCOORD_1`, em malhas separadas por material e por uso (`seats_side`, `seat_end_north`, `seat_end_south`, `solid`, `arches`), para o site devolver o albedo de cada parte e o pênalti usar só a arquibancada norte. Os tirantes e a treliça são linhas, sem superfície: continuam procedurais. Depois o glTF Transform aplica meshopt. A cena procedural tem 8,4 mil triângulos medidos, contando as bandeiras, que ficam de fora; o `.glb` deve ficar abaixo de 100 KB.

## 4. O bake

- **Comando:** `pnpm bake:arena`, em `scripts/bake-arena/`.
- **Onde roda o quê:**
  - O esbuild empacota uma página; o Playwright, que já é dependência, abre o Chromium headless.
  - A página monta a geometria, roda o xatlas e assa os 4 setores em sequência, com alvos float. Já conferi que o Chromium daqui tem `EXT_color_buffer_float`.
  - Os floats voltam para o Node, que faz a dilatação, a redução por tier, a codificação, o KTX2 e o glTF.
- **Iterações:** 512 por setor, com jitter de semente fixa, o que deixa o bake reproduzível. A janela de média é o número da iteração, então sai a média de verdade, não a média móvel da classe.
- **Dilatação:** cada ilha é esticada para os texels vazios em volta (push-pull). Sem isso, o filtro bilinear e os mipmaps puxam preto pelas bordas.
- **Tempo:** aqui, sem GPU (SwiftShader), deve levar dezenas de minutos; numa máquina com GPU, menos de um minuto. Só roda quando a geometria ou as luzes mudam, e os arquivos gerados vão para o repositório.
- **Um bake, três tiers:** o bake roda uma vez em 2048 e os tiers menores saem por redução (média em espaço linear). O desenho da luz é o mesmo em todos.

## 5. Resolução por tier, formato e pretos sem degrau (item 8)

**Resolução por tier**, estimada para uns 50 mil m² de superfície visível. Confiro com a ocupação que o xatlas reportar.

| Tier | Lightmap | Tamanho em disco (UASTC + RDO + Zstd, com mips) | Texel |
|---|---|---|---|
| low | 512² | ~100 KB | ~44 cm |
| mid | 1024² | ~400 KB | ~22 cm |
| high | 2048² | ~1,3 MB | ~11 cm |

Na GPU, todos viram 1 byte por texel (2048² com mips dá ~5,3 MB).

**Formato: KTX2 UASTC, não ETC1S.**
- Os 4 canais são dados independentes. O ETC1S divide os extremos de cor entre os canais e vazaria a luz de um setor no outro, o que aparece justamente quando um setor apaga.
- **Codificação (6):**
  - modo não perceptual: os 4 canais com o mesmo peso no erro;
  - alfa como dado: a imagem entra como raster RGBA cru, sem pré-multiplicação, e nada pondera o RGB pelo alfa;
  - DFD com transferência linear (sem sRGB); no site a textura é `NoColorSpace`;
  - mipmaps gerados pelo script em espaço linear (média da irradiância), antes da raiz quadrada e do dither; cada nível é codificado à parte e os níveis são montados num KTX2 só (`ktx-parse`), com Zstandard por nível. O gerador de mipmaps do basis ficaria desligado, porque faria a média já na raiz;
  - RDO desligado por padrão. Só entra se a verificação do §5 continuar passando com ele.
- No aparelho, o `KTX2Loader` (já no projeto, com o transcoder em `/basis/`) converte para ASTC 4 × 4, BC7 ou ETC2.
- **Codificador:** `ktx2-encoder`, o basis_universal em WASM. Roda no Node e se integra ao glTF Transform. O CLI do KTX-Software (`toktx`) não instala aqui: a rede bloqueia os releases do GitHub. O WASM também evita dependência nativa.

**Pretos sem degrau:**
1. **Raiz quadrada na textura.** O canal guarda `sqrt(E / ganho)` e o shader eleva ao quadrado. Com 8 bits, o primeiro degrau acima do preto passa a ser ~1/65.000 do máximo em vez de 1/255. É onde a arquibancada sob a cobertura vive.
2. **Dither antes de quantizar:** ruído triangular de ±1 nível, com semente fixa, no espaço já codificado.
3. **RDO conferido:** se ele alisar o dither e trouxer as faixas de volta, o lambda desce.
4. **O que vem depois já ajuda:** a curva em S da LUT e o grão do pós (Noise 0,2).
5. **Verificação:** o mesmo quadro do hero renderizado com o lightmap float sem compressão (referência) e com o KTX2. Nas regiões escuras (luminância < 0,1), a diferença média fica ≤ 1/255 e nenhuma rampa escura tem degrau maior que 1 nível. Vai junto um recorte ampliado das duas versões.
   - **Por setor (7):** a comparação com o float e o teste de degraus rodam duas vezes: com tudo aceso e com só o norte aceso (o último quadro do apito final, quando só a arquibancada da torcida está iluminada e qualquer vazamento de canal ou degrau aparece).

**Carregamento.**
- O lightmap e o `.glb` carregam depois que a cena fica pronta (fora do TBT), no tamanho do tier.
- Até lá vale a luz analítica de hoje. Quando chegam, o shader novo é compilado (com `compileAsync` quando há compilação paralela) e a geometria é trocada com `uBaked` em 0, o que deixa a troca invisível: a malha é a mesma e a luz ainda é a analítica.
- **Crossfade (9):** se o lightmap chega durante a abertura, a troca acontece dentro dela: fade de 0,5 s que termina antes do fim da descida, com a câmera em movimento. Se chega depois, fade lento de 2 s. Optei pelo fade lento em vez de esperar o próximo corte de capítulo: nas páginas internas não há corte, e quem fica parado num capítulo não veria a troca nunca.

## 6. O que muda no site

- `ARENA_MODEL` passa a ser `{ glb, lightmap: { low, mid, high }, meta }`.
- `ArenaModel` deixa de trocar o material por `MeshBasicMaterial` com a textura no `map`. Passa a usar o material da arquibancada (`useStandMaterial`) com `USE_BAKED` definido e os uniforms `uLightmap`, `uGain` e `uBaked`.
- Sem o arquivo, ou se o carregamento falhar, tudo fica como hoje (procedural e analítico).
- `docs/assets-licenses.md` ganha as linhas do `.glb`, das 3 texturas e do `.json` (próprio, gerado pelo script).
- O pênalti usa a malha `seat_end_north` com o mesmo lightmap, deslocada como a torcida dele.

## 6b. Bake vencido (10)

- O `arena-light.json` guarda um hash (SHA-256) das posições da geometria procedural (arredondadas em 0,1 mm), de `LIGHTS`, de `ARENA` e da versão dos parâmetros do bake.
- Um teste novo (projeto `node` do Playwright, sem navegador) recalcula o hash a partir do código e falha com "Bake vencido: rode pnpm bake:arena" quando não bate. Assim, mexer na arena ou nas luzes sem refazer o bake quebra o CI em vez de passar com luz errada.

## 6c. Rodar o bake na máquina do Gustavo (11)

- `pnpm bake:arena` roda headless (aqui, sem GPU).
- `pnpm bake:arena --headed` abre o navegador visível e usa a GPU da máquina. A página mostra o lightmap acumulando e o progresso por setor.
- `--chrome` usa o Chrome instalado em vez do Chromium do Playwright (melhor suporte de GPU em alguns sistemas). `--res 1024` e `--iterations 256` servem para um bake rápido de conferência.

## 7. Pronto quando

- Uma grade com 4 quadros, cada um com um setor só aceso: a luz cai onde deve, com a sombra da cobertura.
- Screenshot do tema claro com o bake (8).
- Prancha da abertura sem pixel magenta (5).
- A sequência do apito final apaga setor por setor, com as sombras acompanhando.
- O teste de degraus e a comparação com o float do §5 passam com tudo aceso e com só o norte aceso (7).
- O teste de bake vencido passa (10).
- Os orçamentos batem: `.glb` < 100 KB; KTX2 dentro da tabela do §5.
- O fps do hero não piora (a meta é melhorar: uma leitura de textura no lugar do laço) e o TBT mobile não piora (carregamento depois de pronto).
- Lint, typecheck, build e Playwright passam (desktop, mobile e webgl).

## 8. Riscos

- **Vazamento de luz em geometria fina** (a laje da cobertura dos fundos tem 0,8 m): ajuste de bias e normal offset da sombra. Se não bastar, uma espessura mínima só na geometria do bake.
- **Pacote do xatlas pouco mantido** (`xatlasjs` 0.2.0): a troca para o `xatlas-three` é direta.
- **Tempo do bake sem GPU:** se passar de uma hora aqui, o primeiro bake sai em 1024 para validar o desenho, e o de 2048 roda depois.

## 9. Implementação (22/10)

Feito como desenhado, com estes pontos que só apareceram rodando:

- **Quem faz o quê.** O xatlas roda no Node (o pacote tem build para Node); a página no Chromium só renderiza: visibilidade e bake. A geometria sai de `stadium/geometry.ts`, o mesmo módulo que o site usa.
- **Lado oeste apagado.** As arquibancadas do oeste são o leste espelhado (`scale(-1, 1, 1)`), o que inverte o sentido dos triângulos: a normal do bake apontava para dentro do sólido. O espelho agora desfaz o sentido (`flipWinding`); o site não muda, porque o shader não usa normal.
- **Ilhas pretas.** O xatlas espelha algumas ilhas, que ficam no sentido horário no espaço da UV, e o material do `ProgressiveLightMap` é de um lado só. A passada da UV agora desenha os dois lados, sem inverter a normal no verso.
- **Margem da visibilidade.** Entram também as faces finas (menor altura abaixo de 1,5 m) vizinhas de uma face vista, e as cordas entre pontos da trilha (a câmera amortecida corta caminho num scroll rápido). A primeira versão da margem, por qualquer vizinho, trazia de volta o lado de cima das coberturas e foi trocada.
- **Comparação na mesma página.** A semente da fumaça dos sinalizadores muda a cada carregamento, então a verificação troca o KTX2 pela referência float na mesma página (`window.__bake`, só no `?debug`), com o relógio congelado e sem grão.
- **Densidade real:** ~4,8 texels/m no 2048 (~21 cm por texel), mais grosso que os ~11 cm estimados no §5: há mais superfície visível do que eu tinha contado.

**Bake final (22/10):** 2048, 512 iterações por setor, sombras de 2048, no Chromium sem GPU: 41 min. 4.682 câmeras; 275 de 2.276 faces (18,4% da área) fora do atlas; ocupação do atlas 59%. Arquivos: `arena.glb` 23 KB; `arena-light-512.ktx2` 202 KB, `-1024` 756 KB, `-2048` 2,87 MB. O 2048 passou da estimativa de ~1,3 MB porque o RDO ficou desligado (§5); ele só entra se a verificação continuar passando, num teste à parte.

**Verificação (`pnpm bake:verify`, tier alto, mesma página, relógio congelado, sem grão):**

| Quadro | Diferença média nas sombras (níveis de 8 bits) | Máxima | Degraus (> 1 nível onde a referência é lisa) |
|---|---|---|---|
| Hero, tudo aceso | 0,050 | 1 | 0 em 816.758 pares |
| Fim do apito final, só o norte | 0,059 | 7 (80 pixels numa faixa da borda esquerda do quadro, efeito do pós; nenhum no meio) | 0 em 1.566.181 pares |

- Faces fora do atlas: 0 pixel magenta em 84 quadros (13 da abertura e 29 da trilha, em desktop e celular).
- Grade por setor e tema claro: conferidos nas imagens (`scripts/bake-arena/out/verify/`, fora do Git).

## Depois do bake

Bandeirões refeitos como pano sem espessura, em escala compatível com a arquibancada de 14 m, com mastro visível e ondulação crescendo do mastro para a ponta (pedido na revisão do commit 87ac1ef).
