import { useState, useMemo, useEffect } from "react";
import "../../App.css";
import Pagination from "../../components/common/Pagination";
import ViewOrderModal from "../../components/ViewOrderModal";
import EditOrderModal from "../../components/EditOrderModal";
import OrderFilters from "../../components/OrderFilters";
import OrdersTable from "../../components/OrdersTable";
import RefreshButton from "../../components/RefreshButton";
import NewOrderNotification from "../../components/NewOrderNotification";
import { useOrderPolling } from "../../hooks/useOrderPolling";
import { useOrderModal } from "../../hooks/useOrderModal";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OperatorDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const ordersPerPage = 10;

  // hook for polling orders
  const {
    orders,
    loading,
    error,
    isRefreshing,
    newOrdersCount,
    fetchOrders,
    handleManualRefresh,
    setModalsOpen,
    setOrders,
  } = useOrderPolling(API_BASE_URL);

  // hook for modal management
  const {
    viewModalOpen,
    editModalOpen,
    selectedOrder,
    orderLoading,
    orderError,
    selectedStatus,
    updateLoading,
    updateError,
    handleView,
    handleEdit,
    handleCloseViewModal,
    handleCloseEditModal,
    setSelectedStatus,
    handleUpdateStatus,
  } = useOrderModal(API_BASE_URL, (orderId, newStatus) => {
    // Update local orders state
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    // Fetch latest data
    fetchOrders(true);
  });

  // Update modals open state for polling
  useEffect(() => {
    setModalsOpen(viewModalOpen || editModalOpen);
  }, [viewModalOpen, editModalOpen, setModalsOpen]);

  // Filtering logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.created_at
        ? String(order.created_at).slice(0, 10)
        : "";

      if (fromDate && orderDate && orderDate < fromDate) {
        return false;
      }

      if (toDate && orderDate && orderDate > toDate) {
        return false;
      }

      if (!searchTerm.trim()) {
        return true;
      }

      const needle = searchTerm.trim().toLowerCase();
      const customerName = (order.customer_name || "").toLowerCase();
      const tableNumber = String(order.table_number || "");
      const orderId = String(order.id);
      const items = (order.items || [])
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
  }, [orders, searchTerm, fromDate, toDate]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  return (
    <div className="checkout-section mt-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="checkout-section-title">Orders</h1>
        <div className="flex items-center gap-3">
          <NewOrderNotification newOrdersCount={newOrdersCount} />
          <RefreshButton
            onClick={handleManualRefresh}
            isRefreshing={isRefreshing}
            disabled={loading}
          />
        </div>
      </div>

      {/* Search and DATE */}
      <OrderFilters
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setCurrentPage(1);
        }}
        fromDate={fromDate}
        onFromDateChange={(value) => {
          setFromDate(value);
          setCurrentPage(1);
        }}
        toDate={toDate}
        onToDateChange={(value) => {
          setToDate(value);
          setCurrentPage(1);
        }}
      />

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
          <OrdersTable
            orders={currentOrders}
            onView={handleView}
            onEdit={handleEdit}
          />

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

      <ViewOrderModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        selectedOrder={selectedOrder}
        loading={orderLoading}
        error={orderError}
      />

      <EditOrderModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        selectedOrder={selectedOrder}
        loading={orderLoading}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        updateLoading={updateLoading}
        updateError={updateError}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
