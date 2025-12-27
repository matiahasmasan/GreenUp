function Modal({
  isOpen,
  onClose,
  title,
  variant = "view", // "view", "edit", or "delete"
  children,
  loading = false,
  error = "",
  footerButtons,
  maxWidth = "max-w-2xl",
  headerColor = "bg-green-500",
  showCloseButton = true,
  closeOnBackdropClick = true,
}) {
  if (!isOpen) return null;

  // Default footer buttons based on variant
  const getDefaultFooterButtons = () => {
    switch (variant) {
      case "delete":
        return (
          <>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
            >
              Delete
            </button>
          </>
        );
      case "edit":
        return (
          <>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
            >
              Save
            </button>
          </>
        );
      default: // "view"
        return (
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold"
          >
            Close
          </button>
        );
    }
  };

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  // Header color based on variant if not explicitly provided
  const getHeaderColor = () => {
    if (headerColor) return headerColor;
    switch (variant) {
      case "delete":
        return "bg-red-500";
      case "edit":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div
      className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className={`sticky top-0 ${getHeaderColor()} text-white px-6 py-4 rounded-t-lg flex justify-between items-center`}
        >
          <h2 className="text-xl font-bold">{title || "Modal"}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition text-2xl font-bold"
              title="Close"
            >
              &times;
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {loading && (
            <p className="text-gray-500 text-center py-4">
              Loading...
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {!loading && children}
        </div>

        {/* Modal Footer */}
        {footerButtons !== null && (
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
            {footerButtons !== undefined
              ? footerButtons
              : getDefaultFooterButtons()}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;

