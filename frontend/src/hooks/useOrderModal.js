import { useState } from "react";
import { authFetch } from "../utils/authUtils";

export function useOrderModal(apiBaseUrl, onOrderUpdate) {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState("");

  const handleView = async (orderId) => {
    try {
      setOrderLoading(true);
      setOrderError("");
      const res = await authFetch(`${apiBaseUrl}/orders/${orderId}`);

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
      const res = await authFetch(`${apiBaseUrl}/orders/${orderId}`);

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order details");
      }

      const data = await res.json();
      setSelectedOrder(data);
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
    setUpdateError("");
  };

  const handleUpdateOrder = async (updatedFields) => {
    if (!selectedOrder?.id) return;

    try {
      setUpdateLoading(true);
      setUpdateError("");

      const res = await authFetch(`${apiBaseUrl}/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update order");
      }

      const data = await res.json();

      // Notify parent component to update orders list
      if (onOrderUpdate) {
        onOrderUpdate(selectedOrder.id, {
          ...updatedFields,
          total_amount: data.total_amount,
        });
      }

      handleCloseEditModal();
    } catch (err) {
      setUpdateError(err.message || "Failed to update order");
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
    updateLoading,
    updateError,
    handleView,
    handleEdit,
    handleCloseViewModal,
    handleCloseEditModal,
    handleUpdateOrder,
  };
}
