import React, { useState, useEffect } from 'react';
import { FileText, Plus, Settings, Building, Eye, Download, Edit, Upload, CheckCircle, XCircle, ArrowRight, Brain } from 'lucide-react';
import { getQuotes, importQuotes, updateQuoteStatus } from '../services/quoteService';
import { createInvoiceFromQuote } from '../services/invoiceService';
import { getCompanyProfile } from '../services/companyService';
import { pdfTemplates } from './PDFTemplateSelector';
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
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [importing, setImporting] = useState(false);
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
    console.log('Generating PDF for quote:', quote);

    try {
      // Get app settings for template
      const { getAppSettings } = await import('../services/quoteService');
      const settings = await getAppSettings();
      const selectedTemplate = pdfTemplates.find(t => t.id === settings?.pdf_template) || pdfTemplates[0];
      
      console.log('Settings loaded:', settings);
      console.log('Selected template:', selectedTemplate);

      // Filter valid line items for PDF - include items with descriptions
      const validLineItems = quote.line_items.filter(item => 
        item.description.trim() !== ''
      );

      // Prepare data for PDF generation
      const pdfData = {
        quoteNumber: quote.quote_number,
        date: new Date(quote.created_at!).toLocaleDateString('en-ZA'),
        validUntil: new Date(new Date(quote.created_at!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
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

      console.log('Dashboard PDF Data prepared:', pdfData);

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

  const handleImportQuotes = async () => {
    if (!importData.trim()) {
      setImportMessage({ type: 'error', text: 'Please paste your quote data' });
      return;
    }

    setImporting(true);
    setImportMessage(null);

    try {
      const parsedQuotes = JSON.parse(importData);
      
      // Validate the structure
      if (!Array.isArray(parsedQuotes)) {
        throw new Error('Data must be an array of quotes');
      }

      // Basic validation for each quote
      for (const quote of parsedQuotes) {
        if (!quote.quote_number || !quote.client_details || !quote.line_items || !quote.totals) {
          throw new Error('Invalid quote structure. Each quote must have quote_number, client_details, line_items, and totals');
        }
      }

      const success = await importQuotes(parsedQuotes);
      if (success) {
        setImportMessage({ type: 'success', text: `Successfully imported ${parsedQuotes.length} quotes!` });
        setImportData('');
        setShowImport(false);
        await refreshQuotes();
        setTimeout(() => setImportMessage(null), 3000);
      } else {
        setImportMessage({ type: 'error', text: 'Failed to import quotes' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportMessage({ type: 'error', text: 'Invalid JSON format or quote structure' });
    } finally {
      setImporting(false);
    }
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
    clientDetails: any;
    lineItems: any[];
    totals: any;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your quotes and business settings</p>

          {importMessage && (
            <div className={`mt-4 p-4 rounded-lg ${
              importMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {importMessage.text}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            onClick={() => onNavigate('quote')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Quote</h3>
                <p className="text-gray-600">Generate a new customer quote</p>
              </div>
            </div>
          </div>

          <div
            onClick={() => onNavigate('settings')}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-center">
              <div className="bg-gray-500 p-3 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-gray-600">Configure numbering and preferences</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="bg-green-500 p-3 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Company Profile</h3>
                <p className="text-gray-600">
                  {companyProfile ? companyProfile.company_name : 'Not configured'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Quotes */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Quotes</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowDocumentUpload(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Import
                </button>
                <button
                  onClick={() => setShowImport(true)}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Quotes
                </button>
                <span className="text-sm text-gray-500">{quotes.length} total</span>
              </div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {quotes.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes yet</h3>
                <p className="text-gray-600 mb-6">Get started by creating your first quote</p>
                <button
                  onClick={() => onNavigate('quote')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Quote
                </button>
              </div>
            ) : (
              quotes.map((quote) => (
                <div key={quote.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between group">
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

        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Import Previous Quotes</h2>
                <button
                  onClick={() => setShowImport(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Import Instructions</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="mb-2">Paste your quotes data in JSON format. Each quote should have:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><code>quote_number</code>: The quote number (e.g., "QU-1001")</li>
                      <li><code>client_details</code>: Object with name, address, email, etc.</li>
                      <li><code>line_items</code>: Array of items with description, quantity, unit_price</li>
                      <li><code>totals</code>: Object with subtotal, vat, total amounts</li>
                    </ul>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Data (JSON Format)
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder={`[
  {
    "quote_number": "QU-1001",
    "client_details": {
      "name": "Client Name",
      "address": "Client Address",
      "email": "client@example.com",
      "company_registration_number": "2023/123456/07"
    },
    "line_items": [
      {
        "id": "1",
        "description": "Service Description",
        "quantity": 1,
        "unit_price": 1000,
        "line_total": 1000
      }
    ],
    "totals": {
      "subtotal": 1000,
      "vat": 150,
      "total": 1150
    }
  }
]`}
                  />
                </div>

                {importMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    importMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {importMessage.text}
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowImport(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportQuotes}
                    disabled={importing || !importData.trim()}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Importing...' : 'Import Quotes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Quote Details - {selectedQuote.quote_number}
                </h2>
                <button
                  onClick={closeQuoteModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {/* Quote Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Client Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedQuote.client_details.name}</p>
                      <p className="text-gray-600 whitespace-pre-line">{selectedQuote.client_details.address}</p>
                      <p className="text-gray-600">{selectedQuote.client_details.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Quote Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600">
                        <span className="font-medium">Created:</span> {new Date(selectedQuote.created_at!).toLocaleDateString('en-ZA')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Valid Until:</span> {new Date(new Date(selectedQuote.created_at!).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA')}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Items:</span> {selectedQuote.line_items.length}
                      </p>
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
                        {selectedQuote.line_items.map((item) => (
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
                {selectedQuote.client_details.comments && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Comments</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 whitespace-pre-line">{selectedQuote.client_details.comments}</p>
                    </div>
                  </div>
                )}

                {/* Totals */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex justify-end">
                    <div className="w-80">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="font-medium">R {selectedQuote.totals.subtotal.toFixed(2)}</span>
                      </div>
                      {selectedQuote.totals.vat > 0 && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-700">VAT (15%):</span>
                          <span className="font-medium">R {selectedQuote.totals.vat.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                        <span>Total:</span>
                        <span>R {selectedQuote.totals.total.toFixed(2)}</span>
                      </div>
                      {selectedQuote.totals.vat === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          * VAT excluded (not VAT registered)
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    onClick={closeQuoteModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => generateQuotePDF(selectedQuote)}
                    disabled={generatingPDF}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {generatingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview PDF
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