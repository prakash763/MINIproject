<?php
/**
 * NEXUS STORE — PHP REST API
 * File: backend/api.php
 *
 * Routes:
 *   GET    /api.php?resource=products
 *   POST   /api.php?resource=products
 *   PUT    /api.php?resource=products&id=1
 *   DELETE /api.php?resource=products&id=1
 *   (same pattern for categories, customers, orders)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ── DB CONNECTION ─────────────────────────────────────────
define('DB_HOST', 'db.enrskuppqciqbyayjpgg.supabase.co');
define('DB_PORT', '5432');
define('DB_USER', 'postgres');
define('DB_PASS', 'Dipesh@#123');
define('DB_NAME', 'postgres');

$pdo = new PDO(
  "pgsql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8",
  DB_USER, DB_PASS,
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$resource = $_GET['resource'] ?? '';
$id       = isset($_GET['id']) ? (int)$_GET['id'] : null;
$method   = $_SERVER['REQUEST_METHOD'];
$body     = json_decode(file_get_contents('php://input'), true) ?? [];

function respond($data, $code = 200) {
  http_response_code($code);
  echo json_encode(['success' => $code < 400, 'data' => $data]);
  exit;
}

// ── ROUTER ───────────────────────────────────────────────
switch ($resource) {

  // ── PRODUCTS ──────────────────────────────────────────
  case 'products':
    if ($method === 'GET') {
      $q = $pdo->query("SELECT p.*, c.name as category_name, c.icon as category_icon
                        FROM products p LEFT JOIN categories c ON p.category_id = c.id
                        ORDER BY p.created_at DESC");
      respond($q->fetchAll());
    }
    if ($method === 'POST') {
      $s = $pdo->prepare("INSERT INTO products (name, price, stock, category_id, description, image, rating)
                          VALUES (?,?,?,?,?,?,?)");
      $s->execute([$body['name'],$body['price'],$body['stock'],$body['category_id'],
                   $body['description'],$body['image'],$body['rating']]);
      respond(['id' => $pdo->lastInsertId()], 201);
    }
    if ($method === 'PUT' && $id) {
      $s = $pdo->prepare("UPDATE products SET name=?, price=?, stock=?, category_id=?,
                          description=?, image=?, rating=? WHERE id=?");
      $s->execute([$body['name'],$body['price'],$body['stock'],$body['category_id'],
                   $body['description'],$body['image'],$body['rating'], $id]);
      respond(['updated' => $id]);
    }
    if ($method === 'DELETE' && $id) {
      $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
      respond(['deleted' => $id]);
    }
    break;

  // ── CATEGORIES ────────────────────────────────────────
  case 'categories':
    if ($method === 'GET') {
      respond($pdo->query("SELECT * FROM categories ORDER BY name")->fetchAll());
    }
    if ($method === 'POST') {
      $s = $pdo->prepare("INSERT INTO categories (name, icon) VALUES (?,?)");
      $s->execute([$body['name'], $body['icon'] ?? '📦']);
      respond(['id' => $pdo->lastInsertId()], 201);
    }
    if ($method === 'DELETE' && $id) {
      $pdo->prepare("DELETE FROM categories WHERE id=?")->execute([$id]);
      respond(['deleted' => $id]);
    }
    break;

  // ── CUSTOMERS ─────────────────────────────────────────
  case 'customers':
    if ($method === 'GET') {
      respond($pdo->query("SELECT * FROM customers ORDER BY created_at DESC")->fetchAll());
    }
    if ($method === 'POST') {
      $s = $pdo->prepare("INSERT INTO customers (name, email, phone, address) VALUES (?,?,?,?)");
      $s->execute([$body['name'],$body['email'],$body['phone'],$body['address']]);
      respond(['id' => $pdo->lastInsertId()], 201);
    }
    if ($method === 'PUT' && $id) {
      $s = $pdo->prepare("UPDATE customers SET name=?, email=?, phone=?, address=? WHERE id=?");
      $s->execute([$body['name'],$body['email'],$body['phone'],$body['address'], $id]);
      respond(['updated' => $id]);
    }
    if ($method === 'DELETE' && $id) {
      $pdo->prepare("DELETE FROM customers WHERE id=?")->execute([$id]);
      respond(['deleted' => $id]);
    }
    break;

  // ── ORDERS ────────────────────────────────────────────
  case 'orders':
    if ($method === 'GET') {
      if ($id) {
        $s = $pdo->prepare("SELECT * FROM orders WHERE id=? OR order_uid=?");
        $s->execute([$id, $_GET['id']]);
        $o = $s->fetch();
        if ($o) $o['items'] = json_decode($o['items'], true);
        respond($o ?: null, $o ? 200 : 404);
      }
      $rows = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC")->fetchAll();
      foreach ($rows as &$r) $r['items'] = json_decode($r['items'], true);
      respond($rows);
    }
    if ($method === 'POST') {
      $count = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
      $uid   = 'ORD-' . (1001 + $count);
      $s = $pdo->prepare("INSERT INTO orders (order_uid, customer_id, customer_name, total, status, items)
                          VALUES (?,?,?,?,?,?)");
      $s->execute([$uid, $body['customer_id'], $body['customer_name'],
                   $body['total'], $body['status'] ?? 'processing',
                   json_encode($body['items'])]);
      respond(['id' => $pdo->lastInsertId(), 'order_uid' => $uid], 201);
    }
    if ($method === 'PUT' && $id) {
      $s = $pdo->prepare("UPDATE orders SET status=? WHERE id=?");
      $s->execute([$body['status'], $id]);
      respond(['updated' => $id]);
    }
    break;

  // ── NOTIFICATIONS ─────────────────────────────────────
  case 'notifications':
    if ($method === 'GET') {
      respond($pdo->query("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 20")->fetchAll());
    }
    if ($method === 'POST') {
      $s = $pdo->prepare("INSERT INTO notifications (title, message, type) VALUES (?,?,?)");
      $s->execute([$body['title'], $body['message'], $body['type'] ?? 'info']);
      respond(['id' => $pdo->lastInsertId()], 201);
    }
    if ($method === 'PUT') {
      $pdo->query("UPDATE notifications SET is_read=1");
      respond(['marked_all_read' => true]);
    }
    break;

  default:
    respond(['error' => 'Unknown resource: ' . $resource], 404);
}
