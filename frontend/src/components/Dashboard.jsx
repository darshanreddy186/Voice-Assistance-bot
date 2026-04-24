import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_COLORS = {
  pending: { bg: "#78350f", text: "#fde68a" },
  confirmed: { bg: "#14532d", text: "#86efac" },
  cancelled: { bg: "#7f1d1d", text: "#fca5a5" },
};

const LANG_LABELS = { "en-US": "English", "hi-IN": "Hindi", "kn-IN": "Kannada", "mr-IN": "Marathi" };

export default function Dashboard({ refresh }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${API}/orders`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setLoading(false); })
      .catch(() => { setError("Failed to load orders."); setLoading(false); });
  }, [refresh]);

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div>
      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        {[["pending", "⏳ Pending"], ["confirmed", "✅ Confirmed"], ["cancelled", "❌ Cancelled"]].map(([s, label]) => (
          <div key={s} style={{ flex: 1, background: "#1e293b", borderRadius: 10, padding: "1rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: STATUS_COLORS[s]?.text }}>{counts[s] || 0}</div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: "#1e293b", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1rem" }}>Order Log</h2>
          <span style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{orders.length} total</span>
        </div>

        {loading && <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>Loading...</div>}
        {error && <div style={{ padding: "1rem", color: "#fca5a5" }}>{error}</div>}
        {!loading && orders.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No orders yet. Create one!</div>
        )}

        {orders.map((order) => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          return (
            <div key={order.id} style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #0f172a", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{order.customer_name}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{order.phone}</div>
                <div style={{ color: "#cbd5e1", fontSize: "0.9rem", marginTop: 4 }}>{order.order_details}</div>
              </div>
              <div style={{ textAlign: "right", minWidth: 120 }}>
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: 6, background: sc.bg, color: sc.text, fontSize: "0.8rem", fontWeight: 600 }}>
                  {order.status}
                </span>
                <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 4 }}>
                  {LANG_LABELS[order.language] || order.language}
                </div>
                <div style={{ color: "#475569", fontSize: "0.75rem", marginTop: 2 }}>
                  {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
