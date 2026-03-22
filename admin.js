/**
 * admin.js — Admin panel logic
 */

// ── TAB NAVIGATION ────────────────────────────────────────
document.querySelectorAll('.admin-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.admin-nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    // refresh data
    if (btn.dataset.tab === 'dashboard')  renderDashboard();
    if (btn.dataset.tab === 'products')   renderAdminProducts();
    if (btn.dataset.tab === 'customers')  renderAdminCustomers();
    if (btn.dataset.tab === 'orders')     renderAdminOrders();
    if (btn.dataset.tab === 'categories') renderAdminCategories();
  });
});

// ── DASHBOARD ────────────────────────────────────────────
function renderDashboard() {
  const prods   = DB.getProducts();
  const custs   = DB.getCustomers();
  const orders  = DB.getOrders();
  const revenue = orders.reduce((s, o) => s + o.total, 0);

  document.getElementById('stat-products').textContent  = prods.length;
  document.getElementById('stat-customers').textContent = custs.length;
  document.getElementById('stat-orders').textContent    = orders.length;
  document.getElementById('stat-revenue').textContent   = '₹' + revenue.toLocaleString('en-IN');
  document.getElementById('admin-date').textContent     = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Recent orders table
  const tbody = document.getElementById('recent-orders-body');
  tbody.innerHTML = orders.slice(-5).reverse().map(o => `
    <tr>
      <td><strong>${o.order_uid}</strong></td>
      <td>${o.customer_name}</td>
      <td>₹${o.total.toLocaleString('en-IN')}</td>
      <td><span class="status-pill status-${o.status}">${o.status}</span></td>
    </tr>
  `).join('');

  // Top products
  document.getElementById('top-products-list').innerHTML = prods.slice(0,5).map(p => `
    <div class="top-product-item">
      <div class="tp-emoji">${p.image}</div>
      <div class="tp-info">
        <div class="tp-name">${p.name}</div>
        <div class="tp-sold">Stock: ${p.stock}</div>
      </div>
      <div class="tp-price">₹${p.price.toLocaleString('en-IN')}</div>
    </div>
  `).join('');
}

// ── PRODUCTS ─────────────────────────────────────────────
function renderAdminProducts() {
  const query = (document.getElementById('admin-product-search')?.value || '').toLowerCase();
  const cats  = DB.getCategories();
  let prods   = DB.getProducts();
  if (query) prods = prods.filter(p => p.name.toLowerCase().includes(query));

  document.getElementById('admin-products-body').innerHTML = prods.map(p => {
    const cat = cats.find(c => c.id === p.category_id);
    return `
      <tr>
        <td class="product-thumb">${p.image}</td>
        <td><strong>${p.name}</strong></td>
        <td>${cat ? cat.icon + ' ' + cat.name : '—'}</td>
        <td>₹${p.price.toLocaleString('en-IN')}</td>
        <td>${p.stock}</td>
        <td>
          <div class="table-actions">
            <button class="action-btn" title="Edit" onclick="editProduct(${p.id})"><i class="fas fa-pen"></i></button>
            <button class="action-btn delete" title="Delete" onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
          </div>
        </td>
      </tr>`;
  }).join('') || '<tr><td colspan="6" class="empty-state">No products found</td></tr>';
}

function openProductModal(id = null) {
  document.getElementById('p-name').value    = '';
  document.getElementById('p-price').value   = '';
  document.getElementById('p-stock').value   = '';
  document.getElementById('p-desc').value    = '';
  document.getElementById('p-image').value   = '';
  document.getElementById('p-rating').value  = '';
  document.getElementById('edit-product-id').value = '';

  // Populate category select
  const cats = DB.getCategories();
  document.getElementById('p-category').innerHTML = cats.map(c =>
    `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('');

  if (id) {
    const p = DB.getProductById(id);
    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('edit-product-id').value = id;
    document.getElementById('p-name').value    = p.name;
    document.getElementById('p-price').value   = p.price;
    document.getElementById('p-stock').value   = p.stock;
    document.getElementById('p-desc').value    = p.description;
    document.getElementById('p-image').value   = p.image;
    document.getElementById('p-rating').value  = p.rating;
    document.getElementById('p-category').value= p.category_id;
  } else {
    document.getElementById('product-modal-title').textContent = 'Add Product';
  }

  openModal('product-modal');
}

function editProduct(id)   { openProductModal(id); }

function saveProduct() {
  const name  = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const stock = parseInt(document.getElementById('p-stock').value);
  const catId = parseInt(document.getElementById('p-category').value);
  const desc  = document.getElementById('p-desc').value.trim();
  const img   = document.getElementById('p-image').value.trim() || '📦';
  const rating= parseFloat(document.getElementById('p-rating').value) || 4.0;
  const editId= parseInt(document.getElementById('edit-product-id').value);

  if (!name || isNaN(price) || isNaN(stock)) {
    showToast('Validation Error', 'Please fill all required fields', 'error'); return;
  }

  const data = { name, price, stock, category_id: catId, description: desc, image: img, rating };

  if (editId) {
    DB.updateProduct(editId, data);
    showToast('Product Updated', name + ' has been updated', 'success');
  } else {
    DB.addProduct(data);
    showToast('Product Added', name + ' added to the store', 'success');
  }

  closeModal('product-modal');
  renderAdminProducts();
  filterProducts();   // refresh store
  renderDashboard();
}

function deleteProduct(id) {
  const p = DB.getProductById(id);
  if (!confirm(`Delete "${p?.name}"? This cannot be undone.`)) return;
  DB.deleteProduct(id);
  showToast('Deleted', p?.name + ' removed', 'warning');
  renderAdminProducts();
  filterProducts();
  renderDashboard();
}

// ── CUSTOMERS ────────────────────────────────────────────
function renderAdminCustomers() {
  const custs = DB.getCustomers();
  document.getElementById('admin-customers-body').innerHTML = custs.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td>${c.orders}</td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Edit" onclick="editCustomer(${c.id})"><i class="fas fa-pen"></i></button>
          <button class="action-btn delete" title="Delete" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="5" class="empty-state">No customers found</td></tr>';
}

function openCustomerModal(id = null) {
  document.getElementById('c-name').value    = '';
  document.getElementById('c-email').value   = '';
  document.getElementById('c-phone').value   = '';
  document.getElementById('c-address').value = '';
  document.getElementById('edit-customer-id').value = '';
  document.getElementById('customer-modal-title').textContent = 'Add Customer';

  if (id) {
    const c = DB.getCustomers().find(x => x.id === id);
    document.getElementById('customer-modal-title').textContent = 'Edit Customer';
    document.getElementById('edit-customer-id').value = id;
    document.getElementById('c-name').value    = c.name;
    document.getElementById('c-email').value   = c.email;
    document.getElementById('c-phone').value   = c.phone;
    document.getElementById('c-address').value = c.address;
  }
  openModal('customer-modal');
}

function editCustomer(id) { openCustomerModal(id); }

function saveCustomer() {
  const name    = document.getElementById('c-name').value.trim();
  const email   = document.getElementById('c-email').value.trim();
  const phone   = document.getElementById('c-phone').value.trim();
  const address = document.getElementById('c-address').value.trim();
  const editId  = parseInt(document.getElementById('edit-customer-id').value);

  if (!name || !email) {
    showToast('Validation Error', 'Name and Email are required', 'error'); return;
  }

  if (editId) {
    DB.updateCustomer(editId, { name, email, phone, address });
    showToast('Customer Updated', name + ' updated', 'success');
  } else {
    DB.addCustomer({ name, email, phone, address });
    showToast('Customer Added', name + ' added', 'success');
  }

  closeModal('customer-modal');
  renderAdminCustomers();
  renderDashboard();
}

function deleteCustomer(id) {
  const c = DB.getCustomers().find(x => x.id === id);
  if (!confirm(`Delete customer "${c?.name}"?`)) return;
  DB.deleteCustomer(id);
  showToast('Deleted', c?.name + ' removed', 'warning');
  renderAdminCustomers();
  renderDashboard();
}

// ── ORDERS ───────────────────────────────────────────────
function renderAdminOrders() {
  const orders = DB.getOrders();
  document.getElementById('admin-orders-body').innerHTML = orders.map(o => `
    <tr>
      <td><strong>${o.order_uid}</strong></td>
      <td>${o.customer_name}</td>
      <td>${o.items.map(i => i.name).join(', ').substring(0,40)}…</td>
      <td>₹${o.total.toLocaleString('en-IN')}</td>
      <td>
        <select class="status-select" onchange="updateOrderStatus(${o.id}, this.value)" style="background:var(--surface2);border:1px solid var(--border);color:var(--text);border-radius:8px;padding:4px 8px;font-size:0.8rem;">
          ${['processing','shipped','delivered','cancelled'].map(s =>
            `<option value="${s}" ${o.status===s?'selected':''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td>
        <div class="table-actions">
          <button class="action-btn" title="Download" onclick="downloadOrderDetail(${o.id})"><i class="fas fa-download"></i></button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6" class="empty-state">No orders yet</td></tr>';
}

function updateOrderStatus(id, status) {
  DB.updateOrderStatus(id, status);
  showToast('Status Updated', 'Order status changed to ' + status, 'info');
  renderDashboard();
}

function downloadOrderDetail(orderId) {
  const o = DB.getOrders().find(x => x.id === orderId);
  if (!o) return;

  const lines = [
    '╔══════════════════════════════════════════════════╗',
    '║         NEXUS STORE — ORDER DETAILS              ║',
    '╚══════════════════════════════════════════════════╝',
    '',
    `Order ID    : ${o.order_uid}`,
    `Customer    : ${o.customer_name}`,
    `Date        : ${new Date(o.created_at).toLocaleString('en-IN')}`,
    `Status      : ${o.status.toUpperCase()}`,
    '',
    'ITEMS:',
    '─'.repeat(52),
    ...o.items.map(i => `  ${i.name}\n     Qty: ${i.qty}  × ₹${i.price.toLocaleString('en-IN')} = ₹${(i.qty * i.price).toLocaleString('en-IN')}`),
    '',
    '─'.repeat(52),
    `TOTAL: ₹${o.total.toLocaleString('en-IN')}`,
    '─'.repeat(52),
    '',
    'nexus-store.com | support@nexus.com',
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url;
  a.download = `NEXUS_order_${o.order_uid}.txt`;
  a.click(); URL.revokeObjectURL(url);
  showToast('Downloaded', `${o.order_uid} details saved`, 'success');
}

// ── CATEGORIES ───────────────────────────────────────────
function renderAdminCategories() {
  const cats  = DB.getCategories();
  const prods = DB.getProducts();

  document.getElementById('categories-admin-grid').innerHTML = cats.map(c => {
    const count = prods.filter(p => p.category_id === c.id).length;
    return `
      <div class="admin-cat-card">
        <button class="admin-cat-del" onclick="deleteCategory(${c.id})"><i class="fas fa-times"></i></button>
        <div class="admin-cat-icon">${c.icon}</div>
        <div class="admin-cat-name">${c.name}</div>
        <div class="admin-cat-count">${count} product${count !== 1 ? 's' : ''}</div>
      </div>`;
  }).join('') || '<div class="empty-state"><div class="empty-icon">🏷️</div><p>No categories</p></div>';
}

function openCategoryModal() { openModal('category-modal'); }

function saveCategory() {
  const name = document.getElementById('cat-name').value.trim();
  const icon = document.getElementById('cat-icon').value.trim() || '📦';
  if (!name) { showToast('Validation Error', 'Category name is required', 'error'); return; }
  DB.addCategory(name, icon);
  showToast('Category Added', name + ' created', 'success');
  closeModal('category-modal');
  renderAdminCategories();
  renderCategories();
}

function deleteCategory(id) {
  const c = DB.getCategories().find(x => x.id === id);
  if (!confirm(`Delete category "${c?.name}"?`)) return;
  DB.deleteCategory(id);
  showToast('Deleted', c?.name + ' removed', 'warning');
  renderAdminCategories();
  renderCategories();
}
