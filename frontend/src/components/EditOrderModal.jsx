import Modal from "./common/Modal";

export default function EditOrderModal({
  isOpen,
  onClose,
  selectedOrder,
  loading,
  selectedStatus,
  onStatusChange,
  updateLoading,
  updateError,
  onUpdateStatus,
}) {
  const getStatusStyles = (status) => {
    const statusValue = status ? status.toLowerCase().trim() : "";

    if (statusValue === "pending") return "bg-green-50 text-green-700";
    if (statusValue === "completed") return "bg-green-50 text-green-600";
    if (statusValue === "preparing") return "bg-yellow-50 text-yellow-700";
    if (statusValue === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Order #${selectedOrder?.id}`}
      variant="edit"
      loading={loading}
      error={updateError}
      footerButtons={
        <>
          <button
            onClick={onClose}
            disabled={updateLoading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onUpdateStatus}
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
              className={`inline-block px-3 py-1 rounded text-sm font-semibold capitalize ${getStatusStyles(
                selectedOrder.status
              )}`}
            >
              {selectedOrder.status || "Not Set"}
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
              onChange={(e) => onStatusChange(e.target.value)}
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
  );
}
