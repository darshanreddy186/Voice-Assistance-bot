import { useState, useEffect } from "react";
import Login from "./components/Login";
import UserPortal from "./components/UserPortal";
import AdminDashboard from "./components/AdminDashboard";
import LandingPage from "./components/LandingPage";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";

function AppContent() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { language, setLanguage, t } = useLanguage();

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
    setShowLogin(false);
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

  const LANGUAGES = [
    { code: "en-US", label: "English", flag: "🇬🇧" },
    { code: "hi-IN", label: "हिंदी", flag: "🇮🇳" },
    { code: "kn-IN", label: "ಕನ್ನಡ", flag: "🇮🇳" },
    { code: "mr-IN", label: "मराठी", flag: "🇮🇳" },
  ];

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
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img 
            src="/logo.svg" 
            alt="AutomatonAI Logo" 
            style={{ width: "50px", height: "50px" }}
          />
          <div>
            <h1 style={{ fontSize: "1.5rem", color: "#7c3aed", margin: 0 }}>
              {t("appTitle")}
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", margin: 0 }}>
              {t("appSubtitle")}
            </p>
          </div>
        </div>
        
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 6,
              border: "1px solid #7c3aed",
              background: "#0f172a",
              color: "#e2e8f0",
              cursor: "pointer",
              fontSize: "0.9rem"
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>

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
                {isAdmin ? `👨‍💼 ${t("adminMode")}` : `🛒 ${t("userMode")}`}
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
                {t("logout")}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>
        {!user ? (
          showLogin ? (
            <Login onLogin={handleLogin} />
          ) : (
            <LandingPage onGetStarted={() => setShowLogin(true)} />
          )
        ) : isAdmin ? (
          <AdminDashboard />
        ) : (
          <UserPortal user={user} />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
