/**
 * INKSPIRED Marketplace
 * Full storefront rewrite with resilient Supabase fallback.
 */

/* =============================
   CONFIG
   ============================= */
const APP_CONFIG = window.INKSPIRED_CONFIG || {};
const SUPABASE_URL = APP_CONFIG.supabaseUrl || 'https://ulvmeujckzdsnbfzbzoj.supabase.co';
const SUPABASE_ANON_KEY = APP_CONFIG.supabaseAnonKey || 'sb_publishable_QZYwgnxOyIUQwEU2b7la_g_sOOjSTUm';

const MAX_LOADER_DURATION = 3000;
const APPS_FETCH_TIMEOUT = 2400;
const INITIAL_VISIBLE_APPS = 8;
const LOAD_MORE_STEP = 8;

const STORAGE_KEYS = {
  cart: 'inkspired_cart_v2',
  wishlist: 'inkspired_wishlist_v2',
  localOrders: 'inkspired_orders_v2',
  recentSearches: 'inkspired_recent_searches_v2',
  recentViews: 'inkspired_recent_views_v2',
  demoApps: 'inkspired_demo_apps_v1',
  ...(APP_CONFIG.storageKeys || {})
};

const coupons = {
  INKWELCOME: 0.15,
  CREATOR20: 0.2,
  SUMMER10: 0.1
};

const DEMO_APPS = [
  {
    id: 'demo-inkflow-pro',
    name: 'InkFlow Pro',
    description: 'Advanced digital painting workspace with AI brushes, live layer comps, and export kits for client-ready visuals.',
    icon_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'StudioCraft',
    developer_id: 'demo-dev-1',
    price: 850,
    category: 'Design',
    rating: 4.8,
    downloads: 12400,
    created_at: '2026-04-19T12:00:00.000Z',
    is_featured: true,
    tags: ['design', 'illustration', 'workflow'],
    version: '3.4.1',
    size: '412 MB',
    download_url: '#',
    short_blurb: 'AI-powered visual design suite.',
    is_demo: true
  },
  {
    id: 'demo-pixelforge',
    name: 'PixelForge',
    description: 'A refined pixel art editor for game artists with palette systems, onion-skinning, and sprite export pipelines.',
    icon_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'Artisan Labs',
    developer_id: 'demo-dev-2',
    price: 499,
    category: 'Design',
    rating: 4.6,
    downloads: 8200,
    created_at: '2026-03-22T12:00:00.000Z',
    is_featured: true,
    tags: ['pixel', 'art', 'sprites'],
    version: '2.1.0',
    size: '188 MB',
    download_url: '#',
    short_blurb: 'Premium sprite and scene builder.',
    is_demo: true
  },
  {
    id: 'demo-taskmaster',
    name: 'TaskMaster',
    description: 'Project management made for creative operations with approvals, client dashboards, sprint views, and handoff notes.',
    icon_url: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'ProductiveCo',
    developer_id: 'demo-dev-3',
    price: 0,
    category: 'Productivity',
    rating: 4.3,
    downloads: 25600,
    created_at: '2026-04-25T12:00:00.000Z',
    is_featured: false,
    tags: ['tasks', 'teams', 'workflow'],
    version: '5.0.3',
    size: '72 MB',
    download_url: '#',
    short_blurb: 'Creative project ops without the clutter.',
    is_demo: true
  },
  {
    id: 'demo-storysmith',
    name: 'StorySmith',
    description: 'A calm writing suite with chapter boards, version snapshots, AI prompts, and editorial focus modes for longform work.',
    icon_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'Narrative Foundry',
    developer_id: 'demo-dev-4',
    price: 299,
    category: 'Writing',
    rating: 4.7,
    downloads: 9700,
    created_at: '2026-04-17T12:00:00.000Z',
    is_featured: false,
    tags: ['writing', 'editor', 'authors'],
    version: '1.9.5',
    size: '134 MB',
    download_url: '#',
    short_blurb: 'Longform writing with an elegant editor.',
    is_demo: true
  },
  {
    id: 'demo-launchdeck',
    name: 'LaunchDeck',
    description: 'Campaign planning software for product marketers with strategy boards, content maps, asset review, and rollout timelines.',
    icon_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'Signal House',
    developer_id: 'demo-dev-5',
    price: 699,
    category: 'Marketing',
    rating: 4.5,
    downloads: 15300,
    created_at: '2026-02-20T12:00:00.000Z',
    is_featured: true,
    tags: ['marketing', 'campaigns', 'growth'],
    version: '4.2.0',
    size: '244 MB',
    download_url: '#',
    short_blurb: 'Campaign planning that looks investor-ready.',
    is_demo: true
  },
  {
    id: 'demo-stackscope',
    name: 'StackScope',
    description: 'A polished developer toolkit for API introspection, environment diffing, logs, and scheduled job debugging.',
    icon_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'Northbyte',
    developer_id: 'demo-dev-6',
    price: 1099,
    category: 'Developer',
    rating: 4.9,
    downloads: 6600,
    created_at: '2026-04-27T12:00:00.000Z',
    is_featured: true,
    tags: ['developer', 'debug', 'api'],
    version: '6.0.0',
    size: '520 MB',
    download_url: '#',
    short_blurb: 'For teams who debug in style.',
    is_demo: true
  },
  {
    id: 'demo-cashcanvas',
    name: 'CashCanvas',
    description: 'A finance dashboard for creators with invoice pipelines, runway snapshots, and tax-friendly income categorization.',
    icon_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'Ledger Bloom',
    developer_id: 'demo-dev-7',
    price: 579,
    category: 'Finance',
    rating: 4.4,
    downloads: 5400,
    created_at: '2026-03-11T12:00:00.000Z',
    is_featured: false,
    tags: ['finance', 'freelance', 'budget'],
    version: '2.6.2',
    size: '96 MB',
    download_url: '#',
    short_blurb: 'Finance clarity for solo teams.',
    is_demo: true
  },
  {
    id: 'demo-briefloop',
    name: 'BriefLoop',
    description: 'A brief and feedback manager for agencies with reusable questionnaires, approval tracking, and client comments.',
    icon_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop',
    screenshots: [
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop'
    ],
    developer_name: 'StudioCraft',
    developer_id: 'demo-dev-1',
    price: 349,
    category: 'Productivity',
    rating: 4.6,
    downloads: 4300,
    created_at: '2026-04-08T12:00:00.000Z',
    is_featured: false,
    tags: ['briefs', 'clients', 'feedback'],
    version: '1.4.2',
    size: '80 MB',
    download_url: '#',
    short_blurb: 'Client handoff, minus the chaos.',
    is_demo: true
  }
];

/* =============================
   STATE
   ============================= */
// Check if supabase is already defined before declaring
if (typeof supabase === 'undefined') {
    var supabase = null; 
}
let authSubscription = null;
let currentUser = null;
let userProfile = null;
let allApps = [];
let featuredApps = [];
let trendingApps = [];
let newApps = [];
let allDevelopers = [];
let currentCategory = 'All';
let currentSort = 'newest';
let searchQuery = '';
let visibleAppCount = INITIAL_VISIBLE_APPS;
let cart = [];
let wishlist = new Set();
let appliedCoupon = null;
let currentStarRating = 0;
let usingDemoApps = false;
let loaderFailsafeId = null;
let loaderHasExited = false;
let postLoadAnimationsInitialized = false;
let searchSaveTimer = null;

/* =============================
   HELPERS
   ============================= */
function byId(id) {
  return document.getElementById(id);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return map[char];
  });
}

function serializeInlineValue(value) {
  return JSON.stringify(String(value ?? ''));
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(() => reject(new Error(message)), ms);
    })
  ]);
}

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getSharedDemoApps() {
  return safeArray(readStorage(STORAGE_KEYS.demoApps, [])).map((app) =>
    normalizeApp({
      ...app,
      is_demo: true
    })
  );
}

function formatCurrency(value) {
  const amount = Number(value) || 0;
  if (amount === 0) return 'FREE';
  return `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatCurrencyDetailed(value) {
  const amount = Number(value) || 0;
  return `₱ ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatNumber(value) {
  const amount = Number(value) || 0;
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return `${amount}`;
}

function normalizeApp(app) {
  return {
    ...app,
    id: String(app.id),
    name: app.name || 'Untitled App',
    description: app.description || 'No description available.',
    short_blurb: app.short_blurb || app.description || 'No description available.',
    developer_name: app.profiles?.full_name || app.developer_name || 'Unknown Developer',
    icon_url: app.icon_url || 'https://via.placeholder.com/800x500?text=INKSPIRED',
    screenshots: safeArray(app.screenshots).length ? safeArray(app.screenshots) : [app.icon_url || 'https://via.placeholder.com/800x500?text=INKSPIRED'],
    tags: safeArray(app.tags),
    category: app.category || 'General',
    price: Number(app.price) || 0,
    rating: Number(app.rating) || 0,
    downloads: Number(app.downloads) || 0,
    version: app.version || '1.0.0',
    size: app.size || 'N/A',
    created_at: app.created_at || new Date().toISOString(),
    is_featured: Boolean(app.is_featured),
    is_demo: Boolean(app.is_demo),
    developer_id: app.developer_id || null,
    download_url: app.download_url || '#'
  };
}

function getAppById(appId) {
  return allApps.find((app) => String(app.id) === String(appId)) || null;
}

function setAppCollections(apps) {
  allApps = apps.map(normalizeApp);
  featuredApps = allApps.filter((app) => app.is_featured).slice(0, 8);
  if (!featuredApps.length) featuredApps = allApps.slice(0, 6);
  trendingApps = [...allApps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 8);
  newApps = [...allApps].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 8);
  visibleAppCount = INITIAL_VISIBLE_APPS;
  buildDeveloperSummary();
}

function buildDeveloperSummary() {
  const map = new Map();

  allApps.forEach((app) => {
    const key = `${app.developer_name}::${app.developer_id || 'anon'}`;
    if (!map.has(key)) {
      map.set(key, {
        name: app.developer_name,
        id: app.developer_id || null,
        apps: 0,
        downloads: 0,
        ratingSum: 0,
        heroApp: app
      });
    }

    const entry = map.get(key);
    entry.apps += 1;
    entry.downloads += Number(app.downloads) || 0;
    entry.ratingSum += Number(app.rating) || 0;
    if ((app.downloads || 0) > (entry.heroApp?.downloads || 0)) {
      entry.heroApp = app;
    }
  });

  allDevelopers = [...map.values()]
    .map((entry) => ({
      ...entry,
      avgRating: entry.apps ? entry.ratingSum / entry.apps : 0
    }))
    .sort((a, b) => b.downloads - a.downloads)
    .slice(0, 4);
}

function getRecentSearches() {
  return safeArray(readStorage(STORAGE_KEYS.recentSearches, []));
}

function saveRecentSearch(query) {
  const clean = String(query || '').trim();
  if (clean.length < 2) return;

  const next = [clean, ...getRecentSearches().filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
  writeStorage(STORAGE_KEYS.recentSearches, next);
  renderRecentSearches();
}

function getRecentViews() {
  return safeArray(readStorage(STORAGE_KEYS.recentViews, []));
}

function saveRecentView(appId) {
  const next = [String(appId), ...getRecentViews().filter((id) => String(id) !== String(appId))].slice(0, 8);
  writeStorage(STORAGE_KEYS.recentViews, next);
  renderRecentlyViewed();
}

function getLocalOrders() {
  return safeArray(readStorage(STORAGE_KEYS.localOrders, []));
}

function saveLocalOrders(orders) {
  writeStorage(STORAGE_KEYS.localOrders, safeArray(orders));
}

function persistOrderLocally(order) {
  const next = [order, ...getLocalOrders()].slice(0, 50);
  saveLocalOrders(next);
}

function syncBodyScrollLock() {
  const shouldLock = Boolean(document.querySelector('.modal-overlay.show, #cartSidebar.show, #mobileMenu.open'));
  document.body.style.overflow = shouldLock ? 'hidden' : '';
}

function closeProfileMenu() {
  byId('profileMenu')?.classList.remove('open');
}

function getTrendingHeadline() {
  if (!trendingApps.length) return 'Curation engine is warming up...';
  const app = trendingApps[0];
  return `${app.name} leads with ${formatNumber(app.downloads)} downloads.`;
}

/* =============================
   SUPABASE
   ============================= */
function initSupabase() {
  try {
    if (!window.supabase || typeof window.supabase.createClient !== 'function') {
      throw new Error('Supabase client library unavailable.');
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    supabase = null;
    console.warn('Supabase unavailable, storefront will use demo mode.', error);
  }
}

function subscribeToAuthChanges() {
  if (!supabase || authSubscription) return;

  try {
    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      currentUser = session?.user ?? null;
      userProfile = null;

      if (currentUser) {
        await fetchProfile();
      }

      updateNavAuth();
    });

    authSubscription = data?.subscription || null;
  } catch (error) {
    console.warn('Auth subscription failed.', error);
  }
}

/* =============================
   BACKGROUND
   ============================= */
(function initBackground() {
  const canvas = byId('bgCanvas');
  if (!canvas) return;

  const context = canvas.getContext('2d');
  if (!context) return;

  let width = window.innerWidth;
  let height = window.innerHeight;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const waves = Array.from({ length: 4 }, (_, index) => ({
    y: Math.random() * window.innerHeight,
    amplitude: 38 + Math.random() * 52,
    frequency: 0.002 + Math.random() * 0.0024,
    speed: 0.18 + Math.random() * 0.26,
    offset: Math.random() * Math.PI * 2,
    color: index % 2 === 0 ? 'rgba(235,65,116,0.10)' : 'rgba(249,231,254,0.15)'
  }));

  const orbs = Array.from({ length: 5 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: 90 + Math.random() * 110,
    dx: (Math.random() - 0.5) * 0.24,
    dy: (Math.random() - 0.5) * 0.24,
    color: ['rgba(235,65,116,0.14)', 'rgba(255,214,193,0.16)', 'rgba(218,252,252,0.14)'][Math.floor(Math.random() * 3)]
  }));

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let smoothMouseX = mouseX;
  let smoothMouseY = mouseY;

  resize();
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  document.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    mouseX = touch.clientX;
    mouseY = touch.clientY;
  }, { passive: true });

  function drawWave(wave, time) {
    context.beginPath();
    context.moveTo(0, wave.y);
    for (let x = 0; x <= width; x += 4) {
      const y = wave.y + Math.sin(x * wave.frequency + wave.offset + time * wave.speed) * wave.amplitude;
      context.lineTo(x, y);
    }
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.closePath();
    context.fillStyle = wave.color;
    context.fill();
  }

  function drawOrb(orb) {
    const gradient = context.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
    gradient.addColorStop(0, orb.color);
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    context.fill();
  }

  function drawMouseGlow() {
    smoothMouseX += (mouseX - smoothMouseX) * 0.08;
    smoothMouseY += (mouseY - smoothMouseY) * 0.08;
    const gradient = context.createRadialGradient(smoothMouseX, smoothMouseY, 0, smoothMouseX, smoothMouseY, 280);
    gradient.addColorStop(0, 'rgba(235,65,116,0.10)');
    gradient.addColorStop(0.55, 'rgba(255,214,193,0.08)');
    gradient.addColorStop(1, 'transparent');
    context.fillStyle = gradient;
    context.beginPath();
    context.arc(smoothMouseX, smoothMouseY, 280, 0, Math.PI * 2);
    context.fill();
  }

  let frame = 0;
  function animate() {
    frame += 1;
    const time = frame * 0.016;

    context.clearRect(0, 0, width, height);
    context.fillStyle = 'rgba(255,247,248,1)';
    context.fillRect(0, 0, width, height);

    waves.forEach((wave) => drawWave(wave, time));
    orbs.forEach((orb) => {
      orb.x += orb.dx;
      orb.y += orb.dy;
      if (orb.x < -orb.radius) orb.x = width + orb.radius;
      if (orb.x > width + orb.radius) orb.x = -orb.radius;
      if (orb.y < -orb.radius) orb.y = height + orb.radius;
      if (orb.y > height + orb.radius) orb.y = -orb.radius;
      drawOrb(orb);
    });

    drawMouseGlow();
    window.requestAnimationFrame(animate);
  }

  animate();
})();

/* =============================
   BOOTSTRAP
   ============================= */
document.addEventListener('DOMContentLoaded', () => {
  void bootstrapApp();
});

async function bootstrapApp() {
  initSupabase();
  bindUI();
  initLoader();
  subscribeToAuthChanges();
  loadPersistentState();
  updateNavAuth();
  updateModeUI('loading');
  showSkeletons();

  loaderFailsafeId = window.setTimeout(() => {
    ensureRenderableContent();
    hideLoader();
  }, MAX_LOADER_DURATION);

  try {
    await Promise.allSettled([checkAuth(), fetchApps()]);
  } catch (error) {
    console.error('Bootstrap error:', error);
    ensureRenderableContent();
  } finally {
    hideLoader();
  }
}

function loadPersistentState() {
  cart = safeArray(readStorage(STORAGE_KEYS.cart, []));
  wishlist = new Set(safeArray(readStorage(STORAGE_KEYS.wishlist, [])).map((id) => String(id)));
  updateCartUI();
  renderRecentSearches();
}

function initLoader() {
  const loader = byId('loader');
  if (!loader || !window.gsap) return;

  gsap.fromTo('.loader-logo', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  gsap.fromTo('.loader-copy', { opacity: 0, y: 12 }, { opacity: 1, y: 0, delay: 0.15, duration: 0.5, ease: 'power2.out' });
  gsap.fromTo('.loader-fill', { scaleX: 0.12, transformOrigin: 'left center' }, { scaleX: 1, repeat: -1, yoyo: true, duration: 1.25, ease: 'power1.inOut' });
  gsap.to('.orbit-a', { rotation: 360, repeat: -1, duration: 8, ease: 'none' });
  gsap.to('.orbit-b', { rotation: -360, repeat: -1, duration: 11, ease: 'none' });
}

function ensureRenderableContent() {
  if (!allApps.length) {
    renderDemoApps();
    return;
  }
  renderMarketplace();
}

function hideLoader() {
  if (loaderHasExited) return;
  loaderHasExited = true;

  if (loaderFailsafeId) {
    window.clearTimeout(loaderFailsafeId);
    loaderFailsafeId = null;
  }

  const loader = byId('loader');
  if (!loader) {
    initPostLoadAnimations();
    return;
  }

  const finalize = () => {
    loader.classList.add('hidden');
    initPostLoadAnimations();
  };

  if (!window.gsap) {
    finalize();
    return;
  }

  gsap.to(loader, {
    autoAlpha: 0,
    duration: 0.55,
    ease: 'power2.out',
    onComplete: finalize
  });
}

function initPostLoadAnimations() {
  if (postLoadAnimationsInitialized) return;
  postLoadAnimationsInitialized = true;
  initGSAPAnimations();
  animateCounters();
}

/* =============================
   UI BINDINGS
   ============================= */
function bindUI() {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat || 'All';
      visibleAppCount = INITIAL_VISIBLE_APPS;
      renderMarketplace();
    });
  });

  byId('navLibrary')?.addEventListener('click', (event) => {
    event.preventDefault();
    openLibrary();
  });

  byId('footerLibraryLink')?.addEventListener('click', (event) => {
    event.preventDefault();
    if (currentUser) openLibrary();
    else openAuthModal('login');
  });

  document.addEventListener('click', handleGlobalClick);
  document.addEventListener('keydown', handleGlobalKeydown);
}

function handleScroll() {
  byId('navbar')?.classList.toggle('scrolled', window.scrollY > 24);
}

function handleGlobalClick(event) {
  const target = event.target;

  if (!target.closest('.profile-dropdown')) {
    closeProfileMenu();
  }

  const appTrigger = target.closest('[data-app-id]');
  const actionTrigger = target.closest('[data-action]');

  if (actionTrigger) {
    const action = actionTrigger.dataset.action;
    const appId = actionTrigger.dataset.appId;

    if (action === 'wishlist') {
      event.preventDefault();
      event.stopPropagation();
      toggleWishlist(appId, actionTrigger);
      return;
    }

    if (action === 'add-to-cart') {
      event.preventDefault();
      event.stopPropagation();
      addToCart(appId);
      return;
    }
  }

  if (appTrigger && !target.closest('button, a, input, select, textarea')) {
    openAppModal(appTrigger.dataset.appId);
    return;
  }

  if (target.id === 'appModal') closeAppModal();
  if (target.id === 'authModal') closeAuthModal();
  if (target.id === 'checkoutModal') closeCheckout();
  if (target.id === 'successModal') closeSuccess();
  if (target.id === 'libraryModal') closeLibrary();
}

function handleGlobalKeydown(event) {
  if (event.key !== 'Escape') return;
  closeProfileMenu();
  if (byId('mobileMenu')?.classList.contains('open')) toggleMobileMenu(false);
  if (byId('cartSidebar')?.classList.contains('show')) toggleCart(false);
  if (byId('libraryModal')?.classList.contains('show')) closeLibrary();
  if (byId('appModal')?.classList.contains('show')) closeAppModal();
  if (byId('authModal')?.classList.contains('show')) closeAuthModal();
  if (byId('checkoutModal')?.classList.contains('show')) closeCheckout();
  if (byId('successModal')?.classList.contains('show')) closeSuccess();
}

function initGSAPAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  gsap.from('.hero-copy > *', {
    opacity: 0,
    y: 22,
    stagger: 0.08,
    duration: 0.7,
    ease: 'power3.out'
  });

  gsap.from('.hero-showcase, .hero-flyout', {
    opacity: 0,
    y: 24,
    scale: 0.96,
    stagger: 0.1,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0.15
  });

  gsap.to('.hero-showcase', {
    y: -10,
    duration: 3.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  });

  gsap.utils.toArray('section').forEach((section) => {
    const header = section.querySelector('.section-header');
    if (!header) return;
    gsap.from(header, {
      scrollTrigger: { trigger: section, start: 'top 82%' },
      opacity: 0,
      y: 24,
      duration: 0.7,
      ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.glass-card, .collection-card, .app-card, .pulse-card').forEach((node) => {
    gsap.from(node, {
      scrollTrigger: { trigger: node, start: 'top 92%' },
      opacity: 0,
      y: 18,
      duration: 0.55,
      ease: 'power2.out'
    });
  });
}

function animateCounters() {
  document.querySelectorAll('.counter').forEach((counter) => {
    const target = Number(counter.dataset.target) || 0;

    if (!window.gsap) {
      counter.textContent = target.toLocaleString();
      return;
    }

    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.7,
      ease: 'power2.out',
      onUpdate: () => {
        counter.textContent = Math.round(state.value).toLocaleString();
      }
    });
  });
}

/* =============================
   STATUS UI
   ============================= */
function updateModeUI(mode) {
  const badge = byId('dataStatusBadge');
  const storeModeText = byId('storeModeText');
  const footerModeNote = byId('footerModeNote');
  const heroModeNote = byId('heroModeNote');

  const states = {
    loading: {
      label: 'Loading',
      copy: 'Preparing data source and recovery mode...',
      hero: 'Preparing storefront mode...',
      className: 'status-loading'
    },
    live: {
      label: 'Live Data',
      copy: 'Connected to Supabase marketplace data.',
      hero: 'Live marketplace connected.',
      className: 'status-live'
    },
    demo: {
      label: 'Demo Mode',
      copy: 'Running on curated fallback data with full UI continuity.',
      hero: 'Demo storefront active during data downtime.',
      className: 'status-demo'
    }
  };

  const state = states[mode] || states.loading;

  if (badge) {
    badge.className = `status-pill ${state.className}`;
    badge.innerHTML = `<i class="fa-solid fa-signal"></i><span>${escapeHtml(state.label)}</span>`;
  }

  if (storeModeText) storeModeText.textContent = state.copy;
  if (footerModeNote) footerModeNote.textContent = state.copy;
  if (heroModeNote) heroModeNote.textContent = state.hero;
}

/* =============================
   AUTH
   ============================= */
async function checkAuth() {
  if (!supabase) {
    currentUser = null;
    userProfile = null;
    updateNavAuth();
    return null;
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    currentUser = data.session?.user ?? null;
    userProfile = null;

    if (currentUser) {
      await fetchProfile();
    }

    updateNavAuth();
    return currentUser;
  } catch (error) {
    console.error('Auth session check failed:', error);
    currentUser = null;
    userProfile = null;
    updateNavAuth();
    return null;
  }
}

async function fetchProfile() {
  if (!supabase || !currentUser) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (error) throw error;
    userProfile = data || null;
    return userProfile;
  } catch (error) {
    console.warn('Profile lookup failed:', error);
    userProfile = null;
    return null;
  }
}

function updateNavAuth() {
  const navAuthArea = byId('navAuthArea');
  const navLibrary = byId('navLibrary');
  const mobileAuthCta = document.querySelector('.mobile-auth-cta');

  if (navLibrary) {
    navLibrary.classList.toggle('hidden', !currentUser);
  }

  if (mobileAuthCta) {
    if (currentUser) {
      mobileAuthCta.innerHTML = '<i class="fa-solid fa-book-open"></i> Open Library';
      mobileAuthCta.onclick = () => {
        toggleMobileMenu(false);
        openLibrary();
      };
    } else {
      mobileAuthCta.innerHTML = '<i class="fa-solid fa-user"></i> Sign In';
      mobileAuthCta.onclick = () => {
        openAuthModal('login');
        toggleMobileMenu(false);
      };
    }
  }

  if (!navAuthArea) return;

  if (!currentUser) {
    navAuthArea.innerHTML = `
      <button class="auth-btn" type="button" onclick="openAuthModal('login')">
        <i class="fa-solid fa-user"></i> Sign In
      </button>
    `;
    return;
  }

  const displayName = userProfile?.full_name || currentUser.email?.split('@')[0] || 'User';
  const avatarUrl = userProfile?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=eb4174`;

  navAuthArea.innerHTML = `
    <div class="profile-dropdown">
      <button class="profile-toggle" type="button" onclick="toggleProfileMenu()" aria-label="Open profile menu">
        <img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(displayName)}" />
      </button>
      <div class="profile-menu" id="profileMenu">
        <a href="#" onclick="openLibrary(); toggleProfileMenu(); return false;"><i class="fa-solid fa-book-open"></i> My Library</a>
        <a href="#" onclick="openWishlist(); toggleProfileMenu(); return false;"><i class="fa-solid fa-heart"></i> Wishlist</a>
        ${userProfile?.role === 'developer' ? '<a href="developer.html"><i class="fa-solid fa-code"></i> Developer Portal</a>' : ''}
        ${userProfile?.role === 'admin' ? '<a href="admin.html"><i class="fa-solid fa-lock"></i> Admin</a>' : ''}
        <div class="menu-divider"></div>
        <a href="#" onclick="handleLogout(); toggleProfileMenu(); return false;"><i class="fa-solid fa-right-from-bracket"></i> Sign Out</a>
      </div>
    </div>
  `;
}

function toggleProfileMenu() {
  const menu = byId('profileMenu');
  if (!menu) return;
  menu.classList.toggle('open');
}

async function handleLogin(event) {
  event.preventDefault();

  const button = byId('loginBtn');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
  }

  const email = byId('loginEmail')?.value.trim();
  const password = byId('loginPassword')?.value || '';

  if (!supabase) {
    showToast('Live sign-in is unavailable right now.', 'error');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
    }
    return;
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    currentUser = data.user || null;
    userProfile = null;
    await fetchProfile();
    updateNavAuth();
    closeAuthModal();
    showToast('Welcome back.', 'success');
  } catch (error) {
    showToast(error.message || 'Login failed.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In';
    }
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const button = byId('registerBtn');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Creating...';
  }

  const fullName = byId('regName')?.value.trim();
  const email = byId('regEmail')?.value.trim();
  const password = byId('regPassword')?.value || '';
  const role = byId('regRole')?.value || 'customer';

  if (!supabase) {
    showToast('Live registration is unavailable right now.', 'error');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters.', 'error');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    });

    if (error) throw error;

    if (data.user) {
      try {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          role
        });
        if (profileError) console.warn('Profile upsert warning:', profileError);
      } catch (profileError) {
        console.warn('Profile write warning:', profileError);
      }
    }

    currentUser = data.user || null;
    userProfile = null;
    await fetchProfile();
    updateNavAuth();
    closeAuthModal();
    showToast('Account created successfully.', 'success');
  } catch (error) {
    showToast(error.message || 'Registration failed.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create Account';
    }
  }
}

async function handleLogout() {
  try {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    }
  } catch (error) {
    console.warn('Logout warning:', error);
  } finally {
    currentUser = null;
    userProfile = null;
    updateNavAuth();
    showToast('Signed out successfully.', 'success');
  }
}

function openAuthModal(tab = 'login') {
  byId('authModal')?.classList.add('show');
  switchAuthTab(tab);
  syncBodyScrollLock();
}

function closeAuthModal() {
  byId('authModal')?.classList.remove('show');
  syncBodyScrollLock();
}

function switchAuthTab(tab) {
  const loginForm = byId('loginForm');
  const registerForm = byId('registerForm');
  const loginTab = byId('loginTab');
  const registerTab = byId('registerTab');
  const loginMode = tab === 'login';

  if (!loginForm || !registerForm || !loginTab || !registerTab) return;

  loginForm.classList.toggle('hidden', !loginMode);
  registerForm.classList.toggle('hidden', loginMode);
  loginForm.style.display = loginMode ? 'flex' : 'none';
  registerForm.style.display = loginMode ? 'none' : 'flex';
  loginTab.classList.toggle('active', loginMode);
  registerTab.classList.toggle('active', !loginMode);
}

/* =============================
   DATA
   ============================= */
async function fetchApps() {
  showSkeletons();

  if (!supabase) {
    renderDemoApps();
    return allApps;
  }

  try {
    const { data, error } = await withTimeout(
      supabase
        .from('apps')
        .select('*, profiles!developer_id(full_name)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false }),
      APPS_FETCH_TIMEOUT,
      'App fetch timed out.'
    );

    if (error) throw error;

    const apps = safeArray(data).map((app) => normalizeApp(app));
    usingDemoApps = false;
    updateModeUI('live');

    if (!apps.length) {
      setAppCollections([]);
      renderMarketplace();
      return allApps;
    }

    setAppCollections(apps);
    renderMarketplace();
    return allApps;
  } catch (error) {
    console.error('App fetch failed:', error);
    renderDemoApps();
    return allApps;
  }
}

function renderDemoApps() {
  usingDemoApps = true;
  updateModeUI('demo');
  const mergedDemoApps = [...DEMO_APPS, ...getSharedDemoApps()];
  const uniqueApps = Array.from(new Map(mergedDemoApps.map((app) => [String(app.id), app])).values());
  setAppCollections(uniqueApps);
  renderMarketplace();
}

function showSkeletons() {
  const featured = byId('featuredCarousel');
  const trending = byId('trendingScroll');
  const newRail = byId('newReleasesScroll');
  const appGrid = byId('appGrid');
  const forYouGrid = byId('forYouGrid');

  if (featured) featured.innerHTML = '<div class="carousel-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading featured apps...</div>';
  if (trending) trending.innerHTML = '<div class="scroll-loading"><i class="fa-solid fa-circle-notch fa-spin"></i></div>';
  if (newRail) newRail.innerHTML = '<div class="scroll-loading"><i class="fa-solid fa-circle-notch fa-spin"></i></div>';
  if (forYouGrid) forYouGrid.innerHTML = '<div class="mini-grid-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Loading picks...</div>';
  if (appGrid) {
    appGrid.innerHTML = Array.from({ length: 6 }, () => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-line w-90"></div>
        <div class="skeleton-line w-70"></div>
        <div class="skeleton-line w-40"></div>
      </div>
    `).join('');
  }
}

function renderMarketplace() {
  renderFeaturedCarousel();
  renderTrendingRail();
  renderNewReleasesRail();
  renderForYouGrid();
  renderAppGrid();
  renderRecentlyViewed();
  renderCreatorSpotlight();
  renderRecentSearches();
  refreshMarketplaceNotes();
}

function refreshMarketplaceNotes() {
  const headline = byId('trendingHeadline');
  const summary = byId('activeFilterSummary');
  const footerLibraryLink = byId('footerLibraryLink');

  if (headline) headline.textContent = getTrendingHeadline();

  if (summary) {
    const parts = [];
    if (currentCategory !== 'All') parts.push(currentCategory);
    if (searchQuery) parts.push(`search: "${searchQuery}"`);
    summary.textContent = parts.length
      ? `Showing ${parts.join(' + ')} results, sorted by ${currentSort.replace('-', ' ')}.`
      : `Showing all premium releases, sorted by ${currentSort.replace('-', ' ')}.`;
  }

  if (footerLibraryLink) {
    footerLibraryLink.textContent = currentUser ? 'My Library' : 'Sign In for Library';
  }
}

function getFilteredApps() {
  let filtered = [...allApps];

  if (currentCategory !== 'All') {
    filtered = filtered.filter((app) => app.category === currentCategory);
  }

  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter((app) => {
      return [app.name, app.description, app.developer_name, app.category, ...safeArray(app.tags)]
        .some((value) => String(value || '').toLowerCase().includes(query));
    });
  }

  switch (currentSort) {
    case 'popular':
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'price-asc':
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-desc':
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'free':
      filtered = filtered.filter((app) => Number(app.price) === 0);
      break;
    case 'newest':
    default:
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return filtered;
}

function renderFeaturedCarousel() {
  const carousel = byId('featuredCarousel');
  if (!carousel) return;

  if (!featuredApps.length) {
    carousel.innerHTML = '<div class="carousel-loading">No featured apps available.</div>';
    return;
  }

  carousel.innerHTML = featuredApps.map((app) => `
    <article class="featured-card glass-card" data-app-id="${escapeHtml(app.id)}">
      <div class="featured-media">
        <img src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" loading="lazy" />
        <span class="featured-category">${escapeHtml(app.category)}</span>
      </div>
      <div class="featured-body">
        <div class="featured-topline">
          <div>
            <h3>${escapeHtml(app.name)}</h3>
            <p>by ${escapeHtml(app.developer_name)}</p>
          </div>
          <span class="featured-price ${app.price === 0 ? 'free' : ''}">${formatCurrency(app.price)}</span>
        </div>
        <p class="featured-desc">${escapeHtml(app.short_blurb)}</p>
        <div class="featured-meta">
          <span><i class="fa-solid fa-star"></i> ${(app.rating || 0).toFixed(1)}</span>
          <span><i class="fa-solid fa-download"></i> ${formatNumber(app.downloads)}</span>
        </div>
      </div>
    </article>
  `).join('');
}

function railCardHTML(app) {
  return `
    <article class="rail-card" data-app-id="${escapeHtml(app.id)}">
      <img src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" loading="lazy" />
      <div class="rail-body">
        <h4>${escapeHtml(app.name)}</h4>
        <p>${escapeHtml(app.developer_name)}</p>
        <div class="rail-meta">
          <span class="${app.price === 0 ? 'free' : ''}">${formatCurrency(app.price)}</span>
          <span>${formatNumber(app.downloads)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderTrendingRail() {
  const container = byId('trendingScroll');
  if (!container) return;
  container.innerHTML = trendingApps.length ? trendingApps.map(railCardHTML).join('') : '<div class="scroll-loading">No trending apps yet.</div>';
}

function renderNewReleasesRail() {
  const container = byId('newReleasesScroll');
  if (!container) return;
  container.innerHTML = newApps.length ? newApps.map(railCardHTML).join('') : '<div class="scroll-loading">No new apps yet.</div>';
}

function renderForYouGrid() {
  const container = byId('forYouGrid');
  if (!container) return;

  let source = getFilteredApps();
  if (!source.length) source = [...allApps];

  const favorites = source.filter((app) => wishlist.has(String(app.id)));
  const picks = (favorites.length ? favorites : source).slice(0, 4);

  container.innerHTML = picks.length ? picks.map((app) => `
    <article class="mini-app-card" data-app-id="${escapeHtml(app.id)}">
      <img src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" loading="lazy" />
      <div>
        <h4>${escapeHtml(app.name)}</h4>
        <p>${escapeHtml(app.category)} · ${formatCurrency(app.price)}</p>
      </div>
    </article>
  `).join('') : '<div class="empty-state-inline"><p>No picks yet. Try another filter.</p></div>';
}

function renderRecentlyViewed() {
  const container = byId('recentlyViewedRail');
  if (!container) return;

  const apps = getRecentViews()
    .map((id) => getAppById(id))
    .filter(Boolean)
    .slice(0, 6);

  container.innerHTML = apps.length ? apps.map(railCardHTML).join('') : '<p>Open an app and it will appear here.</p>';
}

function renderCreatorSpotlight() {
  const container = byId('creatorSpotlight');
  if (!container) return;

  if (!allDevelopers.length) {
    container.innerHTML = '<p class="creator-empty">Creator spotlight will appear once apps are loaded.</p>';
    return;
  }

  container.innerHTML = allDevelopers.map((developer) => `
    <article class="creator-card">
      <img src="${escapeHtml(developer.heroApp.icon_url)}" alt="${escapeHtml(developer.name)}" loading="lazy" />
      <div>
        <h4>${escapeHtml(developer.name)}</h4>
        <p>${developer.apps} apps · ${formatNumber(developer.downloads)} downloads</p>
        <span><i class="fa-solid fa-star"></i> ${developer.avgRating.toFixed(1)} average</span>
      </div>
    </article>
  `).join('');
}

function renderAppGrid() {
  const grid = byId('appGrid');
  const loadMoreWrap = byId('loadMoreWrap');
  if (!grid) return;

  const filtered = getFilteredApps();

  if (!filtered.length) {
    grid.innerHTML = '<div class="products-loading"><i class="fa-solid fa-box-open"></i> No apps match the current filters.</div>';
    if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    return;
  }

  const visible = filtered.slice(0, visibleAppCount);

  grid.innerHTML = visible.map((app) => `
    <article class="app-card glass-card" data-app-id="${escapeHtml(app.id)}">
      <div class="app-card-media">
        <img src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" loading="lazy" />
        <div class="app-card-badges">
          <span>${escapeHtml(app.category)}</span>
          ${app.price === 0 ? '<span class="free">FREE</span>' : ''}
        </div>
        <button class="wishlist-btn ${wishlist.has(String(app.id)) ? 'active' : ''}" type="button" data-action="wishlist" data-app-id="${escapeHtml(app.id)}" aria-label="Toggle wishlist">
          <i class="fa-${wishlist.has(String(app.id)) ? 'solid' : 'regular'} fa-heart"></i>
        </button>
      </div>
      <div class="app-card-body">
        <div class="app-card-top">
          <div>
            <h3>${escapeHtml(app.name)}</h3>
            <p>by ${escapeHtml(app.developer_name)}</p>
          </div>
          <strong class="${app.price === 0 ? 'free' : ''}">${formatCurrency(app.price)}</strong>
        </div>
        <p class="app-card-desc">${escapeHtml(app.description)}</p>
        <div class="app-card-meta">
          <span><i class="fa-solid fa-star"></i> ${(app.rating || 0).toFixed(1)}</span>
          <span><i class="fa-solid fa-download"></i> ${formatNumber(app.downloads)}</span>
        </div>
        <div class="app-card-actions">
          <button class="btn-ghost small" type="button" onclick='openAppModal(${serializeInlineValue(app.id)})'>Quick View</button>
          <button class="btn-primary small" type="button" data-action="add-to-cart" data-app-id="${escapeHtml(app.id)}">
            <i class="fa-solid fa-cart-plus"></i> Add
          </button>
        </div>
      </div>
    </article>
  `).join('');

  if (loadMoreWrap) {
    loadMoreWrap.style.display = filtered.length > visibleAppCount ? 'flex' : 'none';
  }
}

function renderRecentSearches() {
  const container = byId('recentSearches');
  if (!container) return;

  const searches = getRecentSearches();
  container.innerHTML = searches.length ? searches.map((query) => `
    <button class="search-chip" type="button" onclick='applyRecentSearch(${JSON.stringify(query)})'>${escapeHtml(query)}</button>
  `).join('') : '<span class="search-chip muted">Search to create quick filters</span>';
}

function applyRecentSearch(query) {
  searchQuery = String(query || '');
  const input = byId('navSearch');
  if (input) input.value = searchQuery;
  visibleAppCount = INITIAL_VISIBLE_APPS;
  renderMarketplace();
}

function handleSearch(value) {
  searchQuery = String(value || '').trim();
  visibleAppCount = INITIAL_VISIBLE_APPS;
  renderMarketplace();

  window.clearTimeout(searchSaveTimer);
  searchSaveTimer = window.setTimeout(() => {
    if (searchQuery) saveRecentSearch(searchQuery);
  }, 350);
}

function handleSort(value) {
  currentSort = value || 'newest';
  visibleAppCount = INITIAL_VISIBLE_APPS;
  renderMarketplace();
}

function loadMoreApps() {
  visibleAppCount += LOAD_MORE_STEP;
  renderAppGrid();
}

function scrollCarousel(direction) {
  byId('featuredCarousel')?.scrollBy({ left: direction * 360, behavior: 'smooth' });
}

/* =============================
   MODALS AND APP DETAILS
   ============================= */
async function openAppModal(appId) {
  const app = getAppById(appId);
  const modal = byId('appModal');
  const content = byId('appModalContent');

  if (!app || !modal || !content) return;

  currentStarRating = 0;
  saveRecentView(app.id);

  let reviews = [];
  if (supabase && !usingDemoApps && isUuid(app.id)) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('app_id', app.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      reviews = safeArray(data);
    } catch (error) {
      console.warn('Review lookup failed:', error);
    }
  }

  const screenshots = safeArray(app.screenshots).length ? safeArray(app.screenshots) : [app.icon_url];
  const similar = allApps.filter((candidate) => candidate.category === app.category && String(candidate.id) !== String(app.id)).slice(0, 4);
  const appArg = serializeInlineValue(app.id);

  content.innerHTML = `
    <div class="app-modal-layout">
      <div class="app-modal-visual">
        <img class="hero-shot" src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" />
        <div class="screenshots-row">
          ${screenshots.map((shot) => `<img src="${escapeHtml(shot)}" alt="Screenshot for ${escapeHtml(app.name)}" />`).join('')}
        </div>
        <div class="detail-block">
          <h4>Similar Picks</h4>
          <div class="similar-grid">
            ${similar.length ? similar.map((item) => `
              <button class="similar-app" type="button" data-app-id="${escapeHtml(item.id)}">
                <img src="${escapeHtml(item.icon_url)}" alt="${escapeHtml(item.name)}" />
                <span>${escapeHtml(item.name)}</span>
              </button>
            `).join('') : '<span class="empty-helper">No similar apps yet.</span>'}
          </div>
        </div>
      </div>
      <div class="app-modal-copy">
        <div class="app-modal-heading">
          <span class="collection-label">${escapeHtml(app.category)}</span>
          <h2>${escapeHtml(app.name)}</h2>
          <p>by ${escapeHtml(app.developer_name)}</p>
        </div>
        <div class="app-modal-rating">
          <span class="stars">${getStarHTML(app.rating)}</span>
          <span>${(app.rating || 0).toFixed(1)} · ${formatNumber(app.downloads)} downloads</span>
        </div>
        <div class="app-modal-price">${formatCurrency(app.price)}</div>
        <p class="app-modal-desc">${escapeHtml(app.description)}</p>
        <div class="app-spec-grid">
          <div class="app-spec"><label>Version</label><span>${escapeHtml(app.version)}</span></div>
          <div class="app-spec"><label>Size</label><span>${escapeHtml(app.size)}</span></div>
          <div class="app-spec"><label>Tags</label><span>${escapeHtml(app.tags.join(', ') || 'N/A')}</span></div>
          <div class="app-spec"><label>Mode</label><span>${app.is_demo ? 'Demo data' : 'Live data'}</span></div>
        </div>
        <div class="app-modal-actions">
          <button class="btn-primary" type="button" onclick='addToCart(${appArg}); closeAppModal();'>
            <i class="fa-solid fa-cart-shopping"></i> Add to Cart
          </button>
          <button class="btn-ghost" type="button" onclick='toggleWishlist(${appArg});'>
            <i class="fa-${wishlist.has(String(app.id)) ? 'solid' : 'regular'} fa-heart"></i> ${wishlist.has(String(app.id)) ? 'Saved' : 'Wishlist'}
          </button>
        </div>
        <div class="detail-block">
          <h4>Reviews</h4>
          <div class="review-list">
            ${reviews.length ? reviews.map((review) => `
              <article class="review-item">
                <div class="review-head">
                  <div class="review-avatar">${escapeHtml((review.user_name || 'U').charAt(0).toUpperCase())}</div>
                  <div>
                    <strong>${escapeHtml(review.user_name || 'User')}</strong>
                    <span class="review-stars">${getStarHTML(review.rating)}</span>
                  </div>
                </div>
                <p>${escapeHtml(review.comment || '')}</p>
              </article>
            `).join('') : '<p class="empty-helper">No reviews yet. Be the first.</p>'}
          </div>
          ${currentUser ? `
            <div class="review-form">
              <h5>Write a review</h5>
              <div class="star-input" id="starInput">
                ${[1, 2, 3, 4, 5].map((star) => `<i class="fa-regular fa-star" data-rating="${star}" onclick="setStarRating(${star})"></i>`).join('')}
              </div>
              <textarea id="reviewComment" class="form-input" placeholder="Share your experience..."></textarea>
              <button class="btn-primary small" type="button" onclick='submitReview(${appArg})'>Submit Review</button>
            </div>
          ` : `<p class="empty-helper"><a onclick="closeAppModal(); setTimeout(() => openAuthModal('login'), 220)" style="cursor:pointer;color:var(--primary)">Sign in</a> to review this app.</p>`}
        </div>
      </div>
    </div>
  `;

  modal.classList.add('show');
  syncBodyScrollLock();
  renderRecentlyViewed();
}

function closeAppModal() {
  byId('appModal')?.classList.remove('show');
  syncBodyScrollLock();
}

function getStarHTML(rating) {
  let html = '';
  const score = Number(rating) || 0;
  for (let i = 1; i <= 5; i += 1) {
    if (i <= score) html += '<i class="fa-solid fa-star"></i>';
    else if (i - 0.5 <= score) html += '<i class="fa-solid fa-star-half-stroke"></i>';
    else html += '<i class="fa-regular fa-star"></i>';
  }
  return html;
}

function setStarRating(rating) {
  currentStarRating = rating;
  document.querySelectorAll('#starInput i').forEach((node) => {
    const nodeRating = Number(node.dataset.rating) || 0;
    node.className = nodeRating <= rating ? 'fa-solid fa-star active' : 'fa-regular fa-star';
  });
}

async function submitReview(appId) {
  const app = getAppById(appId);
  if (!supabase || !currentUser || !app || usingDemoApps || !isUuid(app.id)) {
    showToast('Reviews are unavailable right now.', 'error');
    return;
  }

  if (!currentStarRating) {
    showToast('Please select a rating.', 'error');
    return;
  }

  const comment = byId('reviewComment')?.value.trim() || '';

  try {
    const { error } = await supabase.from('reviews').insert({
      app_id: app.id,
      user_id: currentUser.id,
      user_name: userProfile?.full_name || currentUser.email?.split('@')[0] || 'User',
      rating: currentStarRating,
      comment,
      created_at: new Date().toISOString()
    });

    if (error) throw error;
    showToast('Review submitted.', 'success');
    closeAppModal();
    window.setTimeout(() => void openAppModal(app.id), 220);
  } catch (error) {
    showToast(error.message || 'Review submission failed.', 'error');
  }
}

/* =============================
   WISHLIST
   ============================= */
function saveWishlist() {
  writeStorage(STORAGE_KEYS.wishlist, [...wishlist]);
}

function toggleWishlist(appId, trigger = null) {
  const key = String(appId);
  if (wishlist.has(key)) {
    wishlist.delete(key);
    showToast('Removed from wishlist.', 'success');
  } else {
    wishlist.add(key);
    showToast('Added to wishlist.', 'success');
    if (trigger && window.gsap) {
      gsap.fromTo(trigger, { scale: 1.16 }, { scale: 1, duration: 0.28, ease: 'back.out(2)' });
    }
  }

  saveWishlist();
  renderMarketplace();
}

function openWishlist() {
  const modal = byId('appModal');
  const content = byId('appModalContent');
  if (!modal || !content) return;

  const apps = allApps.filter((app) => wishlist.has(String(app.id)));
  content.innerHTML = `
    <div class="simple-modal-pane">
      <h2><i class="fa-solid fa-heart"></i> Wishlist</h2>
      ${apps.length ? `<div class="library-grid">${apps.map((app) => libraryItemHTML(app)).join('')}</div>` : '<div class="library-empty"><i class="fa-regular fa-heart"></i><p>Your wishlist is empty.</p></div>'}
    </div>
  `;
  modal.classList.add('show');
  syncBodyScrollLock();
}

/* =============================
   CART
   ============================= */
function saveCart() {
  writeStorage(STORAGE_KEYS.cart, cart);
}

function addToCart(appId) {
  const app = getAppById(appId);
  if (!app) return;

  const existing = cart.find((item) => String(item.id) === String(app.id));
  if (existing) existing.qty += 1;
  else {
    cart.push({
      id: String(app.id),
      name: app.name,
      image_url: app.icon_url,
      price: Number(app.price) || 0,
      developer_id: app.developer_id || null,
      qty: 1
    });
  }

  saveCart();
  updateCartUI();
  showToast(`${app.name} added to cart.`, 'success');
}

function removeItem(appId) {
  cart = cart.filter((item) => String(item.id) !== String(appId));
  saveCart();
  updateCartUI();
}

function changeCartQty(appId, delta) {
  const item = cart.find((entry) => String(entry.id) === String(appId));
  if (!item) return;
  item.qty += delta;
  if (item.qty < 1) {
    removeItem(appId);
    return;
  }
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const list = byId('cartItems');
  const totalEl = byId('cartTotal');
  const finalEl = byId('finalTotal');
  const badge = byId('cart-count');
  const discountRow = byId('discountRow');
  const discountAmount = byId('discountAmount');

  if (!list) return;

  if (!cart.length) {
    list.innerHTML = '<div class="cart-empty"><i class="fa-solid fa-bag-shopping"></i><p>Your cart is empty.</p></div>';
  } else {
    list.innerHTML = cart.map((item) => `
      <article class="cart-item">
        <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.name)}" />
        <div class="cart-item-info">
          <h4>${escapeHtml(item.name)}</h4>
          <div class="ci-price">${formatCurrencyDetailed((Number(item.price) || 0) * (Number(item.qty) || 0))}</div>
          <div class="cart-item-actions">
            <button type="button" onclick='changeCartQty(${serializeInlineValue(item.id)}, -1)'>−</button>
            <span>${item.qty}</span>
            <button type="button" onclick='changeCartQty(${serializeInlineValue(item.id)}, 1)'>+</button>
            <button class="remove-item" type="button" onclick='removeItem(${serializeInlineValue(item.id)})'><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </article>
    `).join('');
  }

  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const discount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const finalTotal = subtotal - discount;
  const itemCount = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  if (totalEl) totalEl.textContent = formatCurrencyDetailed(subtotal);
  if (finalEl) finalEl.textContent = formatCurrencyDetailed(finalTotal);
  if (badge) badge.textContent = String(itemCount);

  if (discountRow && discountAmount) {
    if (discount > 0) {
      discountRow.style.display = 'flex';
      discountAmount.textContent = `- ${formatCurrencyDetailed(discount)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }
}

function toggleCart(forceOpen) {
  const overlay = byId('cartOverlay');
  const sidebar = byId('cartSidebar');
  if (!sidebar) return;

  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !sidebar.classList.contains('show');
  sidebar.classList.toggle('show', shouldOpen);
  overlay?.classList.toggle('show', shouldOpen);
  syncBodyScrollLock();
}

function applyCoupon() {
  const code = byId('couponInput')?.value.trim().toUpperCase();
  if (!code) {
    showToast('Enter a coupon code.', 'error');
    return;
  }

  if (coupons[code]) {
    appliedCoupon = { code, discount: coupons[code] };
    showToast(`Coupon applied. ${coupons[code] * 100}% off.`, 'success');
  } else {
    appliedCoupon = null;
    showToast('Invalid coupon code.', 'error');
  }

  updateCartUI();
}

/* =============================
   CHECKOUT
   ============================= */
function openCheckout() {
  if (!cart.length) {
    showToast('Your cart is empty.', 'error');
    return;
  }

  const summary = byId('orderSummaryItems');
  if (summary) {
    summary.innerHTML = cart.map((item) => `
      <div class="order-summary-item">
        <span>${escapeHtml(item.name)} × ${item.qty}</span>
        <span>${formatCurrencyDetailed((Number(item.price) || 0) * (Number(item.qty) || 0))}</span>
      </div>
    `).join('');
  }

  toggleCart(false);
  byId('checkoutModal')?.classList.add('show');
  syncBodyScrollLock();
}

function closeCheckout() {
  byId('checkoutModal')?.classList.remove('show');
  syncBodyScrollLock();
}

async function submitOrder(event) {
  event.preventDefault();
  if (!cart.length) return;

  const button = byId('checkoutBtn');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
  }

  const name = byId('custName')?.value.trim();
  const email = byId('custEmail')?.value.trim();
  const phone = byId('custPhone')?.value.trim();
  const address = byId('custAddress')?.value.trim();

  if (!name || !email || !phone || !address) {
    showToast('Please fill all required fields.', 'error');
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm Order';
    }
    return;
  }

  const items = cart.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    qty: item.qty,
    developer_id: item.developer_id
  }));

  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
  const discountAmount = appliedCoupon ? subtotal * appliedCoupon.discount : 0;
  const total = subtotal - discountAmount;

  const order = {
    id: `order-${Date.now()}`,
    name,
    email,
    phone,
    address,
    items,
    subtotal,
    discount: discountAmount,
    total,
    coupon_code: appliedCoupon?.code || null,
    user_id: currentUser?.id || null,
    status: 'pending',
    created_at: new Date().toISOString()
  };

  const canPersistRemote =
    Boolean(supabase) &&
    !usingDemoApps &&
    items.every((item) => isUuid(item.id)) &&
    (!currentUser || isUuid(currentUser.id));

  if (canPersistRemote) {
    try {
      const { error } = await supabase.from('orders').insert(order);
      if (error) throw error;
    } catch (error) {
      showToast(error.message || 'Failed to place order.', 'error');
      if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm Order';
      }
      return;
    }
  } else {
    persistOrderLocally({
      ...order,
      source: usingDemoApps ? 'demo' : 'local-fallback'
    });
  }

  cart = [];
  appliedCoupon = null;
  saveCart();
  updateCartUI();
  closeCheckout();

  if (button) {
    button.disabled = false;
    button.innerHTML = '<i class="fa-solid fa-check-circle"></i> Confirm Order';
  }

  byId('successOrderId').textContent = `Order #${String(order.id).replace('order-', 'ORD-')}`;
  byId('successModal')?.classList.add('show');
  syncBodyScrollLock();
  showToast('Order placed successfully.', 'success');
}

function closeSuccess() {
  byId('successModal')?.classList.remove('show');
  syncBodyScrollLock();
}

/* =============================
   LIBRARY
   ============================= */
async function openLibrary() {
  if (!currentUser) {
    openAuthModal('login');
    return;
  }

  const modal = byId('libraryModal');
  const content = byId('libraryContent');
  if (!modal || !content) return;

  let purchasedIds = [];

  if (supabase && currentUser && isUuid(currentUser.id)) {
    try {
      const { data, error } = await supabase.from('orders').select('items').eq('user_id', currentUser.id);
      if (error) throw error;
      purchasedIds = safeArray(data).flatMap((order) => safeArray(order.items)).map((item) => String(item.id));
    } catch (error) {
      console.warn('Remote library fetch failed:', error);
    }
  }

  const localIds = getLocalOrders()
    .filter((order) => !currentUser || String(order.user_id || '') === String(currentUser.id || ''))
    .flatMap((order) => safeArray(order.items))
    .map((item) => String(item.id));

  const uniqueIds = [...new Set([...purchasedIds, ...localIds])];
  const apps = allApps.filter((app) => uniqueIds.includes(String(app.id)));

  content.innerHTML = apps.length
    ? apps.map((app) => libraryItemHTML(app)).join('')
    : '<div class="library-empty"><i class="fa-solid fa-book-open"></i><p>No purchased apps yet.</p></div>';

  modal.classList.add('show');
  syncBodyScrollLock();
}

function closeLibrary() {
  byId('libraryModal')?.classList.remove('show');
  syncBodyScrollLock();
}

function libraryItemHTML(app) {
  return `
    <article class="library-item">
      <img src="${escapeHtml(app.icon_url)}" alt="${escapeHtml(app.name)}" />
      <h4>${escapeHtml(app.name)}</h4>
      <p>${escapeHtml(app.category)}</p>
      <a class="btn-primary small" href="${escapeHtml(app.download_url || '#')}" target="_blank" rel="noopener noreferrer">
        <i class="fa-solid fa-download"></i> Download
      </a>
    </article>
  `;
}

/* =============================
   FEEDBACK
   ============================= */
function showToast(message, type = 'success') {
  const toast = byId('toast');
  if (!toast) return;

  const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
  toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 3200);
}

/* =============================
   MOBILE
   ============================= */
function toggleMobileMenu(forceOpen) {
  const menu = byId('mobileMenu');
  if (!menu) return;
  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !menu.classList.contains('open');
  menu.classList.toggle('open', shouldOpen);
  syncBodyScrollLock();
}
