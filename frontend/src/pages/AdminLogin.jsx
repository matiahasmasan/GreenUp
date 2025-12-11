import { useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }

      const data = await res.json();
      // store token in localStorage for now (no security concerns requested)
      if (data && data.token) {
        localStorage.setItem("adminToken", data.token);
      } else {
        localStorage.setItem("adminToken", JSON.stringify(data));
      }

      setSuccess("Login successful — token saved to localStorage.");
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
