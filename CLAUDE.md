# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GreenUp is a QR-code-based restaurant ordering system. Clients scan a table's QR code to browse the menu, add items to cart, and place orders. Operators view and manage incoming orders. Admins see analytics and manage the full menu.

**Stack:** React 19 + Vite (frontend) · Node.js + Express 5 (backend) · MySQL 8 (database) · JWT auth · TailwindCSS 4

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
- `backend/.env` with `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`

## Architecture

### Frontend Routing

Hash-based SPA (no React Router). Hash values like `#home`, `#cart`, `#operator-dashboard` drive routing in `frontend/src/App.jsx` → `AppRouter.jsx`. The `guard()` function in AppRouter redirects users to their role's dashboard if they hit a forbidden route.

**Public routes:** `home`, `cart`, `checkout`, `confirmed`, `feedback`, `login`  
**Operator/Admin:** `operator-dashboard`, `products`  
**Admin-only:** `admin-dashboard`

### State Management

- **Auth:** `AuthContext` (JWT stored in `localStorage` as `adminToken`)
- **Cart:** `useCart` hook — items keyed by `${name}-${price}-${sortedAddonIds}` to handle same item with different addons
- **Orders:** `useOrderPolling` hook — polls `/api/history` every 5 seconds, pauses when modals are open or tab is hidden
- No Redux/Zustand; Context + local state + custom hooks only

### API Layer

All requests go through Vite's dev proxy (`/api` → `localhost:4000`). Protected requests use `authFetch()` from `frontend/src/utils/authUtils.js`, which auto-attaches the Bearer token.

Backend is a single file: `backend/server.js` (+1300 lines) with Express 5. Middleware chain:

1. JSON parser + CORS
2. `authenticateToken` (JWT verify, attaches `req.user`)
3. `requireRole(...roles)` (role-based guard)

### Database & Key Business Logic

**Tables:** `users`, `categories`, `menu_items`, `product_addons`, `orders`, `order_items`, `order_item_addons`, `order_reviews`

**Order creation** (`POST /orders`) runs in a MySQL transaction:

1. Insert order row
2. Insert each order_item + its addons
3. Decrement stock on each `menu_item`; auto-disable if stock ≤ 0
4. Rollback entire transaction if any step fails (stock insufficient, item not found)

**Order deletion** restores stock for each item in the order.

**Stock enforcement** uses `SELECT ... FOR UPDATE` row-level locking to prevent race conditions.

`order_reviews` has a `UNIQUE(order_id)` constraint — one review per order. The table is auto-created on server startup if it doesn't exist.

### Component Conventions

- Pages in `frontend/src/pages/` act as containers (data fetching + state); split by role subdirectory (`client/`, `operator/`, `admin/`)
- Modals are dedicated components named `[Feature]Modal.jsx` (e.g., `EditOrderModal.jsx`, `CreateProductModal.jsx`)
- Shared UI lives in `frontend/src/components/common/` (`Modal.jsx`, `Pagination.jsx`)
- `authFetch` replaces all `fetch` calls for protected endpoints

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
