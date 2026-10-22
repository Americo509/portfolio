// Ruído simplex 3D (Ashima Arts / Ian McEwan, licença MIT) + fBm.
export const noise = /* glsl */ `
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }
`;

/**
 * Iluminação dos 12 grupos de refletores na borda da cobertura (3 por setor) num
 * ponto do mundo, compartilhada por neblina, gramado e arquibancadas. uLightOn é
 * por setor: o apito final apaga um setor inteiro de cada vez.
 */
export const floodlights = /* glsl */ `
  uniform vec3 uLightPos[12];
  uniform vec3 uLightDir[12];
  uniform float uLightOn[4];
  uniform float uConeTan;
  float sectorOn(int i) {
    if (i < 3) return uLightOn[0];
    if (i < 6) return uLightOn[1];
    if (i < 9) return uLightOn[2];
    return uLightOn[3];
  }
  float floodlight(vec3 p) {
    float light = 0.0;
    for (int i = 0; i < 12; i++) {
      vec3 v = p - uLightPos[i];
      float along = dot(v, uLightDir[i]);
      if (along > 0.0) {
        float perp = length(v - uLightDir[i] * along);
        float r = along * uConeTan;
        float beam = 1.0 - smoothstep(r * 0.4, r, perp);
        light += beam * exp(-along * 0.012) * sectorOn(i);
      }
    }
    return light * 0.8;
  }
  // Luz que vaza dos refletores para o que está perto deles (arquibancadas, torcida).
  float spill(vec3 p) {
    float s = 0.0;
    for (int i = 0; i < 12; i++) s += exp(-distance(p, uLightPos[i]) * 0.05) * sectorOn(i);
    return s;
  }
`;

/**
 * Luz barata para a estrutura, a torcida e as bandeiras: cada setor da cobertura vira
 * uma barra de luz (o segmento entre os seus 3 grupos de refletores), e a luz cai
 * com a distância até ela. São 4 iterações em vez dos 12 cones + 12 pontos, o que
 * deixa esses shaders bem mais rápidos de compilar no celular.
 */
export const sectorLight = /* glsl */ `
  uniform vec3 uSectorA[4];
  uniform vec3 uSectorB[4];
  uniform float uLightOn[4];
  float sectorSpill(vec3 p) {
    float s = 0.0;
    for (int i = 0; i < 4; i++) {
      vec3 ab = uSectorB[i] - uSectorA[i];
      float t = clamp(dot(p - uSectorA[i], ab) / dot(ab, ab), 0.0, 1.0);
      s += exp(-distance(p, uSectorA[i] + ab * t) * 0.05) * uLightOn[i];
    }
    return s * 2.2;
  }
`;

/** Os sinalizadores da torcida: brilho vermelho que cai com a distância. */
export const flares = /* glsl */ `
  uniform vec3 uFlares[6];
  uniform float uFlare;
  float flareGlow(vec3 p, float falloff) {
    float g = 0.0;
    for (int i = 0; i < 6; i++) {
      float flick = 0.8 + 0.2 * sin(uTime * (11.0 + float(i) * 1.7) + float(i) * 4.0);
      g += exp(-pow(distance(p, uFlares[i]) * falloff, 2.0)) * flick;
    }
    return g * uFlare;
  }
`;

export const worldVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

/**
 * Neblina volumétrica "falsa": camadas de planos com fBm. Como fumaça de verdade no
 * escuro, ela é invisível onde não há luz: a cor base é a do fundo (quase preta) e
 * o brilho vem só do espalhamento dos cones e dos sinalizadores. A densidade cai
 * com a altura (fumaça de arquibancada fica embaixo).
 */
export const fogFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uSignal;
  uniform float uOpacity;
  uniform float uFogMul;
  uniform float uDim;
  uniform float uSeed;
  varying vec3 vWorld;
  varying vec2 vUv;
  ${noise}
  ${floodlights}
  ${flares}
  void main() {
    vec3 p = vWorld;
    float n = fbm(vec3(p.x * 0.03 + uTime * 0.025 + uSeed, p.y * 0.045 - uTime * 0.01, p.z * 0.02 + uSeed * 3.0));
    float density = smoothstep(-0.15, 0.85, n);
    density *= exp(-max(p.y, 0.0) * 0.045);

    // Só espalhamento: dentro dos cones e em volta dos sinalizadores. Sem termo de
    // ambiente, o resto da fumaça some no preto.
    float light = floodlight(p);
    float glow = flareGlow(p, 0.07);

    vec3 color = uBg + uFg * light * 1.25 + uSignal * glow * 0.9;
    float alpha = density * (light * 0.26 + glow * 0.36) * uOpacity * uFogMul * (1.0 - uDim);
    alpha *= smoothstep(0.0, 0.18, vUv.x) * (1.0 - smoothstep(0.82, 1.0, vUv.x)) * smoothstep(0.0, 0.12, vUv.y) * (1.0 - smoothstep(0.6, 1.0, vUv.y));
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Gramado com as linhas do campo a giz e listras de corte, revelado pela luz dos refletores. */
export const pitchFragment = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform float uDim;
  uniform vec3 uCamPos;
  varying vec3 vWorld;
  ${floodlights}
  float band(float d, float w) { return 1.0 - smoothstep(w * 0.5, w * 0.5 + 0.08, abs(d)); }
  float rectLine(vec2 p, vec2 c, vec2 h, float w) {
    vec2 d = abs(p - c) - h;
    float outside = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return band(outside, w);
  }
  void main() {
    vec2 p = vWorld.xz;
    float W = 34.0;
    float L = 52.5;
    float w = 0.14;
    float lines = 0.0;
    lines = max(lines, rectLine(p, vec2(0.0), vec2(W, L), w));
    lines = max(lines, band(p.y, w) * step(abs(p.x), W));
    lines = max(lines, band(length(p) - 9.15, w));
    lines = max(lines, 1.0 - smoothstep(0.2, 0.32, length(p)));
    for (int s = -1; s <= 1; s += 2) {
      float side = float(s);
      lines = max(lines, rectLine(p, vec2(0.0, side * (L - 8.25)), vec2(20.16, 8.25), w));
      lines = max(lines, rectLine(p, vec2(0.0, side * (L - 2.75)), vec2(9.16, 2.75), w));
      vec2 spot = vec2(0.0, side * (L - 11.0));
      lines = max(lines, 1.0 - smoothstep(0.18, 0.3, length(p - spot)));
      // Meia-lua: o trecho do círculo do pênalti que fica fora da grande área.
      float arc = band(length(p - spot) - 9.15, w) * step(abs(p.y), L - 16.5);
      lines = max(lines, arc);
    }
    float inside = step(abs(p.x), W + 4.0) * step(abs(p.y), L + 4.0);
    float stripes = mod(floor((p.y + L) / 5.25), 2.0);
    float light = floodlight(vec3(vWorld.x, 0.0, vWorld.z));

    vec3 grass = mix(uBg, uFg, (0.02 + stripes * 0.012) * inside);
    vec3 color = grass * (0.55 + light * 1.6) + uFg * lines * inside * (0.12 + light * 0.55);
    float far = smoothstep(60.0, 190.0, distance(vWorld, uCamPos));
    color = mix(color, uBg, far);
    color = mix(color, uBg, uDim * 0.65);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Fumaça dos sinalizadores: partículas que sobem e abrem, vermelhas na base e cinzas no alto. */
export const smokeVertex = /* glsl */ `
  attribute float aSeed;
  attribute float aFlare;
  uniform float uTime;
  uniform vec3 uFlares[6];
  uniform float uScale;
  varying float vT;
  varying float vSeed;
  void main() {
    float t = fract(uTime * (0.045 + aSeed * 0.035) + aSeed);
    vec3 p = uFlares[int(aFlare + 0.5)];
    p.x += sin(aSeed * 40.0 + uTime * 0.35) * t * 7.0 + t * t * 10.0;
    p.y += t * 30.0;
    p.z += cos(aSeed * 17.0 + uTime * 0.2) * t * 5.0;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float size = 1.0 + t * 8.0;
    gl_PointSize = size * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    vT = t;
    vSeed = aSeed;
  }
`;

export const smokeFragment = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uSignal;
  uniform float uDim;
  varying float vT;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float puff = 1.0 - smoothstep(0.0, 0.5, d);
    vec3 color = mix(uSignal * 1.2, uFg * 0.16, smoothstep(0.0, 0.3, vT));
    float alpha = puff * puff * (1.0 - vT) * smoothstep(0.0, 0.06, vT) * 0.12 * (1.0 - uDim * 0.7);
    if (alpha < 0.003) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

/** Feixe de luz: cone aberto com bordas suaves (fresnel invertido), poeira e queda ao longo do comprimento. */
export const beamVertex = /* glsl */ `
  varying vec3 vWorld;
  varying vec3 vNormal;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uCamPos;
  uniform vec3 uOrigin;
  uniform vec3 uDir;
  uniform float uLength;
  uniform float uDim;
  uniform float uStrength;
  uniform float uLightOn[4];
  uniform int uSector;
  varying vec3 vWorld;
  varying vec3 vNormal;
  ${noise}
  void main() {
    // Só a componente radial (perpendicular ao eixo do cone): assim a silhueta do
    // cone zera de verdade e a borda do feixe some suave, sem aresta de geometria.
    vec3 view = normalize(uCamPos - vWorld);
    vec3 nR = normalize(vNormal - uDir * dot(vNormal, uDir));
    vec3 vR = normalize(view - uDir * dot(view, uDir));
    float facing = abs(dot(nR, vR));
    float along = clamp(dot(vWorld - uOrigin, uDir) / uLength, 0.0, 1.0);
    // Facho, não parede: miolo concentrado e poeira que quebra a luz em faixas.
    float body = pow(facing, 3.5);
    float fall = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.04, along);
    float dust = max(0.0, 0.35 + 0.65 * snoise(vWorld * 0.07 + vec3(0.0, -uTime * 0.15, uTime * 0.05)));
    float ground = smoothstep(0.0, 4.0, vWorld.y);
    float a = body * fall * dust * ground * uStrength * uLightOn[uSector] * (1.0 - uDim * 0.8);
    gl_FragColor = vec4(uFg, a);
  }
`;

/** Brilho pontual: lâmpadas da borda da cobertura e os núcleos dos sinalizadores. */
export const glowVertex = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aLight;
  uniform float uScale;
  uniform float uTime;
  uniform float uFlicker;
  uniform float uLightOn[4];
  varying vec3 vColor;
  varying float vOn;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float flicker = 1.0 + uFlicker * 0.25 * sin(uTime * 23.0 + position.x) * sin(uTime * 7.0);
    gl_PointSize = aSize * flicker * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    vColor = aColor;
    // aLight: setor da lâmpada (0-3) ou 4 para os sinalizadores (sempre acesos).
    int li = int(aLight + 0.5);
    vOn = li < 4 ? uLightOn[li] : 1.0;
  }
`;

export const glowFragment = /* glsl */ `
  uniform float uDim;
  varying vec3 vColor;
  varying float vOn;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = 1.0 - smoothstep(0.02, 0.12, d);
    float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 3.0) * 0.5;
    float a = (core + halo) * (1.0 - uDim) * vOn;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor * (core * 2.0 + halo), a);
  }
`;

/**
 * Flare anamórfico: risco horizontal fino em cada grupo de refletores, a
 * assinatura de lente de cinema (docs/plano-awwwards.md, "Lente"). Apaga com o setor.
 */
export const streakVertex = /* glsl */ `
  attribute float aSize;
  attribute float aLight;
  uniform float uScale;
  uniform float uLightOn[4];
  varying float vOn;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    int li = int(aLight + 0.5);
    vOn = uLightOn[li];
  }
`;

export const streakFragment = /* glsl */ `
  uniform vec3 uFg;
  uniform float uDim;
  varying float vOn;
  void main() {
    vec2 q = gl_PointCoord - 0.5;
    float along = 1.0 - abs(q.x) * 2.0;
    if (along <= 0.0) discard;
    float line = exp(-pow(q.y * 90.0, 2.0)) + exp(-pow(q.y * 26.0, 2.0)) * 0.2;
    float a = line * pow(along, 2.2) * 0.8 * vOn * (1.0 - uDim);
    if (a < 0.003) discard;
    gl_FragColor = vec4(uFg * a, a);
  }
`;

/** Arquibancadas e estrutura: silhueta escura, fileiras claras reveladas pela luz que vaza dos refletores. */
export const standFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uSignal;
  uniform vec3 uCamPos;
  uniform float uDim;
  uniform float uBase;
  uniform float uRows;
  varying vec3 vWorld;
  ${sectorLight}
  ${flares}
  void main() {
    vec3 p = vWorld;
    float lit = sectorSpill(p);
    float rows = uRows * step(0.58, fract(p.y * 1.35));
    vec3 color = mix(uBg, uFg, uBase) + uFg * lit * (0.06 + rows * 0.32);
    color += uSignal * flareGlow(p, 0.09) * 0.2;
    float far = smoothstep(90.0, 230.0, distance(p, uCamPos));
    color = mix(color, uBg, far * 0.85);
    color = mix(color, uBg, uDim * 0.6);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Linha de LED na borda interna da cobertura, acesa por setor. */
export const ledVertex = /* glsl */ `
  attribute float aSector;
  varying float vSector;
  void main() {
    vSector = aSector;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ledFragment = /* glsl */ `
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform float uLightOn[4];
  uniform float uDim;
  varying float vSector;
  void main() {
    int s = int(vSector + 0.5);
    float on = s == 0 ? uLightOn[0] : s == 1 ? uLightOn[1] : s == 2 ? uLightOn[2] : uLightOn[3];
    vec3 off = mix(uBg, uFg, 0.08);
    gl_FragColor = vec4(mix(off, uFg * 1.6, on * (1.0 - uDim * 0.7)), 1.0);
  }
`;

/** Telão: painel escuro com a grade de pixels e uma faixa de varredura lenta. */
export const screenFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uSignal;
  uniform float uDim;
  varying vec2 vUv;
  void main() {
    vec2 cell = vUv * vec2(120.0, 40.0);
    vec2 f = fract(cell) - 0.5;
    float px = 1.0 - smoothstep(0.25, 0.42, length(f));
    float scan = smoothstep(0.0, 0.08, 0.08 - abs(fract(vUv.y - uTime * 0.05) - 0.5) + 0.42);
    float band = 1.0 - smoothstep(0.0, 0.035, abs(vUv.y - 0.5 - 0.06 * sin(vUv.x * 6.0 + uTime * 0.6)));
    float level = 0.05 + 0.08 * scan + 0.35 * band;
    vec3 color = mix(uBg, uFg, 0.03) + uFg * px * level + uSignal * px * band * 0.25;
    float edge = step(0.012, vUv.x) * step(vUv.x, 0.988) * step(0.03, vUv.y) * step(vUv.y, 0.97);
    color = mix(mix(uBg, uFg, 0.12), color, edge);
    gl_FragColor = vec4(mix(color, uBg, uDim * 0.6), 1.0);
  }
`;

/**
 * Torcida: um ponto por torcedor, desenhado como silhueta (cabeça, ombros e, em
 * parte deles, braços levantados). Pula no ritmo, iluminada pelos sinalizadores.
 */
export const crowdVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uSignal;
  uniform float uDim;
  uniform float uTone;
  ${sectorLight}
  ${flares}
  varying vec3 vColor;
  varying float vArms;
  void main() {
    vec3 p = position;
    float beat = uTime * (2.1 + aSeed * 0.5) + aSeed * 6.2831;
    float jumper = step(0.45, fract(aSeed * 7.13));
    p.y += 0.95 + jumper * max(0.0, sin(beat)) * 0.38 + (1.0 - jumper) * sin(beat * 0.5) * 0.05;
    p.x += (1.0 - jumper) * sin(beat * 0.5) * 0.12;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = 2.1 * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
    // Luz pela posição no mundo: a mesma torcida é montada no estádio e no pênalti.
    vec3 w = (modelMatrix * vec4(p, 1.0)).xyz;
    float lit = sectorSpill(w) * 0.6;
    vColor = mix(uBg, uFg, uTone + lit * 0.22) + uSignal * flareGlow(w, 0.11) * 0.5;
    vColor = mix(vColor, uBg, uDim * 0.6);
    vArms = step(0.72, fract(aSeed * 13.7));
  }
`;

export const crowdFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vArms;
  void main() {
    vec2 q = gl_PointCoord;
    float head = 1.0 - step(0.11, length((q - vec2(0.5, 0.2)) * vec2(1.0, 0.9)));
    float body = step(0.31, q.y) * step(abs(q.x - 0.5), 0.19 - (q.y - 0.31) * 0.04);
    float arms = vArms * (step(abs(q.x - 0.27), 0.045) + step(abs(q.x - 0.73), 0.045)) * step(0.02, q.y) * step(q.y, 0.42);
    if (max(head, max(body, arms)) < 0.5) discard;
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

/** Bandeiras e bandeirões: o pano ondula a partir do mastro; listras alvinegras, sem escudo. */
export const flagVertex = /* glsl */ `
  uniform float uTime;
  uniform float uSeed;
  uniform float uSize;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vShade;
  void main() {
    vUv = uv;
    vec3 p = position;
    float t = uTime * 3.0 + uSeed;
    float wave = sin(uv.x * 5.0 - t) * 0.16 + sin(uv.x * 9.0 + uv.y * 3.0 - t * 1.4) * 0.05;
    p.z += wave * uv.x * uSize;
    p.y -= uv.x * uv.x * 0.06 * uSize;
    vShade = 0.75 + 0.25 * cos(uv.x * 5.0 - t);
    vec4 world = modelMatrix * vec4(p, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const flagFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uBg;
  uniform vec3 uSignal;
  uniform float uDim;
  uniform float uPattern;
  varying vec2 vUv;
  varying vec3 vWorld;
  varying float vShade;
  ${sectorLight}
  ${flares}
  void main() {
    float white;
    if (uPattern < 0.5) white = step(0.5, fract(vUv.x * 4.0));
    else if (uPattern < 1.5) white = 1.0 - step(abs(vUv.y - vUv.x * 0.8 - 0.1), 0.14);
    else white = step(abs(vUv.y - 0.5), 0.16);
    vec3 cloth = mix(mix(uBg, uFg, 0.06), mix(uBg, uFg, 0.85), white);
    float lit = 0.22 + sectorSpill(vWorld) * 0.7;
    vec3 color = cloth * lit * vShade + uSignal * flareGlow(vWorld, 0.1) * (0.35 + white * 0.5);
    gl_FragColor = vec4(mix(color, uBg, uDim * 0.6), 1.0);
  }
`;
