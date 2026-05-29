import React, { useState } from "react";
import Hero from "../components/Hero";
import { authFetch, getCurrentUser } from "../utils/authUtils";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Checkout({
  cartItems,
  onNavigate,
  onSetLastOrder,
  onClearCart,
  kitchenNote = "",
  onSetKitchenNote,
}) {
  // read `table` param from URL to simulate QR selection (e.g. ?table=1)
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const initialTable = params ? params.get("table") || "" : "";

  // Prefill the name for logged-in clients so their orders link to their account.
  const currentUser = getCurrentUser();
  const initialName =
    currentUser?.role === "client" ? currentUser.name || "" : "";

  const [name, setName] = useState(initialName);
  const [table, setTable] = useState(initialTable);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', text: string }

  const total = cartItems.reduce((sum, item) => {
    const addonTotal = (item.selectedAddons || []).reduce((s, a) => s + Number(a.price), 0);
    return sum + (Number(item.price) + addonTotal) * item.quantity;
  }, 0);

  const isFormValid = () => {
    return name.trim() && table.toString().trim();
  };

  // auto-clear status after a short time
  React.useEffect(() => {
    if (!status) return;
    const t = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(t);
  }, [status]);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setStatus({
        type: "error",
        text: "Please enter your name and table number.",
      });
      return;
    }

    if (cartItems.length === 0) {
      setStatus({ type: "error", text: "Your cart is empty." });
      return;
    }

    setIsProcessing(true);

    try {
      const API_BASE_URL = "/api";

      // Send order to backend. authFetch attaches the client's token when
      // logged in (so the order links to their account); guests send no token.
      const response = await authFetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name,
          table,
          paymentMethod,
          items: cartItems,
          total,
          kitchenNote: kitchenNote.trim() || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to place order");
      }

      const result = await response.json();

      // set last order and navigate to confirmation page
      const order = {
        customerName: name,
        table,
        paymentMethod,
        total,
        items: cartItems,
        orderId: result.orderId,
      };
      onSetLastOrder && onSetLastOrder(order);
      // clear the cart now that order is placed
      onClearCart && onClearCart();
      onSetKitchenNote && onSetKitchenNote("");
      // show a brief non-blocking success message before navigating
      setStatus({ type: "success", text: "Order placed successfully!" });
      // navigate to confirmed page
      onNavigate && onNavigate("confirmed");
    } catch (error) {
      setStatus({
        type: "error",
        text: error.message || "Error placing order. Please try again.",
      });
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
        {status && (
          <div
            className={"status" + (status.type === "error" ? " error" : "")}
            style={{ margin: "0 0 1rem" }}
          >
            {status.text}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="checkout-form">
          {/* Customer Name Section */}
          <section className="checkout-section">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatus(null);
                }}
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
                onChange={(e) => {
                  setTable(e.target.value);
                  setStatus(null);
                }}
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
                    <div>
                      <span className="order-item-name">{item.name}</span>
                      {item.selectedAddons?.length > 0 && (
                        <ul className="order-item-addons">
                          {item.selectedAddons.map((a) => (
                            <li key={a.id}>+ {a.name}{a.price > 0 ? ` (+$${Number(a.price).toFixed(2)})` : ""}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <span className="order-item-qty">x{item.quantity}</span>
                  </div>
                  <span className="order-item-price">
                    {priceFormatter.format(
                      ((item.selectedAddons || []).reduce((s, a) => s + Number(a.price), 0) + Number(item.price)) * item.quantity,
                    )}
                  </span>
                </div>
              ))}
            </div>

            {kitchenNote.trim() && (
              <div className="checkout-kitchen-note mb-2">
                <span className="checkout-kitchen-note-label">
                  <i className="fas fa-utensils"></i> Kitchen note
                </span>
                <p className="checkout-kitchen-note-text">
                  {kitchenNote.trim()}
                </p>
              </div>
            )}

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
