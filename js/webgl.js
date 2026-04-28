// ============================================================
// THREE.JS SETUP — Cinematic 3D world
// ============================================================
const canvas = document.getElementById('webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x06070A, 1);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x06070A, 0.04);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 10);

// Lights
scene.add(new THREE.AmbientLight(0x404040, 0.5));
const keyLight = new THREE.DirectionalLight(0xFF4500, 1.5);
keyLight.position.set(5, 5, 5);
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x4DEEEA, 2, 20);
rimLight.position.set(-5, -2, 3);
scene.add(rimLight);
const topLight = new THREE.PointLight(0xC9A961, 1, 15);
topLight.position.set(0, 8, 0);
scene.add(topLight);

// ====================================================
// CUSTOM SHADER MATERIAL — distorted, fresnel, animated
// ====================================================
const vertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform float uScroll;
  uniform float uHover;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
  float snoise(vec3 v){
    const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
    vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
    vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g;
    vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
    vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
    i=mod289(i);
    vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
    float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
    vec4 j=p-49.0*floor(p*ns.z*ns.z);
    vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
    vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy;
    vec4 h=1.0-abs(x)-abs(y);
    vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
    vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0;
    vec4 sh=-step(h,vec4(0.0));
    vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
    vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y);
    vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
    vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
    p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
    vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
    m=m*m; return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    float t = uTime * 0.4;
    float n1 = snoise(position * 1.2 + vec3(t));
    float n2 = snoise(position * 2.5 - vec3(t * 0.7)) * 0.4;
    float displacement = (n1 + n2) * (0.4 + uScroll * 0.4 + uHover * 0.3);
    vec3 newPos = position + normal * displacement;
    vPos = newPos;
    vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying vec3 vWorldPos;
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
    fresnel = pow(fresnel, 1.8);

    float wave = sin(vPos.y * 3.0 + uTime * 0.8) * 0.5 + 0.5;
    float wave2 = cos(vPos.x * 2.0 - uTime * 0.5) * 0.5 + 0.5;

    vec3 base = mix(uColorA, uColorB, wave);
    base = mix(base, uColorC, wave2 * 0.4);

    vec3 rim = mix(uColorB, vec3(1.0), fresnel);
    vec3 finalColor = mix(base, rim, fresnel * 0.9);

    float coreGlow = pow(1.0 - fresnel, 4.0) * 0.3;
    finalColor += uColorA * coreGlow;

    gl_FragColor = vec4(finalColor, 0.92);
  }
`;

const shaderUniforms = {
  uTime:   { value: 0 },
  uScroll: { value: 0 },
  uHover:  { value: 0 },
  uColorA: { value: new THREE.Color('#FF4500') },
  uColorB: { value: new THREE.Color('#4DEEEA') },
  uColorC: { value: new THREE.Color('#C9A961') },
};

const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader, fragmentShader,
  uniforms: shaderUniforms,
  transparent: true,
});

// CENTRAL OBJECT — high-poly icosahedron with shader
const centralObject = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.6, 80),
  shaderMaterial
);
scene.add(centralObject);

// Wireframe cage outside
const cage = new THREE.Mesh(
  new THREE.IcosahedronGeometry(2.6, 1),
  new THREE.MeshBasicMaterial({ color: 0xFF4500, wireframe: true, transparent: true, opacity: 0.12 })
);
scene.add(cage);

// Outer ring — torus that orbits
const ring = new THREE.Mesh(
  new THREE.TorusGeometry(3.2, 0.015, 16, 200),
  new THREE.MeshBasicMaterial({ color: 0x4DEEEA, transparent: true, opacity: 0.5 })
);
ring.rotation.x = Math.PI / 2;
scene.add(ring);

const ring2 = new THREE.Mesh(
  new THREE.TorusGeometry(3.6, 0.008, 16, 200),
  new THREE.MeshBasicMaterial({ color: 0xC9A961, transparent: true, opacity: 0.4 })
);
scene.add(ring2);

// FLOATING SATELLITES — small geometric shapes orbiting
const satellites = [];
const satGeometries = [
  new THREE.OctahedronGeometry(0.15),
  new THREE.TetrahedronGeometry(0.18),
  new THREE.BoxGeometry(0.2, 0.2, 0.2),
  new THREE.IcosahedronGeometry(0.14),
];
const satColors = [0xFF4500, 0x4DEEEA, 0xC9A961, 0xEDE8DC];
for (let i = 0; i < 12; i++) {
  const geo = satGeometries[i % satGeometries.length];
  const mat = new THREE.MeshStandardMaterial({
    color: satColors[i % satColors.length],
    metalness: 0.8,
    roughness: 0.2,
    emissive: satColors[i % satColors.length],
    emissiveIntensity: 0.2,
  });
  const sat = new THREE.Mesh(geo, mat);
  const angle = (i / 12) * Math.PI * 2;
  const radius = 4 + Math.random() * 2;
  sat.userData = {
    angle, radius,
    speedY: 0.2 + Math.random() * 0.3,
    yOffset: (Math.random() - 0.5) * 4,
    rotSpeed: { x: Math.random() * 0.02, y: Math.random() * 0.02 },
  };
  scene.add(sat);
  satellites.push(sat);
}

// PARTICLE FIELD — depth and atmosphere
const particleGeo = new THREE.BufferGeometry();
const particleCount = 2000;
const particlePositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);
const colorPalette = [
  new THREE.Color(0xFF4500),
  new THREE.Color(0x4DEEEA),
  new THREE.Color(0xC9A961),
  new THREE.Color(0xEDE8DC),
];
for (let i = 0; i < particleCount; i++) {
  const r = 8 + Math.random() * 30;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  particlePositions[i*3]   = r * Math.sin(phi) * Math.cos(theta);
  particlePositions[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
  particlePositions[i*3+2] = r * Math.cos(phi);
  const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
  particleColors[i*3] = c.r; particleColors[i*3+1] = c.g; particleColors[i*3+2] = c.b;
}
particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
const particleMat = new THREE.PointsMaterial({
  size: 0.04, transparent: true, opacity: 0.7,
  sizeAttenuation: true, vertexColors: true,
  blending: THREE.AdditiveBlending,
});
const particles = new THREE.Points(particleGeo, particleMat);
scene.add(particles);

// GRID FLOOR — adds depth and architecture
const gridHelper = new THREE.GridHelper(40, 40, 0xFF4500, 0xFF4500);
gridHelper.position.y = -4;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.12;
scene.add(gridHelper);

// ====================================================
// SCROLL-DRIVEN CAMERA "FILM" — 4 cinematic chapters
// ====================================================
const cameraStates = [
  { pos: [0, 0, 10],   look: [0, 0, 0],   objPos: [3, 0, 0],    objScale: 1.0, label: 'APPROACH'  },
  { pos: [-4, -1, 7],  look: [0, 0, 0],   objPos: [0, -0.5, 0], objScale: 1.2, label: 'ORBIT'     },
  { pos: [3, 3, 5],    look: [0, 0, 0],   objPos: [-1, 0, 0],   objScale: 1.4, label: 'ENTER'     },
  { pos: [0, 1, 14],   look: [0, 0, -2],  objPos: [0, 1, -3],   objScale: 0.7, label: 'TRANSCEND' },
];

let scrollProgress = 0;
let currentChapter = 0;

// Called by main.js after lenis is created
function setupWebGLScroll(lenis) {
  lenis.on('scroll', ({ progress }) => {
    scrollProgress = progress;
    shaderUniforms.uScroll.value = progress;
    document.getElementById('hud-scroll').textContent = `${Math.round(progress * 100)}%`;

    const ch = Math.min(3, Math.floor(progress * 4));
    if (ch !== currentChapter) {
      currentChapter = ch;
      document.getElementById('hud-chapter').textContent = String(ch + 1).padStart(2, '0');
      document.getElementById('hud-scene').textContent = `SCENE — ${cameraStates[ch].label}`;
    }
  });
}

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpVec3(a, b, t) {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function getCameraState(progress) {
  const total = cameraStates.length - 1;
  const segment = progress * total;
  const i = Math.min(total - 1, Math.floor(segment));
  const localT = segment - i;
  const easedT = localT * localT * (3 - 2 * localT);
  const a = cameraStates[i];
  const b = cameraStates[i + 1];
  return {
    pos:      lerpVec3(a.pos, b.pos, easedT),
    look:     lerpVec3(a.look, b.look, easedT),
    objPos:   lerpVec3(a.objPos, b.objPos, easedT),
    objScale: lerp(a.objScale, b.objScale, easedT),
  };
}

// Mouse parallax
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5);
  mouseY = (e.clientY / window.innerHeight - 0.5);
});

// Animation loop
const clock = new THREE.Clock();
const lookTarget = new THREE.Vector3();

function animate() {
  const t = clock.getElapsedTime();
  shaderUniforms.uTime.value = t;

  const state = getCameraState(scrollProgress);

  const targetCamX = state.pos[0] + mouseX * 0.6;
  const targetCamY = state.pos[1] - mouseY * 0.6;
  camera.position.x += (targetCamX - camera.position.x) * 0.06;
  camera.position.y += (targetCamY - camera.position.y) * 0.06;
  camera.position.z += (state.pos[2] - camera.position.z) * 0.06;
  lookTarget.set(state.look[0], state.look[1], state.look[2]);
  camera.lookAt(lookTarget);

  centralObject.position.x += (state.objPos[0] - centralObject.position.x) * 0.06;
  centralObject.position.y += (state.objPos[1] - centralObject.position.y) * 0.06;
  centralObject.position.z += (state.objPos[2] - centralObject.position.z) * 0.06;
  const targetScale = state.objScale;
  centralObject.scale.x += (targetScale - centralObject.scale.x) * 0.08;
  centralObject.scale.y = centralObject.scale.x;
  centralObject.scale.z = centralObject.scale.x;

  centralObject.rotation.y = t * 0.15;
  centralObject.rotation.x = t * 0.1;

  cage.position.copy(centralObject.position);
  cage.scale.copy(centralObject.scale);
  cage.rotation.y = -t * 0.08;
  cage.rotation.x = t * 0.05;

  ring.position.copy(centralObject.position);
  ring.scale.copy(centralObject.scale);
  ring.rotation.z = t * 0.3;
  ring.rotation.x = Math.PI / 2 + Math.sin(t * 0.4) * 0.3;

  ring2.position.copy(centralObject.position);
  ring2.scale.copy(centralObject.scale);
  ring2.rotation.x = t * 0.2;
  ring2.rotation.y = t * 0.15;

  satellites.forEach((sat) => {
    const u = sat.userData;
    u.angle += u.speedY * 0.005;
    sat.position.x = centralObject.position.x + Math.cos(u.angle) * u.radius;
    sat.position.z = centralObject.position.z + Math.sin(u.angle) * u.radius;
    sat.position.y = centralObject.position.y + u.yOffset + Math.sin(t * u.speedY) * 0.3;
    sat.rotation.x += u.rotSpeed.x;
    sat.rotation.y += u.rotSpeed.y;
  });

  particles.rotation.y = t * 0.015;
  particles.rotation.x = Math.sin(t * 0.05) * 0.1;

  gridHelper.material.opacity = 0.08 + Math.sin(t * 0.5) * 0.04;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ============================================================
// THEME-AWARE SCENE COLORS
// Called by main.js whenever the user toggles light/dark.
// All scene objects already live at module scope (renderer, scene,
// particles, satellites, ring, ring2, cage, gridHelper) so we can
// mutate their materials/uniforms directly without hoisting.
// ============================================================
window.updateSceneColors = function ({ bg, particle, ring: ringHex, satellite, gridColor }) {
  // Background + atmospheric fog match the page background
  if (typeof bg === 'number') {
    renderer.setClearColor(bg, 1);
    if (scene.fog && scene.fog.color) scene.fog.color.setHex(bg);
  }

  // Particle field — per-vertex color buffer must be rewritten because
  // PointsMaterial uses vertexColors:true, which overrides material.color
  if (typeof particle === 'number' && particles && particles.geometry) {
    const colorAttr = particles.geometry.getAttribute('color');
    if (colorAttr) {
      const c = new THREE.Color(particle);
      for (let i = 0; i < colorAttr.count; i++) {
        colorAttr.setXYZ(i, c.r, c.g, c.b);
      }
      colorAttr.needsUpdate = true;
    }
  }

  // Orbit rings + wireframe cage share the accent color
  if (typeof ringHex === 'number') {
    if (ring && ring.material)  ring.material.color.setHex(ringHex);
    if (ring2 && ring2.material) ring2.material.color.setHex(ringHex);
    if (cage && cage.material)  cage.material.color.setHex(ringHex);
  }

  // Floating satellites — color + emissive so they read on either bg
  if (typeof satellite === 'number' && Array.isArray(satellites)) {
    satellites.forEach((sat) => {
      if (!sat.material) return;
      sat.material.color.setHex(satellite);
      if (sat.material.emissive) sat.material.emissive.setHex(satellite);
    });
  }

  // Grid floor lines — GridHelper uses vertex colors internally, so we
  // rewrite the geometry's color attribute, not the material color.
  if (typeof gridColor === 'number' && gridHelper && gridHelper.geometry) {
    const gColor = gridHelper.geometry.getAttribute('color');
    if (gColor) {
      const c = new THREE.Color(gridColor);
      for (let i = 0; i < gColor.count; i++) {
        gColor.setXYZ(i, c.r, c.g, c.b);
      }
      gColor.needsUpdate = true;
    } else if (gridHelper.material) {
      gridHelper.material.color.setHex(gridColor);
    }
  }
};
