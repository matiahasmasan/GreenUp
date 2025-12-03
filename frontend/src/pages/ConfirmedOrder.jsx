import React from "react";
import Hero from "../components/Hero";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function ConfirmedOrder({ lastOrder, onNavigate }) {
  if (!lastOrder) {
    return (
      <main className="checkout-page page">
        <Hero />
        <div className="status">
          <p>No recent order found.</p>
          <button
            className="add-to-cart"
            onClick={() => onNavigate && onNavigate("menu")}
          >
            Back to Menu
          </button>
        </div>
      </main>
    );
  }

  // estimate: simple fixed value (e.g., 25-35 minutes)
  const estimated = "Approx. 25-35 minutes";

  const total =
    lastOrder.total ||
    (lastOrder.items || []).reduce(
      (s, it) => s + Number(it.price) * it.quantity,
      0
    );

  return (
    <main className="checkout-page page">
      <Hero />

      <div className="checkout-container">
        <div className="category-header">
          <h2>Order Confirmed</h2>
        </div>

        <section className="checkout-section">
          <h3 className="checkout-section-title">
            <i className="fas fa-check-circle"></i> Thank you!
          </h3>

          <p style={{ margin: "0.5rem 0 1rem" }}>
            Your order has been received.
          </p>

          <div className="order-summary">
            <div className="summary-row">
              <span>Name</span>
              <strong>{lastOrder.customerName}</strong>
            </div>
            <div className="summary-row">
              <span>Table</span>
              <strong>{lastOrder.table}</strong>
            </div>
            <div className="summary-row">
              <span>Payment</span>
              <strong>
                {lastOrder.paymentMethod === "card" ? "Card" : "Cash"}
              </strong>
            </div>
            <div className="summary-row total" style={{ marginTop: "0.75rem" }}>
              <span>Total</span>
              <strong>{priceFormatter.format(total)}</strong>
            </div>
          </div>

          <p style={{ marginTop: "1rem", fontWeight: 600 }}>{estimated}</p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              className="add-to-cart"
              onClick={() => onNavigate && onNavigate("menu")}
            >
              Continue Browsing
            </button>
            <button
              className="checkout-back"
              onClick={() => onNavigate && onNavigate("menu")}
            >
              Back to Menu
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
