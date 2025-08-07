import React, { useState } from 'react';
import { X, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import { paymentService, type PaymentRequest } from '../services/paymentService';
import type { Invoice } from '../types/database';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, invoice, onPaymentSuccess }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    if (!paymentService.isConfigured()) {
      setError('Payment gateway is not configured. Please contact support.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Extract client details from invoice
      const clientDetails = invoice.client_details as { email?: string; name?: string };
      const totals = invoice.totals as { total?: number };

      const paymentRequest: PaymentRequest = {
        invoiceId: invoice.id,
        amount: totals.total || invoice.total,
        currency: invoice.currency,
        customerEmail: clientDetails.email || '',
        customerName: clientDetails.name || ''
      };

      await paymentService.processPayment(paymentRequest);
      
      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clientDetails = invoice.client_details as { email?: string; name?: string };
  const totals = invoice.totals as { total?: number };
  const amount = totals?.total || invoice.total;
  const formattedAmount = paymentService.formatAmount(amount, invoice.currency);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment for Invoice #{invoice.invoice_number}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h4>
              <p className="text-gray-600">
                Your payment has been processed successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Customer:</span>
                    <span className="font-medium">{clientDetails?.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{clientDetails?.email}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Invoice Number:</span>
                    <span className="font-medium">#{invoice.invoice_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Amount:</span>
                    <span className="text-lg font-bold text-blue-600">{formattedAmount}</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <CreditCard className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900 mb-1">
                        Secure Payment with Paystack
                      </h4>
                      <p className="text-sm text-blue-700">
                        Your payment will be processed securely through Paystack. 
                        You can pay with your card, bank transfer, or mobile money.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 mb-1">
                        Payment Error
                      </h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !paymentService.isConfigured()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ${formattedAmount}`
                  )}
                </button>
              </div>

              {!paymentService.isConfigured() && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Payment gateway configuration required
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}