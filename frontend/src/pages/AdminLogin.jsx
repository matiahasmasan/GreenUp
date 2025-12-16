import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { setAuthToken } from "../utils/authUtils";

const HARDCODED_CREDENTIALS = {
  admin: { password: "admin", role: "admin" },
  operator: { password: "operator", role: "operator" },
};

export default function AdminLogin({ onNavigate }) {
  const { login } = useAuth();
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

      const credentials = HARDCODED_CREDENTIALS[username];
      if (!credentials || credentials.password !== password) {
        throw new Error("Invalid username or password");
      }

      // Create token with user info
      const userData = { username, role: credentials.role };
      const token = btoa(JSON.stringify(userData));

      // Store token
      setAuthToken(token);
      login(userData, token);

      setSuccess("Login successful — redirecting...");

      // Navigate to appropriate dashboard based on role
      setTimeout(() => {
        if (credentials.role === "admin") {
          onNavigate?.("admin-dashboard");
        } else if (credentials.role === "operator") {
          onNavigate?.("operator-dashboard");
        } else {
          onNavigate?.("home");
        }
      }, 1000);
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
