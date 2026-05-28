// ============================================
// Auth Types
// ============================================
export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

// ============================================
// Student Types
// ============================================
export interface Student {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  room_number?: string;
  hostel_block?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Product Types
// ============================================
export interface Product {
  id: string;
  product_name: string;
  category: string;
  description?: string;
  product_image?: string;
  icon?: string;
  selling_price: number;
  purchase_price?: number;
  stock_quantity: number;
  low_stock_threshold: number;
  sku?: string;
  barcode?: string;
  is_combo: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComboProduct {
  id: string;
  combo_name: string;
  combo_price: number;
  combo_description?: string;
  combo_image?: string;
  included_products: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// Cart Types
// ============================================
export interface CartItem {
  product_id: string;
  product_name: string;
  selling_price: number;
  quantity: number;
  total_price: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

// ============================================
// Invoice Types
// ============================================
export interface Invoice {
  id: string;
  invoice_number: string;
  student_id: string;
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'partial';
  payment_mode?: string;
  collected_by?: string;
  delivery_status: 'pending' | 'delivered' | 'partially_delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
  student?: Student;
}

// ============================================
// Payment Types
// ============================================
export interface Payment {
  id: string;
  invoice_id: string;
  payment_mode: 'cash' | 'online' | 'split';
  amount_paid: number;
  transaction_reference?: string;
  collected_by?: string;
  payment_status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

// ============================================
// Inventory Types
// ============================================
export interface InventoryLog {
  id: string;
  product_id: string;
  action_type: 'purchase' | 'sale' | 'return' | 'adjustment';
  quantity_changed: number;
  previous_stock: number;
  new_stock: number;
  created_by: string;
  created_at: string;
}

// ============================================
// Analytics Types
// ============================================
export interface SalesMetrics {
  total_revenue: number;
  today_sales: number;
  weekly_sales: number;
  monthly_revenue: number;
  pending_payments: number;
  total_orders: number;
  inventory_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export interface StaffMetrics {
  staff_name: string;
  total_collected: number;
  order_count: number;
  percentage: number;
}
