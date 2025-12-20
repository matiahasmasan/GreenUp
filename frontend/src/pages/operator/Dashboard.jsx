import { useState, useEffect } from "react";
import "../../App.css";

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
      //console.log("Orders:", data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-section mt-2">
      <h1 className="checkout-section-title">Operator Dashboard</h1>
      {loading && <p className="text-gray-500">Loading orders...</p>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <p className="text-gray-600">No orders yet.</p>
      )}

      {!loading && orders.length > 0 && (
        <div className="mt-6">
          <p className="text-gray-600 mb-4">
            {orders.length} order{orders.length !== 1 ? "s" : ""} loaded
          </p>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Items
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Table
                  </th>
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Payment
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const statusStyles =
                    order.status === "pending"
                      ? "bg-green-50 text-green-700"
                      : order.status === "completed"
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600";

                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-3 font-semibold text-gray-800">
                        #{order.id}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {order.customer_name}
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {order.items
                          .map((item) => `${item.name} (${item.quantity})`)
                          .join(", ")}
                      </td>
                      <td className="px-3 py-3 text-center text-gray-700">
                        {order.table_number}
                      </td>
                      <td className="px-3 py-3 text-gray-700 capitalize">
                        {order.payment_method}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-800">
                        ${parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles}`}
                        >
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
