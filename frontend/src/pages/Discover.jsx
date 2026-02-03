import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Discover() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const sections = [
    {
      title: "🤖 Machine Learning",
      items: [
        { label: "Intro to ML", q: "introduction to machine learning" },
        { label: "Neural Networks", q: "neural networks explained" },
        { label: "ML Roadmap", q: "machine learning roadmap" },
      ],
    },
    {
      title: "🧬 Biology",
      items: [
        { label: "Genetics Basics", q: "genetics basics" },
        { label: "Human Anatomy", q: "human anatomy overview" },
      ],
    },
    {
      title: "📐 Others",
      items: [
        { label: "Math for AI", q: "math for artificial intelligence" },
        { label: "Exam Prep Tips", q: "exam preparation tips" },
      ],
    },
  ];

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="discover-page">
      {/* ===== HEADER ROW ===== */}
      <div className="discover-header-row">
        <div className="discover-header">
          <h1>Discover</h1>
          <p>Curated learning resources to boost your studies.</p>
        </div>

        {/* ===== 3 DOT MENU ===== */}
        <div className="discover-menu">
          <button
            className="discover-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Discover menu"
          >
            ⋯
          </button>

          {open && (
            <div className="discover-menu-dropdown">
              <button onClick={() => go("/dashboard")}>
                🏠 Dashboard
              </button>

              <button onClick={() => go("/quick-panel")}>
                🧩 Quick Panel
              </button>

              <button onClick={() => go("/profile")}>
                👤 My Profile
              </button>

              <div className="discover-menu-divider" />

              <button className="danger" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className="discover-grid">
        {sections.map((section, i) => (
          <div
            key={section.title}
            className="discover-card"
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <h3>{section.title}</h3>

            <div className="discover-links">
              {section.items.map((item) => (
                <a
                  key={item.label}
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                    item.q
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                  <span>↗</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
