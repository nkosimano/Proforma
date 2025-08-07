import React, { useState } from 'react';
import { AlertCircle, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useSettings } from '../context/SettingsProvider';
import { ProfessionType } from '../constants/professions';
import { useTerminology } from '../context/TerminologyProvider';
import { GENERAL_TERMINOLOGY, PROFESSION_TERMINOLOGY } from '../constants/terminology';
import { ProfessionIcon } from './ProfessionIcon';

interface ProfessionIndicatorProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ProfessionIndicator: React.FC<ProfessionIndicatorProps> = ({ 
  onClose, 
  showCloseButton = true 
}) => {
  const { settings } = useSettings();
  const { useGeneralTerms, setUseGeneralTerms, hasTerminologyDifferences } = useTerminology();
  const [isExpanded, setIsExpanded] = useState(false);

  const currentProfession = settings?.profession || 'General';

  // Get profession-specific terminology for comparison
  const professionTerminology = PROFESSION_TERMINOLOGY[currentProfession];

  // Check if there are terminology differences
  const hasDifferences = hasTerminologyDifferences(currentProfession);

  const getProfessionColor = (profession: ProfessionType) => {
    const colors = {
      General: 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300',
      Medical: 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300',
      Legal: 'bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-indigo-300',
      Accounting: 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-300',
      Engineering: 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300'
    };
    return colors[profession];
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <ProfessionIcon 
              profession={currentProfession} 
              className="h-5 w-5 text-blue-600" 
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-sm font-medium text-gray-900">Current View:</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm ${
                getProfessionColor(currentProfession)
              }`}>
                <ProfessionIcon 
                  profession={currentProfession} 
                  className="h-3 w-3 mr-1" 
                />
                {currentProfession} Mode
              </span>
              {hasDifferences && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                  useGeneralTerms 
                    ? 'bg-gray-100 text-gray-800 border-gray-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300'
                }`}>
                  {useGeneralTerms ? 'General Terms' : 'Profession Terms'}
                </span>
              )}
            </div>
            
            {hasDifferences && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-amber-700">
                    Some terms may be profession-specific
                  </span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </button>
                </div>
                
                {isExpanded && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <div className="text-xs text-gray-600 mb-2">
                      <strong>Terminology differences:</strong>
                    </div>
                    <div className="space-y-1 text-xs">
                      {professionTerminology.quote !== GENERAL_TERMINOLOGY.quote && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Quotes:</span>
                          <span className="font-medium">
                            "{professionTerminology.quote}" vs "{GENERAL_TERMINOLOGY.quote}"
                          </span>
                        </div>
                      )}
                      {professionTerminology.invoices !== GENERAL_TERMINOLOGY.invoices && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Invoices:</span>
                          <span className="font-medium">
                            "{professionTerminology.invoices}" vs "{GENERAL_TERMINOLOGY.invoices}"
                          </span>
                        </div>
                      )}
                      {professionTerminology.customers !== GENERAL_TERMINOLOGY.customers && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Customers:</span>
                          <span className="font-medium">
                            "{professionTerminology.customers}" vs "{GENERAL_TERMINOLOGY.customers}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Terminology Toggle */}
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => setUseGeneralTerms(!useGeneralTerms)}
                    className="flex items-center space-x-2 text-xs text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {useGeneralTerms ? (
                      <ToggleRight className="h-4 w-4 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-4 w-4 text-gray-400" />
                    )}
                    <span>
                      {useGeneralTerms ? 'Using general terms' : 'Using profession terms'}
                    </span>
                  </button>
                  <span className="text-xs text-gray-500">
                    (affects navigation and labels)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {showCloseButton && onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};