import React from 'react';
import { FileText, Settings, Home, Users, Receipt, UserCheck } from 'lucide-react';

interface NavigationProps {
  currentPage: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings';
  onNavigate: (page: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Home },
    { id: 'quote' as const, label: 'Create Quote', icon: FileText },
    { id: 'invoices' as const, label: 'Invoices', icon: Receipt },
    { id: 'customers' as const, label: 'Customers', icon: UserCheck },
    { id: 'history' as const, label: 'Quote History', icon: Users },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">QuotePro</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};