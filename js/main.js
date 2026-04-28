gsap.registerPlugin(ScrollTrigger);

// ============================================================
// LENIS SMOOTH SCROLL
// ============================================================
const lenis = new Lenis({
  duration: 1.6,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  wheelMultiplier: 1,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// Wire lenis into the WebGL scroll handler (defined in webgl.js)
setupWebGLScroll(lenis);

// ============================================================
// THEME TOGGLE
// Persists choice in localStorage and pushes the active palette
// into the WebGL scene via window.updateSceneColors (webgl.js).
// ============================================================
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon      = document.getElementById('theme-icon');
const themeLabel     = document.getElementById('theme-label');
const htmlEl         = document.documentElement;

const THEME_COLORS = {
  dark: {
    bg:        0x06070A,
    particle:  0xFF4500,
    ring:      0xFF4500,
    satellite: 0xEDE8DC,
    gridColor: 0xEDE8DC,
    icon:      '◑',
    label:     'LIGHT',
  },
  light: {
    bg:        0xF2EFE8,
    particle:  0xD63A00,
    ring:      0xD63A00,
    satellite: 0x0F0F0E,
    gridColor: 0x0F0F0E,
    icon:      '●',
    label:     'DARK',
  },
};

function applyTheme(theme, animate) {
  const palette = THEME_COLORS[theme] || THEME_COLORS.dark;
  htmlEl.setAttribute('data-theme', theme);

  if (themeIcon)  themeIcon.textContent  = palette.icon;
  if (themeLabel) themeLabel.textContent = palette.label;

  if (typeof window.updateSceneColors === 'function') {
    window.updateSceneColors({
      bg:        palette.bg,
      particle:  palette.particle,
      ring:      palette.ring,
      satellite: palette.satellite,
      gridColor: palette.gridColor,
    });
  }

  if (animate && typeof gsap !== 'undefined') {
    gsap.fromTo('body',
      { opacity: 0.6 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
  }
}

let currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
applyTheme(currentTheme, false);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme, true);
    localStorage.setItem('portfolio-theme', currentTheme);
  });
}

// ============================================================
// LOADER
// ============================================================
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderNum = document.getElementById('loader-num');
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 6 + 2;
  if (loadProgress > 100) loadProgress = 100;
  loaderFill.style.width = `${loadProgress}%`;
  loaderNum.textContent = `${String(Math.round(loadProgress)).padStart(3, '0')} / 100`;
  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      gsap.to(loader, {
        opacity: 0,
        duration: 1,
        ease: 'power3.inOut',
        onComplete: () => {
          loader.style.display = 'none';
          initRevealAnimations();
        },
      });
      gsap.to(loader, {
        clipPath: 'inset(100% 0 0 0)',
        duration: 1.2,
        ease: 'power4.inOut',
      });
    }, 400);
  }
}, 60);

// ============================================================
// PROJECTS
// ============================================================
const projects = [
  {
    num: 'N°01',
    title: 'WOW Health',
    italic: 'AI Assistant',
    tag: 'Voice AI · MCP',
    year: '2025',
    desc: 'A real-time AI calling assistant built for the CSR team at WOW Health to support live customer interactions. Combines speech recognition, natural language understanding, and text-to-speech in a fully automated voice pipeline.',
    bullets: [
      'Built MCP-based real-time querying to fetch responses from Vector DB and relational DB during live calls',
      'Integrated ASR, NLU, and TTS using AssemblyAI, OpenAI, Deepgram, and ElevenLabs for end-to-end automation',
      'Implemented WebRTC + WebSockets for sub-100ms voice latency in production',
      'Deployed scalable FastAPI backend with real-time call orchestration via Vapi',
    ],
    stack: ['FastAPI', 'WebRTC', 'WebSockets', 'MCP', 'Vapi', 'AssemblyAI', 'OpenAI', 'Deepgram', 'ElevenLabs'],
  },
  {
    num: 'N°02',
    title: 'Bitvizo',
    italic: 'Crypto Signals',
    tag: 'ML · Real-time · GCP',
    year: '2024',
    desc: 'End-to-end real-time crypto signal generation platform covering 644 cryptocurrencies, built for a remote German company. Designed for high-frequency inference with live model monitoring and GPU server management.',
    bullets: [
      'Designed and maintained end-to-end training and inference pipelines using Redis and Celery',
      'Trained XGBoost and ensemble models achieving up to 75% precision in production',
      'Built live monitoring dashboards with Grafana for real-time signal performance tracking',
      'Managed GPU server infrastructure for large-scale model training at scale',
    ],
    stack: ['XGBoost', 'Ensemble Models', 'Redis', 'Celery', 'Grafana', 'GCP', 'Python', 'Docker'],
  },
  {
    num: 'N°03',
    title: 'KPK Media',
    italic: 'Monitoring System',
    tag: 'Kafka · PySpark · AWS',
    year: '2024',
    desc: 'A real-time electronic media monitoring system built for the KPK Government to analyze TV broadcasts and social media content at scale. Handles Urdu OCR, facial recognition, and live Twitter data streaming.',
    bullets: [
      'Built Kafka–PySpark streaming pipeline for live Twitter data, orchestrated with Apache Airflow',
      'Optimized EasyOCR for Urdu script recognition with custom preprocessing pipeline',
      'Added facial recognition module for automated content analysis and person identification',
      'Deployed containerized microservices on AWS for low-latency, high-reliability performance',
    ],
    stack: ['EasyOCR', 'Kafka', 'PySpark', 'AWS', 'Docker', 'Nginx', 'Airflow', 'OpenCV'],
  },
  {
    num: 'N°04',
    title: 'WiseSports',
    italic: 'AI Predictor',
    tag: 'LSTM · XGBoost · Airflow',
    year: '2024',
    desc: 'Sports prediction models for NBA, MLB, UFC, and NFL built with real-world contextual factors like injuries, weather, and travel distance. Full ML pipeline from scraping to ensemble forecasting.',
    bullets: [
      'Built data pipelines with ESPN API and Playwright-based web scraping for real-time stats',
      'Trained ensemble models (XGBoost + LSTM) incorporating injuries, weather, and travel factors',
      'Automated model retraining with Airflow DAGs and CI/CD pipelines',
      'Stored predictions and historical data in PostgreSQL with optimized query performance',
    ],
    stack: ['XGBoost', 'LSTM', 'Playwright', 'PostgreSQL', 'Airflow', 'CI/CD', 'Python', 'Scikit-Learn'],
  },
  {
    num: 'N°05',
    title: 'Metabolic',
    italic: 'Health Coach',
    tag: 'OpenAI · Twilio · CV',
    year: '2024',
    desc: 'An AI-powered health assistant providing personalized coaching on fitness, nutrition, and medication management. Combines computer vision for food recognition with a real-time voice agent for interactive coaching.',
    bullets: [
      'Integrated image processing for food recognition, hotel menu reading, and AI exercise recommendations',
      'Built real-time voice agent with OpenAI API and Twilio for interactive coaching via calls and SMS',
      'Developed personalized medication and nutrition tracking with MongoDB persistence',
      'Deployed on AWS with auto-scaling backend for consistent real-time response latency',
    ],
    stack: ['OpenAI API', 'Twilio', 'Computer Vision', 'MongoDB', 'AWS', 'FastAPI', 'Python'],
  },
  {
    num: 'N°06',
    title: 'Football',
    italic: 'Field Tracker',
    tag: 'YOLOv8 · Hugging Face',
    year: '2024',
    desc: 'A computer vision system for football field tracking and precise key field-point detection, trained on real match data. Published trained models publicly on Hugging Face for the community.',
    bullets: [
      'Trained YOLOv8 models on a Kaggle football dataset for accurate field boundary and line detection',
      'Developed custom post-processing for key field-point homography and perspective correction',
      'Published trained models on Hugging Face Hub for public inference access',
      'Deployed scalable inference endpoint on Chutes for real-time video processing',
    ],
    stack: ['YOLOv8', 'Computer Vision', 'Hugging Face', 'Chutes', 'OpenCV', 'Python', 'PyTorch'],
  },
  {
    num: 'N°07',
    title: 'Video Rec',
    italic: 'Engine',
    tag: 'Transformers · Azure',
    year: '2023',
    desc: 'A real-time video recommendation engine using transformer-based embeddings and vector similarity search. Built as containerized microservices and deployed on Azure with full CI/CD automation.',
    bullets: [
      'Built video embedding pipeline using Transformers and ChromaDB for semantic similarity search',
      'Containerized microservices with Docker-Compose for scalable independent service orchestration',
      'Deployed on Azure Web Apps via CI/CD pipeline with Azure Container Registry integration',
      'Achieved sub-200ms recommendation latency using optimized vector index configurations',
    ],
    stack: ['Transformers', 'ChromaDB', 'Docker', 'Azure', 'CI/CD', 'FastAPI', 'Python'],
  },
  {
    num: 'N°08',
    title: 'Image AI',
    italic: 'Pipeline',
    tag: 'Stable Diffusion · FastAPI',
    year: '2023',
    desc: 'A FastAPI-based AI image transformation system combining multiple state-of-the-art models for background removal, face enhancement, super-resolution, and image-to-video generation.',
    bullets: [
      'Integrated U2Net for background removal, GFPGAN for face restoration, and Real-ESRGAN for upscaling',
      'Added Stable Diffusion pipeline for high-quality image-to-video generation',
      'Deployed on local GPU server with ONNX optimization for mobile-ready latency',
      'Containerized with Docker for reproducible multi-model serving environment',
    ],
    stack: ['Stable Diffusion', 'GFPGAN', 'U2Net', 'Real-ESRGAN', 'FastAPI', 'Docker', 'ONNX', 'Python'],
  },
];
const list = document.getElementById('projects-list');
projects.forEach(p => {
  const row = document.createElement('div');
  row.className = 'project';
  row.innerHTML = `
    <div class="project-num">${p.num}</div>
    <div class="project-title">${p.title} <span class="italic">${p.italic}</span></div>
    <div class="project-tag">${p.tag}</div>
    <div class="project-year">— ${p.year}</div>
    <div class="project-arrow">→</div>
  `;
  list.appendChild(row);
});

// ============================================================
// SKILLS
// ============================================================
const skills = [
  'PyTorch', 'TensorFlow', 'Scikit-Learn', 'XGBoost', 'LangChain', 'FastAPI',
  'Docker', 'Kubernetes', 'GCP', 'AWS', 'Azure', 'MLflow', 'Airflow', 'Kafka',
  'PySpark', 'Redis', 'ChromaDB', 'Pinecone', 'FAISS', 'OpenCV', 'YOLOv8',
  'Stable Diffusion', 'Hugging Face', 'RAG', 'GSAP', 'PostgreSQL', 'MongoDB',
];
const skillsTrack = document.getElementById('skills-track');
const skillsAll = [...skills, ...skills, ...skills];
skillsAll.forEach(s => {
  const pill = document.createElement('div');
  pill.className = 'skill-pill';
  pill.textContent = s;
  skillsTrack.appendChild(pill);
});

// ============================================================
// CUSTOM CURSOR
// ============================================================
const cursorDot = document.getElementById('cursor-dot');
const cursorRing = document.getElementById('cursor-ring');
let cx = 0, cy = 0, rx = 0, ry = 0;

window.addEventListener('mousemove', (e) => {
  cx = e.clientX; cy = e.clientY;
});

function moveCursor() {
  cursorDot.style.left = cx + 'px';
  cursorDot.style.top = cy + 'px';
  rx += (cx - rx) * 0.18;
  ry += (cy - ry) * 0.18;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top = ry + 'px';
  requestAnimationFrame(moveCursor);
}
moveCursor();

document.querySelectorAll('a, .project, .skill-pill, .process-card, .theme-toggle').forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursorDot.classList.add('hover');
    cursorRing.classList.add('hover');
    if (shaderUniforms?.uHover) shaderUniforms.uHover.value = 1;
  });
  el.addEventListener('mouseleave', () => {
    cursorDot.classList.remove('hover');
    cursorRing.classList.remove('hover');
    if (shaderUniforms?.uHover) shaderUniforms.uHover.value = 0;
  });
});

// ============================================================
// LIVE CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  const h = String(now.getUTCHours()).padStart(2, '0');
  const m = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  const t = `${h}:${m}:${s} UTC`;
  document.getElementById('hud-time').textContent = t;
  const lt = document.getElementById('loader-time');
  if (lt) lt.textContent = t;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// SMOOTH ANCHORS
// ============================================================
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) lenis.scrollTo(target, { offset: -40 });
  });
});

// ============================================================
// MOBILE HAMBURGER MENU (no-op if HTML hooks are absent)
// ============================================================
const navOverlay = document.getElementById('nav-overlay');
const navToggle = document.getElementById('nav-toggle');
const navOverlayClose = document.getElementById('nav-overlay-close');

if (navOverlay && navToggle) {
  const openNav = () => navOverlay.classList.add('open');
  const closeNav = () => navOverlay.classList.remove('open');

  navToggle.addEventListener('click', openNav);
  navOverlayClose?.addEventListener('click', closeNav);

  document.querySelectorAll('[data-overlay-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      closeNav();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -40 });
    });
  });
}

// ============================================================
// PROJECT DETAIL MODAL
// ============================================================
const modal      = document.getElementById('project-modal');
const pmNum      = document.getElementById('pm-num');
const pmTag      = document.getElementById('pm-tag');
const pmYear     = document.getElementById('pm-year');
const pmTitle    = document.getElementById('pm-title');
const pmDesc     = document.getElementById('pm-desc');
const pmBullets  = document.getElementById('pm-bullets');
const pmStack    = document.getElementById('pm-stack');
const projClose  = document.getElementById('proj-close');

function openModal(p) {
  pmNum.textContent  = p.num;
  pmTag.textContent  = p.tag;
  pmYear.textContent = '— ' + p.year;
  pmTitle.innerHTML  = p.title + ' <span class="italic">' + p.italic + '</span>';
  pmDesc.textContent = p.desc;

  pmBullets.innerHTML = '';
  p.bullets.forEach(b => {
    const li = document.createElement('li');
    li.textContent = b;
    pmBullets.appendChild(li);
  });

  pmStack.innerHTML = '';
  p.stack.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'proj-modal-pill';
    pill.textContent = s;
    pmStack.appendChild(pill);
  });

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.project').forEach((row, i) => {
  row.style.cursor = 'none';
  row.addEventListener('click', () => openModal(projects[i]));
});

projClose.addEventListener('click', closeModal);

modal.addEventListener('click', (e) => {
  if (e.target === modal || e.target.classList.contains('proj-modal-bg')) closeModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

document.querySelectorAll('.proj-modal-close, .proj-modal-pill').forEach(el => {
  el.addEventListener('mouseenter', () => {
    document.getElementById('cursor-dot')?.classList.add('hover');
    document.getElementById('cursor-ring')?.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    document.getElementById('cursor-dot')?.classList.remove('hover');
    document.getElementById('cursor-ring')?.classList.remove('hover');
  });
});
