// seed_admin.js
// Usage:
// ADMIN_USERNAME=admin ADMIN_PASSWORD=strongpass node seed_admin.js
// or set environment vars in a .env file and run: node seed_admin.js

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "restaurant_app",
  port: Number(process.env.DB_PORT || 3306),
};

async function run() {
  const username = process.env.ADMIN_USERNAME || process.argv[2] || "admin";
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || "adminpass";
  const role = process.env.ADMIN_ROLE || "admin";

  if (!username || !password) {
    console.error("Provide ADMIN_USERNAME and ADMIN_PASSWORD via env or args");
    process.exit(1);
  }

  const conn = await mysql.createConnection(DB_CONFIG);
  try {
    const hash = await bcrypt.hash(password, 10);

    // Try to insert; if exists, update password
    const [existing] = await conn.execute(
      "SELECT id FROM users WHERE username = ? LIMIT 1",
      [username]
    );
    if (existing && existing.length > 0) {
      const id = existing[0].id;
      await conn.execute(
        "UPDATE users SET password_hash = ?, role = ? WHERE id = ?",
        [hash, role, id]
      );
      console.log(
        `Updated existing user (id=${id}) with new password hash and role='${role}'`
      );
    } else {
      await conn.execute(
        "INSERT INTO users (username, password_hash, role, created_at) VALUES (?, ?, ?, NOW())",
        [username, hash, role]
      );
      console.log(`Inserted new admin user '${username}' with role='${role}'`);
    }
  } catch (err) {
    console.error("Failed to seed admin user", err);
  } finally {
    await conn.end();
  }
}

run();
