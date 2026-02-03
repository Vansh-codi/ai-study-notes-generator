import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import SplineScene from "../components/SplineScene";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import Profile from "./Profile";
import QuickPanel from "./QuickPanel";
import "../App.css";

export default function Dashboard({ view = "dashboard" }) {
  // ================= ROUTE =================
  const location = useLocation();
  const isQuickPanel = location.pathname === "/quick-panel";

  // ================= STATE =================
  const [transcript, setTranscript] = useState("");
  const [notes, setNotes] = useState("");
  const [quiz, setQuiz] = useState("");
  const [mode, setMode] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= HISTORY =================
  const [history, setHistory] = useState([]);
  const [activeId, setActiveId] = useState(null);

  // ================= STUDY TIME (LOGIN SESSION BASED) =================
  useEffect(() => {
    let interval;

    const startTimer = () => {
      interval = setInterval(() => {
        const prev = Number(localStorage.getItem("studyTime") || 0);
        localStorage.setItem("studyTime", prev + 1);
      }, 1000);
    };

    const stopTimer = () => {
      if (interval) clearInterval(interval);
    };

    startTimer();

    document.addEventListener("visibilitychange", () => {
      document.hidden ? stopTimer() : startTimer();
    });

    return () => stopTimer();
  }, []);

  // ================= SAVE HISTORY FOR ANALYTICS =================
  useEffect(() => {
    localStorage.setItem("history", JSON.stringify(history));
  }, [history]);

  // ================= GENERATE =================
  const generate = async () => {
    if (!transcript.trim()) return;

    setLoading(true);
    setNotes("");
    setQuiz("");
    setMode("");

    try {
      const res = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          generate_quiz: true,
          num_questions: 3,
        }),
      });

      const data = await res.json();

      const modeText =
        data.mode === "ollama"
          ? "🟢 Using Local AI (Ollama)"
          : data.mode === "openai"
          ? "🔵 Using OpenAI"
          : "⚪ AI Disabled";

      setMode(modeText);
      setNotes(data.study_notes || "");
      setQuiz(data.quiz || "");

      const newItem = {
        id: Date.now(),
        transcript,
        notes: data.study_notes || "",
        quiz: data.quiz || "",
        mode: data.mode,
        createdAt: new Date().toLocaleString(),
        starred: false,
        tags: [],
      };

      setHistory((prev) => [newItem, ...prev]);
      setActiveId(newItem.id);
    } catch (e) {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD HISTORY =================
  const loadHistoryItem = (item) => {
    setTranscript(item.transcript);
    setNotes(item.notes);
    setQuiz(item.quiz);

    setMode(
      item.mode === "ollama"
        ? "🟢 Using Local AI (Ollama)"
        : item.mode === "openai"
        ? "🔵 Using OpenAI"
        : "⚪ AI Disabled"
    );

    setActiveId(item.id);
  };

  // ================= DOWNLOAD =================
  const downloadText = (content, filename) => {
    if (!content) return;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ================= UI =================
  return (
    <div className="dashboard">
      <Navbar />

      <div className="dashboard-body">
        <Sidebar
          history={history}
          onSelect={loadHistoryItem}
          activeId={activeId}
          collapsed={isQuickPanel}
        />

        <div className="dashboard-main">
          {/* ================= ROUTED VIEWS ================= */}

          {view === "profile" && <Profile />}

          {view === "quick-panel" && <QuickPanel />}

          {view === "dashboard" && (
            <>
              {/* ===== HERO ===== */}
              <div className="dashboard-hero">
                <div className="hero-left">
                  <h1>AI Study Notes Generator</h1>
                  <p>
                    Paste your lecture transcript and generate notes & quizzes.
                  </p>

                  <textarea
                    rows={10}
                    placeholder="Paste your transcript here..."
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                  />

                  <button onClick={generate} disabled={loading}>
                    {loading ? "Generating..." : "Generate"}
                  </button>

                  <div className="mode">{mode}</div>
                </div>

                <div className="hero-right">
                  <SplineScene
                    scene="https://prod.spline.design/gYnPSNVJUKmeU9ad/scene.splinecode"
                    className="robot"
                  />
                </div>
              </div>

              {/* ===== RESULTS ===== */}
              <div className="results">
                <div className="card">
                  <h2>Study Notes</h2>
                  <button
                    className="download-btn"
                    disabled={!notes}
                    onClick={() =>
                      downloadText(notes, "study-notes.txt")
                    }
                  >
                    ⬇ Download Notes
                  </button>
                  <pre>{notes || "No notes yet"}</pre>
                </div>

                <div className="card">
                  <h2>Quiz</h2>
                  <button
                    className="download-btn"
                    disabled={!quiz}
                    onClick={() => downloadText(quiz, "quiz.txt")}
                  >
                    ⬇ Download Quiz
                  </button>
                  <pre>{quiz || "No quiz yet"}</pre>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
