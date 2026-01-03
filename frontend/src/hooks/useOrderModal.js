import { useState } from "react";

export function useOrderModal(apiBaseUrl, onOrderUpdate) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const handleView = async (orderId) => {
    try {
      setOrderLoading(true);
      setOrderError("");
      const res = await fetch(`${apiBaseUrl}/orders/${orderId}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await res.json();
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

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedOrder(null);
    setOrderError("");
  };

  const handleEdit = async (orderId) => {
    try {
      setOrderLoading(true);
      setUpdateError("");
      const res = await fetch(`${apiBaseUrl}/orders/${orderId}`);

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

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedOrder(null);
    setSelectedStatus("");
    setUpdateError("");
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
        `${apiBaseUrl}/orders/${selectedOrder.id}/status`,
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

      // Notify parent component to update orders
      if (onOrderUpdate) {
        onOrderUpdate(selectedOrder.id, selectedStatus);
      }

      setSelectedOrder({ ...selectedOrder, status: selectedStatus });
      handleCloseEditModal();
    } catch (err) {
      setUpdateError(err.message || "Failed to update order status");
      console.error("Error:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return {
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
  };
}
