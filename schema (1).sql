-- ============================================================
-- NEXUS ECOMMERCE — MySQL Database Schema
-- Run this in your MySQL server to create the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS nexus_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nexus_store;

-- CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  icon       VARCHAR(10)   NOT NULL DEFAULT '📦',
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200)   NOT NULL,
  price       DECIMAL(10,2)  NOT NULL,
  stock       INT            NOT NULL DEFAULT 0,
  category_id INT,
  description TEXT,
  image       VARCHAR(20)    DEFAULT '📦',
  rating      DECIMAL(3,1)   DEFAULT 4.0,
  created_at  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(200)  NOT NULL,
  email      VARCHAR(200)  UNIQUE NOT NULL,
  phone      VARCHAR(20),
  address    TEXT,
  orders     INT           DEFAULT 0,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  order_uid     VARCHAR(20)   UNIQUE NOT NULL,
  customer_id   INT,
  customer_name VARCHAR(200),
  total         DECIMAL(10,2) NOT NULL,
  status        ENUM('processing','shipped','delivered','cancelled') DEFAULT 'processing',
  items         JSON,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200),
  message    TEXT,
  type       ENUM('success','error','info','warning') DEFAULT 'info',
  is_read    TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO categories (name, icon) VALUES
  ('Electronics',   '📱'),
  ('Fashion',       '👗'),
  ('Home & Living', '🏠'),
  ('Sports',        '⚽'),
  ('Books',         '📚'),
  ('Beauty',        '💄');

INSERT INTO products (name, price, stock, category_id, description, image, rating) VALUES
  ('Wireless Headphones Pro', 2999, 45, 1, 'Premium noise-cancelling headphones with 40hr battery.', '🎧', 4.8),
  ('Smart Watch Ultra',       8999, 20, 1, 'Health-focused smartwatch with ECG and 7-day battery.', '⌚', 4.6),
  ('Mechanical Keyboard',     3499, 30, 1, 'RGB mechanical keyboard with aluminium frame.', '⌨️', 4.7),
  ('Stylish Denim Jacket',    1599, 60, 2, 'Classic denim jacket with modern slim fit.', '🧥', 4.3),
  ('Running Shoes X9',        4299, 35, 4, 'Lightweight running shoes with carbon-fibre plate.', '👟', 4.5),
  ('Coffee Maker Deluxe',     5499, 18, 3, '12-cup programmable coffee maker with grinder.', '☕', 4.4),
  ('Yoga Mat Premium',         899, 80, 4, '6mm thick non-slip yoga mat with carry strap.', '🧘', 4.2),
  ('The Design Book',          749, 55, 5, 'A comprehensive guide to modern design principles.', '📖', 4.6),
  ('Skincare Glow Set',       1299, 40, 6, 'Complete skincare routine set.', '🧴', 4.5),
  ('Portable Speaker',        2199, 25, 1, '360° surround sound, 20hr battery, IPX7 waterproof.', '🔊', 4.7);

INSERT INTO customers (name, email, phone, address, orders) VALUES
  ('Priya Sharma',  'priya@example.com',  '+91 98765 11111', '12 MG Road, Bangalore', 3),
  ('Rahul Verma',   'rahul@example.com',  '+91 98765 22222', '45 Anna Nagar, Chennai', 2),
  ('Anjali Mehta',  'anjali@example.com', '+91 98765 33333', '8 Juhu Beach Rd, Mumbai', 5);
  ('prakash yadav', 'prakash@gmail.com', '7673071425', 46 ananagar baye salem,10);