import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Bot, User, Building, FileText, DollarSign, Check, X, Search, Globe, ArrowRight, ArrowLeft, Coins, Download, Eye, Send } from 'lucide-react';
import { getAllCustomers, createCustomer } from '../services/customerService';
import { getAppSettings, saveQuote, incrementQuoteNumber } from '../services/quoteService';
import { getCompanyProfile } from '../services/companyService';
import { currencyService } from '../services/currencyService';
import { PDFGenerator, PDFGenerationResult } from '../utils/pdfGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import { pdfTemplates } from '../constants/pdfTemplates';
import type { Customer, LineItem, Quote, CompanyProfile, AppSettings } from '../types';
import type { Currency } from '../types/database';

interface AIAssistantProps {
  onBack: () => void;
}

type Step = 'client-identification' | 'client-details' | 'document-type' | 'currency-selection' | 'services' | 'approval' | 'completion';

interface ServiceItem {
  description: string;
  price: number;
  source: 'database' | 'internet' | 'manual';
  approved: boolean;
  quantity: number;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState<Step>('client-identification');
  const [clientName, setClientName] = useState('');
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [clientSuggestions, setClientSuggestions] = useState<Customer[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [clientDetails, setClientDetails] = useState({
    name: '',
    surname: '',
    company: '',
    email: '',
    address: '',
    phone: ''
  });
  const [documentType, setDocumentType] = useState<'quote' | 'invoice' | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [serviceInput, setServiceInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [createdDocument, setCreatedDocument] = useState<Quote | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [pdfResult, setPdfResult] = useState<PDFGenerationResult | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [initializingCurrencies, setInitializingCurrencies] = useState(false);


  const stepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCustomers();
    loadCurrencies();
    loadCompanyProfile();
    loadAppSettings();
  }, []);

  useEffect(() => {
    if (stepRef.current) {
      gsap.fromTo(stepRef.current, 
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [currentStep]);

  const loadCustomers = async () => {
    try {
      // Get customers from customers table
      const customerList = await getAllCustomers();
      
      // Also get customers from quotes' client_details
      const { getQuotes } = await import('../services/quoteService');
      const quotes = await getQuotes();
      
      // Extract unique clients from quotes
      const quoteClients = quotes.map(quote => ({
        id: `quote-${quote.id}`,
        name: quote.client_details.name,
        company: quote.client_details.company || '',
        email: quote.client_details.email,
        address: quote.client_details.address,
        phone: quote.client_details.phone || '',
        created_at: quote.created_at || new Date().toISOString(),
        updated_at: quote.updated_at || new Date().toISOString(),
        user_id: quote.client_details.user_id || ''
      }));
      
      // Combine and deduplicate by email
      const allCustomers = [...customerList];
      quoteClients.forEach(quoteClient => {
        if (!allCustomers.find(c => c.email === quoteClient.email)) {
          allCustomers.push(quoteClient);
        }
      });
      
      setCustomers(allCustomers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadCurrencies = async () => {
    try {
      const currencyList = await currencyService.getCurrencies();
      setCurrencies(currencyList);
      
      // Set default currency if available
      const defaultCurrency = await currencyService.getDefaultCurrency();
      if (defaultCurrency) {
        setSelectedCurrency(defaultCurrency);
      } else if (currencyList.length > 0) {
        setSelectedCurrency(currencyList[0]);
      }
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  };

  const loadCompanyProfile = async () => {
    try {
      const profile = await getCompanyProfile();
      setCompanyProfile(profile);
    } catch (error) {

    }
  };

  const loadAppSettings = async () => {
    try {
      const settings = await getAppSettings();
      setAppSettings(settings);
    } catch (error) {
      console.error('Error loading app settings:', error);
    }
  };

  const handleClientSearch = (name: string) => {
    setClientName(name);
    
    if (name.length >= 2) {
      const matchingClients = customers.filter(c => 
        c.name.toLowerCase().includes(name.toLowerCase()) ||
        c.company?.toLowerCase().includes(name.toLowerCase())
      );
      setClientSuggestions(matchingClients);
      setShowSuggestions(matchingClients.length > 0);
      
      // Auto-select if exact match
      const exactMatch = matchingClients.find(c => 
        c.name.toLowerCase() === name.toLowerCase() ||
        c.company?.toLowerCase() === name.toLowerCase()
      );
      setSelectedClient(exactMatch || null);
    } else {
      setClientSuggestions([]);
      setShowSuggestions(false);
      setSelectedClient(null);
    }
  };

  const handleSelectClient = (client: Customer) => {
    setSelectedClient(client);
    setClientName(client.name);
    setShowSuggestions(false);
  };

  const handleNextStep = () => {
    const steps: Step[] = ['client-identification', 'client-details', 'document-type', 'currency-selection', 'services', 'approval', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    
    // Enhanced logic for client-identification to client-details transition
    if (currentStep === 'client-identification' && !selectedClient && clientName) {
      // Parse the client name and pre-populate the details
      const nameParts = clientName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      setClientDetails(prev => ({
        ...prev,
        name: firstName,
        surname: lastName
      }));
    }
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePrevStep = () => {
    const steps: Step[] = ['client-identification', 'client-details', 'document-type', 'currency-selection', 'services', 'approval', 'completion'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const searchInternetPrice = async (): Promise<number> => {
    // Simulate internet search for pricing
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Return a random price between 50-500 for demo
    return Math.floor(Math.random() * 450) + 50;
  };

  const addService = async () => {
    if (!serviceInput.trim()) return;
    
    setIsSearching(true);
    
    // First check database for existing services
    // This would typically search through previous quotes/invoices
    const existingPrice = Math.random() > 0.7 ? Math.floor(Math.random() * 300) + 100 : null;
    
    let newService: ServiceItem;
    
    if (existingPrice) {
      newService = {
        description: serviceInput,
        price: existingPrice,
        source: 'database',
        approved: true,
        quantity: 1
      };
    } else {
      // Search internet for pricing
      const internetPrice = await searchInternetPrice();
      newService = {
        description: serviceInput,
        price: internetPrice,
        source: 'internet',
        approved: false,
        quantity: 1
      };
    }
    
    setServices(prev => [...prev, newService]);
    setServiceInput('');
    setIsSearching(false);
  };

  const approveService = (index: number) => {
    setServices(prev => prev.map((item, i) => 
      i === index ? { ...item, approved: true, source: 'database' } : item
    ));
  };

  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };

  const updateServicePrice = (index: number, price: number) => {
    setServices(prev => prev.map((item, i) => 
      i === index ? { ...item, price } : item
    ));
  };

  const updateServiceQuantity = (index: number, quantity: number) => {
    setServices(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity } : item
    ));
  };

  const calculateTotal = () => {
    return services.reduce((total, service) => total + (service.price * service.quantity), 0);
  };

  const formatCurrency = (amount: number) => {
    if (!selectedCurrency) return `$${amount.toFixed(2)}`;
    return `${selectedCurrency.symbol}${amount.toFixed(2)}`;
  };

  const createDocument = async () => {
    if (!appSettings || !companyProfile || !selectedCurrency) {
      console.error('Missing required data for document creation');
      return;
    }

    setIsLoading(true);
    try {
      const lineItems: LineItem[] = services.map(service => ({
        id: Math.random().toString(36).substr(2, 9),
        description: service.description,
        quantity: service.quantity,
        unit_price: service.price,
        line_total: service.price * service.quantity
      }));

      const subtotal = calculateTotal();
      const vatRate = 0.15; // 15% VAT
      const vatAmount = subtotal * vatRate;
      const total = subtotal + vatAmount;

      const clientInfo = selectedClient || {
        name: `${clientDetails.name} ${clientDetails.surname}`.trim(),
        company: clientDetails.company,
        email: clientDetails.email,
        address: clientDetails.address,
        phone: clientDetails.phone
      };

      if (documentType === 'quote') {
        // Create quote
        const quoteData = {
          quote_number: `${appSettings.quote_prefix}${appSettings.next_quote_number}`,
          client_details: {
            name: clientInfo.name,
            company: clientInfo.company || '',
            email: clientInfo.email,
            address: clientInfo.address,
            phone: clientInfo.phone || ''
          },
          line_items: lineItems,
          totals: {
            subtotal,
            vat: vatAmount,
            total
          },
          currency: selectedCurrency.code,
          exchange_rate: selectedCurrency.exchange_rate,
          terms_and_conditions: appSettings.terms_and_conditions || '',
          status: 'draft' as const
        };

        const savedQuote = await saveQuote(quoteData);
        if (savedQuote) {
          await incrementQuoteNumber();
          setCreatedDocument(savedQuote);
          
          // Create customer record if it doesn't exist and it's not from an existing customer
          if (!selectedClient && clientInfo.email) {
            try {
              await createCustomer({
                name: clientInfo.name,
                company: clientInfo.company || '',
                email: clientInfo.email,
                address: clientInfo.address,
                phone: clientInfo.phone || ''
              });
            } catch (error) {
      
            }
          }
        }
      } else {
        // Create invoice logic here
    
      }

      setCurrentStep('completion');
    } catch (error) {
      console.error('Error creating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!createdDocument || !companyProfile || !appSettings) {
      console.error('Missing data for PDF generation');
      return;
    }

    setGeneratingPDF(true);
    try {
      const selectedTemplate = pdfTemplates.find(t => t.id === appSettings.pdf_template) || pdfTemplates[0];
      
      const pdfData = {
        quoteNumber: createdDocument.quote_number,
        date: new Date().toLocaleDateString('en-ZA'),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-ZA'),
        profession: appSettings.profession || 'General',
        companyProfile,
        clientDetails: {
          name: createdDocument.client_details.name,
          address: createdDocument.client_details.address,
          email: createdDocument.client_details.email,
          comments: createdDocument.client_details.comments || ''
        },
        lineItems: createdDocument.line_items,
        totals: createdDocument.totals,
        terms: createdDocument.terms_and_conditions || appSettings.terms_and_conditions || '',
        colors: {
          primary: selectedTemplate.primary,
          secondary: selectedTemplate.secondary,
          accent: selectedTemplate.accent
        }
      };

      const result = await PDFGenerator.generateQuotePDFBlob(pdfData);
      setPdfResult(result);
      setShowPDFPreview(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const downloadPDF = async () => {
    if (!pdfResult) return;
    PDFGenerator.downloadPDF(pdfResult.blob, pdfResult.fileName);
  };

  const closePDFPreview = () => {
    setShowPDFPreview(false);
    setPdfResult(null);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'client-identification':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Bot className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Who are you helping today?</h2>
              <p className="text-gray-300">Let's identify your client to get started</p>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => handleClientSearch(e.target.value)}
                  onFocus={() => {
                    if (clientSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  placeholder="Enter client name or company..."
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                {/* Client Suggestions Dropdown */}
                {showSuggestions && clientSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {clientSuggestions.map((client, index) => (
                      <div
                        key={client.id || index}
                        onClick={() => handleSelectClient(client)}
                        className="px-4 py-3 hover:bg-slate-700 cursor-pointer border-b border-slate-600 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-white">{client.name}</div>
                        {client.company && <div className="text-sm text-gray-300">{client.company}</div>}
                        <div className="text-sm text-gray-400">{client.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedClient && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center text-green-400 mb-2">
                    <Check className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Client Selected!</span>
                  </div>
                  <p className="text-white">{selectedClient.name}</p>
                  {selectedClient.company && <p className="text-gray-300">{selectedClient.company}</p>}
                  <p className="text-gray-400">{selectedClient.email}</p>
                  <button
                    onClick={() => {
                      setSelectedClient(null);
                      setClientName('');
                    }}
                    className="mt-2 text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear selection
                  </button>
                </div>
              )}
              
              {clientName && !selectedClient && clientSuggestions.length === 0 && clientName.length >= 2 && (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center text-yellow-400 mb-2">
                    <User className="w-5 h-5 mr-2" />
                    <span className="font-semibold">New Client</span>
                  </div>
                  <p className="text-gray-300">We'll need to collect their details in the next step</p>
                </div>
              )}
            </div>
            
            <button
              onClick={handleNextStep}
              disabled={!clientName}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center"
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        );

      case 'client-details':
        if (selectedClient) {
          handleNextStep();
          return null;
        }
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Building className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Client Details</h2>
              <p className="text-gray-300">Let's collect the client information for our records</p>
            </div>
            
            {/* Show helpful message if name was pre-populated */}
            {(clientDetails.name || clientDetails.surname) && (
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-center text-blue-400 mb-2">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-semibold">Name Pre-filled</span>
                </div>
                <p className="text-gray-300 text-sm">
                  We've automatically filled in the name from your search. You can edit it if needed.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={clientDetails.name}
                onChange={(e) => setClientDetails(prev => ({ ...prev, name: e.target.value }))}
                placeholder="First Name"
                className={`px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  clientDetails.name ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'
                }`}
              />
              <input
                type="text"
                value={clientDetails.surname}
                onChange={(e) => setClientDetails(prev => ({ ...prev, surname: e.target.value }))}
                placeholder="Last Name"
                className={`px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  clientDetails.surname ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600'
                }`}
              />
              <input
                type="text"
                value={clientDetails.company}
                onChange={(e) => setClientDetails(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Company (Optional)"
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                value={clientDetails.email}
                onChange={(e) => setClientDetails(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email Address"
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                value={clientDetails.phone}
                onChange={(e) => setClientDetails(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Phone Number"
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                value={clientDetails.address}
                onChange={(e) => setClientDetails(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Address"
                rows={3}
                className="px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!clientDetails.name || !clientDetails.email}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );

      case 'document-type':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Document Type</h2>
              <p className="text-gray-300">Have you already helped this client, or do they require your assistance?</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                onClick={() => setDocumentType('invoice')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  documentType === 'invoice'
                    ? 'border-green-500 bg-green-500/20'
                    : 'border-slate-600 bg-slate-700 hover:border-green-400'
                }`}
              >
                <div className="text-center">
                  <Check className="w-12 h-12 text-green-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Create Invoice</h3>
                  <p className="text-gray-300">Work has been completed</p>
                </div>
              </div>
              
              <div
                onClick={() => setDocumentType('quote')}
                className={`cursor-pointer p-6 rounded-xl border-2 transition-all ${
                  documentType === 'quote'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-slate-600 bg-slate-700 hover:border-blue-400'
                }`}
              >
                <div className="text-center">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Create Quote</h3>
                  <p className="text-gray-300">Future work estimate</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!documentType}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );

      case 'currency-selection':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Coins className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Currency Selection</h2>
              <p className="text-gray-300">Choose the currency for your {documentType === 'invoice' ? 'invoice' : 'quote'}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currencies.map((currency) => (
                <div
                  key={currency.id}
                  onClick={() => setSelectedCurrency(currency)}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                    selectedCurrency?.id === currency.id
                      ? 'border-yellow-500 bg-yellow-500/20'
                      : 'border-slate-600 bg-slate-700 hover:border-yellow-400'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                      selectedCurrency?.id === currency.id ? 'bg-yellow-500' : 'bg-slate-600'
                    }`}>
                      <span className="text-xl font-bold text-white">{currency.symbol}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{currency.code}</h3>
                    <p className="text-sm text-gray-300">{currency.name}</p>
                    {currency.is_default && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          Default
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {currencies.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No currencies available. Please set up currencies in Settings first.</p>
                <button
                  onClick={async () => {
                    setInitializingCurrencies(true);
                    try {
                      const success = await currencyService.initializeDefaultCurrencies();
                      if (success) {
                        await loadCurrencies();
                      } else {
                        console.error('Failed to initialize default currencies');
                      }
                    } catch (error) {
                      console.error('Error initializing currencies:', error);
                    } finally {
                      setInitializingCurrencies(false);
                    }
                  }}
                  disabled={initializingCurrencies}
                  className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {initializingCurrencies ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <Coins className="w-5 h-5" />
                      <span>Initialize Default Currencies</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            {selectedCurrency && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Selected Currency:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{selectedCurrency.symbol}</span>
                    <span className="text-white font-semibold">{selectedCurrency.code}</span>
                    <span className="text-gray-400">({selectedCurrency.name})</span>
                  </div>
                </div>
                {!selectedCurrency.is_default && (
                  <div className="mt-2 text-sm text-gray-400">
                    Exchange rate: {selectedCurrency.exchange_rate.toFixed(4)}
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={!selectedCurrency}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <DollarSign className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Services & Products</h2>
              <p className="text-gray-300">
                {documentType === 'invoice' 
                  ? 'What assistance did you provide?' 
                  : 'What assistance do they require?'
                }
              </p>
            </div>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="Describe the service or product..."
                className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addService()}
              />
              <button
                onClick={addService}
                disabled={!serviceInput.trim() || isSearching}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center"
              >
                {isSearching ? (
                  <Search className="w-5 h-5 animate-spin" />
                ) : (
                  'Add'
                )}
              </button>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {services.map((service, serviceIndex) => (
                <div
                  key={serviceIndex}
                  className={`p-4 rounded-lg border-2 ${
                    service.source === 'database' && service.approved
                      ? 'border-green-500 bg-green-500/20'
                      : service.source === 'internet' && !service.approved
                      ? 'border-orange-500 bg-orange-500/20'
                      : 'border-slate-600 bg-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{service.description}</h4>
                    <button
                      onClick={() => removeService(serviceIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) => updateServiceQuantity(serviceIndex, parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Unit Price</label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateServicePrice(serviceIndex, parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Total</label>
                      <div className="px-3 py-2 bg-slate-600 border border-slate-500 rounded text-white">
                        {formatCurrency(service.price * service.quantity)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {service.source === 'database' ? (
                        <div className="flex items-center text-green-400">
                          <Check className="w-4 h-4 mr-1" />
                          <span className="text-sm">From database</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-400">
                          <Globe className="w-4 h-4 mr-1" />
                          <span className="text-sm">Internet suggestion</span>
                        </div>
                      )}
                    </div>
                    
                    {service.source === 'internet' && !service.approved && (
                        <button
                          onClick={() => approveService(serviceIndex)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                  </div>
                </div>
              ))}
            </div>
            
            {services.length > 0 && (
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="flex justify-between items-center text-xl font-bold text-white">
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </div>
                {selectedCurrency && (
                  <div className="mt-2 text-sm text-gray-400 text-center">
                    Currency: {selectedCurrency.code} ({selectedCurrency.name})
                  </div>
                )}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={services.length === 0}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        );

      case 'approval': {
        const unapprovedServices = services.filter(s => !s.approved);
        
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Final Review</h2>
              <p className="text-gray-300">Please review and approve all items before creating the document</p>
            </div>
            
            {unapprovedServices.length > 0 && (
              <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4">
                <h3 className="text-orange-400 font-semibold mb-2">Items requiring approval:</h3>
                <div className="space-y-2">
                  {unapprovedServices.map((service) => {
                    const originalIndex = services.findIndex(s => s === service);
                    return (
                      <div key={originalIndex} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                        <span className="text-white">{service.description} - {formatCurrency(service.price)}</span>
                        <button
                          onClick={() => approveService(originalIndex)}
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
                        >
                          Approve
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="bg-slate-700 p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Document Summary</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Client:</strong> {selectedClient?.name || `${clientDetails.name} ${clientDetails.surname}`}</p>
                <p><strong>Type:</strong> {documentType === 'invoice' ? 'Invoice' : 'Quote'}</p>
                <p><strong>Currency:</strong> {selectedCurrency?.code} ({selectedCurrency?.name})</p>
                <p><strong>Items:</strong> {services.length}</p>
                <p><strong>Total:</strong> {formatCurrency(calculateTotal())}</p>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handlePrevStep}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
              </button>
              <button
                onClick={createDocument}
                disabled={unapprovedServices.length > 0 || isLoading}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-green-600 hover:to-blue-600 transition-all flex items-center justify-center"
              >
                {isLoading ? 'Creating...' : `Create ${documentType === 'invoice' ? 'Invoice' : 'Quote'}`}
              </button>
            </div>
          </div>
        );
        }

      case 'completion':
        return (
          <div className="space-y-6 text-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Document Created Successfully!</h2>
              <p className="text-gray-300">
                Your {documentType} has been created and is ready for download or sending.
              </p>
              {createdDocument && (
                <div className="mt-4 p-4 bg-slate-700 rounded-lg">
                  <p className="text-white font-semibold">
                    {documentType === 'quote' ? 'Quote' : 'Invoice'} Number: {createdDocument.quote_number}
                  </p>
                  <p className="text-gray-300 text-sm mt-1">
                    Total: {formatCurrency(createdDocument.totals.total)}
                  </p>
                </div>
              )}
            </div>
            
            {/* Document Actions */}
            {createdDocument && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={generatePDF}
                  disabled={generatingPDF}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                >
                  <Eye className="w-5 h-5" />
                  <span>{generatingPDF ? 'Generating...' : 'View PDF'}</span>
                </button>
                
                <button
                  onClick={() => {
                    if (pdfResult) {
                      downloadPDF();
                    } else {
                      generatePDF();
                    }
                  }}
                  disabled={generatingPDF}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  <Download className="w-5 h-5" />
                  <span>{generatingPDF ? 'Generating...' : 'Download PDF'}</span>
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement email/WhatsApp sharing
                    alert('Email/WhatsApp sharing coming soon!');
                  }}
                  className="flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  // Reset state and go back to selection
                  setCurrentStep('client-identification');
                  setClientName('');
                  setSelectedClient(null);
                  setClientDetails({ name: '', surname: '', company: '', email: '', address: '', phone: '' });
                  setDocumentType(null);
                  setServices([]);
                  setCreatedDocument(null);
                  setPdfResult(null);
                  // Keep the selected currency for convenience
                }}
                className="flex-1 bg-slate-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-all"
              >
                Create Another
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Back to Menu
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/20">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <Bot className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">AI Q2I Assistant</h1>
              </div>
              <button
                onClick={onBack}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div ref={stepRef}>
              {renderStep()}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {showPDFPreview && pdfResult && (
        <PDFPreviewModal
          isOpen={showPDFPreview}
          onClose={closePDFPreview}
          pdfBlob={pdfResult.blob}
          fileName={pdfResult.fileName}
          onDownload={downloadPDF}
          onPrint={() => {
            if (pdfResult) {
              const url = URL.createObjectURL(pdfResult.blob);
              const printWindow = window.open(url);
              if (printWindow) {
                printWindow.onload = () => {
                  printWindow.print();
                };
              }
            }
          }}
        />
      )}
    </>
  );
};