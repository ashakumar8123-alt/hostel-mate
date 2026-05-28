// ============================================
// CART CALCULATIONS
// ============================================
export interface CartCalculation {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export function calculateCartTotals(
  subtotal: number,
  discountPercentage: number = 0,
  taxPercentage: number = 0
): CartCalculation {
  const discountAmount = (subtotal * discountPercentage) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxAmount = (subtotalAfterDiscount * taxPercentage) / 100;
  const total = subtotalAfterDiscount + taxAmount;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discountAmount * 100) / 100,
    tax: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

export function calculateItemTotal(price: number, quantity: number): number {
  return Math.round(price * quantity * 100) / 100;
}

// ============================================
// INVOICE GENERATION
// ============================================
export function generateInvoiceNumber(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `INV-${timestamp}-${random}`.substring(0, 20);
}

export interface InvoiceData {
  invoiceNumber: string;
  studentName: string;
  studentMobile: string;
  roomNumber?: string;
  hostelBlock?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: string;
  paymentStatus: string;
  collectedBy?: string;
  deliveryStatus: string;
  createdAt: string;
}

export function formatInvoiceHTML(data: InvoiceData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${item.total.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 3px solid #556B2F; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { margin: 0; color: #556B2F; }
        .invoice-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .meta-section { background: #F5F1ED; padding: 12px; border-radius: 8px; }
        .meta-label { font-weight: bold; color: #556B2F; font-size: 12px; }
        .meta-value { margin-top: 4px; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table-header { background: #556B2F; color: white; padding: 10px; }
        .totals { display: grid; grid-template-columns: 1fr auto; gap: 20px; margin-bottom: 20px; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e0e0e0; }
        .total-amount { font-size: 18px; font-weight: bold; color: #556B2F; border-top: 2px solid #556B2F; padding-top: 10px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏠 HOSTEL MATE</h1>
          <p style="margin: 5px 0; color: #666;">Premium Hostel Billing & Inventory</p>
        </div>
        
        <div class="invoice-meta">
          <div class="meta-section">
            <div class="meta-label">STUDENT DETAILS</div>
            <div class="meta-value"><strong>${data.studentName}</strong></div>
            <div class="meta-value">📱 ${data.studentMobile}</div>
            <div class="meta-value">Room: ${data.roomNumber || 'N/A'}</div>
            <div class="meta-value">Block: ${data.hostelBlock || 'N/A'}</div>
          </div>
          <div class="meta-section">
            <div class="meta-label">INVOICE INFO</div>
            <div class="meta-value"><strong>${data.invoiceNumber}</strong></div>
            <div class="meta-value">📅 ${new Date(data.createdAt).toLocaleDateString()}</div>
            <div class="meta-value">⏰ ${new Date(data.createdAt).toLocaleTimeString()}</div>
          </div>
        </div>

        <table>
          <thead style="background: #556B2F; color: white;">
            <tr>
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div class="totals">
          <div>
            <div class="total-row">
              <span>Subtotal:</span>
              <span>₹${data.subtotal.toFixed(2)}</span>
            </div>
            ${data.discount > 0 ? `
            <div class="total-row">
              <span>Discount:</span>
              <span>-₹${data.discount.toFixed(2)}</span>
            </div>
            ` : ''}
            ${data.tax > 0 ? `
            <div class="total-row">
              <span>Tax:</span>
              <span>₹${data.tax.toFixed(2)}</span>
            </div>
            ` : ''}
          </div>
          <div class="total-amount">
            <div style="text-align: right;">₹${data.total.toFixed(2)}</div>
          </div>
        </div>

        <div style="background: #F5F1ED; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <div class="total-row" style="border: none;">
            <span>Payment Mode:</span>
            <strong>${data.paymentMode}</strong>
          </div>
          <div class="total-row" style="border: none;">
            <span>Payment Status:</span>
            <strong>${data.paymentStatus}</strong>
          </div>
          <div class="total-row" style="border: none;">
            <span>Delivery Status:</span>
            <strong>${data.deliveryStatus}</strong>
          </div>
          ${data.collectedBy ? `
          <div class="total-row" style="border: none;">
            <span>Collected By:</span>
            <strong>${data.collectedBy}</strong>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p>For support, contact: hostelmate26@gmail.com</p>
          <p style="margin-top: 10px;">© 2026 HOSTEL MATE. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// PAYMENT PROCESSING
// ============================================
export type PaymentMode = 'cash' | 'online' | 'split';

export const STAFF_MEMBERS = [
  'THRIBHU',
  'AKSHITHA',
  'ADARSH',
  'ASHWIN',
  'NANDHAN',
];

export function validatePaymentAmount(amount: number, invoiceTotal: number): boolean {
  return amount > 0 && amount <= invoiceTotal;
}

export function calculatePendingAmount(invoiceTotal: number, paidAmount: number): number {
  const pending = invoiceTotal - paidAmount;
  return Math.max(0, Math.round(pending * 100) / 100);
}

// ============================================
// DELIVERY TRACKING
// ============================================
export type DeliveryStatus = 'pending' | 'delivered' | 'partially_delivered';

export interface DeliveryItem {
  product_id: string;
  product_name: string;
  quantity: number;
  delivered: number;
}

export function calculateDeliveryProgress(items: DeliveryItem[]): number {
  if (items.length === 0) return 0;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveredQuantity = items.reduce((sum, item) => sum + item.delivered, 0);
  return Math.round((deliveredQuantity / totalQuantity) * 100);
}

export function getPendingDeliveryItems(items: DeliveryItem[]): DeliveryItem[] {
  return items.filter((item) => item.delivered < item.quantity);
}
