import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import ProductList from "./ProductList";
import Cart from "./Cart";
import MyOrders from "./MyOrders";

export default function UserPortal({ user }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("products");
  const [cartCount, setCartCount] = useState(0);

  const tabs = [
    { id: "products", label: t("products"), icon: "🛍️" },
    { id: "cart", label: t("cart"), icon: "🛒", badge: cartCount },
    { id: "orders", label: t("myOrders"), icon: "📦" }
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem" }}>
      {/* Tabs */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        marginBottom: "2rem",
        borderBottom: "2px solid #334155",
        paddingBottom: "1rem"
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px 8px 0 0",
              border: "none",
              cursor: "pointer",
              background: activeTab === tab.id ? "#7c3aed" : "#1e293b",
              color: "#fff",
              fontWeight: activeTab === tab.id ? 700 : 400,
              fontSize: "1rem",
              position: "relative",
              transition: "all 0.2s"
            }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span style={{
                position: "absolute",
                top: -8,
                right: -8,
                background: "#ef4444",
                color: "#fff",
                borderRadius: "50%",
                width: 24,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "products" && <ProductList userId={user.id} onCartUpdate={setCartCount} />}
      {activeTab === "cart" && <Cart userId={user.id} user={user} onCartUpdate={setCartCount} />}
      {activeTab === "orders" && <MyOrders userId={user.id} />}
    </div>
  );
}
