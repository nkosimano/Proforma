import React, { useState, useEffect } from 'react';
import { Plus, Minus, Save, Download, User, Building, FileText, Hash, Receipt, ArrowLeft, GripVertical, Eye } from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { getAppSettings, saveQuote, incrementQuoteNumber, updateQuote } from '../services/quoteService';
import { getCompanyProfile } from '../services/companyService';
import { searchCustomers, CustomerSuggestion } from '../services/customerService';
import { pdfTemplates } from './PDFTemplateSelector';
import { PDFGenerator, PDFGenerationResult } from '../utils/pdfGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import { FileSystemUtils } from '../utils/fileSystemUtils';
import type { AppSettings, CompanyProfile, LineItem, ClientDetails, QuoteTotals, Quote } from '../types';

interface CreateQuoteProps {
  editingQuote?: Quote | null;
  onBack?: () => void;
}

export const CreateQuote: React.FC<CreateQuoteProps> = ({ editingQuote, onBack }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customTerms, setCustomTerms] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState<CustomerSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  
  // PDF Preview state
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Quote form state
  const [clientDetails, setClientDetails] = useState<Omit<ClientDetails, 'user_id'>>({
    name: '',
    address: '',
    email: '',
  });
  const [comments, setComments] = useState('');
  const [includeTax, setIncludeTax] = useState(true);
  const [quoteNumber, setQuoteNumber] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unit_price: 0, line_total: 0 }
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, profileData] = await Promise.all([
          getAppSettings(),
          getCompanyProfile(),
        ]);
        setSettings(settingsData);
        setCompanyProfile(profileData);
        
        // Set default terms if available
        if (settingsData?.terms_and_conditions) {
          setCustomTerms(settingsData.terms_and_conditions);
        } else {
          setCustomTerms(`• This quotation is valid for 30 days from the date of issue.
• Prices are quoted in South African Rand (ZAR) and ${includeTax ? 'include 15% VAT' : 'exclude VAT'}.
• Payment terms: 30 days from invoice date unless otherwise agreed.
• This quotation does not constitute a contract until formally accepted.
• Delivery times are estimates and subject to confirmation upon order.`);
        }

        // If editing, populate form with existing data
        if (editingQuote) {
          setClientDetails(editingQuote.client_details);
          setComments(editingQuote.client_details.comments || '');
          setLineItems(editingQuote.line_items);
          setQuoteNumber(editingQuote.quote_number);
          setIncludeTax(editingQuote.totals.vat > 0);
        } else if (settingsData) {
          setQuoteNumber(`${settingsData.quote_prefix}${settingsData.next_quote_number}`);
        }
        
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Update terms when tax setting changes
  useEffect(() => {
    if (!editingQuote && settings && !settings.terms_and_conditions) {
      setCustomTerms(customTerms.replace(/include 15% VAT|exclude VAT/, includeTax ? 'include 15% VAT' : 'exclude VAT'));
    }
  }, [includeTax, editingQuote, settings, customTerms]);

  const handleClientNameChange = async (value: string) => {
    setClientDetails({ ...clientDetails, name: value });
    
    if (value.length >= 2 && !editingQuote) {
      setSearchingCustomers(true);
      try {
        const suggestions = await searchCustomers(value);
        setCustomerSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error searching customers:', error);
      } finally {
        setSearchingCustomers(false);
      }
    } else {
      setShowSuggestions(false);
      setCustomerSuggestions([]);
    }
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    setClientDetails({
      name: customer.name,
      address: customer.address,
      email: customer.email,
    });
    setShowSuggestions(false);
    setCustomerSuggestions([]);
  };

  const calculateLineTotal = (quantity: number, unitPrice: number): number => {
    return quantity * unitPrice;
  };

  const calculateTotals = (items = lineItems): QuoteTotals => {
    const validItems = items.filter(item => 
      item.description.trim() !== '' || item.quantity > 0 || item.unit_price > 0
    );
    const subtotal = validItems.reduce((sum, item) => sum + item.line_total, 0);
    const vat = includeTax ? subtotal * 0.15 : 0; // 15% VAT for South Africa
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems([...lineItems, { id: newId, description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id));
    }
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.line_total = calculateLineTotal(
            field === 'quantity' ? Number(value) : updatedItem.quantity,
            field === 'unit_price' ? Number(value) : updatedItem.unit_price
          );
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(lineItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLineItems(items);
  };

  const handleSaveQuote = async () => {
    if (!settings || !companyProfile) {
      setMessage({ type: 'error', text: 'Please set up your company profile first' });
      return;
    }

    if (!clientDetails.name || !clientDetails.address || !clientDetails.email) {
      setMessage({ type: 'error', text: 'Please fill in all client details' });
      return;
    }

    // Filter out completely empty line items (no description and zero values)
    const validLineItems = lineItems.filter(item => 
      item.description.trim() !== '' || item.quantity > 0 || item.unit_price > 0
    );


    setSaving(true);
    setMessage(null);

    try {
      const currentQuoteNumber = editingQuote ? editingQuote.quote_number : `${settings.quote_prefix}${settings.next_quote_number}`;
      const totals = calculateTotals(validLineItems);

      const quote = {
        quote_number: currentQuoteNumber,
        client_details: {
          ...clientDetails,
          comments: comments,
        } as ClientDetails,
        line_items: validLineItems,
        totals,
      };

      let result;
      if (editingQuote) {
        result = await updateQuote(editingQuote.id!, quote);
      } else {
        result = await saveQuote(quote);
        if (result) {
          await incrementQuoteNumber();
        }
      }
      
      if (result) {
        setMessage({ type: 'success', text: `Quote ${editingQuote ? 'updated' : 'saved'} successfully!` });
        
        // Reset form only if creating new quote
        if (!editingQuote) {
          setClientDetails({ name: '', address: '', email: '' });
          setComments('');
          setLineItems([{ id: '1', description: '', quantity: 1, unit_price: 0, line_total: 0 }]);
        }
        
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: `Failed to ${editingQuote ? 'update' : 'save'} quote` });
      }
    } catch (error) {
      console.error('Error saving quote:', error);
      setMessage({ type: 'error', text: 'Failed to save quote' });
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = async () => {
    if (!settings || !companyProfile) {
      setMessage({ type: 'error', text: 'Please set up your company profile first' });
      return;
    }

    if (!clientDetails.name || !clientDetails.address || !clientDetails.email) {
      setMessage({ type: 'error', text: 'Please fill in all client details before generating PDF' });
      return;
    }

    setGeneratingPDF(true);
    setMessage(null);

    try {
      console.log('Generate PDF clicked');
      const selectedTemplate = pdfTemplates.find(t => t.id === settings.pdf_template) || pdfTemplates[0];
      const currentQuoteNumber = editingQuote ? editingQuote.quote_number : quoteNumber;
      const validLineItems = lineItems.filter(item => 
        item.description.trim() !== ''
      );
      const totals = calculateTotals(validLineItems);

      // Prepare data for PDF generation
      const pdfData = {
        quoteNumber: currentQuoteNumber,
        date: new Date().toLocaleDateString('en-ZA'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
        companyProfile,
        clientDetails: {
          name: clientDetails.name,
          address: clientDetails.address,
          email: clientDetails.email,
          comments: comments
        },
        lineItems: validLineItems,
        totals,
        terms: customTerms,
        colors: {
          primary: selectedTemplate.primary,
          secondary: selectedTemplate.secondary,
          accent: selectedTemplate.accent
        }
      };

      console.log('PDF Data prepared:', pdfData);

      // Generate PDF blob for preview
      const result = await PDFGenerator.generateQuotePDFBlob(pdfData);
      setPdfResult(result);
      setShowPDFPreview(true);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      setMessage({ type: 'error', text: 'Failed to generate PDF. Please try again.' });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!pdfResult) return;
    
    try {
      // Download the PDF
      PDFGenerator.downloadPDF(pdfResult.blob, pdfResult.fileName);
      
      // Save to backup if available
      if (FileSystemUtils.isBackupAvailable()) {
        await FileSystemUtils.saveToBackup({
          type: 'quote',
          fileName: pdfResult.fileName,
          pdfBlob: pdfResult.blob
        });
      }
      
      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
    } catch (error) {
      console.error('Download failed:', error);
      setMessage({ type: 'error', text: 'Failed to download PDF' });
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!companyProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-yellow-800">Company Profile Required</h3>
                <p className="mt-2 text-yellow-700">
                  Please set up your company profile in Settings before creating quotes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totals = calculateTotals();
  const validLineItems = lineItems.filter(item => 
    item.description.trim() !== '' || item.quantity > 0 || item.unit_price > 0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            {editingQuote && onBack && (
              <button onClick={onBack} className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{editingQuote ? 'Edit Quote' : 'Create Quote'}</h1>
              <p className="mt-2 text-gray-600">{editingQuote ? 'Update your existing quote' : 'Generate a professional quote for your client'}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Quote {quoteNumber}
                </h2>
              </div>
              <div className="text-sm text-gray-500">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Client Details Section */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Client Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clientDetails.name}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      onFocus={() => {
                        if (customerSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding suggestions to allow clicking
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter client name (type 2+ letters for suggestions)"
                    />
                    
                    {/* Customer Suggestions Dropdown */}
                    {showSuggestions && customerSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {searchingCustomers && (
                          <div className="px-4 py-3 text-sm text-gray-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Searching customers...
                          </div>
                        )}
                        {customerSuggestions.map((customer, index) => (
                          <div
                            key={index}
                            onClick={() => selectCustomer(customer)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-sm text-gray-600">{customer.email}</div>
                            <div className="text-xs text-gray-500 truncate">{customer.address}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={clientDetails.email}
                    onChange={(e) => setClientDetails({ ...clientDetails, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client email"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={clientDetails.address}
                    onChange={(e) => setClientDetails({ ...clientDetails, address: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter client address"
                  />
                </div>
              </div>

              {/* Tax Settings */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">VAT/Tax Settings</h4>
                    <p className="text-sm text-blue-700">Toggle VAT inclusion for new businesses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeTax}
                      onChange={(e) => setIncludeTax(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {includeTax ? 'Include VAT (15%)' : 'Exclude VAT'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Line Items</h3>
                <button
                  onClick={addLineItem}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="line-items">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {lineItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`grid grid-cols-12 gap-4 items-end p-4 bg-white border border-gray-200 rounded-lg transition-all ${
                                  snapshot.isDragging ? 'shadow-lg border-blue-300 bg-blue-50' : 'hover:border-gray-300'
                                }`}
                              >
                                <div className="col-span-1 flex items-center justify-center">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing transition-colors"
                                  >
                                    <GripVertical className="h-5 w-5" />
                                  </div>
                                </div>
                                <div className="col-span-4">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                  </label>
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Item description"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quantity
                                  </label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                   onFocus={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Unit Price (R)
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.unit_price}
                                    onChange={(e) => updateLineItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                   onFocus={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Total
                                  </label>
                                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-right">
                                    R{item.line_total.toFixed(2)}
                                  </div>
                                </div>
                                <div className="col-span-1">
                                  {lineItems.length > 1 && (
                                    <button
                                      onClick={() => removeLineItem(item.id)}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </div>

            {/* Comments Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments / Notes
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
               onPaste={(e) => e.stopPropagation()}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Add any additional comments or terms..."
              />
            </div>

            {/* Terms and Conditions Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
               onPaste={(e) => e.stopPropagation()}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter your terms and conditions..."
              />
            </div>

            {/* Totals Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-end">
                <div className="w-80">
                  <div className="flex justify-between py-2">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">R{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {includeTax && (
                    <div className="flex justify-between py-2">
                      <span className="text-gray-700">VAT (15%):</span>
                      <span className="font-medium">R{totals.vat.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t border-gray-300 text-lg font-bold">
                    <span>Total:</span>
                    <span>R{totals.total.toFixed(2)}</span>
                  </div>
                  {!includeTax && (
                    <p className="text-xs text-gray-500 mt-2">
                      * VAT excluded (not VAT registered)
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end space-x-4">
                <button
                  onClick={generatePDF}
                  disabled={generatingPDF || !clientDetails.name || !clientDetails.address || !clientDetails.email}
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors"
                >
                  {generatingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Eye className="h-5 w-5 mr-2" />
                      Preview PDF
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveQuote}
                  disabled={saving || !clientDetails.name || !clientDetails.address || !clientDetails.email}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {saving ? 'Saving...' : (editingQuote ? 'Update Quote' : 'Save Quote')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={closePDFPreview}
        pdfBlob={pdfResult?.blob || null}
        fileName={pdfResult?.fileName || ''}
        onDownload={handleDownloadPDF}
        onPrint={handlePrintPDF}
      />
    </div>
  );
};