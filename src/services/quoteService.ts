import { supabase } from '../lib/supabase';
import type { Quote, AppSettings } from '../types';

export const getAppSettings = async (): Promise<AppSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching app settings:', error);
    return null;
  }

  return data || null;
};

export const upsertAppSettings = async (settings: Omit<AppSettings, 'id' | 'user_id'>): Promise<AppSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('app_settings')
    .upsert({
      id: 1,
      ...settings,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting app settings:', error);
    return null;
  }

  return data;
};

export const saveQuote = async (quote: Omit<Quote, 'id'>): Promise<Quote | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Add user_id to client_details for RLS
  const quoteWithUserId = {
    ...quote,
    client_details: {
      ...quote.client_details,
      user_id: user.id,
    },
  };

  const { data, error } = await supabase
    .from('quotes')
    .insert([quoteWithUserId])
    .select()
    .single();

  if (error) {
    console.error('Error saving quote:', error);
    return null;
  }

  return data;
};

export const incrementQuoteNumber = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const settings = await getAppSettings();
  if (!settings) return false;

  const { error } = await supabase
    .from('app_settings')
    .update({
      next_quote_number: settings.next_quote_number + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('Error incrementing quote number:', error);
    return false;
  }

  return true;
};

export const getQuotes = async (): Promise<Quote[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }

  return data || [];
};

export const updateQuote = async (id: string, quote: Partial<Quote>): Promise<Quote | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Ensure user_id is in client_details for RLS
  const quoteWithUserId = quote.client_details ? {
    ...quote,
    client_details: {
      ...quote.client_details,
      user_id: user.id,
    },
    updated_at: new Date().toISOString(),
  } : {
    ...quote,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('quotes')
    .update(quoteWithUserId)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating quote:', error);
    return null;
  }

  return data;
};

export const importQuotes = async (quotes: Omit<Quote, 'id'>[]): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // Add user_id to all quotes for RLS
  const quotesWithUserId = quotes.map(quote => ({
    ...quote,
    client_details: {
      ...quote.client_details,
      user_id: user.id,
    },
  }));

  const { error } = await supabase
    .from('quotes')
    .insert(quotesWithUserId);

  if (error) {
    console.error('Error importing quotes:', error);
    return false;
  }

  return true;
};

export const updateQuoteStatus = async (id: string, status: Quote['status']): Promise<boolean> => {
  const { error } = await supabase
    .from('quotes')
    .update({ 
      status, 
      updated_at: new Date().toISOString() 
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating quote status:', error);
    return false;
  }

  return true;
};

export const deleteQuote = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('quotes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting quote:', error);
    return false;
  }

  return true;
};