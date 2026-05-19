import { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { authFetch } from "../utils/authUtils";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const API_BASE_URL = "/api";

export default function ViewProductModal({
  isOpen,
  onClose,
  selectedProduct,
  loading,
  error,
  isAdmin = false,
  categories = [],
}) {
  const [addons, setAddons] = useState([]);
  const [addonsLoading, setAddonsLoading] = useState(false);

  useEffect(() => {
    if (!selectedProduct) return;
    setAddons([]);
    setAddonsLoading(true);
    authFetch(`${API_BASE_URL}/menu-items/${selectedProduct.id}/addons`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setAddons(Array.isArray(data) ? data : []))
      .catch(() => setAddons([]))
      .finally(() => setAddonsLoading(false));
  }, [selectedProduct]);
  const getCategoryLabel = (categoryId) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find((opt) => opt.id === categoryId);
    return category ? category.label : "Unknown";
  };

  const getAvailabilityStatus = (isAvailable) => {
    const available = isAvailable === 1 || isAvailable === true;
    return {
      text: available ? "Available" : "Out of Stock",
      className: available
        ? "bg-green-50 text-green-700"
        : "bg-red-50 text-red-600",
    };
  };

  const getStockStatus = (stocks) => {
    const stockCount = Number(stocks) || 0;
    if (stockCount === 0) {
      return {
        text: "Out of Stock",
        className: "bg-red-50 text-red-600",
      };
    } else if (stockCount <= 5) {
      return {
        text: `Low Stock (${stockCount})`,
        className: "bg-yellow-50 text-yellow-700",
      };
    } else {
      return {
        text: `In Stock (${stockCount})`,
        className: "bg-green-50 text-green-700",
      };
    }
  };

  // Add this helper function in ViewProductModal.jsx
  const calculateProfitMargin = (price, costPrice) => {
    const priceNum = Number(price) || 0;
    const costNum = Number(costPrice) || 0;

    if (priceNum === 0) return { profit: 0, margin: 0 };

    const profit = priceNum - costNum;
    const margin = (profit / priceNum) * 100;

    return { profit, margin };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Product: ${selectedProduct?.name || ""}`}
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
      {selectedProduct && (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Product Name
              </p>
              <p className="text-gray-800">{selectedProduct.name}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Category
              </p>
              <p className="text-gray-800">
                {getCategoryLabel(selectedProduct.category_id)}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">Price</p>
              <p className="text-lg font-bold text-green-600">
                {priceFormatter.format(Number(selectedProduct.price))}
              </p>
            </div>
            {isAdmin && (
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Profit per Unit
                </p>
                <p className="text-lg font-bold text-green-400">
                  {priceFormatter.format(
                    calculateProfitMargin(
                      selectedProduct.price,
                      selectedProduct.cost_price,
                    ).profit,
                  )}
                  <span className="text-sm ml-1">
                    (
                    {calculateProfitMargin(
                      selectedProduct.price,
                      selectedProduct.cost_price,
                    ).margin.toFixed(2)}
                    %)
                  </span>
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Stock Status
              </p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  getStockStatus(selectedProduct.stocks).className
                }`}
              >
                {getStockStatus(selectedProduct.stocks).text}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Availability
              </p>
              <span
                className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                  getAvailabilityStatus(selectedProduct.is_available).className
                }`}
              >
                {getAvailabilityStatus(selectedProduct.is_available).text}
              </span>
            </div>
          </div>

          {/* Product Image */}
          {selectedProduct.image_url && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Product Image
              </p>
              <div className="flex justify-center">
                <img
                  src={selectedProduct.image_url}
                  alt={selectedProduct.name}
                  className="w-48 h-48 object-cover rounded-lg border border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Product Description */}
          {selectedProduct.description && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                Description
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{selectedProduct.description}</p>
              </div>
            </div>
          )}

          {/* Add-ons */}
          <div>
            <p className="text-sm font-semibold text-gray-600 mb-2">
              Add-ons{addons.length > 0 && ` (${addons.length})`}
            </p>
            {addonsLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : addons.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                No add-ons configured for this product.
              </p>
            ) : (
              <div className="space-y-2">
                {addons.map((addon) => {
                  const isAvail = Number(addon.is_available) === 1;
                  return (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="text-gray-800 text-sm">{addon.name}</span>
                      <div className="flex items-center gap-2">
                        {Number(addon.price) > 0 && (
                          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                            +{priceFormatter.format(Number(addon.price))}
                          </span>
                        )}
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded ${
                            isAvail
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {isAvail ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
