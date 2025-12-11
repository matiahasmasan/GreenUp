import { useState } from "react";

export default function AdminDashboard({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="checkout-container" style={{ paddingTop: 24 }}>
      <div
        className="checkout-section"
        style={{ maxWidth: 900, margin: "0 auto" }}
      >
        <h2 className="checkout-section-title">Admin Dashboard</h2>

        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div
            style={{ display: "flex", gap: 12, borderBottom: "1px solid #ccc" }}
          >
            <button
              onClick={() => setActiveTab("overview")}
              style={{
                padding: "12px 16px",
                border: "none",
                background: activeTab === "overview" ? "#333" : "transparent",
                color: activeTab === "overview" ? "#fff" : "#333",
                cursor: "pointer",
                borderRadius: "4px 4px 0 0",
              }}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("menu")}
              style={{
                padding: "12px 16px",
                border: "none",
                background: activeTab === "menu" ? "#333" : "transparent",
                color: activeTab === "menu" ? "#fff" : "#333",
                cursor: "pointer",
                borderRadius: "4px 4px 0 0",
              }}
            >
              Menu Management
            </button>
            <button
              onClick={() => setActiveTab("users")}
              style={{
                padding: "12px 16px",
                border: "none",
                background: activeTab === "users" ? "#333" : "transparent",
                color: activeTab === "users" ? "#fff" : "#333",
                cursor: "pointer",
                borderRadius: "4px 4px 0 0",
              }}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              style={{
                padding: "12px 16px",
                border: "none",
                background: activeTab === "settings" ? "#333" : "transparent",
                color: activeTab === "settings" ? "#fff" : "#333",
                cursor: "pointer",
                borderRadius: "4px 4px 0 0",
              }}
            >
              Settings
            </button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div style={{ marginTop: 24 }}>
            <h3>Overview</h3>
            <p>Admin overview and analytics coming soon...</p>
          </div>
        )}

        {activeTab === "menu" && (
          <div style={{ marginTop: 24 }}>
            <h3>Menu Management</h3>
            <p>Add, edit, and manage menu items here.</p>
          </div>
        )}

        {activeTab === "users" && (
          <div style={{ marginTop: 24 }}>
            <h3>User Management</h3>
            <p>Manage admins, operators, and staff here.</p>
          </div>
        )}

        {activeTab === "settings" && (
          <div style={{ marginTop: 24 }}>
            <h3>Settings</h3>
            <p>System settings and configuration here.</p>
          </div>
        )}

        <button
          className="checkout-back"
          onClick={() => onNavigate?.("home")}
          style={{ marginTop: 24 }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
