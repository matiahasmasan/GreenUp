import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { setAuthToken, getCurrentUser } from "../utils/authUtils";

export default function AdminLogin({ onNavigate }) {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
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
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      setAuthToken(data.token);
      login(getCurrentUser(), data.token);

      setSuccess("Login successful — redirecting...");

      setTimeout(() => {
        if (data.role === "admin") {
          onNavigate?.("admin-dashboard");
        } else if (data.role === "operator") {
          onNavigate?.("operator-dashboard");
        } else if (data.role === "client") {
          onNavigate?.("account");
        } else {
          onNavigate?.("home");
        }
      }, 800);
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
        <h2 className="checkout-section-title">
          <i className="fas fa-right-to-bracket"></i> Log in
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email or username</label>
            <input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password"
              autoComplete="current-password"
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

        <p style={{ marginTop: "1.25rem", textAlign: "center" }}>
          New here?{" "}
          <button
            type="button"
            className="link-button"
            onClick={() => onNavigate?.("register")}
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
