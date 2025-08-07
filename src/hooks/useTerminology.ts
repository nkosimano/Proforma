import { useContext } from 'react';
import { TerminologyContext } from '../context/TerminologyProvider';

export function useTerminology() {
  const context = useContext(TerminologyContext);
  if (context === undefined) {
    throw new Error('useTerminology must be used within a TerminologyProvider');
  }
  return context;
}