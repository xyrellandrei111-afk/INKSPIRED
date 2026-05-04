/**
 * INKSPIRED Enhanced - MODA STUDIO ANIMATIONS + PREMIUM FEATURES
 * Complete GSAP ScrollTrigger, product ratings, admin flow, canvas improvements
 * All original functionality preserved + enhanced
 */
"use strict";

console.log('INKSPIRED Premium Edition - Loading...');

/* =============================
    CONFIG & CONSTANTS
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
    id: 'demo-classic-ballpoint',
    name: 'Classic Ballpoint',
    description: 'Smooth-writing ballpoint pen with precision tip and reliable ink flow. Perfect for everyday writing.',
    icon_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-1',
    price: 195,
    category: 'Ballpen',
    rating: 4.8,
    downloads: 12400,
    created_at: '2026-04-19T12:00:00.000Z',
    is_featured: true,
    tags: ['ballpoint', 'everyday', 'reliable'],
    version: '1.0',
    size: '12g',
    download_url: '#',
    short_blurb: 'Smooth everyday writing.',
    is_demo: true
  },
  {
    id: 'demo-retractable-ball',
    name: 'Retractable Elite',
    description: 'Premium retractable ballpoint with quick-click mechanism and ergonomic grip for all-day comfort.',
    icon_url: 'https://images.unsplash.com/photo-1590787506793-b63ff15700a8?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1590787506793-b63ff15700a8?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-2',
    price: 289,
    category: 'Ballpen',
    rating: 4.6,
    downloads: 8200,
    created_at: '2026-03-22T12:00:00.000Z',
    is_featured: true,
    tags: ['retractable', 'click', 'office'],
    version: '1.2',
    size: '15g',
    download_url: '#',
    short_blurb: 'One-click convenience.',
    is_demo: true
  },
  {
    id: 'demo-gold-fountain',
    name: 'Gold Nib Fountain',
    description: '18k gold nib fountain pen with smooth ink flow and hand-polished body. A true writing instrument.',
    icon_url: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-3',
    price: 1299,
    category: 'Fountain',
    rating: 4.9,
    downloads: 3400,
    created_at: '2026-04-25T12:00:00.000Z',
    is_featured: true,
    tags: ['fountain', 'gold nib', 'luxury'],
    version: '2.0',
    size: '28g',
    download_url: '#',
    short_blurb: 'Luxury writing perfected.',
    is_demo: true
  },
  {
    id: 'demo-smooth-gel',
    name: 'Silk Gel Ink',
    description: 'Ultra-smooth gel ink pen with quick-drying formula and vibrant color payoff. No smudges, just flow.',
    icon_url: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-4',
    price: 85,
    category: 'Gel',
    rating: 4.5,
    downloads: 18900,
    created_at: '2026-04-17T12:00:00.000Z',
    is_featured: true,
    tags: ['gel', 'smooth', 'vibrant'],
    version: '1.5',
    size: '10g',
    download_url: '#',
    short_blurb: 'Glides across paper.',
    is_demo: true
  },
  {
    id: 'demo-accent-marker',
    name: 'Dual Tip Marker Set',
    description: 'Double-ended art marker set with 48 colors. Perfect for highlighting, sketching, and detailed art.',
    icon_url: 'https://images.unsplash.com/photo-1550593854-2f2c99675207?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1550593854-2f2c99675207?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-5',
    price: 599,
    category: 'Marker',
    rating: 4.4,
    downloads: 6700,
    created_at: '2026-02-20T12:00:00.000Z',
    is_featured: false,
    tags: ['marker', 'art', 'color'],
    version: '3.0',
    size: '450g',
    download_url: '#',
    short_blurb: 'Color your world.',
    is_demo: true
  },
  {
    id: 'demo-rollerball-exe',
    name: 'Executive Rollerball',
    description: 'Fine-point rollerball pen with water-based ink for exceptional glide and professional appearance.',
    icon_url: 'https://images.unsplash.com/photo-1579783483458-83d02c62b4a6?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1579783483458-83d02c62b4a6?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-6',
    price: 349,
    category: 'Ballpen',
    rating: 4.3,
    downloads: 9100,
    created_at: '2026-04-27T12:00:00.000Z',
    is_featured: false,
    tags: ['rollerball', 'fine-point', 'premium'],
    version: '1.8',
    size: '18g',
    download_url: '#',
    short_blurb: 'Business-class comfort.',
    is_demo: true
  },
  {
    id: 'demo-calligraphy-set',
    name: 'Calligraphy Master Set',
    description: 'Complete calligraphy pen set with 6 nib sizes and archival ink. Create stunning lettering and art.',
    icon_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-7',
    price: 899,
    category: 'Fountain',
    rating: 4.7,
    downloads: 4300,
    created_at: '2026-03-11T12:00:00.000Z',
    is_featured: false,
    tags: ['calligraphy', 'fountain', 'art'],
    version: '2.3',
    size: '320g',
    download_url: '#',
    short_blurb: 'Write like a master.',
    is_demo: true
  },
  {
    id: 'demo-neon-gel-pack',
    name: 'Neon Gel Pen Pack',
    description: '12-pack vibrant neon gel pens. Smooth ink flow, zero smudge, perfect for journals and art projects.',
    icon_url: 'https://images.unsplash.com/photo-1513682406216-2c17f2ea31bb?w=800&auto=format&fit=crop',
    screenshots: ['https://images.unsplash.com/photo-1513682406216-2c17f2ea31bb?w=1200&auto=format&fit=crop'],
    developer_name: 'INKSPIRED',
    developer_id: 'demo-ink-8',
    price: 249,
    category: 'Gel',
    rating: 4.2,
    downloads: 11200,
    created_at: '2026-04-08T12:00:00.000Z',
    is_featured: false,
    tags: ['gel', 'neon', 'pack'],
    version: '1.0',
    size: '150g',
    download_url: '#',
    short_blurb: 'Bold colors, bold ideas.',
    is_demo: true
  }
];

/* =============================
   STATE
   ============================= */
// Check if supabase is already defined before declaring
// This prevents the "already declared" crash
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
let _hasRenderedOnce = false;

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
      '<': '<',
      '>': '>',
      '"': '"',
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

function openCart() {
  const sidebar = byId('cartSidebar');
  const overlay = byId('cartOverlay');
  if (sidebar && overlay) {
    sidebar.classList.add('open');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function closeCart() {
  const sidebar = byId('cartSidebar');
  const overlay = byId('cartOverlay');
  if (sidebar && overlay) {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function syncBodyScrollLock() {
  const shouldLock = Boolean(document.querySelector('.cart-sidebar.open, .checkout-modal.show, .success-modal.show'));
  document.body.style.overflow = shouldLock ? 'hidden' : '';
}

/* =============================
   ANIMATED BACKGROUND PARTICLES & ORBS
   ============================= */
function initParticlesAndOrbs() {
  // Create floating particles
  const particlesContainer = byId('particles');
  if (!particlesContainer) return;

  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.top = Math.random() * 100 + 'vh';
    p.style.animationDelay = (Math.random() * -20) + 's';
    p.style.animationDuration = (10 + Math.random() * 8) + 's';
    particlesContainer.appendChild(p);
  }

  // Create floating orbs in DOM
  const floatingContainer = byId('floatingElements');
  if (!floatingContainer) return;

  const orbData = [
    { color: 'linear-gradient(135deg, #ffb5c5 0%, #ffc9de 100%)', delay: 0, size: 400 },
    { color: 'linear-gradient(135deg, #ffc9de 0%, #ffdfdf 100%)', delay: -8, size: 300 },
    { color: 'linear-gradient(135deg, #ff9ca8 0%, #ffb5c5 100%)', delay: -15, size: 350 }
  ];

  orbData.forEach((orb, i) => {
    const el = document.createElement('div');
    el.className = 'floating-orb';
    el.style.background = orb.color;
    el.style.width = orb.size + 'px';
    el.style.height = orb.size + 'px';
    el.style.animationDelay = orb.delay + 's';
    el.style.top = (i === 0 ? '10%' : i === 1 ? '50%' : '10%');
    el.style.left = (i === 0 ? '-100px' : i === 1 ? 'auto' : '30%');
    el.style.right = (i === 1 ? '-80px' : 'auto');
    el.style.bottom = (i === 2 ? '10%' : 'auto');
    floatingContainer.appendChild(el);
  });

  // Mouse glow follows cursor (CSS + JS update)
  const mouseGlow = byId('mouseGlow');
  if (!mouseGlow) return;

document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
      mouseGlow.style.left = e.clientX + 'px';
      mouseGlow.style.top = e.clientY + 'px';
    });
  });
}

/* =============================
   SEARCH MODAL FUNCTIONS
   ============================= */
function openSearchModal() {
  const modal = byId('searchModal');
  const overlay = byId('searchOverlay');
  if (modal && overlay) {
    modal.classList.add('show');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const input = byId('globalSearchInput');
      if (input) {
        input.value = '';
        input.focus();
      }
    }, 100);
  }
}

function closeSearchModal() {
  const modal = byId('searchModal');
  const overlay = byId('searchOverlay');
  if (modal && overlay) {
    modal.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
    const input = byId('globalSearchInput');
    if (input) input.value = '';
    showSearchHint();
  }
}

function showSearchHint() {
  const results = byId('searchResults');
  if (results) {
    results.innerHTML = `
      <div class="search-hint">
        <i class="ti ti-search"></i>
        <p>Start typing to search products...</p>
      </div>
    `;
  }
}

function performSearch(query) {
  const results = byId('searchResults');
  if (!results) return;
  
  query = query.toLowerCase().trim();
  
  if (!query) {
    showSearchHint();
    return;
  }
  
  const products = [
    { id: 'sovereign', name: 'The Sovereign', category: 'Fountain', price: 450 },
    { id: 'rose-marble', name: 'Rose Marble', category: 'Ballpen', price: 400 },
    { id: 'midnight-matte', name: 'Midnight Matte', category: 'Rollerball', price: 150 },
    { id: 'classic-ballpoint', name: 'Classic Ballpoint', category: 'Ballpen', price: 195 },
    { id: 'retractable-elite', name: 'Retractable Elite', category: 'Ballpen', price: 289 },
    { id: 'gold-fountain', name: 'Gold Nib Fountain', category: 'Fountain', price: 1000 },
    { id: 'silk-gel', name: 'Silk Gel Ink', category: 'Gel', price: 85 },
    { id: 'dual-marker', name: 'Dual Tip Marker Set', category: 'Marker', price: 599 },
    { id: 'executive', name: 'Executive Rollerball', category: 'Ballpen', price: 300 },
    { id: 'calligraphy', name: 'Calligraphy Master Set', category: 'Fountain', price: 899 },
    { id: 'neon-gel', name: 'Neon Gel Pen Pack', category: 'Gel', price: 249 }
  ];
  
  const matches = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query)
  );
  
  if (matches.length === 0) {
    results.innerHTML = `
      <div class="search-hint">
        <i class="ti ti-search"></i>
        <p>No products found. Try a different search term.</p>
      </div>
    `;
    return;
  }
  
  results.innerHTML = matches.map(p => `
    <div class="search-result-item" onclick="quickAddToCart('${p.id}', '${p.name}', ${p.price})">
      <img src="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=100&q=80" alt="${p.name}">
      <div class="search-result-info">
        <h4>${p.name}</h4>
        <p>${p.category}</p>
      </div>
      <span class="search-result-price">₱ ${p.price.toLocaleString()}</span>
    </div>
  `).join('');
}

function quickAddToCart(id, name, price) {
  addToCart(id, name, price);
  closeSearchModal();
  showToast(`${name} added to cart!`);
}

function showToast(message) {
  let toast = byId('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* =============================
   USER MENU FUNCTIONS
   ============================= */
function openUserMenu() {
  const menu = byId('userMenu');
  const overlay = byId('userOverlay');
  if (menu && overlay) {
    menu.classList.add('show');
    overlay.classList.add('show');
  }
}

function closeUserMenu() {
  const menu = byId('userMenu');
  const overlay = byId('userOverlay');
  if (menu && overlay) {
    menu.classList.remove('show');
    overlay.classList.remove('show');
  }
}

/* =============================
   MOBILE MENU FUNCTIONS
   ============================= */
function toggleMobileMenu() {
  const panel = byId('mobileMenuPanel');
  const overlay = byId('mobileMenuOverlay');
  if (panel && overlay) {
    if (panel.classList.contains('show')) {
      closeMobileMenu();
    } else {
      panel.classList.add('show');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }
}

function closeMobileMenu() {
  const panel = byId('mobileMenuPanel');
  const overlay = byId('mobileMenuOverlay');
  if (panel && overlay) {
    panel.classList.remove('show');
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

/* =============================
   CART FUNCTIONS (Enhanced)
   ============================= */
function addToCart(id, name, price, category = 'Pen') {
  let cart = [];
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.cart);
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
  
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty = (existing.qty || 1) + 1;
  } else {
    cart.push({ id, name, price, qty: 1, category, image: getProductImage(id) });
  }
  
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  updateCartDisplay();
  showToast(`${name} added to cart!`);
}

function getProductImage(id) {
  const images = {
    'sovereign': 'https://images.unsplash.com/photo-1513542992587-cd39ba97057c?w=200&q=80',
    'rose-marble': 'https://images.unsplash.com/photo-1541693560393-26ac180b567b?w=200&q=80',
    'midnight-matte': 'https://images.unsplash.com/photo-1547516508-9534317dc5c5?w=200&q=80'
  };
  return images[id] || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&q=80';
}

function updateCartDisplay() {
  const countEl = byId('cart-count');
  const badge = document.getElementById('cart-count-badge');
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    
    if (countEl) countEl.textContent = count;
    if (badge) badge.textContent = count;
    
    // Also update cart sidebar items
    renderCartItems();
  } catch (e) {
    if (countEl) countEl.textContent = '0';
  }
}

function renderCartItems() {
  const container = byId('cartItems');
  if (!container) return;
  
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    
    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="ti ti-shopping-bag"></i>
          <p>Your cart is empty.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <div class="cart-item-img-wrap">
          <img src="${item.image || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&q=80'}" alt="${item.name}" class="cart-item-img">
        </div>
        <div class="cart-item-details">
          <div class="cart-item-top">
            <div>
              <h4 class="cart-item-name">${item.name}</h4>
              <p class="cart-item-category">${item.category || 'Pen'}</p>
            </div>
            <button type="button" class="cart-item-remove" onclick="removeFromCart('${item.id}')" aria-label="Remove item">
              <i class="ti ti-trash"></i>
            </button>
          </div>
          <div class="cart-item-bottom">
            <span class="cart-item-price">₱ ${(item.price || 0).toLocaleString()}</span>
            <div class="cart-item-controls">
              <button type="button" class="qty-btn" onclick="updateQuantity('${item.id}', -1)">−</button>
              <span class="qty-display">${item.qty || 1}</span>
              <button type="button" class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    updateCartTotals();
  } catch (e) {
    container.innerHTML = '<div class="cart-empty"><i class="ti ti-shopping-bag"></i><p>Error loading cart.</p></div>';
  }
}

function updateQuantity(id, change) {
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    const item = cart.find(i => i.id === id);
    
    if (item) {
      item.qty = (item.qty || 1) + change;
      if (item.qty <= 0) {
        cart.splice(cart.indexOf(item), 1);
      }
    }
    
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
    updateCartDisplay();
  } catch (e) {
    console.error('Error updating quantity:', e);
  }
}

function removeFromCart(id) {
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    const index = cart.findIndex(i => i.id === id);
    
    if (index > -1) {
      cart.splice(index, 1);
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
      updateCartDisplay();
      showToast('Item removed from cart');
    }
  } catch (e) {
    console.error('Error removing item:', e);
  }
}

function updateCartTotals() {
  try {
    const cart = JSON.parse(localStorage.getItem(STORAGE_KEYS.cart) || '[]');
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
    
    const subtotalEl = document.getElementById('cartSubtotal');
    const totalEl = document.getElementById('cartTotal');
    
    if (subtotalEl) subtotalEl.textContent = `₱ ${subtotal.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `₱ ${subtotal.toLocaleString()}`;
  } catch (e) {
    console.error('Error updating totals:', e);
  }
}

/* =============================
   PRODUCT DATA & RENDERING
   ============================= */
const PRODUCTS_DATA = [
  {
    id: 'sovereign',
    name: 'The Sovereign',
    category: 'Fountain',
    price: 2450,
    description: '18k gold nib fountain pen with smooth ink flow and hand-polished body. A true writing instrument of distinction.',
    image: 'https://images.unsplash.com/photo-1513542992587-cd39ba97057c?w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 128,
    badge: 'BEST SELLER'
  },
  {
    id: 'rose-marble',
    name: 'Rose Marble',
    category: 'Ballpen',
    price: 1850,
    description: 'Signature ballpoint pen with exquisite rose marble body. Smooth writing experience with premium ink refill.',
    image: 'https://images.unsplash.com/photo-1541693560393-26ac180b567b?w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 96
  },
  {
    id: 'midnight-matte',
    name: 'Midnight Matte',
    category: 'Rollerball',
    price: 1650,
    description: 'Executive rollerball with matte black finish. Fine-point precision and water-based ink for exceptional glide.',
    image: 'https://images.unsplash.com/photo-1547516508-9534317dc5c5?w=800&auto=format&fit=crop',
    rating: 4.7,
    reviews: 84
  },
  {
    id: 'classic-ballpoint',
    name: 'Classic Ballpoint',
    category: 'Ballpen',
    price: 195,
    description: 'Smooth-writing ballpoint pen with precision tip and reliable ink flow. Perfect for everyday writing.',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop',
    rating: 4.8,
    reviews: 12400
  },
  {
    id: 'retractable-elite',
    name: 'Retractable Elite',
    category: 'Ballpen',
    price: 289,
    description: 'Premium retractable ballpoint with quick-click mechanism and ergonomic grip for all-day comfort.',
    image: 'https://images.unsplash.com/photo-1590787506793-b63ff15700a8?w=800&auto=format&fit=crop',
    rating: 4.6,
    reviews: 8200
  },
  {
    id: 'gold-fountain',
    name: 'Gold Nib Fountain',
    category: 'Fountain',
    price: 1299,
    description: '18k gold nib fountain pen with smooth ink flow and hand-polished body. A true writing instrument.',
    image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&auto=format&fit=crop',
    rating: 4.9,
    reviews: 3400
  },
  {
    id: 'silk-gel',
    name: 'Silk Gel Ink',
    category: 'Gel',
    price: 85,
    description: 'Ultra-smooth gel ink pen with quick-drying formula and vibrant color payoff. No smudges, just flow.',
    image: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800&auto=format&fit=crop',
    rating: 4.5,
    reviews: 18900
  },
  {
    id: 'dual-marker',
    name: 'Dual Tip Marker Set',
    category: 'Marker',
    price: 599,
    description: 'Double-ended art marker set with 48 colors. Perfect for highlighting, sketching, and detailed art.',
    image: 'https://images.unsplash.com/photo-1550593854-2f2c99675207?w=800&auto=format&fit=crop',
    rating: 4.4,
    reviews: 6700
  },
  {
    id: 'executive',
    name: 'Executive Rollerball',
    category: 'Ballpen',
    price: 349,
    description: 'Fine-point rollerball pen with water-based ink for exceptional glide and professional appearance.',
    image: 'https://images.unsplash.com/photo-1579783483458-83d02c62b4a6?w=800&auto=format&fit=crop',
    rating: 4.3,
    reviews: 9100
  },
  {
    id: 'calligraphy',
    name: 'Calligraphy Master Set',
    category: 'Fountain',
    price: 899,
    description: 'Complete calligraphy pen set with 6 nib sizes and archival ink. Create stunning lettering and art.',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop',
    rating: 4.7,
    reviews: 4300
  },
  {
    id: 'neon-gel',
    name: 'Neon Gel Pen Pack',
    category: 'Gel',
    price: 249,
    description: '12-pack vibrant neon gel pens. Smooth ink flow, zero smudge, perfect for journals and art projects.',
    image: 'https://images.unsplash.com/photo-1513682406216-2c17f2ea31bb?w=800&auto=format&fit=crop',
    rating: 4.2,
    reviews: 11200
  }
];

function renderProducts(products, containerId = 'appGrid') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (products.length === 0) {
    container.innerHTML = `
      <div class="products-loading">
        <i class="ti ti-inbox" style="font-size: 3rem; color: #c25e7c; margin-bottom: 16px;"></i>
        <p>No products found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card" data-id="${product.id}" data-cat="${product.category}">
      <div class="card-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="card-add-btn" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.category}')" aria-label="Add ${product.name} to cart">
          <i class="ti ti-plus"></i>
        </div>
      </div>
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <h3 class="card-name">${product.name}</h3>
        <div class="card-meta">
          <div class="card-rating">
            ${generateStars(product.rating)}
            <span>${product.rating} (${product.reviews.toLocaleString()})</span>
          </div>
          <span class="card-price">₱ ${product.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Animate cards on scroll
  if (typeof gsap !== 'undefined') {
    gsap.utils.toArray('.product-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 85%'
        },
        duration: 1,
        y: 60,
        opacity: 0,
        delay: i % 4 * 0.1,
        ease: 'power4.out'
      });
    });
  }
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  let stars = '';
  
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<i class="ti ti-star-filled"></i>';
    } else if (i === fullStars + 1 && hasHalf) {
      stars += '<i class="ti ti-star-half-filled"></i>';
    } else {
      stars += '<i class="ti ti-star"></i>';
    }
  }
  return stars;
}

function filterProducts(category) {
  const filtered = category === 'All' 
    ? PRODUCTS_DATA 
    : PRODUCTS_DATA.filter(p => p.category.toLowerCase() === category.toLowerCase());
  renderProducts(filtered);
}

function handleSearch(query) {
  const q = query.toLowerCase().trim();
  if (!q) {
    renderProducts(PRODUCTS_DATA);
    return;
  }
  const results = PRODUCTS_DATA.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  );
  renderProducts(results);
}

function loadProductsFromStorage() {
  // Products are static, so just render all
  renderProducts(PRODUCTS_DATA);
}

/* =============================
   USER AUTH & PROFILE
   ============================= */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('inkspired_user'));
  } catch (e) {
    return null;
  }
}

function updateNavUserState() {
  const user = getUser();
  const desktopIcons = document.querySelectorAll('a.nav-link-pill[href="signin.html"], a.nav-link-pill[href="profile.html"]');
  desktopIcons.forEach(el => {
    if (user) {
      el.href = 'profile.html';
      el.innerHTML = '<i class="ti ti-user"></i>';
      el.setAttribute('aria-label', 'My Profile');
    } else {
      el.href = 'signin.html';
      el.innerHTML = '<i class="ti ti-user"></i>';
      el.setAttribute('aria-label', 'Sign in');
    }
  });

  // Update mobile menu links
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a[href="signin.html"], .mobile-menu-links a[href="profile.html"]');
  mobileLinks.forEach(link => {
    if (user) {
      link.href = 'profile.html';
      link.innerHTML = '<i class="ti ti-user"></i> My Profile';
    } else {
      link.href = 'signin.html';
      link.innerHTML = '<i class="ti ti-user"></i> Sign In';
    }
  });
}

function signOut() {
  localStorage.removeItem('inkspired_user');
  updateNavUserState();
  window.location.href = 'index.html';
}

/* =============================
   USER AUTH & PROFILE
   ============================= */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('inkspired_user'));
  } catch (e) {
    return null;
  }
}

function updateNavUserState() {
  const user = getUser();
  // Update desktop nav icons (all pages)
  const desktopIcons = document.querySelectorAll('a.nav-link-pill[href="signin.html"], a.nav-link-pill[href="profile.html"]');
  desktopIcons.forEach(el => {
    if (user) {
      el.href = 'profile.html';
      el.setAttribute('aria-label', 'My Profile');
    } else {
      el.href = 'signin.html';
      el.setAttribute('aria-label', 'Sign in');
    }
  });

  // Update mobile menu links (all pages)
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a[href="signin.html"], .mobile-menu-links a[href="profile.html"]');
  mobileLinks.forEach(link => {
    if (user) {
      link.href = 'profile.html';
      link.innerHTML = '<i class="ti ti-user"></i> My Profile';
    } else {
      link.href = 'signin.html';
      link.innerHTML = '<i class="ti ti-user"></i> Sign In';
    }
  });
}

function signOut() {
  localStorage.removeItem('inkspired_user');
  updateNavUserState();
  // Close user menu if open
  const menu = document.getElementById('userMenu');
  const overlay = document.getElementById('userOverlay');
  if (menu && overlay) {
    menu.classList.remove('show');
    overlay.classList.remove('show');
  }
}

/* =============================
   USER AUTH & PROFILE
   ============================= */
function getUser() {
  try {
    return JSON.parse(localStorage.getItem('inkspired_user'));
  } catch (e) {
    return null;
  }
}

function updateNavUserState() {
  const user = getUser();
  // Update desktop nav icons (all pages)
  const desktopIcons = document.querySelectorAll('a.nav-link-pill[href="signin.html"], a.nav-link-pill[href="profile.html"]');
  desktopIcons.forEach(el => {
    if (user) {
      el.href = 'profile.html';
      el.setAttribute('aria-label', 'My Profile');
    } else {
      el.href = 'signin.html';
      el.setAttribute('aria-label', 'Sign in');
    }
  });

  // Update mobile menu links (all pages)
  const mobileLinks = document.querySelectorAll('.mobile-menu-links a[href="signin.html"], .mobile-menu-links a[href="profile.html"]');
  mobileLinks.forEach(link => {
    if (user) {
      link.href = 'profile.html';
      link.innerHTML = '<i class="ti ti-user"></i> My Profile';
    } else {
      link.href = 'signin.html';
      link.innerHTML = '<i class="ti ti-user"></i> Sign In';
    }
  });
}

function signOut() {
  localStorage.removeItem('inkspired_user');
  updateNavUserState();
  // Close user menu if open
  const menu = document.getElementById('userMenu');
  const overlay = document.getElementById('userOverlay');
  if (menu && overlay) {
    menu.classList.remove('show');
    overlay.classList.remove('show');
  }
}

/* =============================
   INITIALIZE
   ============================= */
document.addEventListener('DOMContentLoaded', () => {
  initParticlesAndOrbs();
  updateCartDisplay();
  updateNavUserState();
  
  // Load products on any page with #appGrid
  if (document.getElementById('appGrid')) {
    loadProductsFromStorage();
  }

  // Category filter - only on products page
  const productsFilters = document.querySelector('.products-filters .category-tabs');
  if (productsFilters) {
    const categoryTabs = productsFilters.querySelectorAll('.tab');
    categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.getAttribute('data-cat');
        filterProducts(cat);
      });
    });
  }

  // Search input on products page only
  const productsSearchBox = document.querySelector('.products-filters .search-box #searchInput');
  if (productsSearchBox) {
    productsSearchBox.addEventListener('input', (e) => {
      handleSearch(e.target.value);
    });
  }

   // Close modals on escape key
   document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
       closeSearchModal();
       closeUserMenu();
       closeMobileMenu();
     }
   });
});

