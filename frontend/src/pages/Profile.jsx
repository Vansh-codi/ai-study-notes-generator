import { useEffect, useState } from "react";

export default function Profile() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalNotes: 0,
    studyTime: 0,
    activeDays: 0,
  });

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("history")) || [];
    const studyTime = Number(localStorage.getItem("studyTime") || 0);

    const days = new Set(
      history.map(item => new Date(item.createdAt).toDateString())
    );

    setStats({
      totalNotes: history.length,
      studyTime,
      activeDays: days.size,
    });
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div>
      <h1>My Profile</h1>

      {/* USER INFO */}
      <div className="card">
        <h2> Account</h2>
        <p><strong>Name:</strong> {user?.name}</p>
        <p><strong>Email:</strong> {user?.email || "—"}</p>
      </div>

      {/* ANALYTICS */}
      <div className="results">
        <div className="card">
          <h2> Notes Generated</h2>
          <p>{stats.totalNotes}</p>
        </div>

        <div className="card">
          <h2>Study Time</h2>
          <p>{formatTime(stats.studyTime)}</p>
        </div>

        <div className="card">
          <h2>Active Days</h2>
          <p>{stats.activeDays}</p>
        </div>
      </div>
    </div>
  );
}
