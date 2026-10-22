# Arena no Blender: modelagem, bake e exportação

Guia da parte da etapa 1 do plano Awwwards (`docs/plano-awwwards.md`, "Luz assada") que é do Gustavo. O código já está pronto para receber o modelo: basta colocar o arquivo em `public/models/arena.glb` e trocar `ARENA_MODEL` em `src/components/scene/stadium/config.ts` de `null` para `"/models/arena.glb"`. Sem o arquivo, a arena continua procedural.

**O que vem do Blender:** só a estrutura, com a luz assada (arquibancadas, prédios, coberturas, treliça, arcos, pilares, tirantes, cobertura dos fundos e moldura do telão).

**O que continua no código e não deve ser modelado:** gramado, neblina, feixes de luz, lâmpadas e linha de LED, conteúdo do telão, torcida, bandeiras, sinalizadores e fumaça.

## 1. Unidades e eixos

- **Escala:** 1 unidade = 1 metro (Scene Properties → Units → Metric, Unit Scale 1.0).
- **Origem:** no centro do campo, no nível do gramado.
- **Eixos:** o Blender é Z para cima, e o exportador glTF converte para Y para cima sozinho. No Blender:
  - **norte = +Y** (vira −z na cena, o fundo que a câmera da abertura vê);
  - **oeste = −X**;
  - **altura = +Z**.
- Campo de referência: um plano de 68 × 105 m (X × Y), só para guiar. **Não exporte esse plano.**

## 2. O que modelar (medidas da cena em `docs/estadio-arena.md` §7)

Valores em metros, já convertidos para os eixos do Blender. O sinal ± vale para os dois lados.

| Objeto (nome exato) | Forma | Medidas |
|---|---|---|
| `stand_side_lower` | Perfil em rampa extrudado em Y | de X = ±40 (altura 0,8) a X = ±62 (altura 12); Y de −56 a 56; os dois lados |
| `stand_side_upper` | Perfil em rampa "pendurado" (laje embaixo) | de X = ±64 (altura 16) a X = ±84 (altura 38); laje inferior 2,2 m abaixo da rampa; Y de −56 a 56 |
| `building` | Caixas | X de ±84 a ±96, altura 48, Y de −90 a 90; fachada de vidro do lado de fora (oeste) e painéis do outro lado (leste) |
| `stand_end` | Perfil em rampa extrudado em X | de \|Y\| = 60,5 (altura 0,8) a \|Y\| = 84,5 (altura 14); X de −36 a 36; norte e sul. **A inclinação tem que ser exatamente essa:** a torcida procedural é posicionada por essa conta |
| `roof_side` | Laje inclinada de 1,2 m | borda interna em X = ±44 a 40 m de altura, borda externa em X = ±96 a 50 m; Y de −60 a 60 |
| `truss_side` | Treliça Warren sob a borda interna | 4 m de altura, diagonais a cada 6 m, ao longo de Y de −60 a 60 em X = ±44 |
| `roof_end` | Laje fina de 0,8 m | altura 24; \|Y\| de 60 a 88; X de −40 a 40 |
| `arch` | Tubo (curva Bézier com bevel de 0,9 m de raio) | em Y = ±72; de X = −60 a 60; nasce a 30 m nos pilares e chega a 46 m no meio (parábola) |
| `arch_pillar` | Caixas de 2,4 × 2,4 | em X = ±60, Y = ±72, de 0 a 30 m |
| `arch_hanger` | Cilindros finos (0,08 m) | do arco até a `roof_end`, a cada 8 m em X, de −40 a 40 |
| `screen_frame` | Moldura do telão | atrás da arquibancada norte, centro em X = 0, Y = 86,5; tela de 24 × 8 m, de 14 a 22 m de altura. **Deixe a tela em si de fora:** o conteúdo é um shader no código |

**Dicas de modelagem (quase tudo é extrusão):**
- Desenhe o perfil da arquibancada como um polígono (4 vértices) na vista lateral e use E (extrude) no comprimento.
- Os degraus não precisam ser geometria: a textura assada e o shader resolvem.
- Espelhe com o modificador Mirror (eixo X para as laterais, eixo Y para os fundos) e aplique antes de exportar.
- **Orçamento:** até 60 mil triângulos no total.

## 3. Luz para o bake

Os refletores são 12 grupos na borda interna da cobertura, 3 por setor. Coloque um Area Light em cada um, retangular (6 × 1 m), mirando o ponto indicado, com cor branca levemente fria. Comece pela potência abaixo e ajuste no olho.

| Setor | Posição (X, Y, Z) | Mira em (X, Y, Z) |
|---|---|---|
| Sul | (−24, −60, 24), (0, −60, 24), (24, −60, 24) | (−14, −26, 0), (0, −22, 0), (14, −26, 0) |
| Leste | (44, 36, 40), (44, 0, 40), (44, −36, 40) | (8, 30, 0), (6, 0, 0), (8, −30, 0) |
| Oeste | (−44, 36, 40), (−44, 0, 40), (−44, −36, 40) | (−8, 30, 0), (−6, 0, 0), (−8, −30, 0) |
| Norte | (−24, 60, 24), (0, 60, 24), (24, 60, 24) | (−14, 26, 0), (0, 22, 0), (14, 26, 0) |

- **Potência inicial:** 4000 W cada.
- **Fundo do World:** quase preto (0,005), para ser noite.
- Um ou dois Area Lights fracos atrás do telão ajudam a recortar a silhueta da arquibancada norte.

## 4. Materiais e bake

1. **Materiais simples, só cor, em tons de cinza:** concreto 0,18, assento 0,55, metal do arco e da treliça 0,7, vidro do prédio 0,08. O grading (LUT) do site cuida do resto.
2. **Junte tudo num objeto só** (Ctrl+J), ou em poucos objetos com os nomes acima.
3. **Crie uma segunda UV** chamada `lightmap`: Object Data → UV Maps → +. Com ela ativa, faça UV → Smart UV Project com Island Margin 0,02.
4. **Crie uma imagem** de 2048 × 2048 (4096 se couber no orçamento) e um nó Image Texture com ela selecionado em cada material.
5. **Configure e rode o bake:** Render Engine Cycles, Bake Type **Combined**, Margin 8 px, de 512 a 1024 amostras. O resultado é a arena já iluminada e colorida numa textura só.
6. **Salve a imagem** como PNG em `design/arena/lightmap.png`.
7. **Troque os materiais** por um único material com essa imagem ligada direto no Base Color, lida pela UV `lightmap`. No site, ela é desenhada sem iluminação em tempo real.

## 5. Exportação

1. File → Export → glTF 2.0 (.glb):
   - Format glTF Binary;
   - Include: Selected Objects;
   - Transform: +Y Up;
   - Data: UVs e Normals ligados, Materials Export;
   - Compression desligada (a compressão vem no passo 2).
2. Comprima com meshopt e KTX2:
   ```bash
   npx @gltf-transform/cli optimize arena-raw.glb public/models/arena.glb \
     --compress meshopt --texture-compress ktx2
   ```
   O KTX2 precisa do `toktx` do [KTX-Software](https://github.com/KhronosGroup/KTX-Software/releases) instalado. Se der trabalho, suba o `arena-raw.glb` com a textura em PNG que eu faço a compressão.
3. **Meta:** `arena.glb` abaixo de 1,5 MB.

## 6. Onde guardar

| Arquivo | Onde | Observação |
|---|---|---|
| `.blend` | `design/arena/arena.blend` | Se passar de 50 MB, fica fora do Git (guarde no Drive) |
| Lightmap original | `design/arena/lightmap.png` | |
| Modelo do site | `public/models/arena.glb` | Ganha uma linha em `docs/assets-licenses.md` |

Quando o arquivo estiver lá, aviso: eu ligo o `ARENA_MODEL`, confiro o encaixe com a torcida e o telão, e tiro os screenshots de antes e depois que fecham a etapa 1.
