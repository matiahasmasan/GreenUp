import Modal from "./common/Modal";

export default function DeleteOrderModal({
  isOpen,
  onClose,
  order,
  deleteLoading,
  deleteError,
  onConfirmDelete,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete Order #${order?.id || ""}`}
      variant="delete"
      loading={false}
      error={deleteError}
      maxWidth="max-w-lg"
      footerButtons={
        <>
          <button
            onClick={onClose}
            disabled={deleteLoading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirmDelete}
            disabled={deleteLoading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteLoading ? "Deleting..." : "Delete Order"}
          </button>
        </>
      }
    >
      <div className="space-y-3 text-gray-700">
        <p className="font-semibold text-red-700">This action cannot be undone.</p>
        <p>
          Are you sure you want to delete order
          <span className="font-semibold"> #{order?.id}</span>?
        </p>
        {order?.customer_name && (
          <p className="text-sm text-gray-600">
            Customer: {order.customer_name} | Table: {order.table_number}
          </p>
        )}
      </div>
    </Modal>
  );
}
