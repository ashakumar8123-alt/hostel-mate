import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client (for server actions)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceRoleKey);

// Supabase types
export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          full_name: string;
          mobile_number: string;
          email: string | null;
          room_number: string | null;
          hostel_block: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          product_name: string;
          category: string;
          description: string | null;
          product_image: string | null;
          icon: string | null;
          selling_price: number;
          purchase_price: number | null;
          stock_quantity: number;
          low_stock_threshold: number;
          sku: string | null;
          barcode: string | null;
          is_combo: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          student_id: string;
          subtotal: number;
          discount: number;
          tax: number;
          total_amount: number;
          payment_status: string;
          payment_mode: string | null;
          collected_by: string | null;
          delivery_status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          payment_mode: string;
          amount_paid: number;
          transaction_reference: string | null;
          collected_by: string | null;
          payment_status: string;
          created_at: string;
        };
      };
    };
  };
}
