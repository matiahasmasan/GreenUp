import { useState, useEffect } from "react";
import "../../App.css";
import { formatDate } from "../../utils/dateFormatter";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OperatorDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
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

  // Calculate pagination values
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              {orders.length} total order{orders.length !== 1 ? "s" : ""} |
              Showing {indexOfFirstOrder + 1}-
              {Math.min(indexOfLastOrder, orders.length)}
            </p>
            <p className="text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
          </div>

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

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                  const showEllipsis =
                    (pageNum === currentPage - 2 && currentPage > 3) ||
                    (pageNum === currentPage + 2 &&
                      currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={pageNum} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-3 py-2 rounded font-medium ${
                        currentPage === pageNum
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                }
              )}
            </div>

            <button
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded font-medium ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
