const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

const app = express();
app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const auth = req.headers["authorization"];
  const token = auth && auth.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Authentication required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

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

async function ensureOrderReviewsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_reviews (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      rating TINYINT UNSIGNED NOT NULL,
      comment TEXT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uk_order_reviews_order (order_id),
      CONSTRAINT fk_order_reviews_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

// POST /auth/login
app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }
  try {
    const [rows] = await pool.query(
      "SELECT id, username, password_hash, role FROM users WHERE username = ?",
      [username],
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error("Login error", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// GET /menu-items - public (clients need this)
app.get("/menu-items", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, description, price, image_url, cost_price, category_id, is_available, stocks FROM menu_items ORDER BY category_id ASC, name ASC",
    );
    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch menu items", err);
    res.status(500).json({ error: "Failed to fetch menu items" });
  }
});

// GET /most-sold-items - public; get the most sold items of all time
app.get("/most-sold-items", async (_req, res) => {
  try {
    // First, get the maximum quantity sold for any single item
    const [maxResult] = await pool.query(
      `
      SELECT MAX(total_quantity) as max_quantity
      FROM (
        SELECT SUM(oi.quantity) as total_quantity
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status != 'cancelled'
        GROUP BY oi.item_name
      ) as item_stats
    `,
    );

    const maxQuantity = maxResult[0]?.max_quantity;

    if (!maxQuantity) {
      return res.json([]);
    }

    // Then, get all items with that maximum quantity
    const [rows] = await pool.query(
      `
      SELECT 
        oi.item_name,
        SUM(oi.quantity) as total_quantity,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled'
      GROUP BY oi.item_name
      HAVING total_quantity = ?
      ORDER BY oi.item_name ASC
    `,
      [maxQuantity],
    );

    res.json(rows);
  } catch (err) {
    console.error("Failed to fetch most sold items", err);
    res.status(500).json({ error: "Failed to fetch most sold items" });
  }
});

// PATCH /menu-items/availability - Update product availability
app.patch("/menu-items/availability", authenticateToken, async (req, res) => {
  const { name, is_available } = req.body;

  if (name === undefined || is_available === undefined) {
    return res
      .status(400)
      .json({ error: "Missing name or is_available status" });
  }

  try {
    const [result] = await pool.query(
      "UPDATE menu_items SET is_available = ? WHERE name = ?",
      [is_available ? 1 : 0, name],
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

// PATCH /menu-items/stock - Update product stock
app.patch("/menu-items/stock", authenticateToken, async (req, res) => {
  const { name, stocks } = req.body;

  if (name === undefined || stocks === undefined) {
    return res.status(400).json({ error: "Missing name or stocks" });
  }

  if (isNaN(stocks) || Number(stocks) < 0) {
    return res.status(400).json({
      error: "Stocks must be a valid number greater than or equal to 0",
    });
  }

  try {
    const newStocks = Number(stocks);
    const [result] = await pool.query(
      "UPDATE menu_items SET stocks = ?, is_available = IF(? <= 0, 0, is_available) WHERE name = ?",
      [newStocks, newStocks, name],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ success: true, message: "Stock updated successfully" });
  } catch (err) {
    console.error("Failed to update stock", err);
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
      [customerName, table, paymentMethod, total || 0, "pending"],
    );

    const orderId = orderResult.insertId;

    // Insert order items and update stock
    for (const item of items) {
      const requestedQty = Number(item.quantity);
      if (!Number.isInteger(requestedQty) || requestedQty <= 0) {
        const quantityError = new Error(
          `Invalid quantity for item "${item.name}".`,
        );
        quantityError.statusCode = 400;
        throw quantityError;
      }

      const [stockRows] = await conn.query(
        "SELECT stocks FROM menu_items WHERE name = ? FOR UPDATE",
        [item.name],
      );

      if (stockRows.length === 0) {
        const notFoundError = new Error(
          `Item "${item.name}" no longer exists.`,
        );
        notFoundError.statusCode = 404;
        throw notFoundError;
      }

      const availableStock = Number(stockRows[0].stocks);
      if (!Number.isFinite(availableStock) || availableStock < requestedQty) {
        const stockError = new Error(
          `Not enough stock for "${item.name}". Available: ${Math.max(
            0,
            availableStock || 0,
          )}.`,
        );
        stockError.statusCode = 409;
        throw stockError;
      }

      const subtotal = Number(item.price) * requestedQty;
      await conn.query(
        "INSERT INTO order_items (order_id, item_name, item_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.name, item.price, requestedQty, subtotal],
      );

      // Decrement stock; auto-disable availability if stock reaches 0
      await conn.query(
        "UPDATE menu_items SET is_available = IF(stocks - ? <= 0, 0, is_available), stocks = stocks - ? WHERE name = ?",
        [requestedQty, requestedQty, item.name],
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
    res.status(err.statusCode || 500).json({
      error: err.message || "Failed to create order",
    });
  } finally {
    conn.release();
  }
});

// POST /order-reviews — public; verifies order details match the placed order
app.post("/order-reviews", async (req, res) => {
  const { orderId, customerName, table, rating, comment } = req.body;

  if (
    orderId === undefined ||
    orderId === null ||
    !customerName ||
    table === undefined ||
    table === null ||
    table === "" ||
    rating === undefined ||
    rating === null ||
    rating === ""
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: orderId, customerName, table, and rating",
    });
  }

  const numericRating = Number(rating);
  if (
    !Number.isInteger(numericRating) ||
    numericRating < 1 ||
    numericRating > 5
  ) {
    return res
      .status(400)
      .json({ error: "Rating must be an integer from 1 to 5" });
  }

  const oid = parseInt(orderId, 10);
  if (isNaN(oid)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  const commentText =
    typeof comment === "string" ? comment.trim().slice(0, 2000) : null;

  try {
    const [rows] = await pool.query(
      "SELECT id FROM orders WHERE id = ? AND customer_name = ? AND table_number = ?",
      [oid, String(customerName).trim(), String(table).trim()],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Order not found or details do not match" });
    }

    await pool.query(
      "INSERT INTO order_reviews (order_id, rating, comment) VALUES (?, ?, ?)",
      [oid, numericRating, commentText || null],
    );

    res
      .status(201)
      .json({ success: true, message: "Thank you for your feedback" });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Feedback has already been submitted for this order" });
    }
    console.error("Failed to save order review", err);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

// GET /orders/:id - Retrieve a single order by ID with its items
app.get("/orders/:id", authenticateToken, async (req, res) => {
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
      [orderId],
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
      [orderId],
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

// PUT /orders/:id - Full order update (operator/admin)
app.put("/orders/:id", authenticateToken, async (req, res) => {
  const orderId = parseInt(req.params.id);
  if (isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order ID" });
  }

  const { customer_name, table_number, payment_method, status, items } =
    req.body;

  // Validate required fields
  if (
    !customer_name ||
    !table_number ||
    !payment_method ||
    !status ||
    !items ||
    items.length === 0
  ) {
    return res.status(400).json({
      error:
        "Missing required fields: customer_name, table_number, payment_method, status, items",
    });
  }

  const validStatuses = ["pending", "preparing", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Recalculate total from items to avoid client-side tampering
  const total_amount = items.reduce(
    (sum, item) => sum + parseFloat(item.price) * parseInt(item.quantity),
    0,
  );

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check order exists
    const [existing] = await conn.query("SELECT id FROM orders WHERE id = ?", [
      orderId,
    ]);
    if (existing.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    // Update order header
    await conn.query(
      `UPDATE orders 
       SET customer_name = ?, table_number = ?, payment_method = ?, status = ?, total_amount = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        customer_name,
        table_number,
        payment_method,
        status,
        total_amount,
        orderId,
      ],
    );

    // Replace all order items
    await conn.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);

    for (const item of items) {
      const subtotal = parseFloat(item.price) * parseInt(item.quantity);
      await conn.query(
        "INSERT INTO order_items (order_id, item_name, item_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?)",
        [orderId, item.name, item.price, item.quantity, subtotal],
      );
    }

    await conn.commit();

    res.json({
      success: true,
      message: "Order updated successfully",
      orderId,
      total_amount: total_amount.toFixed(2),
    });
  } catch (err) {
    await conn.rollback();
    console.error("Failed to update order", err);
    res.status(500).json({ error: "Failed to update order" });
  } finally {
    conn.release();
  }
});

// PATCH /orders/:id/status - Update order status
app.patch("/orders/:id/status", authenticateToken, async (req, res) => {
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
      [status, orderId],
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

// DELETE /orders/:id - Delete an order (operator/admin)
app.delete(
  "/orders/:id",
  authenticateToken,
  requireRole("operator", "admin"),
  async (req, res) => {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [existingOrders] = await conn.query(
        "SELECT id FROM orders WHERE id = ? FOR UPDATE",
        [orderId],
      );

      if (existingOrders.length === 0) {
        await conn.rollback();
        return res.status(404).json({ error: "Order not found" });
      }

      // Restock items from the deleted order so inventory stays consistent.
      const [orderItems] = await conn.query(
        "SELECT item_name, quantity FROM order_items WHERE order_id = ?",
        [orderId],
      );

      for (const item of orderItems) {
        const quantity = Number(item.quantity) || 0;
        if (quantity <= 0) continue;

        await conn.query(
          "UPDATE menu_items SET stocks = stocks + ?, is_available = IF(stocks + ? > 0, 1, is_available) WHERE name = ?",
          [quantity, quantity, item.item_name],
        );
      }

      await conn.query("DELETE FROM order_items WHERE order_id = ?", [orderId]);
      await conn.query("DELETE FROM order_reviews WHERE order_id = ?", [
        orderId,
      ]);
      await conn.query("DELETE FROM orders WHERE id = ?", [orderId]);

      await conn.commit();

      res.json({
        success: true,
        message: "Order deleted successfully",
        orderId,
      });
    } catch (err) {
      await conn.rollback();
      console.error("Failed to delete order", err);
      res.status(500).json({ error: "Failed to delete order" });
    } finally {
      conn.release();
    }
  },
);

// GET /history - Retrieve all orders with their items
app.get("/history", authenticateToken, async (_req, res) => {
  try {
    // Fetch all orders
    const [orders] = await pool.query(
      `SELECT id, customer_name, table_number, payment_method, total_amount, status, created_at, updated_at 
       FROM orders 
       ORDER BY created_at DESC`,
    );

    // Fetch all order items
    const [orderItems] = await pool.query(
      `SELECT order_id, item_name, item_price, quantity, subtotal 
       FROM order_items 
       ORDER BY order_id, id`,
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

// PUT /menu-items/:id - Update a menu item (admin only)
app.put(
  "/menu-items/:id",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      cost_price,
      image_url,
      category_id,
      is_available,
      stocks,
    } = req.body;

    if (!name || !price || !category_id || stocks === undefined) {
      return res.status(400).json({
        error: "Missing required fields: name, price, category_id, stocks",
      });
    }
    if (isNaN(price) || Number(price) <= 0) {
      return res
        .status(400)
        .json({ error: "Price must be a valid number greater than 0" });
    }
    if (isNaN(stocks) || Number(stocks) < 0) {
      return res.status(400).json({
        error: "Stocks must be a valid number greater than or equal to 0",
      });
    }

    try {
      const [result] = await pool.query(
        `UPDATE menu_items SET name=?, description=?, price=?, cost_price=?, image_url=?, category_id=?, is_available=?, stocks=? WHERE id=?`,
        [
          name,
          description || null,
          Number(price),
          cost_price !== undefined ? Number(cost_price) : null,
          image_url || null,
          Number(category_id),
          Number(stocks) === 0 ? 0 : is_available ? 1 : 0,
          Number(stocks),
          id,
        ],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ success: true, message: "Product updated successfully" });
    } catch (err) {
      console.error("Failed to update menu item", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ error: "A product with this name already exists" });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  },
);

// POST /menu-items - Create a new menu item (admin only)
app.post(
  "/menu-items",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const {
      name,
      description,
      price,
      cost_price,
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
        `INSERT INTO menu_items (name, description, price, cost_price, image_url, category_id, is_available, stocks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          Number(price),
          cost_price !== undefined ? Number(cost_price) : null,
          image_url || null,
          Number(category_id),
          is_available ? 1 : 0,
          Number(stocks),
        ],
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
  },
);

// DELETE /menu-items/:id - Delete a menu item (operator/admin)
app.delete(
  "/menu-items/:id",
  authenticateToken,
  requireRole("operator", "admin"),
  async (req, res) => {
    const { id } = req.params;
    const numericId = Number(id);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    try {
      const [result] = await pool.query("DELETE FROM menu_items WHERE id = ?", [
        numericId,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({
        success: true,
        message: "Product deleted successfully",
        id: numericId,
      });
    } catch (err) {
      console.error("Failed to delete menu item", err);

      if (
        err.code === "ER_ROW_IS_REFERENCED_2" ||
        err.code === "ER_ROW_IS_REFERENCED"
      ) {
        return res.status(409).json({
          error:
            "Cannot delete this product because it is referenced by existing records",
        });
      }

      res.status(500).json({ error: "Failed to delete product" });
    }
  },
);

// admin cards
// GET /stats - Retrieve dashboard metrics
app.get("/stats", authenticateToken, requireRole("admin"), async (req, res) => {
  const { fromDate, toDate } = req.query;

  try {
    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "AND DATE(created_at) BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateCondition = "AND DATE(created_at) >= ?";
      params.push(fromDate);
    } else if (toDate) {
      dateCondition = "AND DATE(created_at) <= ?";
      params.push(toDate);
    }

    const [statsRows] = await pool.query(
      `
      SELECT 
        COUNT(CASE WHEN status != 'cancelled' THEN 1 END) as active_orders,
        SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END) as total_revenue,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders
      WHERE 1=1 ${dateCondition}
    `,
      params,
    );

    const [profitRows] = await pool.query(
      `
      SELECT 
        SUM(oi.quantity * (oi.item_price - COALESCE(m.cost_price, 0))) as total_profit
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items m ON oi.item_name = m.name
      WHERE o.status != 'cancelled'
    ` + (dateCondition ? ` AND DATE(o.created_at) BETWEEN ? AND ?` : ""),
      dateCondition ? [fromDate, toDate] : [],
    );

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

// GET /orders/:id/profit - profit for a specific order (admin only)
app.get(
  "/orders/:id/profit",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const orderId = parseInt(req.params.id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    try {
      const [result] = await pool.query(
        `SELECT 
        SUM(oi.quantity * (oi.item_price - COALESCE(m.cost_price, 0))) as profit
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menu_items m ON oi.item_name = m.name
      WHERE o.id = ? AND o.status != 'cancelled'
      GROUP BY o.id`,
        [orderId],
      );

      if (result.length === 0) {
        return res.status(404).json({ error: "Order not found or cancelled" });
      }

      const profit = parseFloat(result[0].profit || 0).toFixed(2);
      res.json({ profit: profit });
    } catch (err) {
      console.error("Failed to fetch order profit", err);
      res.status(500).json({ error: "Failed to fetch order profit" });
    }
  },
);

// PIE CHART API

// GET /orders/stats/items - most sold items (admin only)
app.get(
  "/orders/stats/items",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const { fromDate, toDate } = req.query;

    try {
      let dateCondition = "";
      const params = [];

      if (fromDate && toDate) {
        dateCondition = "AND DATE(o.created_at) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      } else if (fromDate) {
        dateCondition = "AND DATE(o.created_at) >= ?";
        params.push(fromDate);
      } else if (toDate) {
        dateCondition = "AND DATE(o.created_at) <= ?";
        params.push(toDate);
      }

      const [rows] = await pool.query(
        `
      SELECT 
        oi.item_name,
        SUM(oi.quantity) as total_quantity,
        COUNT(DISTINCT oi.order_id) as order_count,
        SUM(oi.subtotal) as total_revenue
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'cancelled' ${dateCondition}
      GROUP BY oi.item_name
      ORDER BY total_quantity DESC
    `,
        params,
      );

      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch order stats", err);
      res.status(500).json({ error: "Failed to fetch order statistics" });
    }
  },
);

// GET /orders/stats/daily-revenue - Get revenue by day for selected period (admin only)
app.get(
  "/orders/stats/daily-revenue",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const { fromDate, toDate } = req.query;

    try {
      let dateCondition = "";
      const params = [];

      if (fromDate && toDate) {
        dateCondition = "AND DATE(created_at) BETWEEN ? AND ?";
        params.push(fromDate, toDate);
      } else if (fromDate) {
        dateCondition = "AND DATE(created_at) >= ?";
        params.push(fromDate);
      } else if (toDate) {
        dateCondition = "AND DATE(created_at) <= ?";
        params.push(toDate);
      }
      // If no dates provided, get all time data

      const [rows] = await pool.query(
        `
      SELECT 
        DATE(created_at) as order_date,
        DAYNAME(created_at) as day_name,
        SUM(total_amount) as daily_revenue
      FROM orders
      WHERE status != 'cancelled' ${dateCondition}
      GROUP BY DATE(created_at), DAYNAME(created_at)
      ORDER BY order_date ASC
    `,
        params,
      );

      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch daily revenue", err);
      res.status(500).json({ error: "Failed to fetch daily revenue" });
    }
  },
);

// GET /order-reviews - list reviews (admin only)
app.get(
  "/order-reviews",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const limit = Math.min(200, Math.max(1, Number(req.query.limit || 50)));

      const [rows] = await pool.query(
        `
        SELECT
          r.id,
          r.order_id,
          r.rating,
          r.comment,
          r.created_at,
          o.customer_name,
          o.table_number
        FROM order_reviews r
        JOIN orders o ON o.id = r.order_id
        ORDER BY r.created_at DESC
        LIMIT ?
      `,
        [limit],
      );

      res.json(rows);
    } catch (err) {
      console.error("Failed to fetch order reviews", err);
      res.status(500).json({ error: "Failed to fetch order reviews" });
    }
  },
);

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await ensureOrderReviewsTable();
  } catch (err) {
    console.error("Could not ensure order_reviews table:", err.message);
    process.exit(1);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend listening on port ${PORT} (Network Accessible)`);
  });
}

start();
