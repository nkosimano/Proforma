import React, { useState, useEffect, Suspense, useRef } from 'react';
import { gsap } from 'gsap';
import { Save, User, Building, FileText, ArrowLeft, Eye } from 'lucide-react';

import { getAppSettings, saveQuote, incrementQuoteNumber, updateQuote } from '../services/quoteService';
import { getCompanyProfile } from '../services/companyService';
import { searchCustomers, CustomerSuggestion, createCustomer } from '../services/customerService';
import { pdfTemplates } from '../constants/pdfTemplates';
import { PDFGenerator, PDFGenerationResult } from '../utils/pdfGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import { FileSystemUtils } from '../utils/fileSystemUtils';
import { getProfessionComponent, type ProfessionType } from './professions/componentMap';
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
  
  // Animation refs
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const lineItemsRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  
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
  }, [editingQuote, includeTax]);

  // Entrance animations
  useEffect(() => {
    if (!loading && containerRef.current) {
      const tl = gsap.timeline();
      
      // Set initial states
      gsap.set([headerRef.current, formRef.current, lineItemsRef.current, actionsRef.current], {
        opacity: 0,
        y: 30
      });
      
      // Animate elements in sequence
      tl.to(headerRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      })
      .to(formRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3')
      .to(lineItemsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3')
      .to(actionsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3');
    }
  }, [loading]);

  // Update terms when tax setting changes
  useEffect(() => {
    if (!editingQuote && settings && !settings.terms_and_conditions) {
      setCustomTerms(prevTerms => prevTerms.replace(/include 15% VAT|exclude VAT/, includeTax ? 'include 15% VAT' : 'exclude VAT'));
    }
  }, [includeTax, editingQuote, settings]);

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

  // Animation helper functions
  const animateButtonHover = (element: HTMLElement, isEntering: boolean) => {
    gsap.to(element, {
      scale: isEntering ? 1.02 : 1,
      duration: 0.2,
      ease: 'power2.out'
    });
  };

  const animateFormFocus = (element: HTMLElement, isFocused: boolean) => {
    gsap.to(element, {
      scale: isFocused ? 1.01 : 1,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  // Removed unused animateLineItemAdd function

  const calculateTotals = (items = lineItems): QuoteTotals => {
    const validItems = items.filter(item => 
      item.description.trim() !== '' || item.quantity > 0 || item.unit_price > 0
    );
    const subtotal = validItems.reduce((sum, item) => sum + item.line_total, 0);
    const vat = includeTax ? subtotal * 0.15 : 0; // 15% VAT for South Africa
    const total = subtotal + vat;
    return { subtotal, vat, total };
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

    setSaving(true);
    setMessage(null);

    try {
      const currentQuoteNumber = editingQuote ? editingQuote.quote_number : `${settings.quote_prefix}${settings.next_quote_number}`;
      const totals = calculateTotals(lineItems);

      const quote = {
        quote_number: currentQuoteNumber,
        client_details: {
          ...clientDetails,
          comments: comments,
        } as ClientDetails,
        line_items: lineItems,
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
        
        // Create customer record if it's a new quote and customer doesn't exist
        if (!editingQuote && clientDetails.email) {
          try {
            await createCustomer({
              name: clientDetails.name,
              company: '',
              email: clientDetails.email,
              address: clientDetails.address,
              phone: ''
            });
          } catch (error) {
    
          }
        }
        
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
  
      const selectedTemplate = pdfTemplates.find(t => t.id === settings.pdf_template) || pdfTemplates[0];
      const currentQuoteNumber = editingQuote ? editingQuote.quote_number : quoteNumber;
      const totals = calculateTotals(lineItems);

      // Prepare data for PDF generation
      const pdfData = {
        quoteNumber: currentQuoteNumber,
        date: new Date().toLocaleDateString('en-ZA'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
        profession: settings?.profession || 'General',
        companyProfile,
        clientDetails: {
          name: clientDetails.name,
          address: clientDetails.address,
          email: clientDetails.email,
          comments: comments
        },
        lineItems: lineItems,
        totals,
        terms: customTerms,
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

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8">
        <div ref={headerRef} className="mb-6 sm:mb-8">
          <div className="flex items-center mb-3 sm:mb-4">
            {editingQuote && onBack && (
              <button onClick={onBack} className="mr-3 sm:mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors min-h-touch min-w-touch">
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{editingQuote ? 'Edit Quote' : 'Create Quote'}</h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{editingQuote ? 'Update your existing quote' : 'Generate a professional quote for your client'}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2 xs:gap-0">
              <div className="flex items-center">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Quote {quoteNumber}
                </h2>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                Date: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Client Details Section */}
            <div ref={formRef} className="mb-6 sm:mb-8">
              <div className="flex items-center mb-3 sm:mb-4">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-2" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Client Details</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={clientDetails.name}
                      onChange={(e) => handleClientNameChange(e.target.value)}
                      onFocus={(e) => {
                        if (customerSuggestions.length > 0) {
                          setShowSuggestions(true);
                        }
                        animateFormFocus(e.target, true);
                      }}
                      onBlur={(e) => {
                        // Delay hiding suggestions to allow clicking
                        setTimeout(() => setShowSuggestions(false), 200);
                        animateFormFocus(e.target, false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch transition-all duration-200"
                      placeholder="Enter client name (type 2+ letters for suggestions)"
                    />
                    
                    {/* Customer Suggestions Dropdown */}
                    {showSuggestions && customerSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
                        {searchingCustomers && (
                          <div className="px-3 sm:px-4 py-2 sm:py-3 text-sm text-gray-500 flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Searching customers...
                          </div>
                        )}
                        {customerSuggestions.map((customer, index) => (
                          <div
                            key={index}
                            onClick={() => selectCustomer(customer)}
                            className="px-3 sm:px-4 py-2 sm:py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 min-h-touch"
                          >
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{customer.name}</div>
                            <div className="text-xs sm:text-sm text-gray-600">{customer.email}</div>
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
                    onFocus={(e) => animateFormFocus(e.target, true)}
                    onBlur={(e) => animateFormFocus(e.target, false)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch transition-all duration-200"
                    placeholder="Enter client email"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={clientDetails.address}
                    onChange={(e) => setClientDetails({ ...clientDetails, address: e.target.value })}
                    onFocus={(e) => animateFormFocus(e.target, true)}
                    onBlur={(e) => animateFormFocus(e.target, false)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch transition-all duration-200"
                    placeholder="Enter client address"
                  />
                </div>
              </div>

              {/* Tax Settings */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 xs:gap-0">
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">VAT/Tax Settings</h4>
                    <p className="text-xs sm:text-sm text-blue-700">Toggle VAT inclusion for new businesses</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer min-h-touch">
                    <input
                      type="checkbox"
                      checked={includeTax}
                      onChange={(e) => setIncludeTax(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className="ml-3 text-xs sm:text-sm font-medium text-gray-700">
                      {includeTax ? 'Include VAT (15%)' : 'Exclude VAT'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Line Items Section */}
            <div ref={lineItemsRef} className="mb-8">
              <Suspense fallback={
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading profession-specific components...</span>
                </div>
              }>
                {(() => {
                   const professionType = (settings?.profession as ProfessionType) || 'General';
                   const ProfessionComponent = getProfessionComponent(professionType);
                   
                   return (
                     <ProfessionComponent
                       items={lineItems}
                       onItemsChange={setLineItems}
                     />
                   );
                 })()} 
              </Suspense>
            </div>

            {/* Comments Section */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments / Notes
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                onFocus={(e) => animateFormFocus(e.target, true)}
                onBlur={(e) => animateFormFocus(e.target, false)}
               onPaste={(e) => e.stopPropagation()}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch text-sm sm:text-base transition-all duration-200"
                placeholder="Add any additional comments or terms..."
              />
            </div>

            {/* Terms and Conditions Section */}
            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                value={customTerms}
                onChange={(e) => setCustomTerms(e.target.value)}
                onFocus={(e) => animateFormFocus(e.target, true)}
                onBlur={(e) => animateFormFocus(e.target, false)}
               onPaste={(e) => e.stopPropagation()}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm min-h-touch transition-all duration-200"
                placeholder="Enter your terms and conditions..."
              />
            </div>

            {/* Totals Section */}
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <div className="flex justify-end">
                <div className="w-full sm:w-80">
                  <div className="flex justify-between py-2 text-sm sm:text-base">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">R{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {includeTax && (
                    <div className="flex justify-between py-2 text-sm sm:text-base">
                      <span className="text-gray-700">VAT (15%):</span>
                      <span className="font-medium">R{totals.vat.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t border-gray-300 text-base sm:text-lg font-bold">
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
            <div ref={actionsRef} className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
              <div className="flex flex-col xs:flex-row justify-end gap-3 xs:gap-4">
                <button
                  onClick={generatePDF}
                  onMouseEnter={(e) => animateButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => animateButtonHover(e.currentTarget, false)}
                  disabled={generatingPDF || !clientDetails.name || !clientDetails.address || !clientDetails.email}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 transition-colors min-h-touch text-sm sm:text-base"
                >
                  {generatingPDF ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                      <span className="hidden xs:inline">Generating...</span>
                      <span className="xs:hidden">Generating</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="hidden xs:inline">Preview PDF</span>
                      <span className="xs:hidden">Preview</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleSaveQuote}
                  onMouseEnter={(e) => animateButtonHover(e.currentTarget, true)}
                  onMouseLeave={(e) => animateButtonHover(e.currentTarget, false)}
                  disabled={saving || !clientDetails.name || !clientDetails.address || !clientDetails.email}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors min-h-touch text-sm sm:text-base"
                >
                  <Save className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {saving ? (
                    <span className="hidden xs:inline">Saving...</span>
                  ) : (
                    <span>{editingQuote ? 'Update Quote' : 'Save Quote'}</span>
                  )}
                  {saving && <span className="xs:hidden">Saving</span>}
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