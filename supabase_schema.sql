-- ============================================================
-- NEXUS ECOMMERCE — PostgreSQL Schema for Supabase
-- Run in Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension if needed (Supabase default has it)
-- CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";

-- TABLES (order matters for FKs)
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL DEFAULT '📦',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  category_id INTEGER,
  description TEXT,
  image VARCHAR(20) DEFAULT '📦',
  rating DECIMAL(3,1) DEFAULT 4.0,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  orders INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_uid VARCHAR(20) UNIQUE NOT NULL,
  customer_id INTEGER,
  customer_name VARCHAR(200),
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing','shipped','delivered','cancelled')),
  items JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200),
  message TEXT,
  type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('success','error','info','warning')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, icon) VALUES
  ('Electronics', '📱'),
  ('Fashion', '👗'),
  ('Home & Living', '🏠'),
  ('Sports', '⚽'),
  ('Books', '📚'),
  ('Beauty', '💄')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (name, price, stock, category_id, description, image, rating) VALUES
  ('Wireless Headphones Pro', 2999, 45, 1, 'Premium noise-cancelling headphones with 40hr battery.', '🎧', 4.8),
  ('Smart Watch Ultra', 8999, 20, 1, 'Health-focused smartwatch with ECG and 7-day battery.', '⌚', 4.6),
  ('Mechanical Keyboard', 3499, 30, 1, 'RGB mechanical keyboard with aluminium frame.', '⌨️', 4.7),
  ('Stylish Denim Jacket', 1599, 60, 2, 'Classic denim jacket with modern slim fit.', '🧥', 4.3),
  ('Running Shoes X9', 4299, 35, 4, 'Lightweight running shoes with carbon-fibre plate.', '👟', 4.5),
  ('Coffee Maker Deluxe', 5499, 18, 3, '12-cup programmable coffee maker with grinder.', '☕', 4.4),
  ('Yoga Mat Premium', 899, 80, 4, '6mm thick non-slip yoga mat with carry strap.', '🧘', 4.2),
  ('The Design Book', 749, 55, 5, 'A comprehensive guide to modern design principles.', '📖', 4.6),
  ('Skincare Glow Set', 1299, 40, 6, 'Complete skincare routine set.', '🧴', 4.5),
  ('Portable Speaker', 2199, 25, 1, '360° surround sound, 20hr battery, IPX7 waterproof.', '🔊', 4.7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO customers (name, email, phone, address, orders) VALUES
  ('Priya Sharma', 'priya@example.com', '+91 98765 11111', '12 MG Road, Bangalore', 3),
  ('Rahul Verma', 'rahul@example.com', '+91 98765 22222', '45 Anna Nagar, Chennai', 2),
  ('Anjali Mehta', 'anjali@example.com', '+91 98765 33333', '8 Juhu Beach Rd, Mumbai', 5)
ON CONFLICT (id) DO NOTHING;

-- Note: Orders seed requires customer_ids exist. Run after customers.
INSERT INTO orders (id, order_uid, customer_id, customer_name, total, status, items) VALUES
  (1, 'ORD-1001', 1, 'Priya Sharma', 5998, 'delivered', '[{"name":"Wireless Headphones Pro","qty":1,"price":2999},{"name":"Portable Speaker","qty":1,"price":2199}]'),
  (2, 'ORD-1002', 2, 'Rahul Verma', 8999, 'shipped', '[{"name":"Smart Watch Ultra","qty":1,"price":8999}]'),
  (3, 'ORD-1003', 3, 'Anjali Mehta', 3499, 'processing', '[{"name":"Mechanical Keyboard","qty":1,"price":3499}]')
ON CONFLICT (id) DO NOTHING;

-- View all data
SELECT 'Categories: ' || COUNT(*) FROM categories
UNION ALL SELECT 'Products: ' || COUNT(*) FROM products
UNION ALL SELECT 'Customers: ' || COUNT(*) FROM customers
UNION ALL SELECT 'Orders: ' || COUNT(*) FROM orders;

