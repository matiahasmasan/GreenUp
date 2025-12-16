import React from "react";
import { useAuth } from "../context/AuthContext";

function FooterBar({ onNavigate = () => {}, cartItemCount = 0 }) {
  const { user } = useAuth();

  // Define role-specific menu items
  const menuConfig = {
    client: [
      { label: "Home", key: "home", icon: "fas fa-home" },
      {
        label: "Cart",
        key: "cart",
        icon: "fas fa-shopping-cart",
        badge: cartItemCount,
      },
      { label: "Language", key: "flag", icon: "fas fa-flag" },
    ],
    operator: [
      { label: "Orders", key: "operator-dashboard", icon: "fas fa-list" },
      {
        label: "Order History",
        key: "history",
        icon: "fas fa-clock-rotate-left",
      },
      { label: "Products", key: "products", icon: "fas fa-burger" },
      { label: "Logout", key: "logout", icon: "fas fa-sign-out-alt" },
    ],
    admin: [
      {
        label: "Dashboard",
        key: "admin-dashboard",
        icon: "fas fa-tachometer-alt",
      },
      {
        label: "Order History",
        key: "history",
        icon: "fas fa-clock-rotate-left",
      },
      { label: "Products", key: "products", icon: "fas fa-burger" },
      { label: "Operators", key: "operators", icon: "fas fa-user" },
      { label: "Logout", key: "logout", icon: "fas fa-sign-out-alt" },
    ],
    public: [
      { label: "Home", key: "home", icon: "fas fa-home" },
      { label: "Login", key: "login", icon: "fas fa-sign-in-alt" },
      { label: "Language", key: "flag", icon: "fas fa-flag" },
    ],
  };

  const items = menuConfig[user?.role] || menuConfig.public;

  return (
    <footer
      className="footer-nav"
      role="navigation"
      aria-label="Bottom navigation"
    >
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className="nav-item"
          onClick={() => onNavigate(item.key)}
          aria-label={item.label}
        >
          <i className={item.icon} aria-hidden="true"></i>
          {item.badge > 0 && (
            <span
              className="cart-badge"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {item.badge}
            </span>
          )}
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </footer>
  );
}

export default FooterBar;
