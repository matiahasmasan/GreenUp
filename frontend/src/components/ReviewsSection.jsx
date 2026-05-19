import React, { useState, useMemo } from "react";
import Pagination from "./common/Pagination";
import ViewOrderModal from "./ViewOrderModal";
import { useOrderModal } from "../hooks/useOrderModal";

export default function ReviewsSection({ reviews, loading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const {
    viewModalOpen,
    selectedOrder,
    orderLoading,
    orderError,
    handleView,
    handleCloseViewModal,
  } = useOrderModal("/api");
  const itemsPerPage = 3;

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) return "0.0";
    const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  // Paginate reviews
  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return reviews.slice(startIndex, startIndex + itemsPerPage);
  }, [reviews, currentPage]);

  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  if (loading) {
    return <div className="p-6 text-center">Loading reviews...</div>;
  }

  if (error) {
    return (
      <div className="status error" style={{ margin: "0 0 1rem" }}>
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return <div className="p-6 text-center text-gray-500">No reviews yet.</div>;
  }

  return (
    <div className="checkout-section mt-4">
      <div className="flex justify-between items-center">
        <h2 className="checkout-section-title mb-0">Order Reviews</h2>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
            <i
              key={n}
              className="fas fa-star"
              aria-hidden="true"
              style={{
                color:
                  Number(averageRating) >= n
                    ? "var(--green-500)"
                    : "var(--gray-300)",
                fontSize: "0.85rem",
              }}
            />
          ))}
        </div>
        <span style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
          {averageRating} avg ({reviews.length} reviews)
        </span>
      </div>
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4" style={{ display: "grid", gap: "0.75rem" }}>
          {paginatedReviews.map((r) => (
            <div
              key={r.id}
              style={{
                border: "1px solid rgba(168, 213, 186, 0.45)",
                borderRadius: "0.75rem",
                padding: "0.9rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <i
                      key={n}
                      className="fas fa-star"
                      aria-hidden="true"
                      style={{
                        color:
                          Number(r.rating) >= n
                            ? "var(--green-500)"
                            : "var(--gray-300)",
                      }}
                    />
                  ))}
                  <span style={{ color: "var(--gray-600)" }}>
                    ({r.rating}/5)
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
                    {r.customer_name}
                    {r.created_at ? (
                      <>
                        {" "}•{" "}
                        {new Date(r.created_at).toLocaleDateString("ro-RO", {
                          dateStyle: "medium",
                        })}
                      </>
                    ) : null}
                  </div>
                  <button
                    onClick={() => handleView(r.order_id)}
                    style={{
                      fontSize: "0.8rem",
                      padding: "0.25rem 0.65rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--green-500)",
                      color: "var(--green-600)",
                      background: "transparent",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <i className="fas fa-eye" style={{ marginRight: "0.3rem" }} />
                    View
                  </button>
                </div>
              </div>

              {r.comment ? (
                <div style={{ color: "var(--green-800)" }}>{r.comment}</div>
              ) : (
                <div style={{ color: "var(--gray-500)" }}>
                  No comment provided.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={reviews.length}
            itemsPerPage={itemsPerPage}
            itemName="reviews"
          />
        </div>
      )}

      <ViewOrderModal
        isOpen={viewModalOpen}
        onClose={handleCloseViewModal}
        selectedOrder={selectedOrder}
        loading={orderLoading}
        error={orderError}
        isAdmin={true}
      />
    </div>
  );
}
