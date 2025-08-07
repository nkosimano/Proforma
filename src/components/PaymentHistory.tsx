import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import type { Payment } from '../types/database';
import { format } from 'date-fns';

interface PaymentHistoryProps {
  invoiceId?: string;
  showAllPayments?: boolean;
}

export default function PaymentHistory({ invoiceId, showAllPayments = false }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Payment[];
      if (showAllPayments) {
        data = await paymentService.getAllPayments();
      } else if (invoiceId) {
        data = await paymentService.getPaymentHistory(invoiceId);
      } else {
        data = [];
      }
      
      setPayments(data);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  }, [invoiceId, showAllPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'successful':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return paymentService.formatAmount(amount, currency);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No payments found
        </h3>
        <p className="text-gray-600">
          {invoiceId ? 'No payments have been made for this invoice.' : 'No payment history available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {showAllPayments ? 'All Payments' : 'Payment History'}
        </h3>
        <span className="text-sm text-gray-500">
          {payments.length} payment{payments.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payments.map((payment) => {
            const gatewayResponse = payment.gateway_response as {
              channel?: string;
              fees?: number;
              gateway_response?: string;
            } | null;
            
            return (
              <li key={payment.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStatusIcon(payment.status)}
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900">
                          {payment.payment_reference}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(payment.created_at), 'MMM dd, yyyy HH:mm')}
                        {payment.paid_at && (
                          <span className="ml-2">
                            • Paid: {format(new Date(payment.paid_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                      {gatewayResponse?.channel && (
                        <div className="mt-1 text-sm text-gray-500">
                          Payment method: {gatewayResponse.channel}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatAmount(payment.amount, payment.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      via {payment.gateway}
                    </p>
                    {gatewayResponse?.fees && (
                      <p className="text-xs text-gray-400">
                        Fees: {formatAmount(gatewayResponse.fees / 100, payment.currency)}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Additional payment details */}
                {payment.status === 'failed' && gatewayResponse?.gateway_response && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">
                      Failure reason: {gatewayResponse.gateway_response}
                    </p>
                  </div>
                )}
                
                {showAllPayments && 'invoices' in payment && payment.invoices && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      Invoice: #{(payment.invoices as { invoice_number: string }).invoice_number}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Summary for all payments */}
      {showAllPayments && payments.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Payments:</span>
              <p className="font-medium">{payments.length}</p>
            </div>
            <div>
              <span className="text-gray-500">Successful:</span>
              <p className="font-medium text-green-600">
                {payments.filter(p => p.status === 'successful').length}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Failed:</span>
              <p className="font-medium text-red-600">
                {payments.filter(p => p.status === 'failed').length}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>
              <p className="font-medium text-yellow-600">
                {payments.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}