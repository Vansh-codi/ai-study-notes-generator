import { useEffect, useState } from "react";

export default function QuickPanel() {
  const [data, setData] = useState({
    totalNotes: 0,
    lastActivity: "—",
    tags: {},
    starredNotes: [],
    history: [],
  });

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("history")) || [];

    const tagMap = {};
    const starred = [];

    history.forEach(item => {
      (item.tags || []).forEach(tag => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
      if (item.starred) starred.push(item);
    });

    setData({
      totalNotes: history.length,
      lastActivity: history[0]?.createdAt || "—",
      tags: tagMap,
      starredNotes: starred.slice(0, 3),
      history: history.slice(0, 6),
    });
  }, []);

  const topTags = Object.entries(data.tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="qp-layout">
      {/* ================= LEFT FIXED RAIL ================= */}
      <aside className="qp-rail">
        <h1 className="qp-title">Quick Panel</h1>
        <p className="qp-subtitle">Live app insights</p>

        <div className="qp-pulse">
          <div>
            <span>Total Notes</span>
            <strong>{data.totalNotes}</strong>
          </div>
          <div>
            <span>Last Activity</span>
            <strong>{data.lastActivity}</strong>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT SCROLLABLE CONTENT ================= */}
      <main className="qp-canvas">
        {/* 1️⃣ TRENDING TAGS */}
        <section className="qp-section">
          <h3>🔥 Trending Tags</h3>
          {topTags.length === 0 ? (
            <p className="qp-muted">
              Tags will appear as you organize your notes.
            </p>
          ) : (
            <div className="qp-tags">
              {topTags.map(([tag]) => (
                <span key={tag} className="qp-tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* 2️⃣ STARRED NOTES */}
        <section className="qp-section">
          <h3>⭐ Starred Notes</h3>
          {data.starredNotes.length === 0 ? (
            <p className="qp-muted">
              Star notes to keep important ones here.
            </p>
          ) : (
            <ul className="qp-list">
              {data.starredNotes.map(note => (
                <li key={note.id}>
                  {note.transcript.slice(0, 70)}…
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3️⃣ RECENT ACTIVITY */}
        <section className="qp-section">
          <h3>🕒 Recent Activity</h3>
          {data.history.length === 0 ? (
            <p className="qp-muted">
              Activity will appear after generating notes.
            </p>
          ) : (
            <ul className="qp-timeline">
              {data.history.map(item => (
                <li key={item.id}>
                  <span className="dot" />
                  <div>
                    <strong>Generated notes</strong>
                    <small>{item.createdAt}</small>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 4️⃣ USAGE INSIGHTS */}
        <section className="qp-section">
          <h3>📊 Usage Insights</h3>
          <p className="qp-muted">
            Insights on how you generate and organize notes will appear here.
          </p>
        </section>

        {/* 5️⃣ SUGGESTED FOCUS AREAS */}
        <section className="qp-section">
          <h3>🧠 Suggested Focus Areas</h3>
          <ul className="qp-list">
            <li>Machine Learning fundamentals</li>
            <li>Revision-focused summaries</li>
            <li>Exam-oriented note structure</li>
          </ul>
        </section>

        {/* 6️⃣ RECENT TOPICS */}
        <section className="qp-section">
          <h3>📌 Recently Generated Topics</h3>
          {data.history.length === 0 ? (
            <p className="qp-muted">
              Topics will appear after you generate notes.
            </p>
          ) : (
            <ul className="qp-list">
              {data.history.map(item => (
                <li key={item.id}>
                  {item.transcript.slice(0, 50)}…
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 7️⃣ NOTE ORGANIZATION STATUS */}
        <section className="qp-section">
          <h3>🗂 Note Organization</h3>
          <p className="qp-muted">
            Tagging, starring, and smart grouping status will appear here.
          </p>
        </section>

        {/* 8️⃣ EXPERIMENT ZONE */}
        <section className="qp-section">
          <h3>🧪 Experiment Zone</h3>
          <p className="qp-muted">
            Try upcoming AI-powered features before they launch.
          </p>
        </section>

        {/* 9️⃣ LEARNING STREAK */}
        <section className="qp-section">
          <h3>🔥 Learning Streak</h3>
          <p className="qp-muted">
            Track daily consistency and learning streaks here.
          </p>
        </section>

        {/* 🔟 FUTURE AI RECOMMENDATIONS */}
        <section className="qp-section">
          <h3>🚀 Smart Recommendations</h3>
          <p className="qp-muted">
            AI-based study suggestions will appear here soon.
          </p>
        </section>
      </main>
    </div>
  );
}
