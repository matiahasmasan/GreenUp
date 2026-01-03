import Modal from "./common/Modal";

export default function EditProductModal({
  isOpen,
  onClose,
  selectedProduct,
  loading,
  error,
  tempAvailability,
  onAvailabilityChange,
  onSave,
}) {
  const hasChanges =
    selectedProduct &&
    tempAvailability !== (selectedProduct.is_available === 1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit: ${selectedProduct?.name}`}
      variant="edit"
      loading={loading}
      error={error}
      footerButtons={
        <>
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading || !hasChanges}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      {selectedProduct && (
        <div className="space-y-6 flex flex-col items-center py-4">
          <p className="text-gray-600 text-center">
            Adjust the availability for <strong>{selectedProduct.name}</strong>.
          </p>

          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-bold ${
                !tempAvailability ? "text-red-600" : "text-gray-400"
              }`}
            >
              Out of Stock
            </span>

            {/* Toggle Component */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={tempAvailability}
                onChange={(e) => onAvailabilityChange(e.target.checked)}
                disabled={loading}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>

            <span
              className={`text-sm font-bold ${
                tempAvailability ? "text-green-600" : "text-gray-400"
              }`}
            >
              Available
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
