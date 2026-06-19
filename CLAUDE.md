# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GreenUp is a QR-code-based restaurant ordering system. Clients scan a table's QR code to browse the menu, add items to cart, and place orders — either as guests or with a registered account. Operators view and manage incoming orders. Admins see analytics and manage the full menu.

**Roles:** `client` (registered customers), `operator` (kitchen/order staff), `admin` (full access + analytics), plus a legacy `viewer` role in the enum. Guests (no account) can still order; the order is linked to a `user_id` only when a logged-in client checks out.

**Stack:** React 19 + Vite (frontend) · Node.js + Express 5 (backend) · MySQL 8 (database) · JWT auth · TailwindCSS 4 · Anthropic Claude (Sprout chatbot)

## Commands

### Development

```bash
# Start both servers together (from repo root)
./start.sh

# Or start separately:
cd backend && npm run dev    # API on :4000
cd frontend && npm run dev   # Vite on :5173
```

### Build & Lint

```bash
cd frontend && npm run build   # Production bundle → dist/
cd frontend && npm run lint    # ESLint check
```

No build step for the backend; it runs directly with Node.

### Prerequisites

- MySQL 8 running on localhost:3306 with database `restaurant_app`
- `backend/.env` with `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`
- Optional `ANTHROPIC_API_KEY` in `backend/.env` — enables the Sprout chatbot; without it `POST /chat` returns 503

## Architecture

### Frontend Routing

Hash-based SPA (no React Router). Hash values like `#home`, `#cart`, `#operator-dashboard` drive routing in `frontend/src/App.jsx` → `AppRouter.jsx`. The `guard()` function in AppRouter redirects users to their role's dashboard (or login/404) if they hit a forbidden route.

**Public routes:** `home`, `cart`, `checkout`, `confirmed`, `feedback`, `login`, `register`  
**Client-only:** `account` (order history / profile)  
**Operator/Admin:** `operator-dashboard`, `products`  
**Admin-only:** `admin-dashboard`, `users` (user management)

### State Management

- **Auth:** `AuthContext` (JWT stored in `localStorage` as `adminToken`)
- **Cart:** `useCart` hook — items keyed by `${name}-${price}-${sortedAddonIds}` to handle same item with different addons
- **Orders:** `useOrderPolling` hook — polls `/api/history` every 5 seconds, pauses when modals are open or tab is hidden
- No Redux/Zustand; Context + local state + custom hooks only

### API Layer

All requests go through Vite's dev proxy (`/api` → `localhost:4000`). Protected requests use `authFetch()` from `frontend/src/utils/authUtils.js`, which auto-attaches the Bearer token.

Backend is a single file: `backend/server.js` (~1850 lines) with Express 5. Per-route middleware:

1. JSON parser + CORS (global)
2. `authenticateToken` — JWT verify, attaches `req.user`, **401 if missing/invalid**
3. `optionalAuth` — attaches `req.user` if a valid token is present but never blocks; used for endpoints that serve both guests and logged-in clients (e.g. `POST /orders`)
4. `requireRole(...roles)` — role-based guard (403 on mismatch)

### Auth

- One login endpoint `POST /auth/login`: staff authenticate with `username`, clients with `email` (both checked against the same column query). `POST /auth/register` creates `client` accounts only.
- `buildAuthResponse()` is the single source for the JWT payload (`{ id, username, role, name, email }`, 8h expiry) and the response body — reuse it when adding auth flows.
- Frontend stores the token in `localStorage` as `adminToken` (legacy name, used for all roles) via `AuthContext` + `authUtils.js`.

### Database & Key Business Logic

**Tables:** `users` (with `email`, `full_name` profile columns), `categories`, `menu_items`, `product_addons`, `orders` (with nullable `user_id`), `order_items`, `order_item_addons`, `order_reviews`

**Schema auto-migration on startup:** the server idempotently patches the schema at boot (see `ensureOrderReviewsTable()` and `ensureClientSchema()`) — it widens the `users.role` enum, adds `users.email`/`users.full_name`, adds `orders.user_id` (FK, `ON DELETE SET NULL`), and creates `order_reviews`. There's no migration runner; `backend/migrations/order_reviews.sql` is reference SQL only. Add schema changes as new idempotent `ensure*()` functions guarded by `columnExists()`.

**Order creation** (`POST /orders`, `optionalAuth`) runs in a MySQL transaction:

1. Insert order row — `user_id` set only when a logged-in `client` places it; guests stay `NULL`
2. Insert each order_item + its addons
3. Decrement stock on each `menu_item`; auto-disable if stock ≤ 0
4. Rollback entire transaction if any step fails (stock insufficient, item not found)

**Client order history** (`GET /my/orders`, `requireRole("client")`) matches both `user_id = <id>` and legacy guest orders by `user_id IS NULL AND customer_name = <full_name>`.

**Order deletion** restores stock for each item in the order.

**Stock enforcement** uses `SELECT ... FOR UPDATE` row-level locking to prevent race conditions.

`order_reviews` has a `UNIQUE(order_id)` constraint — one review per order.

### User Management (admin-only)

`GET/POST/PUT/DELETE /users` (all guarded by `requireRole("admin")`) back the `#users` admin page (`frontend/src/pages/admin/Users.jsx`). Admins create/edit/delete staff and client accounts here. Passwords are hashed with `bcryptjs`; reuse `buildAuthResponse()` semantics for the JWT payload shape when touching auth.

### Sprout Chatbot (Claude)

`ChatBot.jsx` ("Sprout") is a real menu assistant backed by Anthropic Claude — **not** a canned-reply demo.

- **Endpoint:** `POST /chat` (public, no auth). Body: `{ messages: [{ role: "user" | "assistant", content: string }, ...] }`; the last message must be from the user. History is sanitized, capped to the last 20 turns and 2000 chars/message.
- **Client init:** the `anthropic` client is created only if `ANTHROPIC_API_KEY` is set; otherwise `/chat` returns **503**. Model is `claude-haiku-4-5` (`CHAT_MODEL`).
- **System prompt:** `buildSproutSystemPrompt()` queries the *live* menu (only `is_available = 1 AND stocks > 0` items) and injects it, so Sprout only recommends real, in-stock dishes and wraps dish names in `**bold**`.
- **Frontend:** `ChatBot.jsx` maps its message list to the API shape, drops the leading bot greeting (Claude requires the first message to be from the user), and renders `**bold**` spans without `dangerouslySetInnerHTML`.

### Component Conventions

- Pages in `frontend/src/pages/` act as containers (data fetching + state); split by role subdirectory (`client/`, `operator/`, `admin/`)
- Modals are dedicated components named `[Feature]Modal.jsx` (e.g., `EditOrderModal.jsx`, `CreateProductModal.jsx`)
- Shared UI lives in `frontend/src/components/common/` (`Modal.jsx`, `Pagination.jsx`)
- `authFetch` replaces all `fetch` calls for protected endpoints
- `ChatBot.jsx` ("Sprout") calls the real `POST /chat` Claude endpoint (see Sprout Chatbot above)

### Auth Utilities (`frontend/src/utils/authUtils.js`)

Key exports: `authFetch`, `setAuthToken`, `getAuthToken`, `clearAuthToken`, `decodeToken`, `isAuthenticated`, `getUserRole`, `hasRole`, `hasAnyRole`

## Adding New Features

**New page/route:**

1. Create `frontend/src/pages/<role>/YourPage.jsx`
2. Import and add a route case in `AppRouter.jsx`
3. Add role guard if needed

**New API endpoint:**

1. Add route handler in `backend/server.js`
2. Apply `authenticateToken` and `requireRole` as needed
3. Use connection pool: `const [rows] = await pool.query(...)`

**New modal:**
Follow the pattern in existing `*Modal.jsx` files — parent page passes `onClose`/`onSave` props; modal calls them after API response.
