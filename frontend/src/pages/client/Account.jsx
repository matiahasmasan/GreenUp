import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { authFetch, getCurrentUser } from "../../utils/authUtils";
import { formatDate } from "../../utils/dateFormatter";
import Pagination from "../../components/common/Pagination";

const ORDERS_PER_PAGE = 3;

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const STATUS_COLORS = {
  pending: { bg: "#fef3c7", fg: "#92400e" },
  preparing: { bg: "#dbeafe", fg: "#1e40af" },
  ready: { bg: "#e0e7ff", fg: "#3730a3" },
  completed: { bg: "#d1fae5", fg: "#065f46" },
  cancelled: { bg: "#fee2e2", fg: "#991b1b" },
};

function StatusBadge({ status }) {
  const colors = STATUS_COLORS[status] || { bg: "#e5e7eb", fg: "#374151" };
  return (
    <span
      style={{
        background: colors.bg,
        color: colors.fg,
        padding: "0.2rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

export default function Account({ onNavigate }) {
  const { logout } = useAuth();
  const currentUser = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await authFetch("/api/my/orders");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load orders");
        if (active) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (active) setError(err.message || "Failed to load orders");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const totalSpent = activeOrders.reduce(
    (sum, o) => sum + Number(o.total_amount || 0),
    0,
  );

  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1;
  const pageStart = (currentPage - 1) * ORDERS_PER_PAGE;
  const paginatedOrders = orders.slice(pageStart, pageStart + ORDERS_PER_PAGE);

  const toggleOrder = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleLogout = () => {
    logout();
    onNavigate?.("home");
  };

  return (
    <div className="checkout-container" style={{ paddingTop: 24 }}>
      {/* Profile header */}
      <section className="checkout-section">
        <h2 className="checkout-section-title">
          <i className="fas fa-circle-user"></i> My Account
        </h2>
        <div className="order-summary">
          <div className="summary-row">
            <span>Name</span>
            <strong>{currentUser?.name || "—"}</strong>
          </div>
          <div className="summary-row">
            <span>Email</span>
            <strong>{currentUser?.email || "—"}</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="button"
            className="checkout-back"
            onClick={() => onNavigate?.("home")}
          >
            <i className="fas fa-utensils"></i> Order more
          </button>
          <button
            type="button"
            className="checkout-back"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt"></i> Log out
          </button>
        </div>
      </section>

      {/* Summary cards */}
      <section
        className="checkout-section"
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--green-700)" }}>
            Total orders
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {activeOrders.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "var(--green-700)" }}>
            Total spent
          </div>
          <div style={{ fontSize: "1.6rem", fontWeight: 700 }}>
            {priceFormatter.format(totalSpent)}
          </div>
        </div>
      </section>

      {/* Order / transaction history */}
      <section className="checkout-section" style={{ marginTop: "1.5rem" }}>
        <h3 className="checkout-section-title">
          <i className="fas fa-receipt"></i> Order history
        </h3>

        {loading && <div className="status">Loading your orders…</div>}
        {error && <div className="status error">{error}</div>}

        {!loading && !error && orders.length === 0 && (
          <div className="status">
            <p>You haven't placed any orders yet.</p>
            <button
              type="button"
              className="checkout-back"
              onClick={() => onNavigate?.("home")}
            >
              Browse the menu
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          paginatedOrders.map((order) => {
            const isExpanded = expandedId === order.id;
            return (
              <div
                key={order.id}
                style={{
                  border: "1px solid var(--gray-200)",
                  borderRadius: "0.75rem",
                  padding: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleOrder(order.id)}
                  aria-expanded={isExpanded}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div>
                    <strong>Order #{order.id}</strong>
                    <div
                      style={{ fontSize: "0.8rem", color: "var(--green-700)" }}
                    >
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <StatusBadge status={order.status} />
                    <i
                      className="fas fa-chevron-down"
                      style={{
                        color: "var(--green-700)",
                        transition: "transform 0.2s ease",
                        transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                      }}
                    ></i>
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <div className="order-items">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="order-item">
                          <div className="order-item-info">
                            <div>
                              <span className="order-item-name">
                                {item.name}
                              </span>
                              {item.addons?.length > 0 && (
                                <ul className="order-item-addons">
                                  {item.addons.map((a, i) => (
                                    <li key={i}>
                                      + {a.name}
                                      {a.price > 0
                                        ? ` (+$${Number(a.price).toFixed(2)})`
                                        : ""}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                            <span className="order-item-qty">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="order-item-price">
                            {priceFormatter.format(Number(item.subtotal || 0))}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Table</span>
                        <strong>{order.table_number}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Payment</span>
                        <strong>
                          {order.payment_method === "card" ? "Card" : "Cash"}
                        </strong>
                      </div>
                      <div className="summary-row total">
                        <span>Total</span>
                        <strong>
                          {priceFormatter.format(
                            Number(order.total_amount || 0),
                          )}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        {!loading && !error && orders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={orders.length}
            itemsPerPage={ORDERS_PER_PAGE}
            itemName="orders"
          />
        )}
      </section>
    </div>
  );
}
