const AdminDashboard = window.INKSPIRED_DASHBOARD;

const adminState = {
  supabase: AdminDashboard.createSupabaseClient(),
  mode: 'live',
  currentUser: null,
  profile: null,
  apps: [],
  orders: [],
  users: [],
  reviews: [],
  activeSection: 'overview',
  filters: {
    appSearch: '',
    appStatus: 'all',
    orderStatus: 'all',
    userSearch: '',
    reviewSearch: ''
  },
  hiddenDemoReviewIds: new Set()
};

document.addEventListener('DOMContentLoaded', () => {
  void initAdminDashboard();
});

async function initAdminDashboard() {
  bindAdminEvents();
  await restoreAdminSession();
}

function bindAdminEvents() {
  document.getElementById('adminLoginForm')?.addEventListener('submit', handleAdminLogin);
  document.getElementById('demoAdminBtn')?.addEventListener('click', enterAdminDemoMode);
  document.getElementById('refreshAdminBtn')?.addEventListener('click', () => void loadAdminData());
  document.getElementById('logoutAdminBtn')?.addEventListener('click', () => void logoutAdmin());
  document.getElementById('adminAppSearch')?.addEventListener('input', (event) => {
    adminState.filters.appSearch = event.target.value.trim().toLowerCase();
    renderAdminApps();
  });
  document.getElementById('adminUserSearch')?.addEventListener('input', (event) => {
    adminState.filters.userSearch = event.target.value.trim().toLowerCase();
    renderAdminUsers();
  });
  document.getElementById('adminReviewSearch')?.addEventListener('input', (event) => {
    adminState.filters.reviewSearch = event.target.value.trim().toLowerCase();
    renderAdminReviews();
  });
  document.getElementById('adminOrderStatus')?.addEventListener('change', (event) => {
    adminState.filters.orderStatus = event.target.value;
    renderAdminOrders();
  });

  document.querySelectorAll('[data-admin-section]').forEach((button) => {
    button.addEventListener('click', () => showAdminSection(button.dataset.adminSection));
  });

  document.querySelectorAll('[data-admin-app-status]').forEach((button) => {
    button.addEventListener('click', () => {
      adminState.filters.appStatus = button.dataset.adminAppStatus;
      document.querySelectorAll('[data-admin-app-status]').forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');
      renderAdminApps();
    });
  });
}

async function restoreAdminSession() {
  if (!adminState.supabase) {
    setAdminAuthState('Supabase is unavailable here. You can still inspect and moderate the full system in demo mode.');
    return;
  }

  try {
    const { data, error } = await adminState.supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      const profile = await fetchAdminProfile(data.session.user.id);
      if (profile?.role === 'admin') {
        await enterAdminLiveMode(data.session.user, profile);
        return;
      }

      await adminState.supabase.auth.signOut();
      setAdminAuthState('This account is not an admin profile. Use an admin account or switch to demo mode.', true);
      return;
    }

    setAdminAuthState('Sign in with an admin account or launch the demo control room.');
  } catch (error) {
    console.error('Admin session restore failed:', error);
    setAdminAuthState('Could not restore your admin session. Demo mode is still available.', true);
  }
}

function setAdminAuthState(message, isWarning = false) {
  const note = document.getElementById('adminAuthNote');
  if (!note) return;
  note.textContent = message;
  note.style.color = isWarning ? 'var(--warning)' : 'var(--text-light)';
}

async function fetchAdminProfile(userId) {
  if (!adminState.supabase) return null;

  try {
    const { data, error } = await adminState.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Admin profile fetch failed:', error);
    return null;
  }
}

async function handleAdminLogin(event) {
  event.preventDefault();

  const button = document.getElementById('adminLoginBtn');
  const email = document.getElementById('adminEmail')?.value.trim();
  const password = document.getElementById('adminPassword')?.value || '';

  if (!adminState.supabase) {
    setAdminAuthState('Live login is unavailable right now. Use demo mode instead.', true);
    return;
  }

  if (button) {
    button.disabled = true;
    button.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Signing in...';
  }

  try {
    const { data, error } = await adminState.supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const profile = await fetchAdminProfile(data.user.id);
    if (!profile || profile.role !== 'admin') {
      await adminState.supabase.auth.signOut();
      throw new Error('Admin access is required for this dashboard.');
    }

    await enterAdminLiveMode(data.user, profile);
    AdminDashboard.showToast('Admin control room ready.', 'success');
  } catch (error) {
    console.error('Admin login failed:', error);
    setAdminAuthState(error.message || 'Admin login failed.', true);
    AdminDashboard.showToast(error.message || 'Admin login failed.', 'error');
  } finally {
    if (button) {
      button.disabled = false;
      button.innerHTML = '<i class="fa-solid fa-shield"></i> Sign In';
    }
  }
}

async function enterAdminLiveMode(user, profile) {
  adminState.mode = 'live';
  adminState.currentUser = user;
  adminState.profile = profile;
  showAdminWorkspace();
  await loadAdminData();
}

function enterAdminDemoMode() {
  adminState.mode = 'demo';
  adminState.currentUser = AdminDashboard.makeDemoSession('admin');
  adminState.profile = {
    id: adminState.currentUser.id,
    email: adminState.currentUser.email,
    full_name: adminState.currentUser.user_metadata.full_name,
    role: 'admin'
  };
  showAdminWorkspace();
  void loadAdminData();
  AdminDashboard.showToast('Demo admin control room loaded.', 'success');
}

function showAdminWorkspace() {
  document.getElementById('adminAuthScreen')?.classList.add('hidden');
  document.getElementById('adminApp')?.classList.remove('hidden');

  const modeLabel = adminState.mode === 'demo' ? 'Demo Mode' : 'Live Supabase';
  const modeNote =
    adminState.mode === 'demo'
      ? 'Moderation actions update the local demo system and storefront fallback.'
      : 'Moderation actions update your live Supabase marketplace.';

  document.getElementById('adminModePill')?.replaceChildren(document.createTextNode(modeLabel));
  document.getElementById('adminModeNote')?.replaceChildren(document.createTextNode(modeNote));
  document.getElementById('adminIdentity')?.replaceChildren(
    document.createTextNode(adminState.profile?.full_name || adminState.currentUser?.email || 'Admin')
  );
  document.getElementById('adminTopbarText')?.replaceChildren(
    document.createTextNode(
      adminState.mode === 'demo'
        ? 'You are managing the local marketplace simulation, including demo apps created from the developer workspace.'
        : 'Inspect marketplace health, moderate submissions, and keep the catalog aligned with quality standards.'
    )
  );

  showAdminSection(adminState.activeSection);
}

function showAdminSection(section) {
  adminState.activeSection = section;
  document.querySelectorAll('[data-admin-section]').forEach((button) => {
    button.classList.toggle('active', button.dataset.adminSection === section);
  });
  document.querySelectorAll('[data-admin-panel]').forEach((panel) => {
    panel.classList.toggle('hidden', panel.dataset.adminPanel !== section);
  });
}

async function logoutAdmin() {
  try {
    if (adminState.mode === 'live' && adminState.supabase) {
      await adminState.supabase.auth.signOut();
    }
  } catch (error) {
    console.warn('Admin logout warning:', error);
  } finally {
    adminState.currentUser = null;
    adminState.profile = null;
    adminState.apps = [];
    adminState.orders = [];
    adminState.users = [];
    adminState.reviews = [];
    document.getElementById('adminApp')?.classList.add('hidden');
    document.getElementById('adminAuthScreen')?.classList.remove('hidden');
    setAdminAuthState('Signed out. You can sign back in or inspect the system in demo mode.');
  }
}

async function loadAdminData() {
  if (!adminState.currentUser) return;

  try {
    if (adminState.mode === 'demo') {
      hydrateAdminDemoData();
    } else {
      await hydrateAdminLiveData();
    }

    renderAdminOverview();
    renderAdminApps();
    renderAdminOrders();
    renderAdminUsers();
    renderAdminReviews();
  } catch (error) {
    console.error('Admin data load failed:', error);
    AdminDashboard.showToast('Failed to load admin data.', 'error');
  }
}

function hydrateAdminDemoData() {
  adminState.apps = AdminDashboard.getDemoApps();
  adminState.users = AdminDashboard.getDemoUsers();
  adminState.orders = AdminDashboard.getDemoOrders();
  adminState.reviews = AdminDashboard.getDemoReviews().filter((review) => !adminState.hiddenDemoReviewIds.has(String(review.id)));
}

async function hydrateAdminLiveData() {
  const [appsResult, usersResult, ordersResult, reviewsResult] = await Promise.all([
    adminState.supabase.from('apps').select('*').order('created_at', { ascending: false }),
    adminState.supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    adminState.supabase.from('orders').select('*').order('created_at', { ascending: false }),
    adminState.supabase.from('reviews').select('*, apps(name)').order('created_at', { ascending: false })
  ]);

  if (appsResult.error) throw appsResult.error;
  if (usersResult.error) throw usersResult.error;
  if (ordersResult.error) throw ordersResult.error;
  if (reviewsResult.error) throw reviewsResult.error;

  adminState.apps = AdminDashboard.safeArray(appsResult.data).map(AdminDashboard.normalizeApp);
  adminState.users = AdminDashboard.safeArray(usersResult.data);
  adminState.orders = [
    ...AdminDashboard.safeArray(ordersResult.data).map(AdminDashboard.normalizeOrder),
    ...AdminDashboard.getDemoOrders()
      .filter((order) => String(order.id).startsWith('order-'))
      .map((order) => ({ ...order, source: 'local-fallback' }))
  ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  adminState.reviews = AdminDashboard.safeArray(reviewsResult.data);
}

function renderAdminOverview() {
  const revenue = adminState.orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const pendingApps = adminState.apps.filter((app) => app.status === 'pending').length;
  const approvedApps = adminState.apps.filter((app) => app.status === 'approved').length;
  const customerCount = adminState.users.filter((user) => user.role === 'customer').length;
  const developerCount = adminState.users.filter((user) => user.role === 'developer').length;

  setAdminText('adminMetricRevenue', AdminDashboard.formatCurrency(revenue));
  setAdminText('adminMetricOrders', String(adminState.orders.length));
  setAdminText('adminMetricApps', String(adminState.apps.length));
  setAdminText('adminMetricUsers', String(adminState.users.length));
  setAdminText('adminMetricPendingApps', String(pendingApps));
  setAdminText('adminMetricApprovedApps', String(approvedApps));
  setAdminText('adminSystemSummary', `${developerCount} developers · ${customerCount} customers`);

  const activity = document.getElementById('adminActivityFeed');
  if (activity) {
    const feed = [];

    adminState.orders.slice(0, 4).forEach((order) => {
      feed.push(`
        <div class="activity-item">
          <div class="activity-icon"><i class="fa-solid fa-receipt"></i></div>
          <div>
            <strong>${AdminDashboard.escapeHtml(order.name || 'Order')}</strong>
            <div class="subtle">${AdminDashboard.formatCurrency(order.total)} · ${new Date(order.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      `);
    });

    adminState.apps.slice(0, 4).forEach((app) => {
      feed.push(`
        <div class="activity-item">
          <div class="activity-icon"><i class="fa-solid fa-mobile-screen"></i></div>
          <div>
            <strong>${AdminDashboard.escapeHtml(app.name)}</strong>
            <div class="subtle">${AdminDashboard.escapeHtml(app.status)} · ${AdminDashboard.escapeHtml(app.developer_name)}</div>
          </div>
        </div>
      `);
    });

    activity.innerHTML = feed.length ? feed.join('') : '<div class="empty-state"><i class="fa-solid fa-wave-square"></i><p>No recent marketplace activity.</p></div>';
  }

  const health = document.getElementById('adminHealthBoard');
  if (health) {
    const categories = summarizeCategories(adminState.apps);
    const topCategories = categories.slice(0, 5);
    const maxValue = topCategories[0]?.count || 1;

    health.innerHTML = topCategories.length
      ? topCategories.map((entry) => `
          <div class="progress-item">
            <div class="progress-head">
              <span>${AdminDashboard.escapeHtml(entry.name)}</span>
              <span>${entry.count} apps</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${Math.max(12, (entry.count / maxValue) * 100)}%"></div>
            </div>
          </div>
        `).join('')
      : '<div class="empty-state"><i class="fa-solid fa-chart-pie"></i><p>No category data yet.</p></div>';
  }
}

function summarizeCategories(apps) {
  const counts = new Map();
  apps.forEach((app) => {
    const key = app.category || 'Uncategorized';
    counts.set(key, (counts.get(key) || 0) + 1);
  });
  return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

function getFilteredAdminApps() {
  return adminState.apps.filter((app) => {
    const matchesStatus = adminState.filters.appStatus === 'all' || app.status === adminState.filters.appStatus;
    const haystack = [app.name, app.description, app.category, app.developer_name, AdminDashboard.safeArray(app.tags).join(' ')]
      .join(' ')
      .toLowerCase();
    const matchesSearch = !adminState.filters.appSearch || haystack.includes(adminState.filters.appSearch);
    return matchesStatus && matchesSearch;
  });
}

function renderAdminApps() {
  const container = document.getElementById('adminAppsGrid');
  if (!container) return;

  const apps = getFilteredAdminApps();
  if (!apps.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>No apps match the current moderation filters.</p></div>';
    return;
  }

  container.innerHTML = apps.map((app) => `
    <article class="moderation-card">
      <div class="moderation-media">
        <img src="${AdminDashboard.escapeHtml(app.icon_url)}" alt="${AdminDashboard.escapeHtml(app.name)}" />
        <div class="moderation-title">
          <div class="moderation-head">
            <div>
              <h4>${AdminDashboard.escapeHtml(app.name)}</h4>
              <p class="subtle">by ${AdminDashboard.escapeHtml(app.developer_name)}</p>
            </div>
            <span class="status-badge ${app.status}">${app.status}</span>
          </div>
          <p class="subtle">${AdminDashboard.escapeHtml(app.short_desc || app.description)}</p>
          <div class="meta-row">
            <span class="meta-pill">${AdminDashboard.escapeHtml(app.category)}</span>
            <span class="meta-pill price-pill">${AdminDashboard.formatCurrency(app.price)}</span>
            <span class="meta-pill">${AdminDashboard.formatNumber(app.downloads)} downloads</span>
            <span class="meta-pill">${app.is_featured ? 'Featured' : 'Standard'}</span>
          </div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn-secondary" type="button" data-feature-app="${AdminDashboard.escapeHtml(app.id)}">
          <i class="fa-solid fa-star"></i> ${app.is_featured ? 'Unfeature' : 'Feature'}
        </button>
        ${app.status !== 'approved' ? `<button class="btn-primary" type="button" data-approve-app="${AdminDashboard.escapeHtml(app.id)}"><i class="fa-solid fa-check"></i> Approve</button>` : ''}
        ${app.status !== 'rejected' ? `<button class="btn-danger" type="button" data-reject-app="${AdminDashboard.escapeHtml(app.id)}"><i class="fa-solid fa-ban"></i> Reject</button>` : ''}
        <button class="btn-ghost" type="button" data-delete-app="${AdminDashboard.escapeHtml(app.id)}"><i class="fa-solid fa-trash"></i> Delete</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-approve-app]').forEach((button) => {
    button.addEventListener('click', () => void updateAdminAppStatus(button.dataset.approveApp, 'approved'));
  });
  container.querySelectorAll('[data-reject-app]').forEach((button) => {
    button.addEventListener('click', () => void rejectAdminApp(button.dataset.rejectApp));
  });
  container.querySelectorAll('[data-delete-app]').forEach((button) => {
    button.addEventListener('click', () => void deleteAdminApp(button.dataset.deleteApp));
  });
  container.querySelectorAll('[data-feature-app]').forEach((button) => {
    button.addEventListener('click', () => void toggleFeaturedApp(button.dataset.featureApp));
  });
}

async function updateAdminAppStatus(appId, status, rejectionReason = null) {
  const app = adminState.apps.find((entry) => String(entry.id) === String(appId));
  if (!app) return;

  try {
    if (adminState.mode === 'demo') {
      AdminDashboard.upsertDemoApp({
        ...app,
        status,
        rejection_reason: rejectionReason
      });
    } else {
      const { error } = await adminState.supabase
        .from('apps')
        .update({ status, rejection_reason: rejectionReason })
        .eq('id', appId);
      if (error) throw error;
    }

    AdminDashboard.showToast(`${app.name} marked as ${status}.`, 'success');
    await loadAdminData();
  } catch (error) {
    console.error('Admin app status update failed:', error);
    AdminDashboard.showToast(error.message || 'Failed to update app status.', 'error');
  }
}

async function rejectAdminApp(appId) {
  const reason = window.prompt('Optional rejection reason:', 'Needs stronger screenshots or metadata.');
  await updateAdminAppStatus(appId, 'rejected', reason || null);
}

async function deleteAdminApp(appId) {
  const app = adminState.apps.find((entry) => String(entry.id) === String(appId));
  if (!app) return;

  if (!window.confirm(`Delete "${app.name}" from the marketplace?`)) return;

  try {
    if (adminState.mode === 'demo') {
      AdminDashboard.deleteDemoApp(appId);
    } else {
      const { error } = await adminState.supabase.from('apps').delete().eq('id', appId);
      if (error) throw error;
    }

    AdminDashboard.showToast(`${app.name} deleted.`, 'success');
    await loadAdminData();
  } catch (error) {
    console.error('Admin delete app failed:', error);
    AdminDashboard.showToast(error.message || 'Failed to delete app.', 'error');
  }
}

async function toggleFeaturedApp(appId) {
  const app = adminState.apps.find((entry) => String(entry.id) === String(appId));
  if (!app) return;

  try {
    if (adminState.mode === 'demo') {
      AdminDashboard.upsertDemoApp({
        ...app,
        is_featured: !app.is_featured
      });
    } else {
      const { error } = await adminState.supabase
        .from('apps')
        .update({ is_featured: !app.is_featured })
        .eq('id', appId);
      if (error) throw error;
    }

    AdminDashboard.showToast(`${app.name} ${app.is_featured ? 'removed from' : 'added to'} featured.`, 'success');
    await loadAdminData();
  } catch (error) {
    console.error('Admin feature toggle failed:', error);
    AdminDashboard.showToast(error.message || 'Failed to update featured state.', 'error');
  }
}

function renderAdminOrders() {
  const container = document.getElementById('adminOrdersTable');
  if (!container) return;

  const orders = adminState.orders.filter((order) => {
    return adminState.filters.orderStatus === 'all' || order.status === adminState.filters.orderStatus;
  });

  if (!orders.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-receipt"></i><p>No orders match the current filter.</p></div>';
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Source</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map((order) => `
            <tr>
              <td>
                <strong>${AdminDashboard.escapeHtml(order.name || 'Guest')}</strong>
                <div class="subtle">${AdminDashboard.escapeHtml(order.email || 'No email')}</div>
              </td>
              <td>${AdminDashboard.escapeHtml(order.items.map((item) => item.name).join(', '))}</td>
              <td>${AdminDashboard.formatCurrency(order.total)}</td>
              <td><span class="status-badge ${order.status}">${order.status}</span></td>
              <td>${order.source === 'local-fallback' ? '<span class="status-badge demo">Local</span>' : '<span class="status-badge live">Remote</span>'}</td>
              <td>${new Date(order.created_at).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderAdminUsers() {
  const container = document.getElementById('adminUsersGrid');
  if (!container) return;

  const users = adminState.users.filter((user) => {
    const haystack = [user.full_name, user.email, user.role].join(' ').toLowerCase();
    return !adminState.filters.userSearch || haystack.includes(adminState.filters.userSearch);
  });

  if (!users.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-users"></i><p>No users match the current search.</p></div>';
    return;
  }

  container.innerHTML = users.map((user) => `
    <article class="user-card">
      <div class="user-head">
        <div>
          <h4>${AdminDashboard.escapeHtml(user.full_name || 'Unnamed User')}</h4>
          <div class="subtle">${AdminDashboard.escapeHtml(user.email || 'No email')}</div>
        </div>
        <span class="status-badge ${user.role === 'admin' ? 'live' : user.role === 'developer' ? 'pending' : 'approved'}">${AdminDashboard.escapeHtml(user.role || 'customer')}</span>
      </div>
      <div class="meta-row">
        <span class="meta-pill">Joined ${new Date(user.created_at).toLocaleDateString()}</span>
      </div>
    </article>
  `).join('');
}

function renderAdminReviews() {
  const container = document.getElementById('adminReviewsGrid');
  if (!container) return;

  const reviews = adminState.reviews.filter((review) => {
    const appName = review.apps?.name || findAdminApp(review.app_id)?.name || '';
    const haystack = [review.user_name, review.comment, appName].join(' ').toLowerCase();
    return !adminState.filters.reviewSearch || haystack.includes(adminState.filters.reviewSearch);
  });

  if (!reviews.length) {
    container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-star"></i><p>No reviews match the current search.</p></div>';
    return;
  }

  container.innerHTML = reviews.map((review) => `
    <article class="review-card">
      <div class="review-head">
        <div>
          <h4>${AdminDashboard.escapeHtml(review.user_name || 'Marketplace User')}</h4>
          <div class="subtle">${AdminDashboard.escapeHtml(review.apps?.name || findAdminApp(review.app_id)?.name || 'Unknown App')}</div>
        </div>
        <span class="meta-pill">${Number(review.rating || 0).toFixed(1)}/5</span>
      </div>
      <p>${AdminDashboard.escapeHtml(review.comment || '')}</p>
      <div class="card-actions">
        <button class="btn-danger" type="button" data-delete-review="${AdminDashboard.escapeHtml(review.id)}"><i class="fa-solid fa-trash"></i> Remove</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('[data-delete-review]').forEach((button) => {
    button.addEventListener('click', () => void deleteAdminReview(button.dataset.deleteReview));
  });
}

async function deleteAdminReview(reviewId) {
  const review = adminState.reviews.find((entry) => String(entry.id) === String(reviewId));
  if (!review) return;
  if (!window.confirm('Remove this review from the marketplace?')) return;

  try {
    if (adminState.mode === 'demo') {
      adminState.hiddenDemoReviewIds.add(String(reviewId));
    } else {
      const { error } = await adminState.supabase.from('reviews').delete().eq('id', reviewId);
      if (error) throw error;
    }

    AdminDashboard.showToast('Review removed.', 'success');
    await loadAdminData();
  } catch (error) {
    console.error('Admin review delete failed:', error);
    AdminDashboard.showToast(error.message || 'Failed to remove review.', 'error');
  }
}

function findAdminApp(appId) {
  return adminState.apps.find((app) => String(app.id) === String(appId)) || null;
}

function setAdminText(id, value) {
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}
