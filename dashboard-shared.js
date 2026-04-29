(function initDashboardShared() {
  const config = window.INKSPIRED_CONFIG || {};

  const STORAGE_KEYS = {
    demoApps: 'inkspired_demo_apps_v1',
    localOrders: 'inkspired_orders_v2',
    dashboardMode: 'inkspired_dashboard_mode_v1',
    ...config.storageKeys
  };

  const CATEGORY_OPTIONS = [
    'Design',
    'Productivity',
    'Writing',
    'Marketing',
    'Developer',
    'Finance',
    'Development',
    'Photography',
    'Music',
    'Video',
    'Utilities',
    'Education'
  ];

  const DEMO_USERS = [
    { id: 'demo-admin-1', email: 'admin@inkspired.demo', full_name: 'INKSPIRED Admin', role: 'admin', created_at: '2026-04-01T09:00:00.000Z' },
    { id: 'demo-dev-1', email: 'studiocraft@inkspired.demo', full_name: 'StudioCraft', role: 'developer', created_at: '2026-03-18T09:00:00.000Z' },
    { id: 'demo-dev-2', email: 'northbyte@inkspired.demo', full_name: 'Northbyte', role: 'developer', created_at: '2026-03-24T09:00:00.000Z' },
    { id: 'demo-user-1', email: 'mika@inkspired.demo', full_name: 'Mika Santillan', role: 'customer', created_at: '2026-04-11T09:00:00.000Z' },
    { id: 'demo-user-2', email: 'carlos@inkspired.demo', full_name: 'Carlos Mendoza', role: 'customer', created_at: '2026-04-19T09:00:00.000Z' }
  ];

  const SEEDED_DEMO_APPS = [
    {
      id: 'demo-app-inkflow',
      developer_id: 'demo-dev-1',
      developer_name: 'StudioCraft',
      name: 'InkFlow Pro',
      slug: 'inkflow-pro',
      short_desc: 'AI-powered visual design suite.',
      description: 'Advanced digital painting workspace with AI brushes, live layer comps, and export kits for client-ready visuals.',
      category: 'Design',
      tags: ['design', 'illustration', 'workflow'],
      price: 850,
      version: '3.4.1',
      icon_url: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&auto=format&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&auto=format&fit=crop'],
      download_url: '#',
      size: '412 MB',
      features: ['AI brushes', 'Layer presets', 'Export kits'],
      requirements: 'Windows 10+, 8GB RAM',
      compatibility: 'Desktop',
      support_email: 'support@studiocraft.demo',
      documentation_url: '#',
      rating: 4.8,
      downloads: 12400,
      review_count: 112,
      is_featured: true,
      status: 'approved',
      created_at: '2026-04-19T12:00:00.000Z'
    },
    {
      id: 'demo-app-briefloop',
      developer_id: 'demo-dev-1',
      developer_name: 'StudioCraft',
      name: 'BriefLoop',
      slug: 'briefloop',
      short_desc: 'Client handoff, minus the chaos.',
      description: 'A brief and feedback manager for agencies with reusable questionnaires, approval tracking, and client comments.',
      category: 'Productivity',
      tags: ['briefs', 'clients', 'feedback'],
      price: 349,
      version: '1.4.2',
      icon_url: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800&auto=format&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&auto=format&fit=crop'],
      download_url: '#',
      size: '80 MB',
      features: ['Reusable intake forms', 'Client approval timelines'],
      requirements: 'Modern browser',
      compatibility: 'Web',
      support_email: 'support@studiocraft.demo',
      documentation_url: '#',
      rating: 4.6,
      downloads: 4300,
      review_count: 48,
      is_featured: false,
      status: 'pending',
      created_at: '2026-04-08T12:00:00.000Z'
    },
    {
      id: 'demo-app-stackscope',
      developer_id: 'demo-dev-2',
      developer_name: 'Northbyte',
      name: 'StackScope',
      slug: 'stackscope',
      short_desc: 'For teams who debug in style.',
      description: 'A polished developer toolkit for API introspection, environment diffing, logs, and scheduled job debugging.',
      category: 'Developer',
      tags: ['developer', 'debug', 'api'],
      price: 1099,
      version: '6.0.0',
      icon_url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=1200&auto=format&fit=crop'],
      download_url: '#',
      size: '520 MB',
      features: ['Environment diffing', 'Log time travel'],
      requirements: 'macOS / Windows',
      compatibility: 'Desktop',
      support_email: 'hello@northbyte.demo',
      documentation_url: '#',
      rating: 4.9,
      downloads: 6600,
      review_count: 73,
      is_featured: true,
      status: 'approved',
      created_at: '2026-04-27T12:00:00.000Z'
    },
    {
      id: 'demo-app-cashcanvas',
      developer_id: 'demo-dev-2',
      developer_name: 'Northbyte',
      name: 'CashCanvas',
      slug: 'cashcanvas',
      short_desc: 'Finance clarity for solo teams.',
      description: 'A finance dashboard for creators with invoice pipelines, runway snapshots, and tax-friendly income categorization.',
      category: 'Finance',
      tags: ['finance', 'freelance', 'budget'],
      price: 579,
      version: '2.6.2',
      icon_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&auto=format&fit=crop',
      screenshots: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&auto=format&fit=crop'],
      download_url: '#',
      size: '96 MB',
      features: ['Revenue runway', 'Invoice board'],
      requirements: 'Modern browser',
      compatibility: 'Web',
      support_email: 'hello@northbyte.demo',
      documentation_url: '#',
      rating: 4.4,
      downloads: 5400,
      review_count: 39,
      is_featured: false,
      status: 'approved',
      created_at: '2026-03-11T12:00:00.000Z'
    }
  ];

  const SEEDED_DEMO_REVIEWS = [
    { id: 'demo-review-1', app_id: 'demo-app-inkflow', user_id: 'demo-user-1', user_name: 'Mika Santillan', rating: 5, comment: 'The brush engine feels incredibly refined.', created_at: '2026-04-21T10:00:00.000Z' },
    { id: 'demo-review-2', app_id: 'demo-app-briefloop', user_id: 'demo-user-2', user_name: 'Carlos Mendoza', rating: 4, comment: 'Excellent brief workflow, especially for agency intake.', created_at: '2026-04-14T10:00:00.000Z' },
    { id: 'demo-review-3', app_id: 'demo-app-stackscope', user_id: 'demo-user-1', user_name: 'Mika Santillan', rating: 5, comment: 'Our API team adopted this almost immediately.', created_at: '2026-04-28T10:00:00.000Z' }
  ];

  const SEEDED_DEMO_ORDERS = [
    {
      id: 'demo-order-1',
      name: 'Mika Santillan',
      email: 'mika@inkspired.demo',
      phone: '+63 917 555 0101',
      address: 'Makati City',
      items: [{ id: 'demo-app-inkflow', name: 'InkFlow Pro', price: 850, qty: 1, developer_id: 'demo-dev-1' }],
      subtotal: 850,
      discount: 0,
      total: 850,
      user_id: 'demo-user-1',
      status: 'paid',
      created_at: '2026-04-24T09:30:00.000Z'
    },
    {
      id: 'demo-order-2',
      name: 'Carlos Mendoza',
      email: 'carlos@inkspired.demo',
      phone: '+63 917 555 0102',
      address: 'Quezon City',
      items: [{ id: 'demo-app-stackscope', name: 'StackScope', price: 1099, qty: 1, developer_id: 'demo-dev-2' }],
      subtotal: 1099,
      discount: 0,
      total: 1099,
      user_id: 'demo-user-2',
      status: 'paid',
      created_at: '2026-04-28T11:15:00.000Z'
    },
    {
      id: 'demo-order-3',
      name: 'Mika Santillan',
      email: 'mika@inkspired.demo',
      phone: '+63 917 555 0101',
      address: 'Makati City',
      items: [
        { id: 'demo-app-cashcanvas', name: 'CashCanvas', price: 579, qty: 1, developer_id: 'demo-dev-2' },
        { id: 'demo-app-briefloop', name: 'BriefLoop', price: 349, qty: 1, developer_id: 'demo-dev-1' }
      ],
      subtotal: 928,
      discount: 92.8,
      total: 835.2,
      user_id: 'demo-user-1',
      status: 'pending',
      created_at: '2026-04-29T08:05:00.000Z'
    }
  ];

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function readStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Ignore localStorage write failures.
    }
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function slugify(value) {
    return String(value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function formatCurrency(value) {
    const amount = Number(value) || 0;
    return `₱${amount.toLocaleString(undefined, { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
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
      developer_id: String(app.developer_id),
      name: app.name || 'Untitled App',
      slug: app.slug || slugify(app.name),
      description: app.description || '',
      short_desc: app.short_desc || app.description || '',
      category: app.category || 'Design',
      tags: safeArray(app.tags),
      screenshots: safeArray(app.screenshots),
      features: safeArray(app.features),
      price: Number(app.price) || 0,
      rating: Number(app.rating) || 0,
      downloads: Number(app.downloads) || 0,
      review_count: Number(app.review_count) || 0,
      status: app.status || 'pending',
      created_at: app.created_at || new Date().toISOString(),
      developer_name: app.developer_name || lookupUserName(app.developer_id)
    };
  }

  function normalizeOrder(order) {
    return {
      ...order,
      id: String(order.id),
      items: safeArray(order.items).map((item) => ({
        ...item,
        id: String(item.id),
        developer_id: item.developer_id ? String(item.developer_id) : null,
        price: Number(item.price) || 0,
        qty: Number(item.qty) || 1
      })),
      subtotal: Number(order.subtotal) || 0,
      discount: Number(order.discount) || 0,
      total: Number(order.total) || 0,
      created_at: order.created_at || new Date().toISOString(),
      status: order.status || 'pending'
    };
  }

  function normalizeReview(review) {
    return {
      ...review,
      id: String(review.id),
      app_id: String(review.app_id),
      user_id: String(review.user_id),
      rating: Number(review.rating) || 0,
      created_at: review.created_at || new Date().toISOString()
    };
  }

  function lookupUserName(userId) {
    const user = DEMO_USERS.find((entry) => String(entry.id) === String(userId));
    return user?.full_name || 'Unknown User';
  }

  function getSeededDemoApps() {
    return SEEDED_DEMO_APPS.map(normalizeApp);
  }

  function getStoredDemoApps() {
    return safeArray(readStorage(STORAGE_KEYS.demoApps, [])).map(normalizeApp);
  }

  function getDemoApps() {
    const seeded = getSeededDemoApps();
    const stored = getStoredDemoApps();
    const map = new Map(seeded.map((app) => [String(app.id), app]));
    stored.forEach((app) => map.set(String(app.id), normalizeApp(app)));
    return [...map.values()].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function saveDemoApps(apps) {
    writeStorage(STORAGE_KEYS.demoApps, safeArray(apps));
  }

  function upsertDemoApp(app) {
    const nextApps = getDemoApps();
    const index = nextApps.findIndex((entry) => String(entry.id) === String(app.id));
    if (index >= 0) nextApps[index] = normalizeApp(app);
    else nextApps.unshift(normalizeApp(app));
    saveDemoApps(nextApps);
    return normalizeApp(app);
  }

  function deleteDemoApp(appId) {
    const remaining = getDemoApps().filter((app) => String(app.id) !== String(appId));
    saveDemoApps(remaining);
  }

  function getDemoUsers() {
    return DEMO_USERS.map((user) => ({ ...user }));
  }

  function getDemoOrders() {
    const seeded = SEEDED_DEMO_ORDERS.map(normalizeOrder);
    const local = safeArray(readStorage(STORAGE_KEYS.localOrders, [])).map(normalizeOrder);
    return [...seeded, ...local].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function getDemoReviews() {
    return SEEDED_DEMO_REVIEWS.map(normalizeReview);
  }

  function makeDemoSession(role) {
    const user = DEMO_USERS.find((entry) => entry.role === role) || DEMO_USERS[0];
    return {
      id: user.id,
      email: user.email,
      user_metadata: {
        full_name: user.full_name,
        role: user.role
      }
    };
  }

  function createSupabaseClient() {
    try {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        return null;
      }

      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        return null;
      }

      return window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    } catch (_error) {
      return null;
    }
  }

  function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const icon = type === 'error' ? 'fa-circle-xmark' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-check';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${escapeHtml(message)}</span>`;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3200);
  }

  window.INKSPIRED_DASHBOARD = {
    STORAGE_KEYS,
    CATEGORY_OPTIONS,
    safeArray,
    escapeHtml,
    slugify,
    formatCurrency,
    formatNumber,
    readStorage,
    writeStorage,
    getDemoApps,
    upsertDemoApp,
    deleteDemoApp,
    getDemoUsers,
    getDemoOrders,
    getDemoReviews,
    makeDemoSession,
    createSupabaseClient,
    showToast,
    normalizeApp,
    normalizeOrder
  };
})();
