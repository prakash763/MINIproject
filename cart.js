/**
 * cart.js — Shopping cart logic
 */

let cart = [];

// ── CART SIDEBAR TOGGLE ───────────────────────────────────
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');

document.getElementById('cart-toggle').addEventListener('click', () => {
  cartSidebar.classList.toggle('open');
  cartOverlay.classList.toggle('open');
});
document.getElementById('close-cart').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('open');
}

// ── CART OPERATIONS ──────────────────────────────────────
function addToCart(productId) {
  const product = DB.getProductById(productId);
  if (!product) return;

  const existing = cart.find(i => i.id === productId);
  if (existing) {
    existing.qty = Math.min(existing.qty + 1, product.stock);
  } else {
    cart.push({ ...product, qty: 1 });
  }

  renderCart();
  updateCartBadge();
  showToast('Added to Cart', `${product.name} added successfully`, 'success');

  // Open cart briefly
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('open');
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  renderCart();
  updateCartBadge();
}

function updateQty(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  const product = DB.getProductById(productId);
  if (product) item.qty = Math.min(item.qty, product.stock);
  renderCart();
  updateCartBadge();
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
}

function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cart-count').textContent = count;
}

// ── RENDER CART ──────────────────────────────────────────
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total-price');

  if (!cart.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Your cart is empty</p>
      </div>`;
    totalEl.textContent = '₹0.00';
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-emoji">${item.image}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">₹${(item.price * item.qty).toLocaleString('en-IN')}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="updateQty(${item.id}, +1)">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `).join('');

  totalEl.textContent = '₹' + getCartTotal().toLocaleString('en-IN') + '.00';
}

// ── CHECKOUT ─────────────────────────────────────────────
function checkout() {
  if (!cart.length) {
    showToast('Cart Empty', 'Add products before checking out', 'warning');
    return;
  }

  const items = cart.map(i => ({ name: i.name, qty: i.qty, price: i.price }));
  const uid = DB.addOrder({
    customer_id: null,
    customer_name: 'Guest Customer',
    total: getCartTotal(),
    status: 'processing',
    items
  });

  showToast('Order Placed!', `Your order ${uid} is confirmed 🎉`, 'success');
  addNotifToPanel({ title: 'Order Confirmed', message: `${uid} — ₹${getCartTotal().toLocaleString('en-IN')}`, type: 'success', time: new Date() });

  cart = [];
  renderCart();
  updateCartBadge();
  closeCart();

  // refresh admin if open
  if (document.getElementById('tab-orders').classList.contains('active')) {
    renderAdminOrders();
  }
}

// ── DOWNLOAD CART ─────────────────────────────────────────
function downloadCart() {
  if (!cart.length) {
    showToast('Cart Empty', 'Nothing to download', 'warning');
    return;
  }

  const lines = [
    '╔══════════════════════════════════════════════════╗',
    '║          NEXUS STORE — CART DETAILS              ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    `Date: ${new Date().toLocaleString('en-IN')}`,
    '─'.repeat(52),
    'ITEMS:',
    '',
    ...cart.map(i =>
      `  ${i.image} ${i.name}\n     Qty: ${i.qty}  ×  ₹${i.price.toLocaleString('en-IN')} = ₹${(i.price * i.qty).toLocaleString('en-IN')}`
    ),
    '',
    '─'.repeat(52),
    `TOTAL: ₹${getCartTotal().toLocaleString('en-IN')}.00`,
    '─'.repeat(52),
    '',
    'Thank you for shopping at NEXUS Store!',
    'nexus-store.com | support@nexus.com',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'NEXUS_cart_details.txt';
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded', 'Cart details saved to your device', 'success');
}
