import { Tables, TablesInsert, TablesUpdate } from './database';

// Database types from Supabase
export type Customer = Tables<'customers'>;
export type CustomerInsert = TablesInsert<'customers'>;
export type CustomerUpdate = TablesUpdate<'customers'>;

export type Quote = Tables<'quotes'>;
export type QuoteInsert = TablesInsert<'quotes'>;
export type QuoteUpdate = TablesUpdate<'quotes'>;

export type Invoice = Tables<'invoices'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;

// Application-specific types
export interface CompanyProfile {
  id: string;
  company_name: string;
  address: string;
  email: string;
  phone?: string;
  logo_url?: string;
  company_registration_number?: string;
  tax_number?: string;
  user_id: string;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface ClientDetails {
  name: string;
  address: string;
  email: string;
  comments?: string;
  user_id: string;
}

export interface QuoteTotals {
  subtotal: number;
  vat: number;
  total: number;
}

export interface AppSettings {
  id: number;
  quote_prefix: string;
  next_quote_number: number;
  invoice_prefix: string;
  next_invoice_number: number;
  terms_and_conditions: string;
  pdf_template: string;
  user_id: string;
}