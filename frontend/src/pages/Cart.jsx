import React from "react";
import Hero from "../components/Hero";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Cart({ cartItems, onUpdateQuantity, onRemoveItem }) {
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  if (cartItems.length === 0) {
    return (
      <main className="cart-page page">
        <Hero />
        <div className="status">
          <p>Your cart is currently empty.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page page">
      <Hero />

      <div className="cart-container">
        <div className="category-header">
          <h2>Your Cart</h2>
          <span className="category-count">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.cartKey} className="cart-item">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="cart-item-image"
                />
              )}

              <div className="cart-item-content">
                <div className="cart-item-header">
                  <h3>{item.name}</h3>
                  <button
                    onClick={() => onRemoveItem(item.cartKey)}
                    className="cart-remove-btn"
                    aria-label="Remove item"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
                <p className="menu-description">{item.description}</p>

                <div className="cart-item-footer">
                  <div className="quantity-control">
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.cartKey, item.quantity - 1)
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.cartKey, item.quantity + 1)
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <p className="price">
                    {priceFormatter.format(Number(item.price) * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-summary-row">
            <span className="cart-summary-label">Subtotal</span>
            <span className="cart-summary-total">
              {priceFormatter.format(total)}
            </span>
          </div>
          <p className="cart-summary-note">
            Shipping and taxes calculated at checkout
          </p>
          <button className="add-to-cart">Proceed to Checkout</button>
        </div>
      </div>
    </main>
  );
}
