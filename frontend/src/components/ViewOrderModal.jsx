import Modal from "./common/Modal";
import { formatDate } from "../utils/dateFormatter";
import { useState, useEffect } from "react";

const API_BASE_URL = "/api";

export default function ViewOrderModal({
  isOpen,
  onClose,
  selectedOrder,
  loading,
  error,
  isAdmin = false,
}) {
  const getStatusStyles = (status) => {
    const statusValue = status ? status.toLowerCase().trim() : "";

    if (statusValue === "pending") return "bg-green-50 text-green-700";
    if (statusValue === "completed") return "bg-green-50 text-green-600";
    if (statusValue === "preparing") return "bg-yellow-50 text-yellow-700";
    if (statusValue === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
  };

  // profit data
  const [orderProfit, setOrderProfit] = useState(null);
  const [profitLoading, setProfitLoading] = useState(false);
  const [profitError, setProfitError] = useState("");

  useEffect(() => {
    if (isOpen && selectedOrder?.id) {
      fetchOrderProfit(selectedOrder.id);
    }
  }, [isOpen, selectedOrder?.id]);

  const fetchOrderProfit = async (orderId) => {
    try {
      setProfitLoading(true);
      setProfitError("");

      const res = await fetch(`${API_BASE_URL}/orders/${orderId}/profit`);

      if (!res.ok) {
        throw new Error("Failed to fetch profit data");
      }

      const data = await res.json();
      setOrderProfit(parseFloat(data.profit));
    } catch (err) {
      console.error("Error fetching profit:", err);
      setProfitError(err.message || "Failed to load profit");
      setOrderProfit(null);
    } finally {
      setProfitLoading(false);
    }
  };

  const calculateProfitMargin = (profit, revenue) => {
    if (!profit || !revenue || revenue === 0) return 0;
    return (profit / revenue) * 100;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Order #${selectedOrder?.id}`}
      variant="view"
      loading={loading}
      error={error}
      footerButtons={
        <button
          onClick={onClose}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Close
        </button>
      }
    >
      {selectedOrder && (
        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Customer Name
              </p>
              <p className="text-gray-800">{selectedOrder.customer_name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Table Number
              </p>
              <p className="text-gray-800">{selectedOrder.table_number}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Payment Method
              </p>
              <p className="text-gray-800 capitalize">
                {selectedOrder.payment_method}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Status</p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold capitalize ${getStatusStyles(
                  selectedOrder.status
                )}`}
              >
                {selectedOrder.status || "Not Set"}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Created At
              </p>
              <p className="text-gray-800">
                {formatDate(selectedOrder.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Total Amount
              </p>
              <p className="text-lg font-bold text-green-600">
                ${parseFloat(selectedOrder.total_amount).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Order Items
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                      Item
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-gray-700">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-3 py-3 text-gray-800">{item.name}</td>
                      <td className="px-3 py-3 text-center text-gray-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">
                              ${parseFloat(item.price).toFixed(2)}
                            </span>
                            <span className="mx-2 text-gray-400">×</span>
                            <span className="font-medium text-gray-700">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            $
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-3 text-right font-bold text-gray-800"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                      ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {/* DOAR PENTRU ADMIN*/}
          {/* Profit Section */}
          {isAdmin && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              {profitLoading && (
                <p className="text-gray-500 text-sm">Loading profit data...</p>
              )}

              {profitError && (
                <p className="text-red-600 text-sm">{profitError}</p>
              )}

              {!profitLoading && !profitError && orderProfit !== null && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Order Profit
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ${orderProfit.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">
                      Profit Margin
                    </p>
                    <p className="text-2xl font-bold text-green-400">
                      {calculateProfitMargin(
                        orderProfit,
                        selectedOrder.total_amount
                      ).toFixed(2)}
                      %
                    </p>
                  </div>
                </div>
              )}

              {!profitLoading &&
                !profitError &&
                orderProfit === null &&
                selectedOrder.status === "cancelled" && (
                  <p className="text-gray-500 text-sm">
                    Profit data not available for cancelled orders
                  </p>
                )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
