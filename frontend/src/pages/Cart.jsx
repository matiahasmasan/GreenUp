import React from "react";
import Hero from "../components/Hero";
import QuantityControl from "../components/QuantityControl";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function Cart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
  kitchenNote,
  onSetKitchenNote,
}) {
  const total = cartItems.reduce((sum, item) => {
    const addonTotal = (item.selectedAddons || []).reduce((s, a) => s + Number(a.price), 0);
    return sum + (Number(item.price) + addonTotal) * item.quantity;
  }, 0);

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
          {cartItems.map((item) => {
            const stock = item.stocks != null ? Number(item.stocks) : null;
            const isAtStockLimit =
              stock !== null &&
              Number.isFinite(stock) &&
              item.quantity >= stock;

            return (
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
                    <div>
                      <h3>{item.name}</h3>
                      {item.selectedAddons?.length > 0 && (
                        <ul className="cart-item-addons">
                          {item.selectedAddons.map((a) => (
                            <li key={a.id}>
                              + {a.name}{a.price > 0 ? ` (+$${Number(a.price).toFixed(2)})` : ""}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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
                    <QuantityControl
                      quantity={item.quantity}
                      onDecrease={() =>
                        onUpdateQuantity(item.cartKey, item.quantity - 1)
                      }
                      onIncrease={() =>
                        onUpdateQuantity(item.cartKey, item.quantity + 1)
                      }
                      disableIncrease={isAtStockLimit}
                      maxMessage={
                        isAtStockLimit ? `Max available: ${stock}` : null
                      }
                    />

                    <p className="price">
                      {priceFormatter.format(
                        ((item.selectedAddons || []).reduce((s, a) => s + Number(a.price), 0) + Number(item.price)) * item.quantity,
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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

          <div className="cart-note">
            <label htmlFor="kitchen-note" className="cart-note-label">
              Note for the kitchen
            </label>
            <textarea
              id="kitchen-note"
              className="cart-note-input"
              rows={3}
              placeholder="e.g. No ice in the Cola…"
              value={kitchenNote}
              onChange={(e) => onSetKitchenNote(e.target.value)}
              maxLength={500}
            />
          </div>

          <button
            className="add-to-cart"
            onClick={() => onNavigate && onNavigate("checkout")}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
