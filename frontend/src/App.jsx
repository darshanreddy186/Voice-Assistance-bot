import { useState, useEffect } from "react";
import Login from "./components/Login";
import UserPortal from "./components/UserPortal";
import AdminDashboard from "./components/AdminDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check admin mode
    const adminMode = localStorage.getItem("adminMode");
    if (adminMode === "true") {
      setIsAdmin(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const toggleAdminMode = () => {
    const newMode = !isAdmin;
    setIsAdmin(newMode);
    localStorage.setItem("adminMode", newMode.toString());
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a" }}>
      {/* Header */}
      <header style={{ 
        background: "#1e293b", 
        padding: "1rem 2rem", 
        borderBottom: "2px solid #7c3aed",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", color: "#7c3aed", margin: 0 }}>
            🤖 Automaton AI
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
            AI-Powered Voice Order System
          </p>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {user && (
            <>
              <span style={{ color: "#cbd5e1", fontSize: "0.9rem" }}>
                👤 {user.first_name} {user.last_name}
              </span>
              <button
                onClick={toggleAdminMode}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 6,
                  border: "1px solid #7c3aed",
                  background: isAdmin ? "#7c3aed" : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                {isAdmin ? "👨‍💼 Admin Mode" : "🛒 User Mode"}
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 6,
                  border: "1px solid #ef4444",
                  background: "transparent",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {!user ? (
          <Login onLogin={handleLogin} />
        ) : isAdmin ? (
          <AdminDashboard />
        ) : (
          <UserPortal user={user} />
        )}
      </main>
    </div>
  );
}
