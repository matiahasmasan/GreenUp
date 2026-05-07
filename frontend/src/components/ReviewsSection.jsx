import React, { useState, useMemo } from "react";
import Pagination from "./common/Pagination";

export default function ReviewsSection({ reviews, loading, error }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Calculate average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating), 0);
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="checkout-section-title mb-0">Order Reviews</h2>
        <div className="flex items-center gap-2">
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
                <div style={{ display: "flex", gap: "0.35rem" }}>
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

                <div style={{ color: "var(--gray-600)", fontSize: "0.9rem" }}>
                  Order #{r.order_id} • Table {r.table_number} •{" "}
                  {r.customer_name}
                  {r.created_at ? (
                    <>
                      {" "}
                      •{" "}
                      {new Date(r.created_at).toLocaleString("ro-RO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </>
                  ) : null}
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
          />
        </div>
      )}
    </div>
  );
}
