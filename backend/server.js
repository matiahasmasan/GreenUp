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
      "SELECT name, description, price, image_url, category_id, is_available FROM menu_items ORDER BY category_id ASC, name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch menu items", err);
    res.status(500).json({ error: "Failed to fetch menu items" });
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

    // Insert order
    const [orderResult] = await conn.query(
      "INSERT INTO orders (customer_name, table_number, payment_method, total_amount) VALUES (?, ?, ?, ?)",
      [customerName, table, paymentMethod, total || 0]
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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
