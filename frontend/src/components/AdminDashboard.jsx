import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const STATUS_COLORS = {
  pending: { bg: "#78350f", text: "#fde68a" },
  confirmed: { bg: "#14532d", text: "#86efac" },
  cancelled: { bg: "#7f1d1d", text: "#fca5a5" },
  modified: { bg: "#1e3a8a", text: "#93c5fd" },
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  async function fetchOrders() {
    try {
      const res = await fetch(`${API}/orders`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
    setLoading(false);
  }

  async function fetchOrderDetails(orderId) {
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API}/order/${orderId}`);
      const data = await res.json();
      setOrderDetails(data);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
    }
    setDetailsLoading(false);
  }

  function handleOrderClick(order) {
    setSelectedOrder(order);
    fetchOrderDetails(order.id);
  }

  const stats = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    acc.total++;
    return acc;
  }, { total: 0, pending: 0, confirmed: 0, cancelled: 0, modified: 0 });

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#e2e8f0" }}>
        👨‍💼 Admin Dashboard
      </h1>
      <p style={{ color: "#94a3b8", marginBottom: "2rem" }}>
        Monitor all orders and AI call interactions
      </p>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { key: "total", label: "Total Orders", icon: "📊", color: "#7c3aed" },
          { key: "pending", label: "Pending", icon: "⏳", color: "#f59e0b" },
          { key: "confirmed", label: "Confirmed", icon: "✅", color: "#10b981" },
          { key: "modified", label: "Modified", icon: "🔄", color: "#3b82f6" },
          { key: "cancelled", label: "Cancelled", icon: "❌", color: "#ef4444" }
        ].map((stat) => (
          <div
            key={stat.key}
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "1.25rem",
              textAlign: "center",
              border: "1px solid #334155"
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{stat.icon}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: stat.color, marginBottom: "0.25rem" }}>
              {stats[stat.key] || 0}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1fr 1fr" : "1fr", gap: "2rem" }}>
        {/* Orders List */}
        <div>
          <h2 style={{ marginBottom: "1rem", fontSize: "1.3rem", color: "#e2e8f0" }}>
            All Orders ({orders.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {orders.map((order) => {
              const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
              const isSelected = selectedOrder?.id === order.id;

              return (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  style={{
                    background: isSelected ? "#2d3748" : "#1e293b",
                    borderRadius: 10,
                    padding: "1rem",
                    cursor: "pointer",
                    border: isSelected ? "2px solid #7c3aed" : "1px solid #334155",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#2d3748";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = "#1e293b";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: "#e2e8f0", marginBottom: "0.25rem" }}>
                        {order.customer_name}
                      </div>
                      <div style={{ color: "#94a3b8", fontSize: "0.8rem" }}>
                        {order.phone}
                      </div>
                      <div style={{ color: "#cbd5e1", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                        {order.order_items?.length || 0} items • ₹{order.total_amount}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        padding: "0.3rem 0.6rem",
                        borderRadius: 6,
                        background: sc.bg,
                        color: sc.text,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        display: "inline-block",
                        marginBottom: "0.5rem"
                      }}>
                        {order.status}
                      </span>
                      <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder && (
          <div style={{ position: "sticky", top: 20, height: "fit-content" }}>
            <div style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "1.5rem",
              border: "1px solid #334155"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.3rem", color: "#e2e8f0" }}>
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "1.2rem"
                  }}
                >
                  ✕
                </button>
              </div>

              {detailsLoading ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  Loading details...
                </div>
              ) : orderDetails ? (
                <div>
                  {/* Order Info */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                      📦 Order Information
                    </h3>
                    <div style={{ background: "#0f172a", borderRadius: 8, padding: "1rem" }}>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Customer: </span>
                        <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                          {orderDetails.order.customer_name}
                        </span>
                      </div>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Phone: </span>
                        <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                          {orderDetails.order.phone}
                        </span>
                      </div>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Address: </span>
                        <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                          {orderDetails.order.address}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", fontSize: "0.8rem" }}>Delivery: </span>
                        <span style={{ color: "#e2e8f0", fontSize: "0.9rem" }}>
                          {new Date(orderDetails.order.delivery_datetime).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                      🍽️ Items
                    </h3>
                    {orderDetails.order.order_items?.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: "#0f172a",
                          borderRadius: 8,
                          padding: "0.75rem",
                          marginBottom: "0.5rem",
                          display: "flex",
                          justifyContent: "space-between"
                        }}
                      >
                        <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>
                          {item.quantity}x {item.product_name}
                        </span>
                        <span style={{ color: "#7c3aed", fontWeight: 600, fontSize: "0.85rem" }}>
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Call Logs */}
                  {orderDetails.call_logs && orderDetails.call_logs.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                        📞 Call Logs ({orderDetails.call_logs.length} attempts)
                      </h3>
                      {orderDetails.call_logs.map((log, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#0f172a",
                            borderRadius: 8,
                            padding: "0.75rem",
                            marginBottom: "0.5rem"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ color: "#e2e8f0", fontSize: "0.85rem" }}>
                              Attempt #{log.attempt_number}
                            </span>
                            <span style={{
                              color: log.status === "completed" ? "#86efac" : "#fca5a5",
                              fontSize: "0.75rem",
                              fontWeight: 600
                            }}>
                              {log.status}
                            </span>
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.75rem" }}>
                            {new Date(log.created_at).toLocaleString()}
                            {log.duration && ` • ${log.duration}s`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Conversation History */}
                  {orderDetails.conversation && orderDetails.conversation.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      <h3 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                        💬 AI Conversation ({orderDetails.conversation.length} turns)
                      </h3>
                      {orderDetails.conversation.map((turn, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#0f172a",
                            borderRadius: 8,
                            padding: "0.75rem",
                            marginBottom: "0.5rem"
                          }}
                        >
                          <div style={{ marginBottom: "0.5rem" }}>
                            <span style={{ color: "#3b82f6", fontSize: "0.75rem", fontWeight: 600 }}>
                              User ({turn.detected_language}):
                            </span>
                            <p style={{ color: "#e2e8f0", fontSize: "0.85rem", margin: "0.25rem 0" }}>
                              "{turn.user_input}"
                            </p>
                          </div>
                          <div>
                            <span style={{ color: "#7c3aed", fontSize: "0.75rem", fontWeight: 600 }}>
                              AI ({turn.ai_intent}):
                            </span>
                            <p style={{ color: "#cbd5e1", fontSize: "0.85rem", margin: "0.25rem 0" }}>
                              "{turn.ai_response}"
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Modifications */}
                  {orderDetails.modifications && orderDetails.modifications.length > 0 && (
                    <div>
                      <h3 style={{ color: "#cbd5e1", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
                        🔄 AI Modifications ({orderDetails.modifications.length})
                      </h3>
                      {orderDetails.modifications.map((mod, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: "#0f172a",
                            borderRadius: 8,
                            padding: "0.75rem",
                            marginBottom: "0.5rem"
                          }}
                        >
                          <div style={{ color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                            {mod.modification_type.toUpperCase()}
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                            <span style={{ textDecoration: "line-through" }}>{mod.old_value}</span>
                            {" → "}
                            <span style={{ color: "#86efac" }}>{mod.new_value}</span>
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.7rem" }}>
                            {new Date(mod.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8" }}>
                  Failed to load details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
