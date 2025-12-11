# GreenUp - Project Structure

## Overview

GreenUp is a multi-role restaurant management application with support for:

- **Clients**: Browse menu, place orders
- **Operators**: Manage orders, kitchen operations
- **Admins**: System administration, user management, menu management

## Directory Structure

```
frontend/src/
├── components/
│   ├── client/              # Client-specific components
│   ├── operator/            # Operator-specific components
│   ├── admin/               # Admin-specific components
│   ├── CategoryTabs.jsx     # Shared component
│   ├── FooterBar.jsx        # Shared navigation
│   ├── Hero.jsx             # Shared component
│   ├── MenuSection.jsx      # Shared component
│   └── SearchBar.jsx        # Shared component
├── pages/
│   ├── client/              # Client pages
│   │   └── Home.jsx         # Client homepage (menu)
│   ├── operator/            # Operator pages
│   │   └── Dashboard.jsx    # Operator dashboard
│   ├── admin/               # Admin pages
│   │   └── Dashboard.jsx    # Admin dashboard
│   ├── Cart.jsx             # Shared shopping cart
│   ├── Checkout.jsx         # Shared checkout
│   ├── ConfirmedOrder.jsx   # Shared order confirmation
│   └── AdminLogin.jsx       # Login page for admin/operator
├── context/
│   └── AuthContext.jsx      # Global authentication state
├── hooks/                   # Custom React hooks (expand as needed)
├── utils/
│   └── authUtils.js         # Authentication utilities
├── App.jsx                  # Main app router
├── App.css                  # Styles
├── main.jsx                 # Entry point
└── index.css                # Global styles
```

## Authentication & Authorization

### Auth Context

- Managed via `AuthContext.jsx`
- Provides `useAuth()` hook for accessing user info
- Tracks login state and user role

### Auth Utilities (`authUtils.js`)

- `setAuthToken()` - Save token to localStorage
- `getAuthToken()` - Retrieve token
- `getCurrentUser()` - Get current user info from token
- `getUserRole()` - Get user's role
- `hasRole()` - Check if user has specific role
- `logout()` - Clear auth data

### Roles

```javascript
{
  CLIENT: "client",
  OPERATOR: "operator",
  ADMIN: "admin"
}
```

## Test Credentials

Access the login page at: `http://localhost:5173/#admin`

**Admin:**

- Username: `admin`
- Password: `admin`
- Redirects to: Admin Dashboard

**Operator:**

- Username: `operator`
- Password: `operator`
- Redirects to: Operator Dashboard

## Routing

Routes are handled via URL hash:

| Route                 | Component         | Role     | Purpose                      |
| --------------------- | ----------------- | -------- | ---------------------------- |
| `#home`               | ClientHome        | Client   | Browse menu and place orders |
| `#admin`              | AdminLogin        | Public   | Login page                   |
| `#admin-dashboard`    | AdminDashboard    | Admin    | System administration        |
| `#operator-dashboard` | OperatorDashboard | Operator | Order management             |
| `#cart`               | Cart              | Client   | Shopping cart                |
| `#checkout`           | Checkout          | Client   | Complete order               |
| `#confirmed`          | ConfirmedOrder    | Client   | Order confirmation           |

## API Endpoints

### Already Implemented

- `GET /menu-items` - Fetch all menu items
- `POST /orders` - Create new order
- `GET /orders` - Get all orders

### Future Implementation

- `POST /auth/login` - Authenticate users
- `GET /users` - List users
- `POST /menu-items` - Create menu item
- User management endpoints

## Next Steps

1. **Complete Operator Dashboard**

   - Order list with status updates
   - Kitchen display system (KDS)
   - Order filtering/sorting

2. **Complete Admin Dashboard**

   - Menu management (CRUD)
   - User management
   - System analytics

3. **Implement Backend Authentication**

   - Replace hardcoded credentials
   - JWT token validation
   - Database-backed auth

4. **Add Protected Routes**

   - Route guards based on role
   - Redirect unauthorized users

5. **UI/UX Improvements**
   - Responsive design refinement
   - Dark mode support
   - Accessibility enhancements
