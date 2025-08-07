import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Play, Pause, Trash2, Eye, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { recurringInvoiceService, type RecurringInvoiceWithDetails, type CreateRecurringInvoiceRequest } from '../services/recurringInvoiceService';
import { getInvoices } from '../services/invoiceService';
import { getAllCustomers } from '../services/customerService';
import type { Invoice, Customer } from '../types/database';
import { format, parseISO } from 'date-fns';

export default function RecurringInvoices() {
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringInvoiceWithDetails[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecurring, setSelectedRecurring] = useState<RecurringInvoiceWithDetails | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recurringData, invoicesData, customersData] = await Promise.all([
        recurringInvoiceService.getRecurringInvoices(),
        getInvoices(),
        getAllCustomers()
      ]);
      setRecurringInvoices(recurringData);
      setInvoices(invoicesData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setProcessing(id);
    try {
      const success = await recurringInvoiceService.toggleRecurringInvoice(id, !isActive);
      if (success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error toggling recurring invoice:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleGenerateNow = async (id: string) => {
    setProcessing(id);
    try {
      const newInvoice = await recurringInvoiceService.generateNextInvoice(id);
      if (newInvoice) {
        await loadData();
        alert('Invoice generated successfully!');
      } else {
        alert('Failed to generate invoice. Please try again.');
      }
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Error generating invoice. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recurring invoice? This action cannot be undone.')) {
      return;
    }

    setProcessing(id);
    try {
      const success = await recurringInvoiceService.deleteRecurringInvoice(id);
      if (success) {
        await loadData();
      }
    } catch (error) {
      console.error('Error deleting recurring invoice:', error);
    } finally {
      setProcessing(null);
    }
  };

  const getStatusColor = (isActive: boolean, nextDate: string) => {
    if (!isActive) return 'bg-gray-100 text-gray-800';
    
    const next = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'bg-red-100 text-red-800';
    if (diffDays <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isActive: boolean, nextDate: string) => {
    if (!isActive) return 'Inactive';
    
    const next = new Date(nextDate);
    const today = new Date();
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Due Now';
    if (diffDays === 1) return 'Due Tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    return 'Active';
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recurring Invoices</h1>
              <p className="mt-2 text-gray-600">Automate your invoice generation with recurring schedules</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Recurring Invoice
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{recurringInvoices.length}</h3>
                <p className="text-gray-600">Total Recurring</p>
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
                  {recurringInvoices.filter(r => r.is_active).length}
                </h3>
                <p className="text-gray-600">Active</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-yellow-500 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {recurringInvoices.filter(r => r.is_active && new Date(r.next_generation_date) <= new Date()).length}
                </h3>
                <p className="text-gray-600">Due Now</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-purple-500 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {recurringInvoices.reduce((sum, r) => sum + r.generated_count, 0)}
                </h3>
                <p className="text-gray-600">Generated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Invoices List */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recurring Invoice Schedules</h2>
          </div>

          {recurringInvoices.length === 0 ? (
            <div className="text-center py-12">
              <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recurring invoices</h3>
              <p className="text-gray-600 mb-4">Create your first recurring invoice to automate your billing process.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Recurring Invoice
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Frequency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Generation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Generated
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recurringInvoices.map((recurring) => (
                    <tr key={recurring.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {recurring.customers?.name || 'Unknown Customer'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {recurring.customers?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{recurring.template_invoice?.invoice_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {recurring.template_invoice?.totals && 
                              recurringInvoiceService.formatAmount(
                                recurring.template_invoice.totals.total,
                                recurring.currency
                              )
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recurringInvoiceService.getFrequencyText(recurring.frequency, recurring.interval_count)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(parseISO(recurring.next_generation_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          getStatusColor(recurring.is_active, recurring.next_generation_date)
                        }`}>
                          {getStatusText(recurring.is_active, recurring.next_generation_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {recurring.generated_count}
                        {recurring.max_occurrences && (
                          <span className="text-gray-500"> / {recurring.max_occurrences}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedRecurring(recurring)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          
                          {recurring.is_active && new Date(recurring.next_generation_date) <= new Date() && (
                            <button
                              onClick={() => handleGenerateNow(recurring.id)}
                              disabled={processing === recurring.id}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Generate Now"
                            >
                              <RefreshCw className={`h-4 w-4 ${processing === recurring.id ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleToggleActive(recurring.id, recurring.is_active)}
                            disabled={processing === recurring.id}
                            className={`p-1 ${
                              recurring.is_active 
                                ? 'text-yellow-600 hover:text-yellow-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={recurring.is_active ? 'Pause' : 'Activate'}
                          >
                            {recurring.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          
                          <button
                            onClick={() => handleDelete(recurring.id)}
                            disabled={processing === recurring.id}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <CreateRecurringInvoiceModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            customers={customers}
            invoices={invoices}
            onSuccess={() => {
              setShowCreateModal(false);
              loadData();
            }}
          />
        )}

        {/* Details Modal */}
        {selectedRecurring && (
          <RecurringInvoiceDetailsModal
            recurring={selectedRecurring}
            onClose={() => setSelectedRecurring(null)}
            onUpdate={loadData}
          />
        )}
      </div>
    </div>
  );
}

// Create Recurring Invoice Modal Component
interface CreateRecurringInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  invoices: Invoice[];
  onSuccess: () => void;
}

function CreateRecurringInvoiceModal({ isOpen, onClose, customers, invoices, onSuccess }: CreateRecurringInvoiceModalProps) {
  const [formData, setFormData] = useState<Partial<CreateRecurringInvoiceRequest>>({
    frequency: 'monthly',
    interval_count: 1,
    is_active: true,
    start_date: format(new Date(), 'yyyy-MM-dd'),
    next_generation_date: format(new Date(), 'yyyy-MM-dd')
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id || !formData.template_invoice_id) {
      setError('Please select both a customer and template invoice.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await recurringInvoiceService.createRecurringInvoice(formData as CreateRecurringInvoiceRequest);
      if (result) {
        onSuccess();
      } else {
        setError('Failed to create recurring invoice. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Create Recurring Invoice</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer
            </label>
            <select
              value={formData.customer_id || ''}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template Invoice
            </label>
            <select
              value={formData.template_invoice_id || ''}
              onChange={(e) => setFormData({ ...formData, template_invoice_id: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a template invoice</option>
              {invoices.map((invoice) => (
                <option key={invoice.id} value={invoice.id}>
                  #{invoice.invoice_number} - {invoice.client_details.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={formData.frequency || 'monthly'}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Every
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.interval_count || 1}
                onChange={(e) => setFormData({ ...formData, interval_count: parseInt(e.target.value) })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                start_date: e.target.value,
                next_generation_date: e.target.value
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={formData.end_date || ''}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value || undefined })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Occurrences (Optional)
            </label>
            <input
              type="number"
              min="1"
              value={formData.max_occurrences || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                max_occurrences: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave empty for unlimited"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Start immediately
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Recurring Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Details Modal Component
interface RecurringInvoiceDetailsModalProps {
  recurring: RecurringInvoiceWithDetails;
  onClose: () => void;
}

function RecurringInvoiceDetailsModal({ recurring, onClose }: RecurringInvoiceDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Recurring Invoice Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Customer Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{recurring.customers?.name}</p>
                <p className="text-sm text-gray-600">{recurring.customers?.email}</p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Schedule Information</h4>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Frequency:</span> {recurringInvoiceService.getFrequencyText(recurring.frequency, recurring.interval_count)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Next Generation:</span> {format(parseISO(recurring.next_generation_date), 'MMM dd, yyyy')}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    recurring.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {recurring.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Generation Statistics</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{recurring.generated_count}</p>
                  <p className="text-sm text-gray-600">Generated</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {recurring.max_occurrences || '∞'}
                  </p>
                  <p className="text-sm text-gray-600">Max Occurrences</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {recurring.max_occurrences ? recurring.max_occurrences - recurring.generated_count : '∞'}
                  </p>
                  <p className="text-sm text-gray-600">Remaining</p>
                </div>
              </div>
            </div>
          </div>

          {recurring.end_date && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">End Date</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">{format(parseISO(recurring.end_date), 'MMM dd, yyyy')}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}