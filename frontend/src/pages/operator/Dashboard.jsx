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
      const res = await fetch(`${API_BASE_URL}/history`);

      if (!res.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await res.json();
      setOrders(data);
      console.log("Orders:", data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ paddingTop: 24, paddingBottom: 80 }}>
      <div style={{ maxWidth: "100%", margin: "0 auto", padding: "0 16px" }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, fontSize: "24px" }}>
          Operator Dashboard
        </h1>
        {loading && <p style={{ color: "#999" }}>Loading orders...</p>}
        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "4px",
            }}
          >
            {error}
          </div>
        )}

        {!loading && (
          <p style={{ color: "#666" }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""} loaded
          </p>
        )}
      </div>
    </div>
  );
}
