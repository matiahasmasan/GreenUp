import { useState, useEffect } from "react";
import Modal from "./common/Modal";
import { authFetch } from "../utils/authUtils";

const API_BASE_URL = "/api";

export default function EditProductModal({
  isOpen,
  onClose,
  selectedProduct,
  loading,
  error,
  onSave,
  categories = [],
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

  // Add-ons state
  const [addons, setAddons] = useState([]);
  const [addonsLoading, setAddonsLoading] = useState(false);
  const [addonsError, setAddonsError] = useState(null);
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");
  const [addingAddon, setAddingAddon] = useState(false);

  const fetchAddons = async (productId) => {
    setAddonsLoading(true);
    setAddonsError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/menu-items/${productId}/addons`);
      if (!res.ok) throw new Error("Failed to load add-ons");
      const data = await res.json();
      setAddons(data);
    } catch (err) {
      setAddonsError(err.message);
    } finally {
      setAddonsLoading(false);
    }
  };

  const handleCreateAddon = async () => {
    if (!newAddonName.trim()) return;
    const price = newAddonPrice === "" ? 0 : Number(newAddonPrice);
    if (isNaN(price) || price < 0) return;
    setAddingAddon(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/menu-items/${selectedProduct.id}/addons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newAddonName.trim(), price }),
      });
      if (!res.ok) throw new Error("Failed to create add-on");
      const created = await res.json();
      setAddons((prev) => [...prev, { id: created.id, name: newAddonName.trim(), price, is_available: 1 }]);
      setNewAddonName("");
      setNewAddonPrice("");
    } catch (err) {
      setAddonsError(err.message);
    } finally {
      setAddingAddon(false);
    }
  };

  const handleToggleAddon = async (addon) => {
    const newVal = addon.is_available === 1 || addon.is_available === true ? 0 : 1;
    try {
      const res = await authFetch(`${API_BASE_URL}/product-addons/${addon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_available: newVal }),
      });
      if (!res.ok) throw new Error("Failed to update add-on");
      setAddons((prev) => prev.map((a) => a.id === addon.id ? { ...a, is_available: newVal } : a));
    } catch (err) {
      setAddonsError(err.message);
    }
  };

  const handleDeleteAddon = async (addonId) => {
    try {
      const res = await authFetch(`${API_BASE_URL}/product-addons/${addonId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete add-on");
      setAddons((prev) => prev.filter((a) => a.id !== addonId));
    } catch (err) {
      setAddonsError(err.message);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        name: selectedProduct.name ?? "",
        description: selectedProduct.description ?? "",
        price: selectedProduct.price ?? "",
        cost_price: selectedProduct.cost_price ?? "",
        image_url: selectedProduct.image_url ?? "",
        category_id: selectedProduct.category_id ?? "",
        is_available:
          selectedProduct.is_available === 1 ||
          selectedProduct.is_available === true,
        stocks: selectedProduct.stocks ?? "",
      });
      setFormErrors({});
      setAddons([]);
      setAddonsError(null);
      setNewAddonName("");
      setNewAddonPrice("");
      fetchAddons(selectedProduct.id);
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      // Auto-disable availability when stock reaches 0
      if (name === "stocks" && Number(value) === 0) {
        // updated.is_available = false;
        // console.log("stock is 0");
        // am dezactivat provizoriu feature-ul
      }
      return updated;
    });
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.description.trim())
      errors.description = "Product description is required";

    if (
      !formData.price ||
      isNaN(formData.price) ||
      Number(formData.price) <= 0
    ) {
      errors.price = "Please enter a valid price greater than 0";
    }

    if (
      formData.cost_price !== "" &&
      (isNaN(formData.cost_price) || Number(formData.cost_price) < 0)
    ) {
      errors.cost_price = "Please enter a valid cost price (0 or greater)";
    }

    if (
      formData.cost_price !== "" &&
      Number(formData.cost_price) > Number(formData.price)
    ) {
      errors.cost_price = "Cost price cannot be greater than selling price";
    }

    if (!formData.category_id) errors.category_id = "Please select a category";

    if (
      formData.stocks === "" ||
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

  const calculateProfitMargin = () => {
    const price = Number(formData.price);
    const cost = Number(formData.cost_price);
    if (price > 0 && cost >= 0 && formData.cost_price !== "") {
      const profit = price - cost;
      const margin = ((profit / price) * 100).toFixed(2);
      return { profit: profit.toFixed(2), margin };
    }
    return null;
  };

  const profitInfo = calculateProfitMargin();

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
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save Changes"}
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
            {categories.map((category) => (
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

        {/* Price and Cost Price */}
        <div className="grid grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Cost Price
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
        {profitInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Profit per unit:
                </p>
                <p className="text-lg font-bold text-green-600">
                  ${profitInfo.profit}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700">
                  Profit Margin:
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {profitInfo.margin}%
                </p>
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
        <div className="pt-2">
          <div className="flex items-center gap-4">
            <span
              className={`text-sm font-bold ${!formData.is_available ? "text-red-600" : "text-gray-400"}`}
            >
              Out of Stock
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="is_available"
                className="sr-only peer"
                checked={formData.is_available}
                onChange={handleChange}
                disabled={loading}
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
            </label>
            <span
              className={`text-sm font-bold ${formData.is_available ? "text-green-600" : "text-gray-400"}`}
            >
              Available
            </span>
          </div>
          {Number(formData.stocks) === 0 && (
            <p className="text-xs text-amber-600 mt-1">
              Auto-disabled: stock is 0. You can still enable it manually.
            </p>
          )}
        </div>

        {/* Add-ons Section */}
        <div className="pt-2 border-t border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Add-ons
            <span className="text-xs font-normal text-gray-400 ml-1">(changes apply immediately)</span>
          </p>

          {addonsError && (
            <p className="text-red-500 text-sm mb-2">{addonsError}</p>
          )}

          {addonsLoading ? (
            <p className="text-sm text-gray-400">Loading add-ons…</p>
          ) : (
            <div className="space-y-2 mb-3">
              {addons.length === 0 && (
                <p className="text-sm text-gray-400 italic">No add-ons yet.</p>
              )}
              {addons.map((addon) => {
                const isAvail = addon.is_available === 1 || addon.is_available === true;
                return (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm text-gray-800 truncate">{addon.name}</span>
                      {Number(addon.price) > 0 && (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
                          +${Number(addon.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <button
                        type="button"
                        title={isAvail ? "Disable" : "Enable"}
                        onClick={() => handleToggleAddon(addon)}
                        className={`text-xs font-semibold px-2 py-0.5 rounded border transition ${
                          isAvail
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        {isAvail ? "On" : "Off"}
                      </button>
                      <button
                        type="button"
                        title="Delete add-on"
                        onClick={() => handleDeleteAddon(addon.id)}
                        className="text-red-400 hover:text-red-600 transition p-1"
                      >
                        <i className="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* New add-on row */}
          <div className="flex gap-2 items-start">
            <input
              type="text"
              placeholder="Add-on name"
              value={newAddonName}
              onChange={(e) => setNewAddonName(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateAddon(); } }}
            />
            <input
              type="number"
              placeholder="Price"
              value={newAddonPrice}
              onChange={(e) => setNewAddonPrice(e.target.value)}
              min="0"
              step="0.01"
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={handleCreateAddon}
              disabled={addingAddon || !newAddonName.trim()}
              className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {addingAddon ? "…" : <><i className="fas fa-plus mr-1"></i>Add</>}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
