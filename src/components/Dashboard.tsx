import React, { useState, useEffect } from 'react';
import { FileText, Plus, Settings, Building, Eye, Edit, CheckCircle, XCircle, ArrowRight, Brain } from 'lucide-react';
import { getQuotes, updateQuoteStatus } from '../services/quoteService';
import { createInvoiceFromQuote } from '../services/invoiceService';
import { getCompanyProfile } from '../services/companyService';
import { pdfTemplates } from '../constants/pdfTemplates';
import { DocumentUpload } from './DocumentUpload';
import { DataConfirmation } from './DataConfirmation';
import { PDFGenerator, PDFGenerationResult } from '../utils/pdfGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import { FileSystemUtils } from '../utils/fileSystemUtils';
import { ExtractedQuoteData } from '../services/documentProcessor';
import type { Quote, CompanyProfile } from '../types';
import { CreateQuote } from './CreateQuote';

interface DashboardProps {
  onNavigate: (page: 'quote' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);

  const [importMessage, setImportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [convertingQuote, setConvertingQuote] = useState<string | null>(null);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedQuoteData | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quotesData, profileData] = await Promise.all([
          getQuotes(),
          getCompanyProfile(),
        ]);
        setQuotes(quotesData);
        setCompanyProfile(profileData);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshQuotes = async () => {
    const quotesData = await getQuotes();
    setQuotes(quotesData);
  };

  const generateQuotePDF = async (quote: Quote) => {
    if (!companyProfile) return;

    setGeneratingPDF(true);


    try {
      // Get app settings for template
      const { getAppSettings } = await import('../services/quoteService');
      const settings = await getAppSettings();
      const selectedTemplate = pdfTemplates.find(t => t.id === settings?.pdf_template) || pdfTemplates[0];
      
      

      // Filter valid line items for PDF - include items with descriptions
      const validLineItems = quote.line_items.filter(item => 
        item.description.trim() !== ''
      );

      // Prepare data for PDF generation
      const pdfData = {
        quoteNumber: quote.quote_number,
        date: new Date(quote.created_at!).toLocaleDateString('en-ZA'),
        validUntil: new Date(new Date(quote.created_at!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
        profession: settings?.profession || 'General',
        companyProfile,
        clientDetails: {
          name: quote.client_details.name,
          address: quote.client_details.address,
          email: quote.client_details.email,
          comments: quote.client_details.comments
        },
        lineItems: validLineItems,
        totals: quote.totals,
        terms: settings?.terms_and_conditions || `• This quotation is valid for 30 days from the date of issue.
• Prices are quoted in South African Rand (ZAR)${quote.totals.vat > 0 ? ' and include 15% VAT' : ' and exclude VAT'}.
• Payment terms: 30 days from invoice date unless otherwise agreed.
• This quotation does not constitute a contract until formally accepted.
• Delivery times are estimates and subject to confirmation upon order.`,
        colors: {
          primary: selectedTemplate.primary,
          secondary: selectedTemplate.secondary,
          accent: selectedTemplate.accent
        }
      };

  

      // Generate PDF blob for preview
      const result = await PDFGenerator.generateQuotePDFBlob(pdfData);
      setPdfResult(result);
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const closeQuoteModal = () => {
    setSelectedQuote(null);
  };

  const handleDownloadPDF = async () => {
    if (!pdfResult) return;
    
    try {
      // Save to local backup first
      await FileSystemUtils.saveToLocalBackup(pdfResult.blob, pdfResult.fileName, 'quotes');
      
      // Then download
      PDFGenerator.downloadPDF(pdfResult.blob, pdfResult.fileName);
    } catch (error) {
      console.error('Error saving PDF backup:', error);
      // Fallback to direct download
      PDFGenerator.downloadPDF(pdfResult.blob, pdfResult.fileName);
    }
  };

  const handlePrintPDF = () => {
    if (!pdfResult) return;
    PDFGenerator.printPDF(pdfResult.blob);
  };

  const closePDFPreview = () => {
    setShowPDFPreview(false);
    setPdfResult(null);
  };



  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
  };

  const handleBackFromEdit = () => {
    setEditingQuote(null);
    refreshQuotes();
  };

  const handleQuoteStatusUpdate = async (quoteId: string, status: Quote['status']) => {
    const success = await updateQuoteStatus(quoteId, status);
    if (success) {
      await refreshQuotes();
    }
  };

  const handleConvertToInvoice = async (quote: Quote) => {
    if (!quote.id) return;
    
    setConvertingQuote(quote.id);
    const invoice = await createInvoiceFromQuote(quote);
    
    if (invoice) {
      await refreshQuotes();
      setImportMessage({ type: 'success', text: `Quote ${quote.quote_number} converted to invoice ${invoice.invoice_number}!` });
      setTimeout(() => setImportMessage(null), 3000);
    } else {
      setImportMessage({ type: 'error', text: 'Failed to convert quote to invoice' });
    }
    
    setConvertingQuote(null);
  };

  const handleDocumentExtracted = (data: ExtractedQuoteData) => {
    setExtractedData(data);
    setShowDocumentUpload(false);
  };

  const handleConfirmExtractedData = async (confirmedData: {
    clientDetails: {
      name: string;
      address: string;
      email: string;
      comments?: string;
    };
    lineItems: {
      id: string;
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }[];
    totals: {
      subtotal: number;
      vat: number;
      total: number;
    };
    comments: string;
  }) => {
    // Convert to quote format and save
    const quote = {
      quote_number: `QU-${Date.now()}`, // Temporary number, will be replaced by proper numbering
      client_details: confirmedData.clientDetails,
      line_items: confirmedData.lineItems,
      totals: confirmedData.totals,
    };

    const result = await saveQuote(quote);
    if (result) {
      await refreshQuotes();
      setImportMessage({ type: 'success', text: 'Document imported successfully!' });
      setTimeout(() => setImportMessage(null), 3000);
    } else {
      setImportMessage({ type: 'error', text: 'Failed to import document data' });
    }
    
    setExtractedData(null);
  };

  const getQuoteStatusColor = (status?: Quote['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getQuoteStatusIcon = (status?: Quote['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-3 w-3" />;
      case 'declined': return <XCircle className="h-3 w-3" />;
      case 'converted': return <ArrowRight className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  // If editing a quote, show the CreateQuote component
  if (editingQuote) {
    return <CreateQuote editingQuote={editingQuote} onBack={handleBackFromEdit} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl xs:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Manage your quotes and business settings</p>

          {importMessage && (
            <div className={`mt-3 sm:mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
              importMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {importMessage.text}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div
            onClick={() => onNavigate('quote')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer min-h-touch active:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="bg-blue-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Create Quote</h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">Generate a new customer quote</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('settings')}
            className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer min-h-touch active:bg-gray-50"
          >
            <div className="flex items-center">
              <div className="bg-gray-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Settings</h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">Configure numbering and preferences</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="bg-green-500 p-2 sm:p-3 rounded-lg flex-shrink-0">
                <Building className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="ml-3 sm:ml-4 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">Company Profile</h3>
                <p className="text-sm sm:text-base text-gray-600 truncate">
                  {companyProfile ? companyProfile.company_name : 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Quotes</h2>
              <div className="flex items-center justify-between xs:justify-end space-x-3 sm:space-x-4">
                <button
                  onClick={() => setShowDocumentUpload(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm min-h-touch min-w-touch"
                >
                  <Brain className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden xs:inline">AI Import</span>
                  <span className="xs:hidden">Import</span>
                </button>

                <span className="text-xs sm:text-sm text-gray-500">{quotes.length} total</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {quotes.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Get started by creating your first quote</p>
                <button
                  onClick={() => onNavigate('quote')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors min-h-touch min-w-touch"
                >
                  Create Quote
                </button>
              </div>
            ) : (
              quotes.map((quote) => (
                <div key={quote.id} className="px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50">
                  {/* Mobile Layout */}
                  <div className="block sm:hidden">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {quote.quote_number}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getQuoteStatusColor(quote.status)}`}>
                            {getQuoteStatusIcon(quote.status)}
                            <span className="ml-1 capitalize">{quote.status || 'pending'}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {quote.client_details.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {quote.line_items.length} item{quote.line_items.length !== 1 ? 's' : ''} • {new Date(quote.created_at!).toLocaleDateString('en-ZA')}
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          R {quote.totals.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-end space-x-1">
                      {quote.status === 'pending' && (
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleQuoteStatusUpdate(quote.id!, 'approved')}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors min-h-touch"
                            title="Approve Quote"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuoteStatusUpdate(quote.id!, 'declined')}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors min-h-touch"
                            title="Decline Quote"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {quote.status === 'approved' && (
                        <button
                          onClick={() => handleConvertToInvoice(quote)}
                          disabled={convertingQuote === quote.id}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors min-h-touch"
                          title="Convert to Invoice"
                        >
                          {convertingQuote === quote.id ? 'Converting...' : 'To Invoice'}
                        </button>
                      )}
                      <button
                        onClick={() => handleEditQuote(quote)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors min-h-touch min-w-touch"
                        title="Edit Quote"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setSelectedQuote(quote)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors min-h-touch min-w-touch"
                        title="View Quote"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => generateQuotePDF(quote)}
                        disabled={generatingPDF}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 min-h-touch min-w-touch"
                        title="Preview PDF"
                      >
                        {generatingPDF ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between group">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {quote.quote_number}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuoteStatusColor(quote.status)}`}>
                          {getQuoteStatusIcon(quote.status)}
                          <span className="ml-1 capitalize">{quote.status || 'pending'}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {quote.client_details.name} • {quote.line_items.length} item{quote.line_items.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          R {quote.totals.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(quote.created_at!).toLocaleDateString('en-ZA')}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {quote.status === 'pending' && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleQuoteStatusUpdate(quote.id!, 'approved')}
                              className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Approve Quote"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleQuoteStatusUpdate(quote.id!, 'declined')}
                              className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              title="Decline Quote"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                        {quote.status === 'approved' && (
                          <button
                            onClick={() => handleConvertToInvoice(quote)}
                            disabled={convertingQuote === quote.id}
                            className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            title="Convert to Invoice"
                          >
                            {convertingQuote === quote.id ? 'Converting...' : 'To Invoice'}
                          </button>
                        )}
                        <button
                          onClick={() => handleEditQuote(quote)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit Quote"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSelectedQuote(quote)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Quote"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => generateQuotePDF(quote)}
                          disabled={generatingPDF}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Preview PDF"
                        >
                          {generatingPDF ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>



        {/* AI Document Upload Modal */}
        {showDocumentUpload && (
          <DocumentUpload
            onDataExtracted={handleDocumentExtracted}
            onClose={() => setShowDocumentUpload(false)}
          />
        )}

        {/* Data Confirmation Modal */}
        {extractedData && (
          <DataConfirmation
            extractedData={extractedData}
            onConfirm={handleConfirmExtractedData}
            onCancel={() => setExtractedData(null)}
          />
        )}

        {/* Quote Detail Modal */}
        {selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                  Quote Details - {selectedQuote.quote_number}
                </h2>
                <button
                  onClick={closeQuoteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 min-h-touch min-w-touch"
                >
                  <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-4 sm:p-6">
                {/* Quote Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Client Information</h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{selectedQuote.client_details.name}</p>
                      <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">{selectedQuote.client_details.address}</p>
                      <p className="text-gray-600 text-sm sm:text-base">{selectedQuote.client_details.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Quote Information</h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Created:</span> {new Date(selectedQuote.created_at!).toLocaleDateString('en-ZA')}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Valid Until:</span> {new Date(new Date(selectedQuote.created_at!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA')}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">
                        <span className="font-medium">Items:</span> {selectedQuote.line_items.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Line Items</h3>
                  
                  {/* Mobile Card Layout */}
                  <div className="block sm:hidden space-y-3">
                    {selectedQuote.line_items.map((item) => (
                      <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-medium text-gray-900 flex-1 mr-2">{item.description}</p>
                          <p className="text-sm font-bold text-gray-900">R {item.line_total.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit: R {item.unit_price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table Layout */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit Price
                          </th>
                          <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedQuote.line_items.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 text-right">
                              R {item.unit_price.toFixed(2)}
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900 text-right">
                              R {item.line_total.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Comments */}
                {selectedQuote.client_details.comments && (
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">Comments</h3>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{selectedQuote.client_details.comments}</p>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                  <div className="flex justify-end">
                    <div className="w-full sm:w-80">
                      <div className="flex justify-between py-1 sm:py-2">
                        <span className="text-gray-700 text-sm sm:text-base">Subtotal:</span>
                        <span className="font-medium text-sm sm:text-base">R {selectedQuote.totals.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedQuote.totals.vat > 0 && (
                        <div className="flex justify-between py-1 sm:py-2">
                          <span className="text-gray-700 text-sm sm:text-base">VAT (15%):</span>
                          <span className="font-medium text-sm sm:text-base">R {selectedQuote.totals.vat.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 sm:py-3 border-t border-gray-300 text-base sm:text-lg font-bold">
                        <span>Total:</span>
                        <span>R {selectedQuote.totals.total.toFixed(2)}</span>
                      </div>
                      {selectedQuote.totals.vat === 0 && (
                        <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                          * VAT excluded (not VAT registered)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-4 sm:mt-6 flex flex-col xs:flex-row justify-end gap-3 xs:gap-4">
                  <button
                    onClick={closeQuoteModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors min-h-touch order-2 xs:order-1"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => generateQuotePDF(selectedQuote)}
                    disabled={generatingPDF}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors min-h-touch order-1 xs:order-2"
                  >
                    {generatingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span className="hidden xs:inline">Generating...</span>
                        <span className="xs:hidden">Loading...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden xs:inline">Preview PDF</span>
                        <span className="xs:hidden">Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF Preview Modal */}
        {showPDFPreview && pdfResult && (
          <PDFPreviewModal
            isOpen={showPDFPreview}
            onClose={closePDFPreview}
            pdfBlob={pdfResult.blob}
            fileName={pdfResult.fileName}
            onDownload={handleDownloadPDF}
            onPrint={handlePrintPDF}
          />
        )}
      </div>
    </div>
  );
};