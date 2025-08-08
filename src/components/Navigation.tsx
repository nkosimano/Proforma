import React, { useState, useRef } from 'react';
import { FileText, Settings, Home, Users, Receipt, UserCheck, BarChart3, RefreshCw, Shield, DollarSign, TrendingUp, ChevronDown, Menu, X } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTerminology } from '../hooks/useTerminology';
import { ProfessionIcon } from './ProfessionIcon';

interface NavigationProps {
  currentPage: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports';
  onNavigate: (page: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports') => void;
}



interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Array<{
    id: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
}

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { settings } = useSettings();
  const { getTerminology } = useTerminology();
  
  // Get current profession terminology
  const currentProfession = settings?.profession || 'General';
  const terminology = getTerminology(currentProfession);

  const navGroups: NavGroup[] = [
    {
      id: 'core',
      label: 'Core',
      icon: Home,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'quote', label: terminology.quote, icon: FileText },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      icon: Receipt,
      items: [
        { id: 'invoices', label: terminology.invoices, icon: Receipt },
        { id: 'recurring', label: 'Recurring', icon: RefreshCw },
        { id: 'customers', label: terminology.customers, icon: UserCheck },
      ],
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      items: [
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'reports', label: 'Reports', icon: TrendingUp },
      ],
    },
    {
      id: 'management',
      label: 'Management',
      icon: Shield,
      items: [
        { id: 'currency', label: 'Currency', icon: DollarSign },
        { id: 'roles', label: 'User Roles', icon: Shield },
        { id: 'history', label: 'Quote History', icon: Users },
      ],
    },
  ];

  const settingsItem = { id: 'settings' as const, label: 'Settings', icon: Settings };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => item.id === currentPage);
  };

  const handleMouseEnter = (groupId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(groupId);
    }, 150); // 150ms delay to prevent accidental triggers
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200); // 200ms delay before closing
  };

  const handleItemClick = (pageId: typeof currentPage) => {
    onNavigate(pageId);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg md:text-xl font-bold text-gray-900 truncate max-w-32 sm:max-w-none">{terminology.appName}</span>
              {currentProfession !== 'General' && (
                <span className={`ml-2 sm:ml-3 inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm border hidden xs:inline-flex ${
                  currentProfession === 'Medical' ? 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300' :
                  currentProfession === 'Legal' ? 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300' :
                  currentProfession === 'Accounting' ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300' :
                  currentProfession === 'Engineering' ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300' :
                  'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300'
                }`}>
                  <ProfessionIcon 
                    profession={currentProfession} 
                    className="h-3 w-3 mr-1" 
                  />
                  <span className="hidden sm:inline">{currentProfession} Mode</span>
                  <span className="sm:hidden">{currentProfession}</span>
                </span>
              )}
            </div>
            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2 lg:space-x-4">
              {navGroups.map((group) => {
                const GroupIcon = group.icon;
                const isActive = isGroupActive(group);
                const isOpen = openDropdown === group.id;
                
                return (
                  <div 
                    key={group.id} 
                    className="relative flex items-center"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`inline-flex items-center px-2 lg:px-3 pt-1 pb-1 h-16 border-b-2 text-sm font-medium transition-colors duration-200 min-h-touch ${
                        isActive
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <GroupIcon className="h-4 w-4 mr-1 lg:mr-2" />
                      <span className="hidden lg:inline">{group.label}</span>
                      <span className="lg:hidden text-xs">{group.label.split(' ')[0]}</span>
                      <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`} />
                    </button>
                    
                    {isOpen && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <div className="py-1">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isItemActive = currentPage === item.id;
                            
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                className={`w-full text-left px-4 py-3 text-sm flex items-center transition-colors duration-200 min-h-touch ${
                                  isItemActive
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <ItemIcon className="h-4 w-4 mr-3" />
                                {item.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Settings as standalone item */}
              <div className="relative flex items-center">
                <button
                  onClick={() => handleItemClick(settingsItem.id)}
                  className={`inline-flex items-center px-2 lg:px-3 pt-1 pb-1 h-16 border-b-2 text-sm font-medium transition-colors duration-200 min-h-touch ${
                    currentPage === settingsItem.id
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Settings className="h-4 w-4 mr-1 lg:mr-2" />
                  <span className="hidden lg:inline">{settingsItem.label}</span>
                  <span className="lg:hidden text-xs">Settings</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 min-h-touch min-w-touch"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open main menu'}</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 max-h-screen overflow-y-auto">
            {navGroups.map((group) => (
              <div key={group.id} className="px-4 py-2">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const isItemActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      className={`w-full text-left flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 min-h-touch ${
                        isItemActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <ItemIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            
            {/* Settings in mobile menu */}
            <div className="px-4 py-2 border-t border-gray-200">
              <button
                onClick={() => handleItemClick(settingsItem.id)}
                className={`w-full text-left flex items-center px-4 py-3 rounded-md text-base font-medium transition-colors duration-200 min-h-touch ${
                  currentPage === settingsItem.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="truncate">{settingsItem.label}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};