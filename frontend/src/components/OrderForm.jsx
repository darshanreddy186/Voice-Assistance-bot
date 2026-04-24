import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "Hindi" },
  { code: "kn-IN", label: "Kannada" },
  { code: "mr-IN", label: "Marathi" },
];

const inputStyle = {
  width: "100%", padding: "0.6rem 0.8rem", borderRadius: 8,
  border: "1px solid #334155", background: "#1e293b", color: "#e2e8f0",
  fontSize: "0.95rem", marginTop: 4
};

const labelStyle = { display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.75rem" };

export default function OrderForm({ onOrderCreated }) {
  const [form, setForm] = useState({ customer_name: "", phone: "", order_details: "", language: "en-US" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setCreatedOrder(data.order);
        setStatus({ type: "success", msg: "Order created! Click 'Call Customer' to initiate the call." });
        onOrderCreated?.();
      } else {
        setStatus({ type: "error", msg: "Failed to create order." });
      }
    } catch {
      setStatus({ type: "error", msg: "Server error. Is the backend running?" });
    }
    setLoading(false);
  }

  async function handleCall() {
    if (!createdOrder) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API}/initiate-call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: createdOrder.id })
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: "success", msg: `Call initiated! SID: ${data.call_sid}` });
        setCreatedOrder(null);
        setForm({ customer_name: "", phone: "", order_details: "", language: "en-US" });
      } else {
        setStatus({ type: "error", msg: data.detail || "Failed to initiate call." });
      }
    } catch {
      setStatus({ type: "error", msg: "Server error during call initiation." });
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "#1e293b", borderRadius: 12, padding: "1.5rem" }}>
      <h2 style={{ marginBottom: "1.25rem", fontSize: "1.1rem" }}>Create Order & Call Customer</h2>
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>
          Customer Name
          <input style={inputStyle} value={form.customer_name} onChange={set("customer_name")} required placeholder="Rahul Sharma" />
        </label>
        <label style={labelStyle}>
          Phone Number (with country code)
          <input style={inputStyle} value={form.phone} onChange={set("phone")} required placeholder="+919876543210" />
        </label>
        <label style={labelStyle}>
          Order Details
          <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={form.order_details} onChange={set("order_details")} required placeholder="2x Paneer Butter Masala, 1x Naan" />
        </label>
        <label style={labelStyle}>
          Language
          <select style={inputStyle} value={form.language} onChange={set("language")}>
            {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </label>

        {status && (
          <div style={{ padding: "0.6rem 1rem", borderRadius: 8, marginBottom: "1rem",
            background: status.type === "success" ? "#14532d" : "#7f1d1d", color: "#fff", fontSize: "0.9rem" }}>
            {status.msg}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={loading} style={{
            flex: 1, padding: "0.65rem", borderRadius: 8, border: "none",
            background: "#7c3aed", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem"
          }}>
            {loading ? "Processing..." : "📝 Create Order"}
          </button>
          {createdOrder && (
            <button type="button" onClick={handleCall} disabled={loading} style={{
              flex: 1, padding: "0.65rem", borderRadius: 8, border: "none",
              background: "#059669", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem"
            }}>
              📞 Call Customer
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
