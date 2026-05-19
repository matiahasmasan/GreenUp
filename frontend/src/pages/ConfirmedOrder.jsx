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
            className="checkout-back"
            onClick={() => onNavigate && onNavigate("home")}
          >
            Back to Menu
          </button>
        </div>
      </main>
    );
  }

  const estimated = "Approx. 25-35 minutes";

  const total =
    lastOrder.total ||
    (lastOrder.items || []).reduce(
      (sum, it) => sum + Number(it.price) * it.quantity,
      0,
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
          <div className="cooking-animation">
            <svg
              viewBox="0 0 120 90"
              xmlns="http://www.w3.org/2000/svg"
              className="cooking-svg"
            >
              {/* Steam wisps */}
              <path
                className="steam steam-1"
                d="M44 28 Q40 22 44 16 Q48 10 44 4"
                stroke="#a8d5ba"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                className="steam steam-2"
                d="M60 28 Q56 22 60 16 Q64 10 60 4"
                stroke="#a8d5ba"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                className="steam steam-3"
                d="M76 28 Q72 22 76 16 Q80 10 76 4"
                stroke="#a8d5ba"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Pan handle */}
              <rect x="8" y="40" width="28" height="8" rx="4" fill="#1f5d3f" />
              {/* Pan body */}
              <rect
                x="30"
                y="36"
                width="72"
                height="26"
                rx="13"
                fill="#1f5d3f"
              />
              {/* Pan rim highlight */}
              <rect
                x="34"
                y="38"
                width="64"
                height="8"
                rx="10"
                fill="#4a9b6e"
                opacity="0.5"
              />
              {/* Food items - sizzling dots */}
              <circle
                className="bubble bubble-1"
                cx="55"
                cy="50"
                r="4"
                fill="#7bc297"
              />
              <circle
                className="bubble bubble-2"
                cx="72"
                cy="46"
                r="3"
                fill="#a8d5ba"
              />
              <circle
                className="bubble bubble-3"
                cx="85"
                cy="52"
                r="5"
                fill="#7bc297"
              />
              <circle
                className="bubble bubble-4"
                cx="65"
                cy="55"
                r="3.5"
                fill="#4a9b6e"
              />
            </svg>
          </div>
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

          <p style={{ marginTop: "1rem" }}>
            <button
              type="button"
              className="link-button"
              onClick={() => onNavigate && onNavigate("feedback")}
            >
              Leave feedback (or review)
            </button>
          </p>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              className="checkout-back"
              onClick={() => onNavigate && onNavigate("home")}
            >
              Back to Menu
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
