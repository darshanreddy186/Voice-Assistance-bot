import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ProductList({ userId, onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCartCount();
  }, []);

  async function fetchProducts() {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
    setLoading(false);
  }

  async function fetchCartCount() {
    try {
      const res = await fetch(`${API}/cart/${userId}`);
      const data = await res.json();
      const count = data.cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      onCartUpdate(count);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }

  async function addToCart(productId) {
    setAddingToCart({ ...addingToCart, [productId]: true });

    try {
      const res = await fetch(`${API}/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, product_id: productId, quantity: 1 })
      });

      if (res.ok) {
        fetchCartCount();
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }

    setAddingToCart({ ...addingToCart, [productId]: false });
  }

  if (loading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading products...</div>;
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1.5rem", fontSize: "1.5rem", color: "#e2e8f0" }}>
        Available Products
      </h2>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
        gap: "1.5rem" 
      }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              background: "#1e293b",
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid #334155",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(124, 58, 237, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={{ 
              height: 180, 
              background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "3rem"
            }}>
              🍽️
            </div>

            <div style={{ padding: "1.25rem" }}>
              <h3 style={{ 
                fontSize: "1.1rem", 
                marginBottom: "0.5rem", 
                color: "#e2e8f0",
                fontWeight: 600
              }}>
                {product.name}
              </h3>

              <p style={{ 
                color: "#94a3b8", 
                fontSize: "0.85rem", 
                marginBottom: "1rem",
                minHeight: 40
              }}>
                {product.description || "Delicious food item"}
              </p>

              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center" 
              }}>
                <span style={{ 
                  fontSize: "1.3rem", 
                  fontWeight: 700, 
                  color: "#7c3aed" 
                }}>
                  ₹{product.price}
                </span>

                <button
                  onClick={() => addToCart(product.id)}
                  disabled={addingToCart[product.id]}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: 6,
                    border: "none",
                    background: "#059669",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    opacity: addingToCart[product.id] ? 0.6 : 1
                  }}
                >
                  {addingToCart[product.id] ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
