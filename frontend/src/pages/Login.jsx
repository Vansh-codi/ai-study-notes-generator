import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) return alert("Fill all fields");

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) throw new Error();

      const data = await res.json();

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setUser(data.user); // 🔥 triggers redirect instantly
      navigate("/dashboard", { replace: true });

    } catch {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Login</h1>
        <p>Welcome back</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* 👇 SIGNUP LINK */}
        <p style={{ marginTop: "14px", fontSize: "14px", opacity: 0.8 }}>
          Don’t have an account?{" "}
          <Link to="/signup" style={{ color: "#22c55e" }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
