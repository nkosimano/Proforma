import { supabase } from '../lib/supabase';
import type { Invoice, Quote } from '../types';

export const getInvoices = async (): Promise<Invoice[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {

    return [];
  }

  return data || [];
};

export const createInvoiceFromQuote = async (quote: Quote): Promise<Invoice | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get app settings for invoice numbering
  const { data: settings } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!settings) return null;

  const invoiceNumber = `${settings.invoice_prefix}${settings.next_invoice_number}`;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days from now

  const invoice = {
    invoice_number: invoiceNumber,
    quote_id: quote.id,
    client_details: {
      ...quote.client_details,
      user_id: user.id,
    },
    line_items: quote.line_items,
    totals: quote.totals,
    status: 'draft' as const,
    due_date: dueDate.toISOString(),
  };

  const { data, error } = await supabase
    .from('invoices')
    .insert([invoice])
    .select()
    .single();

  if (error) {

    return null;
  }

  // Update quote status to converted
  await supabase
    .from('quotes')
    .update({ status: 'converted' })
    .eq('id', quote.id);

  // Increment invoice number
  await supabase
    .from('app_settings')
    .update({
      next_invoice_number: settings.next_invoice_number + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  return data;
};

export const updateInvoiceStatus = async (id: string, status: Invoice['status'], paidDate?: string): Promise<boolean> => {
  const updateData: { status: Invoice['status']; updated_at: string; paid_date?: string } = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  if (status === 'paid' && paidDate) {
    updateData.paid_date = paidDate;
  }

  const { error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id);

  if (error) {

    return false;
  }

  return true;
};

export const updateQuoteStatus = async (id: string, status: Quote['status']): Promise<boolean> => {
  const { error } = await supabase
    .from('quotes')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {

    return false;
  }

  return true;
};