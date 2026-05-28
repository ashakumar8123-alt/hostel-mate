import { supabase, supabaseServer } from './supabase';
import type { Student, Product, Invoice, InvoiceItem, Payment } from '@/types';

// ============================================
// STUDENT OPERATIONS
// ============================================
export async function getStudentByMobile(mobileNumber: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('mobile_number', mobileNumber)
    .single();

  if (error) return null;
  return data as Student;
}

export async function createStudent(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>): Promise<Student | null> {
  const { data, error } = await supabaseServer
    .from('students')
    .insert([student])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Student;
}

export async function getAllStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Student[];
}

// ============================================
// PRODUCT OPERATIONS
// ============================================
export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('product_name');

  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('product_name');

  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function getProductById(productId: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) return null;
  return data as Product;
}

export async function getLowStockProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .lte('stock_quantity', supabase.rpc('get_low_stock_threshold'))
    .eq('is_active', true)
    .order('stock_quantity');

  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function getOutOfStockProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('stock_quantity', 0)
    .eq('is_active', true)
    .order('product_name');

  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

// ============================================
// COMBO OPERATIONS
// ============================================
export async function getAllCombos() {
  const { data, error } = await supabase
    .from('combo_products')
    .select('*')
    .eq('is_active', true)
    .order('combo_price');

  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================
// INVOICE OPERATIONS
// ============================================
export async function createInvoice(invoice: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<Invoice> {
  const { data, error } = await supabaseServer
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

export async function getInvoiceById(invoiceId: string): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', invoiceId)
    .single();

  if (error) return null;
  return data as Invoice;
}

export async function getInvoicesByStudent(studentId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Invoice[];
}

export async function getAllInvoices(limit: number = 100, offset: number = 0): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return (data || []) as Invoice[];
}

export async function updateInvoiceStatus(invoiceId: string, paymentStatus: string, deliveryStatus: string): Promise<Invoice> {
  const { data, error } = await supabaseServer
    .from('invoices')
    .update({ payment_status: paymentStatus, delivery_status: deliveryStatus, updated_at: new Date().toISOString() })
    .eq('id', invoiceId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Invoice;
}

// ============================================
// INVOICE ITEMS OPERATIONS
// ============================================
export async function createInvoiceItems(items: InvoiceItem[]): Promise<InvoiceItem[]> {
  const { data, error } = await supabaseServer
    .from('invoice_items')
    .insert(items)
    .select();

  if (error) throw new Error(error.message);
  return (data || []) as InvoiceItem[];
}

export async function getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at');

  if (error) throw new Error(error.message);
  return (data || []) as InvoiceItem[];
}

// ============================================
// PAYMENT OPERATIONS
// ============================================
export async function createPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const { data, error } = await supabaseServer
    .from('payments')
    .insert([payment])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Payment;
}

export async function getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as Payment[];
}

export async function getAllPayments(limit: number = 100, offset: number = 0): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);
  return (data || []) as Payment[];
}

// ============================================
// INVENTORY OPERATIONS
// ============================================
export async function updateInventory(productId: string, quantityChange: number, action: string, createdBy: string): Promise<void> {
  const product = await getProductById(productId);
  if (!product) throw new Error('Product not found');

  const newStock = Math.max(0, product.stock_quantity + quantityChange);

  // Update product stock
  const { error: updateError } = await supabaseServer
    .from('products')
    .update({ stock_quantity: newStock, updated_at: new Date().toISOString() })
    .eq('id', productId);

  if (updateError) throw new Error(updateError.message);

  // Log inventory change
  const { error: logError } = await supabaseServer
    .from('inventory_logs')
    .insert([{
      product_id: productId,
      action_type: action,
      quantity_changed: quantityChange,
      previous_stock: product.stock_quantity,
      new_stock: newStock,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    }]);

  if (logError) throw new Error(logError.message);
}

export async function getInventoryLogs(productId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('inventory_logs')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}
