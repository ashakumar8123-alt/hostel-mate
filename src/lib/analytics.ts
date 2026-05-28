import { supabase } from './supabase';
import type { Invoice, Product, Payment } from '@/types';

// ============================================
// REVENUE ANALYTICS
// ============================================
export async function calculateTotalRevenue(): Promise<number> {
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('payment_status', 'completed');

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
}

export async function calculateTodayRevenue(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('payment_status', 'completed')
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`);

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
}

export async function calculateWeeklyRevenue(): Promise<number> {
  const today = new Date();
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('payment_status', 'completed')
    .gte('created_at', `${sevenDaysAgo}T00:00:00`);

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
}

export async function calculateMonthlyRevenue(): Promise<number> {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];

  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('payment_status', 'completed')
    .gte('created_at', `${firstDayOfMonth}T00:00:00`);

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
}

// ============================================
// SALES TRENDS
// ============================================
export interface SalesDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export async function getSalesTrend(days: number = 30): Promise<SalesDataPoint[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount, created_at')
    .eq('payment_status', 'completed')
    .gte('created_at', `${startDateStr}T00:00:00`);

  if (error) throw new Error(error.message);

  // Group by date
  const grouped = new Map<string, { revenue: number; orders: number }>();
  (data || []).forEach((inv: any) => {
    const date = inv.created_at.split('T')[0];
    if (!grouped.has(date)) {
      grouped.set(date, { revenue: 0, orders: 0 });
    }
    const current = grouped.get(date)!;
    current.revenue += inv.total_amount;
    current.orders += 1;
  });

  return Array.from(grouped.entries())
    .map(([date, { revenue, orders }]) => ({
      date,
      revenue: Math.round(revenue * 100) / 100,
      orders,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// ============================================
// TOP SELLING PRODUCTS
// ============================================
export interface TopProduct {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

export async function getTopSellingProducts(limit: number = 10): Promise<TopProduct[]> {
  const { data, error } = await supabase
    .from('invoice_items')
    .select('product_id, quantity, unit_price');

  if (error) throw new Error(error.message);

  // Fetch product names
  const productIds = [...new Set((data || []).map((item: any) => item.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, product_name')
    .in('id', productIds);

  const productMap = new Map(
    (products || []).map((p: any) => [p.id, p.product_name])
  );

  // Group and aggregate
  const grouped = new Map<string, { quantity: number; revenue: number }>();
  (data || []).forEach((item: any) => {
    const key = item.product_id;
    if (!grouped.has(key)) {
      grouped.set(key, { quantity: 0, revenue: 0 });
    }
    const current = grouped.get(key)!;
    current.quantity += item.quantity;
    current.revenue += item.unit_price * item.quantity;
  });

  return Array.from(grouped.entries())
    .map(([productId, { quantity, revenue }]) => ({
      product_id: productId,
      product_name: productMap.get(productId) || 'Unknown',
      quantity_sold: quantity,
      revenue: Math.round(revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// ============================================
// INVENTORY ANALYTICS
// ============================================
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
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return (data || []) as Product[];
}

export async function getInventoryValue(): Promise<number> {
  const { data, error } = await supabase
    .from('products')
    .select('stock_quantity, selling_price');

  if (error) throw new Error(error.message);
  return (data || []).reduce(
    (sum, p: any) => sum + p.stock_quantity * p.selling_price,
    0
  );
}

export interface DeadStockAnalysis {
  product_id: string;
  product_name: string;
  stock_quantity: number;
  selling_price: number;
  locked_value: number;
  days_without_sale: number;
}

export async function getDeadStockAnalysis(): Promise<DeadStockAnalysis[]> {
  const { data: products } = await supabase
    .from('products')
    .select('id, product_name, stock_quantity, selling_price')
    .gt('stock_quantity', 0);

  const { data: salesData } = await supabase
    .from('invoice_items')
    .select('product_id, created_at');

  const lastSaleMap = new Map<string, string>();
  (salesData || []).forEach((item: any) => {
    if (
      !lastSaleMap.has(item.product_id) ||
      item.created_at > lastSaleMap.get(item.product_id)
    ) {
      lastSaleMap.set(item.product_id, item.created_at);
    }
  });

  const today = new Date();
  return (products || [])
    .filter((p: any) => !lastSaleMap.has(p.id))
    .map((p: any) => ({
      product_id: p.id,
      product_name: p.product_name,
      stock_quantity: p.stock_quantity,
      selling_price: p.selling_price,
      locked_value: p.stock_quantity * p.selling_price,
      days_without_sale: 999,
    }))
    .sort((a, b) => b.locked_value - a.locked_value);
}

// ============================================
// PAYMENT ANALYTICS
// ============================================
export interface PaymentModeBreakdown {
  payment_mode: string;
  count: number;
  amount: number;
  percentage: number;
}

export async function getPaymentModeBreakdown(): Promise<PaymentModeBreakdown[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('payment_mode, amount_paid');

  if (error) throw new Error(error.message);

  const totalAmount = (data || []).reduce((sum, p: any) => sum + p.amount_paid, 0);

  const grouped = new Map<string, { count: number; amount: number }>();
  (data || []).forEach((p: any) => {
    const mode = p.payment_mode || 'unknown';
    if (!grouped.has(mode)) {
      grouped.set(mode, { count: 0, amount: 0 });
    }
    const current = grouped.get(mode)!;
    current.count += 1;
    current.amount += p.amount_paid;
  });

  return Array.from(grouped.entries())
    .map(([mode, { count, amount }]) => ({
      payment_mode: mode,
      count,
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round((amount / totalAmount) * 100 * 100) / 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export async function getPendingPaymentAmount(): Promise<number> {
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('payment_status', 'pending');

  if (error) throw new Error(error.message);
  return (data || []).reduce((sum, inv) => sum + inv.total_amount, 0);
}

// ============================================
// STAFF ANALYTICS
// ============================================
export interface StaffMetrics {
  staff_name: string;
  total_collected: number;
  order_count: number;
  percentage: number;
}

export async function getStaffCollectionAnalytics(): Promise<StaffMetrics[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('collected_by, amount_paid');

  if (error) throw new Error(error.message);

  const totalAmount = (data || []).reduce((sum, p: any) => sum + p.amount_paid, 0);

  const grouped = new Map<string, { amount: number; count: number }>();
  (data || []).forEach((p: any) => {
    const staff = p.collected_by || 'unknown';
    if (!grouped.has(staff)) {
      grouped.set(staff, { amount: 0, count: 0 });
    }
    const current = grouped.get(staff)!;
    current.amount += p.amount_paid;
    current.count += 1;
  });

  return Array.from(grouped.entries())
    .map(([staff, { amount, count }]) => ({
      staff_name: staff,
      total_collected: Math.round(amount * 100) / 100,
      order_count: count,
      percentage: Math.round((amount / totalAmount) * 100 * 100) / 100,
    }))
    .sort((a, b) => b.total_collected - a.total_collected);
}

// ============================================
// CATEGORY ANALYTICS
// ============================================
export interface CategoryMetrics {
  category: string;
  revenue: number;
  quantity_sold: number;
  percentage: number;
}

export async function getCategoryRevenue(): Promise<CategoryMetrics[]> {
  const { data: items, error } = await supabase
    .from('invoice_items')
    .select('product_id, quantity, unit_price');

  if (error) throw new Error(error.message);

  const productIds = [...new Set((items || []).map((i: any) => i.product_id))];
  const { data: products } = await supabase
    .from('products')
    .select('id, category')
    .in('id', productIds);

  const productCategoryMap = new Map((products || []).map((p: any) => [p.id, p.category]));

  const grouped = new Map<string, { revenue: number; quantity: number }>();
  (items || []).forEach((item: any) => {
    const category = productCategoryMap.get(item.product_id) || 'unknown';
    if (!grouped.has(category)) {
      grouped.set(category, { revenue: 0, quantity: 0 });
    }
    const current = grouped.get(category)!;
    current.revenue += item.unit_price * item.quantity;
    current.quantity += item.quantity;
  });

  const totalRevenue = Array.from(grouped.values()).reduce((sum, c) => sum + c.revenue, 0);

  return Array.from(grouped.entries())
    .map(([category, { revenue, quantity }]) => ({
      category,
      revenue: Math.round(revenue * 100) / 100,
      quantity_sold: quantity,
      percentage: Math.round((revenue / totalRevenue) * 100 * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue);
}

// ============================================
// INVOICE STATISTICS
// ============================================
export interface InvoiceStats {
  total_invoices: number;
  completed: number;
  pending: number;
  partial: number;
  average_invoice_value: number;
}

export async function getInvoiceStatistics(): Promise<InvoiceStats> {
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount, payment_status');

  if (error) throw new Error(error.message);

  const invoices = (data || []) as any[];
  const total = invoices.length;
  const completed = invoices.filter((i) => i.payment_status === 'completed').length;
  const pending = invoices.filter((i) => i.payment_status === 'pending').length;
  const partial = invoices.filter((i) => i.payment_status === 'partial').length;
  const avgValue =
    total > 0
      ? invoices.reduce((sum, i) => sum + i.total_amount, 0) / total
      : 0;

  return {
    total_invoices: total,
    completed,
    pending,
    partial,
    average_invoice_value: Math.round(avgValue * 100) / 100,
  };
}

// ============================================
// REALTIME KPI GENERATOR
// ============================================
export interface DashboardKPI {
  total_revenue: number;
  today_sales: number;
  total_orders: number;
  low_stock_count: number;
  out_of_stock_count: number;
  pending_payments: number;
  inventory_value: number;
  average_order_value: number;
}

export async function generateDashboardKPI(): Promise<DashboardKPI> {
  const [
    totalRevenue,
    todayRevenue,
    stats,
    lowStock,
    outOfStock,
    pendingAmount,
    inventoryValue,
  ] = await Promise.all([
    calculateTotalRevenue(),
    calculateTodayRevenue(),
    getInvoiceStatistics(),
    getLowStockProducts(),
    getOutOfStockProducts(),
    getPendingPaymentAmount(),
    getInventoryValue(),
  ]);

  return {
    total_revenue: Math.round(totalRevenue * 100) / 100,
    today_sales: Math.round(todayRevenue * 100) / 100,
    total_orders: stats.total_invoices,
    low_stock_count: lowStock.length,
    out_of_stock_count: outOfStock.length,
    pending_payments: Math.round(pendingAmount * 100) / 100,
    inventory_value: Math.round(inventoryValue * 100) / 100,
    average_order_value: stats.average_invoice_value,
  };
}

// ============================================
// CHART DATA TRANSFORMERS
// ============================================
export async function getRevenueChartData() {
  const trends = await getSalesTrend(30);
  return trends.map((point) => ({
    name: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    Revenue: point.revenue,
    Orders: point.orders,
  }));
}

export async function getTopProductsChartData() {
  const topProducts = await getTopSellingProducts(5);
  return topProducts.map((p) => ({
    name: p.product_name,
    'Revenue': p.revenue,
    'Quantity': p.quantity_sold,
  }));
}

export async function getPaymentModeChartData() {
  const breakdown = await getPaymentModeBreakdown();
  return breakdown.map((m) => ({
    name: m.payment_mode,
    value: m.amount,
    percentage: m.percentage,
  }));
}

export async function getCategoryChartData() {
  const categories = await getCategoryRevenue();
  return categories.map((c) => ({
    name: c.category,
    value: c.revenue,
    quantity: c.quantity_sold,
  }));
}

export async function getStaffChartData() {
  const staff = await getStaffCollectionAnalytics();
  return staff.map((s) => ({
    name: s.staff_name,
    'Amount Collected': s.total_collected,
    'Orders': s.order_count,
  }));
}
