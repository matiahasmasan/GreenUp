import { useState, useEffect, useMemo } from "react";
import "../../App.css";
import { formatDate } from "../../utils/dateFormatter";
import Pagination from "../../components/common/Pagination";
import SearchBar from "../../components/SearchBar";
import Modal from "../../components/common/Modal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OperatorDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");
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
      // Default status
      const normalizedData = data.map((order) => ({
        ...order,
        status: order.status || "pending",
      }));
      setOrders(normalizedData);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load orders");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Action handlers
  const handleView = async (orderId) => {
    try {
      setOrderLoading(true);
      setOrderError("");
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await res.json();
      // Default status
      if (!data.status) {
        data.status = "pending";
      }
      setSelectedOrder(data);
      setViewModalOpen(true);
    } catch (err) {
      setOrderError(err.message || "Failed to load order details");
      console.error("Error:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleCloseModal = () => {
    setViewModalOpen(false);
    setSelectedOrder(null);
    setOrderError("");
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
    setSelectedStatus("");
    setUpdateError("");
  };

  const handleEdit = async (orderId) => {
    try {
      setOrderLoading(true);
      setUpdateError("");
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await res.json();
      setSelectedOrder(data);
      setSelectedStatus(data.status);
      setEditModalOpen(true);
    } catch (err) {
      setUpdateError(err.message || "Failed to load order details");
      console.error("Error:", err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !selectedStatus) {
      setUpdateError("Please select a status");
      return;
    }

    if (selectedStatus === selectedOrder.status) {
      setUpdateError("Status is already set to this value");
      return;
    }

    try {
      setUpdateLoading(true);
      setUpdateError("");
      const res = await fetch(
        `${API_BASE_URL}/orders/${selectedOrder.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: selectedStatus }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update order status");
      }

      // Update the order in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === selectedOrder.id
            ? { ...order, status: selectedStatus }
            : order
        )
      );

      // Update selected order
      setSelectedOrder({ ...selectedOrder, status: selectedStatus });

      // Close modal after successful update
      handleCloseEditModal();

      // Optionally refresh orders list
      // fetchOrders();
    } catch (err) {
      setUpdateError(err.message || "Failed to update order status");
      console.error("Error:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  // SEARCH LOGIC
  // BY CUSTOMER NAME, TABLE NUMBER, ORDER ID, ITEM NAMES
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) {
      return orders;
    }

    const needle = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const customerName = (order.customer_name || "").toLowerCase();
      const tableNumber = String(order.table_number || "");
      const orderId = String(order.id);
      const items = order.items
        .map((item) => item.name)
        .join(" ")
        .toLowerCase();

      return (
        customerName.includes(needle) ||
        tableNumber.includes(needle) ||
        orderId.includes(needle) ||
        items.includes(needle)
      );
    });
  }, [orders, searchTerm]);

  // PAGIONATION LOGIC
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  return (
    <div className="checkout-section mt-2">
      <h1 className="checkout-section-title">Operator Dashboard</h1>
      {/* Filters */}
      <div className="mt-4 space-y-3">
        <div>
          {/* Searchbar */}
          <SearchBar
            variant="simple"
            placeholder="Search order..."
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value);
              setCurrentPage(1);
            }}
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

      {!loading && filteredOrders.length === 0 && (
        <p className="text-gray-600">No orders yet.</p>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse text-sm bg-white">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-3 py-3 text-left font-semibold text-gray-700">
                    Customer
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-3 py-3 text-center font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => {
                  const statusValue = order.status
                    ? order.status.toLowerCase().trim()
                    : "";
                  const statusStyles =
                    statusValue === "pending"
                      ? "bg-green-50 text-green-700"
                      : statusValue === "completed"
                      ? "bg-green-50 text-green-600"
                      : statusValue === "preparing"
                      ? "bg-yellow-50 text-yellow-700"
                      : statusValue === "cancelled"
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-50 text-gray-600";

                  return (
                    <tr
                      key={order.id}
                      className={`border-b border-gray-200 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <td className="px-3 py-3 text-gray-700">
                        <p>
                          {order.customer_name}{" "}
                          <span className="text-gray-500">#{order.id}</span>
                        </p>
                        <p className="text-gray-500">
                          Table: {order.table_number}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-center gap-2">
                          {/* VIEW BUTTON */}
                          <button
                            onClick={() => handleView(order.id)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-blue-600 transition"
                            title="View order"
                          >
                            <i className="fas fa-eye "></i>
                          </button>
                          {/* EDIT BUTTON */}
                          <button
                            onClick={() => handleEdit(order.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-yellow-600 transition"
                            title="Edit order"
                          >
                            <i className="fas fa-edit "></i>
                          </button>
                        </div>
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
            totalItems={filteredOrders.length}
            itemsPerPage={ordersPerPage}
            itemName={filteredOrders.length === 1 ? "order" : "orders"}
          />
        </div>
      )}

      {/* Edit Order Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        title={`Edit Order #${selectedOrder?.id}`}
        variant="edit"
        loading={orderLoading}
        error={updateError}
        footerButtons={
          <>
            <button
              onClick={handleCloseEditModal}
              disabled={updateLoading}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateStatus}
              disabled={
                updateLoading ||
                !selectedStatus ||
                selectedStatus === selectedOrder?.status
              }
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </>
        }
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Current Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold capitalize ${
                  !selectedOrder.status
                    ? "bg-gray-50 text-gray-600"
                    : selectedOrder.status.toLowerCase() === "pending"
                    ? "bg-green-50 text-green-700"
                    : selectedOrder.status.toLowerCase() === "completed"
                    ? "bg-green-50 text-green-600"
                    : selectedOrder.status.toLowerCase() === "preparing"
                    ? "bg-yellow-50 text-yellow-700"
                    : selectedOrder.status.toLowerCase() === "cancelled"
                    ? "bg-red-50 text-red-600"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {selectedOrder.status ? selectedOrder.status : "Not Set"}
              </span>
            </div>

            <div>
              <label
                htmlFor="status-select"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Change Status To
              </label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={updateLoading}
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Order Details:</strong>
              </p>
              <p className="text-sm text-gray-700">
                Customer: {selectedOrder.customer_name}
              </p>
              <p className="text-sm text-gray-700">
                Table: {selectedOrder.table_number}
              </p>
              <p className="text-sm text-gray-700">
                Total: ${parseFloat(selectedOrder.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* View Order Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={handleCloseModal}
        title={`Order #${selectedOrder?.id}`}
        variant="view"
        loading={orderLoading}
        error={orderError}
        footerButtons={
          <button
            onClick={handleCloseModal}
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
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Status
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded text-sm font-semibold capitalize ${
                    !selectedOrder.status || selectedOrder.status === null
                      ? "bg-gray-50 text-gray-600"
                      : selectedOrder.status.toLowerCase() === "pending"
                      ? "bg-green-50 text-green-700"
                      : selectedOrder.status.toLowerCase() === "completed"
                      ? "bg-green-50 text-green-600"
                      : selectedOrder.status.toLowerCase() === "preparing"
                      ? "bg-yellow-50 text-yellow-700"
                      : selectedOrder.status.toLowerCase() === "cancelled"
                      ? "bg-red-50 text-red-600"
                      : "bg-gray-50 text-gray-600"
                  }`}
                >
                  {selectedOrder.status ? selectedOrder.status : "Not Set"}
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
          </div>
        )}
      </Modal>
    </div>
  );
}
