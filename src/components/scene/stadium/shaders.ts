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

/** Iluminação dos 4 cones de refletor num ponto do mundo (compartilhado por neblina e gramado). */
export const floodlights = /* glsl */ `
  uniform vec3 uLightPos[4];
  uniform vec3 uLightDir[4];
  uniform float uLightOn[4];
  uniform float uConeTan;
  float floodlight(vec3 p) {
    float light = 0.0;
    for (int i = 0; i < 4; i++) {
      vec3 v = p - uLightPos[i];
      float along = dot(v, uLightDir[i]);
      if (along > 0.0) {
        float perp = length(v - uLightDir[i] * along);
        float r = along * uConeTan;
        float beam = 1.0 - smoothstep(r * 0.45, r, perp);
        light += beam * exp(-along * 0.009) * uLightOn[i];
      }
    }
    return light;
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

/** Neblina volumétrica "falsa": camadas de planos com fBm, iluminadas pelos cones e pelo sinalizador. */
export const fogFragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uFg;
  uniform vec3 uSignal;
  uniform vec3 uFlarePos;
  uniform float uFlare;
  uniform float uOpacity;
  uniform float uFogMul;
  uniform float uDim;
  uniform float uSeed;
  varying vec3 vWorld;
  varying vec2 vUv;
  ${noise}
  ${floodlights}
  void main() {
    vec3 p = vWorld;
    float n = fbm(vec3(p.x * 0.03 + uTime * 0.025 + uSeed, p.y * 0.045 - uTime * 0.01, p.z * 0.02 + uSeed * 3.0));
    float density = smoothstep(-0.45, 0.75, n);
    density *= mix(1.0, 0.3, smoothstep(0.0, 42.0, p.y));

    float light = floodlight(p);
    float flareGlow = exp(-pow(distance(p, uFlarePos) * 0.06, 2.0)) * uFlare;

    vec3 color = uFg * (0.04 + light * 1.1) + uSignal * flareGlow * 2.2;
    float alpha = density * (0.012 + light * 0.3 + flareGlow * 0.7) * uOpacity * uFogMul * (1.0 - uDim);
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

/** Fumaça do sinalizador: partículas que sobem e abrem, vermelhas na base e cinzas no alto. */
export const smokeVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uFlarePos;
  uniform float uScale;
  varying float vT;
  varying float vSeed;
  void main() {
    float t = fract(uTime * (0.045 + aSeed * 0.035) + aSeed);
    vec3 p = uFlarePos;
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
  uniform int uIndex;
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
    float body = pow(facing, 2.0);
    float fall = pow(1.0 - along, 1.6) * smoothstep(0.0, 0.04, along);
    float dust = 0.65 + 0.35 * snoise(vWorld * 0.06 + vec3(0.0, -uTime * 0.15, uTime * 0.05));
    float ground = smoothstep(0.0, 4.0, vWorld.y);
    float a = body * fall * dust * ground * uStrength * uLightOn[uIndex] * (1.0 - uDim * 0.8);
    gl_FragColor = vec4(uFg, a);
  }
`;

/** Brilho pontual: cabeças dos refletores e o núcleo do sinalizador. */
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
    // aLight: índice do refletor (0-3) ou 4 para o sinalizador (sempre aceso).
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
