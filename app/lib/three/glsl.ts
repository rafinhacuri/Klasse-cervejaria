const noise = `
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  vec2 hash2(vec2 p) {
    float n = hash(p);
    return vec2(n, hash(p + n * 31.7));
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float total = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      total += noise(p) * amplitude;
      p = p * 2.03 + 17.1;
      amplitude *= 0.5;
    }
    return total;
  }

  vec2 voronoi(vec2 p, float time) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    float f1 = 8.0;
    float f2 = 8.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 seed = hash2(cell + offset);
        vec2 point = 0.5 + 0.45 * sin(time + 6.2831 * seed);
        vec2 delta = offset + point - local;
        float d = dot(delta, delta);
        if (d < f1) {
          f2 = f1;
          f1 = d;
        } else if (d < f2) {
          f2 = d;
        }
      }
    }
    return vec2(sqrt(f1), sqrt(f2));
  }
`

const fullscreenVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const rippleFragment = `
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform vec2 uPointer;
  uniform vec2 uPointerPrev;
  uniform float uPointerForce;
  uniform vec3 uDrop;
  uniform float uSlosh;
  varying vec2 vUv;

  float segment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
    return length(pa - ba * h);
  }

  void main() {
    vec4 state = texture2D(uState, vUv);
    float left = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r;
    float right = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r;
    float down = texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
    float up = texture2D(uState, vUv + vec2(0.0, uTexel.y)).r;

    float next = (left + right + down + up) * 0.5 - state.g;
    next *= 0.984;

    vec2 aspect = vec2(uAspect, 1.0);
    float trail = segment(vUv * aspect, uPointerPrev * aspect, uPointer * aspect);
    next += uPointerForce * (1.0 - smoothstep(0.0, 0.03, trail));

    float drop = length((vUv - uDrop.xy) * aspect);
    next -= uDrop.z * (1.0 - smoothstep(0.0, 0.01, drop));

    next += uSlosh * (1.0 - smoothstep(0.0, 0.05, vUv.y));
    next -= uSlosh * (1.0 - smoothstep(0.0, 0.05, 1.0 - vUv.y));

    gl_FragColor = vec4(clamp(next, -4.0, 4.0), state.r, 0.0, 1.0);
  }
`

const beerFragment = `
  uniform sampler2D uState;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uResolution;
  uniform float uTime;
  uniform vec3 uBeer;
  uniform vec3 uDeep;
  uniform vec3 uFoam;
  uniform float uHaze;
  uniform float uDim;
  uniform float uCrown;
  varying vec2 vUv;

  ${noise}

  const vec3 LIGHT = vec3(-0.42, 0.52, 0.74);
  const vec3 WARM = vec3(1.0, 0.94, 0.82);

  float caustic(vec2 p, float time) {
    vec2 cells = voronoi(p, time);
    return pow(1.0 - smoothstep(0.0, 0.16, cells.y - cells.x), 2.0);
  }

  float rising(vec2 p, float time) {
    float total = 0.0;
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 14.0 : 26.0;
      vec2 q = p * scale + vec2(0.0, float(layer) * 7.3);
      vec2 seed = hash2(floor(q) + float(layer) * 19.0);
      if (seed.x < 0.72) continue;
      vec2 local = fract(q) - 0.5;
      float life = fract(time * (0.18 + seed.y * 0.3) + seed.x * 9.0);
      vec2 drift = vec2(sin(time * 1.3 + seed.x * 40.0), cos(time * 1.1 + seed.y * 40.0)) * 0.06;
      vec2 center = (seed - 0.5) * 0.5 + drift;
      float size = mix(0.05, 0.13, seed.y) * smoothstep(0.0, 0.25, life) * (1.0 - smoothstep(0.82, 1.0, life));
      float d = length(local - center);
      float rim = smoothstep(size, size * 0.7, d) * smoothstep(size * 0.25, size * 0.7, d);
      float glint = smoothstep(size * 0.32, 0.0, length(local - center + vec2(size * 0.32, -size * 0.32)));
      total += rim * 0.3 + glint * 0.7;
    }
    return total;
  }

  float fizz(vec2 p, float time) {
    vec2 q = p * 110.0 + vec2(0.0, time * 0.6);
    vec2 seed = hash2(floor(q));
    if (seed.x < 0.86) return 0.0;
    float blink = smoothstep(0.0, 0.3, fract(time * (0.4 + seed.y) + seed.x * 13.0));
    blink *= 1.0 - smoothstep(0.6, 1.0, fract(time * (0.4 + seed.y) + seed.x * 13.0));
    vec2 local = fract(q) - 0.5 - (seed - 0.5) * 0.5;
    return smoothstep(0.16, 0.0, length(local)) * blink;
  }

  vec2 domes(vec2 p, float density, float smallest, float largest) {
    vec2 cell = floor(p);
    vec2 local = fract(p);
    float height = 0.0;
    float rim = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 seed = hash2(cell + offset + 3.7);
        if (seed.x > density) continue;
        vec2 center = offset + 0.2 + 0.6 * hash2(cell + offset + 11.3) - local;
        float radius = mix(smallest, largest, seed.y);
        float d = length(center) / radius;
        if (d < 1.0) {
          height = max(height, sqrt(1.0 - d * d));
          rim = max(rim, smoothstep(0.7, 0.98, d));
        }
      }
    }
    return vec2(height, rim);
  }

  vec3 foam(vec2 p, vec3 liquid, float t) {
    vec2 flow = p + vec2(t * 0.004, -t * 0.003);
    float sparse = smoothstep(0.45, 0.75, fbm(flow * 6.0 + 9.0));
    vec2 large = domes(flow * 30.0, 0.16 + 0.28 * sparse, 0.16, 0.42);
    vec2 medium = domes(flow * 72.0 + 5.0, 0.45, 0.3, 0.5);
    float micro = noise(flow * 150.0) * 0.55 + noise(flow * 310.0) * 0.45;
    float lumps = fbm(flow * 8.0 + 2.0);

    float height = lumps * 1.1 + micro * 0.08 + medium.x * 0.18 + large.x * 0.4;
    vec2 slope = vec2(dFdx(height), dFdy(height)) * uResolution * 0.006;
    vec3 n = normalize(vec3(-clamp(slope, -1.5, 1.5), 1.0));

    float diffuse = clamp(dot(n, LIGHT), 0.0, 1.0);
    float cavity = smoothstep(0.2, 0.8, lumps);
    vec3 cream = mix(uFoam, uFoam * mix(vec3(1.0), uBeer, 0.35), 1.0 - cavity);
    vec3 color = cream * (0.76 + 0.2 * diffuse + 0.05 * micro);
    color *= 1.0 - medium.y * 0.06;

    float film = smoothstep(0.0, 0.08, large.x);
    vec3 inside = mix(cream * 0.88, liquid, 0.1) * (0.84 + 0.16 * diffuse);
    color = mix(color, inside, film * (1.0 - large.y) * 0.45);
    color *= 1.0 - large.y * 0.18;
    float highlight = pow(max(dot(n, normalize(LIGHT + vec3(0.0, 0.0, 1.0))), 0.0), 60.0);
    color += WARM * highlight * (0.08 + film * 0.55);
    return color;
  }

  vec2 raft(vec2 p) {
    float height = domes(p, 0.32, 0.32, 0.55).x;
    float inside = smoothstep(0.0, 0.05, height);
    float d = sqrt(max(1.0 - height * height, 0.0));
    float ring = smoothstep(0.72, 0.94, d) * inside;
    float glint = smoothstep(0.94, 0.99, height);
    return vec2(ring, glint);
  }

  void main() {
    float left = texture2D(uState, vUv - vec2(uTexel.x, 0.0)).r;
    float right = texture2D(uState, vUv + vec2(uTexel.x, 0.0)).r;
    float down = texture2D(uState, vUv - vec2(0.0, uTexel.y)).r;
    float up = texture2D(uState, vUv + vec2(0.0, uTexel.y)).r;

    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float t = uTime;
    vec2 shimmer = vec2(noise(p * 46.0 + t * 0.7), noise(p * 46.0 - t * 0.6 + 7.0)) - 0.5;
    vec3 normal = normalize(vec3((left - right) * 1.6 + shimmer.x * 0.07, (down - up) * 1.6 + shimmer.y * 0.07, 1.0));

    vec2 bent = p + normal.xy * 0.05;
    float radius = 0.5 * length(vec2(uAspect, 1.0));
    float r = length(p) / radius;
    float depth = smoothstep(0.0, 1.0, r);

    vec3 heart = mix(uBeer, uDeep, 0.38);
    vec3 liquid = mix(heart, uDeep, pow(depth, 1.4) * 0.9);
    liquid *= 0.86 + 0.28 * fbm(bent * 2.2 + vec2(t * 0.015, t * 0.01));
    liquid *= 0.92 + 0.12 * fbm(bent * 7.0 - t * 0.03);

    float base = length(bent) / radius;
    float rings = smoothstep(0.02, 0.0, abs(base - 0.52)) * 0.5 + smoothstep(0.035, 0.0, abs(base - 0.6)) * 0.25;
    liquid += uBeer * rings * 0.18 * (1.0 - uHaze);
    liquid += uBeer * smoothstep(0.32, 0.0, base) * 0.12;

    vec2 cp = bent * 5.5;
    cp += 0.9 * vec2(fbm(cp * 0.35 + t * 0.05), fbm(cp * 0.35 - t * 0.05 + 4.0));
    float light = caustic(cp, t * 0.5) * caustic(cp * 1.3 + 2.7, -t * 0.4) * 1.6;
    float pool = 0.6 + 0.4 * fbm(bent * 1.4 - t * 0.03);
    liquid += uBeer * light * pool * (1.0 - depth * 0.85) * 0.55 * (1.0 - uHaze * 0.75);

    vec3 cloud = mix(uBeer, uFoam, 0.25) * (0.75 - depth * 0.35);
    liquid = mix(liquid, cloud, uHaze * (0.35 + 0.15 * fbm(bent * 3.0 + t * 0.05)));

    liquid += mix(uFoam, vec3(1.0), 0.5) * rising(bent, t) * 0.55;
    liquid += WARM * fizz(bent, t) * 0.35 * (1.0 - depth * 0.5);

    float crown = 1.0 - uCrown;
    float wander = (fbm(p * 5.0 + t * 0.03) - 0.5) * 0.14 + (fbm(p * 22.0 - t * 0.02) - 0.5) * 0.04;
    float scallop = (domes(p * 30.0, 0.7, 0.3, 0.55).x - 0.5) * 0.025;
    float edge = r + wander + scallop;
    float edgeWidth = fwidth(edge) * 1.2;
    float drift = fbm(p * 3.6 + vec2(t * 0.025, -t * 0.018) + normal.xy * 0.6);
    float sparse = (1.0 - smoothstep(0.2, 0.8, r)) * 0.14;
    float islandEdge = drift + scallop - sparse;
    float islandWidth = fwidth(islandEdge) * 1.2 + 0.002;
    float island = smoothstep(0.67 - islandWidth, 0.67 + islandWidth, islandEdge);
    float ring = smoothstep(crown - edgeWidth, crown + edgeWidth, edge);
    float foamMask = max(ring, island);

    float band = smoothstep(0.55, 0.62, islandEdge) * (1.0 - smoothstep(0.64, 0.67, islandEdge));
    band = max(band, smoothstep(crown - 0.07, crown - 0.01, edge) * (1.0 - ring));
    vec2 bubbleRaft = raft(p * 120.0 + vec2(t * 0.4, -t * 0.3)) * band;

    liquid *= 1.0 - 0.45 * smoothstep(crown - 0.08, crown, edge);
    liquid *= 1.0 - 0.12 * smoothstep(0.6, 0.68, drift) * (1.0 - island);
    float meniscus = smoothstep(crown - 0.012, crown, edge) * (1.0 - ring);
    liquid += WARM * meniscus * 0.35;
    liquid = mix(liquid, uFoam * 0.92, bubbleRaft.x * 0.45);
    liquid += WARM * bubbleRaft.y * 0.6;

    vec3 head = foam(p, liquid, t);
    head *= 0.84 + 0.16 * max(smoothstep(crown, crown + 0.22, edge), smoothstep(0.67, 0.71, islandEdge));

    vec3 color = mix(liquid, head, foamMask);

    vec3 halfway = normalize(LIGHT + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(normal, halfway), 0.0), 220.0);
    float sheen = clamp(dot(normal.xy, vec2(-0.45, 0.6)) * 2.6, 0.0, 1.0);
    color += (spec * 0.9 + sheen * 0.28) * WARM * (1.0 - foamMask);

    color *= 1.0 - smoothstep(0.55, 1.3, r) * 0.4;
    color *= 1.0 - uDim * 0.74;
    color += (hash(vUv * 913.7 + fract(t)) - 0.5) * 0.018;

    gl_FragColor = vec4(max(color, 0.0), 1.0);
    #include <colorspace_fragment>
  }
`

const liquidVertex = `
  varying vec3 vLocal;
  varying vec3 vNormal;

  void main() {
    vLocal = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const liquidFragment = `
  uniform float uLevel;
  uniform float uFoam;
  uniform vec2 uTilt;
  uniform float uTime;
  uniform float uFizz;
  uniform vec3 uBeer;
  uniform vec3 uDeep;
  uniform vec3 uFoamColor;
  varying vec3 vLocal;
  varying vec3 vNormal;

  ${noise}

  float rising(vec3 p, float time) {
    float angle = atan(p.z, p.x) + length(p.xz) * 1.4;
    float column = floor(angle * 9.0);
    float speed = 1.4 + hash(vec2(column, 3.0)) * 1.6;
    vec2 q = vec2(angle * 9.0, p.y * 16.0 - time * speed * 4.0);
    vec2 local = fract(q) - 0.5;
    vec2 seed = hash2(floor(q));
    if (seed.x < 0.55 || hash(vec2(column, 9.0)) < 0.45) return 0.0;
    vec2 center = vec2((hash(vec2(column, 1.0)) - 0.5) * 0.5, (seed.y - 0.5) * 0.4);
    float d = length((local - center) * vec2(1.0, 1.4));
    return smoothstep(0.12, 0.05, d) * 0.6 + smoothstep(0.06, 0.0, d);
  }

  void main() {
    float ripple = sin(vLocal.x * 9.0 + uTime * 4.0) * sin(vLocal.z * 8.0 - uTime * 3.2) * 0.012 * (0.4 + uFizz);
    float surface = uLevel + vLocal.x * uTilt.x + vLocal.z * uTilt.y + ripple;
    if (uLevel <= 0.02 || vLocal.y > surface) discard;

    float foamLine = surface - uFoam;
    float grain = noise(vLocal.xz * 22.0 + uTime * 0.2) * 0.5 + noise(vLocal.xz * 60.0) * 0.5;
    vec3 color;

    if (!gl_FrontFacing) {
      color = uFoam > 0.015 ? uFoamColor * (0.82 + 0.18 * grain) : mix(uBeer, uDeep, 0.4);
    } else if (vLocal.y > foamLine) {
      float angle = atan(vLocal.z, vLocal.x);
      float cells = noise(vec2(angle * 18.0, vLocal.y * 40.0)) * 0.5 + noise(vec2(angle * 40.0, vLocal.y * 90.0)) * 0.5;
      float settle = smoothstep(foamLine, foamLine + 0.05, vLocal.y);
      color = uFoamColor * (0.7 + 0.22 * cells) * mix(0.82, 1.0, settle);
    } else {
      vec3 n = normalize(vNormal);
      float facing = abs(n.z);
      color = mix(uDeep, uBeer * 1.18, pow(facing, 1.4));
      color *= 0.72 + 0.28 * smoothstep(0.0, 2.4, vLocal.y);
      color *= 0.9 + 0.2 * noise(vec2(atan(vLocal.z, vLocal.x) * 3.0, vLocal.y * 2.0 - uTime * 0.3));
      color += uBeer * pow(1.0 - facing, 3.0) * 0.35;
      color += uBeer * smoothstep(0.55, 1.0, facing) * smoothstep(0.3, 0.0, abs(vLocal.x + 0.25)) * 0.25;
      float depthBelowFoam = foamLine - vLocal.y;
      color = mix(color, uFoamColor * 0.75, smoothstep(0.06, 0.0, depthBelowFoam) * 0.35);
      color += vec3(1.0, 0.95, 0.85) * rising(vLocal, uTime) * (0.35 + uFizz * 0.3) * facing;
    }

    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const frostFragment = `
  uniform float uLevel;
  uniform float uCold;
  uniform float uTime;
  varying vec3 vLocal;
  varying vec3 vNormal;

  ${noise}

  float droplets(vec2 q) {
    vec2 cell = floor(q);
    vec2 local = fract(q);
    float total = 0.0;
    for (int y = -1; y <= 1; y++) {
      for (int x = -1; x <= 1; x++) {
        vec2 offset = vec2(float(x), float(y));
        vec2 seed = hash2(cell + offset);
        if (seed.x < 0.35) continue;
        vec2 center = offset + 0.2 + 0.6 * hash2(cell + offset + 7.1) - local;
        float radius = mix(0.12, 0.38, seed.y * seed.y);
        float d = length(center * vec2(1.0, 0.85)) / radius;
        total = max(total, smoothstep(1.0, 0.7, d) * (0.55 + 0.45 * smoothstep(0.6, 0.0, length(center + vec2(0.35, -0.35) * radius) / radius)));
      }
    }
    return total;
  }

  void main() {
    float edge = uLevel + (noise(vec2(atan(vLocal.z, vLocal.x) * 6.0, uTime * 0.2)) - 0.5) * 0.05;
    float below = smoothstep(edge + 0.05, edge - 0.1, vLocal.y) * uCold;
    if (below < 0.005) discard;

    float angle = atan(vLocal.z, vLocal.x);
    vec2 q = vec2(angle * 26.0, vLocal.y * 30.0);
    float fine = droplets(q * 1.6 + 3.0);
    float large = droplets(q * 0.7);
    float fog = 0.1 + 0.08 * noise(q * 0.2);
    float facing = abs(normalize(vNormal).z);

    vec3 color = vec3(0.88, 0.91, 0.95) * (0.7 + 0.3 * facing);
    float alpha = (fog + fine * 0.14 + large * 0.4) * below;
    color += vec3(1.0) * large * 0.35;

    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.85));
    #include <colorspace_fragment>
  }
`

const hoseVertex = `
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const hoseFragment = `
  uniform float uTime;
  uniform float uFront;
  uniform float uTail;
  uniform vec3 uBeer;
  uniform vec3 uDeep;
  varying vec2 vUv;
  varying vec3 vNormal;

  ${noise}

  void main() {
    if (vUv.x > uFront || vUv.x < uTail) discard;
    float facing = abs(normalize(vNormal).z);
    vec2 q = vec2(vUv.x * 90.0 - uTime * 14.0, vUv.y * 6.0);
    vec2 seed = hash2(floor(q));
    vec2 local = fract(q) - 0.5 - (seed - 0.5) * 0.4;
    float bubble = seed.x > 0.7 ? smoothstep(0.22, 0.08, length(local * vec2(1.0, 1.6))) : 0.0;
    vec3 color = mix(uDeep, uBeer * 1.25, pow(facing, 1.3));
    color += vec3(1.0, 0.94, 0.8) * (bubble * 0.5 + pow(facing, 14.0) * 0.4);
    gl_FragColor = vec4(color, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

const roomVertex = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const roomFragment = `
  uniform float uTime;
  uniform float uAspect;
  uniform vec3 uGlow;
  uniform vec3 uDark;
  varying vec2 vUv;

  ${noise}

  float bokeh(vec2 p, float time) {
    float total = 0.0;
    for (int i = 0; i < 14; i++) {
      float fi = float(i);
      vec2 seed = hash2(vec2(fi, fi * 3.1));
      vec2 center = vec2(seed.x * 2.0 - 1.0, seed.y * 0.9 - 0.05);
      center.x += sin(time * 0.1 + fi) * 0.02;
      float size = mix(0.04, 0.11, hash(vec2(fi * 7.0, 1.0)));
      float d = length((p - center) * vec2(uAspect, 1.0));
      float disc = smoothstep(size, size * 0.86, d);
      float flicker = 0.75 + 0.25 * sin(time * (0.6 + seed.x) + fi * 4.0);
      total += disc * mix(0.18, 0.45, seed.y) * flicker;
    }
    return total;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float glow = exp(-dot(p * vec2(1.2, 1.6), p * vec2(1.2, 1.6)) * 1.6);
    vec3 color = mix(uDark, uGlow, glow * 0.9);
    color += uGlow * bokeh(p, uTime) * (0.4 + 0.6 * smoothstep(-0.2, 0.6, p.y));
    color += (hash(vUv * 731.0 + fract(uTime)) - 0.5) * 0.012;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`

const counterFragment = `
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    float r = length(vUv - 0.5) * 2.0;
    float shadow = exp(-r * r * 90.0) * 0.75 + exp(-r * r * 22.0) * 0.35;
    vec3 color = uColor * (1.0 - shadow);
    float alpha = (1.0 - smoothstep(0.15, 1.0, r)) * 0.95;
    gl_FragColor = vec4(color, max(alpha, shadow));
    #include <colorspace_fragment>
  }
`

export {
  beerFragment,
  counterFragment,
  frostFragment,
  fullscreenVertex,
  hoseFragment,
  hoseVertex,
  liquidFragment,
  liquidVertex,
  noise,
  rippleFragment,
  roomFragment,
  roomVertex,
}
