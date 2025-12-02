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
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 text-lg">
              Your cart is currently empty.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page page">
      <Hero />
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        <div className="space-y-4 mb-6">
          {cartItems.map((item) => (
            <div
              key={item.cartKey}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex gap-4"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-3">
                  {item.description}
                </p>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => onRemoveItem(item.cartKey)}
                  className="text-red-500 hover:text-red-700"
                  aria-label="Remove item"
                >
                  <i className="fas fa-times"></i>
                </button>

                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.cartKey, item.quantity - 1)
                    }
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      onUpdateQuantity(item.cartKey, item.quantity + 1)
                    }
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 rounded"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <p className="font-semibold text-lg">
                  {priceFormatter.format(Number(item.price) * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-xl font-bold">
              <span>Total</span>
              <span>{priceFormatter.format(total)}</span>
            </div>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
