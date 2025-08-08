import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { ProfessionType, PROFESSION_THEMES } from '../constants/professions';
import { AppSettings } from '../types';

// Context interface
interface SettingsContextType {
  settings: AppSettings | null;
  loading: boolean;
  error: string | null;
  updateProfession: (profession: ProfessionType) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

// Create context
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider props
interface SettingsProviderProps {
  children: ReactNode;
}



// Settings Provider Component
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from database
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // No settings found, create default
          const defaultSettings: Partial<AppSettings> = {
            quote_prefix: 'QUO',
            next_quote_number: 1,
            invoice_prefix: 'INV',
            next_invoice_number: 1,
            terms_and_conditions: 'Payment due within 30 days.',
            pdf_template: 'modern',
            user_id: user.id,
            profession: 'General'
          };

          const { data: newSettings, error: insertError } = await supabase
            .from('app_settings')
            .insert(defaultSettings)
            .select()
            .single();

          if (insertError) throw insertError;
          setSettings(newSettings as AppSettings);
        } else {
          throw fetchError;
        }
      } else {
        setSettings(data as AppSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Update profession and apply theme
  const updateProfession = async (profession: ProfessionType) => {
    try {
      if (!settings) throw new Error('Settings not loaded');

      const { error: updateError } = await supabase
        .from('app_settings')
        .update({ profession })
        .eq('id', settings.id);

      if (updateError) throw updateError;

      // Update local state
      setSettings(prev => prev ? { ...prev, profession } : null);
    } catch (err) {
      console.error('Error updating profession:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profession');
      throw err;
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      if (!settings) throw new Error('Settings not loaded');

      const { error: updateError } = await supabase
        .from('app_settings')
        .update(updates)
        .eq('id', settings.id);

      if (updateError) throw updateError;

      // Update local state
      setSettings(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  // Refresh settings
  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Apply theme based on profession
  useEffect(() => {
    if (settings?.profession) {
      const themeClass = PROFESSION_THEMES[settings.profession];
      
      // Remove all existing theme classes
      Object.values(PROFESSION_THEMES).forEach(theme => {
        document.body.classList.remove(theme);
      });
      
      // Add current theme class
      document.body.classList.add(themeClass);
    }
  }, [settings?.profession]);

  // Initial load
  useEffect(() => {
    fetchSettings().catch(err => {
      console.error('Error loading settings:', err);
    });
  }, []);

  // Cleanup theme on unmount
  useEffect(() => {
    return () => {
      Object.values(PROFESSION_THEMES).forEach(theme => {
        document.body.classList.remove(theme);
      });
    };
  }, []);

  const contextValue: SettingsContextType = {
    settings,
    loading,
    error,
    updateProfession,
    updateSettings,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}