import React from "react";

export default function AdminDashboardPlaceholder({ onNavigate }) {
  return (
    <div className="checkout-container" style={{ paddingTop: 24 }}>
      <div
        className="checkout-section"
        style={{ maxWidth: 560, margin: "0 auto" }}
      >
        <h2 className="checkout-section-title">Admin Dashboard</h2>
        <p style={{ marginTop: 12 }}>
          Welcome to the admin dashboard. UI coming soon...
        </p>
        <button
          className="checkout-back"
          onClick={() => onNavigate("home")}
          style={{ marginTop: 12 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
