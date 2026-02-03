import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Discover from "./pages/Discover";

import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <Routes>
      {/* AUTH */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <Login setUser={setUser} />}
      />

      <Route
        path="/signup"
        element={user ? <Navigate to="/dashboard" replace /> : <Signup setUser={setUser} />}
      />

      {/* DASHBOARD + SUB-PAGES */}
      <Route
        path="/dashboard"
        element={user ? <Dashboard view="dashboard" /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/profile"
        element={user ? <Dashboard view="profile" /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/discover"
        element={user ? <Discover /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/quick-panel"
        element={user ? <Dashboard view="quick-panel" /> : <Navigate to="/login" replace />}
      />

      {/* FALLBACK */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
