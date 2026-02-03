import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  // apply theme to body
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="navbar">
      {/* CLICKABLE TITLE → DASHBOARD */}
      <strong
        style={{ cursor: "pointer" }}
        onClick={() => go("/dashboard")}
      >
        📚 AI Study Notes
      </strong>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* PROFILE DROPDOWN */}
        <div style={{ position: "relative" }}>
          <button
            className="profile-btn"
            onClick={() => setOpen((o) => !o)}
          >
            👤 {user?.name}
          </button>

          {open && (
            <div className="profile-menu">
              <button onClick={() => go("/profile")}>
                👤 My Profile
              </button>

              <button onClick={() => go("/quick-panel")}>
                🧩 Quick Panel
              </button>

              <button onClick={() => go("/discover")}>
                🔍 Discover
              </button>

              {/* THEME TOGGLE */}
              <div
                className={`theme-orb ${theme}`}
                onClick={toggleTheme}
                title="Toggle theme"
              />
            </div>
          )}
        </div>

        {/* LOGOUT */}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}
