# Luz assada no navegador (plano B do bake)

**Status (22/10):** desenho para aprovação. Nada implementado. O bake com o `ProgressiveLightMap` do three foi aprovado na revisão do commit 87ac1ef; este documento é o desenho pedido antes do código. O caminho pelo Blender (`docs/arena-blender.md`) vira alternativo.

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

**As luzes do bake**, por setor, saem de `LIGHTS` em `config.ts`, a mesma fonte do site (nada de tabela duplicada):
- Os 3 grupos de refletores como `SpotLight` com sombra. O ângulo é mais aberto que o feixe visível (o `CONE_TAN` estreito é só o facho na neblina); a borda é suave e a queda física (decay 2). A cada iteração, a posição varia dentro de um retângulo de 6 × 1 m, o tamanho do grupo: isso dá a penumbra.
- O rebote do gramado: uma luz fraca por setor, do centro da mancha que aquele setor faz no gramado, apontando para cima, com sombra. É a luz que sobe do campo e acende o degrau de baixo, e a laje da arquibancada superior bloqueia.

**Ganhos.** Cada canal é normalizado pelo próprio máximo. Os 4 ganhos vão num `arena-light.json` ao lado da textura, junto com o ganho da torcida e a versão do bake.

## 3. UV2 com xatlas (item 7)

- **Mesma geometria nos dois lados.** Os construtores de geometria saem de `Arena.tsx` para um módulo puro (`stadium/geometry.ts`), usado pelo site e pelo script. O `.glb` sai com os mesmos vértices que o site desenha hoje, mais a UV do lightmap.
- **Texels onde a câmera olha.** As faces que a trilha nunca mostra (o lado de cima das coberturas, as fachadas externas, o fundo dos prédios) ficam fora do atlas e apontam para um texel escuro único. O espaço vai para o que aparece.
- **xatlas** (`xatlasjs`, WASM):
  - resolução 2048 e margem de 8 texels (2 no tier de 512);
  - `bilinear` ligado;
  - `blockAlign` ligado: as ilhas ficam alinhadas aos blocos 4 × 4 do ASTC, do BC7 e do ETC2, para a compressão não misturar duas ilhas no mesmo bloco;
  - densidade de texels uniforme.
  - Plano B do plano B: `xatlas-three`, o mesmo xatlas com outra embalagem.
- **Encaixe no `ProgressiveLightMap` sem modificá-lo.** A classe empacota as UVs de cada objeto com potpack e grava `uv1`. O script entrega um objeto só, a geometria mesclada, com o atlas do xatlas no atributo `uv`. Com uma caixa só, o potpack vira a identidade (só a margem da classe) e o `uv1` sai igual ao atlas.
- **Exportação.** O `GLTFExporter` grava o `uv1` como `TEXCOORD_1`, com nomes de malha e de material (assento, sólido, arco) para o site devolver o albedo de cada parte. Depois o glTF Transform aplica meshopt. A cena procedural tem 8,4 mil triângulos medidos, contando as bandeiras, que ficam de fora; o `.glb` deve ficar abaixo de 100 KB.

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
- O UASTC vai com RDO moderado e Zstandard, com mipmaps e em espaço linear (sem sRGB: são dados, não cor).
- No aparelho, o `KTX2Loader` (já no projeto, com o transcoder em `/basis/`) converte para ASTC 4 × 4, BC7 ou ETC2.
- **Codificador:** `ktx2-encoder`, o basis_universal em WASM. Roda no Node e se integra ao glTF Transform. O CLI do KTX-Software (`toktx`) não instala aqui: a rede bloqueia os releases do GitHub. O WASM também evita dependência nativa.

**Pretos sem degrau:**
1. **Raiz quadrada na textura.** O canal guarda `sqrt(E / ganho)` e o shader eleva ao quadrado. Com 8 bits, o primeiro degrau acima do preto passa a ser ~1/65.000 do máximo em vez de 1/255. É onde a arquibancada sob a cobertura vive.
2. **Dither antes de quantizar:** ruído triangular de ±1 nível, com semente fixa, no espaço já codificado.
3. **RDO conferido:** se ele alisar o dither e trouxer as faixas de volta, o lambda desce.
4. **O que vem depois já ajuda:** a curva em S da LUT e o grão do pós (Noise 0,2).
5. **Verificação:** o mesmo quadro do hero renderizado com o lightmap float sem compressão (referência) e com o KTX2. Nas regiões escuras (luminância < 0,1), a diferença média fica ≤ 1/255 e nenhuma rampa escura tem degrau maior que 1 nível. Vai junto um recorte ampliado das duas versões.

**Carregamento.**
- O lightmap e o `.glb` carregam depois que a cena fica pronta (fora do TBT), no tamanho do tier.
- Até lá vale a luz analítica de hoje. Quando chegam, o shader novo é compilado com `compileAsync` e a luz faz um crossfade de 0,6 s (`uBaked` de 0 a 1).
- A geometria é a mesma, então a troca só aparece na luz.

## 6. O que muda no site

- `ARENA_MODEL` passa a ser `{ glb, lightmap: { low, mid, high }, meta }`.
- `ArenaModel` deixa de trocar o material por `MeshBasicMaterial` com a textura no `map`. Passa a usar o material da arquibancada (`useStandMaterial`) com `USE_BAKED` definido e os uniforms `uLightmap`, `uGain` e `uBaked`.
- Sem o arquivo, ou se o carregamento falhar, tudo fica como hoje (procedural e analítico).
- `docs/assets-licenses.md` ganha as linhas do `.glb`, das 3 texturas e do `.json` (próprio, gerado pelo script).

## 7. Pronto quando

- Uma grade com 4 quadros, cada um com um setor só aceso: a luz cai onde deve, com a sombra da cobertura.
- A sequência do apito final apaga setor por setor, com as sombras acompanhando.
- O teste de degraus do §5 passa.
- Os orçamentos batem: `.glb` < 100 KB; KTX2 dentro da tabela do §5.
- O fps do hero não piora (a meta é melhorar: uma leitura de textura no lugar do laço) e o TBT mobile não piora (carregamento depois de pronto).
- Lint, typecheck, build e Playwright passam (desktop, mobile e webgl).

## 8. Riscos

- **Vazamento de luz em geometria fina** (a laje da cobertura dos fundos tem 0,8 m): ajuste de bias e normal offset da sombra. Se não bastar, uma espessura mínima só na geometria do bake.
- **Pacote do xatlas pouco mantido** (`xatlasjs` 0.2.0): a troca para o `xatlas-three` é direta.
- **Tempo do bake sem GPU:** se passar de uma hora aqui, o primeiro bake sai em 1024 para validar o desenho, e o de 2048 roda depois.

## Depois do bake

Bandeirões refeitos como pano sem espessura, em escala compatível com a arquibancada de 14 m, com mastro visível e ondulação crescendo do mastro para a ponta (pedido na revisão do commit 87ac1ef).
