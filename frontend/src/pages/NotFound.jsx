export default function NotFound({ onNavigate }) {
  return (
    <main className="page">
      <div className="checkout-container" style={{ paddingTop: 24 }}>
        <div
          className="checkout-section"
          style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: "bold",
              color: "var(--green-500)",
              margin: "20px 0",
            }}
          >
            404
          </div>
          <h2 className="checkout-section-title">Page Not Found</h2>
          <p style={{ marginTop: 12, color: "var(--gray-600)" }}>
            Sorry, the page you're looking for doesn't exist.
          </p>
          <button
            className="checkout-btn"
            onClick={() => onNavigate("home")}
            style={{ marginTop: 20 }}
          >
            Go Back Home
          </button>
        </div>
      </div>
    </main>
  );
}
