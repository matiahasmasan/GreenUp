import { useState } from "react";
import Modal from "./common/Modal";
import { CATEGORY_OPTIONS } from "./CategoryTabs";

export default function CreateProductModal({
  isOpen,
  onClose,
  onSave,
  loading,
  error,
}) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost_price: "",
    image_url: "",
    category_id: "",
    is_available: true,
    stocks: "",
  });

  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Product name is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Product description is required";
    }

    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      errors.price = "Please enter a valid price greater than 0";
    }

    if (
      !formData.cost_price ||
      isNaN(formData.cost_price) ||
      Number(formData.cost_price) < 0
    ) {
      errors.cost_price = "Please enter a valid cost price (0 or greater)";
    }

    if (Number(formData.cost_price) > Number(formData.price)) {
      errors.cost_price = "Cost price cannot be greater than selling price";
    }

    if (!formData.category_id) {
      errors.category_id = "Please select a category";
    }

    if (
      !formData.stocks ||
      isNaN(formData.stocks) ||
      Number(formData.stocks) < 0
    ) {
      errors.stocks = "Please enter a valid stock quantity (0 or greater)";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      cost_price: "",
      image_url: "",
      category_id: "",
      is_available: true,
      stocks: "",
    });
    setFormErrors({});
    onClose();
  };

  // Calculate profit margin
  const calculateProfitMargin = () => {
    const price = Number(formData.price);
    const cost = Number(formData.cost_price);
    if (price > 0 && cost >= 0) {
      const profit = price - cost;
      const margin = ((profit / price) * 100).toFixed(2);
      return { profit: profit.toFixed(2), margin };
    }
    return { profit: "0.00", margin: "0.00" };
  };

  const { profit, margin } = calculateProfitMargin();

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Product"
      variant="create"
      loading={loading}
      error={error}
      footerButtons={
        <>
          <button
            onClick={handleClose}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Product"}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product name"
            disabled={loading}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.category_id ? "border-red-500" : "border-gray-300"
            }`}
            disabled={loading}
          >
            <option value="">Select a category</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
          {formErrors.category_id && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.category_id}
            </p>
          )}
        </div>

        {/* Price and Cost Price in a row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Selling Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Selling Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {formErrors.price && (
              <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
            )}
          </div>

          {/* Cost Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cost Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="cost_price"
              value={formData.cost_price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                formErrors.cost_price ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {formErrors.cost_price && (
              <p className="text-red-500 text-sm mt-1">
                {formErrors.cost_price}
              </p>
            )}
          </div>
        </div>

        {/* Profit Margin Display */}
        {formData.price && formData.cost_price && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Profit per unit:
                </p>
                <p className="text-lg font-bold text-green-600">${profit}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  Profit Margin:
                </p>
                <p className="text-lg font-bold text-blue-600">{margin}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Stock Quantity */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Stock Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="stocks"
            value={formData.stocks}
            onChange={handleChange}
            min="0"
            step="1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.stocks ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="0"
            disabled={loading}
          />
          {formErrors.stocks && (
            <p className="text-red-500 text-sm mt-1">{formErrors.stocks}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              formErrors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter product description"
            disabled={loading}
          />
          {formErrors.description && (
            <p className="text-red-500 text-sm mt-1">
              {formErrors.description}
            </p>
          )}
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="text"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="https://example.com/image.jpg (optional)"
            disabled={loading}
          />
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={handleChange}
              className="w-5 h-5 border-gray-300 rounded focus:ring-2 focus:ring-green-500 accent-green-500 cursor-pointer"
              disabled={loading}
            />
            <span className="ml-2 text-sm font-semibold text-gray-700">
              Available for order
            </span>
          </label>
        </div>
      </div>
    </Modal>
  );
}
