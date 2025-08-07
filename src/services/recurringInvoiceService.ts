import { supabase } from '../lib/supabase';
import type { RecurringInvoice, Invoice } from '../types/database';
import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

export interface CreateRecurringInvoiceRequest {
  customer_id: string;
  template_invoice_id: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  interval_count: number;
  start_date: string;
  end_date?: string;
  max_occurrences?: number;
  is_active: boolean;
  next_generation_date: string;
}

export interface RecurringInvoiceWithDetails extends RecurringInvoice {
  customers?: {
    name: string;
    email: string;
  };
  template_invoice?: {
    invoice_number: string;
    totals: {
      subtotal: number;
      vat: number;
      total: number;
    };
  };
}

class RecurringInvoiceService {
  /**
   * Create a new recurring invoice
   */
  async createRecurringInvoice(data: CreateRecurringInvoiceRequest): Promise<RecurringInvoice | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: recurringInvoice, error } = await supabase
        .from('recurring_invoices')
        .insert({
          ...data,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating recurring invoice:', error);
        throw error;
      }

      return recurringInvoice;
    } catch (error) {
      console.error('Error in createRecurringInvoice:', error);
      return null;
    }
  }

  /**
   * Get all recurring invoices for the current user
   */
  async getRecurringInvoices(): Promise<RecurringInvoiceWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_invoices')
        .select(`
          *,
          customers (
            name,
            email
          ),
          template_invoice:invoices!template_invoice_id (
            invoice_number,
            totals
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching recurring invoices:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecurringInvoices:', error);
      return [];
    }
  }

  /**
   * Get a specific recurring invoice by ID
   */
  async getRecurringInvoice(id: string): Promise<RecurringInvoiceWithDetails | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('recurring_invoices')
        .select(`
          *,
          customers (
            name,
            email
          ),
          template_invoice:invoices!template_invoice_id (
            invoice_number,
            totals,
            line_items,
            client_details
          )
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching recurring invoice:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in getRecurringInvoice:', error);
      return null;
    }
  }

  /**
   * Update a recurring invoice
   */
  async updateRecurringInvoice(id: string, updates: Partial<RecurringInvoice>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('recurring_invoices')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating recurring invoice:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateRecurringInvoice:', error);
      return false;
    }
  }

  /**
   * Delete a recurring invoice
   */
  async deleteRecurringInvoice(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('recurring_invoices')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting recurring invoice:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteRecurringInvoice:', error);
      return false;
    }
  }

  /**
   * Toggle active status of a recurring invoice
   */
  async toggleRecurringInvoice(id: string, isActive: boolean): Promise<boolean> {
    return this.updateRecurringInvoice(id, { is_active: isActive });
  }

  /**
   * Generate the next invoice for a recurring invoice
   */
  async generateNextInvoice(recurringId: string): Promise<Invoice | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call the database function to generate the recurring invoice
      const { data, error } = await supabase
        .rpc('generate_recurring_invoice', {
          recurring_id: recurringId
        });

      if (error) {
        console.error('Error generating recurring invoice:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in generateNextInvoice:', error);
      return null;
    }
  }

  /**
   * Calculate the next generation date based on frequency and interval
   */
  calculateNextDate(
    currentDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly',
    intervalCount: number = 1
  ): Date {
    switch (frequency) {
      case 'daily':
        return addDays(currentDate, intervalCount);
      case 'weekly':
        return addWeeks(currentDate, intervalCount);
      case 'monthly':
        return addMonths(currentDate, intervalCount);
      case 'quarterly':
        return addMonths(currentDate, intervalCount * 3);
      case 'yearly':
        return addYears(currentDate, intervalCount);
      default:
        return addMonths(currentDate, intervalCount);
    }
  }

  /**
   * Get recurring invoices that are due for generation
   */
  async getDueRecurringInvoices(): Promise<RecurringInvoiceWithDetails[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('recurring_invoices')
        .select(`
          *,
          customers (
            name,
            email
          ),
          template_invoice:invoices!template_invoice_id (
            invoice_number,
            totals
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .lte('next_generation_date', today)
        .order('next_generation_date', { ascending: true });

      if (error) {
        console.error('Error fetching due recurring invoices:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getDueRecurringInvoices:', error);
      return [];
    }
  }

  /**
   * Process all due recurring invoices
   */
  async processDueInvoices(): Promise<{ generated: number; errors: string[] }> {
    const result = { generated: 0, errors: [] as string[] };

    try {
      const dueInvoices = await this.getDueRecurringInvoices();

      for (const recurringInvoice of dueInvoices) {
        try {
          // Check if we've reached max occurrences
          if (recurringInvoice.max_occurrences && 
              recurringInvoice.generated_count >= recurringInvoice.max_occurrences) {
            // Deactivate the recurring invoice
            await this.toggleRecurringInvoice(recurringInvoice.id, false);
            continue;
          }

          // Check if we've passed the end date
          if (recurringInvoice.end_date && 
              new Date() > new Date(recurringInvoice.end_date)) {
            // Deactivate the recurring invoice
            await this.toggleRecurringInvoice(recurringInvoice.id, false);
            continue;
          }

          // Generate the invoice
          const newInvoice = await this.generateNextInvoice(recurringInvoice.id);
          
          if (newInvoice) {
            // Calculate next generation date
            const nextDate = this.calculateNextDate(
              new Date(recurringInvoice.next_generation_date),
              recurringInvoice.frequency,
              recurringInvoice.interval_count
            );

            // Update the recurring invoice
            await this.updateRecurringInvoice(recurringInvoice.id, {
              next_generation_date: format(nextDate, 'yyyy-MM-dd'),
              generated_count: recurringInvoice.generated_count + 1,
              last_generated_at: new Date().toISOString()
            });

            result.generated++;
          } else {
            result.errors.push(`Failed to generate invoice for recurring invoice ${recurringInvoice.id}`);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error processing recurring invoice ${recurringInvoice.id}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Error processing due invoices: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Get frequency display text
   */
  getFrequencyText(frequency: string, intervalCount: number): string {
    const interval = intervalCount > 1 ? `Every ${intervalCount} ` : '';
    
    switch (frequency) {
      case 'daily':
        return intervalCount === 1 ? 'Daily' : `${interval}days`;
      case 'weekly':
        return intervalCount === 1 ? 'Weekly' : `${interval}weeks`;
      case 'monthly':
        return intervalCount === 1 ? 'Monthly' : `${interval}months`;
      case 'quarterly':
        return intervalCount === 1 ? 'Quarterly' : `${interval}quarters`;
      case 'yearly':
        return intervalCount === 1 ? 'Yearly' : `${interval}years`;
      default:
        return 'Unknown';
    }
  }

  /**
   * Format amount with currency
   */
  formatAmount(amount: number, currency: string = 'ZAR'): string {
    const formatter = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount / 100); // Assuming amounts are stored in cents
  }
}

export const recurringInvoiceService = new RecurringInvoiceService();
export default recurringInvoiceService;