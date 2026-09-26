-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'CUSTOMER',
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  cuisine TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  rating FLOAT DEFAULT 4.6,
  is_open BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true,
  commission_rate FLOAT DEFAULT 15.0,
  image_url TEXT,
  opening_hours TEXT DEFAULT '10:00 AM - 10:00 PM',
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Delivery Partners table
CREATE TABLE IF NOT EXISTS delivery_partners (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_number TEXT,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT NOT NULL,
  category TEXT DEFAULT 'Main',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'PENDING',
  subtotal FLOAT NOT NULL,
  delivery_fee FLOAT DEFAULT 3.99,
  tax FLOAT DEFAULT 2.50,
  total FLOAT NOT NULL,
  commission_rate FLOAT DEFAULT 15.0,
  commission_amount FLOAT DEFAULT 0.0,
  vendor_earnings FLOAT DEFAULT 0.0,
  delivery_address TEXT NOT NULL,
  customer_phone TEXT,
  notes TEXT,
  delivery_partner_id INTEGER REFERENCES delivery_partners(id) ON DELETE SET NULL,
  delivery_partner_name TEXT,
  delivery_partner_phone TEXT,
  delivery_partner_vehicle TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER REFERENCES menu_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  price FLOAT NOT NULL,
  quantity INTEGER NOT NULL
);

-- Create Platform Settings table
CREATE TABLE IF NOT EXISTS platform_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_restaurants_owner ON restaurants(owner_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);