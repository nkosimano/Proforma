import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsProvider';

// Custom hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}