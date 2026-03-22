# NEXUS STORE — Premium Ecommerce Platform

A full-featured, production-ready ecommerce website with:
- 🛍️ **Store** with product grid, categories, search & sort
- 🛒 **Shopping Cart** sidebar with qty controls
- 📥 **Product detail download** (TXT file)
- 🛎️ **Toast notification system** + notification panel
- 🗺️ **Delivery tracking** with Google Maps API integration
- 👑 **Premium admin dashboard** with:
  - Dashboard (stats, recent orders, top products)
  - Product CRUD (add / edit / delete)
  - Customer CRUD (add / edit / delete)
  - Order management (status update, download)
  - Category management

---

## 📁 File Structure

```
ecommerce/
├── index.html               ← Main store page
├── css/
│   ├── style.css            ← Main styles (dark luxury theme)
│   └── notifications.css    ← Toast & notification panel styles
├── js/
│   ├── db.js                ← LocalStorage DB (MySQL schema documented)
│   ├── notifications.js     ← Toast system & panel
│   ├── cart.js              ← Cart logic & sidebar
│   ├── products.js          ← Store display & product detail
│   ├── admin.js             ← Admin panel logic
│   ├── tracking.js          ← Delivery tracking + Google Maps
│   └── app.js               ← Bootstrapper & page navigation
└── backend/
    ├── schema.sql           ← MySQL database schema + seed data
    └── api.php              ← PHP REST API (connect to MySQL)
```

---

## 🚀 Setup Instructions

### Option 1 — Open directly (no server needed)
Simply open `index.html` in a browser. All data is stored in **localStorage** — works out of the box with demo data seeded automatically.

### Option 2 — Full MySQL + PHP Backend
1. **Create the database:**
   ```bash
   mysql -u root -p < backend/schema.sql
   ```
2. **Configure DB credentials** in `backend/api.php`:
   ```php
   define('DB_HOST', 'localhost');
   define('DB_USER', 'your_username');
   define('DB_PASS', 'your_password');
   define('DB_NAME', 'nexus_store');
   ```
3. **Serve with PHP:**
   ```bash
   php -S localhost:8080
   # Visit http://localhost:8080
   ```
4. **Replace localStorage calls in `js/db.js`** with `fetch()` calls to `backend/api.php`:
   ```js
   // Example:
   const products = await fetch('/backend/api.php?resource=products').then(r => r.json());
   ```

### Option 3 — XAMPP / WAMP
- Copy the entire `ecommerce/` folder to `htdocs/`
- Import `backend/schema.sql` via phpMyAdmin
- Visit `http://localhost/ecommerce/`

---

## 🗺️ Google Maps API Setup

1. Get a free API key at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Maps JavaScript API**
3. Replace in `js/tracking.js`:
   ```js
   const GMAPS_KEY = 'YOUR_ACTUAL_KEY_HERE';
   ```

**Demo order IDs for tracking:** `ORD-1001`, `ORD-1002`, `ORD-1003`

---

## ✨ Features

| Feature | Description |
|---|---|
| Product Categories | 6 categories, filterable chips |
| Search & Sort | Real-time search + price/name sort |
| Shopping Cart | Sidebar with qty controls, persistent |
| Download Details | Cart & product details as TXT files |
| Notifications | Toast alerts + notification panel bell |
| Delivery Tracking | Step tracker + Google Maps integration |
| Admin Dashboard | Stats, recent orders, top products |
| Product CRUD | Add/edit/delete with image emoji |
| Customer CRUD | Full customer management |
| Order Management | Status updates + download receipts |
| Category CRUD | Add/delete product categories |
| MySQL Schema | Full production schema in `schema.sql` |
| PHP REST API | Full CRUD API in `api.php` |

---

## 🎨 Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript** — No frameworks, pure ES6+
- **localStorage** — Client-side DB (MySQL drop-in ready)
- **Google Maps API** — Delivery tracking
- **MySQL** — Production database schema
- **PHP** — REST API backend
- **Font:** Syne (headings) + DM Sans (body)
- **Icons:** Font Awesome 6

---

*NEXUS Store — Built with ❤️ using modern web technologies*
