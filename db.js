/**
 * db.js — LocalStorage-based database (MySQL schema simulation)
 * In production, replace these functions with fetch() calls to a PHP/Node backend.
 *
 * MySQL Schema (for backend reference):
 * -----------------------------------------------------------
 * CREATE TABLE categories (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(100), icon VARCHAR(10), created_at TIMESTAMP DEFAULT NOW()
 * );
 * CREATE TABLE products (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(200), price DECIMAL(10,2), stock INT,
 *   category_id INT, description TEXT, image VARCHAR(20),
 *   rating DECIMAL(3,1), created_at TIMESTAMP DEFAULT NOW(),
 *   FOREIGN KEY (category_id) REFERENCES categories(id)
 * );
 * CREATE TABLE customers (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   name VARCHAR(200), email VARCHAR(200) UNIQUE,
 *   phone VARCHAR(20), address TEXT, created_at TIMESTAMP DEFAULT NOW()
 * );
 * CREATE TABLE orders (
 *   id INT AUTO_INCREMENT PRIMARY KEY,
 *   order_uid VARCHAR(20) UNIQUE, customer_id INT,
 *   total DECIMAL(10,2), status ENUM('processing','shipped','delivered','cancelled'),
 *   items JSON, created_at TIMESTAMP DEFAULT NOW(),
 *   FOREIGN KEY (customer_id) REFERENCES customers(id)
 * );
 * -----------------------------------------------------------
 */

const DB = {
  // ── HELPERS ──────────────────────────────────────────────
  get(key) {
    try { return JSON.parse(localStorage.getItem('nexus_' + key)) || []; }
    catch { return []; }
  },
  set(key, data) {
    localStorage.setItem('nexus_' + key, JSON.stringify(data));
  },
  nextId(key) {
    const items = this.get(key);
    return items.length ? Math.max(...items.map(i => i.id)) + 1 : 1;
  },

  // ── CATEGORIES ───────────────────────────────────────────
  getCategories()           { return this.get('categories'); },
  saveCategories(data)      { this.set('categories', data); },
  addCategory(name, icon) {
    const cats = this.getCategories();
    cats.push({ id: this.nextId('categories'), name, icon, created_at: new Date().toISOString() });
    this.saveCategories(cats);
  },
  deleteCategory(id) {
    this.saveCategories(this.getCategories().filter(c => c.id !== id));
  },

  // ── PRODUCTS ─────────────────────────────────────────────
  getProducts()        { return this.get('products'); },
  saveProducts(data)   { this.set('products', data); },
  addProduct(p) {
    const prods = this.getProducts();
    prods.push({ ...p, id: this.nextId('products'), created_at: new Date().toISOString() });
    this.saveProducts(prods);
  },
  updateProduct(id, p) {
    const prods = this.getProducts().map(x => x.id === id ? { ...x, ...p } : x);
    this.saveProducts(prods);
  },
  deleteProduct(id) {
    this.saveProducts(this.getProducts().filter(p => p.id !== id));
  },
  getProductById(id) {
    return this.getProducts().find(p => p.id === id);
  },

  // ── CUSTOMERS ────────────────────────────────────────────
  getCustomers()       { return this.get('customers'); },
  saveCustomers(data)  { this.set('customers', data); },
  addCustomer(c) {
    const custs = this.getCustomers();
    custs.push({ ...c, id: this.nextId('customers'), orders: 0, created_at: new Date().toISOString() });
    this.saveCustomers(custs);
  },
  updateCustomer(id, c) {
    const custs = this.getCustomers().map(x => x.id === id ? { ...x, ...c } : x);
    this.saveCustomers(custs);
  },
  deleteCustomer(id) {
    this.saveCustomers(this.getCustomers().filter(c => c.id !== id));
  },

  // ── ORDERS ───────────────────────────────────────────────
  getOrders()      { return this.get('orders'); },
  saveOrders(data) { this.set('orders', data); },
  addOrder(o) {
    const ords = this.getOrders();
    const uid = 'ORD-' + (1000 + ords.length + 1);
    ords.push({ ...o, id: this.nextId('orders'), order_uid: uid, created_at: new Date().toISOString() });
    this.saveOrders(ords);
    return uid;
  },
  updateOrderStatus(id, status) {
    const ords = this.getOrders().map(o => o.id === id ? { ...o, status } : o);
    this.saveOrders(ords);
  },
  getOrderByUid(uid) {
    return this.getOrders().find(o => o.order_uid === uid);
  },

  // ── SEED DATA ────────────────────────────────────────────
  seed() {
    if (this.getCategories().length) return; // already seeded

    // Categories
    const categories = [
      { id:1, name:'Electronics', icon:'📱', created_at: new Date().toISOString() },
      { id:2, name:'Fashion',     icon:'👗', created_at: new Date().toISOString() },
      { id:3, name:'Home & Living', icon:'🏠', created_at: new Date().toISOString() },
      { id:4, name:'Sports',      icon:'⚽', created_at: new Date().toISOString() },
      { id:5, name:'Books',       icon:'📚', created_at: new Date().toISOString() },
      { id:6, name:'Beauty',      icon:'💄', created_at: new Date().toISOString() },
    ];
    this.saveCategories(categories);

    // Products
    const products = [
      { id:1,  name:'Wireless Headphones Pro', price:2999,  stock:45, category_id:1, description:'Premium noise-cancelling headphones with 40hr battery life, spatial audio, and foldable design.', image:'🎧', rating:4.8, created_at: new Date().toISOString() },
      { id:2,  name:'Smart Watch Ultra',       price:8999,  stock:20, category_id:1, description:'Health-focused smartwatch with ECG, blood oxygen, GPS, and 7-day battery.', image:'⌚', rating:4.6, created_at: new Date().toISOString() },
      { id:3,  name:'Mechanical Keyboard',     price:3499,  stock:30, category_id:1, description:'RGB backlit mechanical keyboard with tactile switches, USB-C, and aluminium frame.', image:'⌨️', rating:4.7, created_at: new Date().toISOString() },
      { id:4,  name:'Stylish Denim Jacket',    price:1599,  stock:60, category_id:2, description:'Classic denim jacket with modern slim fit. Available in blue and black.', image:'🧥', rating:4.3, created_at: new Date().toISOString() },
      { id:5,  name:'Running Shoes X9',        price:4299,  stock:35, category_id:4, description:'Lightweight running shoes with carbon-fibre plate and responsive foam.', image:'👟', rating:4.5, created_at: new Date().toISOString() },
      { id:6,  name:'Coffee Maker Deluxe',     price:5499,  stock:18, category_id:3, description:'12-cup programmable coffee maker with thermal carafe and built-in grinder.', image:'☕', rating:4.4, created_at: new Date().toISOString() },
      { id:7,  name:'Yoga Mat Premium',        price:899,   stock:80, category_id:4, description:'6mm thick non-slip yoga mat with alignment lines and carry strap.', image:'🧘', rating:4.2, created_at: new Date().toISOString() },
      { id:8,  name:'The Design Book',         price:749,   stock:55, category_id:5, description:'A comprehensive guide to modern design principles and creative thinking.', image:'📖', rating:4.6, created_at: new Date().toISOString() },
      { id:9,  name:'Skincare Glow Set',       price:1299,  stock:40, category_id:6, description:'Complete skincare routine with cleanser, toner, serum, and moisturiser.', image:'🧴', rating:4.5, created_at: new Date().toISOString() },
      { id:10, name:'Portable Speaker',        price:2199,  stock:25, category_id:1, description:'360° surround sound, 20hr battery, IPX7 waterproof Bluetooth speaker.', image:'🔊', rating:4.7, created_at: new Date().toISOString() },
    ];
    this.saveProducts(products);

    // Customers
    const customers = [
      { id:1, name:'Priya Sharma',  email:'priya@example.com',  phone:'+91 98765 11111', address:'12 MG Road, Bangalore', orders:3, created_at: new Date().toISOString() },
      { id:2, name:'Rahul Verma',   email:'rahul@example.com',  phone:'+91 98765 22222', address:'45 Anna Nagar, Chennai', orders:2, created_at: new Date().toISOString() },
      { id:3, name:'Anjali Mehta',  email:'anjali@example.com', phone:'+91 98765 33333', address:'8 Juhu Beach Rd, Mumbai', orders:5, created_at: new Date().toISOString() },
    ];
    this.saveCustomers(customers);

    // Orders
    const orders = [
      { id:1, order_uid:'ORD-1001', customer_id:1, customer_name:'Priya Sharma', total:5998, status:'delivered', items:[{name:'Wireless Headphones Pro',qty:1,price:2999},{name:'Portable Speaker',qty:1,price:2199}], created_at: new Date().toISOString() },
      { id:2, order_uid:'ORD-1002', customer_id:2, customer_name:'Rahul Verma',  total:8999, status:'shipped',   items:[{name:'Smart Watch Ultra',qty:1,price:8999}], created_at: new Date().toISOString() },
      { id:3, order_uid:'ORD-1003', customer_id:3, customer_name:'Anjali Mehta', total:3499, status:'processing',items:[{name:'Mechanical Keyboard',qty:1,price:3499}], created_at: new Date().toISOString() },
    ];
    this.saveOrders(orders);
  }
};
