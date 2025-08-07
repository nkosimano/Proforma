import React, { useState, useEffect } from 'react';
import { Receipt, Eye, Download, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import { getInvoices, updateInvoiceStatus } from '../services/invoiceService';
import { getCompanyProfile } from '../services/companyService';
import { getAppSettings } from '../services/quoteService';
import { pdfTemplates } from '../constants/pdfTemplates';
import { PDFGenerator } from '../utils/pdfGenerator';
import PaymentModal from './PaymentModal';
import PaymentHistory from './PaymentHistory';
import type { Invoice, CompanyProfile, AppSettings } from '../types';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [invoicesData, profileData, settingsData] = await Promise.all([
          getInvoices(),
          getCompanyProfile(),
          getAppSettings(),
        ]);
        setInvoices(invoicesData);
        setCompanyProfile(profileData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading invoices data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshInvoices = async () => {
    const invoicesData = await getInvoices();
    setInvoices(invoicesData);
  };

  const handleStatusUpdate = async (invoiceId: string, newStatus: Invoice['status']) => {
    setUpdatingStatus(invoiceId);
    
    const paidDate = newStatus === 'paid' ? new Date().toISOString() : undefined;
    const success = await updateInvoiceStatus(invoiceId, newStatus, paidDate);
    
    if (success) {
      await refreshInvoices();
    }
    
    setUpdatingStatus(null);
  };

  const getStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'sent': return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid') return false;
    return new Date(invoice.due_date) < new Date();
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    if (!companyProfile || !settings) return;

    console.log('Generating invoice PDF:', invoice);

    const selectedTemplate = pdfTemplates.find(t => t.id === settings.pdf_template) || pdfTemplates[0];

    const validLineItems = invoice.line_items.filter(item => 
      item.description.trim() !== ''
    );

    // Prepare data for PDF generation
    const pdfData = {
      quoteNumber: invoice.invoice_number,
      date: new Date(invoice.created_at!).toLocaleDateString('en-ZA'),
      validUntil: new Date(invoice.due_date).toLocaleDateString('en-ZA'),
      companyProfile,
      clientDetails: {
        name: invoice.client_details.name,
        address: invoice.client_details.address,
        email: invoice.client_details.email,
        comments: invoice.client_details.comments
      },
      lineItems: validLineItems,
      totals: invoice.totals,
      terms: `Payment Terms: Net 30 days\nDue Date: ${new Date(invoice.due_date).toLocaleDateString('en-ZA')}\nPlease remit payment to the address above or contact us for payment arrangements.`,
      colors: {
        primary: selectedTemplate.primary,
        secondary: selectedTemplate.secondary,
        accent: selectedTemplate.accent
      }
    };

    console.log('Invoice PDF Data prepared:', pdfData);

    // Generate PDF using the new utility
    PDFGenerator.generateQuotePDF(pdfData).catch(error => {
      console.error('Invoice PDF generation failed:', error);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="mt-2 text-gray-600">Manage your invoices and track payments</p>
        </div>

        {/* Invoice Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{invoices.length}</h3>
                <p className="text-gray-600">Total Invoices</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {invoices.filter(inv => inv.status === 'paid').length}
                </h3>
                <p className="text-gray-600">Paid</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {invoices.filter(inv => isOverdue(inv) && inv.status !== 'paid').length}
                </h3>
                <p className="text-gray-600">Overdue</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  R{invoices.reduce((sum, inv) => inv.status !== 'paid' ? sum + inv.totals.total : sum, 0).toFixed(0)}
                </h3>
                <p className="text-gray-600">Outstanding</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Invoices</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {invoices.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-600 mb-6">Convert approved quotes to invoices to get started</p>
              </div>
            ) : (
              invoices.map((invoice) => {
                const overdue = isOverdue(invoice);
                const currentStatus = overdue && invoice.status !== 'paid' ? 'overdue' : invoice.status;
                
                return (
                  <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between group">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-sm font-medium text-gray-900">
                            {invoice.invoice_number}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
                            {getStatusIcon(currentStatus)}
                            <span className="ml-1 capitalize">{currentStatus}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {invoice.client_details.name} • Due: {new Date(invoice.due_date).toLocaleDateString('en-ZA')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            R {invoice.totals.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(invoice.created_at!).toLocaleDateString('en-ZA')}
                          </p>
                        </div>
                        <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {invoice.status !== 'paid' && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleStatusUpdate(invoice.id!, 'sent')}
                                disabled={updatingStatus === invoice.id}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Mark Sent
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(invoice.id!, 'paid')}
                                disabled={updatingStatus === invoice.id}
                                className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              >
                                Mark Paid
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => setSelectedInvoice(invoice)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => generateInvoicePDF(invoice)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Invoice Details - {selectedInvoice.invoice_number}
                </h2>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Invoice Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Client Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedInvoice.client_details.name}</p>
                      <p className="text-gray-600 whitespace-pre-line">{selectedInvoice.client_details.address}</p>
                      <p className="text-gray-600">{selectedInvoice.client_details.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Invoice Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">
                        <span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(isOverdue(selectedInvoice) && selectedInvoice.status !== 'paid' ? 'overdue' : selectedInvoice.status)}`}>
                          {getStatusIcon(isOverdue(selectedInvoice) && selectedInvoice.status !== 'paid' ? 'overdue' : selectedInvoice.status)}
                          <span className="ml-1 capitalize">{isOverdue(selectedInvoice) && selectedInvoice.status !== 'paid' ? 'overdue' : selectedInvoice.status}</span>
                        </span>
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Created:</span> {new Date(selectedInvoice.created_at!).toLocaleDateString('en-ZA')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Due Date:</span> {new Date(selectedInvoice.due_date).toLocaleDateString('en-ZA')}
                      </p>
                      {selectedInvoice.paid_date && (
                        <p className="text-gray-600">
                          <span className="font-medium">Paid Date:</span> {new Date(selectedInvoice.paid_date).toLocaleDateString('en-ZA')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedInvoice.line_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              R {item.unit_price.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                              R {item.line_total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comments */}
                {selectedInvoice.client_details.comments && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Comments</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">{selectedInvoice.client_details.comments}</p>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-end">
                    <div className="w-80">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-medium">R {selectedInvoice.totals.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.totals.vat > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-700">VAT (15%):</span>
                          <span className="font-medium">R {selectedInvoice.totals.vat.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                        <span>Total:</span>
                        <span>R {selectedInvoice.totals.total.toFixed(2)}</span>
                      </div>
                      {selectedInvoice.totals.vat === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          * VAT excluded (not VAT registered)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Payment History Section */}
                {showPaymentHistory && (
                  <div className="mt-6 border-t pt-6">
                    <PaymentHistory invoiceId={selectedInvoice.id} />
                  </div>
                )}

                {/* Modal Actions */}
                <div className="mt-6 flex justify-between">
                  <div className="flex space-x-2">
                    {selectedInvoice.status !== 'paid' && (
                      <>
                        <button
                          onClick={() => setShowPaymentModal(true)}
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pay Now
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedInvoice.id!, 'sent')}
                          disabled={updatingStatus === selectedInvoice.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Mark as Sent
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedInvoice.id!, 'paid')}
                          disabled={updatingStatus === selectedInvoice.id}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                          Mark as Paid
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {showPaymentHistory ? 'Hide' : 'Show'} Payment History
                    </button>
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => {
                        setSelectedInvoice(null);
                        setShowPaymentHistory(false);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => generateInvoicePDF(selectedInvoice)}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && selectedInvoice && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            invoice={selectedInvoice}
            onPaymentSuccess={() => {
              setShowPaymentModal(false);
              refreshInvoices(); // Refresh invoices list
              // Update selected invoice status
              setSelectedInvoice(prev => prev ? { ...prev, status: 'paid' } : null);
            }}
          />
        )}
      </div>
    </div>
  );
};