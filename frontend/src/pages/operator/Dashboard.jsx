import { useState, useEffect } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OperatorDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/orders`);

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-container" style={{ paddingTop: 24 }}>
      <div
        className="checkout-section"
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <h2 className="checkout-section-title">Operator Dashboard</h2>

        <p style={{ marginTop: 12, marginBottom: 12 }}>
          Manage orders and kitchen operations here.
        </p>

        {loading && <p>Loading orders...</p>}
        {error && <div className="status error">{error}</div>}

        {!loading && orders.length === 0 && (
          <p className="status">No orders yet.</p>
        )}

        {!loading && orders.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <h3>Active Orders ({orders.length})</h3>
            {/* Order list UI will be added here */}
            <p>Order management UI coming soon...</p>
          </div>
        )}

        <button
          className="checkout-back"
          onClick={() => onNavigate?.("home")}
          style={{ marginTop: 24 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
