import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Cart({ userId, user, onCartUpdate }) {
  const { language, t } = useLanguage();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCart();
    
    // Set default delivery to tomorrow 6 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 0, 0, 0);
    
    setDeliveryDate(tomorrow.toISOString().split('T')[0]);
    setDeliveryTime("18:00");
  }, []);

  async function fetchCart() {
    try {
      const res = await fetch(`${API}/cart/${userId}`);
      const data = await res.json();
      setCart(data.cart || []);
      onCartUpdate(data.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
    setLoading(false);
  }

  async function removeItem(productId) {
    try {
      await fetch(`${API}/cart/${userId}/${productId}`, { method: "DELETE" });
      fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  }

  async function placeOrder() {
    if (!deliveryDate || !deliveryTime) {
      setStatus({ type: "error", msg: "Please select delivery date and time" });
      return;
    }

    setPlacing(true);
    setStatus(null);

    try {
      const deliveryDatetime = `${deliveryDate}T${deliveryTime}:00Z`;
      
      const res = await fetch(`${API}/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          delivery_datetime: deliveryDatetime,
          language: language  // Use global language
        })
      });

      const data = await res.json();

      if (data.success) {
        setStatus({ 
          type: "success", 
          msg: t("orderPlacedMsg")

        });
        setTimeout(() => {
          fetchCart();
          setStatus(null);
        }, 3000);
      } else {
        setStatus({ type: "error", msg: data.detail || "Failed to place order" });
      }
    } catch (err) {
      setStatus({ type: "error", msg: "Server error" });
    }

    setPlacing(false);
  }

  const total = cart.reduce((sum, item) => sum + (item.quantity * item.products.price), 0);

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading cart...</div>;
  }

  if (cart.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "4rem", 
        background: "#1e293b", 
        borderRadius: 12 
      }}>
        <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🛒</div>
        <h3 style={{ color: "#e2e8f0", marginBottom: "0.5rem" }}>{t("cartEmpty")}</h3>
        <p style={{ color: "#94a3b8" }}>{t("cartEmptyMsg")}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", color: "#e2e8f0" }}>
        {t("yourCart")} ({cart.length} {t("items")})
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        {/* Cart Items */}
        <div>
          {cart.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#1e293b",
                borderRadius: 12,
                padding: "1.25rem",
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                border: "1px solid #334155"
              }}
            >
              <div style={{ flex: 1 }}>
                <h4 style={{ color: "#e2e8f0", marginBottom: "0.25rem", fontSize: "1.1rem" }}>
                  {item.products.name}
                </h4>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                  {t("quantity")}: {item.quantity} × ₹{item.products.price}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#7c3aed" }}>
                  ₹{item.quantity * item.products.price}
                </span>
                <button
                  onClick={() => removeItem(item.product_id)}
                  style={{
                    padding: "0.5rem 0.75rem",
                    borderRadius: 6,
                    border: "none",
                    background: "#ef4444",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  {t("remove")}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ 
            background: "#1e293b", 
            borderRadius: 12, 
            padding: "1.5rem",
            border: "1px solid #334155",
            position: "sticky",
            top: 20
          }}>
            <h3 style={{ color: "#e2e8f0", marginBottom: "1.5rem", fontSize: "1.2rem" }}>
              {t("orderSummary")}
            </h3>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                {t("deliveryDate")}
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: 6,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: "0.9rem"
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                {t("deliveryTime")}
              </label>
              <input
                type="time"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem",
                  borderRadius: 6,
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  fontSize: "0.9rem"
                }}
              />
            </div>

            <div style={{ 
              borderTop: "1px solid #334155", 
              paddingTop: "1rem", 
              marginBottom: "1.5rem" 
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>{t("subtotal")}</span>
                <span style={{ color: "#e2e8f0" }}>₹{total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "#94a3b8" }}>{t("delivery")}</span>
                <span style={{ color: "#059669" }}>{t("free")}</span>
              </div>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#7c3aed",
                marginTop: "1rem"
              }}>
                <span>{t("total")}</span>
                <span>₹{total}</span>
              </div>
            </div>

            {status && (
              <div style={{
                padding: "0.75rem",
                borderRadius: 8,
                marginBottom: "1rem",
                background: status.type === "success" ? "#14532d" : "#7f1d1d",
                color: "#fff",
                fontSize: "0.85rem",
                textAlign: "center"
              }}>
                {status.msg}
              </div>
            )}

            <button
              onClick={placeOrder}
              disabled={placing}
              style={{
                width: "100%",
                padding: "0.85rem",
                borderRadius: 8,
                border: "none",
                background: "#7c3aed",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              {placing ? t("placingOrder") : `🚀 ${t("placeOrder")}`}
            </button>

            <p style={{ 
              color: "#94a3b8", 
              fontSize: "0.75rem", 
              textAlign: "center", 
              marginTop: "1rem" 
            }}>
              📞 {t("callNote")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
