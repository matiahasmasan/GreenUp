export default function OrdersTable({ orders, onView, onEdit }) {
  const getStatusStyles = (status) => {
    const statusValue = status ? status.toLowerCase().trim() : "";

    if (statusValue === "pending") return "bg-green-50 text-green-700";
    if (statusValue === "completed") return "bg-green-50 text-green-600";
    if (statusValue === "preparing") return "bg-yellow-50 text-yellow-700";
    if (statusValue === "cancelled") return "bg-red-50 text-red-600";
    return "bg-gray-50 text-gray-600";
  };

  const isRecentlyCreated = (order) => {
    if (!order.created_at) return false;
    const orderTime = new Date(order.created_at).getTime();
    const currentTime = new Date().getTime();
    return currentTime - orderTime < 60000; // 60 seconds
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full border-collapse text-sm bg-white">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-200">
            <th className="px-3 py-3 text-left font-semibold text-gray-700">
              Customer
            </th>
            <th className="px-3 py-3 text-center font-semibold text-gray-700">
              Status
            </th>
            <th className="px-3 py-3 text-center font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const isNew = isRecentlyCreated(order);
            const statusStyles = getStatusStyles(order.status);

            return (
              <tr
                key={order.id}
                className={`border-b border-gray-200 transition-colors duration-500 ${
                  isNew
                    ? "bg-green-100 ring-1 ring-inset ring-green-200"
                    : index % 2 === 0
                    ? "bg-gray-50"
                    : "bg-white"
                }`}
              >
                <td className="px-3 py-3 text-gray-700">
                  <p>
                    {order.customer_name}{" "}
                    <span className="text-gray-500">#{order.id}</span>
                  </p>
                  <p className="text-gray-500">Table: {order.table_number}</p>
                </td>
                <td className="px-3 py-3 text-center">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${statusStyles}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onView(order.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-blue-600 transition"
                      title="View order"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      onClick={() => onEdit(order.id)}
                      className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-yellow-600 transition"
                      title="Edit order"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
