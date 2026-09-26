// Supabase Configuration for Spicy Route App
const SUPABASE_CONFIG = {
  url: 'https://dcfheymzuqlhljulusmz.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjZmhleW16dXFsaGxqdWx1c216Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzYzNjUsImV4cCI6MjEwNTU1MjM2NX0.zPxgyNavoNHKFuVXh3DZvvjNT1eOD7jiTQ4o5KIHDDw'
};

// Database table names
const TABLES = {
  USERS: 'users',
  RESTAURANTS: 'restaurants',
  MENU_ITEMS: 'menu_items',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  DELIVERY_PARTNERS: 'delivery_partners',
  PLATFORM_SETTINGS: 'platform_settings'
};

// User roles
const ROLES = {
  CUSTOMER: 'CUSTOMER',
  VENDOR: 'VENDOR',
  ADMIN: 'ADMIN',
  DELIVERY_PARTNER: 'DELIVERY_PARTNER'
};

// Order statuses
const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  PICKED_UP: 'PICKED_UP',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

export { SUPABASE_CONFIG, TABLES, ROLES, ORDER_STATUS };