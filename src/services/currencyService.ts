import { supabase } from '../lib/supabase';
import type { Currency } from '../types/database';

export interface ExchangeRateResponse {
  success: boolean;
  timestamp: number;
  base: string;
  date: string;
  rates: Record<string, number>;
}

export interface CurrencyConversion {
  from: string;
  to: string;
  amount: number;
  convertedAmount: number;
  rate: number;
  timestamp: Date;
}

class CurrencyService {
  private readonly API_KEY = 'your-exchange-rate-api-key'; // Replace with actual API key
  private readonly BASE_URL = 'https://api.exchangerate-api.com/v4/latest';
  private readonly FALLBACK_URL = 'https://api.fixer.io/latest';
  
  // Common currencies with their symbols and names
  private readonly COMMON_CURRENCIES = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
    { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
    { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' }
  ];

  /**
   * Get all supported currencies from the database
   */
  async getCurrencies(): Promise<Currency[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('code', { ascending: true });

      if (error) {
        console.error('Error fetching currencies:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getCurrencies:', error);
      return [];
    }
  }

  /**
   * Add a new currency
   */
  async addCurrency(currencyCode: string, isDefault: boolean = false): Promise<Currency | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const currencyInfo = this.COMMON_CURRENCIES.find(c => c.code === currencyCode);
      if (!currencyInfo) {
        throw new Error(`Unsupported currency code: ${currencyCode}`);
      }

      // If setting as default, unset other defaults first
      if (isDefault) {
        await supabase
          .from('currencies')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('currencies')
        .insert({
          user_id: user.id,
          code: currencyCode,
          name: currencyInfo.name,
          symbol: currencyInfo.symbol,
          is_default: isDefault,
          exchange_rate: 1.0, // Will be updated by exchange rate service
          last_updated: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding currency:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in addCurrency:', error);
      return null;
    }
  }

  /**
   * Update currency exchange rate
   */
  async updateExchangeRate(currencyId: string, rate: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('currencies')
        .update({
          exchange_rate: rate,
          last_updated: new Date().toISOString()
        })
        .eq('id', currencyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating exchange rate:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in updateExchangeRate:', error);
      return false;
    }
  }

  /**
   * Set default currency
   */
  async setDefaultCurrency(currencyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First, unset all defaults
      await supabase
        .from('currencies')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the new default
      const { error } = await supabase
        .from('currencies')
        .update({ is_default: true })
        .eq('id', currencyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error setting default currency:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in setDefaultCurrency:', error);
      return false;
    }
  }

  /**
   * Remove a currency
   */
  async removeCurrency(currencyId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('currencies')
        .delete()
        .eq('id', currencyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing currency:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in removeCurrency:', error);
      return false;
    }
  }

  /**
   * Get default currency
   */
  async getDefaultCurrency(): Promise<Currency | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('currencies')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching default currency:', error);
        throw error;
      }

      return data || null;
    } catch (error) {
      console.error('Error in getDefaultCurrency:', error);
      return null;
    }
  }

  /**
   * Fetch latest exchange rates from external API
   */
  async fetchExchangeRates(baseCurrency: string = 'USD'): Promise<ExchangeRateResponse | null> {
    try {
      // Try primary API first
      let response = await fetch(`${this.BASE_URL}/${baseCurrency}`);
      
      if (!response.ok) {
        // Fallback to secondary API
        response = await fetch(`${this.FALLBACK_URL}?base=${baseCurrency}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  }

  /**
   * Update all exchange rates for user's currencies
   */
  async updateAllExchangeRates(): Promise<{ updated: number; errors: string[] }> {
    const result = { updated: 0, errors: [] as string[] };

    try {
      const currencies = await this.getCurrencies();
      const defaultCurrency = await this.getDefaultCurrency();
      
      if (!defaultCurrency) {
        result.errors.push('No default currency set');
        return result;
      }

      const exchangeRates = await this.fetchExchangeRates(defaultCurrency.code);
      
      if (!exchangeRates) {
        result.errors.push('Failed to fetch exchange rates');
        return result;
      }

      for (const currency of currencies) {
        try {
          if (currency.code === defaultCurrency.code) {
            // Default currency always has rate of 1
            await this.updateExchangeRate(currency.id, 1.0);
          } else {
            const rate = exchangeRates.rates[currency.code];
            if (rate) {
              await this.updateExchangeRate(currency.id, rate);
              result.updated++;
            } else {
              result.errors.push(`No exchange rate found for ${currency.code}`);
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          result.errors.push(`Error updating ${currency.code}: ${errorMessage}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      result.errors.push(`Error updating exchange rates: ${errorMessage}`);
    }

    return result;
  }

  /**
   * Convert amount between currencies
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion | null> {
    try {
      const currencies = await this.getCurrencies();
      const fromCurr = currencies.find(c => c.code === fromCurrency);
      const toCurr = currencies.find(c => c.code === toCurrency);

      if (!fromCurr || !toCurr) {
        throw new Error('Currency not found in user currencies');
      }

      // Convert to base currency first, then to target currency
      const baseAmount = amount / fromCurr.exchange_rate;
      const convertedAmount = baseAmount * toCurr.exchange_rate;
      const rate = toCurr.exchange_rate / fromCurr.exchange_rate;

      return {
        from: fromCurrency,
        to: toCurrency,
        amount,
        convertedAmount,
        rate,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error in convertCurrency:', error);
      return null;
    }
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.COMMON_CURRENCIES.find(c => c.code === currencyCode);
    const symbol = currency?.symbol || currencyCode;
    
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    
    return `${symbol}${formatter.format(amount)}`;
  }

  /**
   * Get currency symbol by code
   */
  getCurrencySymbol(currencyCode: string): string {
    const currency = this.COMMON_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  }

  /**
   * Get currency name by code
   */
  getCurrencyName(currencyCode: string): string {
    const currency = this.COMMON_CURRENCIES.find(c => c.code === currencyCode);
    return currency?.name || currencyCode;
  }

  /**
   * Get all available currencies for selection
   */
  getAvailableCurrencies(): Array<{ code: string; name: string; symbol: string }> {
    return this.COMMON_CURRENCIES;
  }

  /**
   * Initialize default currencies for new users
   */
  async initializeDefaultCurrencies(): Promise<boolean> {
    try {
      const existingCurrencies = await this.getCurrencies();
      
      if (existingCurrencies.length > 0) {
        return true; // Already initialized
      }

      // Add ZAR as default currency for South African users
      const zarCurrency = await this.addCurrency('ZAR', true);
      
      if (zarCurrency) {
        // Add USD as secondary currency
        await this.addCurrency('USD', false);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error initializing default currencies:', error);
      return false;
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number | null> {
    try {
      if (fromCurrency === toCurrency) {
        return 1.0;
      }

      const currencies = await this.getCurrencies();
      const fromCurr = currencies.find(c => c.code === fromCurrency);
      const toCurr = currencies.find(c => c.code === toCurrency);

      if (!fromCurr || !toCurr) {
        return null;
      }

      return toCurr.exchange_rate / fromCurr.exchange_rate;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return null;
    }
  }
}

export const currencyService = new CurrencyService();
export default currencyService;