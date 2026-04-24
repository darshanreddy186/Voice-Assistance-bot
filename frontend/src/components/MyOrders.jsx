import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_COLORS = {
  pending: { bg: "#78350f", text: "#fde68a", label: "⏳ Pending" },
  confirmed: { bg: "#14532d", text: "#86efac", label: "✅ Confirmed" },
  cancelled: { bg: "#7f1d1d", text: "#fca5a5", label: "❌ Cancelled" },
  modified: { bg: "#1e3a8a", text: "#93c5fd", label: "🔄 Modified" },
};

export default function MyOrders({ userId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API}/orders`);
      const data = await res.json();
      // Filter user's orders
      const userOrders = data.orders?.filter(o => o.user_id === userId) || [];
      setOrders(userOrders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
    setLoading(false);
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading orders...</div>;
  }

  if (orders.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "4rem", 
        background: "#1e293b", 
        borderRadius: 12 
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📦</div>
        <h3 style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>No orders yet</h3>
        <p style={{ color: "#94a3b8" }}>Place your first order to see it here!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", color: "#e2e8f0" }}>
        My Orders ({orders.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {orders.map((order) => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
          const deliveryDate = new Date(order.delivery_datetime);

          return (
            <div
              key={order.id}
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: "1.5rem",
                border: "1px solid #334155"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <h3 style={{ color: "#e2e8f0", marginBottom: "0.25rem", fontSize: "1.1rem" }}>
                    Order #{order.id.slice(0, 8)}
                  </h3>
                  <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <span style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: 6,
                  background: sc.bg,
                  color: sc.text,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  height: "fit-content"
                }}>
                  {sc.label}
                </span>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <h4 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.5rem" }}>Items:</h4>
                {order.order_items?.map((item, idx) => (
                  <div key={idx} style={{ color: "#94a3b8", fontSize: "0.85rem", marginLeft: "1rem" }}>
                    • {item.quantity}x {item.product_name} - ₹{item.price * item.quantity}
                  </div>
                ))}
              </div>

              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(2, 1fr)", 
                gap: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid #334155"
              }}>
                <div>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Delivery</span>
                  <p style={{ color: "#e2e8f0", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    {deliveryDate.toLocaleDateString()} at {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div>
                  <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Total Amount</span>
                  <p style={{ color: "#7c3aed", fontSize: "1.1rem", fontWeight: 700, marginTop: "0.25rem" }}>
                    ₹{order.total_amount}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
