import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const inputStyle = {
  width: "100%", padding: "0.75rem", borderRadius: 8,
  border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0",
  fontSize: "1rem", marginTop: 6
};

const labelStyle = { 
  display: "block", color: "#94a3b8", fontSize: "0.9rem", 
  marginBottom: "1rem", fontWeight: 500 
};

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    first_name: "",
    last_name: "",
    address: ""
  });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const endpoint = isSignup ? "/signup" : "/login";
      const body = isSignup ? form : { phone: form.phone };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
      } else {
        setStatus({ type: "error", msg: data.detail || "Authentication failed" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Server error. Is the backend running?" });
    }

    setLoading(false);
  }

  return (
    <div style={{ 
      maxWidth: 450, 
      margin: "4rem auto", 
      padding: "2rem",
      background: "#1e293b",
      borderRadius: 16,
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
    }}>
      <h2 style={{ 
        textAlign: "center", 
        marginBottom: "0.5rem", 
        fontSize: "1.8rem",
        color: "#e2e8f0"
      }}>
        {isSignup ? "Create Account" : "Welcome Back"}
      </h2>
      <p style={{ 
        textAlign: "center", 
        color: "#94a3b8", 
        marginBottom: "2rem",
        fontSize: "0.9rem"
      }}>
        {isSignup ? "Sign up to start ordering" : "Login to continue"}
      </p>

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <>
            <label style={labelStyle}>
              First Name
              <input 
                style={inputStyle} 
                value={form.first_name} 
                onChange={set("first_name")} 
                required 
                placeholder="John"
              />
            </label>

            <label style={labelStyle}>
              Last Name
              <input 
                style={inputStyle} 
                value={form.last_name} 
                onChange={set("last_name")} 
                required 
                placeholder="Doe"
              />
            </label>
          </>
        )}

        <label style={labelStyle}>
          Phone Number (with country code)
          <input 
            style={inputStyle} 
            value={form.phone} 
            onChange={set("phone")} 
            required 
            placeholder="+919876543210"
          />
        </label>

        {isSignup && (
          <label style={labelStyle}>
            Delivery Address
            <textarea 
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} 
              value={form.address} 
              onChange={set("address")} 
              required 
              placeholder="123 Main St, City, State, ZIP"
            />
          </label>
        )}

        {status && (
          <div style={{ 
            padding: "0.75rem", 
            borderRadius: 8, 
            marginBottom: "1rem",
            background: status.type === "success" ? "#14532d" : "#7f1d1d", 
            color: "#fff", 
            fontSize: "0.9rem",
            textAlign: "center"
          }}>
            {status.msg}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 8,
            border: "none",
            background: "#7c3aed",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
            fontSize: "1rem",
            marginBottom: "1rem"
          }}
        >
          {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <div style={{ textAlign: "center" }}>
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setStatus(null);
            }}
            style={{
              background: "none",
              border: "none",
              color: "#7c3aed",
              cursor: "pointer",
              fontSize: "0.9rem",
              textDecoration: "underline"
            }}
          >
            {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
          </button>
        </div>
      </form>
    </div>
  );
}
