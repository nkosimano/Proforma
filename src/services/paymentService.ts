import { supabase } from '../lib/supabase';
import type { Payment, PaymentStatus } from '../types/database';

// Paystack configuration
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';
const PAYSTACK_SECRET_KEY = import.meta.env.VITE_PAYSTACK_SECRET_KEY || '';

export interface PaystackConfig {
  publicKey: string;
  secretKey: string;
  currency: string;
}

export interface PaymentRequest {
  invoiceId: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  reference?: string;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: {
    reference: string;
    status: string;
    amount: number;
    currency: string;
    paid_at?: string;
    channel?: string;
    fees?: number;
    customer?: {
      email: string;
      customer_code: string;
    };
  };
}

class PaymentService {
  private config: PaystackConfig;

  constructor() {
    this.config = {
      publicKey: PAYSTACK_PUBLIC_KEY,
      secretKey: PAYSTACK_SECRET_KEY,
      currency: 'ZAR'
    };
  }

  /**
   * Initialize Paystack payment
   */
  async initializePayment(paymentRequest: PaymentRequest): Promise<string> {
    const reference = paymentRequest.reference || this.generateReference();
    
    try {
      // Create payment record in database
      const { error } = await supabase
        .from('payments')
        .insert({
          invoice_id: paymentRequest.invoiceId,
          payment_reference: reference,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          status: 'pending',
          gateway: 'paystack'
        });

      if (error) {
        throw new Error(`Failed to create payment record: ${error.message}`);
      }

      return reference;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  /**
   * Process payment using Paystack Inline
   */
  async processPayment(paymentRequest: PaymentRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Load Paystack script if not already loaded
        if (!window.PaystackPop) {
          const script = document.createElement('script');
          script.src = 'https://js.paystack.co/v1/inline.js';
          script.onload = () => this.openPaystackModal(paymentRequest, resolve, reject);
          script.onerror = () => reject(new Error('Failed to load Paystack script'));
          document.head.appendChild(script);
        } else {
          this.openPaystackModal(paymentRequest, resolve, reject);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Open Paystack payment modal
   */
  private async openPaystackModal(
    paymentRequest: PaymentRequest,
    resolve: () => void,
    reject: (error: Error) => void
  ): Promise<void> {
    try {
      const reference = await this.initializePayment(paymentRequest);
      
      const handler = window.PaystackPop.setup({
        key: this.config.publicKey,
        email: paymentRequest.customerEmail,
        amount: paymentRequest.amount * 100, // Paystack expects amount in kobo
        currency: paymentRequest.currency,
        ref: reference,
        metadata: {
          invoice_id: paymentRequest.invoiceId,
          customer_name: paymentRequest.customerName
        },
        callback: async (response: { reference: string }) => {
          try {
            await this.verifyPayment(response.reference);
            resolve();
          } catch (error) {
            reject(error as Error);
          }
        },
        onClose: () => {
          reject(new Error('Payment cancelled by user'));
        }
      });

      handler.openIframe();
    } catch (error) {
      reject(error as Error);
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(reference: string): Promise<PaystackResponse> {
    try {
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json'
        }
      });

      const result: PaystackResponse = await response.json();

      if (!result.status) {
        throw new Error(result.message || 'Payment verification failed');
      }

      // Update payment record in database
      await this.updatePaymentStatus(reference, result);

      return result;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  /**
   * Update payment status in database
   */
  private async updatePaymentStatus(reference: string, paystackResponse: PaystackResponse): Promise<void> {
    try {
      const status: PaymentStatus = paystackResponse.data?.status === 'success' ? 'successful' : 'failed';
      const paidAt = paystackResponse.data?.paid_at ? new Date(paystackResponse.data.paid_at).toISOString() : null;

      const { error } = await supabase
        .from('payments')
        .update({
          status,
          gateway_response: paystackResponse.data,
          paid_at: paidAt
        })
        .eq('payment_reference', reference);

      if (error) {
        throw new Error(`Failed to update payment status: ${error.message}`);
      }

      // If payment is successful, update invoice status
      if (status === 'successful' && paystackResponse.data) {
        await this.updateInvoiceStatus(reference, paidAt);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Update invoice status when payment is successful
   */
  private async updateInvoiceStatus(reference: string, paidAt: string | null): Promise<void> {
    try {
      // Get payment record to find invoice ID
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('invoice_id')
        .eq('payment_reference', reference)
        .single();

      if (paymentError || !payment) {
        throw new Error('Payment record not found');
      }

      // Update invoice status to paid
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: paidAt
        })
        .eq('id', payment.invoice_id);

      if (invoiceError) {
        throw new Error(`Failed to update invoice status: ${invoiceError.message}`);
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  /**
   * Get payment history for an invoice
   */
  async getPaymentHistory(invoiceId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch payment history: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  /**
   * Get all payments for the current user
   */
  async getAllPayments(): Promise<Payment[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          invoices!inner(
            id,
            invoice_number,
            client_details
          )
        `)
        .eq('invoices.client_details->>user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch payments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  /**
   * Generate unique payment reference
   */
  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `PF_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = 'ZAR'): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  /**
   * Validate payment configuration
   */
  isConfigured(): boolean {
    return !!(this.config.publicKey && this.config.secretKey);
  }
}

// Global Paystack interface
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        metadata: Record<string, unknown>;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

export const paymentService = new PaymentService();
export default paymentService;