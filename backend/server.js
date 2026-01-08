const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_app",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/menu-items", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT name, description, price, image_url, category_id, is_available, stocks FROM menu_items ORDER BY category_id ASC, name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch menu items", err);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// PATCH /menu-items/availability - Update product availability
app.patch("/menu-items/availability", async (req, res) => {
  const { name, is_available } = req.body;

  if (name === undefined || is_available === undefined) {
    return res
      .status(400)
      .json({ error: "Missing name or is_available status" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE menu_items SET is_available = ? WHERE name = ?",
      [is_available ? 1 : 0, name]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Availability updated" });
  } catch (err) {
    console.error("Failed to update availability", err);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /orders - Create a new order
app.post("/orders", async (req, res) => {
  const { customerName, table, paymentMethod, items, total } = req.body;

  // Validate required fields
  if (
    !customerName ||
    !table ||
    !paymentMethod ||
    !items ||
    items.length === 0
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: customerName, table, paymentMethod, items",
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Insert order with default status 'pending'
    const [orderResult] = await conn.query(
      "INSERT INTO orders (customer_name, table_number, payment_method, total_amount, status) VALUES (?, ?, ?, ?, ?)",
      [customerName, table, paymentMethod, total || 0, "pending"]
    );

    const orderId = orderResult.insertId;

    // Insert order items
    for (const item of items) {
      const subtotal = Number(item.price) * item.quantity;
      await conn.query(
        "INSERT INTO order_items (order_id, item_name, item_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.name, item.price, item.quantity, subtotal]
      );
    }

    await conn.commit();

    res.status(201).json({
      success: true,
      orderId,
      message: "Order created successfully",
    });
  } catch (err) {
    await conn.rollback();
    console.error("Failed to create order", err);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    conn.release();
  }
});

// GET /orders/:id - Retrieve a single order by ID with its items
app.get("/orders/:id", async (req, res) => {
  const orderId = parseInt(req.params.id);

  if (isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  try {
    // Fetch the order
    const [orders] = await pool.query(
      `SELECT id, customer_name, table_number, payment_method, total_amount, status, created_at, updated_at 
       FROM orders 
       WHERE id = ?`,
      [orderId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];

    // Fetch order items
    const [orderItems] = await pool.query(
      `SELECT order_id, item_name, item_price, quantity, subtotal 
       FROM order_items 
       WHERE order_id = ?
       ORDER BY id`,
      [orderId]
    );

    // Format items
    const items = orderItems.map((item) => ({
      name: item.item_name,
      price: item.item_price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    // Combine order with its items
    const orderWithItems = {
      ...order,
      items: items,
    };

    res.json(orderWithItems);
  } catch (err) {
    console.error("Failed to fetch order", err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// PATCH /orders/:id/status - Update order status
app.patch("/orders/:id/status", async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { status } = req.body;

  if (isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  // Validate status
  const validStatuses = ["pending", "preparing", "completed", "cancelled"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    const [result] = await pool.query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: "Order status updated successfully",
      orderId,
      status,
    });
  } catch (err) {
    console.error("Failed to update order status", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// GET /history - Retrieve all orders with their items
app.get("/history", async (_req, res) => {
  try {
    // Fetch all orders
    const [orders] = await pool.query(
      `SELECT id, customer_name, table_number, payment_method, total_amount, status, created_at, updated_at 
       FROM orders 
       ORDER BY created_at DESC`
    );

    // Fetch all order items
    const [orderItems] = await pool.query(
      `SELECT order_id, item_name, item_price, quantity, subtotal 
       FROM order_items 
       ORDER BY order_id, id`
    );

    // Group items by order_id
    const itemsByOrder = orderItems.reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      acc[item.order_id].push({
        name: item.item_name,
        price: item.item_price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      });
      return acc;
    }, {});

    // Combine orders with their items
    const ordersWithItems = orders.map((order) => ({
      ...order,
      items: itemsByOrder[order.id] || [],
    }));

    res.json(ordersWithItems);
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /menu-items - Create a new menu item
app.post("/menu-items", async (req, res) => {
  const {
    name,
    description,
    price,
    image_url,
    category_id,
    is_available,
    stocks,
  } = req.body;

  // Validate required fields
  if (!name || !price || !category_id || stocks === undefined) {
    return res.status(400).json({
      error: "Missing required fields: name, price, category_id, stocks",
    });
  }

  // Validate price
  if (isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({
      error: "Price must be a valid number greater than 0",
    });
  }

  // Validate stocks
  if (isNaN(stocks) || Number(stocks) < 0) {
    return res.status(400).json({
      error: "Stocks must be a valid number greater than or equal to 0",
    });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO menu_items (name, description, price, image_url, category_id, is_available, stocks) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        Number(price),
        image_url || null,
        Number(category_id),
        is_available ? 1 : 0,
        Number(stocks),
      ]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      message: "Product created successfully",
    });
  } catch (err) {
    console.error("Failed to create menu item", err);

    // Check for duplicate entry
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "A product with this name already exists",
      });
    }

    res.status(500).json({ error: "Failed to create product" });
  }
});

// admin cards
// GET /stats - Retrieve dashboard metrics
app.get("/stats", async (_req, res) => {
  try {
    const [statsRows] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as active_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
    `);

    const [profitRows] = await pool.query(`
      SELECT 
        SUM(oi.quantity * (oi.item_price - COALESCE(m.cost_price, 0))) as total_profit
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items m ON oi.item_name = m.name
      WHERE o.status != 'cancelled'
    `);

    const stats = statsRows[0];
    const profit = parseFloat(profitRows[0].total_profit || 0).toFixed(2);

    res.json({
      activeOrders: stats.active_orders || 0,
      totalRevenue: parseFloat(stats.total_revenue || 0).toFixed(2),
      cancelledOrders: stats.cancelled_orders || 0,
      totalProfit: profit,
    });
  } catch (err) {
    console.error("Failed to fetch stats", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
