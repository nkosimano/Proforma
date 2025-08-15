import React, { useState, useEffect } from 'react';
import { Save, Settings as SettingsIcon, Building, Upload, X, Sparkles } from 'lucide-react';
import { getCompanyProfile, createCompanyProfile, updateCompanyProfile, uploadLogo } from '../services/companyService';
import { PDFTemplateModal } from './PDFTemplateModal';
import { ProfessionIcon } from './ProfessionIcon';
import type { CompanyProfile } from '../types';
import { useSettings } from '../hooks/useSettings';
import { PROFESSION_OPTIONS, ProfessionType } from '../constants/professions';
import { pdfTemplates } from '../constants/pdfTemplates';

export const Settings: React.FC = () => {
  const { settings, updateSettings, updateProfession, loading: settingsLoading } = useSettings();
  const [currentMode] = useState<'quotepro' | 'ai-assistant'>(() => {
    const savedMode = localStorage.getItem('proforma_app_mode');
    return (savedMode === 'ai-assistant' ? 'ai-assistant' : 'quotepro');
  });
  const [showPDFTemplateModal, setShowPDFTemplateModal] = useState(false);
  const [companyProfile, setCompanyProfile] = useState<Omit<CompanyProfile, 'id' | 'user_id'>>({
    company_name: '',
    address: '',
    email: '',
    phone: '',
    company_registration_number: '',
    tax_number: '',
  });
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadCompanyProfile = async () => {
      try {
        const profileData = await getCompanyProfile();
        if (profileData) {
          setCompanyProfile({
            company_name: profileData.company_name,
            address: profileData.address,
            email: profileData.email,
            phone: profileData.phone || '',
            logo_url: profileData.logo_url || '',
            company_registration_number: profileData.company_registration_number || '',
            tax_number: profileData.tax_number || '',
          });
          setExistingProfileId(profileData.id);
        }
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load company profile' });
      }
    };

    loadCompanyProfile();
  }, []);

  const handleSaveAll = async () => {
    setSaving(true);
    setMessage(null);

    try {
      // Save company profile first
      let profileResult;
      if (existingProfileId) {
        profileResult = await updateCompanyProfile(existingProfileId, companyProfile);
      } else {
        profileResult = await createCompanyProfile(companyProfile);
        if (profileResult) {
          setExistingProfileId(profileResult.id);
        }
      }

      if (profileResult) {
        // Settings are automatically saved through the context
        setMessage({ type: 'success', text: 'All settings saved successfully!' });
        setHasUnsavedChanges(false);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save company profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = async (field: string, value: string | number) => {
    try {
      if (!settings) {
        setMessage({ type: 'error', text: 'Settings not loaded' });
        return;
      }
      
      if (field === 'profession') {
        // Use the specific updateProfession method for profession changes
        await updateProfession(value as ProfessionType);
        setMessage({ type: 'success', text: 'Profession updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        await updateSettings({ [field]: value });
        setHasUnsavedChanges(true);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to update ${field}` });
    }
  };

  const handleCompanyInputChange = (field: keyof typeof companyProfile, value: string) => {
    setCompanyProfile({ ...companyProfile, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select an image file' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be smaller than 2MB' });
      return;
    }

    setLogoUploading(true);
    setMessage(null);

    try {
      const logoUrl = await uploadLogo(file);
      if (logoUrl) {
        setCompanyProfile({ ...companyProfile, logo_url: logoUrl });
        setMessage({ type: 'success', text: 'Logo uploaded successfully!' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to upload logo' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to upload logo' });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setCompanyProfile({ ...companyProfile, logo_url: '' });
  };

  if (settingsLoading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl xs:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Configure your company profile and document numbering preferences</p>
        </div>

        {message && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Company Profile Section */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Building className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Company Profile</h2>
                </div>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Set up your company information for quotes and invoices
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Logo
                    </label>
                    <div className="flex flex-col xs:flex-row xs:items-center gap-3 xs:gap-4">
                      {companyProfile.logo_url ? (
                        <div className="relative flex-shrink-0">
                          <img
                            src={companyProfile.logo_url}
                            alt="Company Logo"
                            className="h-16 w-16 object-contain border border-gray-300 rounded-lg"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 min-h-touch min-w-touch"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`inline-flex items-center justify-center w-full xs:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer min-h-touch ${
                        logoUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {logoUploading ? 'Uploading...' : 'Upload Logo'}
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyProfile.company_name}
                    onChange={(e) => handleCompanyInputChange('company_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="Enter your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={companyProfile.email}
                    onChange={(e) => handleCompanyInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={companyProfile.address}
                    onChange={(e) => handleCompanyInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="Enter your company address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={companyProfile.phone}
                    onChange={(e) => handleCompanyInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Registration Number
                  </label>
                  <input
                    type="text"
                    value={companyProfile.company_registration_number}
                    onChange={(e) => handleCompanyInputChange('company_registration_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="Enter your company registration number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VAT/Tax Number
                  </label>
                  <input
                    type="text"
                    value={companyProfile.tax_number}
                    onChange={(e) => handleCompanyInputChange('tax_number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="Enter your VAT/tax number"
                  />
                </div>
              </div>
            </div>


              </div>
            </div>

            {/* Mode Switching Info */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Application Mode</h2>
                </div>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Current mode and switching information
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">Current Mode:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        currentMode === 'quotepro' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-semibold text-gray-900">
                        {currentMode === 'quotepro' ? 'QuotePro' : 'AI Q2I Assistant'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      <strong>QuotePro:</strong> Traditional quote and invoice management with full control
                    </p>
                    <p>
                      <strong>AI Q2I Assistant:</strong> AI-guided workflow with smart suggestions
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">💡</span>
                      </div>
                      <div className="text-sm text-blue-800">
                        <strong>Tip:</strong> Use the floating toggle button in the bottom-right corner to switch between modes instantly!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profession Settings Section */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <ProfessionIcon 
                    profession={settings.profession} 
                    className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" 
                  />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Profession Settings</h2>
                </div>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Choose your profession to customize the application theme and features
                </p>
              </div>

              <div className="p-4 sm:p-6">
                <div className="max-w-full sm:max-w-md">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profession Type
                  </label>
                  <select
                    value={settings.profession}
                    onChange={(e) => handleInputChange('profession', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                  >
                    {PROFESSION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-sm text-gray-500">
                    This affects the application's color theme and specialized features
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Document Numbering Section */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex items-center">
                  <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 mr-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Document Numbering</h2>
                </div>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Configure automatic numbering for your quotes and invoices
                </p>
              </div>

              <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {/* Quote Settings */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Quote Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quote Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.quote_prefix}
                    onChange={(e) => handleInputChange('quote_prefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="e.g., QU- or QUOTE-"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This prefix will appear before quote numbers
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Quote Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.next_quote_number}
                    onChange={(e) => handleInputChange('next_quote_number', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The next quote will use this number
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Preview:</strong> {settings.quote_prefix}{settings.next_quote_number}
                  </p>
                </div>
              </div>

              {/* Invoice Settings */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Invoice Settings</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    value={settings.invoice_prefix}
                    onChange={(e) => handleInputChange('invoice_prefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                    placeholder="e.g., INV- or INVOICE-"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This prefix will appear before invoice numbers
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Invoice Number
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={settings.next_invoice_number}
                    onChange={(e) => handleInputChange('next_invoice_number', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-touch"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    The next invoice will use this number
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Preview:</strong> {settings.invoice_prefix}{settings.next_invoice_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 sm:mt-8">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Default Terms and Conditions</h3>
              <textarea
                value={settings.terms_and_conditions}
                onChange={(e) => handleInputChange('terms_and_conditions', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Enter default terms and conditions for all quotes..."
              />
              <p className="mt-2 text-sm text-gray-500">These terms will be used as default for new quotes (can be customized per quote)</p>
            </div>


              </div>
            </div>

            {/* PDF Template Section */}
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">PDF Appearance</h2>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Customize the color theme of your PDF quotes to match your brand
                </p>
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-8 rounded border border-gray-300 overflow-hidden">
                      {(() => {
                         const currentTemplate = settings.pdf_template;
                         const template = currentTemplate ? 
                           pdfTemplates.find(t => t.id === currentTemplate) : 
                           pdfTemplates[0];
                         
                         if (template?.gradient) {
                           return (
                             <div
                               style={{ background: template.gradient }}
                               className="w-full h-full"
                             />
                           );
                         } else if (template) {
                           return (
                             <div className="flex h-full">
                               <div
                                 style={{ backgroundColor: template.primary }}
                                 className="flex-1"
                               />
                               <div
                                 style={{ backgroundColor: template.secondary }}
                                 className="flex-1"
                               />
                               <div
                                 style={{ backgroundColor: template.accent }}
                                 className="flex-1"
                               />
                             </div>
                           );
                         }
                         return <div className="w-full h-full bg-gray-200" />;
                       })()}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {(() => {
                           const currentTemplate = settings.pdf_template;
                           const template = currentTemplate ? 
                             pdfTemplates.find(t => t.id === currentTemplate) : 
                             pdfTemplates[0];
                           return template?.name || 'Classic Blue';
                         })()}
                      </h3>
                      <p className="text-sm text-gray-600">Current PDF color theme</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPDFTemplateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Choose Template</span>
                  </button>
                </div>
              </div>
            </div>
           </div>
        </div>

        {/* Consolidated Save Button */}
        <div className="mt-6 sm:mt-8 bg-white shadow-sm rounded-lg border-2 border-blue-200">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  hasUnsavedChanges ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
                }`}></div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {hasUnsavedChanges ? 'Unsaved Changes' : 'All Settings Saved'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {hasUnsavedChanges 
                      ? 'You have unsaved changes. Click Save All Settings to apply them.' 
                      : 'All your settings and company profile are up to date.'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleSaveAll}
                disabled={saving || logoUploading || !companyProfile.company_name || !companyProfile.email || !companyProfile.address}
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-all duration-200 min-h-touch ${
                  hasUnsavedChanges 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                } disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none`}
              >
                <Save className="h-5 w-5 mr-2" />
                <span>{saving || logoUploading ? 'Saving...' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <div className="ml-2 sm:ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Notes</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-4 sm:pl-5 space-y-1">
                  <li>Set up your company profile first to enable quote creation</li>
                  <li>Quote numbers automatically increment when you save a new quote</li>
                  <li>Invoice numbers will increment when you create invoices (future feature)</li>
                  <li>Changing the "Next Number" only affects future documents</li>
                  <li>Existing documents keep their original numbers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* PDF Template Modal */}
      <PDFTemplateModal
        isOpen={showPDFTemplateModal}
        onClose={() => setShowPDFTemplateModal(false)}
        selectedTemplate={settings.pdf_template}
        onTemplateChange={(templateId) => {
          handleInputChange('pdf_template', templateId);
          setShowPDFTemplateModal(false);
        }}
      />
    </div>
  );
};