-- Complete schema for AI-powered order management system

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS conversation_history CASCADE;
DROP TABLE IF EXISTS order_modifications CASCADE;
DROP TABLE IF EXISTS call_logs CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS TABLE (Enhanced)
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_datetime TIMESTAMPTZ NOT NULL,
  language TEXT NOT NULL DEFAULT 'en-US',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'modified')),
  total_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDER ITEMS TABLE
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CART TABLE
CREATE TABLE cart (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 6. CALL LOGS TABLE (Smart Retry System)
CREATE TABLE call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  call_sid TEXT,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'completed', 'no-answer', 'busy', 'failed')),
  attempt_number INTEGER NOT NULL DEFAULT 1,
  retry_scheduled_at TIMESTAMPTZ,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER MODIFICATIONS TABLE (AI Context Tracking)
CREATE TABLE order_modifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  modification_type TEXT NOT NULL CHECK (modification_type IN ('delivery_time', 'address', 'items', 'other')),
  old_value TEXT,
  new_value TEXT,
  user_input TEXT,
  ai_response TEXT,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CONVERSATION HISTORY TABLE (Multi-turn tracking)
CREATE TABLE conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  call_sid TEXT,
  turn_number INTEGER NOT NULL,
  user_input TEXT,
  detected_language TEXT,
  ai_intent TEXT,
  ai_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample products
INSERT INTO products (name, description, price, image_url) VALUES
  ('Paneer Butter Masala', 'Creamy paneer curry', 250.00, 'https://via.placeholder.com/150'),
  ('Chicken Biryani', 'Aromatic rice with chicken', 300.00, 'https://via.placeholder.com/150'),
  ('Veg Fried Rice', 'Chinese style fried rice', 180.00, 'https://via.placeholder.com/150'),
  ('Masala Dosa', 'Crispy dosa with potato filling', 120.00, 'https://via.placeholder.com/150'),
  ('Gulab Jamun', 'Sweet dessert', 80.00, 'https://via.placeholder.com/150');

-- Create indexes for performance
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_call_logs_order_id ON call_logs(order_id);
CREATE INDEX idx_order_modifications_order_id ON order_modifications(order_id);
CREATE INDEX idx_conversation_history_order_id ON conversation_history(order_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_modifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- Create policies (Allow all for demo - adjust for production)
CREATE POLICY "Allow all operations" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON cart FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON call_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON order_modifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations" ON conversation_history FOR ALL USING (true) WITH CHECK (true);
