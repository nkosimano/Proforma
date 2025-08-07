import React, { useState, useEffect } from 'react';
import { X, ArrowRightLeft, Calculator } from 'lucide-react';
import { currencyService, type CurrencyConversion } from '../services/currencyService';
import type { Currency } from '../types/database';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencies: Currency[];
}

export default function CurrencyConverterModal({ isOpen, onClose, currencies }: CurrencyConverterModalProps) {
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<string>('');
  const [toCurrency, setToCurrency] = useState<string>('');
  const [conversion, setConversion] = useState<CurrencyConversion | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currencies.length > 0 && !fromCurrency) {
      const defaultCurrency = currencies.find(c => c.is_default);
      if (defaultCurrency) {
        setFromCurrency(defaultCurrency.code);
        const otherCurrency = currencies.find(c => !c.is_default);
        if (otherCurrency) {
          setToCurrency(otherCurrency.code);
        }
      }
    }
  }, [currencies, fromCurrency]);

  const handleConvert = async () => {
    if (!amount || !fromCurrency || !toCurrency) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await currencyService.convertCurrency(numAmount, fromCurrency, toCurrency);
      if (result) {
        setConversion(result);
      } else {
        setError('Failed to convert currency');
      }
    } catch (error) {
      console.error('Error converting currency:', error);
      setError('Failed to convert currency');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setConversion(null);
  };

  const handleClose = () => {
    setAmount('100');
    setConversion(null);
    setError('');
    onClose();
  };

  const formatAmount = (amount: number, currencyCode: string) => {
    return currencyService.formatAmount(amount, currencyCode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Currency Converter</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Amount Input */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>

            {/* From Currency */}
            <div>
              <label htmlFor="fromCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                From
              </label>
              <select
                id="fromCurrency"
                value={fromCurrency}
                onChange={(e) => {
                  setFromCurrency(e.target.value);
                  setConversion(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select currency...</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={handleSwapCurrencies}
                disabled={!fromCurrency || !toCurrency}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                title="Swap currencies"
              >
                <ArrowRightLeft className="h-5 w-5" />
              </button>
            </div>

            {/* To Currency */}
            <div>
              <label htmlFor="toCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                To
              </label>
              <select
                id="toCurrency"
                value={toCurrency}
                onChange={(e) => {
                  setToCurrency(e.target.value);
                  setConversion(null);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select currency...</option>
                {currencies.map((currency) => (
                  <option key={currency.id} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={loading || !amount || !fromCurrency || !toCurrency}
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Calculator className="h-4 w-4 mr-2" />
              )}
              Convert
            </button>

            {/* Conversion Result */}
            {conversion && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-900 mb-2">
                    {formatAmount(conversion.convertedAmount, conversion.to)}
                  </div>
                  <div className="text-sm text-blue-700 mb-3">
                    {formatAmount(conversion.amount, conversion.from)} = {formatAmount(conversion.convertedAmount, conversion.to)}
                  </div>
                  <div className="text-xs text-blue-600">
                    Exchange Rate: 1 {conversion.from} = {conversion.rate.toFixed(4)} {conversion.to}
                  </div>
                  <div className="text-xs text-blue-500 mt-1">
                    Converted at {conversion.timestamp.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}