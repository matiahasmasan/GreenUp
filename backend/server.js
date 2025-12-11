const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";

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

// GET /orders - Retrieve all orders (optional, for kitchen/manager view)
app.get("/orders", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id, o.customer_name, o.table_number, o.payment_method, 
              o.total_amount, o.status, o.created_at, 
              JSON_ARRAYAGG(
                JSON_OBJECT('item_name', oi.item_name, 'item_price', oi.item_price, 'quantity', oi.quantity)
              ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch orders", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /auth/login - simple login that returns a JWT (no route protection enforced yet)
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, username, password_hash, password, role FROM users WHERE username = ? LIMIT 1",
      [username]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = rows[0];
    // Support either `password_hash` or `password` column names depending on schema
    const storedHash = user.password_hash || user.password;

    if (!storedHash) {
      console.error("No password hash found for user:", user);
      return res
        .status(500)
        .json({ error: "User record is missing password hash" });
    }

    const match = await bcrypt.compare(password, storedHash);
    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Login failed" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
