export default function Sidebar({
  history,
  onSelect,
  activeId,
  collapsed,
}) {
  // group by date (Today / Earlier)
  const today = new Date().toLocaleDateString();

  const grouped = {
    Today: [],
    Earlier: [],
  };

  history.forEach((item) => {
    const itemDate = new Date(item.createdAt).toLocaleDateString();
    itemDate === today
      ? grouped.Today.push(item)
      : grouped.Earlier.push(item);
  });

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <h3 className="sidebar-title">History</h3>

      {/* EMPTY STATE */}
      {history.length === 0 && (
        <div className="sidebar-empty">
          <div className="sidebar-empty-icon">🕘</div>
          <p>No history yet</p>
          <span>
            Generated notes will appear here for quick access.
          </span>
        </div>
      )}

      {/* TODAY */}
      {grouped.Today.length > 0 && (
        <>
          <div className="sidebar-section">Today</div>
          {grouped.Today.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </>
      )}

      {/* EARLIER */}
      {grouped.Earlier.length > 0 && (
        <>
          <div className="sidebar-section">Earlier</div>
          {grouped.Earlier.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              activeId={activeId}
              onSelect={onSelect}
            />
          ))}
        </>
      )}
    </aside>
  );
}

function HistoryItem({ item, activeId, onSelect }) {
  const title = item.transcript.slice(0, 20);
  const preview = item.transcript.slice(20, 70);

  return (
    <div
      className={`history-item ${
        activeId === item.id ? "active" : ""
      }`}
      onClick={() => onSelect(item)}
    >
      <div className="history-title">
        {title || "Untitled note"}
      </div>

      {preview && (
        <div className="history-preview">
          {preview}
          {item.transcript.length > 70 ? "…" : ""}
        </div>
      )}

      <div className="history-meta">
        <span>{item.createdAt}</span>
        {item.starred && <span>⭐</span>}
      </div>
    </div>
  );
}
