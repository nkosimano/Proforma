import React, { useState, useEffect, useCallback } from 'react';
import { Quote } from '../types';
import { getQuotes, updateQuoteStatus, deleteQuote } from '../services/quoteService';
import { Search, Filter, Eye, Edit, Trash2, CheckCircle, XCircle, FileText, Calendar, User, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface QuoteHistoryProps {
  onEditQuote?: (quote: Quote) => void;
}

export const QuoteHistory: React.FC<QuoteHistoryProps> = ({ onEditQuote }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Quote['status']>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchTerm, statusFilter, dateFilter, filterQuotes]);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const quotesData = await getQuotes();
      setQuotes(quotesData);
    } catch (error) {
      console.error('Error loading quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterQuotes = useCallback(() => {
    let filtered = [...quotes];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client_details.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client_details.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90days':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(quote => new Date(quote.created_at) >= filterDate);
    }

    setFilteredQuotes(filtered);
  }, [quotes, searchTerm, statusFilter, dateFilter]);

  const handleStatusUpdate = async (quoteId: string, status: Quote['status']) => {
    const success = await updateQuoteStatus(quoteId, status);
    if (success) {
      await loadQuotes();
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    const success = await deleteQuote(quoteId);
    if (success) {
      await loadQuotes();
      setShowDeleteConfirm(null);
    }
  };

  const getStatusColor = (status?: Quote['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status?: Quote['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'converted': return <FileText className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Quote History</h1>
          <p className="mt-2 text-gray-600">View and manage all your quotes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="converted">Converted</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as typeof dateFilter)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredQuotes.length} of {quotes.length} quotes
          </p>
        </div>

        {/* Quotes List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredQuotes.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredQuotes.map((quote) => (
                <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {quote.quote_number}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status || 'pending'}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{quote.client_details.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{format(new Date(quote.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>R {quote.totals.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {onEditQuote && (
                        <button
                          onClick={() => onEditQuote(quote)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Quote"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => setShowDeleteConfirm(quote.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Quote"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      {/* Status Update Dropdown */}
                      <select
                        value={quote.status || 'pending'}
                        onChange={(e) => handleStatusUpdate(quote.id!, e.target.value as Quote['status'])}
                        className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                        <option value="converted">Converted</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote Details Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quote Details - {selectedQuote.quote_number}
                </h2>
                <button
                  onClick={() => setSelectedQuote(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Client Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {selectedQuote.client_details.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedQuote.client_details.email}</p>
                      <p><span className="font-medium">Address:</span> {selectedQuote.client_details.address}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Quote Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Status:</span> 
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuote.status)}`}>
                          {getStatusIcon(selectedQuote.status)}
                          <span className="ml-1 capitalize">{selectedQuote.status || 'pending'}</span>
                        </span>
                      </p>
                      <p><span className="font-medium">Created:</span> {format(new Date(selectedQuote.created_at), 'MMM dd, yyyy HH:mm')}</p>
                      <p><span className="font-medium">Total:</span> R {selectedQuote.totals.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Line Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedQuote.line_items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R {item.unit_price.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R {item.line_total.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setSelectedQuote(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Quote</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this quote? This action cannot be undone.</p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteQuote(showDeleteConfirm)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};