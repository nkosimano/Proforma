import React, { createContext, useState, ReactNode } from 'react';
import { ProfessionType } from '../constants/professions';
import { GENERAL_TERMINOLOGY, PROFESSION_TERMINOLOGY } from '../constants/terminology';

interface TerminologyContextType {
  useGeneralTerms: boolean;
  setUseGeneralTerms: (value: boolean) => void;
  getTerminology: (profession: ProfessionType) => typeof GENERAL_TERMINOLOGY;
  hasTerminologyDifferences: (profession: ProfessionType) => boolean;
}

export const TerminologyContext = createContext<TerminologyContextType | undefined>(undefined);

interface TerminologyProviderProps {
  children: ReactNode;
}

export function TerminologyProvider({ children }: TerminologyProviderProps) {
  const [useGeneralTerms, setUseGeneralTerms] = useState(false);

  const getTerminology = (profession: ProfessionType) => {
    if (useGeneralTerms || profession === 'General') {
      return GENERAL_TERMINOLOGY;
    }
    return PROFESSION_TERMINOLOGY[profession];
  };

  const hasTerminologyDifferences = (profession: ProfessionType) => {
    if (profession === 'General') return false;
    
    const professionTerms = PROFESSION_TERMINOLOGY[profession];
    return (
      professionTerms.quote !== GENERAL_TERMINOLOGY.quote ||
      professionTerms.invoices !== GENERAL_TERMINOLOGY.invoices ||
      professionTerms.customers !== GENERAL_TERMINOLOGY.customers
    );
  };

  return (
    <TerminologyContext.Provider value={{
      useGeneralTerms,
      setUseGeneralTerms,
      getTerminology,
      hasTerminologyDifferences
    }}>
      {children}
    </TerminologyContext.Provider>
  );
}