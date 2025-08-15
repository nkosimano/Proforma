import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CreateQuote } from './components/CreateQuote';
import { Invoices } from './components/Invoices';
import { Customers } from './components/Customers';
import { QuoteHistory } from './components/QuoteHistory';
import { Settings } from './components/Settings';
import Analytics from './components/Analytics';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import RecurringInvoices from './components/RecurringInvoices';
import UserRoles from './components/UserRoles';
import CurrencyManager from './components/CurrencyManager';
import { SystemSelectionModal } from './components/SystemSelectionModal';
import { AIAssistant } from './components/AIAssistant';
import { getCurrentUser } from './lib/supabase';
import { SettingsProvider } from './context/SettingsProvider';
import { TerminologyProvider } from './context/TerminologyProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { Auth } from './components/Auth';
import type { User } from '@supabase/supabase-js';

type Page = 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports';
type AppMode = 'selection' | 'quotepro' | 'ai-assistant';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [appMode, setAppMode] = useState<AppMode>('selection');
  const [showSystemSelection, setShowSystemSelection] = useState(false);


  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
          // Check if user has a preferred mode saved
          const savedMode = localStorage.getItem('proforma_app_mode') as AppMode;
          if (savedMode && savedMode !== 'selection') {
            setAppMode(savedMode);
          } else {
            setShowSystemSelection(true);
          }
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Auth 
        onAuthSuccess={(user) => {
          setUser(user);
          setShowSystemSelection(true);
        }} 
      />
    );
  }

  const handleSelectQuotePro = () => {
    setAppMode('quotepro');
    setShowSystemSelection(false);
    localStorage.setItem('proforma_app_mode', 'quotepro');
  };

  const handleSelectAIAssistant = () => {
    setAppMode('ai-assistant');
    setShowSystemSelection(false);
    localStorage.setItem('proforma_app_mode', 'ai-assistant');
  };

  const handleBackToSelection = () => {
    setAppMode('selection');
    setShowSystemSelection(true);
    localStorage.removeItem('proforma_app_mode');
  };



  const handleModeToggle = (newMode: 'quotepro' | 'ai-assistant') => {
    setAppMode(newMode);
    localStorage.setItem('proforma_app_mode', newMode);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'quote':
        return <CreateQuote />;
      case 'invoices':
        return <Invoices />;
      case 'recurring':
        return <RecurringInvoices />;
      case 'customers':
        return <Customers />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'reports':
        return <Analytics />;
      case 'roles':
        return <UserRoles />;
      case 'currency':
        return <CurrencyManager />;
      case 'history':
        return <QuoteHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const renderAppContent = () => {
    if (appMode === 'ai-assistant') {
      return <AIAssistant onBack={handleBackToSelection} />;
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
          currentMode={appMode === 'ai-assistant' ? 'ai-assistant' : 'quotepro'}
          onModeToggle={handleModeToggle}
        />
        {renderCurrentPage()}
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <SettingsProvider>
        <TerminologyProvider>
          {renderAppContent()}
          

          
          <SystemSelectionModal
            isOpen={showSystemSelection}
            onSelectQuotePro={handleSelectQuotePro}
            onSelectAIAssistant={handleSelectAIAssistant}
          />
        </TerminologyProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
