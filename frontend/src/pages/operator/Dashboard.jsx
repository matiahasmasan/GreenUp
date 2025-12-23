import { useState, useEffect } from "react";
import "../../App.css";
import { formatDate } from "../../utils/dateFormatter";
import Pagination from "../../components/common/Pagination";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OperatorDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const ordersPerPage = 10;

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
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // PAGIONATION LOGIC
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  return (
    <div className="checkout-section mt-2">
      <h1 className="checkout-section-title">Operator Dashboard</h1>
      {/* Filters */}
      <div className="mt-4 space-y-3">
        <div>
          {/* Searchbar */}
          <input
            type="text"
            placeholder="Search order..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Set date</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Set category</option>
            <option value="available">Dessert</option>
            <option value="unavailable">Drinks</option>
          </select>
        </div>
      </div>
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
                    Status
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">
                    Total
                  </th>
                  <th className="px-3 py-3 text-right font-semibold text-gray-700">
                    Sent
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => {
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
                        <p>{order.customer_name} </p>
                        <p className="">Table: {order.table_number}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-700">
                        {order.items
                          .map((item) => `${item.name} (${item.quantity})`)
                          .join(", ")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-gray-800">
                        {order.payment_method} $
                        {parseFloat(order.total_amount).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 text-right text-gray-800">
                        {formatDate(order.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* PAGIONATION */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={orders.length}
            itemsPerPage={ordersPerPage}
            itemName={orders.length === 1 ? "order" : "orders"}
          />
        </div>
      )}
    </div>
  );
}
