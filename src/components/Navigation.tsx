import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { FileText, Settings, Home, Users, Receipt, UserCheck, BarChart3, RefreshCw, Shield, DollarSign, TrendingUp, ChevronDown, Menu, X, Bot, Zap } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useTerminology } from '../hooks/useTerminology';
import { ProfessionIcon } from './ProfessionIcon';

interface NavigationProps {
  currentPage: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports';
  onNavigate: (page: 'dashboard' | 'quote' | 'invoices' | 'customers' | 'history' | 'settings' | 'analytics' | 'recurring' | 'roles' | 'currency' | 'reports') => void;
  currentMode?: 'quotepro' | 'ai-assistant';
  onModeToggle?: (newMode: 'quotepro' | 'ai-assistant') => void;
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

export const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, currentMode, onModeToggle }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const navGroupRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
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

  // GSAP Animation Effects
  useEffect(() => {
    // Animate navigation groups on mount
    const navGroups = Object.values(navGroupRefs.current).filter(Boolean);
    gsap.fromTo(navGroups, 
      { opacity: 0, y: -10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: 'power2.out',
        delay: 0.2
      }
    );
  }, []);

  // Animate dropdown appearance
  useEffect(() => {
    if (openDropdown && dropdownRefs.current[openDropdown]) {
      const dropdown = dropdownRefs.current[openDropdown];
      gsap.fromTo(dropdown,
        { 
          opacity: 0, 
          y: -10, 
          scale: 0.95,
          transformOrigin: 'top center'
        },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.2, 
          ease: 'power2.out'
        }
      );
      
      // Animate dropdown items
      const items = dropdown.querySelectorAll('button');
      gsap.fromTo(items,
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.15, 
          stagger: 0.03, 
          ease: 'power2.out',
          delay: 0.1
        }
      );
    }
  }, [openDropdown]);

  // Animate mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        gsap.fromTo(mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { 
            height: 'auto', 
            opacity: 1, 
            duration: 0.3, 
            ease: 'power2.out'
          }
        );
        
        // Animate mobile menu items
        const menuItems = mobileMenuRef.current.querySelectorAll('button');
        gsap.fromTo(menuItems,
          { opacity: 0, x: -20 },
          { 
            opacity: 1, 
            x: 0, 
            duration: 0.2, 
            stagger: 0.05, 
            ease: 'power2.out',
            delay: 0.1
          }
        );
      } else {
        gsap.to(mobileMenuRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: 'power2.in'
        });
      }
    }
  }, [mobileMenuOpen]);

  const isGroupActive = (group: NavGroup) => {
    return group.items.some(item => item.id === currentPage);
  };

  const handleMouseEnter = (groupId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Add subtle hover animation
    const navGroup = navGroupRefs.current[groupId];
    if (navGroup) {
      gsap.to(navGroup, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(groupId);
    }, 150); // 150ms delay to prevent accidental triggers
  };

  const handleMouseLeave = (groupId?: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Reset hover animation
    if (groupId) {
      const navGroup = navGroupRefs.current[groupId];
      if (navGroup) {
        gsap.to(navGroup, {
          scale: 1,
          duration: 0.2,
          ease: 'power2.out'
        });
      }
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 300); // Increased delay to 300ms for better interaction
  };

  const handleDropdownMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleDropdownMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  // Add subtle pulse animation for grouped options
  const addDiscoverabilityPulse = (groupId: string) => {
    const navGroup = navGroupRefs.current[groupId];
    if (navGroup && !openDropdown) {
      gsap.to(navGroup, {
        scale: 1.05,
        duration: 0.6,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: 1
      });
    }
  };

  // Trigger discoverability pulse on focus for accessibility
  const handleGroupFocus = (groupId: string) => {
    addDiscoverabilityPulse(groupId);
  };

  // Periodic pulse animation to help users discover grouped options
  useEffect(() => {
    const interval = setInterval(() => {
      if (!openDropdown && !mobileMenuOpen) {
        const randomGroup = navGroups[Math.floor(Math.random() * navGroups.length)];
        addDiscoverabilityPulse(randomGroup.id);
      }
    }, 15000); // Pulse every 15 seconds

    return () => clearInterval(interval);
  }, [openDropdown, mobileMenuOpen]);

  const handleItemClick = (pageId: typeof currentPage) => {
    onNavigate(pageId);
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200" style={{ overflow: 'visible' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ overflow: 'visible' }}>
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
                    ref={(el) => navGroupRefs.current[group.id] = el}
                    className="relative flex items-center dropdown-container"
                    onMouseEnter={() => handleMouseEnter(group.id)}
                    onMouseLeave={() => handleMouseLeave(group.id)}
                    style={{ overflow: 'visible' }}
                  >
                    <button
                      onFocus={() => handleGroupFocus(group.id)}
                      className={`inline-flex items-center px-2 lg:px-3 pt-1 pb-1 h-16 border-b-2 text-sm font-medium transition-all duration-300 min-h-touch transform hover:shadow-sm ${
                        isActive
                          ? 'border-blue-500 text-gray-900 shadow-sm'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50/50'
                      }`}
                    >
                      <GroupIcon className={`h-4 w-4 mr-1 lg:mr-2 transition-transform duration-200 ${
                        isOpen ? 'scale-110' : ''
                      }`} />
                      <span className="hidden lg:inline">{group.label}</span>
                      <span className="lg:hidden text-xs">{group.label.split(' ')[0]}</span>
                      <ChevronDown className={`h-4 w-4 ml-1 transition-all duration-300 ${
                        isOpen ? 'rotate-180 text-blue-500' : ''
                      }`} />
                    </button>
                    
                    {isOpen && (
                      <div 
                        ref={(el) => dropdownRefs.current[group.id] = el}
                        className="nav-dropdown absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-xl border border-gray-200 z-50 backdrop-blur-sm"
                        style={{ 
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          zIndex: 9999
                        }}
                        onMouseEnter={handleDropdownMouseEnter}
                        onMouseLeave={handleDropdownMouseLeave}
                      >
                        <div className="py-1">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isItemActive = currentPage === item.id;
                            
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleItemClick(item.id)}
                                onMouseDown={(e) => e.preventDefault()} // Prevent focus issues
                                className={`w-full text-left px-4 py-3 text-sm flex items-center transition-all duration-200 min-h-touch transform hover:scale-[1.02] hover:translate-x-1 ${
                                  isItemActive
                                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <ItemIcon className={`h-4 w-4 mr-3 transition-colors duration-200 ${
                                  isItemActive ? 'text-blue-600' : ''
                                }`} />
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
          
          <div className="flex items-center space-x-3">
            {/* Mode Toggle */}
            {currentMode && onModeToggle && (
              <div className="hidden sm:flex items-center">
                <button
                  onClick={() => onModeToggle(currentMode === 'quotepro' ? 'ai-assistant' : 'quotepro')}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1.08,
                      duration: 0.2,
                      ease: 'power2.out'
                    });
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, {
                      scale: 1,
                      duration: 0.2,
                      ease: 'power2.out'
                    });
                  }}
                  className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:shadow-xl ${
                    currentMode === 'ai-assistant'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                  }`}
                >
                  {currentMode === 'ai-assistant' ? (
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 transition-transform duration-200" />
                      <span className="hidden md:inline">AI Q2I</span>
                      <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 transition-transform duration-200" />
                      <span className="hidden md:inline">QuotePro</span>
                    </div>
                  )}
                </button>
              </div>
            )}
            
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
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" ref={mobileMenuRef}>
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
                      className={`w-full text-left flex items-center px-4 py-3 rounded-md text-base font-medium transition-all duration-300 min-h-touch transform hover:scale-[1.02] hover:translate-x-2 ${
                        isItemActive
                          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                      }`}
                    >
                      <ItemIcon className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors duration-200 ${
                        isItemActive ? 'text-blue-600' : ''
                      }`} />
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
                className={`w-full text-left flex items-center px-4 py-3 rounded-md text-base font-medium transition-all duration-300 min-h-touch transform hover:scale-[1.02] hover:translate-x-2 ${
                  currentPage === settingsItem.id
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
              >
                <Settings className={`h-5 w-5 mr-3 flex-shrink-0 transition-colors duration-200 ${
                  currentPage === settingsItem.id ? 'text-blue-600' : ''
                }`} />
                <span className="truncate">{settingsItem.label}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};