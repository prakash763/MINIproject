/**
 * notifications.js — Toast system + Panel management
 */

const NOTIF_ICONS = {
  success: '<i class="fas fa-check"></i>',
  error:   '<i class="fas fa-times"></i>',
  info:    '<i class="fas fa-info"></i>',
  warning: '<i class="fas fa-exclamation"></i>',
};

// ── TOAST ─────────────────────────────────────────────────
function showToast(title, message, type = 'info') {
  const container = document.getElementById('notification-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${NOTIF_ICONS[type]}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${message}</div>
    </div>
    <button class="toast-close" onclick="dismissToast(this.parentElement)">
      <i class="fas fa-times"></i>
    </button>
    <div class="toast-progress"></div>
  `;
  container.appendChild(toast);
  setTimeout(() => dismissToast(toast), 4000);

  // Add to panel
  addNotifToPanel({ title, message, type, time: new Date() });
}

function dismissToast(el) {
  if (!el || !el.parentNode) return;
  el.classList.add('out');
  setTimeout(() => el.remove(), 300);
}

// ── NOTIFICATION PANEL ────────────────────────────────────
let notifications = [
  { title: 'New Order Received',  message: 'ORD-1003 placed by Anjali Mehta', type: 'success', time: new Date(Date.now() - 300000), unread: true },
  { title: 'Stock Alert',         message: 'Smart Watch Ultra — only 20 left', type: 'warning', time: new Date(Date.now() - 900000), unread: true },
  { title: 'Payment Confirmed',   message: 'ORD-1002 payment of ₹8,999 cleared', type: 'info', time: new Date(Date.now() - 1800000), unread: true },
];

function addNotifToPanel(n) {
  notifications.unshift({ ...n, unread: true });
  renderNotifPanel();
  updateBadge();
}

function renderNotifPanel() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  if (!notifications.length) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><p>No notifications</p></div>';
    return;
  }
  list.innerHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}">
      <div class="notif-item-icon">${NOTIF_ICONS[n.type] || NOTIF_ICONS.info}</div>
      <div class="notif-item-body">
        <div class="notif-item-title">${n.title}</div>
        <div class="notif-item-text">${n.message}</div>
        <div class="notif-item-time">${timeAgo(n.time)}</div>
      </div>
    </div>
  `).join('');
}

function clearNotifications() {
  notifications = [];
  renderNotifPanel();
  updateBadge();
}

function updateBadge() {
  const badge = document.getElementById('notif-badge');
  const unread = notifications.filter(n => n.unread).length;
  badge.textContent = unread;
  badge.style.display = unread ? 'flex' : 'none';
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60)   return 'just now';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400)return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// Toggle panel
document.getElementById('notif-btn').addEventListener('click', (e) => {
  e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  panel.classList.toggle('open');
  // mark all as read
  notifications.forEach(n => n.unread = false);
  updateBadge();
  renderNotifPanel();
});

document.addEventListener('click', (e) => {
  const panel = document.getElementById('notif-panel');
  if (!panel.contains(e.target) && !document.getElementById('notif-btn').contains(e.target)) {
    panel.classList.remove('open');
  }
});

// Init
renderNotifPanel();
updateBadge();
