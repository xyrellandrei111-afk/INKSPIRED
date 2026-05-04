/**
 * INKSPIRED Admin Dashboard - Complete Authentication & Dashboard
 * Uses Supabase for admin authentication
 */

// Admin credentials (in production, use Supabase auth with role-based access)
const ADMIN_CREDENTIALS = {
  email: 'admin@inkspired.com',
  password: 'inkspired2026admin' // In production, use proper hashed passwords
};

// DOM Elements
const adminAuthScreen = document.getElementById('adminAuthScreen');
const adminLoader = document.getElementById('adminLoader');
const adminDashboard = document.getElementById('adminDashboard');

// Initialize Admin Dashboard
class AdminDashboard {
  constructor() {
    this.supabase = null;
    this.currentUser = null;
    this.init();
  }

  async init() {
    // Check for existing session
    const session = localStorage.getItem('inkspired_admin_session');
    if (session) {
      try {
        this.currentUser = JSON.parse(session);
        this.showDashboard();
      } catch (e) {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }

    // Setup event listeners
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Admin login form
    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPass').value;

    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    // Simple credential check (for demo - use proper auth in production)
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Store session
      const session = {
        email: email,
        name: 'Administrator',
        role: 'admin',
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem('inkspired_admin_session', JSON.stringify(session));
      this.currentUser = session;

      // Show dashboard
      this.showDashboard();
      alert('Welcome to the Admin Dashboard!');
    } else {
      alert('Invalid credentials. Please try again.');
    }
  }

  showLogin() {
    if (adminAuthScreen) adminAuthScreen.style.display = 'flex';
    if (adminLoader) adminLoader.style.display = 'none';
  }

  showDashboard() {
    if (adminAuthScreen) adminAuthScreen.style.display = 'none';
    if (adminLoader) adminLoader.style.display = 'none';
    // Initialize dashboard content
    this.loadDashboardData();
  }

  async loadDashboardData() {
    // Load orders from localStorage
    const orders = JSON.parse(localStorage.getItem('inkspired_orders_v2') || '[]');
    this.renderOrders(orders);
    
    // Load product count
    const products = JSON.parse(localStorage.getItem('inkspired_demo_apps_v1') || '[]');
    this.renderProducts(products);
    
    // Initialize metrics
    this.updateMetrics(orders, products);
  }

  renderOrders(orders) {
    const ordersTableBody = document.getElementById('ordersTableBody');
    if (ordersTableBody) {
      if (orders.length === 0) {
        ordersTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px; color: #6b7280;">No orders yet</td></tr>';
      } else {
        ordersTableBody.innerHTML = orders.map(order => `
          <tr>
            <td>${order.orderId || order.id || 'N/A'}</td>
            <td>${order.customer?.fullName || order.customer?.name || 'N/A'}</td>
            <td>₱ ${(order.total || 0).toLocaleString()}</td>
            <td><span class="status-badge status-${order.status || 'pending'}">${order.status || 'pending'}</span></td>
            <td>${new Date(order.createdAt || order.created_at).toLocaleDateString()}</td>
            <td>
              <button class="action-btn" onclick="adminDashboard.viewOrderDetails('${order.id || order.orderId}')">
                <i class="ti ti-eye"></i>
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  renderProducts(products) {
    const productsTableBody = document.getElementById('productsTableBody');
    if (productsTableBody) {
      if (products.length === 0) {
        productsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #6b7280;">No products yet</td></tr>';
      } else {
        productsTableBody.innerHTML = products.map(product => `
          <tr>
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>₱ ${product.price.toLocaleString()}</td>
            <td>
              <span class="status-badge status-${product.is_featured ? 'featured' : 'active'}">
                ${product.is_featured ? 'Featured' : 'Active'}
              </span>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  updateMetrics(orders, products) {
    // Total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const revenueEl = document.getElementById('totalRevenue');
    if (revenueEl) revenueEl.textContent = `₱ ${totalRevenue.toLocaleString()}`;

    // Total orders
    const orderCountEl = document.getElementById('totalOrders');
    if (orderCountEl) orderCountEl.textContent = orders.length;

    // Total products
    const productCountEl = document.getElementById('totalProducts');
    if (productCountEl) productCountEl.textContent = products.length;

    // Pending orders
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const pendingEl = document.getElementById('pendingOrders');
    if (pendingEl) pendingEl.textContent = pendingOrders;
  }

  viewOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('inkspired_orders_v2') || '[]');
    const order = orders.find(o => (o.id || o.orderId) === orderId);
    if (order) {
      alert(`Order ID: ${order.id || order.orderId}\nCustomer: ${order.customer?.fullName || order.customer?.name}\nTotal: ₱ ${order.total}\nStatus: ${order.status}`);
    }
  }

  logout() {
    localStorage.removeItem('inkspired_admin_session');
    this.currentUser = null;
    window.location.href = 'index.html';
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
});
