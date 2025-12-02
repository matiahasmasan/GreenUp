import React from "react";

function FooterBar({ onNavigate = () => {} }) {
  return (
    <footer
      className="footer-nav"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <button
        type="button"
        className="nav-item"
        onClick={() => onNavigate("home")}
        aria-label="Home"
      >
        <i className="fas fa-home" aria-hidden="true"></i>
        <span className="nav-label">Home</span>
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => onNavigate("cart")}
        aria-label="Cart"
      >
        <i className="fas fa-shopping-cart" aria-hidden="true"></i>
        <span className="nav-label">Cart</span>
      </button>

      <button
        type="button"
        className="nav-item"
        onClick={() => onNavigate("flag")}
        aria-label="Toggle language"
      >
        <i className="fas fa-flag" aria-hidden="true"></i>
        <span className="nav-label">Lang</span>
      </button>
    </footer>
  );
}

export default FooterBar;
