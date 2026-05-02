import Modal from "./common/Modal";
import { useState, useEffect } from "react";

export default function EditOrderModal({
  isOpen,
  onClose,
  selectedOrder,
  loading,
  updateLoading,
  updateError,
  onUpdateOrder, // changed: now receives full order update handler
}) {
  const [customerName, setCustomerName] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemQty, setNewItemQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  // Sync form state when order changes
  useEffect(() => {
    if (selectedOrder) {
      setCustomerName(selectedOrder.customer_name || "");
      setTableNumber(selectedOrder.table_number || "");
      setPaymentMethod(selectedOrder.payment_method || "cash");
      setStatus(selectedOrder.status || "pending");
      setItems((selectedOrder.items || []).map((item) => ({ ...item })));
    }
  }, [selectedOrder]);

  const getStatusStyles = (s) => {
    const v = s ? s.toLowerCase().trim() : "";
    if (v === "pending") return "bg-green-50 text-green-700";
    if (v === "completed") return "bg-green-50 text-green-600";
    if (v === "preparing") return "bg-yellow-50 text-yellow-700";
    if (v === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.price || 0) * (item.quantity || 1),
    0,
  );

  const handleQuantityChange = (index, delta) => {
    setItems((prev) =>
      prev
        .map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + delta } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (!newItemName.trim() || !newItemPrice || parseFloat(newItemPrice) <= 0)
      return;
    setItems((prev) => [
      ...prev,
      {
        name: newItemName.trim(),
        price: parseFloat(newItemPrice),
        quantity: newItemQty,
      },
    ]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemQty(1);
    setAddingItem(false);
  };

  const hasChanges = () => {
    if (!selectedOrder) return false;
    if (customerName !== selectedOrder.customer_name) return true;
    if (String(tableNumber) !== String(selectedOrder.table_number)) return true;
    if (paymentMethod !== selectedOrder.payment_method) return true;
    if (status !== selectedOrder.status) return true;
    if (items.length !== (selectedOrder.items || []).length) return true;
    return items.some((item, i) => {
      const orig = (selectedOrder.items || [])[i];
      return (
        !orig ||
        item.name !== orig.name ||
        item.quantity !== orig.quantity ||
        parseFloat(item.price) !== parseFloat(orig.price)
      );
    });
  };

  const handleSubmit = () => {
    onUpdateOrder({
      customer_name: customerName,
      table_number: tableNumber,
      payment_method: paymentMethod,
      status,
      items,
      total_amount: totalAmount,
    });
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
            onClick={handleSubmit}
            disabled={updateLoading || !hasChanges() || items.length === 0}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateLoading ? "Saving..." : "Save Changes"}
          </button>
        </>
      }
    >
      {selectedOrder && (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                disabled={updateLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Table Number
              </label>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                disabled={updateLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                disabled={updateLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={updateLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
              >
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Order Items
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                      Item
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="px-3 py-3 text-right text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-3 py-3 text-gray-800">{item.name}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(index, -1)}
                            disabled={updateLoading}
                            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center disabled:opacity-50"
                          >
                            −
                          </button>
                          <span className="w-5 text-center font-medium text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(index, 1)}
                            disabled={updateLoading}
                            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">
                              ${parseFloat(item.price).toFixed(2)}
                            </span>
                            <span className="mx-2 text-gray-400">×</span>
                            <span className="font-medium text-gray-700">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="text-base font-semibold text-gray-900">
                            $
                            {(parseFloat(item.price) * item.quantity).toFixed(
                              2,
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => handleRemoveItem(index)}
                          disabled={updateLoading}
                          className="text-red-500 hover:text-red-700 font-bold text-lg leading-none disabled:opacity-50"
                          title="Remove item"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Add new item row */}
                  {addingItem && (
                    <tr className="border-b border-gray-200 bg-green-50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Item name"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              setNewItemQty((q) => Math.max(1, q - 1))
                            }
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-sm"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-sm font-medium">
                            {newItemQty}
                          </span>
                          <button
                            onClick={() => setNewItemQty((q) => q + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold flex items-center justify-center text-sm"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          placeholder="Price"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={handleAddItem}
                            disabled={
                              !newItemName.trim() ||
                              !newItemPrice ||
                              parseFloat(newItemPrice) <= 0
                            }
                            className="text-green-600 hover:text-green-800 font-bold text-lg disabled:opacity-40"
                            title="Confirm add"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => {
                              setAddingItem(false);
                              setNewItemName("");
                              setNewItemPrice("");
                              setNewItemQty(1);
                            }}
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                            title="Cancel"
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan="2"
                      className="px-4 py-3 text-right font-bold text-gray-800"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                      ${totalAmount.toFixed(2)}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Add item button */}
            {!addingItem && (
              <button
                onClick={() => setAddingItem(true)}
                disabled={updateLoading}
                className="mt-3 flex items-center gap-2 text-sm text-green-600 hover:text-green-800 font-semibold disabled:opacity-50 transition"
              >
                <span className="text-lg leading-none">+</span> Add Item
              </button>
            )}

            {items.length === 0 && (
              <p className="mt-2 text-sm text-red-500">
                An order must have at least one item.
              </p>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
