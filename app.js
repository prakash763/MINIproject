/**
 * app.js — App bootstrap, page navigation, modal manager
 */

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  DB.seed();              // seed demo data if fresh
  renderCategories();    // store categories
  filterProducts();      // store products grid
  renderDashboard();     // admin dashboard stats
});

// ── PAGE NAVIGATION ───────────────────────────────────────
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    link.classList.add('active');
    document.getElementById('page-' + page).classList.add('active');

    // Trigger renders
    if (page === 'admin') {
      renderDashboard();
    }
  });
});

// ── MODAL MANAGER ─────────────────────────────────────────
const overlay = document.getElementById('modal-overlay');

function openModal(id) {
  // Hide all modals
  document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
  // Show requested
  document.getElementById(id).classList.add('show');
  overlay.classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  overlay.classList.remove('open');
}

// Close modal on overlay click
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    overlay.classList.remove('open');
  }
});

// Keyboard: Escape closes modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    overlay.classList.remove('open');
    document.getElementById('notif-panel').classList.remove('open');
  }
});

// ── PERIODIC NOTIFICATIONS (demo) ─────────────────────────
const DEMO_NOTIFS = [
  { title: '🔥 Flash Sale!',   message: '30% off Electronics for next 2 hours', type: 'warning' },
  { title: 'New Review',       message: 'Customer rated Wireless Headphones 5★',  type: 'success' },
  { title: 'Low Stock Alert',  message: 'Coffee Maker — only 3 units remaining',  type: 'error'   },
  { title: 'Order Shipped',    message: 'ORD-1002 is out for delivery',            type: 'info'    },
];

let notifIdx = 0;
setInterval(() => {
  const n = DEMO_NOTIFS[notifIdx % DEMO_NOTIFS.length];
  showToast(n.title, n.message, n.type);
  notifIdx++;
}, 20000); // every 20 seconds (demo)
