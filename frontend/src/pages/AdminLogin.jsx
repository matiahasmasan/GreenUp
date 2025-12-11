import { useState } from "react";

const HARDCODED_USERNAME = "admin";
const HARDCODED_PASSWORD = "admin";

export default function AdminLogin({ onNavigate }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Simulate async login with hardcoded credentials
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (username === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        // Store token in localStorage for now
        const token = btoa(JSON.stringify({ username, role: "admin" }));
        localStorage.setItem("adminToken", token);
        setSuccess("Login successful — redirecting...");

        // Navigate to admin dashboard after a short delay
        setTimeout(() => {
          onNavigate?.("admin-dashboard");
        }, 1000);
      } else {
        throw new Error("Invalid username or password");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="checkout-container" style={{ paddingTop: 24 }}>
      <div
        className="checkout-section"
        style={{ maxWidth: 560, margin: "0 auto" }}
      >
        <h2 className="checkout-section-title">Admin / Operator Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin"
            />
          </div>

          {error && <div className="status error">{error}</div>}
          {success && <div className="status">{success}</div>}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginTop: 12,
            }}
          >
            <button
              className="checkout-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Logging in…" : "Log in"}
            </button>

            <button
              type="button"
              className="checkout-back"
              onClick={() => onNavigate?.("home")}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
