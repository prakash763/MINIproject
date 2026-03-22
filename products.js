/**
 * products.js — Store display, filtering, product detail & download
 */

let activeCategory = 'all';
let currentDetailProductId = null;

// ── RENDER CATEGORIES ─────────────────────────────────────
function renderCategories() {
  const row = document.getElementById('categories-row');
  const cats = DB.getCategories();

  const all = `<div class="cat-chip ${activeCategory === 'all' ? 'active' : ''}"
    onclick="setCategory('all')">🛍️ All</div>`;

  const chips = cats.map(c => `
    <div class="cat-chip ${activeCategory == c.id ? 'active' : ''}"
      onclick="setCategory(${c.id})">
      ${c.icon} ${c.name}
    </div>
  `).join('');

  row.innerHTML = all + chips;
}

function setCategory(id) {
  activeCategory = id;
  renderCategories();
  filterProducts();
}

// ── RENDER PRODUCTS ───────────────────────────────────────
function filterProducts() {
  const query  = (document.getElementById('search-input')?.value || '').toLowerCase();
  const sort   = document.getElementById('sort-select')?.value || 'default';
  const cats   = DB.getCategories();

  let prods = DB.getProducts();

  // Filter by category
  if (activeCategory !== 'all') {
    prods = prods.filter(p => p.category_id == activeCategory);
  }

  // Search filter
  if (query) {
    prods = prods.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }

  // Sort
  switch (sort) {
    case 'price-asc':  prods.sort((a,b) => a.price - b.price); break;
    case 'price-desc': prods.sort((a,b) => b.price - a.price); break;
    case 'name':       prods.sort((a,b) => a.name.localeCompare(b.name)); break;
  }

  const grid = document.getElementById('products-grid');
  if (!prods.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <p>No products found</p>
      </div>`;
    return;
  }

  grid.innerHTML = prods.map(p => {
    const cat = cats.find(c => c.id === p.category_id);
    const stars = '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
    return `
      <div class="product-card" onclick="openProductDetail(${p.id})">
        <div class="product-img">
          ${p.rating >= 4.7 ? '<span class="product-badge">HOT</span>' : ''}
          ${p.image}
        </div>
        <div class="product-info">
          <div class="product-category">${cat ? cat.icon + ' ' + cat.name : ''}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-rating">${stars} <span style="color:var(--text-muted)">(${p.rating})</span></div>
          <div class="product-footer">
            <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
            <button class="add-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id})" title="Add to cart">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ── PRODUCT DETAIL MODAL ──────────────────────────────────
function openProductDetail(id) {
  const p    = DB.getProductById(id);
  if (!p) return;
  const cats = DB.getCategories();
  const cat  = cats.find(c => c.id === p.category_id);
  const stars= '★'.repeat(Math.round(p.rating)) + '☆'.repeat(5 - Math.round(p.rating));
  currentDetailProductId = id;

  document.getElementById('product-detail-body').innerHTML = `
    <div class="detail-hero">
      <div class="detail-emoji">${p.image}</div>
      <div class="detail-info">
        <div class="detail-category">${cat ? cat.icon + ' ' + cat.name : ''}</div>
        <h2>${p.name}</h2>
        <div class="detail-rating">${stars} ${p.rating}/5</div>
        <div class="detail-price">₹${p.price.toLocaleString('en-IN')}</div>
        <div class="detail-stock">✓ In Stock (${p.stock} units)</div>
      </div>
    </div>
    <div class="detail-desc">${p.description}</div>
    <div style="margin-top:16px;padding:14px;background:var(--surface2);border-radius:10px;font-size:0.82rem;color:var(--text-muted)">
      <strong style="color:var(--text)">Product ID:</strong> #${p.id} &nbsp;|&nbsp;
      <strong style="color:var(--text)">Added:</strong> ${new Date(p.created_at).toLocaleDateString('en-IN')}
    </div>
  `;

  document.getElementById('modal-add-cart-btn').onclick = () => {
    addToCart(id);
    closeModal('product-detail-modal');
  };

  openModal('product-detail-modal');
}

// ── DOWNLOAD PRODUCT DETAIL ───────────────────────────────
function downloadProductDetail() {
  const p = DB.getProductById(currentDetailProductId);
  if (!p) return;
  const cats = DB.getCategories();
  const cat  = cats.find(c => c.id === p.category_id);

  const content = [
    '╔══════════════════════════════════════════════════╗',
    '║        NEXUS STORE — PRODUCT DETAILS             ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    `Product ID   : #${p.id}`,
    `Name         : ${p.name}`,
    `Category     : ${cat ? cat.icon + ' ' + cat.name : 'N/A'}`,
    `Price        : ₹${p.price.toLocaleString('en-IN')}`,
    `Rating       : ${p.rating}/5.0`,
    `Stock        : ${p.stock} units`,
    `Added        : ${new Date(p.created_at).toLocaleDateString('en-IN')}`,
    '',
    'DESCRIPTION:',
    p.description,
    '',
    '─'.repeat(52),
    'nexus-store.com  |  support@nexus.com',
    `Downloaded: ${new Date().toLocaleString('en-IN')}`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `NEXUS_product_${p.id}_${p.name.replace(/\s+/g,'_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Downloaded', 'Product details saved to your device', 'success');
}
