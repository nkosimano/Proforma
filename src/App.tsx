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
import { getCurrentUser, signIn, signUp } from './lib/supabase';
import { SettingsProvider } from './context/SettingsProvider';
import { TerminologyProvider } from './context/TerminologyProvider';
import ErrorBoundary from './components/ErrorBoundary';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

type Page = 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports';
type AppMode = 'selection' | 'quotepro' | 'ai-assistant';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      let result;
      if (authMode === 'signin') {
        result = await signIn(formData.email, formData.password);
      } else {
        result = await signUp(formData.email, formData.password);
      }

      if (result.error) {
        setAuthError(result.error.message);
      } else if (result.data.user) {
        setUser(result.data.user);
        setFormData({ email: '', password: '' });
        setShowSystemSelection(true);
      }
    } catch {
      setAuthError('An unexpected error occurred');
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {authMode === 'signin' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Professional quote management system
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleAuth}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {authMode === 'signin' ? (
                  <LogIn className="h-5 w-5 mr-2" />
                ) : (
                  <UserPlus className="h-5 w-5 mr-2" />
                )}
                {authLoading ? 'Please wait...' : (authMode === 'signin' ? 'Sign In' : 'Sign Up')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
                  setAuthError(null);
                }}
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                {authMode === 'signin' 
                  ? "Don't have an account? Sign up" 
                  : 'Already have an account? Sign in'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
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
