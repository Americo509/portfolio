# Assets e licenças

Registro exigido pelo plano Awwwards (`docs/plano-awwwards.md`, "Assets e licenças"). Uma linha por arquivo publicado: caminho, origem, licença, data em que entrou no repositório e quem fez. Serve de crédito na submissão.

Regra: tudo em `public/` (e as imagens em `src/app/`) é publicado no deploy. Nada de escudo, hino, gravação de transmissão, foto de terceiros, nome de patrocinador ou marca de material esportivo. Originais e referências de terceiros ficam em `design/`, que não é publicado.

## Fontes

| Arquivo | Origem | Licença | Data | Quem fez |
|---|---|---|---|---|
| Archivo (via `next/font/google`) | Google Fonts | SIL Open Font License 1.1 | 2026-10-21 | Omnibus-Type |
| Instrument Serif (via `next/font/google`) | Google Fonts | SIL Open Font License 1.1 | 2026-10-21 | Instrument |
| JetBrains Mono (via `next/font/google`) | Google Fonts | SIL Open Font License 1.1 | 2026-10-21 | JetBrains |

## Código de terceiros embutido

| Arquivo | Origem | Licença | Data | Quem fez |
|---|---|---|---|---|
| `src/components/scene/stadium/shaders.ts` (ruído simplex 3D) | webgl-noise | MIT | 2026-10-21 | Ashima Arts / Ian McEwan |
| `public/basis/basis_transcoder.{js,wasm}` | three.js (`examples/jsm/libs/basis`) | Apache-2.0 | 2026-10-22 | Binomial / three.js |

## Imagens

| Arquivo | Origem | Licença | Data | Quem fez |
|---|---|---|---|---|
| `public/favicon.ico`, `src/app/icon.svg` | Feitos para o projeto | Próprio | 2026-10-21 | Gustavo (com Claude) |
| `src/app/opengraph-image.jpg` | Key art gerada no Nano Banana (Google) a partir de prompt do Gustavo, tratada no projeto | Uso conforme os termos do Google para conteúdo gerado | 2026-10-21 | Gustavo |
| `public/images/conecta-plantao/cover.jpg` | Key art gerada no Nano Banana (prompt em `docs/art-direction.md`) | Uso conforme os termos do Google para conteúdo gerado | 2026-10-21 | Gustavo |
| `public/images/sentinela/cover.jpg` | Key art gerada no Nano Banana | Uso conforme os termos do Google para conteúdo gerado | 2026-10-21 | Gustavo |
| `public/images/gustavo-os/cover.jpg` | Key art gerada no Nano Banana | Uso conforme os termos do Google para conteúdo gerado | 2026-10-21 | Gustavo |
| `public/images/yourbest/*.jpg` (telas do app) | Prints do app YourBest | Próprio (marca e app do YourBest, do qual o Gustavo foi co-CEO) | 2026-02-26 | Gustavo |
| `public/images/yourbest/cover.jpg`, `identidade-visual.jpg` | Composição da marca YourBest com as telas do app (`design/brand/yourbest/composicoes/`) | Próprio | 2026-10-21 / 2026-10-22 | Gustavo (com Claude) |
| `public/images/sol-poretti-clinico/*.jpg` | Prints do sistema clínico, com pacientes fictícios em ambiente local | Próprio (sistema e identidade visual feitos pelo Gustavo) | 2026-10-21 | Gustavo |
| `public/images/sol-poretti/*.jpg` | Prints da landing page solporettinutri.com.br | Próprio | 2026-10-21 | Gustavo |
| `public/images/resenha/cromo-08.jpg`, `cromo-19.jpg` | Fotos do Gustavo; escudo e marca da camisa cobertos, rosto do torcedor ao lado desfocado | Próprio | 2026-10-21 | Gustavo |
| Capas das Categorias de base (`src/components/projects/BaseCover.tsx`) | SVG procedural com o número do projeto; substituiu os prints dos projetos de estudo, que incluíam marca da Apple e do Spotify (removidos em 2026-10-22) | Próprio | 2026-10-22 | Gustavo (com Claude) |
| `public/images/resenha/cromo-10.jpg`, `cromo-77.jpg` | Ilustrações procedurais | Próprio | 2026-10-21 | Gustavo (com Claude) |

## Som

Ainda não há arquivos de som: tudo é gerado no navegador (Web Audio). A gravação da torcida entra na etapa 5 do plano, e cada arquivo ganha uma linha aqui.

## Não publicados (em `design/`)

| Pasta | Conteúdo | Observação |
|---|---|---|
| `design/reference/arena/` | 2 concept arts (Nano Banana) e 3 fotos de terceiros da arena | Só referência; as fotos de terceiros nunca vão para `public/` |
| `design/brand/yourbest/` | Arquivos-fonte da marca YourBest (AI, EPS, PDF, SVG, PNG, JPG) | Próprio |
| `design/key-art/` | Originais e variações das key arts | Próprio (Nano Banana) |
| `design/resenha/` | Originais das fotos dos cromos | Próprio |
