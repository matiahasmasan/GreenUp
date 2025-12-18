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

// GET /history - Retrieve all orders (optional, for kitchen/manager view)
app.get("/history", async (_req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * from orders`);
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
