import React, { useState } from "react";
import Hero from "../components/Hero";

export default function LeaveFeedback({ lastOrder, onNavigate }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!lastOrder || !lastOrder.orderId) {
    return (
      <main className="checkout-page page">
        <Hero />
        <div className="status">
          <p>No order to review. Place an order first.</p>
          <button
            type="button"
            className="checkout-back"
            onClick={() => onNavigate && onNavigate("home")}
          >
            Back to Menu
          </button>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setStatus({ type: "error", text: "Please choose a star rating." });
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/order-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: lastOrder.orderId,
          customerName: lastOrder.customerName,
          table: lastOrder.table,
          rating,
          comment: comment.trim() || null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Could not send feedback");
      }

      setStatus({ type: "success", text: data.message || "Thank you!" });
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status?.type === "success") {
    return (
      <main className="checkout-page page">
        <Hero />
        <div className="checkout-container">
          <div className="category-header">
            <h2>Thank you</h2>
          </div>
          <section className="checkout-section">
            <p style={{ margin: "0.5rem 0 1rem" }}>{status.text}</p>
            <button
              type="button"
              className="checkout-back"
              onClick={() => onNavigate && onNavigate("home")}
            >
              Back to Menu
            </button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page page">
      <Hero />

      <div className="checkout-container">
        <div className="category-header">
          <h2>Leave feedback</h2>
        </div>

        <section className="checkout-section">
          <p style={{ margin: "0.5rem 0 1rem", color: "var(--gray-600)" }}>
            How was your experience? Your feedback helps us improve.
          </p>

          <form className="checkout-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label id="rating-label">Rating</label>
              <div
                className="rating-stars"
                role="group"
                aria-labelledby="rating-label"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`rating-star-btn ${rating >= n ? "is-active" : ""}`}
                    onClick={() => setRating(n)}
                    aria-label={`${n} star${n === 1 ? "" : "s"}`}
                    aria-pressed={rating >= n}
                  >
                    <i className="fas fa-star" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="feedback-comment">Comments (optional)</label>
              <textarea
                id="feedback-comment"
                rows={4}
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what went well or what we could do better"
              />
            </div>

            {status?.type === "error" && (
              <div className="status error" role="alert" style={{ marginBottom: "0.75rem" }}>
                {status.text}
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="submit"
                className="checkout-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending…" : "Submit feedback"}
              </button>
              <button
                type="button"
                className="checkout-back"
                onClick={() => onNavigate && onNavigate("confirmed")}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
