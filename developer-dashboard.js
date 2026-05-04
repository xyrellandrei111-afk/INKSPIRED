const DevDashboard = window.INKSPIRED_DASHBOARD;

const developerState = {
  supabase: DevDashboard.createSupabaseClient(),
  mode: 'live',
  currentUser: null,
  profile: null,
  apps: [],
  reviews: [],
  sales: [],
  activeSection: 'overview',
  filters: {
    search: '',
    status: 'all'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  void initDeveloperDashboard();
});

async function initDeveloperDashboard() {
  bindDeveloperEvents();
  const savedMode = DevDashboard.readStorage(DevDashboard.STORAGE_KEYS.dashboardMode);
  if (savedMode === 'developer-demo') {
    enterDeveloperDemoMode();
  } else {
    await restoreDeveloperSession();
  }
}

function bindDeveloperEvents() {
  document.getElementById('developerLoginForm')?.addEventListener('submit', handleDeveloperLogin);
  document.getElementById('demoDeveloperBtn')?.addEventListener('click', enterDeveloperDemoMode);
  document.getElementById('refreshDeveloperBtn')?.addEventListener('click', () => void loadDeveloperData());
  document.getElementById('logoutDeveloperBtn')?.addEventListener('click', () => void logoutDeveloper());
  document.getElementById('publishAppForm')?.addEventListener('submit', handlePublishApp);
  document.getElementById('developerSearchInput')?.addEventListener('input', (event) => {
    developerState.filters.search = event.target.value.trim().toLowerCase();
    renderDeveloperCatalog();
  });
  document.getElementById('publishName')?.addEventListener('input', syncPublishSlug);
  document.getElementById('publishPrice')?.addEventListener('input', renderPublishPreview);
  document.getElementById('publishIcon')?.addEventListener('input', renderPublishPreview);
  document.getElementById('publishCategory')?.addEventListener('change', renderPublishPreview);

  document.querySelectorAll('[data-dev-section]').forEach((button) => {
    button.addEventListener('click', () => showDeveloperSection(button.dataset.devSection));
  });

  document.querySelectorAll('[data-status-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      developerState.filters.status = button.dataset.statusFilter;
      document.querySelectorAll('[data-status-filter]').forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');
      renderDeveloperCatalog();
    });
  });
}

async function restoreDeveloperSession() {
  if (!developerState.supabase) {
    setDeveloperAuthState('Supabase is unavailable in this session. You can still use the full developer workspace in demo mode.');
    return;
  }

  try {
    const { data, error } = await developerState.supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      const profile = await fetchDeveloperProfile(data.session.user.id);
      if (profile?.role === 'developer') {
        await enterDeveloperLiveMode(data.session.user, profile);
        return;
      }

      await developerState.supabase.auth.signOut();
      setDeveloperAuthState('This account is not a developer profile. Use a developer account or try demo mode.', true);
      return;
    }

    setDeveloperAuthState('Sign in to manage your apps, or open the demo workspace to explore the full dashboard.');
  } catch (error) {
    console.error('Developer session restore failed:', error);
    setDeveloperAuthState('Could not restore your developer session. Demo mode is still available.', true);
  }
}

function setDeveloperAuthState(message, isWarning = false) {
  const note = document.getElementById('developerAuthNote');
  if (!note) return;
  note.textContent = message;
  note.style.color = isWarning ? 'var(--warning)' : 'var(--text-light)';
}

async function fetchDeveloperProfile(userId) {
  if (!developerState.supabase) return null;

  try {
    const { data, error } = await developerState.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Developer profile fetch failed:', error);
    return null;
  }
}

async function handleDeveloperLogin(event) {
  event.preventDefault();

  const button = document.getElementById('developerLoginBtn');
  const email = document.getElementById('developerEmail')?.value.trim();
  const password = document.getElementById('developerPassword')?.value || '';

  if (!developerState.supabase) {
    setDeveloperAuthState('Live login is unavailable right now. Use demo mode instead.', true);
    return;
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
  }

  try {
    const { data, error } = await developerState.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await fetchDeveloperProfile(data.user.id);
    if (!profile || profile.role !== 'developer') {
      await developerState.supabase.auth.signOut();
      throw new Error('Developer access is required for this dashboard.');
    }

    await enterDeveloperLiveMode(data.user, profile);
    DevDashboard.showToast('Developer session started.', 'success');
  } catch (error) {
    console.error('Developer login failed:', error);
    setDeveloperAuthState(error.message || 'Developer login failed.', true);
    DevDashboard.showToast(error.message || 'Developer login failed.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-lock"></i> Sign In';
    }
  }
}

async function enterDeveloperLiveMode(user, profile) {
  developerState.mode = 'live';
  developerState.currentUser = user;
  developerState.profile = profile;
  persistDashboardMode('developer-live');
  showDeveloperWorkspace();
  await loadDeveloperData();
}

function enterDeveloperDemoMode() {
  developerState.mode = 'demo';
  developerState.currentUser = DevDashboard.makeDemoSession('developer');
  developerState.profile = {
    id: developerState.currentUser.id,
    email: developerState.currentUser.email,
    full_name: developerState.currentUser.user_metadata.full_name,
    role: 'developer'
  };
  persistDashboardMode('developer-demo');
  showDeveloperWorkspace();
  void loadDeveloperData();
  DevDashboard.showToast('Demo developer workspace loaded.', 'success');
}

function persistDashboardMode(mode) {
  DevDashboard.writeStorage(DevDashboard.STORAGE_KEYS.dashboardMode, mode);
}

function showDeveloperWorkspace() {
  document.getElementById('developerAuthScreen')?.classList.add('hidden');
  document.getElementById('developerApp')?.classList.remove('hidden');

  const modeLabel = developerState.mode === 'demo' ? 'Demo Mode' : 'Live Supabase';
  const modeNote =
    developerState.mode === 'demo'
      ? 'Publishing creates local demo apps that also appear in the storefront fallback.'
      : 'Changes are synced to your live marketplace data.';

  const identity =
    developerState.profile?.full_name ||
    developerState.currentUser?.user_metadata?.full_name ||
    developerState.currentUser?.email ||
    'Developer';

  document.getElementById('developerModePill')?.replaceChildren(document.createTextNode(modeLabel));
  document.getElementById('developerModeNote')?.replaceChildren(document.createTextNode(modeNote));
  document.getElementById('developerIdentity')?.replaceChildren(document.createTextNode(identity));
  document.getElementById('developerTopbarText')?.replaceChildren(
    document.createTextNode(
      developerState.mode === 'demo'
        ? 'You are exploring the local developer workspace. Published demo apps feed the storefront fallback.'
        : 'Manage listings, review performance, and prepare polished releases for the marketplace.'
    )
  );

  showDeveloperSection(developerState.activeSection);
}

function showDeveloperSection(section) {
  developerState.activeSection = section;
  document.querySelectorAll('[data-dev-section]').forEach((button) => {
    button.classList.toggle('active', button.dataset.devSection === section);
  });
  document.querySelectorAll('[data-dev-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.devPanel !== section);
  });
}

async function logoutDeveloper() {
  try {
    if (developerState.mode === 'live' && developerState.supabase) {
      await developerState.supabase.auth.signOut();
    }
  } catch (error) {
    console.warn('Developer logout warning:', error);
  } finally {
    developerState.mode = 'live';
    developerState.currentUser = null;
    developerState.profile = null;
    developerState.apps = [];
    developerState.reviews = [];
    developerState.sales = [];
    DevDashboard.writeStorage(DevDashboard.STORAGE_KEYS.dashboardMode, null);
    window.location.href = 'index.html';
  }
}

async function loadDeveloperData() {
  if (!developerState.currentUser) return;

  try {
    if (developerState.mode === 'demo') {
      hydrateDeveloperDemoData();
    } else {
      await hydrateDeveloperLiveData();
    }

    renderDeveloperOverview();
    renderDeveloperCatalog();
    renderDeveloperSales();
    renderDeveloperInsights();
    renderPublishPreview();
  } catch (error) {
    console.error('Developer dashboard load failed:', error);
    DevDashboard.showToast('Failed to load developer data.', 'error');
  }
}

function hydrateDeveloperDemoData() {
  const appSet = DevDashboard.getDemoApps().filter((app) => String(app.developer_id) === String(developerState.currentUser.id));
  const reviews = DevDashboard.getDemoReviews().filter((review) =>
    appSet.some((app) => String(app.id) === String(review.app_id))
  );

  const sales = DevDashboard.getDemoOrders()
    .flatMap((order) =>
      order.items
        .filter((item) => String(item.developer_id) === String(developerState.currentUser.id))
        .map((item) => ({
          orderId: order.id,
          appId: item.id,
          appName: item.name,
          gross: item.price * item.qty,
          net: item.price * item.qty * 0.8,
          qty: item.qty,
          created_at: order.created_at,
          status: order.status,
          buyer: order.name,
          source: 'demo'
        }))
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  developerState.apps = appSet;
  developerState.reviews = reviews;
  developerState.sales = sales;
}

async function hydrateDeveloperLiveData() {
  const userId = developerState.currentUser.id;
  const appsResult = await developerState.supabase
    .from('apps')
    .select('*')
    .eq('developer_id', userId)
    .order('created_at', { ascending: false });

  if (appsResult.error) throw appsResult.error;

  const apps = DevDashboard.safeArray(appsResult.data).map(DevDashboard.normalizeApp);
  developerState.apps = apps;

  const appIds = apps.map((app) => app.id);

  if (appIds.length) {
    try {
      const { data, error } = await developerState.supabase
        .from('reviews')
        .select('*')
        .in('app_id', appIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      developerState.reviews = DevDashboard.safeArray(data);
    } catch (error) {
      console.warn('Developer reviews fetch warning:', error);
      developerState.reviews = [];
    }
  } else {
    developerState.reviews = [];
  }

  try {
    const { data, error } = await developerState.supabase
      .from('earnings')
      .select('*, apps(name)')
      .eq('developer_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    developerState.sales = DevDashboard.safeArray(data).map((entry) => ({
      orderId: entry.order_id || `earning-${entry.id}`,
      appId: entry.app_id,
      appName: entry.apps?.name || findDeveloperApp(entry.app_id)?.name || 'Unknown App',
      gross: Number(entry.amount) || 0,
      net: Number(entry.net_amount) || 0,
      qty: 1,
      created_at: entry.created_at,
      status: 'paid',
      buyer: 'Marketplace Sale',
      source: 'live'
    }));
  } catch (error) {
    console.warn('Developer earnings fetch warning:', error);
    developerState.sales = [];
  }
}

function renderDeveloperOverview() {
  const apps = developerState.apps;
  const sales = developerState.sales;
  const approvedApps = apps.filter((app) => app.status === 'approved').length;
  const pendingApps = apps.filter((app) => app.status === 'pending').length;
  const totalDownloads = apps.reduce((sum, app) => sum + (Number(app.downloads) || 0), 0);
  const avgRating = apps.length ? apps.reduce((sum, app) => sum + (Number(app.rating) || 0), 0) / apps.length : 0;
  const totalNet = sales.reduce((sum, sale) => sum + (Number(sale.net) || 0), 0);
  const totalGross = sales.reduce((sum, sale) => sum + (Number(sale.gross) || 0), 0);

  setText('metricTotalApps', String(apps.length));
  setText('metricApprovedApps', String(approvedApps));
  setText('metricPendingApps', String(pendingApps));
  setText('metricTotalDownloads', DevDashboard.formatNumber(totalDownloads));
  setText('metricAvgRating', avgRating.toFixed(1));
  setText('metricEstimatedEarnings', DevDashboard.formatCurrency(totalNet));
  setText('developerRevenueSummary', `${sales.length} sales events · ${DevDashboard.formatCurrency(totalGross)} gross`);

  const topPerformer = [...apps].sort((a, b) => (b.downloads || 0) - (a.downloads || 0))[0];
  const topCard = document.getElementById('developerTopPerformer');
  if (topCard) {
    topCard.innerHTML = topPerformer
      ? `
          <div class="catalog-media">
            <img src="${DevDashboard.escapeHtml(topPerformer.icon_url)}" alt="${DevDashboard.escapeHtml(topPerformer.name)}" />
            <div class="catalog-title">
              <h4>${DevDashboard.escapeHtml(topPerformer.name)}</h4>
              <p class="subtle">${DevDashboard.escapeHtml(topPerformer.short_desc || topPerformer.description)}</p>
              <div class="meta-row">
                <span class="meta-pill">${topPerformer.category}</span>
                <span class="meta-pill">${DevDashboard.formatNumber(topPerformer.downloads)} downloads</span>
                <span class="meta-pill">${topPerformer.rating.toFixed(1)} rating</span>
              </div>
            </div>
          </div>
        `
      : '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No published apps yet.</p></div>';
  }

  const activity = document.getElementById('developerRecentActivity');
  if (activity) {
    const rows = [];

    sales.slice(0, 4).forEach((sale) => {
      rows.push(`
        <div class="activity-item">
          <div class="activity-icon"><i class="fa-solid fa-wallet"></i></div>
          <div>
            <strong>${DevDashboard.escapeHtml(sale.appName)}</strong>
            <div class="subtle">Net ${DevDashboard.formatCurrency(sale.net)} · ${new Date(sale.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      `);
    });

    apps.slice(0, 3).forEach((app) => {
      rows.push(`
        <div class="activity-item">
          <div class="activity-icon"><i class="fa-solid fa-rocket"></i></div>
          <div>
            <strong>${DevDashboard.escapeHtml(app.name)}</strong>
            <div class="subtle">${DevDashboard.escapeHtml(app.status)} · ${new Date(app.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      `);
    });

    activity.innerHTML = rows.length ? rows.join('') : '<div class="empty-state"><i class="fa-solid fa-wave-square"></i><p>No recent activity yet.</p></div>';
  }
}

function getFilteredDeveloperApps() {
  return developerState.apps.filter((app) => {
    const matchesStatus = developerState.filters.status === 'all' || app.status === developerState.filters.status;
    const haystack = [app.name, app.description, app.category, DevDashboard.safeArray(app.tags).join(' ')]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !developerState.filters.search || haystack.includes(developerState.filters.search);
    return matchesStatus && matchesSearch;
  });
}

function renderDeveloperCatalog() {
  const container = document.getElementById('developerAppsGrid');
  if (!container) return;

  const apps = getFilteredDeveloperApps();
  if (!apps.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-mobile-screen"></i><p>No apps match the current catalog filters.</p></div>';
    return;
  }

  container.innerHTML = apps.map((app) => `
    <article class="catalog-card">
      <div class="catalog-media">
        <img src="${DevDashboard.escapeHtml(app.icon_url)}" alt="${DevDashboard.escapeHtml(app.name)}" />
        <div class="catalog-title">
          <h4>${DevDashboard.escapeHtml(app.name)}</h4>
          <p class="subtle">${DevDashboard.escapeHtml(app.short_desc || app.description)}</p>
          <div class="meta-row">
            <span class="status-badge ${app.status}">${app.status}</span>
            <span class="meta-pill price-pill">${DevDashboard.formatCurrency(app.price)}</span>
            <span class="meta-pill">${DevDashboard.formatNumber(app.downloads)} downloads</span>
            <span class="meta-pill">${(Number(app.rating) || 0).toFixed(1)} rating</span>
          </div>
          <div class="tag-row">${DevDashboard.safeArray(app.tags).slice(0, 4).map((tag) => `<span class="tag">${DevDashboard.escapeHtml(tag)}</span>`).join('')}</div>
        </div>
      </div>
      <div class="card-actions">
        ${app.documentation_url ? `<a class="btn-ghost" href="${DevDashboard.escapeHtml(app.documentation_url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-book"></i> Docs</a>` : ''}
        ${canDeleteDeveloperApp(app) ? `<button class="btn-danger" type="button" data-delete-app="${DevDashboard.escapeHtml(app.id)}"><i class="fa-solid fa-trash"></i> Remove</button>` : ''}
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-delete-app]').forEach((button) => {
    button.addEventListener('click', () => void deleteDeveloperApp(button.dataset.deleteApp));
  });
}

function canDeleteDeveloperApp(app) {
  return developerState.mode === 'demo' || app.status !== 'approved';
}

async function deleteDeveloperApp(appId) {
  const app = developerState.apps.find((entry) => String(entry.id) === String(appId));
  if (!app) return;

  const confirmed = window.confirm(`Delete "${app.name}" from your catalog?`);
  if (!confirmed) return;

  try {
    if (developerState.mode === 'demo') {
      DevDashboard.deleteDemoApp(appId);
    } else {
      const { error } = await developerState.supabase.from('apps').delete().eq('id', appId);
      if (error) throw error;
    }

    DevDashboard.showToast(`Removed ${app.name}.`, 'success');
    await loadDeveloperData();
  } catch (error) {
    console.error('Developer app delete failed:', error);
    DevDashboard.showToast(error.message || 'Failed to remove app.', 'error');
  }
}

function renderDeveloperSales() {
  const container = document.getElementById('developerSalesTable');
  if (!container) return;

  if (!developerState.sales.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-wallet"></i><p>No sales activity yet.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Sale</th>
            <th>Net</th>
            <th>Status</th>
            <th>Buyer</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${developerState.sales.map((sale) => `
            <tr>
              <td>
                <strong>${DevDashboard.escapeHtml(sale.appName)}</strong>
                <div class="subtle">${DevDashboard.escapeHtml(sale.orderId)}</div>
              </td>
              <td>${DevDashboard.formatCurrency(sale.net)}</td>
              <td><span class="status-badge ${sale.status}">${sale.status}</span></td>
              <td>${DevDashboard.escapeHtml(sale.buyer)}</td>
              <td>${new Date(sale.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDeveloperInsights() {
  const appBreakdown = document.getElementById('developerBreakdownList');
  const publishingNote = document.getElementById('developerPublishingInsights');
  const reviewPanel = document.getElementById('developerReviewInsights');

  if (appBreakdown) {
    const ranked = [...developerState.apps]
      .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
      .slice(0, 5);

    const maxDownloads = ranked[0]?.downloads || 1;
    appBreakdown.innerHTML = ranked.length
      ? ranked.map((app) => `
          <div class="progress-item">
            <div class="progress-head">
              <span>${DevDashboard.escapeHtml(app.name)}</span>
              <span>${DevDashboard.formatNumber(app.downloads)} downloads</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${Math.max(12, (app.downloads / maxDownloads) * 100)}%"></div>
            </div>
          </div>
        `).join('')
      : '<div class="empty-state"><i class="fa-solid fa-chart-line"></i><p>No performance data yet.</p></div>';
  }

  if (publishingNote) {
    const draftCount = developerState.apps.filter((app) => app.status === 'pending').length;
    const liveCount = developerState.apps.filter((app) => app.status === 'approved').length;
    publishingNote.innerHTML = `
      <div class="inline-note">
        <strong>${liveCount}</strong> approved listings and <strong>${draftCount}</strong> queued releases.
        ${
          developerState.mode === 'demo'
            ? 'Demo submissions are saved locally and will appear in the storefront fallback.'
            : 'Live submissions are sent to Supabase with marketplace-friendly metadata and pending moderation status.'
        }
      </div>
    `;
  }

  if (reviewPanel) {
    const recentReviews = developerState.reviews.slice(0, 4);
    reviewPanel.innerHTML = recentReviews.length
      ? recentReviews.map((review) => `
          <article class="review-card">
            <div class="review-head">
              <div>
                <h4>${DevDashboard.escapeHtml(review.user_name || 'Customer')}</h4>
                <div class="subtle">${findDeveloperApp(review.app_id)?.name || 'Marketplace review'}</div>
              </div>
              <span class="meta-pill">${review.rating}/5</span>
            </div>
            <p>${DevDashboard.escapeHtml(review.comment || '')}</p>
          </article>
        `).join('')
      : '<div class="empty-state"><i class="fa-solid fa-star"></i><p>Reviews will appear here once your apps are rated.</p></div>';
  }
}

function syncPublishSlug() {
  const nameInput = document.getElementById('publishName');
  const slugInput = document.getElementById('publishSlug');
  if (!nameInput || !slugInput) return;
  slugInput.value = DevDashboard.slugify(nameInput.value);
  renderPublishPreview();
}

function buildUniqueSlug(baseSlug) {
  const slugRoot = baseSlug || `app-${Date.now().toString(36)}`;
  let slug = slugRoot;
  let counter = 1;

  const existing = new Set(developerState.apps.map((app) => app.slug));
  while (existing.has(slug)) {
    slug = `${slugRoot}-${counter}`;
    counter += 1;
  }

  return slug;
}

async function handlePublishApp(event) {
  event.preventDefault();

  const button = document.getElementById('publishSubmitBtn');
  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Publishing...';
  }

  const payload = collectPublishPayload();
  if (!payload) {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Submit App';
    }
    return;
  }

  try {
    if (developerState.mode === 'demo') {
      const demoApp = DevDashboard.upsertDemoApp({
        ...payload,
        id: `demo-app-${Date.now()}`,
        developer_id: developerState.currentUser.id,
        developer_name: developerState.profile.full_name,
        rating: 0,
        downloads: 0,
        review_count: 0,
        is_featured: false,
        status: 'pending',
        created_at: new Date().toISOString()
      });

      DevDashboard.showToast(`${demoApp.name} added to the demo catalog.`, 'success');
    } else {
      const { error } = await developerState.supabase.from('apps').insert({
        ...payload,
        developer_id: developerState.currentUser.id,
        rating: 0,
        downloads: 0,
        review_count: 0,
        status: 'pending',
        is_featured: false
      });

      if (error) throw error;
      DevDashboard.showToast('App submitted for review.', 'success');
    }

    document.getElementById('publishAppForm')?.reset();
    document.getElementById('publishSlug').value = '';
    showDeveloperSection('catalog');
    await loadDeveloperData();
  } catch (error) {
    console.error('Publish app failed:', error);
    DevDashboard.showToast(error.message || 'Failed to submit app.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Submit App';
    }
  }
}

function collectPublishPayload() {
  const name = document.getElementById('publishName')?.value.trim();
  const rawSlug = document.getElementById('publishSlug')?.value.trim();
  const category = document.getElementById('publishCategory')?.value;
  const description = document.getElementById('publishDescription')?.value.trim();
  const shortDesc = document.getElementById('publishShortDesc')?.value.trim();
  const price = Number(document.getElementById('publishPrice')?.value || 0);
  const version = document.getElementById('publishVersion')?.value.trim() || '1.0.0';
  const size = document.getElementById('publishSize')?.value.trim();
  const iconUrl = document.getElementById('publishIcon')?.value.trim();
  const screenshots = document.getElementById('publishScreenshots')?.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const tags = document.getElementById('publishTags')?.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const features = document.getElementById('publishFeatures')?.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
  const requirements = document.getElementById('publishRequirements')?.value.trim();
  const compatibility = document.getElementById('publishCompatibility')?.value.trim();
  const supportEmail = document.getElementById('publishSupportEmail')?.value.trim();
  const documentationUrl = document.getElementById('publishDocs')?.value.trim();
  const downloadUrl = document.getElementById('publishDownload')?.value.trim();

  if (!name || !description || !iconUrl || !category) {
    DevDashboard.showToast('Name, category, description, and icon URL are required.', 'error');
    return null;
  }

  return {
    name,
    slug: buildUniqueSlug(DevDashboard.slugify(rawSlug || name)),
    category,
    description,
    short_desc: shortDesc || description.slice(0, 120),
    price,
    version,
    size,
    icon_url: iconUrl,
    screenshots,
    tags,
    features,
    requirements,
    compatibility,
    support_email: supportEmail || null,
    documentation_url: documentationUrl || null,
    download_url: downloadUrl || null,
    published_at: null,
    created_at: new Date().toISOString()
  };
}

function renderPublishPreview() {
  const preview = document.getElementById('publishPreview');
  if (!preview) return;

  const name = document.getElementById('publishName')?.value.trim() || 'Your next premium app';
  const category = document.getElementById('publishCategory')?.value || 'Design';
  const icon = document.getElementById('publishIcon')?.value.trim() || 'https://via.placeholder.com/320x220?text=App+Preview';
  const price = Number(document.getElementById('publishPrice')?.value || 0);
  const blurb = document.getElementById('publishShortDesc')?.value.trim() || 'A polished product card preview appears here as you fill out the form.';

  preview.innerHTML = `
    <article class="catalog-card">
      <div class="catalog-media">
        <img src="${DevDashboard.escapeHtml(icon)}" alt="${DevDashboard.escapeHtml(name)}" />
        <div class="catalog-title">
          <h4>${DevDashboard.escapeHtml(name)}</h4>
          <p class="subtle">${DevDashboard.escapeHtml(blurb)}</p>
          <div class="meta-row">
            <span class="meta-pill">${DevDashboard.escapeHtml(category)}</span>
            <span class="meta-pill price-pill">${DevDashboard.formatCurrency(price)}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

function findDeveloperApp(appId) {
  return developerState.apps.find((app) => String(app.id) === String(appId)) || null;
}

function setText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}
