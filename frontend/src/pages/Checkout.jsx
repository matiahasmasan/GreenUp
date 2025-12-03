import React, { useState } from "react";
import Hero from "../components/Hero";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Checkout({ cartItems, onNavigate }) {
  // read `table` param from URL to simulate QR selection (e.g. ?table=1)
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const initialTable = params ? params.get("table") || "" : "";

  const [name, setName] = useState("");
  const [table, setTable] = useState(initialTable);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const isFormValid = () => {
    return name.trim() && table.toString().trim();
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      alert("Please enter your name");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Send order to backend
      console.log("Order submitted:", {
        items: cartItems,
        customerName: name,
        table,
        paymentMethod,
        total,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert("Order placed successfully!");
      // TODO: Navigate to order confirmation page
      onNavigate && onNavigate("menu");
    } catch (error) {
      alert("Error placing order. Please try again.");
      console.error("Order error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="checkout-page page">
        <Hero />
        <div className="status">
          <p>Your cart is empty. Please add items before checkout.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page page">
      <Hero />

      <div className="checkout-container">
        <div className="category-header">
          <h2>Checkout</h2>
          <span className="category-count">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <form onSubmit={handleSubmitOrder} className="checkout-form">
          {/* Customer Name Section */}
          <section className="checkout-section">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="table">Table *</label>
              <input
                type="text"
                id="table"
                value={table}
                onChange={(e) => setTable(e.target.value)}
                placeholder="1"
                required
              />
            </div>
          </section>

          {/* Payment Method Section */}
          <section className="checkout-section">
            <h3 className="checkout-section-title">
              <i className="fas fa-credit-card"></i> Payment Method
            </h3>
            <div className="payment-methods">
              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <div className="payment-option-content">
                  <div className="payment-option-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
                  <div className="payment-option-text">
                    <span className="payment-option-title">
                      Credit/Debit Card
                    </span>
                    <span className="payment-option-desc">
                      Secure payment with Card
                    </span>
                  </div>
                </div>
              </label>

              <label className="payment-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                />
                <div className="payment-option-content">
                  <div className="payment-option-icon">
                    <i className="fas fa-money-bill-wave"></i>
                  </div>
                  <div className="payment-option-text">
                    <span className="payment-option-title">Cash Payment</span>
                    <span className="payment-option-desc">
                      Pay with cash at the restaurant
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </section>

          {/* Order Summary Section */}
          <section className="checkout-section">
            <h3 className="checkout-section-title">
              <i className="fas fa-receipt"></i> Order Summary
            </h3>
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.cartKey} className="order-item">
                  <div className="order-item-info">
                    <span className="order-item-name">{item.name}</span>
                    <span className="order-item-qty">x{item.quantity}</span>
                  </div>
                  <span className="order-item-price">
                    {priceFormatter.format(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-summary">
              <div className="summary-row total">
                <span>Total</span>
                <span>{priceFormatter.format(total)}</span>
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <button
            type="submit"
            className="checkout-submit"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i> Place Order
              </>
            )}
          </button>

          <button
            type="button"
            className="checkout-back"
            onClick={() => onNavigate && onNavigate("cart")}
          >
            <i className="fas fa-arrow-left"></i> Back to Cart
          </button>
        </form>
      </div>
    </main>
  );
}
